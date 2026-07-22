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
import { titleCasePT } from "@/lib/titleCase";

const profissionais = data.profissionais as Profissional[];
const FILTROS_MODALIDADE = ["Presencial e online", "Somente presencial", "Somente online"];

function normCidade(s: string) {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[,/]\s*[a-z]{2}$/, "")   // "city, sp" ou "city/sp"
    .replace(/\s+-\s+\w[\w\s]*$/, "")  // "city - bahia" ou "city - estado"
    .replace(/\s+[a-z]{2}$/, "")       // "city ba"
    .trim();
}

const REGIOES_SP = ["Norte", "Sul", "Leste", "Oeste", "Centro"];

// Deduplica por nome normalizado; separa cidades múltiplas unidas por " e "
const CIDADES_DISPONIVEIS = (() => {
  const mapa = new Map<string, string>();
  for (const p of profissionais) {
    const campo = cidadeCurta(p.cidade);
    if (!campo) continue;
    for (const parte of campo.split(/\s+e\s+/)) {
      const curta = parte.trim();
      if (!curta) continue;
      const chave = normCidade(curta);
      const atual = mapa.get(chave);
      if (!atual || curta.length < atual.length) mapa.set(chave, curta);
    }
  }
  return [...mapa.values()].sort();
})();


function EmBreve() {
  return (
    <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6 overflow-x-hidden">
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
  const [activePagamento, setActivePagamento] = useState<string | null>(null);
  const [activeCidade, setActiveCidade] = useState<string | null>(null);
  const [activeSPRegiao, setActiveSPRegiao] = useState<string | null>(null);
  const [activeFaixa, setActiveFaixa] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const filtrosRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(60);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [mostrarTodasSections, setMostrarTodasSections] = useState(false);
  const [mostrarCondicoes, setMostrarCondicoes] = useState(false);
  const [showCompartilhar, setShowCompartilhar] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const shareBlobRef = useRef<Blob | null>(null);

  const SITE_URL = "https://kirisaude.com.br";
  const SHARE_URL = "https://www.kirisaude.com.br/compartilhar";

  useEffect(() => {
    if (!showCompartilhar) { shareBlobRef.current = null; setShareReady(false); return; }
    setShareReady(false);
    fetch("/api/share-card")
      .then((r) => r.blob())
      .then((blob) => { shareBlobRef.current = blob; setShareReady(true); })
      .catch(() => { setShareReady(true); });
  }, [showCompartilhar]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (filtrosRef.current && !filtrosRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const el = headerRef.current;
    setHeaderHeight(el.getBoundingClientRect().height);
    const obs = new ResizeObserver(() => setHeaderHeight(el.getBoundingClientRect().height));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function copiarLink() {
    navigator.clipboard.writeText(SITE_URL).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  function compartilharWhatsApp() {
    const blob = shareBlobRef.current;
    if (blob && navigator.share) {
      const file = new File([blob], "kiri.png", { type: "image/png" });
      // Tenta enviar o arquivo diretamente (mostra a imagem no WhatsApp)
      navigator.share({ files: [file], url: SITE_URL }).catch(() =>
        navigator.share({ files: [file] }).catch(() =>
          navigator.share({ url: SHARE_URL }).catch(() =>
            window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_URL)}`, "_blank")
          )
        )
      );
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
      if (p.oculto) return false;
      if (!p.foto_url) return false;
      if (activeCond && !p.areas_atuacao.includes(activeCond)) return false;
      if (activeProfissao && p.profissao !== activeProfissao && p.profissao_secundaria !== activeProfissao) return false;
      if (activeModalidade && p.modalidade !== activeModalidade) return false;
      if (activeCidade) {
        const cidadeNorm = normCidade(activeCidade);
        const match = p.cidade.split(/\s+e\s+/).some(c => normCidade(cidadeCurta(c.trim())) === cidadeNorm);
        if (!match) return false;
        if (activeSPRegiao && cidadeNorm === "sao paulo") {
          if (!p.cidade.includes(activeSPRegiao)) return false;
        }
      }
      if (activeFaixa && !p.faixa_etaria.includes(activeFaixa)) return false;
      if (activePagamento) {
        const conv = p.convenio_info.toLowerCase();
        if (activePagamento === "Particular" && conv.includes("não aceita")) return false;
        if (activePagamento === "Convênio" && !conv.includes("aceita")) return false;
      }
      if (valorMin > 0 || valorMax < VALOR_TOTAL_MAX) {
        const vm = p.valor_min ?? 0;
        if (vm < valorMin || vm > valorMax) return false;
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
  }, [search, activeCond, activeProfissao, activeModalidade, activeCidade, activeSPRegiao, activeFaixa, activePagamento, valorMin, valorMax]);

  const valorAtivo = valorMin > 0 || valorMax < VALOR_TOTAL_MAX;
  const hasFilters = !!(activeCond || activeProfissao || activeModalidade || activeCidade || activeSPRegiao || activeFaixa || activePagamento || valorAtivo || search.trim());

  const allSections = PROFISSOES_ORDENADAS.map((prof) => ({
    nome: prof,
    pros: filtered.filter((p) => p.profissao === prof),
  }))
    .filter((s) => s.pros.length > 0)
    .sort((a, b) => b.pros.length - a.pros.length);

  // Sem filtros e não expandido: só as 4 maiores seções com >= 2 profissionais
  const sections = hasFilters || mostrarTodasSections
    ? allSections
    : allSections.filter((s) => s.pros.length >= 2).slice(0, 4);

  function toggleCond(cond: string) {
    setActiveCond((prev) => (prev === cond ? null : cond));
  }

  return (
    <div className="min-h-screen bg-creme overflow-x-hidden">

      {/* ═══ STICKY HEADER ═══ */}
      <header ref={headerRef} className="sticky top-0 z-30 bg-creme/95 backdrop-blur-sm border-b border-linha">
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

            <Link href="/especialidades" className="hidden md:block text-[15px] font-semibold text-cinza-texto hover:text-carvao transition-colors no-underline">
              Especialidades
            </Link>
            <Link href="/como-selecionamos" className="hidden md:block text-[15px] font-semibold text-cinza-texto hover:text-carvao transition-colors no-underline">
              Como selecionamos
            </Link>
            <Link href="/sobre" className="hidden md:block text-[15px] font-semibold text-cinza-texto hover:text-carvao transition-colors no-underline">
              Sobre
            </Link>
            <Link href="/profissionais/inscricao" className="hidden md:flex items-center text-[14px] font-semibold text-ferrugem bg-ferrugem/8 border border-ferrugem/25 rounded-[9px] px-3.5 py-2 hover:bg-ferrugem/14 transition-colors no-underline">
              Faça parte da Kiri
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

        {/* Filtros ativos — chips removíveis */}
        {hasFilters && (
          <div className="border-t border-linha px-4 md:px-8 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {activeCond && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                {activeCond}
                <button onClick={() => setActiveCond(null)} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            {activeProfissao && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                {activeProfissao.split(" ")[0]}
                <button onClick={() => setActiveProfissao(null)} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            {activeCidade && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                {activeSPRegiao ? `${activeCidade} · ${activeSPRegiao}` : activeCidade}
                <button onClick={() => { setActiveCidade(null); setActiveSPRegiao(null); }} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            {activeModalidade && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                {modalidadeCurta(activeModalidade)}
                <button onClick={() => setActiveModalidade(null)} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            {activeFaixa && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                {activeFaixa.split(" ")[0]}
                <button onClick={() => setActiveFaixa(null)} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            {activePagamento && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                {activePagamento}
                <button onClick={() => setActivePagamento(null)} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            {valorAtivo && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                R${valorMin}–{valorMax >= VALOR_TOTAL_MAX ? "600+" : valorMax}
                <button onClick={() => { setValorMin(0); setValorMax(VALOR_TOTAL_MAX); }} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            {search.trim() && (
              <span className="inline-flex items-center gap-1 flex-none bg-ardosia-escura text-white text-[12px] font-semibold px-3 py-1 rounded-full">
                "{search.trim()}"
                <button onClick={() => setSearch("")} className="text-white/70 hover:text-white leading-none cursor-pointer ml-0.5">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(""); setActiveCond(null); setActiveProfissao(null); setActiveModalidade(null); setActiveCidade(null); setActiveSPRegiao(null); setActiveFaixa(null); setActivePagamento(null); setValorMin(0); setValorMax(VALOR_TOTAL_MAX); }}
              className="inline-flex items-center flex-none text-[12px] font-semibold text-muted hover:text-ferrugem cursor-pointer whitespace-nowrap ml-1"
            >
              Limpar todos
            </button>
          </div>
        )}

        {/* Menu mobile dropdown */}
        {showMenu && (
          <div className="md:hidden border-t border-linha bg-creme/98 px-4 py-2 flex flex-col">
            <Link
              href="/especialidades"
              onClick={() => setShowMenu(false)}
              className="py-3.5 text-[16px] font-semibold text-cinza-texto border-b border-linha-sutil no-underline"
            >
              Especialidades
            </Link>
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
            <Link
              href="/profissionais/inscricao"
              onClick={() => setShowMenu(false)}
              className="py-3.5 text-[16px] font-semibold text-ferrugem no-underline"
            >
              Faça parte da Kiri
            </Link>
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
              className="mt-2 md:mt-5 hidden md:block text-[15px] md:text-[18px] leading-[1.55] md:leading-[1.65] text-cinza-texto"
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

          {/* TEA + TDAH */}
          <div className="flex gap-2 md:grid md:grid-cols-2 md:gap-4">
            {(["TEA", "TDAH"] as const).map((cond) => (
              <button
                key={cond}
                onClick={() => toggleCond(cond)}
                className={`cursor-pointer transition-all border
                  /* mobile: pill compacto */
                  inline-flex items-center rounded-full px-4 py-1.5
                  /* desktop: box com descrição */
                  md:flex md:flex-col md:gap-0.5 md:items-start md:rounded-[14px] md:px-5 md:py-[10px]
                  ${activeCond === cond
                    ? "bg-ardosia-escura border-ardosia"
                    : "bg-wash-azulado border-borda-azulada"
                  }`}
              >
                <span className={`text-[13px] md:text-[22px] font-bold ${activeCond === cond ? "text-white" : "text-ardosia-escura"}`}>
                  {cond}
                </span>
                <span className={`hidden md:block text-[14px] ${activeCond === cond ? "text-white/80" : "text-ardosia-texto"}`}>
                  {cond === "TEA" ? "Transtorno do Espectro Autista" : "Transtorno do Déficit de Atenção e Hiperatividade"}
                </span>
              </button>
            ))}
          </div>

          {/* Condições secundárias — colapsadas no mobile, sempre visíveis no desktop */}
          <div className={`mt-1.5 md:flex md:flex-wrap md:gap-2 ${mostrarCondicoes || activeCond ? "flex flex-wrap gap-2" : "hidden md:flex"}`}>
            {([
              "Depressão", "Ansiedade", "TOC",
              "Atraso de desenvolvimento", "Dificuldades de aprendizagem",
              "Altas Habilidades e Superdotação", "TOD", "Seletividade Alimentar",
            ] as const).map((cond) => (
              <button
                key={cond}
                onClick={() => toggleCond(cond)}
                className={`inline-flex items-center flex-none rounded-full px-3.5 py-1.5 cursor-pointer transition-all border ${
                  activeCond === cond
                    ? "bg-ardosia-escura border-ardosia-escura text-white"
                    : "bg-white border-[#E2D6C0] text-[#9A8C78] hover:border-ardosia hover:text-ardosia-escura"
                }`}
              >
                <span className="text-[12px] font-medium whitespace-nowrap">{cond}</span>
              </button>
            ))}
          </div>
          {/* Botão toggle condições — mobile only, sem filtro ativo */}
          {!activeCond && (
            <button
              onClick={() => setMostrarCondicoes((v) => !v)}
              className="md:hidden mt-2 text-[12.5px] font-semibold text-muted flex items-center gap-1 cursor-pointer"
            >
              {mostrarCondicoes ? "Ver menos condições" : "Ver mais condições"}
              <svg
                width="12" height="12" viewBox="0 0 20 20" fill="none"
                style={{ transform: mostrarCondicoes ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
              >
                <path d="M5 7.5 L10 12.5 L15 7.5" stroke="#9A8C78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Não sei por onde começar */}
          <Link
            href="/avaliacao"
            className="flex items-center gap-4 mt-3 md:mt-4 bg-ferrugem border border-ferrugem rounded-[13px] md:rounded-[14px] px-4 md:px-5 py-4 md:py-5 cursor-pointer no-underline transition-all hover:opacity-90"
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
              <div className="text-[17px] md:text-[19px] font-bold text-white leading-[1.2]">
                Não sei por onde começar
              </div>
              <div className="text-[13.5px] md:text-[17px] text-white/80 mt-0.5 md:mt-1">
                Quero uma avaliação do neurodesenvolvimento
              </div>
            </div>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 4 L13 10 L7 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Filtros adicionais */}
        <div
          ref={filtrosRef}
          className="sticky md:static z-20 -mx-4 md:mx-0 px-4 md:px-0 pt-3 pb-2 md:pt-5 md:pb-0 bg-creme/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border-b border-linha md:border-b-0 relative"
          style={{ top: headerHeight }}
        >
          <div className="overflow-x-auto scrollbar-hide flex gap-2 md:overflow-visible">

            {/* 1. Tipo de profissional */}
            <div className="relative flex-none md:flex-1">
              <button
                onClick={() => { if (window.innerWidth < 768) { setActiveSheet("profissao"); return; } setActiveDropdown((d) => d === "profissao" ? null : "profissao"); }}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
                  activeProfissao ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
                  {activeProfissao ? `Tipo: ${activeProfissao}` : "Tipo de profissional"}
                </span>
                {activeProfissao ? (
                  <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveProfissao(null); }}>×</span>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
              {activeDropdown === "profissao" && (
                <div className="hidden md:block absolute top-[calc(100%+6px)] left-0 z-[200] bg-white border border-[#E2D6C0] rounded-[14px] shadow-[0_12px_40px_-6px_rgba(44,39,34,0.35)] min-w-[240px] py-1.5">
                  {PROFISSOES_ORDENADAS.map((p) => (
                    <button key={p} onClick={() => { setActiveProfissao(activeProfissao === p ? null : p); setActiveDropdown(null); }}
                      className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${activeProfissao === p ? "bg-[#EFE6D6] text-carvao font-semibold" : "text-cinza-texto hover:bg-[#F9F5EF]"}`}>
                      {PROFISSAO_PLURAL[p] ?? p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Modalidade */}
            <div className="relative flex-none md:flex-1">
              <button
                onClick={() => { if (window.innerWidth < 768) { setActiveSheet("modalidade"); return; } setActiveDropdown((d) => d === "modalidade" ? null : "modalidade"); }}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
                  activeModalidade ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
                  {activeModalidade ? `Modalidade: ${modalidadeCurta(activeModalidade)}` : "Modalidade"}
                </span>
                {activeModalidade ? (
                  <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveModalidade(null); }}>×</span>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
              {activeDropdown === "modalidade" && (
                <div className="hidden md:block absolute top-[calc(100%+6px)] left-0 z-[200] bg-white border border-[#E2D6C0] rounded-[14px] shadow-[0_12px_40px_-6px_rgba(44,39,34,0.35)] min-w-[240px] py-1.5">
                  {FILTROS_MODALIDADE.map((m) => (
                    <button key={m} onClick={() => { setActiveModalidade(activeModalidade === m ? null : m); setActiveDropdown(null); }}
                      className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${activeModalidade === m ? "bg-[#EFE6D6] text-carvao font-semibold" : "text-cinza-texto hover:bg-[#F9F5EF]"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Cidade */}
            <div className="relative flex-none md:flex-1">
              <button
                onClick={() => { if (window.innerWidth < 768) { setActiveSheet("cidade"); return; } setActiveDropdown((d) => d === "cidade" ? null : "cidade"); }}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
                  activeCidade ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
                  {activeCidade ? (activeSPRegiao ? `SP — ${activeSPRegiao}` : `Cidade: ${activeCidade}`) : "Cidade"}
                </span>
                {activeCidade ? (
                  <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveCidade(null); setActiveSPRegiao(null); }}>×</span>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
              {activeDropdown === "cidade" && (
                <div className="hidden md:block absolute top-[calc(100%+6px)] left-0 z-[200] bg-white border border-[#E2D6C0] rounded-[14px] shadow-[0_12px_40px_-6px_rgba(44,39,34,0.35)] min-w-[240px] max-h-[320px] overflow-y-auto py-1.5">
                  {CIDADES_DISPONIVEIS.map((c) => (
                    <button key={c} onClick={() => {
                      const same = activeCidade === c;
                      setActiveCidade(same ? null : c);
                      if (same || normCidade(c) !== "sao paulo") { setActiveSPRegiao(null); setActiveDropdown(null); }
                    }}
                      className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${activeCidade === c ? "bg-[#EFE6D6] text-carvao font-semibold" : "text-cinza-texto hover:bg-[#F9F5EF]"}`}>
                      {c}
                    </button>
                  ))}
                  {activeCidade && normCidade(activeCidade) === "sao paulo" && (
                    <div className="border-t border-[#F0E8DC] mt-1 pt-2 px-3 pb-2">
                      <div className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-muted mb-2">Região</div>
                      <div className="flex flex-wrap gap-1.5">
                        {REGIOES_SP.map((r) => (
                          <button key={r} onClick={() => { setActiveSPRegiao((prev) => (prev === r ? null : r)); setActiveDropdown(null); }}
                            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${activeSPRegiao === r ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto hover:border-ardosia"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Faixa etária */}
            <div className="relative flex-none md:flex-1">
              <button
                onClick={() => { if (window.innerWidth < 768) { setActiveSheet("faixa"); return; } setActiveDropdown((d) => d === "faixa" ? null : "faixa"); }}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
                  activeFaixa ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
                  {activeFaixa ? `Faixa: ${activeFaixa.split(" ")[0]}` : "Faixa etária"}
                </span>
                {activeFaixa ? (
                  <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveFaixa(null); }}>×</span>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
              {activeDropdown === "faixa" && (
                <div className="hidden md:block absolute top-[calc(100%+6px)] left-0 z-[200] bg-white border border-[#E2D6C0] rounded-[14px] shadow-[0_12px_40px_-6px_rgba(44,39,34,0.35)] min-w-[240px] py-1.5">
                  {["Bebês (0–2 anos)", "Pré-escola (3–5 anos)", "Crianças (6–12 anos)", "Adolescentes (13–18 anos)"].map((f) => (
                    <button key={f} onClick={() => { setActiveFaixa(activeFaixa === f ? null : f); setActiveDropdown(null); }}
                      className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${activeFaixa === f ? "bg-[#EFE6D6] text-carvao font-semibold" : "text-cinza-texto hover:bg-[#F9F5EF]"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Faixa de valor */}
            <div className="relative flex-none md:flex-1">
              <button
                onClick={() => { if (window.innerWidth < 768) { setActiveSheet("valor"); return; } setActiveDropdown((d) => d === "valor" ? null : "valor"); }}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
                  valorAtivo ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
                }`}
              >
                <span className="text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
                  {valorAtivo ? `R$${valorMin}–${valorMax >= VALOR_TOTAL_MAX ? "600+" : valorMax}` : "Faixa de valor"}
                </span>
                {valorAtivo ? (
                  <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setValorMin(0); setValorMax(VALOR_TOTAL_MAX); }}>×</span>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
              {activeDropdown === "valor" && (
                <div className="hidden md:block absolute top-[calc(100%+6px)] left-0 z-[200] bg-white border border-[#E2D6C0] rounded-[14px] shadow-[0_12px_40px_-6px_rgba(44,39,34,0.35)] w-[280px] p-5">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Valor por consulta</span>
                    <span className="text-[13px] font-semibold text-ardosia-escura">
                      R${valorMin} — {valorMax >= VALOR_TOTAL_MAX ? "R$600+" : `R$${valorMax}`}
                    </span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute left-0 right-0 h-[5px] bg-areia rounded-full" />
                    <div className="absolute h-[5px] bg-ardosia rounded-full pointer-events-none"
                      style={{ left: `${(valorMin / VALOR_TOTAL_MAX) * 100}%`, right: `${100 - (valorMax / VALOR_TOTAL_MAX) * 100}%` }} />
                    <input type="range" min={0} max={VALOR_TOTAL_MAX} step={50} value={valorMin}
                      onChange={(e) => { const v = Number(e.target.value); if (v <= valorMax - 50) setValorMin(v); }}
                      className="absolute w-full h-full opacity-0 cursor-pointer"
                      style={{ zIndex: valorMin > VALOR_TOTAL_MAX - 100 ? 5 : 3 }} />
                    <input type="range" min={0} max={VALOR_TOTAL_MAX} step={50} value={valorMax}
                      onChange={(e) => { const v = Number(e.target.value); if (v >= valorMin + 50) setValorMax(v); }}
                      className="absolute w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
                    <div className="absolute w-5 h-5 rounded-full bg-ardosia-escura border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.22)] pointer-events-none"
                      style={{ left: `calc(${(valorMin / VALOR_TOTAL_MAX) * 100}% - 10px)`, zIndex: 6 }} />
                    <div className="absolute w-5 h-5 rounded-full bg-ardosia-escura border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.22)] pointer-events-none"
                      style={{ left: `calc(${(valorMax / VALOR_TOTAL_MAX) * 100}% - 10px)`, zIndex: 6 }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[11.5px] text-muted">R$0</span>
                    <span className="text-[11.5px] text-muted">R$600+</span>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Particular / Convênio */}
            <div className="relative flex-none md:flex-1">
              <button
                onClick={() => { if (window.innerWidth < 768) { setActiveSheet("pagamento"); return; } setActiveDropdown((d) => d === "pagamento" ? null : "pagamento"); }}
                className={`w-full inline-flex items-center justify-center gap-1.5 rounded-full px-[13px] py-3 cursor-pointer border transition-all ${
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
              {activeDropdown === "pagamento" && (
                <div className="hidden md:block absolute top-[calc(100%+6px)] right-0 z-[200] bg-white border border-[#E2D6C0] rounded-[14px] shadow-[0_12px_40px_-6px_rgba(44,39,34,0.35)] min-w-[220px] py-1.5">
                  {["Particular", "Convênio"].map((opt) => (
                    <button key={opt} onClick={() => { setActivePagamento(activePagamento === opt ? null : opt); setActiveDropdown(null); }}
                      className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors ${activePagamento === opt ? "bg-[#EFE6D6] text-carvao font-semibold" : "text-cinza-texto hover:bg-[#F9F5EF]"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contador de resultados */}
          {hasFilters && (
            <div className="pt-3 text-[13px] text-muted">
              {filtered.length} {filtered.length !== 1 ? 'profissionais' : 'profissional'} encontrado{filtered.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Divisor filtros / conteúdo — desktop only */}
        <div className="hidden md:block mt-6 border-b border-[#E2D6C0]" />

        {/* Trust banner + Como funciona — desktop: antes dos cards; mobile: oculto aqui (aparece depois) */}
        {!hasFilters && (
          <div className="hidden md:grid md:pt-10 md:grid-cols-2 gap-4 md:gap-5">
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
                  "Verificação dos títulos e formações de cada profissional",
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascote.png" alt="" className="w-28 h-28 object-contain mx-auto mb-4" />
            <p className="text-[15px] text-cinza-texto2">Nenhum profissional encontrado para esse filtro.</p>
            <button
              className="mt-4 text-[13px] font-semibold text-ferrugem underline cursor-pointer"
              onClick={() => { setSearch(""); setActiveCond(null); setActiveProfissao(null); setActiveModalidade(null); setActiveCidade(null); setActiveSPRegiao(null); setActivePagamento(null); setValorMin(0); setValorMax(VALOR_TOTAL_MAX); }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            {sections.map((sec) => {
              return (
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

                  {/* Desktop: flex com colunas fixas (4 col), alinha à esquerda */}
                  <div className="hidden md:flex flex-wrap gap-5">
                    {sec.pros.map((p) => (
                      <div key={p.id} className="w-[calc(25%-15px)]">
                        <MiniCard profissional={p} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Expandir seções restantes */}
            {!hasFilters && !mostrarTodasSections && allSections.length > sections.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setMostrarTodasSections(true)}
                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#9A8C78] hover:text-carvao transition-colors cursor-pointer"
                >
                  Ver todas as especialidades
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5 L10 12.5 L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Trust banner + Como funciona — mobile only, depois dos cards */}
            {!hasFilters && (
              <div className="md:hidden flex flex-col gap-4 mt-10">
                <Link
                  href="/como-selecionamos"
                  className="flex flex-col justify-center bg-white border border-borda-azulada rounded-[15px] px-5 pt-4 pb-3 cursor-pointer no-underline"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <svg width="16" height="16" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
                      <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-serif text-[17px] font-semibold text-carvao">Por que é uma rede selecionada</span>
                  </div>
                  <p className="text-[14px] leading-[1.6] text-cinza-texto m-0">Registro no conselho e formação conferidos, um a um.</p>
                  <p className="text-[14px] leading-[1.6] text-cinza-texto m-0 mt-1">Uma rede pequena, para você decidir com segurança.</p>
                  <div className="mt-5 flex flex-col gap-2">
                    {[
                      "Registro ativo no conselho (CRM, CRP, CFFa, COFFITO ou CRN)",
                      "Formação na área e atuação em neurodesenvolvimento infantil",
                      "Verificação dos títulos e formações de cada profissional",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                          <circle cx="10" cy="10" r="8.4" stroke="#6E8893" strokeWidth="1.3" />
                          <path d="M6.3 10.2 L8.8 12.7 L13.8 7" stroke="#6E8893" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[13px] leading-[1.5] text-cinza-texto2">{item}</span>
                      </div>
                    ))}
                  </div>
                </Link>
                <div className="bg-wash-quente border border-borda-quente rounded-[15px] px-6 pt-4 pb-2 flex flex-col">
                  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-3 pl-9">Como funciona</div>
                  <div className="flex flex-col gap-0 w-full">
                    {[
                      { n: "1", titulo: "Você responde a algumas perguntas", desc: "Nos conte, em poucos passos, o que tem observado no comportamento da criança.", linha: true },
                      { n: "2", titulo: "Nós direcionamos o seu caso", desc: "Apresentamos os profissionais especializados da nossa rede mais alinhados às suas necessidades.", linha: true },
                      { n: "3", titulo: "Você escolhe com quem começar", desc: "Avalie os perfis verificados e agende a consulta diretamente com o especialista escolhido.", linha: false },
                    ].map((passo) => (
                      <div key={passo.n} className="flex gap-3">
                        <div className="flex flex-col items-center flex-none self-stretch">
                          <div className="w-6 h-6 rounded-full bg-white border border-borda-quente flex items-center justify-center font-serif text-[13px] font-semibold text-ferrugem flex-none">{passo.n}</div>
                          {passo.linha && <div className="flex-1 w-[1.5px] bg-borda-quente mt-1" />}
                        </div>
                        <div className="pt-0.5 pb-3">
                          <div className="text-[13.5px] font-semibold text-carvao leading-[1.3]">{passo.titulo}</div>
                          <div className="text-[12.5px] leading-[1.5] text-cinza-texto mt-0.5">{passo.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bloco de compartilhamento */}
            <div className="mt-10 md:mt-14 rounded-[16px] bg-ardosia-escura px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex-1">
                <p className="font-serif text-[18px] md:text-[20px] font-semibold text-white leading-[1.3]">
                  Conhece alguém que pode precisar?
                </p>
                <p className="text-[13.5px] md:text-[15px] text-white/70 mt-1 leading-[1.5]">
                  Compartilhe a Kiri e ajude mais famílias a encontrar o profissional certo.
                </p>
              </div>
              <button
                onClick={() => setShowCompartilhar(true)}
                className="flex-none flex items-center justify-center gap-2 bg-white text-ardosia-escura font-semibold text-[14px] md:text-[15px] rounded-[12px] px-5 py-3 cursor-pointer hover:bg-creme transition-colors whitespace-nowrap"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <circle cx="16" cy="4" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                  <circle cx="4" cy="10" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                  <circle cx="16" cy="16" r="2.4" stroke="#44606C" strokeWidth="1.4" />
                  <line x1="6.2" y1="8.8" x2="13.8" y2="5.2" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="6.2" y1="11.2" x2="13.8" y2="14.8" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Divulgue a Kiri
              </button>
            </div>

            {/* Rodapé */}
            <Footer className="mt-12 md:mt-16 mb-12" />
          </>
        )}
      </div>

      {/* ═══ BOTTOM SHEET: FILTROS MOBILE ═══ */}
      {activeSheet && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setActiveSheet(null)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-creme rounded-t-[20px] px-4 pt-4 pb-10 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-areia rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-[17px] text-carvao">
                {activeSheet === 'profissao' ? 'Tipo de profissional'
                  : activeSheet === 'modalidade' ? 'Modalidade'
                  : activeSheet === 'cidade' ? 'Cidade'
                  : activeSheet === 'faixa' ? 'Faixa etária'
                  : activeSheet === 'pagamento' ? 'Pagamento'
                  : 'Faixa de valor'}
              </span>
              <button onClick={() => setActiveSheet(null)} className="text-muted text-2xl leading-none cursor-pointer">×</button>
            </div>

            {/* Profissão */}
            {activeSheet === 'profissao' && (
              <div className="flex flex-wrap gap-2">
                {PROFISSOES_ORDENADAS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setActiveProfissao(activeProfissao === p ? null : p); setActiveSheet(null); }}
                    className={`text-[13.5px] font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                      activeProfissao === p ? 'bg-ardosia-escura border-ardosia text-white' : 'bg-white border-linha text-cinza-texto'
                    }`}
                  >
                    {PROFISSAO_PLURAL[p] ?? p}
                  </button>
                ))}
              </div>
            )}

            {/* Modalidade */}
            {activeSheet === 'modalidade' && (
              <div className="flex flex-col gap-2">
                {FILTROS_MODALIDADE.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setActiveModalidade(activeModalidade === m ? null : m); setActiveSheet(null); }}
                    className={`text-[15px] font-semibold px-4 py-3.5 rounded-[13px] border text-left transition-all cursor-pointer ${
                      activeModalidade === m ? 'bg-ardosia-escura border-ardosia text-white' : 'bg-white border-linha text-cinza-texto'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Cidade */}
            {activeSheet === 'cidade' && (
              <div className="flex flex-wrap gap-2">
                {CIDADES_DISPONIVEIS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      const same = activeCidade === c;
                      setActiveCidade(same ? null : c);
                      if (same || normCidade(c) !== 'sao paulo') setActiveSPRegiao(null);
                      setActiveSheet(null);
                    }}
                    className={`text-[13.5px] font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                      activeCidade === c ? 'bg-ardosia-escura border-ardosia text-white' : 'bg-white border-linha text-cinza-texto'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* Faixa etária */}
            {activeSheet === 'faixa' && (
              <div className="flex flex-col gap-2">
                {['Bebês (0–2 anos)', 'Pré-escola (3–5 anos)', 'Crianças (6–12 anos)', 'Adolescentes (13–18 anos)'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setActiveFaixa(activeFaixa === f ? null : f); setActiveSheet(null); }}
                    className={`text-[15px] font-semibold px-4 py-3.5 rounded-[13px] border text-left transition-all cursor-pointer ${
                      activeFaixa === f ? 'bg-ardosia-escura border-ardosia text-white' : 'bg-white border-linha text-cinza-texto'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {/* Pagamento */}
            {activeSheet === 'pagamento' && (
              <div className="flex flex-col gap-2">
                {['Particular', 'Convênio'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setActivePagamento(activePagamento === opt ? null : opt); setActiveSheet(null); }}
                    className={`text-[15px] font-semibold px-4 py-3.5 rounded-[13px] border text-left transition-all cursor-pointer ${
                      activePagamento === opt ? 'bg-ardosia-escura border-ardosia text-white' : 'bg-white border-linha text-cinza-texto'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Valor */}
            {activeSheet === 'valor' && (
              <div className="px-1">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">Valor por consulta</span>
                  <span className="text-[14px] font-semibold text-ardosia-escura">
                    R${valorMin} — {valorMax >= VALOR_TOTAL_MAX ? 'R$600+' : `R$${valorMax}`}
                  </span>
                </div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute left-0 right-0 h-[5px] bg-areia rounded-full" />
                  <div
                    className="absolute h-[5px] bg-ardosia rounded-full pointer-events-none"
                    style={{
                      left: `${(valorMin / VALOR_TOTAL_MAX) * 100}%`,
                      right: `${100 - (valorMax / VALOR_TOTAL_MAX) * 100}%`,
                    }}
                  />
                  <input
                    type="range" min={0} max={VALOR_TOTAL_MAX} step={50}
                    value={valorMin}
                    onChange={(e) => { const v = Number(e.target.value); if (v <= valorMax - 50) setValorMin(v); }}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: valorMin > VALOR_TOTAL_MAX - 100 ? 5 : 3 }}
                  />
                  <input
                    type="range" min={0} max={VALOR_TOTAL_MAX} step={50}
                    value={valorMax}
                    onChange={(e) => { const v = Number(e.target.value); if (v >= valorMin + 50) setValorMax(v); }}
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: 4 }}
                  />
                  <div
                    className="absolute w-6 h-6 rounded-full bg-ardosia-escura border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.22)] pointer-events-none"
                    style={{ left: `calc(${(valorMin / VALOR_TOTAL_MAX) * 100}% - 12px)`, zIndex: 6 }}
                  />
                  <div
                    className="absolute w-6 h-6 rounded-full bg-ardosia-escura border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.22)] pointer-events-none"
                    style={{ left: `calc(${(valorMax / VALOR_TOTAL_MAX) * 100}% - 12px)`, zIndex: 6 }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-muted">R$0</span>
                  <span className="text-[12px] text-muted">R$600+</span>
                </div>
                <button
                  onClick={() => setActiveSheet(null)}
                  className="mt-6 w-full bg-ardosia-escura text-white font-semibold text-[15px] rounded-[13px] py-3.5 cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="mb-4">
                <KiriLogoCompact height={28} onDark />
              </div>
              <p className="font-serif text-[22px] font-medium leading-[1.25] text-white">
                Uma rede de profissionais verificados que atuam com neurodesenvolvimento infantil.
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
  const [expandido, setExpandido] = useState(false);
  const LIMITE = 3;
  const temMais = p.areas_atuacao.length > LIMITE;
  const areasVisiveis = expandido ? p.areas_atuacao : p.areas_atuacao.slice(0, LIMITE);

  return (
    <Link
      href={`/profissional/${p.id}`}
      className="w-full h-full bg-white border border-linha rounded-[15px] p-3.5 md:p-5 shadow-[0_5px_16px_-11px_rgba(60,55,45,0.32)] cursor-pointer no-underline block hover:shadow-[0_8px_24px_-10px_rgba(60,55,45,0.4)] transition-shadow"
    >
      <div className="flex items-center gap-[11px] md:gap-3.5">
        <PlaceholderPhoto size={46} radius={11} url={p.foto_url} posicao={p.foto_posicao} />
        <div className="min-w-0 flex-1">
          <span className="font-serif text-[15.5px] md:text-[17px] font-semibold text-carvao leading-[1.12] block">
            {titleCasePT(p.nome)}
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

      <div className="flex gap-1.5 flex-wrap mt-[11px] items-center">
        {areasVisiveis.map((area) => (
          <span
            key={area}
            className="text-[10.5px] md:text-[12px] font-semibold text-ardosia-escura bg-wash-azulado border border-borda-azulada px-2 md:px-2.5 py-0.5 rounded-[6px]"
          >
            {area}
          </span>
        ))}
        {temMais && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandido((v) => !v); }}
            className="text-[10.5px] md:text-[12px] font-semibold text-muted px-1.5 py-0.5 cursor-pointer"
          >
            {expandido ? "←" : `+${p.areas_atuacao.length - LIMITE} →`}
          </button>
        )}
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
