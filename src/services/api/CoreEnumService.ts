import axios from "axios";
import type { CoreEnum, CreateCoreEnumDto } from "@/types";

// Helper function to extract data from API response
export const extractData = (response: any) => {
  if (response.data.content === null || response.data.content === undefined) {
    return response.data;
  }
  return response.data.content || response.data;
};

const CoreEnumService = {
  // Get all core enums
  async getAll(): Promise<{ data: CoreEnum[] }> {
    const response = await axios.get(
      "https://kimanhome.duckdns.org/spring-api/core-enum"
    );
    return { data: response.data };
  },

  // Get core enums by type
  async getByType(type: string): Promise<{ data: CoreEnum[] }> {
    try {
      const response = await axios.get(
        `https://kimanhome.duckdns.org/spring-api/core-enum/${type}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return { data: extractData(response) };
    } catch (error) {
      console.error(`Get core enum by type ${type} error:`, error);
      throw error;
    }
  },

  // Get core enum by type and name
  async getByName(type: string, name: string): Promise<{ data: CoreEnum }> {
    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/core-enum/${type}/${name}`
    );
    return { data: response.data };
  },

  // Create new core enum
  async create(enumData: CreateCoreEnumDto): Promise<{ data: CoreEnum }> {
    const response = await axios.post(
      "https://kimanhome.duckdns.org/spring-api/core-enum",
      enumData
    );
    return { data: response.data };
  },
};

export default CoreEnumService;
