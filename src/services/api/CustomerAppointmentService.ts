import axios from "axios";

const API_BASE_URL = "https://kimanhome.duckdns.org/spring-api";

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
  async getAll(customerId?: string): Promise<AppointmentListResponse> {
    try {
      const url = customerId
        ? `${API_BASE_URL}/customer-appointments?customerId=${customerId}`
        : `${API_BASE_URL}/customer-appointments`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
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
      const response = await axios.post(
        `${API_BASE_URL}/customer-appointments`,
        appointment,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
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
      const response = await axios.put(
        `${API_BASE_URL}/customer-appointments/${id}`,
        appointment,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
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
      await axios.delete(`${API_BASE_URL}/customer-appointments/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
    } catch (error) {
      console.error("Delete appointment error:", error);
      throw error;
    }
  },
};

export default CustomerAppointmentService;
