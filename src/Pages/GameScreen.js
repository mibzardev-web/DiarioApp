import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Palette } from "../constants/Colors";
import { POINTS_PER_WORD, WRONG_PENALTY, getLevelConfig } from "../data/words";
import { generatePuzzle, getLine } from "../utils/wordSearch";
import { getRecord, saveRecord } from "../storage/gameRecord";

// Un color pastel por cada palabra encontrada
const FOUND_COLORS = [
  "#F4B8D8",
  "#B8E0F4",
  "#C9F0C0",
  "#FFE3A3",
  "#D5C2F5",
  "#FFC9B0",
  "#A8EBD8",
  "#F0C0F0",
];

const formatTime = (s) =>
  `${Math.floor(Math.max(s, 0) / 60)}:${String(Math.max(s, 0) % 60).padStart(2, "0")}`;

const GameScreen = () => {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();

  // menu | playing | levelDone | over
  const [phase, setPhase] = useState("menu");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [puzzle, setPuzzle] = useState(null);
  const [found, setFound] = useState([]); // [{ idx, cells }]
  const [selStart, setSelStart] = useState(null);
  const [record, setRecord] = useState({ score: 0, level: 0 });
  const [result, setResult] = useState(null);

  useEffect(() => {
    getRecord().then(setRecord);
  }, []);

  // El tiempo corre solo mientras se juega y la pestaña está a la vista
  useEffect(() => {
    if (phase !== "playing" || !isFocused) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, isFocused]);

  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    setPhase("over");
    saveRecord(score, level).then((res) => {
      setResult(res);
      if (res.isNewRecord) setRecord({ score, level });
    });
  }, [phase, timeLeft, score, level]);

  const startLevel = (lvl) => {
    setPuzzle(generatePuzzle(lvl));
    setFound([]);
    setSelStart(null);
    setLevel(lvl);
    setTimeLeft(getLevelConfig(lvl).time);
    setPhase("playing");
  };

  const startGame = () => {
    setScore(0);
    setResult(null);
    startLevel(1);
  };

  const onCellPress = (r, c) => {
    if (phase !== "playing") return;
    if (!selStart) return setSelStart({ r, c });
    if (selStart.r === r && selStart.c === c) return setSelStart(null);

    const cells = getLine(selStart, { r, c });
    if (!cells) return setSelStart({ r, c }); // no es una línea: empieza de nuevo aquí

    const text = cells.map((p) => puzzle.grid[p.r][p.c]).join("");
    const reversed = [...text].reverse().join("");
    const foundIdx = found.map((f) => f.idx);
    const idx = puzzle.words.findIndex(
      (w, i) => !foundIdx.includes(i) && (w.letters === text || w.letters === reversed),
    );

    setSelStart(null);
    if (idx === -1) {
      setScore((s) => Math.max(0, s - WRONG_PENALTY));
      return;
    }

    const nextFound = [...found, { idx, cells }];
    setFound(nextFound);
    setScore((s) => s + POINTS_PER_WORD * level);

    if (nextFound.length === puzzle.words.length) {
      const timeBonus = timeLeft * level;
      setBonus(timeBonus);
      setScore((s) => s + timeBonus);
      setPhase("levelDone");
    }
  };

  const renderRecordCard = () => (
    <View style={styles.recordCard}>
      <MaterialCommunityIcons name="trophy" size={28} color="#F2B84B" />
      <View style={styles.recordText}>
        <Text style={styles.recordLabel}>Tu récord</Text>
        <Text style={styles.recordValue}>
          {record.score > 0
            ? `${record.score} pts · nivel ${record.level}`
            : "Aún no tienes récord"}
        </Text>
      </View>
    </View>
  );

  if (phase === "menu") {
    return (
      <View style={styles.center}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="alphabetical-variant" size={56} color="#FFF" />
        </View>
        <Text style={styles.title}>Sopa de letras</Text>
        <Text style={styles.subtitle}>
          Encuentra todas las palabras antes de que se acabe el tiempo. Toca la
          primera letra y luego la última. Cada nivel es más difícil.
        </Text>
        {renderRecordCard()}
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <MaterialCommunityIcons name="play" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Jugar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === "over") {
    const missing = result ? record.score - score : 0;
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name={result?.isNewRecord ? "party-popper" : "timer-sand-complete"}
          size={64}
          color={Palette.primary}
        />
        <Text style={styles.title}>¡Se acabó el tiempo!</Text>
        <Text style={styles.bigScore}>{score} pts</Text>
        <Text style={styles.subtitle}>Llegaste al nivel {level}</Text>

        {result && (
          <Text
            style={[styles.resultText, result.isNewRecord && styles.resultRecord]}
          >
            {result.isNewRecord
              ? `¡Nuevo récord! Superaste tu marca anterior de ${result.previous.score} pts`
              : `No superaste tu récord de ${record.score} pts. Te faltaron ${missing + 1} pts`}
          </Text>
        )}

        {renderRecordCard()}
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <MaterialCommunityIcons name="restart" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Jugar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === "levelDone") {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="star-circle" size={72} color="#F2B84B" />
        <Text style={styles.title}>¡Nivel {level} completado!</Text>
        <Text style={styles.subtitle}>Bonus por tiempo: +{bonus} pts</Text>
        <Text style={styles.bigScore}>{score} pts</Text>
        <TouchableOpacity style={styles.button} onPress={() => startLevel(level + 1)}>
          <Text style={styles.buttonText}>Siguiente nivel</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // phase === "playing"
  const gridWidth = Math.min(width - 32, 440);
  const cellSize = Math.floor(gridWidth / puzzle.size);
  const cellColor = {};
  found.forEach(({ idx, cells }) =>
    cells.forEach(({ r, c }) => (cellColor[`${r}-${c}`] = FOUND_COLORS[idx % FOUND_COLORS.length])),
  );
  const foundIdx = found.map((f) => f.idx);
  const lowTime = timeLeft <= 15;

  return (
    <ScrollView contentContainerStyle={styles.game}>
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <MaterialCommunityIcons name="signal-cellular-3" size={18} color={Palette.dark} />
          <Text style={styles.hudText}>Nivel {level}</Text>
        </View>
        <View style={styles.hudItem}>
          <MaterialCommunityIcons name="star" size={18} color="#F2B84B" />
          <Text style={styles.hudText}>{score}</Text>
        </View>
        <View style={[styles.hudItem, lowTime && styles.hudDanger]}>
          <MaterialCommunityIcons
            name="timer-outline"
            size={18}
            color={lowTime ? Palette.danger : Palette.dark}
          />
          <Text style={[styles.hudText, lowTime && { color: Palette.danger }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <View style={[styles.grid, { width: cellSize * puzzle.size }]}>
        {puzzle.grid.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((letter, c) => {
              const isSel = selStart && selStart.r === r && selStart.c === c;
              return (
                <TouchableOpacity
                  key={c}
                  activeOpacity={0.7}
                  onPress={() => onCellPress(r, c)}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    cellColor[`${r}-${c}`] && { backgroundColor: cellColor[`${r}-${c}`] },
                    isSel && styles.cellSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      { fontSize: cellSize * 0.5 },
                      isSel && { color: "#FFF" },
                    ]}
                  >
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.listTitle}>
        Palabras ({found.length}/{puzzle.words.length})
      </Text>
      <View style={styles.chips}>
        {puzzle.words.map((w, i) => {
          const done = foundIdx.includes(i);
          return (
            <View
              key={w.display}
              style={[
                styles.chip,
                done && { backgroundColor: FOUND_COLORS[i % FOUND_COLORS.length] },
              ]}
            >
              <Text style={[styles.chipText, done && styles.chipDone]}>{w.display}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Palette.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  logo: {
    backgroundColor: Palette.primary,
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: Palette.dark,
    textAlign: "center",
  },
  subtitle: { fontSize: 14, color: Palette.subText, textAlign: "center" },
  bigScore: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 36,
    color: Palette.primary,
  },
  resultText: { fontSize: 14, color: Palette.text, textAlign: "center" },
  resultRecord: {
    color: Palette.primary,
    fontFamily: "Poppins_600SemiBold",
  },
  recordCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
    elevation: 2,
    alignSelf: "stretch",
  },
  recordText: { flex: 1 },
  recordLabel: { fontSize: 12, color: Palette.subText },
  recordValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Palette.dark,
  },
  button: {
    backgroundColor: Palette.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  game: {
    flexGrow: 1,
    backgroundColor: Palette.background,
    alignItems: "center",
    padding: 16,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginBottom: 14,
  },
  hudItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  hudDanger: { backgroundColor: Palette.dangerBg },
  hudText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: Palette.dark,
  },
  grid: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  gridRow: { flexDirection: "row" },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: Palette.border,
  },
  cellSelected: { backgroundColor: Palette.primary },
  cellText: {
    fontFamily: "Poppins_600SemiBold",
    color: Palette.dark,
  },
  listTitle: {
    alignSelf: "flex-start",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Palette.dark,
    marginTop: 18,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignSelf: "stretch",
  },
  chip: {
    backgroundColor: Palette.tint,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13, color: Palette.dark },
  chipDone: { textDecorationLine: "line-through", opacity: 0.7 },
});

export default GameScreen;
