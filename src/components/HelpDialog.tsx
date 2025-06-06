import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const HelpDialog = () => {
  return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
              variant="outline"
              size="icon"
              className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
              title="Справка по управлению"
          >
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg z-[9999]">
          <DialogHeader>
            <DialogTitle>3D Просмотрщик - Справка</DialogTitle>
            <DialogDescription className="space-y-4 text-sm max-h-96 overflow-y-auto">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Управление:</h4>
                <div className="space-y-1 text-gray-600">
                  <div><strong>ЛКМ + перетаскивание:</strong> поворот модели</div>
                  <div><strong>Колесо мыши:</strong> масштабирование</div>
                  <div><strong>ПКМ + перетаскивание:</strong> панорама (перемещение)</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Загрузка файлов:</h4>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <strong>Параметр file:</strong> <code className="bg-gray-100 px-1 rounded text-xs">?file=model.stl</code>
                    <br />
                    <span className="text-xs">Загружает файл из папки public/models/</span>
                  </div>
                  <div>
                    <strong>Параметр fileUrl:</strong> <code className="bg-gray-100 px-1 rounded text-xs">?fileUrl=https://example.com/model.gltf</code>
                    <br />
                    <span className="text-xs">Загружает файл по прямой ссылке</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Поддерживаемые форматы:</h4>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <strong>STL файлы:</strong> <code className="bg-gray-100 px-1 rounded text-xs">.stl</code>
                    <br />
                    <span className="text-xs">Простые 3D модели без материалов и текстур</span>
                  </div>
                  <div>
                    <strong>GLTF файлы:</strong> <code className="bg-gray-100 px-1 rounded text-xs">.gltf</code>
                    <br />
                    <span className="text-xs">Требует .bin файл и текстуры в той же папке</span>
                  </div>
                  <div>
                    <strong>GLB файлы:</strong> <code className="bg-gray-100 px-1 rounded text-xs">.glb</code>
                    <br />
                    <span className="text-xs">Все данные включены в один файл</span>
                  </div>
                  <div>
                    <strong>ZIP архивы:</strong> <code className="bg-gray-100 px-1 rounded text-xs">.zip</code>
                    <br />
                    <span className="text-xs">Должен содержать .gltf файл и все зависимости (текстуры, .bin файлы)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Режимы отображения:</h4>
                <div className="space-y-1 text-gray-600">
                  <div><strong>Сетка:</strong> модель с координатной сеткой</div>
                  <div><strong>Оси XYZ:</strong> модель с осями координат</div>
                  <div><strong>Чистый фон:</strong> только модель без дополнительных элементов</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Настройка фона:</h4>
                <div className="text-gray-600">
                  <div>Используйте цветовой селектор для изменения цвета фона сцены</div>
                  <div className="text-xs mt-1">Настройки сохраняются между сессиями</div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
  );
};

export default HelpDialog;