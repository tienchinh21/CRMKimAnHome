import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Home, Eye, Trash2, Building2, Globe, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReponseApartmentDto } from "@/types";
import ApartmentService from "@/services/api/ApartmentService";
import Breadcrumb from "@/components/common/breadcrumb";
import DataTable, { type Column } from "@/components/common/DataTable";
import Filter from "@/components/common/Filter";
import Pagination from "@/components/common/Pagination";
import { formatCurrency } from "@/utils/format";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/rbac/permissions";

const ApartmentsList: React.FC = () => {
  const [apartments, setApartments] = useState<ReponseApartmentDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Permission checks
  const { can } = usePermission();
  const canCreate = can(PERMISSIONS.APARTMENT_CREATE);
  const canDelete = can(PERMISSIONS.APARTMENT_DELETE);

  // Filter states
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // sell vs rent
  const [publicFilter, setPublicFilter] = useState("all"); // public vs private

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadApartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApartmentService.getWithPagination(
        currentPage - 1, // API uses 0-based pagination
        itemsPerPage
      );

      // Handle pagination response
      if (
        response.data &&
        typeof response.data === "object" &&
        "info" in response.data
      ) {
        // PaginationResponse format
        const paginationData = response.data as any;
        setApartments(paginationData.response || []);
        setTotalPages(paginationData.info?.pages || 0);
        setTotalItems(paginationData.info?.total || 0);
      } else {
        // Simple array response
        setApartments(response.data || []);
      }
    } catch (error) {
      console.error("❌ Error loading apartments:", error);
      // Fallback to empty array on error
      setApartments([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    loadApartments();
  }, [loadApartments]);

  // Build filter options based on loaded apartments
  const projectOptions = useMemo(() => {
    const set = new Set<string>();
    apartments.forEach((apt) => apt.projectId && set.add(apt.projectId));
    const projectList = Array.from(set).map((p) => ({
      value: p,
      label: `Project ${p.slice(0, 8)}...`,
    }));

    // Add "Tất cả" option at the beginning
    return [{ value: "all", label: "Tất cả dự án" }, ...projectList];
  }, [apartments]);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "0", label: "Còn trống" },
      { value: "1", label: "Đã bán" },
      { value: "2", label: "Đã cho thuê" },
      { value: "3", label: "Đã đặt cọc" },
      { value: "4", label: "Bảo trì" },
    ],
    []
  );

  const typeOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả loại" },
      { value: "sell", label: "Bán" },
      { value: "rent", label: "Cho thuê" },
    ],
    []
  );

  const publicOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "true", label: "Công khai" },
      { value: "false", label: "Riêng tư" },
    ],
    []
  );

  const filteredApartments = useMemo(() => {
    return apartments.filter((apt) => {
      const matchSearch = `${apt.name} ${apt.alias}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchProject =
        projectFilter === "all" || apt.projectId === projectFilter;
      const matchStatus = statusFilter === "all" || apt.status === statusFilter;
      const matchType =
        typeFilter === "all" ||
        (typeFilter === "sell" && apt.isSell) ||
        (typeFilter === "rent" && !apt.isSell);
      const matchPublic =
        publicFilter === "all" ||
        (publicFilter === "true" && apt.isPublic) ||
        (publicFilter === "false" && !apt.isPublic);

      return (
        matchSearch && matchProject && matchStatus && matchType && matchPublic
      );
    });
  }, [
    apartments,
    search,
    projectFilter,
    statusFilter,
    typeFilter,
    publicFilter,
  ]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setProjectFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setPublicFilter("all");
  }, []);

  const handleDeleteApartment = useCallback(
    async (apartment: ReponseApartmentDto) => {
      if (
        window.confirm(`Bạn có chắc chắn muốn xóa căn hộ "${apartment.name}"?`)
      ) {
        try {
          await ApartmentService.delete(apartment.id);
          loadApartments(); // Reload the list
        } catch (error) {
          console.error("❌ Error deleting apartment:", error);
          alert("Có lỗi xảy ra khi xóa căn hộ");
        }
      }
    },
    [loadApartments]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Define columns BEFORE any conditional returns (Rules of Hooks)
  const columns: Column<ReponseApartmentDto>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Tên căn hộ",
        render: (apt) => (
          <Link
            to={`/apartments/${apt.id}`}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Home className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{apt.name}</span>
          </Link>
        ),
      },
      {
        key: "publicPrice",
        header: "Giá công khai",
        render: (apt) => (
          <span className="font-semibold text-green-600">
            {formatCurrency(apt.publicPrice)}
          </span>
        ),
      },
      {
        key: "privatePrice",
        header: "Giá nội bộ",
        render: (apt) => (
          <span className="font-semibold text-blue-600">
            {formatCurrency(apt.privatePrice)}
          </span>
        ),
      },
      {
        key: "area",
        header: "Diện tích",
        render: (apt) => `${apt.area}m²`,
      },
      {
        key: "numberBedroom",
        header: "Phòng ngủ",
        render: (apt) => `${apt.numberBedroom} PN`,
      },
      {
        key: "numberBathroom",
        header: "Phòng tắm",
        render: (apt) => `${apt.numberBathroom} PT`,
      },
      {
        key: "status",
        header: "Trạng thái",
        render: (apt) => {
          const statusMap: Record<string, { label: string; color: string }> = {
            "0": { label: "Còn trống", color: "bg-green-100 text-green-800" },
            "1": { label: "Đã bán", color: "bg-blue-100 text-blue-800" },
            "2": {
              label: "Đã cho thuê",
              color: "bg-yellow-100 text-yellow-800",
            },
            "3": {
              label: "Đã đặt cọc",
              color: "bg-orange-100 text-orange-800",
            },
            "4": { label: "Bảo trì", color: "bg-red-100 text-red-800" },
          };
          const status = statusMap[apt.status] || {
            label: "Không xác định",
            color: "bg-gray-100 text-gray-800",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
            >
              {status.label}
            </span>
          );
        },
      },
      {
        key: "isSell",
        header: "Loại",
        render: (apt) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              apt.isSell
                ? "bg-purple-100 text-purple-800"
                : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {apt.isSell ? "Bán" : "Cho thuê"}
          </span>
        ),
      },
      {
        key: "isPublic",
        header: "Trạng thái",
        render: (apt) => (
          <div className="flex items-center gap-2">
            {apt.isPublic ? (
              <Globe className="h-4 w-4 text-green-600" />
            ) : (
              <Lock className="h-4 w-4 text-gray-600" />
            )}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                apt.isPublic
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {apt.isPublic ? "Công khai" : "Riêng tư"}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  // Loading state UI
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb />

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Căn hộ</h1>
          {canCreate && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Tạo căn hộ mới
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Quản lý Căn hộ
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Quản lý tất cả các căn hộ trong dự án
          </p>
        </div>

        {canCreate && (
          <Link to="/apartments/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tạo căn hộ mới
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Filter
        className="mt-2"
        config={{
          search: {
            placeholder: "Tìm theo tên căn hộ hoặc alias...",
            value: search,
            onChange: setSearch,
          },
          location: {
            options: projectOptions,
            value: projectFilter,
            onChange: setProjectFilter,
          },
          status: {
            options: statusOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          type: {
            options: typeOptions,
            value: typeFilter,
            onChange: setTypeFilter,
          },
          public: {
            options: publicOptions,
            value: publicFilter,
            onChange: setPublicFilter,
          },
        }}
        onReset={resetFilters}
        onRefresh={loadApartments}
        loading={loading}
      />

      {/* Apartments Table */}
      {filteredApartments.length === 0 ? (
        <Card className="text-center py-12 bg-gray-50 border border-gray-200">
          <CardContent>
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có căn hộ nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu bằng cách tạo căn hộ đầu tiên của bạn
            </p>
            {canCreate && (
              <Link to="/apartments/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo căn hộ mới
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <DataTable
                columns={columns}
                data={filteredApartments}
                actions={(apt) => (
                  <div className="inline-flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={`/apartments/${apt.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Xem chi tiết</TooltipContent>
                    </Tooltip>
                    {canDelete && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteApartment(apt)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xóa</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
          showInfo={true}
          className="mt-6"
        />
      )}
    </div>
  );
};

export default ApartmentsList;
