import { useCallback } from "react";
import { useTranslation } from "react-i18next";

type CategoryLike = {
  name?: string | null;
  icon?: string | null;
};

const NAME_TO_SLUG: Record<string, string> = {
  "сборка мебели": "sborka-mebeli",
  "покраска и отделка": "pokraska-otdelka",
  "окна и двери": "okna-dveri",
  "ремонт бытовой техники": "bytovaya-tehnika",
  сантехника: "santehnika",
  электрика: "elektrika",
  уборка: "uborka",
  переезд: "pereezd",
  садовник: "sadovnik",
  ремонт: "remont",
  кондиционеры: "kondicionery",
  "компьютерная помощь": "kompyuternaya-pomosh",
  "химчистка и мягкая мебель": "himchistka",
  "уход за животными": "zhivotnye",
  "репетиторы и уроки": "repetitory",
  "курьер и поручения": "kurier-porucheniya",
};

const LABELS: Record<string, Record<string, string>> = {
  ru: {
    "sborka-mebeli": "Сборка мебели",
    "pokraska-otdelka": "Покраска и отделка",
    "okna-dveri": "Окна и двери",
    "bytovaya-tehnika": "Ремонт бытовой техники",
    santehnika: "Сантехника",
    elektrika: "Электрика",
    uborka: "Уборка",
    pereezd: "Переезд",
    sadovnik: "Садовник",
    remont: "Ремонт",
    kondicionery: "Кондиционеры",
    "kompyuternaya-pomosh": "Компьютерная помощь",
    himchistka: "Химчистка и мягкая мебель",
    zhivotnye: "Уход за животными",
    repetitory: "Репетиторы и уроки",
    "kurier-porucheniya": "Курьер и поручения",
  },
  en: {
    "sborka-mebeli": "Furniture assembly",
    "pokraska-otdelka": "Painting and finishing",
    "okna-dveri": "Windows and doors",
    "bytovaya-tehnika": "Appliance repair",
    santehnika: "Plumbing",
    elektrika: "Electrical",
    uborka: "Cleaning",
    pereezd: "Moving",
    sadovnik: "Gardening",
    remont: "Renovation",
    kondicionery: "Air conditioning",
    "kompyuternaya-pomosh": "Computer help",
    himchistka: "Dry cleaning and upholstery",
    zhivotnye: "Pet care",
    repetitory: "Tutors and lessons",
    "kurier-porucheniya": "Courier and errands",
  },
  he: {
    "sborka-mebeli": "הרכבת רהיטים",
    "pokraska-otdelka": "צביעה וגימור",
    "okna-dveri": "חלונות ודלתות",
    "bytovaya-tehnika": "תיקון מכשירי חשמל",
    santehnika: "אינסטלציה",
    elektrika: "חשמל",
    uborka: "ניקיון",
    pereezd: "הובלה",
    sadovnik: "גינון",
    remont: "שיפוץ",
    kondicionery: "מזגנים",
    "kompyuternaya-pomosh": "עזרה במחשבים",
    himchistka: "ניקוי יבש וריפוד",
    zhivotnye: "טיפול בחיות",
    repetitory: "מורים פרטיים",
    "kurier-porucheniya": "שליחויות ומשימות",
  },
  ar: {
    "sborka-mebeli": "تجميع الأثاث",
    "pokraska-otdelka": "دهان وتشطيب",
    "okna-dveri": "نوافذ وأبواب",
    "bytovaya-tehnika": "إصلاح الأجهزة المنزلية",
    santehnika: "سباكة",
    elektrika: "كهرباء",
    uborka: "تنظيف",
    pereezd: "نقل عفش",
    sadovnik: "بستنة",
    remont: "ترميم",
    kondicionery: "مكيفات",
    "kompyuternaya-pomosh": "مساعدة الحاسوب",
    himchistka: "تنظيف جاف وأثاث",
    zhivotnye: "رعاية الحيوانات",
    repetitory: "دروس خصوصية",
    "kurier-porucheniya": "توصيل ومهام",
  },
};

export const categorySlug = (category?: CategoryLike | string | null) => {
  const name = typeof category === "string" ? category : category?.name;
  const icon = typeof category === "string" ? undefined : category?.icon;
  const fromIcon = icon?.match(/category-([a-z0-9-]+)\./i)?.[1];
  if (fromIcon) {
    return fromIcon;
  }
  const key = name?.trim().toLowerCase();
  return key ? NAME_TO_SLUG[key] ?? null : null;
};

export const categoryLabel = (
  category?: CategoryLike | string | null,
  language?: string | null
) => {
  const name = (typeof category === "string" ? category : category?.name) || "";
  const slug = categorySlug(category);
  if (!slug) {
    return name;
  }
  const lang = (language || "ru").split("-")[0];
  const table = LABELS[lang] || LABELS.ru;
  return table[slug] || LABELS.ru[slug] || name;
};

export const useCategoryLabel = () => {
  const { i18n } = useTranslation();
  return useCallback(
    (category?: CategoryLike | string | null) => categoryLabel(category, i18n.language),
    [i18n.language]
  );
};
