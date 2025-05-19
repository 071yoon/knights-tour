"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: keyof (typeof translations)["en-US"]) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const DEFAULT_LANGUAGE = "en-US";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Get language from localStorage or browser preference
    const savedLang = localStorage.getItem("preferred-language");
    if (savedLang && translations[savedLang as keyof typeof translations]) {
      setLanguage(savedLang);
    } else {
      // Try to match browser language with supported languages
      const browserLang = navigator.language;
      const supportedLang = Object.keys(translations).find((lang) =>
        browserLang.startsWith(lang.split("-")[0])
      );
      // Only set the browser language if it's supported, otherwise keep the default (English)
      if (supportedLang) {
        setLanguage(supportedLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("preferred-language", lang);
    document.documentElement.lang = lang;
  };

  const t = (key: keyof (typeof translations)["en-US"]): string => {
    return (
      translations[language as keyof typeof translations][key] ||
      translations[DEFAULT_LANGUAGE][key]
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
