import type {
  NextConfig,
} from "next";


const isDevelopment =
  process.env.NODE_ENV !==
  "production";


const nextConfig:
  NextConfig = {

  /*
   * Autorise explicitement l'accès au serveur de
   * développement Next.js depuis le téléphone sur
   * le réseau local.
   *
   * Sans cela, les ressources internes /_next/*
   * peuvent être considérées comme venant d'une
   * origine de développement différente.
   */
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.6",
  ],

  images: {
    /*
     * Next.js 16 bloque par sécurité
     * l'optimisation d'images provenant
     * d'une IP locale.
     *
     * Django tourne sur 127.0.0.1:8000
     * pendant le développement.
     */
    dangerouslyAllowLocalIP:
      isDevelopment,

    remotePatterns: [
      {
        protocol:
          "http",

        hostname:
          "127.0.0.1",

        port:
          "8000",

        pathname:
          "/media/**",
      },

      {
        protocol:
          "http",

        hostname:
          "localhost",

        port:
          "8000",

        pathname:
          "/media/**",
      },
    ],
  },
};


export default nextConfig;