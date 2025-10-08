import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { type Customer } from "@/services/api/CustomerService";
import CustomerModal from "@/components/customers/CustomerModal";
import AppointmentModal from "@/components/customers/AppointmentModal";
import AppointmentListModal from "@/components/customers/AppointmentListModal";
import CreateDealModal from "@/components/customers/CreateDealModal";
import CustomerTableRow from "@/components/customers/CustomerTableRow";
import Filter from "@/components/common/Filter";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/common/Pagination";
import { useCustomerFilters } from "@/hooks/useCustomerFilters";
import { useCustomerData } from "@/hooks/useCustomerData";
import CustomerService from "@/services/api/CustomerService";
import Breadcrumb from "@/components/common/breadcrumb";

const CustomerList: React.FC = () => {
  // Use custom hooks
  const filters = useCustomerFilters();
  const customerData = useCustomerData(
    filters.sourcesOptions,
    filters.demandOptions,
    filters.pipelineOptions
  );

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Appointment modal state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedCustomerForAppointment, setSelectedCustomerForAppointment] =
    useState<Customer | null>(null);

  // Appointment list modal state
  const [isAppointmentListModalOpen, setIsAppointmentListModalOpen] =
    useState(false);
  const [selectedCustomerForList, setSelectedCustomerForList] =
    useState<Customer | null>(null);

  // Deal modal state
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedCustomerForDeal, setSelectedCustomerForDeal] =
    useState<Customer | null>(null);

  // Pipeline updating state for loading indicator
  const [updatingPipelineCustomerId, setUpdatingPipelineCustomerId] = useState<
    string | null
  >(null);

  // Load customers on mount and when filters change
  useEffect(() => {
    customerData.loadCustomers(
      customerData.currentPage,
      filters.filterSearch,
      filters.getFilters()
    );
  }, [customerData.currentPage, customerData.itemsPerPage]);

  // Auto-apply filters when they change (with debounce)
  useEffect(() => {
    if (
      filters.sourcesOptions.length > 0 &&
      filters.demandOptions.length > 0 &&
      filters.pipelineOptions.length > 0
    ) {
      const timeoutId = setTimeout(() => {
        customerData.loadCustomers(
          1,
          filters.filterSearch,
          filters.getFilters()
        );
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [filters.filterSources, filters.filterDemand, filters.filterPipeline]);

  // Handle filter apply
  const handleFilterApply = useCallback(() => {
    customerData.setCurrentPage(1);
    customerData.loadCustomers(1, filters.filterSearch, filters.getFilters());
  }, [customerData, filters]);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    filters.resetFilters();
    customerData.setCurrentPage(1);
    customerData.loadCustomers(1, "", {});
  }, [filters, customerData]);

  // Handle create customer
  const handleCreate = useCallback(() => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  }, []);

  // Handle edit customer
  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }, []);

  // Handle delete customer
  const handleDelete = useCallback(
    async (customer: Customer) => {
      const deleted = await customerData.deleteCustomer(
        customer.id,
        customer.fullName
      );
      if (deleted) {
        customerData.loadCustomers(
          customerData.currentPage,
          filters.filterSearch,
          filters.getFilters()
        );
      }
    },
    [customerData, filters]
  );

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  }, []);

  // Handle modal save
  const handleModalSave = useCallback(() => {
    customerData.loadCustomers(
      customerData.currentPage,
      filters.filterSearch,
      filters.getFilters()
    );
    handleModalClose();
  }, [customerData, filters, handleModalClose]);

  // Handle open appointment modal
  const handleOpenAppointment = useCallback((customer: Customer) => {
    setSelectedCustomerForAppointment(customer);
    setIsAppointmentModalOpen(true);
  }, []);

  // Handle close appointment modal
  const handleCloseAppointment = useCallback(() => {
    setIsAppointmentModalOpen(false);
    setSelectedCustomerForAppointment(null);
  }, []);

  // Handle appointment save
  const handleAppointmentSave = useCallback(() => {
    handleCloseAppointment();
    // Refresh customer list to update upcoming appointments
    customerData.loadCustomers(
      customerData.currentPage,
      filters.filterSearch,
      filters.getFilters()
    );
  }, [handleCloseAppointment, customerData, filters]);

  // Handle open appointment list modal
  const handleOpenAppointmentList = useCallback((customer: Customer) => {
    setSelectedCustomerForList(customer);
    setIsAppointmentListModalOpen(true);
  }, []);

  // Handle close appointment list modal
  const handleCloseAppointmentList = useCallback(() => {
    setIsAppointmentListModalOpen(false);
    setSelectedCustomerForList(null);
  }, []);

  // Handle open deal modal
  const handleOpenDeal = useCallback((customer: Customer) => {
    setSelectedCustomerForDeal(customer);
    setIsDealModalOpen(true);
  }, []);

  // Handle close deal modal
  const handleCloseDeal = useCallback(() => {
    setIsDealModalOpen(false);
    setSelectedCustomerForDeal(null);
  }, []);

  // Handle deal save
  const handleDealSave = useCallback(() => {
    handleCloseDeal();
    toast.success("Deal đã được tạo thành công!");
  }, [handleCloseDeal]);

  // Handle pipeline update
  const handlePipelineUpdate = useCallback(
    async (customerId: string, newPipelineId: string) => {
      // Don't update if same value
      const customer = customerData.customers.find((c) => c.id === customerId);
      if (!customer) {
        console.error("❌ Customer not found:", customerId);
        return;
      }

      if (customer.pipelineId === newPipelineId) {
        console.log("⏭️ Same pipeline selected, skipping update");
        return;
      }

      setUpdatingPipelineCustomerId(customerId);

      try {
        const updateData = {
          id: customerId,
          fullName: customer.fullName,
          phoneNumber: customer.phoneNumber,
          sourcesId:
            customer.sourcesId ||
            filters.findIdByName(
              customer.sourcesName || "",
              filters.sourcesOptions
            ),
          demandId:
            customer.demandId ||
            filters.findIdByName(
              customer.demandName || "",
              filters.demandOptions
            ),
          projectId: customer.projectId || "",
          pipelineId: newPipelineId,
          note: customer.note || "",
        };

        await CustomerService.update(updateData);
        toast.success("Cập nhật pipeline thành công");

        // Add small delay to ensure server has processed the update
        setTimeout(() => {
          customerData.loadCustomers(
            customerData.currentPage,
            filters.filterSearch,
            filters.getFilters()
          );
        }, 500);
      } catch (error) {
        console.error("❌ Error updating pipeline:", error);
        toast.error("Không thể cập nhật pipeline");
      } finally {
        setUpdatingPipelineCustomerId(null);
      }
    },
    [customerData, filters]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumb />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Khách hàng
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin khách hàng và pipeline
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm khách hàng</span>
        </Button>
      </div>

      {/* Filter Component */}
      <Filter
        config={{
          search: {
            placeholder: "Tìm kiếm theo tên hoặc số điện thoại...",
            value: filters.filterSearch,
            onChange: filters.setFilterSearch,
          },
          status: {
            options: filters.sourcesOptions,
            value: filters.filterSources,
            onChange: filters.setFilterSources,
          },
          type: {
            options: filters.demandOptions,
            value: filters.filterDemand,
            onChange: filters.setFilterDemand,
          },
          location: {
            options: filters.pipelineOptions,
            value: filters.filterPipeline,
            onChange: filters.setFilterPipeline,
          },
        }}
        onReset={handleFilterReset}
        onApply={handleFilterApply}
        onRefresh={() =>
          customerData.loadCustomers(
            customerData.currentPage,
            filters.filterSearch,
            filters.getFilters()
          )
        }
        loading={customerData.loading}
      />

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {customerData.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khách hàng</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Nhu cầu</TableHead>
                    <TableHead>Dự án</TableHead>
                    <TableHead>Pipeline</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Lịch hẹn sắp tới</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData.customers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerData.customers.map((customer) => (
                      <CustomerTableRow
                        key={customer.id}
                        customer={customer}
                        pipelineOptions={filters.pipelineOptions}
                        updatingPipelineCustomerId={updatingPipelineCustomerId}
                        onPipelineUpdate={handlePipelineUpdate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCreateAppointment={handleOpenAppointment}
                        onViewAppointments={handleOpenAppointmentList}
                        onCreateDeal={handleOpenDeal}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={customerData.currentPage}
            totalPages={customerData.totalPages}
            totalItems={customerData.totalElements}
            itemsPerPage={customerData.itemsPerPage}
            onPageChange={customerData.setCurrentPage}
            onItemsPerPageChange={customerData.setItemsPerPage}
            showItemsPerPage={true}
            showInfo={true}
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        customer={editingCustomer}
      />

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointment}
        onSave={handleAppointmentSave}
        customer={selectedCustomerForAppointment}
      />

      {/* Appointment List Modal */}
      <AppointmentListModal
        isOpen={isAppointmentListModalOpen}
        onClose={handleCloseAppointmentList}
        customer={selectedCustomerForList}
        onAppointmentChange={() =>
          customerData.loadCustomers(
            customerData.currentPage,
            filters.filterSearch,
            filters.getFilters()
          )
        }
      />

      {/* Create Deal Modal */}
      <CreateDealModal
        isOpen={isDealModalOpen}
        onClose={handleCloseDeal}
        onSave={handleDealSave}
        customer={selectedCustomerForDeal}
      />
    </div>
  );
};

export default CustomerList;
