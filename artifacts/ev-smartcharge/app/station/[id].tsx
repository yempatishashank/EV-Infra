import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import { ChargerBadge } from "@/components/ChargerBadge";
import { MOCK_STATIONS, MOCK_REVIEWS, getStationStatus, getStatusColor } from "@/lib/mockData";
import { Charger, Station } from "@/lib/types";
import { useSessionStore } from "@/store/sessionStore";
import * as Haptics from "expo-haptics";

const FAVORITES_KEY = "ev_favorites";
const RATE_PER_KWH = 0.40;
const VEHICLE_CAPACITY_KWH = 75;
const INITIAL_BATTERY = 22;
const TARGET_BATTERY = 80;

function chargerStatusColor(status: Charger["status"], colors: any): string {
  switch (status) {
    case "available": return "#39FF14";
    case "occupied": return "#FF4444";
    case "offline": return "#4A5568";
    case "maintenance": return "#FFA500";
    default: return "#4A5568";
  }
}

function chargerTypeLabel(type: Charger["charger_type"]): string {
  switch (type) {
    case "Level1": return "L1";
    case "Level2": return "L2";
    case "DC_Fast": return "DC";
    case "CCS": return "CCS";
    case "CHAdeMO": return "CHAdeMO";
    case "Tesla": return "Tesla";
    default: return type;
  }
}

export default function StationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { startSession } = useSessionStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedChargerId, setSelectedChargerId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const station = MOCK_STATIONS.find((s) => s.id === id);
  const reviews = MOCK_REVIEWS.filter((r) => r.station_id === id);

  const availableChargers = station?.chargers?.filter((c) => c.status === "available") ?? [];
  const selectedCharger = station?.chargers?.find((c) => c.id === selectedChargerId);

  useEffect(() => {
    checkFavorite();
    // Pre-select first available charger
    if (availableChargers.length > 0) {
      setSelectedChargerId(availableChargers[0].id);
    }
  }, []);

  // Pulse the start button when a charger is selected
  useEffect(() => {
    if (selectedChargerId) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [selectedChargerId]);

  const checkFavorite = async () => {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    setIsFavorite(ids.includes(id ?? ""));
  };

  const toggleFavorite = async () => {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    let ids: string[] = stored ? JSON.parse(stored) : [];
    if (isFavorite) {
      ids = ids.filter((i) => i !== id);
    } else {
      ids.push(id ?? "");
    }
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    setIsFavorite(!isFavorite);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleNavigate = () => {
    if (!station) return;
    const url = Platform.select({
      ios: `maps:?daddr=${station.latitude},${station.longitude}`,
      android: `geo:${station.latitude},${station.longitude}?q=${station.latitude},${station.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`,
    });
    Linking.openURL(url ?? "");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleStartCharging = async () => {
    if (!station || !selectedCharger) return;
    if (selectedCharger.status !== "available") {
      Alert.alert("Charger Unavailable", "This charger is not available. Please select another.");
      return;
    }
    setStarting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((r) => setTimeout(r, 800));
    startSession({
      sessionId: `sess_${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      chargerId: selectedCharger.id,
      chargerType: chargerTypeLabel(selectedCharger.charger_type),
      powerKw: selectedCharger.power_kw,
      startTime: Date.now(),
      initialBattery: INITIAL_BATTERY,
      targetBattery: TARGET_BATTERY,
      vehicleCapacityKwh: VEHICLE_CAPACITY_KWH,
      ratePerKwh: RATE_PER_KWH,
    });
    setStarting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/charging/session");
  };

  if (!station) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Station not found</Text>
      </View>
    );
  }

  const status = getStationStatus(station);
  const statusColor = getStatusColor(status);
  const available = station.chargers?.filter((c) => c.status === "available").length ?? 0;
  const total = station.chargers?.length ?? 0;
  const maxPower = station.chargers?.reduce((m, c) => Math.max(m, c.power_kw), 0) ?? 0;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  // Estimated session cost & time for selected charger
  const estKwh = selectedCharger
    ? ((TARGET_BATTERY - INITIAL_BATTERY) / 100) * VEHICLE_CAPACITY_KWH
    : 0;
  const estCost = estKwh * RATE_PER_KWH;
  const estMins = selectedCharger && selectedCharger.power_kw > 0
    ? Math.ceil((estKwh / selectedCharger.power_kw) * 60)
    : 0;
  const estTimeLabel = estMins < 60 ? `${estMins} min` : `${Math.floor(estMins / 60)}h ${estMins % 60}m`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Floating Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <GlassCard style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </GlassCard>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} activeOpacity={0.7}>
          <GlassCard style={styles.headerBtn}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? colors.destructive : colors.foreground}
            />
          </GlassCard>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.secondary }]}>
          <LinearGradient
            colors={[colors.primary + "33", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="flash" size={52} color={colors.primary} />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "22", borderColor: statusColor + "55" }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(station.rating) ? "star" : "star-outline"}
                  size={14}
                  color="#FFC107"
                />
              ))}
              <Text style={[styles.ratingCount, { color: colors.mutedForeground }]}>({station.review_count})</Text>
            </View>
          </View>
          <Text style={[styles.stationName, { color: colors.foreground }]}>{station.name}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.address, { color: colors.mutedForeground }]}>{station.address}</Text>
          </View>
          {station.description && (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>{station.description}</Text>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {[
            { icon: "flash-outline", label: "Available", value: `${available}/${total}`, color: colors.primary },
            { icon: "speedometer-outline", label: "Max Power", value: `${maxPower} kW`, color: colors.accent },
            { icon: "pricetag-outline", label: "Rate", value: `$${RATE_PER_KWH}/kWh`, color: "#FFA500" },
          ].map((stat) => (
            <GlassCard key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Charger Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Charger</Text>
          <View style={styles.chargerList}>
            {station.chargers?.map((charger) => {
              const isSelected = charger.id === selectedChargerId;
              const statusClr = chargerStatusColor(charger.status, colors);
              const isAvailable = charger.status === "available";
              return (
                <TouchableOpacity
                  key={charger.id}
                  onPress={() => {
                    if (!isAvailable) return;
                    setSelectedChargerId(charger.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={isAvailable ? 0.8 : 1}
                >
                  <GlassCard
                    style={[
                      styles.chargerCard,
                      isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + "11" },
                      !isAvailable && { opacity: 0.55 },
                    ]}
                  >
                    {/* Left: type + power */}
                    <View style={[styles.chargerIconBox, { backgroundColor: isSelected ? colors.primary + "22" : colors.secondary }]}>
                      <Ionicons
                        name={charger.power_kw >= 50 ? "flash" : "battery-half-outline"}
                        size={20}
                        color={isSelected ? colors.primary : colors.mutedForeground}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.chargerType, { color: colors.foreground }]}>
                        {chargerTypeLabel(charger.charger_type)} · {charger.power_kw} kW
                      </Text>
                      <Text style={[styles.chargerConnectors, { color: colors.mutedForeground }]}>
                        {charger.connector_count} connector{charger.connector_count !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    {/* Status pill */}
                    <View style={[styles.statusPill, { backgroundColor: statusClr + "22", borderColor: statusClr + "55" }]}>
                      <View style={[styles.statusPillDot, { backgroundColor: statusClr }]} />
                      <Text style={[styles.statusPillText, { color: statusClr }]}>
                        {charger.status.charAt(0).toUpperCase() + charger.status.slice(1)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginLeft: 6 }} />
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Session Estimate */}
        {selectedCharger && (
          <GlassCard style={styles.estimateCard}>
            <LinearGradient
              colors={[colors.primary + "18", "transparent"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.estimateTitle, { color: colors.foreground }]}>Session Estimate</Text>
            <View style={styles.estimateRow}>
              <View style={styles.estimateItem}>
                <Ionicons name="battery-charging-outline" size={18} color={colors.primary} />
                <Text style={[styles.estimateValue, { color: colors.foreground }]}>{INITIAL_BATTERY}% → {TARGET_BATTERY}%</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Battery</Text>
              </View>
              <View style={[styles.estimateDivider, { backgroundColor: colors.border }]} />
              <View style={styles.estimateItem}>
                <Ionicons name="time-outline" size={18} color={colors.accent} />
                <Text style={[styles.estimateValue, { color: colors.foreground }]}>{estTimeLabel}</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Duration</Text>
              </View>
              <View style={[styles.estimateDivider, { backgroundColor: colors.border }]} />
              <View style={styles.estimateItem}>
                <Ionicons name="card-outline" size={18} color="#FFA500" />
                <Text style={[styles.estimateValue, { color: colors.foreground }]}>${estCost.toFixed(2)}</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Est. Cost</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reviews</Text>
            <View style={{ gap: 10 }}>
              {reviews.map((review) => (
                <GlassCard key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewAvatar, { backgroundColor: colors.secondary }]}>
                      <Ionicons name="person" size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewName, { color: colors.foreground }]}>{review.user?.full_name}</Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= review.rating ? "star" : "star-outline"}
                            size={11}
                            color="#FFC107"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.reviewComment, { color: colors.mutedForeground }]}>{review.comment}</Text>
                </GlassCard>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={handleNavigate} activeOpacity={0.85}>
          <GlassCard style={styles.navigateBtn}>
            <Ionicons name="navigate-outline" size={20} color={colors.foreground} />
          </GlassCard>
        </TouchableOpacity>

        <Animated.View style={[{ flex: 1 }, { transform: [{ scale: selectedCharger ? pulseAnim : 1 }] }]}>
          <TouchableOpacity
            onPress={handleStartCharging}
            disabled={!selectedCharger || starting}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <View
              style={[
                styles.startBtn,
                {
                  backgroundColor: selectedCharger && !starting ? colors.primary : colors.border,
                },
              ]}
            >
              {starting ? (
                <>
                  <Ionicons name="reload-outline" size={20} color={colors.primaryForeground} />
                  <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>Connecting...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={20} color={colors.primaryForeground} />
                  <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
                    {selectedCharger ? "Start Charging" : "No Charger Available"}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerBtn: {
    width: 44, height: 44,
    alignItems: "center", justifyContent: "center",
    borderRadius: 22,
  },
  content: { paddingHorizontal: 16 },
  hero: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -16,
    marginBottom: 4,
    overflow: "hidden",
  },
  heroIcon: {
    width: 96, height: 96, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  infoSection: { paddingTop: 20, paddingBottom: 12 },
  statusRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row", alignItems: "center",
    gap: 6, borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingCount: { fontSize: 12, marginLeft: 4 },
  stationName: {
    fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 6,
  },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  address: { fontSize: 13, flex: 1, fontFamily: "Inter_400Regular" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 4 },
  statsGrid: {
    flexDirection: "row", gap: 10, marginBottom: 20,
  },
  statCard: { flex: 1, alignItems: "center", padding: 14, gap: 6 },
  statValue: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 12,
  },
  chargerList: { gap: 10 },
  chargerCard: {
    flexDirection: "row", alignItems: "center", padding: 14, gap: 12,
  },
  chargerIconBox: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  chargerType: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  chargerConnectors: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusPillDot: { width: 5, height: 5, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: "600" },
  estimateCard: {
    padding: 18, marginBottom: 20, overflow: "hidden",
  },
  estimateTitle: {
    fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 14,
  },
  estimateRow: { flexDirection: "row", alignItems: "center" },
  estimateItem: { flex: 1, alignItems: "center", gap: 6 },
  estimateDivider: { width: 1, height: 40 },
  estimateValue: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  estimateLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewCard: { padding: 14 },
  reviewHeader: {
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8,
  },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  reviewName: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  reviewStars: { flexDirection: "row", gap: 2, marginTop: 2 },
  reviewDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  reviewComment: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  bottomBar: {
    position: "absolute", bottom: 0, left: 16, right: 16,
    flexDirection: "row", gap: 12, paddingTop: 8,
  },
  navigateBtn: {
    width: 52, height: 52,
    alignItems: "center", justifyContent: "center",
    borderRadius: 16,
  },
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 16,
  },
  startBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  errorText: { textAlign: "center", marginTop: 100, fontSize: 16 },
});
