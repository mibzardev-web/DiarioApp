import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { PALETTES, DEFAULT_PALETTE } from "../constants/Colors";

const STORAGE_KEY = "@tema";

export const useThemeStore = create((set) => ({
  name: DEFAULT_PALETTE,
  loaded: false,

  load: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    set({ name: saved && PALETTES[saved] ? saved : DEFAULT_PALETTE, loaded: true });
  },

  setPalette: async (name) => {
    if (!PALETTES[name]) return;
    set({ name });
    await AsyncStorage.setItem(STORAGE_KEY, name);
  },
}));

// Paleta activa; los componentes se vuelven a dibujar cuando cambia
export const useTheme = () => PALETTES[useThemeStore((s) => s.name)];
