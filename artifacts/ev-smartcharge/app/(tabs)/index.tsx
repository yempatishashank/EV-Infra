import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { StationMarker } from "@/components/StationMarker";
import { StationCard } from "@/components/StationCard";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { MOCK_STATIONS, getStationStatus } from "@/lib/mockData";
import { useStationStore } from "@/store/stationStore";
import { Station, MapFilter } from "@/lib/types";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_SHEET_MIN = 140;
const BOTTOM_SHEET_MAX = SCREEN_HEIGHT * 0.55;

const FILTER_OPTIONS = [
  { key: "availableOnly", label: "Available", icon: "flash" },
  { key: "fastCharging", label: "Fast", icon: "speedometer" },
  { key: "slowCharging", label: "Level 2", icon: "battery-half" },
] as const;

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stations, setStations, selectedStation, setSelectedStation, filters, setFilters, searchQuery, setSearchQuery } = useStationStore();
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const sheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN)).current;
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        setRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
      setStations(MOCK_STATIONS);
      setLoading(false);
    })();
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

  const toggleSheet = () => {
    const toValue = sheetExpanded ? BOTTOM_SHEET_MIN : BOTTOM_SHEET_MAX;
    setSheetExpanded(!sheetExpanded);
    Animated.spring(sheetHeight, { toValue, useNativeDriver: false, tension: 50 }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStationPress = (station: Station) => {
    setSelectedStation(station);
    mapRef.current?.animateToRegion(
      { latitude: station.latitude - 0.01, longitude: station.longitude, latitudeDelta: 0.03, longitudeDelta: 0.03 },
      400
    );
    if (!sheetExpanded) {
      setSheetExpanded(true);
      Animated.spring(sheetHeight, { toValue: BOTTOM_SHEET_MAX, useNativeDriver: false, tension: 50 }).start();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStationCardPress = (station: Station) => {
    router.push(`/station/${station.id}`);
  };

  const handleLocateMe = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 400);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        region={region}
        onRegionChangeComplete={setRegion}
        userInterfaceStyle="dark"
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={mapStyle}
      >
        {filteredStations.map((station) => (
          <StationMarker
            key={station.id}
            station={station}
            onPress={handleStationPress}
            selected={selectedStation?.id === station.id}
          />
        ))}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
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
      </View>

      {/* Filters */}
      <View style={[styles.filtersRow, { top: topPadding + 72 }]}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => {
              setFilters({ [opt.key]: !filters[opt.key as keyof MapFilter] });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
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
      </View>

      {/* Locate Me Button */}
      <TouchableOpacity
        style={[styles.locateBtn, { bottom: BOTTOM_SHEET_MIN + 20 }]}
        onPress={handleLocateMe}
        activeOpacity={0.8}
      >
        <GlassCard style={styles.locateBtnInner}>
          <Ionicons name="locate" size={22} color={colors.primary} />
        </GlassCard>
      </TouchableOpacity>

      {/* Legend */}
      <View style={[styles.legend, { bottom: BOTTOM_SHEET_MIN + 24 }]}>
        <GlassCard style={styles.legendInner}>
          {[
            { color: colors.available, label: "Available" },
            { color: colors.limited, label: "Limited" },
            { color: colors.occupied, label: "Full" },
            { color: colors.offline, label: "Offline" },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color, shadowColor: item.color }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{item.label}</Text>
            </View>
          ))}
        </GlassCard>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
        <GlassCard style={styles.bottomSheetInner} noBorder>
          <TouchableOpacity onPress={toggleSheet} style={styles.handle}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            <View style={styles.handleRow}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                {filteredStations.length} Stations
              </Text>
              <Ionicons
                name={sheetExpanded ? "chevron-down" : "chevron-up"}
                size={20}
                color={colors.mutedForeground}
              />
            </View>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.stationList}>
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </View>
          ) : (
            <FlatList
              data={filteredStations}
              keyExtractor={(item) => item.id}
              style={styles.stationList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
              renderItem={({ item }) => (
                <StationCard
                  station={item}
                  onPress={() => handleStationCardPress(item)}
                  userLat={userLocation?.latitude}
                  userLon={userLocation?.longitude}
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
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filtersRow: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
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
  locateBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  locateBtnInner: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
  },
  legend: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  legendInner: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  legendText: { fontSize: 10 },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  bottomSheetInner: {
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
  handleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  stationList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#A0AEC0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#050816" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2332" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#050816" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1628" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1e2d40" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0d1117" }] },
];
