"use client";

import Link from "next/link";
import { KiriLogoCompact } from "./KiriLogoCompact";

const NAV_LINKS = [
  { href: "/sobre", label: "Sobre" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/como-selecionamos", label: "Como selecionamos" },
  { href: "/contato", label: "Fale conosco" },
];

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function Footer({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full border-t border-linha ${className}`}>

      {/* Desktop — linha única */}
      <div className="hidden md:flex items-center justify-between" style={{ paddingTop: 24, paddingBottom: 26 }}>

        {/* Esquerda: logo */}
        <Link href="/" className="flex items-center no-underline flex-none">
          <KiriLogoCompact height={24} />
        </Link>

        {/* Centro-direita: links nav + termos */}
        <div className="flex items-center" style={{ gap: 24 }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="no-underline hover:text-carvao transition-colors"
              style={{ fontSize: 14, color: "#6E6457" }}
            >
              {label}
            </Link>
          ))}
          <Link href="/termos" className="no-underline hover:text-carvao transition-colors" style={{ fontSize: 14, color: "#8A7E6A" }}>Termos de uso</Link>
          <Link href="/politica-de-privacidade" className="no-underline hover:text-carvao transition-colors" style={{ fontSize: 14, color: "#8A7E6A" }}>Privacidade</Link>
        </div>

        {/* Extrema direita: Instagram */}
        <a
          href="https://www.instagram.com/kiri.saude"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center no-underline flex-none"
          style={{ gap: 7 }}
        >
          <InstagramIcon size={14} />
          <span style={{ fontSize: 14, color: "#44606C" }}>Siga-nos no Instagram</span>
          <span style={{ fontSize: 14, color: "#BE6E4E", fontWeight: 600 }}>@kiri.saude</span>
        </a>

      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col items-center" style={{ paddingTop: 20, paddingBottom: 22, gap: 18 }}>

        {/* Linha 1: Instagram centralizado */}
        <a
          href="https://www.instagram.com/kiri.saude"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center no-underline"
          style={{ gap: 8 }}
        >
          <InstagramIcon size={15} />
          <span className="text-[14px]" style={{ color: "#44606C" }}>Siga-nos no Instagram</span>
          <span className="text-[14px] font-semibold" style={{ color: "#BE6E4E" }}>@kiri.saude</span>
        </a>

        {/* Linha 2: logo centralizada */}
        <Link href="/" className="flex items-center justify-center no-underline">
          <KiriLogoCompact height={22} />
        </Link>

        {/* Linha 3: links centralizados */}
        <div className="flex items-center justify-center" style={{ gap: 14, marginTop: 12 }}>
          <a href="/contato" className="no-underline" style={{ fontSize: 13, color: "#6E6457" }}>Fale conosco</a>
          <a href="/termos" className="no-underline" style={{ fontSize: 13, color: "#6E6457" }}>Termos</a>
          <a href="/politica-de-privacidade" className="no-underline" style={{ fontSize: 13, color: "#6E6457" }}>Privacidade</a>
        </div>

      </div>

    </div>
  );
}
