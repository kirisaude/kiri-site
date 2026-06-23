"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KiriLogo } from "@/components/KiriLogo";

interface TallyField {
  key: string;
  label: string;
  type: string;
  value: unknown;
}

interface TallySubmission {
  id: string;
  submittedAt: string;
  fields: TallyField[];
}

function getField(fields: TallyField[], keyword: string): string {
  const f = fields.find((f) => f.label.toLowerCase().includes(keyword.toLowerCase()));
  if (!f?.value) return "";
  if (typeof f.value === "string") return f.value;
  if (Array.isArray(f.value)) return f.value.join(", ");
  return String(f.value);
}

function getCheckboxes(fields: TallyField[], keyword: string): string[] {
  const f = fields.find((f) => f.label.toLowerCase().includes(keyword.toLowerCase()));
  if (!f?.value) return [];
  if (Array.isArray(f.value)) return f.value.map(String);
  if (typeof f.value === "string") return [f.value];
  return [];
}

export default function RevisarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<TallySubmission | null>(null);
  const [erro, setErro] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [sucesso, setSucesso] = useState("");

  // Campos do formulário
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
  const [formacao, setFormacao] = useState([{ curso: "", instituicao_ano: "" }]);

  useEffect(() => {
    fetch("/api/admin/respostas")
      .then((r) => {
        if (!r.ok) { setErro("Não autorizado — faça login em /admin"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const s = (data.submissions as TallySubmission[])?.find((s) => s.id === id);
        if (!s) { setErro("Inscrição não encontrada."); return; }
        setSubmission(s);

        // Pré-preenche com dados do Tally
        setNome(getField(s.fields, "nome"));
        setProfissao(getField(s.fields, "profiss"));
        setRegistro(getField(s.fields, "registro"));
        setRqe(getField(s.fields, "rqe"));
        setSobre(getField(s.fields, "apresenta") || getField(s.fields, "descri") || getField(s.fields, "sobre"));
        setAreas(getCheckboxes(s.fields, "área").join(", ") || getField(s.fields, "área") || getCheckboxes(s.fields, "area").join(", "));
        setModalidade(getField(s.fields, "modalidade") || getField(s.fields, "atendimento"));
        setCidade(getField(s.fields, "cidade") || getField(s.fields, "localiza"));
        setFaixaEtaria(getField(s.fields, "faixa") || getField(s.fields, "etária") || getField(s.fields, "idade"));
        setValorMin(getField(s.fields, "valor") || getField(s.fields, "consulta"));
        setConvenio(getField(s.fields, "convênio") || getField(s.fields, "convenio") || "Particular · emite recibo para reembolso");

        const grad = getField(s.fields, "graduaç") || getField(s.fields, "graduacao");
        const pos = getField(s.fields, "pós") || getField(s.fields, "pos") || getField(s.fields, "residência") || getField(s.fields, "especializa");
        const formacoesIniciais = [];
        if (grad) formacoesIniciais.push({ curso: "Graduação", instituicao_ano: grad });
        if (pos) formacoesIniciais.push({ curso: "Especialização", instituicao_ano: pos });
        if (formacoesIniciais.length > 0) setFormacao(formacoesIniciais);
      });
  }, [id]);

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
      verificado: true,
      foto_url: null,
      verificacao_data: new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    };

    const res = await fetch("/api/admin/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profissional),
    });

    if (res.ok) {
      const { id: novoId } = await res.json();
      setSucesso(`Profissional publicado como ${novoId}! O site atualiza em ~1 min.`);
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

  if (!submission) {
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
          <KiriLogo size={22} />
          <span className="font-serif text-[17px] font-medium text-ferrugem">Revisar inscrição</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Dados brutos do Tally */}
        <div className="mb-6 bg-white border border-linha rounded-[14px] px-4 py-4">
          <div className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-3">
            Dados enviados pelo profissional
          </div>
          <div className="flex flex-col gap-2">
            {submission.fields
              .filter((f) => f.value !== null && f.value !== "" && f.value !== undefined)
              .map((f) => (
                <div key={f.key} className="flex gap-2 text-[13px]">
                  <span className="text-cinza-texto min-w-[140px] flex-none">{f.label}</span>
                  <span className="text-carvao break-words">
                    {Array.isArray(f.value) ? f.value.join(", ") : String(f.value)}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-3 pt-3 border-t border-linha text-[12px] text-muted">
            Enviado em {new Date(submission.submittedAt).toLocaleString("pt-BR")}
          </div>
        </div>

        {/* Formulário de publicação */}
        <form onSubmit={publicar} className="flex flex-col gap-4">
          <div className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-1">
            Confirmar dados para publicação
          </div>

          {[
            { label: "Nome completo", value: nome, set: setNome, required: true },
            { label: "Profissão (título de exibição)", value: profissao, set: setProfissao, required: true },
            { label: "Registro no conselho (ex: CRM 12345-SP)", value: registro, set: setRegistro, required: true },
            { label: "RQE (só médicos — deixe vazio se não se aplica)", value: rqe, set: setRqe },
            { label: "Áreas de atuação (separadas por vírgula)", value: areas, set: setAreas, required: true },
            { label: "Modalidade (Presencial e online / Somente presencial / Somente online)", value: modalidade, set: setModalidade, required: true },
            { label: "Cidade e bairro (ex: São Paulo, SP — Pinheiros)", value: cidade, set: setCidade, required: true },
            { label: "Faixa etária (ex: Crianças e adolescentes · 0–18 anos)", value: faixaEtaria, set: setFaixaEtaria, required: true },
            { label: "Valor mínimo (somente número, ex: 350)", value: valorMin, set: setValorMin },
            { label: "Convênio e pagamento", value: convenio, set: setConvenio, required: true },
          ].map(({ label, value, set, required }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-[12.5px] font-medium text-cinza-texto">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => set(e.target.value)}
                required={required}
                className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
              />
            </div>
          ))}

          {/* Sobre */}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Apresentação (texto do perfil)</label>
            <textarea
              value={sobre}
              onChange={(e) => setSobre(e.target.value)}
              rows={4}
              required
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors resize-none"
            />
          </div>

          {/* Formação */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">Formação</label>
            {formacao.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Curso (ex: Graduação em Medicina)"
                  value={f.curso}
                  onChange={(e) => {
                    const novo = [...formacao];
                    novo[i] = { ...novo[i], curso: e.target.value };
                    setFormacao(novo);
                  }}
                  className="flex-1 border border-linha rounded-[10px] px-3 py-[9px] text-[13.5px] text-carvao bg-white outline-none focus:border-ardosia"
                />
                <input
                  type="text"
                  placeholder="Instituição · Ano"
                  value={f.instituicao_ano}
                  onChange={(e) => {
                    const novo = [...formacao];
                    novo[i] = { ...novo[i], instituicao_ano: e.target.value };
                    setFormacao(novo);
                  }}
                  className="flex-1 border border-linha rounded-[10px] px-3 py-[9px] text-[13.5px] text-carvao bg-white outline-none focus:border-ardosia"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormacao([...formacao, { curso: "", instituicao_ano: "" }])}
              className="text-[13px] text-ardosia font-semibold text-left cursor-pointer"
            >
              + Adicionar linha
            </button>
          </div>

          {erro && <p className="text-[13px] text-ferrugem">{erro}</p>}
          {sucesso && <p className="text-[13px] text-verde-confirmacao font-semibold">{sucesso}</p>}

          <button
            type="submit"
            disabled={publicando}
            className="w-full bg-ardosia-escura text-white font-semibold text-[15px] rounded-[12px] py-[14px] cursor-pointer disabled:opacity-50 mt-2"
          >
            {publicando ? "Publicando…" : "Publicar profissional"}
          </button>
        </form>
      </div>
    </div>
  );
}
