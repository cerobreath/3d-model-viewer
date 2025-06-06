import React from 'react';
import { Maximize, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpDialog from './HelpDialog';
import DisplayModeControls, { DisplayMode } from './DisplayModeControls';
import BackgroundColorPicker from './BackgroundColorPicker';

interface ControlPanelProps {
  onFullscreen: () => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isFullscreen?: boolean;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
}

const ControlPanel = ({
                        onFullscreen,
                        onResetView,
                        onZoomIn,
                        onZoomOut,
                        isFullscreen = false,
                        displayMode,
                        onDisplayModeChange,
                        backgroundColor,
                        onBackgroundColorChange
                      }: ControlPanelProps) => {
  return (
      <div className="absolute top-4 right-4 z-50">
        {/* Unified control panel */}
        <div className="flex flex-wrap gap-1 sm:gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-1 sm:p-2 shadow-lg border border-gray-200 max-w-[calc(100vw-32px)]">
          <Button
              onClick={onFullscreen}
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
              title={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
          >
            <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <Button
              onClick={onResetView}
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
              title="Сбросить вид"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <Button
              onClick={onZoomIn}
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
              title="Приблизить"
          >
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <Button
              onClick={onZoomOut}
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
              title="Отдалить"
          >
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <div className="hidden sm:block w-px bg-gray-300 mx-1" />

          <DisplayModeControls
              currentMode={displayMode}
              onModeChange={onDisplayModeChange}
          />

          <div className="hidden sm:block w-px bg-gray-300 mx-1" />

          <BackgroundColorPicker
              color={backgroundColor}
              onColorChange={onBackgroundColorChange}
          />

          <div className="hidden sm:block w-px bg-gray-300 mx-1" />

          <HelpDialog />
        </div>
      </div>
  );
};

export default ControlPanel;