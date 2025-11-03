
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
  image?: string;
  images?: string[] | ProjectImage[];
  projectInformations?: ProjectInformation[];
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface ProjectImage {
  id: number;
  url: string;
  imageIndex: number;
}

export interface ProjectInformation {
  id: string;
  name: string;
  data: string;
  sortOrder: number;
  projectId: string;
}
export interface ProjectDetail {
  id: string;
  name: string;
  data: string;
  sortOrder: number;
  projectId: string;
}
export interface Amenity {
  id: string;
  name: string;
  projectId: string;
  parentId: string | null; 
  sortOrder?: number; 
  children?: Amenity[]; 
}
