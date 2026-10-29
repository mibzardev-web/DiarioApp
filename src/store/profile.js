import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@perfil";

export const useProfileStore = create((set) => ({
  name: "",
  loaded: false,

  load: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ name: raw ? JSON.parse(raw).name || "" : "", loaded: true });
  },

  setName: async (name) => {
    const clean = name.trim();
    set({ name: clean });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ name: clean }));
  },
}));
