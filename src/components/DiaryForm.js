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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import useGlobalState from "../store/auth";
import { exportDiaryPdf } from "../utils/diaryPdf";
import { getStudents } from "../storage/students";

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

// ¿Hay texto escrito distinto al inicial? (la fecha sola no cuenta como borrador)
const hasChanges = (form, initial) =>
  FIELDS.some((f) => f.key !== "fecha" && form[f.key] !== initial[f.key]);

const insertName = (text, name) =>
  `${text}${text && !/\s$/.test(text) ? " " : ""}${name} `;

// Formulario compartido por crear y editar un diario.
// - `onSave(form)` guarda y devuelve el diario resultante (para poder generar el PDF).
// - `draftKey` guarda un borrador automático mientras se escribe.
const DiaryForm = ({ initialValues, onSave, submitLabel = "Guardar", draftKey }) => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const navigation = useNavigation();

  const initial = useRef({ ...EMPTY_DIARY, ...initialValues }).current;
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [focusedKey, setFocusedKey] = useState("alumnos");
  const saved = useRef(false);
  const setShowTabBar = useGlobalState((s) => s.setShowTabBar);

  // Oculta los tabs mientras esta pantalla está abierta
  useFocusEffect(
    useCallback(() => {
      setShowTabBar(false);
      return () => setShowTabBar(true);
    }, [setShowTabBar]),
  );

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  // Al abrir, ofrece recuperar un borrador que quedó sin guardar
  useEffect(() => {
    if (!draftKey) return;
    AsyncStorage.getItem(draftKey).then((raw) => {
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!hasChanges(draft, initial)) return;
      Alert.alert(
        "Borrador encontrado",
        "Tenías un diario sin guardar. ¿Quieres recuperarlo?",
        [
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => AsyncStorage.removeItem(draftKey),
          },
          { text: "Recuperar", onPress: () => setForm({ ...initial, ...draft }) },
        ],
      );
    });
  }, [draftKey, initial]);

  // Guarda el borrador poco después de dejar de escribir
  useEffect(() => {
    if (!draftKey || saved.current || !hasChanges(form, initial)) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(draftKey, JSON.stringify(form));
    }, 400);
    return () => clearTimeout(id);
  }, [form, draftKey, initial]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (withPdf) => {
    setSaving(true);
    try {
      const diary = await onSave(form);
      saved.current = true;
      if (draftKey) await AsyncStorage.removeItem(draftKey);
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

  const targetField = FIELDS.find((f) => f.key === focusedKey);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {students.length > 0 && (
        <View style={styles.studentsBar}>
          <View style={styles.studentsHint}>
            <MaterialCommunityIcons name="account-group" size={16} color={Palette.subText} />
            <Text style={styles.studentsHintText} numberOfLines={1}>
              Toca un nombre para insertarlo en: {targetField?.label}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={styles.chips}
          >
            {students.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.chip}
                onPress={() => setField(focusedKey, insertName(form[focusedKey], s.nombre))}
              >
                <Text style={styles.chipText}>{s.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
                focusedKey === f.key && students.length > 0 && styles.inputFocused,
              ]}
              value={form[f.key]}
              onChangeText={(t) => setField(f.key, t)}
              onFocus={() => setFocusedKey(f.key)}
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

const makeStyles = (Palette) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: Palette.background },
    container: { padding: 16, paddingBottom: 40 },
    studentsBar: {
      backgroundColor: "#FFF",
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: Palette.tint,
      elevation: 2,
    },
    studentsHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      marginBottom: 6,
    },
    studentsHintText: { flex: 1, fontSize: 12, color: Palette.subText },
    chips: { paddingHorizontal: 12, gap: 8 },
    chip: {
      backgroundColor: Palette.tint,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    chipText: { fontSize: 13, color: Palette.dark, fontFamily: "Poppins_600SemiBold" },
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
      backgroundColor: "#FFF",
    },
    inputFocused: { borderColor: Palette.primary },
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
