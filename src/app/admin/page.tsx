"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KiriLogo } from "@/components/KiriLogo";

interface TallyField {
  key: string;
  label: string;
  value: unknown;
}

interface TallySubmission {
  id: string;
  submittedAt: string;
  fields: TallyField[];
}

function getNome(fields: TallyField[]) {
  const f = fields.find((f) => f.label.toLowerCase().includes("nome"));
  return (f?.value as string) ?? "—";
}

function getProfissao(fields: TallyField[]) {
  const f = fields.find((f) => f.label.toLowerCase().includes("profiss"));
  if (!f?.value) return "—";
  if (typeof f.value === "string") return f.value;
  if (Array.isArray(f.value)) return f.value.join(", ");
  return "—";
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [submissions, setSubmissions] = useState<TallySubmission[]>([]);
  const [rejeitados, setRejeitados] = useState<string[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erroTally, setErroTally] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    if (res.ok) {
      setAuthed(true);
      buscarRespostas();
    } else {
      setErro(true);
    }
    setCarregando(false);
  }

  async function buscarRespostas() {
    setBuscando(true);
    setErroTally("");
    try {
      const [resT, resR] = await Promise.all([
        fetch("/api/admin/respostas"),
        fetch("/api/admin/rejeitar"),
      ]);
      if (!resT.ok) {
        const e = await resT.json();
        setErroTally(e.error ?? "Erro ao buscar respostas");
      } else {
        const data = await resT.json();
        setSubmissions(data.submissions ?? []);
      }
      if (resR.ok) {
        const r = await resR.json();
        setRejeitados(r.rejeitados ?? []);
      }
    } finally {
      setBuscando(false);
    }
  }

  async function rejeitar(id: string) {
    await fetch("/api/admin/rejeitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRejeitados((prev) => [...prev, id]);
  }

  useEffect(() => {
    // Verifica se já está autenticado
    fetch("/api/admin/respostas").then((r) => {
      if (r.ok) { setAuthed(true); buscarRespostas(); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-[320px]">
          <div className="flex items-center gap-2.5">
            <KiriLogo size={28} />
            <span className="font-serif text-[22px] font-medium text-ferrugem">Admin</span>
          </div>
          <form onSubmit={login} className="w-full flex flex-col gap-3">
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha de administração"
              autoFocus
              className="w-full border border-linha rounded-[11px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
            />
            {erro && <p className="text-[13px] text-ferrugem text-center">Senha incorreta.</p>}
            <button
              type="submit"
              disabled={carregando || !senha}
              className="w-full bg-ardosia-escura text-white font-semibold text-[14px] rounded-[11px] py-[13px] cursor-pointer disabled:opacity-50"
            >
              {carregando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendentes = submissions.filter((s) => !rejeitados.includes(s.id));
  const rejeitadasList = submissions.filter((s) => rejeitados.includes(s.id));

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <KiriLogo size={24} />
          <span className="font-serif text-[18px] font-medium text-ferrugem">Admin</span>
        </div>
        <button
          onClick={buscarRespostas}
          className="text-[13px] font-semibold text-ardosia cursor-pointer"
        >
          {buscando ? "Atualizando…" : "↻ Atualizar"}
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {erroTally && (
          <div className="mb-6 bg-[#F6E6CC] border border-ambar-borda rounded-[12px] px-4 py-3 text-[13.5px] text-ambar-texto">
            {erroTally === "TALLY_API_KEY não configurada"
              ? "Configure a variável TALLY_API_KEY no .env.local para ver as inscrições."
              : erroTally}
          </div>
        )}

        {/* Pendentes */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-[20px] font-semibold text-carvao">
              Pendentes{" "}
              <span className="text-[15px] font-sans font-normal text-muted">
                ({pendentes.length})
              </span>
            </h2>
          </div>

          {buscando ? (
            <p className="text-[14px] text-muted">Buscando inscrições…</p>
          ) : pendentes.length === 0 ? (
            <p className="text-[14px] text-muted">Nenhuma inscrição pendente.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendentes.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-linha rounded-[14px] px-4 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-serif text-[15.5px] font-semibold text-carvao leading-[1.2]">
                      {getNome(s.fields)}
                    </div>
                    <div className="text-[13px] text-cinza-texto mt-0.5">
                      {getProfissao(s.fields)} · {new Date(s.submittedAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <Link
                      href={`/admin/revisar/${s.id}`}
                      className="text-[13px] font-semibold text-white bg-ardosia-escura rounded-[9px] px-3 py-1.5 no-underline"
                    >
                      Revisar
                    </Link>
                    <button
                      onClick={() => rejeitar(s.id)}
                      className="text-[13px] font-semibold text-cinza-texto bg-wash-quente border border-borda-quente rounded-[9px] px-3 py-1.5 cursor-pointer"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejeitados */}
        {rejeitadasList.length > 0 && (
          <div>
            <h2 className="font-serif text-[18px] font-semibold text-carvao mb-3">
              Rejeitados{" "}
              <span className="text-[14px] font-sans font-normal text-muted">
                ({rejeitadasList.length})
              </span>
            </h2>
            <div className="flex flex-col gap-2">
              {rejeitadasList.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-linha rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 opacity-50"
                >
                  <div>
                    <div className="text-[14.5px] font-semibold text-carvao">{getNome(s.fields)}</div>
                    <div className="text-[12.5px] text-cinza-texto">{getProfissao(s.fields)}</div>
                  </div>
                  <button
                    onClick={() => setRejeitados((prev) => prev.filter((id) => id !== s.id))}
                    className="text-[12px] text-ferrugem font-semibold cursor-pointer"
                  >
                    Desfazer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
