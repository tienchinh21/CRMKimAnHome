import React, { useState } from "react";
import { Plus, X, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageWithFallback from "@/components/common/ImageWithFallback";

interface ImageEditorProps {
  images: string[];
  selectedImages: File[];
  deletedImages: string[];
  onImageSelect: (files: File[]) => void;
  onImageRemove: (index: number) => void;
  onImageDelete: (imageUrl: string) => void;
  onImageRestore: (imageUrl: string) => void;
  fallbackType?: "project" | "apartment";
  title?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  images,
  selectedImages,
  deletedImages,
  onImageSelect,
  onImageRemove,
  onImageDelete,
  onImageRestore,
  fallbackType = "project",
  title = "Hình ảnh",
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImageSelect(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onImageSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          {images.length - deletedImages.length + selectedImages.length} ảnh
        </div>
      </div>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Ảnh hiện tại</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => {
              const isDeleted = deletedImages.includes(imageUrl);
              return (
                <div
                  key={index}
                  className={`relative group rounded-lg overflow-hidden border-2 ${
                    isDeleted
                      ? "border-red-300 opacity-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="aspect-video">
                    <ImageWithFallback
                      src={imageUrl}
                      alt={`${title} - Ảnh ${index + 1}`}
                      className="w-full h-full object-cover"
                      fallbackType={fallbackType}
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="absolute top-2 right-2 flex gap-1">
                      {isDeleted ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onImageRestore(imageUrl)}
                          className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onImageDelete(imageUrl)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isDeleted && (
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="destructive" className="text-xs">
                        Đã xóa
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Images */}
      {selectedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Ảnh mới</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedImages.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border-2 border-teal-200"
              >
                <div className="aspect-video">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`${title} - Ảnh mới ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onImageRemove(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-teal-500 text-white text-xs">Mới</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-teal-500 bg-teal-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Thêm ảnh mới</p>
            <p className="text-sm text-gray-500">
              Kéo thả ảnh vào đây hoặc nhấn để chọn
            </p>
          </div>
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Chọn ảnh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(deletedImages.length > 0 || selectedImages.length > 0) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tóm tắt thay đổi:</span>
            <div className="flex gap-4">
              {deletedImages.length > 0 && (
                <span className="text-red-600">
                  -{deletedImages.length} ảnh
                </span>
              )}
              {selectedImages.length > 0 && (
                <span className="text-teal-600">
                  +{selectedImages.length} ảnh
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
