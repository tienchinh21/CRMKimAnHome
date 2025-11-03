import axios from "axios";
import { toast } from "sonner";

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


  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      "Unknown error";

    toast.error(message);

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
