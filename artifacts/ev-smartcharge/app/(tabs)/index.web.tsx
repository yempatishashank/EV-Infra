import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { StationCard } from "@/components/StationCard";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { MOCK_STATIONS, getStationStatus } from "@/lib/mockData";
import { useStationStore } from "@/store/stationStore";
import { Station, MapFilter } from "@/lib/types";
import * as Haptics from "expo-haptics";

const FILTER_OPTIONS = [
  { key: "availableOnly", label: "Available", icon: "flash" },
  { key: "fastCharging", label: "Fast", icon: "speedometer" },
  { key: "slowCharging", label: "Level 2", icon: "battery-half" },
] as const;

const STATUS_LEGEND = [
  { color: "#39FF14", label: "Available" },
  { color: "#FFA500", label: "Limited" },
  { color: "#FF4444", label: "Full" },
  { color: "#4A5568", label: "Offline" },
];

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stations, setStations, filters, setFilters, searchQuery, setSearchQuery } = useStationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStations(MOCK_STATIONS);
    setTimeout(() => setLoading(false), 800);
  }, []);

  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStationStatus(s);
    const matchesAvailable = !filters.availableOnly || status === "available" || status === "limited";
    const hasFast = s.chargers?.some((c) => c.power_kw >= 50);
    const hasSlow = s.chargers?.some((c) => c.power_kw < 50);
    const matchesFast = !filters.fastCharging || hasFast;
    const matchesSlow = !filters.slowCharging || hasSlow;
    return matchesSearch && matchesAvailable && matchesFast && matchesSlow;
  });

  const topPadding = 67;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <View style={styles.titleRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="flash" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.appTitle, { color: colors.foreground }]}>EV SmartCharge</Text>
        </View>
        <GlassCard style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search stations..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* Filters */}
        <View style={styles.filtersRow}>
          {FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setFilters({ [opt.key]: !filters[opt.key as keyof MapFilter] })}
              activeOpacity={0.8}
            >
              <GlassCard
                style={[
                  styles.filterChip,
                  filters[opt.key as keyof MapFilter] && { backgroundColor: colors.primary + "33", borderColor: colors.primary },
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={14}
                  color={filters[opt.key as keyof MapFilter] ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.filterLabel,
                    { color: filters[opt.key as keyof MapFilter] ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {opt.label}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          ))}

          <View style={styles.legendRow}>
            {STATUS_LEGEND.map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Station List */}
      <View style={styles.stationsHeader}>
        <Text style={[styles.stationsCount, { color: colors.foreground }]}>
          {filteredStations.length} Charging Stations
        </Text>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.list}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 34 + 84 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <StationCard
              station={item}
              onPress={() => router.push(`/station/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No stations found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: { fontSize: 10 },
  stationsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stationsCount: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
  },
});
