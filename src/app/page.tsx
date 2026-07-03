"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { KiriLogo } from "@/components/KiriLogo";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import { SeloMini } from "@/components/SeloVerificado";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { PROFISSOES_ORDENADAS, PROFISSAO_PLURAL, cidadeCurta, modalidadeCurta } from "@/types";
import { Footer } from "@/components/Footer";

const profissionais = data.profissionais as Profissional[];
const FILTROS_MODALIDADE = ["Presencial e online", "Somente presencial", "Somente online"];

function normCidade(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Deduplica por nome normalizado; para cada grupo, mantém a versão mais completa (mais longa)
const CIDADES_DISPONIVEIS = (() => {
  const mapa = new Map<string, string>();
  for (const p of profissionais) {
    const curta = cidadeCurta(p.cidade);
    if (!curta) continue;
    const chave = normCidade(curta);
    const atual = mapa.get(chave);
    if (!atual || curta.length > atual.length) mapa.set(chave, curta);
  }
  return [...mapa.values()].sort();
})();

function EmBreve() {
  return (
    <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6">
      <KiriLogo size={72} />
      <div className="font-serif text-[38px] md:text-[48px] font-medium text-ferrugem tracking-[-0.01em] mt-4">
        Kiri
      </div>
      <p className="mt-4 text-[16px] md:text-[18px] text-cinza-texto text-center max-w-sm leading-[1.6]"
        style={{ textWrap: "balance" } as React.CSSProperties}>
        Em breve. Uma rede de cuidado ao neurodesenvolvimento infantil.
      </p>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCond, setActiveCond] = useState<string | null>(null);
  const [activeProfissao, setActiveProfissao] = useState<string | null>(null);
  const [activeModalidade, setActiveModalidade] = useState<string | null>(null);
  const [showProfissaoOptions, setShowProfissaoOptions] = useState(false);
  const [showModalidadeOptions, setShowModalidadeOptions] = useState(false);
  const [showPagamentoOptions, setShowPagamentoOptions] = useState(false);
  const [activePagamento, setActivePagamento] = useState<string | null>(null);
  const [showCidadeOptions, setShowCidadeOptions] = useState(false);
  const [activeCidade, setActiveCidade] = useState<string | null>(null);
  const [showValorOptions, setShowValorOptions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCompartilhar, setShowCompartilhar] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const shareBlobRef = useRef<Blob | null>(null);

  const SHARE_URL = "https://www.kirisaude.com.br/compartilhar";

  useEffect(() => {
    if (!showCompartilhar) { shareBlobRef.current = null; setShareReady(false); return; }
    setShareReady(false);
    fetch("/api/share-card")
      .then((r) => r.blob())
      .then((blob) => { shareBlobRef.current = blob; setShareReady(true); })
      .catch(() => { setShareReady(true); });
  }, [showCompartilhar]);

  function copiarLink() {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function compartilharWhatsApp() {
    const blob = shareBlobRef.current;
    if (blob && navigator.share) {
      const file = new File([blob], "kiri.png", { type: "image/png" });
      // Tenta enviar o arquivo diretamente (mostra a imagem no WhatsApp)
      navigator.share({ files: [file] }).catch(() => {
        // Se o envio de arquivo falhar, cai para compartilhamento de URL
        if (navigator.share) {
          navigator.share({ url: SHARE_URL }).catch(() => {
            window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_URL)}`, "_blank");
          });
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_URL)}`, "_blank");
        }
      });
      return;
    }
    if (navigator.share) {
      navigator.share({ url: SHARE_URL }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_URL)}`, "_blank");
      });
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_URL)}`, "_blank");
  }
  const VALOR_TOTAL_MAX = 600;
  const [valorMin, setValorMin] = useState(0);
  const [valorMax, setValorMax] = useState(VALOR_TOTAL_MAX);

  const filtered = useMemo(() => {
    return profissionais.filter((p) => {
      if (activeCond && !p.areas_atuacao.includes(activeCond)) return false;
      if (activeProfissao && p.profissao !== activeProfissao) return false;
      if (activeModalidade && p.modalidade !== activeModalidade) return false;
      if (activeCidade && !normCidade(p.cidade).includes(normCidade(activeCidade))) return false;
      if (activePagamento) {
        const conv = p.convenio_info.toLowerCase();
        if (activePagamento === "Particular" && conv.includes("não aceita")) return false;
        if (activePagamento === "Convênio" && !conv.includes("aceita")) return false;
      }
      if (valorMin > 0 || valorMax < VALOR_TOTAL_MAX) {
        if (p.valor_min < valorMin || p.valor_min > valorMax) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          p.nome.toLowerCase().includes(q) ||
          p.titulo_exibicao.toLowerCase().includes(q) ||
          p.areas_atuacao.join(" ").toLowerCase().includes(q) ||
          p.cidade.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [search, activeCond, activeProfissao, activeModalidade, activeCidade, activePagamento, valorMin, valorMax]);

  const sections = PROFISSOES_ORDENADAS.map((prof) => ({
    nome: prof,
    pros: filtered.filter((p) => p.profissao === prof),
  })).filter((s) => s.pros.length > 0);

  const valorAtivo = valorMin > 0 || valorMax < VALOR_TOTAL_MAX;
  const hasFilters = !!(activeCond || activeProfissao || activeModalidade || activeCidade || activePagamento || valorAtivo || search.trim());

  function toggleCond(cond: string) {
    setActiveCond((prev) => (prev === cond ? null : cond));
  }

  return (
    <div className="min-h-screen bg-creme">

      {/* ═══ STICKY HEADER ═══ */}
      <header className="sticky top-0 z-30 bg-creme/95 backdrop-blur-sm border-b border-linha">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-3.5 flex items-center gap-3 md:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-none no-underline">
            <KiriLogoCompact height={38} />
          </Link>

          {/* Search — desktop only, in header */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2.5 bg-white border border-linha rounded-[11px] px-4 py-2.5 shadow-[0_1px_6px_-2px_rgba(60,55,45,0.15)]">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8.6" cy="8.6" r="6" stroke="#9A8C78" strokeWidth="1.6" />
              <line x1="13.2" y1="13.2" x2="17.5" y2="17.5" stroke="#9A8C78" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por condição ou profissional…"
              className="flex-1 text-[14px] text-carvao placeholder:text-muted bg-transparent outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted text-base leading-none">×</button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-5 ml-auto md:ml-0">

            <Link href="/como-selecionamos" className="hidden md:block text-[15px] font-semibold text-cinza-texto hover:text-carvao transition-colors no-underline">
              Como selecionamos
            </Link>
            <Link href="/sobre" className="hidden md:block text-[15px] font-semibold text-cinza-texto hover:text-carvao transition-colors no-underline">
              Sobre
            </Link>
            <button
              onClick={() => setShowCompartilhar(true)}
              className="hidden md:flex items-center gap-1.5 text-[14px] font-semibold text-ardosia-escura bg-wash-azulado border border-borda-azulada rounded-[9px] px-3.5 py-2 cursor-pointer hover:bg-borda-azulada/40 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="16" cy="4" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                <circle cx="4" cy="10" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                <circle cx="16" cy="16" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                <line x1="6.2" y1="8.8" x2="13.8" y2="5.2" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="6.2" y1="11.2" x2="13.8" y2="14.8" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Divulgue a Kiri
            </button>
            {/* Hambúrguer — mobile only */}
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="md:hidden flex flex-col items-center justify-center w-9 h-9 gap-[5px] cursor-pointer flex-none"
              aria-label="Menu"
            >
              {showMenu ? (
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <line x1="3" y1="3" x2="17" y2="17" stroke="#564F45" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="17" y1="3" x2="3" y2="17" stroke="#564F45" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <>
                  <span className="block w-[18px] h-[1.8px] bg-cinza-texto rounded-full" />
                  <span className="block w-[18px] h-[1.8px] bg-cinza-texto rounded-full" />
                  <span className="block w-[18px] h-[1.8px] bg-cinza-texto rounded-full" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {showMenu && (
          <div className="md:hidden border-t border-linha bg-creme/98 px-4 py-2 flex flex-col">
            <Link
              href="/como-selecionamos"
              onClick={() => setShowMenu(false)}
              className="py-3.5 text-[16px] font-semibold text-cinza-texto border-b border-linha-sutil no-underline"
            >
              Como selecionamos
            </Link>
            <Link
              href="/sobre"
              onClick={() => setShowMenu(false)}
              className="py-3.5 text-[16px] font-semibold text-cinza-texto border-b border-linha-sutil no-underline"
            >
              Sobre
            </Link>
            <button
              onClick={() => { setShowMenu(false); setShowCompartilhar(true); }}
              className="py-3.5 text-[16px] font-semibold text-ardosia-escura text-left cursor-pointer flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="16" cy="4" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                <circle cx="4" cy="10" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                <circle cx="16" cy="16" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                <line x1="6.2" y1="8.8" x2="13.8" y2="5.2" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="6.2" y1="11.2" x2="13.8" y2="14.8" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Divulgue a Kiri
            </button>
          </div>
        )}
      </header>

      {/* ═══ CONTEÚDO PRINCIPAL ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Hero */}
        <div className="pt-6 md:pt-14 md:pb-2 flex items-start gap-8 md:gap-12">
          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h1
              className="font-serif text-[27px] md:text-[41px] lg:text-[50px] xl:text-[54px] font-medium leading-[1.15] tracking-[-0.02em] text-carvao"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Encontre o profissional certo para o desenvolvimento do seu filho.
            </h1>
            <p
              className="mt-2 md:mt-5 text-[15px] md:text-[18px] leading-[1.55] md:leading-[1.65] text-cinza-texto"
              style={{ textWrap: "pretty" } as React.CSSProperties}
            >
              Uma rede selecionada para TEA, TDAH e outras questões do neurodesenvolvimento infantil,
              em que a formação de cada profissional é verificada — para você não se perder numa lista infinita.
            </p>

            {/* Search — mobile only (inline) */}
            <div className="md:hidden mt-5">
              <div className="flex items-center gap-2.5 bg-white border border-linha rounded-[13px] px-[15px] py-3.5 shadow-[0_2px_10px_-6px_rgba(60,55,45,0.28)]">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8.6" cy="8.6" r="6" stroke="#9A8C78" strokeWidth="1.6" />
                  <line x1="13.2" y1="13.2" x2="17.5" y2="17.5" stroke="#9A8C78" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por condição ou profissional"
                  className="flex-1 text-[14.5px] text-carvao placeholder:text-muted bg-transparent outline-none"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-muted text-lg leading-none">×</button>
                )}
              </div>
            </div>
          </div>

          {/* Pássaros — desktop only */}
          <div className="hidden md:flex flex-none items-start justify-center self-start -mt-6" style={{ minWidth: 180 }}>
            <KiriLogo size={180} />
          </div>
        </div>

        {/* Filtros por condição */}
        <div className="pt-6 md:pt-10">
          <div className="text-[11px] md:text-[12px] font-semibold tracking-[0.1em] uppercase text-muted mb-3 md:mb-4">
            Buscar por condição
          </div>

          {/* TEA + TDAH — 2 col mobile, continua 2 col desktop (mais largo) */}
          <div className="grid grid-cols-2 gap-2.5 md:gap-4">
            {(["TEA", "TDAH"] as const).map((cond) => (
              <button
                key={cond}
                onClick={() => toggleCond(cond)}
                className={`flex flex-col gap-1 items-start rounded-[13px] md:rounded-[14px] px-4 md:px-5 py-3.5 md:py-4 cursor-pointer transition-all ${
                  activeCond === cond
                    ? "bg-ardosia-escura border-2 border-ardosia"
                    : "bg-wash-azulado border-[1.5px] border-borda-azulada"
                }`}
              >
                <span className={`text-[17px] md:text-[22px] font-bold ${activeCond === cond ? "text-white" : "text-ardosia-escura"}`}>
                  {cond}
                </span>
                <span className={`text-[11.5px] md:text-[14px] ${activeCond === cond ? "text-white/80" : "text-ardosia-texto"}`}>
                  {cond === "TEA" ? "Transtorno do Espectro Autista" : "Transtorno do Déficit de Atenção e Hiperatividade"}
                </span>
              </button>
            ))}
          </div>

          {/* Pills secundárias — só mobile */}
          <div className="flex flex-wrap gap-2 mt-2.5 md:hidden">
            {["Atraso de fala / linguagem", "Dificuldades de aprendizagem"].map((label) => (
              <button key={label} className="inline-flex items-center bg-transparent border border-areia rounded-full px-3.5 py-2 cursor-pointer">
                <span className="text-[13px] font-medium text-cinza-texto2">{label}</span>
              </button>
            ))}
          </div>

          {/* Não sei por onde começar */}
          <Link
            href="/avaliacao"
            className="flex items-center gap-4 mt-3 md:mt-4 bg-ferrugem border border-ferrugem rounded-[13px] md:rounded-[14px] px-4 md:px-5 py-3.5 md:py-4 cursor-pointer no-underline transition-all hover:opacity-90"
          >
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full flex-shrink-0 bg-white/20 flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" className="md:hidden">
                <path d="M7.3 7.4 C7.3 5.6 8.5 4.5 10 4.5 C11.6 4.5 12.7 5.6 12.7 7 C12.7 9.3 10 9 10 11.3" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="10" cy="14.7" r="1.05" fill="white" />
              </svg>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" className="hidden md:block">
                <path d="M7.3 7.4 C7.3 5.6 8.5 4.5 10 4.5 C11.6 4.5 12.7 5.6 12.7 7 C12.7 9.3 10 9 10 11.3" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="10" cy="14.7" r="1.05" fill="white" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] md:text-[19px] font-bold text-white leading-[1.2]">
                Não sei por onde começar
              </div>
              <div className="text-[12.5px] md:text-[17px] text-white/80 mt-0.5 md:mt-1">
                Quero uma avaliação do neurodesenvolvimento
              </div>
            </div>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 4 L13 10 L7 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Filtros adicionais */}
        <div className="pt-4 md:pt-5 overflow-x-auto scrollbar-hide flex gap-2 md:grid md:grid-cols-5 md:overflow-visible">
          {/* Tipo de profissional */}
          <button
            onClick={() => { setShowProfissaoOptions((v) => !v); setShowModalidadeOptions(false); }}
            className={`flex-none md:flex-auto inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
              activeProfissao ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
            }`}
          >
            <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
              {activeProfissao ? activeProfissao.split(" ")[0] : "Tipo de profissional"}
            </span>
            {activeProfissao ? (
              <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveProfissao(null); }}>×</span>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>

          {/* Modalidade */}
          <button
            onClick={() => { setShowModalidadeOptions((v) => !v); setShowProfissaoOptions(false); }}
            className={`flex-none md:flex-auto inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
              activeModalidade ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
            }`}
          >
            <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
              {activeModalidade ? modalidadeCurta(activeModalidade) : "Modalidade"}
            </span>
            {activeModalidade ? (
              <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveModalidade(null); }}>×</span>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>

          {/* Cidade */}
          <button
            onClick={() => { setShowCidadeOptions((v) => !v); setShowProfissaoOptions(false); setShowModalidadeOptions(false); setShowPagamentoOptions(false); setShowValorOptions(false); }}
            className={`flex-none md:flex-auto inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
              activeCidade ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
            }`}
          >
            <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
              {activeCidade ?? "Cidade"}
            </span>
            {activeCidade ? (
              <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveCidade(null); }}>×</span>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>

          {/* Faixa de valor */}
          <button
            onClick={() => { setShowValorOptions((v) => !v); setShowProfissaoOptions(false); setShowModalidadeOptions(false); setShowPagamentoOptions(false); }}
            className={`flex-none md:flex-auto inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
              valorAtivo ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
            }`}
          >
            <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
              {valorAtivo ? `R$${valorMin}–${valorMax === VALOR_TOTAL_MAX ? "600+" : valorMax}` : "Faixa de valor"}
            </span>
            {valorAtivo ? (
              <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setValorMin(0); setValorMax(VALOR_TOTAL_MAX); }}>×</span>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>

          {/* Particular / convênio */}
          <button
            onClick={() => { setShowPagamentoOptions((v) => !v); setShowProfissaoOptions(false); setShowModalidadeOptions(false); }}
            className={`flex-none md:flex-auto inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
              activePagamento ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
            }`}
          >
            <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
              {activePagamento ?? "Particular / convênio"}
            </span>
            {activePagamento ? (
              <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActivePagamento(null); }}>×</span>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>
        </div>

        {/* Opções inline de cidade */}
        {showCidadeOptions && (
          <div className="pt-2 flex flex-wrap gap-2">
            {CIDADES_DISPONIVEIS.map((c) => (
              <button
                key={c}
                onClick={() => { setActiveCidade(activeCidade === c ? null : c); setShowCidadeOptions(false); }}
                className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activeCidade === c ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Opções inline de profissão */}
        {showProfissaoOptions && (
          <div className="pt-2 flex flex-wrap gap-2">
            {PROFISSOES_ORDENADAS.map((p) => (
              <button
                key={p}
                onClick={() => { setActiveProfissao(activeProfissao === p ? null : p); setShowProfissaoOptions(false); }}
                className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activeProfissao === p ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                {PROFISSAO_PLURAL[p] ?? p}
              </button>
            ))}
          </div>
        )}

        {/* Opções inline de modalidade */}
        {showModalidadeOptions && (
          <div className="pt-2 flex flex-wrap gap-2">
            {FILTROS_MODALIDADE.map((m) => (
              <button
                key={m}
                onClick={() => { setActiveModalidade(activeModalidade === m ? null : m); setShowModalidadeOptions(false); }}
                className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activeModalidade === m ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Opções inline de pagamento */}
        {showPagamentoOptions && (
          <div className="pt-2 flex flex-wrap gap-2">
            {["Particular", "Convênio"].map((opt) => (
              <button
                key={opt}
                onClick={() => { setActivePagamento(activePagamento === opt ? null : opt); setShowPagamentoOptions(false); }}
                className={`text-[12.5px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activePagamento === opt ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Range slider de valor */}
        {showValorOptions && (
          <div className="pt-3 px-1">
            <div className="bg-white border border-linha rounded-[16px] p-4 md:p-5 max-w-sm">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Valor por consulta</span>
                <span className="text-[14px] font-semibold text-ardosia-escura">
                  R${valorMin} — {valorMax >= VALOR_TOTAL_MAX ? "R$600+" : `R$${valorMax}`}
                </span>
              </div>

              {/* Track container */}
              <div className="relative h-6 flex items-center">
                {/* Track fundo */}
                <div className="absolute left-0 right-0 h-[5px] bg-areia rounded-full" />
                {/* Track ativo */}
                <div
                  className="absolute h-[5px] bg-ardosia rounded-full pointer-events-none"
                  style={{
                    left: `${(valorMin / VALOR_TOTAL_MAX) * 100}%`,
                    right: `${100 - (valorMax / VALOR_TOTAL_MAX) * 100}%`,
                  }}
                />
                {/* Input min — invisível, por cima */}
                <input
                  type="range" min={0} max={VALOR_TOTAL_MAX} step={50}
                  value={valorMin}
                  onChange={(e) => { const v = Number(e.target.value); if (v <= valorMax - 50) setValorMin(v); }}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                  style={{ zIndex: valorMin > VALOR_TOTAL_MAX - 100 ? 5 : 3 }}
                />
                {/* Input max — invisível, por baixo */}
                <input
                  type="range" min={0} max={VALOR_TOTAL_MAX} step={50}
                  value={valorMax}
                  onChange={(e) => { const v = Number(e.target.value); if (v >= valorMin + 50) setValorMax(v); }}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                  style={{ zIndex: 4 }}
                />
                {/* Thumb visual mín */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-ardosia-escura border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.22)] pointer-events-none"
                  style={{ left: `calc(${(valorMin / VALOR_TOTAL_MAX) * 100}% - 10px)`, zIndex: 6 }}
                />
                {/* Thumb visual máx */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-ardosia-escura border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.22)] pointer-events-none"
                  style={{ left: `calc(${(valorMax / VALOR_TOTAL_MAX) * 100}% - 10px)`, zIndex: 6 }}
                />
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-[11.5px] text-muted">R$0</span>
                <span className="text-[11.5px] text-muted">R$600+</span>
              </div>
            </div>
          </div>
        )}

        {/* Trust banner + Como funciona — visível quando sem filtros */}
        {!hasFilters && (
          <div className="pt-8 md:pt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {/* Por que selecionada */}
            <Link
              href="/como-selecionamos"
              className="flex flex-col justify-center bg-white border border-borda-azulada rounded-[15px] md:rounded-[16px] px-5 pt-4 pb-3 cursor-pointer no-underline hover:shadow-[0_6px_24px_-10px_rgba(68,96,108,0.2)] transition-shadow"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
                  <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-serif text-[17px] md:text-[18px] font-semibold text-carvao">
                  Por que é uma rede selecionada
                </span>
              </div>
              <p className="text-[14px] md:text-[15px] leading-[1.6] text-cinza-texto m-0">
                Registro no conselho e formação conferidos, um a um.
              </p>
              <p className="text-[14px] md:text-[15px] leading-[1.6] text-cinza-texto m-0 mt-1">
                Uma rede pequena, para você decidir com segurança.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {[
                  "Registro ativo no conselho (CRM, CRP, CFFa, COFFITO ou CRN)",
                  "Formação na área e atuação em neurodesenvolvimento infantil",
                  "Registro ativo e regular perante o conselho de classe",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="10" cy="10" r="8.4" stroke="#6E8893" strokeWidth="1.3" />
                      <path d="M6.3 10.2 L8.8 12.7 L13.8 7" stroke="#6E8893" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[13px] md:text-[14px] leading-[1.5] text-cinza-texto2">{item}</span>
                  </div>
                ))}
              </div>
            </Link>

            {/* Como funciona */}
            <div className="bg-wash-quente border border-borda-quente rounded-[15px] md:rounded-[16px] px-6 pt-4 pb-2 flex flex-col justify-center">
              <div className="text-[11px] md:text-[12px] font-semibold tracking-[0.1em] uppercase text-muted mb-3 pl-9">Como funciona</div>
              <div className="flex flex-col gap-0 w-full max-w-[340px] md:max-w-none">
                {[
                  { n: "1", titulo: "Você responde a algumas perguntas", desc: "Nos conte, em poucos passos, o que tem observado no comportamento da criança.", linha: true },
                  { n: "2", titulo: "Nós direcionamos o seu caso", desc: "Apresentamos os profissionais especializados da nossa rede mais alinhados às suas necessidades.", linha: true },
                  { n: "3", titulo: "Você escolhe com quem começar", desc: "Avalie os perfis verificados e agende a consulta diretamente com o especialista escolhido.", linha: false },
                ].map((passo) => (
                  <div key={passo.n} className="flex gap-3">
                    <div className="flex flex-col items-center flex-none self-stretch">
                      <div className="w-6 h-6 rounded-full bg-white border border-borda-quente flex items-center justify-center font-serif text-[13px] font-semibold text-ferrugem flex-none">
                        {passo.n}
                      </div>
                      {passo.linha && <div className="flex-1 w-[1.5px] bg-borda-quente mt-1" />}
                    </div>
                    <div className="pt-0.5 pb-3">
                      <div className="text-[13.5px] md:text-[15px] font-semibold text-carvao leading-[1.3]">{passo.titulo}</div>
                      <div className="text-[12.5px] md:text-[13.5px] leading-[1.5] text-cinza-texto mt-0.5">{passo.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SEÇÕES POR PROFISSÃO ═══ */}
        {sections.length === 0 ? (
          <div className="mt-16 text-center pb-20">
            <p className="text-[15px] text-cinza-texto2">Nenhum profissional encontrado para esse filtro.</p>
            <button
              className="mt-4 text-[13px] font-semibold text-ferrugem underline cursor-pointer"
              onClick={() => { setSearch(""); setActiveCond(null); setActiveProfissao(null); setActiveModalidade(null); setActiveCidade(null); setActivePagamento(null); setValorMin(0); setValorMax(VALOR_TOTAL_MAX); }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            {sections.map((sec) => (
              <div key={sec.nome} className="mt-10 md:mt-14">
                {/* Header da seção */}
                <div className="flex items-baseline justify-between gap-3.5 mb-4 md:mb-5">
                  <span className="font-serif text-[19px] md:text-[22px] font-semibold text-carvao leading-[1.2]">
                    {PROFISSAO_PLURAL[sec.nome] ?? sec.nome}
                  </span>
                  <button
                    className="flex-none text-[13px] font-semibold text-ferrugem whitespace-nowrap cursor-pointer hover:underline"
                    onClick={() => setActiveProfissao(sec.nome)}
                  >
                    Ver todos
                  </button>
                </div>

                {/* Mobile: scroll horizontal */}
                <div className="-mx-4 md:hidden overflow-x-auto scrollbar-hide flex gap-3 px-4 pb-1.5">
                  {sec.pros.map((p) => (
                    <div key={p.id} className="flex-none w-[220px]">
                      <MiniCard profissional={p} />
                    </div>
                  ))}
                </div>

                {/* Desktop: grid */}
                <div className="hidden md:grid grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {sec.pros.map((p) => (
                    <MiniCard key={p.id} profissional={p} />
                  ))}
                </div>
              </div>
            ))}

            {/* Rodapé */}
            <Footer className="mt-12 md:mt-16 mb-12" />
          </>
        )}
      </div>

      {/* ═══ MODAL: DIVULGUE A KIRI ═══ */}
      {showCompartilhar && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 pb-6 md:pb-0"
          onClick={() => setShowCompartilhar(false)}
        >
          <div
            className="w-full max-w-sm bg-creme rounded-[20px] overflow-hidden shadow-[0_20px_60px_-10px_rgba(40,35,25,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card de divulgação */}
            <div className="bg-ardosia-escura px-6 pt-7 pb-6">
              <div className="mb-4" style={{ filter: "brightness(0) invert(1)" }}>
                <KiriLogoCompact height={28} />
              </div>
              <p className="font-serif text-[22px] font-medium leading-[1.25] text-white">
                Uma rede de profissionais verificados para neurodesenvolvimento infantil.
              </p>
              <p className="mt-3 text-[14px] leading-[1.55] text-white/75">
                Psicólogos, fonoaudiólogos, neuropediatras, terapeutas ocupacionais e mais — com formação conferida, para você decidir com segurança.
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.4" opacity="0.7" />
                  <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                </svg>
                <span className="text-[13px] font-semibold text-white/60 tracking-[0.03em]">kirisaude.com.br</span>
              </div>
            </div>

            {/* Ações */}
            <div className="px-5 py-4 flex flex-col gap-2.5">
              <button
                onClick={compartilharWhatsApp}
                disabled={!shareReady}
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-[15px] rounded-[13px] py-[14px] cursor-pointer disabled:opacity-50 w-full"
              >
                {!shareReady ? (
                  <span className="text-[14px] text-white/80">Preparando…</span>
                ) : (
                  <>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
                      <path d="M17.47 14.38c-.28-.14-1.67-.82-1.93-.92-.26-.09-.45-.14-.64.14-.19.28-.74.92-.9 1.1-.17.19-.33.21-.61.07-.28-.14-1.19-.44-2.27-1.4-.84-.75-1.4-1.67-1.57-1.95-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.1-.23-.55-.47-.47-.64-.48-.17-.01-.36-.01-.55-.01s-.5.07-.76.35c-.26.28-1 1-1 2.42s1.02 2.81 1.16 3c.14.19 2 3.06 4.85 4.29.68.29 1.21.47 1.62.6.68.21 1.3.18 1.79.11.55-.08 1.67-.68 1.9-1.34.24-.66.24-1.22.17-1.34-.07-.12-.26-.19-.54-.33z" />
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.08-1.34A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.69 0-3.26-.49-4.59-1.33l-.32-.2-3.02.79.81-2.95-.21-.34A8 8 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                    Compartilhar no WhatsApp
                  </>
                )}
              </button>
              <button
                onClick={copiarLink}
                className="flex items-center justify-center gap-2 bg-white border border-linha text-carvao font-semibold text-[15px] rounded-[13px] py-[13px] cursor-pointer"
              >
                {copiado ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10.5 L8 14.5 L16 6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Link copiado!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <rect x="7" y="7" width="9" height="9" rx="2" stroke="#9A8C78" strokeWidth="1.4" />
                      <path d="M4 13 L4 4 L13 4" stroke="#9A8C78" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copiar link
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCompartilhar(false)}
                className="text-[13px] text-muted cursor-pointer py-1"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCard({ profissional: p }: { profissional: Profissional }) {
  return (
    <Link
      href={`/profissional/${p.id}`}
      className="w-full h-full bg-white border border-linha rounded-[15px] p-3.5 md:p-5 shadow-[0_5px_16px_-11px_rgba(60,55,45,0.32)] cursor-pointer no-underline block hover:shadow-[0_8px_24px_-10px_rgba(60,55,45,0.4)] transition-shadow"
    >
      <div className="flex items-center gap-[11px] md:gap-3.5">
        <PlaceholderPhoto size={46} radius={11} />
        <div className="min-w-0 flex-1">
          <span className="font-serif text-[15.5px] md:text-[17px] font-semibold text-carvao leading-[1.12] block">
            {p.nome}
          </span>
          <div className="mt-1 inline-flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
              <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] md:text-[11.5px] font-semibold tracking-[0.06em] uppercase text-ardosia-escura">
              Verificado
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mt-[11px]">
        {p.areas_atuacao.map((area) => (
          <span
            key={area}
            className="text-[10.5px] md:text-[12px] font-semibold text-ardosia-escura bg-wash-azulado border border-borda-azulada px-2 md:px-2.5 py-0.5 rounded-[6px]"
          >
            {area}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-[11px] text-[11.5px] md:text-[13px] text-cinza-texto2">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <path d="M10 18 C10 18 16 12 16 7.5 A6 6 0 1 0 4 7.5 C4 12 10 18 10 18 Z" stroke="#9A8C78" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="10" cy="7.6" r="2" stroke="#9A8C78" strokeWidth="1.5" />
        </svg>
        <span className="truncate">
          {modalidadeCurta(p.modalidade)} · {cidadeCurta(p.cidade)}
        </span>
      </div>
    </Link>
  );
}
