import axios from "axios";

const API_BASE_URL = "https://kimanhome.duckdns.org/spring-api";

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

      const response = await axios.get(
        `${API_BASE_URL}/customers?${queryParams.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
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
      const response = await axios.get(`${API_BASE_URL}/customers/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get customer by ID error:", error);
      throw error;
    }
  },

  // Create new customer
  async create(customer: CreateCustomerRequest): Promise<CustomerResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/customers`, customer, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Create customer error:", error);
      throw error;
    }
  },

  // Update customer
  async update(customer: UpdateCustomerRequest): Promise<CustomerResponse> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/customers/${customer.id}`,
        customer,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
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
      await axios.delete(`${API_BASE_URL}/customers/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
    } catch (error) {
      console.error("Delete customer error:", error);
      throw error;
    }
  },

  // Search customers
  async search(searchTerm: string): Promise<CustomerListResponse> {
    try {
      const response = await axios.get(
        // ✅ FIXED: Use ~ (like) with wildcard * instead of ~~, and lowercase 'or' instead of 'OR'
        `${API_BASE_URL}/customers?filter=fullName ~ '*${searchTerm}*' or phoneNumber ~ '*${searchTerm}*'`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Search customers error:", error);
      throw error;
    }
  },
};

export default CustomerService;
