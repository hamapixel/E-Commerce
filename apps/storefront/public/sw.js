const CACHE_PREFIX =
  "sugu-kura-pwa";

const CACHE_VERSION =
  "v1";

const STATIC_CACHE =
  `${CACHE_PREFIX}-static-${CACHE_VERSION}`;

const OFFLINE_URL =
  "/hors-ligne";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];


function isExcludedNavigation(
  pathname,
) {
  return (
    pathname ===
      "/panier"
    ||
    pathname.startsWith(
      "/checkout",
    )
    ||
    pathname.startsWith(
      "/commande",
    )
  );
}


function isStaticAsset(
  pathname,
) {
  return (
    pathname.startsWith(
      "/_next/static/",
    )
    ||
    pathname.startsWith(
      "/icons/",
    )
    ||
    pathname.endsWith(
      ".css",
    )
    ||
    pathname.endsWith(
      ".js",
    )
    ||
    pathname.endsWith(
      ".woff",
    )
    ||
    pathname.endsWith(
      ".woff2",
    )
  );
}


function isCacheableImage(
  request,
) {
  return (
    request.destination ===
    "image"
  );
}


async function cacheResponse(
  cache,
  request,
  response,
) {
  if (
    response
    &&
    response.ok
    &&
    response.type !==
      "opaque"
  ) {
    await cache.put(
      request,
      response.clone(),
    );
  }

  return response;
}


async function precacheOfflinePage() {
  const cache =
    await caches.open(
      STATIC_CACHE,
    );

  await Promise.all(
    PRECACHE_URLS.map(
      async (
        url,
      ) => {
        try {
          const response =
            await fetch(
              url,
              {
                cache:
                  "reload",
              },
            );

          if (
            response.ok
          ) {
            await cache.put(
              url,
              response.clone(),
            );
          }

          if (
            url !==
            OFFLINE_URL
            ||
            !response.ok
          ) {
            return;
          }

          const html =
            await response.text();

          const matches = [
            ...html.matchAll(
              /(?:src|href)="([^"]+)"/g,
            ),
          ];

          const assetUrls =
            matches
              .map(
                (
                  match,
                ) =>
                  match[1],
              )
              .filter(
                (
                  assetUrl,
                ) =>
                  assetUrl.startsWith(
                    "/_next/static/",
                  ),
              );

          await Promise.all(
            assetUrls.map(
              async (
                assetUrl,
              ) => {
                try {
                  const assetResponse =
                    await fetch(
                      assetUrl,
                      {
                        cache:
                          "reload",
                      },
                    );

                  if (
                    assetResponse.ok
                  ) {
                    await cache.put(
                      assetUrl,
                      assetResponse,
                    );
                  }
                }
                catch {
                  /*
                   * Un seul fichier statique
                   * ne doit pas empêcher
                   * l'installation de la PWA.
                   */
                }
              },
            ),
          );
        }
        catch {
          /*
           * La PWA reste installable.
           * Le prochain chargement en ligne
           * pourra remplir le cache.
           */
        }
      },
    ),
  );
}


self.addEventListener(
  "install",
  (
    event,
  ) => {
    event.waitUntil(
      precacheOfflinePage()
        .then(
          () =>
            self.skipWaiting(),
        ),
    );
  },
);


self.addEventListener(
  "activate",
  (
    event,
  ) => {
    event.waitUntil(
      caches
        .keys()
        .then(
          (
            keys,
          ) =>
            Promise.all(
              keys
                .filter(
                  (
                    key,
                  ) =>
                    key.startsWith(
                      CACHE_PREFIX,
                    )
                    &&
                    key !==
                      STATIC_CACHE,
                )
                .map(
                  (
                    key,
                  ) =>
                    caches.delete(
                      key,
                    ),
                ),
            ),
        )
        .then(
          () =>
            self.clients.claim(),
        ),
    );
  },
);


self.addEventListener(
  "message",
  (
    event,
  ) => {
    if (
      event.data ===
      "SKIP_WAITING"
    ) {
      void self.skipWaiting();
    }
  },
);


self.addEventListener(
  "fetch",
  (
    event,
  ) => {
    const {
      request,
    } = event;

    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url,
      );

    /*
     * Le backend Django est sur une autre
     * origine. On ne met jamais en cache
     * ses réponses API ici afin de ne pas
     * servir des stocks ou des prix périmés.
     */
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    if (
      url.pathname ===
        "/sw.js"
      ||
      url.pathname ===
        "/robots.txt"
      ||
      url.pathname ===
        "/sitemap.xml"
    ) {
      return;
    }

    /*
     * Navigation :
     * - toujours réseau en priorité ;
     * - aucune page commerciale dynamique
     *   n'est mise en cache pour éviter
     *   d'afficher un ancien stock/prix ;
     * - hors ligne, on affiche la page dédiée.
     */
    if (
      request.mode ===
      "navigate"
    ) {
      if (
        isExcludedNavigation(
          url.pathname,
        )
      ) {
        event.respondWith(
          fetch(
            request,
          ),
        );

        return;
      }

      event.respondWith(
        fetch(
          request,
        ).catch(
          async () => {
            const cache =
              await caches.open(
                STATIC_CACHE,
              );

            return (
              await cache.match(
                OFFLINE_URL,
              )
              ||
              Response.error()
            );
          },
        ),
      );

      return;
    }

    /*
     * Fichiers statiques Next.js :
     * cache-first, car leurs noms sont
     * versionnés/hashés par Next.
     */
    if (
      isStaticAsset(
        url.pathname,
      )
    ) {
      event.respondWith(
        caches
          .open(
            STATIC_CACHE,
          )
          .then(
            async (
              cache,
            ) => {
              const cached =
                await cache.match(
                  request,
                );

              if (
                cached
              ) {
                return cached;
              }

              const response =
                await fetch(
                  request,
                );

              return cacheResponse(
                cache,
                request,
                response,
              );
            },
          ),
      );

      return;
    }

    /*
     * Images locales du storefront :
     * réseau d'abord, cache en secours.
     * Les images du backend externe ne sont
     * pas interceptées par ce Service Worker.
     */
    if (
      isCacheableImage(
        request,
      )
    ) {
      event.respondWith(
        caches
          .open(
            STATIC_CACHE,
          )
          .then(
            async (
              cache,
            ) => {
              try {
                const response =
                  await fetch(
                    request,
                  );

                return cacheResponse(
                  cache,
                  request,
                  response,
                );
              }
              catch {
                return (
                  await cache.match(
                    request,
                  )
                  ||
                  Response.error()
                );
              }
            },
          ),
      );
    }
  },
);
