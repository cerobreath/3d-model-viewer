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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto z-[99999]">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              3D Просмотрщик - Справка
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            {/* Управление */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🎮</span> Управление
              </h4>
              <div className="space-y-2 text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-xs font-mono min-w-0 whitespace-nowrap">ЛКМ</span>
                  <span>перетаскивание для поворота модели</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-xs font-mono min-w-0 whitespace-nowrap">Колесо</span>
                  <span>масштабирование (увеличение/уменьшение)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-xs font-mono min-w-0 whitespace-nowrap">ПКМ</span>
                  <span>перетаскивание для панорамы (перемещение)</span>
                </div>
              </div>
            </div>

            {/* Загрузка файлов */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📁</span> Загрузка файлов
              </h4>
              <div className="space-y-3 text-green-800">
                <div>
                  <div className="font-semibold mb-1">Локальные файлы:</div>
                  <code className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs block mb-1">
                    ?file=model.stl
                  </code>
                  <div className="text-xs text-green-700">Загружает файл из папки public/models/</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Внешние ссылки:</div>
                  <code className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs block mb-1">
                    ?fileUrl=https://example.com/model.gltf
                  </code>
                  <div className="text-xs text-green-700">Загружает файл по прямой ссылке</div>
                </div>
              </div>
            </div>

            {/* Форматы файлов */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span> Поддерживаемые форматы
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-purple-800">
                <div className="bg-white rounded p-3 border border-purple-100">
                  <div className="font-semibold flex items-center gap-2 mb-1">
                    <code className="bg-purple-200 text-purple-900 px-1 rounded text-xs">.stl</code>
                    STL файлы
                  </div>
                  <div className="text-xs text-purple-700">Простые 3D модели без материалов</div>
                </div>
                <div className="bg-white rounded p-3 border border-purple-100">
                  <div className="font-semibold flex items-center gap-2 mb-1">
                    <code className="bg-purple-200 text-purple-900 px-1 rounded text-xs">.gltf</code>
                    GLTF файлы
                  </div>
                  <div className="text-xs text-purple-700">Требует .bin файл и текстуры</div>
                </div>
                <div className="bg-white rounded p-3 border border-purple-100">
                  <div className="font-semibold flex items-center gap-2 mb-1">
                    <code className="bg-purple-200 text-purple-900 px-1 rounded text-xs">.glb</code>
                    GLB файлы
                  </div>
                  <div className="text-xs text-purple-700">Все данные в одном файле</div>
                </div>
                <div className="bg-white rounded p-3 border border-purple-100">
                  <div className="font-semibold flex items-center gap-2 mb-1">
                    <code className="bg-purple-200 text-purple-900 px-1 rounded text-xs">.zip</code>
                    ZIP архивы
                  </div>
                  <div className="text-xs text-purple-700">Содержит .gltf и зависимости</div>
                </div>
              </div>
            </div>

            {/* Режимы отображения */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🎨</span> Режимы отображения
              </h4>
              <div className="space-y-2 text-orange-800">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded text-xs font-semibold">Сетка</span>
                  <span>модель с координатной сеткой</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded text-xs font-semibold">XYZ</span>
                  <span>модель с осями координат</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded text-xs font-semibold">Чистый</span>
                  <span>только модель без дополнительных элементов</span>
                </div>
              </div>
            </div>

            {/* Настройки */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">⚙️</span> Настройки
              </h4>
              <div className="text-gray-700">
                <div>Используйте цветовой селектор для изменения цвета фона сцены</div>
                <div className="text-xs mt-1 text-gray-600">💾 Настройки автоматически сохраняются</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default HelpDialog;