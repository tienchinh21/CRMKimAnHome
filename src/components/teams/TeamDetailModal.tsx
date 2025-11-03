import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamResponse, TeamDetailResponse, UserResponse } from "@/types";
import { Users, UserCheck, Trash2, Edit, Save, XCircle } from "lucide-react";
import TeamService from "@/services/api/TeamService";
import UserService from "@/services/api/UserService";

interface TeamDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamResponse | null;
  onRefresh: () => void;
  trigger?: React.ReactNode;
}

const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  open,
  onOpenChange,
  team,
  onRefresh,
  trigger,
}) => {
  const [teamDetail, setTeamDetail] = useState<TeamDetailResponse | null>(null);
  const [availableLeaders, setAvailableLeaders] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLeaderId, setEditLeaderId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (team && open) {
      loadTeamDetail();
      loadAvailableLeaders();
      // Initialize edit states
      setEditName(team.name);
      setIsEditing(false);
    }
  }, [team, open]);

  // Update editLeaderId when availableLeaders changes
  useEffect(() => {
    if (team && availableLeaders.length > 0) {
      const leaderUser = availableLeaders.find(
        (user) => user.fullName === team.leaderName
      );
      setEditLeaderId(leaderUser?.id || "");
    }
  }, [team, availableLeaders]);

  const loadTeamDetail = async () => {
    if (!team) return;

    try {
      setLoading(true);
      const response = await TeamService.getById(team.id);
      // @ts-ignore
      setTeamDetail(response.data.content.members);
    } catch (error) {
      console.error("Error loading team detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableLeaders = async () => {
    try {
      const response = await UserService.getAll({
        filter: "roles.name ~ '*Leader*'",
        pageable: { page: 0, size: 1000 },
      });
      setAvailableLeaders(response.data?.response || []);
    } catch (error) {
      console.error("Error loading leaders:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi đội?")) {
      try {
        await TeamService.removeMember(team.id, memberId);
        await loadTeamDetail();
        onRefresh();
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Có lỗi xảy ra khi xóa thành viên");
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(team?.name || "");
    // Find leaderId from leaderName
    const leaderUser = availableLeaders.find(
      (user) => user.fullName === team?.leaderName
    );
    setEditLeaderId(leaderUser?.id || "");
  };

  const handleSave = async () => {
    if (!team) return;

    try {
      setSaving(true);
      await TeamService.updateLeader(team.id, editLeaderId, editName);
      await loadTeamDetail();
      onRefresh();
      setIsEditing(false);
      toast.success("Cập nhật thông tin đội thành công!");
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin đội");
    } finally {
      setSaving(false);
    }
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Chi tiết đội: {team.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Quản lý thành viên và thông tin đội
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Team Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Thông tin đội
                  </h3>
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEdit}
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? "Đang lưu..." : "Lưu"}
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="teamName"
                        className="text-sm text-gray-600"
                      >
                        Tên đội:
                      </Label>
                      <Input
                        id="teamName"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1"
                        placeholder="Nhập tên đội"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="teamLeader"
                        className="text-sm text-gray-600"
                      >
                        Trưởng nhóm:
                      </Label>
                      <Select
                        value={editLeaderId}
                        onValueChange={setEditLeaderId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Chọn trưởng nhóm" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLeaders.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center space-x-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span>{user.fullName}</span>
                                <span className="text-gray-500">
                                  ({user.email})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Tên đội:</span>
                      <p className="font-medium">{team.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Trưởng nhóm:
                      </span>
                      <p className="font-medium flex items-center">
                        <UserCheck className="h-4 w-4 mr-1 text-green-600" />
                        {team.leaderName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Members List */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Thành viên ({teamDetail?.length || 0})
                </h3>
                {teamDetail && teamDetail.length > 0 ? (
                  <div className="space-y-3">
                    {teamDetail.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.fullName === team.leaderName && (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              Trưởng nhóm
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={member.fullName === team.leaderName}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có thành viên nào</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-white shadow-lg flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamDetailModal;
