import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import { getDiaries } from "./diaries";
import { getStudents } from "./students";

const DIARIES_KEY = "@diarios";
const STUDENTS_KEY = "@alumnos";
const BACKUP_VERSION = 1;

const pad = (n) => String(n).padStart(2, "0");

// Crea un archivo .json con todos los diarios y alumnos y abre el menú de compartir
// (para guardarlo en Drive, mandarlo por WhatsApp, etc.)
export const exportBackup = async () => {
  const [diarios, alumnos] = await Promise.all([getDiaries(), getStudents()]);
  const now = new Date();
  const backup = {
    app: "diario-de-campo",
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    diarios,
    alumnos,
  };

  const name = `diario-respaldo-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
  const file = new File(Paths.cache, name);
  file.create();
  file.write(JSON.stringify(backup));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Guardar respaldo",
      UTI: "public.json",
    });
  }
  return { diarios: diarios.length, alumnos: alumnos.length };
};

// Deja elegir un archivo de respaldo y lo valida. Devuelve null si se cancela.
export const pickBackup = async () => {
  const res = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "*/*"],
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.length) return null;

  const data = JSON.parse(await new File(res.assets[0].uri).text());
  if (data?.app !== "diario-de-campo" || !Array.isArray(data.diarios)) {
    throw new Error("Archivo de respaldo no válido");
  }
  return {
    diarios: data.diarios,
    alumnos: Array.isArray(data.alumnos) ? data.alumnos : [],
  };
};

// mode "merge": agrega lo que falta (por id) y conserva lo que ya hay.
// mode "replace": borra todo lo actual y deja solo lo del respaldo.
export const restoreBackup = async ({ diarios, alumnos }, mode) => {
  let nextDiarios = diarios;
  let nextAlumnos = alumnos;

  if (mode === "merge") {
    const [curD, curA] = await Promise.all([getDiaries(), getStudents()]);
    const dIds = new Set(curD.map((d) => d.id));
    const aIds = new Set(curA.map((a) => a.id));
    nextDiarios = [...curD, ...diarios.filter((d) => !dIds.has(d.id))];
    nextAlumnos = [...curA, ...alumnos.filter((a) => !aIds.has(a.id))];
  }

  // Más recientes primero, como los guarda la app
  nextDiarios.sort((a, b) => Number(b.id) - Number(a.id));

  await AsyncStorage.setItem(DIARIES_KEY, JSON.stringify(nextDiarios));
  await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(nextAlumnos));
  return { diarios: nextDiarios.length, alumnos: nextAlumnos.length };
};
