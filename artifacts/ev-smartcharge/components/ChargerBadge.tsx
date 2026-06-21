import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Charger } from "@/lib/types";
import { getStatusColor } from "@/lib/mockData";

interface ChargerBadgeProps {
  charger: Charger;
}

const TYPE_LABELS: Record<string, string> = {
  Level1: "L1",
  Level2: "L2",
  DC_Fast: "DC",
  CCS: "CCS",
  CHAdeMO: "CHd",
  Tesla: "SC",
};

export function ChargerBadge({ charger }: ChargerBadgeProps) {
  const colors = useColors();
  const statusColor = getStatusColor(charger.status);

  return (
    <View style={[styles.badge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.type, { color: colors.primary }]}>
          {TYPE_LABELS[charger.charger_type] ?? charger.charger_type}
        </Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor, shadowColor: statusColor }]} />
      </View>
      <Text style={[styles.power, { color: colors.foreground }]}>
        {charger.power_kw} kW
      </Text>
      <Text style={[styles.status, { color: statusColor }]}>
        {charger.status.charAt(0).toUpperCase() + charger.status.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    minWidth: 72,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  power: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  status: {
    fontSize: 10,
    fontWeight: "500",
  },
});
