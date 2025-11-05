import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, Eye, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Project } from "@/types";
import ProjectService from "@/services/api/ProjectService";
import ApartmentService from "@/services/api/ApartmentService";
import Breadcrumb from "@/components/common/breadcrumb";
import DataTable, { type Column } from "@/components/common/DataTable";
import Filter from "@/components/common/Filter";
import Pagination from "@/components/common/Pagination";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { CanAccess } from "@/components/auth/CanAccess";
import { PERMISSIONS } from "@/lib/rbac/permissions";

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // const [locationFilter, setLocationFilter] = useState("all"); // Commented: Pipeline filter not needed

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [currentPage, itemsPerPage]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await ProjectService.getWithPagination(
        currentPage - 1,
        itemsPerPage
      );

      if (
        response.data &&
        typeof response.data === "object" &&
        "info" in response.data
      ) {
        const paginationData = response.data as any;
        setProjects(paginationData.response || []);
        setTotalPages(paginationData.info?.pages || 0);
        setTotalItems(paginationData.info?.total || 0);
      } else {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };


  // Commented: Pipeline/Location filter not needed
  // const locationOptions = React.useMemo(() => {
  //   const set = new Set<string>();
  //   projects.forEach((p) => p.location && set.add(p.location));
  //   return Array.from(set).map((l) => ({ value: l, label: l }));
  // }, [projects]);

  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = `${p.name} ${p.location}`
        .toLowerCase()
        .includes(search.toLowerCase());
      // const matchLocation =
      //   locationFilter === "all" || p.location === locationFilter;
      return matchSearch; // && matchLocation;
    });
  }, [projects, search]); // , locationFilter

  const resetFilters = () => {
    setSearch("");
    // setLocationFilter("all");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {

      const apartmentsResponse = await ApartmentService.getByProjectId(
        projectToDelete.id,
        { page: 0, size: 1 }
      );
      const hasApartments = apartmentsResponse.data?.response?.length > 0;

      if (hasApartments) {
        toast.error(
          `Không thể xóa dự án "${projectToDelete.name}" vì còn có căn hộ liên quan.\n\nVui lòng xóa tất cả căn hộ trước khi xóa dự án.`
        );
        setDeleteModalOpen(false);
        return;
      }

      await ProjectService.deleteProject(projectToDelete.id);

      setDeleteModalOpen(false);
      setProjectToDelete(null);
      loadProjects(); // Reload the list
    } catch (error) {
      console.error("❌ Error deleting project:", error);

      // Show specific error message to user
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Không thể xóa dự án";

      toast.error(
        `Lỗi khi xóa dự án: ${errorMessage}\n\nCó thể dự án đang có dữ liệu liên quan hoặc lỗi server.`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb />
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

  const columns: Column<Project>[] = [
    { key: "name", header: "Tên dự án" },
    { key: "fullAddress", header: "Vị trí" },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (p) => new Date(p.createdAt).toLocaleDateString("vi-VN"),
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      render: (p) =>
        p.updatedAt
          ? new Date(p.updatedAt).toLocaleDateString("vi-VN")
          : "Chưa cập nhật",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <Breadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Quản lý Dự án
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Quản lý tất cả các dự án bất động sản
          </p>
        </div>

        <CanAccess permission={PERMISSIONS.PROJECT_CREATE}>
          <Link to="/projects/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tạo dự án mới
            </Button>
          </Link>
        </CanAccess>
      </div>

      {/* Filters */}
      <Filter
        className="mt-2"
        config={{
          search: {
            placeholder: "Tìm theo tên hoặc vị trí...",
            value: search,
            onChange: setSearch,
          },
          // Commented: Pipeline/Location filter not needed
          // location: {
          //   options: locationOptions,
          //   value: locationFilter,
          //   onChange: setLocationFilter,
          // },
        }}
        onReset={resetFilters}
        onRefresh={loadProjects}
        loading={loading}
      />

      {filteredProjects.length === 0 ? (
        <Card className="text-center py-12 bg-gray-50 border border-gray-200">
          <CardContent>
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có dự án nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu bằng cách tạo dự án đầu tiên của bạn
            </p>
            <CanAccess permission={PERMISSIONS.PROJECT_CREATE}>
              <Link to="/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo dự án mới
                </Button>
              </Link>
            </CanAccess>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <DataTable
                columns={columns}
                data={filteredProjects}
                actions={(p) => (
                  <div className="inline-flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={`/projects/${p.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Xem</TooltipContent>
                    </Tooltip>
                    <CanAccess permission={PERMISSIONS.PROJECT_DELETE}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteProject(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xóa</TooltipContent>
                      </Tooltip>
                    </CanAccess>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDeleteProject}
        title="Xóa dự án"
        description="Hành động này không thể hoàn tác. Dự án sẽ bị xóa vĩnh viễn."
        itemName={projectToDelete?.name || ""}
        warningMessage="Tất cả căn hộ và dữ liệu liên quan đến dự án này sẽ bị xóa vĩnh viễn."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectsList;
