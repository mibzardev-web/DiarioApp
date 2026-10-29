import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";

import { saveDiary } from "../storage/diaries";
import { exportDiaryPdf } from "../utils/diaryPdf";

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const fechaHoy = () => {
  const d = new Date();
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
};

const FIELDS = [
  { key: "fecha", label: "Fecha" },
  { key: "campoFormativo", label: "Campo formativo" },
  { key: "pda", label: "PDA", multiline: true },
  {
    key: "descripcion",
    label: "Descripción de la mañana de trabajo",
    multiline: true,
  },
  { key: "alumnos", label: "Alumnos", multiline: true },
  {
    key: "analisis",
    label: "Análisis y descripción de la mañana de trabajo",
    multiline: true,
    tall: true,
  },
  { key: "autoevaluacion", label: "Autoevaluación", multiline: true },
  {
    key: "registros",
    label: "Registros importantes del día",
    multiline: true,
  },
];

const CreateDiaryScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    fecha: fechaHoy(),
    campoFormativo: "",
    pda: "",
    descripcion: "",
    alumnos: "",
    analisis: "",
    autoevaluacion: "",
    registros: "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (withPdf) => {
    setSaving(true);
    try {
      const diary = await saveDiary(form);
      if (withPdf) {
        try {
          await exportDiaryPdf(diary);
        } catch (e) {
          Alert.alert("Diario guardado", "No se pudo generar el PDF.");
        }
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el diario.");
    } finally {
      setSaving(false);
    }
  };

  const onPressSave = () => {
    if (!form.fecha.trim()) {
      Alert.alert("Falta la fecha", "Escribe la fecha del diario.");
      return;
    }
    Alert.alert("Guardar diario", "¿Cómo quieres guardarlo?", [
      { text: "Guardar", onPress: () => save(false) },
      { text: "Guardar y descargar PDF", onPress: () => save(true) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {FIELDS.map((f) => (
          <View key={f.key} style={styles.group}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={[
                styles.input,
                f.multiline && styles.multiline,
                f.tall && styles.tall,
              ]}
              value={form[f.key]}
              onChangeText={(t) => setField(f.key, t)}
              multiline={f.multiline}
              textAlignVertical={f.multiline ? "top" : "center"}
              placeholder={f.label}
              placeholderTextColor="#94A3B8"
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={onPressSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFF" },
  container: { padding: 16, paddingBottom: 40 },
  group: { marginBottom: 14 },
  label: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#001D3D",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#45556C",
  },
  multiline: { minHeight: 90 },
  tall: { minHeight: 200 },
  button: {
    backgroundColor: "#2253DF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
});

export default CreateDiaryScreen;
