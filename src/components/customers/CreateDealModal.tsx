import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DealService, {
  type CreateDealRequest,
} from "@/services/api/DealService";
import ApartmentService from "@/services/api/ApartmentService";
import type { Customer } from "@/services/api/CustomerService";
import { toast } from "sonner";
import { Home, DollarSign } from "lucide-react";

// Validation schema
const dealSchema = z.object({
  apartmentId: z.string().min(1, "Vui lòng chọn căn hộ"),
  expectedRevenue: z
    .number()
    .min(1, "Số tiền phải lớn hơn 0")
    .max(999999999999, "Số tiền quá lớn"),
});

type DealFormData = z.infer<typeof dealSchema>;

interface Apartment {
  id: string;
  name: string;
  projectName?: string;
  projectId?: string;
  price?: number;
}

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  customer: Customer | null;
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customer,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      apartmentId: "",
      expectedRevenue: 0,
    },
  });

  const watchedApartmentId = watch("apartmentId");

  // Load apartments when modal opens or customer changes
  useEffect(() => {
    if (isOpen && customer) {
      loadApartments();
    }
  }, [isOpen, customer?.projectId]);

  // Auto-fill price when apartment is selected
  useEffect(() => {
    if (watchedApartmentId) {
      const selectedApartment = apartments.find(
        (apt) => apt.id === watchedApartmentId
      );
      if (selectedApartment && selectedApartment.price) {
        setValue("expectedRevenue", selectedApartment.price);
      }
    }
  }, [watchedApartmentId, apartments, setValue]);

  const loadApartments = async () => {
    setLoadingApartments(true);
    try {
      let response;

      // If customer has projectId, filter apartments by project
      if (customer?.projectId) {
        response = await ApartmentService.getByProjectId(customer.projectId, {
          page: 0,
          size: 100,
        });
      } else {
        response = await ApartmentService.getAll({
          pageable: { page: 0, size: 100 }, // Get first 100 apartments
        });
      }

      // Extract apartment data from response
      const apartmentData =
        response.data?.content?.response ||
        response.data?.response ||
        response.data?.content ||
        [];

      setApartments(Array.isArray(apartmentData) ? apartmentData : []);
    } catch (error) {
      console.error("Error loading apartments:", error);
      toast.error("Không thể tải danh sách căn hộ");
      setApartments([]);
    } finally {
      setLoadingApartments(false);
    }
  };

  // Format number with thousand separators
  const formatMoney = (value: number): string => {
    return value.toLocaleString("vi-VN");
  };

  // Parse formatted money string back to number
  const parseMoney = (value: string): number => {
    return parseInt(value.replace(/\./g, "")) || 0;
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        apartmentId: "",
        expectedRevenue: 0,
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: DealFormData) => {
    if (!customer) {
      toast.error("Không tìm thấy thông tin khách hàng");
      return;
    }

    setIsSubmitting(true);

    try {
      const dealData: CreateDealRequest = {
        apartmentId: data.apartmentId,
        customerId: customer.id,
        expectedRevenue: data.expectedRevenue,
      };

      await DealService.create(dealData);

      toast.success("Tạo deal thành công", {
        description: `Deal cho ${customer.fullName} đã được tạo`,
      });

      reset();
      onSave();
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error("Không thể tạo deal", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Tạo Deal mới
          </DialogTitle>
          {customer && (
            <div className="space-y-1 mt-1">
              <p className="text-sm text-gray-500">
                Khách hàng: {customer.fullName} - {customer.phoneNumber}
              </p>
              {customer.projectName && (
                <p className="text-sm text-blue-600 font-medium">
                  Dự án: {customer.projectName}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Apartment Selection */}
          <div className="space-y-2">
            <Label htmlFor="apartmentId" className="flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-600" />
              Chọn căn hộ
            </Label>
            <Controller
              name="apartmentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loadingApartments}
                >
                  <SelectTrigger
                    className={errors.apartmentId ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        loadingApartments ? "Đang tải..." : "Chọn căn hộ"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {apartments.map((apartment) => (
                      <SelectItem key={apartment.id} value={apartment.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{apartment.name}</span>
                          {apartment.projectName && (
                            <span className="text-xs text-gray-500">
                              {apartment.projectName}
                            </span>
                          )}
                          {apartment.price && (
                            <span className="text-xs text-green-600">
                              {formatMoney(apartment.price)} VNĐ
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.apartmentId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.apartmentId.message}
              </p>
            )}
          </div>

          {/* Expected Revenue */}
          <div className="space-y-2">
            <Label
              htmlFor="expectedRevenue"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4 text-green-600" />
              Số tiền dự kiến (VNĐ)
            </Label>
            <Controller
              name="expectedRevenue"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  value={field.value ? formatMoney(field.value) : ""}
                  onChange={(e) => {
                    const numericValue = parseMoney(e.target.value);
                    field.onChange(numericValue);
                  }}
                  placeholder="VD: 2.500.000.000"
                  className={errors.expectedRevenue ? "border-red-500" : ""}
                />
              )}
            />
            {errors.expectedRevenue && (
              <p className="text-sm text-red-500 mt-1">
                {errors.expectedRevenue.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDealModal;
