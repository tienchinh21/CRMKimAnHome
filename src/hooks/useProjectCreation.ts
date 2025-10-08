import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationService from "@/services/api/LocationService";
import ProjectService from "@/services/api/ProjectService";
import type {
  ProjectResponseData,
  DetailItem,
} from "@/lib/validations/projectValidation";

interface SavingProgress {
  step: string;
  progress: number;
}

export const useProjectCreation = () => {
  const navigate = useNavigate();

  // Project creation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectCreated, setProjectCreated] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [createdProjectData, setCreatedProjectData] =
    useState<ProjectResponseData | null>(null);
  const [savingProgress, setSavingProgress] = useState<SavingProgress | null>(
    null
  );

  // Project data states
  const [name, setName] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [details, setDetails] = useState<DetailItem[]>([]);
  const [newDetail, setNewDetail] = useState<DetailItem>({
    name: "",
    data: "",
  });

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

  // Create basic project with images
  const createBasicProject = async (fullAddress: string) => {
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

      // Create basic project data
      const projectData = {
        name,
        longitude: extractedCoords.lng.toString(),
        latitude: extractedCoords.lat.toString(),
        fullAddress,
      };

      // Create project with images using new API
      const createRes = await ProjectService.createProjectWithImages(
        projectData,
        imageFiles
      );

      // Store complete response data
      setCreatedProjectData(createRes.data);

      // Handle response - data might be in content or directly
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
        // Fallback: create temporary ID if API doesn't return ID
        projectId = `temp_${Date.now()}`;
        console.warn(
          "⚠️ API không trả về project ID, sử dụng ID tạm thời:",
          projectId
        );
      }

      setCreatedProjectId(projectId);
      setProjectCreated(true);

      return projectId;
    } catch (error) {
      console.error("❌ Error creating project:", error);
      alert(
        `Có lỗi xảy ra khi tạo dự án: ${(error as any)?.message || "Unknown"}`
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save project details
  const saveProjectDetails = async () => {
    try {
      setIsSubmitting(true);

      const results = {
        images: 0,
        details: 0,
        amenities: 0,
      };

      const totalSteps = 2;
      let currentStep = 0;

      // Step 1: Project with images already created
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

      // Step 2: Save project details if available
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

          // Create project details - API accepts array
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

      // Complete
      setSavingProgress({ step: "Hoàn thành!", progress: 100 });
      console.log("🎉 All details saved successfully:", results);

      // Success message
      const successMessage =
        `Dự án đã được tạo thành công!\n\n` +
        `📸 Hình ảnh: ${results.images} ảnh (đã upload cùng dự án)\n` +
        `📝 Chi tiết: ${results.details} mục\n` +
        `🏢 Tiện ích: ${results.amenities} mục`;

      alert(successMessage);

      // Warning if using temporary project ID
      if (createdProjectId && createdProjectId.startsWith("temp_")) {
        console.warn(
          "⚠️ Project created with temporary ID - some features may not work until server provides real ID"
        );
      }

      // Navigate after 1.5 seconds to let user see the message
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

  return {
    // States
    isSubmitting,
    projectCreated,
    createdProjectId,
    createdProjectData,
    savingProgress,
    name,
    googleMapsUrl,
    coordinates,
    images,
    imageFiles,
    details,
    newDetail,

    // Setters
    setName,
    setGoogleMapsUrl,
    setCoordinates,
    setImages,
    setImageFiles,
    setDetails,
    setNewDetail,

    // Methods
    createBasicProject,
    saveProjectDetails,
    getProjectInfo,
  };
};
