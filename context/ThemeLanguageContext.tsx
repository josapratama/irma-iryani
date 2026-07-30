"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";
type Language = "id" | "en";

interface ThemeLanguageContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType>({
  theme: "light",
  language: "id",
  toggleTheme: () => {},
  toggleLanguage: () => {},
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
  // Dispatch storage event so useSyncExternalStore re-reads the snapshot
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

  const toggleLanguage = () =>
    setLocalStorage("language", language === "id" ? "en" : "id");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = language;
  }, [theme, language]);

  return (
    <ThemeLanguageContext.Provider
      value={{ theme, language, toggleTheme, toggleLanguage }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  return useContext(ThemeLanguageContext);
}
