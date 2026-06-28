import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kirisaude.com.br"),
  title: "Kiri — rede de cuidado ao neurodesenvolvimento",
  description:
    "Encontre profissionais com formação verificada para TEA, TDAH e neurodesenvolvimento infantil.",
  icons: {
    icon: [
      { url: "/kiri-icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/kiri-icon-512.png", sizes: "512x512", type: "image/png" },
  },
  openGraph: {
    title: "Kiri — rede de cuidado ao neurodesenvolvimento",
    description:
      "Encontre profissionais com formação verificada para TEA, TDAH e neurodesenvolvimento infantil.",
    url: "https://kirisaude.com.br",
    siteName: "Kiri",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/kiri-og-2.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiri — rede de cuidado ao neurodesenvolvimento",
    description:
      "Encontre profissionais com formação verificada para TEA, TDAH e neurodesenvolvimento infantil.",
    images: ["/kiri-og-2.png"],
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
