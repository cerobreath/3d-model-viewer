import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { DisplayMode } from './DisplayModeControls';

interface ViewerProps {
  fileUrl: string;
  isLoading?: boolean;
  displayMode: DisplayMode;
  backgroundColor: string;
}

export interface ViewerRef {
    resetView: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
}

const ThreeDViewer = forwardRef<ViewerRef, ViewerProps>(({ fileUrl, isLoading, displayMode, backgroundColor }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const meshRef = useRef<THREE.Mesh | THREE.Group>();
  const frameRef = useRef<number>();
  const gridHelperRef = useRef<THREE.GridHelper>();
  const axesHelperRef = useRef<THREE.AxesHelper>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
          const distance = maxDim * 0.5;
          
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

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('Initializing Three.js scene');
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
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
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-50, -50, -50);
    scene.add(directionalLight2);

    const gridHelper = new THREE.GridHelper(100, 50, 0x778394, 0xe2e8f0);
    gridHelperRef.current = gridHelper;
    scene.add(gridHelper);

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
      }
    };

    updateSize();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handle display mode changes
  useEffect(() => {
    if (!sceneRef.current || !gridHelperRef.current || !axesHelperRef.current) return;

    const scene = sceneRef.current;
    const grid = gridHelperRef.current;
    const axes = axesHelperRef.current;

    // Remove both helpers first
    scene.remove(grid);
    scene.remove(axes);

    // Add based on display mode
    switch (displayMode) {
      case 'grid':
        scene.add(grid);
        break;
      case 'axes':
        scene.add(axes);
        break;
      case 'clean':
        // No helpers added
        break;
    }
  }, [displayMode]);

  // Handle background color changes
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(backgroundColor);
  }, [backgroundColor]);

  // Load file based on URL
  useEffect(() => {
    if (!fileUrl || !sceneRef.current) return;

    console.log('Loading 3D file:', fileUrl);
    setLoading(true);
    setError('');

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
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
          const gltfBlob = new Blob([gltfContent], { type: 'application/json' });
          const gltfUrl = URL.createObjectURL(gltfBlob);
          
          loader.load(
            gltfUrl,
            (gltf) => {
              console.log('GLTF from ZIP loaded successfully');
              
              const model = gltf.scene;
              
              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              
              model.position.sub(center);
              
              model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });

              meshRef.current = model;
              sceneRef.current!.add(model);

              const maxDim = Math.max(size.x, size.y, size.z);
              const distance = maxDim * 0.5;

              if (cameraRef.current && controlsRef.current) {
                cameraRef.current.position.set(distance, distance, distance);
                cameraRef.current.lookAt(0, 0, 0);
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
              }

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

          sceneRef.current!.add(mesh);

          const box = new THREE.Box3().setFromObject(mesh);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const distance = maxDim * 0.5;

          if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(distance, distance, distance);
            cameraRef.current.lookAt(0, 0, 0);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }

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
          
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          model.position.sub(center);
          
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          meshRef.current = model;
          sceneRef.current!.add(model);

          const maxDim = Math.max(size.x, size.y, size.z);
          const distance = maxDim * 0.5;

          if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(distance, distance, distance);
            cameraRef.current.lookAt(0, 0, 0);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }

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
            <Loader2 className="w-6 h-6 animate-spin" />
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
