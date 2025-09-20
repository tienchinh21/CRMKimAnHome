import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import type { Apartment } from "@/lib/types";
import ApartmentService from "@/services/api/ApartmentService";
import {
  VALIDATION_MESSAGES,
  APARTMENT_STATUS,
  DIRECTIONS,
  INTERIOR_OPTIONS,
} from "@/lib/constants";
import ImageWithFallback from "@/components/common/ImageWithFallback";

// Validation schema
const editApartmentSchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  price: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  detailedDescription: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(10, VALIDATION_MESSAGES.MIN_LENGTH(10)),
  area: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  numberBedroom: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  numberBathroom: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  floor: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  direction: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  interior: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  status: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
  isSell: z.boolean(),
  alias: z.string().min(1, VALIDATION_MESSAGES.REQUIRED),
});

type EditApartmentForm = z.infer<typeof editApartmentSchema>;

const EditApartment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic fields
  const [highlights, setHighlights] = useState<string[]>([]);
  const [legalInfo, setLegalInfo] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [newLegalInfo, setNewLegalInfo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditApartmentForm>({
    resolver: zodResolver(editApartmentSchema),
  });

  const isSell = watch("isSell");

  useEffect(() => {
    if (id) {
      loadApartment(id);
    }
  }, [id]);

  const loadApartment = async (apartmentId: string) => {
    try {
      setLoading(true);
      const response = await ApartmentService.getById(apartmentId);

      if (response.content) {
        const apt = response.content as any;
        setApartment(apt);

        // Set form values
        setValue("name", apt.name);
        setValue("price", apt.price);
        setValue("detailedDescription", apt.detailedDescription);
        setValue("area", apt.area);
        setValue("numberBedroom", apt.numberBedroom);
        setValue("numberBathroom", apt.numberBathroom);
        setValue("floor", apt.floor);
        setValue("direction", apt.direction);
        setValue("interior", apt.interior);
        setValue("status", apt.status);
        setValue("isSell", apt.isSell);
        setValue("alias", apt.alias);

        // Set dynamic fields
        setHighlights(apt.highlights || []);
      } else {
        navigate("/apartments");
      }
    } catch (error) {
      console.error("Error loading apartment:", error);
      navigate("/apartments");
    } finally {
      setLoading(false);
    }
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const addLegalInfo = () => {
    if (newLegalInfo.trim()) {
      setLegalInfo([...legalInfo, newLegalInfo.trim()]);
      setNewLegalInfo("");
    }
  };

  const removeLegalInfo = (index: number) => {
    setLegalInfo(legalInfo.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditApartmentForm) => {
    try {
      setIsSubmitting(true);

      const payload = {
        data: {
          ...data,
          highlights: highlights.join("\n"),
        },
        file: apartment?.files || [],
      };

      const response = await ApartmentService.update(id!, {
        data: payload.data,
        files: Array.isArray(payload.file) ? (payload.file as any) : undefined,
      });

      if (!response.error) {
        navigate("/apartments");
      } else {
        alert("Có lỗi xảy ra khi cập nhật căn hộ");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật căn hộ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Không tìm thấy căn hộ
        </h2>
        <p className="text-gray-600 mt-2">Căn hộ bạn tìm kiếm không tồn tại.</p>
        <Button onClick={() => navigate("/apartments")} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/apartments")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chỉnh sửa căn hộ
            </h1>
            <p className="text-gray-600 mt-1">{apartment.name}</p>
          </div>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu căn hộ
            </>
          )}
        </Button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Management */}
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh căn hộ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {apartment.files && apartment.files.length > 0 ? (
                    <ImageWithFallback
                      src={apartment.files[0]}
                      alt={apartment.name}
                      className="h-full w-full"
                      fallbackType="apartment"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Chưa có hình ảnh</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Image Button */}
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Thêm ảnh
                </Button>

                {/* Thumbnail Gallery */}
                {apartment.files && apartment.files.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {apartment.files.slice(1).map((file, index) => (
                      <div
                        key={index}
                        className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 group"
                      >
                        <ImageWithFallback
                          src={file}
                          alt={`${apartment.name} - Hình ${index + 2}`}
                          className="h-full w-full"
                          fallbackType="apartment"
                        />
                        <button className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Nhập mô tả chi tiết về căn hộ..."
                rows={4}
                {...register("detailedDescription")}
                className={errors.detailedDescription ? "border-red-500" : ""}
              />
              {errors.detailedDescription && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.detailedDescription.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Đặc điểm nổi bật</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <Input
                      value={highlight}
                      onChange={(e) => {
                        const next = [...highlights];
                        next[index] = e.target.value;
                        setHighlights(next);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHighlight(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nhập đặc điểm nổi bật..."
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addHighlight()}
                  />
                  <Button
                    type="button"
                    onClick={addHighlight}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Pháp lý</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {legalInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <Input
                      value={info}
                      onChange={(e) => {
                        const next = [...legalInfo];
                        next[index] = e.target.value;
                        setLegalInfo(next);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLegalInfo(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nhập thông tin pháp lý..."
                    value={newLegalInfo}
                    onChange={(e) => setNewLegalInfo(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addLegalInfo()}
                  />
                  <Button
                    type="button"
                    onClick={addLegalInfo}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Apartment Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin căn hộ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Apartment Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên căn hộ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Alias */}
              <div className="space-y-2">
                <Label htmlFor="alias">Alias</Label>
                <Input id="alias" {...register("alias")} />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Giá <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  {...register("price")}
                  placeholder="Nhập giá..."
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              {/* Type (Sell/Rent) */}
              <div className="space-y-2">
                <Label>Loại</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={isSell}
                      onChange={() => setValue("isSell", true)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Bán</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!isSell}
                      onChange={() => setValue("isSell", false)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Cho thuê</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select onValueChange={(value) => setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {APARTMENT_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <Label htmlFor="area">
                  Diện tích (m²) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="area"
                  {...register("area")}
                  className={errors.area ? "border-red-500" : ""}
                />
                {errors.area && (
                  <p className="text-sm text-red-500">{errors.area.message}</p>
                )}
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <Label htmlFor="numberBedroom">Phòng ngủ</Label>
                <Select
                  onValueChange={(value) => setValue("numberBedroom", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số phòng ngủ" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} phòng
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <Label htmlFor="numberBathroom">Phòng tắm</Label>
                <Select
                  onValueChange={(value) => setValue("numberBathroom", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số phòng tắm" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} phòng
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Floor */}
              <div className="space-y-2">
                <Label htmlFor="floor">
                  Tầng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="floor"
                  {...register("floor")}
                  placeholder="0-50"
                  className={errors.floor ? "border-red-500" : ""}
                />
                {errors.floor && (
                  <p className="text-sm text-red-500">{errors.floor.message}</p>
                )}
              </div>

              {/* Direction */}
              <div className="space-y-2">
                <Label htmlFor="direction">Hướng</Label>
                <Select onValueChange={(value) => setValue("direction", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hướng" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((direction) => (
                      <SelectItem key={direction.value} value={direction.value}>
                        {direction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interior */}
              <div className="space-y-2">
                <Label htmlFor="interior">Nội thất</Label>
                <Select onValueChange={(value) => setValue("interior", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại nội thất" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERIOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditApartment;
