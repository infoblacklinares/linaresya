import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "linaresya_favorites";

export function useFavoritos() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) {
        setFavorites(new Set(JSON.parse(data)));
      }
      setLoading(false);
    } catch (e) {
      console.error("Error loading favorites:", e);
      setLoading(false);
    }
  };

  const addFavorite = async (id: string) => {
    try {
      const updated = new Set(favorites);
      updated.add(id);
      setFavorites(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(updated)));
    } catch (e) {
      console.error("Error adding favorite:", e);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const updated = new Set(favorites);
      updated.delete(id);
      setFavorites(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(updated)));
    } catch (e) {
      console.error("Error removing favorite:", e);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (favorites.has(id)) {
      await removeFavorite(id);
    } else {
      await addFavorite(id);
    }
  };

  return {
    favorites,
    loading,
    isFavorite: (id: string) => favorites.has(id),
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
