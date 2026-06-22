"use client";

import Script from "next/script";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";

const TALLY_URL =
  "https://tally.so/embed/D4bWyE?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1";

export default function InscricaoProfissionalPage() {
  return (
    <div className="min-h-screen bg-creme flex flex-col">
      <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />

      <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between">
        <NavBack />
        <span className="text-[12.5px] font-semibold tracking-[0.04em] text-muted">
          Inscrição de profissional
        </span>
        <div className="w-9 h-9" />
      </div>

      <div className="max-w-2xl mx-auto w-full flex-1 px-[18px]">
        {/* Cabeçalho */}
        <div className="pt-8 pb-2">
          <h1 className="font-serif text-[28px] md:text-[32px] font-medium leading-[1.25] text-carvao m-0">
            Faça parte da rede Kiri
          </h1>
          <p className="text-[15.5px] leading-[1.55] text-cinza-texto2 mt-3 mb-0">
            Analisamos cada inscrição individualmente. Se o seu perfil atender
            aos nossos critérios, entraremos em contato em até 15 dias.
          </p>
        </div>

        {/* Critérios resumidos */}
        <div className="mt-5 bg-wash-azulado border border-borda-azulada rounded-[14px] px-4 py-4">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto mb-3">
            O que verificamos
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              "Registro ativo e regular no conselho (CRM, CRP, CFFa, COFFITO ou CRN)",
              "Formação na área e atuação em neurodesenvolvimento infantil",
              "Situação ética regular — sem pendências no conselho",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="10" cy="10" r="8.4" stroke="#44606C" strokeWidth="1.3" />
                  <path d="M6.3 10.2 L8.8 12.7 L13.8 7" stroke="#44606C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[13.5px] leading-[1.5] text-ardosia-escura">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aviso de privacidade */}
        <div className="mt-4 bg-white border border-linha rounded-[13px] px-[14px] py-[13px] flex gap-[11px]">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M10 2.5 L16.5 5.2 L16.5 10 C16.5 14 13.7 16.5 10 17.8 C6.3 16.5 3.5 14 3.5 10 L3.5 5.2 Z" stroke="#9A8C78" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M7.4 10 L9.2 11.8 L12.8 7.8" stroke="#9A8C78" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[12.5px] leading-[1.6] text-muted m-0">
            Seus dados são usados exclusivamente para análise da sua candidatura. As respostas são armazenadas pelo Tally.so e acessadas apenas pela equipe Kiri. Você pode solicitar acesso, correção ou exclusão pelo e-mail{" "}
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

        {/* Formulário Tally */}
        <div className="mt-6">
          <iframe
            data-tally-src={TALLY_URL}
            loading="lazy"
            width="100%"
            height="900"
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            title="Inscrição de profissional — Kiri"
          />
        </div>

        <Footer className="mt-6 mb-8" />
      </div>
    </div>
  );
}
