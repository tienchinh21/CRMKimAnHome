import { useState, useCallback, useEffect } from "react";
import CoreEnumService from "@/services/api/CoreEnumService";
import { type FilterOption } from "@/components/common/Filter";

export interface CustomerFilters {
  search: string;
  sources: string;
  demand: string;
  pipeline: string;
}

export const useCustomerFilters = () => {
  const [filterSearch, setFilterSearch] = useState("");
  const [filterSources, setFilterSources] = useState("all");
  const [filterDemand, setFilterDemand] = useState("all");
  const [filterPipeline, setFilterPipeline] = useState("all");

  const [sourcesOptions, setSourcesOptions] = useState<FilterOption[]>([]);
  const [demandOptions, setDemandOptions] = useState<FilterOption[]>([]);
  const [pipelineOptions, setPipelineOptions] = useState<FilterOption[]>([]);

  const loadCoreEnumOptions = useCallback(async () => {
    try {
      const [sourcesRes, demandRes, pipelineRes] = await Promise.all([
        CoreEnumService.getByType("sources"),
        CoreEnumService.getByType("demand"),
        CoreEnumService.getByType("pipeline"),
      ]);

      setSourcesOptions([
        { value: "all", label: "Tất cả nguồn" },
        ...(sourcesRes.data || []).map((item: any) => ({
          value: item.id,
          label: item.name,
        })),
      ]);

      setDemandOptions([
        { value: "all", label: "Tất cả nhu cầu" },
        ...(demandRes.data || []).map((item: any) => ({
          value: item.id,
          label: item.name,
        })),
      ]);

      const pipelineOptionsData = [
        { value: "all", label: "Tất cả pipeline" },
        ...(pipelineRes.data || []).map((item: any) => ({
          value: item.id,
          label: item.name,
        })),
      ];

      setPipelineOptions(pipelineOptionsData);
    } catch (error) {
      console.error("Error loading core enum options:", error);
    }
  }, []);

  useEffect(() => {
    loadCoreEnumOptions();
  }, [loadCoreEnumOptions]);

  const resetFilters = useCallback(() => {
    setFilterSearch("");
    setFilterSources("all");
    setFilterDemand("all");
    setFilterPipeline("all");
  }, []);

  const getFilters = useCallback((): CustomerFilters => {
    return {
      search: filterSearch,
      sources: filterSources,
      demand: filterDemand,
      pipeline: filterPipeline,
    };
  }, [filterSearch, filterSources, filterDemand, filterPipeline]);

  const findIdByName = useCallback(
    (name: string, options: FilterOption[]) => {
      const found = options.find(
        (opt) => opt.label === name && opt.value !== "all"
      );
      return found?.value || "";
    },
    []
  );

  return {
    // State
    filterSearch,
    filterSources,
    filterDemand,
    filterPipeline,
    sourcesOptions,
    demandOptions,
    pipelineOptions,
    // Setters
    setFilterSearch,
    setFilterSources,
    setFilterDemand,
    setFilterPipeline,
    // Methods
    resetFilters,
    getFilters,
    findIdByName,
  };
};

