import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@diarios";

export const getDiaries = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveDiary = async (diary) => {
  const diaries = await getDiaries();
  const newDiary = { ...diary, id: Date.now().toString() };
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newDiary, ...diaries]),
  );
  return newDiary;
};

export const deleteDiary = async (id) => {
  const diaries = await getDiaries();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(diaries.filter((d) => d.id !== id)),
  );
};
