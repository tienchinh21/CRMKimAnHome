import axios from "axios";

const API_BASE_URL = "https://kimanhome.duckdns.org/spring-api";

export interface Deal {
  id: string;
  apartmentId: string;
  apartmentName?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  statusDealId: string;
  statusDealName?: string;
  userAssigneeId: string;
  userAssigneeName?: string;
  expectedRevenue: number;
  actualRevenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDealRequest {
  apartmentId: string;
  customerId: string;
  expectedRevenue: number;
}

export interface UpdateDealRequest {
  id: string;
  apartmentId: string;
  customerId: string;
  statusDealId: string;
  userAssigneeId: string;
  expectedRevenue: number;
  actualRevenue?: number;
}

export interface DealPayment {
  id: string;
  dealId: string;
  month: string;
  revenue: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDealPaymentRequest {
  month: string;
  revenue: number;
  dealId: string;
}

export interface UpdateDealPaymentRequest {
  id: string;
  month: string;
  revenue: number;
  dealId: string;
}

export interface DealPaymentResponse {
  error: null;
  content: DealPayment;
}

export interface DealPaymentListResponse {
  error: null;
  content: DealPayment[];
}

export interface DealListResponse {
  error: null;
  content: {
    info: {
      page: number;
      size: number;
      pages: number;
      total: number;
    };
  };
  response: Deal[];
}

export interface DealResponse {
  error: null;
  content: Deal;
}

const DealService = {
  // Get all deals with optional filter
  async getAll(filter?: string): Promise<DealListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filter) {
        queryParams.append("filter", filter);
      }

      const url = filter
        ? `${API_BASE_URL}/deals?${queryParams.toString()}`
        : `${API_BASE_URL}/deals`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get all deals error:", error);
      throw error;
    }
  },

  // Get deal by ID
  async getById(id: string): Promise<DealResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/deals/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get deal by ID error:", error);
      throw error;
    }
  },

  // Create new deal
  async create(dealData: CreateDealRequest): Promise<DealResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/deals`, dealData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Create deal error:", error);
      throw error;
    }
  },

  // Update deal
  async update(dealData: UpdateDealRequest): Promise<DealResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/deals/${dealData.id}`,
        dealData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update deal error:", error);
      throw error;
    }
  },

  // Get deals by customer ID (helper method)
  async getByCustomerId(customerId: string): Promise<{ data: Deal[] }> {
    try {
      const response = await this.getAll();
      const deals = response.response || [];
      const filtered = deals.filter(
        (deal: Deal) => deal.customerId === customerId
      );
      return { data: filtered };
    } catch (error) {
      console.error("Get deals by customer error:", error);
      throw error;
    }
  },

  // ==================== DEAL PAYMENT APIs ====================

  // Get all payments for a deal
  async getPaymentsByDealId(dealId: string): Promise<DealPaymentListResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/deal-payments?dealId=${dealId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Get deal payments error:", error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(id: string): Promise<DealPaymentResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/deal-payments/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get payment by ID error:", error);
      throw error;
    }
  },

  // Create new payment
  async createPayment(
    paymentData: CreateDealPaymentRequest
  ): Promise<DealPaymentResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/deal-payments`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  },

  // Update payment
  async updatePayment(
    paymentData: UpdateDealPaymentRequest
  ): Promise<DealPaymentResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/deal-payments/${paymentData.id}`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update payment error:", error);
      throw error;
    }
  },

  // Delete payment
  async deletePayment(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/deal-payments/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
    } catch (error) {
      console.error("Delete payment error:", error);
      throw error;
    }
  },
};

export default DealService;
