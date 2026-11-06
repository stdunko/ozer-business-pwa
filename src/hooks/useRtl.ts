import { useTranslation } from "react-i18next";
import { isRtlLanguage } from "../utils/languages";

export const useRtl = () => {
  const { i18n } = useTranslation();
  const isRtl = isRtlLanguage(i18n.language);

  return {
    isRtl,
    textAlign: (isRtl ? "right" : "left") as "right" | "left",
    dir: (isRtl ? "rtl" : "ltr") as "rtl" | "ltr",
  };
};
