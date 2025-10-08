import type { Project } from "./project";

// Apartment Management Types - Updated to match API spec
export interface CreateApartmentPayload {
  data: {
    name: string;
    publicPrice: string;
    privatePrice: string;
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
    publicPrice?: string;
    privatePrice?: string;
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
  publicPrice: string;
  privatePrice: string;
  area: string;
  numberBedroom: string; // byte format
  numberBathroom: string; // byte format
  mainImage: string;
  projectId: string;
  slug: string;
  isSell: boolean;
  status: string; // byte format
  alias: string;
  isPublic: boolean;
  ownerName: string;
  ownerPhone: string;
}

export interface ReponseDetailApartmentDto {
  id: string;
  name: string;
  publicPrice: string;
  privatePrice: string;
  detailedDescription: string;
  //   highlights: string;
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
  ownerName: string;
  ownerPhone: string;
  project: {
    id: string;
    name: string;
  };
  isPublic: boolean;
}

export interface CreateApartmentDto {
  name: string;
  publicPrice: string;
  privatePrice: string;
  detailedDescription: string;
  //   highlights: string;
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
  ownerName: string;
  ownerPhone: string;
}

export interface UpdateApartmentDto {
  name?: string;
  publicPrice?: string;
  privatePrice?: string;
  detailedDescription?: string;
  //   highlights?: string;
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
  ownerName?: string;
  ownerPhone?: string;
  isPublic?: boolean;
}

// Legacy interface for backward compatibility
export interface Apartment {
  id: string;
  name: string;
  publicPrice: string;
  privatePrice: string;
  detailedDescription: string;
  //   highlights: string[];
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
  ownerName?: string;
  ownerPhone?: string;
  project?: Project;
}

// Apartment Specification types for filtering
export interface SpecificationApartment {
  // Add filter properties as needed
  [key: string]: any;
}
