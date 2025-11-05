import { useState, useCallback, useEffect } from "react";
import CoreEnumService from "@/services/api/CoreEnumService";
import { type FilterOption } from "@/components/common/Filter";

export interface DealFilters {
  search: string;
  status: string;
  alias: string;
}

export const useDealFilters = () => {
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAlias, setFilterAlias] = useState("");
  const [statusOptions, setStatusOptions] = useState<FilterOption[]>([]);

  // Load status options from CoreEnum
  const loadStatusOptions = useCallback(async () => {
    try {
      const response = await CoreEnumService.getByType("statusDeal");
      const options = response.data || [];

      const statusOptionsData: FilterOption[] = [
        { value: "all", label: "Tất cả trạng thái" },
        ...options.map((option) => ({
          value: option.id,
          label: option.name,
        })),
      ];

      setStatusOptions(statusOptionsData);
    } catch (error) {
      console.error("Error loading status options:", error);
    }
  }, []);

  useEffect(() => {
    loadStatusOptions();
  }, [loadStatusOptions]);

  const resetFilters = useCallback(() => {
    setFilterSearch("");
    setFilterStatus("all");
    setFilterAlias("");
  }, []);

  const getFilters = useCallback((): DealFilters => {
    return {
      search: filterSearch,
      status: filterStatus,
      alias: filterAlias,
    };
  }, [filterSearch, filterStatus, filterAlias]);

  const findIdByName = useCallback((name: string, options: FilterOption[]) => {
    const found = options.find(
      (opt) => opt.label === name && opt.value !== "all"
    );
    return found?.value || "";
  }, []);

  return {
    // State
    filterSearch,
    filterStatus,
    filterAlias,
    statusOptions,
    // Setters
    setFilterSearch,
    setFilterStatus,
    setFilterAlias,
    // Methods
    resetFilters,
    getFilters,
    findIdByName,
  };
};
