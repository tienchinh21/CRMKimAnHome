import axiosClient from "@/utils/axiosClient";

export interface SystemConfigDto {
  id: string;
  section: string;
  key: string;
  value: string;
  type: string;
}

export interface CreateSystemConfigDto {
  data: {
    section: string;
    key: string;
    value: string;
    type: string;
  };
  file?: string;
}

export interface UpdateSystemConfigDto {
  data: {
    section: string;
    key: string;
    value: string;
    type: string;
  };
  file?: string;
}

export interface RestResponseListSystemConfigDto {
  error: any;
  content: SystemConfigDto[];
}

export interface RestResponseSystemConfigDto {
  error: any;
  content: SystemConfigDto;
}

class SystemConfigService {
  // Lấy tất cả cấu hình hệ thống
  async getAll(): Promise<RestResponseListSystemConfigDto> {
    const response = await axiosClient.get("/system-configs");
    return response.data;
  }

  // Lấy cấu hình theo ID
  async getById(id: string): Promise<RestResponseSystemConfigDto> {
    const response = await axiosClient.get(`/system-configs/${id}`);
    return response.data;
  }

  // Tạo cấu hình mới
  async create(
    data: CreateSystemConfigDto
  ): Promise<RestResponseSystemConfigDto> {
    const response = await axiosClient.post("/system-configs", data);
    return response.data;
  }

  // Cập nhật cấu hình
  async update(
    id: string,
    data: UpdateSystemConfigDto
  ): Promise<RestResponseSystemConfigDto> {
    const response = await axiosClient.put(`/system-configs/${id}`, data);
    return response.data;
  }

  // Xóa cấu hình
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/system-configs/${id}`);
  }

  // Upload file cho cấu hình
  async uploadFile(file: File, subPath: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post(
      `/storage/upload?subPath=${subPath}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }

  // Xóa file
  async deleteFile(url: string): Promise<void> {
    await axiosClient.delete(`/storage/delete?url=${encodeURIComponent(url)}`);
  }
}

export default new SystemConfigService();
