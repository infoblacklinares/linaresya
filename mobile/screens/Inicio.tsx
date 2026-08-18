import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Bell, Search as SearchIcon } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useFavoritos } from "@/hooks/useFavoritos";
import { NegocioCard } from "@/components/NegocioCard";
import { Negocio, Categoria } from "@/types";

const COLORS = {
  bg: "#f2f2f3",
  surface: "#e9e9ea",
  text: "#1d1f20",
  textMuted: "rgba(29,31,32,0.55)",
  accent: "#5980a6",
  divider: "rgba(29,31,32,0.16)",
};

const CATEGORIAS_ORDEN = [
  "Gastronomia",
  "Servicios y Oficios",
  "Salud y Bienestar",
  "Belleza y Estetica",
  "Comercio y Tiendas",
  "Automotriz",
  "Hogar y Construccion",
  "Educacion y Clases",
  "Profesionales",
  "Mascotas",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  Gastronomia: "🍽️",
  "Servicios y Oficios": "🔧",
  "Salud y Bienestar": "🏥",
  "Belleza y Estetica": "💅",
  "Comercio y Tiendas": "🛒",
  Automotriz: "🚗",
  "Hogar y Construccion": "🏠",
  "Educacion y Clases": "🎓",
  Profesionales: "💼",
  Mascotas: "🐾",
};

type InicioScreenProps = {
  navigation: any;
};

export default function InicioScreen({ navigation }: InicioScreenProps) {
  const { favorites, toggleFavorite } = useFavoritos();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categorias
      const { data: cats } = await supabase
        .from("categorias")
        .select("*")
        .order("orden", { ascending: true });

      if (cats) setCategorias(cats);

      // Load negocios (first 4 as featured)
      const { data: negs } = await supabase
        .from("negocios")
        .select("*")
        .eq("activo", true)
        .limit(8);

      if (negs) setNegocios(negs);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.location}>Linares, Región del Maule</Text>
            <Text style={styles.title}>LinaresYa</Text>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Bell size={19} color={COLORS.text} strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Buscar")}
          activeOpacity={0.7}
        >
          <SearchIcon size={17} color={COLORS.textMuted} strokeWidth={1.8} />
          <Text style={styles.searchPlaceholder}>Buscar negocios, servicios u oficios</Text>
        </TouchableOpacity>

        {/* Categories Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          <>
            <View style={styles.categoriesGrid}>
              {CATEGORIAS_ORDEN.slice(0, 10).map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.categoryItem}
                  onPress={() => {
                    navigation.navigate("Buscar", { searchCategory: cat });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryIconBox}>
                    <Text style={styles.categoryEmoji}>{CATEGORY_EMOJIS[cat] || "📌"}</Text>
                  </View>
                  <Text style={styles.categoryLabel}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Featured Section */}
            <View style={styles.featuredHeader}>
              <Text style={styles.sectionTitle}>Destacados</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Buscar")}>
                <Text style={styles.verTodos}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Cards */}
            <View style={styles.featuredList}>
              {negocios.slice(0, 4).map((negocio) => (
                <NegocioCard
                  key={negocio.id}
                  negocio={negocio}
                  isFavorite={favorites.has(negocio.id)}
                  onPress={() => {
                    // Navigate to detail screen (we'll implement later)
                    console.log("Navigate to:", negocio.id);
                  }}
                  onToggleFavorite={() => toggleFavorite(negocio.id)}
                />
              ))}
            </View>

            {/* CTA Banner */}
            <TouchableOpacity
              style={styles.ctaBanner}
              onPress={() => navigation.navigate("Publicar")}
              activeOpacity={0.8}
            >
              <View style={styles.ctaBadge}>
                <Text style={styles.ctaBadgeText}>+</Text>
              </View>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Publica tu negocio gratis</Text>
                <Text style={styles.ctaSubtitle}>Aparece frente a miles de vecinos</Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  location: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 4,
  },
  searchPlaceholder: {
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesGrid: {
    paddingHorizontal: 20,
    marginBottom: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "18%",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryIconBox: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 9,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 12,
  },
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  verTodos: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
  },
  featuredList: {
    paddingBottom: 12,
  },
  ctaBanner: {
    marginHorizontal: 20,
    marginVertical: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.text,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  ctaBadge: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: "#f2f2f3",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaBadgeText: {
    color: "#f2f2f3",
    fontSize: 18,
    fontWeight: "bold",
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f2f2f3",
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 11.5,
    color: "rgba(242,242,243,0.75)",
  },
});
