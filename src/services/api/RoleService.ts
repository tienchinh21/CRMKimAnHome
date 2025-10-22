import axiosClient from "@/utils/axiosClient";
import { extractData } from "@/utils/apiHelpers";
import type { RoleResponse } from "@/types";

const RoleService = {
  async getAll(): Promise<{ data: RoleResponse[] }> {
    const response = await axiosClient.get("/roles");
    return { data: extractData(response) };
  },

  async getById(id: string): Promise<{ data: RoleResponse }> {
    const response = await axiosClient.get(`/roles/${id}`);
    return { data: response.data.content };
  },

  async create(roleData: { name: string }): Promise<{ data: RoleResponse }> {
    const response = await axiosClient.post("/roles", roleData);
    return { data: response.data.content };
  },

  async update(
    id: string,
    roleData: { name: string }
  ): Promise<{ data: RoleResponse }> {
    const response = await axiosClient.put(`/roles/${id}`, roleData);
    return { data: response.data.content };
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/roles/${id}`);
  },
};

export default RoleService;
