import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr/common.json";
import en from "./locales/en/common.json";
import ar from "./locales/ar/common.json";

export const RTL_LANGUAGES = new Set(["ar"]);
export const SUPPORTED_LANGUAGES = ["fr", "en", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
const STORAGE_KEY = "sentilens_lang";

function detectInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) return stored as SupportedLanguage;
  return "fr";
}

i18n.use(initReactI18next).init({
  resources: { fr: { common: fr }, en: { common: en }, ar: { common: ar } },
  lng: detectInitialLanguage(), fallbackLng: "en", defaultNS: "common",
  interpolation: { escapeValue: false },
});

export function setLanguage(lang: SupportedLanguage) {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGUAGES.has(lang) ? "rtl" : "ltr";
}
setLanguage(detectInitialLanguage());
export default i18n;
