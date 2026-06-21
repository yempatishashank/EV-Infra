import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import * as Haptics from "expo-haptics";

const VEHICLE_TYPES = [
  { id: "tesla-m3", make: "Tesla", model: "Model 3", range: 358, connector: "Tesla/CCS" },
  { id: "tesla-my", make: "Tesla", model: "Model Y", range: 330, connector: "Tesla/CCS" },
  { id: "chevy-bolt", make: "Chevrolet", model: "Bolt EV", range: 259, connector: "CCS" },
  { id: "nissan-leaf", make: "Nissan", model: "LEAF", range: 149, connector: "CHAdeMO/CCS" },
  { id: "ford-mache", make: "Ford", model: "Mustang Mach-E", range: 312, connector: "CCS" },
  { id: "hyundai-ioniq", make: "Hyundai", model: "IONIQ 6", range: 361, connector: "CCS" },
  { id: "bmw-i4", make: "BMW", model: "i4", range: 300, connector: "CCS" },
  { id: "rivian-r1t", make: "Rivian", model: "R1T", range: 314, connector: "CCS" },
];

export default function VehicleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState("tesla-m3");
  const [batteryLevel, setBatteryLevel] = useState("80");
  const [saving, setSaving] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const selectedVehicle = VEHICLE_TYPES.find((v) => v.id === selected);

  const handleSave = async () => {
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <GlassCard style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </GlassCard>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>My Vehicle</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Current Vehicle Card */}
        {selectedVehicle && (
          <GlassCard style={[styles.currentCard, { marginHorizontal: 16, marginBottom: 24 }]}>
            <LinearGradient
              colors={[colors.primary + "22", "transparent"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.carIconRow}>
              <View style={[styles.carIconBg, { backgroundColor: colors.primary + "22" }]}>
                <Ionicons name="car-sport" size={36} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.vehicleMake, { color: colors.mutedForeground }]}>{selectedVehicle.make}</Text>
                <Text style={[styles.vehicleModel, { color: colors.foreground }]}>{selectedVehicle.model}</Text>
                <Text style={[styles.vehicleConnector, { color: colors.primary }]}>{selectedVehicle.connector}</Text>
              </View>
              <View style={styles.rangeBox}>
                <Text style={[styles.rangeValue, { color: colors.accent }]}>{selectedVehicle.range}</Text>
                <Text style={[styles.rangeLbl, { color: colors.mutedForeground }]}>mi range</Text>
              </View>
            </View>

            {/* Battery Level */}
            <View style={[styles.batteryRow, { borderTopColor: colors.border }]}>
              <Ionicons name="battery-half-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.batteryLbl, { color: colors.mutedForeground }]}>Current battery</Text>
              <TextInput
                style={[styles.batteryInput, { color: colors.foreground, borderColor: colors.border }]}
                value={batteryLevel}
                onChangeText={(v) => setBatteryLevel(v.replace(/[^0-9]/g, "").slice(0, 3))}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={[styles.batteryPct, { color: colors.mutedForeground }]}>%</Text>
            </View>
          </GlassCard>
        )}

        {/* Vehicle List */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SELECT VEHICLE</Text>
        <View style={styles.vehicleList}>
          {VEHICLE_TYPES.map((v) => (
            <TouchableOpacity
              key={v.id}
              onPress={() => { setSelected(v.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.8}
            >
              <GlassCard
                style={[
                  styles.vehicleRow,
                  selected === v.id && { borderColor: colors.primary, backgroundColor: colors.primary + "11" },
                ]}
              >
                <View style={[styles.miniCarIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="car-outline" size={18} color={selected === v.id ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowMake, { color: colors.mutedForeground }]}>{v.make}</Text>
                  <Text style={[styles.rowModel, { color: colors.foreground }]}>{v.model}</Text>
                </View>
                <Text style={[styles.rowRange, { color: colors.mutedForeground }]}>{v.range} mi</Text>
                {selected === v.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.saveWrapper, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          <View style={[styles.saveBtn, { backgroundColor: saving ? colors.border : colors.primary }]}>
            <Ionicons name="checkmark" size={20} color={colors.primaryForeground} />
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
              {saving ? "Saving..." : "Save Vehicle"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backBtn: {},
  backCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  currentCard: { padding: 20, overflow: "hidden" },
  carIconRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  carIconBg: { width: 68, height: 68, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  vehicleMake: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  vehicleModel: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  vehicleConnector: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  rangeBox: { alignItems: "center" },
  rangeValue: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },
  rangeLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  batteryRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderTopWidth: 1, paddingTop: 14,
  },
  batteryLbl: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  batteryInput: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 6, fontSize: 16, fontWeight: "700",
    width: 56, textAlign: "center",
  },
  batteryPct: { fontSize: 14 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 },
  vehicleList: { paddingHorizontal: 16, gap: 8 },
  vehicleRow: {
    flexDirection: "row", alignItems: "center", padding: 14, gap: 12,
  },
  miniCarIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowMake: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rowModel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  rowRange: { fontSize: 12, marginRight: 4 },
  saveWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
