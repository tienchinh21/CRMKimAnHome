import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Home } from "lucide-react";
import {
  VALIDATION_MESSAGES,
  APARTMENT_STATUS,
  DIRECTIONS,
  INTERIOR_OPTIONS,
} from "@/lib/constants";
import Breadcrumb from "@/components/common/breadcrumb";
import ApartmentService from "@/services/api/ApartmentService";
import ProjectService from "@/services/api/ProjectService";
import type { Project, CreateApartmentDto } from "@/lib/types";
import { formatCurrency } from "@/utils/format";
import SelectWithSearch from "@/components/common/SelectWithSearch";
import TagInput from "@/components/common/TagInput";

// Validation schema
const createApartmentSchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  price: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(/^\d+$/, "Giá phải là số dương"),
  detailedDescription: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(10, VALIDATION_MESSAGES.MIN_LENGTH(10)),
  highlights: z.array(z.string()).optional(),
  area: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(/^\d+(\.\d+)?$/, VALIDATION_MESSAGES.INVALID_NUMBER),
  numberBedroom: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(/^\d+$/, VALIDATION_MESSAGES.INVALID_NUMBER),
  numberBathroom: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(/^\d+$/, VALIDATION_MESSAGES.INVALID_NUMBER),
  floor: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .regex(/^\d+$/, VALIDATION_MESSAGES.INVALID_NUMBER),
  direction: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  interior: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  status: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  projectId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  isSell: z.boolean(),
  alias: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(50, VALIDATION_MESSAGES.MAX_LENGTH(50)),
});

type CreateApartmentForm = z.infer<typeof createApartmentSchema>;

const CreateApartment: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formattedPrice, setFormattedPrice] = useState<string>("");
  const [highlights, setHighlights] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateApartmentForm>({
    resolver: zodResolver(createApartmentSchema),
    defaultValues: {
      isSell: true,
      status: "0",
      direction: "north",
      interior: "basic",
      highlights: [],
      price: "",
      projectId: "",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await ProjectService.getAllProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error("❌ Error loading projects:", error);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newUrls: string[] = [];

    Array.from(files).forEach((file) => {
      newFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    });

    setImageFiles((prev) => [...prev, ...newFiles]);
    setImageUrls((prev) => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle price formatting
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove all non-digit characters
    const cleanValue = inputValue.replace(/[^\d]/g, "");

    // Convert to number and format
    const numericValue = parseFloat(cleanValue) || 0;
    const formatted = formatCurrency(numericValue);

    // Update formatted display
    setFormattedPrice(formatted);

    // Update form value with clean numeric value
    setValue("price", cleanValue);
  };

  const onSubmit = async (data: CreateApartmentForm) => {
    // Validate highlights manually
    if (highlights.length === 0) {
      alert("Vui lòng thêm ít nhất một điểm nổi bật");
      return;
    }

    try {
      setIsSubmitting(true);

      const apartmentData: CreateApartmentDto = {
        ...data,
        // Price is already clean string from handlePriceChange
        price: data.price,
        // Keep as strings as expected by API
        numberBedroom: data.numberBedroom,
        numberBathroom: data.numberBathroom,
        floor: data.floor,
        status: data.status,
        // Convert highlights array to string
        highlights: highlights.join("\n"),
      };

      const response = await ApartmentService.create({
        data: apartmentData,
        file: imageFiles,
      });

      // Navigate to apartment detail page
      if (response.content?.id) {
        navigate(`/apartments/${response.content.id}`);
      } else {
        navigate("/apartments");
      }
    } catch (error) {
      console.error("❌ Error creating apartment:", error);
      console.error("❌ Error details:", {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
      });
      alert(
        `Có lỗi xảy ra khi tạo căn hộ: ${
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          "Unknown"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/apartments")}
              className="hover:bg-white/80 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-3">
                <Home className="h-8 w-8 text-blue-600" />
                Tạo căn hộ mới
              </h1>
              <p className="text-gray-600 mt-1 text-base">
                Nhập thông tin chi tiết để tạo căn hộ mới trong dự án
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Content Grid - Basic Info + Images */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Basic Information */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <Home className="w-4 h-4 text-blue-600" />
                    </div>
                    Thông tin cơ bản
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên căn hộ */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tên căn hộ <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      placeholder="Ví dụ: Căn hộ A1-01"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Alias */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Alias <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("alias")}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      placeholder="Ví dụ: can-ho-a1-01"
                    />
                    {errors.alias && (
                      <p className="text-sm text-red-600">
                        {errors.alias.message}
                      </p>
                    )}
                  </div>

                  {/* Giá */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Giá (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formattedPrice}
                      onChange={handlePriceChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      placeholder="Ví dụ: 2.500.000.000"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Diện tích */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Diện tích (m²) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("area")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      placeholder="Ví dụ: 75.5"
                    />
                    {errors.area && (
                      <p className="text-sm text-red-600">
                        {errors.area.message}
                      </p>
                    )}
                  </div>

                  {/* Số phòng ngủ */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Số phòng ngủ <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("numberBedroom")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      placeholder="Ví dụ: 2"
                    />
                    {errors.numberBedroom && (
                      <p className="text-sm text-red-600">
                        {errors.numberBedroom.message}
                      </p>
                    )}
                  </div>

                  {/* Số phòng tắm */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Số phòng tắm <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("numberBathroom")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      placeholder="Ví dụ: 2"
                    />
                    {errors.numberBathroom && (
                      <p className="text-sm text-red-600">
                        {errors.numberBathroom.message}
                      </p>
                    )}
                  </div>

                  {/* Tầng */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tầng <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("floor")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      placeholder="Ví dụ: 15"
                    />
                    {errors.floor && (
                      <p className="text-sm text-red-600">
                        {errors.floor.message}
                      </p>
                    )}
                  </div>

                  {/* Hướng */}
                  <div className="space-y-2">
                    <SelectWithSearch
                      options={DIRECTIONS.map((dir) => ({
                        value: dir.value,
                        label: dir.label,
                      }))}
                      value={watch("direction")}
                      onChange={(value) => setValue("direction", value)}
                      label="Hướng"
                      required
                      error={errors.direction?.message}
                      placeholder="Chọn hướng"
                      searchPlaceholder="Tìm hướng..."
                    />
                  </div>

                  {/* Nội thất */}
                  <div className="space-y-2">
                    <SelectWithSearch
                      options={INTERIOR_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      }))}
                      value={watch("interior")}
                      onChange={(value) => setValue("interior", value)}
                      label="Nội thất"
                      required
                      error={errors.interior?.message}
                      placeholder="Chọn nội thất"
                      searchPlaceholder="Tìm nội thất..."
                    />
                  </div>

                  {/* Trạng thái */}
                  <div className="space-y-2">
                    <SelectWithSearch
                      options={APARTMENT_STATUS.map((status) => ({
                        value: status.value,
                        label: status.label,
                      }))}
                      value={watch("status")}
                      onChange={(value) => setValue("status", value)}
                      label="Trạng thái"
                      required
                      error={errors.status?.message}
                      placeholder="Chọn trạng thái"
                      searchPlaceholder="Tìm trạng thái..."
                    />
                  </div>

                  {/* Dự án */}
                  <div className="space-y-2">
                    <SelectWithSearch
                      options={projects.map((project) => ({
                        value: project.id.toString(),
                        label: project.name,
                      }))}
                      value={watch("projectId")}
                      onChange={(value) => setValue("projectId", value)}
                      label="Dự án"
                      required
                      error={errors.projectId?.message}
                      placeholder="Chọn dự án"
                      searchPlaceholder="Tìm dự án..."
                      maxHeight={250}
                    />
                  </div>

                  {/* Loại giao dịch */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Loại giao dịch <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="true"
                          checked={watchedValues.isSell === true}
                          onChange={() => setValue("isSell", true)}
                          className="mr-2"
                        />
                        Bán
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="false"
                          checked={watchedValues.isSell === false}
                          onChange={() => setValue("isSell", false)}
                          className="mr-2"
                        />
                        Cho thuê
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    Hình ảnh
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tải lên hình ảnh căn hộ
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="apartment-image-upload"
                      />
                      <label
                        htmlFor="apartment-image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Nhấn để tải ảnh
                            </span>{" "}
                            hoặc kéo thả
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF (Tối đa 10MB)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Image Preview Grid */}
                    {imageUrls.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Hình ảnh đã tải:
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {imageUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className="bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
                                  Ảnh {index + 1}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {imageUrls.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium mb-1">
                          Chưa có hình ảnh
                        </p>
                        <p className="text-xs text-gray-400">
                          Tải lên hình ảnh để hiển thị
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative z-0">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                Mô tả chi tiết
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Thêm thông tin mô tả và điểm nổi bật của căn hộ
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("detailedDescription")}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                  placeholder="Mô tả chi tiết về căn hộ, vị trí, tiện ích..."
                />
                {errors.detailedDescription && (
                  <p className="text-sm text-red-600">
                    {errors.detailedDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <TagInput
                  tags={highlights}
                  onChange={setHighlights}
                  label="Điểm nổi bật"
                  required
                  placeholder="Nhập điểm nổi bật..."
                  maxTags={8}
                  error={errors.highlights?.message}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/apartments")}
              disabled={isSubmitting}
              className="px-6 py-3 h-12 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 h-12 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Tạo căn hộ
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateApartment;
