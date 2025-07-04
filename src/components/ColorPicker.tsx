
import React, { useState, useEffect, useRef } from 'react';

interface ColorPickerProps {
    color: string;
    onColorChange: (color: string) => void;
}

interface HSV {
    h: number; // 0-360
    s: number; // 0-100
    v: number; // 0-100
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange }) => {
    const [hsv, setHsv] = useState<HSV>({ h: 0, s: 100, v: 100 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hueCanvasRef = useRef<HTMLCanvasElement>(null);

    // ... keep existing code (hexToHsv function)
    const hexToHsv = (hex: string): HSV => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = 0;
        let s = max === 0 ? 0 : (diff / max) * 100;
        let v = max * 100;

        if (diff !== 0) {
            switch (max) {
                case r:
                    h = ((g - b) / diff) * 60;
                    break;
                case g:
                    h = ((b - r) / diff + 2) * 60;
                    break;
                case b:
                    h = ((r - g) / diff + 4) * 60;
                    break;
            }
        }

        if (h < 0) h += 360;

        return { h, s, v };
    };

    // ... keep existing code (hsvToHex function)
    const hsvToHex = (h: number, s: number, v: number): string => {
        s = s / 100;
        v = v / 100;

        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;

        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else if (h >= 300 && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // ... keep existing code (useEffect for initialization)
    useEffect(() => {
        if (color && color !== hsvToHex(hsv.h, hsv.s, hsv.v)) {
            setHsv(hexToHsv(color));
        }
    }, [color]);

    // ... keep existing code (drawSaturationValue function)
    const drawSaturationValue = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Create base color (pure hue)
        const baseColor = hsvToHex(hsv.h, 100, 100);

        // Horizontal gradient (saturation)
        const satGradient = ctx.createLinearGradient(0, 0, width, 0);
        satGradient.addColorStop(0, '#ffffff');
        satGradient.addColorStop(1, baseColor);

        ctx.fillStyle = satGradient;
        ctx.fillRect(0, 0, width, height);

        // Vertical gradient (value/brightness)
        const valGradient = ctx.createLinearGradient(0, 0, 0, height);
        valGradient.addColorStop(0, 'rgba(0,0,0,0)');
        valGradient.addColorStop(1, 'rgba(0,0,0,1)');

        ctx.fillStyle = valGradient;
        ctx.fillRect(0, 0, width, height);
    };

    // ... keep existing code (drawHue function)
    const drawHue = () => {
        if (!hueCanvasRef.current) return;

        const canvas = hueCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.17, '#ffff00');
        gradient.addColorStop(0.33, '#00ff00');
        gradient.addColorStop(0.5, '#00ffff');
        gradient.addColorStop(0.67, '#0000ff');
        gradient.addColorStop(0.83, '#ff00ff');
        gradient.addColorStop(1, '#ff0000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    };

    useEffect(() => {
        drawSaturationValue();
    }, [hsv.h]);

    useEffect(() => {
        drawHue();
    }, []);

    // ... keep existing code (click handlers)
    const handleSaturationValueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const s = (x / rect.width) * 100;
        const v = 100 - (y / rect.height) * 100;

        const newHsv = { ...hsv, s: Math.max(0, Math.min(100, s)), v: Math.max(0, Math.min(100, v)) };
        setHsv(newHsv);
        onColorChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    };

    const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!hueCanvasRef.current) return;

        const rect = hueCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const h = (x / rect.width) * 360;

        const newHsv = { ...hsv, h: Math.max(0, Math.min(360, h)) };
        setHsv(newHsv);
        onColorChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    };

    return (
        <div className="space-y-3">
            {/* Color preview */}
            <div className="flex items-center gap-2 mb-3">
                <div
                    className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: color }}
                />
                <div className="text-sm font-mono text-gray-600">{color}</div>
            </div>

            {/* Saturation/Value picker */}
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={200}
                    height={120}
                    className="w-full h-24 rounded border border-gray-200 cursor-crosshair"
                    onClick={handleSaturationValueClick}
                />
                {/* Current color indicator */}
                <div
                    className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none shadow-sm"
                    style={{
                        left: `${(hsv.s / 100) * 100}%`,
                        top: `${((100 - hsv.v) / 100) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            </div>

            {/* Hue slider */}
            <div className="relative">
                <canvas
                    ref={hueCanvasRef}
                    width={200}
                    height={20}
                    className="w-full h-4 rounded border border-gray-200 cursor-pointer"
                    onClick={handleHueClick}
                />
                {/* Hue indicator */}
                <div
                    className="absolute w-1 h-6 bg-white border border-black rounded-sm pointer-events-none shadow-sm"
                    style={{
                        left: `${(hsv.h / 360) * 100}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            </div>
        </div>
    );
};

export default ColorPicker;
