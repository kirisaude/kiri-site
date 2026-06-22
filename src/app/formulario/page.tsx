"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];

export default function FormularioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-creme" />}>
      <FormularioContent />
    </Suspense>
  );
}

function FormularioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profissionalId = searchParams.get("profissional");
  const profissionalSolicitado = profissionalId
    ? (profissionais.find((p) => p.id === profissionalId) ?? null)
    : null;

  const tallyUrl =
    `https://tally.so/embed/pb50vq?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1` +
    (profissionalId ? `&profissional_solicitado=${profissionalId}` : "");

  return (
    <div className="min-h-screen bg-creme">
      <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />

      <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between">
        <NavBack />
        <span className="text-[12.5px] font-semibold tracking-[0.04em] text-muted">
          Pré-cadastro · triagem
        </span>
        <div className="w-9 h-9" />
      </div>

      <div className="max-w-2xl mx-auto pb-12 w-full">
        <div className="px-[18px] pt-8">
          <h1 className="font-serif text-[28px] font-medium leading-[1.25] text-carvao m-0">
            Conte o que você procura
          </h1>
          <p className="text-[15.5px] leading-[1.55] text-cinza-texto2 mt-2 mb-0">
            O preenchimento é rápido. Suas respostas nos ajudam a encontrar o especialista ideal para a sua necessidade.
          </p>
        </div>

        {/* Card do profissional solicitado */}
        {profissionalSolicitado && (
          <div className="mx-[18px] mt-4 bg-white border border-areia rounded-[16px] shadow-[0_4px_16px_-10px_rgba(60,55,45,0.25)] overflow-hidden">
            <div className="px-4 pt-[13px] pb-[11px]">
              <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted mb-[10px]">
                Encaminhamento para
              </div>
              <div className="flex items-start gap-3">
                <PlaceholderPhoto size={54} radius={12} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-[16px] font-semibold text-carvao leading-[1.15]">
                      {profissionalSolicitado.nome}
                    </span>
                    <svg width="15" height="15" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
                      <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-[12.5px] text-cinza-texto mt-0.5 truncate">
                    {profissionalSolicitado.titulo_exibicao}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/formulario")}
                  className="flex-none text-[13px] font-semibold text-ferrugem cursor-pointer mr-1"
                >
                  Trocar
                </button>
              </div>
            </div>
            <div className="border-t border-linha-sutil px-4 py-[11px] flex gap-2.5 items-start">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="10" cy="10" r="8.2" stroke="#9A8C78" strokeWidth="1.4" />
                <line x1="10" y1="9" x2="10" y2="14" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="6.3" r="1.05" fill="#9A8C78" />
              </svg>
              <p className="text-[12px] leading-[1.55] text-muted m-0">
                Nossa equipe valida a disponibilidade do profissional e direciona o caso para que o seu atendimento comece o quanto antes.
              </p>
            </div>
          </div>
        )}

        {/* Aviso de triagem */}
        <div className="mx-[18px] mt-4 bg-[#F6E6CC] border border-ambar-borda rounded-[13px] px-[14px] py-[13px] flex gap-[11px]">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="10" cy="10" r="8.2" stroke="#BE8A3E" strokeWidth="1.5" />
            <line x1="10" y1="9" x2="10" y2="14" stroke="#BE8A3E" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="6.3" r="1.05" fill="#BE8A3E" />
          </svg>
          <div>
            <p className="text-[14.5px] leading-[1.5] text-ambar-texto m-0">
              Esta triagem é orientação e encaminhamento — não é avaliação clínica nem diagnóstico.
            </p>
            <p className="text-[14.5px] leading-[1.5] text-ambar-texto font-semibold mt-0.5 m-0">
              Em caso de urgência ou risco, procure um pronto-socorro.
            </p>
          </div>
        </div>

        {/* Aviso de privacidade */}
        <div className="mx-[18px] mt-3 bg-white border border-linha rounded-[13px] px-[14px] py-[13px] flex gap-[11px]">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M10 2.5 L16.5 5.2 L16.5 10 C16.5 14 13.7 16.5 10 17.8 C6.3 16.5 3.5 14 3.5 10 L3.5 5.2 Z" stroke="#9A8C78" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M7.4 10 L9.2 11.8 L12.8 7.8" stroke="#9A8C78" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[12.5px] leading-[1.6] text-muted m-0">
            Seus dados são usados exclusivamente para encaminhamento ao profissional indicado. As respostas são armazenadas pelo Tally.so e acessadas apenas pela equipe Kiri. Você pode solicitar acesso, correção ou exclusão pelo e-mail{" "}
            <a href="mailto:kirisaude@gmail.com" className="underline text-cinza-texto2">
              kirisaude@gmail.com
            </a>
            . Conforme a{" "}
            <a href="/politica-de-privacidade" className="underline text-cinza-texto2">
              Política de Privacidade
            </a>
            .
          </p>
        </div>

        {/* Tally embed */}
        <div className="mx-[18px] mt-5">
          <iframe
            data-tally-src={tallyUrl}
            loading="lazy"
            width="100%"
            height="800"
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            title="Encaminhamento Kiri"
          />
        </div>
        <Footer className="mx-[18px] mt-6 mb-8" />
      </div>
    </div>
  );
}
