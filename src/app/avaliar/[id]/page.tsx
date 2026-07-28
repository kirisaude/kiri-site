"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { feminizarTitulo } from "@/types";

const profissionais = data.profissionais as Profissional[];

export default function ExperienciaPage() {
  const { id } = useParams<{ id: string }>();
  const profissional = profissionais.find((p) => p.id === id && !p.oculto);

  const [dataAtendimento, setDataAtendimento] = useState("");
  const [texto, setTexto] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  if (!profissional) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center px-6 text-center">
        <p className="text-[15px] text-ferrugem">Profissional não encontrado.</p>
      </div>
    );
  }

  const titulo = profissional.genero === "F"
    ? feminizarTitulo(profissional.titulo_exibicao)
    : profissional.titulo_exibicao;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!consentimento) {
      setErro("É necessário autorizar o uso do relato para continuar.");
      return;
    }
    setEnviando(true);
    setErro("");

    try {
      const res = await fetch("/api/experiencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: id,
          data_atendimento: dataAtendimento || null,
          comentario: texto.trim() || null,
          consentimento: true,
        }),
      });

      if (res.ok) {
        setEnviado(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data.erro ?? "Ocorreu um erro. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-creme flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <NavBack />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F5EFE6] flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#BE6E4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-serif text-[22px] font-semibold text-carvao mb-2">Relato enviado</h1>
          <p className="text-[15px] text-cinza-texto leading-[1.65] max-w-sm">
            Obrigada por compartilhar sua experiência. Seu relato é confidencial e ajuda a Kiri a cuidar da qualidade da rede.
          </p>
        </div>
        <div className="px-[18px] mb-8">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <NavBack />
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-[18px] py-6 flex flex-col gap-6">
        {/* Cabeçalho do profissional */}
        <div className="flex items-center gap-3 pb-4 border-b border-linha">
          {profissional.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profissional.foto_url}
              alt={profissional.nome}
              className="w-12 h-12 rounded-full object-cover flex-none"
              style={{ objectPosition: profissional.foto_posicao ?? "center top" }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-areia flex-none" />
          )}
          <div>
            <div className="font-serif text-[16px] font-semibold text-carvao">{profissional.nome}</div>
            <div className="text-[13px] text-muted">{titulo}</div>
          </div>
        </div>

        <div>
          <h1 className="font-serif text-[22px] font-semibold text-carvao mb-1">Conte como foi sua experiência</h1>
          <p className="text-[14px] text-cinza-texto leading-[1.6]">
            Seu relato é privado e ajuda a Kiri a cuidar da qualidade da rede. Não é publicado no perfil do profissional.
          </p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-5">
          {/* Data do atendimento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-carvao">
              Data do atendimento
            </label>
            <p className="text-[12.5px] text-muted -mt-0.5">Mês e ano em que ocorreu a consulta ou sessão.</p>
            <input
              type="month"
              value={dataAtendimento}
              onChange={(e) => setDataAtendimento(e.target.value)}
              max={new Date().toISOString().slice(0, 7)}
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors w-full"
            />
          </div>

          {/* Comentário */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-carvao">
              Como foi sua experiência com este profissional? <span className="text-ferrugem">*</span>
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              required
              rows={5}
              placeholder="Descreva como foi o atendimento, o que marcou positiva ou negativamente, como a família se sentiu…"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted resize-none w-full"
            />
          </div>

          {/* Aviso de privacidade */}
          <div className="bg-[#F5EFE6] rounded-[10px] px-4 py-3 flex flex-col gap-1">
            <p className="text-[12.5px] font-semibold text-carvao">Privacidade</p>
            <p className="text-[12px] text-cinza-texto leading-[1.6]">
              Este relato é confidencial, usado apenas pela equipe Kiri para curadoria. Não é publicado nem compartilhado com o profissional de forma identificável.
            </p>
          </div>

          {/* Consentimento */}
          <label className="flex gap-3 cursor-pointer items-start bg-white border border-linha rounded-[12px] px-4 py-3.5">
            <input
              type="checkbox"
              checked={consentimento}
              onChange={(e) => setConsentimento(e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-none accent-ardosia"
            />
            <span className="text-[13px] leading-[1.6] text-cinza-texto2">
              Autorizo a Kiri a usar este relato internamente para acompanhamento da qualidade da rede. <span className="text-ferrugem">*</span>
            </span>
          </label>

          {erro && <p className="text-[13.5px] text-ferrugem">{erro}</p>}

          <button
            type="submit"
            disabled={enviando || !consentimento || !texto.trim()}
            className="bg-ardosia-escura text-white text-[15px] font-semibold rounded-[13px] py-[14px] cursor-pointer disabled:opacity-50 transition-opacity"
          >
            {enviando ? "Enviando…" : "Enviar relato"}
          </button>
        </form>
      </div>

      <div className="px-[18px] mb-8">
        <Footer />
      </div>
    </div>
  );
}
