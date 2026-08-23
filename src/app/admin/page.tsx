"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { PROFISSOES_ORDENADAS } from "@/types";
import { titleCasePT } from "@/lib/titleCase";

const profissionais = data.profissionais as Profissional[];

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

interface Inscricao {
  id: string;
  criado_em: string;
  nome: string;
  email: string | null;
  profissao: string;
  registro_conselho: string;
  cidade: string;
  status: string;
  grupo_whatsapp?: boolean;
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

interface Reporte {
  id: string;
  criado_em: string;
  profissional_id: string;
  tipo_problema: string;
  descricao: string | null;
}

interface Experiencia {
  id: string;
  criado_em: string;
  profissional_id: string;
  data_atendimento: string | null;
  comentario: string | null;
  consentimento: boolean;
}

interface Contato {
  id: string;
  criado_em: string;
  nome: string;
  email: string | null;
  topico: string | null;
  mensagem: string;
  lido: boolean;
}

interface Followup {
  id: string;
  encaminhamento_id: string;
  token: string;
  profissional_nome: string | null;
  responsavel_nome: string | null;
  contato: string | null;
  contato_tipo: string | null;
  email_enviado_em: string | null;
  lembrete_enviado_em: string | null;
  contatou: boolean | null;
  motivo_nao_contato: string | null;
  agendou: boolean | null;
  motivo_nao_agendamento: string | null;
  quer_novo_encaminhamento: boolean | null;
  nps_profissional: number | null;
  nps_plataforma: number | null;
  comentario: string | null;
  desfecho: string | null;
  concluido_em: string | null;
  criado_em: string;
}

type Aba = "inscricoes" | "encaminhamentos" | "curadoria" | "reportes" | "profissionais" | "contatos" | "avaliacoes" | "instituicoes";

const STATUS_CURADORIA_TERMINAL = new Set(["respondido", "curadoria_enviada", "converteu", "nao_converteu"]);
const isCuradoriaTerminal = (status: string | null) => STATUS_CURADORIA_TERMINAL.has(status ?? "");

function statusCuradoriaBadge(status: string | null): { label: string; cls: string } {
  if (status === "em_analise") return { label: "Em análise", cls: "text-[#8B6914] bg-[#FFF8E1] border-[#E0A55E]/70" };
  if (status === "curadoria_enviada" || status === "respondido") return { label: "Curadoria enviada", cls: "text-ardosia bg-[#EEF2F4] border-ardosia/40" };
  if (status === "converteu") return { label: "Converteu ✓", cls: "text-[#2E7D4F] bg-[#E8F5EC] border-[#B8D8C0]" };
  if (status === "nao_converteu") return { label: "Não converteu", cls: "text-muted bg-[#F5F5F5] border-linha" };
  return { label: "Novo", cls: "text-ferrugem bg-wash-quente border-borda-quente" };
}

function linkContato(contato: string | null): string | null {
  if (!contato) return null;
  if (contato.includes("@")) return `mailto:${contato}?subject=Kiri%20Sa%C3%BAde%20%E2%80%94%20Encaminhamento`;
  return `https://wa.me/55${contato.replace(/\D/g, "")}`;
}

function parseObs(obs: string | null): { demanda?: string; faixa?: string; pagamento?: string; convenio?: string; objetivo?: string } {
  if (!obs) return {};
  const demanda = obs.match(/Demanda: ([^—]+)/)?.[1].trim();
  const faixa = obs.match(/Faixa etária: ([^—]+)/)?.[1].trim();
  const convenio = obs.match(/Convênio: ([^—(]+)/)?.[1].trim();
  const pagamento = !convenio ? obs.match(/Pagamento: ([^—]+)/)?.[1].trim() : undefined;
  const objetivo = obs
    .replace(/Demanda: [^—]+(?:—\s*)?/g, "")
    .replace(/Faixa etária: [^—]+(?:—\s*)?/g, "")
    .replace(/Convênio: [^—]+(?:—\s*)?/g, "")
    .replace(/Pagamento: [^—]+(?:—\s*)?/g, "")
    .replace(/\(aceita particular[^)]*\)/g, "")
    .replace(/—/g, "").trim() || undefined;
  return { demanda, faixa, pagamento, convenio, objetivo };
}

function ObsTopicos({ obs }: { obs: string | null }) {
  const { demanda, faixa, pagamento, convenio, objetivo } = parseObs(obs);
  const itens = [
    demanda && { label: "Queixa central", valor: demanda },
    faixa && { label: "Faixa etária", valor: faixa },
    objetivo && { label: "O que procura", valor: objetivo },
    convenio && { label: "Convênio", valor: convenio },
    pagamento && { label: "Pagamento", valor: pagamento },
  ].filter(Boolean) as { label: string; valor: string }[];
  if (itens.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      {itens.map((item) => (
        <div key={item.label}>
          <span className="font-medium text-carvao">{item.label}:</span>{" "}
          <span className="text-cinza-texto">{item.valor}</span>
        </div>
      ))}
    </div>
  );
}

function pareceWhatsApp(contato: string): boolean {
  const digits = contato.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

function buildWaFamilia(contato: string, nome: string, cardToken: string): string {
  const digits = contato.replace(/\D/g, "");
  const numero = digits.startsWith("55") ? digits : `55${digits}`;
  const primeiro = nome.split(" ")[0];
  const cardUrl = `${window.location.origin}/card/${cardToken}`;
  const msg = `Olá, ${primeiro}! Aqui é a equipe Kiri. Preparamos o card com as informações e o contato para agendamento direto com o profissional que você pediu. Segue o link: ${cardUrl}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

function buildWaUrl(numero: string, texto: string): string {
  const digits = numero.replace(/\D/g, "");
  const n = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

function FollowupModal({ encaminhamento, onFechar, onEnviado }: {
  encaminhamento: Encaminhamento;
  onFechar: () => void;
  onEnviado: (fup: Followup) => void;
}) {
  const [criando, setCriando] = useState(false);
  const [fup, setFup] = useState<Followup | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [datasEnvio, setDatasEnvio] = useState<Record<string, string>>({});
  const [desfecho, setDesfecho] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [encerrando, setEncerrando] = useState(false);
  const [copiouPlataforma, setCopiouPlataforma] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);
  function toggleMarca(chave: string) {
    setMarcadas(prev => {
      const s = new Set(prev);
      if (s.has(chave)) {
        s.delete(chave);
      } else {
        s.add(chave);
        setDatasEnvio(d => d[chave] ? d : { ...d, [chave]: new Date().toISOString().slice(0, 10) });
      }
      return s;
    });
  }
  const portalRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { portalRef.current = document.body; setMounted(true); }, []);

  const primeiro = encaminhamento.nome_responsavel.split(" ")[0];
  const isWa = !encaminhamento.contato.includes("@");
  const isCuradoria = !encaminhamento.profissional_solicitado;
  const profObj = profissionais.find((p) => p.id === encaminhamento.profissional_solicitado);
  const profNome = profObj ? titleCasePT(profObj.nome) : (encaminhamento.profissional_solicitado ?? "o profissional indicado");
  const profPrimeiro = profNome.split(" ")[0];
  const ratingUrl = fup ? `https://kirisaude.com.br/followup/${fup.token}` : null;

  const msgs = isCuradoria ? {
    m1: `Olá, ${primeiro}! Aqui é a Iohana, da equipe Kiri. Há alguns dias te enviamos indicações de profissionais. Você conseguiu entrar em contato com algum deles?`,
    sim_contato: `Que bom! Você conseguiu agendar uma consulta?`,
    sim_agendou: ratingUrl
      ? `Que ótimo, ${primeiro}! Ficamos muito felizes. Você toparia avaliar em 1 minuto a sua experiência com a Kiri? ${ratingUrl}`
      : `Que ótimo, ${primeiro}! Ficamos muito felizes. Você toparia avaliar em 1 minuto a sua experiência com a Kiri? [link gerado após criar]`,
    nao_agendou: `Entendemos, sem problemas! O que aconteceu? Posso te ajudar a encontrar outra opção, se precisar.`,
    nao_contato: `Tudo bem, sem pressa! Você ainda tem os contatos? Se quiser, posso te reenviar as indicações ou sugerir outras opções.`,
  } : {
    m1: `Olá, ${primeiro}! Tudo bem? Aqui é Iohana, da equipe Kiri. Há alguns dias te indicamos ${profNome}. Você conseguiu entrar em contato com ela/ele?`,
    sim_contato: `Que bom, ${primeiro}! Você conseguiu agendar uma consulta com ${profPrimeiro}?`,
    sim_agendou: ratingUrl
      ? `Que ótimo! Ficamos muito felizes. Você toparia avaliar em 1 minuto o atendimento de ${profPrimeiro} e a experiência com a Kiri? ${ratingUrl}`
      : `Que ótimo! Ficamos muito felizes. Você toparia avaliar em 1 minuto o atendimento de ${profPrimeiro} e a experiência com a Kiri? [link gerado após criar]`,
    nao_agendou: `Entendemos, sem problemas. O que aconteceu? Podemos te ajudar a encontrar outro profissional, se precisar.`,
    nao_contato: `Tudo bem! O que aconteceu? Se quiser, podemos te indicar outro profissional ou tentar novamente com ${profPrimeiro}.`,
  };

  function copiar(chave: string, texto: string) {
    navigator.clipboard.writeText(texto).catch(() => {});
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  }

  async function criar(): Promise<Followup | null> {
    setCriando(true);
    const res = await fetch("/api/admin/criar-followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encaminhamento_id: encaminhamento.id }),
    });
    setCriando(false);
    if (!res.ok) return null;
    const novo = await res.json() as Followup;
    setFup(novo);
    onEnviado(novo);
    return novo;
  }

  async function criarSemNotificar(): Promise<Followup | null> {
    setErroModal(null);
    try {
      const res = await fetch("/api/admin/criar-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encaminhamento_id: encaminhamento.id }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setErroModal(`Erro ${res.status} ao criar follow-up${body ? ": " + body : ""}`);
        return null;
      }
      return await res.json() as Followup;
    } catch (e) {
      setErroModal(`Falha de rede: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  }

  async function salvarAnotacao() {
    setSalvando(true);
    let fupAtual = fup;
    if (!fupAtual) {
      fupAtual = await criarSemNotificar();
      if (!fupAtual) {
        setSalvando(false);
        return; // mantém modal aberto para mostrar o erro
      }
      setFup(fupAtual);
      onEnviado(fupAtual);
    }
    await fetch("/api/admin/followup-desfecho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followup_id: fupAtual.id, desfecho: desfecho.trim() }),
    });
    setSalvando(false);
    onFechar();
  }

  async function copiarLinkPlataforma() {
    let fupAtual = fup;
    if (!fupAtual) {
      fupAtual = await criarSemNotificar();
      if (!fupAtual) return;
      setFup(fupAtual);
      onEnviado(fupAtual);
    }
    const link = `https://kirisaude.com.br/followup/${fupAtual.token}?plataforma=1`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiouPlataforma(true);
    setTimeout(() => setCopiouPlataforma(false), 2000);
  }

  async function salvarEEncerrar() {
    setEncerrando(true);
    setErroModal(null);
    try {
      let fupAtual = fup;
      if (!fupAtual) {
        fupAtual = await criarSemNotificar();
        if (!fupAtual) { setEncerrando(false); return; }
        setFup(fupAtual);
        onEnviado(fupAtual);
      }
      const res = await fetch("/api/admin/followup-desfecho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followup_id: fupAtual.id, desfecho: desfecho.trim(), concluir: true }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setErroModal(`Erro ao encerrar${body ? ": " + body : ""}`);
        setEncerrando(false);
        return;
      }
      const fupEncerrado: Followup = {
        ...fupAtual,
        encaminhamento_id: fupAtual.encaminhamento_id ?? encaminhamento.id,
        concluido_em: new Date().toISOString(),
        desfecho: desfecho.trim() || null,
      };
      onEnviado(fupEncerrado);
      onFechar();
    } catch (e) {
      setErroModal(`Falha: ${e instanceof Error ? e.message : String(e)}`);
      setEncerrando(false);
    }
  }

  function BolhaCopia({ chave, texto, label }: { chave: string; texto: string; label?: string }) {
    const ok = copiado === chave;
    const feita = marcadas.has(chave);
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={feita}
                onChange={() => toggleMarca(chave)}
                className="w-[15px] h-[15px] cursor-pointer accent-ardosia flex-none"
              />
              <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: feita ? "#2E7D4F" : "#9A8C78", textDecoration: feita ? "line-through" : "none" }}>{label}</span>
            </label>
            {feita && (
              <input
                type="date"
                value={datasEnvio[chave] ?? ""}
                onChange={e => setDatasEnvio(d => ({ ...d, [chave]: e.target.value }))}
                className="text-[11px] border border-linha rounded-[6px] px-1.5 py-0.5 text-carvao bg-white outline-none focus:border-ardosia transition-colors"
              />
            )}
          </div>
        )}
        <div className="bg-white border border-linha rounded-[10px] px-3 py-2.5 text-[13px] text-carvao leading-[1.55]" style={{ opacity: feita ? 0.5 : 1 }}>{texto}</div>
        <button
          type="button"
          onClick={() => copiar(chave, texto)}
          className="self-end text-[11.5px] font-semibold cursor-pointer transition-colors"
          style={{ color: ok ? "#2E7D4F" : "#44606C" }}
        >
          {ok ? "✓ Copiado!" : "Copiar"}
        </button>
      </div>
    );
  }

  if (!mounted || !portalRef.current) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" style={{ backgroundColor: "rgba(44,39,34,0.55)" }}>
      <div className="bg-creme w-full max-w-[480px] rounded-[20px] shadow-xl flex flex-col" style={{ maxHeight: "min(92vh, 700px)" }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 px-5 pt-5 pb-3 flex-none">
          <div>
            <div className="text-[15px] font-semibold text-carvao">Enviar follow-up</div>
            <div className="text-[12.5px] text-muted mt-0.5">
              {isCuradoria ? `Curadoria — ${encaminhamento.nome_responsavel}` : `${encaminhamento.nome_responsavel} → ${profNome}`}
            </div>
          </div>
          <button onClick={onFechar} className="text-muted hover:text-carvao cursor-pointer flex-none mt-0.5 p-1">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Canal */}
        <div className="px-5 pb-3 flex-none">
          <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white border border-linha text-[13px]">
            {isWa ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#25D366"/><path d="M17 14.9c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2-.1-.5-.2-1.1-.4-1.9-.8-3.3-1.5-5.4-4.8-5.6-5.1-.2-.2-.8-1.1-.8-2.1s.5-1.5.7-1.7c.2-.2.5-.3.7-.3H6c.2 0 .4.1.5.3.2.3.7 1.7.7 1.8 0 .1 0 .3-.1.4l-.6.7c-.1.1-.1.3 0 .4.5.8 1.2 1.7 2.1 2.4.9.7 1.9 1.2 2.7 1.4.1 0 .3 0 .4-.1l.7-.7c.1-.1.3-.2.5-.2.1 0 .2 0 .3.1 1.3.6 1.6.8 1.8.9.2.1.3.4.2.8z" fill="white"/></svg>
                <span className="font-medium text-carvao">WhatsApp · {encaminhamento.contato}</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2.5" stroke="#44606C" strokeWidth="1.5"/><path d="M2 7l8 5 8-5" stroke="#44606C" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                <span className="font-medium text-carvao">E-mail · {encaminhamento.contato}</span>
              </>
            )}
          </div>
        </div>

        {/* Mensagens scrolláveis */}
        <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4 pb-3">

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marcadas.has("m1")}
                  onChange={() => toggleMarca("m1")}
                  className="w-[15px] h-[15px] cursor-pointer accent-ardosia flex-none"
                />
                <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: marcadas.has("m1") ? "#2E7D4F" : "#9A8C78", textDecoration: marcadas.has("m1") ? "line-through" : "none" }}>Mensagem 1 — envie agora</span>
              </label>
              {marcadas.has("m1") && (
                <input
                  type="date"
                  value={datasEnvio["m1"] ?? ""}
                  onChange={e => setDatasEnvio(d => ({ ...d, m1: e.target.value }))}
                  className="text-[11px] border border-linha rounded-[6px] px-1.5 py-0.5 text-carvao bg-white outline-none focus:border-ardosia transition-colors"
                />
              )}
            </div>
            <div className="bg-white border border-linha rounded-[10px] px-3 py-2.5 text-[13px] text-carvao leading-[1.55]" style={{ opacity: marcadas.has("m1") ? 0.5 : 1 }}>{msgs.m1}</div>
            <div className="flex items-center justify-between mt-0.5">
              {isWa && (
                <a
                  href={buildWaUrl(encaminhamento.contato, msgs.m1)}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 no-underline text-[11.5px] font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: "#25D366" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#25D366"/><path d="M17 14.9c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2-.1-.5-.2-1.1-.4-1.9-.8-3.3-1.5-5.4-4.8-5.6-5.1-.2-.2-.8-1.1-.8-2.1s.5-1.5.7-1.7c.2-.2.5-.3.7-.3H6c.2 0 .4.1.5.3.2.3.7 1.7.7 1.8 0 .1 0 .3-.1.4l-.6.7c-.1.1-.1.3 0 .4.5.8 1.2 1.7 2.1 2.4.9.7 1.9 1.2 2.7 1.4.1 0 .3 0 .4-.1l.7-.7c.1-.1.3-.2.5-.2.1 0 .2 0 .3.1 1.3.6 1.6.8 1.8.9.2.1.3.4.2.8z" fill="white"/></svg>
                  Abrir WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => copiar("m1", msgs.m1)}
                className={`${isWa ? "" : "ml-auto"} text-[11.5px] font-semibold cursor-pointer transition-colors`}
                style={{ color: copiado === "m1" ? "#2E7D4F" : "#44606C" }}
              >
                {copiado === "m1" ? "✓ Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">Se responder SIM (entrou em contato)</div>
            <div className="pl-3 border-l-2 border-[#B8D8C0] flex flex-col gap-3">
              <BolhaCopia chave="sim_contato" texto={msgs.sim_contato} label="Mensagem 2a" />
              <div className="pl-3 border-l-2 border-[#B8D8C0] flex flex-col gap-3">
                <BolhaCopia chave="sim_agendou" texto={msgs.sim_agendou} label="Se SIM (agendou) — Mensagem 3a" />
                <BolhaCopia chave="nao_agendou" texto={msgs.nao_agendou} label="Se NÃO (não agendou) — Mensagem 3b" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">Se responder NÃO (não entrou em contato)</div>
            <div className="pl-3 border-l-2 border-ferrugem/30 flex flex-col gap-3">
              <BolhaCopia chave="nao_contato" texto={msgs.nao_contato} label="Mensagem 2b" />
            </div>
          </div>

          {!fup && (
            <div className="text-[11.5px] text-muted bg-[#FFF8E8] border border-[#E8C88A] rounded-[8px] px-3 py-2 leading-[1.5]">
              Crie o follow-up para gerar o link de avaliação (usado na mensagem 3a se a pessoa agendou).
            </div>
          )}

          {/* Desfecho */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-linha">
            <div className="text-[10.5px] font-semibold text-muted uppercase tracking-wide">Anotação (opcional)</div>
            <textarea
              value={desfecho}
              onChange={e => setDesfecho(e.target.value)}
              rows={3}
              placeholder="Ex: família agendou para setembro. Não quis mais. Marcou com outro profissional."
              className="w-full border border-linha rounded-[10px] px-3 py-2.5 text-[13px] text-carvao placeholder:text-muted outline-none resize-none leading-[1.55] disabled:opacity-60"
              style={{ background: "#fff" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#44606C")}
              onBlur={e => (e.currentTarget.style.borderColor = "")}
            />
          </div>
        </div>

        {/* Base */}
        <div className="px-5 pt-3 pb-5 flex-none border-t border-linha flex flex-col gap-2">
          {erroModal && (
            <div className="text-[11.5px] text-[#A63232] bg-[#FFF0F0] border border-[#F5C6C6] rounded-[8px] px-3 py-2 leading-[1.5]">
              {erroModal}
            </div>
          )}
          <button
            type="button"
            onClick={salvarAnotacao}
            disabled={salvando || encerrando}
            className="w-full rounded-[12px] py-[11px] text-[13.5px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-default transition-opacity border"
            style={{ background: "transparent", color: "#44606C", borderColor: "#44606C" }}
          >
            {salvando ? "Salvando…" : "Salvar e fechar"}
          </button>
          <button
            type="button"
            onClick={salvarEEncerrar}
            disabled={encerrando || salvando}
            className="w-full rounded-[12px] py-[12px] text-[14px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-default transition-opacity"
            style={{ background: "#BE6E4E", color: "#fff" }}
          >
            {encerrando ? "Encerrando…" : "Encerrar follow-up"}
          </button>
          <button
            type="button"
            onClick={copiarLinkPlataforma}
            disabled={salvando || encerrando}
            className="w-full rounded-[12px] py-[11px] text-[13.5px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-default transition-opacity border"
            style={{ background: "transparent", color: copiouPlataforma ? "#2E7D4F" : "#9A8C78", borderColor: copiouPlataforma ? "#2E7D4F" : "#D8C7B0" }}
          >
            {copiouPlataforma ? "✓ Link copiado!" : "Copiar link — avaliação só da Kiri"}
          </button>
          {!fup && (
            <button
              type="button"
              onClick={() => criar()}
              disabled={criando}
              className="text-[12px] text-muted cursor-pointer hover:text-carvao disabled:opacity-40 text-center transition-colors"
            >
              {criando ? "Criando…" : "Só criar follow-up (gera link de avaliação, sem salvar anotação)"}
            </button>
          )}
          {fup && <div className="text-[11px] text-[#2E7D4F] text-center">Follow-up criado</div>}
          <button onClick={onFechar} className="text-[13px] text-muted cursor-pointer hover:text-carvao text-center">Fechar</button>
        </div>
      </div>
    </div>,
    portalRef.current
  );
}

function FollowupBadge({ followup, encaminhamento, onCriado, onEncerrado }: {
  followup: Followup | undefined;
  encaminhamento: Encaminhamento;
  onCriado: (fup: Followup) => void;
  onEncerrado?: () => void;
}) {
  const [showModal, setShowModal] = useState(false);

  function buildWaFollowup(fup: Followup): string {
    const primeiro = encaminhamento.nome_responsavel.split(" ")[0];
    const profNome = fup.profissional_nome ?? "o profissional indicado";
    const url = `https://kirisaude.com.br/followup/${fup.token}`;
    return buildWaUrl(encaminhamento.contato, `Olá, ${primeiro}! Aqui é a equipe Kiri 🌱 Há alguns dias te indicamos ${profNome}. Tudo bem? Conta pra gente em 1 minuto: ${url}`);
  }

  const isCuradoria = !encaminhamento.profissional_solicitado;

  if (!followup) {
    if (isCuradoria) {
      // Para curadoria só mostra follow-up depois que a curadoria foi enviada
      const statusCuradoriaEnviada = encaminhamento.status === "curadoria_enviada" || encaminhamento.status === "respondido";
      if (!statusCuradoriaEnviada) return null;

      const diasDesde = Math.floor((Date.now() - new Date(encaminhamento.criado_em).getTime()) / 86400000);
      const ehHora = diasDesde >= 7;

      return (
        <>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {ehHora ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#E0A55E]/70 text-[#8B6914] bg-[#FFF8E1]">
                ⏱ há {diasDesde} dias — hora do follow-up
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#D8C7B0] text-muted bg-[#F5EFE6]">
                há {diasDesde} dia{diasDesde !== 1 ? "s" : ""} — aguardar até 7 dias
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-[11px] font-semibold text-[#2E7D4F] border border-[#B8D8C0] bg-[#F0F8F2] px-2 py-0.5 rounded-full cursor-pointer hover:bg-[#E0F0E5] transition-colors"
            >
              Enviar follow-up →
            </button>
          </div>
          {showModal && (
            <FollowupModal
              encaminhamento={encaminhamento}
              onFechar={() => setShowModal(false)}
              onEnviado={(fup) => { onCriado(fup); if (fup.concluido_em) onEncerrado?.(); }}
            />
          )}
        </>
      );
    }

    return (
      <>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#D8C7B0] text-muted bg-[#F5EFE6]">Follow-up pendente</span>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-[11px] font-semibold text-[#2E7D4F] border border-[#B8D8C0] bg-[#F0F8F2] px-2 py-0.5 rounded-full cursor-pointer hover:bg-[#E0F0E5] transition-colors"
          >
            Enviar follow-up →
          </button>
        </div>
        {showModal && (
          <FollowupModal
            encaminhamento={encaminhamento}
            onFechar={() => setShowModal(false)}
            onEnviado={(fup) => { onCriado(fup); }}
          />
        )}
      </>
    );
  }

  const isWa = followup.contato_tipo === "whatsapp";

  if (followup.concluido_em && !followup.nps_profissional) {
    return (
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#D8C7B0] text-[#6E6457] bg-[#F5EFE6]">Follow-up encerrado</span>
        {followup.desfecho && <span className="text-[11px] text-muted italic truncate max-w-[200px]">"{followup.desfecho}"</span>}
      </div>
    );
  }

  if (followup.concluido_em && followup.nps_profissional) {
    return (
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#B8D8C0] text-[#2E7D4F] bg-[#E8F5EC]">
          Avaliado ★{followup.nps_profissional}/5 · Kiri ★{followup.nps_plataforma}/5
        </span>
        {followup.comentario && (
          <span className="text-[11px] text-muted italic">"{followup.comentario}"</span>
        )}
      </div>
    );
  }

  if (followup.agendou === false) {
    return (
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#F5C49A] text-[#8B5C1E] bg-[#FFF5EA]">Não agendou</span>
        {followup.quer_novo_encaminhamento && <span className="text-[11px] text-ferrugem font-semibold">Quer novo encaminhamento</span>}
        {followup.motivo_nao_agendamento && <span className="text-[11px] text-muted">"{followup.motivo_nao_agendamento}"</span>}
      </div>
    );
  }

  if (followup.agendou === true && !followup.nps_profissional) {
    return (
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-borda-azulada text-ardosia bg-wash-azulado">Agendou — aguardando avaliação</span>
      </div>
    );
  }

  if (followup.contatou === false) {
    return (
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-ferrugem/30 text-ferrugem bg-[#FFF0EE]">Não entrou em contato</span>
        {followup.quer_novo_encaminhamento && <span className="text-[11px] text-ferrugem font-semibold">Quer novo encaminhamento</span>}
        {followup.motivo_nao_contato && <span className="text-[11px] text-muted">"{followup.motivo_nao_contato}"</span>}
      </div>
    );
  }

  // Aguardando resposta — já criado, mostra botão de abrir WA + botão de abrir modal novamente
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mt-1">
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#E8C88A] text-[#8B6A1E] bg-[#FFF8E8]">
          {isWa && !followup.email_enviado_em ? "Aguardando — WA não enviado ainda" : "Aguardando resposta"}
        </span>
        {isWa && (
          <a
            href={buildWaFollowup(followup)}
            target="_blank" rel="noopener noreferrer"
            className="text-[11px] font-semibold text-[#2E7D4F] border border-[#B8D8C0] bg-[#F0F8F2] px-2 py-0.5 rounded-full no-underline hover:bg-[#E0F0E5] transition-colors"
          >
            {followup.email_enviado_em ? "Reenviar WA" : "Abrir WA"}
          </a>
        )}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-[11px] font-semibold text-[#2E7D4F] border border-[#B8D8C0] bg-[#F0F8F2] px-2 py-0.5 rounded-full cursor-pointer hover:bg-[#E0F0E5] transition-colors"
        >
          Enviar follow-up →
        </button>
      </div>
      {showModal && (
        <FollowupModal
          encaminhamento={encaminhamento}
          onFechar={() => setShowModal(false)}
          onEnviado={(fup) => { onCriado(fup); if (fup.concluido_em) onEncerrado?.(); }}
        />
      )}
    </>
  );
}

function CardEspecifico({ e, expandido, onToggle, onEncaminhar, onExcluir, followup, onFollowupCriado }: {
  e: Encaminhamento;
  expandido: boolean;
  onToggle: () => void;
  onEncaminhar: (id: string, novoStatus: string) => void;
  onExcluir: (id: string) => void;
  followup?: Followup;
  onFollowupCriado: (fup: Followup) => void;
}) {
  const prof = profissionais.find((p) => p.id === e.profissional_solicitado);
  const temWa = pareceWhatsApp(e.contato);
  const encaminhado = e.status === "encaminhado";
  const encerrado = !!followup?.concluido_em;
  const [copiado, setCopiado] = useState<string | null>(null);

  async function copiar(texto: string, chave: string) {
    await navigator.clipboard.writeText(texto);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  }

  function gerarMsgProfissional(): string {
    if (!prof) return "";
    const primeiroProfNome = prof.nome.split(" ")[0];
    const obs = e.observacoes ?? "";
    const demanda = obs.match(/Demanda: ([^—]+)/)?.[1].trim() ?? null;
    const faixa = obs.match(/Faixa etária: ([^—]+)/)?.[1].trim() ?? null;
    const convenio = obs.match(/Convênio: ([^—(]+)/)?.[1].trim() ?? null;
    const resto = obs
      .replace(/Demanda: [^—]+(?:—\s*)?/g, "")
      .replace(/Faixa etária: [^—]+(?:—\s*)?/g, "")
      .replace(/Convênio: [^—]+(?:—\s*)?/g, "")
      .replace(/Pagamento: [^—]+(?:—\s*)?/g, "")
      .replace(/\(aceita particular[^)]*\)/g, "")
      .replace(/—/g, "").trim();
    const topicos: string[] = [];
    if (demanda) topicos.push(`• Queixa central: ${demanda}`);
    if (faixa) topicos.push(`• Faixa etária: ${faixa}`);
    if (resto) topicos.push(`• Principal objetivo: ${resto}`);
    if (e.modalidade) topicos.push(`• Modalidade: ${e.modalidade}`);
    if (e.cidade) topicos.push(`• Cidade: ${e.cidade}`);
    if (convenio) topicos.push(`• Convênio: ${convenio}`);
    return `Olá, ${primeiroProfNome}! Aqui é a equipe Kiri.\n\nO familiar ${e.nome_responsavel} entrou em contato e pediu especificamente o seu contato. Segue o perfil:\n\n${topicos.join("\n")}\n\nEnviamos o seu contato a eles para agendamento direto. Obrigada pela parceria!`;
  }

  function gerarMsgFamilia(): string {
    const primeiro = e.nome_responsavel.split(" ")[0];
    const cardUrl = prof ? `${window.location.origin}/card/${prof.card_token}` : "";
    return `Olá, ${primeiro}! Aqui é a equipe Kiri.\n\nPreparamos o card com as informações e o contato para agendamento direto com ${prof?.nome ?? "o profissional"}. Segue o link:\n${cardUrl}`;
  }

  return (
    <div className={`border rounded-[14px] overflow-hidden ${encerrado ? "bg-[#F3F2F0] border-[#D0C8BE]" : encaminhado ? "bg-[#F7FAF7] border-[#B8D8C0] opacity-70" : "bg-white border-borda-azulada"}`}>
      {/* Cabeçalho sempre visível */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-[15px] font-semibold text-carvao">{e.nome_responsavel}</span>
            {encerrado && (
              <span className="text-[11px] font-semibold text-muted bg-[#EDEBE8] border border-[#D0C8BE] px-2 py-0.5 rounded-[6px]">
                encerrado
              </span>
            )}
            {encaminhado && !encerrado && (
              <span className="text-[11px] font-semibold text-[#2E7D4F] bg-[#E8F5EC] border border-[#B8D8C0] px-2 py-0.5 rounded-[6px]">
                encaminhado
              </span>
            )}
          </div>
          <div className="text-[13px] text-cinza-texto mt-0.5 flex items-center gap-1.5">
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-[5px] border shrink-0 ${e.contato?.includes("@") ? "text-ardosia border-ardosia/40 bg-ardosia/5" : "text-[#2E7D4F] border-[#B8D8C0] bg-[#F0F8F2]"}`}>
              {e.contato?.includes("@") ? "E-mail" : "WhatsApp"}
            </span>
            {linkContato(e.contato) ? (
              <a href={linkContato(e.contato)!} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ardosia transition-colors">
                {e.contato}
              </a>
            ) : e.contato}
            {" · "}{new Date(e.criado_em).toLocaleDateString("pt-BR")}
          </div>
          {prof && (
            <div className="text-[13px] text-ardosia font-medium mt-0.5">
              → {prof.nome}
            </div>
          )}
          {!prof && e.profissional_solicitado && (
            <div className="text-[13px] text-muted mt-0.5">→ ID: {e.profissional_solicitado}</div>
          )}
          <FollowupBadge followup={followup} encaminhamento={e} onCriado={onFollowupCriado} onEncerrado={() => { if (expandido) onToggle(); }} />
        </div>
        <span className="text-[18px] text-muted flex-none mt-0.5">{expandido ? "▴" : "▾"}</span>
      </button>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="px-4 pb-4 border-t border-linha-sutil">
          <div className="flex flex-col gap-1.5 mt-3 text-[13px] text-cinza-texto">
            {e.cidade && <div><span className="font-medium text-carvao">Cidade:</span> {e.cidade}</div>}
            {e.modalidade && <div><span className="font-medium text-carvao">Modalidade:</span> {e.modalidade}</div>}
            <ObsTopicos obs={e.observacoes} />
          </div>

          {/* Mensagens */}
          {!encaminhado && prof && (
            <div className="pt-3.5 mt-3 border-t border-linha-sutil flex flex-col gap-3">
              {/* Mensagem para o profissional */}
              <div className="bg-white border border-linha rounded-[10px] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-cinza-texto uppercase tracking-wide">Para {prof.nome.split(" ")[0]}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => copiar(gerarMsgProfissional(), "prof")}
                      className="text-[12px] font-semibold text-ardosia cursor-pointer">
                      {copiado === "prof" ? "✓ Copiado" : "Copiar"}
                    </button>
                    {prof.whatsapp_agendamento && (
                      <a href={`https://wa.me/${prof.whatsapp_agendamento.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent(gerarMsgProfissional())}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[12px] font-semibold text-[#22A85A] no-underline">
                        Abrir WA ↗
                      </a>
                    )}
                  </div>
                </div>
                <pre className="text-[12px] text-carvao whitespace-pre-wrap font-sans leading-[1.5]">{gerarMsgProfissional()}</pre>
              </div>

              {/* Mensagem para a família */}
              <div className="bg-[#F0F7F0] border border-[#B8D8C0] rounded-[10px] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#2E7D4F] uppercase tracking-wide">Mensagem para a família</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => copiar(gerarMsgFamilia(), "familia")}
                      className="text-[12px] font-semibold text-ardosia cursor-pointer">
                      {copiado === "familia" ? "✓ Copiado" : "Copiar"}
                    </button>
                    {temWa && (
                      <a href={`https://wa.me/${e.contato.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent(gerarMsgFamilia())}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[12px] font-semibold text-[#22A85A] no-underline">
                        Abrir WA ↗
                      </a>
                    )}
                  </div>
                </div>
                <pre className="text-[12px] text-carvao whitespace-pre-wrap font-sans leading-[1.5]">{gerarMsgFamilia()}</pre>
              </div>
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

function CardGeral({ e, expandido, onToggle, onExcluir, onResolver, followup, onFollowupCriado }: {
  e: Encaminhamento;
  expandido: boolean;
  onToggle: () => void;
  onExcluir: (id: string) => void;
  onResolver: (id: string, novoStatus: string) => void;
  followup?: Followup;
  onFollowupCriado: (fup: Followup) => void;
}) {
  const concluido = isCuradoriaTerminal(e.status);
  const [profSelecionados, setProfSelecionados] = useState<string[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [filtroProf, setFiltroProf] = useState<string | null>(null);
  const [filtroConvenio, setFiltroConvenio] = useState<"todos" | "convenio" | "particular" | "especifico">("especifico");

  // Extrair dados estruturados do observacoes
  const faixaEtaria = e.observacoes?.match(/Faixa etária: ([^—]+)/)?.[1].trim() ?? null;
  const convenioSolicitado = e.observacoes?.match(/Convênio: ([^—(]+)/)?.[1].trim() ?? null;
  const aceitaParticular = !!(e.observacoes?.includes("aceita particular"));

  // Pré-triagem automática
  const profPreFiltrados = profissionais.filter((p) => {
    if (p.oculto) return false;
    if (e.modalidade === "Presencial" && p.modalidade === "Somente online") return false;
    if (e.modalidade === "Online" && p.modalidade === "Somente presencial") return false;
    if (faixaEtaria && !p.faixa_etaria.includes(faixaEtaria)) return false;
    return true;
  });

  // Filtros manuais do admin
  const profFiltrados = profPreFiltrados
    .filter((p) => !filtroProf || p.profissao === filtroProf)
    .filter((p) => {
      if (filtroConvenio === "especifico" && convenioSolicitado) {
        return p.convenios?.some((c) => c.toLowerCase().includes(convenioSolicitado.toLowerCase())) ?? false;
      }
      if (filtroConvenio === "convenio") return p.convenios && p.convenios.length > 0;
      if (filtroConvenio === "particular") return !p.convenios || p.convenios.length === 0;
      return true;
    });

  const profissoesDisponiveis = [...new Set(profPreFiltrados.map((p) => p.profissao))];

  function toggleProf(id: string) {
    setProfSelecionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  function gerarMsgFamilia(): string {
    const primeiro = e.nome_responsavel.split(" ")[0];
    const profs = profSelecionados.map((id) => profissionais.find((p) => p.id === id)).filter(Boolean) as typeof profissionais;

    function linhaProf(p: typeof profissionais[0], i: number) {
      const wa = p.whatsapp_agendamento
        ? `\nWhatsApp: wa.me/${p.whatsapp_agendamento.replace(/\D/g, "").replace(/^(?!55)/, "55")}`
        : "";
      return `${i + 1}. ${p.nome} — ${p.titulo_exibicao} · ${p.cidade}${wa}`;
    }

    if (convenioSolicitado) {
      const profsComConvenio = profs.filter((p) =>
        p.convenios?.some((c) => c.toLowerCase().includes(convenioSolicitado.toLowerCase()))
      );
      const profsSemConvenio = profs.filter((p) =>
        !p.convenios?.some((c) => c.toLowerCase().includes(convenioSolicitado.toLowerCase()))
      );

      if (profsComConvenio.length > 0) {
        const lista = profsComConvenio.map(linhaProf).join("\n\n");
        let msg = `Olá, ${primeiro}! Aqui é a equipe Kiri.\n\nAnalisamos seu pedido e selecionamos ${profsComConvenio.length} ${profsComConvenio.length > 1 ? "profissionais" : "profissional"} que atende${profsComConvenio.length > 1 ? "m" : ""} pelo ${convenioSolicitado}:\n\n${lista}`;
        if (aceitaParticular && profsSemConvenio.length > 0) {
          const listaP = profsSemConvenio.map((p, i) => linhaProf(p, i));
          msg += `\n\nTambém incluímos profissionais particulares que podem complementar a busca:\n\n${listaP.join("\n\n")}`;
        }
        msg += `\n\nFique à vontade para entrar em contato para agendar. Qualquer dúvida, estamos aqui!`;
        return msg;
      } else {
        let msg = `Olá, ${primeiro}! Aqui é a equipe Kiri.\n\nAnalisamos seu pedido, mas infelizmente não encontramos profissionais da nossa rede que atendam pelo ${convenioSolicitado} no momento.`;
        if (aceitaParticular && profsSemConvenio.length > 0) {
          const lista = profsSemConvenio.map(linhaProf).join("\n\n");
          msg += `\n\nComo você indicou que aceita profissionais particulares, selecionamos algumas opções:\n\n${lista}\n\nFique à vontade para entrar em contato com qualquer um deles para agendar. Qualquer dúvida, estamos aqui!`;
        } else {
          msg += `\n\nCaso deseje profissionais particulares, nos comunique e enviamos algumas opções que possam te ajudar. Qualquer dúvida, estamos aqui!`;
        }
        return msg;
      }
    }

    const lista = profs.map(linhaProf).join("\n\n");
    return `Olá, ${primeiro}! Aqui é a equipe Kiri.\n\nAnalisamos seu pedido e selecionamos ${profs.length} ${profs.length > 1 ? "profissionais" : "profissional"} que ${profs.length > 1 ? "podem" : "pode"} ajudar:\n\n${lista}\n\nFique à vontade para entrar em contato com qualquer um deles para agendar. Qualquer dúvida, estamos aqui!`;
  }

  function gerarMsgProfissional(profId: string): string {
    const prof = profissionais.find((p) => p.id === profId);
    if (!prof) return "";
    const primeiroProfNome = prof.nome.split(" ")[0];
    const obs = e.observacoes ?? "";

    const demanda = obs.match(/Demanda: ([^—]+)/)?.[1].trim() ?? null;
    const faixa = obs.match(/Faixa etária: ([^—]+)/)?.[1].trim() ?? null;
    const convenio = obs.match(/Convênio: ([^—(]+)/)?.[1].trim() ?? null;
    const resto = obs
      .replace(/Demanda: [^—]+(?:—\s*)?/g, "")
      .replace(/Faixa etária: [^—]+(?:—\s*)?/g, "")
      .replace(/Convênio: [^—]+(?:—\s*)?/g, "")
      .replace(/Pagamento: [^—]+(?:—\s*)?/g, "")
      .replace(/\(aceita particular[^)]*\)/g, "")
      .replace(/—/g, "")
      .trim();

    const topicos: string[] = [];
    if (demanda) topicos.push(`• Queixa central: ${demanda}`);
    if (faixa) topicos.push(`• Faixa etária: ${faixa}`);
    if (resto) topicos.push(`• Principal objetivo: ${resto}`);
    if (e.modalidade) topicos.push(`• Modalidade: ${e.modalidade}`);
    if (e.cidade) topicos.push(`• Cidade: ${e.cidade}`);
    if (convenio) topicos.push(`• Convênio: ${convenio}`);

    return `Olá, ${primeiroProfNome}! Aqui é a equipe Kiri.\n\nO familiar ${e.nome_responsavel} entrou em contato conosco com o seguinte perfil:\n\n${topicos.join("\n")}\n\nEnviamos o seu contato a eles para agendamento direto. Obrigada pela parceria!`;
  }

  async function copiar(texto: string, chave: string) {
    await navigator.clipboard.writeText(texto);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  }

  return (
    <div className={`border rounded-[14px] overflow-hidden ${concluido ? "bg-[#F7FAF7] border-[#B8D8C0] opacity-70" : "bg-white border-linha"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-[15px] font-semibold text-carvao">{e.nome_responsavel}</span>
            {(() => { const b = statusCuradoriaBadge(e.status); return (
              <span className={`text-[11px] font-semibold border px-2 py-0.5 rounded-[6px] ${b.cls}`}>{b.label}</span>
            ); })()}
          </div>
          <div className="text-[13px] text-cinza-texto mt-0.5 flex items-center gap-1.5">
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-[5px] border shrink-0 ${e.contato?.includes("@") ? "text-ardosia border-ardosia/40 bg-ardosia/5" : "text-[#2E7D4F] border-[#B8D8C0] bg-[#F0F8F2]"}`}>
              {e.contato?.includes("@") ? "E-mail" : "WhatsApp"}
            </span>
            {linkContato(e.contato) ? (
              <a href={linkContato(e.contato)!} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ardosia transition-colors">
                {e.contato}
              </a>
            ) : e.contato}
            {" · "}{new Date(e.criado_em).toLocaleDateString("pt-BR")}
          </div>
          {e.observacoes && !concluido && (
            <div className="text-[12.5px] text-muted mt-0.5 truncate max-w-[320px]">
              {parseObs(e.observacoes).demanda ?? e.observacoes}
            </div>
          )}
          <FollowupBadge followup={followup} encaminhamento={e} onCriado={onFollowupCriado} onEncerrado={() => { if (expandido) onToggle(); }} />
        </div>
        <span className="text-[18px] text-muted flex-none mt-0.5">{expandido ? "▴" : "▾"}</span>
      </button>

      {expandido && (
        <div className="px-4 pb-4 border-t border-linha-sutil">
          <div className="flex flex-col gap-1.5 mt-3 text-[13px] text-cinza-texto">
            {e.cidade && <div><span className="font-medium text-carvao">Cidade:</span> {e.cidade}</div>}
            {e.modalidade && <div><span className="font-medium text-carvao">Modalidade:</span> {e.modalidade}</div>}
            <ObsTopicos obs={e.observacoes} />
          </div>
          <div className="flex justify-end mb-2 mt-3">
            <button
              type="button"
              onClick={() => onExcluir(e.id)}
              className="text-[12px] text-ferrugem font-medium cursor-pointer hover:underline"
            >
              Excluir formulário
            </button>
          </div>

          {!concluido && (
            <div className="pt-3.5 border-t border-linha-sutil flex flex-col gap-4">
              {/* Seletor de profissionais com pré-triagem e filtros */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11.5px] font-semibold text-carvao uppercase tracking-wide">
                    Selecionar profissionais para indicar (até 3)
                  </div>
                  <span className="text-[11.5px] text-muted">{profFiltrados.length} encontrados</span>
                </div>

                {/* Info de pré-triagem */}
                {(e.modalidade && e.modalidade !== "Sem preferência" || faixaEtaria) && (
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {e.modalidade && e.modalidade !== "Sem preferência" && (
                      <span className="text-[11px] bg-ardosia/10 text-ardosia px-2 py-0.5 rounded-full">✓ {e.modalidade}</span>
                    )}
                    {faixaEtaria && (
                      <span className="text-[11px] bg-ardosia/10 text-ardosia px-2 py-0.5 rounded-full">✓ {faixaEtaria}</span>
                    )}
                  </div>
                )}

                {/* Filtro por profissão */}
                <div className="flex gap-1.5 flex-wrap mb-2">
                  <button type="button" onClick={() => setFiltroProf(null)}
                    className={`text-[12px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${!filtroProf ? "bg-carvao text-white border-carvao" : "bg-white text-cinza-texto border-linha"}`}>
                    Todas
                  </button>
                  {profissoesDisponiveis.map((prof) => (
                    <button key={prof} type="button" onClick={() => setFiltroProf(filtroProf === prof ? null : prof)}
                      className={`text-[12px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${filtroProf === prof ? "bg-carvao text-white border-carvao" : "bg-white text-cinza-texto border-linha"}`}>
                      {prof}
                    </button>
                  ))}
                </div>

                {/* Filtro convênio/particular */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {convenioSolicitado && (
                    <button type="button" onClick={() => setFiltroConvenio("especifico")}
                      className={`text-[12px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors font-semibold ${filtroConvenio === "especifico" ? "bg-ambar-texto text-white border-ambar-texto" : "bg-[#FFF8ED] text-ambar-texto border-[#E0A55E]/50"}`}>
                      Atende {convenioSolicitado}
                      {profFiltrados.length === 0 && filtroConvenio !== "especifico" ? "" : filtroConvenio === "especifico" && profFiltrados.length === 0 ? " (0)" : ""}
                    </button>
                  )}
                  {(["todos", "convenio", "particular"] as const).map((op) => (
                    <button key={op} type="button" onClick={() => setFiltroConvenio(op)}
                      className={`text-[12px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${filtroConvenio === op ? "bg-carvao text-white border-carvao" : "bg-white text-cinza-texto border-linha"}`}>
                      {op === "todos" ? "Todos" : op === "convenio" ? "Com convênio" : "Particular"}
                    </button>
                  ))}
                </div>
                {convenioSolicitado && filtroConvenio === "especifico" && profFiltrados.length === 0 && (
                  <div className="mb-2">
                    <p className="text-[12px] text-ferrugem font-medium mb-2">
                      Nenhum profissional atende {convenioSolicitado} na rede.{aceitaParticular ? " Selecione particulares — a mensagem explicará isso automaticamente." : ""}
                    </p>
                    {!aceitaParticular && (
                      <div className="bg-[#FFF8ED] border border-[#E0A55E]/40 rounded-[10px] p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-[#A0621A] uppercase tracking-wide">Mensagem para a família</span>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => copiar(gerarMsgFamilia(), "familia")}
                              className="text-[12px] font-semibold text-ardosia cursor-pointer">
                              {copiado === "familia" ? "✓ Copiado" : "Copiar"}
                            </button>
                            {pareceWhatsApp(e.contato) && (
                              <a href={`https://wa.me/${e.contato.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent(gerarMsgFamilia())}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-[12px] font-semibold text-[#22A85A] no-underline">
                                Abrir WA ↗
                              </a>
                            )}
                          </div>
                        </div>
                        <pre className="text-[12px] text-carvao whitespace-pre-wrap font-sans leading-[1.5]">{gerarMsgFamilia()}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Lista filtrada */}
                <div className="flex flex-col gap-1.5">
                  {profFiltrados.length === 0 ? (
                    <p className="text-[12.5px] text-muted">Nenhum profissional encontrado com esses filtros.</p>
                  ) : profFiltrados.map((p) => {
                    const sel = profSelecionados.includes(p.id);
                    const disabled = !sel && profSelecionados.length >= 3;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleProf(p.id)}
                        className={`text-left px-3 py-2 rounded-[9px] border text-[12.5px] transition-colors cursor-pointer disabled:opacity-30 ${
                          sel ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha hover:border-ardosia"
                        }`}
                      >
                        <span className="font-semibold">{p.nome}</span>
                        <span className={`ml-1.5 ${sel ? "opacity-70" : "text-muted"}`}>
                          {p.titulo_exibicao} · {p.cidade} · {p.modalidade}
                          {p.convenios && p.convenios.length > 0 ? " · convênio" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mensagens geradas */}
              {profSelecionados.length > 0 && (
                <div className="flex flex-col gap-3">
                  {/* Mensagem para a família */}
                  <div className="bg-[#F0F7F0] border border-[#B8D8C0] rounded-[10px] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#2E7D4F] uppercase tracking-wide">Mensagem para a família</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => copiar(gerarMsgFamilia(), "familia")}
                          className="text-[12px] font-semibold text-ardosia cursor-pointer">
                          {copiado === "familia" ? "✓ Copiado" : "Copiar"}
                        </button>
                        {pareceWhatsApp(e.contato) && (
                          <a href={`https://wa.me/${e.contato.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent(gerarMsgFamilia())}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-[12px] font-semibold text-[#22A85A] no-underline">
                            Abrir WA ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <pre className="text-[12px] text-carvao whitespace-pre-wrap font-sans leading-[1.5]">{gerarMsgFamilia()}</pre>
                  </div>

                  {/* Mensagem por profissional */}
                  {profSelecionados.map((id) => {
                    const prof = profissionais.find((p) => p.id === id);
                    if (!prof) return null;
                    return (
                      <div key={id} className="bg-white border border-linha rounded-[10px] p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-cinza-texto uppercase tracking-wide">Para {prof.nome.split(" ")[0]}</span>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => copiar(gerarMsgProfissional(id), id)}
                              className="text-[12px] font-semibold text-ardosia cursor-pointer">
                              {copiado === id ? "✓ Copiado" : "Copiar"}
                            </button>
                            {prof.whatsapp_agendamento && (
                              <a href={`https://wa.me/${prof.whatsapp_agendamento.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent(gerarMsgProfissional(id))}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-[12px] font-semibold text-[#22A85A] no-underline">
                                Abrir WA ↗
                              </a>
                            )}
                          </div>
                        </div>
                        <pre className="text-[12px] text-carvao whitespace-pre-wrap font-sans leading-[1.5]">{gerarMsgProfissional(id)}</pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Status da curadoria */}
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3.5 border-t border-linha-sutil">
            <span className="text-[11.5px] text-muted font-medium uppercase tracking-wide">Status:</span>
            {(["em_analise", "curadoria_enviada", "converteu", "nao_converteu"] as const).map((s) => {
              const labels: Record<string, string> = {
                em_analise: "Em análise",
                curadoria_enviada: "Curadoria enviada",
                converteu: "Converteu",
                nao_converteu: "Não converteu",
              };
              const ativo = e.status === s || (s === "curadoria_enviada" && e.status === "respondido");
              return (
                <button key={s} type="button"
                  onClick={() => onResolver(e.id, ativo ? "novo" : s)}
                  className={`text-[12px] font-semibold px-2.5 py-1 rounded-[7px] cursor-pointer transition-colors border ${
                    ativo
                      ? "bg-ardosia-escura text-white border-ardosia-escura"
                      : "bg-white text-cinza-texto border-linha hover:border-ardosia"
                  }`}
                >
                  {labels[s]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SalvarInstBtn({ sigla, valor, onSalvo }: { sigla: string; valor: string; onSalvo: (sigla: string, nome: string) => void }) {
  const [estado, setEstado] = useState<"idle" | "salvando" | "ok" | "erro">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        setEstado("salvando");
        try {
          const res = await fetch("/api/instituicoes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sigla, nome_extenso: valor || null }),
          });
          if (res.ok) {
            onSalvo(sigla, valor);
            setEstado("ok");
          } else {
            const err = await res.json().catch(() => ({}));
            console.error("Erro ao salvar instituição:", err);
            setEstado("erro");
            setTimeout(() => setEstado("idle"), 3000);
          }
        } catch (e) {
          console.error(e);
          setEstado("erro");
          setTimeout(() => setEstado("idle"), 3000);
        }
      }}
      className={`text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-colors ${
        estado === "ok" ? "text-green-600" : estado === "erro" ? "text-red-500" : "text-ardosia hover:text-ardosia-escura"
      }`}
    >
      {estado === "salvando" ? "…" : estado === "ok" ? "✓ Salvo" : estado === "erro" ? "Erro" : "Salvar"}
    </button>
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
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [instituicoes, setInstituicoes] = useState<{ sigla: string; nome_extenso: string | null }[]>([]);
  const [instEdits, setInstEdits] = useState<Record<string, string>>({});
  const [instBusca, setInstBusca] = useState("");
  const [profPublicados, setProfPublicados] = useState<Profissional[]>(
    data.profissionais as Profissional[]
  );
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [buscaGlobal, setBuscaGlobal] = useState("");
  const [buscaPlataforma, setBuscaPlataforma] = useState("");
  const [buscaPendentes, setBuscaPendentes] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [followupsMap, setFollowupsMap] = useState<Map<string, Followup>>(new Map());
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [enviandoEmailDocs, setEnviandoEmailDocs] = useState(false);
  const [emailDocsStatus, setEmailDocsStatus] = useState<"idle"|"ok"|"erro">("idle");
  const [enviandoEmailProfId, setEnviandoEmailProfId] = useState<string | null>(null);
  const [emailProfStatus, setEmailProfStatus] = useState<Record<string, "ok" | "erro">>({});
  const [syncStatus, setSyncStatus] = useState<"idle"|"syncing"|"ok"|"erro">("idle");
  const [syncErro, setSyncErro] = useState("");
  const [syncDriveStatus, setSyncDriveStatus] = useState<"idle"|"syncing"|"ok"|"erro">("idle");
  const [syncDriveMsg, setSyncDriveMsg] = useState("");
  const [syncEncStatus, setSyncEncStatus] = useState<"idle"|"syncing"|"ok"|"erro">("idle");
  const [syncEncErro, setSyncEncErro] = useState("");
  const [syncCurStatus, setSyncCurStatus] = useState<"idle"|"syncing"|"ok"|"erro">("idle");
  const [syncCurErro, setSyncCurErro] = useState("");

  async function sincronizarDriveFolders() {
    setSyncDriveStatus("syncing");
    setSyncDriveMsg("");
    try {
      const res = await fetch("/api/admin/sync-drive-folders", { method: "POST", credentials: "include" });
      const d = await res.json();
      if (res.ok) {
        setSyncDriveStatus("ok");
        setSyncDriveMsg(d.vinculados > 0 ? `${d.vinculados} nova(s) pasta(s) vinculada(s)` : "Nenhuma pasta nova");
        setTimeout(() => { setSyncDriveStatus("idle"); setSyncDriveMsg(""); }, 5000);
      } else {
        setSyncDriveStatus("erro");
        setSyncDriveMsg(d.error ?? "Erro");
        setTimeout(() => { setSyncDriveStatus("idle"); setSyncDriveMsg(""); }, 8000);
      }
    } catch {
      setSyncDriveStatus("erro");
      setSyncDriveMsg("Erro de conexão");
      setTimeout(() => { setSyncDriveStatus("idle"); setSyncDriveMsg(""); }, 8000);
    }
  }

  async function sincronizarSheets() {
    setSyncStatus("syncing");
    setSyncErro("");
    try {
      const res = await fetch("/api/admin/sync-sheets", { method: "POST", credentials: "include" });
      if (res.ok) {
        setSyncStatus("ok");
        setTimeout(() => setSyncStatus("idle"), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setSyncErro(d.error ?? `Erro ${res.status}`);
        setSyncStatus("erro");
        setTimeout(() => setSyncStatus("idle"), 8000);
      }
    } catch (e) {
      setSyncErro(e instanceof Error ? e.message : "Erro de rede");
      setSyncStatus("erro");
      setTimeout(() => setSyncStatus("idle"), 8000);
    }
  }

  async function sincronizarSheetsEnc() {
    setSyncEncStatus("syncing");
    setSyncEncErro("");
    try {
      const res = await fetch("/api/admin/sync-sheets-encaminhamentos", { method: "POST", credentials: "include" });
      if (res.ok) {
        setSyncEncStatus("ok");
        setTimeout(() => setSyncEncStatus("idle"), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setSyncEncErro(d.error ?? `Erro ${res.status}`);
        setSyncEncStatus("erro");
        setTimeout(() => setSyncEncStatus("idle"), 8000);
      }
    } catch (e) {
      setSyncEncErro(e instanceof Error ? e.message : "Erro de rede");
      setSyncEncStatus("erro");
      setTimeout(() => setSyncEncStatus("idle"), 8000);
    }
  }

  async function sincronizarSheetsCur() {
    setSyncCurStatus("syncing");
    setSyncCurErro("");
    try {
      const res = await fetch("/api/admin/sync-sheets-curadoria", { method: "POST", credentials: "include" });
      if (res.ok) {
        setSyncCurStatus("ok");
        setTimeout(() => setSyncCurStatus("idle"), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setSyncCurErro(d.error ?? `Erro ${res.status}`);
        setSyncCurStatus("erro");
        setTimeout(() => setSyncCurStatus("idle"), 8000);
      }
    } catch (e) {
      setSyncCurErro(e instanceof Error ? e.message : "Erro de rede");
      setSyncCurStatus("erro");
      setTimeout(() => setSyncCurStatus("idle"), 8000);
    }
  }

  // Extrai todas as siglas (SIGLA) e, quando disponível, o nome por extenso que aparece antes delas
  const detectedSiglas = useMemo(() => {
    const map = new Map<string, { profNames: string[]; nomeExterno?: string }>();
    for (const p of profPublicados) {
      for (const f of (p.formacao ?? [])) {
        // Cada parte do campo pode conter "Nome Completo (SIGLA)"
        const partes = (f.instituicao_ano ?? "").split(" — ");
        for (const parte of partes) {
          const m = parte.match(/^(.*?)\s*\(([A-Za-z]{2,12})\)\s*$/);
          if (!m) continue;
          const nomeRaw = m[1].trim();
          const sigla = m[2].toUpperCase();
          const entry = map.get(sigla) ?? { profNames: [] };
          if (!entry.profNames.includes(p.nome)) entry.profNames.push(p.nome);
          // Guarda o nome por extenso se o texto antes da sigla for significativo
          if (nomeRaw.length > 3 && !entry.nomeExterno) entry.nomeExterno = nomeRaw;
          map.set(sigla, entry);
        }
      }
    }
    return map;
  }, [profPublicados]);

  const buscarDados = useCallback(async () => {
    setBuscando(true);
    const [resI, resE, resR, resC, resExp, resInst] = await Promise.all([
      fetch("/api/admin/inscricoes"),
      fetch("/api/admin/encaminhamentos"),
      fetch("/api/admin/reportes"),
      fetch("/api/contato"),
      fetch("/api/admin/experiencias"),
      fetch("/api/instituicoes"),
    ]);
    if (resI.ok) setInscricoes(await resI.json());
    if (resE.ok) setEncaminhamentos(await resE.json());
    if (resR.ok) setReportes(await resR.json());
    if (resC.ok) setContatos(await resC.json());
    if (resExp.ok) setExperiencias(await resExp.json());
    if (resInst.ok) {
      const rows = await resInst.json();
      setInstituicoes(rows);
      const edits: Record<string, string> = {};
      for (const r of rows) edits[r.sigla] = r.nome_extenso ?? "";
      setInstEdits(edits);
    }
    fetch("/api/admin/followups").then(r => r.ok ? r.json() : []).then((fups: Followup[]) => {
      setFollowupsMap(new Map(fups.map(f => [f.encaminhamento_id, f])));
    });
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

  async function excluirInscricao(id: string) {
    if (!confirm("Excluir este formulário permanentemente?")) return;
    setInscricoes((prev) => prev.filter((i) => i.id !== id));
    await fetch("/api/admin/inscricoes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
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
    const statusAnterior = encaminhamentos.find((e) => e.id === id)?.status ?? null;

    setEncaminhamentos((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    if (isCuradoriaTerminal(status)) {
      setExpandidos((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }

    try {
      const res = await fetch("/api/admin/encaminhamentos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setEncaminhamentos((prev) => prev.map((e) => e.id === id ? { ...e, status: statusAnterior } : e));
        alert(`Erro ao salvar status: ${body.error ?? res.status}`);
      }
    } catch {
      setEncaminhamentos((prev) => prev.map((e) => e.id === id ? { ...e, status: statusAnterior } : e));
      alert("Erro de rede. Tente novamente.");
    }
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

  async function excluirReporte(id: string) {
    if (!confirm("Excluir este reporte permanentemente?")) return;
    setReportes((prev) => prev.filter((r) => r.id !== id));
    await fetch("/api/admin/reportes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }


  async function excluirProfissional(id: string, nome: string, inscricaoId?: string | null) {
    if (!confirm(`Remover "${nome}" da plataforma? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(id);
    const res = await fetch("/api/admin/profissionais", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setProfPublicados((prev) => prev.filter((p) => p.id !== id));
      // Marca a inscrição como excluída para sumir do termos e de listas
      if (inscricaoId) {
        fetch("/api/admin/inscricoes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: inscricaoId, status: "excluido" }),
        }).catch(() => {});
      }
    } else {
      alert("Erro ao excluir. Tente novamente.");
    }
    setExcluindo(null);
  }

  const DOCS_LISTA = [
    { key: "foto", label: "Foto profissional" },
    { key: "certidao", label: "Certidão de regularidade no conselho" },
    { key: "diploma", label: "Diploma de graduação" },
    { key: "certificados", label: "Certificados / especializações" },
  ] as const;

  function docStatus(p: Profissional): Record<string, boolean> {
    const grad = (p.formacao ?? []).filter(f => /^graduaç/i.test(f.curso));
    const nonGrad = (p.formacao ?? []).filter(f => !/^graduaç/i.test(f.curso));
    const temDiploma = grad.some(f => f.verificado === true) && !grad.some(f => f.pendente === true);
    const temCertificados = nonGrad.some(f => f.verificado === true) && !nonGrad.some(f => f.pendente === true);
    return {
      foto: !!p.foto_url,
      certidao: !!p.certidao_enviada_em,
      diploma: temDiploma,
      certificados: temCertificados,
    };
  }

  async function enviarEmailProfPendencias(p: Profissional) {
    if (!p.inscricao_id) { alert("Este profissional não tem inscricao_id — não é possível enviar o e-mail."); return; }
    const status = docStatus(p);
    const pendentes = DOCS_LISTA.filter(d => !status[d.key]).map(d => d.label);
    if (pendentes.length === 0) { alert("Nenhuma pendência de documentos detectada."); return; }
    setEnviandoEmailProfId(p.id);
    const res = await fetch("/api/admin/pendencias-email", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inscricao_id: p.inscricao_id, pendencias: pendentes.join("\n") }),
    });
    setEnviandoEmailProfId(null);
    setEmailProfStatus(prev => ({ ...prev, [p.id]: res.ok ? "ok" : "erro" }));
    setTimeout(() => setEmailProfStatus(prev => { const n = { ...prev }; delete n[p.id]; return n; }), 4000);
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
            <KiriLogoCompact height={34} />
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

  const naoVisiveis = profPublicados.filter((p) =>
    p.oculto || !p.foto_url || p.registro_verificado === false || p.sobre_verificado === false
  );
  const visiveis = profPublicados.filter((p) => !p.oculto && !!p.foto_url);

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <KiriLogoCompact height={28} />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/termos" className="text-[13px] font-semibold text-muted hover:text-carvao no-underline transition-colors">
            Termos
          </Link>
          <Link href="/admin/drive" className="text-[13px] font-semibold text-muted hover:text-carvao no-underline transition-colors">
            Drive
          </Link>
          <Link href="/admin/divulgacao" className="text-[13px] font-semibold text-muted hover:text-carvao no-underline transition-colors">
            Divulgação
          </Link>
          <button onClick={buscarDados} className="text-[13px] font-semibold text-ardosia cursor-pointer">
            {buscando ? "Atualizando…" : "↻ Atualizar"}
          </button>
        </div>
      </header>

      {/* Abas */}
      <div className="border-b border-linha px-4 flex gap-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {([
          { key: "inscricoes", label: `Inscrições (${pendentes.length})`, badge: null },
          { key: "profissionais", label: `Profissionais (${visiveis.length}/${profPublicados.length})`, badge: naoVisiveis.length > 0 ? naoVisiveis.length : null },
          { key: "encaminhamentos", label: "Encaminhamentos", badge: (() => { const p = comProfissional.filter(e => e.status !== "encaminhado").length; return p > 0 ? p : null; })() },
          { key: "curadoria", label: "Curadoria", badge: (() => { const p = semProfissional.filter(e => !isCuradoriaTerminal(e.status)).length; return p > 0 ? p : null; })() },
          { key: "avaliacoes", label: "Experiências", badge: experiencias.length > 0 ? experiencias.length : null },
          { key: "contatos", label: "Contatos", badge: contatos.filter(c => !c.lido).length > 0 ? contatos.filter(c => !c.lido).length : null },
          { key: "reportes", label: "Reportes", badge: reportes.length > 0 ? reportes.length : null },
          { key: "instituicoes", label: "Instituições", badge: null },
        ] as { key: Aba; label: string; badge: number | null }[]).map(({ key, label, badge }) => (
          <button key={key} onClick={() => setAba(key)}
            className={`flex-none py-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${aba === key ? "border-ardosia-escura text-carvao" : "border-transparent text-muted"}`}>
            {label}
            {badge !== null && <span className="bg-ferrugem text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ABA INSCRICOES */}
        {aba === "inscricoes" && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-[18px] font-semibold text-carvao">
                Pendentes <span className="text-[14px] font-sans font-normal text-muted">({pendentes.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                {pendentes.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Enviar e-mail de documentação para ${pendentes.length} profissional(is) pendente(s)?`)) return;
                      setEnviandoEmailDocs(true);
                      const res = await fetch("/api/admin/enviar-documentacao", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ids: pendentes.map(i => i.id) }),
                      });
                      const data = await res.json();
                      setEnviandoEmailDocs(false);
                      if (res.ok) { setEmailDocsStatus("ok"); setTimeout(() => setEmailDocsStatus("idle"), 4000); }
                      else setEmailDocsStatus("erro");
                      if (res.ok) alert(`E-mail enviado para ${data.enviados} profissional(is).${data.semEmail > 0 ? ` ${data.semEmail} sem e-mail cadastrado.` : ""}`);
                    }}
                    disabled={enviandoEmailDocs}
                    className={`text-[12.5px] font-semibold border rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-40 transition-colors ${emailDocsStatus === "ok" ? "text-[#1A7A4A] border-[#A8D9BC]" : "text-ferrugem border-ferrugem/30"}`}
                  >
                    {enviandoEmailDocs ? "Enviando…" : emailDocsStatus === "ok" ? "✓ Enviado" : "✉ Enviar e-mail de documentação"}
                  </button>
                )}
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={sincronizarDriveFolders}
                    disabled={syncDriveStatus === "syncing"}
                    className={`text-[12.5px] font-semibold border rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-50 transition-colors ${syncDriveStatus === "ok" ? "text-[#2E7D4F] border-[#B8D8C0]" : syncDriveStatus === "erro" ? "text-ferrugem border-ferrugem/30" : "text-ardosia border-ardosia/30 hover:bg-wash"}`}
                  >
                    {syncDriveStatus === "syncing" ? "Verificando…" : syncDriveStatus === "ok" ? `✓ ${syncDriveMsg}` : syncDriveStatus === "erro" ? `Erro: ${syncDriveMsg}` : "↺ Sync pastas Drive"}
                  </button>
                  <button
                    onClick={sincronizarSheets}
                    disabled={syncStatus === "syncing"}
                    className={`text-[12.5px] font-semibold border rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-50 transition-colors ${syncStatus === "ok" ? "text-[#2E7D4F] border-[#B8D8C0]" : syncStatus === "erro" ? "text-ferrugem border-ferrugem/30" : "text-ardosia border-ardosia/30 hover:bg-wash"}`}
                  >
                    {syncStatus === "syncing" ? "Sincronizando…" : syncStatus === "ok" ? "✓ Planilha atualizada" : syncStatus === "erro" ? "Erro — tente novamente" : "↑ Sincronizar Google Sheets"}
                  </button>
                  {syncErro && <p className="text-[11px] text-ferrugem max-w-[280px] text-right">{syncErro}</p>}
                </div>
                <a
                  href="/api/admin/exportar-csv"
                  download
                  className="text-[12.5px] font-medium text-muted border border-linha rounded-[9px] px-3 py-1.5 cursor-pointer no-underline inline-flex items-center hover:text-carvao transition-colors"
                >
                  ↓ CSV
                </a>
              </div>
            </div>
            <div>
              {pendentes.length === 0 ? (
                <p className="text-[14px] text-muted">Nenhuma inscrição pendente.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendentes.map((i) => (
                    <div key={i.id} className="bg-white border border-linha rounded-[14px] px-4 py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-[15.5px] font-semibold text-carvao">{titleCasePT(i.nome)}</span>
                          {i.grupo_whatsapp && (
                            <span className="text-[11px] font-semibold text-[#1A7A4A] bg-[#E6F4EE] border border-[#A8D9BC] px-2 py-0.5 rounded-[6px]">Quer grupo WhatsApp</span>
                          )}
                        </div>
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
                        <button onClick={() => excluirInscricao(i.id)}
                          className="text-[13px] font-semibold text-ferrugem cursor-pointer hover:underline">
                          Excluir
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
                  {aprovados.map((i) => {
                    const profMatch = profPublicados.find(
                      (p) => (p.inscricao_id && p.inscricao_id === i.id) ||
                        p.nome.toLowerCase().trim() === i.nome.toLowerCase().trim()
                    );
                    return (
                      <div key={i.id} className="bg-white border border-linha rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 opacity-70">
                        <div>
                          <div className="text-[14.5px] font-semibold text-carvao">{titleCasePT(i.nome)}</div>
                          <div className="text-[12.5px] text-cinza-texto">{i.profissao}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {profMatch ? (
                            <span className="text-[12px] text-ardosia font-semibold">✓ publicado</span>
                          ) : (
                            <span className="text-[12px] text-ambar-texto font-semibold">⚠ perfil não criado</span>
                          )}
                          {profMatch ? (
                            <>
                              <Link href={`/profissional/${profMatch.id}`} target="_blank"
                                className="text-[12px] text-muted font-medium no-underline cursor-pointer hover:underline">
                                Ver perfil ↗
                              </Link>
                              <Link href={`/admin/profissionais/${profMatch.id}`}
                                className="text-[12px] text-ardosia font-semibold no-underline cursor-pointer hover:underline">
                                Editar
                              </Link>
                            </>
                          ) : (
                            <Link href={`/admin/revisar/${i.id}`}
                              className="text-[12px] text-ferrugem font-semibold no-underline cursor-pointer hover:underline">
                              Publicar perfil →
                            </Link>
                          )}
                          <button onClick={() => excluirInscricao(i.id)}
                            className="text-[12px] text-ferrugem font-medium cursor-pointer hover:underline">
                            Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                        <div className="text-[14.5px] font-semibold text-carvao">{titleCasePT(i.nome)}</div>
                        <div className="text-[12.5px] text-cinza-texto">{i.profissao}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => atualizarStatus(i.id, "pendente")}
                          className="text-[12px] text-ferrugem font-semibold cursor-pointer">
                          Desfazer
                        </button>
                        <button onClick={() => excluirInscricao(i.id)}
                          className="text-[12px] text-muted font-medium cursor-pointer hover:underline">
                          Excluir
                        </button>
                      </div>
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

            <div className="flex justify-end items-center gap-2">
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={sincronizarSheetsEnc}
                  disabled={syncEncStatus === "syncing"}
                  className={`text-[12.5px] font-semibold border rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-50 transition-colors ${syncEncStatus === "ok" ? "text-[#2E7D4F] border-[#B8D8C0]" : syncEncStatus === "erro" ? "text-ferrugem border-ferrugem/30" : "text-ardosia border-ardosia/30 hover:bg-wash"}`}
                >
                  {syncEncStatus === "syncing" ? "Sincronizando…" : syncEncStatus === "ok" ? "✓ Planilha atualizada" : syncEncStatus === "erro" ? "Erro — tente novamente" : "↑ Sincronizar Google Sheets"}
                </button>
                {syncEncErro && <p className="text-[11px] text-ferrugem max-w-[280px] text-right">{syncEncErro}</p>}
              </div>
              <a href="/api/admin/exportar-encaminhamentos-csv" download className="text-[12.5px] font-medium text-muted border border-linha rounded-[9px] px-3 py-1.5 no-underline inline-flex items-center hover:text-carvao transition-colors">
                ↓ CSV
              </a>
            </div>

            {/* Encaminhamentos novos */}
            {(() => {
              const novos = comProfissional.filter((e) => e.status !== "encaminhado");
              return (
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <h2 className="font-serif text-[18px] font-semibold text-carvao">Encaminhamentos novos</h2>
                    <span className="text-[13px] text-muted">({novos.length})</span>
                  </div>
                  {novos.length === 0 ? (
                    <p className="text-[13px] text-muted">Nenhum pedido novo.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {novos.map((e) => (
                        <CardEspecifico
                          key={e.id}
                          e={e}
                          expandido={expandidos.has(e.id)}
                          onToggle={() => toggleExpandido(e.id)}
                          onEncaminhar={atualizarEncaminhamento}
                          onExcluir={excluirEncaminhamento}
                          followup={followupsMap.get(e.id)}
                          onFollowupCriado={(fup) => setFollowupsMap(prev => new Map(prev).set(fup.encaminhamento_id, fup))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Encaminhamentos em curso */}
            {(() => {
              const emCurso = comProfissional.filter((e) => e.status === "encaminhado" && !followupsMap.get(e.id)?.concluido_em);
              return (
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <h2 className="font-serif text-[18px] font-semibold text-carvao">Encaminhamentos em curso</h2>
                    <span className="text-[13px] text-muted">({emCurso.length})</span>
                  </div>
                  {emCurso.length === 0 ? (
                    <p className="text-[13px] text-muted">Nenhum em curso.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {emCurso.map((e) => (
                        <CardEspecifico
                          key={e.id}
                          e={e}
                          expandido={expandidos.has(e.id)}
                          onToggle={() => toggleExpandido(e.id)}
                          onEncaminhar={atualizarEncaminhamento}
                          onExcluir={excluirEncaminhamento}
                          followup={followupsMap.get(e.id)}
                          onFollowupCriado={(fup) => setFollowupsMap(prev => new Map(prev).set(fup.encaminhamento_id, fup))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Encaminhamentos encerrados */}
            {(() => {
              const encerrados = comProfissional.filter((e) => !!followupsMap.get(e.id)?.concluido_em);
              return (
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <h2 className="font-serif text-[18px] font-semibold text-carvao">Encaminhamentos encerrados</h2>
                    <span className="text-[13px] text-muted">({encerrados.length})</span>
                  </div>
                  {encerrados.length === 0 ? (
                    <p className="text-[13px] text-muted">Nenhum encerrado ainda.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {encerrados.map((e) => (
                        <CardEspecifico
                          key={e.id}
                          e={e}
                          expandido={expandidos.has(e.id)}
                          onToggle={() => toggleExpandido(e.id)}
                          onEncaminhar={atualizarEncaminhamento}
                          onExcluir={excluirEncaminhamento}
                          followup={followupsMap.get(e.id)}
                          onFollowupCriado={(fup) => setFollowupsMap(prev => new Map(prev).set(fup.encaminhamento_id, fup))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}

        {/* ABA CURADORIA */}
        {aba === "curadoria" && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-end items-center gap-2">
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={sincronizarSheetsCur}
                  disabled={syncCurStatus === "syncing"}
                  className={`text-[12.5px] font-semibold border rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-50 transition-colors ${syncCurStatus === "ok" ? "text-[#2E7D4F] border-[#B8D8C0]" : syncCurStatus === "erro" ? "text-ferrugem border-ferrugem/30" : "text-ardosia border-ardosia/30 hover:bg-wash"}`}
                >
                  {syncCurStatus === "syncing" ? "Sincronizando…" : syncCurStatus === "ok" ? "✓ Planilha atualizada" : syncCurStatus === "erro" ? "Erro — tente novamente" : "↑ Sincronizar Google Sheets"}
                </button>
                {syncCurErro && <p className="text-[11px] text-ferrugem max-w-[280px] text-right">{syncCurErro}</p>}
              </div>
              <a href="/api/admin/exportar-encaminhamentos-csv" download className="text-[12.5px] font-medium text-muted border border-linha rounded-[9px] px-3 py-1.5 no-underline inline-flex items-center hover:text-carvao transition-colors">
                ↓ CSV
              </a>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="font-serif text-[18px] font-semibold text-carvao">Pedidos de curadoria</h2>
                <span className="text-[14px] text-muted">
                  ({semProfissional.filter((e) => !isCuradoriaTerminal(e.status)).length} pendentes)
                </span>
              </div>
              <p className="text-[13px] text-muted mb-4">
                Família sem profissional escolhido. Analise o pedido e envie uma lista de até 3 indicações.
              </p>
              {semProfissional.filter((e) => !isCuradoriaTerminal(e.status)).length === 0 ? (
                <p className="text-[14px] text-muted">Nenhum pedido pendente.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {semProfissional
                    .filter((e) => !isCuradoriaTerminal(e.status))
                    .map((e) => (
                      <CardGeral
                        key={e.id}
                        e={e}
                        expandido={expandidos.has(e.id)}
                        onToggle={() => toggleExpandido(e.id)}
                        onExcluir={excluirEncaminhamento}
                        onResolver={atualizarEncaminhamento}
                        followup={followupsMap.get(e.id)}
                        onFollowupCriado={(fup) => setFollowupsMap(prev => new Map(prev).set(fup.encaminhamento_id, fup))}
                      />
                    ))}
                </div>
              )}
            </div>

            {semProfissional.filter((e) => isCuradoriaTerminal(e.status)).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] font-semibold text-[#2E7D4F] tracking-wide">Concluídos</span>
                  <span className="text-[12px] text-muted">
                    ({semProfissional.filter((e) => isCuradoriaTerminal(e.status)).length})
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {semProfissional
                    .filter((e) => isCuradoriaTerminal(e.status))
                    .map((e) => (
                      <CardGeral
                        key={e.id}
                        e={e}
                        expandido={expandidos.has(e.id)}
                        onToggle={() => toggleExpandido(e.id)}
                        onExcluir={excluirEncaminhamento}
                        onResolver={atualizarEncaminhamento}
                        followup={followupsMap.get(e.id)}
                        onFollowupCriado={(fup) => setFollowupsMap(prev => new Map(prev).set(fup.encaminhamento_id, fup))}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA REPORTES */}
        {aba === "reportes" && (
          <div>
            <h2 className="font-serif text-[18px] font-semibold text-carvao mb-1">
              Reportes de perfil
            </h2>
            <p className="text-[13px] text-muted mb-5">Enviados por usuários da plataforma.</p>
            {reportes.length === 0 ? (
              <p className="text-[14px] text-muted">Nenhum reporte recebido ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reportes.map((r) => {
                  const prof = profissionais.find((p) => p.id === r.profissional_id);
                  return (
                    <div key={r.id} className="bg-white border border-linha rounded-[14px] px-4 py-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="font-serif text-[15px] font-semibold text-carvao">
                            {prof ? prof.nome : r.profissional_id}
                          </div>
                          {prof && (
                            <div className="text-[12.5px] text-muted">{prof.titulo_exibicao}</div>
                          )}
                        </div>
                        <span className="text-[12px] text-muted flex-none">
                          {new Date(r.criado_em).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="inline-block bg-wash-quente border border-borda-quente text-ferrugem text-[12.5px] font-semibold px-2.5 py-1 rounded-[7px] mb-2">
                        {r.tipo_problema}
                      </div>
                      {r.descricao && (
                        <p className="text-[13px] text-cinza-texto italic mt-1">"{r.descricao}"</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-linha-sutil">
                        <Link
                          href={`/admin/revisar/${r.profissional_id}`}
                          className="text-[13px] font-semibold text-ardosia no-underline"
                        >
                          Ver perfil ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => excluirReporte(r.id)}
                          className="text-[12px] text-ferrugem font-medium cursor-pointer hover:underline"
                        >
                          Excluir reporte
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA PROFISSIONAIS */}
        {aba === "profissionais" && (
          <div className="flex flex-col gap-10">

            {/* BUSCA GLOBAL */}
            <div>
              <input
                type="text"
                value={buscaGlobal}
                onChange={(e) => setBuscaGlobal(e.target.value)}
                placeholder="Buscar qualquer profissional (pendente, oculto ou visível)…"
                className="w-full max-w-lg px-3 py-2.5 text-[14px] border border-linha rounded-[10px] bg-white placeholder:text-muted focus:outline-none focus:border-ardosia"
              />
              {buscaGlobal.trim() && (() => {
                const q = semAcento(buscaGlobal.trim());
                const resultados = profPublicados.filter((p) =>
                  semAcento(p.nome).includes(q) ||
                  semAcento(p.profissao).includes(q) ||
                  semAcento(p.cidade ?? "").includes(q)
                );
                return (
                  <div className="mt-3 flex flex-col gap-2">
                    {resultados.length === 0 ? (
                      <p className="text-[13px] text-muted">Nenhum profissional encontrado.</p>
                    ) : resultados.map((p) => (
                      <div key={p.id} className="bg-white border border-linha rounded-[13px] px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[14px] text-carvao">{p.nome}</span>
                            <span className="text-[12px] text-muted">{p.id}</span>
                            {p.oculto && <span className="text-[11px] px-1.5 py-0.5 rounded border text-[#BE8A3E] bg-[#FFF0D0] border-[#E8C88A]">oculto</span>}
                            {!p.foto_url && <span className="text-[11px] px-1.5 py-0.5 rounded border text-ferrugem bg-[#FFF0EE] border-ferrugem/25">sem foto</span>}
                          </div>
                          <div className="text-[12px] text-muted mt-0.5">{p.profissao} · {p.cidade}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-none">
                          <a href={`/profissional/${p.id}`} target="_blank" rel="noopener" className="text-[13px] font-medium text-muted border border-linha rounded-[9px] px-3 py-1.5 hover:bg-wash transition-colors no-underline">Ver perfil</a>
                          <a href={`/admin/profissionais/${p.id}`} className="text-[13px] font-semibold text-ardosia border border-linha rounded-[9px] px-3 py-1.5 hover:bg-wash transition-colors no-underline">Editar</a>
                          <button onClick={() => excluirProfissional(p.id, p.nome, p.inscricao_id)} className="text-[13px] font-medium text-ferrugem border border-ferrugem/25 rounded-[9px] px-3 py-1.5 hover:bg-[#FDF2EF] transition-colors cursor-pointer">Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* PENDÊNCIAS */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-serif text-[18px] font-semibold text-carvao">Pendências</h2>
                {naoVisiveis.length === 0
                  ? <span className="text-[13px] text-[#2E7D4F] font-semibold">✓ tudo ok</span>
                  : <span className="bg-ferrugem text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{naoVisiveis.length}</span>
                }
              </div>
              <p className="text-[13px] text-muted mb-3">
                Profissionais inscritos que não aparecem na home ou têm dados incompletos.
              </p>

              {naoVisiveis.length === 0 ? (
                <p className="text-[13px] text-muted">Nenhuma pendência encontrada.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {naoVisiveis.filter((p) => !buscaGlobal || semAcento(p.nome).includes(semAcento(buscaGlobal))).map((p) => {
                    const tags: { label: string; cls: string }[] = [];
                    if (!p.foto_url) tags.push({ label: "sem foto", cls: "text-ferrugem bg-[#FFF0EE] border-ferrugem/25" });
                    if (p.oculto) tags.push({ label: "oculto", cls: "text-[#BE8A3E] bg-[#FFF0D0] border-[#E8C88A]" });
                    if (p.registro_verificado === false) tags.push({ label: "registro não verificado", cls: "text-ardosia bg-wash-azulado border-borda-azulada" });
                    if (p.sobre_verificado === false) tags.push({ label: "sobre não verificado", cls: "text-ardosia bg-wash-azulado border-borda-azulada" });
                    const docs = docStatus(p);
                    const emailStatus = emailProfStatus[p.id];
                    return (
                      <div key={p.id} className="bg-white border border-ferrugem/20 rounded-[13px] px-4 py-3 flex flex-col gap-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-[15px] font-semibold text-carvao leading-tight">{titleCasePT(p.nome)}</span>
                              <span className="text-[11px] text-muted font-mono">{p.id}</span>
                              {tags.map((t) => (
                                <span key={t.label} className={`text-[11px] font-semibold border px-2 py-0.5 rounded-[6px] ${t.cls}`}>{t.label}</span>
                              ))}
                            </div>
                            <div className="text-[12.5px] text-cinza-texto mt-0.5">{p.profissao} · {p.cidade}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-none">
                            <Link
                              href={`/admin/profissionais/${p.id}`}
                              className="text-[12.5px] font-semibold text-carvao bg-wash-quente border border-borda-quente rounded-[8px] px-3 py-1.5 no-underline"
                            >
                              Editar
                            </Link>
                            <button
                              type="button"
                              disabled={excluindo === p.id}
                              onClick={() => excluirProfissional(p.id, p.nome, p.inscricao_id)}
                              className="text-[12.5px] font-semibold text-ferrugem bg-white border border-ferrugem/40 rounded-[8px] px-3 py-1.5 cursor-pointer disabled:opacity-50 hover:bg-[#FFF0EE] transition-colors"
                            >
                              {excluindo === p.id ? "Removendo…" : "Excluir"}
                            </button>
                          </div>
                        </div>

                        {/* Checklist de documentos + botão de e-mail */}
                        <div className="flex items-start justify-between gap-3 pt-2 border-t border-linha-sutil">
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {DOCS_LISTA.map(d => (
                              <label key={d.key} className="flex items-center gap-1.5 cursor-default select-none">
                                <span className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-none ${docs[d.key] ? "bg-ardosia border-ardosia" : "bg-white border-linha"}`}>
                                  {docs[d.key] && (
                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  )}
                                </span>
                                <span className={`text-[11.5px] ${docs[d.key] ? "text-muted line-through" : "text-carvao"}`}>{d.label}</span>
                              </label>
                            ))}
                          </div>
                          {p.inscricao_id && (
                            <button
                              type="button"
                              onClick={() => enviarEmailProfPendencias(p)}
                              disabled={enviandoEmailProfId === p.id}
                              className={`flex-none text-[11.5px] font-semibold border rounded-[8px] px-2.5 py-1 cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap ${emailStatus === "ok" ? "text-[#2E7D4F] border-[#B8D8C0]" : emailStatus === "erro" ? "text-ferrugem border-ferrugem/30" : "text-ardosia border-ardosia/30 hover:bg-wash"}`}
                            >
                              {enviandoEmailProfId === p.id ? "Enviando…" : emailStatus === "ok" ? "✓ Enviado" : emailStatus === "erro" ? "Erro" : "✉ Solicitar docs"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TODOS OS PROFISSIONAIS */}
            <div>
              <h2 className="font-serif text-[18px] font-semibold text-carvao mb-1">
                Todos na plataforma
              </h2>
              <p className="text-[13px] text-muted mb-4">
                {visiveis.length} visíveis na home · {profPublicados.length} no total. Exclusões entram em vigor após ~1 min (rebuild automático).
              </p>

              {PROFISSOES_ORDENADAS.map((prof) => {
                const grupo = profPublicados.filter((p) => p.profissao === prof && (!buscaGlobal || semAcento(p.nome).includes(semAcento(buscaGlobal))));
                if (grupo.length === 0) return null;
                return (
                  <div key={prof} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-[14px] font-bold tracking-[0.04em] uppercase text-muted">{prof}</h3>
                      <span className="text-[13px] text-muted">({grupo.length})</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {grupo.map((p) => {
                        const temPendencia = p.oculto || !p.foto_url || p.registro_verificado === false || p.sobre_verificado === false;
                        return (
                          <div key={p.id} className={`border rounded-[13px] px-4 py-3 flex items-center justify-between gap-3 ${temPendencia ? "bg-[#FFF8F0] border-[#E8C88A]" : "bg-white border-linha"}`}>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-serif text-[15px] font-semibold text-carvao leading-tight">{titleCasePT(p.nome)}</span>
                                <span className="text-[11px] text-muted font-mono">{p.id}</span>
                                {p.oculto && <span className="text-[11px] font-semibold text-[#BE8A3E] bg-[#FFF0D0] border border-[#E8C88A] px-2 py-0.5 rounded-[6px]">oculto</span>}
                                {!p.foto_url && <span className="text-[11px] font-semibold text-ferrugem bg-[#FFF0EE] border border-ferrugem/25 px-2 py-0.5 rounded-[6px]">sem foto</span>}
                                {p.registro_verificado === false && <span className="text-[11px] font-semibold text-ardosia bg-wash-azulado border border-borda-azulada px-2 py-0.5 rounded-[6px]">registro não verificado</span>}
                                {p.sobre_verificado === false && <span className="text-[11px] font-semibold text-ardosia bg-wash-azulado border border-borda-azulada px-2 py-0.5 rounded-[6px]">sobre não verificado</span>}
                              </div>
                              <div className="text-[12.5px] text-cinza-texto mt-0.5 flex gap-2 flex-wrap">
                                <span>{p.cidade}</span>
                                <span>·</span>
                                <span>{p.modalidade}</span>
                                {p.verificacao_data && <><span>·</span><span>verificado em {p.verificacao_data}</span></>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-none">
                              <Link href={`/profissional/${p.id}`} target="_blank" className="text-[12.5px] font-medium text-ardosia no-underline">Ver ↗</Link>
                              <Link href={`/admin/profissionais/${p.id}`} className="text-[12.5px] font-semibold text-carvao bg-wash-quente border border-borda-quente rounded-[8px] px-3 py-1.5 no-underline">Editar</Link>
                              <button
                                type="button"
                                disabled={excluindo === p.id}
                                onClick={() => excluirProfissional(p.id, p.nome, p.inscricao_id)}
                                className="text-[12.5px] font-semibold text-white bg-ferrugem rounded-[8px] px-3 py-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {excluindo === p.id ? "Removendo…" : "Excluir"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {profPublicados.length === 0 && (
                <p className="text-[14px] text-muted">Nenhum profissional na plataforma ainda.</p>
              )}
            </div>
          </div>
        )}

        {/* ABA EXPERIÊNCIAS */}
        {aba === "avaliacoes" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-serif text-[18px] font-semibold text-carvao">
                Relatos de experiência <span className="text-[14px] font-sans font-normal text-muted">({experiencias.length})</span>
              </h2>
              <p className="text-[13px] text-muted mt-0.5">Privados — apenas a equipe Kiri tem acesso. Não são publicados nos perfis.</p>
            </div>

            {experiencias.length === 0 ? (
              <p className="text-[14px] text-muted">Nenhum relato recebido ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {experiencias.map((exp) => {
                  const prof = profPublicados.find((p) => p.id === exp.profissional_id);
                  return (
                    <div key={exp.id} className="bg-white border border-linha rounded-[14px] px-4 py-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-[14.5px] font-semibold text-carvao">
                              {prof ? prof.nome : exp.profissional_id}
                            </span>
                            {prof && <span className="text-[12px] text-muted">{prof.titulo_exibicao}</span>}
                          </div>
                          {exp.data_atendimento && (
                            <div className="text-[12px] text-muted mt-0.5">
                              Atendimento: {exp.data_atendimento}
                            </div>
                          )}
                          {exp.comentario && (
                            <p className="text-[13.5px] text-cinza-texto leading-[1.6] mt-2 whitespace-pre-wrap">{exp.comentario}</p>
                          )}
                          <div className="text-[11.5px] text-muted mt-2">
                            Recebido em {new Date(exp.criado_em).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Excluir este relato permanentemente?")) return;
                            setExperiencias((prev) => prev.filter((x) => x.id !== exp.id));
                            await fetch("/api/admin/experiencias", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: exp.id }),
                            });
                          }}
                          className="text-[12.5px] font-semibold text-ferrugem cursor-pointer hover:underline flex-none"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA CONTATOS */}
        {aba === "contatos" && (
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-[18px] font-semibold text-carvao">
              Mensagens de contato <span className="text-[14px] font-sans font-normal text-muted">({contatos.length})</span>
            </h2>

            {contatos.length === 0 ? (
              <p className="text-[14px] text-muted">Nenhuma mensagem recebida ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {contatos.map((c) => (
                  <div key={c.id} className={`rounded-[14px] px-4 py-4 border ${c.lido ? "bg-[#F7FAF7] border-[#B8D8C0]" : "bg-white border-ardosia/25"}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-serif text-[15px] font-semibold text-carvao">{c.nome}</span>
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="text-[13px] text-ardosia no-underline hover:underline">{c.email}</a>
                        )}
                        <span className="text-[12px] text-muted">{new Date(c.criado_em).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-none">
                        <button
                          type="button"
                          onClick={async () => {
                            const novoLido = !c.lido;
                            setContatos((prev) => prev.map((x) => x.id === c.id ? { ...x, lido: novoLido } : x));
                            await fetch("/api/contato", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: c.id, lido: novoLido }),
                            });
                          }}
                          className={`text-[12px] font-semibold cursor-pointer whitespace-nowrap ${c.lido ? "text-[#2E7D4F]" : "text-ardosia"}`}
                        >
                          {c.lido ? "✓ Respondido" : "Marcar como respondido"}
                        </button>
                        {c.lido && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm("Excluir esta mensagem?")) return;
                              setContatos((prev) => prev.filter((x) => x.id !== c.id));
                              await fetch("/api/contato", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: c.id }),
                              });
                            }}
                            className="text-[12px] font-medium text-muted hover:text-ferrugem cursor-pointer whitespace-nowrap transition-colors"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                    {c.topico && (
                      <span className="inline-block mb-1.5 text-[11px] font-semibold text-ambar-texto bg-[#FFF8ED] border border-[#E0A55E]/30 px-2 py-0.5 rounded-full">{c.topico}</span>
                    )}
                    <p className="text-[14px] text-carvao-sutil leading-[1.6] whitespace-pre-wrap">{c.mensagem}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA INSTITUIÇÕES */}
        {aba === "instituicoes" && (
          <div className="flex flex-col gap-6">

            {/* SIGLAS DETECTADAS */}
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="font-serif text-[19px] font-semibold text-carvao mb-1">Siglas detectadas nos perfis</h2>
                <p className="text-[13px] text-muted leading-[1.5]">
                  {detectedSiglas.size} siglas encontradas automaticamente.{" "}
                  {[...detectedSiglas.entries()].filter(([s, e]) => !instituicoes.find(i => i.sigla === s)?.nome_extenso && !e.nomeExterno).length > 0
                    ? <span className="text-[#BE8A3E] font-medium">{[...detectedSiglas.entries()].filter(([s, e]) => !instituicoes.find(i => i.sigla === s)?.nome_extenso && !e.nomeExterno).length} ainda sem nome por extenso.</span>
                    : <span className="text-[#2E7D4F] font-medium">✓ Todas com nome por extenso.</span>
                  }
                </p>
              </div>

              {detectedSiglas.size > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-[100px_1fr_auto] gap-x-3 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted border-b border-linha">
                    <span>Sigla</span><span>Nome por extenso</span><span></span>
                  </div>
                  {[...detectedSiglas.entries()]
                    .sort((a, b) => {
                      // Ordem: sem nome > tem sugestão > salvo no DB
                      const score = ([sigla, e]: [string, { nomeExterno?: string }]) => {
                        if (instituicoes.find(i => i.sigla === sigla)?.nome_extenso) return 2;
                        if (e.nomeExterno) return 1;
                        return 0;
                      };
                      const diff = score(a) - score(b);
                      if (diff !== 0) return diff;
                      return a[0].localeCompare(b[0]);
                    })
                    .map(([sigla, entry]) => {
                      const saved = instituicoes.find(i => i.sigla === sigla);
                      const isMapped = !!saved?.nome_extenso;
                      // Nome por extenso: DB salvo > detectado no próprio perfil > vazio
                      const valorAtual = instEdits[sigla] ?? saved?.nome_extenso ?? entry.nomeExterno ?? "";
                      return (
                        <div key={sigla} className={`grid grid-cols-[100px_1fr_auto] gap-x-3 items-center px-3 py-2 rounded-[10px] border ${
                          isMapped ? "bg-[#F7FAF7] border-[#B8D8C0]" : entry.nomeExterno ? "bg-[#FAFFF8] border-[#C8DEC8]" : "bg-white border-linha"
                        }`}>
                          <div>
                            <div className="text-[13px] font-semibold text-carvao font-mono">{sigla}</div>
                            <div className="text-[11px] text-muted leading-[1.3] mt-0.5">{entry.profNames.join(", ")}</div>
                          </div>
                          <input
                            type="text"
                            value={valorAtual}
                            onChange={(e) => setInstEdits((prev) => ({ ...prev, [sigla]: e.target.value }))}
                            placeholder="Nome por extenso"
                            className="border border-linha rounded-[8px] px-2.5 py-1.5 text-[13px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
                          />
                          <SalvarInstBtn
                            sigla={sigla}
                            valor={valorAtual}
                            onSalvo={(s, nome) => setInstituicoes((prev) => {
                              const exists = prev.some(x => x.sigla === s);
                              if (exists) return prev.map(x => x.sigla === s ? { ...x, nome_extenso: nome || null } : x);
                              return [...prev, { sigla: s, nome_extenso: nome || null }];
                            })}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* TODAS AS INSTITUIÇÕES CITADAS */}
            {(() => {
              const siglasMap: Record<string, string> = {};
              for (const inst of instituicoes) {
                if (inst.nome_extenso) siglasMap[inst.sigla.toUpperCase()] = inst.nome_extenso;
              }

              const naoEhInstEnsino = (s: string) =>
                /^(conselho|crf|cfm|crm|cfp|crp|cff|crefito|coffito|coren|cfn|crbm|cro|cfo)/i.test(s);

              function extrairInstituicao(campo: string): string | null {
                const partes = campo.split(" — ").map(p => p.trim()).filter(Boolean);
                const isAnoOuStatus = (s: string) =>
                  /^\d{4}(-\d{4})?$/.test(s) || /^(atual|em andamento)/i.test(s);
                if (partes.length >= 3) {
                  const inst = partes[partes.length - 2];
                  if (!inst || inst.length < 3 || naoEhInstEnsino(inst)) return null;
                  return inst;
                }
                if (partes.length === 2) {
                  if (isAnoOuStatus(partes[1])) return null;
                  return partes[1].length >= 3 ? partes[1] : null;
                }
                if (partes.length === 1) {
                  const p = partes[0];
                  if (/\([A-Za-z]{2,12}\)/.test(p)) return p;
                  if (/^(universidade|faculdade|instituto|centro|escola|hospital|pontifícia|fundação|conselho)/i.test(p)) return p;
                  return null;
                }
                return null;
              }

              function resolverSigla(inst: string): string {
                if (/^[A-Z]{2,12}$/.test(inst)) {
                  const nome = siglasMap[inst];
                  return nome ? `${nome} (${inst})` : inst;
                }
                if (/^[A-Za-z]{2,12}$/.test(inst) && !inst.includes(" ")) {
                  const nome = siglasMap[inst.toUpperCase()];
                  return nome ? `${nome} (${inst.toUpperCase()})` : inst;
                }
                return inst;
              }

              function chaveSemSigla(s: string) {
                return s.replace(/\s*\([A-Za-z]{2,12}\)\s*$/, "").toLowerCase().trim();
              }

              // Entrada precisa de atenção: parece sigla (sem espaços, ≤15 chars) mas não foi expandida
              function precisaAtencao(nome: string): boolean {
                return /^[A-Za-z]{2,15}$/.test(nome);
              }

              const entradasComNome: { nome: string; nomes: string[] }[] = [];
              for (const p of profissionais) {
                if (!p.formacao) continue;
                for (const f of p.formacao) {
                  if (!f.instituicao_ano) continue;
                  const instRaw = extrairInstituicao(f.instituicao_ano);
                  if (!instRaw) continue;
                  const inst = resolverSigla(instRaw);
                  const chave = chaveSemSigla(inst);
                  const existe = entradasComNome.find(e => chaveSemSigla(e.nome) === chave);
                  if (existe) {
                    if (inst.length > existe.nome.length) existe.nome = inst;
                    if (!existe.nomes.includes(p.nome)) existe.nomes.push(p.nome);
                  } else {
                    entradasComNome.push({ nome: inst, nomes: [p.nome] });
                  }
                }
              }
              entradasComNome.sort((a, b) => {
                const aAtencao = precisaAtencao(a.nome);
                const bAtencao = precisaAtencao(b.nome);
                if (aAtencao !== bAtencao) return aAtencao ? -1 : 1;
                return b.nomes.length - a.nomes.length || a.nome.localeCompare(b.nome);
              });

              function formatarInst(nome: string) {
                return titleCasePT(nome)
                  .replace(/\(([^)]+)\)/g, (_, s) => `(${s.toUpperCase()})`)
                  .replace(/\/([a-záéíóúâêîôûãõàü])/gi, (_, c) => `/${c.toUpperCase()}`);
              }

              const busca = instBusca.trim().toLowerCase();
              const visiveis = busca
                ? entradasComNome.filter(e =>
                    e.nome.toLowerCase().includes(busca) ||
                    e.nomes.some(n => n.toLowerCase().includes(busca))
                  )
                : entradasComNome;

              const atencaoCount = entradasComNome.filter(e => precisaAtencao(e.nome)).length;

              return (
                <div className="flex flex-col gap-3 pt-4 border-t border-linha">
                  <div>
                    <div className="text-[13px] font-semibold text-carvao mb-0.5">Todas as instituições citadas na rede</div>
                    <p className="text-[12px] text-muted">
                      {entradasComNome.length} entradas encontradas.{" "}
                      {atencaoCount > 0 && <span className="text-[#BE8A3E] font-medium">{atencaoCount} parecem siglas não expandidas — verifique.</span>}
                    </p>
                  </div>
                  <input
                    type="text"
                    value={instBusca}
                    onChange={e => setInstBusca(e.target.value)}
                    placeholder="Buscar instituição ou profissional…"
                    className="border border-linha rounded-[10px] px-3 py-2 text-[13px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted max-w-sm"
                  />
                  <div className="flex flex-col gap-1.5">
                    <div className="grid grid-cols-[2fr_1fr] gap-x-3 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted border-b border-linha">
                      <span>Instituição</span>
                      <span>Profissionais</span>
                    </div>
                    {visiveis.length === 0 && (
                      <p className="text-[13px] text-muted px-3 py-2">Nenhuma instituição encontrada.</p>
                    )}
                    {visiveis.map((e) => {
                      const atencao = precisaAtencao(e.nome);
                      return (
                        <div key={e.nome} className={`grid grid-cols-[2fr_1fr] gap-x-3 items-start px-3 py-2 rounded-[10px] border ${
                          atencao ? "bg-[#FFF7ED] border-[#E8C88A]" : "bg-white border-linha"
                        }`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] text-carvao">{formatarInst(e.nome)}</span>
                            {atencao && <span className="text-[10px] font-semibold text-[#BE8A3E] uppercase tracking-wide">verificar</span>}
                          </div>
                          <span className="text-[12px] text-muted leading-[1.5]">{e.nomes.join(", ")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
