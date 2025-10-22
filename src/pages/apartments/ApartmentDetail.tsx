import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Edit,
  Save,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/common/breadcrumb";
import ImageEditor from "@/components/common/ImageEditor";
import QuillEditor from "@/components/forms/QuillEditor";
import SelectWithSearch from "@/components/common/SelectWithSearch";
import ApartmentService from "@/services/api/ApartmentService";
import ProjectService from "@/services/api/ProjectService";
import type {
  ReponseDetailApartmentDto,
  Project,
  UpdateApartmentDto,
  Legal,
} from "@/types";
import {
  APARTMENT_STATUS,
  DIRECTIONS,
  INTERIOR_OPTIONS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

const ApartmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState<ReponseDetailApartmentDto | null>(
    null
  );
  const [project, setProject] = useState<[id: string, name: string] | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [legals, setLegals] = useState<Legal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLegal, setNewLegal] = useState("");

  // Image management states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  // Edit form states
  const [editData, setEditData] = useState<UpdateApartmentDto>({
    name: "",
    publicPrice: "",
    privatePrice: "",
    detailedDescription: "",
    area: "",
    numberBedroom: "0",
    numberBathroom: "0",
    floor: "0",
    direction: "",
    interior: "",
    status: "0",
    projectId: "",
    isSell: true,
    alias: "",
    ownerName: "",
    ownerPhone: "",
    isPublic: false,
  });

  const loadProjects = useCallback(async () => {
    try {
      const response = await ProjectService.getAllProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }, []);

  const loadLegals = useCallback(async (apartmentId: string) => {
    try {
      const response = await ApartmentService.getLegals(apartmentId);
      setLegals(response.data || []);
    } catch (error) {
      console.error("Error loading legals:", error);
    }
  }, []);

  const loadApartmentDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await ApartmentService.getById(id);

      if (response.content) {
        setApartment(response.content);

        // Initialize edit data
        setEditData({
          name: response.content.name || "",
          publicPrice: response.content.publicPrice || "",
          privatePrice: response.content.privatePrice || "",
          detailedDescription: response.content.detailedDescription || "",
          ownerName: response.content.ownerName || "",
          ownerPhone: response.content.ownerPhone || "",
          area: response.content.area || "",
          numberBedroom: response.content.numberBedroom?.toString() || "0",
          numberBathroom: response.content.numberBathroom?.toString() || "0",
          floor: response.content.floor?.toString() || "0",
          direction: response.content.direction || "",
          interior: response.content.interior || "",
          status: response.content.status?.toString() || "0",
          projectId: response.content.project.id || "",
          isSell: response.content.isSell || true,
          alias: response.content.alias || "",
          isPublic: response.content.isPublic || false,
        });

        setProject([
          response.content.project.id,
          response.content.project.name,
        ]);

        // Load legal information
        await loadLegals(id);
      } else {
        setError("Không thể tải thông tin căn hộ");
      }
    } catch (error) {
      console.error("❌ Error loading apartment detail:", error);
      setError("Không thể tải thông tin căn hộ");
    } finally {
      setLoading(false);
    }
  }, [id, loadLegals]);

  useEffect(() => {
    loadApartmentDetail();
    loadProjects();
  }, [loadApartmentDetail, loadProjects]);

  // Reset selected image when apartment changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [apartment?.id]);

  const getStatusInfo = useCallback((status: string | number) => {
    const statusOption = APARTMENT_STATUS.find(
      (s) => s.value === status.toString()
    );
    const statusValue = status.toString();

    let colorClass = "bg-gray-100 text-gray-800";
    let label = statusOption?.label || "Không xác định";

    // Phân biệt màu sắc theo status
    switch (statusValue) {
      case "0":
        colorClass = "bg-green-100 text-green-800 border-green-200";
        label = "Có sẵn";
        break;
      case "1":
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
        label = "Đã đặt cọc";
        break;
      case "2":
        colorClass = "bg-red-100 text-red-800 border-red-200";
        label = "Đã bán/Cho thuê";
        break;
      case "3":
        colorClass = "bg-blue-100 text-blue-800 border-blue-200";
        label = "Tạm ngưng";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800 border-gray-200";
        break;
    }

    return {
      label,
      color: colorClass,
    };
  }, []);

  const getDirectionInfo = useCallback((direction: string) => {
    return DIRECTIONS.find((d) => d.value === direction)?.label || direction;
  }, []);

  const getInteriorInfo = useCallback((interior: string) => {
    return (
      INTERIOR_OPTIONS.find((i) => i.value === interior)?.label || interior
    );
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setSelectedImages([]);
    setDeletedImages([]);

    // Reset edit data to original values
    if (apartment) {
      setEditData({
        name: apartment.name || "",
        publicPrice: apartment.publicPrice || "",
        privatePrice: apartment.privatePrice || "",
        detailedDescription: apartment.detailedDescription || "",
        ownerName: apartment.ownerName || "",
        ownerPhone: apartment.ownerPhone || "",
        area: apartment.area || "",
        numberBedroom: apartment.numberBedroom?.toString() || "0",
        numberBathroom: apartment.numberBathroom?.toString() || "0",
        floor: apartment.floor?.toString() || "0",
        direction: apartment.direction || "",
        interior: apartment.interior || "",
        status: apartment.status?.toString() || "0",
        projectId: apartment.projectId || "",
        isSell: apartment.isSell || true,
        alias: apartment.alias || "",
        isPublic: apartment.isPublic || false,
      });
    }
  }, [apartment]);

  const handleSave = useCallback(async () => {
    if (!id || !apartment) return;

    try {
      setSaving(true);

      // Prepare all images to keep (existing images not deleted + new images)
      const imagesToKeep: File[] = [...selectedImages];

      // Add existing images that are not marked for deletion
      if (apartment.images && apartment.images.length > 0) {
        for (const imageUrl of apartment.images) {
          // Skip if this image is marked for deletion
          if (!deletedImages.includes(imageUrl)) {
            // Fetch from URL directly (removed localStorage logic)
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const fileName = imageUrl.split("/").pop() || "image.jpg";
              const file = new File([blob], fileName, { type: blob.type });
              imagesToKeep.push(file);
            } catch (error) {
              console.error("Error fetching image from URL:", imageUrl, error);
            }
          }
        }
      }

      await ApartmentService.update(id, {
        data: editData,
        files: imagesToKeep,
      });

      // Reset image states
      setSelectedImages([]);
      setDeletedImages([]);

      // Reload apartment data
      await loadApartmentDetail();
      setIsEditing(false);

      alert("Cập nhật căn hộ thành công!");
    } catch (error) {
      console.error("Error updating apartment:", error);
      alert(
        `Có lỗi xảy ra khi cập nhật căn hộ: ${
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  }, [
    id,
    apartment,
    selectedImages,
    deletedImages,
    editData,
    loadApartmentDetail,
  ]);

  const handleInputChange = useCallback(
    (field: keyof UpdateApartmentDto, value: any) => {
      setEditData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Image management functions
  const handleImageSelect = useCallback((files: File[]) => {
    setSelectedImages((prev) => [...prev, ...files]);
  }, []);

  const handleImageRemove = useCallback((index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageDelete = useCallback((imageUrl: string) => {
    setDeletedImages((prev) => [...prev, imageUrl]);
  }, []);

  const handleImageRestore = useCallback((imageUrl: string) => {
    setDeletedImages((prev) => prev.filter((url) => url !== imageUrl));
  }, []);

  const addLegal = useCallback(async () => {
    if (newLegal.trim() && apartment?.id) {
      try {
        await ApartmentService.createLegal(apartment.id, {
          name: newLegal.trim(),
          sortOrder: legals.length,
        });
        setNewLegal("");
        await loadLegals(apartment.id);
      } catch (error) {
        console.error("Error adding legal:", error);
      }
    }
  }, [newLegal, apartment?.id, legals.length, loadLegals]);

  const removeLegal = useCallback(
    async (legalId: string) => {
      try {
        await ApartmentService.deleteLegal(legalId);
        if (apartment?.id) {
          await loadLegals(apartment.id);
        }
      } catch (error) {
        console.error("Error removing legal:", error);
      }
    },
    [apartment?.id, loadLegals]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy căn hộ
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "Căn hộ không tồn tại hoặc đã bị xóa"}
          </p>
          <Button
            onClick={() => navigate("/apartments")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(apartment.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/apartments")}
                className="h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <Breadcrumb />
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  {apartment.name}
                </h1>
              </div>
            </div>

            {!isEditing ? (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex items-center gap-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left: Images */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {isEditing ? (
                <div className="p-6">
                  <ImageEditor
                    images={apartment.images || []}
                    selectedImages={selectedImages}
                    deletedImages={deletedImages}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    onImageDelete={handleImageDelete}
                    onImageRestore={handleImageRestore}
                    fallbackType="apartment"
                    title="Hình ảnh căn hộ"
                  />
                </div>
              ) : apartment.images && apartment.images.length > 0 ? (
                <div className="space-y-4 p-6">
                  {/* Main Image */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={apartment.images[selectedImageIndex]}
                      alt={`${apartment.name} - Ảnh ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation arrows */}
                    {apartment.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex(
                              selectedImageIndex === 0
                                ? apartment.images.length - 1
                                : selectedImageIndex - 1
                            )
                          }
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex(
                              selectedImageIndex === apartment.images.length - 1
                                ? 0
                                : selectedImageIndex + 1
                            )
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    <div className="absolute bottom-2 right-2 bg-gray-900/70 text-white px-2 py-1 rounded text-sm">
                      {selectedImageIndex + 1} / {apartment.images.length}
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {apartment.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {apartment.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === selectedImageIndex
                              ? "border-teal-500 ring-2 ring-teal-500 ring-offset-2"
                              : "border-gray-200 hover:border-gray-300 hover:opacity-80"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${apartment.name} - Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-gray-900/50 text-white px-1 py-0.5 rounded text-xs">
                            {index + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có hình ảnh</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông tin căn hộ
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Tên căn hộ
                      </label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập tên căn hộ..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Alias
                      </label>
                      <input
                        type="text"
                        value={editData.alias}
                        onChange={(e) =>
                          handleInputChange("alias", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập alias..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Giá công khai
                      </label>
                      <input
                        type="text"
                        value={
                          editData.publicPrice
                            ? formatCurrency(editData.publicPrice)
                            : ""
                        }
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(
                            /[^\d]/g,
                            ""
                          );
                          handleInputChange("publicPrice", cleanValue);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập giá công khai..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Giá nội bộ
                      </label>
                      <input
                        type="text"
                        value={
                          editData.privatePrice
                            ? formatCurrency(editData.privatePrice)
                            : ""
                        }
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(
                            /[^\d]/g,
                            ""
                          );
                          handleInputChange("privatePrice", cleanValue);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập giá nội bộ..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Loại
                      </label>
                      <select
                        value={editData.isSell ? "sell" : "rent"}
                        onChange={(e) =>
                          handleInputChange("isSell", e.target.value === "sell")
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="sell">Bán</option>
                        <option value="rent">Cho thuê</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Diện tích
                      </label>
                      <input
                        type="text"
                        value={editData.area}
                        onChange={(e) =>
                          handleInputChange("area", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập diện tích..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Số phòng ngủ
                      </label>
                      <input
                        type="number"
                        value={editData.numberBedroom}
                        onChange={(e) =>
                          handleInputChange("numberBedroom", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập số phòng ngủ..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Số phòng tắm
                      </label>
                      <input
                        type="number"
                        value={editData.numberBathroom}
                        onChange={(e) =>
                          handleInputChange("numberBathroom", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập số phòng tắm..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Tầng
                      </label>
                      <input
                        type="number"
                        value={editData.floor}
                        onChange={(e) =>
                          handleInputChange("floor", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập tầng..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Hướng
                      </label>
                      <select
                        value={editData.direction}
                        onChange={(e) =>
                          handleInputChange("direction", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Chọn hướng</option>
                        {DIRECTIONS.map((dir) => (
                          <option key={dir.value} value={dir.value}>
                            {dir.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Nội thất
                      </label>
                      <select
                        value={editData.interior}
                        onChange={(e) =>
                          handleInputChange("interior", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Chọn nội thất</option>
                        {INTERIOR_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Trạng thái
                      </label>
                      <select
                        value={editData.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        {APARTMENT_STATUS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Hiển thị công khai
                      </label>
                      <select
                        value={editData.isPublic ? "public" : "private"}
                        onChange={(e) =>
                          handleInputChange(
                            "isPublic",
                            e.target.value === "public"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="public">Công khai</option>
                        <option value="private">Riêng tư</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Project Selection */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Dự án <span className="text-red-500">*</span>
                      </label>
                      <SelectWithSearch
                        options={projects.map((project) => ({
                          value: project.id.toString(),
                          label: project.name,
                        }))}
                        value={editData.projectId}
                        onChange={(value) =>
                          handleInputChange("projectId", value)
                        }
                        placeholder={
                          projects.length > 0
                            ? "Chọn dự án"
                            : "Đang tải dự án..."
                        }
                        searchPlaceholder="Tìm dự án..."
                        maxHeight={250}
                      />
                    </div>

                    {/* Owner Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Tên chủ căn hộ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editData.ownerName}
                          onChange={(e) =>
                            handleInputChange("ownerName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Nhập tên chủ căn hộ..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={editData.ownerPhone}
                          onChange={(e) =>
                            handleInputChange("ownerPhone", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Nhập số điện thoại..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Mô tả chi tiết
                      </label>
                      <QuillEditor
                        key={`inline-editor-${apartment.id}`}
                        value={editData.detailedDescription || ""}
                        onChange={(content) =>
                          handleInputChange("detailedDescription", content)
                        }
                        placeholder="Nhập mô tả chi tiết..."
                        disableImageUpload={true}
                        showWordCount={true}
                        className="min-h-[300px]"
                      />
                    </div>

                    {/* Legal Information - Chỉ hiển thị trong edit mode */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">
                        Thông tin pháp lý
                      </h3>

                      {/* Hiển thị danh sách pháp lý hiện có */}
                      {legals.length > 0 && (
                        <div className="space-y-2">
                          {legals.map((legal, index) => (
                            <div
                              key={legal.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <span className="text-sm text-gray-700">
                                {index + 1}. {legal.name}
                              </span>
                              <button
                                onClick={() => removeLegal(legal.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Form thêm pháp lý mới */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Thêm thông tin pháp lý
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Nhập thông tin pháp lý..."
                            value={newLegal}
                            onChange={(e) => setNewLegal(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addLegal()}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <button
                            onClick={addLegal}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Điểm nổi bật (mỗi dòng một điểm)
                      </label>
                      <textarea
                        value={editData.highlights}
                        onChange={(e) =>
                          handleInputChange("highlights", e.target.value)
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập các điểm nổi bật, mỗi dòng một điểm..."
                      />
                    </div> */}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {apartment.name}
                    </h1>
                    <p className="text-gray-500 text-sm mb-4">
                      <span className="font-medium">Mã căn hộ: </span>
                      {apartment.alias || "Chưa cập nhật"}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="default" className="px-3 py-1">
                        {apartment.isSell ? "Bán" : "Cho thuê"}
                      </Badge>
                    </div>
                  </div>

                  {/* Property Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Giá công khai
                        </span>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(apartment.publicPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Giá nội bộ
                        </span>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(apartment.privatePrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <Home className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">Diện tích</span>
                        <p className="font-semibold">{apartment.area}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <Bed className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">Phòng ngủ</span>
                        <p className="font-semibold">
                          {apartment.numberBedroom}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <Bath className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">Phòng tắm</span>
                        <p className="font-semibold">
                          {apartment.numberBathroom}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600">Tầng</span>
                        <p className="font-semibold">{apartment.floor}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <span className="text-sm text-gray-600">Hướng</span>
                      <span className="font-medium">
                        {getDirectionInfo(apartment.direction)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <span className="text-sm text-gray-600">Nội thất</span>
                      <span className="font-medium">
                        {getInteriorInfo(apartment.interior)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <span className="text-sm text-gray-600">Trạng thái</span>
                      <Badge
                        className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <span className="text-sm text-gray-600">Hiển thị</span>
                      <Badge
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          apartment.isPublic
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {apartment.isPublic ? "Công khai" : "Riêng tư"}
                      </Badge>
                    </div>
                  </div>

                  {/* Legal Information - Chỉ hiển thị trong view mode */}
                  {legals.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Thông tin pháp lý
                      </h3>
                      <div className="space-y-2">
                        {legals.map((legal, index) => (
                          <div
                            key={legal.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <span className="text-sm text-gray-700">
                              {index + 1}. {legal.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <p>
                        <strong>Tạo lúc:</strong>{" "}
                        {(apartment as any).createdAt
                          ? formatDate((apartment as any).createdAt)
                          : "Chưa cập nhật"}
                      </p>
                      <p>
                        <strong>Cập nhật lúc:</strong>{" "}
                        {(apartment as any).updatedAt
                          ? formatDate((apartment as any).updatedAt)
                          : "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-8">
          {/* Project Information */}
          {project && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-teal-600" />
                  Thông tin dự án
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-sm text-gray-600">Tên dự án</span>
                    <p className="font-semibold text-lg text-teal-900">
                      {project[1]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Mô tả chi tiết
              </h2>
            </div>
            <div className="p-6">
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: apartment.detailedDescription,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetail;
