import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "@/components/common/breadcrumb";
import ProjectCreationProgress from "@/components/projects/ProjectCreationProgress";
import ProjectCreationStep1 from "@/components/projects/ProjectCreationStep1";
import ProjectCreationStep2 from "@/components/projects/ProjectCreationStep2";
import SavingProgressModal from "@/components/projects/SavingProgressModal";
import { useLocationManagement } from "@/hooks/useLocationManagement";
import { useProjectCreation } from "@/hooks/useProjectCreation";
import { useAmenityManagement } from "@/hooks/useAmenityManagement";
import {
  createProjectSchema,
  type CreateProjectForm,
} from "@/lib/validations/projectValidation";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();

  // Form validation
  useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  });

  // Custom hooks
  const locationHook = useLocationManagement();
  const projectHook = useProjectCreation();
  const amenityHook = useAmenityManagement(projectHook.createdProjectId);

  // Load amenities when project is created
  useEffect(() => {
    if (projectHook.projectCreated && projectHook.createdProjectId) {
      amenityHook.loadAmenities();
    }
  }, [projectHook.projectCreated, projectHook.createdProjectId]);

  // Handle project creation
  const handleCreateProject = async () => {
    try {
      const projectId = await projectHook.createBasicProject(
        locationHook.fullAddress
      );
      if (projectId) {
        // Load amenities after project creation
        await amenityHook.loadAmenities();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Handle detail operations
  const handleDetailAdd = () => {
    if (
      !projectHook.newDetail.name.trim() ||
      !projectHook.newDetail.data.trim()
    )
      return;
    projectHook.setDetails([...projectHook.details, projectHook.newDetail]);
    projectHook.setNewDetail({ name: "", data: "" });
  };

  const handleDetailUpdate = (index: number, field: string, value: string) => {
    const updatedDetails = [...projectHook.details];
    (updatedDetails[index] as any)[field] = value;
    projectHook.setDetails(updatedDetails);
  };

  const handleDetailRemove = (index: number) => {
    projectHook.setDetails(projectHook.details.filter((_, i) => i !== index));
  };

  // Handle image operations
  const handleImagesUpload = (files: FileList) => {
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      newFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    }

    projectHook.setImages((prev) => [...prev, ...newUrls]);
    projectHook.setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handleImageRemove = (index: number) => {
    projectHook.setImages(projectHook.images.filter((_, i) => i !== index));
    projectHook.setImageFiles(
      projectHook.imageFiles.filter((_, i) => i !== index)
    );
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
        <ProjectCreationProgress projectCreated={projectHook.projectCreated} />

        {/* Step 1: Basic Information */}
        {!projectHook.projectCreated && (
          <ProjectCreationStep1
            name={projectHook.name}
            address={locationHook.address}
            googleMapsUrl={projectHook.googleMapsUrl}
            coordinates={projectHook.coordinates}
            provinces={locationHook.provinces}
            districts={locationHook.districts}
            wards={locationHook.wards}
            selectedProvince={locationHook.selectedProvince}
            selectedDistrict={locationHook.selectedDistrict}
            selectedWard={locationHook.selectedWard}
            fullAddress={locationHook.fullAddress}
            loadingProvinces={locationHook.loadingProvinces}
            loadingDistricts={locationHook.loadingDistricts}
            loadingWards={locationHook.loadingWards}
            images={projectHook.images}
            imageFiles={projectHook.imageFiles}
            isSubmitting={projectHook.isSubmitting}
            onNameChange={projectHook.setName}
            onAddressChange={locationHook.setAddress}
            onGoogleMapsUrlChange={projectHook.setGoogleMapsUrl}
            onCoordinatesChange={projectHook.setCoordinates}
            onProvinceChange={locationHook.setSelectedProvince}
            onDistrictChange={locationHook.setSelectedDistrict}
            onWardChange={locationHook.setSelectedWard}
            onImagesUpload={handleImagesUpload}
            onImageRemove={handleImageRemove}
            onSubmit={handleCreateProject}
          />
        )}

        {/* Step 2: Details and Amenities */}
        {projectHook.projectCreated && (
          <ProjectCreationStep2
            projectInfo={projectHook.getProjectInfo()}
            details={projectHook.details}
            newDetail={projectHook.newDetail}
            parentAmenities={amenityHook.parentAmenities}
            childAmenities={amenityHook.childAmenities}
            newParentAmenity={amenityHook.newParentAmenity}
            newChildAmenity={amenityHook.newChildAmenity}
            creatingParentAmenity={amenityHook.creatingParentAmenity}
            creatingChildAmenity={amenityHook.creatingChildAmenity}
            isSubmitting={projectHook.isSubmitting}
            onDetailAdd={handleDetailAdd}
            onDetailUpdate={handleDetailUpdate}
            onDetailRemove={handleDetailRemove}
            onNewDetailChange={(field, value) =>
              projectHook.setNewDetail({
                ...projectHook.newDetail,
                [field]: value,
              })
            }
            onParentAmenityAdd={amenityHook.handleAddParentAmenity}
            onParentAmenityRemove={amenityHook.removeParentAmenity}
            onParentAmenityChange={amenityHook.setNewParentAmenity}
            onParentAmenityUpdate={amenityHook.updateParentAmenity}
            onChildAmenityAdd={amenityHook.handleAddChildAmenity}
            onChildAmenityRemove={amenityHook.removeChildAmenity}
            onChildAmenityChange={(field, value) => {
              amenityHook.setNewChildAmenity((prev) => ({
                ...prev,
                [field]: value,
              }));
            }}
            onChildAmenityUpdate={amenityHook.updateChildAmenity}
            onSubmit={projectHook.saveProjectDetails}
          />
        )}

        {/* Saving Progress Modal */}
        <SavingProgressModal progress={projectHook.savingProgress} />
      </div>
    </div>
  );
};

export default CreateProject;
