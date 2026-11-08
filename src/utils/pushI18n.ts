export type PushLang = "ru" | "en" | "he" | "ar";
export type PushKey = "newOrder" | "newMessage" | "orderStatus1" | "orderStatus2" | "orderStatus3" | "orderStatus0";

export const PUSH_TEXTS: Record<PushLang, Record<PushKey, string>> = {
  ru: {
    newOrder: "Новый заказ",
    newMessage: "Новое сообщение",
    orderStatus1: "Новый",
    orderStatus2: "В работе",
    orderStatus3: "Выполнен",
    orderStatus0: "Отменен",
  },
  en: {
    newOrder: "New order",
    newMessage: "New message",
    orderStatus1: "New",
    orderStatus2: "At work",
    orderStatus3: "Completed",
    orderStatus0: "Cancelled",
  },
  he: {
    newOrder: "הזמנה חדשה",
    newMessage: "הודעה חדשה",
    orderStatus1: "חדש",
    orderStatus2: "בעבודה",
    orderStatus3: "הושלם",
    orderStatus0: "בוטל",
  },
  ar: {
    newOrder: "طلب جديد",
    newMessage: "رسالة جديدة",
    orderStatus1: "جديد",
    orderStatus2: "في العمل",
    orderStatus3: "اكتمل",
    orderStatus0: "ألغيت",
  },
};

const ENGLISH_TO_KEY: Record<string, PushKey> = {
  "New order": "newOrder",
  "New message": "newMessage",
  "Looking for an executor": "orderStatus1",
  "Looking for a performer": "orderStatus1",
  New: "orderStatus1",
  "In progress": "orderStatus2",
  "At work": "orderStatus2",
  "Completed": "orderStatus3",
  "Cancelled": "orderStatus0",
  "Canceled": "orderStatus0",
};

const LANG_CACHE = "ozer-app-settings";
const LANG_URL = "/__app-language";

export const normalizePushLang = (value?: string | null): PushLang => {
  const code = (value || "ru").split("-")[0].toLowerCase();
  return code === "en" || code === "he" || code === "ar" ? code : "ru";
};

export const localizePushPayload = (
  payload: { title?: string; body?: string; bodyKey?: string; url?: string },
  language?: string | null
) => {
  const lang = normalizePushLang(language);
  const key = (payload.bodyKey as PushKey) || ENGLISH_TO_KEY[payload.body || ""];
  return {
    title: payload.title || "",
    body: key ? PUSH_TEXTS[lang][key] : payload.body || "",
    url: payload.url,
  };
};

export const persistPushLanguage = async (language: string) => {
  const cache = await caches.open(LANG_CACHE);
  await cache.put(LANG_URL, new Response(normalizePushLang(language)));
};

export const readPushLanguage = async () => {
  try {
    const cache = await caches.open(LANG_CACHE);
    const response = await cache.match(LANG_URL);
    return normalizePushLang(response ? await response.text() : "ru");
  } catch {
    return "ru" as const;
  }
};

export const notifyServiceWorkerLanguage = (language: string) => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  const next = normalizePushLang(language);
  const payload = { type: "SET_LANGUAGE", language: next };
  navigator.serviceWorker.controller?.postMessage(payload);
  void persistPushLanguage(next);
  void navigator.serviceWorker.ready
    .then((registration) => registration.active?.postMessage(payload))
    .catch(() => undefined);
};

export type PushPrefs = {
  orders: boolean;
  chats: boolean;
};

export const PUSH_PREFS_KEY = "ozer-biz-push-prefs";
export const PUSH_PREFS_EVENT = "ozer-push-prefs";

export const defaultPushPrefs = (): PushPrefs => ({ orders: true, chats: true });

export const readPushPrefs = (): PushPrefs => {
  try {
    const raw = localStorage.getItem(PUSH_PREFS_KEY);
    if (!raw) return defaultPushPrefs();
    const parsed = JSON.parse(raw) as Partial<PushPrefs>;
    return {
      orders: parsed.orders !== false,
      chats: parsed.chats !== false,
    };
  } catch {
    return defaultPushPrefs();
  }
};

export const savePushPrefs = (prefs: PushPrefs) => {
  localStorage.setItem(PUSH_PREFS_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event(PUSH_PREFS_EVENT));
};

export const withPushLanguage = (
  subscription: PushSubscription,
  language: string,
  prefs: PushPrefs = readPushPrefs(),
) =>
  JSON.stringify({
    ...subscription.toJSON(),
    language: normalizePushLang(language),
    notifyOrders: prefs.orders,
    notifyChats: prefs.chats,
  });
