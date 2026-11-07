import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { localizePushPayload, persistPushLanguage, readPushLanguage } from "./utils/pushI18n";

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const toAppPath = (raw) => {
  try {
    const url = String(raw || "").startsWith("http") ? new URL(raw) : new URL(raw || "/app/orders", self.location.origin);
    return `${url.pathname}${url.search}${url.hash}` || "/app/orders";
  } catch {
    return "/app/orders";
  }
};

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
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (windows.length) {
        return;
      }
      const localized = localizePushPayload(payload, await readPushLanguage());
      const url = toAppPath(localized.url || payload.url);
      await self.registration.showNotification(localized.title || "OzerilBusiness", {
        body: localized.body || "",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: payload.tag || url,
        renotify: true,
        data: { url },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = toAppPath(event.notification.data?.url);
  const absolute = new URL(path, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          await client.focus();
          client.postMessage({ type: "NAVIGATE", url: path });
          return;
        }
      }
      await self.clients.openWindow(absolute);
    })()
  );
});
