import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useFavoritos } from "@/hooks/useFavoritos";
import { NegocioCard } from "@/components/NegocioCard";
import { Negocio } from "@/types";

const COLORS = {
  bg: "#f2f2f3",
  surface: "#e9e9ea",
  text: "#1d1f20",
  textMuted: "rgba(29,31,32,0.55)",
  accent: "#5980a6",
  divider: "rgba(29,31,32,0.16)",
};

type FavoritosScreenProps = {
  navigation: any;
};

export default function FavoritosScreen({ navigation }: FavoritosScreenProps) {
  const { favorites, toggleFavorite } = useFavoritos();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      if (favorites.size === 0) {
        setNegocios([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("negocios")
        .select("*")
        .in("id", Array.from(favorites));

      if (data) setNegocios(data);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Favoritos</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : negocios.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
            <Text style={styles.emptyText}>
              Toca el corazón en cualquier negocio para guardarlo aquí.
            </Text>
          </View>
        ) : (
          negocios.map((negocio) => (
            <NegocioCard
              key={negocio.id}
              negocio={negocio}
              isFavorite={favorites.has(negocio.id)}
              onPress={() => console.log("Navigate to detail:", negocio.id)}
              onToggleFavorite={() => toggleFavorite(negocio.id)}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerBox: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
