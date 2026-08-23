"use client";

import { useState, useEffect, useCallback } from "react";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────── */

type Contato = {
  id: string;
  nome: string;
  email: string;
  cidade: string | null;
  enviado_em: string | null;
  criado_em: string;
};

type ContatoLI = {
  id: string;
  nome: string;
  perfil_url: string;
  cidade: string | null;
  status: "pendente" | "conexao_enviada" | "conectado" | "mensagem_enviada";
  criado_em: string;
};

type Lista = "pediatras" | "profissionais" | "linkedin";
type EnvioStatus = "idle" | "enviando" | "ok" | "erro";

/* ─── Constants ─────────────────────────────────────────────────────── */

const ASSUNTO_PADRAO: Record<"pediatras" | "profissionais", string> = {
  pediatras: "Kiri Saúde — uma ferramenta para encaminhamentos em neurodesenvolvimento infantil",
  profissionais: "Kiri Saúde — faça parte da nossa rede de profissionais verificados",
};

const CORPO_PADRAO: Record<"pediatras" | "profissionais", string> = {
  pediatras: `<p>Olá, {nome},</p>

<p>Me chamo Iohana Marques, sou médica e residente de psiquiatria pela UNIFESP e fundei a <strong>Kiri Saúde</strong> — uma plataforma de curadoria que conecta famílias a profissionais que atuam na área de neurodesenvolvimento infantil.</p>

<p>A ideia surgiu de uma dificuldade que conheço bem: quando a gente identifica um sinal de atenção na consulta e precisa indicar alguém com segurança — sem depender de indicação informal ou de diretórios genéricos sem verificação.</p>

<p>Na Kiri, cada profissional passa por conferência dos documentos que comprovam suas formações, além de verificação do registro no conselho, antes de serem publicados na plataforma. A busca cobre 11 especialidades (psicólogo, fonoaudiólogo, terapeuta ocupacional, neuropediatra, neuropsicólogo e outras) e reflete adequação clínica, não ranking pago.</p>

<p>Para as famílias que você atende e precisam desse encaminhamento, o acesso é gratuito e sem cadastro em <a href="https://kirisaude.com.br">kirisaude.com.br</a>.</p>

<p>Envio em anexo dois materiais curtos — um para profissionais e um para famílias, caso queira compartilhar.</p>

<p>Qualquer dúvida, fico à disposição.</p>

<p>Atenciosamente,<br/>
<strong>Iohana Marques</strong><br/>
CRM SP 255630<br/>
Médica e residente de psiquiatria — UNIFESP<br/>
Fundadora — Kiri Saúde<br/>
contato@kirisaude.com.br</p>`,

  profissionais: `<p>Olá, {nome},</p>

<p>Me chamo Iohana Marques, sou médica e residente de psiquiatria pela UNIFESP e fundei a <strong>Kiri Saúde</strong> — uma plataforma de curadoria que conecta famílias a profissionais verificados na área de neurodesenvolvimento infantil.</p>

<p>Estamos construindo uma rede de profissionais com formação comprovada que atuam com TEA, TDAH, atraso de desenvolvimento e condições relacionadas. Cada profissional passa por verificação de documentos e registro no conselho antes de ser publicado.</p>

<p>Gostaria de convidar você a fazer parte da Kiri. O processo é simples: preencher um formulário de inscrição e enviar a documentação que comprova sua formação.</p>

<p>Envio em anexo mais informações sobre a plataforma e o termo de adesão.</p>

<p>Qualquer dúvida, fico à disposição.</p>

<p>Atenciosamente,<br/>
<strong>Iohana Marques</strong><br/>
CRM SP 255630<br/>
Médica e residente de psiquiatria — UNIFESP<br/>
Fundadora — Kiri Saúde<br/>
contato@kirisaude.com.br</p>`,
};

const MSG_CONEXAO_PADRAO = `Olá, {nome}! Sou Iohana Marques, residente de psiquiatria na UNIFESP. Fundei a Kiri Saúde — plataforma de curadoria de profissionais em neurodesenvolvimento infantil. Gostaria de conectar e compartilhar mais sobre o projeto.`;

const MSG_POS_CONEXAO_PADRAO = `Olá, {nome}, obrigada pela conexão!

A Kiri Saúde é uma plataforma gratuita de curadoria que conecta famílias a profissionais com formação verificada em neurodesenvolvimento infantil — TEA, TDAH, atraso de desenvolvimento e condições relacionadas.

Cada profissional tem documentação e registro no conselho conferidos antes de aparecer na plataforma. A busca é por adequação clínica, não ranking pago.

Gostaríamos de convidar você a fazer parte da rede. O processo é simples: um formulário de inscrição e envio de documentação.

Posso te contar mais?

Iohana Marques — kirisaude.com.br`;

const ANEXOS_INFO: Record<"pediatras" | "profissionais", Array<{ nome: string; url: string }>> = {
  pediatras: [
    { nome: "Kiri Saúde — para profissionais.pdf", url: "/kiri-profissionais.pdf" },
    { nome: "Kiri Saúde — para famílias.pdf", url: "/kiri-familias.pdf" },
  ],
  profissionais: [
    { nome: "Kiri Saúde — para profissionais.pdf", url: "/kiri-profissionais.pdf" },
    { nome: "Termo de adesão — Kiri Saúde.pdf", url: "/termo-de-adesao-kiri.pdf" },
  ],
};

const STATUS_LI_LABEL: Record<ContatoLI["status"], string> = {
  pendente: "Pendente",
  conexao_enviada: "Conexão enviada",
  conectado: "Conectado",
  mensagem_enviada: "Mensagem enviada",
};

const STATUS_LI_COR: Record<ContatoLI["status"], string> = {
  pendente: "text-muted",
  conexao_enviada: "text-amber-600",
  conectado: "text-ardosia",
  mensagem_enviada: "text-verde-confirmacao",
};

/* ─── Helpers ───────────────────────────────────────────────────────── */

function toTitleCase(str: string) {
  return str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function personalizar(texto: string, nome: string) {
  return texto.replace(/\{nome\}/g, nome);
}

/* ─── Hook: contatos de email ───────────────────────────────────────── */

function useContatos(lista: "pediatras" | "profissionais") {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    fetch(`/api/admin/divulgacao?lista=${lista}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setContatos(Array.isArray(d) ? d : []); setCarregando(false); })
      .catch(() => setCarregando(false));
  }, [lista]);

  return { contatos, setContatos, carregando };
}

/* ─── Hook: contatos LinkedIn ───────────────────────────────────────── */

function useContatosLI() {
  const [contatos, setContatos] = useState<ContatoLI[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(() => {
    setCarregando(true);
    fetch("/api/admin/divulgacao?lista=linkedin", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setContatos(Array.isArray(d) ? d : []); setCarregando(false); })
      .catch(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return { contatos, setContatos, carregando };
}

/* ─── Seção LinkedIn ─────────────────────────────────────────────────── */

function SecaoLinkedIn() {
  const { contatos, setContatos, carregando } = useContatosLI();
  const [novoNome, setNovoNome] = useState("");
  const [novoUrl, setNovoUrl] = useState("");
  const [novaCidade, setNovaCidade] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [erroAdd, setErroAdd] = useState("");
  const [msgConexao, setMsgConexao] = useState(MSG_CONEXAO_PADRAO);
  const [msgPosConexao, setMsgPosConexao] = useState(MSG_POS_CONEXAO_PADRAO);
  const [abaLI, setAbaLI] = useState<"lista" | "templates">("lista");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErroAdd("");
    setAdicionando(true);
    const res = await fetch("/api/admin/divulgacao?lista=linkedin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        nome: toTitleCase(novoNome.trim()),
        perfil_url: novoUrl.trim(),
        cidade: novaCidade.trim() || null,
      }),
    });
    const d = await res.json();
    setAdicionando(false);
    if (res.ok) {
      setContatos((prev) => [...prev, d]);
      setNovoNome(""); setNovoUrl(""); setNovaCidade("");
    } else {
      setErroAdd(d.error ?? "Erro ao adicionar");
    }
  }

  async function remover(id: string) {
    if (!confirm("Remover este contato?")) return;
    await fetch("/api/admin/divulgacao?lista=linkedin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  async function atualizarStatus(id: string, status: ContatoLI["status"]) {
    setContatos((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    await fetch("/api/admin/divulgacao?lista=linkedin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }

  function copiar(texto: string, key: string) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(key);
      setTimeout(() => setCopiado(null), 2000);
    });
  }

  const pendentes = contatos.filter((c) => c.status === "pendente");
  const emAndamento = contatos.filter((c) => c.status !== "pendente" && c.status !== "mensagem_enviada");
  const concluidos = contatos.filter((c) => c.status === "mensagem_enviada");

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-abas */}
      <div className="flex gap-1 bg-[#EEE8DE] rounded-[10px] p-1">
        {(["lista", "templates"] as const).map((a) => (
          <button key={a} onClick={() => setAbaLI(a)}
            className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[8px] cursor-pointer transition-colors ${abaLI === a ? "bg-white text-carvao shadow-sm" : "text-muted hover:text-carvao"}`}>
            {a === "lista" ? "Lista de contatos" : "Templates de mensagem"}
          </button>
        ))}
      </div>

      {abaLI === "templates" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] font-semibold text-carvao">Pedido de conexão <span className="font-normal text-muted">(máx. 300 chars)</span></label>
              <span className={`text-[11.5px] ${msgConexao.length > 300 ? "text-ferrugem font-semibold" : "text-muted"}`}>{msgConexao.length}/300</span>
            </div>
            <textarea value={msgConexao} onChange={(e) => setMsgConexao(e.target.value)} rows={4}
              className="border border-linha rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-ardosia resize-y" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-carvao">Mensagem após conectar</label>
            <textarea value={msgPosConexao} onChange={(e) => setMsgPosConexao(e.target.value)} rows={12}
              className="border border-linha rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-ardosia resize-y" />
          </div>
          <p className="text-[12px] text-muted">Use <strong>{"{nome}"}</strong> para personalizar com o nome do contato.</p>
        </div>
      )}

      {abaLI === "lista" && (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", valor: contatos.length },
              { label: "Pendentes", valor: pendentes.length },
              { label: "Em andamento", valor: emAndamento.length },
              { label: "Concluídos", valor: concluidos.length },
            ].map(({ label, valor }) => (
              <div key={label} className="bg-white border border-linha rounded-[12px] px-3 py-2.5 text-center">
                <div className="font-serif text-[20px] font-semibold text-carvao">{valor}</div>
                <div className="text-[11px] text-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Adicionar */}
          <form onSubmit={adicionar} className="bg-white border border-linha rounded-[14px] p-4 flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-carvao">Adicionar contato LinkedIn</p>
            <div className="flex gap-2 flex-wrap">
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                onBlur={(e) => setNovoNome(toTitleCase(e.target.value.trim()))}
                placeholder="Nome completo" required
                className="flex-[2] min-w-[140px] border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
              <input value={novoUrl} onChange={(e) => setNovoUrl(e.target.value)}
                placeholder="linkedin.com/in/perfil" required
                className="flex-[3] min-w-[180px] border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
              <input value={novaCidade} onChange={(e) => setNovaCidade(e.target.value)}
                placeholder="Cidade"
                className="flex-1 min-w-[100px] border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
              <button type="submit" disabled={adicionando}
                className="bg-ardosia-escura text-white text-[13px] font-semibold px-4 rounded-[9px] cursor-pointer disabled:opacity-50 whitespace-nowrap">
                {adicionando ? "…" : "+ Adicionar"}
              </button>
            </div>
            {erroAdd && <p className="text-[12px] text-ferrugem">{erroAdd}</p>}
          </form>

          {/* Lista */}
          {carregando ? (
            <p className="text-[13px] text-muted">Carregando…</p>
          ) : contatos.length === 0 ? (
            <p className="text-[13px] text-muted text-center py-6">Nenhum contato ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {contatos.map((c) => (
                <div key={c.id} className="bg-white border border-linha rounded-[11px] px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-carvao">{c.nome}</p>
                        {c.cidade && <span className="text-[11px] text-muted">· {c.cidade}</span>}
                        <span className={`text-[11px] font-semibold ${STATUS_LI_COR[c.status]}`}>
                          · {STATUS_LI_LABEL[c.status]}
                        </span>
                      </div>
                      <a href={c.perfil_url.startsWith("http") ? c.perfil_url : `https://${c.perfil_url}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[11.5px] text-ardosia hover:underline no-underline">
                        {c.perfil_url} ↗
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 flex-none">
                      <button onClick={() => setExpandido(expandido === c.id ? null : c.id)}
                        className="text-[11.5px] text-ardosia border border-ardosia/30 rounded-[6px] px-2.5 py-0.5 hover:bg-[#EEF2F4] transition-colors cursor-pointer">
                        {expandido === c.id ? "Fechar" : "Mensagens"}
                      </button>
                      <button onClick={() => remover(c.id)}
                        className="text-[11px] text-muted hover:text-ferrugem transition-colors cursor-pointer">✕</button>
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex gap-1 flex-wrap">
                    {(["pendente", "conexao_enviada", "conectado", "mensagem_enviada"] as const).map((s) => (
                      <button key={s} onClick={() => atualizarStatus(c.id, s)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${c.status === s ? "bg-ardosia-escura text-white border-ardosia-escura" : "text-muted border-linha hover:border-ardosia/40 hover:text-carvao"}`}>
                        {STATUS_LI_LABEL[s]}
                      </button>
                    ))}
                  </div>

                  {/* Mensagens expandidas */}
                  {expandido === c.id && (
                    <div className="flex flex-col gap-3 pt-1 border-t border-linha mt-1">
                      {/* Pedido de conexão */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-semibold text-carvao">Pedido de conexão</span>
                          <button onClick={() => copiar(personalizar(msgConexao, c.nome), `conexao-${c.id}`)}
                            className="text-[11px] text-ardosia border border-ardosia/30 rounded-[6px] px-2.5 py-0.5 hover:bg-[#EEF2F4] transition-colors cursor-pointer">
                            {copiado === `conexao-${c.id}` ? "✓ Copiado!" : "Copiar"}
                          </button>
                        </div>
                        <p className="text-[12px] text-muted bg-[#F5EFE6] rounded-[8px] px-3 py-2 whitespace-pre-wrap leading-relaxed">
                          {personalizar(msgConexao, c.nome)}
                        </p>
                      </div>
                      {/* Mensagem pós-conexão */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-semibold text-carvao">Mensagem após conectar</span>
                          <button onClick={() => copiar(personalizar(msgPosConexao, c.nome), `pos-${c.id}`)}
                            className="text-[11px] text-ardosia border border-ardosia/30 rounded-[6px] px-2.5 py-0.5 hover:bg-[#EEF2F4] transition-colors cursor-pointer">
                            {copiado === `pos-${c.id}` ? "✓ Copiado!" : "Copiar"}
                          </button>
                        </div>
                        <p className="text-[12px] text-muted bg-[#F5EFE6] rounded-[8px] px-3 py-2 whitespace-pre-wrap leading-relaxed">
                          {personalizar(msgPosConexao, c.nome)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */

export default function DivulgacaoPage() {
  const [lista, setLista] = useState<Lista>("pediatras");
  const [aba, setAba] = useState<"contatos" | "template">("contatos");

  const emailLista = lista === "linkedin" ? "pediatras" : lista as "pediatras" | "profissionais";
  const { contatos, setContatos, carregando } = useContatos(emailLista);

  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaCidade, setNovaCidade] = useState("");
  const [adicionando, setAdicionando] = useState(false);
  const [erroAdd, setErroAdd] = useState("");

  const [assunto, setAssunto] = useState(ASSUNTO_PADRAO);
  const [corpo, setCorpo] = useState(CORPO_PADRAO);

  const [envioStatus, setEnvioStatus] = useState<Record<string, EnvioStatus>>({});
  const [envioErros, setEnvioErros] = useState<Record<string, string>>({});
  const [enviandoTodos, setEnviandoTodos] = useState(false);
  const [loteProgresso, setLoteProgresso] = useState<{ ok: number; erro: number; total: number } | null>(null);

  useEffect(() => {
    setEnvioStatus({}); setEnvioErros({}); setLoteProgresso(null);
    setErroAdd(""); setNovoNome(""); setNovoEmail(""); setNovaCidade("");
  }, [lista]);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErroAdd("");
    setAdicionando(true);
    const l = lista as "pediatras" | "profissionais";
    const res = await fetch(`/api/admin/divulgacao?lista=${l}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nome: toTitleCase(novoNome.trim()), email: novoEmail, cidade: novaCidade.trim() || null }),
    });
    const d = await res.json();
    setAdicionando(false);
    if (res.ok) { setContatos((prev) => [...prev, d]); setNovoNome(""); setNovoEmail(""); setNovaCidade(""); }
    else setErroAdd(d.error ?? "Erro ao adicionar");
  }

  async function remover(id: string) {
    if (!confirm("Remover este contato?")) return;
    await fetch(`/api/admin/divulgacao?lista=${lista}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ id }),
    });
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  async function enviarPara(contato: Contato): Promise<boolean> {
    const l = lista as "pediatras" | "profissionais";
    setEnvioStatus((s) => ({ ...s, [contato.id]: "enviando" }));
    const res = await fetch("/api/admin/divulgacao/enviar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nome: contato.nome, email: contato.email, assunto: assunto[l], corpo: corpo[l], lista: l }),
    });
    if (res.ok) {
      const agora = new Date().toISOString();
      setEnvioStatus((s) => ({ ...s, [contato.id]: "ok" }));
      setContatos((prev) => prev.map((c) => c.id === contato.id ? { ...c, enviado_em: agora } : c));
      fetch(`/api/admin/divulgacao?lista=${l}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ id: contato.id, enviado_em: agora }),
      }).catch(() => {});
      return true;
    } else {
      const d = await res.json().catch(() => ({}));
      setEnvioStatus((s) => ({ ...s, [contato.id]: "erro" }));
      setEnvioErros((er) => ({ ...er, [contato.id]: d.error ?? `HTTP ${res.status}` }));
      return false;
    }
  }

  async function enviarTodosPendentes() {
    const pendentes = contatos.filter((c) => !c.enviado_em);
    if (pendentes.length === 0) return;
    if (!confirm(`Enviar e-mail para ${pendentes.length} contato(s) pendentes?`)) return;
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
  const l = lista as "pediatras" | "profissionais";
  const anexos = lista !== "linkedin" ? ANEXOS_INFO[l] : [];

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <KiriLogoCompact height={26} />
        <Link href="/admin" className="text-[13px] text-muted hover:text-carvao no-underline transition-colors ml-2">← Admin</Link>
        <span className="text-[13px] font-semibold text-carvao ml-1">/ Divulgação</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Seletor de lista */}
        <div className="flex gap-1 bg-[#EEE8DE] rounded-[10px] p-1">
          {(["pediatras", "profissionais", "linkedin"] as const).map((l) => (
            <button key={l} onClick={() => setLista(l)}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[8px] cursor-pointer transition-colors ${lista === l ? "bg-white text-carvao shadow-sm" : "text-muted hover:text-carvao"}`}>
              {l === "pediatras" ? "Pediatras" : l === "profissionais" ? "Profissionais" : "LinkedIn"}
            </button>
          ))}
        </div>

        {/* LinkedIn section */}
        {lista === "linkedin" && <SecaoLinkedIn />}

        {/* Email sections */}
        {lista !== "linkedin" && (
          <>
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
              {(["contatos", "template"] as const).map((a) => (
                <button key={a} onClick={() => setAba(a)}
                  className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[8px] cursor-pointer transition-colors ${aba === a ? "bg-white text-carvao shadow-sm" : "text-muted hover:text-carvao"}`}>
                  {a === "contatos" ? "Lista de contatos" : "Template de e-mail"}
                </button>
              ))}
            </div>

            {aba === "contatos" && (
              <>
                {/* Arquivos em anexo */}
                <div className="bg-white border border-linha rounded-[14px] p-4 flex flex-col gap-2.5">
                  <p className="text-[12.5px] font-semibold text-carvao">Arquivos enviados como anexo</p>
                  <div className="flex flex-col gap-1.5">
                    {anexos.map((a) => (
                      <div key={a.url} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[15px]">📎</span>
                          <span className="text-[12.5px] text-carvao truncate">{a.nome}</span>
                        </div>
                        <div className="flex gap-2 flex-none">
                          <a href={a.url} target="_blank" rel="noopener noreferrer"
                            className="text-[11.5px] text-ardosia border border-ardosia/30 rounded-[6px] px-2.5 py-0.5 hover:bg-[#EEF2F4] transition-colors no-underline">
                            Ver ↗
                          </a>
                          <a href={a.url} download
                            className="text-[11.5px] text-ardosia border border-ardosia/30 rounded-[6px] px-2.5 py-0.5 hover:bg-[#EEF2F4] transition-colors no-underline">
                            ↓ Baixar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adicionar */}
                <form onSubmit={adicionar} className="bg-white border border-linha rounded-[14px] p-4 flex flex-col gap-3">
                  <p className="text-[13px] font-semibold text-carvao">
                    Adicionar {lista === "pediatras" ? "pediatra" : "profissional"}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
                      onBlur={(e) => setNovoNome(toTitleCase(e.target.value.trim()))}
                      placeholder="Nome completo" required
                      className="flex-[2] min-w-[140px] border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
                    <input value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)}
                      placeholder="E-mail" type="email" required
                      className="flex-[2] min-w-[140px] border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
                    <input value={novaCidade} onChange={(e) => setNovaCidade(e.target.value)}
                      placeholder="Cidade"
                      className="flex-1 min-w-[100px] border border-linha rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-ardosia" />
                    <button type="submit" disabled={adicionando}
                      className="bg-ardosia-escura text-white text-[13px] font-semibold px-4 rounded-[9px] cursor-pointer disabled:opacity-50 whitespace-nowrap">
                      {adicionando ? "…" : "+ Adicionar"}
                    </button>
                  </div>
                  {erroAdd && <p className="text-[12px] text-ferrugem">{erroAdd}</p>}
                </form>

                {/* Enviar todos */}
                {pendentes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button onClick={enviarTodosPendentes} disabled={enviandoTodos}
                      className="bg-ferrugem text-white text-[13px] font-semibold px-4 py-2 rounded-[9px] cursor-pointer disabled:opacity-50">
                      {enviandoTodos
                        ? `Enviando… (${loteProgresso?.ok ?? 0}/${loteProgresso?.total ?? 0})`
                        : `Enviar para todos os ${pendentes.length} pendentes`}
                    </button>
                    {loteProgresso && !enviandoTodos && (
                      <span className="text-[12.5px] text-verde-confirmacao font-semibold">
                        ✓ {loteProgresso.ok} enviados{loteProgresso.erro > 0 ? ` · ${loteProgresso.erro} erros` : ""}
                      </span>
                    )}
                  </div>
                )}

                {/* Listas */}
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
                              <p className="text-[11.5px] text-muted">{c.email}{c.cidade ? ` · ${c.cidade}` : ""}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-none">
                              {envioStatus[c.id] === "enviando" && <span className="text-[12px] text-ardosia">Enviando…</span>}
                              {envioStatus[c.id] === "ok" && <span className="text-[12px] text-verde-confirmacao font-semibold">✓ Enviado</span>}
                              {envioStatus[c.id] === "erro" && (
                                <span className="text-[12px] text-ferrugem" title={envioErros[c.id]}>
                                  Erro{envioErros[c.id] ? `: ${envioErros[c.id].slice(0, 50)}` : ""}
                                </span>
                              )}
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
                              <p className="text-[11.5px] text-muted">
                                {c.email}{c.cidade ? ` · ${c.cidade}` : ""} · enviado em {fmtData(c.enviado_em!)}
                              </p>
                            </div>
                            <button onClick={() => remover(c.id)}
                              className="text-[11px] text-muted hover:text-ferrugem transition-colors cursor-pointer flex-none">✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {contatos.length === 0 && (
                      <p className="text-[13px] text-muted text-center py-6">Nenhum contato ainda.</p>
                    )}
                  </>
                )}
              </>
            )}

            {aba === "template" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-carvao">Assunto</label>
                  <input value={assunto[l]} onChange={(e) => setAssunto((a) => ({ ...a, [l]: e.target.value }))}
                    className="border border-linha rounded-[9px] px-3.5 py-2.5 text-[13px] outline-none focus:border-ardosia" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-carvao">Corpo (HTML — use {"{nome}"} para personalizar)</label>
                  <textarea value={corpo[l]} onChange={(e) => setCorpo((c) => ({ ...c, [l]: e.target.value }))}
                    rows={20} className="border border-linha rounded-[9px] px-3.5 py-2.5 text-[12.5px] font-mono outline-none focus:border-ardosia resize-y" />
                </div>
                <p className="text-[12px] text-muted">
                  Sai de <strong>contato@kirisaude.com.br</strong> com cópia para <strong>iohana.marques@unifesp.br</strong>.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
