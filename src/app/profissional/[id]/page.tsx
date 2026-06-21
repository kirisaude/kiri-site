import Link from "next/link";
import { notFound } from "next/navigation";
import { KiriLogo } from "@/components/KiriLogo";
import { NavBack } from "@/components/NavBack";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { valorDisplay } from "@/types";

const profissionais = data.profissionais as Profissional[];

export function generateStaticParams() {
  return profissionais.map((p) => ({ id: p.id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilPage({ params }: PageProps) {
  const { id } = await params;
  const p = profissionais.find((pro) => pro.id === id);
  if (!p) notFound();

  const registroLinha = p.rqe ? `${p.registro_conselho} · ${p.rqe}` : p.registro_conselho;

  const credenciais = [
    { rotulo: "Registro", valor: p.registro_conselho, detalhe: " — verificado pela Kiri" },
    ...(p.rqe
      ? [
          { rotulo: "Especialista", valor: p.rqe, detalhe: "" },
          { rotulo: "Área (RQE)", valor: p.titulo_exibicao, detalhe: "" },
        ]
      : [{ rotulo: "Área", valor: p.titulo_exibicao, detalhe: "" }]),
  ];

  return (
    <div className="min-h-screen bg-creme">
      {/* Nav */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between pt-1 pb-3">
          <NavBack href="/" />
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-white border border-linha flex items-center justify-center cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M5 9 L5 16 C5 16.6 5.4 17 6 17 L14 17 C14.6 17 15 16.6 15 16 L15 9" stroke="#564F45" strokeWidth="1.5" />
                <path d="M10 3 L10 12 M6.5 6 L10 2.6 L13.5 6" stroke="#564F45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-white border border-linha flex items-center justify-center cursor-pointer">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path d="M5 3 L15 3 C15.6 3 16 3.4 16 4 L16 17 L10 13 L4 17 L4 4 C4 3.4 4.4 3 5 3 Z" stroke="#564F45" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ LAYOUT PRINCIPAL ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-14">
        <div className="md:grid md:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr] md:gap-10 lg:gap-14 md:items-start">

          {/* ─── COLUNA ESQUERDA (identidade + credenciais) ─── */}
          <div className="md:sticky md:top-6">
            {/* Cabeçalho centralizado */}
            <div className="flex flex-col items-center text-center pt-2 md:pt-0">
              <PlaceholderPhoto size={100} radius={24} />

              <div className="flex items-center gap-[7px] mt-[14px]">
                <span className="font-serif text-[25px] md:text-[27px] font-semibold text-carvao leading-[1.1]">{p.nome}</span>
                {/* Selo verificado com tooltip */}
                <div className="relative group flex-none">
                  <svg width="19" height="19" viewBox="0 0 22 22" fill="none" aria-label="Verificado" style={{ flexShrink: 0, cursor: "default" }}>
                    <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
                    <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                    <div className="bg-carvao text-white text-[11.5px] leading-[1.4] rounded-[8px] px-3 py-2 whitespace-nowrap shadow-lg">
                      Cadastro validado junto ao conselho<br />de classe em {p.verificacao_data}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-carvao" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[15px] text-cinza-texto mt-1.5 leading-[1.3]">{p.titulo_exibicao}</div>
              <div className="text-[12.5px] tracking-[0.02em] text-muted mt-[7px]">{registroLinha}</div>

              <div className="flex flex-wrap gap-[7px] justify-center mt-[14px]">
                {p.areas_atuacao.map((area) => (
                  <span
                    key={area}
                    className="text-[12.5px] font-semibold text-ardosia-escura bg-wash-azulado border border-borda-azulada px-[13px] py-[5px] rounded-[8px]"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <button className="mt-[18px] w-full font-semibold text-[13px] text-cinza-texto bg-white border border-linha rounded-[11px] py-[11px] cursor-pointer inline-flex items-center justify-center gap-[7px]">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M5 3 L15 3 C15.6 3 16 3.4 16 4 L16 17 L10 13 L4 17 L4 4 C4 3.4 4.4 3 5 3 Z" stroke="#9A8C78" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Salvar para depois
              </button>
            </div>

            {/* Formação verificada */}
            <div className="mt-6 bg-white border border-borda-azulada rounded-[16px] overflow-hidden">
              <div className="flex items-center gap-[9px] bg-wash-azulado px-4 py-[13px]">
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
                  <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[13.5px] font-bold tracking-[0.03em] text-ardosia-escura">Verificado pela Kiri</span>
                <span className="ml-auto text-[11.5px] text-ardosia-texto">em {p.verificacao_data}</span>
              </div>
              <div className="px-4 pb-1.5">
                {credenciais.map((c, i) => (
                  <div key={i} className="flex gap-[11px] py-[11px] border-t border-linha-sutil">
                    <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted w-[94px] flex-none pt-[1px]">
                      {c.rotulo}
                    </div>
                    <div className="text-[14px] text-carvao leading-[1.45]">
                      {c.valor}
                      <span className="text-cinza-texto2">{c.detalhe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA desktop (visível só em md+) */}
            <div className="hidden md:block mt-5">
              <Link
                href={`/formulario?profissional=${p.id}`}
                className="block w-full text-center font-semibold text-[16px] text-white bg-ferrugem rounded-[13px] py-[15px] cursor-pointer shadow-[0_8px_20px_-10px_rgba(160,70,90,0.6)] no-underline"
              >
                Quero ser encaminhado
              </Link>
            </div>

            {/* Rodapé esq — só desktop */}
            <div className="hidden md:flex mt-6 pt-4 border-t border-linha items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KiriLogo size={18} />
                <span className="text-[12px] text-muted">Perfil verificado na rede Kiri</span>
              </div>
              <a href="/termos" className="text-[12px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos</a>
            </div>
          </div>

          {/* ─── COLUNA DIREITA (conteúdo) ─── */}
          <div className="mt-7 md:mt-0 flex flex-col gap-7">

            {/* Sobre */}
            <div>
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-2.5">Sobre</div>
              <p className="text-[15px] md:text-[15.5px] leading-[1.65] text-carvao-sutil m-0">{p.sobre}</p>
            </div>

            {/* Atende */}
            <div>
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-[11px]">Atende</div>
              <div className="flex flex-col gap-[11px]">
                <div className="flex items-center gap-2.5 text-[14px] md:text-[14.5px] text-carvao-sutil">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="2.5" y="4" width="15" height="10" rx="1.6" stroke="#6E8893" strokeWidth="1.4" />
                    <line x1="7" y1="17.2" x2="13" y2="17.2" stroke="#6E8893" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {p.modalidade}
                </div>
                <div className="flex items-center gap-2.5 text-[14px] md:text-[14.5px] text-carvao-sutil">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M10 18 C10 18 16 12 16 7.5 A6 6 0 1 0 4 7.5 C4 12 10 18 10 18 Z" stroke="#6E8893" strokeWidth="1.4" strokeLinejoin="round" />
                    <circle cx="10" cy="7.6" r="2.1" stroke="#6E8893" strokeWidth="1.4" />
                  </svg>
                  {p.cidade}
                </div>
                <div className="flex items-center gap-2.5 text-[14px] md:text-[14.5px] text-carvao-sutil">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="10" cy="6" r="3" stroke="#6E8893" strokeWidth="1.4" />
                    <path d="M4.5 16 C4.5 12 15.5 12 15.5 16" stroke="#6E8893" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {p.faixa_etaria}
                </div>
              </div>
            </div>

            {/* Formação acadêmica */}
            <div>
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-3">Formação acadêmica</div>
              <div className="flex flex-col gap-3.5">
                {p.formacao.map((f, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-[9px] h-[9px] rounded-full border-2 border-ferrugem flex-none mt-1" />
                    <div>
                      <div className="text-[14.5px] font-semibold text-carvao leading-[1.3]">{f.curso}</div>
                      <div className="text-[13px] text-cinza-texto2 mt-0.5">{f.instituicao_ano}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Valores */}
            <div>
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-[11px]">Valores</div>
              <div className="bg-white border border-linha rounded-[14px] p-[15px]">
                <div className="flex items-center gap-2.5">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="2.5" y="5" width="15" height="10.5" rx="2" stroke="#9A8C78" strokeWidth="1.3" />
                    <path d="M2.8 8.2 L17.2 8.2" stroke="#9A8C78" strokeWidth="1.3" />
                    <circle cx="13.8" cy="11.6" r="1.1" fill="#9A8C78" />
                  </svg>
                  <span className="text-[15px] text-carvao-sutil">
                    Consulta particular · {valorDisplay(p)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 mt-[11px]">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M5 3 L13 3 L15.5 5.5 L15.5 17 L5 17 Z" stroke="#9A8C78" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M12.6 3 L12.6 6 L15.5 6" stroke="#9A8C78" strokeWidth="1.3" strokeLinejoin="round" />
                    <line x1="7.5" y1="10" x2="13" y2="10" stroke="#9A8C78" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="7.5" y1="13" x2="13" y2="13" stroke="#9A8C78" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span className="text-[14px] text-cinza-texto">{p.convenio_info}</span>
                </div>
                <p className="mt-3 text-[12px] leading-[1.5] text-muted">
                  Os valores podem variar conforme o caso e são confirmados no encaminhamento.
                </p>
              </div>

              {/* CTA mobile */}
              <Link
                href={`/formulario?profissional=${p.id}`}
                className="md:hidden mt-3.5 block w-full text-center font-semibold text-[16px] text-white bg-ferrugem rounded-[13px] py-[15px] cursor-pointer shadow-[0_8px_20px_-10px_rgba(160,70,90,0.6)] no-underline"
              >
                Quero ser encaminhado
              </Link>
            </div>

            {/* Reportar */}
            <div className="pt-2 pb-1">
              <a
                href={`mailto:contato@kirisaude.com.br?subject=Reportar perfil: ${encodeURIComponent(p.nome)}&body=Olá, gostaria de reportar um erro ou inconsistência no perfil de ${encodeURIComponent(p.nome)} (ID: ${p.id}).%0A%0ADescrição:%0A`}
                className="inline-flex items-center gap-1.5 text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline"
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8.2" stroke="#9A8C78" strokeWidth="1.4" />
                  <line x1="10" y1="9" x2="10" y2="14" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="10" cy="6.3" r="1.05" fill="#9A8C78" />
                </svg>
                Reportar erro ou perfil
              </a>
            </div>

            {/* Rodapé mob */}
            <div className="md:hidden pt-4 border-t border-linha flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KiriLogo size={20} />
                <span className="text-[12px] text-muted">Perfil verificado na rede Kiri</span>
              </div>
              <a href="/termos" className="text-[12px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
