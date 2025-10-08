import axios from "axios";
import type { RoleResponse } from "@/types";

// Helper function to extract data from API response
const extractData = (response: any) => {
  if (response.data.content === null || response.data.content === undefined) {
    return response.data;
  }
  return response.data.content || response.data;
};

const RoleService = {
  // Get all roles
  async getAll(): Promise<{ data: RoleResponse[] }> {
    const response = await axios.get(
      "https://kimanhome.duckdns.org/spring-api/roles"
    );
    return { data: extractData(response) };
  },

  // Get role by ID
  async getById(id: string): Promise<{ data: RoleResponse }> {
    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/roles/${id}`
    );
    return { data: response.data.content };
  },

  // Create new role
  async create(roleData: { name: string }): Promise<{ data: RoleResponse }> {
    const response = await axios.post(
      "https://kimanhome.duckdns.org/spring-api/roles",
      roleData
    );
    return { data: response.data.content };
  },

  // Update role
  async update(
    id: string,
    roleData: { name: string }
  ): Promise<{ data: RoleResponse }> {
    const response = await axios.put(
      `https://kimanhome.duckdns.org/spring-api/roles/${id}`,
      roleData
    );
    return { data: response.data.content };
  },

  // Delete role
  async delete(id: string): Promise<void> {
    await axios.delete(`https://kimanhome.duckdns.org/spring-api/roles/${id}`);
  },
};

export default RoleService;
