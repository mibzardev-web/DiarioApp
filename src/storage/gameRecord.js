import AsyncStorage from "@react-native-async-storage/async-storage";

const RECORD_KEY = "@sopa_record";
const LAST_GAME_KEY = "@sopa_ultima_partida";

// { score, level } del mejor juego, o { score: 0, level: 0 } si nunca se ha jugado
export const getRecord = async () => {
  const raw = await AsyncStorage.getItem(RECORD_KEY);
  return raw ? JSON.parse(raw) : { score: 0, level: 0 };
};

// { score, level } de la última partida, o { score: 0, level: 0 } si nunca se ha jugado
export const getLastGame = async () => {
  const raw = await AsyncStorage.getItem(LAST_GAME_KEY);
  return raw ? JSON.parse(raw) : { score: 0, level: 0 };
};

// Guarda siempre la partida (puntos y nivel alcanzado) y actualiza el récord si lo
// supera. Devuelve si fue récord y el récord anterior.
export const saveGame = async (score, level) => {
  const previous = await getRecord();
  const isNewRecord = score > previous.score;

  await AsyncStorage.setItem(LAST_GAME_KEY, JSON.stringify({ score, level }));
  if (isNewRecord) {
    await AsyncStorage.setItem(RECORD_KEY, JSON.stringify({ score, level }));
  }
  return { isNewRecord, previous };
};
