import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";

const LINKS = [
  { label: "Terms of Service", icon: "document-text-outline" },
  { label: "Privacy Policy", icon: "shield-outline" },
  { label: "Open Source Licenses", icon: "code-slash-outline" },
  { label: "Rate the App", icon: "star-outline" },
  { label: "Share with Friends", icon: "share-social-outline" },
];

const TECH_STACK = [
  { label: "AI Engine", value: "Google Gemini 2.0", icon: "flash" },
  { label: "Mapping", value: "Google Maps", icon: "map" },
  { label: "Backend", value: "Supabase", icon: "server-outline" },
  { label: "Platform", value: "React Native / Expo", icon: "phone-portrait-outline" },
];

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <GlassCard style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </GlassCard>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>About</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* App logo + version */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[colors.primary + "33", colors.accent + "11"]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="flash" size={48} color={colors.primary} />
          </LinearGradient>
          <Text style={[styles.appName, { color: colors.foreground }]}>EV SmartCharge</Text>
          <Text style={[styles.version, { color: colors.mutedForeground }]}>Version 1.0.0 (Build 1)</Text>
          <GlassCard style={[styles.tagline, { borderColor: colors.accent + "44" }]}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
            <Text style={[styles.taglineText, { color: colors.accent }]}>AI-Powered EV Charging</Text>
          </GlassCard>
        </View>

        {/* Tech stack */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>POWERED BY</Text>
        <View style={styles.techGrid}>
          {TECH_STACK.map((item) => (
            <GlassCard key={item.label} style={styles.techCard}>
              <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.techValue, { color: colors.foreground }]}>{item.value}</Text>
              <Text style={[styles.techLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Links */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 28 }]}>LEGAL & MORE</Text>
        <GlassCard style={styles.linksGroup}>
          {LINKS.map((link, i) => (
            <TouchableOpacity
              key={link.label}
              activeOpacity={0.75}
              onPress={() => {}}
            >
              <View style={[styles.linkRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={[styles.linkIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name={link.icon as any} size={16} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.linkLabel, { color: colors.foreground }]}>{link.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Made with care for EV drivers{"\n"}© 2026 EV SmartCharge
        </Text>
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
  logoSection: { alignItems: "center", paddingVertical: 28, gap: 10 },
  logoGradient: { width: 96, height: 96, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  version: { fontSize: 13, fontFamily: "Inter_400Regular" },
  tagline: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6 },
  taglineText: { fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 },
  techGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  techCard: { width: "47%", alignItems: "center", padding: 14, gap: 6 },
  techValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  techLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  linksGroup: { marginHorizontal: 16, padding: 4 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  linkIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  linkLabel: { flex: 1, fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  footer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", paddingVertical: 28, lineHeight: 18 },
});
