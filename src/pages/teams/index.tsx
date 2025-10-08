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
import TeamCreateModal from "@/components/teams/TeamCreateModal";
import TeamEditModal from "@/components/teams/TeamEditModal";
import TeamDetailModal from "@/components/teams/TeamDetailModal";

import type { TeamResponse, UserResponse } from "@/types";
import { Trash2, Eye, Users, UserCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TeamService from "@/services/api/TeamService";
import UserService from "@/services/api/UserService";

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamResponse[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Filter configuration
  const filterConfig: FilterConfig = {
    search: {
      placeholder: "Tìm kiếm theo tên đội, tên trưởng nhóm...",
      value: searchTerm,
      onChange: setSearchTerm,
    },
  };

  // Load data
  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = teams;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(search) ||
          team.leaderName.toLowerCase().includes(search)
      );
    }

    setFilteredTeams(filtered);
  }, [teams, searchTerm]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await TeamService.getAll();
      // @ts-ignore
      setTeams(response.data.content || []);
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await UserService.getAll({
        filter: "roles.name ~ '*Leader*'",
        pageable: { page: 0, size: 1000 },
      });
      setUsers(response.data?.response || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Table columns
  const columns: Column<TeamResponse>[] = [
    {
      key: "name",
      header: "Tên đội",
      render: (team) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{team.name}</div>
            <div className="text-sm text-gray-500">
              ID: {team.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "leaderName",
      header: "Trưởng nhóm",
      render: (team) => (
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-sm text-gray-700">{team.leaderName}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: () => (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Hoạt động
        </Badge>
      ),
    },
  ];

  // Actions
  const actions = (team: TeamResponse) => (
    <div className="inline-flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedTeam(team);
              setShowDetailModal(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn xóa đội này?")) {
                handleDeleteTeam(team.id);
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

  // Handlers
  const handleCreateTeam = async (teamData: any) => {
    try {
      await TeamService.create(teamData);
      await loadTeams();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  const handleEditTeam = async (teamData: any) => {
    try {
      if (selectedTeam) {
        await TeamService.update(selectedTeam.id, teamData);
        await loadTeams();
        setShowEditModal(false);
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await TeamService.delete(teamId);
      await loadTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
  };

  const handleRefresh = () => {
    loadTeams();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đội nhóm</h1>
          <p className="text-gray-600">
            Quản lý thông tin và thành viên các đội nhóm
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Tạo đội mới
        </Button>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số đội</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trưởng nhóm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thành viên</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

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
            data={filteredTeams}
            actions={actions}
            emptyMessage="Không tìm thấy đội nào"
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <TeamCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleCreateTeam}
        users={users}
        trigger={null}
      />

      <TeamEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        team={selectedTeam}
        onSuccess={handleEditTeam}
        users={users}
      />

      <TeamDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        team={selectedTeam}
        onRefresh={loadTeams}
      />
    </div>
  );
};

export default TeamManagement;
