import { useEffect } from "react";
import { updateExecutorPushSubscription } from "../services/api";
import { appConfig } from "../config";
import { useAppSelector } from "../store/hooks";

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
  const notification = new Notification(title, { body, icon: "/icon-192.png" });
  notification.onclick = () => {
    window.focus();
    window.location.href = url;
    notification.close();
  };
};

export const notifyIfHidden = (title: string, body: string, url?: string) => {
  if (document.visibilityState === "hidden") {
    showLocalNotification(title, body, url);
  }
};

export const usePushNotifications = () => {
  const executorId = useAppSelector((state) => state.executor.id);
  const token = useAppSelector((state) => state.authorization.token);

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
      await updateExecutorPushSubscription(executorId, JSON.stringify(subscription));
    };

    void register().catch((error) => console.error("Web Push:", error));
  }, [executorId, token]);
};
