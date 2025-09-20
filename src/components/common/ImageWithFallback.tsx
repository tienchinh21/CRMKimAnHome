import React, { useState } from "react";
import { Building2, Home } from "lucide-react";

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackType?: "project" | "apartment";
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = "",
  fallbackType = "project",
  fallbackSrc,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default fallback images
  const defaultFallbacks = {
    project:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=240&fit=crop&crop=building",
    apartment:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=240&fit=crop&crop=building",
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Determine what to show
  const shouldShowFallback = !src || hasError;
  const fallbackImage = fallbackSrc || defaultFallbacks[fallbackType];

  if (shouldShowFallback && !fallbackSrc) {
    // Show icon fallback if no fallback image provided
    const Icon = fallbackType === "project" ? Building2 : Home;
    return (
      <div
        className={`bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ${className}`}
      >
        <Icon className="h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}

      <img
        src={shouldShowFallback ? fallbackImage : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
    </div>
  );
};

export default ImageWithFallback;
