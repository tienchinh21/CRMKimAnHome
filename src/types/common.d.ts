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

export interface Pageable {
  page?: number;
  size?: number;
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
