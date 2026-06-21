import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import * as Haptics from "expo-haptics";

const FAQS = [
  { q: "How do I start a charging session?", a: "Navigate to any station, tap it on the map, select a charger, and tap 'Start Charging'. The session will begin automatically once you plug in your vehicle." },
  { q: "What charger types does the app support?", a: "EV SmartCharge supports all major connector types: CCS, CHAdeMO, Tesla Supercharger (NACS), Level 2 J1772, and standard household outlets (Level 1)." },
  { q: "Why isn't my vehicle showing as charging?", a: "Ensure your vehicle is properly plugged in and the charger shows 'Occupied' status. If the issue persists, try refreshing the station status or contact support." },
  { q: "How does the AI assistant work?", a: "Our AI is powered by Google Gemini. It analyzes your charging history, vehicle range, and current battery level to recommend optimal stations and predict charging times." },
  { q: "Can I schedule charging in advance?", a: "Scheduled charging is coming soon! You'll be able to pre-book chargers at supported stations and set departure time targets." },
  { q: "How do I report a broken charger?", a: "Open the station detail page, scroll to the charger list, and tap the flag icon next to any charger. Your report is sent immediately to the station operator." },
];

const CONTACT_OPTIONS = [
  { label: "Live Chat", sub: "Avg response: 2 min", icon: "chatbubbles-outline", color: "#00BFFF" },
  { label: "Email Support", sub: "support@evsmartcharge.app", icon: "mail-outline", color: "#39FF14" },
  { label: "Community Forum", sub: "Ask other EV drivers", icon: "people-outline", color: "#FFA500" },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
          <Text style={[styles.title, { color: colors.foreground }]}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Contact Options */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>CONTACT US</Text>
        <View style={styles.contactList}>
          {CONTACT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              activeOpacity={0.8}
            >
              <GlassCard style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: opt.color + "22" }]}>
                  <Ionicons name={opt.icon as any} size={22} color={opt.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactLabel, { color: colors.foreground }]}>{opt.label}</Text>
                  <Text style={[styles.contactSub, { color: colors.mutedForeground }]}>{opt.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 28 }]}>
          FREQUENTLY ASKED QUESTIONS
        </Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOpenFaq(openFaq === i ? null : i);
              }}
              activeOpacity={0.8}
            >
              <GlassCard style={styles.faqCard}>
                <View style={styles.faqQuestion}>
                  <Text style={[styles.faqQ, { color: colors.foreground, flex: 1 }]}>{faq.q}</Text>
                  <Ionicons
                    name={openFaq === i ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </View>
                {openFaq === i && (
                  <Text style={[styles.faqA, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
                    {faq.a}
                  </Text>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
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
  contactList: { paddingHorizontal: 16, gap: 10 },
  contactCard: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  contactIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  contactSub: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  faqList: { paddingHorizontal: 16, gap: 8 },
  faqCard: { padding: 14 },
  faqQuestion: { flexDirection: "row", alignItems: "center", gap: 10 },
  faqQ: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium", lineHeight: 20 },
  faqA: {
    fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1,
  },
});
