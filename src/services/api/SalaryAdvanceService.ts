import axiosClient from "@/utils/axiosClient";
import { extractData } from "@/utils/apiHelpers";

export interface SalaryAdvance {
  id: string;
  userId: string;
  userFullName?: string;
  amount: number;
  expectedRepaymentDate: string;
  salaryAdvance?: string;
  note?: string;
  status?: number | string;
  rejectedReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateSalaryAdvancePayload {
  expectedRepaymentDate: string;
  amount: number;
  note?: string;
}

export interface UpdateSalaryAdvancePayload {
  expectedRepaymentDate?: string;
  amount?: number;
  note?: string;
}

export interface SalaryAdvanceListParams {
  userId?: string;
  status?: string;
  page?: number;
  size?: number;
  filter?: string;
}

const SalaryAdvanceService = {
  // Get all salary advances
  async getAll(params?: SalaryAdvanceListParams) {
    const queryParams = new URLSearchParams();

    if (params?.userId) {
      queryParams.append("userId", params.userId);
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.size !== undefined) {
      queryParams.append("size", params.size.toString());
    }
    if (params?.filter) {
      queryParams.append("filter", params.filter);
    }

    const url = queryParams.toString()
      ? `/salary-advances?${queryParams.toString()}`
      : "/salary-advances";
    const response = await axiosClient.get(url);
    return { ...response, data: extractData(response) };
  },

  // Get salary advance by ID
  async getById(id: string) {
    const response = await axiosClient.get(`/salary-advances/${id}`);
    return { ...response, data: extractData(response) };
  },

  // Create new salary advance
  async create(payload: CreateSalaryAdvancePayload) {
    const response = await axiosClient.post("/salary-advances", payload);
    return { ...response, data: extractData(response) };
  },

  // Update salary advance
  async update(id: string, payload: UpdateSalaryAdvancePayload) {
    const response = await axiosClient.put(`/salary-advances/${id}`, payload);
    return { ...response, data: extractData(response) };
  },

  // Delete salary advance
  async delete(id: string) {
    const response = await axiosClient.delete(`/salary-advances/${id}`);
    return { ...response, data: extractData(response) };
  },
};

export default SalaryAdvanceService;
