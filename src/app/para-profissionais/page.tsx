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

const PRO_URL = "https://www.kirisaude.com.br/para-profissionais";

export default function ParaProfissionaisPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showCompartilharPro, setShowCompartilharPro] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      const bottom = heroRef.current?.getBoundingClientRect().bottom ?? 200;
      setScrolled(bottom < 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function copiarLinkPro() {
    navigator.clipboard.writeText(PRO_URL).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    });
  }

  function compartilharWhatsAppPro() {
    if (navigator.share) {
      navigator.share({ url: PRO_URL }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(PRO_URL)}`, "_blank");
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(PRO_URL)}`, "_blank");
    }
  }

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
          onClick={() => setShowCompartilharPro(true)}
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

      {/* Modal compartilhar com profissional */}
      {showCompartilharPro && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 pb-6 md:pb-0"
          onClick={() => setShowCompartilharPro(false)}
        >
          <div
            className="w-full max-w-sm bg-creme rounded-[20px] overflow-hidden shadow-[0_20px_60px_-10px_rgba(40,35,25,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview */}
            <div className="bg-ardosia-escura px-6 pt-7 pb-6">
              <div className="mb-4">
                <KiriLogoCompact height={28} onDark />
              </div>
              <p className="font-serif text-[22px] font-medium leading-[1.25] text-white">
                Uma rede de profissionais verificados em neurodesenvolvimento infantil.
              </p>
              <p className="mt-3 text-[14px] leading-[1.55] text-white/75">
                Participar é gratuito. Formação verificada, agendamento direto com as famílias.
              </p>
              <div className="mt-4 flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.4" opacity="0.7" />
                  <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                </svg>
                <span className="text-[13px] font-semibold text-white/60 tracking-[0.03em]">kirisaude.com.br/para-profissionais</span>
              </div>
            </div>

            {/* Ações */}
            <div className="px-5 py-4 flex flex-col gap-2.5">
              <button
                onClick={compartilharWhatsAppPro}
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-[15px] rounded-[13px] py-[14px] cursor-pointer w-full"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
                  <path d="M17.47 14.38c-.28-.14-1.67-.82-1.93-.92-.26-.09-.45-.14-.64.14-.19.28-.74.92-.9 1.1-.17.19-.33.21-.61.07-.28-.14-1.19-.44-2.27-1.4-.84-.75-1.4-1.67-1.57-1.95-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.1-.23-.55-.47-.47-.64-.48-.17-.01-.36-.01-.55-.01s-.5.07-.76.35c-.26.28-1 1-1 2.42s1.02 2.81 1.16 3c.14.19 2 3.06 4.85 4.29.68.29 1.21.47 1.62.6.68.21 1.3.18 1.79.11.55-.08 1.67-.68 1.9-1.34.24-.66.24-1.22.17-1.34-.07-.12-.26-.19-.54-.33z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.08-1.34A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.69 0-3.26-.49-4.59-1.33l-.32-.2-3.02.79.81-2.95-.21-.34A8 8 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                Compartilhar no WhatsApp
              </button>
              <button
                onClick={copiarLinkPro}
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
                onClick={() => setShowCompartilharPro(false)}
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
