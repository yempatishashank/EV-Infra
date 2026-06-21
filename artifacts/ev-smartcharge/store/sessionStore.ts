import { create } from "zustand";

export interface ActiveSession {
  sessionId: string;
  stationId: string;
  stationName: string;
  chargerId: string;
  chargerType: string;
  powerKw: number;
  startTime: number; // Date.now()
  initialBattery: number; // 0-100
  targetBattery: number; // 0-100
  vehicleCapacityKwh: number;
  ratePerKwh: number;
}

interface SessionState {
  activeSession: ActiveSession | null;
  startSession: (session: ActiveSession) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  startSession: (session) => set({ activeSession: session }),
  endSession: () => set({ activeSession: null }),
}));
