import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Heart, MapPin } from "lucide-react-native";
import { Negocio } from "@/types";

const COLORS = {
  surface: "#e9e9ea",
  text: "#1d1f20",
  textMuted: "rgba(29,31,32,0.65)",
  accent: "#5980a6",
  divider: "rgba(29,31,32,0.16)",
};

interface NegocioCardProps {
  negocio: Negocio;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function NegocioCard({ negocio, isFavorite, onPress, onToggleFavorite }: NegocioCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Placeholder for image */}
      <View style={[styles.image, { backgroundColor: COLORS.surface }]}>
        <Text style={styles.imagePlaceholder}>{negocio.nombre}</Text>
      </View>

      {/* Favorite button */}
      <TouchableOpacity
        style={styles.favButton}
        onPress={onToggleFavorite}
        activeOpacity={0.7}
      >
        <Heart
          size={18}
          color={isFavorite ? COLORS.accent : COLORS.text}
          fill={isFavorite ? COLORS.accent : "none"}
          strokeWidth={1.8}
        />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.categoria}>{negocio.categoria || "Sin categoría"}</Text>
        <Text style={styles.nombre} numberOfLines={2}>
          {negocio.nombre}
        </Text>
        <View style={styles.addressRow}>
          <MapPin size={13} color={COLORS.textMuted} strokeWidth={1.8} />
          <Text style={styles.address} numberOfLines={1}>
            {negocio.direccion}
          </Text>
        </View>

        {/* Status badges */}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: "#f2f2f3" }]}>
            <Text style={styles.badgeText}>{negocio.verificado ? "Verificado" : "Abierto"}</Text>
          </View>
          {negocio.a_domicilio && (
            <View style={[styles.badge, { borderWidth: 1, borderColor: COLORS.divider }]}>
              <Text style={styles.badgeText}>A domicilio</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  image: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  favButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: "#f2f2f3",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 12,
  },
  categoria: {
    fontSize: 9,
    color: COLORS.accent,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 8,
  },
  address: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    color: COLORS.text,
    fontWeight: "500",
  },
});
