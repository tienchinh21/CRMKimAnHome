import axios from "axios";
import type {
  TeamResponse,
  TeamDetailResponse,
  CreateTeamDto,
  UpdateTeamDto,
} from "@/types";

const TeamService = {
  // Get all teams
  async getAll(): Promise<{ data: TeamResponse[] }> {
    const response = await axios.get(
      "https://kimanhome.duckdns.org/spring-api/teams"
    );
    return { data: response.data };
  },

  // Get team by ID
  async getById(id: string): Promise<{ data: TeamDetailResponse }> {
    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/teams/${id}`
    );
    return { data: response.data };
  },

  // Create new team
  async create(teamData: CreateTeamDto): Promise<{ data: TeamResponse }> {
    const response = await axios.post(
      "https://kimanhome.duckdns.org/spring-api/teams",
      teamData
    );
    return { data: response.data };
  },

  // Update team
  async update(
    id: string,
    teamData: UpdateTeamDto
  ): Promise<{ data: TeamResponse }> {
    const response = await axios.put(
      `https://kimanhome.duckdns.org/spring-api/teams/${id}`,
      teamData
    );
    return { data: response.data };
  },

  // Delete team
  async delete(id: string): Promise<void> {
    await axios.delete(`https://kimanhome.duckdns.org/spring-api/teams/${id}`);
  },

  // Add member to team
  async addMember(teamId: string, memberIds: string[]): Promise<void> {
    await axios.post(
      `https://kimanhome.duckdns.org/spring-api/teams/${teamId}/members`,
      memberIds
    );
  },

  // Remove member from team
  async removeMember(teamId: string, memberId: string): Promise<void> {
    await axios.delete(
      `https://kimanhome.duckdns.org/spring-api/teams/${teamId}/members/${memberId}`
    );
  },

  // Update team leader
  async updateLeader(
    teamId: string,
    leaderId: string,
    name: string
  ): Promise<{ data: TeamResponse }> {
    const response = await axios.put(
      `https://kimanhome.duckdns.org/spring-api/teams/${teamId}`,
      { leaderId, name }
    );
    return { data: response.data };
  },
};

export default TeamService;
