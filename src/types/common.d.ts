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
