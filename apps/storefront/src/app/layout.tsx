import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

import {
  CartHydrator,
} from "@/components/cart/cart-hydrator";

import {
  Footer,
} from "@/components/layout/footer";

import {
  Header,
} from "@/components/layout/header";

import {
  MobileNav,
} from "@/components/layout/mobile-nav";

import {
  PwaManager,
} from "@/components/pwa/pwa-manager";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";


export const metadata:
  Metadata = {
  metadataBase:
    SITE_URL,

  applicationName:
    SITE_NAME,

  manifest:
    "/manifest.webmanifest",

  title: {
    default:
      "SUGU KURA — téléphones, électronique, maison et technologie",

    template:
      "%s | SUGU KURA",
  },

  description:
    SITE_DESCRIPTION,

  keywords: [
    "SUGU KURA",
    "boutique en ligne Mali",
    "téléphones",
    "smartphones",
    "électronique",
    "accessoires téléphone",
    "électroménager",
    "équipements solaires",
    "matériel électrique",
    "quincaillerie",
    "maison",
    "technologie",
  ],

  creator:
    SITE_NAME,

  publisher:
    SITE_NAME,

  category:
    "shopping",

  icons: {
    icon: [
      {
        url:
          "/icons/icon-192.png",

        sizes:
          "192x192",

        type:
          "image/png",
      },

      {
        url:
          "/icons/icon-512.png",

        sizes:
          "512x512",

        type:
          "image/png",
      },
    ],

    apple: [
      {
        url:
          "/icons/apple-touch-icon.png",

        sizes:
          "180x180",

        type:
          "image/png",
      },
    ],
  },

  appleWebApp: {
    capable:
      true,

    title:
      SITE_NAME,

    statusBarStyle:
      "default",
  },

  formatDetection: {
    telephone:
      false,
  },

  alternates: {
    canonical:
      "/",
  },

  openGraph: {
    type:
      "website",

    locale:
      "fr_ML",

    url:
      "/",

    siteName:
      SITE_NAME,

    title:
      "SUGU KURA",

    description:
      SITE_DESCRIPTION,
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "SUGU KURA",

    description:
      SITE_DESCRIPTION,
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};


export const viewport:
  Viewport = {
  width:
    "device-width",

  initialScale:
    1,

  viewportFit:
    "cover",

  themeColor:
    "#ff6b00",
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <CartHydrator />

        <PwaManager />

        <Header />

        <main>
          {children}
        </main>

        <Footer />

        <MobileNav />
      </body>
    </html>
  );
}
