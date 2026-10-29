import {
  View,
  Text,
  StyleSheet,
  AppState,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import PinPad from "./PinPad";
import { useTheme } from "../store/theme";
import {
  getMethod,
  checkPin,
  isBiometricEnabled,
  getCapabilities,
  authenticateWith,
  PIN_LENGTH,
} from "../storage/security";

// Segundos que la app puede estar en segundo plano antes de volver a bloquearse.
// Hay un margen para que compartir un PDF o elegir un archivo no la bloquee.
const GRACE_SECONDS = 30;

// Bloquea la app al abrirla y al volver después de un rato, según el método elegido
// en Ajustes: PIN de la app, huella/rostro o el código del teléfono.
const LockGate = ({ children }) => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const [checking, setChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const [mode, setMode] = useState("pin"); // cómo se desbloquea ahora: pin | biometric | device
  const [pinBiometric, setPinBiometric] = useState(false); // atajo de huella dentro del PIN
  const [caps, setCaps] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const leftAt = useRef(null);

  const tryUnlock = useCallback(async (method) => {
    if (await authenticateWith(method)) setLocked(false);
  }, []);

  const lockIfNeeded = useCallback(async () => {
    const method = await getMethod();
    if (method === "none") return setLocked(false);

    setPin("");
    setError("");

    if (method === "pin") {
      const bio = await isBiometricEnabled();
      setMode("pin");
      setPinBiometric(bio);
      setLocked(true);
      if (bio) tryUnlock("biometric");
      return;
    }

    const c = await getCapabilities();
    setCaps(c);

    // Si ya no hay huella registrada, se usa el código del teléfono
    let effective = method;
    if (effective === "biometric" && !c.biometric) effective = "device";
    // Si el teléfono ya no tiene ningún bloqueo no hay con qué pedir la identidad
    if (effective === "device" && !c.device && !c.biometric) return setLocked(false);

    setMode(effective);
    setLocked(true);
    tryUnlock(effective);
  }, [tryUnlock]);

  useEffect(() => {
    lockIfNeeded().finally(() => setChecking(false));
  }, [lockIfNeeded]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        leftAt.current = Date.now();
      } else if (state === "active" && leftAt.current) {
        const away = (Date.now() - leftAt.current) / 1000;
        leftAt.current = null;
        if (away > GRACE_SECONDS) lockIfNeeded();
      }
    });
    return () => sub.remove();
  }, [lockIfNeeded]);

  const onComplete = async (value) => {
    if (await checkPin(value)) {
      setLocked(false);
      setPin("");
      setError("");
    } else {
      setError("PIN incorrecto");
      setTimeout(() => setPin(""), 400);
    }
  };

  // Mientras se revisa el bloqueo no se muestra nada para no dejar ver los diarios un instante
  if (checking) return <View style={styles.container} />;
  if (!locked) return children;

  const header = (icon, subtitle) => (
    <>
      <View style={styles.lockIcon}>
        <MaterialCommunityIcons name={icon} size={40} color="#FFF" />
      </View>
      <Text style={styles.title}>Diario de Campo</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );

  if (mode === "pin") {
    return (
      <View style={styles.container}>
        {header("lock", `Escribe tu PIN de ${PIN_LENGTH} dígitos`)}
        <PinPad
          pin={pin}
          onChange={(v) => {
            setPin(v);
            setError("");
          }}
          onComplete={onComplete}
          onBiometric={pinBiometric ? () => tryUnlock("biometric") : undefined}
          error={error}
        />
      </View>
    );
  }

  const isBio = mode === "biometric";
  return (
    <View style={styles.container}>
      {header(
        isBio ? "fingerprint" : "cellphone-lock",
        isBio
          ? `Usa tu ${(caps?.biometricLabel || "huella").toLowerCase()} para entrar`
          : "Usa el código de tu teléfono para entrar",
      )}
      <TouchableOpacity style={styles.button} onPress={() => tryUnlock(mode)}>
        <MaterialCommunityIcons
          name={isBio ? "fingerprint" : "lock-open-outline"}
          size={24}
          color="#FFF"
        />
        <Text style={styles.buttonText}>Desbloquear</Text>
      </TouchableOpacity>
      {isBio && caps?.device && (
        <TouchableOpacity style={styles.link} onPress={() => tryUnlock("device")}>
          <Text style={styles.linkText}>Usar el código del teléfono</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Palette.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    lockIcon: {
      backgroundColor: Palette.primary,
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    title: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 22,
      color: Palette.dark,
    },
    subtitle: { fontSize: 14, color: Palette.subText, marginTop: 4 },
    button: {
      backgroundColor: Palette.primary,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 32,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 28,
    },
    buttonText: {
      color: "#FFF",
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
    },
    link: { marginTop: 18, padding: 8 },
    linkText: { color: Palette.primary, fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  });

export default LockGate;
