"use client";

import { useState, useEffect } from "react";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import Link from "next/link";

type Contato = {
  id: string;
  nome: string;
  email: string;
  enviado_em: string | null;
  criado_em: string;
};

type EnvioStatus = "idle" | "enviando" | "ok" | "erro";

const ASSUNTO_PADRAO = "Kiri Saúde — plataforma de saúde infantil e do neurodesenvolvimento";

const CORPO_PADRAO = `<p>Olá, Dr(a). {nome},</p>

<p>Me chamo Iohana Marques, sou médica pela UNIFESP e fundadora da <strong>Kiri Saúde</strong> — uma plataforma que conecta famílias de crianças com necessidades de saúde e desenvolvimento a profissionais especializados.</p>

<p>Nosso objetivo é facilitar o acesso a psicólogos, fonoaudiólogos, terapeutas ocupacionais, neuropsicólogos e outros especialistas, com um olhar cuidadoso para o perfil e a abordagem de cada profissional.</p>

<p>Gostaríamos de convidá-lo(a) a conhecer a plataforma e, se fizer sentido, indicar a Kiri às famílias que acompanha.</p>

<p>Acesse: <a href="https://kirisaude.com.br">kirisaude.com.br</a></p>

<p>Fico à disposição para qualquer dúvida.</p>

<p>Atenciosamente,<br/>
<strong>Iohana Marques</strong><br/>
Fundadora — Kiri Saúde<br/>
contato@kirisaude.com.br</p>`;

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DivulgacaoPage() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [erroAdd, setErroAdd] = useState("");
  const [assunto, setAssunto] = useState(ASSUNTO_PADRAO);
  const [corpo, setCorpo] = useState(CORPO_PADRAO);
  const [envioStatus, setEnvioStatus] = useState<Record<string, EnvioStatus>>({});
  const [enviandoTodos, setEnviandoTodos] = useState(false);
  const [aba, setAba] = useState<"lista" | "template">("lista");
  const [loteProgresso, setLoteProgresso] = useState<{ ok: number; erro: number; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/divulgacao", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setContatos(d); setCarregando(false); })
      .catch(() => setCarregando(false));
  }, []);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErroAdd("");
    setAdicionando(true);
    const res = await fetch("/api/admin/divulgacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nome: novoNome, email: novoEmail }),
    });
    const d = await res.json();
    setAdicionando(false);
    if (res.ok) {
      setContatos((prev) => [...prev, d]);
      setNovoNome("");
      setNovoEmail("");
    } else {
      setErroAdd(d.error ?? "Erro ao adicionar");
    }
  }

  async function remover(id: string) {
    if (!confirm("Remover este contato?")) return;
    await fetch("/api/admin/divulgacao", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  async function enviarPara(contato: Contato): Promise<boolean> {
    setEnvioStatus((s) => ({ ...s, [contato.id]: "enviando" }));
    const res = await fetch("/api/admin/divulgacao/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nome: contato.nome, email: contato.email, assunto, corpo }),
    });
    if (res.ok) {
      const agora = new Date().toISOString();
      setEnvioStatus((s) => ({ ...s, [contato.id]: "ok" }));
      setContatos((prev) => prev.map((c) => c.id === contato.id ? { ...c, enviado_em: agora } : c));
      fetch("/api/admin/divulgacao", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: contato.id, enviado_em: agora }),
      }).catch(() => {});
      return true;
    } else {
      setEnvioStatus((s) => ({ ...s, [contato.id]: "erro" }));
      return false;
    }
  }

  async function enviarTodosPendentes() {
    const pendentes = contatos.filter((c) => !c.enviado_em);
    if (pendentes.length === 0) return;
    if (!confirm(`Enviar e-mail para ${pendentes.length} contato(s) que ainda não receberam?`)) return;
    setEnviandoTodos(true);
    setLoteProgresso({ ok: 0, erro: 0, total: pendentes.length });
    let ok = 0; let erro = 0;
    for (const c of pendentes) {
      const sucesso = await enviarPara(c);
      if (sucesso) ok++; else erro++;
      setLoteProgresso({ ok, erro, total: pendentes.length });
      await new Promise((r) => setTimeout(r, 1500));
    }
    setEnviandoTodos(false);
  }

  const pendentes = contatos.filter((c) => !c.enviado_em);
  const enviados = contatos.filter((c) => c.enviado_em);

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <KiriLogoCompact height={26} />
        <Link href="/admin" className="text-[13px] text-muted hover:text-carvao no-underline transition-colors ml-2">← Admin</Link>
        <span className="text-[13px] font-semibold text-carvao ml-1">/ Divulgação</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", valor: contatos.length, cor: "text-carvao" },
            { label: "Pendentes", valor: pendentes.length, cor: "text-ferrugem" },
            { label: "Enviados", valor: enviados.length, cor: "text-verde-confirmacao" },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="bg-white border border-linha rounded-[14px] px-4 py-3 text-center">
              <div className={`font-serif text-[24px] font-semibold ${cor}`}>{valor}</div>
              <div className="text-[11.5px] text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Abas */}
        <div className="flex gap-1 bg-[#EEE8DE] rounded-[10px] p-1">
          {(["lista", "template"] as const).map((a) => (
            <button key={a} onClick={() => setAba(a)}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[8px] cursor-pointer transition-colors ${aba === a ? "bg-white text-carvao shadow-sm" : "text-muted hover:text-carvao"}`}>
              {a === "lista" ? "Lista de contatos" : "Template de e-mail"}
            </button>
          ))}
        </div>

        {aba === "lista" && (
          <>
            {/* Adicionar contato */}
            <form onSubmit={adicionar} className="bg-white border border-linha rounded-[14px] p-4 flex flex-col gap-3">
              <p className="text-[13px] font-semibold text-carvao">Adicionar pediatra</p>
              <div className="flex gap-2">
                <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome" required
                  className="flex-1 border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
                <input value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="E-mail" type="email" required
                  className="flex-1 border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
                <button type="submit" disabled={adicionando}
                  className="bg-ardosia-escura text-white text-[13px] font-semibold px-4 rounded-[9px] cursor-pointer disabled:opacity-50">
                  {adicionando ? "…" : "+ Adicionar"}
                </button>
              </div>
              {erroAdd && <p className="text-[12px] text-ferrugem">{erroAdd}</p>}
            </form>

            {/* Botão enviar todos */}
            {pendentes.length > 0 && (
              <div className="flex items-center gap-3">
                <button onClick={enviarTodosPendentes} disabled={enviandoTodos}
                  className="bg-ferrugem text-white text-[13px] font-semibold px-4 py-2 rounded-[9px] cursor-pointer disabled:opacity-50">
                  {enviandoTodos ? `Enviando… (${loteProgresso?.ok ?? 0}/${loteProgresso?.total ?? 0})` : `Enviar para todos os ${pendentes.length} pendentes`}
                </button>
                {loteProgresso && !enviandoTodos && (
                  <span className="text-[12.5px] text-verde-confirmacao font-semibold">
                    ✓ {loteProgresso.ok} enviados{loteProgresso.erro > 0 ? ` · ${loteProgresso.erro} erros` : ""}
                  </span>
                )}
              </div>
            )}

            {/* Lista pendentes */}
            {carregando ? (
              <p className="text-[13px] text-muted">Carregando…</p>
            ) : (
              <>
                {pendentes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] font-semibold text-carvao">Pendentes</p>
                    {pendentes.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 bg-white border border-linha rounded-[11px] px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-carvao">{c.nome}</p>
                          <p className="text-[11.5px] text-muted">{c.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-none">
                          {envioStatus[c.id] === "enviando" && <span className="text-[12px] text-ardosia">Enviando…</span>}
                          {envioStatus[c.id] === "ok" && <span className="text-[12px] text-verde-confirmacao font-semibold">✓ Enviado</span>}
                          {envioStatus[c.id] === "erro" && <span className="text-[12px] text-ferrugem">Erro</span>}
                          {!envioStatus[c.id] && (
                            <button onClick={() => enviarPara(c)} disabled={enviandoTodos}
                              className="text-[12px] font-semibold text-ardosia border border-ardosia/30 rounded-[7px] px-3 py-1 cursor-pointer hover:bg-[#EEF2F4] transition-colors disabled:opacity-40">
                              Enviar
                            </button>
                          )}
                          <button onClick={() => remover(c.id)}
                            className="text-[11px] text-muted hover:text-ferrugem transition-colors cursor-pointer">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {enviados.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] font-semibold text-carvao">Já enviados</p>
                    {enviados.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 bg-white border border-linha rounded-[11px] px-4 py-3 opacity-60">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-carvao">{c.nome}</p>
                          <p className="text-[11.5px] text-muted">{c.email} · enviado em {fmtData(c.enviado_em!)}</p>
                        </div>
                        <button onClick={() => remover(c.id)}
                          className="text-[11px] text-muted hover:text-ferrugem transition-colors cursor-pointer flex-none">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {contatos.length === 0 && (
                  <p className="text-[13px] text-muted text-center py-6">Nenhum contato ainda. Adicione o primeiro acima.</p>
                )}
              </>
            )}
          </>
        )}

        {aba === "template" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-carvao">Assunto</label>
              <input value={assunto} onChange={(e) => setAssunto(e.target.value)}
                className="border border-linha rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-ardosia" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-carvao">Corpo (HTML — use {"{nome}"} para personalizar)</label>
              <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} rows={18}
                className="border border-linha rounded-[9px] px-3.5 py-2.5 text-[12.5px] font-mono outline-none focus:border-ardosia resize-y" />
            </div>
            <p className="text-[12px] text-muted">O e-mail sai de <strong>contato@kirisaude.com.br</strong> com cópia para <strong>iohana.marques@unifesp.br</strong>.</p>
          </div>
        )}

      </div>
    </div>
  );
}
