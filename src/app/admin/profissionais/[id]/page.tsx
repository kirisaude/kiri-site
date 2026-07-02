"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { PROFISSOES_ORDENADAS } from "@/types";

const profissionais = data.profissionais as Profissional[];

export default function EditarProfissionalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const profOriginal = profissionais.find((p) => p.id === id);

  const [nome, setNome] = useState(profOriginal?.nome ?? "");
  const [profissao, setProfissao] = useState(profOriginal?.profissao ?? "");
  const [tituloExibicao, setTituloExibicao] = useState(profOriginal?.titulo_exibicao ?? "");
  const [registro, setRegistro] = useState(profOriginal?.registro_conselho ?? "");
  const [rqe, setRqe] = useState(profOriginal?.rqe ?? "");
  const [areas, setAreas] = useState(profOriginal?.areas_atuacao.join(", ") ?? "");
  const [modalidade, setModalidade] = useState(profOriginal?.modalidade ?? "");
  const [cidade, setCidade] = useState(profOriginal?.cidade ?? "");
  const [faixaEtaria, setFaixaEtaria] = useState(profOriginal?.faixa_etaria ?? "");
  const [sobre, setSobre] = useState(profOriginal?.sobre ?? "");
  const [valorFormato, setValorFormato] = useState<"a_partir_de" | "faixa">(profOriginal?.valor_formato ?? "a_partir_de");
  const [valorMin, setValorMin] = useState(profOriginal?.valor_min ? String(profOriginal.valor_min) : "");
  const [valorMax, setValorMax] = useState(profOriginal?.valor_max ? String(profOriginal.valor_max) : "");
  const [convenio, setConvenio] = useState(profOriginal?.convenio_info ?? "");
  const [whatsapp, setWhatsapp] = useState(profOriginal?.whatsapp_agendamento ?? "");
  const [verificacaoData, setVerificacaoData] = useState(profOriginal?.verificacao_data ?? "");
  const [formacao, setFormacao] = useState(
    profOriginal?.formacao.length ? profOriginal.formacao : [{ curso: "", instituicao_ano: "" }]
  );
  const [fotoUrl, setFotoUrl] = useState(profOriginal?.foto_url ?? "");
  const [fotoPreview, setFotoPreview] = useState<string | null>(profOriginal?.foto_url ?? null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  if (!profOriginal) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[15px] text-ferrugem mb-4">Profissional não encontrado: {id}</p>
          <Link href="/admin" className="text-[14px] text-ardosia font-semibold">← Voltar ao admin</Link>
        </div>
      </div>
    );
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroFoto("");
    setUploadandoFoto(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setFotoPreview(reader.result as string);

      const res = await fetch("/api/admin/foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: id,
          filename: file.name,
          content_base64: base64,
        }),
      });

      if (res.ok) {
        const { foto_url } = await res.json();
        setFotoUrl(foto_url);
      } else {
        const err = await res.json();
        setErroFoto(err.error ?? "Erro no upload");
      }
      setUploadandoFoto(false);
    };
    reader.readAsDataURL(file);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso("");

    const areasLista = areas.split(",").map((a) => a.trim()).filter(Boolean);
    const valorMinNum = parseInt(valorMin.replace(/\D/g, ""), 10);
    const valorMaxNum = valorMax ? parseInt(valorMax.replace(/\D/g, ""), 10) : null;

    const payload: Partial<Profissional> & { id: string } = {
      id,
      nome: nome.trim(),
      profissao: profissao.trim(),
      titulo_exibicao: tituloExibicao.trim(),
      registro_conselho: registro.trim(),
      rqe: rqe.trim() || null,
      areas_atuacao: areasLista,
      modalidade: modalidade.trim(),
      cidade: cidade.trim(),
      faixa_etaria: faixaEtaria.trim(),
      sobre: sobre.trim(),
      formacao: formacao.filter((f) => f.curso || f.instituicao_ano),
      valor_formato: valorFormato,
      valor_min: isNaN(valorMinNum) ? 0 : valorMinNum,
      valor_max: valorMaxNum && !isNaN(valorMaxNum) ? valorMaxNum : null,
      convenio_info: convenio.trim(),
      whatsapp_agendamento: whatsapp.trim() || null,
      verificacao_data: verificacaoData.trim(),
      foto_url: fotoUrl || null,
    };

    const res = await fetch("/api/admin/profissionais", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSucesso("Salvo! O site atualiza em ~1 min.");
      setTimeout(() => router.push("/admin?aba=profissionais"), 2500);
    } else {
      const e = await res.json();
      setErro(e.error ?? "Erro ao salvar");
    }
    setSalvando(false);
  }

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-[13px] font-semibold text-ardosia no-underline">← Admin</Link>
        <span className="text-[13px] text-muted">/ Editar profissional</span>
        <div className="flex items-center gap-2 ml-auto">
          <KiriLogoCompact height={28} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-5 flex items-center gap-3">
          <div>
            <div className="font-serif text-[20px] font-semibold text-carvao">{profOriginal.nome}</div>
            <div className="text-[13px] text-muted">{profOriginal.id}</div>
          </div>
          <Link
            href={`/profissional/${profOriginal.id}`}
            target="_blank"
            className="ml-auto text-[13px] font-medium text-ardosia no-underline"
          >
            Ver perfil ↗
          </Link>
        </div>

        <form onSubmit={salvar} className="flex flex-col gap-4">

          {/* Foto */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">Foto do profissional</label>
            <div className="flex items-center gap-4">
              <div
                style={{ width: 72, height: 72, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: "#EBE2D2", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
              >
                {fotoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                ) : (
                  <svg width={72} height={72} viewBox="0 0 48 48">
                    <circle cx="24" cy="19" r="8.5" fill="#CDBFA8" />
                    <path d="M9 44 C9 32 39 32 39 44 Z" fill="#CDBFA8" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 bg-white border border-linha rounded-[10px] px-3.5 py-[9px] text-[13.5px] text-carvao cursor-pointer hover:border-ardosia transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  {uploadandoFoto ? "Enviando…" : "Escolher foto"}
                </label>
                {fotoUrl && !uploadandoFoto && (
                  <span className="text-[12px] text-verde-confirmacao font-medium">✓ foto enviada</span>
                )}
                {erroFoto && <span className="text-[12px] text-ferrugem">{erroFoto}</span>}
                <span className="text-[11.5px] text-muted">JPG, PNG ou WebP · recomendado 400×400px</span>
              </div>
            </div>
          </div>

          {/* Profissão */}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Profissão</label>
            <select
              value={profissao}
              onChange={(e) => {
                setProfissao(e.target.value);
                if (!tituloExibicao || tituloExibicao === profissao) setTituloExibicao(e.target.value);
              }}
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
            >
              {PROFISSOES_ORDENADAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {[
            { label: "Nome completo", value: nome, set: setNome, required: true },
            { label: "Título de exibição (ex: Psiquiatra da infância e adolescência)", value: tituloExibicao, set: setTituloExibicao, required: true },
            { label: "Registro no conselho", value: registro, set: setRegistro, required: true },
            { label: "RQE (só médicos — deixe vazio se não se aplica)", value: rqe, set: setRqe },
            { label: "Áreas de atuação (separadas por vírgula)", value: areas, set: setAreas, required: true },
            { label: "Modalidade", value: modalidade, set: setModalidade, required: true },
            { label: "Cidade e bairro", value: cidade, set: setCidade, required: true },
            { label: "Faixa etária", value: faixaEtaria, set: setFaixaEtaria, required: true },
            { label: "Convênio e pagamento", value: convenio, set: setConvenio, required: true },
            { label: "WhatsApp para agendamento (privado)", value: whatsapp, set: setWhatsapp },
            { label: "Verificado em (ex: junho de 2026)", value: verificacaoData, set: setVerificacaoData },
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

          {/* Valor */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">Formato do valor</label>
            <div className="flex gap-3">
              {(["a_partir_de", "faixa"] as const).map((fmt) => (
                <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={valorFormato === fmt}
                    onChange={() => setValorFormato(fmt)}
                    className="accent-ardosia-escura"
                  />
                  <span className="text-[13.5px] text-carvao">{fmt === "a_partir_de" ? "A partir de" : "Faixa"}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[12px] text-cinza-texto">{valorFormato === "faixa" ? "Valor mínimo" : "Valor (R$)"}</label>
                <input
                  type="text"
                  value={valorMin}
                  onChange={(e) => setValorMin(e.target.value)}
                  placeholder="ex: 250"
                  className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
                />
              </div>
              {valorFormato === "faixa" && (
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[12px] text-cinza-texto">Valor máximo</label>
                  <input
                    type="text"
                    value={valorMax}
                    onChange={(e) => setValorMax(e.target.value)}
                    placeholder="ex: 400"
                    className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Apresentação */}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Apresentação (texto do perfil)</label>
            <textarea
              value={sobre}
              onChange={(e) => setSobre(e.target.value)}
              rows={5}
              required
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors resize-none"
            />
          </div>

          {/* Formação */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">Formação</label>
            {formacao.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Curso"
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
                {formacao.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormacao(formacao.filter((_, j) => j !== i))}
                    className="text-[18px] text-muted cursor-pointer leading-none flex-none"
                  >
                    ×
                  </button>
                )}
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
            disabled={salvando}
            className="w-full bg-ardosia-escura text-white font-semibold text-[15px] rounded-[12px] py-[14px] cursor-pointer disabled:opacity-50 mt-2"
          >
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
