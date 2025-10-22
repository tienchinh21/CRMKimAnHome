export interface Bonus {
  id: string;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  userId: string;
  userFullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBonusRequest {
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  userId: string;
}

export interface UpdateBonusRequest {
  id: string;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  userId: string;
}

export interface BonusListResponse {
  error: null;
  content: {
    info: {
      page: number;
      size: number;
      pages: number;
      total: number;
    };
  };
  response: Bonus[];
}

export interface BonusResponse {
  error: null;
  content: Bonus;
}
