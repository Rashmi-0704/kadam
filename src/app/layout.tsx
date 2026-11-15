import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { getDict, getLang } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Kadam · Real Problems, Real Impact, Real Careers", template: "%s · Kadam" },
  description: "College students solve real problems for small businesses and NGOs, and turn the results into proof of what they can do.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fbf7f0" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, dict] = await Promise.all([getLang(), getDict()]);
  return (
    <html lang={lang} className={`${bricolage.variable} ${hanken.variable} antialiased`}>
      <body className="min-h-dvh">
        <I18nProvider dict={dict} lang={lang}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
