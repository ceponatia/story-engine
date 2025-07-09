// Location domain types and interfaces

export interface Location {
  id?: string;
  name: string;
  description: string;
  features?: string[];
  atmosphere?: string;
  resources?: string[];
  structures?: string[];
  natural?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CreateLocationRequest {
  name: string;
  description: string;
  features?: string[];
  atmosphere?: string;
  resources?: string[];
  structures?: string[];
  natural?: string[];
}

export interface UpdateLocationRequest {
  name?: string;
  description?: string;
  features?: string[];
  atmosphere?: string;
  resources?: string[];
  structures?: string[];
  natural?: string[];
}

export interface LocationFilter {
  name?: string;
  features?: string[];
  atmosphere?: string;
  createdBy?: string;
}

export interface LocationListResponse {
  locations: Location[];
  total: number;
  page: number;
  limit: number;
}
