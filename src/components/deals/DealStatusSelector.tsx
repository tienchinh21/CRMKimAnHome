import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FilterOption } from "@/components/common/Filter";

interface DealStatusSelectorProps {
  dealId: string;
  statusId?: string;
  statusName?: string;
  statusOptions: FilterOption[];
  onStatusChange: (dealId: string, newStatusId: string) => void;
  isUpdating: boolean;
}

const DealStatusSelector: React.FC<DealStatusSelectorProps> = React.memo(
  ({
    dealId,
    statusId,
    statusName,
    statusOptions,
    onStatusChange,
    isUpdating,
  }) => {
    // Find status ID from name if ID is missing
    const currentStatusId = useMemo(() => {
      if (statusId) return statusId;
      if (statusName) {
        const foundOption = statusOptions.find(
          (opt) => opt.label === statusName
        );
        return foundOption?.value || "";
      }
      return "";
    }, [statusId, statusName, statusOptions]);

    const filteredOptions = useMemo(
      () => statusOptions.filter((option) => option.value !== "all"),
      [statusOptions]
    );

    return (
      <Select
        value={currentStatusId || ""}
        onValueChange={(value) => {
          onStatusChange(dealId, value);
        }}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[160px] h-8">
          {isUpdating ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              Đang lưu...
            </span>
          ) : (
            <SelectValue placeholder="Chọn trạng thái" />
          )}
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

DealStatusSelector.displayName = "DealStatusSelector";

export default DealStatusSelector;

