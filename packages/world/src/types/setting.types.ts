// Setting domain types and interfaces

export interface Setting {
  id?: string;
  name: string;
  description: string;
  genre?: string;
  elements?: string[];
  political?: string[];
  cultural?: string[];
  economic?: string[];
  history?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CreateSettingRequest {
  name: string;
  description: string;
  genre?: string;
  elements?: string[];
  political?: string[];
  cultural?: string[];
  economic?: string[];
  history?: string[];
}

export interface UpdateSettingRequest {
  name?: string;
  description?: string;
  genre?: string;
  elements?: string[];
  political?: string[];
  cultural?: string[];
  economic?: string[];
  history?: string[];
}

export interface SettingFilter {
  name?: string;
  genre?: string;
  elements?: string[];
  createdBy?: string;
}

export interface SettingListResponse {
  settings: Setting[];
  total: number;
  page: number;
  limit: number;
}
