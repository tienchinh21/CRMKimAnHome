import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReponseBlogDto } from "@/services/api/BlogService";
import BlogService from "@/services/api/BlogService";
import Breadcrumb from "@/components/common/breadcrumb";
import DataTable, { type Column } from "@/components/common/DataTable";
import Filter from "@/components/common/Filter";
import Pagination from "@/components/common/Pagination";
import BlogCreateModal from "@/components/blog/BlogCreateModal";
import BlogEditModal from "@/components/blog/BlogEditModal";

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<ReponseBlogDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadBlogs();
  }, [currentPage, itemsPerPage]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await BlogService.getAll({
        pageable: {
          page: currentPage - 1, // API uses 0-based pagination
          size: itemsPerPage,
        },
        filter: "",
      });

      // Handle pagination response
      if (
        response.data &&
        typeof response.data === "object" &&
        "info" in response.data
      ) {
        // PaginationResponse format
        const paginationData = response.data as any;
        setBlogs(
          Array.isArray(paginationData.response) ? paginationData.response : []
        );
        setTotalPages(paginationData.info?.pages || 0);
        setTotalItems(paginationData.info?.total || 0);
      } else {
        // Simple array response
        setBlogs(Array.isArray(response.data) ? response.data : []);
      }

      console.log("📝 Blogs loaded:", blogs.length);
    } catch (error) {
      console.error("❌ Error loading blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "published", label: "Đã xuất bản" },
    { value: "draft", label: "Bản nháp" },
    { value: "hidden", label: "Ẩn" },
  ];

  const typeOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "news", label: "Tin tức" },
    { value: "legal", label: "Pháp lý" },
    { value: "project", label: "Dự án nổi bật" },
  ];

  const filteredBlogs = React.useMemo(() => {
    if (!Array.isArray(blogs)) {
      return [];
    }
    return blogs.filter((blog) => {
      const matchSearch = `${blog.title} ${blog.content}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && blog.isActive) ||
        (statusFilter === "draft" && !blog.isActive) ||
        (statusFilter === "hidden" && !blog.isActive);

      const matchType =
        typeFilter === "all" ||
        (typeFilter === "news" && blog.isNews) ||
        (typeFilter === "legal" && blog.isLegal) ||
        (typeFilter === "project" && false); // No outstanding project field in new API

      return matchSearch && matchStatus && matchType;
    });
  }, [blogs, search, statusFilter, typeFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const handleDeleteBlog = async (blog: ReponseBlogDto) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${blog.title}"?`)) {
      try {
        await BlogService.delete(blog.id);
        loadBlogs(); // Reload the list
        console.log("✅ Blog deleted successfully");
      } catch (error) {
        console.error("❌ Error deleting blog:", error);
        alert("Có lỗi xảy ra khi xóa bài viết");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleBlogCreated = () => {
    loadBlogs(); // Reload the list
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb />

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài viết</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài viết mới
          </Button>
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

  const columns: Column<ReponseBlogDto>[] = [
    {
      key: "title",
      header: "Tiêu đề",
      render: (blog) => (
        <Link
          to={`/blog/${blog.id}`}
          className="flex items-center gap-2 hover:text-blue-600 transition-colors"
        >
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium line-clamp-2">{blog.title}</span>
        </Link>
      ),
    },
    {
      key: "content",
      header: "Nội dung",
      render: (blog) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 line-clamp-2">
            {blog.content.replace(/<[^>]*>/g, "")} {/* Remove HTML tags */}
          </p>
        </div>
      ),
    },
    {
      key: "categories",
      header: "Phân loại",
      render: (blog) => (
        <div className="flex flex-wrap gap-1">
          {blog.isNews && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Tin tức
            </span>
          )}
          {blog.isLegal && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Pháp lý
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (blog) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          published: {
            label: "Đã xuất bản",
            color: "bg-green-100 text-green-800",
          },
          draft: { label: "Bản nháp", color: "bg-yellow-100 text-yellow-800" },
          hidden: { label: "Ẩn", color: "bg-gray-100 text-gray-800" },
        };
        const status = blog.isActive ? "published" : "draft";
        const statusInfo = statusMap[status] || {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (blog) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Quản lý Bài viết
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2">
            Quản lý tất cả các bài viết và nội dung
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <BlogCreateModal onSuccess={handleBlogCreated} />
        </div>
      </div>

      {/* Filters */}
      <Filter
        className="mt-2"
        config={{
          search: {
            placeholder: "Tìm theo tiêu đề hoặc nội dung...",
            value: search,
            onChange: setSearch,
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
        }}
        onReset={resetFilters}
        onRefresh={loadBlogs}
        loading={loading}
      />

      {/* Blogs Table */}
      {filteredBlogs.length === 0 ? (
        <Card className="text-center py-12 bg-gray-50 border border-gray-200">
          <CardContent>
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có bài viết nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu bằng cách tạo bài viết đầu tiên của bạn
            </p>
            <BlogCreateModal onSuccess={handleBlogCreated} />
          </CardContent>
        </Card>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredBlogs}
            actions={(blog) => (
              <div className="inline-flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BlogEditModal
                      blog={blog}
                      onSuccess={loadBlogs}
                      trigger={
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>Sửa</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteBlog(blog)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xóa</TooltipContent>
                </Tooltip>
              </div>
            )}
          />

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
        </>
      )}
    </div>
  );
};

export default BlogList;
