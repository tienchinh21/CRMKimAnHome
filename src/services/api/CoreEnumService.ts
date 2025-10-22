import axiosClient from "@/utils/axiosClient";
import { extractData } from "@/utils/apiHelpers";
import type { CoreEnum, CreateCoreEnumDto } from "@/types";

const CoreEnumService = {
  async getAll(): Promise<{ data: CoreEnum[] }> {
    const response = await axiosClient.get("/core-enum");
    return { data: response.data };
  },

  async getByType(type: string): Promise<{ data: CoreEnum[] }> {
    try {
      const response = await axiosClient.get(`/core-enum/${type}`);
      return { data: extractData(response) };
    } catch (error) {
      console.error(`Get core enum by type ${type} error:`, error);
      throw error;
    }
  },

  async getByName(type: string, name: string): Promise<{ data: CoreEnum }> {
    const response = await axiosClient.get(`/core-enum/${type}/${name}`);
    return { data: response.data };
  },

  async create(enumData: CreateCoreEnumDto): Promise<{ data: CoreEnum }> {
    const response = await axiosClient.post("/core-enum", enumData);
    return { data: response.data };
  },
};

export default CoreEnumService;
