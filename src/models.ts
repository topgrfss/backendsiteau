export interface ItemDate {
  start: string;
  end: string;
}

export interface Item {
  id?: number;
  name: string;
  plu: string;
  articul: string;
  quantity: number;
  date: ItemDate;
}

export interface CatalogItem {
  plu?: string | null;
  articul?: string | null;
  name: string;
  weight?: number;
  shelf_life?: number;
}

export interface ScanResult {
  found: boolean;
  name?: string;
  weight?: number;
  shelf_life?: number;
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
