import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Home, Search, Heart, Plus, User } from "lucide-react-native";
import InicioScreen from "./screens/Inicio";
import BuscarScreen from "./screens/Buscar";
import FavoritosScreen from "./screens/Favoritos";
import PublicarScreen from "./screens/Publicar";
import PerfilScreen from "./screens/Perfil";
import { useFavoritos } from "./hooks/useFavoritos";

const Tab = createBottomTabNavigator();

const COLORS = {
  accent: "#5980a6",
  text: "#1d1f20",
  textMuted: "rgba(29,31,32,0.55)",
  surface: "#e9e9ea",
  bg: "#f2f2f3",
};

export default function App() {
  const { favorites, loading } = useFavoritos();

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size }) => {
            let icon;
            switch (route.name) {
              case "Inicio":
                icon = <Home size={size} color={color} strokeWidth={1.5} />;
                break;
              case "Buscar":
                icon = <Search size={size} color={color} strokeWidth={1.5} />;
                break;
              case "Favoritos":
                icon = <Heart size={size} color={color} strokeWidth={1.5} />;
                break;
              case "Publicar":
                icon = <Plus size={size} color={color} strokeWidth={1.5} />;
                break;
              case "Perfil":
                icon = <User size={size} color={color} strokeWidth={1.5} />;
                break;
              default:
                icon = null;
            }
            return icon;
          },
        })}
      >
        <Tab.Screen
          name="Inicio"
          component={InicioScreen}
          options={{ tabBarLabel: "Inicio" }}
        />
        <Tab.Screen
          name="Buscar"
          component={BuscarScreen}
          options={{ tabBarLabel: "Buscar" }}
        />
        <Tab.Screen
          name="Favoritos"
          component={FavoritosScreen}
          options={{ tabBarLabel: "Favoritos" }}
        />
        <Tab.Screen
          name="Publicar"
          component={PublicarScreen}
          options={{ tabBarLabel: "Publicar" }}
        />
        <Tab.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{ tabBarLabel: "Perfil" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safe: {
    backgroundColor: COLORS.bg,
  },
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(29,31,32,0.1)",
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },
});
