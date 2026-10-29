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

  const onPressDiary = (diary) => {
    Alert.alert(diary.fecha, "¿Qué quieres hacer?", [
      {
        text: "Descargar PDF",
        onPress: () =>
          exportDiaryPdf(diary).catch(() =>
            Alert.alert("Error", "No se pudo generar el PDF."),
          ),
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteDiary(diary.id);
          loadDiaries();
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateDiaryScreen")}
      >
        <Text style={styles.buttonText}>Crear un nuevo diario</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Historial de diarios</Text>

      <FlatList
        data={diaries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aún no has creado ningún diario.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPressDiary(item)}
          >
            <Text style={styles.cardDate}>{item.fecha}</Text>
            {!!item.campoFormativo && (
              <Text style={styles.cardSub} numberOfLines={1}>
                {item.campoFormativo}
              </Text>
            )}
            {!!item.pda && (
              <Text style={styles.cardSub} numberOfLines={2}>
                {item.pda}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
  button: {
    backgroundColor: "#2253DF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#001D3D",
    marginTop: 20,
    marginBottom: 8,
  },
  list: { paddingBottom: 20 },
  empty: { color: "#94A3B8", textAlign: "center", marginTop: 30 },
  card: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardDate: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#001D3D",
  },
  cardSub: { fontSize: 13, color: "#45556C", marginTop: 2 },
});

export default HomeScreen;
