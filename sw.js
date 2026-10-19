/* Ocufuse web app service worker. It makes the app installable and shows reminder notifications, local and pushed.
   It caches nothing, so every visit loads the latest app. A tap on a notification opens or focuses the app. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  // from=notif lets the app count that a reminder was opened (core/telemetry.js); only that fixed word is added.
  const u = new URL(e.notification.data?.url || "/", self.location.origin);
  u.searchParams.set("from", "notif");
  const url = u.href;
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
    // renotify: a reminder that replaces one still in the notification centre is announced again, not swapped silently.
    body: d.body || "", icon: "/logo-192.png", badge: "/favicon-64.png", tag: d.tag || "ocufuse", renotify: true, data: { url: d.url || "/" },
  }));
});
