import { Station, Charger, Review } from "@/lib/types";

export const MOCK_STATIONS: Station[] = [
  {
    id: "1",
    name: "Tesla Supercharger - Downtown",
    address: "123 Main St, San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    description: "High-speed Tesla Supercharger station in the heart of downtown.",
    images: [],
    rating: 4.8,
    review_count: 124,
    owner_id: "owner1",
    status: "active",
    created_at: new Date().toISOString(),
    chargers: [
      { id: "c1", station_id: "1", charger_type: "Tesla", power_kw: 250, status: "available", connector_count: 12, last_updated: new Date().toISOString() },
      { id: "c2", station_id: "1", charger_type: "CCS", power_kw: 150, status: "occupied", connector_count: 4, last_updated: new Date().toISOString() },
    ],
  },
  {
    id: "2",
    name: "ChargePoint Hub - Mission District",
    address: "456 Valencia St, San Francisco, CA",
    latitude: 37.7595,
    longitude: -122.4213,
    description: "Multi-brand charging hub with Level 2 and DC Fast options.",
    images: [],
    rating: 4.3,
    review_count: 87,
    owner_id: "owner2",
    status: "active",
    created_at: new Date().toISOString(),
    chargers: [
      { id: "c3", station_id: "2", charger_type: "Level2", power_kw: 22, status: "available", connector_count: 8, last_updated: new Date().toISOString() },
      { id: "c4", station_id: "2", charger_type: "DC_Fast", power_kw: 62, status: "available", connector_count: 2, last_updated: new Date().toISOString() },
    ],
  },
  {
    id: "3",
    name: "Electrify America - SoMa",
    address: "789 Howard St, San Francisco, CA",
    latitude: 37.7833,
    longitude: -122.4050,
    description: "Ultra-fast charging with multiple connector types.",
    images: [],
    rating: 4.5,
    review_count: 203,
    owner_id: "owner1",
    status: "active",
    created_at: new Date().toISOString(),
    chargers: [
      { id: "c5", station_id: "3", charger_type: "CCS", power_kw: 350, status: "available", connector_count: 6, last_updated: new Date().toISOString() },
      { id: "c6", station_id: "3", charger_type: "CHAdeMO", power_kw: 100, status: "offline", connector_count: 2, last_updated: new Date().toISOString() },
    ],
  },
  {
    id: "4",
    name: "Blink Charging - Civic Center",
    address: "100 Civic Center Plaza, San Francisco, CA",
    latitude: 37.7793,
    longitude: -122.4193,
    description: "Convenient charging near City Hall.",
    images: [],
    rating: 3.9,
    review_count: 45,
    owner_id: "owner3",
    status: "active",
    created_at: new Date().toISOString(),
    chargers: [
      { id: "c7", station_id: "4", charger_type: "Level2", power_kw: 7, status: "occupied", connector_count: 4, last_updated: new Date().toISOString() },
      { id: "c8", station_id: "4", charger_type: "Level2", power_kw: 11, status: "maintenance", connector_count: 2, last_updated: new Date().toISOString() },
    ],
  },
  {
    id: "5",
    name: "EVgo Fast Charge - North Beach",
    address: "505 Columbus Ave, San Francisco, CA",
    latitude: 37.8020,
    longitude: -122.4076,
    description: "Fast charging near the waterfront.",
    images: [],
    rating: 4.6,
    review_count: 156,
    owner_id: "owner2",
    status: "active",
    created_at: new Date().toISOString(),
    chargers: [
      { id: "c9", station_id: "5", charger_type: "DC_Fast", power_kw: 100, status: "available", connector_count: 4, last_updated: new Date().toISOString() },
      { id: "c10", station_id: "5", charger_type: "CCS", power_kw: 150, status: "available", connector_count: 2, last_updated: new Date().toISOString() },
    ],
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    station_id: "1",
    user_id: "user1",
    rating: 5,
    comment: "Super fast charging, was at 80% in 20 minutes. Great location!",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user: { full_name: "Alex Chen" },
  },
  {
    id: "r2",
    station_id: "1",
    user_id: "user2",
    rating: 4,
    comment: "Always available, very reliable. Highly recommended.",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user: { full_name: "Sarah Johnson" },
  },
  {
    id: "r3",
    station_id: "2",
    user_id: "user3",
    rating: 4,
    comment: "Good mix of charger types. Parking can be tricky but worth it.",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    user: { full_name: "Mike Wilson" },
  },
];

export function getStationStatus(station: Station): "available" | "limited" | "occupied" | "offline" {
  if (!station.chargers || station.chargers.length === 0) return "offline";
  const available = station.chargers.filter((c) => c.status === "available").length;
  const total = station.chargers.length;
  const offline = station.chargers.every((c) => c.status === "offline" || c.status === "maintenance");
  if (offline) return "offline";
  if (available === 0) return "occupied";
  if (available / total <= 0.3) return "limited";
  return "available";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "available": return "#39FF14";
    case "limited": return "#FFA500";
    case "occupied": return "#FF4444";
    case "offline": return "#4A5568";
    default: return "#4A5568";
  }
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
