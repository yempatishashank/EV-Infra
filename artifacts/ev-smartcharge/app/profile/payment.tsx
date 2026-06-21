import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import * as Haptics from "expo-haptics";

const CARDS = [
  { id: "1", type: "visa", last4: "4242", expiry: "12/26", name: "Alex Chen", default: true },
  { id: "2", type: "mastercard", last4: "8821", expiry: "08/25", name: "Alex Chen", default: false },
];

const CARD_ICONS: Record<string, string> = {
  visa: "card",
  mastercard: "card",
  amex: "card",
};

const CARD_COLORS: Record<string, string> = {
  visa: "#1A1FFF",
  mastercard: "#EB001B",
  amex: "#2E77BC",
};

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [cards, setCards] = useState(CARDS);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleSetDefault = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCards(cards.map((c) => ({ ...c, default: c.id === id })));
  };

  const handleRemove = (id: string) => {
    Alert.alert("Remove Card", "Remove this payment method?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setCards(cards.filter((c) => c.id !== id));
        },
      },
    ]);
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
          <Text style={[styles.title, { color: colors.foreground }]}>Payment Methods</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Cards */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SAVED CARDS</Text>
        <View style={styles.cardList}>
          {cards.map((card) => (
            <GlassCard
              key={card.id}
              style={[styles.creditCard, card.default && { borderColor: colors.primary }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.cardTypeIcon, { backgroundColor: CARD_COLORS[card.type] + "33" }]}>
                  <Ionicons name="card" size={20} color={CARD_COLORS[card.type]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardType, { color: colors.mutedForeground }]}>
                    {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
                  </Text>
                  <Text style={[styles.cardNumber, { color: colors.foreground }]}>
                    •••• •••• •••• {card.last4}
                  </Text>
                </View>
                {card.default && (
                  <View style={[styles.defaultBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
                    <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
                  </View>
                )}
              </View>
              <View style={[styles.cardBottom, { borderTopColor: colors.border }]}>
                <View style={styles.expiryRow}>
                  <Text style={[styles.expiryLabel, { color: colors.mutedForeground }]}>Expires</Text>
                  <Text style={[styles.expiryValue, { color: colors.foreground }]}>{card.expiry}</Text>
                </View>
                <View style={styles.cardActions}>
                  {!card.default && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(card.id)}
                      activeOpacity={0.8}
                      style={[styles.actionBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.actionText, { color: colors.foreground }]}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemove(card.id)}
                    activeOpacity={0.8}
                    style={[styles.actionBtn, { borderColor: colors.destructive + "55" }]}
                  >
                    <Text style={[styles.actionText, { color: colors.destructive }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Add Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert("Add Card", "Card entry form coming soon.");
          }}
          style={{ marginHorizontal: 16, marginTop: 8 }}
        >
          <GlassCard style={[styles.addCard, { borderColor: colors.primary + "44", borderStyle: "dashed" }]}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={[styles.addCardText, { color: colors.primary }]}>Add New Card</Text>
          </GlassCard>
        </TouchableOpacity>

        {/* Billing Info */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 28 }]}>BILLING INFO</Text>
        <GlassCard style={styles.billingCard}>
          {[
            { label: "This Month", value: "$47.16", icon: "calendar-outline" },
            { label: "Last Month", value: "$89.42", icon: "calendar" },
            { label: "All Time", value: "$284.10", icon: "trending-up-outline" },
          ].map((row, i) => (
            <View
              key={row.label}
              style={[styles.billingRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}
            >
              <Ionicons name={row.icon as any} size={16} color={colors.mutedForeground} />
              <Text style={[styles.billingLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.billingValue, { color: colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
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
  cardList: { paddingHorizontal: 16, gap: 12 },
  creditCard: { padding: 16, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  cardTypeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardType: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  cardNumber: { fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 2, letterSpacing: 1 },
  defaultBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  defaultText: { fontSize: 11, fontWeight: "600" },
  cardBottom: { borderTopWidth: 1, paddingTop: 12, flexDirection: "row", alignItems: "center" },
  expiryRow: { flex: 1, gap: 2 },
  expiryLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  expiryValue: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { fontSize: 12, fontWeight: "600" },
  addCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, padding: 16,
  },
  addCardText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  billingCard: { marginHorizontal: 16, padding: 4 },
  billingRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  billingLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  billingValue: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
