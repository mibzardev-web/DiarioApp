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
  getMethod,
  setMethod,
  setPin as savePin,
  checkPin,
  removePin,
  isBiometricEnabled,
  setBiometricEnabled,
  getCapabilities,
  authenticateWith,
} from "../storage/security";
import { exportBackup, pickBackup, restoreBackup } from "../storage/backup";
import appJson from "../../app.json";

// Pasos de cada flujo del PIN. "verify" solo comprueba el PIN actual y luego ejecuta `then`.
const FLOWS = {
  create: ["new", "confirm"],
  change: ["current", "new", "confirm"],
  verify: ["current"],
};
const STEP_TITLES = {
  current: "Escribe tu PIN actual",
  new: "Elige un PIN nuevo",
  confirm: "Confirma tu PIN",
};

const NO_CAPS = {
  biometric: false,
  biometricLabel: "Huella o rostro",
  biometricHardware: false,
  device: false,
};

const SettingsScreen = () => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const paletteName = useThemeStore((s) => s.name);
  const setPalette = useThemeStore((s) => s.setPalette);
  const profileName = useProfileStore((s) => s.name);
  const setProfileName = useProfileStore((s) => s.setName);

  const [nameDraft, setNameDraft] = useState(profileName);
  const [method, setMethodState] = useState("none"); // none | pin | biometric | device
  const [bioShortcut, setBioShortcut] = useState(false); // huella como atajo del PIN
  const [caps, setCaps] = useState(NO_CAPS);
  const [busy, setBusy] = useState(false);

  // Flujo del PIN: { flow, stepIndex, firstPin, then }
  const [pinFlow, setPinFlow] = useState(null);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState("");

  const loadSecurity = useCallback(async () => {
    setMethodState(await getMethod());
    setBioShortcut(await isBiometricEnabled());
    setCaps(await getCapabilities());
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

  const startFlow = (flow, then) => {
    setPinFlow({ flow, stepIndex: 0, firstPin: "", then });
    setPinValue("");
    setPinError("");
  };

  // Deja guardado el método elegido (y quita el PIN de la app si ya no se usa)
  const applyMethod = async (next) => {
    if (next !== "pin") await removePin();
    await setMethod(next);
    await loadSecurity();
  };

  const onPinComplete = async (value) => {
    const { flow, stepIndex, firstPin, then } = pinFlow;
    const step = FLOWS[flow][stepIndex];
    const isLast = stepIndex === FLOWS[flow].length - 1;

    const fail = (msg) => {
      setPinError(msg);
      setTimeout(() => setPinValue(""), 400);
    };

    if (step === "current") {
      if (!(await checkPin(value))) return fail("PIN incorrecto");
      if (flow === "verify") {
        closePinFlow();
        await then?.();
        return;
      }
    } else if (step === "confirm") {
      if (value !== firstPin) {
        setPinFlow({ flow, stepIndex: stepIndex - 1, firstPin: "" });
        return fail("No coinciden, vuelve a elegir tu PIN");
      }
      await savePin(value);
      await setMethod("pin");
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

  // Elegir cómo se bloquea la app. Para salir de un método con protección primero se
  // confirma la identidad, y para activar huella/código del teléfono se comprueba que funcione.
  const selectMethod = async (next) => {
    if (next === method) return;

    const proceed = async () => {
      if (next === "pin") return startFlow("create");
      if (next === "none") return applyMethod("none");
      const ok = await authenticateWith(next, "Confirma para activar este bloqueo");
      if (ok) await applyMethod(next);
    };

    if (method === "none") return proceed();
    if (method === "pin") return startFlow("verify", proceed);
    if (await authenticateWith(method, "Confirma tu identidad")) await proceed();
  };

  const toggleBioShortcut = async (on) => {
    if (on && !(await authenticateWith("biometric", "Confirma para activar este atajo"))) {
      return;
    }
    await setBiometricEnabled(on);
    setBioShortcut(on);
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
      <Text style={styles.sectionTitle}>Bloqueo de la app</Text>
      <View style={styles.card}>
        <Text style={styles.rowSub}>
          Elige cómo proteger tus diarios. Las opciones en gris no están
          disponibles en este teléfono.
        </Text>

        {[
          {
            key: "none",
            icon: "lock-open-variant-outline",
            title: "Sin bloqueo",
            sub: "Cualquiera con tu teléfono desbloqueado puede abrir la app",
            enabled: true,
          },
          {
            key: "pin",
            icon: "dialpad",
            title: "PIN de la app",
            sub: "Un PIN de 4 dígitos solo para Diario de Campo",
            enabled: true,
          },
          {
            key: "biometric",
            icon: "fingerprint",
            title: caps.biometricLabel,
            sub: caps.biometric
              ? "Desbloquea con la huella o el rostro de tu teléfono"
              : caps.biometricHardware
                ? "Registra una huella o rostro en los ajustes del teléfono para usarlo"
                : "Este teléfono no tiene lector de huella ni de rostro",
            enabled: caps.biometric,
          },
          {
            key: "device",
            icon: "cellphone-lock",
            title: "PIN o patrón del teléfono",
            sub: caps.device
              ? "Desbloquea con el mismo código con que abres tu teléfono"
              : "Tu teléfono no tiene bloqueo de pantalla. Actívalo en sus ajustes",
            enabled: caps.device,
          },
        ].map((o) => {
          const active = method === o.key;
          return (
            <TouchableOpacity
              key={o.key}
              style={[styles.option, active && styles.optionActive, !o.enabled && styles.optionOff]}
              disabled={!o.enabled}
              activeOpacity={0.8}
              onPress={() => selectMethod(o.key)}
            >
              <MaterialCommunityIcons
                name={o.icon}
                size={26}
                color={active ? Palette.primary : Palette.muted}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{o.title}</Text>
                <Text style={styles.rowSub}>{o.sub}</Text>
              </View>
              <MaterialCommunityIcons
                name={active ? "radiobox-marked" : "radiobox-blank"}
                size={24}
                color={active ? Palette.primary : Palette.border}
              />
            </TouchableOpacity>
          );
        })}

        {method === "pin" && (
          <>
            <TouchableOpacity style={[styles.row, styles.rowTop]} onPress={() => startFlow("change")}>
              <MaterialCommunityIcons name="form-textbox-password" size={24} color={Palette.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Cambiar PIN</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Palette.muted} />
            </TouchableOpacity>

            {caps.biometric && (
              <View style={[styles.row, styles.rowTop]}>
                <MaterialCommunityIcons name="fingerprint" size={24} color={Palette.primary} />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>También con {caps.biometricLabel.toLowerCase()}</Text>
                  <Text style={styles.rowSub}>Entrar sin escribir el PIN</Text>
                </View>
                <Switch
                  value={bioShortcut}
                  onValueChange={toggleBioShortcut}
                  trackColor={{ true: Palette.selected, false: Palette.border }}
                  thumbColor={bioShortcut ? Palette.primary : "#FFF"}
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
          {pinFlow?.flow === "verify" && (
            <Text style={styles.pinHint}>Confirma tu PIN para continuar.</Text>
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
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1.5,
      borderColor: Palette.border,
      borderRadius: 14,
      padding: 12,
    },
    optionActive: { borderColor: Palette.primary, backgroundColor: Palette.background },
    optionOff: { opacity: 0.5 },
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
