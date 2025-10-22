import axios from "axios";

const baseURL = import.meta.env.VITE_REACT_URL;

const axiosClient: any = axios.create({
  baseURL,
  withCredentials: false,
});

axiosClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Only set Content-Type for non-FormData requests
  // For FormData, let axios set it automatically with boundary
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  
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
