import axiosClient from "@/utils/axiosClient";
import type { SaleDashboardResponse } from "@/types/dashboard";

class DashboardService {
  async getSaleDashboard(
    month?: string,
    year?: string
  ): Promise<SaleDashboardResponse> {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);

    const queryString = params.toString();
    const url = queryString
      ? `/sale-dashboard?${queryString}`
      : "/sale-dashboard";

    const response = await axiosClient.get(url);
    return response.data;
  }
}

export default new DashboardService();
