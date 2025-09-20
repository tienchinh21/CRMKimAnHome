import axiosClient from "@/utils/axiosClient";
import axios from "axios";

// Helper function to extract data from API response
const extractData = (response: any) => {
  // Nếu content là null hoặc undefined, trả về data gốc
  if (response.data.content === null || response.data.content === undefined) {
    return response.data;
  }
  return response.data.content || response.data;
};

export interface CreateProjectPayload {
  name: string;
  longitude: string;
  latitude: string;
  fullAddress: string;
}

export interface UpdateProjectPayload {
  name?: string;
  longitude?: string;
  latitude?: string;
  fullAddress?: string;
}

export interface CreateProjectDetailPayload {
  name: string;
  data: string;
  sortOrder?: number;
  projectId: string;
}

export interface CreateAmenityPayload {
  name: string;
  projectId: string;
  parentId?: string | null;
  sortOrder?: number;
}

const ProjectService = {
  // Get all projects
  async getAllProjects() {
    const response = await axiosClient.get("/projects");
    return { ...response, data: extractData(response) };
  },

  // Get project by ID
  async getProjectById(id: string) {
    const response = await axiosClient.get(`/projects/${id}`);
    return { ...response, data: extractData(response) };
  },

  // Create new project with images (API mới)
  async createProjectWithImages(data: CreateProjectPayload, files?: File[]) {
    const formData = new FormData();

    // Thêm data object với Content-Type application/json
    const dataBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("data", dataBlob);

    // Thêm files array - mỗi file là một field riêng biệt
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("file", file);
      });
    }

    const response = await axios.post(
      "https://kimanhome.duckdns.org/spring-api/projects",
      formData
    );
    return { ...response, data: extractData(response) };
  },

  // Update project with images
  async updateProjectWithImages(
    id: string,
    data: UpdateProjectPayload,
    files?: File[]
  ) {
    const formData = new FormData();

    // Thêm data object với Content-Type application/json
    const dataBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("data", dataBlob);

    // Thêm files array
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("file", file);
      });
    }

    const response = await axios.put(
      `https://kimanhome.duckdns.org/spring-api/projects/${id}`,
      formData
    );
    return { ...response, data: extractData(response) };
  },

  // Delete project
  async deleteProject(id: string) {
    const response = await axiosClient.delete(`/projects/${id}`);
    return { ...response, data: extractData(response) };
  },

  // Get project images
  async getProjectImages(projectId: string) {
    const response = await axiosClient.get(`/projects/${projectId}/images`);
    return { ...response, data: extractData(response) };
  },

  // Delete project image
  async deleteProjectImage(imageUrl: string) {
    const response = await axiosClient.delete(
      `/storage/delete?url=${encodeURIComponent(imageUrl)}`
    );
    return { ...response, data: extractData(response) };
  },

  // Create project details
  async createProjectDetails(items: CreateProjectDetailPayload[]) {
    const response = await axiosClient.post("/project-informations", items);
    return { ...response, data: extractData(response) };
  },

  // Get project details by project ID
  async getProjectDetailsByProjectId(projectId: string) {
    const response = await axiosClient.get(
      `/project-informations/project/${projectId}`
    );
    return { ...response, data: extractData(response) };
  },

  // Create amenities
  async createAmenities(items: CreateAmenityPayload[]) {
    const response = await axiosClient.post("/utilities", items);
    return { ...response, data: extractData(response) };
  },

  // Create a single amenity
  async createAmenity(item: CreateAmenityPayload) {
    const response = await axiosClient.post("/utilities", item);
    return { ...response, data: extractData(response) };
  },

  // Get amenities by project ID
  async getAmenitiesByProjectId(projectId: string) {
    const response = await axiosClient.get(`/utilities/project/${projectId}`);
    return { ...response, data: extractData(response) };
  },

  // Update amenity
  async updateAmenity(
    id: string,
    payload: { name?: string; projectId?: string; parentId?: string | null }
  ) {
    const response = await axiosClient.put(`/utilities/${id}`, payload);
    return { ...response, data: extractData(response) };
  },

  // Delete amenity
  async deleteAmenity(id: string) {
    const response = await axiosClient.delete(`/utilities/${id}`);
    return { ...response, data: extractData(response) };
  },

  // Update project information (PUT with array)
  async updateProjectInformation(
    projectId: string,
    details: Array<{
      name: string;
      data: string;
      sortOrder: number;
      projectId: string;
    }>
  ) {
    const response = await axiosClient.put(
      `/project-informations/project/${projectId}`,
      details
    );

    console.log("📡 API Response:", response);
    return { ...response, data: extractData(response) };
  },

  // Get projects with pagination (frontend simulation)
  async getWithPagination(page: number, size: number) {
    try {
      const response = await axiosClient.get("/projects");
      const allProjects = response.data?.content || [];

      // Simulate pagination on frontend
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedProjects = allProjects.slice(startIndex, endIndex);

      return {
        data: {
          response: paginatedProjects,
          info: {
            page: page,
            size: size,
            pages: Math.ceil(allProjects.length / size),
            total: allProjects.length,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },
};

export default ProjectService;
