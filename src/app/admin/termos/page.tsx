"use client";

import { useState, useEffect } from "react";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import Link from "next/link";
import { titleCasePT } from "@/lib/titleCase";

type Inscricao = {
  id: string;
  nome: string;
  email: string | null;
  profissao: string;
  autentique_document_id: string | null;
  autentique_enviado_em: string | null;
  prof_id: string | null;
};

type StatusTermo = {
  signed: boolean;
  signed_at: string | null;
  signer_email: string | null;
};

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TermosPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [lista, setLista] = useState<Inscricao[]>([]);
  const [statuses, setStatuses] = useState<Record<string, StatusTermo>>({});
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<{ ok: number; erro: number; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/termos-lista", { credentials: "include" }).then(async (r) => {
      if (r.status === 401) { setAuthed(false); return; }
      if (r.ok) { setLista(await r.json()); setAuthed(true); }
    });
  }, []);

  const semTermo = lista.filter((i) => !i.autentique_document_id && i.email);
  const comTermo = lista.filter((i) => !!i.autentique_document_id);
  const semEmail = lista.filter((i) => !i.autentique_document_id && !i.email);

  function toggleSelecionado(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodos(grupo: Inscricao[]) {
    const ids = grupo.map((i) => i.id);
    const todosMarcados = ids.every((id) => selecionados.has(id));
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosMarcados) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  async function enviarSelecionados() {
    const ids = Array.from(selecionados).filter((id) => semTermo.some((i) => i.id === id));
    if (ids.length === 0) return;

    setProgresso({ ok: 0, erro: 0, total: ids.length });
    let ok = 0;
    let erro = 0;

    for (const id of ids) {
      setEnviando(id);
      const res = await fetch("/api/admin/enviar-termo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inscricao_id: id }),
      });
      if (res.ok) {
        const d = await res.json();
        ok++;
        setLista((prev) => prev.map((i) =>
          i.id === id ? { ...i, autentique_document_id: d.document_id, autentique_enviado_em: new Date().toISOString() } : i
        ));
        setSelecionados((prev) => { const next = new Set(prev); next.delete(id); return next; });
      } else {
        erro++;
      }
      setProgresso({ ok, erro, total: ids.length });
      await new Promise((r) => setTimeout(r, 600)); // pequena pausa entre envios
    }

    setEnviando(null);
  }

  async function verificarStatus(docId: string) {
    const res = await fetch(`/api/admin/status-termo?document_id=${docId}`, { credentials: "include" });
    if (res.ok) {
      const d = await res.json();
      setStatuses((prev) => ({ ...prev, [docId]: { signed: d.signed, signed_at: d.signed_at, signer_email: d.signer_email } }));
    }
  }

  async function verificarTodos() {
    for (const i of comTermo) {
      if (!statuses[i.autentique_document_id!]) {
        await verificarStatus(i.autentique_document_id!);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  if (authed === null) return (
    <div className="min-h-screen bg-creme flex items-center justify-center">
      <p className="text-[14px] text-muted">Carregando…</p>
    </div>
  );

  if (authed === false) return (
    <div className="min-h-screen bg-creme flex items-center justify-center">
      <p className="text-[14px] text-ferrugem">Acesso não autorizado.</p>
    </div>
  );

  const enviandoLote = enviando !== null;
  const nSelecionadosValidos = Array.from(selecionados).filter((id) => semTermo.some((i) => i.id === id)).length;

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <KiriLogoCompact height={26} />
        <Link href="/admin" className="text-[13px] text-muted hover:text-carvao no-underline transition-colors ml-2">
          ← Admin
        </Link>
        <span className="text-[13px] font-semibold text-carvao ml-1">/ Termos de adesão</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-8">

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Sem termo enviado", valor: semTermo.length, cor: "text-ferrugem" },
            { label: "Enviados", valor: comTermo.filter((i) => !statuses[i.autentique_document_id!]?.signed).length, cor: "text-[#9A6A00]" },
            { label: "Assinados", valor: comTermo.filter((i) => statuses[i.autentique_document_id!]?.signed).length, cor: "text-verde-confirmacao" },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="bg-white border border-linha rounded-[14px] px-4 py-3 text-center">
              <div className={`font-serif text-[24px] font-semibold ${cor}`}>{valor}</div>
              <div className="text-[11.5px] text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Seção: Sem termo */}
        {semTermo.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-semibold text-carvao">Sem termo enviado</h2>
                <p className="text-[12px] text-muted mt-0.5">Selecione até 10 por vez (limite do plano grátis)</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleTodos(semTermo)}
                  className="text-[12.5px] text-ardosia font-medium cursor-pointer hover:underline"
                >
                  {semTermo.every((i) => selecionados.has(i.id)) ? "Desmarcar todos" : "Marcar todos"}
                </button>
              </div>
            </div>

            {/* Barra de envio */}
            {nSelecionadosValidos > 0 && (
              <div className="mb-3 flex items-center gap-3 bg-[#EEF2F4] rounded-[12px] px-4 py-3">
                <span className="text-[13px] font-semibold text-ardosia-escura flex-1">
                  {nSelecionadosValidos} selecionado{nSelecionadosValidos > 1 ? "s" : ""} para envio
                  {nSelecionadosValidos > 10 && <span className="text-ferrugem ml-2">— recomendamos no máximo 10</span>}
                </span>
                <button
                  type="button"
                  onClick={enviarSelecionados}
                  disabled={enviandoLote}
                  className="text-[13px] font-semibold text-white bg-ferrugem rounded-[9px] px-4 py-2 cursor-pointer disabled:opacity-50 transition-opacity"
                >
                  {enviandoLote ? `Enviando… (${progresso?.ok ?? 0}/${progresso?.total ?? 0})` : "Enviar termos"}
                </button>
              </div>
            )}

            {progresso && !enviandoLote && (
              <div className={`mb-3 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold ${progresso.erro === 0 ? "bg-[#E8F5EE] text-verde-confirmacao" : "bg-[#FCF0EB] text-ferrugem"}`}>
                {progresso.ok} enviado{progresso.ok !== 1 ? "s" : ""} com sucesso
                {progresso.erro > 0 && ` · ${progresso.erro} com erro (verifique o limite do Autentique)`}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {semTermo.map((i) => (
                <div
                  key={i.id}
                  onClick={() => !enviandoLote && toggleSelecionado(i.id)}
                  className={`flex items-center gap-3 bg-white border rounded-[12px] px-4 py-3 cursor-pointer transition-colors ${
                    selecionados.has(i.id) ? "border-ardosia bg-[#EEF2F4]" : "border-linha hover:border-ardosia/40"
                  } ${enviandoLote && enviando === i.id ? "opacity-50" : ""}`}
                >
                  <div className={`flex-none w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                    selecionados.has(i.id) ? "bg-ardosia-escura border-ardosia-escura" : "bg-white border-linha"
                  }`}>
                    {selecionados.has(i.id) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-carvao truncate">{titleCasePT(i.nome)}</div>
                    <div className="text-[11.5px] text-muted">{i.profissao} · {i.email}</div>
                  </div>
                  {enviando === i.id && (
                    <span className="text-[11.5px] text-ardosia font-medium">Enviando…</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção: Enviados */}
        {comTermo.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-carvao">Enviados</h2>
              <button
                type="button"
                onClick={verificarTodos}
                className="text-[12.5px] text-ardosia font-medium cursor-pointer hover:underline"
              >
                Verificar todos no Autentique
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {comTermo.map((i) => {
                const st = statuses[i.autentique_document_id!];
                return (
                  <div key={i.id} className="flex items-center gap-3 bg-white border border-linha rounded-[12px] px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold text-carvao truncate">{titleCasePT(i.nome)}</div>
                      <div className="text-[11.5px] text-muted">
                        {i.profissao}
                        {i.autentique_enviado_em && ` · Enviado em ${fmtData(i.autentique_enviado_em)}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      {st ? (
                        st.signed ? (
                          <span className="text-[11.5px] font-semibold text-verde-confirmacao bg-[#E8F5EE] px-2.5 py-0.5 rounded-full">
                            ✓ Assinado{st.signed_at ? ` em ${fmtData(st.signed_at)}` : ""}
                          </span>
                        ) : (
                          <span className="text-[11.5px] font-semibold text-[#9A6A00] bg-[#FFF3CD] px-2.5 py-0.5 rounded-full">
                            Aguardando
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => verificarStatus(i.autentique_document_id!)}
                          className="text-[12px] text-ardosia font-medium cursor-pointer hover:underline"
                        >
                          Verificar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sem e-mail */}
        {semEmail.length > 0 && (
          <div>
            <h2 className="text-[15px] font-semibold text-carvao mb-2">Sem e-mail cadastrado</h2>
            <p className="text-[12.5px] text-muted mb-3">Não é possível enviar termo automaticamente. Contate manualmente.</p>
            <div className="flex flex-col gap-2">
              {semEmail.map((i) => (
                <div key={i.id} className="flex items-center gap-3 bg-white border border-linha rounded-[12px] px-4 py-3 opacity-60">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-carvao truncate">{titleCasePT(i.nome)}</div>
                    <div className="text-[11.5px] text-muted">{i.profissao} · sem e-mail</div>
                  </div>
                  <Link
                    href={i.prof_id ? `/admin/profissionais/${i.prof_id}` : `/admin/revisar/${i.id}`}
                    className="text-[12px] text-ardosia no-underline hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
