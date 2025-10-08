import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Save } from "lucide-react";
import CreateProjectDetails from "@/components/forms/CreateProjectDetails";
import CreateProjectAmenities from "@/components/forms/CreateProjectAmenities";
import ProjectInfoDisplay from "./ProjectInfoDisplay";
import type {
  DetailItem,
  ParentAmenity,
  ChildAmenity,
} from "@/lib/validations/projectValidation";

interface ProjectInfo {
  id: string | null;
  name: string;
  longitude: string | null;
  latitude: string | null;
  fullAddress: string | null;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

interface ProjectCreationStep2Props {
  // Project info
  projectInfo: ProjectInfo | null;

  // Details
  details: DetailItem[];
  newDetail: DetailItem;

  // Amenities
  parentAmenities: ParentAmenity[];
  childAmenities: ChildAmenity[];
  newParentAmenity: string;
  newChildAmenity: ChildAmenity;
  creatingParentAmenity: boolean;
  creatingChildAmenity: boolean;

  // Form state
  isSubmitting: boolean;

  // Detail handlers
  onDetailAdd: () => void;
  onDetailUpdate: (index: number, field: string, value: string) => void;
  onDetailRemove: (index: number) => void;
  onNewDetailChange: (field: string, value: string) => void;

  // Amenity handlers
  onParentAmenityAdd: () => void;
  onParentAmenityRemove: (index: number) => void;
  onParentAmenityChange: (value: string) => void;
  onParentAmenityUpdate: (id: string, newName: string) => Promise<void>;

  onChildAmenityAdd: () => void;
  onChildAmenityRemove: (index: number) => void;
  onChildAmenityChange: (field: string, value: string) => void;
  onChildAmenityUpdate: (
    id: string,
    newName: string,
    parentId: string
  ) => Promise<void>;

  // Submit handler
  onSubmit: () => void;
}

const ProjectCreationStep2: React.FC<ProjectCreationStep2Props> = ({
  projectInfo,
  details,
  newDetail,
  parentAmenities,
  childAmenities,
  newParentAmenity,
  newChildAmenity,
  creatingParentAmenity,
  creatingChildAmenity,
  isSubmitting,
  onDetailAdd,
  onDetailUpdate,
  onDetailRemove,
  onNewDetailChange,
  onParentAmenityAdd,
  onParentAmenityRemove,
  onParentAmenityChange,
  onParentAmenityUpdate,
  onChildAmenityAdd,
  onChildAmenityRemove,
  onChildAmenityChange,
  onChildAmenityUpdate,
  onSubmit,
}) => {
  const navigate = useNavigate();

  return (
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
          Bây giờ hãy thêm chi tiết và tiện ích để hoàn thiện thông tin dự án
        </p>
      </div>

      {/* Project Info Display */}
      <ProjectInfoDisplay projectInfo={projectInfo} />

      {/* Main Content */}
      <div className="space-y-8">
        {/* Project Details */}
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
              onChangeNew={onNewDetailChange}
              onAdd={onDetailAdd}
              onUpdate={onDetailUpdate}
              onRemove={onDetailRemove}
            />
          </div>
        </div>

        {/* Project Amenities */}
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
              onChangeParent={onParentAmenityChange}
              onAddParent={onParentAmenityAdd}
              onRemoveParent={onParentAmenityRemove}
              onChangeChild={onChildAmenityChange}
              onAddChild={onChildAmenityAdd}
              onRemoveChild={onChildAmenityRemove}
              onUpdateParent={onParentAmenityUpdate}
              onUpdateChild={onChildAmenityUpdate}
              creatingParentAmenity={creatingParentAmenity}
              creatingChildAmenity={creatingChildAmenity}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
          onClick={onSubmit}
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
  );
};

export default ProjectCreationStep2;
