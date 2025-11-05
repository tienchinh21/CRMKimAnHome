import axiosClient from "@/utils/axiosClient";

export interface UploadFileResponse {
  url: string;
}

const StorageService = {
  async uploadFile(file: File, subPath: string): Promise<string> {

    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post(
      `/storage/upload?subPath=${encodeURIComponent(subPath)}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async uploadFiles(files: File[], subPath: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, subPath));
    return Promise.all(uploadPromises);
  },

  async deleteFile(url: string): Promise<void> {
    await axiosClient.delete(`/storage/delete?url=${encodeURIComponent(url)}`);
  },

  async deleteFiles(urls: string[]): Promise<void> {
    const deletePromises = urls.map((url) => this.deleteFile(url));
    await Promise.all(deletePromises);
  },

  getSubPath(
    entityType: "projects" | "apartments" | "blogs",
    entityId?: string
  ): string {
    const timestamp = new Date().toISOString().split("T")[0];
    if (entityId) {
      return `${entityType}/${entityId}/${timestamp}`;
    }
    return `${entityType}/${timestamp}`;
  },
};

export default StorageService;
