"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { KiriLogo } from "@/components/KiriLogo";
import { SeloMini } from "@/components/SeloVerificado";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { PROFISSOES_ORDENADAS, cidadeCurta, modalidadeCurta } from "@/types";

const profissionais = data.profissionais as Profissional[];
const FILTROS_MODALIDADE = ["Presencial e online", "Somente presencial", "Somente online"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCond, setActiveCond] = useState<string | null>(null);
  const [activeProfissao, setActiveProfissao] = useState<string | null>(null);
  const [activeModalidade, setActiveModalidade] = useState<string | null>(null);
  const [showProfissaoOptions, setShowProfissaoOptions] = useState(false);
  const [showModalidadeOptions, setShowModalidadeOptions] = useState(false);

  const filtered = useMemo(() => {
    return profissionais.filter((p) => {
      if (activeCond && !p.areas_atuacao.includes(activeCond)) return false;
      if (activeProfissao && p.profissao !== activeProfissao) return false;
      if (activeModalidade && p.modalidade !== activeModalidade) return false;
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
  }, [search, activeCond, activeProfissao, activeModalidade]);

  const sections = PROFISSOES_ORDENADAS.map((prof) => ({
    nome: prof,
    pros: filtered.filter((p) => p.profissao === prof),
  })).filter((s) => s.pros.length > 0);

  const hasFilters = !!(activeCond || activeProfissao || activeModalidade || search.trim());

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
            <KiriLogo size={24} />
            <span className="font-serif text-[22px] font-medium text-ferrugem leading-none">Kiri</span>
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
            <button className="inline-flex items-center gap-1.5 bg-white border border-linha rounded-full px-3 py-1.5 cursor-pointer">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M10 18 C10 18 16 12 16 7.5 A6 6 0 1 0 4 7.5 C4 12 10 18 10 18 Z" stroke="#6E8893" strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx="10" cy="7.6" r="2.1" stroke="#6E8893" strokeWidth="1.6" />
              </svg>
              <span className="text-[12px] md:text-[12.5px] font-semibold text-cinza-texto">São Paulo</span>
            </button>
            <Link href="/como-selecionamos" className="hidden md:block text-[13px] font-semibold text-cinza-texto hover:text-carvao transition-colors no-underline">
              Como selecionamos
            </Link>
            <Link href="/sobre" className="hidden md:block text-[13px] font-semibold text-cinza-texto hover:text-carvao transition-colors no-underline">
              Sobre
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ CONTEÚDO PRINCIPAL ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">

        {/* Hero */}
        <div className="pt-6 md:pt-14 md:pb-2">
          <h1
            className="font-serif text-[27px] md:text-[40px] lg:text-[46px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao md:max-w-3xl"
            style={{ textWrap: "pretty" } as React.CSSProperties}
          >
            Encontre o profissional certo para o desenvolvimento do seu filho.
          </h1>
          <p
            className="mt-3 md:mt-5 text-[14.5px] md:text-[16.5px] leading-[1.55] md:leading-[1.65] text-cinza-texto md:max-w-2xl"
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

        {/* Filtros por condição */}
        <div className="pt-6 md:pt-10">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-3 md:mb-4">
            Buscar por condição
          </div>

          {/* TEA + TDAH — 2 col mobile, continua 2 col desktop (mais largo) */}
          <div className="grid grid-cols-2 gap-2.5 md:gap-4">
            {(["TEA", "TDAH"] as const).map((cond) => (
              <button
                key={cond}
                onClick={() => toggleCond(cond)}
                className={`flex flex-col gap-1 items-start rounded-[13px] md:rounded-[16px] px-4 py-4 md:py-6 cursor-pointer transition-all ${
                  activeCond === cond
                    ? "bg-ardosia-escura border-2 border-ardosia"
                    : "bg-wash-azulado border-[1.5px] border-borda-azulada"
                }`}
              >
                <span className={`text-[17px] md:text-[22px] font-bold ${activeCond === cond ? "text-white" : "text-ardosia-escura"}`}>
                  {cond}
                </span>
                <span className={`text-[11.5px] md:text-[13px] ${activeCond === cond ? "text-white/80" : "text-ardosia-texto"}`}>
                  {cond === "TEA" ? "Espectro autista" : "Atenção e hiperatividade"}
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
            className="flex items-center gap-3 mt-3 md:mt-4 bg-wash-quente border border-borda-quente rounded-[13px] md:rounded-[16px] px-4 py-4 md:py-5 cursor-pointer no-underline transition-all hover:shadow-[0_4px_16px_-8px_rgba(160,90,40,0.25)]"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex-shrink-0 bg-white border border-borda-quente flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                <path d="M7.3 7.4 C7.3 5.6 8.5 4.5 10 4.5 C11.6 4.5 12.7 5.6 12.7 7 C12.7 9.3 10 9 10 11.3" stroke="#BE6E4E" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="10" cy="14.7" r="1.05" fill="#BE6E4E" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] md:text-[15px] font-bold text-ferrugem-escura leading-[1.2]">
                Não sei por onde começar
              </div>
              <div className="text-[12.5px] md:text-[13px] text-cinza-texto mt-0.5">
                Quero uma avaliação do neurodesenvolvimento
              </div>
            </div>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 4 L13 10 L7 16" stroke="#BE6E4E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Filtros adicionais */}
        <div className="pt-4 md:pt-5 overflow-x-auto scrollbar-hide flex gap-2 md:flex-wrap md:overflow-visible">
          {/* Tipo de profissional */}
          <button
            onClick={() => { setShowProfissaoOptions((v) => !v); setShowModalidadeOptions(false); }}
            className={`flex-none inline-flex items-center gap-1.5 rounded-full px-[13px] py-2 cursor-pointer border transition-all ${
              activeProfissao ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
            }`}
          >
            <span className="text-[13px] font-semibold whitespace-nowrap">
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
            className={`flex-none inline-flex items-center gap-1.5 rounded-full px-[13px] py-2 cursor-pointer border transition-all ${
              activeModalidade ? "bg-ardosia-escura border-ardosia text-white" : "bg-white border-linha text-cinza-texto"
            }`}
          >
            <span className="text-[13px] font-semibold whitespace-nowrap">
              {activeModalidade ? modalidadeCurta(activeModalidade) : "Modalidade"}
            </span>
            {activeModalidade ? (
              <span className="text-white text-sm ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveModalidade(null); }}>×</span>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>

          {["Cidade", "Faixa de valor", "Particular / convênio"].map((f) => (
            <button key={f} className="flex-none inline-flex items-center gap-1.5 bg-white border border-linha rounded-full px-[13px] py-2 cursor-pointer">
              <span className="text-[13px] font-semibold text-cinza-texto whitespace-nowrap">{f}</span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ))}
        </div>

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
                {p}
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

        {/* Trust banner + Como funciona — visível quando sem filtros */}
        {!hasFilters && (
          <div className="pt-8 md:pt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Por que selecionada */}
            <Link
              href="/como-selecionamos"
              className="block bg-white border border-borda-azulada rounded-[15px] md:rounded-[18px] p-4 md:p-6 cursor-pointer no-underline hover:shadow-[0_6px_24px_-10px_rgba(68,96,108,0.2)] transition-shadow"
            >
              <div className="flex items-center gap-2.5 mb-2.5 md:mb-3">
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
                  <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-serif text-[17px] md:text-[19px] font-semibold text-carvao">
                  Por que é uma rede selecionada
                </span>
              </div>
              <p className="text-[13.5px] md:text-[14.5px] leading-[1.6] text-cinza-texto m-0">
                Registro no conselho e formação conferidos, um a um. Uma rede pequena, para você decidir com segurança.
              </p>
            </Link>

            {/* Como funciona */}
            <div className="bg-wash-quente border border-borda-quente rounded-[15px] md:rounded-[18px] p-4 md:p-6">
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-4">Como funciona</div>
              <div className="flex flex-col gap-0">
                {[
                  { n: "1", texto: "Conte o que procura.", linha: true },
                  { n: "2", texto: "Veja profissionais com formação verificada.", linha: true },
                  { n: "3", texto: "Escolha com quem começar.", linha: false },
                ].map((passo) => (
                  <div key={passo.n} className="flex gap-3.5 items-start">
                    <div className="flex flex-col items-center flex-none">
                      <div className="w-7 h-7 rounded-full bg-white border border-borda-quente flex items-center justify-center font-serif text-[14px] font-semibold text-ferrugem">
                        {passo.n}
                      </div>
                      {passo.linha && <div className="w-[1.5px] h-[24px] bg-borda-quente" />}
                    </div>
                    <div className="text-[14px] md:text-[14.5px] leading-[1.45] text-carvao-sutil pt-1 pb-3.5">
                      {passo.texto}
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
              onClick={() => { setSearch(""); setActiveCond(null); setActiveProfissao(null); setActiveModalidade(null); }}
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
                    {sec.nome}
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
                    <div key={p.id} className="flex-none w-[204px]">
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
            <div className="mt-12 md:mt-16 pt-5 border-t border-linha text-center pb-12">
              <div className="inline-flex items-center gap-1.5">
                <KiriLogo size={18} />
                <span className="text-[12px] text-muted">Kiri · Rede selecionada de neurodesenvolvimento</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MiniCard({ profissional: p }: { profissional: Profissional }) {
  return (
    <Link
      href={`/profissional/${p.id}`}
      className="w-full h-full bg-white border border-linha rounded-[15px] p-3.5 md:p-5 shadow-[0_5px_16px_-11px_rgba(60,55,45,0.32)] cursor-pointer no-underline block hover:shadow-[0_8px_24px_-10px_rgba(60,55,45,0.4)] transition-shadow"
    >
      <div className="flex items-center gap-[11px]">
        <PlaceholderPhoto size={46} radius={11} />
        <div className="min-w-0 flex-1">
          <span className="font-serif text-[15.5px] font-semibold text-carvao leading-[1.12] block">
            {p.nome}
          </span>
          <div className="mt-1">
            <SeloMini />
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mt-[11px]">
        {p.areas_atuacao.map((area) => (
          <span
            key={area}
            className="text-[10.5px] font-semibold text-ardosia-escura bg-wash-azulado border border-borda-azulada px-2 py-0.5 rounded-[6px]"
          >
            {area}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-[11px] text-[11.5px] text-cinza-texto2">
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
