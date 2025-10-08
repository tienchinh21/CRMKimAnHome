import React from "react";

interface ProjectCreationProgressProps {
  projectCreated: boolean;
}

const ProjectCreationProgress: React.FC<ProjectCreationProgressProps> = ({
  projectCreated,
}) => {
  return (
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
          <span className="text-lg font-semibold">Thông tin cơ bản & Ảnh</span>
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
  );
};

export default ProjectCreationProgress;
