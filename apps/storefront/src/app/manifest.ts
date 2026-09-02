import type {
  MetadataRoute,
} from "next";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo";


export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      SITE_NAME,

    short_name:
      "SUGU KURA",

    description:
      SITE_DESCRIPTION,

    start_url:
      "/",

    scope:
      "/",

    display:
      "standalone",

    background_color:
      "#ffffff",

    theme_color:
      "#ff6b00",

    lang:
      "fr",

    categories: [
      "shopping",
      "business",
      "lifestyle",
    ],

    icons: [
      {
        src:
          "/icons/icon-192.png",

        sizes:
          "192x192",

        type:
          "image/png",

        purpose:
          "any",
      },

      {
        src:
          "/icons/icon-512.png",

        sizes:
          "512x512",

        type:
          "image/png",

        purpose:
          "any",
      },

      {
        src:
          "/icons/maskable-512.png",

        sizes:
          "512x512",

        type:
          "image/png",

        purpose:
          "maskable",
      },
    ],

    shortcuts: [
      {
        name:
          "Rechercher",

        short_name:
          "Recherche",

        description:
          "Rechercher un produit sur SUGU KURA",

        url:
          "/recherche",

        icons: [
          {
            src:
              "/icons/icon-192.png",

            sizes:
              "192x192",
          },
        ],
      },

      {
        name:
          "Mon panier",

        short_name:
          "Panier",

        description:
          "Ouvrir mon panier SUGU KURA",

        url:
          "/panier",

        icons: [
          {
            src:
              "/icons/icon-192.png",

            sizes:
              "192x192",
          },
        ],
      },
    ],
  };
}
