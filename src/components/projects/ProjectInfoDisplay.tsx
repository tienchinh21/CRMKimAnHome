import React from "react";

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

interface ProjectInfoDisplayProps {
  projectInfo: ProjectInfo | null;
}

const ProjectInfoDisplay: React.FC<ProjectInfoDisplayProps> = ({
  projectInfo,
}) => {
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
          <p className="font-semibold text-gray-900">{projectInfo.name}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
          <p className="text-sm text-gray-900">
            {projectInfo.createdAt
              ? new Date(projectInfo.createdAt).toLocaleString("vi-VN")
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
            <p className="text-sm text-gray-600 mb-1">Địa chỉ đầy đủ</p>
            <p className="text-sm text-gray-900">{projectInfo.fullAddress}</p>
          </div>
        )}
        {projectInfo.createdBy && (
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Người tạo</p>
            <p className="text-sm text-gray-900">{projectInfo.createdBy}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInfoDisplay;
