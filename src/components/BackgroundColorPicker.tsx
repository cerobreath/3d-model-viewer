import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface BackgroundColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

const BackgroundColorPicker = ({ color, onColorChange }: BackgroundColorPickerProps) => {
  const presetColors = [
    '#f8fafc', // gray-50
    '#ffffff', // white
    '#e2e8f0', // slate-200
    '#94a3b8', // slate-400
    '#475569', // slate-600
    '#1e293b', // slate-800
    '#0f172a', // slate-900
    '#1e40af', // blue-700
    '#059669', // emerald-600
    '#dc2626', // red-600
    '#7c3aed', // violet-600
    '#ea580c', // orange-600
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200"
          title="Цвет фона"
        >
          <Palette className="h-4 w-4" />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white"
            style={{ backgroundColor: color }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Цвет фона</label>
            
            {/* Color input */}
            <div className="mb-4">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-full h-10 rounded border border-gray-200 cursor-pointer"
                title="Выберите цвет"
              />
            </div>
            
            {/* Preset colors */}
            <div>
              <label className="text-sm font-medium mb-2 block">Готовые цвета</label>
              <div className="grid grid-cols-4 gap-2">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => onColorChange(presetColor)}
                    className="w-10 h-10 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BackgroundColorPicker;