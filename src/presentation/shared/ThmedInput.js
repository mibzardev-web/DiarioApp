import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import useThemedColor from "../../hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

const ThemedInput = ({
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  isPassword = false,
  style,
  ...props
}) => {
  const textColor = useThemedColor("text");
  const backgroundColor = "#F5F5F5"; // fondo fijo solicitado
  const borderColor = useThemedColor("subText");
  const placeholderColor = useThemedColor("subText");
  const [show, setShow] = useState(false);

  // Si es campo de contraseña, envolver en View con icono
  if (isPassword) {
    return (
      <View
        style={[
          styles.passwordWrapper,
          { backgroundColor, borderColor },
          style,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          secureTextEntry={!show}
          style={[
            {
              flex: 1,
              color: textColor,
              padding: 12,
              fontFamily: "Poppins_400Regular",
              fontSize: 16,
            },
          ]}
          {...props}
        />
        <TouchableOpacity
          onPress={() => setShow((prev) => !prev)}
          style={styles.iconButton}
        >
          <Ionicons name={show ? "eye-off" : "eye"} size={20} color="#A1A1A1" />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      style={[
        styles.input,
        { color: textColor, backgroundColor, borderColor },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedInput;

const styles = StyleSheet.create({
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    fontFamily: "Poppins_400Regular",
  },
  passwordWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    borderRadius: 8,
    padding: 3,
  },
  iconButton: {
    padding: 8,
  },
});
