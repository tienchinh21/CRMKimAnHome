import { useState, useCallback } from "react";
import { toast } from "sonner";
import DealService, { type Deal } from "@/services/api/DealService";
import { type DealFilters } from "./useDealFilters";
import { type FilterOption } from "@/components/common/Filter";

export const useDealData = (statusOptions: FilterOption[]) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDeals = useCallback(
    async (search = "", filters: Partial<DealFilters> = {}) => {
      setLoading(true);
      try {
        // Build Spring Filter query
        let filterQuery = "";
        const filterParts = [];

        // Search filter - tìm theo tên khách hàng HOẶC số điện thoại
        if (search) {
          filterParts.push(
            `(customer.fullName ~ '*${search}*' or customer.phoneNumber ~ '*${search}*')`
          );
        }

        // Alias filter - tìm theo alias căn hộ
        if (filters.alias) {
          filterParts.push(`apartment.alias ~ '*${filters.alias}*'`);
        }

        // Status filter
        if (filters.status && filters.status !== "all") {
          const statusName = statusOptions.find(
            (opt) => opt.value === filters.status
          )?.label;
          if (statusName) {
            filterParts.push(`statusDeal.name : '${statusName}'`);
          }
        }

        // Join filter parts with 'and'
        if (filterParts.length > 0) {
          filterQuery = filterParts.join(" and ");
        }

        console.log("🔍 Filter Query:", filterQuery);

        // Call API with filter
        const response = await DealService.getAll(filterQuery || undefined);
        // @ts-ignore
        const dealsData = response.content?.response || [];

        setDeals(dealsData);
      } catch (error) {
        console.error("Error loading deals:", error);
        toast.error("Không thể tải danh sách giao dịch");
      } finally {
        setLoading(false);
      }
    },
    [statusOptions]
  );

  const updateDealStatus = useCallback(
    async (dealId: string, newStatusId: string) => {
      try {
        const deal = deals.find((d) => d.id === dealId);
        if (!deal) {
          toast.error("Không tìm thấy giao dịch");
          return false;
        }

        // Update deal with new status
        await DealService.update({
          id: dealId,
          apartmentId: deal.apartmentId,
          customerId: deal.customerId,
          statusDealId: newStatusId,
          userAssigneeId: deal.userAssigneeId,
          expectedRevenue: deal.expectedRevenue,
          actualRevenue: deal.actualRevenue,
        });

        // Update local state
        setDeals((prevDeals) =>
          prevDeals.map((d) => {
            if (d.id === dealId) {
              // Find status name from options
              const statusName = statusOptions.find(
                (opt) => opt.value === newStatusId
              )?.label;
              return {
                ...d,
                statusDealId: newStatusId,
                statusDealName: statusName || d.statusDealName,
              };
            }
            return d;
          })
        );

        toast.success("Cập nhật trạng thái thành công!");
        return true;
      } catch (error) {
        console.error("Error updating deal status:", error);
        toast.error("Không thể cập nhật trạng thái");
        return false;
      }
    },
    [deals, statusOptions]
  );

  return {
    // State
    deals,
    loading,
    // Methods
    loadDeals,
    updateDealStatus,
  };
};
