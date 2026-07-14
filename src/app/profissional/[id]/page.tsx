import Link from "next/link";
import { notFound } from "next/navigation";
import { KiriLogo } from "@/components/KiriLogo";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";
import { SaveButton } from "@/components/SaveButton";
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
      <div className="w-full px-4 md:px-8 pt-4 pb-0">
        <div className="flex items-center pb-3">
          <NavBack href="/" />
        </div>
      </div>

      {/* ═══ LAYOUT PRINCIPAL ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-28 md:pb-14">
        <div className="md:grid md:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr] md:gap-10 lg:gap-14 md:items-start">

          {/* ─── COLUNA ESQUERDA (identidade + credenciais) ─── */}
          <div className="md:sticky md:top-6">
            {/* Cabeçalho centralizado */}
            <div className="flex flex-col items-center text-center pt-2 md:pt-0">
              <PlaceholderPhoto size={100} radius={24} url={p.foto_url} />

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

              <SaveButton profissionalId={p.id} />
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
            <div className="hidden md:flex md:flex-col gap-2.5 mt-5">
              <Link
                href={`/formulario?profissional=${p.id}`}
                className="block w-full text-center font-semibold text-[16px] text-white bg-ardosia-escura rounded-[13px] py-[15px] cursor-pointer shadow-[0_8px_20px_-10px_rgba(44,70,80,0.35)] no-underline"
              >
                Quero ser encaminhado
              </Link>
              <Link
                href={`/reportar/${p.id}`}
                className="block w-full text-center text-[13px] font-medium text-cinza-texto bg-wash-quente border border-borda-quente rounded-[11px] py-2.5 no-underline hover:bg-[#EFE6D6] transition-colors"
              >
                Reportar perfil
              </Link>
            </div>

          </div>

          {/* ─── COLUNA DIREITA (conteúdo) ─── */}
          <div className="mt-7 md:mt-2 flex flex-col gap-7">

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
                      <div className="text-[14.5px] font-semibold text-carvao leading-[1.3] capitalize">{f.curso}</div>
                      <div className="text-[13px] text-cinza-texto2 mt-0.5 capitalize">{f.instituicao_ano}</div>
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
                {p.convenios && p.convenios.length > 0 && (
                  <div className="mt-[13px]">
                    <div className="text-[11.5px] font-semibold text-muted mb-2">Convênios atendidos</div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.convenios.map((c) => (
                        <span key={c} className="text-[12.5px] font-medium text-carvao-sutil bg-[#F5F2ED] border border-linha rounded-[7px] px-2.5 py-[4px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-3 text-[12px] leading-[1.5] text-muted">
                  Os valores podem variar conforme o caso e devem ser confirmados no momento do agendamento com o próprio profissional.
                </p>
              </div>

              {/* Reportar perfil — mobile (CTA principal fica na barra fixa) */}
              <div className="md:hidden mt-3.5">
                <Link
                  href={`/reportar/${p.id}`}
                  className="block w-full text-center text-[13px] font-medium text-cinza-texto bg-wash-quente border border-borda-quente rounded-[11px] py-2.5 no-underline hover:bg-[#EFE6D6] transition-colors"
                >
                  Reportar perfil
                </Link>
              </div>
            </div>

          </div>
        </div>
        <Footer className="mt-8" />
      </div>

      {/* Barra CTA fixa — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-creme/95 backdrop-blur-sm border-t border-linha px-4 py-3 flex flex-col gap-2">
        <Link
          href={`/formulario?profissional=${p.id}`}
          className="block w-full text-center font-semibold text-[16px] text-white bg-ardosia-escura rounded-[13px] py-[14px] cursor-pointer shadow-[0_8px_20px_-10px_rgba(44,70,80,0.35)] no-underline"
        >
          Quero ser encaminhado
        </Link>
      </div>
    </div>
  );
}
