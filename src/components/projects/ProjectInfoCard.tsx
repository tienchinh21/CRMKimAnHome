import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectInfoCardProps {
  name: string;
  fullAddress: string;
  createdAt: string;
  updatedAt: string | null | undefined;
  title?: string;
  formatDate: (date: string | Date | null | undefined) => string;
}

const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  name,
  createdAt,
  updatedAt,
  title = "Thông tin dự án",
  fullAddress,
  formatDate,
}) => {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Tên dự án
            </label>
            <p className="text-lg font-bold text-gray-900">{name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Vị trí
            </label>
            <p className="text-base text-gray-800 leading-relaxed">
              {fullAddress || "Chưa cập nhật"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Ngày tạo
            </label>
            <p className="text-base text-gray-800">{formatDate(createdAt)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Cập nhật lần cuối
            </label>
            <p className="text-base text-gray-800">{formatDate(updatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoCard;
