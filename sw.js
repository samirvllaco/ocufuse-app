/* Ocufuse web app service worker. It makes the app installable and shows reminder notifications, local and pushed.
   It caches nothing, so every visit loads the latest app. A tap on a notification opens or focuses the app. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "/", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) if (c.url.startsWith(self.location.origin)) { c.focus(); c.navigate?.(url); return; }
    return self.clients.openWindow(url);
  }));
});

/* Web push (send-reminders Edge Function): a small JSON payload { title, body, url, tag }. */
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = {}; }
  const title = d.title || "Ocufuse";
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || "", icon: "/logo-192.png", badge: "/favicon-64.png", tag: d.tag || "ocufuse", data: { url: d.url || "/" },
  }));
});
