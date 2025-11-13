import type { Project } from "./project";

export interface CreateApartmentPayload {
  data: {
    name: string;
    publicPrice: string;
    privatePrice: string;
    detailedDescription: string;
    highlights: string; 
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
    isPublic: boolean; 
  };
  file: string[]; 
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
    isPublic?: boolean;
  };
  files?: string[]; 
}

export interface ReponseApartmentDto {
  id: string;
  name?: string;
  publicPrice?: string;
  privatePrice: string;
  detailedDescription?: string;
  area: string;
  numberBedroom: number;
  numberBathroom: number;
  floor: number;
  direction: string;
  interior: string;
  status: number;
  isSell: boolean;
  project: {
    id: string;
    name: string;
  };
  mainImage: string;
  images: string[];
  slug: string;
  alias: string;
  note?: string;
  isPublic?: boolean;
  ownerName?: string;
  ownerPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ReponseDetailApartmentDto {
  id: string;
  name?: string;
  publicPrice?: string;
  privatePrice: string;
  detailedDescription?: string;
  area: string;
  numberBedroom: string;
  numberBathroom: string;
  floor: string;
  direction: string;
  interior: string;
  status: number;
  isSell: boolean;
  project: {
    id: string;
    name: string;
  };
  mainImage: string;
  images: string[];
  slug: string;
  alias: string;
  note?: string;
  isPublic?: boolean;
  ownerName?: string;
  ownerPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateApartmentDto {
  name: string;
  publicPrice: string;
  privatePrice: string;
  detailedDescription: string;
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
  ownerName: string;
  ownerPhone: string;
}

export interface UpdateApartmentDto {
  name?: string;
  publicPrice?: string;
  privatePrice?: string;
  detailedDescription?: string;
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

export interface Apartment {
  id: string;
  name: string;
  publicPrice: string;
  privatePrice: string;
  detailedDescription: string;
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
  mainImage?: string;
  images?: string[];
  slug?: string;
  ownerName?: string;
  ownerPhone?: string;
  project?: Project;
}

export interface SpecificationApartment {
  [key: string]: any;
}
