import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { localizePushPayload, persistPushLanguage, readPushLanguage } from "./utils/pushI18n";

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_LANGUAGE" && event.data.language) {
    event.waitUntil(persistPushLanguage(event.data.language));
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = { title: "OzerilBusiness", body: "", url: "/app/orders" };
      try {
        payload = { ...payload, ...event.data.json() };
      } catch {
        payload.body = event.data?.text() || "";
      }
      const localized = localizePushPayload(payload, await readPushLanguage());
      await self.registration.showNotification(localized.title || "OzerilBusiness", {
        body: localized.body || "",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: localized.url || payload.url || "/app/orders" },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app/orders";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if ("focus" in client) {
          await client.focus();
          client.postMessage({ type: "NAVIGATE", url });
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
