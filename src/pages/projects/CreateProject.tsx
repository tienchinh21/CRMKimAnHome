import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
// UI-first: tạm thời không dùng API/Types ở trang này
import { VALIDATION_MESSAGES } from "@/lib/constants";
import Breadcrumb from "@/components/common/breadcrumb";
import CreateProjectBasic from "@/components/forms/CreateProjectBasic";
import CreateProjectImages from "@/components/forms/CreateProjectImages";
import CreateProjectDetails from "@/components/forms/CreateProjectDetails";
import CreateProjectAmenities from "@/components/forms/CreateProjectAmenities";
import ProjectService from "@/services/api/ProjectService";
import LocationService from "@/services/api/LocationService";

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

// Validation schema
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  googleMapsUrl: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED)
    .refine(
      (url) => isValidGoogleMapsUrl(url),
      "Vui lòng nhập link Google Maps hợp lệ"
    ),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

// Interface for project response data
interface ProjectResponseData {
  error: any;
  content: {
    id: string;
    name: string;
    longitude: string | null;
    latitude: string | null;
    fullAddress: string | null;
    createdAt: string;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
  };
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdProjectData, setCreatedProjectData] =
    useState<ProjectResponseData | null>(null);
  const [savingProgress, setSavingProgress] = useState<{
    step: string;
    progress: number;
  } | null>(null);

  // Basic project info
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Location selection states
  const [provinces, setProvinces] = useState<
    { value: string; label: string }[]
  >([]);
  const [districts, setDistricts] = useState<
    { value: string; label: string }[]
  >([]);
  const [wards, setWards] = useState<{ value: string; label: string }[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Extra states - only available after project is created
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  type DetailItem = { name: string; data: string };
  const [details, setDetails] = useState<DetailItem[]>([]);
  const [newDetail, setNewDetail] = useState<DetailItem>({
    name: "",
    data: "",
  });

  type ParentAmenity = { id?: string; name: string };
  type ChildAmenity = { name: string; parentName: string; parentId?: string };
  const [parentAmenities, setParentAmenities] = useState<ParentAmenity[]>([]);
  const [childAmenities, setChildAmenities] = useState<ChildAmenity[]>([]);
  const [newParentAmenity, setNewParentAmenity] = useState("");
  const [newChildAmenity, setNewChildAmenity] = useState<ChildAmenity>({
    name: "",
    parentName: "",
  });

  // Loading states for amenities
  const [creatingParentAmenity, setCreatingParentAmenity] = useState(false);
  const [creatingChildAmenity, setCreatingChildAmenity] = useState(false);

  useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  });

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const provincesData = await LocationService.getProvinces();

        if (provincesData && provincesData.length > 0) {
          const provinceOptions = provincesData.map((province) => ({
            value: province.code.toString(),
            label: province.name,
          }));
          setProvinces(provinceOptions);
        } else {
          console.warn("No provinces data received");
        }
      } catch (error) {
        console.error("Error loading provinces:", error);
        alert("Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại.");
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        try {
          setLoadingDistricts(true);
          const districtsData = await LocationService.getDistrictsByProvince(
            parseInt(selectedProvince)
          );

          if (districtsData && districtsData.length > 0) {
            const districtOptions = districtsData.map((district) => ({
              value: district.code.toString(),
              label: district.name,
            }));
            setDistricts(districtOptions);
          } else {
            console.warn("No districts data received");
            setDistricts([]);
          }

          setSelectedDistrict("");
          setSelectedWard("");
          setWards([]);
        } catch (error) {
          console.error("Error loading districts:", error);
          alert("Không thể tải danh sách quận/huyện. Vui lòng thử lại.");
        } finally {
          setLoadingDistricts(false);
        }
      };

      loadDistricts();
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const loadWards = async () => {
        try {
          setLoadingWards(true);
          const wardsData = await LocationService.getWardsByDistrict(
            parseInt(selectedDistrict)
          );

          if (wardsData && wardsData.length > 0) {
            const wardOptions = wardsData.map((ward) => ({
              value: ward.code.toString(),
              label: ward.name,
            }));
            setWards(wardOptions);
          } else {
            console.warn("No wards data received");
            setWards([]);
          }

          setSelectedWard("");
        } catch (error) {
          console.error("Error loading wards:", error);
          alert("Không thể tải danh sách phường/xã. Vui lòng thử lại.");
        } finally {
          setLoadingWards(false);
        }
      };

      loadWards();
    }
  }, [selectedDistrict]);

  // Update full address when location changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const provinceName =
        provinces.find((p) => p.value === selectedProvince)?.label || "";
      const districtName =
        districts.find((d) => d.value === selectedDistrict)?.label || "";
      const wardName = wards.find((w) => w.value === selectedWard)?.label || "";

      // Tạo fullAddress = địa chỉ + xã + huyện + tỉnh
      const locationParts = [wardName, districtName, provinceName].filter(
        Boolean
      );
      const fullLocation = locationParts.join(", ");

      if (address.trim()) {
        setFullAddress(`${address.trim()}, ${fullLocation}`);
      } else {
        setFullAddress(fullLocation);
      }
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    provinces,
    districts,
    wards,
    address,
  ]);

  // Helper function to get project info from stored data
  const getProjectInfo = () => {
    if (!createdProjectData) return null;

    const content = createdProjectData.content || createdProjectData;
    return {
      id: content.id || createdProjectId,
      name: content.name || name,
      longitude: content.longitude,
      latitude: content.latitude,
      fullAddress: content.fullAddress,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      createdBy: content.createdBy,
      updatedBy: content.updatedBy,
    };
  };

  // Load amenities from API
  const loadAmenities = async () => {
    if (!createdProjectId || createdProjectId.startsWith("temp_")) {
      return;
    }

    try {
      const amenitiesRes = await ProjectService.getAmenitiesByProjectId(
        createdProjectId
      );

      const list = amenitiesRes.data?.content || amenitiesRes.data || [];

      // Tách tiện ích cha và con
      const parents: ParentAmenity[] = [];
      const children: ChildAmenity[] = [];

      list.forEach((amenity: any) => {
        if (amenity.parentId === null) {
          // Tiện ích cha
          parents.push({
            ...(amenity.id && { id: amenity.id }),
            name: amenity.name,
          });
        } else {
          // Tiện ích con - cần tìm tên parent
          const parent = list.find((p: any) => p.id === amenity.parentId);
          children.push({
            ...(amenity.id && { id: amenity.id }),
            name: amenity.name,
            parentName: parent?.name || "",
            parentId: amenity.parentId,
          });
        }
      });

      setParentAmenities(parents);
      setChildAmenities(children);
    } catch (error) {
      console.error("❌ Error loading amenities:", error);
    }
  };

  // Handle adding parent amenity with API call
  const handleAddParentAmenity = async () => {
    if (
      !newParentAmenity.trim() ||
      !createdProjectId ||
      createdProjectId.startsWith("temp_")
    )
      return;

    try {
      setCreatingParentAmenity(true);

      const amenityPayload = {
        name: newParentAmenity.trim(),
        projectId: createdProjectId,
        parentId: null,
      };

      const response = await ProjectService.createAmenity(amenityPayload);
      const createdAmenity = response.data?.content || response.data;

      if (createdAmenity) {
        setNewParentAmenity("");

        // Gọi lại API GET để refresh danh sách amenities
        await loadAmenities();
      }
    } catch (error) {
      console.error("Error creating parent amenity:", error);
    } finally {
      setCreatingParentAmenity(false);
    }
  };

  // Handle adding child amenity with API call
  const handleAddChildAmenity = async () => {
    if (
      !newChildAmenity.name.trim() ||
      !newChildAmenity.parentName ||
      !createdProjectId ||
      createdProjectId.startsWith("temp_")
    )
      return;

    try {
      setCreatingChildAmenity(true);

      // Find parent amenity to get ID
      const parentAmenity = parentAmenities.find(
        (p) => p.name === newChildAmenity.parentName
      );
      if (!parentAmenity || !parentAmenity.id) {
        console.error("Parent amenity not found or no ID");
        return;
      }

      const amenityPayload = {
        name: newChildAmenity.name.trim(),
        projectId: createdProjectId,
        parentId: parentAmenity.id,
      };

      const response = await ProjectService.createAmenity(amenityPayload);
      const createdAmenity = response.data?.content || response.data;

      if (createdAmenity) {
        setNewChildAmenity({ name: "", parentName: "" });

        // Gọi lại API GET để refresh danh sách amenities
        await loadAmenities();
      }
    } catch (error) {
      console.error("Error creating child amenity:", error);
    } finally {
      setCreatingChildAmenity(false);
    }
  };

  const createBasicProject = async () => {
    try {
      setIsSubmitting(true);

      // Extract coordinates from Google Maps URL
      const extractedCoords =
        LocationService.extractCoordinatesFromUrl(googleMapsUrl);
      if (!extractedCoords) {
        alert(
          "Không thể trích xuất tọa độ từ URL Google Maps. Vui lòng kiểm tra lại URL."
        );
        return;
      }

      setCoordinates(extractedCoords);

      // Tạo dự án cơ bản theo API schema mới
      const projectData = {
        name,
        longitude: extractedCoords.lng.toString(),
        latitude: extractedCoords.lat.toString(),
        fullAddress,
      };

      // Sử dụng API mới để tạo project với ảnh ngay từ step 1
      const createRes = await ProjectService.createProjectWithImages(
        projectData,
        imageFiles
      );

      // Lưu trữ toàn bộ dữ liệu response
      setCreatedProjectData(createRes.data);

      // Xử lý response - có thể data nằm trong content hoặc trực tiếp
      let projectId;
      if (createRes.data && createRes.data.id) {
        projectId = createRes.data.id;
      } else if (
        createRes.data &&
        createRes.data.content &&
        createRes.data.content.id
      ) {
        projectId = createRes.data.content.id;
      } else {
        // Fallback: tạo ID tạm thời nếu API không trả về ID
        projectId = `temp_${Date.now()}`;
        console.warn(
          "⚠️ API không trả về project ID, sử dụng ID tạm thời:",
          projectId
        );
      }

      setCreatedProjectId(projectId);
      setProjectCreated(true);

      // Load amenities sau khi tạo project thành công
      await loadAmenities();
    } catch (error) {
      console.error("❌ Error creating project:", error);
      alert(
        `Có lỗi xảy ra khi tạo dự án: ${(error as any)?.message || "Unknown"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProjectDetails = async () => {
    try {
      setIsSubmitting(true);

      const results = {
        images: 0,
        details: 0,
        amenities: 0,
      };

      const totalSteps = 2; // Chỉ còn 2 steps: 1) Tạo project với ảnh, 2) Chi tiết & tiện ích
      let currentStep = 0;

      // 1) Đã tạo dự án với ảnh ở step 1
      if (imageFiles.length > 0) {
        setSavingProgress({
          step: "Đã tạo dự án với hình ảnh...",
          progress: (++currentStep / totalSteps) * 100,
        });
        results.images = imageFiles.length;
      } else {
        setSavingProgress({
          step: "Đã tạo dự án...",
          progress: (++currentStep / totalSteps) * 100,
        });
      }

      // 2) Gửi chi tiết dự án nếu có (chỉ khi có project ID thật)
      if (
        createdProjectId &&
        !createdProjectId.startsWith("temp_") &&
        details.length > 0
      ) {
        try {
          setSavingProgress({
            step: "Đang lưu chi tiết dự án...",
            progress: (++currentStep / totalSteps) * 100,
          });

          // Tạo chi tiết dự án - API nhận array
          const detailPayloads = details.map((detail, idx) => ({
            name: detail.name,
            data: detail.data,
            sortOrder: idx + 1,
            projectId: createdProjectId,
          }));

          const detailsRes = await ProjectService.createProjectDetails(
            detailPayloads
          );
          console.log("📝 Project details response:", detailsRes.data);

          results.details = details.length;
          console.log("✅ Project details created:", results.details);
        } catch (error) {
          console.error("❌ Error creating project details:", error);
          throw new Error("Lỗi khi tạo chi tiết dự án");
        }
      } else {
        if (createdProjectId && createdProjectId.startsWith("temp_")) {
          console.log(
            "📝 Skipping project details - using temporary project ID, server may not support it"
          );
        } else {
          console.log(
            "📝 Skipping project details - no details or no project ID"
          );
        }
        currentStep++;
      }

      // 3) Amenities đã được tạo trong step 2, chỉ cần đếm
      if (parentAmenities.length > 0 || childAmenities.length > 0) {
        setSavingProgress({
          step: "Đang kiểm tra tiện ích...",
          progress: (++currentStep / totalSteps) * 100,
        });
        results.amenities = parentAmenities.length + childAmenities.length;
        console.log("✅ Amenities already created:", results.amenities);
      } else {
        console.log("🏢 No amenities to process");
        currentStep++;
      }

      // Hoàn thành
      setSavingProgress({ step: "Hoàn thành!", progress: 100 });
      console.log("🎉 All details saved successfully:", results);

      // Thông báo thành công
      const successMessage =
        `Dự án đã được tạo thành công!\n\n` +
        `📸 Hình ảnh: ${results.images} ảnh (đã upload cùng dự án)\n` +
        `📝 Chi tiết: ${results.details} mục\n` +
        `🏢 Tiện ích: ${results.amenities} mục`;

      alert(successMessage);

      // Thông báo nếu sử dụng project ID tạm thời
      if (createdProjectId && createdProjectId.startsWith("temp_")) {
        console.warn(
          "⚠️ Project created with temporary ID - some features may not work until server provides real ID"
        );
      }

      // Chuyển hướng sau 1.5 giây để user thấy thông báo
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (error) {
      console.error("❌ Error saving project details:", error);
      setSavingProgress(null);
      alert(
        `Có lỗi xảy ra khi lưu chi tiết dự án: ${
          (error as any)?.message || "Unknown"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-6xl">
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
              onClick={() => navigate("/projects")}
              className="hover:bg-white/80 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Tạo dự án mới
              </h1>
              <p className="text-gray-600 mt-1 text-base">
                Nhập thông tin cơ bản để tạo dự án bất động sản mới
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex items-center space-x-3 ${
                projectCreated ? "text-green-600" : "text-blue-600"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  projectCreated
                    ? "bg-green-100 text-green-600 border-2 border-green-200"
                    : "bg-blue-100 text-blue-600 border-2 border-blue-200"
                }`}
              >
                1
              </div>
              <span className="text-lg font-semibold">
                Thông tin cơ bản & Ảnh
              </span>
            </div>
            <div
              className={`w-24 h-1 rounded-full ${
                projectCreated ? "bg-green-300" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center space-x-3 ${
                projectCreated ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  projectCreated
                    ? "bg-blue-100 text-blue-600 border-2 border-blue-200"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                }`}
              >
                2
              </div>
              <span className="text-lg font-semibold">Chi tiết & Tiện ích</span>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {!projectCreated && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createBasicProject();
            }}
            className="space-y-8"
          >
            <CreateProjectBasic
              name={name}
              address={address}
              googleMapsUrl={googleMapsUrl}
              onChange={(f: string, v: string) => {
                if (f === "name") setName(v);
                else if (f === "address") setAddress(v);
                else setGoogleMapsUrl(v);
              }}
              onCoordinatesChange={setCoordinates}
              provinces={provinces}
              districts={districts}
              wards={wards}
              selectedProvince={selectedProvince}
              selectedDistrict={selectedDistrict}
              selectedWard={selectedWard}
              onProvinceChange={(value) => {
                console.log("Province changed:", value);
                setSelectedProvince(value);
              }}
              onDistrictChange={(value) => {
                console.log("District changed:", value);
                setSelectedDistrict(value);
              }}
              onWardChange={(value) => {
                console.log("Ward changed:", value);
                setSelectedWard(value);
              }}
              fullAddress={fullAddress}
              loadingProvinces={loadingProvinces}
              loadingDistricts={loadingDistricts}
              loadingWards={loadingWards}
            />

            {/* Hình ảnh dự án */}
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
                  onUpload={(files) => {
                    if (!files || files.length === 0) return;
                    const nextUrls: string[] = [];
                    const nextFiles: File[] = [];
                    for (let i = 0; i < files.length; i++) {
                      const f = files[i]!;
                      nextFiles.push(f);
                      nextUrls.push(URL.createObjectURL(f));
                    }
                    setImages((prev) => [...prev, ...nextUrls]);
                    setImageFiles((prev) => [...prev, ...nextFiles]);
                  }}
                  onRemove={(idx) => {
                    setImages(images.filter((_, i) => i !== idx));
                    setImageFiles(imageFiles.filter((_, i) => i !== idx));
                  }}
                />
              </div>
            </div>

            {/* Action Buttons for Step 1 */}
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
                disabled={
                  isSubmitting ||
                  !name.trim() ||
                  !address.trim() ||
                  !googleMapsUrl.trim() ||
                  !isValidGoogleMapsUrl(googleMapsUrl) ||
                  !coordinates ||
                  !selectedProvince ||
                  !selectedDistrict ||
                  !selectedWard
                }
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
        )}

        {/* Step 2: Details and Amenities */}
        {projectCreated && (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Dự án đã được tạo thành công
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Bây giờ hãy thêm chi tiết và tiện ích để hoàn thiện thông tin dự
                án
              </p>
            </div>

            {/* Project Info Display */}
            {(() => {
              const projectInfo = getProjectInfo();
              if (!projectInfo) return null;

              return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Thông tin dự án đã tạo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">ID dự án</p>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {projectInfo.id}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Tên dự án</p>
                      <p className="font-semibold text-gray-900">
                        {projectInfo.name}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                      <p className="text-sm text-gray-900">
                        {projectInfo.createdAt
                          ? new Date(projectInfo.createdAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                    </div>
                    {projectInfo.longitude && projectInfo.latitude && (
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Tọa độ</p>
                        <p className="text-sm text-gray-900">
                          {projectInfo.latitude}, {projectInfo.longitude}
                        </p>
                      </div>
                    )}
                    {projectInfo.fullAddress && (
                      <div className="bg-white rounded-lg p-4 border border-blue-100 lg:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">
                          Địa chỉ đầy đủ
                        </p>
                        <p className="text-sm text-gray-900">
                          {projectInfo.fullAddress}
                        </p>
                      </div>
                    )}
                    {projectInfo.createdBy && (
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Người tạo</p>
                        <p className="text-sm text-gray-900">
                          {projectInfo.createdBy}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Modern Loading Overlay */}
            {savingProgress && (
              <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                  <div className="text-center">
                    {/* Simple Spinner */}
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>

                    {/* Content */}
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {savingProgress.step}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Đang xử lý...</p>

                    {/* Simple Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-teal-600 h-1 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${savingProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Grid - Modern Minimalist */}
            <div className="space-y-8">
              {/* Chi tiết dự án */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chi tiết dự án
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Thêm thông tin chi tiết để khách hàng hiểu rõ hơn về dự án
                  </p>
                </div>
                <div className="p-6">
                  <CreateProjectDetails
                    details={details}
                    newDetail={newDetail}
                    onChangeNew={(field, value) =>
                      setNewDetail({ ...newDetail, [field]: value })
                    }
                    onAdd={() => {
                      if (!newDetail.name.trim() || !newDetail.data.trim())
                        return;
                      setDetails([...details, newDetail]);
                      setNewDetail({ name: "", data: "" });
                    }}
                    onUpdate={(index, field, value) => {
                      const arr = [...details];
                      (arr[index] as any)[field] = value;
                      setDetails(arr);
                    }}
                    onRemove={(index) =>
                      setDetails(details.filter((_, i) => i !== index))
                    }
                  />
                </div>
              </div>

              {/* Tiện ích */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tiện ích dự án
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Thêm các tiện ích và dịch vụ mà dự án cung cấp
                  </p>
                </div>
                <div className="p-6">
                  <CreateProjectAmenities
                    parentAmenities={parentAmenities}
                    childAmenities={childAmenities}
                    newParent={newParentAmenity}
                    newChild={newChildAmenity}
                    onChangeParent={setNewParentAmenity}
                    onAddParent={handleAddParentAmenity}
                    onRemoveParent={(i) =>
                      setParentAmenities(
                        parentAmenities.filter((_, idx) => idx !== i)
                      )
                    }
                    onChangeChild={(field, value) => {
                      setNewChildAmenity((prev) => ({
                        ...prev,
                        [field]: value,
                      }));
                    }}
                    onAddChild={handleAddChildAmenity}
                    onRemoveChild={(i) =>
                      setChildAmenities(
                        childAmenities.filter((_, idx) => idx !== i)
                      )
                    }
                    onUpdateParent={async (id, newName) => {
                      try {
                        await ProjectService.updateAmenity(id, {
                          name: newName,
                        });
                        await loadAmenities(); // Refresh data
                      } catch (error) {
                        console.error("Error updating parent amenity:", error);
                      }
                    }}
                    onUpdateChild={async (id, newName, parentId) => {
                      try {
                        await ProjectService.updateAmenity(id, {
                          name: newName,
                          parentId: parentId,
                        });
                        await loadAmenities(); // Refresh data
                      } catch (error) {
                        console.error("Error updating child amenity:", error);
                      }
                    }}
                    creatingParentAmenity={creatingParentAmenity}
                    creatingChildAmenity={creatingChildAmenity}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons - Modern */}
            <div className="flex justify-end gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/projects")}
                className="px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg transition-all duration-200"
              >
                Bỏ qua
              </Button>
              <Button
                type="button"
                onClick={saveProjectDetails}
                disabled={isSubmitting}
                className="px-8 py-3 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Hoàn thành
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProject;
