import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface DetailItem {
  id?: string;
  name: string;
  data: string;
}
interface Props {
  details: DetailItem[];
  newDetail: DetailItem;
  onChangeNew: (field: "name" | "data", value: string) => void;
  onAdd: () => void;
  onUpdate: (index: number, field: "name" | "data", value: string) => void;
  onRemove: (index: number) => void;
}

const CreateProjectDetails: React.FC<Props> = ({
  details,
  newDetail,
  onChangeNew,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Chi tiết dự án</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {details.length} mục
        </span>
      </div>

      {/* Existing Details */}
      {details.length > 0 && (
        <div className="space-y-3">
          {details.map((d, i) => (
            <div
              key={i}
              className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-center gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tên chi tiết
                  </label>
                  <Input
                    value={d.name}
                    placeholder="Nhập tên chi tiết..."
                    onChange={(e) => onUpdate(i, "name", e.target.value)}
                    className="h-10 text-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all duration-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Nội dung
                  </label>
                  <Input
                    value={d.data}
                    placeholder="Nhập nội dung..."
                    onChange={(e) => onUpdate(i, "data", e.target.value)}
                    className="h-10 text-sm border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all duration-200 rounded-lg"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-lg opacity-0 group-hover:opacity-100"
                    onClick={() => onRemove(i)}
                    aria-label="Xóa chi tiết"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Detail */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-dashed border-teal-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-teal-100 rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-teal-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            Thêm chi tiết mới
          </h4>
          <p className="text-xs text-gray-600">
            Nhập thông tin chi tiết về dự án
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Tên chi tiết
            </label>
            <Input
              value={newDetail.name}
              placeholder="VD: Diện tích, Số tầng..."
              onChange={(e) => onChangeNew("name", e.target.value)}
              className="h-10 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all duration-200 rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Nội dung
            </label>
            <Input
              value={newDetail.data}
              placeholder="VD: 1000m², 25 tầng..."
              onChange={(e) => onChangeNew("data", e.target.value)}
              className="h-10 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all duration-200 rounded-lg bg-white"
            />
          </div>
          <Button
            type="button"
            onClick={onAdd}
            disabled={!newDetail.name.trim() || !newDetail.data.trim()}
            className="h-10 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {details.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Plus className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có chi tiết nào
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Thêm thông tin chi tiết về dự án để khách hàng hiểu rõ hơn về dự án
            của bạn
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateProjectDetails;
