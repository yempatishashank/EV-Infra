import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

export function SkeletonCard() {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: false }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const shimmer = { backgroundColor: colors.border };

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder, opacity },
      ]}
    >
      <View style={[styles.line, { width: "70%", ...shimmer }]} />
      <View style={[styles.line, { width: "40%", marginTop: 6, ...shimmer }]} />
      <View style={styles.statsRow}>
        <View style={[styles.stat, shimmer]} />
        <View style={[styles.stat, shimmer]} />
        <View style={[styles.stat, shimmer]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  line: {
    height: 14,
    borderRadius: 7,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  stat: {
    height: 12,
    width: 60,
    borderRadius: 6,
  },
});
