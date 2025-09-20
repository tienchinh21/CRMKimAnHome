import axiosClient from "@/utils/axiosClient";

export interface UploadFileResponse {
  url: string;
}

const StorageService = {
  // Upload file to storage
  async uploadFile(file: File, subPath: string): Promise<string> {
    console.log("📁 API: Uploading file:", file.name, "to subPath:", subPath);

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

    // API returns the URL as a string
    return response.data;
  },

  // Upload multiple files
  async uploadFiles(files: File[], subPath: string): Promise<string[]> {
    console.log(
      "📁 API: Uploading multiple files:",
      files.length,
      "to subPath:",
      subPath
    );

    const uploadPromises = files.map((file) => this.uploadFile(file, subPath));
    return Promise.all(uploadPromises);
  },

  // Delete file from storage
  async deleteFile(url: string): Promise<void> {
    console.log("📁 API: Deleting file:", url);

    await axiosClient.delete(`/storage/delete?url=${encodeURIComponent(url)}`);
  },

  // Delete multiple files
  async deleteFiles(urls: string[]): Promise<void> {
    console.log("📁 API: Deleting multiple files:", urls.length);

    const deletePromises = urls.map((url) => this.deleteFile(url));
    await Promise.all(deletePromises);
  },

  // Helper method to get subPath based on entity type
  getSubPath(
    entityType: "projects" | "apartments" | "blogs",
    entityId?: string
  ): string {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    if (entityId) {
      return `${entityType}/${entityId}/${timestamp}`;
    }
    return `${entityType}/${timestamp}`;
  },
};

export default StorageService;
