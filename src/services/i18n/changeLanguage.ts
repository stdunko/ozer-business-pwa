import type { LanguageCode } from "../../utils/languages";
import { isRtlLanguage } from "../../utils/languages";
import { storage } from "../../utils/storage";
import i18n from "./index";

export const applyDocumentDirection = (language: string) => {
  const rtl = isRtlLanguage(language);
  document.documentElement.lang = language;
  document.documentElement.dir = rtl ? "rtl" : "ltr";
};

export const changeAppLanguage = async (language: LanguageCode) => {
  storage.set("language", language);
  applyDocumentDirection(language);
  await i18n.changeLanguage(language);
};

export const bootstrapAppLanguage = async (): Promise<boolean> => {
  const savedLanguage = storage.get("language");
  const language = (savedLanguage as LanguageCode) || "ru";
  applyDocumentDirection(language);
  await i18n.changeLanguage(language);
  return true;
};
