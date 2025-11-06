import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Import translation files
import enTranslations from "../locales/en.json"
import jaTranslations from "../locales/ja.json"

const resources = {
  en: {
    translation: enTranslations,
  },
  ja: {
    translation: jaTranslations,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language if translation is missing
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
})

export default i18n
