import React from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Calendar,
  ListChecks,
  HandCoins,
} from "lucide-react";
import { type Customer } from "@/services/api/CustomerService";

interface CustomerActionsProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onCreateAppointment: (customer: Customer) => void;
  onViewAppointments: (customer: Customer) => void;
  onCreateDeal: (customer: Customer) => void;
}

const CustomerActions: React.FC<CustomerActionsProps> = React.memo(
  ({
    customer,
    onEdit,
    onDelete,
    onCreateAppointment,
    onViewAppointments,
    onCreateDeal,
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {/* Deal Button - Only show if pipeline is "Đàm phán" */}
        {customer.pipelineName === "Đàm phán" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateDeal(customer)}
            className="text-green-600 hover:text-green-700"
            title="Tạo Deal"
          >
            <HandCoins className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewAppointments(customer)}
          className="text-purple-600 hover:text-purple-700"
          title="Xem lịch hẹn"
        >
          <ListChecks className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCreateAppointment(customer)}
          className="text-blue-600 hover:text-blue-700"
          title="Tạo lịch hẹn"
        >
          <Calendar className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(customer)}
          title="Chỉnh sửa"
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(customer)}
          className="text-red-600 hover:text-red-700"
          title="Xóa"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

CustomerActions.displayName = "CustomerActions";

export default CustomerActions;

