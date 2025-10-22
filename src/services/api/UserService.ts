import axiosClient from "@/utils/axiosClient";
import { extractData, createFormDataWithJson } from "@/utils/apiHelpers";
import type {
  UserResponse,
  UserDetailResponse,
  UpdateUserDto,
  Pageable,
} from "@/types";
import type { CreateUserDto } from "@/types/team";

export interface UserListParams {
  spec?: any;
  filter?: string; // Spring Filter syntax
  pageable?: Pageable;
}

const UserService = {
  // Get all users with pagination and filtering
  async getAll(params?: UserListParams) {
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

    // Add spec params (if needed for filtering)
    if (params?.spec) {
      Object.entries(params.spec).forEach(([key, value]) => {
        queryParams.append(`spec.${key}`, String(value));
      });
    }

    // Add filter param
    if (params?.filter) {
      queryParams.append("filter", params.filter);
    }

    const response = await axiosClient.get(
      `/users?${queryParams.toString()}`
    );
    return { ...response, data: extractData(response) };
  },

  // Get user by ID
  async getById(id: string): Promise<{ data: UserDetailResponse }> {
    const response = await axiosClient.get(`/users/${id}`);
    return { data: response.data.content };
  },

  // Create new user
  async create(payload: {
    data: CreateUserDto;
    file?: File;
  }): Promise<{ data: UserResponse }> {
    const formData = createFormDataWithJson(payload.data, payload.file);

    const response = await axiosClient.post("/users", formData);

    return { data: response.data.content };
  },

  // Update user
  async update(
    id: string,
    payload: { data: UpdateUserDto; file?: File }
  ): Promise<{ data: UserResponse }> {
    const formData = createFormDataWithJson(payload.data, payload.file);

    const response = await axiosClient.put(`/users/${id}`, formData);

    return { data: response.data.content };
  },

  // Delete user
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/users/${id}`);
  },
};

export default UserService;
