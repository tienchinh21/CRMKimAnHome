import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, XCircle, Pencil, Save, X, Trash2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

interface ParentAmenity {
  id?: string;
  name: string;
}
interface ChildAmenity {
  id?: string;
  name: string;
  parentName: string;
  parentId?: string;
}

interface Props {
  parentAmenities: ParentAmenity[];
  childAmenities: ChildAmenity[];
  newParent: string;
  newChild: ChildAmenity;
  onChangeParent: (v: string) => void;
  onAddParent: () => void;
  onRemoveParent: (i: number) => void;
  onChangeChild: (
    field: "name" | "parentName" | "parentId",
    value: string
  ) => void;
  onAddChild: () => void;
  onRemoveChild: (i: number) => void;
  creatingParentAmenity?: boolean;
  creatingChildAmenity?: boolean;
  onUpdateParent?: (id: string, newName: string) => Promise<void>;
  onUpdateChild?: (
    id: string,
    newName: string,
    parentId: string
  ) => Promise<void>;
  onDeleteParent?: (id: string) => Promise<void>;
  onDeleteChild?: (id: string) => Promise<void>;
}

const CreateProjectAmenities: React.FC<Props> = ({
  parentAmenities,
  childAmenities,
  newParent,
  newChild,
  onChangeParent,
  onAddParent,
  onRemoveParent,
  onChangeChild,
  onAddChild,
  onRemoveChild,
  creatingParentAmenity = false,
  creatingChildAmenity = false,
  onUpdateParent,
  onUpdateChild,
  onDeleteParent,
  onDeleteChild,
}) => {
  const [editingParent, setEditingParent] = React.useState<number | null>(null);
  const [editingChild, setEditingChild] = React.useState<number | null>(null);
  const [editParentName, setEditParentName] = React.useState("");
  const [editChildName, setEditChildName] = React.useState("");

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"parent" | "child">("parent");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEditParent = (index: number) => {
    setEditingParent(index);
    setEditParentName(parentAmenities[index].name);
  };

  const handleSaveParentEdit = async () => {
    if (
      editingParent !== null &&
      onUpdateParent &&
      parentAmenities[editingParent].id
    ) {
      try {
        await onUpdateParent(
          parentAmenities[editingParent].id!,
          editParentName
        );
        setEditingParent(null);
        setEditParentName("");
      } catch (error) {
        console.error("❌ Error updating parent amenity:", error);
      }
    } else {
    }
  };

  const handleCancelParentEdit = () => {
    setEditingParent(null);
    setEditParentName("");
  };

  const handleEditChild = (index: number) => {
    setEditingChild(index);
    setEditChildName(childAmenities[index].name);
  };

  const handleSaveChildEdit = async () => {
    if (
      editingChild !== null &&
      onUpdateChild &&
      childAmenities[editingChild].parentId
    ) {
      try {
        await onUpdateChild(
          childAmenities[editingChild].id!,
          editChildName,
          childAmenities[editingChild].parentId!
        );
        setEditingChild(null);
        setEditChildName("");
      } catch (error) {
        console.error("❌ Error updating child amenity:", error);
      }
    }
  };

  const handleCancelChildEdit = () => {
    setEditingChild(null);
    setEditChildName("");
  };

  // Delete functions
  const handleDeleteParent = (index: number) => {
    setDeleteType("parent");
    setDeleteIndex(index);
    setDeleteModalOpen(true);
  };

  const handleDeleteChild = (index: number) => {
    setDeleteType("child");
    setDeleteIndex(index);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteIndex === null) return;

    try {
      setDeleting(true);

      if (
        deleteType === "parent" &&
        onDeleteParent &&
        parentAmenities[deleteIndex].id
      ) {
        await onDeleteParent(parentAmenities[deleteIndex].id!);
      } else if (
        deleteType === "child" &&
        onDeleteChild &&
        childAmenities[deleteIndex].id
      ) {
        await onDeleteChild(childAmenities[deleteIndex].id!);
      }

      setDeleteModalOpen(false);
      setDeleteIndex(null);
    } catch (error) {
      console.error("Error deleting amenity:", error);
    } finally {
      setDeleting(false);
    }
  };

  const groupedChildren = React.useMemo(() => {
    const map: Record<string, { child: ChildAmenity; index: number }[]> = {};
    childAmenities.forEach((child, index) => {
      if (!map[child.parentName]) map[child.parentName] = [];
      map[child.parentName]!.push({ child, index });
    });
    return map;
  }, [childAmenities]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tiện ích dự án</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {parentAmenities.length} nhóm
          </span>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {childAmenities.length} tiện ích
          </span>
        </div>
      </div>

      {/* Add Parent Amenity */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-dashed border-teal-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-teal-100 rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-teal-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            Thêm nhóm tiện ích
          </h4>
          <p className="text-xs text-gray-600">
            Tạo nhóm tiện ích mới (VD: Tiện ích nội khu, Tiện ích ngoại khu)
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
              Tên nhóm tiện ích
            </label>
            <Input
              placeholder="VD: Tiện ích nội khu, Tiện ích ngoại khu..."
              value={newParent}
              onChange={(e) => onChangeParent(e.target.value)}
              className="h-10 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all duration-200 rounded-lg bg-white"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={onAddParent}
              disabled={creatingParentAmenity || !newParent.trim()}
              className="h-10 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingParentAmenity ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {creatingParentAmenity ? "Đang tạo..." : "Thêm nhóm"}
            </Button>
          </div>
        </div>
      </div>
      {/* Amenities List */}
      {parentAmenities.length > 0 && (
        <div className="space-y-6">
          {parentAmenities.map((p, pIdx) => (
            <div
              key={pIdx}
              className="group/parent bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              {/* Parent Amenity Header */}
              <div className="flex items-center justify-between mb-4">
                {editingParent === pIdx ? (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                        Tên nhóm tiện ích
                      </label>
                      <Input
                        value={editParentName}
                        onChange={(e) => setEditParentName(e.target.value)}
                        className="h-10 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                        placeholder="Nhập tên nhóm tiện ích..."
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handleSaveParentEdit}
                        className="h-10 w-10 hover:bg-green-100 text-green-600 rounded-lg"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handleCancelParentEdit}
                        className="h-10 w-10 hover:bg-red-100 text-red-600 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <span className="text-teal-600 font-semibold text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {p.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {groupedChildren[p.name]?.length || 0} tiện ích
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover/parent:opacity-100 transition-all duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        aria-label="Chỉnh sửa nhóm tiện ích"
                        onClick={() => handleEditParent(pIdx)}
                        className="h-9 w-9 hover:bg-teal-100 text-teal-600 rounded-lg"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:bg-red-100 rounded-lg"
                        type="button"
                        aria-label="Xóa nhóm tiện ích"
                        onClick={() => handleDeleteParent(pIdx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {/* Child Amenities */}
              {groupedChildren[p.name] &&
              groupedChildren[p.name]!.length > 0 ? (
                <div className="space-y-2">
                  {groupedChildren[p.name]!.map(({ child, index }) => (
                    <div
                      key={index}
                      className="group/item relative flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
                    >
                      {editingChild === index ? (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                              Tên tiện ích
                            </label>
                            <Input
                              value={editChildName}
                              onChange={(e) => setEditChildName(e.target.value)}
                              className="h-8 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                              placeholder="Nhập tên tiện ích..."
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={handleSaveChildEdit}
                              className="h-8 w-8 hover:bg-green-100 text-green-600 rounded-lg"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={handleCancelChildEdit}
                              className="h-8 w-8 hover:bg-red-100 text-red-600 rounded-lg"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                              {child.name}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all duration-200">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-teal-100 text-teal-600 rounded-lg"
                              type="button"
                              aria-label="Chỉnh sửa tiện ích con"
                              onClick={() => handleEditChild(index)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:bg-red-100 rounded-lg"
                              type="button"
                              aria-label="Xóa tiện ích con"
                              onClick={() => handleDeleteChild(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm">Chưa có tiện ích con</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Child Amenity */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-dashed border-cyan-200 rounded-xl p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-cyan-100 rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-cyan-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            Thêm tiện ích con
          </h4>
          <p className="text-xs text-gray-600">
            Thêm tiện ích cụ thể vào nhóm đã tạo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Tên tiện ích con
            </label>
            <Input
              placeholder="VD: Hồ bơi, Gym, Sân tennis..."
              value={newChild.name}
              onChange={(e) => onChangeChild("name", e.target.value)}
              className="h-10 text-sm border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Nhóm tiện ích
            </label>
            <Select
              value={newChild.parentName || ""}
              onValueChange={(v) => {
                const selectedParent = parentAmenities.find(
                  (p) => p.name === v
                );
                onChangeChild("parentName", v);
                onChangeChild("parentId", selectedParent?.id || "");
              }}
            >
              <SelectTrigger className="h-10 text-sm border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 rounded-lg bg-white">
                <SelectValue placeholder="Chọn nhóm tiện ích" />
              </SelectTrigger>
              <SelectContent>
                {parentAmenities.length > 0 ? (
                  parentAmenities.map((p) => (
                    <SelectItem key={p.id || p.name} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-parent" disabled>
                    Chưa có nhóm tiện ích
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={onAddChild}
            disabled={
              creatingChildAmenity ||
              !newChild.name.trim() ||
              !newChild.parentName
            }
            className="h-10 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingChildAmenity ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {creatingChildAmenity ? "Đang tạo..." : "Thêm"}
          </Button>
        </div>
      </div>
      {/* Empty State */}
      {parentAmenities.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Plus className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có tiện ích nào
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Bắt đầu bằng cách tạo nhóm tiện ích, sau đó thêm các tiện ích cụ thể
            vào từng nhóm
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title={`Xóa ${
          deleteType === "parent" ? "nhóm tiện ích" : "tiện ích con"
        }`}
        description={`Bạn có chắc chắn muốn xóa ${
          deleteType === "parent" ? "nhóm tiện ích" : "tiện ích con"
        } này không?`}
        itemName={
          deleteIndex !== null
            ? deleteType === "parent"
              ? parentAmenities[deleteIndex]?.name || ""
              : childAmenities[deleteIndex]?.name || ""
            : ""
        }
        warningMessage={
          deleteType === "parent"
            ? "Xóa nhóm tiện ích sẽ xóa tất cả tiện ích con thuộc nhóm này."
            : undefined
        }
        isLoading={deleting}
      />
    </div>
  );
};

export default CreateProjectAmenities;
