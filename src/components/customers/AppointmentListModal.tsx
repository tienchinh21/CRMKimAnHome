import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomerAppointmentService, {
  type CustomerAppointment,
} from "@/services/api/CustomerAppointmentService";
import type { Customer } from "@/services/api/CustomerService";
import { toast } from "sonner";
import { Calendar, Clock, Edit, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import AppointmentModal from "./AppointmentModal";

interface AppointmentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onAppointmentChange?: () => void; // Callback to refresh customer list
}

const AppointmentListModal: React.FC<AppointmentListModalProps> = ({
  isOpen,
  onClose,
  customer,
  onAppointmentChange,
}) => {
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<CustomerAppointment | null>(null);

  // Load appointments when modal opens
  useEffect(() => {
    if (isOpen && customer) {
      loadAppointments();
    }
  }, [isOpen, customer]);

  const loadAppointments = async () => {
    if (!customer) return;

    setLoading(true);
    try {
      const response = await CustomerAppointmentService.getAll(customer.id);
      // Handle different response structures
      const appointmentList =
        response.content?.response || response.content || [];
      setAppointments(Array.isArray(appointmentList) ? appointmentList : []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Không thể tải danh sách lịch hẹn");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAppointment(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (appointment: CustomerAppointment) => {
    setEditingAppointment(appointment);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (appointment: CustomerAppointment) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa lịch hẹn này?\n\nThời gian: ${formatDateTime(
          appointment.time
        )}\nGhi chú: ${appointment.note}`
      )
    ) {
      return;
    }

    try {
      await CustomerAppointmentService.delete(appointment.id);
      toast.success("Xóa lịch hẹn thành công");
      loadAppointments();
      // Refresh customer list to update upcoming appointments
      onAppointmentChange?.();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Không thể xóa lịch hẹn");
    }
  };

  const handleAppointmentSave = () => {
    setIsCreateModalOpen(false);
    setEditingAppointment(null);
    loadAppointments();
    // Refresh customer list to update upcoming appointments
    onAppointmentChange?.();
  };

  const handleAppointmentClose = () => {
    setIsCreateModalOpen(false);
    setEditingAppointment(null);
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm");
    } catch (error) {
      return "";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Danh sách lịch hẹn
            </DialogTitle>
            {customer && (
              <p className="text-sm text-gray-500 mt-1">
                Khách hàng: {customer.fullName} - {customer.phoneNumber}
              </p>
            )}
          </DialogHeader>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Tổng số lịch hẹn:{" "}
                <span className="font-semibold">{appointments.length}</span>
              </p>
              <Button
                onClick={handleCreate}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tạo lịch hẹn mới
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có lịch hẹn nào</p>
                <Button
                  onClick={handleCreate}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Tạo lịch hẹn đầu tiên
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Ngày hẹn</TableHead>
                      <TableHead className="w-[100px]">Giờ hẹn</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="w-[120px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            {formatDate(appointment.time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            {formatTime(appointment.time)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-2">{appointment.note}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(appointment)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(appointment)}
                              className="text-red-600 hover:text-red-700"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t mt-4">
            <Button onClick={onClose} variant="outline">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Appointment Modal */}
      <AppointmentModal
        isOpen={isCreateModalOpen}
        onClose={handleAppointmentClose}
        onSave={handleAppointmentSave}
        customer={customer}
        appointment={editingAppointment}
      />
    </>
  );
};

export default AppointmentListModal;
