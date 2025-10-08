import React, { useState, useRef } from "react";
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
import type { CoreEnum, RoleResponse, TeamResponse } from "@/types";
import {
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  Upload,
  X,
  Camera,
  Users,
} from "lucide-react";
import UserService from "@/services/api/UserService";
import TeamService from "@/services/api/TeamService";

const createUserSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().min(10, "Số điện thoại tối thiểu 10 số"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  birthDay: z.string().optional(),
  genderId: z.string().min(1, "Vui lòng chọn giới tính"),
  roleIds: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một vai trò"),
  ledGroupId: z.string().optional(),
  inGroupIds: z.array(z.string()).optional(),
  avatar: z.any().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface UserCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: any) => void;
  genders: CoreEnum[];
  roles: RoleResponse[];
  teams: TeamResponse[];
  trigger?: React.ReactNode;
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  genders,
  roles,
  teams,
  trigger,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      birthDay: "",
      genderId: "",
      roleIds: [],
      ledGroupId: "",
      inGroupIds: [],
    },
  });

  const onSubmit: SubmitHandler<CreateUserForm> = async (data) => {
    // Prevent double submission
    if (submitting || isSubmittingRef.current) {
      console.log("Preventing double submission");
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    console.log("Starting user creation...");
    try {
      console.log("Creating user with data:", data);

      // Transform data for API
      const userPayload = {
        data: {
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          isActive: true,
          genderId: data.genderId,
          roleIds: data.roleIds,
        },
        file: avatarFile || undefined,
      };

      const userResponse = await UserService.create(userPayload);
      const createdUser = userResponse.data;
      console.log("User created successfully:", createdUser);

      if (data.ledGroupId) {
        try {
          const selectedTeam = teams.find(
            (team) => team.id === data.ledGroupId
          );
          if (selectedTeam) {
            await TeamService.updateLeader(
              data.ledGroupId,
              createdUser.id,
              selectedTeam.name
            );
            console.log("Team leader updated successfully");
          }
        } catch (error) {
          console.error("Error updating team leader:", error);
          // Continue execution even if leader update fails
        }
      }

      // 3. Add user to teams if inGroupIds is provided
      if (data.inGroupIds && data.inGroupIds.length > 0) {
        try {
          // Add user to each team
          for (const teamId of data.inGroupIds) {
            await TeamService.addMember(teamId, [createdUser.id]);
          }
          console.log("User added to teams successfully");
        } catch (error) {
          console.error("Error adding user to teams:", error);
          // Continue execution even if team addition fails
        }
      }

      onSuccess(createdUser);
      reset();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Có lỗi xảy ra khi tạo người dùng");
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setAvatarPreview(null);
      setAvatarFile(null);
    }
    onOpenChange(newOpen);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-5xl w-full max-h-[95vh] p-0 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            Thêm người dùng mới
          </h2>
          <p className="text-gray-600 mt-1">Nhập thông tin người dùng mới</p>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-600" />
                Ảnh đại diện
              </h3>

              <div className="flex items-center space-x-6">
                {/* Avatar Preview */}
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {avatarPreview ? "Thay đổi ảnh" : "Tải lên ảnh"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG hoặc GIF. Tối đa 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("fullName")}
                    placeholder="Nhập họ và tên"
                    className="mt-1"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="Nhập email"
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      {...register("phoneNumber")}
                      placeholder="Nhập số điện thoại"
                      className="pl-10"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="Nhập mật khẩu"
                    className="mt-1"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="birthDay"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ngày sinh
                  </Label>
                  <Input
                    {...register("birthDay")}
                    type="date"
                    className="mt-1"
                  />
                  {errors.birthDay && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.birthDay.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="genderId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Giới tính <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("genderId")}
                    onValueChange={(value) => setValue("genderId", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.id} value={gender.id}>
                          {gender.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.genderId && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.genderId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Assignment */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                Phân quyền
              </h3>

              <div>
                <Label
                  htmlFor="roleIds"
                  className="text-sm font-medium text-gray-700"
                >
                  Vai trò <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("roleIds")[0] || ""}
                  onValueChange={(value) => setValue("roleIds", [value])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roleIds && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.roleIds.message}
                  </p>
                )}
              </div>
            </div>

            {/* Team Management */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Quản lý nhóm
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <Label
                    htmlFor="ledGroupId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nhóm dẫn dắt
                  </Label>
                  <Select
                    value={watch("ledGroupId")}
                    onValueChange={(value) => setValue("ledGroupId", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn nhóm dẫn dắt" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ledGroupId && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.ledGroupId.message}
                    </p>
                  )}
                </div> */}

                <div>
                  <Label
                    htmlFor="inGroupIds"
                    className="text-sm font-medium text-gray-700"
                  >
                    Thành viên nhóm
                  </Label>
                  <div className="space-y-2">
                    {/* Display selected teams as tags */}
                    {watch("inGroupIds") &&
                      (watch("inGroupIds")?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border">
                          {watch("inGroupIds")?.map((teamId) => {
                            const team = teams.find((t) => t.id === teamId);
                            return team ? (
                              <span
                                key={teamId}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                              >
                                {team.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentIds =
                                      watch("inGroupIds") || [];
                                    setValue(
                                      "inGroupIds",
                                      currentIds.filter((id) => id !== teamId)
                                    );
                                  }}
                                  className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                    <Select
                      value=""
                      onValueChange={(value) => {
                        const currentIds = watch("inGroupIds") || [];
                        if (currentIds.includes(value)) {
                          // Remove if already selected
                          setValue(
                            "inGroupIds",
                            currentIds.filter((id) => id !== value)
                          );
                        } else {
                          // Add if not selected
                          setValue("inGroupIds", [...currentIds, value]);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn nhóm thành viên" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => {
                          const isSelected = watch("inGroupIds")?.includes(
                            team.id
                          );
                          return (
                            <SelectItem
                              key={team.id}
                              value={team.id}
                              className={isSelected ? "bg-blue-50" : ""}
                            >
                              <div className="flex items-center">
                                {isSelected && <span className="mr-2">✓</span>}
                                {team.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.inGroupIds && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.inGroupIds.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo nhân viên"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreateModal;
