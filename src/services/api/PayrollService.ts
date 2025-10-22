import axiosClient from "@/utils/axiosClient";
import { extractData } from "@/utils/apiHelpers";

export interface Payroll {
  id: string;
  month: string;
  expSaleRev: number;        // Doanh thu bán dự kiến
  expRentalRev: number;      // Doanh thu thuê dự kiến
  actSaleRev: number;        // Doanh thu bán thực tế
  actRentalRev: number;      // Doanh thu thuê thực tế
  expSaleComm: number;       // Hoa hồng bán dự kiến
  expRentalComm: number;     // Hoa hồng thuê dự kiến
  actSaleComm: number;       // Hoa hồng bán thực tế
  actRentalComm: number;     // Hoa hồng thuê thực tế
  supportAmount: number;     // Tiền hỗ trợ
  companyDebtAmount: number | null;  // Nợ công ty
  finalIncome: number;       // Thu nhập cuối cùng
  userId: string;
  userFullName?: string;
}

export interface PayrollListParams {
  userId?: string;
  month?: string;
  status?: string;
  page?: number;
  size?: number;
  filter?: string;
}

const PayrollService = {
  // Get all payrolls
  async getAll(params?: PayrollListParams) {
    const queryParams = new URLSearchParams();

    if (params?.userId) {
      queryParams.append("userId", params.userId);
    }
    if (params?.month) {
      queryParams.append("month", params.month);
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
      ? `/payrolls?${queryParams.toString()}`
      : "/payrolls";
    const response = await axiosClient.get(url);
    console.log(response);
    return { ...response, data: extractData(response) };
  },

  // Get payroll by ID (view only)
  async getById(id: string) {
    const response = await axiosClient.get(`/payrolls/${id}`);
    return { ...response, data: extractData(response) };
  },

  // Get payrolls by user
  async getByUserId(userId: string, params?: { month?: string }) {
    return this.getAll({ userId, ...params });
  },

  // Get payrolls by month
  async getByMonth(month: string) {
    return this.getAll({ month });
  },
};

export default PayrollService;
