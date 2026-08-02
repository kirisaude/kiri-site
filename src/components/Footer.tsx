import Link from "next/link";
import { KiriLogoCompact } from "./KiriLogoCompact";

const NAV_LINKS = [
  { href: "/sobre", label: "Sobre" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/como-selecionamos", label: "Como selecionamos" },
  { href: "/contato", label: "Fale conosco" },
];

export function Footer({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full border-t border-linha ${className}`}>

      {/* Desktop: logo + nav editorial */}
      <div className="hidden md:flex items-center justify-between gap-8 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2 no-underline flex-none">
          <KiriLogoCompact height={26} />
        </Link>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[18px] text-carvao no-underline hover:text-ardosia transition-colors"
              style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 400 }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Linha utilitária (desktop) */}
      <div className="hidden md:flex justify-between items-center pb-4 border-t border-linha-sutil pt-3">
        <span className="text-[12px] text-muted">© {new Date().getFullYear()} Kiri</span>
        <div className="flex items-center gap-3">
          <Link href="/termos" className="text-[12px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos de Uso</Link>
          <Link href="/politica-de-privacidade" className="text-[12px] text-muted hover:text-cinza-texto transition-colors no-underline">Privacidade</Link>
        </div>
      </div>

      {/* Mobile: layout compacto original */}
      <div className="md:hidden flex items-center justify-between gap-2 py-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <KiriLogoCompact height={24} />
        </Link>
        <div className="flex items-center gap-3">
          <a href="/contato" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Fale conosco</a>
          <a href="/termos" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos de Uso</a>
          <a href="/politica-de-privacidade" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Privacidade</a>
        </div>
      </div>

    </div>
  );
}
