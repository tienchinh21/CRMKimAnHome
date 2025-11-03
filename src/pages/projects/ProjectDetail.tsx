import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import type { Project } from "@/types";
import ProjectService from "@/services/api/ProjectService";
import { formatDate } from "@/lib/utils";
import Breadcrumb from "@/components/common/breadcrumb";
import ProjectImageGallery from "@/components/projects/ProjectImageGallery";
import ImageEditor from "@/components/common/ImageEditor";
import ProjectInfoCard from "@/components/projects/ProjectInfoCard";
import ProjectDetailsDisplay from "@/components/projects/ProjectDetailsDisplay";
import ProjectAmenitiesDisplay from "@/components/projects/ProjectAmenitiesDisplay";
import CreateProjectDetails from "@/components/forms/CreateProjectDetails";
import CreateProjectAmenities from "@/components/forms/CreateProjectAmenities";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Display data states
  type DetailItem = { id?: string; name: string; data: string };
  const [details, setDetails] = useState<DetailItem[]>([]);
  const [originalDetails, setOriginalDetails] = useState<DetailItem[]>([]);

  type ParentAmenity = { id?: string; name: string };
  type ChildAmenity = {
    id?: string;
    name: string;
    parentName: string;
    parentId?: string;
  };
  const [parentAmenities, setParentAmenities] = useState<ParentAmenity[]>([]);
  const [childAmenities, setChildAmenities] = useState<ChildAmenity[]>([]);
  const [originalParentAmenities, setOriginalParentAmenities] = useState<
    ParentAmenity[]
  >([]);
  const [originalChildAmenities, setOriginalChildAmenities] = useState<
    ChildAmenity[]
  >([]);

  // Loading states for amenities
  const [creatingParentAmenity, setCreatingParentAmenity] = useState(false);
  const [creatingChildAmenity, setCreatingChildAmenity] = useState(false);

  // Image management states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  // Project basic info edit states
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectLongitude, setProjectLongitude] = useState("");
  const [projectLatitude, setProjectLatitude] = useState("");

  // Edit form states
  const [newDetail, setNewDetail] = useState<DetailItem>({
    name: "",
    data: "",
  });
  const [newParentAmenity, setNewParentAmenity] = useState("");
  const [newChildAmenity, setNewChildAmenity] = useState<ChildAmenity>({
    name: "",
    parentName: "",
    parentId: "",
  });

  useEffect(() => {
    if (id) {
      loadProjectData(id);
    }
  }, [id]);

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Clear saved images from localStorage when leaving the page
      if (project?.images && project.images.length > 0) {
        for (const imageUrl of project.images) {
          const url = typeof imageUrl === "string" ? imageUrl : imageUrl.url;
          const imageKey = `project_image_${id}_${url.split("/").pop()}`;
          localStorage.removeItem(imageKey);
        }
      }
    };
  }, [project?.images, id]);

  const loadAmenities = async () => {
    if (!id) return;

    try {
      const amenitiesRes = await ProjectService.getAmenitiesByProjectId(id);

      const list = amenitiesRes.data?.content || amenitiesRes.data || [];

      // Tách tiện ích cha và con
      const parents: ParentAmenity[] = [];
      const children: ChildAmenity[] = [];

      list.forEach((amenity: any) => {
        if (amenity.parentId === null) {
          // Tiện ích cha
          parents.push({
            id: amenity.id,
            name: amenity.name,
          });
        } else {
          // Tiện ích con - cần tìm tên parent
          const parent = list.find((p: any) => p.id === amenity.parentId);
          children.push({
            id: amenity.id,
            name: amenity.name,
            parentName: parent?.name || "",
            parentId: amenity.parentId,
          });
        }
      });

      setParentAmenities(parents);
      setChildAmenities(children);
      setOriginalParentAmenities([...parents]);
      setOriginalChildAmenities([...children]);
    } catch (error) {
      console.error("Error loading amenities:", error);
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      setLoading(true);

      const projectRes = await ProjectService.getProjectById(projectId);
      const projectData = projectRes.data?.content || projectRes.data;

      if (!projectData) {
        navigate("/projects");
        return;
      }

      const images = (projectData.images || []).map(
        (img: any) => img.url || img
      );
      setProject({ ...(projectData as any), images });

      // Save images to localStorage for later use in updates
      if (images && images.length > 0) {
        for (const imageUrl of images) {
          const imageKey = `project_image_${projectId}_${imageUrl
            .split("/")
            .pop()}`;
          if (!localStorage.getItem(imageKey)) {
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = (reader.result as string).split(",")[1];
                localStorage.setItem(imageKey, base64);
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error(
                "Error saving image to localStorage:",
                imageUrl,
                error
              );
            }
          }
        }
      }

      setProjectName(projectData.name || "");
      setProjectAddress(projectData.fullAddress || "");
      setProjectLongitude(projectData.longitude?.toString() || "");
      setProjectLatitude(projectData.latitude?.toString() || "");

      if (
        projectData.projectInformations &&
        Array.isArray(projectData.projectInformations)
      ) {
        const mappedDetails: DetailItem[] = projectData.projectInformations.map(
          (d: any) => ({
            id: d.id,
            name: d.name || "",
            data: d.data || "",
          })
        );
        setDetails(mappedDetails);
        setOriginalDetails([...mappedDetails]);
      }

      await loadAmenities();
    } catch (error) {
      console.error("Error loading project data:", error);
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Clear saved images from localStorage when canceling edit
    if (project?.images && project.images.length > 0) {
      for (const imageUrl of project.images) {
        const url = typeof imageUrl === "string" ? imageUrl : imageUrl.url;
        const imageKey = `project_image_${id}_${url.split("/").pop()}`;
        localStorage.removeItem(imageKey);
      }
    }

    setIsEditing(false);
    setDetails([...originalDetails]);
    setParentAmenities([...originalParentAmenities]);
    setChildAmenities([...originalChildAmenities]);
    setNewDetail({ name: "", data: "" });
    setNewParentAmenity("");
    setNewChildAmenity({ name: "", parentName: "", parentId: "" });
    setSelectedImages([]);
    setDeletedImages([]);
    // Reset project basic info
    if (project) {
      setProjectName(project.name || "");
      setProjectAddress(project.fullAddress || "");
      setProjectLongitude(project.longitude?.toString() || "");
      setProjectLatitude(project.latitude?.toString() || "");
    }
  };

  // Image management functions
  const handleImageSelect = (files: File[]) => {
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const handleImageRemove = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageDelete = (imageUrl: string) => {
    setDeletedImages((prev) => [...prev, imageUrl]);
    if (project) {
      setProject({
        ...project,
        images: (project.images || [])
          // @ts-ignore
          .filter((img) => {
            // Handle both string and ProjectImage types
            const url = typeof img === "string" ? img : img.url;
            return url !== imageUrl;
          })
          // @ts-ignore
          .map((img) => (typeof img === "string" ? img : img.url)),
      });
    }
  };

  const handleImageRestore = (imageUrl: string) => {
    setDeletedImages((prev) => prev.filter((url) => url !== imageUrl));
    if (project) {
      setProject({
        ...project,
        images: [...(project.images || []), imageUrl] as string[],
      });
    }
  };

  // Project details management functions
  const handleRemoveDetail = (index: number) => {
    console.log("🗑️ Removing detail at index:", index);
    console.log("📋 Details before removal:", details);
    // Just remove from local state, will be saved when user clicks "Lưu"
    setDetails((prev) => {
      const newDetails = prev.filter((_, i) => i !== index);
      console.log("📋 Details after removal:", newDetails);
      return newDetails;
    });
  };

  const handleAddParentAmenity = async () => {
    if (!newParentAmenity.trim() || !id) return;

    try {
      setCreatingParentAmenity(true);

      const amenityPayload = {
        name: newParentAmenity.trim(),
        projectId: id,
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

  const handleAddChildAmenity = async () => {
    if (!newChildAmenity.name.trim() || !newChildAmenity.parentId || !id)
      return;

    try {
      setCreatingChildAmenity(true);

      const amenityPayload = {
        name: newChildAmenity.name.trim(),
        projectId: id,
        parentId: newChildAmenity.parentId,
      };

      const response = await ProjectService.createAmenity(amenityPayload);
      const createdAmenity = response.data?.content || response.data;

      if (createdAmenity) {
        setNewChildAmenity({ name: "", parentName: "", parentId: "" });
        // Gọi lại API GET để refresh danh sách amenities
        await loadAmenities();
      }
    } catch (error) {
      console.error("Error creating child amenity:", error);
    } finally {
      setCreatingChildAmenity(false);
    }
  };

  const handleSave = async () => {
    if (!id || !project) return;

    console.log("💾 Starting save process...");
    console.log("🔍 Project ID:", id);
    console.log("📋 Details to save:", details);

    try {
      setSaving(true);

      const projectData = {
        name: projectName,
        longitude: projectLongitude,
        latitude: projectLatitude,
        fullAddress: projectAddress,
      };

      // Prepare all images to keep (existing images not deleted + new images)
      const imagesToKeep: File[] = [...selectedImages];

      // Add existing images that are not marked for deletion
      if (project.images && project.images.length > 0) {
        for (const imageUrl of project.images) {
          const url = typeof imageUrl === "string" ? imageUrl : imageUrl.url;
          // Skip if this image is marked for deletion
          if (!deletedImages.includes(url)) {
            // Try to get the image from localStorage first
            const savedImageKey = `project_image_${id}_${url.split("/").pop()}`;
            const savedImageData = localStorage.getItem(savedImageKey);

            if (savedImageData) {
              try {
                // Convert base64 back to File
                const byteCharacters = atob(savedImageData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const fileName = url.split("/").pop() || "image.jpg";
                const file = new File([byteArray], fileName, {
                  type: "image/jpeg",
                });
                imagesToKeep.push(file);
              } catch (error) {
                console.error("Error converting saved image to File:", error);
              }
            } else {
              // If not in localStorage, try to fetch from URL
              try {
                const response = await fetch(url);
                const blob = await response.blob();
                const fileName = url.split("/").pop() || "image.jpg";
                const file = new File([blob], fileName, { type: blob.type });
                imagesToKeep.push(file);
              } catch (error) {
                console.error("Error fetching image from URL:", url, error);
              }
            }
          }
        }
      }

      // Update project basic info with all images (existing + new)
      await ProjectService.updateProjectWithImages(
        id,
        projectData,
        imagesToKeep
      );

      // Update project details (if any)
      if (details.length > 0) {
        console.log("📝 Processing project details...");
        const detailPayloads = details.map((detail, idx) => ({
          name: detail.name,
          data: detail.data,
          sortOrder: idx + 1,
          projectId: id,
        }));
        console.log("📤 Detail payloads:", detailPayloads);

        // Use PUT API to update all project information
        console.log("🌐 Calling updateProjectInformation API...");
        await ProjectService.updateProjectInformation(id, detailPayloads);
        console.log("✅ Project information updated successfully");
      } else {
        console.log("📝 No details to save");
      }

      // Update original data
      setOriginalDetails([...details]);
      setOriginalParentAmenities([...parentAmenities]);
      setOriginalChildAmenities([...childAmenities]);

      // Reset image states
      setSelectedImages([]);
      setDeletedImages([]);

      setIsEditing(false);

      // Clear saved images from localStorage after successful update
      if (project.images && project.images.length > 0) {
        for (const imageUrl of project.images) {
          const url = typeof imageUrl === "string" ? imageUrl : imageUrl.url;
          const imageKey = `project_image_${id}_${url.split("/").pop()}`;
          localStorage.removeItem(imageKey);
        }
      }

      // Show success message
      toast.success("Cập nhật dự án thành công!");

      // Reload project data to get updated info
      await loadProjectData(id);
    } catch (error) {
      console.error("Error saving project details:", error);
      toast.error(
        `Có lỗi xảy ra khi cập nhật dự án: ${
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="lg:col-span-7">
                <div className="space-y-6">
                  <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy dự án
          </h2>
          <p className="text-gray-600 mb-8">
            Dự án bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button
            onClick={() => navigate("/projects")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate("/projects")}
                className="h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <Breadcrumb projectName={project.name} />
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  {project.name}
                </h1>
              </div>
            </div>

            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
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
                    images={(project.images || []).map((img) =>
                      typeof img === "string" ? img : img.url
                    )}
                    selectedImages={selectedImages}
                    deletedImages={deletedImages}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    onImageDelete={handleImageDelete}
                    onImageRestore={handleImageRestore}
                    fallbackType="project"
                    title="Hình ảnh dự án"
                  />
                </div>
              ) : (
                <ProjectImageGallery
                  name={project.name}
                  images={(project.images || []).map((img) =>
                    typeof img === "string" ? img : img.url
                  )}
                />
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
                      Thông tin dự án
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Tên dự án
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập tên dự án..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        value={projectAddress}
                        onChange={(e) => setProjectAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Nhập địa chỉ đầy đủ..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Kinh độ
                      </label>
                      <input
                        type="text"
                        value={projectLongitude}
                        onChange={(e) => setProjectLongitude(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="VD: 106.6297"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Vĩ độ
                      </label>
                      <input
                        type="text"
                        value={projectLatitude}
                        onChange={(e) => setProjectLatitude(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="VD: 10.8231"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <p>
                        <strong>Tạo lúc:</strong>{" "}
                        {formatDate(project.createdAt)}
                      </p>
                      <p>
                        <strong>Cập nhật lúc:</strong>{" "}
                        {formatDate(project.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <ProjectInfoCard
                  fullAddress={project.fullAddress || "Chưa cập nhật"}
                  name={project.name}
                  createdAt={project.createdAt}
                  updatedAt={project.updatedAt}
                  formatDate={formatDate}
                />
              )}
            </div>
          </div>
        </div>

        {/* Details and Amenities Sections */}
        <div className="space-y-8">
          {!isEditing ? (
            <>
              {/* Project Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Chi tiết dự án
                  </h2>
                </div>
                <div className="p-6">
                  <ProjectDetailsDisplay details={details} />
                </div>
              </div>

              {/* Project Amenities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tiện ích dự án
                  </h2>
                </div>
                <div className="p-6">
                  <ProjectAmenitiesDisplay
                    parentAmenities={parentAmenities}
                    childAmenities={childAmenities}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Edit Project Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Chỉnh sửa chi tiết dự án
                    </h2>
                    <Button
                      onClick={() => {
                        console.log("🧪 Test API call");
                        const testDetails = [
                          {
                            name: "Test",
                            data: "Test Data",
                            sortOrder: 1,
                            projectId: id!,
                          },
                        ];
                        ProjectService.updateProjectInformation(
                          id!,
                          testDetails
                        );
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Test API
                    </Button>
                  </div>
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
                      console.log("➕ Adding new detail:", newDetail);
                      console.log("📋 Details before adding:", details);
                      setDetails([...details, newDetail]);
                      setNewDetail({ name: "", data: "" });
                      console.log("📋 Details after adding:", [
                        ...details,
                        newDetail,
                      ]);
                    }}
                    onUpdate={(index, field, value) => {
                      const next = [...details];
                      (next[index] as any)[field] = value;
                      setDetails(next);
                    }}
                    onRemove={handleRemoveDetail}
                  />
                </div>
              </div>

              {/* Edit Project Amenities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Chỉnh sửa tiện ích dự án
                  </h2>
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
                    onChangeChild={(f, v) => {
                      setNewChildAmenity((prev) => ({ ...prev, [f]: v }));
                    }}
                    onAddChild={handleAddChildAmenity}
                    onRemoveChild={(i) =>
                      setChildAmenities(
                        childAmenities.filter((_, idx) => idx !== i)
                      )
                    }
                    creatingParentAmenity={creatingParentAmenity}
                    creatingChildAmenity={creatingChildAmenity}
                    onUpdateParent={async (amenityId, newName) => {
                      try {
                        await ProjectService.updateAmenity(amenityId, {
                          name: newName,
                          projectId: id, // projectId = project ID từ URL params
                          parentId: null, // parent amenity có parentId = null
                        });
                        // Chỉ refresh amenities, không gọi loadProjectData
                        if (id) {
                          await loadAmenities();
                        }
                      } catch (error) {
                        console.error("Error updating parent amenity:", error);
                      }
                    }}
                    onUpdateChild={async (amenityId, newName, parentId) => {
                      try {
                        await ProjectService.updateAmenity(amenityId, {
                          name: newName,
                          projectId: id, // projectId = project ID từ URL params
                          parentId: parentId, // child amenity có parentId
                        });
                        // Chỉ refresh amenities, không gọi loadProjectData
                        if (id) {
                          await loadAmenities();
                        }
                      } catch (error) {
                        console.error("Error updating child amenity:", error);
                      }
                    }}
                    onDeleteParent={async (amenityId) => {
                      try {
                        await ProjectService.deleteAmenity(amenityId);
                        if (id) {
                          await loadAmenities();
                        }
                      } catch (error) {
                        console.error("Error deleting parent amenity:", error);
                      }
                    }}
                    onDeleteChild={async (amenityId) => {
                      try {
                        await ProjectService.deleteAmenity(amenityId);
                        if (id) {
                          await loadAmenities();
                        }
                      } catch (error) {
                        console.error("Error deleting child amenity:", error);
                      }
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
