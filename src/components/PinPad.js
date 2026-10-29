import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import { PIN_LENGTH } from "../storage/security";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "bio", "0", "del"];

// Teclado numérico con puntos para el PIN. `onChange` recibe el PIN actual y
// `onComplete` se llama al llegar a PIN_LENGTH dígitos.
const PinPad = ({ pin, onChange, onComplete, onBiometric, error }) => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const press = (key) => {
    if (key === "del") return onChange(pin.slice(0, -1));
    if (key === "bio") return onBiometric?.();
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    onChange(next);
    if (next.length === PIN_LENGTH) onComplete?.(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length && styles.dotFilled,
              !!error && styles.dotError,
            ]}
          />
        ))}
      </View>
      <Text style={styles.error}>{error || " "}</Text>

      <View style={styles.grid}>
        {KEYS.map((k) => {
          if (k === "bio" && !onBiometric) return <View key={k} style={styles.key} />;
          return (
            <TouchableOpacity
              key={k}
              style={[styles.key, k !== "bio" && k !== "del" && styles.keyNumber]}
              activeOpacity={0.6}
              onPress={() => press(k)}
            >
              {k === "del" ? (
                <MaterialCommunityIcons name="backspace-outline" size={26} color={Palette.dark} />
              ) : k === "bio" ? (
                <MaterialCommunityIcons name="fingerprint" size={32} color={Palette.primary} />
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    wrap: { alignItems: "center" },
    dots: { flexDirection: "row", gap: 16, marginVertical: 12 },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: Palette.primary,
    },
    dotFilled: { backgroundColor: Palette.primary },
    dotError: { borderColor: Palette.danger, backgroundColor: Palette.dangerBg },
    error: { color: Palette.danger, fontSize: 13, height: 20, marginBottom: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", width: 270, gap: 15 },
    key: {
      width: 80,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    keyNumber: { backgroundColor: "#FFF", elevation: 2 },
    keyText: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 26,
      color: Palette.dark,
    },
  });

export default PinPad;
