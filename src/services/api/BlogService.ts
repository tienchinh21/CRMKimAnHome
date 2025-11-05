import axiosClient from "@/utils/axiosClient";
import axios from "axios";

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
  filter?: string; 
  pageable?: {
    page?: number;
    size?: number;
    sort?: string[];
  };
}

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
  async getAll(params?: BlogListParams) {
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

    const response = await axiosClient.get(`/blogs?${queryParams.toString()}`);
    return { ...response, data: extractData(response) };
  },

  async getById(id: string): Promise<{ data: ReponseBlogDto }> {
    const response = await axiosClient.get(`/blogs/${id}`);
    return { data: extractData(response) };
  },

  async create(payload: CreateBlogDto): Promise<{ data: ReponseBlogDto }> {
    const response = await axiosClient.post("/blogs", payload);
    return { data: extractData(response) };
  },

  async update(id: string, payload: UpdateBlogDto): Promise<{ data: void }> {
    const response = await axiosClient.put(`/blogs/${id}`, payload);
    return { data: extractData(response) };
  },

  async delete(id: string): Promise<{ data: void }> {
    const response = await axiosClient.delete(`/blogs/${id}`);
    return { data: extractData(response) };
  },


  async getWithPagination(page: number = 0, size: number = 10) {
    const params: BlogListParams = {
      pageable: { page, size },
    };

    return this.getAll(params);
  },

  async search(
    searchTerm: string,
    pageable?: { page?: number; size?: number }
  ) {
    const params: BlogListParams = {
      filter: `title ~~ '${searchTerm}'`,
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

    async getByType(
    type: "news" | "legal" | "outstanding",
    pageable?: { page?: number; size?: number }
  ) {
    let filter = "";
    switch (type) {
      case "news":
        filter = "isNews = true";
        break;
      case "legal":
        filter = "isLegal = true";
        break;
      case "outstanding":
        filter = "isOutstandingProject = true";
        break;
    }

    const params: BlogListParams = {
      filter,
      pageable: pageable || { page: 0, size: 10 },
    };

    return this.getAll(params);
  },

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
