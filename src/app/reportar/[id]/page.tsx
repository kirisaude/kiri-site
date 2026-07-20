"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];

const TIPOS = [
  "Informação incorreta ou desatualizada",
  "Profissional não atende mais nessa área",
  "Contato ou endereço errado",
  "Perfil duplicado",
  "Outro",
];

export default function ReportarPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const profissional = profissionais.find((p) => p.id === id) ?? null;

  const [tipoProblem, setTipoProblema] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    const res = await fetch("/api/reportar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profissional_id: id,
        tipo_problema: tipoProblem,
        descricao: descricao.trim() || null,
      }),
    });

    if (res.ok) {
      setEnviado(true);
    } else {
      setErro("Ocorreu um erro. Tente novamente.");
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
        <h1 className="font-serif text-[24px] font-medium text-carvao mb-3">Reporte recebido</h1>
        <p className="text-[15px] leading-[1.6] text-cinza-texto2 max-w-[300px]">
          Obrigada. Nossa equipe vai revisar e corrigir o perfil em breve.
        </p>
        <button onClick={() => router.back()} className="mt-8 text-[14px] font-semibold text-ardosia cursor-pointer">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Reportar perfil" />
      </div>

      <div className="max-w-2xl mx-auto pb-14 w-full px-4">
        <div className="pt-2 pb-5">
          <h1 className="font-serif text-[26px] font-medium text-carvao leading-[1.2]">
            Reportar erro ou perfil
          </h1>
          <p className="mt-2 text-[15px] leading-[1.6] text-cinza-texto">
            Ajude a manter a rede Kiri atualizada. Seu reporte é anônimo e revisado pela nossa equipe.
          </p>
        </div>

        {profissional && (
          <div className="mb-6 bg-white border border-linha rounded-[14px] px-4 py-3.5 flex items-center gap-3">
            <PlaceholderPhoto size={44} radius={10} url={profissional.foto_url} posicao={profissional.foto_posicao} />
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

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-semibold text-carvao">
              Qual o problema? <span className="text-ferrugem">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {TIPOS.map((tipo) => (
                <button key={tipo} type="button" onClick={() => setTipoProblema(tipo)}
                  className={`text-left px-4 py-3 rounded-[12px] text-[14px] border transition-colors cursor-pointer ${tipoProblem === tipo ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[15px] font-semibold text-carvao">
              Detalhes <span className="text-[12px] font-normal text-muted">(opcional)</span>
            </label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3}
              placeholder="Descreva o que está incorreto…"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted resize-none" />
          </div>

          {erro && <p className="text-[13.5px] text-ferrugem">{erro}</p>}

          <button type="submit" disabled={enviando || !tipoProblem}
            className="w-full bg-ardosia-escura text-white font-semibold text-[15px] rounded-[13px] py-[14px] cursor-pointer disabled:opacity-50 transition-opacity">
            {enviando ? "Enviando…" : "Enviar reporte"}
          </button>
        </form>

        <Footer className="mt-8 mb-8" />
      </div>
    </div>
  );
}
