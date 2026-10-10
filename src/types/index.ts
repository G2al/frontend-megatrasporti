export type Role = "worker" | "admin";

export interface User {
  id: number;
  name: string;
  surname: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: Role;
  must_change_password: boolean;
}

export interface Vehicle {
  id: number;
  name: string;
  plate: string;
  color: string | null;
  current_km: number | null;
  maintenance_km: number | null;
  refuel_km_per_liter_avg: number | null;
}

export interface StationCard {
  id: number;
  number: string;
  label: string | null;
}

export interface Station {
  id: number;
  name: string;
  address: string | null;
  credit_balance: number | string | null;
  uses_vouchers: boolean;
  uses_credit_cards: boolean;
  cards: StationCard[];
}

export interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface Platform {
  id: number;
  name: string;
}

export interface Author {
  id: number;
  full_name: string;
  role?: Role;
}

export interface Movement {
  id: number;
  date: string;
  km_start: number;
  km_end: number;
  liters: number | string;
  price: number | string;
  adblue: number | string | null;
  notes: string | null;
  is_voucher: boolean;
  station_card_id: number | null;
  km_per_liter: number | string | null;
  photo_url: string | null;
  station: Station | null;
  platform: Platform | null;
  vehicle: Vehicle | null;
  user: Author | null;
}

export interface Maintenance {
  id: number;
  date: string;
  km_current: number | null;
  km_after: number | null;
  next_maintenance_date: string | null;
  price: number | string;
  invoice_number: string | null;
  notes: string | null;
  attachment_url: string | null;
  supplier: Supplier | null;
  vehicle: Vehicle | null;
  user: Author | null;
}

export type GoodsType = "secco" | "freschi";

export interface TripAttachment {
  id: number;
  path?: string;
  url: string;
}

export type DistanceStatus = "calculated" | "estimated" | "unavailable";

export interface Trip {
  id: number;
  date: string;
  destinations: string[];
  goods_type: GoodsType;
  delivery_note_number: string;
  attachments: TripAttachment[];
  is_certified: boolean;
  distance_km: number | string | null;
  distance_status: DistanceStatus | null;
  distance_note: string | null;
  distance_calculated_at: string | null;
  platform: Platform | null;
  vehicle: Vehicle | null;
  user: Author | null;
}

export interface DocumentFile {
  id: number;
  title: string;
  mime_type: string | null;
  file_size: number | null;
  opened_at: string | null;
  created_at: string;
}

export interface DocumentFolder {
  id: number;
  title: string;
  created_at: string;
  files: DocumentFile[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface KmStartResponse {
  km_start: number | null;
  source: string | null;
}
