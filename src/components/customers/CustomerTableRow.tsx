import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Customer } from "@/services/api/CustomerService";
import { type FilterOption } from "@/components/common/Filter";
import PipelineSelector from "./PipelineSelector";
import UpcomingAppointments from "./UpcomingAppointments";
import CustomerActions from "./CustomerActions";

interface CustomerTableRowProps {
  customer: Customer;
  pipelineOptions: FilterOption[];
  updatingPipelineCustomerId: string | null;
  onPipelineUpdate: (customerId: string, newPipelineId: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onCreateAppointment: (customer: Customer) => void;
  onViewAppointments: (customer: Customer) => void;
  onCreateDeal: (customer: Customer) => void;
}

const CustomerTableRow: React.FC<CustomerTableRowProps> = React.memo(
  ({
    customer,
    pipelineOptions,
    updatingPipelineCustomerId,
    onPipelineUpdate,
    onEdit,
    onDelete,
    onCreateAppointment,
    onViewAppointments,
    onCreateDeal,
  }) => {
    return (
      <TableRow>
        <TableCell className="font-medium">{customer.fullName}</TableCell>

        <TableCell className="text-sm text-gray-600">
          {customer.phoneNumber}
        </TableCell>

        <TableCell>
          <Badge variant="secondary">{customer.sourcesName || "-"}</Badge>
        </TableCell>

        <TableCell>
          <Badge variant="outline">{customer.demandName || "-"}</Badge>
        </TableCell>

        <TableCell>
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            {customer.projectName || "-"}
          </Badge>
        </TableCell>

        <TableCell>
          <PipelineSelector
            customerId={customer.id}
            pipelineId={customer.pipelineId}
            pipelineName={customer.pipelineName}
            pipelineOptions={pipelineOptions}
            onPipelineChange={onPipelineUpdate}
            isUpdating={updatingPipelineCustomerId === customer.id}
          />
        </TableCell>

        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
          {customer.note || "-"}
        </TableCell>

        <TableCell className="min-w-[250px]">
          <UpcomingAppointments appointments={customer.upcomingAppointments} />
        </TableCell>

        <TableCell>
          <CustomerActions
            customer={customer}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreateAppointment={onCreateAppointment}
            onViewAppointments={onViewAppointments}
            onCreateDeal={onCreateDeal}
          />
        </TableCell>
      </TableRow>
    );
  }
);

CustomerTableRow.displayName = "CustomerTableRow";

export default CustomerTableRow;
