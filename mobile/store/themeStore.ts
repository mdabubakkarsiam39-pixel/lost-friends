import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { useEffect } from "react";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
  hydrated: boolean;
  hydrate: (systemDark: boolean) => Promise<void>;
}

const THEME_KEY = "@lost-friends-theme";

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  hydrated: false,
  toggleTheme: () => {
    const next = !get().isDark;
    set({ isDark: next });
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(next));
  },
  setDark: (dark) => {
    set({ isDark: dark });
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(dark));
  },
  hydrate: async (systemDark: boolean) => {
    try {
      const stored: string | null = await AsyncStorage.getItem(THEME_KEY);
      if (stored !== null) {
        set({ isDark: JSON.parse(stored), hydrated: true });
      } else {
        set({ isDark: systemDark, hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));

export function useHydrateTheme() {
  const hydrate = useThemeStore((s) => s.hydrate);
  const hydrated = useThemeStore((s) => s.hydrated);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!hydrated) {
      hydrate(colorScheme === "dark");
    }
  }, [hydrated, hydrate, colorScheme]);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.getItem(THEME_KEY).then((stored: string | null) => {
        if (stored === null) {
          const systemDark = colorScheme === "dark";
          useThemeStore.getState().setDark(systemDark);
        }
      });
    }
  }, [colorScheme, hydrated]);
}
