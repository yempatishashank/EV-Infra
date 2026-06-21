import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

type MenuRoute = "/profile/vehicle" | "/profile/history" | "/profile/payment" | "/profile/notifications" | "/profile/privacy" | "/profile/help" | "/profile/about";

interface MenuItem {
  icon: string;
  label: string;
  sub: string;
  route: MenuRoute;
  iconColor?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: "car-sport-outline", label: "My Vehicle", sub: "Tesla Model 3", route: "/profile/vehicle", iconColor: "#00BFFF" },
  { icon: "time-outline", label: "Charging History", sub: "12 sessions", route: "/profile/history", iconColor: "#39FF14" },
  { icon: "card-outline", label: "Payment Methods", sub: "Visa ****4242", route: "/profile/payment", iconColor: "#FFA500" },
  { icon: "notifications-outline", label: "Notifications", sub: "All enabled", route: "/profile/notifications", iconColor: "#A78BFA" },
  { icon: "shield-checkmark-outline", label: "Privacy & Security", sub: "2FA enabled", route: "/profile/privacy", iconColor: "#FF6B6B" },
  { icon: "help-circle-outline", label: "Help & Support", sub: "FAQ & contact", route: "/profile/help", iconColor: "#38BDF8" },
  { icon: "information-circle-outline", label: "About", sub: "v1.0.0", route: "/profile/about", iconColor: "#94A3B8" },
];

const STATS = [
  { label: "Sessions", value: "12", icon: "flash-outline" },
  { label: "kWh Charged", value: "284", icon: "battery-charging-outline" },
  { label: "Hours", value: "38", icon: "time-outline" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleMenuPress = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(item.route);
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPadding + 12 }}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarRing, { borderColor: colors.primary + "55" }]}>
            <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
          </View>
          {isLoggedIn ? (
            <>
              <Text style={[styles.name, { color: colors.foreground }]}>Alex Chen</Text>
              <Text style={[styles.email, { color: colors.mutedForeground }]}>alex.chen@email.com</Text>
              <GlassCard style={[styles.roleBadge, { borderColor: colors.accent + "55" }]}>
                <Ionicons name="flash" size={12} color={colors.accent} />
                <Text style={[styles.roleText, { color: colors.accent }]}>EV Driver</Text>
              </GlassCard>
            </>
          ) : (
            <>
              <Text style={[styles.name, { color: colors.foreground }]}>Welcome</Text>
              <Text style={[styles.email, { color: colors.mutedForeground }]}>Sign in to access all features</Text>
              <View style={styles.authBtns}>
                <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
                  <View style={[styles.signInBtn, { backgroundColor: colors.primary }]}>
                    <Ionicons name="log-in-outline" size={16} color={colors.primaryForeground} />
                    <Text style={[styles.signInText, { color: colors.primaryForeground }]}>Sign In</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/auth/signup")} activeOpacity={0.8}>
                  <GlassCard style={[styles.signUpBtn, { borderColor: colors.border }]}>
                    <Text style={[styles.signUpText, { color: colors.foreground }]}>Create Account</Text>
                  </GlassCard>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Stats (logged in only) */}
        {isLoggedIn && (
          <View style={styles.statsRow}>
            {STATS.map((stat) => (
              <GlassCard key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon as any} size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.75}
              onPress={() => handleMenuPress(item)}
            >
              <GlassCard style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: (item.iconColor ?? colors.primary) + "1A" }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.iconColor ?? colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                  {item.sub ? (
                    <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        {isLoggedIn && (
          <TouchableOpacity onPress={handleSignOut} activeOpacity={0.8} style={{ marginHorizontal: 16, marginTop: 16 }}>
            <GlassCard style={[styles.signOutBtn, { borderColor: colors.destructive + "55" }]}>
              <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
              <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
            </GlassCard>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarSection: {
    alignItems: "center",
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  roleText: { fontSize: 12, fontWeight: "600" },
  authBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  signInText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  signUpBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpText: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  menuSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  menuSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
