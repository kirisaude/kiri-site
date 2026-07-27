"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { feminizarTitulo } from "@/types";

const profissionais = data.profissionais as Profissional[];

function Estrelas({ nota, onNota }: { nota: number; onNota: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onNota(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer p-0.5 transition-transform hover:scale-110"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.9 8.6L22 9.3L16.8 14.1L18.4 21L12 17.4L5.6 21L7.2 14.1L2 9.3L9.1 8.6Z"
              fill={(hover || nota) >= n ? "#E0A55E" : "none"}
              stroke={(hover || nota) >= n ? "#E0A55E" : "#D8C7B0"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

const NOTAS_LABEL: Record<number, string> = {
  1: "Ruim",
  2: "Regular",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente",
};

export default function AvaliarPage() {
  const { id } = useParams<{ id: string }>();
  const profissional = profissionais.find((p) => p.id === id && !p.oculto);

  const [nota, setNota] = useState(0);
  const [dataAtendimento, setDataAtendimento] = useState("");
  const [texto, setTexto] = useState("");
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
    if (nota === 0) {
      setErro("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    setEnviando(true);
    setErro("");

    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: id,
          nota,
          data_atendimento: dataAtendimento,
          texto,
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
          <div className="w-12 h-12 rounded-full bg-[#FFF4E0] flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.9 8.6L22 9.3L16.8 14.1L18.4 21L12 17.4L5.6 21L7.2 14.1L2 9.3L9.1 8.6Z" fill="#E0A55E" stroke="#E0A55E" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-serif text-[22px] font-semibold text-carvao mb-2">Avaliação enviada</h1>
          <p className="text-[15px] text-cinza-texto leading-[1.65] max-w-sm">
            Obrigada pelo seu retorno. Sua avaliação será revisada pela equipe Kiri antes de ser publicada.
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
          <h1 className="font-serif text-[22px] font-semibold text-carvao mb-1">Avaliar atendimento</h1>
          <p className="text-[14px] text-cinza-texto leading-[1.6]">
            Sua avaliação ajuda outras famílias a escolher com mais segurança.
          </p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-5">
          {/* Nota */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-carvao">
              Nota <span className="text-ferrugem">*</span>
            </label>
            <Estrelas nota={nota} onNota={setNota} />
            {nota > 0 && (
              <span className="text-[13px] text-ambar-texto font-medium">{NOTAS_LABEL[nota]}</span>
            )}
          </div>

          {/* Data do atendimento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-carvao">
              Data do atendimento <span className="text-ferrugem">*</span>
            </label>
            <p className="text-[12.5px] text-muted -mt-0.5">Mês e ano em que ocorreu a consulta ou sessão.</p>
            <input
              type="month"
              value={dataAtendimento}
              onChange={(e) => setDataAtendimento(e.target.value)}
              required
              max={new Date().toISOString().slice(0, 7)}
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors w-full"
            />
          </div>

          {/* Comentário */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-carvao">
              Comentário <span className="text-[13px] font-normal text-muted">(opcional)</span>
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={4}
              placeholder="Como foi sua experiência? O que gostaria de compartilhar com outras famílias?"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted resize-none w-full"
            />
          </div>

          <div className="bg-[#F5EFE6] rounded-[10px] px-4 py-3 flex flex-col gap-1">
            <p className="text-[12.5px] font-semibold text-carvao">Política de moderação</p>
            <p className="text-[12px] text-cinza-texto leading-[1.6]">
              Todas as avaliações passam por revisão antes de serem publicadas. Não são aceitas avaliações com conteúdo ofensivo, inadequado ou referentes a atendimentos não intermediados pela plataforma Kiri.
            </p>
          </div>

          {erro && <p className="text-[13.5px] text-ferrugem">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="bg-ardosia-escura text-white text-[15px] font-semibold rounded-[13px] py-[14px] cursor-pointer disabled:opacity-50 transition-opacity"
          >
            {enviando ? "Enviando…" : "Enviar avaliação"}
          </button>
        </form>
      </div>

      <div className="px-[18px] mb-8">
        <Footer />
      </div>
    </div>
  );
}
