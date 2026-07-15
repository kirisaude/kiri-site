"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";

interface Inscricao {
  id: string;
  criado_em: string;
  nome: string;
  email: string | null;
  profissao: string;
  registro_conselho: string;
  rqe: string | null;
  tempo_atuacao: string | null;
  areas_atuacao: string | null;
  faixa_etaria: string | null;
  modalidade: string | null;
  cidade: string | null;
  valor_medio: string | null;
  aceita_convenio: boolean | null;
  graduacao: string | null;
  pos_graduacao: string | null;
  apresentacao: string | null;
  site_perfil: string | null;
  como_conheceu: string | null;
  whatsapp_agendamento: string | null;
}

export default function RevisarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const [erro, setErro] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [rejeitando, setRejeitando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [sucesso, setSucesso] = useState("");

  const [nome, setNome] = useState("");
  const [profissao, setProfissao] = useState("");
  const [registro, setRegistro] = useState("");
  const [rqe, setRqe] = useState("");
  const [areas, setAreas] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [cidade, setCidade] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [sobre, setSobre] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [convenio, setConvenio] = useState("");
  const [whatsappAgendamento, setWhatsappAgendamento] = useState("");
  const [formacao, setFormacao] = useState([{ curso: "", instituicao_ano: "" }, { curso: "", instituicao_ano: "" }]);

  useEffect(() => {
    fetch("/api/admin/inscricoes")
      .then((r) => {
        if (!r.ok) { setErro("Não autorizado — faça login em /admin"); return null; }
        return r.json();
      })
      .then((data: Inscricao[] | null) => {
        if (!data) return;
        const s = data.find((i) => i.id === id);
        if (!s) { setErro("Inscrição não encontrada."); return; }
        setInscricao(s);

        setNome(s.nome);
        setProfissao(s.profissao);
        setRegistro(s.registro_conselho);
        setRqe(s.rqe ?? "");
        setAreas(s.areas_atuacao ?? "");
        setModalidade(s.modalidade ?? "");
        setCidade(s.cidade ?? "");
        setFaixaEtaria(s.faixa_etaria ?? "");
        setSobre(s.apresentacao ?? "");
        const valorRaw = s.valor_medio ?? "";
        const valorMatch = valorRaw.match(/(\d[\d.]*),\d{2}|(\d+)/);
        const valorNum = valorMatch ? parseInt((valorMatch[1] || valorMatch[2]).replace(/\./g, ""), 10) : NaN;
        setValorMin(isNaN(valorNum) ? "" : String(valorNum));
        setConvenio(s.aceita_convenio === true ? "Particular e convênio" : "Particular · emite recibo para reembolso");
        setWhatsappAgendamento(s.whatsapp_agendamento ?? "");

        const formacoesIniciais = [];
        if (s.graduacao) formacoesIniciais.push({ curso: "Graduação", instituicao_ano: s.graduacao });
        if (s.pos_graduacao) {
          s.pos_graduacao.split("\n").forEach((linha: string) => {
            const t = linha.trim();
            if (!t) return;
            const isMestrado = t.startsWith("Mestrado/Doutorado:");
            formacoesIniciais.push({
              curso: isMestrado ? t.replace("Mestrado/Doutorado:", "").trim() : t.split(" — ")[0] ?? t,
              instituicao_ano: isMestrado ? t.replace(/^Mestrado\/Doutorado:[^—]*/, "").replace(/^ — /, "").trim() : t.split(" — ").slice(1).join(" — "),
            });
          });
        }
        if (formacoesIniciais.length > 0) setFormacao(formacoesIniciais);
      });
  }, [id]);

  async function rejeitar() {
    if (!confirm("Rejeitar esta inscrição?")) return;
    setRejeitando(true);
    await fetch("/api/admin/inscricoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "rejeitado" }),
    });
    router.push("/admin");
  }

  async function excluir() {
    if (!confirm("Excluir esta inscrição permanentemente?")) return;
    setExcluindo(true);
    await fetch("/api/admin/inscricoes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.push("/admin");
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setPublicando(true);
    setSucesso("");

    const areasLista = areas.split(",").map((a) => a.trim()).filter(Boolean);
    const valorNum = parseInt(valorMin.replace(/\D/g, ""), 10);

    const profissional = {
      id: "",
      nome: nome.trim(),
      profissao: profissao.trim(),
      titulo_exibicao: profissao.trim(),
      registro_conselho: registro.trim(),
      rqe: rqe.trim() || null,
      areas_atuacao: areasLista,
      modalidade: modalidade.trim(),
      cidade: cidade.trim(),
      faixa_etaria: faixaEtaria.trim(),
      sobre: sobre.trim(),
      formacao: formacao.filter((f) => f.curso || f.instituicao_ano),
      valor_formato: "a_partir_de",
      valor_min: isNaN(valorNum) ? null : valorNum,
      valor_max: null,
      convenio_info: convenio.trim(),
      convenios: null,
      whatsapp_agendamento: whatsappAgendamento.trim() || null,
      verificado: true,
      foto_url: null,
      verificacao_data: new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase()),
    };

    const res = await fetch("/api/admin/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profissional),
    });

    if (res.ok) {
      const { id: novoId } = await res.json();
      // Marca como aprovado no Supabase
      await fetch("/api/admin/inscricoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "aprovado" }),
      });
      setSucesso(`Publicado como ${novoId}! O site atualiza em ~1 min.`);
      setTimeout(() => router.push("/admin"), 3000);
    } else {
      const e = await res.json();
      setErro(e.error ?? "Erro ao publicar");
    }
    setPublicando(false);
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[15px] text-ferrugem mb-4">{erro}</p>
          <Link href="/admin" className="text-[14px] text-ardosia font-semibold">← Voltar ao admin</Link>
        </div>
      </div>
    );
  }

  if (!inscricao) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <p className="text-[14px] text-muted">Carregando inscrição…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-[13px] font-semibold text-ardosia no-underline">← Admin</Link>
        <div className="flex items-center gap-2 ml-auto">
          <KiriLogoCompact height={28} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Dados originais */}
        <div className="mb-6 bg-white border border-linha rounded-[14px] px-4 py-4">
          <div className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-3">Dados enviados pelo profissional</div>
          <div className="flex flex-col gap-2">
            {[
              ["E-mail", inscricao.email],
              ["Profissão", inscricao.profissao],
              ["Registro", inscricao.registro_conselho],
              ["RQE", inscricao.rqe],
              ["Tempo de atuação", inscricao.tempo_atuacao],
              ["Áreas", inscricao.areas_atuacao],
              ["Faixa etária", inscricao.faixa_etaria],
              ["Modalidade", inscricao.modalidade],
              ["Cidade", inscricao.cidade],
              ["Valor médio", inscricao.valor_medio],
              ["Aceita convênio", inscricao.aceita_convenio != null ? (inscricao.aceita_convenio ? "Sim" : "Não") : null],
              ["Graduação", inscricao.graduacao],
              ["Pós-graduação", inscricao.pos_graduacao],
              ["Apresentação", inscricao.apresentacao],
              ["Site/perfil", inscricao.site_perfil],
              ["Como conheceu", inscricao.como_conheceu],
              ["WhatsApp agendamento", inscricao.whatsapp_agendamento],
            ].filter(([, v]) => v).map(([label, valor]) => (
              <div key={label as string} className="flex gap-2 text-[13px]">
                <span className="text-cinza-texto min-w-[130px] flex-none">{label}</span>
                <span className="text-carvao break-words">{valor as string}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-linha text-[12px] text-muted">
            Enviado em {new Date(inscricao.criado_em).toLocaleString("pt-BR")}
          </div>
        </div>

        {/* Formulário de publicação */}
        <form onSubmit={publicar} className="flex flex-col gap-4">
          <div className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-1">Confirmar dados para publicação</div>

          {[
            { label: "Nome completo", value: nome, set: setNome, required: true },
            { label: "Profissão (título de exibição)", value: profissao, set: setProfissao, required: true },
            { label: "Registro no conselho", value: registro, set: setRegistro, required: true },
            { label: "RQE (só médicos — deixe vazio se não se aplica)", value: rqe, set: setRqe },
            { label: "Áreas de atuação (separadas por vírgula)", value: areas, set: setAreas, required: true },
            { label: "Modalidade", value: modalidade, set: setModalidade, required: true },
            { label: "Cidade e bairro", value: cidade, set: setCidade, required: true },
            { label: "Faixa etária", value: faixaEtaria, set: setFaixaEtaria, required: true },
            { label: "Valor mínimo (só número)", value: valorMin, set: setValorMin },
            { label: "Convênio e pagamento", value: convenio, set: setConvenio, required: true },
            { label: "WhatsApp para agendamento (privado)", value: whatsappAgendamento, set: setWhatsappAgendamento, required: false },
          ].map(({ label, value, set, required }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-[12.5px] font-medium text-cinza-texto">{label}</label>
              <input type="text" value={value} onChange={(e) => set(e.target.value)} required={required}
                className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors" />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Apresentação (texto do perfil)</label>
            <textarea value={sobre} onChange={(e) => setSobre(e.target.value)} rows={4} required
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors resize-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">Formação</label>
            {formacao.map((f, i) => {
              const exemplosCurso = ["ex: Pós-graduação em análise do comportamento", "ex: Mestrado em psiquiatria"];
              const exemplosLocal = ["ex: Universidade de São Paulo, 2010", "ex: Universidade de São Paulo, 2010"];
              const phCurso = exemplosCurso[i] ?? "ex: Especialização · área";
              const phLocal = exemplosLocal[i] ?? "ex: Instituição, Ano";
              return (
                <div key={i} className="flex gap-2">
                  <input type="text" placeholder={phCurso} value={f.curso}
                    onChange={(e) => { const novo = [...formacao]; novo[i] = { ...novo[i], curso: e.target.value }; setFormacao(novo); }}
                    className="flex-1 border border-linha rounded-[10px] px-3 py-[9px] text-[13.5px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted" />
                  <input type="text" placeholder={phLocal} value={f.instituicao_ano}
                    onChange={(e) => { const novo = [...formacao]; novo[i] = { ...novo[i], instituicao_ano: e.target.value }; setFormacao(novo); }}
                    className="flex-1 border border-linha rounded-[10px] px-3 py-[9px] text-[13.5px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted" />
                </div>
              );
            })}
            <button type="button" onClick={() => setFormacao([...formacao, { curso: "", instituicao_ano: "" }])}
              className="text-[13px] text-ardosia font-semibold text-left cursor-pointer">
              + Adicionar linha
            </button>
          </div>

          {erro && <p className="text-[13px] text-ferrugem">{erro}</p>}
          {sucesso && <p className="text-[13px] text-verde-confirmacao font-semibold">{sucesso}</p>}

          <button type="submit" disabled={publicando}
            className="w-full bg-ardosia-escura text-white font-semibold text-[15px] rounded-[12px] py-[14px] cursor-pointer disabled:opacity-50 mt-2">
            {publicando ? "Publicando…" : "Publicar profissional"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-linha flex items-center justify-between">
          <button onClick={rejeitar} disabled={rejeitando}
            className="text-[13px] text-ferrugem font-semibold cursor-pointer hover:underline disabled:opacity-50">
            {rejeitando ? "Rejeitando…" : "Rejeitar inscrição"}
          </button>
          <button onClick={excluir} disabled={excluindo}
            className="text-[13px] text-muted font-medium cursor-pointer hover:underline disabled:opacity-50">
            {excluindo ? "Excluindo…" : "Excluir formulário"}
          </button>
        </div>
      </div>
    </div>
  );
}
