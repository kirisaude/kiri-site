"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { PROFISSOES_ORDENADAS } from "@/types";
import { titleCasePT } from "@/lib/titleCase";

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

interface Reporte {
  id: string;
  criado_em: string;
  profissional_id: string;
  tipo_problema: string;
  descricao: string | null;
}

type Aba = "inscricoes" | "encaminhamentos" | "reportes" | "profissionais";

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
    <div className={`border rounded-[14px] overflow-hidden ${encaminhado ? "bg-[#F7FAF7] border-[#B8D8C0] opacity-70" : "bg-white border-borda-azulada"}`}>
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
            <ObsTopicos obs={e.observacoes} />
          </div>

          {/* Botão de resposta */}
          {!encaminhado && (
            <div className="mt-4">
              {temWa && e.profissional_solicitado && prof ? (
                <a
                  href={buildWaFamilia(e.contato, e.nome_responsavel, prof.card_token)}
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
                  {e.profissional_solicitado && prof && (
                    <>
                      {" "}· Link do card:{" "}
                      <Link href={`/card/${prof.card_token}`} className="underline text-ardosia" target="_blank">
                        /card/{prof.card_token.slice(0, 8)}…
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

function CardGeral({ e, expandido, onToggle, onExcluir, onResolver }: {
  e: Encaminhamento;
  expandido: boolean;
  onToggle: () => void;
  onExcluir: (id: string) => void;
  onResolver: (id: string, novoStatus: string) => void;
}) {
  const respondido = e.status === "respondido";
  const [profSelecionados, setProfSelecionados] = useState<string[]>([]);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [filtroProf, setFiltroProf] = useState<string | null>(null);
  const [filtroConvenio, setFiltroConvenio] = useState<"todos" | "convenio" | "particular">("todos");

  // Extrair dados estruturados do observacoes
  const faixaEtaria = e.observacoes?.match(/Faixa etária: ([^—]+)/)?.[1].trim() ?? null;

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
    const lista = profs.map((p, i) => {
      const wa = p.whatsapp_agendamento
        ? `\nWhatsApp: wa.me/${p.whatsapp_agendamento.replace(/\D/g, "").replace(/^(?!55)/, "55")}`
        : "";
      return `${i + 1}. ${p.nome} — ${p.titulo_exibicao} · ${p.cidade}${wa}`;
    }).join("\n\n");
    return `Olá, ${primeiro}! Aqui é a equipe Kiri.\n\nAnalisamos seu pedido e selecionamos ${profs.length} profissional${profs.length > 1 ? "is" : ""} que ${profs.length > 1 ? "podem" : "pode"} ajudar:\n\n${lista}\n\nFique à vontade para entrar em contato com qualquer um deles para agendar. Qualquer dúvida, estamos aqui!`;
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
    <div className={`border rounded-[14px] overflow-hidden ${respondido ? "bg-[#F7FAF7] border-[#B8D8C0] opacity-70" : "bg-white border-linha"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-[15px] font-semibold text-carvao">{e.nome_responsavel}</span>
            {respondido ? (
              <span className="text-[11px] font-semibold text-[#2E7D4F] bg-[#E8F5EC] border border-[#B8D8C0] px-2 py-0.5 rounded-[6px]">
                respondido
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-ferrugem bg-wash-quente border border-borda-quente px-2 py-0.5 rounded-[6px]">
                Busca geral
              </span>
            )}
          </div>
          <div className="text-[13px] text-cinza-texto mt-0.5">
            {e.contato} · {new Date(e.criado_em).toLocaleDateString("pt-BR")}
          </div>
          {e.observacoes && !respondido && (
            <div className="text-[12.5px] text-muted mt-0.5 truncate max-w-[320px]">
              {parseObs(e.observacoes).demanda ?? e.observacoes}
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

          {!respondido && (
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
                <div className="flex gap-1.5 mb-3">
                  {(["todos", "convenio", "particular"] as const).map((op) => (
                    <button key={op} type="button" onClick={() => setFiltroConvenio(op)}
                      className={`text-[12px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${filtroConvenio === op ? "bg-carvao text-white border-carvao" : "bg-white text-cinza-texto border-linha"}`}>
                      {op === "todos" ? "Todos" : op === "convenio" ? "Com convênio" : "Particular"}
                    </button>
                  ))}
                </div>

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

          {/* Checkbox respondido */}
          <label className="flex items-center gap-2.5 cursor-pointer mt-3 pt-3.5 border-t border-linha-sutil">
            <input
              type="checkbox"
              checked={respondido}
              onChange={() => onResolver(e.id, respondido ? "pendente" : "respondido")}
              className="w-4 h-4 accent-ardosia-escura cursor-pointer"
            />
            <span className={`text-[13px] font-medium ${respondido ? "text-[#2E7D4F]" : "text-cinza-texto"}`}>
              {respondido ? "Respondido — clique para desfazer" : "Marcar como respondido"}
            </span>
          </label>
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
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [profPublicados, setProfPublicados] = useState<Profissional[]>(
    (data.profissionais as Profissional[]).filter((p) => p.verificado)
  );
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [exportando, setExportando] = useState(false);

  const buscarDados = useCallback(async () => {
    setBuscando(true);
    const [resI, resE, resR] = await Promise.all([
      fetch("/api/admin/inscricoes"),
      fetch("/api/admin/encaminhamentos"),
      fetch("/api/admin/reportes"),
    ]);
    if (resI.ok) setInscricoes(await resI.json());
    if (resE.ok) setEncaminhamentos(await resE.json());
    if (resR.ok) setReportes(await resR.json());
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
    setEncaminhamentos((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    if (status === "respondido") {
      setExpandidos((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
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

  async function excluirReporte(id: string) {
    if (!confirm("Excluir este reporte permanentemente?")) return;
    setReportes((prev) => prev.filter((r) => r.id !== id));
    await fetch("/api/admin/reportes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function exportarPlanilha() {
    setExportando(true);
    const res = await fetch("/api/admin/exportar-planilha", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      alert(`${data.exportados} inscrição(ões) exportada(s) para a planilha.`);
    } else {
      alert(`Erro: ${data.error}`);
    }
    setExportando(false);
  }

  async function excluirProfissional(id: string, nome: string) {
    if (!confirm(`Remover "${nome}" da plataforma? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(id);
    const res = await fetch("/api/admin/profissionais", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setProfPublicados((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Erro ao excluir. Tente novamente.");
    }
    setExcluindo(null);
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

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <KiriLogoCompact height={28} />
        </div>
        <button onClick={buscarDados} className="text-[13px] font-semibold text-ardosia cursor-pointer">
          {buscando ? "Atualizando…" : "↻ Atualizar"}
        </button>
      </header>

      {/* Abas */}
      <div className="border-b border-linha px-6 flex gap-6">
        <button onClick={() => setAba("inscricoes")}
          className={`py-3 text-[14px] font-semibold border-b-2 transition-colors cursor-pointer ${aba === "inscricoes" ? "border-ardosia-escura text-carvao" : "border-transparent text-muted"}`}>
          Profissionais ({pendentes.length})
        </button>
        <button onClick={() => setAba("encaminhamentos")}
          className={`py-3 text-[14px] font-semibold border-b-2 transition-colors cursor-pointer ${aba === "encaminhamentos" ? "border-ardosia-escura text-carvao" : "border-transparent text-muted"}`}>
          Encaminhamentos ({encaminhamentos.length})
        </button>
        <button onClick={() => setAba("reportes")}
          className={`py-3 text-[14px] font-semibold border-b-2 transition-colors cursor-pointer ${aba === "reportes" ? "border-ardosia-escura text-carvao" : "border-transparent text-muted"}`}>
          Reportes {reportes.length > 0 && <span className="ml-1 bg-ferrugem text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">{reportes.length}</span>}
        </button>
        <button onClick={() => setAba("profissionais")}
          className={`py-3 text-[14px] font-semibold border-b-2 transition-colors cursor-pointer ${aba === "profissionais" ? "border-ardosia-escura text-carvao" : "border-transparent text-muted"}`}>
          Plataforma ({profPublicados.length})
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ABA INSCRICOES */}
        {aba === "inscricoes" && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-[18px] font-semibold text-carvao">
                Pendentes <span className="text-[14px] font-sans font-normal text-muted">({pendentes.length})</span>
              </h2>
              <button
                onClick={exportarPlanilha}
                disabled={exportando || inscricoes.length === 0}
                className="text-[12.5px] font-semibold text-ardosia border border-ardosia/30 rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-40"
              >
                {exportando ? "Exportando…" : "↗ Exportar para planilha"}
              </button>
            </div>
            <div>
              {pendentes.length === 0 ? (
                <p className="text-[14px] text-muted">Nenhuma inscrição pendente.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendentes.map((i) => (
                    <div key={i.id} className="bg-white border border-linha rounded-[14px] px-4 py-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-serif text-[15.5px] font-semibold text-carvao">{titleCasePT(i.nome)}</div>
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
                      (p) => p.nome.toLowerCase().trim() === i.nome.toLowerCase().trim()
                    );
                    return (
                      <div key={i.id} className="bg-white border border-linha rounded-[12px] px-4 py-3 flex items-center justify-between gap-3 opacity-70">
                        <div>
                          <div className="text-[14.5px] font-semibold text-carvao">{titleCasePT(i.nome)}</div>
                          <div className="text-[12.5px] text-cinza-texto">{i.profissao}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-ardosia font-semibold">✓ publicado</span>
                          {profMatch && (
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
                <span className="text-[14px] text-muted">
                  ({semProfissional.filter((e) => e.status !== "respondido").length} pendentes)
                </span>
              </div>
              <p className="text-[13px] text-muted mb-4">
                Família sem profissional escolhido. Requer análise antes de responder.
              </p>
              {semProfissional.filter((e) => e.status !== "respondido").length === 0 ? (
                <p className="text-[14px] text-muted">Nenhuma busca pendente.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {semProfissional
                    .filter((e) => e.status !== "respondido")
                    .map((e) => (
                      <CardGeral
                        key={e.id}
                        e={e}
                        expandido={expandidos.has(e.id)}
                        onToggle={() => toggleExpandido(e.id)}
                        onExcluir={excluirEncaminhamento}
                        onResolver={atualizarEncaminhamento}
                      />
                    ))}
                </div>
              )}

              {/* Respondidos */}
              {semProfissional.filter((e) => e.status === "respondido").length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] font-semibold text-[#2E7D4F] tracking-wide">Respondidos</span>
                    <span className="text-[12px] text-muted">
                      ({semProfissional.filter((e) => e.status === "respondido").length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {semProfissional
                      .filter((e) => e.status === "respondido")
                      .map((e) => (
                        <CardGeral
                          key={e.id}
                          e={e}
                          expandido={expandidos.has(e.id)}
                          onToggle={() => toggleExpandido(e.id)}
                          onExcluir={excluirEncaminhamento}
                          onResolver={atualizarEncaminhamento}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>

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

        {/* ABA PROFISSIONAIS PUBLICADOS */}
        {aba === "profissionais" && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-serif text-[18px] font-semibold text-carvao mb-1">
                Profissionais na plataforma
              </h2>
              <p className="text-[13px] text-muted mb-1">
                {profPublicados.length} profissional{profPublicados.length !== 1 ? "is" : ""} publicado{profPublicados.length !== 1 ? "s" : ""}. Exclusões entram em vigor após ~1 min (rebuild automático).
              </p>
            </div>

            {PROFISSOES_ORDENADAS.map((prof) => {
              const grupo = profPublicados.filter((p) => p.profissao === prof);
              if (grupo.length === 0) return null;
              return (
                <div key={prof}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-[14px] font-bold tracking-[0.04em] uppercase text-muted">{prof}</h3>
                    <span className="text-[13px] text-muted">({grupo.length})</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {grupo.map((p) => (
                      <div key={p.id} className={`border rounded-[13px] px-4 py-3 flex items-center justify-between gap-3 ${p.oculto ? "bg-[#FFF8F0] border-[#E8C88A]" : "bg-white border-linha"}`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-[15px] font-semibold text-carvao leading-tight">{titleCasePT(p.nome)}</span>
                            <span className="text-[11px] text-muted font-mono">{p.id}</span>
                            {p.oculto && (
                              <span className="text-[11px] font-semibold text-[#BE8A3E] bg-[#FFF0D0] border border-[#E8C88A] px-2 py-0.5 rounded-[6px]">oculto</span>
                            )}
                          </div>
                          <div className="text-[12.5px] text-cinza-texto mt-0.5 flex gap-2 flex-wrap">
                            <span>{p.cidade}</span>
                            <span>·</span>
                            <span>{p.modalidade}</span>
                            {p.verificacao_data && (
                              <>
                                <span>·</span>
                                <span>verificado em {p.verificacao_data}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-none">
                          <Link
                            href={`/profissional/${p.id}`}
                            target="_blank"
                            className="text-[12.5px] font-medium text-ardosia no-underline"
                          >
                            Ver ↗
                          </Link>
                          <Link
                            href={`/admin/profissionais/${p.id}`}
                            className="text-[12.5px] font-semibold text-carvao bg-wash-quente border border-borda-quente rounded-[8px] px-3 py-1.5 no-underline"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={excluindo === p.id}
                            onClick={() => excluirProfissional(p.id, p.nome)}
                            className="text-[12.5px] font-semibold text-white bg-ferrugem rounded-[8px] px-3 py-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {excluindo === p.id ? "Removendo…" : "Excluir"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {profPublicados.length === 0 && (
              <p className="text-[14px] text-muted">Nenhum profissional publicado ainda.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
