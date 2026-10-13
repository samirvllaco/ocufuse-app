/* Ocufuse web app service worker. It makes the app installable and shows reminder notifications.
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
