import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import * as Haptics from "expo-haptics";

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#050816", "#0D1117", "#050816"]} style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 20, paddingBottom: bottomPadding + 20 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.logoSection}>
          <View style={[styles.logoRing, { borderColor: colors.accent + "44" }]}>
            <View style={[styles.logoInner, { backgroundColor: colors.accent + "22" }]}>
              <Ionicons name="flash" size={36} color={colors.accent} />
            </View>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Join the EV revolution</Text>
        </View>

        <GlassCard style={styles.form}>
          {[
            { label: "Full Name", icon: "person-outline", value: name, onChange: setName, placeholder: "Your name", keyboardType: "default" as const },
            { label: "Email", icon: "mail-outline", value: email, onChange: setEmail, placeholder: "you@example.com", keyboardType: "email-address" as const },
            { label: "Password", icon: "lock-closed-outline", value: password, onChange: setPassword, placeholder: "Min 8 characters", keyboardType: "default" as const, secure: true },
          ].map((field) => (
            <View key={field.label} style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>{field.label}</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                <Ionicons name={field.icon as any} size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  value={field.value}
                  onChangeText={field.onChange}
                  secureTextEntry={field.secure}
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.label === "Full Name" ? "words" : "none"}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <View style={[styles.signupBtn, { backgroundColor: loading ? colors.border : colors.accent }]}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.signupBtnText, { color: "#050816" }]}>Create Account</Text>
              )}
            </View>
          </TouchableOpacity>
        </GlassCard>

        <TouchableOpacity onPress={() => router.push("/auth/login")} style={styles.loginRow} activeOpacity={0.8}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 24 },
  logoSection: { alignItems: "center", marginBottom: 32 },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  form: { padding: 20, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  signupBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  signupBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  loginRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 24 },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: "600" },
});
