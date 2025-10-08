import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import CustomerAppointmentService, {
  type CustomerAppointment,
} from "@/services/api/CustomerAppointmentService";
import type { Customer } from "@/services/api/CustomerService";
import { toast } from "sonner";
import { Calendar, Clock, FileText } from "lucide-react";

// Validation schema
const appointmentSchema = z.object({
  appointmentDate: z
    .string()
    .min(1, "Ngày hẹn là bắt buộc")
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: "Ngày hẹn phải từ hôm nay trở đi" }
    ),
  appointmentTime: z
    .string()
    .min(1, "Giờ hẹn là bắt buộc")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Giờ không hợp lệ"),
  note: z
    .string()
    .min(10, "Ghi chú phải có ít nhất 10 ký tự")
    .max(500, "Ghi chú không được quá 500 ký tự"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  customer: Customer | null;
  appointment?: CustomerAppointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customer,
  appointment,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!appointment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentDate: "",
      appointmentTime: "",
      note: "",
    },
  });

  // Reset form when modal opens or appointment changes
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        // Edit mode: pre-fill with appointment data
        const appointmentDate = new Date(appointment.time);
        reset({
          appointmentDate: appointmentDate.toISOString().split("T")[0],
          appointmentTime: appointmentDate.toTimeString().slice(0, 5),
          note: appointment.note,
        });
      } else {
        // Create mode: set default values
        const today = new Date().toISOString().split("T")[0];
        const oneHourLater = new Date();
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        const defaultTime = oneHourLater.toTimeString().slice(0, 5);

        reset({
          appointmentDate: today,
          appointmentTime: defaultTime,
          note: "",
        });
      }
    }
  }, [isOpen, appointment, reset]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!customer) {
      toast.error("Không tìm thấy thông tin khách hàng");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into ISO string
      const combinedDateTime = new Date(
        `${data.appointmentDate}T${data.appointmentTime}`
      );
      const isoString = combinedDateTime.toISOString();

      const appointmentData = {
        time: isoString,
        customerId: customer.id,
        note: data.note,
      };

      if (isEditMode && appointment) {
        // Update existing appointment
        await CustomerAppointmentService.update(
          appointment.id,
          appointmentData
        );
        toast.success("Cập nhật lịch hẹn thành công", {
          description: `Lịch hẹn cho ${customer.fullName} đã được cập nhật`,
        });
      } else {
        // Create new appointment
        await CustomerAppointmentService.create(appointmentData);
        toast.success("Tạo lịch hẹn thành công", {
          description: `Lịch hẹn cho ${customer.fullName} đã được tạo`,
        });
      }

      reset();
      onSave();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error(
        isEditMode ? "Không thể cập nhật lịch hẹn" : "Không thể tạo lịch hẹn",
        {
          description: "Vui lòng thử lại sau",
        }
      );
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
            {isEditMode ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn cho khách hàng"}
          </DialogTitle>
          {customer && (
            <p className="text-sm text-gray-500 mt-1">
              {customer.fullName} - {customer.phoneNumber}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label
              htmlFor="appointmentDate"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              Ngày hẹn
            </Label>
            <Input
              id="appointmentDate"
              type="date"
              {...register("appointmentDate")}
              className={errors.appointmentDate ? "border-red-500" : ""}
            />
            {errors.appointmentDate && (
              <p className="text-sm text-red-500 mt-1">
                {errors.appointmentDate.message}
              </p>
            )}
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label
              htmlFor="appointmentTime"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4 text-blue-600" />
              Giờ hẹn
            </Label>
            <Input
              id="appointmentTime"
              type="time"
              {...register("appointmentTime")}
              className={errors.appointmentTime ? "border-red-500" : ""}
            />
            {errors.appointmentTime && (
              <p className="text-sm text-red-500 mt-1">
                {errors.appointmentTime.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Ghi chú
            </Label>
            <Textarea
              id="note"
              {...register("note")}
              rows={4}
              placeholder="Nhập nội dung cuộc hẹn, yêu cầu của khách hàng..."
              className={errors.note ? "border-red-500" : ""}
            />
            {errors.note && (
              <p className="text-sm text-red-500 mt-1">{errors.note.message}</p>
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
              {isSubmitting
                ? "Đang lưu..."
                : isEditMode
                ? "Cập nhật lịch hẹn"
                : "Lưu lịch hẹn"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
