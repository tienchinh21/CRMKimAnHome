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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, User, Building2, Eye } from "lucide-react";
import { type Deal } from "@/services/api/DealService";
import DealModal from "@/components/deals/DealModal";
import DealStatusSelector from "@/components/deals/DealStatusSelector";
import DealPaymentModal from "@/components/deals/DealPaymentModal";
import DealPaymentListModal from "@/components/deals/DealPaymentListModal";
import Filter from "@/components/common/Filter";
import { useDealFilters } from "@/hooks/useDealFilters";
import { useDealData } from "@/hooks/useDealData";
import Breadcrumb from "@/components/common/breadcrumb";
import { formatDateTime } from "@/utils/format";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/rbac/permissions";

const DealList: React.FC = () => {
  const { can } = usePermission();
  const canCreatePayment = can(PERMISSIONS.DEAL_PAYMENT_CREATE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDealForPayment, setSelectedDealForPayment] =
    useState<Deal | null>(null);
  const [isPaymentListModalOpen, setIsPaymentListModalOpen] = useState(false);
  const [selectedDealForList, setSelectedDealForList] = useState<Deal | null>(
    null
  );
  const [updatingStatusDealId, setUpdatingStatusDealId] = useState<
    string | null
  >(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    dealId: string;
    newStatusId: string;
    newStatusName: string;
  } | null>(null);

  const filters = useDealFilters();
  const dealData = useDealData(filters.statusOptions);

  useEffect(() => {
    if (filters.statusOptions.length > 0) {
      dealData.loadDeals(filters.filterSearch, filters.getFilters());
    }
  }, [filters.statusOptions.length]);

  useEffect(() => {
    if (filters.statusOptions.length > 0) {
      const timeoutId = setTimeout(() => {
        dealData.loadDeals(filters.filterSearch, filters.getFilters());
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.filterSearch, filters.filterStatus, filters.filterAlias]);

  const handleCreate = useCallback(() => {
    setEditingDeal(null);
    setIsModalOpen(true);
  }, []);

  const handleViewDetail = useCallback((deal: Deal) => {
    setSelectedDealForList(deal);
    setIsPaymentListModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingDeal(null);
  }, []);

  const handleModalSave = useCallback(() => {
    handleModalClose();
    dealData.loadDeals(filters.filterSearch, filters.getFilters());
    toast.success(
      editingDeal
        ? "Cập nhật giao dịch thành công!"
        : "Tạo giao dịch thành công!"
    );
  }, [editingDeal, handleModalClose, dealData, filters]);

  const handleFilterReset = useCallback(() => {
    filters.resetFilters();
    dealData.loadDeals("", { search: "", status: "all" });
  }, [filters, dealData]);

  const handleFilterApply = useCallback(() => {
    dealData.loadDeals(filters.filterSearch, filters.getFilters());
  }, [filters, dealData]);

  const handleStatusUpdate = useCallback(
    async (dealId: string, newStatusId: string) => {
      // Tìm deal hiện tại
      const deal = dealData.deals.find((d) => d.id === dealId);
      if (!deal) return;

      // Kiểm tra nếu deal đã ở trạng thái "Đã kí hợp đồng" hoặc "Huỷ giao dịch"
      const currentStatus = deal.statusDealName || "";
      if (
        currentStatus === "Đã kí hợp đồng" ||
        currentStatus === "Huỷ giao dịch"
      ) {
        toast.error(
          `Không thể cập nhật trạng thái khi giao dịch đã "${currentStatus}"`
        );
        return;
      }

      // Tìm tên trạng thái mới
      const newStatusName =
        filters.statusOptions.find((opt) => opt.value === newStatusId)?.label ||
        "";

      // Hiển thị confirm dialog
      setPendingStatusUpdate({ dealId, newStatusId, newStatusName });
      setConfirmDialogOpen(true);
    },
    [dealData.deals, filters.statusOptions]
  );

  const handleConfirmStatusUpdate = useCallback(async () => {
    if (!pendingStatusUpdate) return;

    setUpdatingStatusDealId(pendingStatusUpdate.dealId);
    setConfirmDialogOpen(false);

    try {
      await dealData.updateDealStatus(
        pendingStatusUpdate.dealId,
        pendingStatusUpdate.newStatusId
      );
    } finally {
      setUpdatingStatusDealId(null);
      setPendingStatusUpdate(null);
    }
  }, [pendingStatusUpdate, dealData]);

  const handleCancelStatusUpdate = useCallback(() => {
    setConfirmDialogOpen(false);
    setPendingStatusUpdate(null);
  }, []);

  const handleOpenPayment = useCallback((deal: Deal) => {
    setSelectedDealForPayment(deal);
    setIsPaymentModalOpen(true);
  }, []);

  const handleClosePayment = useCallback(() => {
    setIsPaymentModalOpen(false);
    setSelectedDealForPayment(null);
  }, []);

  const handlePaymentSave = useCallback(() => {
    handleClosePayment();
    dealData.loadDeals(filters.filterSearch, filters.getFilters());
  }, [handleClosePayment, dealData, filters]);

  const handleClosePaymentList = useCallback(() => {
    setIsPaymentListModalOpen(false);
    setSelectedDealForList(null);
  }, []);

  const handlePaymentListUpdate = useCallback(() => {
    dealData.loadDeals(filters.filterSearch, filters.getFilters());
  }, [dealData, filters]);

  const isCompletedStatus = useCallback((statusName: string) => {
    return statusName === "Đã kí hợp đồng" || statusName === "Đã kí hợp đồng";
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Quản lý Giao dịch
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Quản lý tất cả các giao dịch bất động sản
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Tạo giao dịch mới</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tìm kiếm khách hàng
                </label>
                <Input
                  placeholder="Tìm theo tên hoặc số điện thoại..."
                  value={filters.filterSearch}
                  onChange={(e) => filters.setFilterSearch(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tìm kiếm theo alias căn hộ
                </label>
                <Input
                  placeholder="Nhập alias căn hộ..."
                  value={filters.filterAlias}
                  onChange={(e) => filters.setFilterAlias(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <Filter
                config={{
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardContent className="">
          {dealData.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Khách hàng</TableHead>
                    <TableHead className="min-w-[110px] hidden md:table-cell">
                      Số điện thoại
                    </TableHead>
                    <TableHead className="min-w-[120px]">Căn hộ</TableHead>
                    <TableHead className="min-w-[150px] hidden md:table-cell">
                      Alias
                    </TableHead>
                    <TableHead className="min-w-[130px] hidden lg:table-cell">
                      Trạng thái
                    </TableHead>
                    <TableHead className="min-w-[140px] hidden xl:table-cell">
                      Nhân viên phụ trách
                    </TableHead>
                    <TableHead className="min-w-[130px]">
                      Doanh thu DK
                    </TableHead>
                    <TableHead className="min-w-[130px] hidden lg:table-cell">
                      Doanh thu TT
                    </TableHead>
                    <TableHead className="min-w-[100px] hidden xl:table-cell">
                      Cập nhật
                    </TableHead>
                    <TableHead className="min-w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealData.deals.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-gray-500"
                      >
                        Chưa có giao dịch nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    dealData.deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                              <span className="font-medium text-sm md:text-base">
                                {deal.customerName || deal.customerId}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 md:hidden">
                              {deal.customerPhone || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-gray-600">
                            {deal.customerPhone || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                            <span className="text-sm">
                              {deal.apartmentName || deal.apartmentId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-gray-600 font-mono">
                            {deal.apartmentAlias || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <DealStatusSelector
                            dealId={deal.id}
                            statusId={deal.statusDealId}
                            statusName={deal.statusDealName}
                            statusOptions={filters.statusOptions}
                            onStatusChange={handleStatusUpdate}
                            isUpdating={updatingStatusDealId === deal.id}
                          />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className="text-sm text-gray-600">
                            {deal.userAssigneeName || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600 text-sm whitespace-nowrap">
                            {formatCurrency(deal.expectedRevenue)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="font-semibold text-blue-600 text-sm whitespace-nowrap">
                            {deal.actualRevenue
                              ? formatCurrency(deal.actualRevenue)
                              : "Chưa cập nhật"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {deal.updatedAt
                              ? formatDateTime(deal.updatedAt)
                              : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(deal)}
                              title="Xem chi tiết doanh thu"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            {isCompletedStatus(deal.statusDealName || "") &&
                              canCreatePayment && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenPayment(deal)}
                                  title="Tạo doanh thu"
                                  disabled={deal.statusDealName === "Hoàn tất"}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
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

      <DealModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        deal={editingDeal}
      />

      <DealPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        onSave={handlePaymentSave}
        deal={selectedDealForPayment}
      />

      <DealPaymentListModal
        isOpen={isPaymentListModalOpen}
        onClose={handleClosePaymentList}
        onUpdate={handlePaymentListUpdate}
        deal={selectedDealForList}
      />

      {/* Confirm Status Update Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận cập nhật trạng thái</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn cập nhật trạng thái giao dịch sang{" "}
              <span className="font-semibold text-gray-900">
                "{pendingStatusUpdate?.newStatusName}"
              </span>
              ?
              {(pendingStatusUpdate?.newStatusName === "Đã kí hợp đồng" ||
                pendingStatusUpdate?.newStatusName === "Huỷ giao dịch") && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Lưu ý: Sau khi cập nhật sang trạng thái này, bạn sẽ không
                    thể thay đổi trạng thái nữa.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelStatusUpdate}>
              Hủy
            </Button>
            <Button onClick={handleConfirmStatusUpdate}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealList;
