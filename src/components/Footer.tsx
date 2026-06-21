import { KiriLogo } from "./KiriLogo";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full pt-4 border-t border-linha flex items-center justify-between gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <KiriLogo size={20} />
        <span className="text-[13px] text-muted">Kiri · Rede selecionada de cuidado ao neurodesenvolvimento</span>
      </div>
      <a href="/termos" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos de Uso</a>
    </div>
  );
}
