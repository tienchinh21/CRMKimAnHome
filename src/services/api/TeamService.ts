import axiosClient from "@/utils/axiosClient";
import type {
  TeamResponse,
  TeamDetailResponse,
  CreateTeamDto,
  UpdateTeamDto,
  MyTeamsResponse,
  TeamMembersCustomersResponse,
} from "@/types";

const TeamService = {
  async getAll(): Promise<{ data: TeamResponse[] }> {
    const response = await axiosClient.get("/teams");
    return { data: response.data };
  },

  async getById(id: string): Promise<{ data: TeamDetailResponse }> {
    const response = await axiosClient.get(`/teams/${id}`);
    return { data: response.data };
  },

  async create(teamData: CreateTeamDto): Promise<{ data: TeamResponse }> {
    const response = await axiosClient.post("/teams", teamData);
    return { data: response.data };
  },

  async update(
    id: string,
    teamData: UpdateTeamDto
  ): Promise<{ data: TeamResponse }> {
    const response = await axiosClient.put(`/teams/${id}`, teamData);
    return { data: response.data };
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/teams/${id}`);
  },

  async addMember(teamId: string, memberIds: string[]): Promise<void> {
    await axiosClient.post(`/teams/${teamId}/members`, memberIds);
  },

  async removeMember(teamId: string, memberId: string): Promise<void> {
    await axiosClient.delete(`/teams/${teamId}/members/${memberId}`);
  },

  async updateLeader(
    teamId: string,
    leaderId: string,
    name: string
  ): Promise<{ data: TeamResponse }> {
    const response = await axiosClient.put(`/teams/${teamId}`, {
      leaderId,
      name,
    });
    return { data: response.data };
  },

  // ⭐ Get my teams (for Leader role)
  async getMyTeams(): Promise<MyTeamsResponse> {
    const response = await axiosClient.get("/teams/my-teams");
    return response.data;
  },

  // Get customers of team members
  async getTeamMembersCustomers(
    page: number = 1,
    size: number = 10
  ): Promise<TeamMembersCustomersResponse> {
    const response = await axiosClient.get("/customers/team-members", {
      params: { page, size },
    });
    return response.data;
  },

  //  Get team dashboard
  async getTeamDashboard(teamId: string): Promise<any> {
    const response = await axiosClient.get(`/teams/${teamId}/dashboard`);
    return response;
  },
};

export default TeamService;
