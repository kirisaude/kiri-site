import type { Metadata } from "next";
import { CompartilharRedirect } from "./redirect";

export const metadata: Metadata = {
  title: "Kiri — rede de cuidado ao neurodesenvolvimento",
  description:
    "Psicólogos, fonoaudiólogos, neuropediatras, terapeutas ocupacionais e mais — com formação conferida, para você decidir com segurança.",
  openGraph: {
    title: "Kiri — rede de cuidado ao neurodesenvolvimento",
    description:
      "Psicólogos, fonoaudiólogos, neuropediatras, terapeutas ocupacionais e mais — com formação conferida, para você decidir com segurança.",
    url: "https://www.kirisaude.com.br/compartilhar",
    siteName: "Kiri",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://www.kirisaude.com.br/api/share-card",
        width: 1080,
        height: 1080,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiri — rede de cuidado ao neurodesenvolvimento",
    description:
      "Psicólogos, fonoaudiólogos, neuropediatras, terapeutas ocupacionais e mais — com formação conferida, para você decidir com segurança.",
    images: ["https://www.kirisaude.com.br/api/share-card"],
  },
};

export default function CompartilharPage() {
  return <CompartilharRedirect />;
}
