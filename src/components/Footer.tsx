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

      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-5 flex-none">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <KiriLogoCompact height={24} />
          </Link>
          <a
            href="https://www.instagram.com/kiri.saude"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 no-underline transition-colors"
            style={{ color: "#9A8C78" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#44606C")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9A8C78")}
          >
            <InstagramIcon size={14} />
            <span className="text-[13px] font-medium">@kiri.saude</span>
          </a>
        </div>
        <div className="flex items-center gap-5">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[14px] font-medium no-underline hover:text-carvao transition-colors"
              style={{ color: "#6E6457" }}
            >
              {label}
            </Link>
          ))}
          <span className="text-[#D8C7B0] select-none">·</span>
          <Link href="/termos" className="text-[12px] text-muted no-underline hover:text-cinza-texto transition-colors">Termos</Link>
          <Link href="/politica-de-privacidade" className="text-[12px] text-muted no-underline hover:text-cinza-texto transition-colors">Privacidade</Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col items-center" style={{ paddingTop: 28, paddingBottom: 28, gap: 20 }}>
        <Link href="/" className="flex items-center no-underline">
          <KiriLogoCompact height={24} />
        </Link>
        <div className="flex items-center gap-5">
          <a href="/contato" className="text-[15px] no-underline" style={{ color: "#6E6457" }}>Fale conosco</a>
          <a href="/termos" className="text-[15px] no-underline" style={{ color: "#6E6457" }}>Termos</a>
          <a href="/politica-de-privacidade" className="text-[15px] no-underline" style={{ color: "#6E6457" }}>Privacidade</a>
        </div>
        <a
          href="https://www.instagram.com/kiri.saude"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 no-underline"
          style={{ color: "#9A8C78" }}
        >
          <InstagramIcon size={14} />
          <span className="text-[15px] font-medium">@kiri.saude</span>
        </a>
      </div>

    </div>
  );
}
