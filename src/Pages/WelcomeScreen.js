import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import { useProfileStore } from "../store/profile";

// Se muestra la primera vez que se abre la app, para pedir el nombre
const WelcomeScreen = () => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const setName = useProfileStore((s) => s.setName);
  const [value, setValue] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.logo}>
        <MaterialCommunityIcons name="notebook-edit-outline" size={56} color="#FFF" />
      </View>
      <Text style={styles.title}>Diario de Campo</Text>
      <Text style={styles.subtitle}>
        Te damos la bienvenida. Aquí vas a registrar tus mañanas de trabajo, tus
        alumnos y todo lo importante del día.
      </Text>

      <Text style={styles.label}>¿Cómo te llamas?</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Tu nombre"
        placeholderTextColor={Palette.muted}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={() => value.trim() && setName(value)}
      />

      <TouchableOpacity
        style={[styles.button, !value.trim() && styles.buttonDisabled]}
        disabled={!value.trim()}
        onPress={() => setName(value)}
      >
        <Text style={styles.buttonText}>Empezar</Text>
        <MaterialCommunityIcons name="arrow-right" size={22} color="#FFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Palette.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 28,
    },
    logo: {
      backgroundColor: Palette.primary,
      width: 110,
      height: 110,
      borderRadius: 55,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 26,
      color: Palette.dark,
    },
    subtitle: {
      fontSize: 14,
      color: Palette.subText,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 28,
    },
    label: {
      alignSelf: "flex-start",
      fontFamily: "Poppins_600SemiBold",
      fontSize: 14,
      color: Palette.dark,
      marginBottom: 6,
    },
    input: {
      alignSelf: "stretch",
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderColor: Palette.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: Palette.text,
    },
    button: {
      alignSelf: "stretch",
      backgroundColor: Palette.primary,
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 16,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: {
      color: "#FFF",
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
    },
  });

export default WelcomeScreen;
