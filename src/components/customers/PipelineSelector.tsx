import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FilterOption } from "@/components/common/Filter";

interface PipelineSelectorProps {
  customerId: string;
  pipelineId?: string;
  pipelineName?: string;
  pipelineOptions: FilterOption[];
  onPipelineChange: (customerId: string, newPipelineId: string) => void;
  isUpdating: boolean;
}

const PipelineSelector: React.FC<PipelineSelectorProps> = React.memo(
  ({
    customerId,
    pipelineId,
    pipelineName,
    pipelineOptions,
    onPipelineChange,
    isUpdating,
  }) => {
    // Find pipeline ID from name if ID is missing
    const currentPipelineId = useMemo(() => {
      if (pipelineId) return pipelineId;
      if (pipelineName) {
        const foundOption = pipelineOptions.find(
          (opt) => opt.label === pipelineName
        );
        return foundOption?.value || "";
      }
      return "";
    }, [pipelineId, pipelineName, pipelineOptions]);

    const filteredOptions = useMemo(
      () => pipelineOptions.filter((option) => option.value !== "all"),
      [pipelineOptions]
    );

    return (
      <Select
        value={currentPipelineId}
        onValueChange={(value) => onPipelineChange(customerId, value)}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[140px] h-8">
          {isUpdating ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              Đang lưu...
            </span>
          ) : (
            <SelectValue placeholder="Chọn pipeline" />
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

PipelineSelector.displayName = "PipelineSelector";

export default PipelineSelector;

