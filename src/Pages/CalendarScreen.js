import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import { getDiaries } from "../storage/diaries";
import { MESES, dayKey, diaryDate, fechaFromDate } from "../utils/dates";

const WEEK_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

// Calendario del mes: días con diario, días que faltan y acceso rápido a crear/editar
const CalendarScreen = ({ navigation }) => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
  const { width } = useWindowDimensions();
  const cell = Math.floor((Math.min(width, 480) - 32) / 7);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [byDay, setByDay] = useState({});

  useFocusEffect(
    useCallback(() => {
      getDiaries().then((diaries) => {
        const map = {};
        diaries.forEach((d) => {
          const key = dayKey(diaryDate(d));
          (map[key] = map[key] || []).push(d);
        });
        setByDay(map);
      });
    }, []),
  );

  const changeMonth = (delta) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const { days, stats } = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // semana que empieza en lunes
    const count = new Date(year, month + 1, 0).getDate();
    const todayKey = dayKey(new Date());

    let withDiary = 0;
    let missing = 0;
    const list = [];
    for (let i = 0; i < offset; i++) list.push(null);
    for (let n = 1; n <= count; n++) {
      const date = new Date(year, month, n);
      const key = dayKey(date);
      const diaries = byDay[key] || [];
      const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;
      const isPast = key < todayKey;
      const isMissing = isWeekday && isPast && diaries.length === 0;
      if (diaries.length) withDiary++;
      if (isMissing) missing++;
      list.push({ n, date, diaries, isMissing, isToday: key === todayKey });
    }
    return { days: list, stats: { withDiary, missing } };
  }, [year, month, byDay]);

  const onPressDay = ({ date, diaries }) => {
    if (diaries.length) {
      navigation.navigate("EditDiaryScreen", { diary: diaries[0] });
      return;
    }
    const fecha = fechaFromDate(date);
    Alert.alert("Sin diario", `¿Crear el diario del ${fecha}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Crear", onPress: () => navigation.navigate("CreateDiaryScreen", { fecha }) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={Palette.dark} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {MESES[month].charAt(0).toUpperCase() + MESES[month].slice(1)} {year}
        </Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
          <MaterialCommunityIcons name="chevron-right" size={26} color={Palette.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEK_LABELS.map((l, i) => (
          <Text key={i} style={[styles.weekLabel, { width: cell }]}>
            {l}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((d, i) =>
          d ? (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => onPressDay(d)}
              style={[
                styles.day,
                { width: cell, height: cell },
                d.diaries.length > 0 && styles.dayDone,
                d.isMissing && styles.dayMissing,
                d.isToday && styles.dayToday,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  d.diaries.length > 0 && styles.dayTextDone,
                  d.isMissing && styles.dayTextMissing,
                ]}
              >
                {d.n}
              </Text>
            </TouchableOpacity>
          ) : (
            <View key={i} style={{ width: cell, height: cell }} />
          ),
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Palette.primary }]} />
          <Text style={styles.legendText}>Con diario ({stats.withDiary})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Palette.dangerBg, borderColor: Palette.danger, borderWidth: 1 }]} />
          <Text style={styles.legendText}>Falta ({stats.missing})</Text>
        </View>
      </View>
      <Text style={styles.hint}>
        Toca un día con diario para editarlo, o uno sin diario para crearlo. Los
        días "falta" son de lunes a viernes sin diario.
      </Text>
    </View>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.background, padding: 16 },
    monthRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    navBtn: {
      backgroundColor: Palette.tint,
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    monthText: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 18,
      color: Palette.dark,
    },
    weekRow: { flexDirection: "row", alignSelf: "center" },
    weekLabel: {
      textAlign: "center",
      fontFamily: "Poppins_600SemiBold",
      fontSize: 13,
      color: Palette.subText,
      marginBottom: 6,
    },
    grid: { flexDirection: "row", flexWrap: "wrap", alignSelf: "center" },
    day: { alignItems: "center", justifyContent: "center", padding: 3 },
    dayDone: {
      backgroundColor: Palette.primary,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: Palette.background,
    },
    dayMissing: {
      backgroundColor: Palette.dangerBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Palette.danger,
    },
    dayToday: { borderWidth: 2, borderColor: Palette.dark, borderRadius: 12 },
    dayText: { fontSize: 15, color: Palette.text },
    dayTextDone: { color: "#FFF", fontFamily: "Poppins_600SemiBold" },
    dayTextMissing: { color: Palette.danger },
    legend: { flexDirection: "row", gap: 20, marginTop: 18, justifyContent: "center" },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 14, height: 14, borderRadius: 7 },
    legendText: { fontSize: 13, color: Palette.text },
    hint: { fontSize: 12, color: Palette.subText, textAlign: "center", marginTop: 14 },
  });

export default CalendarScreen;
