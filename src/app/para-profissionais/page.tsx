"use client";

import { useState } from "react";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import { Footer } from "@/components/Footer";

const FAQ_ITEMS = [
  {
    pergunta: "A Kiri cobra algum valor para eu participar da rede?",
    resposta: "Não. Participar da rede Kiri é totalmente gratuito. Não cobramos comissão, mensalidade nem qualquer taxa dos profissionais.",
  },
  {
    pergunta: "Como funciona o agendamento com as famílias?",
    resposta: "A Kiri faz a conexão. A família encontra seu perfil na plataforma e entra em contato diretamente com você pelo WhatsApp. O agendamento e o atendimento acontecem inteiramente entre você e a família — a Kiri não intermedia.",
  },
  {
    pergunta: "Preciso atender convênio para participar?",
    resposta: "Não. A rede inclui profissionais que atendem particular, com reembolso e por convênio. Todos os formatos são bem-vindos.",
  },
  {
    pergunta: "Quais profissões são aceitas?",
    resposta: "Psicólogos, fonoaudiólogos, terapeutas ocupacionais, neuropediatras, psiquiatras da infância e adolescência, neurologistas, neuropsicólogos, fisioterapeutas, nutricionistas e psicopedagogos — com atuação em neurodesenvolvimento infantil.",
  },
  {
    pergunta: "Quanto tempo leva para meu perfil ir ao ar?",
    resposta: "Após o envio da inscrição e dos documentos, o prazo é de aproximadamente 48 horas para análise e publicação do perfil.",
  },
  {
    pergunta: "Posso atualizar meu perfil depois de publicado?",
    resposta: "Sim. Se precisar atualizar alguma informação, basta entrar em contato com a Kiri pelo e-mail ou WhatsApp.",
  },
];

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="border-b border-linha last:border-0">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full text-left flex items-start justify-between gap-4 py-4 cursor-pointer"
      >
        <span className="text-[15px] font-medium text-carvao leading-snug">{pergunta}</span>
        <span className="flex-shrink-0 mt-0.5 text-ardosia text-[18px] leading-none">
          {aberto ? "−" : "+"}
        </span>
      </button>
      {aberto && (
        <p className="text-[14.5px] text-cinza-texto leading-[1.7] pb-4 -mt-1">
          {resposta}
        </p>
      )}
    </div>
  );
}

export default function ParaProfissionaisPage() {
  return (
    <div className="min-h-screen bg-creme">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-creme/95 backdrop-blur-sm border-b border-linha">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <KiriLogoCompact height={36} />
          </Link>
          <Link
            href="/profissionais/inscricao"
            className="text-[13.5px] font-semibold text-ferrugem bg-ferrugem/8 border border-ferrugem/25 rounded-[9px] px-3.5 py-1.5 hover:bg-ferrugem/14 transition-colors no-underline"
          >
            Quero me inscrever
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-16">

        {/* Hero */}
        <section className="pt-12 pb-10">
          <h1 className="text-[32px] md:text-[38px] font-semibold text-carvao leading-tight tracking-[-0.01em] mb-4">
            Faça parte da rede Kiri
          </h1>
          <p className="text-[16.5px] text-cinza-texto leading-[1.65] mb-8 max-w-lg">
            Uma plataforma que conecta profissionais de neurodesenvolvimento infantil com famílias que buscam cuidado especializado — com verificação de formação em cada perfil.
          </p>
          <Link
            href="/profissionais/inscricao"
            className="inline-flex items-center gap-2 bg-ferrugem text-white font-semibold text-[15px] rounded-[12px] px-6 py-3.5 hover:opacity-90 transition-opacity no-underline"
          >
            Quero me inscrever →
          </Link>
        </section>

        {/* Divisor */}
        <div className="border-t border-linha mb-10" />

        {/* Como funciona */}
        <section className="mb-12">
          <h2 className="text-[19px] font-semibold text-carvao mb-6">Como funciona</h2>
          <div className="flex flex-col gap-5">
            {[
              { n: "1", titulo: "Você preenche a inscrição e envia seus documentos", desc: "Um formulário simples com seus dados profissionais, formação e informações de atendimento." },
              { n: "2", titulo: "Verificamos seu registro e suas formações", desc: "Nossa equipe analisa os documentos enviados e confirma as informações antes de publicar o perfil." },
              { n: "3", titulo: "Seu perfil vai ao ar", desc: "Famílias que buscam profissionais com a sua especialidade passam a encontrar e entrar em contato com você." },
            ].map(({ n, titulo, desc }) => (
              <div key={n} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ferrugem/10 border border-ferrugem/20 flex items-center justify-center">
                  <span className="text-[13px] font-bold text-ferrugem">{n}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-carvao mb-1">{titulo}</p>
                  <p className="text-[14px] text-cinza-texto leading-[1.6]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Por que a Kiri */}
        <section className="mb-12">
          <h2 className="text-[19px] font-semibold text-carvao mb-6">Por que a Kiri?</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { titulo: "Sem comissão, sem mensalidade", desc: "Participar é gratuito. Nenhum valor é cobrado pela plataforma." },
              { titulo: "Agendamento direto com a família", desc: "A família entra em contato com você. Sem intermediários no processo de agendamento." },
              { titulo: "Perfil com formação verificada", desc: "Cada profissional da rede tem seus títulos conferidos — isso transmite credibilidade para quem busca." },
            ].map(({ titulo, desc }) => (
              <div key={titulo} className="bg-white/60 border border-linha rounded-[14px] px-5 py-4">
                <p className="text-[15px] font-semibold text-carvao mb-1">{titulo}</p>
                <p className="text-[13.5px] text-cinza-texto leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-[19px] font-semibold text-carvao mb-2">Perguntas frequentes</h2>
          <div className="mt-4">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.pergunta} {...item} />
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-ardosia/8 border border-ardosia/15 rounded-[16px] px-6 py-7 text-center">
          <p className="text-[16px] font-semibold text-carvao mb-2">Pronto para fazer parte?</p>
          <p className="text-[14px] text-cinza-texto mb-5">
            A inscrição leva alguns minutos e é totalmente gratuita.
          </p>
          <Link
            href="/profissionais/inscricao"
            className="inline-flex items-center gap-2 bg-ardosia-escura text-white font-semibold text-[15px] rounded-[12px] px-6 py-3.5 hover:opacity-90 transition-opacity no-underline"
          >
            Preencher inscrição →
          </Link>
        </section>

        <div className="mt-12">
          <Footer />
        </div>
      </main>
    </div>
  );
}
