import type {
  NextConfig,
} from "next";


const isDevelopment =
  process.env.NODE_ENV !==
  "production";


const nextConfig:
  NextConfig = {

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.6",
  ],

  images: {
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

      // ==============================
      // TÉLÉPHONE / RÉSEAU LOCAL
      // ==============================
      {
        protocol:
          "http",

        hostname:
          "192.168.1.6",

        port:
          "8000",

        pathname:
          "/media/**",
      },
    ],
  },
};


export default nextConfig;