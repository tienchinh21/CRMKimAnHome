import axiosClient from "@/utils/axiosClient";
import type {
  BonusListResponse,
  BonusResponse,
  CreateBonusRequest,
  UpdateBonusRequest,
} from "@/types/bonus";

const BonusService = {
  async getAll(filter?: string): Promise<BonusListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filter) {
        queryParams.append("filter", filter);
      }

      const url = filter ? `/bonuses?${queryParams.toString()}` : `/bonuses`;

      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Get all bonuses error:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<BonusResponse> {
    try {
      const response = await axiosClient.get(`/bonuses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get bonus by ID error:", error);
      throw error;
    }
  },

  async create(bonusData: CreateBonusRequest): Promise<BonusResponse> {
    try {
      const response = await axiosClient.post(`/bonuses`, bonusData);
      return response.data;
    } catch (error) {
      console.error("Create bonus error:", error);
      throw error;
    }
  },

  async update(bonusData: UpdateBonusRequest): Promise<BonusResponse> {
    try {
      const response = await axiosClient.put(
        `/bonuses/${bonusData.id}`,
        bonusData
      );
      return response.data;
    } catch (error) {
      console.error("Update bonus error:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axiosClient.delete(`/bonuses/${id}`);
    } catch (error) {
      console.error("Delete bonus error:", error);
      throw error;
    }
  },

  buildFilter(params: {
    search?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): string {
    const conditions: string[] = [];

    if (params.search) {
      conditions.push(`name ~ '*${params.search}*'`);
    }

    if (params.startDate) {
      conditions.push(`startDate >= '${params.startDate}'`);
    }

    if (params.endDate) {
      conditions.push(`endDate <= '${params.endDate}'`);
    }

    if (params.userId) {
      conditions.push(`user.id : '${params.userId}'`);
    }

    return conditions.join(" and ");
  },
};

export default BonusService;
