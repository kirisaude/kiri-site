"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import { KiriSymbol } from "@/components/KiriSymbol";
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

const BENEFICIOS = [
  {
    titulo: "Sem comissão, sem mensalidade",
    desc: "Participar é gratuito. Nenhum valor é cobrado pela plataforma.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" stroke="#44606C" strokeWidth="1.4" />
        <path d="M10 6v1.5M10 12.5V14M8.5 8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M3.5 3.5l13 13" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titulo: "Agendamento direto com a família",
    desc: "A família entra em contato com você. Sem intermediários no processo de agendamento.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2.5" y="4" width="15" height="13" rx="2" stroke="#44606C" strokeWidth="1.4" />
        <path d="M6.5 2v4M13.5 2v4M2.5 8.5h15" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titulo: "Perfil com formação verificada",
    desc: "Cada profissional da rede tem seus títulos conferidos — isso transmite credibilidade para quem busca.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5L12.3 7.2l5.2.76-3.75 3.65.88 5.15L10 14.27l-4.63 2.43.88-5.15L2.5 7.96l5.2-.76L10 2.5z" stroke="#44606C" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M7.5 10.5l1.8 1.8 3-3.6" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titulo: "Área exclusiva de networking entre colegas",
    desc: "Profissionais verificados têm acesso a um espaço privado para contato direto com outros membros da rede — troca de experiências, dúvidas e colaboração multiprofissional.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="6" r="2.8" stroke="#44606C" strokeWidth="1.4" />
        <circle cx="3.5" cy="14" r="2.2" stroke="#44606C" strokeWidth="1.4" />
        <circle cx="16.5" cy="14" r="2.2" stroke="#44606C" strokeWidth="1.4" />
        <path d="M5.5 12.5C6.5 10 8.5 9 10 9s3.5 1 4.5 3.5" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M3.5 11.8V10M16.5 11.8V10" stroke="#44606C" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

function SectionBadge({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className="text-[11px] font-semibold tracking-[0.12em] uppercase"
        style={{ color: "#BE6E4E" }}
      >
        {num}
      </span>
      <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto">
        · {label}
      </span>
    </div>
  );
}

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div
      className="rounded-[12px] mb-2 border transition-colors"
      style={{
        borderColor: aberto ? "#D8C7B0" : "#EDE3D3",
        background: aberto ? "#FFFFFF" : "transparent",
      }}
    >
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full text-left flex items-start justify-between gap-4 px-4 py-4 cursor-pointer"
      >
        <span className="text-[15px] font-medium text-carvao leading-snug">{pergunta}</span>
        <span
          className="flex-shrink-0 mt-0.5 text-ardosia text-[20px] leading-none"
          style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
        >
          {aberto ? "−" : "+"}
        </span>
      </button>
      {aberto && (
        <p className="text-[14.5px] text-cinza-texto leading-[1.7] px-4 pb-4 -mt-1">
          {resposta}
        </p>
      )}
    </div>
  );
}

export default function ParaProfissionaisPage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      const bottom = heroRef.current?.getBoundingClientRect().bottom ?? 200;
      setScrolled(bottom < 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-creme">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-creme/95 backdrop-blur-sm border-b border-linha">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <KiriLogoCompact height={36} />
          </Link>
          <div
            className="transition-all duration-200 overflow-hidden"
            style={{ maxWidth: scrolled ? 220 : 0, opacity: scrolled ? 1 : 0 }}
          >
            <Link
              href="/profissionais/inscricao"
              className="text-[13.5px] font-semibold text-creme bg-ferrugem rounded-[9px] px-3.5 py-1.5 hover:opacity-90 transition-opacity no-underline whitespace-nowrap block"
            >
              Quero me inscrever
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-16">

        {/* Hero */}
        <section ref={heroRef} className="pt-12 pb-10">
          <div className="flex items-center gap-3">
            <KiriSymbol height={46} />
            <h1
              className="text-[32px] md:text-[38px] text-carvao leading-tight tracking-[-0.01em] m-0"
              style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 500 }}
            >
              Faça parte da rede Kiri
            </h1>
          </div>
          <p
            className="mt-6 mb-8 text-[19px] md:text-[21px] text-carvao leading-[1.55] max-w-lg"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 400 }}
          >
            Uma plataforma que conecta profissionais de neurodesenvolvimento infantil com famílias que buscam cuidado especializado — com verificação de formação em cada perfil.
          </p>
          <Link
            href="/profissionais/inscricao"
            className="inline-flex items-center gap-2 bg-ferrugem text-creme font-semibold text-[15px] rounded-[12px] px-6 py-3.5 hover:opacity-90 transition-opacity no-underline"
          >
            Quero me inscrever →
          </Link>
        </section>

        <div className="border-t border-linha mb-10" />

        {/* Como funciona */}
        <section className="mb-12">
          <SectionBadge num="01" label="Como funciona" />
          <h2
            className="text-[32px] md:text-[36px] text-carvao leading-[1.15] tracking-[-0.01em] mb-8"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 500 }}
          >
            Como funciona
          </h2>
          <div className="flex flex-col gap-5">
            {[
              { n: "1", titulo: "Você preenche a inscrição e envia seus documentos", desc: "Um formulário simples com seus dados profissionais, formação e informações de atendimento." },
              { n: "2", titulo: "Verificamos seu registro e suas formações", desc: "Nossa equipe analisa os documentos enviados e confirma as informações antes de publicar o perfil." },
              { n: "3", titulo: "Seu perfil vai ao ar", desc: "Famílias que buscam profissionais com a sua especialidade passam a encontrar e entrar em contato com você." },
            ].map(({ n, titulo, desc }) => (
              <div key={n} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ferrugem/10 border border-ferrugem/20 flex items-center justify-center">
                  <span
                    className="text-[14px] font-medium text-ferrugem"
                    style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
                  >
                    {n}
                  </span>
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
          <SectionBadge num="02" label="Por que a Kiri?" />
          <h2
            className="text-[32px] md:text-[36px] text-carvao leading-[1.15] tracking-[-0.01em] mb-8"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 500 }}
          >
            Por que a Kiri?
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {BENEFICIOS.map(({ titulo, desc, icon }) => (
              <div
                key={titulo}
                className="flex gap-4 rounded-[16px] px-5 py-4"
                style={{ background: "#FFFFFF", border: "1px solid #D8C7B0" }}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div>
                  <p className="text-[15px] font-semibold text-carvao mb-1">{titulo}</p>
                  <p className="text-[13.5px] text-cinza-texto leading-[1.6]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <SectionBadge num="03" label="Perguntas frequentes" />
          <h2
            className="text-[32px] md:text-[36px] text-carvao leading-[1.15] tracking-[-0.01em] mb-6"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 500 }}
          >
            Perguntas frequentes
          </h2>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.pergunta} {...item} />
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section
          className="rounded-[16px] px-6 py-8 text-center"
          style={{ background: "#F4E7D5", border: "1px solid #E6CDA8" }}
        >
          <p
            className="text-[30px] text-carvao mb-2 leading-snug"
            style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 500 }}
          >
            Pronto para fazer parte?
          </p>
          <p className="text-[16px] mb-6" style={{ color: "#BE6E4E" }}>
            A inscrição leva alguns minutos e é totalmente gratuita.
          </p>
          <Link
            href="/profissionais/inscricao"
            className="inline-flex items-center gap-2 bg-ferrugem text-creme font-semibold text-[15px] rounded-[12px] px-6 py-3.5 hover:opacity-90 transition-opacity no-underline"
          >
            Se inscrever →
          </Link>
        </section>

        {/* Indicar um colega */}
        <button
          onClick={() => {
            const url = "https://kirisaude.com.br/para-profissionais";
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({ title: "Kiri — rede de profissionais de neurodesenvolvimento infantil", url });
            } else if (typeof navigator !== "undefined" && navigator.clipboard) {
              navigator.clipboard.writeText(url);
            }
          }}
          className="mt-4 w-full flex items-center gap-4 rounded-[16px] px-5 py-[20px] cursor-pointer text-left transition-all hover:opacity-90"
          style={{ background: "#44606C" }}
        >
          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: "1.5px solid rgba(245,239,230,0.45)" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="15.5" cy="4" r="2" stroke="#F5EFE6" strokeWidth="1.4" />
              <circle cx="4.5" cy="10" r="2" stroke="#F5EFE6" strokeWidth="1.4" />
              <circle cx="15.5" cy="16" r="2" stroke="#F5EFE6" strokeWidth="1.4" />
              <line x1="6.4" y1="9" x2="13.6" y2="5" stroke="#F5EFE6" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="6.4" y1="11" x2="13.6" y2="15" stroke="#F5EFE6" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[19px] leading-[1.2]" style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 500, color: "#F5EFE6" }}>
              Conhece um colega que combina com a Kiri?
            </div>
            <div className="text-[14px] mt-0.5" style={{ color: "rgba(245,239,230,0.85)" }}>
              Compartilhe com outros profissionais de saúde
            </div>
          </div>
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7 4 L13 10 L7 16" stroke="#F5EFE6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mt-12">
          <Footer />
        </div>
      </main>
    </div>
  );
}
