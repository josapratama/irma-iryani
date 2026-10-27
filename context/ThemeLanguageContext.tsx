"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  useCallback,
} from "react";
import id from "@/lib/locales/id.json";
import en from "@/lib/locales/en.json";
import ja from "@/lib/locales/ja.json";

export type Theme = "light" | "dark";
export type Language = "id" | "en" | "ja";

const LOCALES: Record<Language, any> = { id, en, ja };

interface ThemeLanguageContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, fallback?: string) => string;
  dict: any;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType>({
  theme: "light",
  language: "id",
  toggleTheme: () => {},
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (k, f) => f ?? k,
  dict: id,
});

function subscribeToStorage(key: string) {
  return (callback: () => void) => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) callback();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  };
}

function useLocalStorage<T extends string>(key: string, fallback: T): T {
  return useSyncExternalStore<T>(
    subscribeToStorage(key),
    () => (localStorage.getItem(key) as T) ?? fallback,
    () => fallback,
  );
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

export function ThemeLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useLocalStorage<Theme>("theme", "light");
  const language = useLocalStorage<Language>("language", "id");

  const toggleTheme = () =>
    setLocalStorage("theme", theme === "light" ? "dark" : "light");

  const toggleLanguage = () => {
    const next: Record<Language, Language> = { id: "en", en: "ja", ja: "id" };
    setLocalStorage("language", next[language] || "id");
  };

  const setLanguage = (lang: Language) => {
    setLocalStorage("language", lang);
  };

  const dict = LOCALES[language] || LOCALES.id;

  const t = useCallback(
    (keyPath: string, fallback?: string): string => {
      const keys = keyPath.split(".");
      let val: any = dict;
      for (const k of keys) {
        if (val && typeof val === "object" && k in val) {
          val = val[k];
        } else {
          return fallback ?? keyPath;
        }
      }
      return typeof val === "string" ? val : (fallback ?? keyPath);
    },
    [dict],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = language;
  }, [theme, language]);

  return (
    <ThemeLanguageContext.Provider
      value={{ theme, language, toggleTheme, toggleLanguage, setLanguage, t, dict }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  return useContext(ThemeLanguageContext);
}
