import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import { getDiaries } from "../storage/diaries";
import { diaryDate, studentMentions } from "../utils/dates";

// Historial de un alumno: todos los diarios donde se menciona su nombre
const StudentDetailScreen = ({ navigation, route }) => {
  const { student } = route.params;
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const [entries, setEntries] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getDiaries().then((diaries) => {
        const found = diaries
          .map((diary) => ({ diary, mentions: studentMentions(diary, student.nombre) }))
          .filter((e) => e.mentions.length > 0)
          .sort((a, b) => diaryDate(b.diary) - diaryDate(a.diary));
        setEntries(found);
      });
    }, [student.nombre]),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.diary.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.nombre.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroName}>{student.nombre}</Text>
              <Text style={styles.heroSub}>
                {entries.length === 1
                  ? "Aparece en 1 diario"
                  : `Aparece en ${entries.length} diarios`}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="text-search" size={56} color={Palette.border} />
            <Text style={styles.emptyTitle}>Sin menciones</Text>
            <Text style={styles.empty}>
              Cuando escribas el nombre de {student.nombre.split(" ")[0]} en un
              diario, aparecerá aquí.
            </Text>
          </View>
        }
        renderItem={({ item: { diary, mentions } }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("Inicio", {
                screen: "EditDiaryScreen",
                params: { diary },
              })
            }
          >
            <View style={styles.cardHead}>
              <MaterialCommunityIcons name="calendar-text" size={20} color={Palette.primary} />
              <Text style={styles.cardDate}>{diary.fecha}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Palette.muted} />
            </View>
            {mentions.map((m, i) => (
              <View key={i} style={styles.mention}>
                <Text style={styles.section}>{m.section}</Text>
                <Text style={styles.mentionText}>{m.text}</Text>
              </View>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.background },
    list: { padding: 16, paddingBottom: 30 },
    hero: {
      backgroundColor: Palette.dark,
      borderRadius: 20,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
    },
    avatar: {
      backgroundColor: Palette.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontFamily: "Poppins_600SemiBold", fontSize: 24, color: "#FFF" },
    heroText: { flex: 1 },
    heroName: { fontFamily: "Poppins_600SemiBold", fontSize: 20, color: "#FFF" },
    heroSub: { fontSize: 13, color: Palette.border },
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
      padding: 14,
      marginBottom: 10,
      elevation: 2,
    },
    cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    cardDate: {
      flex: 1,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 14,
      color: Palette.dark,
    },
    mention: {
      borderTopWidth: 1,
      borderTopColor: Palette.tint,
      paddingTop: 6,
      marginTop: 6,
    },
    section: {
      fontSize: 11,
      color: Palette.primary,
      fontFamily: "Poppins_600SemiBold",
      textTransform: "uppercase",
    },
    mentionText: { fontSize: 13, color: Palette.text, marginTop: 2 },
  });

export default StudentDetailScreen;
