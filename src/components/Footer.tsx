import { KiriLogoCompact } from "./KiriLogoCompact";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full pt-4 border-t border-linha flex items-center justify-between gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <KiriLogoCompact height={24} />
        <span className="hidden sm:inline text-[13px] text-muted">· Rede de cuidado ao neurodesenvolvimento infantil</span>
      </div>
      <div className="flex items-center gap-3">
        <a href="/termos" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos de Uso</a>
        <a href="/politica-de-privacidade" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Privacidade</a>
      </div>
    </div>
  );
}
