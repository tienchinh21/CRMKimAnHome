import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, User, Building2, DollarSign, Edit } from "lucide-react";
import { type Deal } from "@/services/api/DealService";
import DealModal from "@/components/deals/DealModal";
import DealStatusSelector from "@/components/deals/DealStatusSelector";
import DealPaymentModal from "@/components/deals/DealPaymentModal";
import Filter from "@/components/common/Filter";
import { useDealFilters } from "@/hooks/useDealFilters";
import { useDealData } from "@/hooks/useDealData";
import Breadcrumb from "@/components/common/breadcrumb";

const DealList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDealForPayment, setSelectedDealForPayment] =
    useState<Deal | null>(null);
  const [updatingStatusDealId, setUpdatingStatusDealId] = useState<
    string | null
  >(null);

  // Use custom hooks
  const filters = useDealFilters();
  const dealData = useDealData(filters.statusOptions);

  // Load deals on mount
  useEffect(() => {
    if (filters.statusOptions.length > 0) {
      dealData.loadDeals(filters.filterSearch, filters.getFilters());
    }
  }, [filters.statusOptions.length]);

  // Auto-apply filters with debounce
  useEffect(() => {
    if (filters.statusOptions.length > 0) {
      const timeoutId = setTimeout(() => {
        dealData.loadDeals(filters.filterSearch, filters.getFilters());
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.filterSearch, filters.filterStatus]);

  // Handle create
  const handleCreate = useCallback(() => {
    setEditingDeal(null);
    setIsModalOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((deal: Deal) => {
    setEditingDeal(deal);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingDeal(null);
  }, []);

  // Handle modal save
  const handleModalSave = useCallback(() => {
    handleModalClose();
    dealData.loadDeals(filters.filterSearch, filters.getFilters());
    toast.success(
      editingDeal
        ? "Cập nhật giao dịch thành công!"
        : "Tạo giao dịch thành công!"
    );
  }, [editingDeal, handleModalClose, dealData, filters]);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    filters.resetFilters();
    dealData.loadDeals("", { search: "", status: "all" });
  }, [filters, dealData]);

  // Handle filter apply
  const handleFilterApply = useCallback(() => {
    dealData.loadDeals(filters.filterSearch, filters.getFilters());
  }, [filters, dealData]);

  // Handle status update
  const handleStatusUpdate = useCallback(
    async (dealId: string, newStatusId: string) => {
      setUpdatingStatusDealId(dealId);
      try {
        await dealData.updateDealStatus(dealId, newStatusId);
      } finally {
        setUpdatingStatusDealId(null);
      }
    },
    [dealData]
  );

  // Handle open payment modal
  const handleOpenPayment = useCallback((deal: Deal) => {
    setSelectedDealForPayment(deal);
    setIsPaymentModalOpen(true);
  }, []);

  // Handle close payment modal
  const handleClosePayment = useCallback(() => {
    setIsPaymentModalOpen(false);
    setSelectedDealForPayment(null);
  }, []);

  // Handle payment save
  const handlePaymentSave = useCallback(() => {
    handleClosePayment();
    dealData.loadDeals(filters.filterSearch, filters.getFilters());
  }, [handleClosePayment, dealData, filters]);

  // Check if deal status is "Hoàn tất"
  const isCompletedStatus = useCallback((statusName: string) => {
    return statusName === "Hoàn tất" || statusName === "Hoàn Tất";
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumb />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Giao dịch
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý tất cả các giao dịch bất động sản
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo giao dịch mới
        </Button>
      </div>

      {/* Filter Component */}
      <Filter
        config={{
          search: {
            placeholder: "Tìm kiếm theo tên khách hàng hoặc số điện thoại...",
            value: filters.filterSearch,
            onChange: filters.setFilterSearch,
          },
          status: {
            options: filters.statusOptions,
            value: filters.filterStatus,
            onChange: filters.setFilterStatus,
          },
        }}
        onReset={handleFilterReset}
        onApply={handleFilterApply}
        onRefresh={() =>
          dealData.loadDeals(filters.filterSearch, filters.getFilters())
        }
        loading={dealData.loading}
      />

      {/* Deals Table */}
      <Card>
        <CardContent>
          {dealData.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Căn hộ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Nhân viên phụ trách</TableHead>
                    <TableHead>Doanh thu dự kiến</TableHead>
                    <TableHead>Doanh thu thực tế</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealData.deals.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        Chưa có giao dịch nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    dealData.deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {deal.customerName || deal.customerId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {deal.customerPhone || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span>
                              {deal.apartmentName || deal.apartmentId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DealStatusSelector
                            dealId={deal.id}
                            statusId={deal.statusDealId}
                            statusName={deal.statusDealName}
                            statusOptions={filters.statusOptions}
                            onStatusChange={handleStatusUpdate}
                            isUpdating={updatingStatusDealId === deal.id}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {deal.userAssigneeName || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(deal.expectedRevenue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-blue-600">
                            {deal.actualRevenue
                              ? formatCurrency(deal.actualRevenue)
                              : "Chưa cập nhật"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {formatDate(deal.updatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(deal)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button> */}
                            {isCompletedStatus(deal.statusDealName || "") && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenPayment(deal)}
                                title="Chốt doanh thu"
                                className="text-white"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Chốt doanh thu
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        deal={editingDeal}
      />

      {/* Deal Payment Modal */}
      <DealPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        onSave={handlePaymentSave}
        deal={selectedDealForPayment}
      />
    </div>
  );
};

export default DealList;
