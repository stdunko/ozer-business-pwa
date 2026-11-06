import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./ar";
import en from "./en";
import he from "./he";
import ru from "./ru";

i18n.use(initReactI18next).init({
  fallbackLng: "ru",
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    he: { translation: he },
    ar: { translation: ar },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
