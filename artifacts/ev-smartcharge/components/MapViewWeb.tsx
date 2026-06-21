import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

export function MapViewPlaceholder() {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.secondary }]}>
      <Ionicons name="map-outline" size={48} color={colors.mutedForeground} />
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        Map view available on mobile
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    fontSize: 14,
  },
});
