import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ChevronRight } from "lucide-react";

interface ParentAmenity {
  name: string;
}

interface ChildAmenity {
  name: string;
  parentName: string;
}

interface ProjectAmenitiesDisplayProps {
  parentAmenities: ParentAmenity[];
  childAmenities: ChildAmenity[];
  title?: string;
}

const ProjectAmenitiesDisplay: React.FC<ProjectAmenitiesDisplayProps> = ({
  parentAmenities,
  childAmenities,
  title = "Tiện ích dự án",
}) => {
  // Group child amenities by parent
  const groupedChildren = childAmenities.reduce((acc, child) => {
    if (!acc[child.parentName]) {
      acc[child.parentName] = [];
    }
    acc[child.parentName].push(child);
    return acc;
  }, {} as Record<string, ChildAmenity[]>);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {parentAmenities && parentAmenities.length > 0 ? (
          <div className="space-y-6">
            {parentAmenities.map((parent, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-600" />
                    {parent.name}
                  </h4>

                  {groupedChildren[parent.name] &&
                  groupedChildren[parent.name].length > 0 ? (
                    <div className="ml-6 space-y-2">
                      {groupedChildren[parent.name].map((child, childIndex) => (
                        <div
                          key={childIndex}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span>{child.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ml-6 text-sm text-gray-500 italic">
                      Chưa có tiện ích con
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Chưa có tiện ích dự án</p>
            <p className="text-sm">Thông tin tiện ích sẽ được hiển thị ở đây</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectAmenitiesDisplay;
