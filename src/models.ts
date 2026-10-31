export interface ItemDate {
  start: string;
  end: string;
}

export interface Item {
  id?: number;
  name: string;
  plu: string;
  articul: string;
  quantity: number; // вес в кг
  date: ItemDate;
  description?: string;
  category?: string;
  weight?: number;
  shelf_life?: number;
}

export interface CatalogItem {
  plu?: string | null;
  articul?: string | null;
  name: string;
  weight?: number;
  shelf_life?: number;
  description?: string;
  category?: string;
}

export interface ScanResult {
  found: boolean;
  name?: string;
  weight?: number;
  shelf_life?: number;
  description?: string;
  category?: string;
  articul?: string;
}

export interface AuthRequest {
  password?: string;
}

export interface AuthResponse {
  token: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface ApiMessage {
  message: string;
}

export interface ApiError {
  error: string;
}
