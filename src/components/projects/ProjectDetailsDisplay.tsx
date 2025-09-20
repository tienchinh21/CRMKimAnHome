import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ProjectDetail {
  name: string;
  data: string;
}

interface ProjectDetailsDisplayProps {
  details: ProjectDetail[];
  title?: string;
}

const ProjectDetailsDisplay: React.FC<ProjectDetailsDisplayProps> = ({
  details,
  title = "Chi tiết dự án",
}) => {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {details && details.length > 0 ? (
          <div className="space-y-4">
            {details.map((detail, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {detail.name}
                  </h4>
                  <p className="text-base text-gray-800 leading-relaxed">
                    {detail.data}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Chưa có chi tiết dự án</p>
            <p className="text-sm">Thông tin chi tiết sẽ được hiển thị ở đây</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsDisplay;
