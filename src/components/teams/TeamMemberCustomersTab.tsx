import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/common/Pagination";
import { formatDateTime } from "@/utils/format";
import type { TeamMember, TeamMemberCustomer } from "@/types";

interface TeamMemberCustomersTabProps {
  selectedMember: TeamMember | null;
  allCustomers?: TeamMemberCustomer[];
}

const TeamMemberCustomersTab: React.FC<TeamMemberCustomersTabProps> = ({
  selectedMember,
  allCustomers = [],
}) => {
  const [customers, setCustomers] = useState<TeamMemberCustomer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Filter customers when member is selected (no API call)
  useEffect(() => {
    if (selectedMember && allCustomers.length > 0) {
      // Filter customers for selected member from allCustomers
      const memberCustomers = allCustomers.filter(
        (customer) => customer.userAssigneeName === selectedMember.fullName
      );

      setCustomers(memberCustomers);
      // Calculate total pages (10 items per page)
      setTotalPages(Math.ceil(memberCustomers.length / 10));
      setCurrentPage(1);
    } else {
      setCustomers([]);
      setTotalPages(0);
    }
  }, [selectedMember, allCustomers]);

  if (!selectedMember) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Chọn một thành viên để xem khách hàng của họ
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Khách hàng của {selectedMember.fullName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">
                    Tên khách hàng
                  </TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">
                    Nguồn
                  </TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">
                    Nhu cầu
                  </TableHead>
                  <TableHead className="min-w-[150px] text-gray-700 font-semibold">
                    Dự án
                  </TableHead>
                  <TableHead className="min-w-[120px] text-gray-700 font-semibold">
                    Pipeline
                  </TableHead>
                  <TableHead className="min-w-[100px] text-gray-700 font-semibold">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      Không có khách hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {customer.fullName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                          {customer.sourcesName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                          {customer.demandName}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {customer.projectName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                          {customer.pipelineName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            customer.isDeal
                              ? "text-green-700 bg-green-50"
                              : "text-amber-700 bg-amber-50"
                          }`}
                        >
                          {customer.isDeal ? "Deal" : "Tiềm năng"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {customers.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={customers.length}
                itemsPerPage={10}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      {selectedMember && customers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              Lịch hẹn mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customers.some((c) => c.upcomingAppointments?.length > 0) ? (
              <div className="space-y-3">
                {customers
                  .filter((c) => c.upcomingAppointments?.length > 0)
                  .map((customer) =>
                    customer.upcomingAppointments.map(
                      (appointment: any, idx: number) => (
                        <div
                          key={`${customer.id}-${idx}`}
                          className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg mx-3"
                        >
                          <div className="flex-1 mb-2">
                            <p className="font-medium text-gray-900">
                              {customer.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.title || "Cuộc hẹn"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {appointment.note}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {appointment.time
                                ? formatDateTime(appointment.time)
                                : "Chưa xác định thời gian"}
                            </p>
                          </div>
                        </div>
                      )
                    )
                  )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Không có lịch hẹn sắp mới
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamMemberCustomersTab;
