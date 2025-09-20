import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface Props {
  images: string[]; // list các object URL để preview
  onUpload: (files: FileList | null) => void;
  onRemove: (idx: number) => void;
}

const CreateProjectImages: React.FC<Props> = ({
  images,
  onUpload,
  onRemove,
}) => {
  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="relative">
        <input
          id="project-image-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const el = document.getElementById(
              "project-image-input"
            ) as HTMLInputElement | null;
            el?.click();
          }}
          className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-gray-50 rounded-lg"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Tải ảnh dự án
            </span>
          </div>
        </Button>
        <p className="text-sm text-gray-500 mt-3 text-center">
          Hỗ trợ định dạng: JPG, PNG, GIF (Tối đa 10MB mỗi ảnh)
        </p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
            >
              <img
                src={img}
                className="w-full h-32 object-contain bg-gray-50"
                alt={`Project image ${idx + 1}`}
              />
              <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/20 transition-all duration-200"></div>
              <button
                aria-label="Xóa ảnh"
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-2 right-2 hidden group-hover:flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 shadow-lg transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 text-center">
                    Ảnh {idx + 1}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium mb-1">Chưa có hình ảnh nào</p>
          <p className="text-xs text-gray-400">Nhấn nút trên để tải ảnh lên</p>
        </div>
      )}
    </div>
  );
};

export default CreateProjectImages;
