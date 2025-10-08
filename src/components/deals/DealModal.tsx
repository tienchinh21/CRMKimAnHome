import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DealService, {
  type Deal,
  type CreateDealRequest,
  type UpdateDealRequest,
} from "@/services/api/DealService";
import CustomerService, { type Customer } from "@/services/api/CustomerService";
import ApartmentService, {
  type Apartment,
} from "@/services/api/ApartmentService";
import CoreEnumService, { type CoreEnum } from "@/services/api/CoreEnumService";
import UserService, { type User } from "@/services/api/UserService";

const dealSchema = z.object({
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  apartmentId: z.string().min(1, "Vui lòng chọn căn hộ"),
  statusDealId: z.string().optional(),
  userAssignedId: z.string().optional(),
  expectedRevenue: z.number().min(0, "Doanh thu phải lớn hơn 0"),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  deal?: Deal | null;
}

const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  deal,
}) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [statusOptions, setStatusOptions] = useState<CoreEnum[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      customerId: "",
      apartmentId: "",
      statusDealId: "",
      userAssignedId: "",
      expectedRevenue: 0,
    },
  });

  const watchedValues = watch();

  // Load customers
  const loadCustomers = async () => {
    try {
      const response = await CustomerService.getAll({ page: 0, size: 10 });
      // @ts-ignore
      setCustomers(response.content?.response || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Không thể tải danh sách khách hàng");
    }
  };

  // Load apartments
  const loadApartments = async () => {
    try {
      const response = await ApartmentService.getAll({
        pageable: { page: 0, size: 1000 },
      });
      const apartmentsData =
        response.data?.content?.response ||
        response.data?.response ||
        response.data?.content ||
        [];
      setApartments(apartmentsData);
    } catch (error) {
      console.error("Error loading apartments:", error);
      toast.error("Không thể tải danh sách căn hộ");
    }
  };

  // Load status options
  const loadStatusOptions = async () => {
    try {
      const response = await CoreEnumService.getByType("statusDeal");
      setStatusOptions(response.data || []);
    } catch (error) {
      console.error("Error loading status options:", error);
    }
  };

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
      loadCustomers();
      loadApartments();
      loadStatusOptions();
      loadUsers();
    }
  }, [isOpen]);

  // Load deal data for editing
  useEffect(() => {
    if (deal) {
      setValue("customerId", deal.customerId);
      setValue("apartmentId", deal.apartmentId);
      setValue("statusDealId", deal.statusDealId || "");
      setValue("userAssignedId", deal.userAssignedId || "");
      setValue("expectedRevenue", deal.expectedRevenue);
    } else {
      reset();
    }
  }, [deal, setValue, reset]);

  const onSubmit = async (data: DealFormData) => {
    setLoading(true);
    try {
      if (deal) {
        // Update existing deal
        const updateData: UpdateDealRequest = {
          id: deal.id,
          customerId: data.customerId,
          apartmentId: data.apartmentId,
          statusDealId: data.statusDealId || "",
          userAssignedId: data.userAssignedId || "",
          expectedRevenue: data.expectedRevenue,
        };
        await DealService.update(updateData);
      } else {
        // Create new deal
        const createData: CreateDealRequest = {
          customerId: data.customerId,
          apartmentId: data.apartmentId,
          expectedRevenue: data.expectedRevenue,
        };
        await DealService.create(createData);
      }
      onSave();
    } catch (error: any) {
      console.error("Error saving deal:", error);
      toast.error(
        error.response?.data?.message ||
          `Không thể ${deal ? "cập nhật" : "tạo"} giao dịch`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {deal ? "Chỉnh sửa Giao dịch" : "Tạo Giao dịch mới"}
          </DialogTitle>
          <DialogDescription>
            {deal
              ? "Cập nhật thông tin giao dịch"
              : "Nhập thông tin để tạo giao dịch mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer */}
          <div className="space-y-2">
            <Label htmlFor="customerId">Khách hàng *</Label>
            <Select
              value={watchedValues.customerId}
              onValueChange={(value) => setValue("customerId", value)}
            >
              <SelectTrigger
                className={errors.customerId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.fullName} - {customer.phoneNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-sm text-red-600">
                {errors.customerId.message}
              </p>
            )}
          </div>

          {/* Apartment */}
          <div className="space-y-2">
            <Label htmlFor="apartmentId">Căn hộ *</Label>
            <Select
              value={watchedValues.apartmentId}
              onValueChange={(value) => setValue("apartmentId", value)}
            >
              <SelectTrigger
                className={errors.apartmentId ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Chọn căn hộ" />
              </SelectTrigger>
              <SelectContent>
                {apartments.map((apartment) => (
                  <SelectItem key={apartment.id} value={apartment.id}>
                    {apartment.name} - {apartment.projectName || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.apartmentId && (
              <p className="text-sm text-red-600">
                {errors.apartmentId.message}
              </p>
            )}
          </div>

          {/* Expected Revenue */}
          <div className="space-y-2">
            <Label htmlFor="expectedRevenue">Doanh thu dự kiến (VNĐ) *</Label>
            <Input
              id="expectedRevenue"
              type="number"
              {...register("expectedRevenue", { valueAsNumber: true })}
              className={errors.expectedRevenue ? "border-red-500" : ""}
              placeholder="Nhập doanh thu dự kiến"
            />
            {errors.expectedRevenue && (
              <p className="text-sm text-red-600">
                {errors.expectedRevenue.message}
              </p>
            )}
          </div>

          {/* Status (only for edit) */}
          {deal && (
            <div className="space-y-2">
              <Label htmlFor="statusDealId">Trạng thái</Label>
              <Select
                value={watchedValues.statusDealId}
                onValueChange={(value) => setValue("statusDealId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assigned User (only for edit) */}
          {deal && (
            <div className="space-y-2">
              <Label htmlFor="userAssignedId">Nhân viên phụ trách</Label>
              <Select
                value={watchedValues.userAssignedId}
                onValueChange={(value) => setValue("userAssignedId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : deal ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DealModal;
