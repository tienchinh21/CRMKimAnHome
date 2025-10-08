import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import CreateProjectBasic from "@/components/forms/CreateProjectBasic";
import CreateProjectImages from "@/components/forms/CreateProjectImages";
import { isValidGoogleMapsUrl } from "@/lib/validations/projectValidation";

interface ProjectCreationStep1Props {
  // Basic project info
  name: string;
  address: string;
  googleMapsUrl: string;
  coordinates: { lat: number; lng: number } | null;

  // Location data
  provinces: { value: string; label: string }[];
  districts: { value: string; label: string }[];
  wards: { value: string; label: string }[];
  selectedProvince: string;
  selectedDistrict: string;
  selectedWard: string;
  fullAddress: string;

  // Loading states
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;

  // Images
  images: string[];
  imageFiles: File[];

  // Form state
  isSubmitting: boolean;

  // Handlers
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onGoogleMapsUrlChange: (value: string) => void;
  onCoordinatesChange: (
    coordinates: { lat: number; lng: number } | null
  ) => void;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onWardChange: (value: string) => void;
  onImagesUpload: (files: FileList) => void;
  onImageRemove: (index: number) => void;
  onSubmit: () => void;
}

const ProjectCreationStep1: React.FC<ProjectCreationStep1Props> = ({
  name,
  address,
  googleMapsUrl,
  coordinates,
  provinces,
  districts,
  wards,
  selectedProvince,
  selectedDistrict,
  selectedWard,
  fullAddress,
  loadingProvinces,
  loadingDistricts,
  loadingWards,
  images,
  imageFiles,
  isSubmitting,
  onNameChange,
  onAddressChange,
  onGoogleMapsUrlChange,
  onCoordinatesChange,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onImagesUpload,
  onImageRemove,
  onSubmit,
}) => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isFormValid =
    name.trim() &&
    address.trim() &&
    googleMapsUrl.trim() &&
    isValidGoogleMapsUrl(googleMapsUrl) &&
    coordinates &&
    selectedProvince &&
    selectedDistrict &&
    selectedWard;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <CreateProjectBasic
        name={name}
        address={address}
        googleMapsUrl={googleMapsUrl}
        onChange={(field: string, value: string) => {
          if (field === "name") onNameChange(value);
          else if (field === "address") onAddressChange(value);
          else if (field === "googleMapsUrl") onGoogleMapsUrlChange(value);
        }}
        onCoordinatesChange={onCoordinatesChange}
        provinces={provinces}
        districts={districts}
        wards={wards}
        selectedProvince={selectedProvince}
        selectedDistrict={selectedDistrict}
        selectedWard={selectedWard}
        onProvinceChange={onProvinceChange}
        onDistrictChange={onDistrictChange}
        onWardChange={onWardChange}
        fullAddress={fullAddress}
        loadingProvinces={loadingProvinces}
        loadingDistricts={loadingDistricts}
        loadingWards={loadingWards}
      />

      {/* Project Images */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Hình ảnh dự án
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Thêm hình ảnh để khách hàng có cái nhìn trực quan về dự án
          </p>
        </div>
        <div className="p-6">
          <CreateProjectImages
            images={images}
            onUpload={onImagesUpload}
            onRemove={onImageRemove}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/projects")}
          disabled={isSubmitting}
          className="px-6 py-3 h-12 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
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
              Tạo dự án
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProjectCreationStep1;
