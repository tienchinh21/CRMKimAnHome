import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeamResponse, UserResponse } from "@/types";
import { Edit, Users, UserCheck, Save } from "lucide-react";

const editTeamSchema = z.object({
  name: z.string().min(2, "Tên đội tối thiểu 2 ký tự"),
  leaderId: z.string().min(1, "Vui lòng chọn trưởng nhóm"),
});

type EditTeamForm = z.infer<typeof editTeamSchema>;

interface TeamEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamResponse | null;
  onSuccess: (teamData: any) => void;
  users: UserResponse[];
  trigger?: React.ReactNode;
}

const TeamEditModal: React.FC<TeamEditModalProps> = ({
  open,
  onOpenChange,
  team,
  onSuccess,
  users,
  trigger,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditTeamForm>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: "",
      leaderId: "",
    },
  });

  // Populate form when team changes
  useEffect(() => {
    if (team) {
      setValue("name", team.name);
      setValue("leaderId", team.leaderId);
    }
  }, [team, setValue]);

  const onSubmit: SubmitHandler<EditTeamForm> = async (data) => {
    setSubmitting(true);
    try {
      console.log("Updating team with data:", data);
      onSuccess(data);
    } catch (error) {
      console.error("Error updating team:", error);
      alert("Có lỗi xảy ra khi cập nhật đội");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-full p-0 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa đội</h2>
          <p className="text-gray-600 mt-1">
            Cập nhật thông tin đội: {team.name}
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin cơ bản
              </h3>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tên đội <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("name")}
                    placeholder="Nhập tên đội"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="leaderId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Trưởng nhóm <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("leaderId")}
                    onValueChange={(value) => setValue("leaderId", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn trưởng nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
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
                  {errors.leaderId && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.leaderId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-white shadow-lg flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {submitting ? "Đang cập nhật..." : "Cập nhật đội"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamEditModal;
