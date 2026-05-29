import type { Metadata } from "next";
import { getCurrentLanguage } from "@/lib/i18nServer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Торговые идеи | Trading Ideas",
  description: "Премиальные торговые сигналы в реальном времени | Premium real-time trading signals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = getCurrentLanguage();
  return (
    <html lang={language}>
      <body>{children}</body>
    </html>
  );
}
