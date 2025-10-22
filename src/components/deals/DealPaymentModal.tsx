import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DealService, {
  type Deal,
  type CreateDealPaymentRequest,
} from "@/services/api/DealService";

const paymentSchema = z.object({
  month: z.date({
    message: "Vui lòng chọn ngày",
  }),
  revenue: z.number().min(0, "Doanh thu phải lớn hơn 0"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface DealPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  deal: Deal | null;
}

const DealPaymentModal: React.FC<DealPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  deal,
}) => {
  const [loading, setLoading] = useState(false);
  const [revenueInput, setRevenueInput] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      month: new Date(),
      revenue: deal?.expectedRevenue || 0,
    },
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen && deal) {
      setValue("month", new Date());
      setValue("revenue", deal.expectedRevenue);
      setRevenueInput(formatNumberWithCommas(deal.expectedRevenue));
    }
  }, [isOpen, deal, setValue]);

  // Format number with commas
  const formatNumberWithCommas = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle revenue input change
  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = value === "" ? 0 : Number(value);
      setRevenueInput(value === "" ? "" : formatNumberWithCommas(numValue));
      setValue("revenue", numValue);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!deal) {
      toast.error("Không tìm thấy thông tin giao dịch");
      return;
    }

    setLoading(true);
    try {
      // Format month to YYYY-MM
      const monthStr = format(data.month, "yyyy-MM-dd");

      const paymentData: CreateDealPaymentRequest = {
        dealId: deal.id,
        month: monthStr,
        revenue: data.revenue,
      };

      await DealService.createPayment(paymentData);
      toast.success("Tạo doanh thu thành công!");
      reset();
      setRevenueInput("");
      onSave();
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast.error(error.response?.data?.message || "Không thể tạo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo Doanh Thu</DialogTitle>
          <DialogDescription>
            Xác nhận doanh thu thực tế cho giao dịch này
          </DialogDescription>
        </DialogHeader>

        {deal && (
          <div className="space-y-4 py-4">
            {/* Deal Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Khách hàng:</span>
                <span className="text-sm font-medium">
                  {deal.customerName || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Căn hộ:</span>
                <span className="text-sm font-medium">
                  {deal.apartmentName || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Doanh thu dự kiến:
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(deal.expectedRevenue)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Month - Calendar Picker */}
              <div className="space-y-2">
                <Label>Tháng chốt *</Label>
                <Controller
                  control={control}
                  name="month"
                  render={({ field }) => {
                    const [open, setOpen] = React.useState(false);
                    return (
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              errors.month && "border-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn tháng</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setOpen(false);
                              }
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.month && (
                  <p className="text-sm text-red-600">
                    {errors.month.message as string}
                  </p>
                )}
              </div>

              {/* Revenue - Formatted Input */}
              <div className="space-y-2">
                <Label htmlFor="revenue">Doanh thu thực tế (VNĐ) *</Label>
                <Input
                  id="revenue"
                  type="text"
                  value={revenueInput}
                  onChange={handleRevenueChange}
                  className={errors.revenue ? "border-red-500" : ""}
                  placeholder="Nhập doanh thu thực tế"
                />
                {errors.revenue && (
                  <p className="text-sm text-red-600">
                    {errors.revenue.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : "Xác nhận chốt"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DealPaymentModal;
