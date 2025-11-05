import axiosClient from "@/utils/axiosClient";
import { extractData, createFormDataWithJson } from "@/utils/apiHelpers";
import type {
  CreateApartmentDto,
  UpdateApartmentDto,
  ReponseApartmentDto,
  ReponseDetailApartmentDto,
} from "@/types/apartment";

import type { RestResponse, Pageable } from "@/types/common";

export interface CreateApartmentPayload {
  data: CreateApartmentDto;
  file: File[];
}

export interface UpdateApartmentPayload {
  data: UpdateApartmentDto;
  files?: File[]; 
}

export interface ApartmentListParams {
  filter?: string; 
  pageable?: Pageable;
}

const ApartmentService = {
  async getAll(params?: ApartmentListParams) {
    const queryParams = new URLSearchParams();

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

    if (params?.filter) {
      queryParams.append("filter", params.filter);
    }

    const response = await axiosClient.get(
      `/apartments?${queryParams.toString()}`
    );
    return { ...response, data: extractData(response) };
  },

  async getById(id: string): Promise<RestResponse<ReponseDetailApartmentDto>> {
    const response = await axiosClient.get(
      `/apartments/id/${id}`
    );
    return response.data;
  },

  async getBySlug(
    slug: string
  ): Promise<RestResponse<ReponseDetailApartmentDto>> {
    const response = await axiosClient.get(
      `/apartments/slug/${slug}`
    );
    return { ...response, data: extractData(response) };
  },

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

    async delete(id: string): Promise<RestResponse<void>> {
    const response = await axiosClient.delete(
      `/apartments/${id}`
    );
    return { ...response, data: extractData(response) };
  },


  async getByProjectId(projectId: string, pageable?: Pageable) {
    const params: ApartmentListParams = {
      filter: `project.id : '${projectId}'`,
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

  async getWithPagination(page: number = 0, size: number = 10) {
    const params: ApartmentListParams = {
      pageable: { page, size },
    };

    return this.getAll(params);
  },

  async search(searchTerm: string, pageable?: Pageable) {
    const params: ApartmentListParams = {
      filter: `name ~ '*${searchTerm}*'`,
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

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
