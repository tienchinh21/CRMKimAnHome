import axiosClient from "@/utils/axiosClient";
import axios from "axios";

// Helper function to extract data from API response
const extractData = (response: any) => {
  if (response.data.content === null || response.data.content === undefined) {
    return response.data;
  }
  return response.data.content || response.data;
};

export interface CreateBlogDto {
  isNews: boolean;
  isLegal: boolean;
  isActive: boolean;
  title: string;
  content: string;
  sortOrder: number;
  slug: string;
  mainImage: string;
  categories: string[];
}

export interface UpdateBlogDto {
  sortOrder?: number;
  isNews?: boolean;
  isLegal?: boolean;
  isActive?: boolean;
  title?: string;
  content?: string;
  slug?: string;
  mainImage?: string;
  categories?: string[];
}

export interface ReponseBlogDto {
  id: string;
  isNews: boolean;
  isLegal: boolean;
  isActive: boolean;
  title: string;
  content: string;
  mainImage: string;
  categories: CategoryBlogDto[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface BlogListParams {
  spec?: any;
  pageable?: {
    page?: number;
    size?: number;
    sort?: string[];
  };
}

// Blog Category DTOs
export interface CreateBlogCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateBlogCategoryDto {
  name: string;
  description?: string;
}

export interface CategoryBlogDto {
  id: string;
  name: string;
}

export interface ReponseBlogCategoryDto {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

const BlogService = {
  // Get all blogs with pagination and filtering
  async getAll(params?: BlogListParams) {
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

    const response = await axiosClient.get(`/blogs?${queryParams.toString()}`);
    return { ...response, data: extractData(response) };
  },

  // Get blog by ID
  async getById(id: string): Promise<{ data: ReponseBlogDto }> {
    const response = await axiosClient.get(`/blogs/${id}`);
    return { data: extractData(response) };
  },

  // Create new blog
  async create(payload: CreateBlogDto): Promise<{ data: ReponseBlogDto }> {
    const response = await axiosClient.post("/blogs", payload);
    return { data: extractData(response) };
  },

  // Update blog
  async update(id: string, payload: UpdateBlogDto): Promise<{ data: void }> {
    const response = await axiosClient.put(`/blogs/${id}`, payload);
    return { data: extractData(response) };
  },

  // Delete blog
  async delete(id: string): Promise<{ data: void }> {
    const response = await axiosClient.delete(`/blogs/${id}`);
    return { data: extractData(response) };
  },

  // Helper methods for common operations

  // Get blogs with simple pagination (wrapper for easier use)
  async getWithPagination(page: number = 0, size: number = 10) {
    const params: BlogListParams = {
      pageable: { page, size },
    };

    return this.getAll(params);
  },

  // Search blogs by title or content
  async search(
    searchTerm: string,
    pageable?: { page?: number; size?: number }
  ) {
    const params: BlogListParams = {
      spec: { title: searchTerm }, // Assuming title field can be searched
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

  // Get blogs by type (news, legal, outstanding project)
  async getByType(
    type: "news" | "legal" | "outstanding",
    pageable?: { page?: number; size?: number }
  ) {
    const spec: any = {};
    switch (type) {
      case "news":
        spec.isNews = true;
        break;
      case "legal":
        spec.isLegal = true;
        break;
      case "outstanding":
        spec.isOutstandingProject = true;
        break;
    }

    const params: BlogListParams = {
      spec,
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

  // =================== Image Upload ===================
  // Upload image for blog content
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `https://kimanhome.duckdns.org/spring-api/storage/upload?subPath=blog`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // API returns the URL directly
  },

  // =================== Categories ===================
  // Get all blog categories
  async getCategories() {
    const response = await axiosClient.get("/category-blog");
    return { ...response, data: extractData(response) } as {
      data: ReponseBlogCategoryDto[];
    };
  },

  async createCategory(
    payload: CreateBlogCategoryDto
  ): Promise<{ data: ReponseBlogCategoryDto }> {
    const response = await axiosClient.post("/category-blog", payload);
    return { data: extractData(response) } as {
      data: ReponseBlogCategoryDto;
    };
  },

  async updateCategory(
    id: string,
    payload: UpdateBlogCategoryDto
  ): Promise<{ data: ReponseBlogCategoryDto }> {
    const response = await axiosClient.put(`/category-blog/${id}`, payload);
    return { data: extractData(response) } as {
      data: ReponseBlogCategoryDto;
    };
  },

  async deleteCategory(id: string): Promise<{ data: void }> {
    const response = await axiosClient.delete(`/category-blog/${id}`);
    return { data: extractData(response) };
  },
};

export default BlogService;
