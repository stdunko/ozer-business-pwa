export type LanguageCode = "ru" | "en" | "he" | "ar";

export const LANGUAGES: Array<{ code: LanguageCode; flag: string; label: string; rtl: boolean }> = [
  { code: "ru", flag: "🇷🇺", label: "Русский", rtl: false },
  { code: "en", flag: "🇬🇧", label: "English", rtl: false },
  { code: "he", flag: "🇮🇱", label: "עברית", rtl: true },
  { code: "ar", flag: "🇸🇦", label: "العربية", rtl: true },
];

export const getLanguageByCode = (code: string) =>
  LANGUAGES.find((lang) => lang.code === code) ?? LANGUAGES[0];

export const isRtlLanguage = (language: string) => {
  const code = language.split("-")[0] as LanguageCode;
  return LANGUAGES.some((lang) => lang.code === code && lang.rtl);
};
