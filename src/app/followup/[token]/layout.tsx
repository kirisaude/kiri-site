import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avaliação — Kiri",
  description: "Como foi sua experiência? Leva menos de 1 minuto.",
  openGraph: {
    title: "Avaliação — Kiri",
    description: "Como foi sua experiência? Sua resposta nos ajuda muito.",
    siteName: "Kiri",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
