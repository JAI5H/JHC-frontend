import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "en" | "ar";
type AppDirection = "ltr" | "rtl";

type LanguageContextValue = {
  direction: AppDirection;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const LANGUAGE_STORAGE_KEY = "jhc_language";
const DEFAULT_LANGUAGE: AppLanguage = "en";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getDirection(language: AppLanguage): AppDirection {
  return language === "ar" ? "rtl" : "ltr";
}

function getInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedLanguage === "ar" || storedLanguage === "en" ? storedLanguage : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = getDirection(language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      direction: getDirection(language),
      language,
      setLanguage,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
