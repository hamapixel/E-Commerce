import type {
  NextConfig,
} from "next";


const isDevelopment =
  process.env.NODE_ENV !==
  "production";


const securityHeaders = [
  {
    key:
      "X-Content-Type-Options",

    value:
      "nosniff",
  },

  {
    key:
      "X-Frame-Options",

    value:
      "DENY",
  },

  {
    key:
      "Referrer-Policy",

    value:
      "no-referrer",
  },

  {
    key:
      "Permissions-Policy",

    value:
      (
        "camera=(), "
        + "microphone=(), "
        + "geolocation=()"
      ),
  },

  {
    key:
      "X-Robots-Tag",

    value:
      (
        "noindex, nofollow, "
        + "noarchive, nosnippet"
      ),
  },

  {
    key:
      "Cache-Control",

    value:
      (
        "no-store, no-cache, "
        + "must-revalidate, max-age=0"
      ),
  },

  {
    key:
      "X-DNS-Prefetch-Control",

    value:
      "off",
  },
];


if (!isDevelopment) {
  securityHeaders.push({
    key:
      "Strict-Transport-Security",

    value:
      (
        "max-age=31536000; "
        + "includeSubDomains"
      ),
  });
}


const nextConfig:
  NextConfig = {

  experimental: {
    serverActions: {
      bodySizeLimit:
        "10mb",
    },
  },

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
    ],
  },

  async headers() {
    return [
      {
        source:
          "/(.*)",

        headers:
          securityHeaders,
      },
    ];
  },
};


export default nextConfig;