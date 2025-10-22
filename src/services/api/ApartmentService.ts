import axiosClient from "@/utils/axiosClient";
import { extractData, createFormDataWithJson } from "@/utils/apiHelpers";
import type {
  CreateApartmentDto,
  UpdateApartmentDto,
  ReponseApartmentDto,
  ReponseDetailApartmentDto,
  SpecificationApartment,
} from "@/types/apartment";

import type { RestResponse, Pageable } from "@/types/common";

export interface CreateApartmentPayload {
  data: CreateApartmentDto;
  file: File[]; // Files for upload
}

export interface UpdateApartmentPayload {
  data: UpdateApartmentDto;
  files?: File[]; // Files for upload (note: API uses 'files' not 'file')
}

export interface ApartmentListParams {
  filter?: string; // Spring Filter syntax
  pageable?: Pageable;
}

const ApartmentService = {
  // Get all apartments with pagination and filtering
  async getAll(params?: ApartmentListParams) {
    const queryParams = new URLSearchParams();

    // Add pageable params
    if (params?.pageable) {
      if (params.pageable.page !== undefined) {
        queryParams.append("pageable.page", params.pageable.page.toString());
      }
      if (params.pageable.size !== undefined) {
        queryParams.append("pageable.size", params.pageable.size.toString());
      }
      if (params.pageable.sort) {
        params.pageable.sort.forEach((sort) => {
          queryParams.append("pageable.sort", sort);
        });
      }
    }

    // Add filter param
    if (params?.filter) {
      queryParams.append("filter", params.filter);
    }

    const response = await axiosClient.get(
      `/apartments?${queryParams.toString()}`
    );
    return { ...response, data: extractData(response) };
  },

  // Get apartment by ID
  async getById(id: string): Promise<RestResponse<ReponseDetailApartmentDto>> {
    const response = await axiosClient.get(
      `/apartments/id/${id}`
    );
    return response.data;
  },

  // Get apartment by slug
  async getBySlug(
    slug: string
  ): Promise<RestResponse<ReponseDetailApartmentDto>> {
    const response = await axiosClient.get(
      `/apartments/slug/${slug}`
    );
    return { ...response, data: extractData(response) };
  },

  // Create new apartment
  async create(
    payload: CreateApartmentPayload
  ): Promise<RestResponse<ReponseApartmentDto>> {
    const formData = createFormDataWithJson(payload.data, payload.file);

    const response = await axiosClient.post(
      "/apartments",
      formData
    );

    return { ...response, data: extractData(response) };
  },

  // Update apartment
  async update(
    id: string,
    payload: UpdateApartmentPayload
  ): Promise<RestResponse<void>> {
    const formData = createFormDataWithJson(payload.data, payload.files);

    const response = await axiosClient.put(
      `/apartments/${id}`,
      formData
    );

    return { ...response, data: extractData(response) };
  },

  // Delete apartment
  async delete(id: string): Promise<RestResponse<void>> {
    const response = await axiosClient.delete(
      `/apartments/${id}`
    );
    return { ...response, data: extractData(response) };
  },

  // Helper methods for common operations

  // Get apartments by project ID (using Spring Filter syntax)
  async getByProjectId(projectId: string, pageable?: Pageable) {
    const params: ApartmentListParams = {
      filter: `project.id : '${projectId}'`,
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

  // Get apartments with simple pagination (wrapper for easier use)
  async getWithPagination(page: number = 0, size: number = 10) {
    const params: ApartmentListParams = {
      pageable: { page, size },
    };

    return this.getAll(params);
  },

  // Search apartments by name or other criteria
  async search(searchTerm: string, pageable?: Pageable) {
    const params: ApartmentListParams = {
      filter: `name ~ '*${searchTerm}*'`,
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

  // Legal Management APIs
  async getLegals(apartmentId: string) {
    const response = await axiosClient.get(
      `/legals?apartmentId=${apartmentId}`
    );
    return { ...response, data: extractData(response) };
  },

  async createLegal(
    apartmentId: string,
    legalData: { name: string; sortOrder?: number }
  ) {
    const response = await axiosClient.post(
      "/legals",
      {
        ...legalData,
        apartmentId,
        sortOrder: legalData.sortOrder || 0,
      }
    );
    return { ...response, data: extractData(response) };
  },

  async updateLegal(
    legalId: string,
    legalData: { name: string; sortOrder?: number }
  ) {
    const response = await axiosClient.put(
      `/legals/${legalId}`,
      {
        ...legalData,
        sortOrder: legalData.sortOrder || 0,
      }
    );
    return { ...response, data: extractData(response) };
  },

  async deleteLegal(legalId: string) {
    const response = await axiosClient.delete(
      `/legals/${legalId}`
    );
    return { ...response, data: extractData(response) };
  },
};

export default ApartmentService;
