import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
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

type BuscarScreenProps = {
  route: any;
  navigation: any;
};

export default function BuscarScreen({ route, navigation }: BuscarScreenProps) {
  const { favorites, toggleFavorite } = useFavoritos();
  const [query, setQuery] = useState("");
  const [filterAbierto, setFilterAbierto] = useState(false);
  const [filterVerificado, setFilterVerificado] = useState(false);
  const [filterDomicilio, setFilterDomicilio] = useState(false);
  const [results, setResults] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If coming from category selection, pre-fill query
    if (route.params?.searchCategory) {
      setQuery(route.params.searchCategory);
      loadNegocios(route.params.searchCategory);
    }
  }, [route.params]);

  const loadNegocios = async (searchQuery: string = query) => {
    setLoading(true);
    try {
      let q = supabase.from("negocios").select("*").eq("activo", true);

      if (searchQuery.trim()) {
        q = q.or(`nombre.ilike.%${searchQuery}%,descripcion.ilike.%${searchQuery}%`);
      }

      if (filterVerificado) {
        q = q.eq("verificado", true);
      }

      if (filterDomicilio) {
        q = q.eq("a_domicilio", true);
      }

      const { data } = await q.limit(50);

      if (data) {
        setResults(data);
      }
    } catch (error) {
      console.error("Error loading negocios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim()) {
      loadNegocios(text);
    } else {
      setResults([]);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Buscar</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <View style={styles.searchInput}>
          <TextInput
            style={styles.input}
            placeholder="Nombre, categoría o rubro"
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={handleSearch}
          />
          {query ? (
            <TouchableOpacity onPress={handleClearQuery}>
              <X size={15} color={COLORS.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filterAbierto && styles.filterPillActive,
          ]}
          onPress={() => setFilterAbierto(!filterAbierto)}
        >
          <Text style={[styles.filterText, filterAbierto && styles.filterTextActive]}>
            Abierto ahora
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filterVerificado && styles.filterPillActive,
          ]}
          onPress={() => {
            setFilterVerificado(!filterVerificado);
            loadNegocios();
          }}
        >
          <Text style={[styles.filterText, filterVerificado && styles.filterTextActive]}>
            Verificados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filterDomicilio && styles.filterPillActive,
          ]}
          onPress={() => {
            setFilterDomicilio(!filterDomicilio);
            loadNegocios();
          }}
        >
          <Text style={[styles.filterText, filterDomicilio && styles.filterTextActive]}>
            A domicilio
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <Text style={styles.resultCount}>{results.length} resultados</Text>

      {/* Results */}
      <ScrollView style={styles.scroll}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : results.length === 0 && query.trim() ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No encontramos negocios con estos filtros.
            </Text>
          </View>
        ) : (
          results.map((negocio) => (
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
  searchBox: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.text,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
    overflow: "scroll",
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: "transparent",
    borderRadius: 4,
  },
  filterPillActive: {
    backgroundColor: COLORS.accent,
  },
  filterText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.accent,
  },
  filterTextActive: {
    color: "#f2f2f3",
  },
  resultCount: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
