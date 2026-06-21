import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kiri-site.vercel.app"),
  title: "Kiri — Rede selecionada de neurodesenvolvimento infantil",
  description:
    "Diretório curado de profissionais de neurodesenvolvimento infantil especializados em TEA e TDAH. Formação verificada, contato pela Kiri.",
  openGraph: {
    title: "Kiri — Rede selecionada de neurodesenvolvimento infantil",
    description:
      "Encontre o profissional certo para o desenvolvimento do seu filho. Formação verificada, contato pela Kiri.",
    siteName: "Kiri",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiri — Rede selecionada de neurodesenvolvimento infantil",
    description:
      "Encontre o profissional certo para o desenvolvimento do seu filho. Formação verificada, contato pela Kiri.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${hankenGrotesk.variable}`}>
      <body className="bg-creme min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
