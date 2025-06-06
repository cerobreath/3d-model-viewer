import React from 'react';
import { Grid3x3, Axis3d, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DisplayMode = 'grid' | 'axes' | 'clean';

interface DisplayModeControlsProps {
  currentMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
}

const DisplayModeControls = ({ currentMode, onModeChange }: DisplayModeControlsProps) => {
  const modes = [
    { id: 'grid' as DisplayMode, icon: Grid3x3, title: 'Сетка' },
    { id: 'axes' as DisplayMode, icon: Axis3d, title: 'Оси XYZ' },
    { id: 'clean' as DisplayMode, icon: EyeOff, title: 'Чистый фон' },
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
      </div>
  );
};

export default DisplayModeControls;