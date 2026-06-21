import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { StationCard } from "@/components/StationCard";
import { GlassCard } from "@/components/GlassCard";
import { MOCK_STATIONS } from "@/lib/mockData";
import { Station } from "@/lib/types";
import * as Haptics from "expo-haptics";

const FAVORITES_KEY = "ev_favorites";

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    setFavoriteIds(ids);
    setStations(MOCK_STATIONS.filter((s) => ids.includes(s.id)));
  };

  const removeFavorite = async (stationId: string) => {
    const newIds = favoriteIds.filter((id) => id !== stationId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds));
    setFavoriteIds(newIds);
    setStations(stations.filter((s) => s.id !== stationId));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {stations.length} saved station{stations.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {stations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="heart-outline" size={40} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No favorites yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Save charging stations for quick access
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/")}
            activeOpacity={0.8}
          >
            <GlassCard style={[styles.exploreBtn, { borderColor: colors.primary }]}>
              <Text style={[styles.exploreBtnText, { color: colors.primary }]}>Explore Map</Text>
            </GlassCard>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <StationCard
                station={item}
                onPress={() => router.push(`/station/${item.id}`)}
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFavorite(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={20} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cardWrapper: {
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 5,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  exploreBtnText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
