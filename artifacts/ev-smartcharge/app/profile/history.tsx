import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import { LinearGradient } from "expo-linear-gradient";

const SESSIONS = [
  { id: "1", station: "Tesla Supercharger – Union Square", date: "Today, 2:14 PM", duration: "38 min", kWh: 28.4, cost: 11.36, type: "DC Fast", status: "completed" },
  { id: "2", station: "ChargePoint – Embarcadero", date: "Yesterday, 10:05 AM", duration: "1h 12min", kWh: 42.1, cost: 16.84, type: "Level 2", status: "completed" },
  { id: "3", station: "EVgo – SoMa", date: "Jun 18, 4:30 PM", duration: "22 min", kWh: 18.9, cost: 7.56, type: "DC Fast", status: "completed" },
  { id: "4", station: "Blink – Mission District", date: "Jun 16, 9:00 AM", duration: "2h 05min", kWh: 54.0, cost: 21.60, type: "Level 2", status: "completed" },
  { id: "5", station: "Tesla Supercharger – SOMA", date: "Jun 14, 7:22 PM", duration: "45 min", kWh: 34.2, cost: 13.68, type: "DC Fast", status: "completed" },
  { id: "6", station: "ChargePoint – Fisherman's Wharf", date: "Jun 10, 11:00 AM", duration: "1h 30min", kWh: 46.8, cost: 18.72, type: "Level 2", status: "completed" },
];

const SUMMARY = [
  { label: "Total Sessions", value: "12", icon: "flash-outline" },
  { label: "Total kWh", value: "284", icon: "battery-charging-outline" },
  { label: "Total Cost", value: "$113", icon: "card-outline" },
  { label: "Avg Duration", value: "53m", icon: "time-outline" },
];

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "dc" | "l2">("all");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const filtered = SESSIONS.filter((s) => {
    if (filter === "dc") return s.type === "DC Fast";
    if (filter === "l2") return s.type === "Level 2";
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <GlassCard style={styles.backCircle}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </GlassCard>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Charging History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        {SUMMARY.map((s) => (
          <GlassCard key={s.label} style={styles.summaryCard}>
            <Ionicons name={s.icon as any} size={16} color={colors.primary} />
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </GlassCard>
        ))}
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {(["all", "dc", "l2"] as const).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.8}>
            <GlassCard
              style={[
                styles.chip,
                filter === f && { backgroundColor: colors.primary + "22", borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.chipText, { color: filter === f ? colors.primary : colors.mutedForeground }]}>
                {f === "all" ? "All" : f === "dc" ? "DC Fast" : "Level 2"}
              </Text>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard style={styles.sessionCard}>
            <View style={styles.sessionTop}>
              <View style={[styles.typeIcon, { backgroundColor: item.type === "DC Fast" ? colors.accent + "22" : colors.primary + "22" }]}>
                <Ionicons
                  name={item.type === "DC Fast" ? "flash" : "battery-half-outline"}
                  size={18}
                  color={item.type === "DC Fast" ? colors.accent : colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionStation, { color: colors.foreground }]} numberOfLines={1}>{item.station}</Text>
                <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <Text style={[styles.sessionCost, { color: colors.foreground }]}>${item.cost.toFixed(2)}</Text>
            </View>
            <View style={[styles.sessionStats, { borderTopColor: colors.border }]}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
                <Text style={[styles.statText, { color: colors.mutedForeground }]}>{item.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="battery-charging-outline" size={13} color={colors.mutedForeground} />
                <Text style={[styles.statText, { color: colors.mutedForeground }]}>{item.kWh} kWh</Text>
              </View>
              <View style={[styles.typePill, { backgroundColor: item.type === "DC Fast" ? colors.accent + "22" : colors.primary + "22" }]}>
                <Text style={[styles.typePillText, { color: item.type === "DC Fast" ? colors.accent : colors.primary }]}>{item.type}</Text>
              </View>
            </View>
          </GlassCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: {},
  backCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summaryRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, alignItems: "center", padding: 10, gap: 4 },
  summaryValue: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 16, gap: 10 },
  sessionCard: { padding: 14, gap: 0 },
  sessionTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sessionStation: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  sessionDate: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  sessionCost: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sessionStats: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderTopWidth: 1, paddingTop: 12,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  typePill: { marginLeft: "auto", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  typePillText: { fontSize: 11, fontWeight: "600" },
});
