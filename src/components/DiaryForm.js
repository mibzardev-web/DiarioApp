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
import React, { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Palette } from "../constants/Colors";
import useGlobalState from "../store/auth";
import { exportDiaryPdf } from "../utils/diaryPdf";

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

export const EMPTY_DIARY = {
  fecha: "",
  campoFormativo: "",
  pda: "",
  descripcion: "",
  alumnos: "",
  analisis: "",
  autoevaluacion: "",
  registros: "",
};

// Formulario compartido por crear y editar un diario.
// `onSave(form)` guarda y devuelve el diario resultante (para poder generar el PDF).
const DiaryForm = ({ initialValues, onSave, submitLabel = "Guardar" }) => {
  const navigation = useNavigation();
  const [form, setForm] = useState({ ...EMPTY_DIARY, ...initialValues });
  const [saving, setSaving] = useState(false);
  const setShowTabBar = useGlobalState((s) => s.setShowTabBar);

  // Oculta los tabs mientras esta pantalla está abierta
  useFocusEffect(
    useCallback(() => {
      setShowTabBar(false);
      return () => setShowTabBar(true);
    }, [setShowTabBar]),
  );

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (withPdf) => {
    setSaving(true);
    try {
      const diary = await onSave(form);
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
      { text: submitLabel, onPress: () => save(false) },
      { text: `${submitLabel} y descargar PDF`, onPress: () => save(true) },
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
              placeholderTextColor={Palette.muted}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={onPressSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.background },
  container: { padding: 16, paddingBottom: 40 },
  group: { marginBottom: 14 },
  label: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: Palette.dark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Palette.text,
  },
  multiline: { minHeight: 90 },
  tall: { minHeight: 200 },
  button: {
    backgroundColor: Palette.primary,
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

export default DiaryForm;
