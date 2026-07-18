// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LifeLink — Emergency Blood Network Myanmar",
    template: "%s | LifeLink",
  },
  description:
    "LifeLink connects verified hospitals, patients, and compatible blood donors across Myanmar in real time.",
  keywords: [
    "LifeLink",
    "blood donation",
    "blood donor",
    "emergency blood",
    "Myanmar",
    "hospital",
    "patient",
    "blood request",
    "Vertex Red",
  ],
  authors: [
    {
      name: "Team Vertex Red",
    },
  ],
  creator: "Team Vertex Red",
  applicationName: "LifeLink",
  openGraph: {
    title: "LifeLink — Emergency Blood Network Myanmar",
    description:
      "Connecting hospitals, patients, and compatible blood donors when every second matters.",
    type: "website",
    locale: "en_MM",
    siteName: "LifeLink",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeLink — Emergency Blood Network Myanmar",
    description:
      "Connecting blood donors, hospitals, and urgent medical needs across Myanmar.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#101B35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
