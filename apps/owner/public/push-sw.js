self.addEventListener(
  "push",
  (event) => {
    let payload = {
      title: "SUGU KURA",
      body: "Nouvelle notification.",
      url: "/",
      kind: "SYSTEM",
      data: {},
    };

    if (event.data) {
      try {
        payload =
          event.data.json();
      } catch {
        payload.body =
          event.data.text();
      }
    }

    const title =
      payload.title ||
      "SUGU KURA";

    const options = {
      body:
        payload.body ||
        "Nouvelle notification.",

      data: {
        url:
          payload.url ||
          "/",

        kind:
          payload.kind ||
          "SYSTEM",

        ...(
          payload.data ||
          {}
        ),
      },

      tag:
        payload.kind
          ? `sugu-kura-${payload.kind}`
          : "sugu-kura",

      renotify: true,
    };

    event.waitUntil(
      self.registration
        .showNotification(
          title,
          options,
        ),
    );
  },
);


self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const relativeUrl =
      event.notification
        .data
        ?.url ||
      "/";

    const targetUrl =
      new URL(
        relativeUrl,
        self.location.origin,
      ).href;

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled:
            true,
        })
        .then(
          async (
            clientList,
          ) => {
            for (
              const client
              of clientList
            ) {
              if (
                client.url ===
                  targetUrl &&
                "focus" in
                  client
              ) {
                return client.focus();
              }
            }

            if (
              self.clients
                .openWindow
            ) {
              return (
                self.clients
                .openWindow(
                  targetUrl,
                )
              );
            }

            return undefined;
          },
        ),
    );
  },
);