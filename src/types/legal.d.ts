export interface Legal {
  id: string;
  name: string;
  sortOrder: number;
  apartmentId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLegalDto {
  name: string;
  sortOrder?: number;
  apartmentId: string;
}

export interface UpdateLegalDto {
  name?: string;
  sortOrder?: number;
}

export interface LegalResponse {
  id: string;
  name: string;
  sortOrder: number;
  apartmentId: string;
}
