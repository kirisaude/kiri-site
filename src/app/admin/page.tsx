"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KiriLogo } from "@/components/KiriLogo";

interface Inscricao {
  id: string;
  criado_em: string;
  nome: string;
  profissao: string;
  registro_conselho: string;
  cidade: string;
  status: string;
}

interface Encaminhamento {
  id: string;
  criado_em: string;
  nome_responsavel: string;
  contato: string;
  cidade: string;
  modalidade: string;
  profissional_solicitado: string;
  observacoes: string;
}

type Aba = "inscricoes" | "encaminhamentos";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aba, setAba] = useState<Aba>("inscricoes");

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [encaminhamentos, setEncaminhamentos] = useState<Encaminhamento[]>([]);
  const [buscando, setBuscando] = useState(false);

  const buscarDados = useCallback(async () => {
    setBuscando(true);
    const [resI, resE] = await Promise.all([
      fetch("/api/admin/inscricoes"),
      fetch("/api/admin/encaminhamentos"),
    ]);
    if (resI.ok) setInscricoes(await resI.json());
    if (resE.ok) setEncaminhamentos(await resE.json());
    setBuscando(false);
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    if (res.ok) {
      setAuthed(true);
      buscarDados();
    } else {
      setErro("Senha incorreta.");
    }
    setCarregando(false);
  }

  async function atualizarStatus(id: string, status: string) {
    await fetch("/api/admin/inscricoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setInscricoes((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  }

  useEffect(() => {
    fetch("/api/admin/inscricoes").then((r) => {
      if (r.ok) { setAuthed(true); buscarDados(); }
    });
  }, [buscarDados]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-[320px]">
          <div className="flex items-center gap-2.5">
            <KiriLogo size={28} />
            <span className="font-serif text-[22px] font-medium text-ferrugem">Admin</span>
          </div>
          <form onSubmit={login} className="w-full flex flex-col gap-3">
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha de administração" autoFocus
              className="w-full border border-linha rounded-[11px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted" />
            {erro && <p className="text-[13px] text-ferrugem text-center">{erro}</p>}
            <button type="submit" disabled={carregando || !senha}
              className="w-full bg-ardosia-escura text-white font-semibold text-[14px] rounded-[11px] py-[13px] cursor-pointer disabled:opacity-50">
              {carregando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendentes = inscricoes.filter((i) => i.status === "pendente");
  const aprovados = inscricoes.filter((i) => i.status === "aprovado");
  const rejeitados = inscricoes.filter((i) => i.status === "rejeitado");

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <KiriLogo size={24} />
          <span className="font-serif text-[18px] font-medium text-ferrugem">Admin</span>
        </div>
        <button onClick={buscarDados} className="text-[13px] font-semibold text-ardosia cursor-pointer">
          {buscando ? "Atualizando…" : "↻ Atualizar"}
        </button>
      </header>

      {/* Abas */}
      <div className="border-b border-linha px-6 flex gap-6">
        {(["inscricoes", "encaminhamentos"] as Aba[]).map((a) => (
          <button key={a} onClick={() => setAba(a)}
            className={`py-3 text-[14px] font-semibold border-b-2 transition-colors cursor-pointer ${aba === a ? "border-ardosia-escura text-carvao" : "border-transparent text-muted"}`}>
            {a === "inscricoes" ? `Profissionais (${pendentes.length})` : `Encaminhamentos (${encaminhamentos.length})`}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ABA INSCRICOES */}
        {aba === "inscricoes" && (
          <div className="flex flex-col gap-8">
            {/* Pendentes */}
            <div>
              <h2 className="font-serif text-[18px] font-semibold text-carvao mb-3">
                Pendentes <span className="text-[14px] font-sans font-normal text-muted">({pendentes.length})</span>
              </h2>
              {pendentes.length === 0 ? (
                <p className="text-[14px] text-muted">Nenhuma inscrição pendente.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendentes.map((i) => (
                    <div key={i.id} className="bg-white border border-linha rounded-[14px] px-4 py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-serif text-[15.5px] font-semibold text-carvao">{i.nome}</div>
                        <div className="text-[13px] text-cinza-texto mt-0.5">{i.profissao} · {i.cidade || "—"} · {new Date(i.criado_em).toLocaleDateString("pt-BR")}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <Link href={`/admin/revisar/${i.id}`} className="text-[13px] font-semibold text-white bg-ardosia-escura rounded-[9px] px-3 py-1.5 no-underline">
                          Revisar
                        </Link>
                        <button onClick={() => atualizarStatus(i.id, "rejeitado")}
                          className="text-[13px] font-semibold text-cinza-texto bg-wash-quente border border-borda-quente rounded-[9px] px-3 py-1.5 cursor-pointer">
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aprovados */}
            {aprovados.length > 0 && (
              <div>
                <h2 className="font-serif text-[18px] font-semibold text-carvao mb-3">
                  Aprovados <span className="text-[14px] font-sans font-normal text-muted">({aprovados.length})</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {aprovados.map((i) => (
                    <div key={i.id} className="bg-white border border-linha rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 opacity-70">
                      <div>
                        <div className="text-[14.5px] font-semibold text-carvao">{i.nome}</div>
                        <div className="text-[12.5px] text-cinza-texto">{i.profissao}</div>
                      </div>
                      <span className="text-[12px] text-ardosia font-semibold">✓ publicado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejeitados */}
            {rejeitados.length > 0 && (
              <div>
                <h2 className="font-serif text-[18px] font-semibold text-carvao mb-3">
                  Rejeitados <span className="text-[14px] font-sans font-normal text-muted">({rejeitados.length})</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {rejeitados.map((i) => (
                    <div key={i.id} className="bg-white border border-linha rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 opacity-50">
                      <div>
                        <div className="text-[14.5px] font-semibold text-carvao">{i.nome}</div>
                        <div className="text-[12.5px] text-cinza-texto">{i.profissao}</div>
                      </div>
                      <button onClick={() => atualizarStatus(i.id, "pendente")}
                        className="text-[12px] text-ferrugem font-semibold cursor-pointer">
                        Desfazer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA ENCAMINHAMENTOS */}
        {aba === "encaminhamentos" && (
          <div>
            <h2 className="font-serif text-[18px] font-semibold text-carvao mb-3">
              Pedidos recebidos <span className="text-[14px] font-sans font-normal text-muted">({encaminhamentos.length})</span>
            </h2>
            {encaminhamentos.length === 0 ? (
              <p className="text-[14px] text-muted">Nenhum encaminhamento recebido ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {encaminhamentos.map((e) => (
                  <div key={e.id} className="bg-white border border-linha rounded-[14px] px-4 py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-serif text-[15px] font-semibold text-carvao">{e.nome_responsavel}</div>
                      <span className="text-[12px] text-muted flex-none">{new Date(e.criado_em).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[13px] text-cinza-texto">
                      <div><span className="font-medium">Contato:</span> {e.contato}</div>
                      {e.cidade && <div><span className="font-medium">Cidade:</span> {e.cidade}</div>}
                      {e.modalidade && <div><span className="font-medium">Modalidade:</span> {e.modalidade}</div>}
                      {e.profissional_solicitado && <div><span className="font-medium">Profissional:</span> {e.profissional_solicitado}</div>}
                      {e.observacoes && <div className="mt-1 text-carvao italic">"{e.observacoes}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
