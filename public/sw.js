// FIFA 360 service worker — push notifications for departure + key moments.
// Event listener structure matches CLAUDE.md; do not change without telling Person B.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "FIFA 360", body: event.data ? event.data.text() : "" };
  }
  self.registration.showNotification(data.title || "FIFA 360", {
    body: data.body,
    icon: "/icon.svg",
    badge: "/badge.svg",
    data: { url: data.url || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
