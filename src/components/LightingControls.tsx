import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type LightingMode = 'default' | 'none' | 'neutral' | 'venice-sunset' | 'footprint-court';

interface LightingControlsProps {
    currentMode: LightingMode;
    onModeChange: (mode: LightingMode) => void;
}

const LightingControls = ({ currentMode, onModeChange }: LightingControlsProps) => {
    const lightingModes = [
        { id: 'default' as LightingMode, name: 'По умолчанию', description: 'Стандартное освещение' },
        { id: 'none' as LightingMode, name: 'None', description: 'Без освещения' },
        { id: 'neutral' as LightingMode, name: 'Neutral', description: 'Нейтральное освещение' },
        { id: 'venice-sunset' as LightingMode, name: 'Venice Sunset', description: 'Закат в Венеции' },
        { id: 'footprint-court' as LightingMode, name: 'Footprint Court', description: 'HDR Labs' },
    ];

    const getCurrentModeName = () => {
        const mode = lightingModes.find(m => m.id === currentMode);
        return mode ? mode.name : 'По умолчанию';
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                    title={`Освещение: ${getCurrentModeName()}`}
                >
                    <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 border border-white" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
                <div className="space-y-3">
                    <label className="text-sm font-medium block">Освещение</label>

                    <div className="space-y-1">
                        {lightingModes.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => onModeChange(mode.id)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                    currentMode === mode.id
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                }`}
                            >
                                <div className="font-medium">{mode.name}</div>
                                <div className="text-xs text-gray-500">{mode.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default LightingControls;