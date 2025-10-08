import { useState, useCallback } from "react";
import CustomerService, { type Customer } from "@/services/api/CustomerService";
import { toast } from "sonner";
import { type FilterOption } from "@/components/common/Filter";
import { type CustomerFilters } from "./useCustomerFilters";

export const useCustomerData = (
  sourcesOptions: FilterOption[],
  demandOptions: FilterOption[],
  pipelineOptions: FilterOption[]
) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadCustomers = useCallback(
    async (page = 1, search = "", filters: Partial<CustomerFilters> = {}) => {
      setLoading(true);
      try {
        let filterQuery = "";
        const filterParts = [];

        if (search) {
          filterParts.push(
            `fullName ~ '*${search}*' or phoneNumber ~ '*${search}*'`
          );
        }

        if (filters.sources && filters.sources !== "all") {
          const sourceName = sourcesOptions.find(
            (opt) => opt.value === filters.sources
          )?.label;
          if (sourceName) {
            filterParts.push(`sources.name : '${sourceName}'`);
          }
        }

        if (filters.demand && filters.demand !== "all") {
          const demandName = demandOptions.find(
            (opt) => opt.value === filters.demand
          )?.label;
          if (demandName) {
            filterParts.push(`demand.name : '${demandName}'`);
          }
        }

        if (filters.pipeline && filters.pipeline !== "all") {
          const pipelineName = pipelineOptions.find(
            (opt) => opt.value === filters.pipeline
          )?.label;
          if (pipelineName) {
            filterParts.push(`pipeline.name : '${pipelineName}'`);
          }
        }

        if (filterParts.length > 0) {
          filterQuery = filterParts.join(" and ");
        }

        const response = await CustomerService.getAll({
          page: page - 1,
          size: itemsPerPage,
          filter: filterQuery,
        });

        if (response.content) {
          // @ts-ignore
          const customerData = response.content.response || [];
          setCustomers(customerData);
          setTotalPages(response.content.totalPages || 0);
          setTotalElements(response.content.totalElements || 0);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
        toast.error("Không thể tải danh sách khách hàng");
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, sourcesOptions, demandOptions, pipelineOptions]
  );

  const deleteCustomer = useCallback(
    async (customerId: string, customerName: string) => {
      if (
        window.confirm(
          `Bạn có chắc chắn muốn xóa khách hàng "${customerName}"?`
        )
      ) {
        try {
          await CustomerService.delete(customerId);
          toast.success("Xóa khách hàng thành công");
          return true;
        } catch (error) {
          console.error("Error deleting customer:", error);
          toast.error("Không thể xóa khách hàng");
          return false;
        }
      }
      return false;
    },
    []
  );

  return {
    // State
    customers,
    loading,
    currentPage,
    totalPages,
    totalElements,
    itemsPerPage,
    // Setters
    setCurrentPage,
    setItemsPerPage,
    // Methods
    loadCustomers,
    deleteCustomer,
  };
};
