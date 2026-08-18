import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Categoria } from "@/types";

const COLORS = {
  bg: "#f2f2f3",
  surface: "#e9e9ea",
  text: "#1d1f20",
  textMuted: "rgba(29,31,32,0.55)",
  accent: "#5980a6",
  divider: "rgba(29,31,32,0.16)",
};

export default function PublicarScreen() {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [domicilio, setDomicilio] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const { data } = await supabase
        .from("categorias")
        .select("*")
        .order("orden", { ascending: true });

      if (data) setCategorias(data);
    } catch (error) {
      console.error("Error loading categorias:", error);
    }
  };

  const isFormValid = nombre.trim() && categoria && direccion.trim();

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert("Formulario incompleto", "Completa nombre, categoría y dirección");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("negocios").insert([
        {
          nombre,
          categoria_id: categoria,
          direccion,
          telefono: telefono || null,
          whatsapp: whatsapp || null,
          a_domicilio: domicilio,
          descripcion: descripcion || null,
          activo: false, // Requiere revisión
          verificado: false,
          plan: "basico",
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setNombre("");
        setCategoria("");
        setDireccion("");
        setTelefono("");
        setWhatsapp("");
        setDomicilio(false);
        setDescripcion("");
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "No pudimos publicar tu negocio. Intenta de nuevo.");
      console.error("Error submitting negocio:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>✓</Text>
          <Text style={styles.successTitle}>¡Listo!</Text>
          <Text style={styles.successText}>
            Tu negocio ha sido enviado a revisión. Te notificaremos cuando esté publicado.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Publica tu negocio</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Form */}
        <View style={styles.formBox}>
          {/* Nombre */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre del negocio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Café Las Delicias"
              placeholderTextColor={COLORS.textMuted}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          {/* Categoría */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.selectBox}>
              <Text style={[styles.selectValue, !categoria && styles.selectPlaceholder]}>
                {categoria
                  ? categorias.find((c) => c.id === categoria)?.nombre
                  : "Selecciona una categoría"}
              </Text>
            </View>
            {/* Simple picker simulation */}
            <ScrollView horizontal style={styles.categoryList}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    categoria === cat.id && styles.categoryOptionActive,
                  ]}
                  onPress={() => setCategoria(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      categoria === cat.id && styles.categoryOptionTextActive,
                    ]}
                  >
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dirección */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Maipú 380, Linares"
              placeholderTextColor={COLORS.textMuted}
              value={direccion}
              onChangeText={setDireccion}
            />
          </View>

          {/* Teléfono */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: +56 9 1234 5678"
              placeholderTextColor={COLORS.textMuted}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>

          {/* WhatsApp */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>WhatsApp</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 991234567"
              placeholderTextColor={COLORS.textMuted}
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>

          {/* A domicilio toggle */}
          <View style={styles.fieldGroup}>
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Atiende a domicilio</Text>
              <TouchableOpacity
                style={[styles.toggle, domicilio && styles.toggleActive]}
                onPress={() => setDomicilio(!domicilio)}
              >
                <View style={[styles.toggleCircle, domicilio && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripción breve</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cuéntanos sobre tu negocio..."
              placeholderTextColor={COLORS.textMuted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#f2f2f3" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar gratis</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
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
  formBox: {
    paddingHorizontal: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 4,
    fontSize: 13.5,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
  },
  selectBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 4,
    justifyContent: "center",
  },
  selectValue: {
    fontSize: 13.5,
    color: COLORS.text,
  },
  selectPlaceholder: {
    color: COLORS.textMuted,
  },
  categoryList: {
    marginTop: 10,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.accent,
  },
  categoryOptionText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: "500",
  },
  categoryOptionTextActive: {
    color: "#f2f2f3",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.accent,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.text,
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
    backgroundColor: "#f2f2f3",
  },
  submitButton: {
    paddingVertical: 14,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f2f2f3",
  },
  successBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
