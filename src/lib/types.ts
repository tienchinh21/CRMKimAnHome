// Project Management Types
export interface CreateProjectPayload {
  name: string;
  longitude: string;
  latitude: string;
  fullAddress: string;
}

export interface Project {
  id: string;
  name: string;
  location?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  fullAddress?: string | null;
  image?: string; // URL hình ảnh chính
  images?: string[] | ProjectImage[]; // Danh sách URLs hoặc objects với metadata
  projectInformations?: ProjectInformation[]; // Chi tiết dự án
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

// Project Image interface
export interface ProjectImage {
  id: number;
  url: string;
  imageIndex: number;
}

// Project Information interface
export interface ProjectInformation {
  id: string;
  name: string;
  data: string;
  sortOrder: number;
  projectId: string;
}

// Project Details Types
export interface ProjectDetail {
  id: string;
  name: string;
  data: string;
  sortOrder: number;
  projectId: string;
}

// Amenities Types
export interface Amenity {
  id: string;
  name: string;
  projectId: string;
  parentId: string | null; // null cho tiện ích cha
  sortOrder?: number; // Thứ tự sắp xếp
  children?: Amenity[]; // For tree structure display
}

// Apartment Management Types - Updated to match API spec
export interface CreateApartmentPayload {
  data: {
    name: string;
    price: string;
    detailedDescription: string;
    highlights: string; // Ngăn cách bởi \n
    area: string;
    numberBedroom: string; // format: byte
    numberBathroom: string; // format: byte
    floor: string; // format: byte
    direction: string;
    interior: string;
    status: string; // format: byte
    projectId: string;
    isSell: boolean; // true: bán, false: cho thuê
    alias: string;
  };
  file: string[]; // File upload paths (binary format)
}

export interface UpdateApartmentPayload {
  data: {
    name?: string;
    price?: string;
    detailedDescription?: string;
    highlights?: string;
    area?: string;
    numberBedroom?: string;
    numberBathroom?: string;
    floor?: string;
    direction?: string;
    interior?: string;
    status?: string;
    projectId?: string;
    isSell?: boolean;
    alias?: string;
  };
  files?: string[]; // File upload paths
}

// API Response DTOs matching Swagger spec
export interface ReponseApartmentDto {
  id: string;
  name: string;
  price: string;
  area: string;
  numberBedroom: string; // byte format
  numberBathroom: string; // byte format
  mainImage: string;
  projectId: string;
  slug: string;
  isSell: boolean;
  status: string; // byte format
  alias: string;
}

export interface ReponseDetailApartmentDto {
  id: string;
  name: string;
  price: string;
  detailedDescription: string;
  highlights: string;
  area: string;
  numberBedroom: string; // byte format
  numberBathroom: string; // byte format
  floor: string; // byte format
  direction: string;
  interior: string;
  status: string; // byte format
  isSell: boolean;
  projectId: string;
  mainImage: string;
  images: string[];
  slug: string;
  alias: string;
}

export interface CreateApartmentDto {
  name: string;
  price: string;
  detailedDescription: string;
  highlights: string;
  area: string;
  numberBedroom: string; // byte format
  numberBathroom: string; // byte format
  floor: string; // byte format
  direction: string;
  interior: string;
  status: string; // byte format
  projectId: string;
  isSell: boolean;
  alias: string;
}

export interface UpdateApartmentDto {
  name?: string;
  price?: string;
  detailedDescription?: string;
  highlights?: string;
  area?: string;
  numberBedroom?: string;
  numberBathroom?: string;
  floor?: string;
  direction?: string;
  interior?: string;
  status?: string;
  projectId?: string;
  isSell?: boolean;
  alias?: string;
}

// Legacy interface for backward compatibility
export interface Apartment {
  id: string;
  name: string;
  price: string;
  detailedDescription: string;
  highlights: string[];
  area: string;
  numberBedroom: string;
  numberBathroom: string;
  floor: string;
  direction: string;
  interior: string;
  status: string;
  projectId: string;
  isSell: boolean;
  alias: string;
  files: string[];
  createdAt: string;
  updatedAt: string;
  // Additional fields from API
  mainImage?: string;
  images?: string[];
  slug?: string;
}

// Common Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// API Response Types matching Swagger spec
export interface Error {
  message?: string;
  exception?: string;
}

export interface RestResponse<T> {
  error?: Error;
  content?: T;
}

export interface RestResponseList<T> {
  error?: Error;
  content?: T[];
}

// Pagination types from Swagger
export interface Pageable {
  page?: number; // minimum: 0
  size?: number; // minimum: 1
  sort?: string[];
}

export interface PaginationInfo {
  page: number;
  size: number;
  pages: number;
  total: number;
}

export interface PaginationResponse {
  info: PaginationInfo;
  response: any;
}

// Specification types for filtering
export interface SpecificationApartment {
  // Add filter properties as needed
  [key: string]: any;
}

export interface SpecificationBlog {
  // Add filter properties as needed
  [key: string]: any;
}

// Blog Management Types
export interface CreateBlogDto {
  title: string;
  content: string;
  mainImage: string;
  isNews: boolean;
  isLegal: boolean;
  isOutstandingProject: boolean;
  isHide: boolean;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  mainImage?: string;
  isNews?: boolean;
  isLegal?: boolean;
  isOutstandingProject?: boolean;
  isHide?: boolean;
}

export interface ReponseBlogDto {
  id: string;
  title: string;
  content: string;
  mainImage: string;
  isNews: boolean;
  isLegal: boolean;
  isOutstandingProject: boolean;
  isHide: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Blog Category Types (if needed in the future)
export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
