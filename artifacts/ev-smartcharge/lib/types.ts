export type UserRole = "ev_user" | "station_owner" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  vehicle_model?: string;
  created_at: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  images: string[];
  rating: number;
  review_count: number;
  owner_id: string;
  status: "active" | "inactive" | "pending";
  created_at: string;
  chargers?: Charger[];
}

export interface Charger {
  id: string;
  station_id: string;
  charger_type: "Level1" | "Level2" | "DC_Fast" | "CCS" | "CHAdeMO" | "Tesla";
  power_kw: number;
  status: "available" | "occupied" | "offline" | "maintenance";
  connector_count: number;
  last_updated: string;
}

export interface Review {
  id: string;
  station_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: { full_name: string; avatar_url?: string };
}

export interface Favorite {
  id: string;
  user_id: string;
  station_id: string;
  station?: Station;
  created_at: string;
}

export interface ChargingSession {
  id: string;
  user_id: string;
  charger_id: string;
  station_id: string;
  start_time: string;
  end_time?: string;
  energy_kwh?: number;
  cost?: number;
  status: "active" | "completed" | "cancelled";
  station?: Station;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export type MapFilter = {
  fastCharging: boolean;
  slowCharging: boolean;
  availableOnly: boolean;
  maxDistance: number;
  chargerTypes: string[];
};

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIRecommendation {
  station: Station;
  estimatedDuration: string;
  reasoning: string;
  distance: string;
  suggestedRoute: string;
}
