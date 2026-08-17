"use client";

import { useState, useEffect } from "react";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import Link from "next/link";

type Encaminhamento = {
  id: string;
  canal_origem: "busca_diretorio" | "indicacao_profissional" | "outro";
  status: "pendente" | "contato_iniciado" | "convertido_em_consulta" | "nao_convertido";
  data_consulta_agendada: string | null;
  criado_em: string;
};

const STATUS_LABEL: Record<Encaminhamento["status"], string> = {
  pendente: "Pendente",
  contato_iniciado: "Contato iniciado",
  convertido_em_consulta: "Consulta agendada",
  nao_convertido: "Não convertido",
};

const STATUS_STYLE: Record<Encaminhamento["status"], string> = {
  pendente: "bg-[#FFF3CD] text-[#9A6A00]",
  contato_iniciado: "bg-[#E8EEF2] text-ardosia-escura",
  convertido_em_consulta: "bg-[#E8F5EE] text-[#2D7A4A]",
  nao_convertido: "bg-[#F5F0EA] text-muted",
};

const CANAL_LABEL: Record<Encaminhamento["canal_origem"], string> = {
  busca_diretorio: "Busca no diretório",
  indicacao_profissional: "Indicação de colega",
  outro: "Outro canal",
};

const STATUS_ORDEM: Encaminhamento["status"][] = [
  "pendente", "contato_iniciado", "convertido_em_consulta", "nao_convertido",
];

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [encaminhamentos, setEncaminhamentos] = useState<Encaminhamento[]>([]);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<Encaminhamento["status"] | "">("");

  useEffect(() => {
    fetch("/api/pro/encaminhamentos", { credentials: "include" }).then(async (r) => {
      if (r.status === 401) {
        window.location.href = "/pro/entrar";
        return;
      }
      if (r.ok) {
        setEncaminhamentos(await r.json());
        setAuthed(true);
      }
    });
  }, []);

  async function atualizarStatus(id: string, status: Encaminhamento["status"]) {
    setAtualizando(id);
    const res = await fetch("/api/pro/encaminhamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setEncaminhamentos((prev) =>
        prev.map((e) => e.id === id ? { ...e, status } : e)
      );
    }
    setAtualizando(null);
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <p className="text-[14px] text-muted">Carregando…</p>
      </div>
    );
  }

  const filtrados = filtroStatus
    ? encaminhamentos.filter((e) => e.status === filtroStatus)
    : encaminhamentos;

  const total = encaminhamentos.length;
  const convertidos = encaminhamentos.filter((e) => e.status === "convertido_em_consulta").length;
  const taxaConversao = total > 0 ? Math.round((convertidos / total) * 100) : null;
  const pendentes = encaminhamentos.filter((e) => e.status === "pendente").length;

  return (
    <div className="min-h-screen bg-creme overflow-x-hidden">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-5 py-3 flex items-center gap-3">
        <KiriLogoCompact height={26} />
        <nav className="flex items-center gap-4 ml-4">
          <Link href="/pro" className="text-[13px] text-muted hover:text-carvao transition-colors no-underline">
            Rede
          </Link>
          <span className="text-[13px] font-semibold text-ardosia-escura border-b-2 border-ardosia-escura pb-0.5">
            Meu painel
          </span>
        </nav>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Métricas */}
        {total > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", valor: total },
              { label: "Pendentes", valor: pendentes },
              { label: "Taxa de conversão", valor: taxaConversao !== null ? `${taxaConversao}%` : "—" },
            ].map(({ label, valor }) => (
              <div key={label} className="bg-white border border-linha rounded-[14px] px-4 py-3 text-center">
                <div className="font-serif text-[22px] font-semibold text-carvao">{valor}</div>
                <div className="text-[11.5px] text-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtro por status */}
        {total > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltroStatus("")}
              className={`px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium border transition-colors cursor-pointer ${
                filtroStatus === "" ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"
              }`}
            >
              Todos ({total})
            </button>
            {STATUS_ORDEM.map((s) => {
              const count = encaminhamentos.filter((e) => e.status === s).length;
              if (count === 0) return null;
              return (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(filtroStatus === s ? "" : s)}
                  className={`px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium border transition-colors cursor-pointer ${
                    filtroStatus === s ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"
                  }`}
                >
                  {STATUS_LABEL[s]} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Lista */}
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-wash flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#9A8C78" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-carvao mb-1">Nenhum encaminhamento ainda</p>
              <p className="text-[13px] text-muted leading-[1.6]">
                Quando uma família entrar em contato via Kiri, o encaminhamento aparecerá aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtrados.map((enc) => (
              <div key={enc.id} className="bg-white border border-linha rounded-[14px] px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <span className={`self-start text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[enc.status]}`}>
                      {STATUS_LABEL[enc.status]}
                    </span>
                    <span className="text-[12px] text-muted">{CANAL_LABEL[enc.canal_origem]}</span>
                  </div>
                  <span className="text-[12px] text-muted flex-none">{fmtData(enc.criado_em)}</span>
                </div>

                {enc.data_consulta_agendada && (
                  <p className="text-[12.5px] text-carvao mb-3">
                    Consulta: <strong>{fmtData(enc.data_consulta_agendada)}</strong>
                  </p>
                )}

                {/* Atualizar status */}
                <div className="border-t border-linha pt-3">
                  <p className="text-[11.5px] text-muted mb-2">Atualizar status:</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ORDEM.filter((s) => s !== enc.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => atualizarStatus(enc.id, s)}
                        disabled={atualizando === enc.id}
                        className="text-[12px] font-medium text-ardosia border border-ardosia/40 rounded-[7px] px-2.5 py-1 cursor-pointer hover:bg-wash transition-colors disabled:opacity-40"
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
