import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { updateExecutorPushSubscription } from "../services/api";
import { appConfig } from "../config";
import { useAppSelector } from "../store/hooks";
import { notifyServiceWorkerLanguage, withPushLanguage } from "../utils/pushI18n";

const urlBase64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
};

const showLocalNotification = (title: string, body: string, url = "/app/orders") => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  const notification = new Notification(title, { body, icon: "/icon-192.png", tag: url, data: { url } });
  notification.onclick = () => {
    window.focus();
    window.dispatchEvent(new CustomEvent("ozer-navigate", { detail: { url } }));
    notification.close();
  };
};

export const notifyIfHidden = (title: string, body: string, url?: string) => {
  if (document.visibilityState === "hidden") {
    showLocalNotification(title, body, url);
  }
};

export const usePushNotifications = () => {
  const { i18n } = useTranslation();
  const executorId = useAppSelector((state) => state.executor.id);
  const token = useAppSelector((state) => state.authorization.token);
  const language = i18n.language;

  useEffect(() => {
    if (!token || !executorId || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      const permission =
        Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") {
        return;
      }

      const existing = await navigator.serviceWorker.getRegistration();
      const registration =
        existing ||
        (await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
        ]));
      if (!registration?.pushManager) {
        return;
      }
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(appConfig.vapidPublicKey),
        });
      }
      notifyServiceWorkerLanguage(language);
      await updateExecutorPushSubscription(executorId, withPushLanguage(subscription, language));
    };

    void register().catch((error) => console.error("Web Push:", error));
  }, [executorId, language, token]);
};
