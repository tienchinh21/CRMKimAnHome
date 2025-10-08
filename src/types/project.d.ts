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
