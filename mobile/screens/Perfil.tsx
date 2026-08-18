import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LogOut, Heart, Bell, HelpCircle } from "lucide-react-native";

const COLORS = {
  bg: "#f2f2f3",
  surface: "#e9e9ea",
  text: "#1d1f20",
  textMuted: "rgba(29,31,32,0.55)",
  accent: "#5980a6",
  divider: "rgba(29,31,32,0.16)",
};

export default function PerfilScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Profile header */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Vecino de Linares</Text>
          <Text style={styles.profileEmail}>usuario@ejemplo.com</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsBox}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Negocios</Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menuBox}>
        <MenuItem
          icon={<Bell size={20} color={COLORS.text} strokeWidth={1.8} />}
          label="Notificaciones"
          onPress={() => {}}
        />
        <MenuItem
          icon={<Heart size={20} color={COLORS.text} strokeWidth={1.8} />}
          label="Mis favoritos"
          onPress={() => {}}
        />
        <MenuItem
          icon={<Text style={styles.plusIcon}>+</Text>}
          label="Publica tu negocio"
          onPress={() => {}}
        />
        <MenuItem
          icon={<HelpCircle size={20} color={COLORS.text} strokeWidth={1.8} />}
          label="Ayuda"
          onPress={() => {}}
        />
        <MenuItem
          icon={<LogOut size={20} color={COLORS.accent} strokeWidth={1.8} />}
          label="Cerrar sesión"
          isLogout
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  isLogout?: boolean;
  onPress: () => void;
}

function MenuItem({ icon, label, isLogout, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconBox}>{icon}</View>
      <Text style={[styles.menuLabel, isLogout && styles.menuLabelLogout]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
  },
  profileBox: {
    paddingVertical: 24,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statsBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
    marginVertical: 20,
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  menuBox: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: COLORS.divider,
    gap: 12,
  },
  menuIconBox: {
    width: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  menuLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
    flex: 1,
  },
  menuLabelLogout: {
    color: COLORS.accent,
  },
});
