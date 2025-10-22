import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SalaryAdvanceService, { type SalaryAdvance } from "@/services/api/SalaryAdvanceService";
import { formatCurrency } from "@/utils/format";

const salaryAdvanceSchema = z.object({
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
  expectedRepaymentDate: z.date({
    message: "Vui lòng chọn ngày dự kiến hoàn trả",
  }),
  note: z.string().optional(),
});

type SalaryAdvanceFormData = z.infer<typeof salaryAdvanceSchema>;

interface SalaryAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  salaryAdvance?: SalaryAdvance | null;
}

const SalaryAdvanceModal: React.FC<SalaryAdvanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  salaryAdvance,
}) => {
  const [loading, setLoading] = useState(false);
  const [amountDisplay, setAmountDisplay] = useState("");

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SalaryAdvanceFormData>({
    resolver: zodResolver(salaryAdvanceSchema),
    defaultValues: {
      amount: 0,
      expectedRepaymentDate: new Date(),
      note: "",
    },
  });

  const watchedExpectedRepaymentDate = watch("expectedRepaymentDate");

  useEffect(() => {
    if (isOpen) {
      if (salaryAdvance) {
        setValue("amount", salaryAdvance.amount);
        
        // Parse date safely
        const dateStr = salaryAdvance.expectedRepaymentDate;
        let parsedDate = new Date();
        if (dateStr) {
          // Handle both ISO format and date-only format (YYYY-MM-DD)
          if (dateStr.includes('T')) {
            parsedDate = new Date(dateStr);
          } else {
            // For date-only format, append time to avoid timezone issues
            parsedDate = new Date(dateStr + 'T00:00:00');
          }
          // Validate parsed date
          if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date();
          }
        }
        setValue("expectedRepaymentDate", parsedDate);
        setValue("note", salaryAdvance.note || "");
        setAmountDisplay(formatCurrency(salaryAdvance.amount));
      } else {
        reset();
        setAmountDisplay("");
      }
    }
  }, [isOpen, salaryAdvance, reset, setValue]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/[^\d]/g, "");

    if (cleanValue === "") {
      setAmountDisplay("");
      setValue("amount", 0);
      return;
    }

    const numericValue = parseInt(cleanValue, 10);
    setAmountDisplay(formatCurrency(numericValue));
    setValue("amount", numericValue);
  };

  const onSubmit = async (data: SalaryAdvanceFormData) => {
    setLoading(true);
    try {
      if (salaryAdvance) {
        await SalaryAdvanceService.update(salaryAdvance.id, {
          amount: data.amount,
          expectedRepaymentDate: format(data.expectedRepaymentDate, "yyyy-MM-dd"),
          note: data.note,
        });
        toast.success("Cập nhật tạm ứng lương thành công");
      } else {
        await SalaryAdvanceService.create({
          amount: data.amount,
          expectedRepaymentDate: format(data.expectedRepaymentDate, "yyyy-MM-dd"),
          note: data.note,
        });
        toast.success("Tạo yêu cầu tạm ứng lương thành công");
      }
      onSave();
    } catch (error) {
      console.error("Save salary advance error:", error);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || "Không thể lưu tạm ứng lương");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {salaryAdvance ? "Cập nhật Tạm Ứng Lương" : "Tạo Yêu Cầu Tạm Ứng Lương"}
          </DialogTitle>
          <DialogDescription>
            {salaryAdvance
              ? "Cập nhật thông tin tạm ứng lương"
              : "Điền thông tin để tạo yêu cầu tạm ứng lương"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Số tiền tạm ứng (VNĐ) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="Nhập số tiền"
              value={amountDisplay}
              onChange={handleAmountChange}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Expected Repayment Date */}
          <div className="space-y-2">
            <Label>
              Ngày dự kiến hoàn trả <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchedExpectedRepaymentDate && "text-muted-foreground",
                    errors.expectedRepaymentDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedExpectedRepaymentDate
                    ? format(watchedExpectedRepaymentDate, "dd/MM/yyyy")
                    : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedExpectedRepaymentDate}
                  onSelect={(date) => date && setValue("expectedRepaymentDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.expectedRepaymentDate && (
              <p className="text-sm text-red-500">
                {errors.expectedRepaymentDate.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              placeholder="Nhập ghi chú (tùy chọn)"
              value={watch("note")}
              onChange={(e) => setValue("note", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : salaryAdvance ? "Cập nhật" : "Tạo yêu cầu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryAdvanceModal;
