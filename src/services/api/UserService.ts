import axios from "axios";
import type {
  UserResponse,
  UserDetailResponse,
  UpdateUserDto,
  Pageable,
} from "@/types";
import type { CreateUserDto } from "@/types/team";

// Helper function to extract data from API response
const extractData = (response: any) => {
  if (response.data.content === null || response.data.content === undefined) {
    return response.data;
  }
  return response.data.content || response.data;
};

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

    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/users?${queryParams.toString()}`
    );
    return { ...response, data: extractData(response) };
  },

  // Get user by ID
  async getById(id: string): Promise<{ data: UserDetailResponse }> {
    const response = await axios.get(
      `https://kimanhome.duckdns.org/spring-api/users/${id}`
    );
    return { data: response.data.content };
  },

  // Create new user
  async create(payload: {
    data: CreateUserDto;
    file?: File;
  }): Promise<{ data: UserResponse }> {
    const formData = new FormData();

    // Add user data as Blob with application/json type
    const dataBlob = new Blob([JSON.stringify(payload.data)], {
      type: "application/json",
    });
    formData.append("data", dataBlob);

    // Add file if provided
    if (payload.file) {
      formData.append("file", payload.file);
    }

    const response = await axios.post(
      "https://kimanhome.duckdns.org/spring-api/users",
      formData
    );

    return { data: response.data.content };
  },

  // Update user
  async update(
    id: string,
    payload: { data: UpdateUserDto; file?: File }
  ): Promise<{ data: UserResponse }> {
    const formData = new FormData();

    // Add user data as Blob with application/json type
    const dataBlob = new Blob([JSON.stringify(payload.data)], {
      type: "application/json",
    });
    formData.append("data", dataBlob);

    // Add file if provided
    if (payload.file) {
      formData.append("file", payload.file);
    }

    const response = await axios.put(
      `https://kimanhome.duckdns.org/spring-api/users/${id}`,
      formData
    );

    return { data: response.data.content };
  },

  // Delete user
  async delete(id: string): Promise<void> {
    await axios.delete(`https://kimanhome.duckdns.org/spring-api/users/${id}`);
  },
};

export default UserService;
