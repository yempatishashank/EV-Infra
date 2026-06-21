import React from "react";
import { View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Station } from "@/lib/types";
import { getStationStatus, getStatusColor } from "@/lib/mockData";

interface StationMarkerProps {
  station: Station;
  onPress: (station: Station) => void;
  selected?: boolean;
}

export function StationMarker({ station, onPress, selected }: StationMarkerProps) {
  const status = getStationStatus(station);
  const color = getStatusColor(status);

  return (
    <Marker
      coordinate={{ latitude: station.latitude, longitude: station.longitude }}
      onPress={() => onPress(station)}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={[styles.container, selected && styles.selected]}>
        <View style={[styles.bubble, { backgroundColor: color, shadowColor: color }]}>
          <Ionicons name="flash" size={selected ? 16 : 12} color="#050816" />
        </View>
        <View style={[styles.pin, { backgroundColor: color }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  selected: {
    transform: [{ scale: 1.3 }],
  },
  bubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  pin: {
    width: 4,
    height: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
