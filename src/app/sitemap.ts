import type { MetadataRoute } from "next";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];
const BASE = "https://www.kirisaude.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/especialidades`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/como-selecionamos`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contato`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/para-profissionais`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/termos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const profissionalPages: MetadataRoute.Sitemap = profissionais
    .filter((p) => !p.oculto)
    .map((p) => ({
      url: `${BASE}/profissional/${p.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...profissionalPages];
}
