import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("push", (event) => {
  let payload = { title: "Ozer Business", body: "", url: "/app/orders" };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data?.text() || "";
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Ozer Business", {
      body: payload.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: payload.url || "/app/orders" },
    })
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
