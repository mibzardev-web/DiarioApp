import { View, Text, StyleSheet } from "react-native";
import React from "react";

import { Palette } from "../constants/Colors";

const SettingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setting</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background, padding: 16 },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: Palette.dark,
  },
});

export default SettingScreen;
