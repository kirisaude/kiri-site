"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KiriLogo } from "@/components/KiriLogo";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];

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
  cidade: string | null;
  modalidade: string | null;
  profissional_solicitado: string | null;
  observacoes: string | null;
  status: string | null;
}

type Aba = "inscricoes" | "encaminhamentos";

function pareceWhatsApp(contato: string): boolean {
  const digits = contato.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

function buildWaFamilia(contato: string, nome: string, profissionalId: string): string {
  const digits = contato.replace(/\D/g, "");
  const numero = digits.startsWith("55") ? digits : `55${digits}`;
  const primeiro = nome.split(" ")[0];
  const cardUrl = `${window.location.origin}/card/${profissionalId}`;
  const msg = `Olá, ${primeiro}! Aqui é a equipe Kiri. Preparamos o card com as informações e o contato para agendamento direto com o profissional que você pediu. Segue o link: ${cardUrl}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

function CardEspecifico({ e, expandido, onToggle, onEncaminhar, onExcluir }: {
  e: Encaminhamento;
  expandido: boolean;
  onToggle: () => void;
  onEncaminhar: (id: string, novoStatus: string) => void;
  onExcluir: (id: string) => void;
}) {
  const prof = profissionais.find((p) => p.id === e.profissional_solicitado);
  const temWa = pareceWhatsApp(e.contato);
  const encaminhado = e.status === "encaminhado";

  return (
    <div className={`border rounded-[14px] overflow-hidden transition-opacity ${encaminhado ? "bg-[#F7FAF7] border-[#B8D8C0] opacity-70" : "bg-white border-borda-azulada"}`}>
      {/* Cabeçalho sempre visível */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-[15px] font-semibold text-carvao">{e.nome_responsavel}</span>
            {encaminhado && (
              <span className="text-[11px] font-semibold text-[#2E7D4F] bg-[#E8F5EC] border border-[#B8D8C0] px-2 py-0.5 rounded-[6px]">
                encaminhado
              </span>
            )}
          </div>
          <div className="text-[13px] text-cinza-texto mt-0.5">
            {e.contato} · {new Date(e.criado_em).toLocaleDateString("pt-BR")}
          </div>
          {prof && (
            <div className="text-[13px] text-ardosia font-medium mt-0.5">
              → {prof.nome}
            </div>
          )}
          {!prof && e.profissional_solicitado && (
            <div className="text-[13px] text-muted mt-0.5">→ ID: {e.profissional_solicitado}</div>
          )}
        </div>
        <span className="text-[18px] text-muted flex-none mt-0.5">{expandido ? "▴" : "▾"}</span>
      </button>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="px-4 pb-4 border-t border-linha-sutil">
          <div className="flex flex-col gap-1.5 mt-3 text-[13px] text-cinza-texto">
            {e.cidade && <div><span className="font-medium text-carvao">Cidade:</span> {e.cidade}</div>}
            {e.modalidade && <div><span className="font-medium text-carvao">Modalidade:</span> {e.modalidade}</div>}
            {e.observacoes && (
              <div>
                <span className="font-medium text-carvao">O que procura:</span>{" "}
                <span className="italic">"{e.observacoes}"</span>
              </div>
            )}
          </div>

          {/* Botão de resposta */}
          {!encaminhado && (
            <div className="mt-4">
              {temWa && e.profissional_solicitado ? (
                <a
                  href={buildWaFamilia(e.contato, e.nome_responsavel, e.profissional_solicitado)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-[#22A85A] text-white font-semibold text-[14px] rounded-[11px] py-[13px] no-underline"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 2.003C6.486 2.003 2 6.486 2 12c0 1.762.46 3.441 1.34 4.921L2 22l5.233-1.312A9.953 9.953 0 0012 22c5.514 0 10-4.483 10-9.997 0-2.669-1.037-5.178-2.921-7.064A9.944 9.944 0 0012 2.003z" />
                  </svg>
                  Enviar card via WhatsApp
                </a>
              ) : (
                <p className="text-[12.5px] text-muted text-center">
                  Contato por e-mail — responda em{" "}
                  <a href={`mailto:${e.contato}`} className="underline text-cinza-texto">{e.contato}</a>
                  {e.profissional_solicitado && (
                    <>
                      {" "}· Link do card:{" "}
                      <Link href={`/card/${e.profissional_solicitado}`} className="underline text-ardosia" target="_blank">
                        /card/{e.profissional_solicitado}
                      </Link>
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Excluir */}
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={() => onExcluir(e.id)}
              className="text-[12px] text-ferrugem font-medium cursor-pointer hover:underline"
            >
              Excluir formulário
            </button>
          </div>

          {/* Checkbox de encaminhamento */}
          <label className={`flex items-center gap-2.5 cursor-pointer mt-2 pt-3.5 border-t border-linha-sutil ${encaminhado ? "mt-3" : ""}`}>
            <input
              type="checkbox"
              checked={encaminhado}
              onChange={() => onEncaminhar(e.id, encaminhado ? "pendente" : "encaminhado")}
              className="w-4 h-4 accent-ardosia-escura cursor-pointer"
            />
            <span className={`text-[13px] font-medium ${encaminhado ? "text-[#2E7D4F]" : "text-cinza-texto"}`}>
              {encaminhado ? "Encaminhado — clique para desfazer" : "Marcar como encaminhado"}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

function CardGeral({ e, expandido, onToggle, onExcluir }: {
  e: Encaminhamento;
  expandido: boolean;
  onToggle: () => void;
  onExcluir: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-linha rounded-[14px] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-[15px] font-semibold text-carvao">{e.nome_responsavel}</span>
            <span className="text-[11px] font-semibold text-ferrugem bg-wash-quente border border-borda-quente px-2 py-0.5 rounded-[6px]">
              Busca geral
            </span>
          </div>
          <div className="text-[13px] text-cinza-texto mt-0.5">
            {e.contato} · {new Date(e.criado_em).toLocaleDateString("pt-BR")}
          </div>
          {e.observacoes && (
            <div className="text-[12.5px] text-muted mt-0.5 truncate max-w-[320px]">
              {e.observacoes}
            </div>
          )}
        </div>
        <span className="text-[18px] text-muted flex-none mt-0.5">{expandido ? "▴" : "▾"}</span>
      </button>

      {expandido && (
        <div className="px-4 pb-4 border-t border-linha-sutil">
          <div className="flex flex-col gap-1.5 mt-3 text-[13px] text-cinza-texto">
            {e.cidade && <div><span className="font-medium text-carvao">Cidade:</span> {e.cidade}</div>}
            {e.modalidade && <div><span className="font-medium text-carvao">Modalidade:</span> {e.modalidade}</div>}
            {e.observacoes && (
              <div>
                <span className="font-medium text-carvao">O que procura:</span>{" "}
                <span className="italic">"{e.observacoes}"</span>
              </div>
            )}
          </div>
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => onExcluir(e.id)}
              className="text-[12px] text-ferrugem font-medium cursor-pointer hover:underline"
            >
              Excluir formulário
            </button>
          </div>

          <div className="pt-3.5 border-t border-linha-sutil">
            {pareceWhatsApp(e.contato) ? (
              <a
                href={`https://wa.me/${e.contato.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent(`Olá, ${e.nome_responsavel.split(" ")[0]}! Aqui é a equipe Kiri. Recebemos sua mensagem e estamos analisando para indicar o profissional mais alinhado ao que você descreveu.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full bg-[#22A85A] text-white font-semibold text-[14px] rounded-[11px] py-[12px] no-underline"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 2.003C6.486 2.003 2 6.486 2 12c0 1.762.46 3.441 1.34 4.921L2 22l5.233-1.312A9.953 9.953 0 0012 22c5.514 0 10-4.483 10-9.997 0-2.669-1.037-5.178-2.921-7.064A9.944 9.944 0 0012 2.003z" />
                </svg>
                Responder via WhatsApp
              </a>
            ) : (
              <a
                href={`mailto:${e.contato}?subject=Kiri — Retorno sobre sua busca&body=Olá, ${e.nome_responsavel.split(" ")[0]}! Aqui é a equipe Kiri. Recebemos sua mensagem e estamos analisando para indicar o profissional mais alinhado ao que você descreveu.`}
                className="flex items-center justify-center gap-2 w-full bg-ardosia-escura text-white font-semibold text-[14px] rounded-[11px] py-[12px] no-underline"
              >
                Responder por e-mail
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aba, setAba] = useState<Aba>("inscricoes");

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [encaminhamentos, setEncaminhamentos] = useState<Encaminhamento[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

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

  function toggleExpandido(id: string) {
    setExpandidos((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  async function atualizarEncaminhamento(id: string, status: string) {
    setEncaminhamentos((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    await fetch("/api/admin/encaminhamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function excluirEncaminhamento(id: string) {
    if (!confirm("Excluir este formulário permanentemente?")) return;
    setEncaminhamentos((prev) => prev.filter((e) => e.id !== id));
    await fetch("/api/admin/encaminhamentos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
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

  const comProfissional = encaminhamentos.filter((e) => !!e.profissional_solicitado);
  const semProfissional = encaminhamentos.filter((e) => !e.profissional_solicitado);

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
          <div className="flex flex-col gap-10">

            {/* Pedidos com profissional específico — pendentes */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="font-serif text-[18px] font-semibold text-carvao">Pedido específico</h2>
                <span className="text-[14px] text-muted">
                  ({comProfissional.filter((e) => e.status !== "encaminhado").length} pendentes)
                </span>
              </div>
              <p className="text-[13px] text-muted mb-4">
                Família solicitou um profissional da plataforma. Resposta: enviar o card.
              </p>
              {comProfissional.filter((e) => e.status !== "encaminhado").length === 0 ? (
                <p className="text-[14px] text-muted">Nenhum pedido pendente.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {comProfissional
                    .filter((e) => e.status !== "encaminhado")
                    .map((e) => (
                      <CardEspecifico
                        key={e.id}
                        e={e}
                        expandido={expandidos.has(e.id)}
                        onToggle={() => toggleExpandido(e.id)}
                        onEncaminhar={atualizarEncaminhamento}
                        onExcluir={excluirEncaminhamento}
                      />
                    ))}
                </div>
              )}

              {/* Subcategoria: encaminhados */}
              {comProfissional.filter((e) => e.status === "encaminhado").length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] font-semibold text-[#2E7D4F] tracking-wide">
                      Encaminhados
                    </span>
                    <span className="text-[12px] text-muted">
                      ({comProfissional.filter((e) => e.status === "encaminhado").length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {comProfissional
                      .filter((e) => e.status === "encaminhado")
                      .map((e) => (
                        <CardEspecifico
                          key={e.id}
                          e={e}
                          expandido={expandidos.has(e.id)}
                          onToggle={() => toggleExpandido(e.id)}
                          onEncaminhar={atualizarEncaminhamento}
                          onExcluir={excluirEncaminhamento}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Busca geral */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="font-serif text-[18px] font-semibold text-carvao">Busca geral</h2>
                <span className="text-[14px] text-muted">({semProfissional.length})</span>
              </div>
              <p className="text-[13px] text-muted mb-4">
                Família sem profissional escolhido. Requer análise antes de responder.
              </p>
              {semProfissional.length === 0 ? (
                <p className="text-[14px] text-muted">Nenhuma busca geral ainda.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {semProfissional.map((e) => (
                    <CardGeral
                      key={e.id}
                      e={e}
                      expandido={expandidos.has(e.id)}
                      onToggle={() => toggleExpandido(e.id)}
                      onExcluir={excluirEncaminhamento}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
