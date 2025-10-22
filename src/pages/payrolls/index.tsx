import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, RefreshCw, Pencil, Trash2, DollarSign } from "lucide-react";
import PayrollService, { type Payroll } from "@/services/api/PayrollService";
import SalaryAdvanceService, { type SalaryAdvance } from "@/services/api/SalaryAdvanceService";
import { formatCurrency } from "@/utils/format";
import Breadcrumb from "@/components/common/breadcrumb";
import SalaryAdvanceModal from "@/components/payrolls/SalaryAdvanceModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

const PayrollList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("");
  
  // Salary Advance states
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [advancesLoading, setAdvancesLoading] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<SalaryAdvance | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [advanceToDelete, setAdvanceToDelete] = useState<SalaryAdvance | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      if (filterMonth) {
        params.month = filterMonth;
      }

      const response = await PayrollService.getAll(params);
      const payrollsData = response.data.response;

      setPayrolls(payrollsData);
    } catch (error) {
      console.error("Error loading payrolls:", error);
      toast.error("Không thể tải bảng lương của bạn");
    } finally {
      setLoading(false);
    }
  }, [filterMonth]);

  const loadSalaryAdvances = useCallback(async (showLoading = true) => {
    if (showLoading) setAdvancesLoading(true);
    try {
      const response = await SalaryAdvanceService.getAll();
      const advancesData = response.data.response || response.data;
      setSalaryAdvances(Array.isArray(advancesData) ? advancesData : []);
    } catch (error) {
      console.error("Error loading salary advances:", error);
      toast.error("Không thể tải danh sách tạm ứng lương");
    } finally {
      if (showLoading) setAdvancesLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadPayrolls();
    loadSalaryAdvances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format month
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return "-";
    const [year, month] = monthStr.split("-");
    return `Tháng ${month}/${year}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  // Get status info
  const getStatusInfo = (status?: number | string) => {
    if (status === 1 || status === "APPROVED") {
      return { text: "Đã duyệt", class: "bg-green-100 text-green-800" };
    } else if (status === 2 || status === "REJECTED") {
      return { text: "Từ chối", class: "bg-red-100 text-red-800" };
    }
    return { text: "Chờ duyệt", class: "bg-yellow-100 text-yellow-800" };
  };

  // Salary Advance handlers
  const handleOpenAdvanceModal = () => {
    setSelectedAdvance(null);
    setIsAdvanceModalOpen(true);
  };

  const handleEditAdvance = (advance: SalaryAdvance) => {
    setSelectedAdvance(advance);
    setIsAdvanceModalOpen(true);
  };

  const handleCloseAdvanceModal = () => {
    setIsAdvanceModalOpen(false);
    setSelectedAdvance(null);
  };

  const handleSaveAdvance = async () => {
    handleCloseAdvanceModal();
    await loadSalaryAdvances(false); // Reload without showing loading
  };

  const handleDeleteClick = (advance: SalaryAdvance) => {
    setAdvanceToDelete(advance);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!advanceToDelete || deleteLoading) return;

    setDeleteLoading(true);
    try {
      await SalaryAdvanceService.delete(advanceToDelete.id);
      toast.success("Xóa tạm ứng lương thành công");
      await loadSalaryAdvances(false);
    } catch (error) {
      console.error("Error deleting salary advance:", error);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || "Không thể xóa tạm ứng lương");
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setAdvanceToDelete(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bảng Lương Của Tôi
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Xem chi tiết bảng lương và tạm ứng theo tháng
          </p>
        </div>
        <Button
          onClick={handleOpenAdvanceModal}
          className="w-full sm:w-auto"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Tạm ứng lương
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Month Filter */}
            <div className="flex-1 max-w-xs">
              <Input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                placeholder="Chọn tháng"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={loadPayrolls}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>

              {filterMonth && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFilterMonth("")}
                  className="flex-1 sm:flex-none"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payrolls Table */}
      <Card>
        <CardContent className="">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng</TableHead>
                    <TableHead colSpan={4} className="text-center bg-blue-50">
                      Bán
                    </TableHead>
                    <TableHead colSpan={4} className="text-center bg-purple-50">
                      Thuê
                    </TableHead>
                    <TableHead rowSpan={2}>Hỗ trợ</TableHead>
                    <TableHead rowSpan={2}>Nợ công ty</TableHead>
                    <TableHead rowSpan={2} className="font-bold">
                      Thu nhập cuối
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead className="text-xs bg-blue-50">
                      DT (DK)
                    </TableHead>
                    <TableHead className="text-xs bg-blue-50">
                      HH (DK)
                    </TableHead>
                    <TableHead className="text-xs bg-blue-50">
                      DT (TT)
                    </TableHead>

                    <TableHead className="text-xs bg-blue-50">
                      HH (TT)
                    </TableHead>
                    <TableHead className="text-xs bg-purple-50">
                      DT (DK)
                    </TableHead>
                    <TableHead className="text-xs bg-purple-50">
                      DT (TT)
                    </TableHead>
                    <TableHead className="text-xs bg-purple-50">
                      HH (DK)
                    </TableHead>
                    <TableHead className="text-xs bg-purple-50">
                      HH (TT)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="text-center py-8 text-gray-500"
                      >
                        Chưa có dữ liệu lương
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {formatMonth(payroll.month)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 text-sm">
                            {formatCurrency(payroll.expSaleRev)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 text-sm">
                            {formatCurrency(payroll.expSaleComm)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {formatCurrency(payroll.actSaleRev)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-green-600 font-medium">
                            {formatCurrency(payroll.actSaleComm)}
                          </span>
                        </TableCell>
                        {/* Rental Revenue & Commission */}
                        <TableCell>
                          <span className="text-gray-600 text-sm">
                            {formatCurrency(payroll.expRentalRev)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {formatCurrency(payroll.actRentalRev)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 text-sm">
                            {formatCurrency(payroll.expRentalComm)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-purple-600 font-medium">
                            {formatCurrency(payroll.actRentalComm)}
                          </span>
                        </TableCell>
                        {/* Support & Debt */}
                        <TableCell>
                          <span className="text-blue-600">
                            {payroll.supportAmount > 0
                              ? formatCurrency(payroll.supportAmount)
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600">
                            {payroll.companyDebtAmount
                              ? formatCurrency(payroll.companyDebtAmount)
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600 text-lg">
                              {formatCurrency(payroll.finalIncome)}
                            </span>
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

      {/* Salary Advances Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Lịch Sử Tạm Ứng Lương
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Danh sách các yêu cầu tạm ứng lương của bạn
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSalaryAdvances()}
              disabled={advancesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${advancesLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>

          {advancesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải danh sách tạm ứng...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngày hoàn trả dự kiến</TableHead>
                    <TableHead>Ngày hoàn trả</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryAdvances.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      Chưa có yêu cầu tạm ứng lương nào
                    </TableCell>
                  </TableRow>
                ) : (
                  salaryAdvances.map((advance) => {
                    const statusInfo = getStatusInfo(advance.status);
                    const isPending = advance.status === 0 || advance.status === "PENDING" || !advance.status;
                    
                    return (
                      <TableRow key={advance.id}>
                        <TableCell>
                          <span className="text-gray-600">
                            {formatDate(advance.createdAt || "")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(advance.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {formatDate(advance.expectedRepaymentDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-600">
                            {advance.salaryAdvance ? formatDate(advance.salaryAdvance) : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-600">
                              {advance.note || "-"}
                            </div>
                            {advance.rejectedReason && (
                              <div className="mt-1 text-red-600 italic">
                                Lý do từ chối: {advance.rejectedReason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}
                          >
                            {statusInfo.text}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAdvance(advance)}
                              disabled={!isPending}
                              title={!isPending ? "Chỉ có thể sửa đơn chờ duyệt" : "Sửa đơn tạm ứng"}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(advance)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={!isPending}
                              title={!isPending ? "Chỉ có thể xóa đơn chờ duyệt" : "Xóa đơn tạm ứng"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <SalaryAdvanceModal
        isOpen={isAdvanceModalOpen}
        onClose={handleCloseAdvanceModal}
        onSave={handleSaveAdvance}
        salaryAdvance={selectedAdvance}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Xóa tạm ứng lương"
        description="Bạn có chắc chắn muốn xóa yêu cầu tạm ứng lương này?"
        itemName={advanceToDelete ? formatCurrency(advanceToDelete.amount) : ""}
        warningMessage="Hành động này không thể hoàn tác."
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default PayrollList;
