import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import { Station } from "@/lib/types";
import { getStationStatus, getStatusColor, getDistanceKm } from "@/lib/mockData";

interface StationCardProps {
  station: Station;
  onPress: () => void;
  userLat?: number;
  userLon?: number;
}

export function StationCard({ station, onPress, userLat, userLon }: StationCardProps) {
  const colors = useColors();
  const status = getStationStatus(station);
  const statusColor = getStatusColor(status);
  const available = station.chargers?.filter((c) => c.status === "available").length ?? 0;
  const total = station.chargers?.length ?? 0;
  const maxPower = station.chargers?.reduce((max, c) => Math.max(max, c.power_kw), 0) ?? 0;
  const distance =
    userLat && userLon
      ? getDistanceKm(userLat, userLon, station.latitude, station.longitude).toFixed(1)
      : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor, shadowColor: statusColor }]} />
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {station.name}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text style={[styles.rating, { color: colors.mutedForeground }]}>
              {station.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
          {station.address}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="flash-outline" size={14} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.foreground }]}>
              {available}/{total}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="speedometer-outline" size={14} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.foreground }]}>
              {maxPower} kW
            </Text>
          </View>
          {distance && (
            <View style={styles.stat}>
              <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.foreground }]}>
                {distance} km
              </Text>
            </View>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 12,
  },
  address: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 16,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
