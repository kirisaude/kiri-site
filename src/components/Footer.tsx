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

      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-2 no-underline flex-none">
          <KiriLogoCompact height={24} />
        </Link>
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
      <div className="md:hidden flex items-center justify-between gap-2 py-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <KiriLogoCompact height={24} />
        </Link>
        <div className="flex items-center gap-3">
          <a href="/contato" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Fale conosco</a>
          <a href="/termos" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos</a>
          <a href="/politica-de-privacidade" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Privacidade</a>
        </div>
      </div>

    </div>
  );
}
