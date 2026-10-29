import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import { POINTS_PER_WORD, WRONG_PENALTY, getLevelConfig } from "../data/words";
import { generatePuzzle, getLine } from "../utils/wordSearch";
import { getRecord, getLastGame, saveGame } from "../storage/gameRecord";

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
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);
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
  const [sel, setSel] = useState(null); // { start, end } mientras el dedo pinta
  const [record, setRecord] = useState({ score: 0, level: 0 });
  const [lastGame, setLastGame] = useState({ score: 0, level: 0 });
  const [result, setResult] = useState(null);
  const [endedByUser, setEndedByUser] = useState(false);

  useEffect(() => {
    getRecord().then(setRecord);
    getLastGame().then(setLastGame);
  }, []);

  // El tiempo corre solo mientras se juega y la pestaña está a la vista
  useEffect(() => {
    if (phase !== "playing" || !isFocused) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, isFocused]);

  // Cierra la partida (por tiempo o porque el jugador quiso terminar) y guarda el récord
  const finishGame = (byUser) => {
    setEndedByUser(byUser);
    setPhase("over");
    saveGame(score, level).then((res) => {
      setResult(res);
      setLastGame({ score, level });
      if (res.isNewRecord) setRecord({ score, level });
    });
  };

  useEffect(() => {
    if (phase === "playing" && timeLeft <= 0) finishGame(false);
  }, [phase, timeLeft]);

  const confirmEnd = () => {
    Alert.alert(
      "Terminar juego",
      `Llevas ${score} pts en el nivel ${level}. Se guardará tu puntaje si supera tu récord.`,
      [
        { text: "Seguir jugando", style: "cancel" },
        { text: "Terminar", style: "destructive", onPress: () => finishGame(true) },
      ],
    );
  };

  const startLevel = (lvl) => {
    setPuzzle(generatePuzzle(lvl));
    setFound([]);
    setSel(null);
    setLevel(lvl);
    setTimeLeft(getLevelConfig(lvl).time);
    setPhase("playing");
  };

  const startGame = () => {
    setScore(0);
    setResult(null);
    setEndedByUser(false);
    startLevel(1);
  };

  const gridWidth = Math.min(width - 32, 440);
  const cellSize = puzzle ? Math.floor(gridWidth / puzzle.size) : 0;

  // Termina el trazo del dedo: revisa si las letras pintadas forman una palabra
  const finishSelection = (cells) => {
    if (phase !== "playing" || !cells || cells.length < 2) return;

    const text = cells.map((p) => puzzle.grid[p.r][p.c]).join("");
    const reversed = [...text].reverse().join("");
    const foundIdx = found.map((f) => f.idx);
    const idx = puzzle.words.findIndex(
      (w, i) => !foundIdx.includes(i) && (w.letters === text || w.letters === reversed),
    );

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

  // El PanResponder se crea una sola vez, por eso lee el estado más reciente desde un ref
  const latest = useRef({});
  latest.current = { phase, size: puzzle?.size ?? 0, cellSize, finishSelection };
  const selRef = useRef(null);

  const cellAt = (e) => {
    const { size, cellSize: cs } = latest.current;
    const { locationX, locationY } = e.nativeEvent;
    const r = Math.floor(locationY / cs);
    const c = Math.floor(locationX / cs);
    return r < 0 || c < 0 || r >= size || c >= size ? null : { r, c };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => latest.current.phase === "playing",
      onMoveShouldSetPanResponder: () => latest.current.phase === "playing",
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const cell = cellAt(e);
        if (!cell) return;
        selRef.current = { start: cell, end: cell };
        setSel(selRef.current);
      },
      onPanResponderMove: (e) => {
        const cur = selRef.current;
        const cell = cur && cellAt(e);
        // Solo avanza si el dedo sigue en línea recta (horizontal, vertical o diagonal)
        if (!cell || !getLine(cur.start, cell)) return;
        if (cell.r === cur.end.r && cell.c === cur.end.c) return;
        selRef.current = { start: cur.start, end: cell };
        setSel(selRef.current);
      },
      onPanResponderRelease: () => {
        const cur = selRef.current;
        selRef.current = null;
        setSel(null);
        if (cur) latest.current.finishSelection(getLine(cur.start, cur.end));
      },
      onPanResponderTerminate: () => {
        selRef.current = null;
        setSel(null);
      },
    }),
  ).current;

  const renderRecordCard = (showLast = false) => (
    <View style={styles.recordCard}>
      <View style={styles.recordRow}>
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
      {showLast && lastGame.score + lastGame.level > 0 && (
        <View style={styles.recordRow}>
          <MaterialCommunityIcons name="history" size={28} color={Palette.primary} />
          <View style={styles.recordText}>
            <Text style={styles.recordLabel}>Última partida</Text>
            <Text style={styles.recordValue}>
              {lastGame.score} pts · nivel {lastGame.level}
            </Text>
          </View>
        </View>
      )}
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
          Encuentra todas las palabras antes de que se acabe el tiempo. Desliza
          el dedo sobre las letras para pintarlas. Cada nivel es más difícil.
        </Text>
        {renderRecordCard(true)}
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
          name={result?.isNewRecord ? "party-popper" : endedByUser ? "flag-checkered" : "timer-sand-complete"}
          size={64}
          color={Palette.primary}
        />
        <Text style={styles.title}>
          {endedByUser ? "Juego terminado" : "¡Se acabó el tiempo!"}
        </Text>
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
  const cellColor = {};
  found.forEach(({ idx, cells }) =>
    cells.forEach(({ r, c }) => (cellColor[`${r}-${c}`] = FOUND_COLORS[idx % FOUND_COLORS.length])),
  );
  const foundIdx = found.map((f) => f.idx);
  const selCells = sel ? getLine(sel.start, sel.end) : [];
  const selKeys = new Set(selCells.map(({ r, c }) => `${r}-${c}`));
  const previewText = selCells.map(({ r, c }) => puzzle.grid[r][c]).join("");
  const lowTime = timeLeft <= 15;

  return (
    <ScrollView contentContainerStyle={styles.game} scrollEnabled={!sel}>
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

      <View style={styles.preview}>
        <MaterialCommunityIcons name="draw" size={18} color={Palette.primary} />
        <Text style={styles.previewText} numberOfLines={1}>
          {previewText || "Desliza el dedo sobre las letras"}
        </Text>
      </View>

      {/* Los hijos no reciben toques: el dedo siempre lo recibe la cuadrícula completa */}
      <View
        {...panResponder.panHandlers}
        style={[styles.grid, { width: cellSize * puzzle.size }]}
      >
        {puzzle.grid.map((row, r) => (
          <View key={r} style={styles.gridRow} pointerEvents="none">
            {row.map((letter, c) => {
              const key = `${r}-${c}`;
              const isSel = selKeys.has(key);
              return (
                <View
                  key={c}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    cellColor[key] && { backgroundColor: cellColor[key] },
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
                </View>
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

      <TouchableOpacity style={styles.endButton} onPress={confirmEnd}>
        <MaterialCommunityIcons name="flag-checkered" size={20} color={Palette.danger} />
        <Text style={styles.endButtonText}>Terminar juego</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
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
    gap: 12,
    marginVertical: 8,
    elevation: 2,
    alignSelf: "stretch",
  },
  recordRow: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  cellSelected: { backgroundColor: Palette.selected },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    minHeight: 40,
  },
  previewText: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    letterSpacing: 2,
    color: Palette.dark,
  },
  cellText: {
    fontFamily: "Poppins_600SemiBold",
    color: Palette.dark,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    borderWidth: 1.5,
    borderColor: Palette.danger,
    backgroundColor: Palette.dangerBg,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 24,
  },
  endButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Palette.danger,
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
