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
  is_approved: boolean;
  documents_verified: boolean;
}

export interface VerificationStatus {
  is_approved: boolean;
  must_change_password: boolean;
  documents_verified: boolean;
  address: string | null;
  identity_front_url: string | null;
  identity_back_url: string | null;
  identity_expiry_date: string | null;
  license_url: string | null;
  license_back_url: string | null;
  license_expiry_date: string | null;
  cqc_url: string | null;
  cqc_back_url: string | null;
  cqc_expiry_date: string | null;
  tachograph_front_url: string | null;
  tachograph_back_url: string | null;
  tachograph_expiry_date: string | null;
  completed_at: string | null;
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

export interface PlatformAddress {
  id: number;
  address: string;
}

export interface Platform {
  id: number;
  name: string;
  addresses: PlatformAddress[];
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

export type DistanceErrorCode =
  | "platform_missing_address"
  | "platform_geocoding_failed"
  | "platform_address_required"
  | "destination_not_found"
  | "service_unavailable"
  | "unknown";

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
  distance_error_code: DistanceErrorCode | null;
  distance_error_destination: string | null;
  distance_calculated_at: string | null;
  platform: Platform | null;
  platform_address: PlatformAddress | null;
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

export interface TripSchedulePlatformTotal {
  platform: string;
  total: number;
}

export interface TripScheduleDay {
  day: number;
  date: string;
  total: number | null;
  trips: Trip[];
}

export interface TripSchedule {
  month: string;
  total_trips: number;
  month_total: number | null;
  platform_totals: TripSchedulePlatformTotal[] | null;
  days: TripScheduleDay[];
}
