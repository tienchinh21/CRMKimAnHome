import axiosClient from "@/utils/axiosClient";

export interface Deal {
  id: string;
  apartmentId: string;
  apartmentName?: string;
  apartmentAlias?: string;
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
  dealPayments?: DealPayment[];
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
  expectedRevenue: number;
  actualRevenue?: number;
  userAssignedId?: string;
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

      const url = filter ? `/deals?${queryParams.toString()}` : `/deals`;

      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Get all deals error:", error);
      throw error;
    }
  },

  // Get deal by ID
  async getById(id: string): Promise<DealResponse> {
    try {
      const response = await axiosClient.get(`/deals/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get deal by ID error:", error);
      throw error;
    }
  },

  // Create new deal
  async create(dealData: CreateDealRequest): Promise<DealResponse> {
    try {
      const response = await axiosClient.post(`/deals`, dealData);
      return response.data;
    } catch (error) {
      console.error("Create deal error:", error);
      throw error;
    }
  },

  // Update deal
  async update(dealData: UpdateDealRequest): Promise<DealResponse> {
    try {
      const response = await axiosClient.put(`/deals/${dealData.id}`, dealData);
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
      const response = await axiosClient.get(`/deal-payments?dealId=${dealId}`);
      return response.data;
    } catch (error) {
      console.error("Get deal payments error:", error);
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(id: string): Promise<DealPaymentResponse> {
    try {
      const response = await axiosClient.get(`/deal-payments/${id}`);
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
      const response = await axiosClient.post(`/deal-payments`, paymentData);
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
      const response = await axiosClient.put(
        `/deal-payments/${paymentData.id}`,
        paymentData
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
      await axiosClient.delete(`/deal-payments/${id}`);
    } catch (error) {
      console.error("Delete payment error:", error);
      throw error;
    }
  },
};

export default DealService;
