import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import { getDiaries } from "../storage/diaries";
import { exportDiariesPdf } from "../utils/diaryPdf";
import { dayKey, diaryDate, fechaFromDate } from "../utils/dates";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

// Elegir un rango de fechas y descargar todos los diarios de ese rango en un solo PDF
const ExportRangeScreen = () => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const [diaries, setDiaries] = useState([]); // de más antiguo a más reciente
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [picking, setPicking] = useState(null); // "from" | "to" | null
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getDiaries().then((list) => {
        const sorted = [...list].sort((a, b) => diaryDate(a) - diaryDate(b));
        setDiaries(sorted);
        if (sorted.length) {
          setFrom((f) => f || startOfDay(diaryDate(sorted[0])));
          setTo((t) => t || startOfDay(diaryDate(sorted[sorted.length - 1])));
        }
      });
    }, []),
  );

  // Cada vez que cambia el rango se seleccionan los diarios que caen dentro
  useEffect(() => {
    if (!from || !to) return;
    const a = dayKey(from);
    const b = dayKey(to);
    setSelected(
      new Set(
        diaries
          .filter((d) => {
            const k = dayKey(diaryDate(d));
            return k >= a && k <= b;
          })
          .map((d) => d.id),
      ),
    );
  }, [from, to, diaries]);

  const quickRange = (kind) => {
    const today = startOfDay(new Date());
    if (kind === "week") {
      const mon = mondayOf(today);
      setFrom(mon);
      setTo(addDays(mon, 6));
    } else if (kind === "lastWeek") {
      const mon = addDays(mondayOf(today), -7);
      setFrom(mon);
      setTo(addDays(mon, 6));
    } else if (kind === "month") {
      setFrom(new Date(today.getFullYear(), today.getMonth(), 1));
      setTo(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    } else if (diaries.length) {
      setFrom(startOfDay(diaryDate(diaries[0])));
      setTo(startOfDay(diaryDate(diaries[diaries.length - 1])));
    }
  };

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const pickDate = (d) => {
    const date = startOfDay(diaryDate(d));
    if (picking === "from") {
      setFrom(date);
      if (to && date > to) setTo(date);
    } else {
      setTo(date);
      if (from && date < from) setFrom(date);
    }
    setPicking(null);
  };

  const onExport = async () => {
    const chosen = diaries.filter((d) => selected.has(d.id));
    if (!chosen.length) return;
    setBusy(true);
    try {
      await exportDiariesPdf(chosen, `Diarios (${chosen.length})`);
    } catch (e) {
      Alert.alert("Error", "No se pudo generar el PDF.");
    } finally {
      setBusy(false);
    }
  };

  // Una opción por día que tenga diario, sin repetir
  const pickOptions = useMemo(() => {
    const seen = new Set();
    return diaries.filter((d) => {
      const k = dayKey(diaryDate(d));
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [diaries]);

  if (!diaries.length) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="file-pdf-box" size={56} color={Palette.border} />
        <Text style={styles.emptyTitle}>Aún no hay diarios</Text>
        <Text style={styles.emptyText}>Crea tu primer diario para poder descargarlo en PDF.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={diaries}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Elige el rango</Text>
            <View style={styles.rangeRow}>
              <TouchableOpacity style={styles.dateBox} onPress={() => setPicking("from")}>
                <Text style={styles.dateLabel}>Desde</Text>
                <Text style={styles.dateValue} numberOfLines={2}>
                  {from ? fechaFromDate(from) : "—"}
                </Text>
              </TouchableOpacity>
              <MaterialCommunityIcons name="arrow-right" size={22} color={Palette.muted} />
              <TouchableOpacity style={styles.dateBox} onPress={() => setPicking("to")}>
                <Text style={styles.dateLabel}>Hasta</Text>
                <Text style={styles.dateValue} numberOfLines={2}>
                  {to ? fechaFromDate(to) : "—"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chips}>
              {[
                ["week", "Esta semana"],
                ["lastWeek", "Semana pasada"],
                ["month", "Este mes"],
                ["all", "Todos"],
              ].map(([key, label]) => (
                <TouchableOpacity key={key} style={styles.chip} onPress={() => quickRange(key)}>
                  <Text style={styles.chipText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.listTitle}>
              Diarios en el PDF ({selected.size}/{diaries.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const on = selected.has(item.id);
          return (
            <TouchableOpacity style={[styles.item, on && styles.itemOn]} onPress={() => toggle(item.id)}>
              <MaterialCommunityIcons
                name={on ? "checkbox-marked" : "checkbox-blank-outline"}
                size={24}
                color={on ? Palette.primary : Palette.muted}
              />
              <View style={styles.itemText}>
                <Text style={styles.itemDate}>{item.fecha}</Text>
                {!!item.campoFormativo && (
                  <Text style={styles.itemSub} numberOfLines={1}>
                    {item.campoFormativo}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!selected.size || busy) && styles.disabled]}
          disabled={!selected.size || busy}
          onPress={onExport}
        >
          <MaterialCommunityIcons name="file-pdf-box" size={24} color="#FFF" />
          <Text style={styles.buttonText}>
            {busy ? "Generando..." : `Descargar PDF (${selected.size})`}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!picking} transparent animationType="slide" onRequestClose={() => setPicking(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{picking === "from" ? "Desde" : "Hasta"}</Text>
              <TouchableOpacity onPress={() => setPicking(null)}>
                <MaterialCommunityIcons name="close" size={24} color={Palette.dark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={pickOptions}
              keyExtractor={(d) => d.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => pickDate(item)}>
                  <MaterialCommunityIcons name="calendar-text" size={20} color={Palette.primary} />
                  <Text style={styles.optionText}>{item.fecha}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.background },
    list: { padding: 16, paddingBottom: 100 },
    title: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
      color: Palette.dark,
      marginBottom: 10,
    },
    rangeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dateBox: {
      flex: 1,
      backgroundColor: "#FFF",
      borderRadius: 14,
      padding: 12,
      elevation: 2,
    },
    dateLabel: { fontSize: 12, color: Palette.subText },
    dateValue: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 13,
      color: Palette.dark,
      marginTop: 2,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
    chip: {
      backgroundColor: Palette.tint,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipText: { fontSize: 13, color: Palette.dark },
    listTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 15,
      color: Palette.dark,
      marginTop: 20,
      marginBottom: 8,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: "#FFF",
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    itemOn: { borderColor: Palette.selected },
    itemText: { flex: 1 },
    itemDate: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 14,
      color: Palette.dark,
    },
    itemSub: { fontSize: 12, color: Palette.subText },
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 16,
      backgroundColor: Palette.background,
    },
    button: {
      backgroundColor: Palette.primary,
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    disabled: { opacity: 0.5 },
    buttonText: { color: "#FFF", fontFamily: "Poppins_600SemiBold", fontSize: 16 },
    empty: {
      flex: 1,
      backgroundColor: Palette.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    emptyTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
      color: Palette.text,
      marginTop: 8,
    },
    emptyText: { color: Palette.muted, textAlign: "center", marginTop: 4 },
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: "#FFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "70%",
      padding: 16,
    },
    sheetHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    sheetTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 18,
      color: Palette.dark,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Palette.tint,
    },
    optionText: { fontSize: 14, color: Palette.text },
  });

export default ExportRangeScreen;
