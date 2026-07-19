"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import en from "./en.json";
import mm from "./mm.json";

type Locale = "en" | "mm";

// Deep nested object type
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = Record<string, TranslationValue>;

const LOCALES: Record<Locale, Translations> = { en: en as Translations, mm: mm as Translations };

const STORAGE_KEY = "lifelink-locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const useT = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
};

// Helper to get a nested value from the translations object using dot notation
function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split(".");
  let current: TranslationValue | undefined = obj;

  for (const key of keys) {
    if (current === undefined || current === null) return path;
    if (typeof current === "string") return path;
    current = (current as Record<string, TranslationValue>)[key];
  }

  if (typeof current === "string") return current;

  return path;
}

// Simple template interpolation: {name} -> value
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === "en" || stored === "mm")) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const translations = LOCALES[locale];
      const raw = getNestedValue(translations, key);
      return interpolate(raw, params);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useT();

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`min-h-8 min-w-8 rounded-xl px-2.5 text-xs font-bold transition ${
          locale === "en"
            ? "bg-white text-red-600 shadow-sm ring-1 ring-slate-200"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLocale("mm")}
        className={`min-h-8 min-w-8 rounded-xl px-2.5 text-xs font-bold transition ${
          locale === "mm"
            ? "bg-white text-red-600 shadow-sm ring-1 ring-slate-200"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        မြန်
      </button>
    </div>
  );
};
