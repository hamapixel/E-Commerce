import type {
  Metadata,
} from "next";

import "./globals.css";


export const metadata: Metadata = {
  applicationName:
    "SUGU KURA OWNER",

  title:
    "SUGU KURA — Console propriétaire",

  description:
    "Console de gestion propriétaire SUGU KURA.",

  manifest:
    "/manifest.webmanifest",

  icons: {
    icon:
      "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}