import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./locales/de.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

const stored = localStorage.getItem("cos-lang");
const language = stored === "fr" || stored === "de" || stored === "en" ? stored : "en";

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, de: { translation: de } },
  lng: language,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
