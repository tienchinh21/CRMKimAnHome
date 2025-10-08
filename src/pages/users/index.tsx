import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DataTable, { type Column } from "@/components/common/DataTable";
import Filter, { type FilterConfig } from "@/components/common/Filter";
import UserCreateModal from "@/components/users/UserCreateModal";

import type {
  UserResponse,
  CoreEnum,
  RoleResponse,
  TeamResponse,
} from "@/types";
import { Trash2, Eye, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserEditModal from "@/components/users/UserEditModal";
import UserService from "@/services/api/UserService";
import CoreEnumService from "@/services/api/CoreEnumService";
import RoleService from "@/services/api/RoleService";
import TeamService from "@/services/api/TeamService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [genders, setGenders] = useState<CoreEnum[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  // Load data
  useEffect(() => {
    loadUsers();
    loadGenders();
    loadRoles();
    loadTeams();
  }, []);

  // Filter options
  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ];

  const genderOptions = [
    { value: "all", label: "Tất cả" },
    ...(genders || []).map((gender) => ({
      value: gender.id,
      label: gender.name,
    })),
  ];

  // Filter configuration
  const filterConfig: FilterConfig = {
    search: {
      placeholder: "Tìm kiếm theo tên, email, số điện thoại...",
      value: searchTerm,
      onChange: setSearchTerm,
    },
    status: {
      options: statusOptions,
      value: statusFilter,
      onChange: setStatusFilter,
    },
    type: {
      options: genderOptions,
      value: genderFilter,
      onChange: setGenderFilter,
    },
  };

  // Load functions
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAll({
        filter: "",
        pageable: { page: 0, size: 1000 },
      });
      setUsers(response.data?.response || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenders = async () => {
    try {
      const response = await CoreEnumService.getByType("gender");
      setGenders(response.data || []);
    } catch (error) {
      console.error("Error loading genders:", error);
      // Fallback to empty array if API fails
      setGenders([]);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await RoleService.getAll();
      setRoles(response.data || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      // Fallback to empty array if API fails
      setRoles([]);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await TeamService.getAll();
      // @ts-ignore
      setTeams(response.data.content || []);
    } catch (error) {
      console.error("Error loading teams:", error);
      // Fallback to empty array if API fails
      setTeams([]);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.phoneNumber?.toLowerCase().includes(search)
      );
    }

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((user) => user.gender === genderFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, genderFilter]);

  // Table columns
  const columns: Column<UserResponse>[] = [
    {
      key: "fullName",
      header: "Họ và tên",
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      header: "Số điện thoại",
      render: (user) => (
        <span className="text-sm text-gray-600">
          {user.phoneNumber || "N/A"}
        </span>
      ),
    },
    {
      key: "gender",
      header: "Giới tính",
      render: (user) => {
        const genderName =
          (genders || []).find((g) => g.id === user.gender)?.name ||
          user.gender;
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {genderName}
          </Badge>
        );
      },
    },
    {
      key: "roleNames",
      header: "Vai trò",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roleNames.length > 0 ? (
            user.roleNames.map((role, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">Chưa có vai trò</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Trạng thái",
      render: (user) => (
        <Badge
          variant={user.isActive ? "default" : "secondary"}
          className={
            user.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          {user.isActive ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
  ];

  // Actions
  const actions = (user: UserResponse) => (
    <div className="inline-flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedUser(user);
              setShowEditModal(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>
      {/* <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedUser(user);
              setShowEditModal(true);
            }}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Chỉnh sửa</TooltipContent>
      </Tooltip> */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
                handleDeleteUser(user.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Xóa</TooltipContent>
      </Tooltip>
    </div>
  );

  const handleCreateUser = async () => {
    try {
      // User has already been created in the modal, just reload the list
      await loadUsers();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error reloading users:", error);
    }
  };

  const handleEditUser = async () => {
    try {
      // User has already been updated in the modal, just reload the list
      await loadUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error reloading users:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await UserService.delete(userId);
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setGenderFilter("all");
  };

  const handleRefresh = () => {
    loadUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý nhân viên
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin và quyền hạn nhân viên
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Filter */}
      <Filter
        config={filterConfig}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredUsers}
            actions={actions}
            emptyMessage="Không tìm thấy nhân viên nào"
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <UserCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleCreateUser}
        genders={genders}
        roles={roles}
        teams={teams}
        trigger={null}
      />

      <UserEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        user={selectedUser}
        onSuccess={handleEditUser}
        genders={genders}
        roles={roles}
        teams={teams}
      />
    </div>
  );
};

export default UserManagement;
