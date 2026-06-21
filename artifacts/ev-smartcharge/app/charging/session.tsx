import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Alert,
  Animated, ScrollView, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import { useSessionStore } from "@/store/sessionStore";
import * as Haptics from "expo-haptics";

const TICK_MS = 1000;

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function ChargingSessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeSession, endSession } = useSessionStore();

  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [finalStats, setFinalStats] = useState<{ kWh: number; cost: number; duration: number; battery: number } | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const session = activeSession;

  // Live computed values
  const elapsedHours = elapsed / 3600;
  const energyKwh = session ? session.powerKw * elapsedHours : 0;
  const cost = session ? energyKwh * session.ratePerKwh : 0;
  const addedBattery = session
    ? Math.min((energyKwh / session.vehicleCapacityKwh) * 100, session.targetBattery - session.initialBattery)
    : 0;
  const currentBattery = session ? Math.min(session.initialBattery + addedBattery, session.targetBattery) : 0;
  const batteryPct = Math.round(currentBattery);
  const progressFraction = session
    ? (currentBattery - session.initialBattery) / (session.targetBattery - session.initialBattery)
    : 0;

  // ETA
  const remainingBattery = session ? session.targetBattery - currentBattery : 0;
  const remainingKwh = session ? (remainingBattery / 100) * session.vehicleCapacityKwh : 0;
  const etaMins = session && session.powerKw > 0 ? Math.ceil((remainingKwh / session.powerKw) * 60) : 0;
  const etaLabel =
    etaMins <= 0 ? "Complete" :
    etaMins < 60 ? `${etaMins} min` :
    `${Math.floor(etaMins / 60)}h ${etaMins % 60}m`;

  // Tick
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Pulse animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    );
    glowLoop.start();
    return () => { loop.stop(); glowLoop.stop(); };
  }, []);

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(progressFraction, 1),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progressFraction]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary + "44", colors.primary + "CC"],
  });

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Stop Charging?",
      `You've added ${energyKwh.toFixed(1)} kWh so far. Your battery is at ${batteryPct}%.`,
      [
        { text: "Keep Charging", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFinalStats({ kWh: energyKwh, cost, duration: elapsed, battery: batteryPct });
            setShowSummary(true);
          },
        },
      ]
    );
  };

  const handleDone = () => {
    endSession();
    router.replace("/(tabs)");
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.noSession}>
          <Ionicons name="flash-off-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.noSessionText, { color: colors.mutedForeground }]}>No active session</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)")} activeOpacity={0.8}>
            <GlassCard style={styles.goHomeBtn}>
              <Text style={[styles.goHomeText, { color: colors.primary }]}>Go Home</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + "18", colors.background, colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: insets.bottom + 120 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlassCard style={styles.liveChip}>
            <Animated.View style={[styles.liveDot, { backgroundColor: colors.accent, transform: [{ scale: pulseAnim }] }]} />
            <Text style={[styles.liveText, { color: colors.accent }]}>CHARGING</Text>
          </GlassCard>
          <Text style={[styles.stationName, { color: colors.foreground }]} numberOfLines={1}>
            {session.stationName}
          </Text>
          <Text style={[styles.chargerType, { color: colors.mutedForeground }]}>
            {session.chargerType} · {session.powerKw} kW
          </Text>
        </View>

        {/* Big Battery Ring */}
        <View style={styles.ringSection}>
          <Animated.View style={[styles.ringOuter, { borderColor: glowColor }]}>
            <View style={[styles.ringMiddle, { borderColor: colors.primary + "33" }]}>
              <View style={[styles.ringInner, { backgroundColor: colors.secondary }]}>
                <Ionicons name="flash" size={28} color={colors.primary} style={{ marginBottom: 4 }} />
                <Text style={[styles.batteryValue, { color: colors.foreground }]}>{batteryPct}%</Text>
                <Text style={[styles.batteryLabel, { color: colors.mutedForeground }]}>Battery</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressStart, { color: colors.mutedForeground }]}>
              {session.initialBattery}%
            </Text>
            <Text style={[styles.progressEta, { color: colors.primary }]}>
              ETA {etaLabel}
            </Text>
            <Text style={[styles.progressEnd, { color: colors.mutedForeground }]}>
              {session.targetBattery}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
            <View style={[styles.progressTarget, { left: "100%" }]} />
          </View>
        </View>

        {/* Timer */}
        <GlassCard style={styles.timerCard}>
          <Text style={[styles.timerValue, { color: colors.foreground }]}>{formatDuration(elapsed)}</Text>
          <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>Elapsed Time</Text>
        </GlassCard>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Ionicons name="battery-charging-outline" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{energyKwh.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>kWh Added</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Ionicons name="card-outline" size={20} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{formatCost(cost)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Estimated Cost</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Ionicons name="speedometer-outline" size={20} color="#FFA500" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{session.powerKw}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>kW Output</Text>
          </GlassCard>
        </View>

        {/* Rate info */}
        <GlassCard style={styles.rateCard}>
          <Ionicons name="pricetag-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.rateText, { color: colors.mutedForeground }]}>
            ${session.ratePerKwh.toFixed(2)}/kWh · Charges to {session.targetBattery}%
          </Text>
          <Text style={[styles.rateEstimate, { color: colors.foreground }]}>
            Est. total: {formatCost((((session.targetBattery - session.initialBattery) / 100) * session.vehicleCapacityKwh) * session.ratePerKwh)}
          </Text>
        </GlassCard>

        {/* Milestones */}
        <View style={styles.milestonesSection}>
          <Text style={[styles.milestonesTitle, { color: colors.mutedForeground }]}>MILESTONES</Text>
          {[
            { pct: 40, label: "40% — Short trip ready" },
            { pct: 60, label: "60% — City driving covered" },
            { pct: 80, label: "80% — Optimal charge level" },
          ].map((m) => {
            const reached = currentBattery >= m.pct;
            return (
              <View key={m.pct} style={styles.milestoneRow}>
                <Ionicons
                  name={reached ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={reached ? colors.accent : colors.mutedForeground}
                />
                <Text style={[styles.milestoneText, { color: reached ? colors.foreground : colors.mutedForeground }]}>
                  {m.label}
                </Text>
                {reached && (
                  <GlassCard style={[styles.milestoneBadge, { borderColor: colors.accent + "55" }]}>
                    <Text style={[styles.milestoneBadgeText, { color: colors.accent }]}>Done</Text>
                  </GlassCard>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Stop Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={handleStop} activeOpacity={0.85} style={{ flex: 1 }}>
          <View style={[styles.stopBtn, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "66", borderWidth: 1 }]}>
            <Ionicons name="stop-circle-outline" size={22} color={colors.destructive} />
            <Text style={[styles.stopBtnText, { color: colors.destructive }]}>Stop Charging</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Summary Modal */}
      <Modal visible={showSummary} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.summarySheet, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
            <LinearGradient
              colors={[colors.accent + "22", "transparent"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
            />

            <View style={[styles.summaryCheck, { backgroundColor: colors.accent + "22" }]}>
              <Ionicons name="checkmark-circle" size={52} color={colors.accent} />
            </View>
            <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Session Complete</Text>
            <Text style={[styles.summarySub, { color: colors.mutedForeground }]}>{session.stationName}</Text>

            {finalStats && (
              <View style={styles.summaryStats}>
                {[
                  { icon: "time-outline", label: "Duration", value: formatDuration(finalStats.duration), color: colors.primary },
                  { icon: "battery-charging-outline", label: "Energy Added", value: `${finalStats.kWh.toFixed(2)} kWh`, color: "#39FF14" },
                  { icon: "card-outline", label: "Total Cost", value: formatCost(finalStats.cost), color: "#FFA500" },
                  { icon: "battery-full-outline", label: "Final Battery", value: `${finalStats.battery}%`, color: colors.accent },
                ].map((s) => (
                  <View key={s.label} style={[styles.summaryStatRow, { borderBottomColor: colors.border }]}>
                    <View style={[styles.summaryStatIcon, { backgroundColor: s.color + "22" }]}>
                      <Ionicons name={s.icon as any} size={18} color={s.color} />
                    </View>
                    <Text style={[styles.summaryStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                    <Text style={[styles.summaryStatValue, { color: colors.foreground }]}>{s.value}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity onPress={handleDone} activeOpacity={0.85} style={{ marginTop: 8 }}>
              <View style={[styles.doneBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.doneBtnText, { color: colors.primaryForeground }]}>Done</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: { alignItems: "center", marginBottom: 24, gap: 8 },
  liveChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: "700", letterSpacing: 1.5 },
  stationName: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  chargerType: { fontSize: 13, fontFamily: "Inter_400Regular" },

  // Battery ring
  ringSection: { alignItems: "center", marginBottom: 28 },
  ringOuter: {
    width: 190, height: 190, borderRadius: 95,
    borderWidth: 3, alignItems: "center", justifyContent: "center",
  },
  ringMiddle: {
    width: 164, height: 164, borderRadius: 82,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  ringInner: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: "center", justifyContent: "center",
  },
  batteryValue: { fontSize: 36, fontWeight: "700", fontFamily: "Inter_700Bold", lineHeight: 40 },
  batteryLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },

  // Progress
  progressSection: { marginBottom: 20 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressStart: { fontSize: 12 },
  progressEta: { fontSize: 12, fontWeight: "600" },
  progressEnd: { fontSize: 12 },
  progressTrack: {
    height: 10, borderRadius: 5, overflow: "hidden", position: "relative",
  },
  progressFill: { height: "100%", borderRadius: 5 },
  progressTarget: { position: "absolute", top: -2, width: 2, height: 14, backgroundColor: "transparent" },

  // Timer
  timerCard: { alignItems: "center", padding: 20, marginBottom: 16 },
  timerValue: { fontSize: 44, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 2 },
  timerLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },

  // Stats
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: { flex: 1, alignItems: "center", padding: 14, gap: 6 },
  statValue: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },

  // Rate
  rateCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, marginBottom: 20 },
  rateText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  rateEstimate: { fontSize: 13, fontWeight: "600" },

  // Milestones
  milestonesSection: { marginBottom: 20 },
  milestonesTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 12 },
  milestoneRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  milestoneText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  milestoneBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  milestoneBadgeText: { fontSize: 11, fontWeight: "600" },

  // Bottom
  bottomBar: { position: "absolute", bottom: 0, left: 16, right: 16, paddingTop: 8 },
  stopBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 16,
  },
  stopBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },

  // No session
  noSession: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  noSessionText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  goHomeBtn: { paddingHorizontal: 24, paddingVertical: 12 },
  goHomeText: { fontSize: 15, fontWeight: "600" },

  // Summary modal
  modalOverlay: { flex: 1, backgroundColor: "#000000BB", justifyContent: "flex-end" },
  summarySheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, padding: 24, paddingBottom: 40,
    overflow: "hidden", alignItems: "center",
  },
  summaryCheck: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  summaryTitle: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 4 },
  summarySub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 24 },
  summaryStats: { width: "100%", marginBottom: 16 },
  summaryStatRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  summaryStatIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  summaryStatLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryStatValue: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  doneBtn: {
    paddingHorizontal: 48, paddingVertical: 16,
    borderRadius: 16, alignItems: "center",
  },
  doneBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
