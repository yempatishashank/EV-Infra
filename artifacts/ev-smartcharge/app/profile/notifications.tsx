import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import * as Haptics from "expo-haptics";

const NOTIFICATION_GROUPS = [
  {
    group: "Charging",
    items: [
      { id: "charge_complete", label: "Charge Complete", sub: "When your EV finishes charging", icon: "battery-charging-outline" },
      { id: "charge_start", label: "Charge Started", sub: "When charging begins", icon: "flash-outline" },
      { id: "charge_error", label: "Charging Errors", sub: "If a charger disconnects unexpectedly", icon: "warning-outline" },
    ],
  },
  {
    group: "Stations",
    items: [
      { id: "station_avail", label: "Station Available", sub: "When a saved station has open chargers", icon: "location-outline" },
      { id: "price_change", label: "Price Changes", sub: "When rates change at your favorites", icon: "pricetag-outline" },
      { id: "new_station", label: "New Stations Nearby", sub: "When new stations open near you", icon: "add-circle-outline" },
    ],
  },
  {
    group: "Account",
    items: [
      { id: "promo", label: "Promotions & Offers", sub: "Discounts and rewards", icon: "gift-outline" },
      { id: "tips", label: "Charging Tips", sub: "Personalized recommendations from AI", icon: "bulb-outline" },
      { id: "security", label: "Security Alerts", sub: "Unusual account activity", icon: "shield-checkmark-outline" },
    ],
  },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    charge_complete: true,
    charge_start: true,
    charge_error: true,
    station_avail: false,
    price_change: true,
    new_station: false,
    promo: false,
    tips: true,
    security: true,
  });
  const [pushEnabled, setPushEnabled] = useState(true);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <GlassCard style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </GlassCard>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Master toggle */}
        <GlassCard style={[styles.masterToggle, { marginHorizontal: 16, marginBottom: 24 }]}>
          <View style={[styles.masterIcon, { backgroundColor: pushEnabled ? colors.primary + "22" : colors.secondary }]}>
            <Ionicons name="notifications" size={22} color={pushEnabled ? colors.primary : colors.mutedForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.masterLabel, { color: colors.foreground }]}>Push Notifications</Text>
            <Text style={[styles.masterSub, { color: colors.mutedForeground }]}>
              {pushEnabled ? "All alerts enabled" : "All notifications paused"}
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={(v) => { setPushEnabled(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
            trackColor={{ false: colors.border, true: colors.primary + "88" }}
            thumbColor={pushEnabled ? colors.primary : colors.mutedForeground}
          />
        </GlassCard>

        {/* Groups */}
        {NOTIFICATION_GROUPS.map((group) => (
          <View key={group.group} style={{ marginBottom: 24 }}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{group.group.toUpperCase()}</Text>
            <GlassCard style={styles.groupCard}>
              {group.items.map((item, i) => (
                <View
                  key={item.id}
                  style={[
                    styles.notifRow,
                    i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                    !pushEnabled && styles.disabled,
                  ]}
                >
                  <View style={[styles.notifIcon, { backgroundColor: colors.secondary }]}>
                    <Ionicons name={item.icon as any} size={16} color={settings[item.id] && pushEnabled ? colors.primary : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.notifSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={settings[item.id] && pushEnabled}
                    onValueChange={() => pushEnabled && toggle(item.id)}
                    trackColor={{ false: colors.border, true: colors.primary + "88" }}
                    thumbColor={settings[item.id] && pushEnabled ? colors.primary : colors.mutedForeground}
                    disabled={!pushEnabled}
                  />
                </View>
              ))}
            </GlassCard>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 20,
  },
  backCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  masterToggle: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  masterIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  masterLabel: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  masterSub: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 },
  groupCard: { marginHorizontal: 16, padding: 4 },
  notifRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  notifIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  notifLabel: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  notifSub: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  disabled: { opacity: 0.5 },
});
