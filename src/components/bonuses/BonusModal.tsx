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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import BonusService from "@/services/api/BonusService";
import UserService from "@/services/api/UserService";
import type { Bonus, CreateBonusRequest, UpdateBonusRequest } from "@/types/bonus";
import type { UserResponse } from "@/types";
import { formatCurrency } from "@/utils/format";

const bonusSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên lương thưởng"),
  amount: z.number().min(0, "Số tiền phải lớn hơn hoặc bằng 0"),
  startDate: z.date({
    message: "Vui lòng chọn ngày bắt đầu",
  }),
  endDate: z.date({
    message: "Vui lòng chọn ngày kết thúc",
  }),
  userId: z.string().min(1, "Vui lòng chọn nhân viên"),
});

type BonusFormData = z.infer<typeof bonusSchema>;

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  bonus?: Bonus | null;
}

const BonusModal: React.FC<BonusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bonus,
}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [amountDisplay, setAmountDisplay] = useState("");

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BonusFormData>({
    resolver: zodResolver(bonusSchema),
    defaultValues: {
      name: "",
      amount: 0,
      startDate: new Date(),
      endDate: new Date(),
      userId: "",
    },
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");

  // Load users
  const loadUsers = async () => {
    try {
      const response = await UserService.getAll({
        pageable: { page: 0, size: 1000 },
      });
      const usersData =
        response.data?.content?.response ||
        response.data?.response ||
        response.data?.content ||
        [];
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Không thể tải danh sách nhân viên");
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();

      if (bonus) {
        setValue("name", bonus.name);
        setValue("amount", bonus.amount);
        setValue("startDate", new Date(bonus.startDate));
        setValue("endDate", new Date(bonus.endDate));
        setValue("userId", bonus.userId);
        setAmountDisplay(formatCurrency(bonus.amount));
      } else {
        reset();
        setAmountDisplay("");
      }
    }
  }, [isOpen, bonus, reset, setValue]);

  // Handle amount input change
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

  const onSubmit = async (data: BonusFormData) => {
    setLoading(true);
    try {
      if (bonus) {
        const updateData: UpdateBonusRequest = {
          id: bonus.id,
          name: data.name,
          amount: data.amount,
          startDate: format(data.startDate, "yyyy-MM-dd"),
          endDate: format(data.endDate, "yyyy-MM-dd"),
          userId: data.userId,
        };
        await BonusService.update(updateData);
      } else {
        const createData: CreateBonusRequest = {
          name: data.name,
          amount: data.amount,
          startDate: format(data.startDate, "yyyy-MM-dd"),
          endDate: format(data.endDate, "yyyy-MM-dd"),
          userId: data.userId,
        };
        await BonusService.create(createData);
      }
      onSave();
    } catch (error: any) {
      console.error("Save bonus error:", error);
      toast.error(error.response?.data?.message || "Không thể lưu lương thưởng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {bonus ? "Cập nhật Lương Thưởng" : "Tạo Lương Thưởng mới"}
          </DialogTitle>
          <DialogDescription>
            {bonus
              ? "Cập nhật thông tin lương thưởng"
              : "Điền thông tin để tạo lương thưởng mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên lương thưởng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Thưởng tháng 1, Lương tháng 12..."
              value={watch("name")}
              onChange={(e) => setValue("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Số tiền (VNĐ) <span className="text-red-500">*</span>
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

          {/* Date Range */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedStartDate && "text-muted-foreground",
                      errors.startDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedStartDate
                      ? format(watchedStartDate, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedStartDate}
                    onSelect={(date) => date && setValue("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Ngày kết thúc <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedEndDate && "text-muted-foreground",
                      errors.endDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedEndDate
                      ? format(watchedEndDate, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedEndDate}
                    onSelect={(date) => date && setValue("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
            </div>
            
            {/* Date Range Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Lưu ý:</span> Vui lòng nhập ngày bắt đầu là <span className="font-semibold">đầu tháng</span> (VD: 01/01/2025) 
                và ngày kết thúc là <span className="font-semibold">cuối tháng</span> (VD: 31/01/2025)
              </p>
            </div>
          </div>

          {/* User */}
          <div className="space-y-2">
            <Label htmlFor="userId">
              Nhân viên <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("userId")}
              onValueChange={(value) => setValue("userId", value)}
            >
              <SelectTrigger
                className={errors.userId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && (
              <p className="text-sm text-red-500">{errors.userId.message}</p>
            )}
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
              {loading ? "Đang lưu..." : bonus ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BonusModal;
