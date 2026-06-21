import { create } from "zustand";
import { Station, MapFilter } from "@/lib/types";

interface StationState {
  stations: Station[];
  selectedStation: Station | null;
  filters: MapFilter;
  searchQuery: string;
  setStations: (stations: Station[]) => void;
  setSelectedStation: (station: Station | null) => void;
  setFilters: (filters: Partial<MapFilter>) => void;
  setSearchQuery: (query: string) => void;
}

export const useStationStore = create<StationState>((set) => ({
  stations: [],
  selectedStation: null,
  filters: {
    fastCharging: false,
    slowCharging: false,
    availableOnly: false,
    maxDistance: 50,
    chargerTypes: [],
  },
  searchQuery: "",
  setStations: (stations) => set({ stations }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
