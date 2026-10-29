import { View, Text, StyleSheet, AppState } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import PinPad from "./PinPad";
import { useTheme } from "../store/theme";
import {
  hasPin,
  checkPin,
  isBiometricEnabled,
  authenticateBiometric,
  PIN_LENGTH,
} from "../storage/security";

// Segundos que la app puede estar en segundo plano antes de volver a pedir el PIN.
// Hay un margen para que compartir un PDF o elegir un archivo no la bloquee.
const GRACE_SECONDS = 30;

// Pide el PIN (o la huella) al abrir la app y al volver después de un rato.
const LockGate = ({ children }) => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const [checking, setChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const leftAt = useRef(null);

  const tryBiometric = useCallback(async () => {
    try {
      if (await authenticateBiometric()) setLocked(false);
    } catch (e) {
      // si falla se sigue con el PIN
    }
  }, []);

  const lockIfNeeded = useCallback(async () => {
    if (!(await hasPin())) return setLocked(false);
    const bio = await isBiometricEnabled();
    setUseBiometric(bio);
    setPin("");
    setError("");
    setLocked(true);
    if (bio) tryBiometric();
  }, [tryBiometric]);

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

  // Mientras se revisa si hay PIN no se muestra nada para no dejar ver los diarios un instante
  if (checking) return <View style={styles.container} />;
  if (!locked) return children;

  return (
    <View style={styles.container}>
      <View style={styles.lockIcon}>
        <MaterialCommunityIcons name="lock" size={40} color="#FFF" />
      </View>
      <Text style={styles.title}>Diario de Campo</Text>
      <Text style={styles.subtitle}>Escribe tu PIN de {PIN_LENGTH} dígitos</Text>
      <PinPad
        pin={pin}
        onChange={(v) => {
          setPin(v);
          setError("");
        }}
        onComplete={onComplete}
        onBiometric={useBiometric ? tryBiometric : undefined}
        error={error}
      />
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
  });

export default LockGate;
