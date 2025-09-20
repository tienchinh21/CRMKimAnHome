import axios from "axios";

const baseURL = import.meta.env.VITE_REACT_URL;

const axiosClient: any = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Simple interceptors for logging and error normalization
axiosClient.interceptors.request.use((config: any) => {
  return config;
});

axiosClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    const message =
      error?.response?.data?.message || error?.message || "Unknown error";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
