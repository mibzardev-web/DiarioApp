import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@sopa_record";

// { score, level } del mejor juego, o { score: 0, level: 0 } si nunca se ha jugado
export const getRecord = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { score: 0, level: 0 };
};

// Guarda el puntaje solo si supera el récord. Devuelve si fue récord y el anterior.
export const saveRecord = async (score, level) => {
  const previous = await getRecord();
  const isNewRecord = score > previous.score;
  if (isNewRecord) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ score, level }));
  }
  return { isNewRecord, previous };
};
