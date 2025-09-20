import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import SelectWithSearch from "@/components/common/SelectWithSearch";

interface Props {
  name: string;
  googleMapsUrl: string;
  onChange: (
    field: "name" | "googleMapsUrl" | "address",
    value: string
  ) => void;
  onCoordinatesChange?: (
    coordinates: { lat: number; lng: number } | null
  ) => void;
  // Location selection props
  provinces: { value: string; label: string }[];
  districts: { value: string; label: string }[];
  wards: { value: string; label: string }[];
  selectedProvince: string;
  selectedDistrict: string;
  selectedWard: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onWardChange: (value: string) => void;
  address: string;
  fullAddress: string;
  // Loading states
  loadingProvinces?: boolean;
  loadingDistricts?: boolean;
  loadingWards?: boolean;
}

// Validation function for Google Maps URL
const isValidGoogleMapsUrl = (url: string): boolean => {
  if (!url.trim()) return false;

  const googleMapsPatterns = [
    /^https:\/\/www\.google\.com\/maps\/place\/.+/,
    /^https:\/\/maps\.google\.com\/.+/,
    /^https:\/\/goo\.gl\/maps\/.+/,
    /^https:\/\/maps\.app\.goo\.gl\/.+/,
  ];

  return googleMapsPatterns.some((pattern) => pattern.test(url));
};

// Extract coordinates from Google Maps URL
const extractCoordinatesFromUrl = (
  url: string
): { lat: number; lng: number } | null => {
  try {
    // Pattern 1: @lat,lng,zoom
    const coordPattern1 = /@(-?\d+\.?\d*),(-?\d+\.?\d*),/;
    const match1 = url.match(coordPattern1);
    if (match1) {
      return {
        lat: parseFloat(match1[1]),
        lng: parseFloat(match1[2]),
      };
    }

    // Pattern 2: !3dlat!4dlng
    const coordPattern2 = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
    const match2 = url.match(coordPattern2);
    if (match2) {
      return {
        lat: parseFloat(match2[1]),
        lng: parseFloat(match2[2]),
      };
    }

    // Pattern 3: ll=lat,lng
    const coordPattern3 = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match3 = url.match(coordPattern3);
    if (match3) {
      return {
        lat: parseFloat(match3[1]),
        lng: parseFloat(match3[2]),
      };
    }

    return null;
  } catch (error) {
    console.error("Error extracting coordinates:", error);
    return null;
  }
};

const CreateProjectBasic: React.FC<Props> = ({
  name,
  googleMapsUrl,
  onChange,
  onCoordinatesChange,
  provinces,
  districts,
  wards,
  selectedProvince,
  selectedDistrict,
  selectedWard,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  address,
  fullAddress,
  loadingProvinces = false,
  loadingDistricts = false,
  loadingWards = false,
}) => {
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Validate URL and extract coordinates when googleMapsUrl changes
  useEffect(() => {
    if (googleMapsUrl.trim()) {
      const isValid = isValidGoogleMapsUrl(googleMapsUrl);
      setIsValidUrl(isValid);
      setShowValidation(true);

      if (isValid) {
        const coords = extractCoordinatesFromUrl(googleMapsUrl);
        onCoordinatesChange?.(coords);
      } else {
        onCoordinatesChange?.(null);
      }
    } else {
      setIsValidUrl(null);
      setShowValidation(false);
      onCoordinatesChange?.(null);
    }
  }, [googleMapsUrl, onCoordinatesChange]);

  const handleGoogleMapsUrlChange = (value: string) => {
    onChange("googleMapsUrl", value);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          Thông tin dự án
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Project Name */}
        <div className="space-y-4">
          <Label htmlFor="name" className="text-base font-medium text-gray-700">
            Tên dự án <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ví dụ: Vinhomes Grand Park"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            className="h-10 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Address Input */}
        <div className="space-y-4">
          <Label
            htmlFor="address"
            className="text-base font-medium text-gray-700 flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Địa chỉ cụ thể <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Ví dụ: 123 Đường ABC, Tòa nhà XYZ..."
            value={address}
            onChange={(e) => onChange("address", e.target.value)}
            className="h-10 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Location Selection */}
        <div className="space-y-6">
          <Label className="text-base font-medium text-gray-700 flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4" />
            Chọn khu vực <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectWithSearch
              label="Tỉnh/Thành phố"
              options={provinces}
              value={selectedProvince}
              onChange={onProvinceChange}
              placeholder={
                loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"
              }
              disabled={loadingProvinces}
              required
              className="w-full"
            />
            <SelectWithSearch
              label="Quận/Huyện"
              options={districts}
              value={selectedDistrict}
              onChange={onDistrictChange}
              placeholder={loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"}
              disabled={!selectedProvince || loadingDistricts}
              required
              className="w-full"
            />
            <SelectWithSearch
              label="Phường/Xã"
              options={wards}
              value={selectedWard}
              onChange={onWardChange}
              placeholder={loadingWards ? "Đang tải..." : "Chọn phường/xã"}
              disabled={!selectedDistrict || loadingWards}
              required
              className="w-full"
            />
          </div>
          {fullAddress && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Địa chỉ hoàn chỉnh:</strong> {fullAddress}
              </p>
            </div>
          )}
        </div>

        {/* Google Maps URL */}
        <div className="space-y-4">
          <Label
            htmlFor="googleMapsUrl"
            className="text-base font-medium text-gray-700 flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Link Google Maps <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            <Input
              id="googleMapsUrl"
              placeholder="Dán link Google Maps vào đây..."
              value={googleMapsUrl}
              onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
              className={`h-10 text-base transition-all duration-200 ${
                showValidation
                  ? isValidUrl
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                    : "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
          </div>

          {/* Validation feedback */}
          {showValidation && (
            <div className="space-y-2">
              <div
                className={`flex items-center gap-2 text-sm ${
                  isValidUrl ? "text-green-600" : "text-red-600"
                }`}
              >
                {isValidUrl ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Link Google Maps hợp lệ</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>Vui lòng nhập link Google Maps hợp lệ</span>
                  </>
                )}
              </div>

              {/* Display coordinates if available */}
              {/* {isValidUrl && coordinates && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Tọa độ đã trích xuất:</span>
                    </div>
                    <div className="mt-1 text-xs text-green-600 font-mono">
                      Kinh độ: {coordinates.lng.toFixed(6)} | Vĩ độ:{" "}
                      {coordinates.lat.toFixed(6)}
                    </div>
                  </div>
                )} */}

              {/* Warning if no coordinates found */}
              {/* {isValidUrl && !coordinates && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-yellow-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Cảnh báo:</span>
                    </div>
                    <div className="mt-1 text-xs text-yellow-600">
                      Không thể trích xuất tọa độ từ link này. Vui lòng sử dụng
                      link có chứa tọa độ cụ thể.
                    </div>
                  </div>
                )} */}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">
                  Hướng dẫn lấy link Google Maps:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Tìm địa điểm trên Google Maps</li>
                  <li>Sao chép URL từ thanh địa chỉ trình duyệt</li>
                  <li>Dán link vào ô trên</li>
                </ol>
                <p className="mt-2 text-xs text-blue-600">
                  Ví dụ:
                  https://www.google.com/maps/place/Chùa+Kim+Linh/@10.834607,106.781557,18.64z/...
                </p>
                <p className="mt-1 text-xs text-orange-600 font-medium">
                  ⚠️ Quan trọng: Link phải chứa tọa độ (@lat,lng) để hệ thống có
                  thể xử lý
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateProjectBasic;
