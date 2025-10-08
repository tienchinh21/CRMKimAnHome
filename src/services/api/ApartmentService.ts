import axios from "axios";
import type {
  CreateApartmentDto,
  UpdateApartmentDto,
  ReponseApartmentDto,
  ReponseDetailApartmentDto,
  SpecificationApartment,
} from "@/types/apartment";

import type { RestResponse, Pageable } from "@/types/common";

// Helper function to extract data from API response
const extractData = (response: any) => {
  // Nếu content là null hoặc undefined, trả về data gốc
  if (response.data.content === null || response.data.content === undefined) {
    return response.data;
  }
  return response.data.content || response.data;
};

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

    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/apartments?${queryParams.toString()}`
    );
    return { ...response, data: extractData(response) };
  },

  // Get apartment by ID
  async getById(id: string): Promise<RestResponse<ReponseDetailApartmentDto>> {
    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/apartments/id/${id}`
    );
    return response.data;
  },

  // Get apartment by slug
  async getBySlug(
    slug: string
  ): Promise<RestResponse<ReponseDetailApartmentDto>> {
    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/apartments/slug/${slug}`
    );
    return { ...response, data: extractData(response) };
  },

  // Create new apartment
  async create(
    payload: CreateApartmentPayload
  ): Promise<RestResponse<ReponseApartmentDto>> {
    const formData = new FormData();

    // Add apartment data as Blob with application/json type
    const dataBlob = new Blob([JSON.stringify(payload.data)], {
      type: "application/json",
    });
    formData.append("data", dataBlob);

    // Add files
    if (payload.file && payload.file.length > 0) {
      payload.file.forEach((file) => {
        formData.append(`file`, file);
      });
    }

    const response = await axios.post(
      "https://kimanhome.duckdns.org/spring-api/apartments",
      formData
    );

    return { ...response, data: extractData(response) };
  },

  // Update apartment
  async update(
    id: string,
    payload: UpdateApartmentPayload
  ): Promise<RestResponse<void>> {
    const formData = new FormData();

    // Add apartment data as Blob with application/json type
    const dataBlob = new Blob([JSON.stringify(payload.data)], {
      type: "application/json",
    });
    formData.append("data", dataBlob);

    // Add files if provided
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append(`files`, file);
      });
    }

    const response = await axios.put(
      `https://kimanhome.duckdns.org/spring-api/apartments/${id}`,
      formData
    );

    return { ...response, data: extractData(response) };
  },

  // Delete apartment
  async delete(id: string): Promise<RestResponse<void>> {
    const response = await axios.delete(
      `https://kimanhome.duckdns.org/spring-api/apartments/${id}`
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
    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/legals?apartmentId=${apartmentId}`
    );
    return { ...response, data: extractData(response) };
  },

  async createLegal(
    apartmentId: string,
    legalData: { name: string; sortOrder?: number }
  ) {
    const response = await axios.post(
      "https://kimanhome.duckdns.org/spring-api/legals",
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
    const response = await axios.put(
      `https://kimanhome.duckdns.org/spring-api/legals/${legalId}`,
      {
        ...legalData,
        sortOrder: legalData.sortOrder || 0,
      }
    );
    return { ...response, data: extractData(response) };
  },

  async deleteLegal(legalId: string) {
    const response = await axios.delete(
      `https://kimanhome.duckdns.org/spring-api/legals/${legalId}`
    );
    return { ...response, data: extractData(response) };
  },
};

export default ApartmentService;
