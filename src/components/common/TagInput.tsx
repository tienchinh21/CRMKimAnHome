import React, { useState, useRef, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = "Nhập điểm nổi bật...",
  maxTags = 10,
  error,
  label,
  required = false,
  className,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Tags Container */}
      <div
        className={cn(
          "min-h-[42px] w-full px-3 py-2 border border-gray-200 rounded-lg",
          "bg-white flex flex-wrap items-center gap-2",
          "focus-within:border-gray-400 transition-colors",
          error && "border-red-300 focus-within:border-red-400",
          isFocused && "border-gray-400"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Existing Tags */}
        {tags.map((tag, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Input Field */}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
          />
        )}

        {/* Add Button */}
        {tags.length < maxTags && inputValue && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Thêm
          </button>
        )}
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {tags.length > 0
            ? `${tags.length} điểm nổi bật`
            : "Nhấn Enter hoặc dấu phẩy để thêm"}
        </span>
        {maxTags && (
          <span>
            {tags.length}/{maxTags}
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Example Tags */}
      {tags.length === 0 && (
        <div className="text-xs text-gray-400">
          <p className="mb-1">Ví dụ:</p>
          <div className="flex flex-wrap gap-1">
            {[
              "Gần trung tâm thành phố",
              "Có bãi đỗ xe",
              "Gần trường học",
              "View đẹp",
            ].map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(example)}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                + {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagInput;
