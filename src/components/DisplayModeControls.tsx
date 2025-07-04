
import React from 'react';
import { Grid3x3, Axis3d, EyeOff, RotateCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DisplayMode = 'grid' | 'axes' | 'clean';

interface DisplayModeControlsProps {
    currentMode: DisplayMode;
    onModeChange: (mode: DisplayMode) => void;
    autoRotate: boolean;
    onAutoRotateToggle: () => void;
    wireframe: boolean;
    onWireframeToggle: () => void;
}

const DisplayModeControls = ({
                                 currentMode,
                                 onModeChange,
                                 autoRotate,
                                 onAutoRotateToggle,
                                 wireframe,
                                 onWireframeToggle
                             }: DisplayModeControlsProps) => {
    const modes = [
        { id: 'clean' as DisplayMode, icon: EyeOff, title: 'Чистый фон' },
        { id: 'grid' as DisplayMode, icon: Grid3x3, title: 'Сетка' },
        { id: 'axes' as DisplayMode, icon: Axis3d, title: 'Оси XYZ' },
    ];

    return (
        <div className="flex gap-1">
            {modes.map(({ id, icon: Icon, title }) => (
                <Button
                    key={id}
                    onClick={() => onModeChange(id)}
                    variant="outline"
                    size="icon"
                    className={cn(
                        "bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10",
                        currentMode === id && "bg-blue-50 border-blue-300 text-blue-600"
                    )}
                    title={title}
                >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
            ))}

            <div className="w-px bg-gray-300 mx-1" />

            <Button
                onClick={onAutoRotateToggle}
                variant="outline"
                size="icon"
                className={cn(
                    "bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10",
                    autoRotate && "bg-green-50 border-green-300 text-green-600"
                )}
                title="Автоповорот"
            >
                <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <Button
                onClick={onWireframeToggle}
                variant="outline"
                size="icon"
                className={cn(
                    "bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10",
                    wireframe && "bg-purple-50 border-purple-300 text-purple-600"
                )}
                title="Каркасный режим"
            >
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        </div>
    );
};

export default DisplayModeControls;
