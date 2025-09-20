import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectWithSearchProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: number;
  error?: string;
  label?: string;
  required?: boolean;
}

const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  disabled = false,
  className,
  maxHeight = 200,
  error,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  }>({ top: 0, left: 0, width: 0, openUpward: false });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Get selected option label
  const selectedOption = options.find((option) => option.value === value);

  // Handle click outside to close dropdown and scroll events
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdownElement = document.querySelector("[data-select-dropdown]");

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!dropdownElement || !dropdownElement.contains(target))
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    const handleScroll = (event: Event) => {
      if (isOpen) {
        // Check if scroll is happening inside the dropdown
        const target = event.target as Element;
        const dropdownElement = document.querySelector(
          "[data-select-dropdown]"
        );

        // Only close if scroll is not inside the dropdown
        if (!dropdownElement?.contains(target)) {
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens and calculate position
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
      if (searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, maxHeight]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          const option = filteredOptions[focusedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setSearchTerm("");
            setFocusedIndex(-1);
          }
        }
        break;
    }
  };

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);

  const handleOptionClick = (optionValue: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log("Option clicked:", optionValue);
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFocusedIndex(-1);
  };

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = Math.min(maxHeight, 250); // Estimate dropdown height

    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    let top: number;
    if (openUpward) {
      top = rect.top - dropdownHeight - 4;
    } else {
      top = rect.bottom + 4;
    }

    setDropdownPosition({
      top: Math.max(8, top), // Minimum 8px from viewport edge
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  };

  return (
    <div className={cn("relative z-10", className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Button */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 border border-gray-200 rounded-lg",
            "flex items-center justify-between",
            "bg-white text-left",
            "focus:outline-none focus:border-gray-400",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "hover:border-gray-300 transition-colors",
            error && "border-red-300 focus:border-red-400",
            isOpen && "border-gray-400"
          )}
        >
          <span className={cn("truncate", !selectedOption && "text-gray-500")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen &&
          createPortal(
            <div
              data-select-dropdown
              className={cn(
                "fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl",
                "overflow-hidden"
              )}
              style={{
                maxHeight: `${maxHeight}px`,
                width: `${dropdownPosition.width}px`,
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {/* Search Input */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Options List */}
              <div
                className="overflow-y-auto"
                style={{ maxHeight: `${maxHeight - 60}px` }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    Không tìm thấy kết quả
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      ref={(el) => {
                        optionRefs.current[index] = el;
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!option.disabled) {
                          handleOptionClick(option.value, e);
                        }
                      }}
                      className={cn(
                        "px-3 py-2 cursor-pointer flex items-center justify-between",
                        "hover:bg-gray-50 transition-colors",
                        option.disabled && "opacity-50 cursor-not-allowed",
                        focusedIndex === index && "bg-blue-50",
                        value === option.value && "bg-blue-100"
                      )}
                    >
                      <span className="text-sm">{option.label}</span>
                      {value === option.value && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default SelectWithSearch;
