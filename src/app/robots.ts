import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/card/", "/avaliar/", "/followup/"],
    },
    sitemap: "https://kirisaude.com.br/sitemap.xml",
  };
}
