import type { Metadata, Viewport } from "next";
import { Nunito, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { getDict, getLang } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { MotionPauser } from "@/components/motion/MotionPauser";

const nunito = Nunito({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-nunito", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://kadam-virid.vercel.app"),
  title: { default: "Kadam. Take your first step.", template: "%s · Kadam" },
  description: "Kadam. Take your first step. College students solve real problems for small businesses and NGOs, and turn the results into proof of what they can do.",
  openGraph: { title: "Kadam. Take your first step.", description: "College students solve real problems for small businesses and NGOs, and turn the results into proof of what they can do.", siteName: "Kadam" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f7f8fc" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, dict] = await Promise.all([getLang(), getDict()]);
  return (
    <html lang={lang} className={`${nunito.variable} ${hanken.variable} antialiased`}>
      <body className="min-h-dvh">
        <I18nProvider dict={dict} lang={lang}>
          {children}
        </I18nProvider>
        <MotionPauser />
      </body>
    </html>
  );
}
