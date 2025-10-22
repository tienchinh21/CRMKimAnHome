import axiosClient from "@/utils/axiosClient";

export interface UpcomingAppointment {
  id: number;
  time: string;
  note: string;
  customerId: string;
  userId: string;
  userAssignedname: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  sourcesId: string;
  demandId: string;
  projectId: string;
  note: string;
  pipelineId: string;
  sourcesName?: string;
  demandName?: string;
  projectName?: string;
  pipelineName?: string;
  createdAt?: string;
  updatedAt?: string;
  upcomingAppointments?: UpcomingAppointment[];
}

export interface CreateCustomerRequest {
  fullName: string;
  phoneNumber: string;
  sourcesId: string;
  demandId: string;
  projectId: string;
  note: string;
  pipelineId: string;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string;
}

export interface CustomerListParams {
  page?: number;
  size?: number;
  filter?: string; // Spring Filter syntax
}

export interface CustomerResponse {
  error: null;
  content: Customer[];
}

export interface CustomerListResponse {
  error: null;
  content: {
    content: Customer[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

const CustomerService = {
  async getAll(params: CustomerListParams = {}): Promise<CustomerListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params.size !== undefined) {
        queryParams.append("size", params.size.toString());
      }
      if (params.filter) {
        queryParams.append("filter", params.filter);
      }

      const response = await axiosClient.get(
        `/customers?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Get customers error:", error);
      throw error;
    }
  },

  // Get customer by ID
  async getById(id: string): Promise<CustomerResponse> {
    try {
      const response = await axiosClient.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get customer by ID error:", error);
      throw error;
    }
  },

  // Create new customer
  async create(customer: CreateCustomerRequest): Promise<CustomerResponse> {
    try {
      const response = await axiosClient.post(`/customers`, customer);
      return response.data;
    } catch (error) {
      console.error("Create customer error:", error);
      throw error;
    }
  },

  // Update customer
  async update(customer: UpdateCustomerRequest): Promise<CustomerResponse> {
    try {
      const response = await axiosClient.put(
        `/customers/${customer.id}`,
        customer
      );
      return response.data;
    } catch (error) {
      console.error("Update customer error:", error);
      throw error;
    }
  },

  // Delete customer
  async delete(id: string): Promise<void> {
    try {
      await axiosClient.delete(`/customers/${id}`);
    } catch (error) {
      console.error("Delete customer error:", error);
      throw error;
    }
  },

  // Search customers
  async search(searchTerm: string): Promise<CustomerListResponse> {
    try {
      const response = await axiosClient.get(
        `/customers?filter=fullName ~ '*${searchTerm}*' or phoneNumber ~ '*${searchTerm}*'`
      );
      return response.data;
    } catch (error) {
      console.error("Search customers error:", error);
      throw error;
    }
  },
};

export default CustomerService;
