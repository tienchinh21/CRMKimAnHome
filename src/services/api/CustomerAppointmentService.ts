import axiosClient from "@/utils/axiosClient";

export interface CustomerAppointment {
  id: string;
  time: string; // ISO 8601 format
  customerId: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentRequest {
  time: string;
  customerId: string;
  note: string;
}

export interface UpdateAppointmentRequest {
  id: string;
  time: string;
  customerId: string;
  note: string;
}

export interface AppointmentListResponse {
  error: null;
  content: {
    response: CustomerAppointment[];
    totalElements: number;
    totalPages: number;
  };
}

export interface AppointmentResponse {
  error: null;
  content: CustomerAppointment;
}

const CustomerAppointmentService = {
  // Get all appointments (optional filter by customerId)
  async getAll(
    customerId?: string,
    page: number = 0,
    size: number = 10
  ): Promise<AppointmentListResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());

      if (customerId) {
        params.append("filter", `customer.id : '${customerId}'`);
      }

      const url = `/customer-appointments?${params.toString()}`;
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Get appointments error:", error);
      throw error;
    }
  },

  // Create new appointment
  async create(
    appointment: CreateAppointmentRequest
  ): Promise<AppointmentResponse> {
    try {
      const response = await axiosClient.post(
        `/customer-appointments`,
        appointment
      );
      return response.data;
    } catch (error) {
      console.error("Create appointment error:", error);
      throw error;
    }
  },

  // Update appointment
  async update(
    id: string,
    appointment: CreateAppointmentRequest
  ): Promise<AppointmentResponse> {
    try {
      const response = await axiosClient.put(
        `/customer-appointments/${id}`,
        appointment
      );
      return response.data;
    } catch (error) {
      console.error("Update appointment error:", error);
      throw error;
    }
  },

  // Delete appointment
  async delete(id: string): Promise<void> {
    try {
      await axiosClient.delete(`/customer-appointments/${id}`);
    } catch (error) {
      console.error("Delete appointment error:", error);
      throw error;
    }
  },
};

export default CustomerAppointmentService;
