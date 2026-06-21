"use client";

import { Suspense } from "react";
import Script from "next/script";
import { NavBack } from "@/components/NavBack";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { useParams } from "next/navigation";

const profissionais = data.profissionais as Profissional[];

// Substitua pela URL real do Tally após criar o formulário
const TALLY_FORM_ID = "PENDENTE"; // ex: "wgZKkP"

export default function ReportarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-creme" />}>
      <ReportarContent />
    </Suspense>
  );
}

function ReportarContent() {
  const params = useParams();
  const id = params.id as string;
  const profissional = profissionais.find((p) => p.id === id) ?? null;

  const tallyUrl = `https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&profissional_id=${id}`;

  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Reportar perfil" />
      </div>

      <div className="max-w-2xl mx-auto pb-14 w-full px-4">
        {/* Cabeçalho */}
        <div className="pt-2 pb-5">
          <h1 className="font-serif text-[26px] font-medium text-carvao leading-[1.2]">
            Reportar erro ou perfil
          </h1>
          <p className="mt-2 text-[15px] leading-[1.6] text-cinza-texto">
            Ajude a manter a rede Kiri atualizada. Seu reporte é anônimo e revisado pela nossa equipe.
          </p>
        </div>

        {/* Card do profissional */}
        {profissional && (
          <div className="mb-6 bg-white border border-linha rounded-[14px] px-4 py-3.5 flex items-center gap-3">
            <PlaceholderPhoto size={44} radius={10} />
            <div className="min-w-0">
              <div className="font-serif text-[15.5px] font-semibold text-carvao leading-[1.15] truncate">
                {profissional.nome}
              </div>
              <div className="text-[13px] text-cinza-texto mt-0.5 truncate">
                {profissional.titulo_exibicao}
              </div>
            </div>
          </div>
        )}

        {/* Tally embed */}
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
        <iframe
          data-tally-src={tallyUrl}
          loading="lazy"
          width="100%"
          height="500"
          frameBorder={0}
          marginHeight={0}
          marginWidth={0}
          title="Reportar perfil Kiri"
        />
      </div>
    </div>
  );
}
