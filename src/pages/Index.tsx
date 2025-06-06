
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AlertCircle, FileIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ControlPanel from '@/components/ControlPanel';
import { DisplayMode } from '@/components/DisplayModeControls';
import ThreeDViewer, { ViewerRef } from '@/components/3DViewer';

const Index = () => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('viewer-background-color') || '#f8fafc';
  });
  const viewerRef = useRef<ViewerRef | null>(null);
  viewerRef.current?.resetView();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fileParam = urlParams.get('file');
    const fileUrlParam = urlParams.get('fileUrl');
    
    if (!fileParam && !fileUrlParam) {
      setError('Не указан параметр "file" в URL. Пример: ?file=example.stl или ?fileUrl=https://example.com/model.gltf');
      return;
    }

    setIsLoading(true);
    setError('');

    if (fileUrlParam) {
      // Direct URL
      console.log('Loading 3D file from direct URL:', fileUrlParam);
      setFileName(fileUrlParam.split('/').pop() || 'model');
      setFileUrl(fileUrlParam);
      setIsLoading(false);
    } else if (fileParam) {
      // Local file from public/models/
      console.log('Loading 3D file from URL parameter:', fileParam);
      setFileName(fileParam);
      
      const modelUrl = `/models/${fileParam}`;
      
      fetch(modelUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Файл не найден: ${fileParam}`);
          }
          setFileUrl(modelUrl);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading 3D file:', err);
          setError(`Ошибка загрузки файла: ${fileParam}. Убедитесь, что файл существует в папке public/models/`);
          setIsLoading(false);
        });
    }
  }, []);

  // Save background color to localStorage
  useEffect(() => {
    localStorage.setItem('viewer-background-color', backgroundColor);
  }, [backgroundColor]);

  const handleFullscreen = useCallback(() => {
    const viewerElement = document.querySelector('.viewer-container');
    if (!viewerElement) return;

    if (!document.fullscreenElement) {
      viewerElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  }, []);

  const handleViewerControls = useCallback((action: string) => {
    console.log('Viewer control action:', action);
    if (viewerRef.current) {
      switch (action) {
        case 'reset':
          viewerRef.current.resetView();
          break;
        case 'zoomIn':
          viewerRef.current.zoomIn();
          break;
        case 'zoomOut':
          viewerRef.current.zoomOut();
          break;
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-2xl border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative viewer-container">
      {/* File info overlay */}
      {fileName && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 shadow-lg border border-gray-200 max-w-[calc(100vw-120px)] sm:max-w-none">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
              <span className="font-medium text-gray-800 truncate">{fileName}</span>
            </div>
          </div>
      )}

      {/* Control Panel */}
      {fileUrl && !error && (
        <ControlPanel
          onFullscreen={handleFullscreen}
          onResetView={() => handleViewerControls('reset')}
          onZoomIn={() => handleViewerControls('zoomIn')}
          onZoomOut={() => handleViewerControls('zoomOut')}
          isFullscreen={isFullscreen}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
        />
      )}

      {/* 3D Viewer - Full screen */}
      <div className="w-full h-screen">
        <ThreeDViewer 
          ref={viewerRef}
          fileUrl={fileUrl} 
          isLoading={isLoading}
          displayMode={displayMode}
          backgroundColor={backgroundColor}
        />
      </div>
    </div>
  );
};

export default Index;
