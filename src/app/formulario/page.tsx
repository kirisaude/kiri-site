"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import { useRouter } from "next/navigation";
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

  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [cidade, setCidade] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!consentimento) {
      setErro("É necessário aceitar o uso dos seus dados para continuar.");
      return;
    }
    setEnviando(true);
    setErro("");

    const res = await fetch("/api/encaminhamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_responsavel: nome.trim(),
        contato: contato.trim(),
        cidade: cidade.trim() || null,
        modalidade: modalidade || null,
        observacoes: observacoes.trim() || null,
        profissional_solicitado: profissionalId ?? null,
        consentimento: true,
      }),
    });

    if (res.ok) {
      setEnviado(true);
    } else {
      const data = await res.json();
      setErro(data.erro ?? "Ocorreu um erro. Tente novamente.");
    }
    setEnviando(false);
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-ardosia/10 flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5 L9.5 17 L19 7" stroke="#44606C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-serif text-[26px] font-medium text-carvao mb-3">Recebemos seu pedido</h1>
        <p className="text-[15px] leading-[1.6] text-cinza-texto2 max-w-[320px]">
          Nossa equipe vai entrar em contato em breve pelo canal que você informou.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 text-[14px] font-semibold text-ardosia cursor-pointer"
        >
          ← Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme">
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

        {/* Formulário nativo */}
        <form onSubmit={enviar} className="mx-[18px] mt-5 flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-carvao">
              Seu nome <span className="text-ferrugem">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Nome do responsável"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-carvao">
              Como prefere ser contactado? <span className="text-ferrugem">*</span>
            </label>
            <input
              type="text"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              required
              placeholder="WhatsApp ou e-mail"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-carvao">Cidade</label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Onde você está?"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-carvao">Modalidade de atendimento</label>
            <div className="flex gap-2 flex-wrap">
              {["Presencial", "Online", "Sem preferência"].map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setModalidade(modalidade === op ? "" : op)}
                  className={`px-4 py-2 rounded-[10px] text-[14px] font-medium border transition-colors cursor-pointer ${
                    modalidade === op
                      ? "bg-ardosia-escura text-white border-ardosia-escura"
                      : "bg-white text-carvao border-linha"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-carvao">
              O que você procura?
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              placeholder="Idade da criança, dúvidas, o que motivou a busca… conte o que quiser."
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted resize-none"
            />
          </div>

          {/* Consentimento LGPD */}
          <div className="bg-white border border-linha rounded-[13px] px-4 py-4">
            <label className="flex gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentimento}
                onChange={(e) => setConsentimento(e.target.checked)}
                className="mt-0.5 w-4 h-4 flex-none accent-ardosia"
              />
              <span className="text-[13px] leading-[1.6] text-cinza-texto2">
                Concordo que os dados informados neste formulário sejam usados pela equipe Kiri exclusivamente para encaminhamento ao profissional indicado, conforme a{" "}
                <a href="/politica-de-privacidade" className="underline text-cinza-texto2" target="_blank">
                  Política de Privacidade
                </a>
                . Os dados são armazenados no Brasil e posso solicitar acesso, correção ou exclusão pelo e-mail{" "}
                <a href="mailto:kirisaude@gmail.com" className="underline text-cinza-texto2">
                  kirisaude@gmail.com
                </a>
                .
              </span>
            </label>
          </div>

          {erro && (
            <p className="text-[13.5px] text-ferrugem">{erro}</p>
          )}

          <button
            type="submit"
            disabled={enviando || !consentimento || !nome || !contato}
            className="w-full bg-ardosia-escura text-white font-semibold text-[16px] rounded-[13px] py-[15px] cursor-pointer disabled:opacity-50 transition-opacity mt-1"
          >
            {enviando ? "Enviando…" : "Enviar pedido de encaminhamento"}
          </button>
        </form>

        <Footer className="mx-[18px] mt-8 mb-8" />
      </div>
    </div>
  );
}
