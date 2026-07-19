import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ChatBot } from "@/components/chat/ChatBot";
import { LanguageProvider } from "@/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LifeLink — Every Drop Counts",
  description:
    "Connecting blood donors with patients and hospitals across Myanmar, privately and fast.",
  icons: { icon: "/logo.png" },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-dvh`}>
        <LanguageProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <ChatBot />
        </LanguageProvider>
      </body>
    </html>
  );
};

export default RootLayout;
