import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Palette } from "../constants/Colors";
import { getDiaries, deleteDiary } from "../storage/diaries";
import { exportDiaryPdf } from "../utils/diaryPdf";

const HomeScreen = ({ navigation }) => {
  const [diaries, setDiaries] = useState([]);

  const loadDiaries = useCallback(async () => {
    setDiaries(await getDiaries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDiaries();
    }, [loadDiaries]),
  );

  const downloadPdf = (diary) =>
    exportDiaryPdf(diary).catch(() =>
      Alert.alert("Error", "No se pudo generar el PDF."),
    );

  const confirmDelete = (diary) => {
    Alert.alert("Eliminar diario", `¿Eliminar el diario del ${diary.fecha}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteDiary(diary.id);
          loadDiaries();
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Mi diario de campo</Text>
          <Text style={styles.heroSub}>
            Registra tu mañana de trabajo y descárgala en PDF.
          </Text>
        </View>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons
            name="notebook-edit-outline"
            size={34}
            color="#FFF"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("CreateDiaryScreen")}
      >
        <MaterialCommunityIcons name="plus-circle" size={24} color="#FFF" />
        <Text style={styles.buttonText}>Crear un nuevo diario</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="history" size={22} color={Palette.dark} />
        <Text style={styles.sectionTitle}>Historial de diarios</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{diaries.length}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={diaries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons
              name="book-open-page-variant-outline"
              size={56}
              color={Palette.border}
            />
            <Text style={styles.emptyTitle}>Aún no hay diarios</Text>
            <Text style={styles.empty}>
              Toca "Crear un nuevo diario" para escribir el primero.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="calendar-text"
                size={26}
                color={Palette.primary}
              />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardDate}>{item.fecha}</Text>
              {!!item.campoFormativo && (
                <View style={styles.row}>
                  <MaterialCommunityIcons
                    name="shape-outline"
                    size={14}
                    color={Palette.subText}
                  />
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {item.campoFormativo}
                  </Text>
                </View>
              )}
              {!!item.pda && (
                <View style={styles.row}>
                  <MaterialCommunityIcons
                    name="target"
                    size={14}
                    color={Palette.subText}
                  />
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {item.pda}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.pdfBtn]}
                onPress={() => downloadPdf(item)}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={22}
                  color={Palette.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => confirmDelete(item)}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color={Palette.danger}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  list: { padding: 16, paddingBottom: 30 },
  hero: {
    backgroundColor: Palette.dark,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  heroText: { flex: 1, paddingRight: 12 },
  heroTitle: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
  },
  heroSub: { color: Palette.border, fontSize: 13, marginTop: 4 },
  heroIcon: {
    backgroundColor: Palette.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: Palette.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: Palette.dark,
  },
  badge: {
    backgroundColor: Palette.tint,
    borderRadius: 12,
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: "center",
  },
  badgeText: { color: Palette.primary, fontWeight: "700", fontSize: 13 },
  emptyBox: { alignItems: "center", marginTop: 30, paddingHorizontal: 20 },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: Palette.text,
    marginTop: 8,
  },
  empty: { color: Palette.muted, textAlign: "center", marginTop: 4 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  cardIcon: {
    backgroundColor: Palette.tint,
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, marginHorizontal: 12 },
  cardDate: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: Palette.dark,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  cardSub: { flex: 1, fontSize: 12, color: Palette.subText },
  actions: { gap: 6 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pdfBtn: { backgroundColor: Palette.tint },
  deleteBtn: { backgroundColor: Palette.dangerBg },
});

export default HomeScreen;
