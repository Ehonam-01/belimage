import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BelImage — Créez vos affiches par IA",
  description:
    "Générez des affiches professionnelles à partir de vos modèles. SaaS IA de création d'affiches personnalisées.",
  keywords: ["affiche", "IA", "design", "génération", "poster", "création"],
  openGraph: {
    title: "BelImage — Créez vos affiches par IA",
    description:
      "Générez des affiches professionnelles à partir de vos modèles.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
