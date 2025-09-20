import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import QuillEditor from "@/components/forms/QuillEditor";
import BlogService, { type CreateBlogDto } from "@/services/api/BlogService";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X, Save, FileText, Upload, Image as ImageIcon } from "lucide-react";

const createBlogSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự"),
  mainImage: z.string().optional(),
  isNews: z.boolean(),
  isLegal: z.boolean(),
  isActive: z.boolean(),
  content: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

type CreateBlogForm = z.infer<typeof createBlogSchema>;

interface BlogCreateModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const BlogCreateModal: React.FC<BlogCreateModalProps> = ({
  onSuccess,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories when modal opens
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await BlogService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateBlogForm>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      title: "",
      mainImage: "",
      isNews: false,
      isLegal: false,
      isActive: true,
      content: "",
      categories: [],
    },
  });

  // Load categories when modal opens
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const response = await BlogService.uploadImage(file);
      setValue("mainImage", response);
      setImagePreview(response);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setValue("mainImage", "");
    setImagePreview("");
  };

  const onSubmit: SubmitHandler<CreateBlogForm> = async (data) => {
    setSubmitting(true);
    try {
      const blogData: CreateBlogDto = {
        title: data.title,
        content: content,
        mainImage: data.mainImage || "",
        isNews: data.isNews,
        isLegal: data.isLegal,
        isActive: data.isActive,
        sortOrder: 0,
        slug: data.title.toLowerCase().replace(/\s+/g, "-"),
        categories: data.categories || [],
      };

      await BlogService.create(blogData);

      // Reset form and close modal
      reset();
      setContent("");
      setImagePreview("");
      setOpen(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error creating blog:", err);
      alert("Có lỗi xảy ra khi tạo bài viết");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setContent("");
      setImagePreview("");
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="px-6 py-3 h-12 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
            <FileText className="h-4 w-4 mr-2" />
            Tạo bài viết mới
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-7xl w-full h-[95vh] p-0 flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Form Section - Left */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tạo bài viết mới
                </h2>
                <p className="text-gray-600 mt-1">
                  Viết và quản lý nội dung bài viết của bạn
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <div>
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tiêu đề bài viết
                  </Label>
                  <Input
                    {...register("title")}
                    placeholder="Nhập tiêu đề bài viết..."
                    className="mt-1 text-lg"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Content Editor */}
                <div className="relative z-10">
                  <Label
                    htmlFor="content"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nội dung
                  </Label>
                  <div className="mt-1">
                    <QuillEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Viết nội dung bài viết của bạn..."
                    />
                  </div>
                </div>

                {/* Image and Status Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0">
                  {/* Image Upload */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Ảnh bài viết
                    </Label>
                    <div className="mt-1">
                      {imagePreview ? (
                        <div className="relative group">
                          <div className="aspect-video w-full rounded-lg border border-gray-200 overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-3">
                            Chọn ảnh đại diện
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("image-upload")?.click()
                            }
                            disabled={uploadingImage}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? "Đang tải..." : "Chọn ảnh"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Trạng thái
                    </Label>
                    <Select
                      value={watch("isActive") ? "active" : "inactive"}
                      onValueChange={(value) =>
                        setValue("isActive", value === "active")
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Công khai</SelectItem>
                        <SelectItem value="inactive">Riêng tư</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Blog Type Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Loại bài viết
                    </Label>
                    <div className="mt-1 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isNews"
                          checked={watch("isNews")}
                          onCheckedChange={(checked) =>
                            setValue("isNews", !!checked)
                          }
                        />
                        <Label
                          htmlFor="isNews"
                          className="text-sm text-gray-700"
                        >
                          Bài viết
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isLegal"
                          checked={watch("isLegal")}
                          onCheckedChange={(checked) =>
                            setValue("isLegal", !!checked)
                          }
                        />
                        <Label
                          htmlFor="isLegal"
                          className="text-sm text-gray-700"
                        >
                          Pháp lý
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Categories Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Danh mục bài viết
                    </Label>
                    <div className="mt-1">
                      {loadingCategories ? (
                        <div className="text-sm text-gray-500">
                          Đang tải danh mục...
                        </div>
                      ) : (
                        <Select
                          value={watch("categories")?.[0] || ""}
                          onValueChange={(value) => {
                            if (value && value !== "none") {
                              setValue("categories", [value]);
                            } else {
                              setValue("categories", []);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục bài viết" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Không chọn danh mục
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section - Right */}
          <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 border-l border-gray-200 overflow-y-auto min-h-0">
            <div className="sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 p-6 pb-4 border-b border-gray-200 z-10">
              <h3 className="text-lg font-semibold text-gray-900">Xem trước</h3>
            </div>

            <div className="space-y-4 p-6 pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Ngày đăng:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    watch("isActive")
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {watch("isActive") ? "Công khai" : "Riêng tư"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Tiêu đề
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm font-semibold text-gray-900">
                      {watch("title") || "Tiêu đề bài viết"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Ảnh đại diện
                  </div>
                  {imagePreview ? (
                    <div className="aspect-video w-full rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                        <p className="text-xs">Chưa có ảnh</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Loại bài viết
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-wrap gap-1">
                      {watch("isNews") && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Bài viết
                        </span>
                      )}
                      {watch("isLegal") && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Pháp lý
                        </span>
                      )}
                      {!watch("isNews") && !watch("isLegal") && (
                        <div className="text-gray-400 italic text-xs">
                          Chưa chọn loại bài viết
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Danh mục
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    {watch("categories") &&
                    (watch("categories")?.length || 0) > 0 ? (
                      <div>
                        {(() => {
                          const selectedCategoryId = watch("categories")?.[0];
                          const category = categories.find(
                            (c) => c.id === selectedCategoryId
                          );
                          return category ? (
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                              {category.name}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic text-xs">
                        Chưa chọn danh mục
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Nội dung
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm min-h-32 max-h-64 overflow-y-auto">
                    <div className="prose prose-xs max-w-none">
                      {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                      ) : (
                        <div className="text-gray-400 italic text-xs">
                          Nội dung bài viết sẽ hiển thị ở đây...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-white shadow-lg flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {submitting ? "Đang lưu..." : "Lưu bài viết"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogCreateModal;
