import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Edit2, Trash2, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DealService, {
  type Deal,
  type DealPayment,
  type UpdateDealPaymentRequest,
  type CreateDealPaymentRequest,
} from "@/services/api/DealService";
import { formatCurrency } from "@/utils/format";
import { usePermission } from "@/hooks/usePermission";

const paymentSchema = z.object({
  month: z.date({
    message: "Vui lòng chọn ngày",
  }),
  revenue: z.number().min(0, "Doanh thu phải lớn hơn 0"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface DealPaymentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  deal: Deal | null;
}

const DealPaymentListModal: React.FC<DealPaymentListModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  deal,
}) => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<DealPayment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revenueDisplay, setRevenueDisplay] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { isRole, can } = usePermission();
  const isLeader = isRole("LEADER");
  const isSale = isRole("SALE");
  const canEditPayment = can("deal_payment:update");
  const canDeletePayment = can("deal_payment:delete");
  const isReadOnly = isLeader || isSale;
  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      month: new Date(),
      revenue: 0,
    },
  });

  const watchedMonth = watch("month");

  // Load payments when modal opens
  useEffect(() => {
    if (isOpen && deal?.id) {
      setPayments(deal.dealPayments || []);
    } else {
      setPayments([]);
      setEditingId(null);
      setIsCreating(false);
    }
  }, [isOpen, deal?.id]);

  // Handle edit click (memoized)
  const handleEditClick = useCallback(
    (payment: DealPayment) => {
      setEditingId(payment.id);
      setValue("month", new Date(payment.month));
      setValue("revenue", payment.revenue);
      setRevenueDisplay(formatCurrency(payment.revenue));
      setIsCreating(false);
    },
    [setValue]
  );

  // Handle cancel edit (memoized)
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setIsCreating(false);
    reset();
    setRevenueDisplay("");
  }, [reset]);

  // Handle revenue input change (memoized)
  const handleRevenueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cleanValue = inputValue.replace(/[^\d]/g, "");

      if (cleanValue === "") {
        setRevenueDisplay("");
        setValue("revenue", 0);
        return;
      }

      const numericValue = parseInt(cleanValue, 10);
      setRevenueDisplay(formatCurrency(numericValue));
      setValue("revenue", numericValue);
    },
    [setValue]
  );

  // Handle save (memoized)
  const onSave = useCallback(
    async (data: PaymentFormData) => {
      if (!deal?.id) return;

      setLoading(true);
      try {
        const monthStr = format(data.month, "yyyy-MM-dd");

        if (isCreating) {
          const createData: CreateDealPaymentRequest = {
            dealId: deal.id,
            month: monthStr,
            revenue: data.revenue,
          };
          await DealService.createPayment(createData);
          toast.success("Tạo doanh thu thành công!");
        } else if (editingId) {
          const updateData: UpdateDealPaymentRequest = {
            id: editingId,
            dealId: deal.id,
            month: monthStr,
            revenue: data.revenue,
          };
          await DealService.updatePayment(updateData);
          toast.success("Cập nhật doanh thu thành công!");
        }

        setPayments(deal.dealPayments || []);
        handleCancelEdit();
        onUpdate?.();
      } catch (error: any) {
        console.error("Error saving payment:", error);
        toast.error(error.response?.data?.message || "Không thể lưu doanh thu");
      } finally {
        setLoading(false);
      }
    },
    [deal?.id, isCreating, editingId, handleCancelEdit]
  );

  // Handle delete payment (memoized)
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc muốn xóa doanh thu này?")) return;

      setLoading(true);
      try {
        await DealService.deletePayment(id);
        toast.success("Xóa doanh thu thành công!");
        setPayments(deal?.dealPayments || []);
        onUpdate?.();
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Không thể xóa doanh thu");
      } finally {
        setLoading(false);
      }
    },
    [deal?.dealPayments]
  );

  // Calculate total revenue (memoized)
  const totalRevenue = useMemo(
    () => payments.reduce((sum, p) => sum + p.revenue, 0),
    [payments]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Doanh Thu</DialogTitle>
          <DialogDescription>
            Danh sách các khoản doanh thu của giao dịch
          </DialogDescription>
        </DialogHeader>

        {deal && (
          <div className="space-y-4">
            {/* Deal Info */}
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Khách hàng:</span>
                <p className="font-medium">{deal.customerName || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Căn hộ:</span>
                <p className="font-medium">{deal.apartmentName || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  Doanh thu dự kiến:
                </span>
                <p className="font-semibold text-green-600">
                  {formatCurrency(deal.expectedRevenue)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  Tổng doanh thu thực tế:
                </span>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>

            {/* Add new payment button */}
            {/* {!isCreating && !editingId && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleCreateClick}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm doanh thu
                </Button>
              </div>
            )} */}

            {/* Payments Table */}
            <div className="border rounded-lg">
              {loading && !editingId && !isCreating ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày chốt</TableHead>
                      <TableHead>Doanh thu (VNĐ)</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Create new payment row */}
                    {isCreating && (
                      <TableRow>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  errors.month && "border-red-500"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {watchedMonth
                                  ? format(watchedMonth, "dd/MM/yyyy")
                                  : "Chọn ngày"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={watchedMonth}
                                onSelect={(date) =>
                                  date && setValue("month", date)
                                }
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={revenueDisplay}
                            onChange={handleRevenueChange}
                            placeholder="Nhập doanh thu"
                            className={errors.revenue ? "border-red-500" : ""}
                          />
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={handleSubmit(onSave)}
                              disabled={loading}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Existing payments */}
                    {payments.length === 0 && !isCreating ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          Chưa có doanh thu nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          {editingId === payment.id ? (
                            // Edit mode
                            <>
                              <TableCell>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className={cn(
                                        "justify-start text-left font-normal",
                                        errors.month && "border-red-500"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {watchedMonth
                                        ? format(watchedMonth, "dd/MM/yyyy")
                                        : "Chọn ngày"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={watchedMonth}
                                      onSelect={(date) =>
                                        date && setValue("month", date)
                                      }
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="text"
                                  value={revenueDisplay}
                                  onChange={handleRevenueChange}
                                  placeholder="Nhập doanh thu"
                                  className={
                                    errors.revenue ? "border-red-500" : ""
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {payment.createdAt
                                  ? format(
                                      new Date(payment.createdAt),
                                      "dd/MM/yyyy HH:mm:ss"
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {payment.updatedAt
                                  ? format(
                                      new Date(payment.updatedAt),
                                      "dd/MM/yyyy HH:mm:ss"
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleSubmit(onSave)}
                                    disabled={loading}
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            // View mode
                            <>
                              <TableCell>
                                {format(new Date(payment.month), "dd/MM/yyyy")}
                              </TableCell>
                              <TableCell className="font-semibold text-blue-600">
                                {formatCurrency(payment.revenue)}
                              </TableCell>
                              <TableCell>
                                {payment.createdAt
                                  ? format(
                                      new Date(payment.createdAt),
                                      "dd/MM/yyyy HH:mm:ss"
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {payment.updatedAt
                                  ? format(
                                      new Date(payment.updatedAt),
                                      "dd/MM/yyyy HH:mm:ss"
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {!isReadOnly && (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditClick(payment)}
                                      disabled={!!editingId || isCreating}
                                      title="Chỉnh sửa"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(payment.id)}
                                      disabled={!!editingId || isCreating}
                                      title="Xóa"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Close button */}
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DealPaymentListModal;
