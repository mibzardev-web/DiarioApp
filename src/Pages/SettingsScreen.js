import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import PinPad from "../components/PinPad";
import { PALETTES } from "../constants/Colors";
import { useTheme, useThemeStore } from "../store/theme";
import { useProfileStore } from "../store/profile";
import {
  hasPin,
  setPin as savePin,
  checkPin,
  removePin,
  isBiometricEnabled,
  setBiometricEnabled,
  biometricAvailable,
  authenticateBiometric,
} from "../storage/security";
import { exportBackup, pickBackup, restoreBackup } from "../storage/backup";
import appJson from "../../app.json";

// Pasos de cada flujo del PIN
const FLOWS = {
  create: ["new", "confirm"],
  change: ["current", "new", "confirm"],
  disable: ["current"],
};
const STEP_TITLES = {
  current: "Escribe tu PIN actual",
  new: "Elige un PIN nuevo",
  confirm: "Confirma tu PIN",
};

const SettingsScreen = () => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const paletteName = useThemeStore((s) => s.name);
  const setPalette = useThemeStore((s) => s.setPalette);
  const profileName = useProfileStore((s) => s.name);
  const setProfileName = useProfileStore((s) => s.setName);

  const [nameDraft, setNameDraft] = useState(profileName);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  // Flujo del PIN: { flow, stepIndex, firstPin }
  const [pinFlow, setPinFlow] = useState(null);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState("");

  const loadSecurity = useCallback(async () => {
    setPinEnabled(await hasPin());
    setBioEnabled(await isBiometricEnabled());
    setBioAvailable(await biometricAvailable().catch(() => false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSecurity();
    }, [loadSecurity]),
  );

  const closePinFlow = () => {
    setPinFlow(null);
    setPinValue("");
    setPinError("");
  };

  const startFlow = (flow) => {
    setPinFlow({ flow, stepIndex: 0, firstPin: "" });
    setPinValue("");
    setPinError("");
  };

  const onPinComplete = async (value) => {
    const { flow, stepIndex, firstPin } = pinFlow;
    const step = FLOWS[flow][stepIndex];
    const isLast = stepIndex === FLOWS[flow].length - 1;

    const fail = (msg) => {
      setPinError(msg);
      setTimeout(() => setPinValue(""), 400);
    };

    if (step === "current") {
      if (!(await checkPin(value))) return fail("PIN incorrecto");
      if (flow === "disable") {
        await removePin();
        closePinFlow();
        loadSecurity();
        return;
      }
    } else if (step === "confirm") {
      if (value !== firstPin) {
        setPinFlow({ flow, stepIndex: stepIndex - 1, firstPin: "" });
        return fail("No coinciden, vuelve a elegir tu PIN");
      }
      await savePin(value);
      closePinFlow();
      await loadSecurity();
      Alert.alert(
        "PIN guardado",
        "Si lo olvidas no se puede recuperar. Te recomendamos hacer un respaldo de tus diarios.",
      );
      return;
    }

    // "new" (o "current" correcto en el flujo de cambio): pasa al siguiente paso
    setPinFlow({
      flow,
      stepIndex: isLast ? stepIndex : stepIndex + 1,
      firstPin: step === "new" ? value : firstPin,
    });
    setPinValue("");
    setPinError("");
  };

  const togglePin = (on) => (on ? startFlow("create") : startFlow("disable"));

  const toggleBiometric = async (on) => {
    if (on) {
      try {
        if (!(await authenticateBiometric("Confirma para activar la huella"))) return;
      } catch (e) {
        return;
      }
    }
    await setBiometricEnabled(on);
    setBioEnabled(on);
  };

  const saveName = async () => {
    if (!nameDraft.trim()) return;
    await setProfileName(nameDraft);
    Alert.alert("Listo", "Guardamos tu nombre.");
  };

  const onExport = async () => {
    setBusy(true);
    try {
      await exportBackup();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear el respaldo.");
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      const data = await pickBackup();
      if (!data) return;

      const doRestore = async (mode) => {
        const res = await restoreBackup(data, mode);
        Alert.alert(
          "Respaldo restaurado",
          `Ahora tienes ${res.diarios} diarios y ${res.alumnos} alumnos.`,
        );
      };

      Alert.alert(
        "Restaurar respaldo",
        `El archivo trae ${data.diarios.length} diarios y ${data.alumnos.length} alumnos.`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Combinar con lo actual", onPress: () => doRestore("merge") },
          {
            text: "Reemplazar todo",
            style: "destructive",
            onPress: () =>
              Alert.alert(
                "¿Reemplazar todo?",
                "Se borrarán los diarios y alumnos que tienes ahora y quedará solo lo del respaldo.",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Reemplazar", style: "destructive", onPress: () => doRestore("replace") },
                ],
              ),
          },
        ],
      );
    } catch (e) {
      Alert.alert("Error", "Ese archivo no es un respaldo válido de Diario de Campo.");
    } finally {
      setBusy(false);
    }
  };

  const step = pinFlow ? FLOWS[pinFlow.flow][pinFlow.stepIndex] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Perfil */}
      <Text style={styles.sectionTitle}>Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Tu nombre</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={styles.input}
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="Tu nombre"
            placeholderTextColor={Palette.muted}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[styles.smallBtn, (!nameDraft.trim() || nameDraft.trim() === profileName) && styles.disabled]}
            disabled={!nameDraft.trim() || nameDraft.trim() === profileName}
            onPress={saveName}
          >
            <MaterialCommunityIcons name="check" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Seguridad */}
      <Text style={styles.sectionTitle}>Seguridad</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="lock-outline" size={24} color={Palette.primary} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Bloqueo con PIN</Text>
            <Text style={styles.rowSub}>Pide un PIN de 4 dígitos al abrir la app</Text>
          </View>
          <Switch
            value={pinEnabled}
            onValueChange={togglePin}
            trackColor={{ true: Palette.selected, false: Palette.border }}
            thumbColor={pinEnabled ? Palette.primary : "#FFF"}
          />
        </View>

        {pinEnabled && (
          <>
            <TouchableOpacity style={[styles.row, styles.rowTop]} onPress={() => startFlow("change")}>
              <MaterialCommunityIcons name="form-textbox-password" size={24} color={Palette.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Cambiar PIN</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
            </TouchableOpacity>

            {bioAvailable && (
              <View style={[styles.row, styles.rowTop]}>
                <MaterialCommunityIcons name="fingerprint" size={24} color={Palette.primary} />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>Huella o rostro</Text>
                  <Text style={styles.rowSub}>Desbloquear sin escribir el PIN</Text>
                </View>
                <Switch
                  value={bioEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ true: Palette.selected, false: Palette.border }}
                  thumbColor={bioEnabled ? Palette.primary : "#FFF"}
                />
              </View>
            )}
          </>
        )}
      </View>

      {/* Apariencia */}
      <Text style={styles.sectionTitle}>Colores</Text>
      <View style={[styles.card, styles.swatches]}>
        {Object.entries(PALETTES).map(([key, p]) => {
          const active = key === paletteName;
          return (
            <TouchableOpacity key={key} style={styles.swatchWrap} onPress={() => setPalette(key)}>
              <View style={[styles.swatch, { backgroundColor: p.primary }, active && styles.swatchActive]}>
                <View style={[styles.swatchInner, { backgroundColor: p.tint }]} />
                {active && (
                  <MaterialCommunityIcons name="check" size={20} color="#FFF" style={styles.swatchCheck} />
                )}
              </View>
              <Text style={[styles.swatchLabel, active && styles.swatchLabelActive]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Respaldo */}
      <Text style={styles.sectionTitle}>Respaldo</Text>
      <View style={styles.card}>
        <Text style={styles.rowSub}>
          Tus diarios solo están en este teléfono. Haz un respaldo y guárdalo en
          Drive o mándalo por WhatsApp para no perderlos.
        </Text>
        <TouchableOpacity style={[styles.bigBtn, busy && styles.disabled]} onPress={onExport} disabled={busy}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={22} color="#FFF" />
          <Text style={styles.bigBtnText}>Exportar respaldo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bigBtn, styles.outlineBtn, busy && styles.disabled]} onPress={onRestore} disabled={busy}>
          <MaterialCommunityIcons name="cloud-download-outline" size={22} color={Palette.primary} />
          <Text style={[styles.bigBtnText, { color: Palette.primary }]}>Restaurar respaldo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Diario de Campo · versión {appJson.expo.version}</Text>

      {/* Modal del PIN */}
      <Modal visible={!!pinFlow} animationType="slide" onRequestClose={closePinFlow}>
        <View style={styles.pinScreen}>
          <TouchableOpacity style={styles.pinClose} onPress={closePinFlow}>
            <MaterialCommunityIcons name="close" size={28} color={Palette.dark} />
          </TouchableOpacity>
          <MaterialCommunityIcons name="lock" size={44} color={Palette.primary} />
          <Text style={styles.pinTitle}>{step ? STEP_TITLES[step] : ""}</Text>
          {pinFlow?.flow === "disable" && (
            <Text style={styles.pinHint}>Para quitar el bloqueo, confirma tu PIN.</Text>
          )}
          <PinPad
            pin={pinValue}
            onChange={(v) => {
              setPinValue(v);
              setPinError("");
            }}
            onComplete={onPinComplete}
            error={pinError}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.background },
    content: { padding: 16, paddingBottom: 40 },
    sectionTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 15,
      color: Palette.dark,
      marginTop: 12,
      marginBottom: 8,
    },
    card: {
      backgroundColor: "#FFF",
      borderRadius: 16,
      padding: 14,
      elevation: 2,
      gap: 10,
    },
    label: { fontSize: 13, color: Palette.subText },
    nameRow: { flexDirection: "row", gap: 10 },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: Palette.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: Palette.text,
    },
    smallBtn: {
      backgroundColor: Palette.primary,
      width: 46,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    disabled: { opacity: 0.5 },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    rowTop: {
      borderTopWidth: 1,
      borderTopColor: Palette.tint,
      paddingTop: 10,
    },
    rowText: { flex: 1 },
    rowTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 14,
      color: Palette.dark,
    },
    rowSub: { fontSize: 12, color: Palette.subText },
    swatches: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    swatchWrap: { alignItems: "center", width: 58 },
    swatch: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: "transparent",
    },
    swatchActive: { borderColor: Palette.dark },
    swatchInner: {
      position: "absolute",
      right: 2,
      bottom: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    swatchCheck: { position: "absolute" },
    swatchLabel: { fontSize: 11, color: Palette.subText, marginTop: 4 },
    swatchLabelActive: { color: Palette.dark, fontFamily: "Poppins_600SemiBold" },
    bigBtn: {
      backgroundColor: Palette.primary,
      borderRadius: 14,
      paddingVertical: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    outlineBtn: {
      backgroundColor: "#FFF",
      borderWidth: 1.5,
      borderColor: Palette.primary,
    },
    bigBtnText: { color: "#FFF", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    version: {
      textAlign: "center",
      color: Palette.muted,
      fontSize: 12,
      marginTop: 24,
    },
    pinScreen: {
      flex: 1,
      backgroundColor: Palette.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    pinClose: { position: "absolute", top: 40, right: 20, padding: 8 },
    pinTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 20,
      color: Palette.dark,
      marginTop: 8,
    },
    pinHint: { fontSize: 13, color: Palette.subText, marginTop: 2 },
  });

export default SettingsScreen;
