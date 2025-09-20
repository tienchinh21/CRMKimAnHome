import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter as FilterIcon, RotateCcw, RefreshCw } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  search?: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
  };
  status?: {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  };
  type?: {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  };
  location?: {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  };
  priceRange?: {
    min: string;
    max: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
  };
}

interface FilterProps {
  config: FilterConfig;
  onReset: () => void;
  className?: string;
  showActiveFilters?: boolean;
  onApply?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const Filter: React.FC<FilterProps> = ({
  config,
  onReset,
  className = "",
  showActiveFilters = true,
  onApply,
  onRefresh,
  loading = false,
}) => {
  const hasActiveFilters = () => {
    return (
      (config.search?.value && config.search.value.trim() !== "") ||
      (config.status?.value && config.status.value !== "all") ||
      (config.type?.value && config.type.value !== "all") ||
      (config.location?.value && config.location.value !== "all") ||
      (config.priceRange?.min && config.priceRange.min !== "") ||
      (config.priceRange?.max && config.priceRange.max !== "")
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (config.search?.value && config.search.value.trim() !== "") count++;
    if (config.status?.value && config.status.value !== "all") count++;
    if (config.type?.value && config.type.value !== "all") count++;
    if (config.location?.value && config.location.value !== "all") count++;
    if (config.priceRange?.min && config.priceRange.min !== "") count++;
    if (config.priceRange?.max && config.priceRange.max !== "") count++;
    return count;
  };

  return (
    <Card className={`border-0 bg-white shadow-sm rounded-xl ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FilterIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
              <p className="text-sm text-gray-500">Tìm kiếm và lọc dữ liệu</p>
            </div>
            {showActiveFilters && getActiveFiltersCount() > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-blue-100 text-blue-800"
              >
                {getActiveFiltersCount()} bộ lọc
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Đang tải..." : "Làm mới"}
              </Button>
            )}
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            )}
            {onApply && (
              <Button
                size="sm"
                onClick={onApply}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Áp dụng
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {/* Search */}
          {config.search && (
            <div className="lg:col-span-2">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Tìm kiếm
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder={config.search.placeholder}
                  value={config.search.value}
                  onChange={(e) => config.search!.onChange(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          {config.status && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Trạng thái
              </Label>
              <Select
                value={config.status.value}
                onValueChange={config.status.onChange}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {config.status.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type Filter */}
          {config.type && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Loại
              </Label>
              <Select
                value={config.type.value}
                onValueChange={config.type.onChange}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {config.type.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location Filter */}
          {config.location && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Vị trí
              </Label>
              <Select
                value={config.location.value}
                onValueChange={config.location.onChange}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn vị trí" />
                </SelectTrigger>
                <SelectContent>
                  {config.location.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Range */}
          {config.priceRange && (
            <div className="lg:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Khoảng giá (VNĐ)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="text"
                    placeholder="Từ"
                    value={config.priceRange.min}
                    onChange={(e) =>
                      config.priceRange!.onMinChange(e.target.value)
                    }
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Đến"
                    value={config.priceRange.max}
                    onChange={(e) =>
                      config.priceRange!.onMaxChange(e.target.value)
                    }
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Filter;
