import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@alumnos";

const sortByName = (list) =>
  [...list].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export const getStudents = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? sortByName(JSON.parse(raw)) : [];
};

const persist = (list) =>
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortByName(list)));

export const addStudent = async (nombre) => {
  const list = await getStudents();
  const student = { id: Date.now().toString(), nombre: nombre.trim() };
  await persist([...list, student]);
  return student;
};

export const renameStudent = async (id, nombre) => {
  const list = await getStudents();
  await persist(
    list.map((s) => (s.id === id ? { ...s, nombre: nombre.trim() } : s)),
  );
};

export const deleteStudent = async (id) => {
  const list = await getStudents();
  await persist(list.filter((s) => s.id !== id));
};
