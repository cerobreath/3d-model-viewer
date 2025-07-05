import React, {useEffect, useRef, forwardRef, useImperativeHandle, useState} from 'react';
import * as THREE from 'three';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import {Loader2} from 'lucide-react';
import JSZip from 'jszip';
import {DisplayMode} from './DisplayModeControls';
import {LightingMode} from './LightingControls';

interface ViewerProps {
    fileUrl: string;
    isLoading?: boolean;
    displayMode: DisplayMode;
    backgroundColor: string;
    autoRotate: boolean;
    wireframe: boolean;
    lightingMode: LightingMode;
}

export interface ViewerRef {
    resetView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
}

const ThreeDViewer = forwardRef<ViewerRef, ViewerProps>(({
                                                             fileUrl,
                                                             isLoading,
                                                             displayMode,
                                                             backgroundColor,
                                                             autoRotate,
                                                             wireframe,
                                                             lightingMode
                                                         }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const cameraRef = useRef<THREE.PerspectiveCamera>();
    const controlsRef = useRef<TrackballControls>();
    const meshRef = useRef<THREE.Mesh | THREE.Group>();
    const frameRef = useRef<number>();
    const gridHelperRef = useRef<THREE.GridHelper>();
    const axesHelperRef = useRef<THREE.AxesHelper>();
    // Добавляем группу для автоповорота
    const rotationGroupRef = useRef<THREE.Group>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    // Добавляем ref для сохранения состояния автовращения
    const autoRotateRef = useRef(autoRotate);
    // Добавляем refs для управления освещением
    const lightsRef = useRef<THREE.Light[]>([]);
    const envMapRef = useRef<THREE.Texture | null>(null);

    // Обновляем ref при изменении пропа autoRotate
    useEffect(() => {
        autoRotateRef.current = autoRotate;
    }, [autoRotate]);

    useImperativeHandle(ref, () => ({
        resetView: () => {
            if (controlsRef.current && cameraRef.current) {
                console.log('Resetting camera view');
                controlsRef.current.reset();
                if (meshRef.current) {
                    const box = new THREE.Box3().setFromObject(meshRef.current);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);

                    // Улучшенное позиционирование камеры
                    const distance = maxDim * 1.5; // standart 1.5
                    cameraRef.current.position.set(distance, distance, distance);
                    cameraRef.current.lookAt(center);
                    controlsRef.current.target.copy(center);
                    controlsRef.current.update();
                }
            }
        },
        zoomIn: () => {
            if (cameraRef.current) {
                console.log('Zooming in');
                cameraRef.current.position.multiplyScalar(0.8);
                controlsRef.current?.update();
            }
        },
        zoomOut: () => {
            if (cameraRef.current) {
                console.log('Zooming out');
                cameraRef.current.position.multiplyScalar(1.25);
                controlsRef.current?.update();
            }
        }
    }));

    // Функция для удаления всех источников света
    const clearLights = () => {
        if (!sceneRef.current) return;

        lightsRef.current.forEach(light => {
            sceneRef.current!.remove(light);
        });
        lightsRef.current = [];
    };

    // Функция для настройки освещения
    const setupLighting = (mode: LightingMode) => {
        if (!sceneRef.current || !rendererRef.current) return;

        // Очищаем предыдущие источники света
        clearLights();

        // Убираем environment map
        if (envMapRef.current) {
            envMapRef.current.dispose();
            envMapRef.current = null;
        }
        sceneRef.current.environment = null;

        switch (mode) {
            case 'default':
                // Стандартное освещение (текущее)
                setupDefaultLighting();
                break;
            case 'none':
                // Без освещения - только ambient
                setupNoLighting();
                break;
            case 'neutral':
                // Нейтральное освещение
                setupNeutralLighting();
                break;
            case 'venice-sunset':
                // Закат в Венеции
                setupVeniceSunsetLighting();
                break;
            case 'footprint-court':
                // HDR Labs
                setupFootprintCourtLighting();
                break;
        }

        // Обновляем материалы для применения новых настроек освещения
        if (meshRef.current) {
            meshRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => {
                            material.needsUpdate = true;
                        });
                    } else {
                        child.material.needsUpdate = true;
                    }
                }
            });
        }
    };

    const setupDefaultLighting = () => {
        if (!sceneRef.current) return;

        // Абсолютное освещение со всех сторон
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        sceneRef.current.add(ambientLight);
        lightsRef.current.push(ambientLight);

        // Создаем HemisphereLight для мягкого равномерного освещения
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        hemisphereLight.position.set(0, 50, 0);
        sceneRef.current.add(hemisphereLight);
        lightsRef.current.push(hemisphereLight);

        // Создаем множество направленных источников света со всех сторон
        const lightPositions = [
            [100, 100, 100],   // Передний верхний правый
            [-100, 100, 100],  // Передний верхний левый
            [100, -100, 100],  // Передний нижний правый
            [-100, -100, 100], // Передний нижний левый
            [100, 100, -100],  // Задний верхний правый
            [-100, 100, -100], // Задний верхний левый
            [100, -100, -100], // Задний нижний правый
            [-100, -100, -100],// Задний нижний левый
            [100, 0, 0],       // Правый
            [-100, 0, 0],      // Левый
            [0, 100, 0],       // Верхний
            [0, -100, 0],      // Нижний
            [0, 0, 100],       // Передний
            [0, 0, -100],      // Задний
        ];

        lightPositions.forEach(pos => {
            const light = new THREE.DirectionalLight(0xffffff, 1.3);
            light.position.set(pos[0], pos[1], pos[2]);
            sceneRef.current!.add(light);
            lightsRef.current.push(light);
        });

        // Один основной свет с очень слабыми тенями только для определения граней
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.2);
        mainLight.position.set(50, 50, 50);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 500;
        mainLight.shadow.camera.left = -100;
        mainLight.shadow.camera.right = 100;
        mainLight.shadow.camera.top = 100;
        mainLight.shadow.camera.bottom = -100;
        mainLight.shadow.bias = -0.0001;
        sceneRef.current.add(mainLight);
        lightsRef.current.push(mainLight);
    };

    const setupNoLighting = () => {
        if (!sceneRef.current) return;

        // Только базовое ambient освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        sceneRef.current.add(ambientLight);
        lightsRef.current.push(ambientLight);
    };

    const setupNeutralLighting = () => {
        if (!sceneRef.current) return;

        // Нейтральное освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        sceneRef.current.add(ambientLight);
        lightsRef.current.push(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 10, 5);
        mainLight.castShadow = true;
        sceneRef.current.add(mainLight);
        lightsRef.current.push(mainLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-10, 5, -5);
        sceneRef.current.add(fillLight);
        lightsRef.current.push(fillLight);
    };

    const setupVeniceSunsetLighting = () => {
        if (!sceneRef.current) return;

        // Теплое освещение заката
        const ambientLight = new THREE.AmbientLight(0xffd4a3, 0.3);
        sceneRef.current.add(ambientLight);
        lightsRef.current.push(ambientLight);

        // Основной свет заката
        const sunLight = new THREE.DirectionalLight(0xffa500, 1.2);
        sunLight.position.set(20, 5, 10);
        sunLight.castShadow = true;
        sceneRef.current.add(sunLight);
        lightsRef.current.push(sunLight);

        // Дополнительное мягкое освещение
        const fillLight = new THREE.DirectionalLight(0xff6b35, 0.4);
        fillLight.position.set(-10, 10, -5);
        sceneRef.current.add(fillLight);
        lightsRef.current.push(fillLight);

        // Подсветка снизу
        const bottomLight = new THREE.DirectionalLight(0xffd4a3, 0.2);
        bottomLight.position.set(0, -10, 0);
        sceneRef.current.add(bottomLight);
        lightsRef.current.push(bottomLight);
    };

    const setupFootprintCourtLighting = () => {
        if (!sceneRef.current) return;

        // HDR-стиль освещения
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        sceneRef.current.add(ambientLight);
        lightsRef.current.push(ambientLight);

        // Основной яркий свет
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(15, 25, 10);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        sceneRef.current.add(keyLight);
        lightsRef.current.push(keyLight);

        // Заполняющий свет
        const fillLight = new THREE.DirectionalLight(0xb3d9ff, 0.6);
        fillLight.position.set(-15, 10, -10);
        sceneRef.current.add(fillLight);
        lightsRef.current.push(fillLight);

        // Контровой свет
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight.position.set(0, 5, -20);
        sceneRef.current.add(rimLight);
        lightsRef.current.push(rimLight);

        // Дополнительные акцентные источники
        const accent1 = new THREE.PointLight(0x00ff88, 0.3, 100);
        accent1.position.set(10, 0, 10);
        sceneRef.current.add(accent1);
        lightsRef.current.push(accent1);

        const accent2 = new THREE.PointLight(0xff0088, 0.3, 100);
        accent2.position.set(-10, 0, -10);
        sceneRef.current.add(accent2);
        lightsRef.current.push(accent2);
    };

    useEffect(() => {
        if (!mountRef.current) return;

        console.log('Initializing Three.js scene');

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);
        sceneRef.current = scene;

        // Создаем группу для автоповорота
        const rotationGroup = new THREE.Group();
        rotationGroupRef.current = rotationGroup;
        scene.add(rotationGroup);

        // Улучшенная настройка камеры с более широким диапазоном
        const camera = new THREE.PerspectiveCamera(75, 1, 0.001, 10000);
        camera.position.set(50, 50, 50);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Улучшенная настройка тональности
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        rendererRef.current = renderer;

        mountRef.current.appendChild(renderer.domElement);

        // Замена OrbitControls на TrackballControls для полной свободы вращения
        const controls = new TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 2.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.staticMoving = false;
        controls.dynamicDampingFactor = 0.3;
        controlsRef.current = controls;

        // Инициализируем освещение
        setupLighting(lightingMode);

        const gridHelper = new THREE.GridHelper(100, 50, 0x778394, 0xe2e8f0);
        gridHelperRef.current = gridHelper;

        const axesHelper = new THREE.AxesHelper(50);
        axesHelperRef.current = axesHelper;

        const updateSize = () => {
            if (!mountRef.current || !camera || !renderer) return;

            const rect = mountRef.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                // Обновляем TrackballControls при изменении размера
                controls.handleResize();
            }
        };

        updateSize();

        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);

            // Автоповорот группы - используем ref для получения актуального значения
            if (autoRotateRef.current && rotationGroupRef.current) {
                rotationGroupRef.current.rotation.y += 0.01;
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });

        if (mountRef.current) {
            resizeObserver.observe(mountRef.current);
        }

        return () => {
            console.log('Cleaning up Three.js scene');
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            resizeObserver.disconnect();
            controls.dispose();
            clearLights();
            if (envMapRef.current) {
                envMapRef.current.dispose();
            }
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []); // Убираем все зависимости для инициализации сцены

    // Handle lighting mode changes
    useEffect(() => {
        setupLighting(lightingMode);
    }, [lightingMode]);

    // Handle display mode changes - теперь добавляем элементы в группу автоповорота
    useEffect(() => {
        if (!rotationGroupRef.current || !gridHelperRef.current || !axesHelperRef.current) return;

        const rotationGroup = rotationGroupRef.current;
        const grid = gridHelperRef.current;
        const axes = axesHelperRef.current;

        // Убираем элементы из группы
        rotationGroup.remove(grid);
        rotationGroup.remove(axes);

        switch (displayMode) {
            case 'grid':
                rotationGroup.add(grid);
                break;
            case 'axes':
                rotationGroup.add(axes);
                break;
            case 'clean':
                break;
        }
    }, [displayMode]);

    // Handle wireframe mode changes - НЕ СОХРАНЯЕМ позицию камеры
    useEffect(() => {
        if (!meshRef.current) return;

        meshRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.wireframe = wireframe;
                    });
                } else {
                    child.material.wireframe = wireframe;
                }
            }
        });
    }, [wireframe]);

    // Handle background color changes - НЕ СОХРАНЯЕМ позицию камеры
    useEffect(() => {
        if (!sceneRef.current) return;
        sceneRef.current.background = new THREE.Color(backgroundColor);
    }, [backgroundColor]);

    // Улучшенная функция для автоматического масштабирования модели
    const fitModelToView = (model: THREE.Object3D) => {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Центрируем модель
        model.position.sub(center);

        // Вычисляем оптимальные параметры камеры
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 1.5; // Увеличиваем расстояние для лучшего обзора - standart 2.5

        if (cameraRef.current && controlsRef.current) {
            // Настраиваем near и far плоскости в зависимости от размера модели
            cameraRef.current.near = Math.max(0.001, maxDim * 0.001);
            cameraRef.current.far = Math.max(1000, maxDim * 100);
            cameraRef.current.updateProjectionMatrix();

            // Позиционируем камеру
            cameraRef.current.position.set(distance, distance, distance);
            cameraRef.current.lookAt(0, 0, 0);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();

            // Настраиваем пределы масштабирования
            controlsRef.current.minDistance = maxDim * 0.01;
            controlsRef.current.maxDistance = maxDim * 50;
        }
    };

    // Load file based on URL
    useEffect(() => {
        if (!fileUrl || !rotationGroupRef.current) return;

        console.log('Loading 3D file:', fileUrl);
        setLoading(true);
        setError('');

        if (meshRef.current) {
            rotationGroupRef.current.remove(meshRef.current);
            if (meshRef.current instanceof THREE.Mesh) {
                meshRef.current.geometry.dispose();
                if (Array.isArray(meshRef.current.material)) {
                    meshRef.current.material.forEach(material => material.dispose());
                } else {
                    meshRef.current.material.dispose();
                }
            }
        }

        const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

        if (fileExtension === 'zip') {
            // Handle ZIP files
            fetch(fileUrl)
                .then(response => response.blob())
                .then(async (blob) => {
                    const zip = new JSZip();
                    const zipContent = await zip.loadAsync(blob);

                    // Find the main GLTF file
                    const gltfFile = Object.keys(zipContent.files).find(filename =>
                        filename.toLowerCase().endsWith('.gltf')
                    );

                    if (!gltfFile) {
                        throw new Error('GLTF файл не найден в архиве');
                    }

                    // Create blob URLs for all files
                    const fileUrls: { [key: string]: string } = {};

                    for (const [filename, file] of Object.entries(zipContent.files)) {
                        if (!file.dir) {
                            const blob = await file.async('blob');
                            fileUrls[filename] = URL.createObjectURL(blob);
                        }
                    }

                    // Load GLTF with custom resource resolver
                    const manager = new THREE.LoadingManager();

                    manager.setURLModifier((url) => {
                        const filename = url.split('/').pop() || url;
                        return fileUrls[filename] || url;
                    });

                    const loader = new GLTFLoader(manager);

                    const gltfContent = await zipContent.files[gltfFile].async('text');
                    const gltfBlob = new Blob([gltfContent], {type: 'application/json'});
                    const gltfUrl = URL.createObjectURL(gltfBlob);

                    loader.load(
                        gltfUrl,
                        (gltf) => {
                            console.log('GLTF from ZIP loaded successfully');

                            const model = gltf.scene;

                            model.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });

                            meshRef.current = model;
                            // Добавляем модель в группу автоповорота
                            rotationGroupRef.current!.add(model);

                            // Применяем автоматическое масштабирование
                            fitModelToView(model);

                            setLoading(false);

                            // Clean up blob URLs
                            Object.values(fileUrls).forEach(url => URL.revokeObjectURL(url));
                            URL.revokeObjectURL(gltfUrl);
                        },
                        (progress) => {
                            console.log('Loading progress:', progress);
                        },
                        (error) => {
                            console.error('Error loading GLTF from ZIP:', error);
                            setError('Ошибка загрузки GLTF из архива');
                            setLoading(false);

                            // Clean up blob URLs
                            Object.values(fileUrls).forEach(url => URL.revokeObjectURL(url));
                            URL.revokeObjectURL(gltfUrl);
                        }
                    );
                })
                .catch((error) => {
                    console.error('Error processing ZIP:', error);
                    setError('Ошибка обработки ZIP архива');
                    setLoading(false);
                });
        } else if (fileExtension === 'stl') {
            const loader = new STLLoader();

            loader.load(
                fileUrl,
                (geometry) => {
                    console.log('STL loaded successfully, vertices:', geometry.attributes.position.count);

                    geometry.computeBoundingBox();
                    const center = new THREE.Vector3();
                    geometry.boundingBox!.getCenter(center);
                    geometry.translate(-center.x, -center.y, -center.z);
                    geometry.computeVertexNormals();

                    const material = new THREE.MeshPhongMaterial({
                        color: 0x2563eb,
                        shininess: 100,
                        specular: 0x222222
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    meshRef.current = mesh;

                    // Добавляем модель в группу автоповорота
                    rotationGroupRef.current!.add(mesh);

                    // Применяем автоматическое масштабирование
                    fitModelToView(mesh);

                    setLoading(false);
                },
                (progress) => {
                    console.log('Loading progress:', progress);
                },
                (error) => {
                    console.error('Error loading STL:', error);
                    setError('Ошибка загрузки STL файла');
                    setLoading(false);
                }
            );
        } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
            const loader = new GLTFLoader();

            loader.load(
                fileUrl,
                (gltf) => {
                    console.log('GLTF loaded successfully');

                    const model = gltf.scene;

                    model.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    meshRef.current = model;
                    // Добавляем модель в группу автоповорота
                    rotationGroupRef.current!.add(model);

                    // Применяем автоматическое масштабирование
                    fitModelToView(model);

                    setLoading(false);
                },
                (progress) => {
                    console.log('Loading progress:', progress);
                },
                (error) => {
                    console.error('Error loading GLTF:', error);
                    setError('Ошибка загрузки GLTF файла');
                    setLoading(false);
                }
            );
        } else {
            setError('Неподдерживаемый формат файла. Поддерживаются: STL, GLTF, GLB, ZIP');
            setLoading(false);
        }
    }, [fileUrl]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mountRef}
                className="w-full h-full"
            />

            {(loading || isLoading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin"/>
                        <span>Загрузка модели...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                    <div className="text-center text-red-600">
                        <div className="text-lg font-semibold mb-2">Ошибка загрузки</div>
                        <div className="text-sm">{error}</div>
                    </div>
                </div>
            )}

            {!fileUrl && !loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-600">
                        <div className="text-lg font-semibold mb-2">3D Просмотрщик</div>
                        <div className="text-sm">Укажите файл в URL для просмотра 3D модели</div>
                    </div>
                </div>
            )}
        </div>
    );
});

ThreeDViewer.displayName = '3DViewer';

export default ThreeDViewer;