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
import TeamMemberCustomersTab from "@/components/teams/TeamMemberCustomersTab";
import TeamDashboardModal from "@/components/teams/TeamDashboardModal";

import type { TeamResponse, UserResponse, TeamMember } from "@/types";
import {
  Trash2,
  Eye,
  Users,
  UserCheck,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TeamService from "@/services/api/TeamService";
import UserService from "@/services/api/UserService";
import { usePermission } from "@/hooks/usePermission";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/breadcrumb";

const TeamManagement: React.FC = () => {
  // ⭐ Check user role
  const { isRole } = usePermission();
  const isAdmin = isRole("ADMIN");
  const isLeader = isRole("LEADER");
  const navigate = useNavigate();
  // ADMIN states
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamResponse[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [selectedTeamForDashboard, setSelectedTeamForDashboard] =
    useState<string>("");
  const [loading, setLoading] = useState(false);

  // LEADER states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [allTeamMembersCustomers, setAllTeamMembersCustomers] = useState<any[]>(
    []
  );

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
    if (isLeader) {
      loadAllTeamMembersCustomers();
    }
  }, [isAdmin, isLeader]);

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
      let response;

      // ⭐ Load teams based on role
      if (isAdmin) {
        response = await TeamService.getAll();
        // @ts-ignore
        setTeams(response.data.content || []);
        setTeamMembers([]);
        setSelectedMember(null);
      } else if (isLeader) {
        const myTeamsResponse = await TeamService.getMyTeams();
        // @ts-ignore
        const members = myTeamsResponse.content || [];
        setTeamMembers(members);
        setTeams([]); // Clear teams for LEADER
        setSelectedMember(null);
      } else {
        setTeams([]);
        setTeamMembers([]);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
      setTeams([]);
      setTeamMembers([]);
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

  // ⭐ Load all team members customers (1 time only for LEADER)
  const loadAllTeamMembersCustomers = async () => {
    try {
      const response = await TeamService.getTeamMembersCustomers(0, 1000);
      // @ts-ignore
      setAllTeamMembersCustomers(response.content?.response || []);
      console.log(
        "📡 Loaded all team members customers:",
        response.content?.response?.length
      );
    } catch (error) {
      console.error("Error loading team members customers:", error);
      setAllTeamMembersCustomers([]);
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
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              window.location.href = `/teams/${team.id}/dashboard`;
            }}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Xem tổng quan</TooltipContent>
      </Tooltip>
      {/* ⭐ Only ADMIN can delete teams */}
      {isAdmin && (
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
      )}
    </div>
  );

  // Handlers
  const handleCreateTeam = async (teamData: any) => {
    if (!isAdmin) {
      console.warn("❌ Only ADMIN can create teams");
      return;
    }
    try {
      await TeamService.create(teamData);
      await loadTeams();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  const handleEditTeam = async (teamData: any) => {
    if (!isAdmin) {
      console.warn("❌ Only ADMIN can edit teams");
      return;
    }
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
    if (!isAdmin) {
      console.warn("❌ Only ADMIN can delete teams");
      return;
    }
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
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Breadcrumb */}
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isAdmin ? "Quản lý đội nhóm" : "Đội nhóm của tôi"}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {isAdmin
              ? "Quản lý thông tin và thành viên các đội nhóm"
              : "Xem thông tin đội nhóm của bạn"}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Tạo đội mới
          </Button>
        )}
      </div>

      {isAdmin && (
        <>
          {/* Filter */}
          <Filter
            config={filterConfig}
            onReset={handleResetFilters}
            onRefresh={handleRefresh}
            loading={loading}
          />

          {/* Data Table */}
          <Card>
            <CardContent className="">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <DataTable
                  columns={columns}
                  data={filteredTeams}
                  actions={actions}
                  emptyMessage="Không tìm thấy đội nào"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isLeader && (
        <>
          {/* Dashboard Button for Leader */}
          {teamMembers.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const teamId = teamMembers[0]?.teamId;
                  if (teamId) {
                    navigate(`/teams/${teamId}/dashboard`);
                  }
                }}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Xem tổng quan nhóm
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Team Members List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardContent className="p-0">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thành viên đội
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {teamMembers.length} thành viên
                    </p>
                  </div>
                  <div className="overflow-y-auto max-h-[600px]">
                    {loading ? (
                      <div className="p-6 text-center text-gray-500">
                        Đang tải...
                      </div>
                    ) : teamMembers.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        Không có thành viên
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {teamMembers.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className={`p-4 cursor-pointer transition-colors ${
                              selectedMember?.id === member.id
                                ? "bg-blue-50 border-l-4 border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {member.fullName}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                  {member.email}
                                </p>
                                {member.leader && (
                                  <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                                    Trưởng nhóm
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Team Member Customers */}
            <div className="lg:col-span-2">
              {selectedMember ? (
                <TeamMemberCustomersTab
                  selectedMember={selectedMember}
                  allCustomers={allTeamMembersCustomers}
                />
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-[600px]">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">
                        Chọn một thành viên để xem khách hàng
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

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
