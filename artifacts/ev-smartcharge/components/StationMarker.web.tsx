import React from "react";
import { Station } from "@/lib/types";

interface StationMarkerProps {
  station: Station;
  onPress: (station: Station) => void;
  selected?: boolean;
}

export function StationMarker(_props: StationMarkerProps) {
  return null;
}
