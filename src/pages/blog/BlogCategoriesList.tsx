import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Breadcrumb from "@/components/common/breadcrumb";
import DataTable, { type Column } from "@/components/common/DataTable";
import Filter, { type FilterConfig } from "@/components/common/Filter";
import Pagination from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
import BlogService, {
  type CreateBlogCategoryDto,
  type ReponseBlogCategoryDto,
} from "@/services/api/BlogService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";

const BlogCategoriesList: React.FC = () => {
  const [categories, setCategories] = React.useState<ReponseBlogCategoryDto[]>(
    []
  );
  const [filteredCategories, setFilteredCategories] = React.useState<
    ReponseBlogCategoryDto[]
  >([]);
  const [open, setOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] =
    React.useState<ReponseBlogCategoryDto | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Filter states
  const [searchValue, setSearchValue] = React.useState("");

  // Pagination
  const pagination = usePagination({
    totalItems: filteredCategories.length,
    initialItemsPerPage: 10,
  });

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await BlogService.getCategories();
      setCategories(res.data || []);
      setFilteredCategories(res.data || []);
    } catch (e) {
      console.error("Load categories failed", e);
    }
  }, []);

  // Filter categories based on search
  React.useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchValue.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [categories, searchValue]);

  // Get paginated data
  const paginatedCategories = React.useMemo(() => {
    return filteredCategories.slice(pagination.startIndex, pagination.endIndex);
  }, [filteredCategories, pagination.startIndex, pagination.endIndex]);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: ReponseBlogCategoryDto) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await BlogService.deleteCategory(id);
        await fetchCategories();
      } catch (error) {
        console.error("Delete category failed", error);
        alert("Xóa danh mục thất bại");
      }
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingCategory(null);
  };

  const handleResetFilters = () => {
    setSearchValue("");
  };

  // Filter configuration
  const filterConfig: FilterConfig = {
    search: {
      placeholder: "Tìm kiếm theo tên hoặc mô tả...",
      value: searchValue,
      onChange: setSearchValue,
    },
  };

  const columns: Column<ReponseBlogCategoryDto>[] = [
    { key: "name", header: "Tên danh mục" },
    { key: "description", header: "Mô tả" },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (item: ReponseBlogCategoryDto) =>
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
    },
  ];

  const renderActions = (item: ReponseBlogCategoryDto) => (
    <div className="inline-flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handleEdit(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Sửa</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Xóa</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        <Breadcrumb />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Danh mục bài viết
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và phân loại nội dung website
              </p>
            </div>
            <Dialog
              open={open}
              onOpenChange={(open) => {
                setOpen(open);
                if (!open) {
                  // Delay reset form để animation hoàn thành
                  setTimeout(() => resetForm(), 200);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="px-6" onClick={resetForm}>
                  Thêm danh mục
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory
                      ? "Chỉnh sửa danh mục"
                      : "Tạo danh mục mới"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên danh mục *</Label>
                    <Input
                      id="name"
                      placeholder="Nhập tên danh mục"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả ngắn về danh mục"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild>
                      <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button
                      onClick={async () => {
                        if (!name.trim()) {
                          return alert("Vui lòng nhập tên danh mục");
                        }
                        try {
                          setCreating(true);
                          const payload: CreateBlogCategoryDto = {
                            name: name.trim(),
                            description: description.trim() || undefined,
                          };

                          if (editingCategory) {
                            await BlogService.updateCategory(
                              editingCategory.id,
                              payload
                            );
                            alert("Cập nhật danh mục thành công");
                          } else {
                            await BlogService.createCategory(payload);
                            alert("Tạo danh mục thành công");
                          }

                          setOpen(false);
                          resetForm();
                          await fetchCategories();
                        } catch (e) {
                          console.error("Category operation failed", e);
                          alert(
                            editingCategory
                              ? "Cập nhật danh mục thất bại"
                              : "Tạo danh mục thất bại"
                          );
                        } finally {
                          setCreating(false);
                        }
                      }}
                      disabled={creating}
                    >
                      {creating
                        ? editingCategory
                          ? "Đang cập nhật..."
                          : "Đang tạo..."
                        : editingCategory
                        ? "Cập nhật danh mục"
                        : "Tạo danh mục"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter */}
        <Filter
          config={filterConfig}
          onReset={handleResetFilters}
          onRefresh={fetchCategories}
          showActiveFilters={true}
        />

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchValue
                  ? "Không tìm thấy danh mục nào"
                  : "Chưa có danh mục nào"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchValue
                  ? "Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem tất cả danh mục."
                  : "Tạo danh mục đầu tiên để bắt đầu tổ chức nội dung của bạn."}
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Tạo và quản lý danh mục bài viết</p>
                <p>• Phân loại nội dung theo chủ đề</p>
                <p>• Tối ưu hóa trải nghiệm người dùng</p>
              </div>
            </div>
          ) : (
            <TooltipProvider>
              <DataTable
                columns={columns}
                data={paginatedCategories}
                actions={renderActions}
                emptyMessage="Chưa có danh mục nào"
              />
            </TooltipProvider>
          )}
        </div>

        {/* Pagination */}
        {filteredCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.setCurrentPage}
              onItemsPerPageChange={pagination.setItemsPerPage}
              showItemsPerPage={true}
              showInfo={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCategoriesList;
