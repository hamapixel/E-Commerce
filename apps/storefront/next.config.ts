import type {
  NextConfig,
} from "next";


const isDevelopment =
  process.env.NODE_ENV !==
  "production";


const nextConfig:
  NextConfig = {

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