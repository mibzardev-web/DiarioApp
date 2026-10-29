import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@diarios";

export const getDiaries = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveDiary = async (diary) => {
  const diaries = await getDiaries();
  const newDiary = {
    ...diary,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newDiary, ...diaries]),
  );
  return newDiary;
};

// Actualiza un diario. `updatedAt` (última edición) solo cambia si algo cambió de verdad.
export const updateDiary = async (id, changes) => {
  const diaries = await getDiaries();
  let updated = null;

  const next = diaries.map((d) => {
    if (d.id !== id) return d;
    const changed = Object.keys(changes).some((k) => changes[k] !== d[k]);
    updated = changed
      ? { ...d, ...changes, id, updatedAt: new Date().toISOString() }
      : d;
    return updated;
  });

  if (!updated) throw new Error("Diario no encontrado");
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return updated;
};

export const deleteDiary = async (id) => {
  const diaries = await getDiaries();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(diaries.filter((d) => d.id !== id)),
  );
};
