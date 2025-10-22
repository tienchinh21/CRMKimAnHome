import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import type { ProjectImage } from "@/types/project";

interface ProjectImageGalleryProps {
  title?: string;
  name: string;
  images?: string[] | ProjectImage[];
}

const ProjectImageGallery: React.FC<ProjectImageGalleryProps> = ({
  //   title = "Hình ảnh dự án",
  name,
  images,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader> */}
      <CardContent>
        {images && images.length > 0 ? (
          <div className="space-y-4 p-4">
            {/* Main Image - 16:9 aspect ratio */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={
                  typeof images[selectedImageIndex] === "string"
                    ? (images[selectedImageIndex] as string)
                    : (images[selectedImageIndex] as ProjectImage).url
                }
                alt={`${name} - Hình ${selectedImageIndex + 1}`}
                className="h-full w-full object-cover"
                fallbackType="project"
              />
              <div className="absolute top-2 left-2 bg-gray-900/50 text-white px-2 py-1 rounded-md text-sm">
                {selectedImageIndex + 1}/{images.length}
              </div>
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={
                      typeof img === "string" ? idx : (img as ProjectImage).id
                    }
                    onClick={() => handleImageClick(idx)}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                      selectedImageIndex === idx
                        ? "ring-2 ring-teal-500 ring-offset-2"
                        : "hover:opacity-80"
                    }`}
                  >
                    <ImageWithFallback
                      src={
                        typeof img === "string"
                          ? img
                          : (img as ProjectImage).url
                      }
                      alt={`${name} - Hình ${idx + 1}`}
                      className="h-full w-full object-cover"
                      fallbackType="project"
                    />
                    <div className="absolute top-1 left-1 bg-gray-900/50 text-white px-1 py-0.5 rounded text-xs">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Chưa có hình ảnh</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectImageGallery;
