import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import * as Haptics from "expo-haptics";

const PRIVACY_SETTINGS = [
  { id: "location", label: "Location Services", sub: "Allow app to use your GPS location", icon: "location-outline" },
  { id: "analytics", label: "Usage Analytics", sub: "Help improve the app with anonymous data", icon: "bar-chart-outline" },
  { id: "history_sync", label: "Sync Charging History", sub: "Backup sessions to the cloud", icon: "cloud-upload-outline" },
  { id: "personalization", label: "AI Personalization", sub: "Let AI learn your charging preferences", icon: "sparkles-outline" },
];

const SECURITY_ACTIONS = [
  { label: "Change Password", icon: "key-outline", color: "#00BFFF" },
  { label: "Two-Factor Authentication", icon: "shield-checkmark-outline", color: "#39FF14" },
  { label: "Active Sessions", icon: "phone-portrait-outline", color: "#FFA500" },
  { label: "Delete Account", icon: "trash-outline", color: "#FF4444" },
];

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [privacy, setPrivacy] = useState<Record<string, boolean>>({
    location: true, analytics: false, history_sync: true, personalization: true,
  });
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrivacy((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAction = (label: string) => {
    if (label === "Delete Account") {
      Alert.alert(
        "Delete Account",
        "This will permanently delete your account and all data. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(label, "This feature will be available soon.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <GlassCard style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </GlassCard>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PRIVACY</Text>
        <GlassCard style={styles.group}>
          {PRIVACY_SETTINGS.map((item, i) => (
            <View key={item.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name={item.icon as any} size={16} color={privacy[item.id] ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
              </View>
              <Switch
                value={privacy[item.id]}
                onValueChange={() => toggle(item.id)}
                trackColor={{ false: colors.border, true: colors.primary + "88" }}
                thumbColor={privacy[item.id] ? colors.primary : colors.mutedForeground}
              />
            </View>
          ))}
        </GlassCard>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 28 }]}>SECURITY</Text>
        <GlassCard style={styles.group}>
          {SECURITY_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => handleAction(action.label)}
              activeOpacity={0.75}
            >
              <View style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={[styles.rowIcon, { backgroundColor: action.color + "22" }]}>
                  <Ionicons name={action.icon as any} size={16} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: action.label === "Delete Account" ? colors.destructive : colors.foreground }]}>
                  {action.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>
          ))}
        </GlassCard>

        <GlassCard style={[styles.infoCard, { marginHorizontal: 16, marginTop: 28, backgroundColor: colors.secondary }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Your data is encrypted and stored securely. We never sell your personal information.
          </Text>
        </GlassCard>
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
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 },
  group: { marginHorizontal: 16, padding: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
});
