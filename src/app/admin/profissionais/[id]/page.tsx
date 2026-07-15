"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { PROFISSOES_ORDENADAS } from "@/types";

const CONVENIOS_COMUNS = ["Unimed", "Bradesco Saúde", "Amil", "SulAmérica", "Notre Dame Intermédica", "Hapvida", "Porto Seguro Saúde", "Prevent Senior", "Golden Cross"];
const TEMPO_ATUACAO_OPCOES = ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"];
const REGIOES_SP = ["Norte", "Sul", "Leste", "Oeste", "Centro"];

function parseBairro(raw: string): { regioes: string[]; texto: string } {
  const m = raw.match(/^Regiões: ([^—]+?)(?:\s*—\s*(.+))?$/);
  if (m) return { regioes: m[1].split(", ").map((r) => r.trim()).filter(Boolean), texto: m[2]?.trim() ?? "" };
  return { regioes: [], texto: raw };
}

function buildBairro(regioes: string[], texto: string): string {
  const partes = [regioes.length ? `Regiões: ${regioes.join(", ")}` : null, texto.trim() || null].filter(Boolean);
  return partes.join(" — ");
}

const profissionais = data.profissionais as Profissional[];

type VerificacaoStatus = "verificado" | "pendente" | null;

function Checkbox({ active, color, onClick }: { active: boolean; color: "ardosia" | "ferrugem"; onClick: () => void }) {
  const bg = active ? (color === "ardosia" ? "bg-ardosia-escura border-ardosia-escura" : "bg-ferrugem border-ferrugem") : "bg-white border-linha";
  return (
    <button type="button" onClick={onClick}
      className={`flex-none w-[16px] h-[16px] rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-colors ${bg}`}>
      {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );
}

function VerificacaoRow({ status, onStatus, obs, onObs }: { status: VerificacaoStatus; onStatus: (v: VerificacaoStatus) => void; obs: string; onObs: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 mt-1 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Checkbox active={status === "verificado"} color="ardosia" onClick={() => onStatus(status === "verificado" ? null : "verificado")} />
        <span className={`text-[11.5px] font-medium ${status === "verificado" ? "text-ardosia-escura" : "text-muted"}`}>Verificado</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Checkbox active={status === "pendente"} color="ferrugem" onClick={() => onStatus(status === "pendente" ? null : "pendente")} />
        <span className={`text-[11.5px] font-medium ${status === "pendente" ? "text-ferrugem" : "text-muted"}`}>Pendente verificação</span>
      </div>
      <input type="text" value={obs} onChange={(e) => onObs(e.target.value)}
        placeholder="Observações"
        className="flex-1 min-w-[120px] text-[11.5px] border-b border-linha bg-transparent outline-none text-carvao placeholder:text-muted py-0.5" />
    </div>
  );
}

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
  const [tempoAtuacao, setTempoAtuacao] = useState(profOriginal?.tempo_atuacao ?? "");
  const _cidadeRaw = profOriginal?.cidade ?? "";
  const _sep = _cidadeRaw.indexOf(" — ");
  const _cidadeBase0 = _sep >= 0 ? _cidadeRaw.slice(0, _sep).trim() : _cidadeRaw.trim();
  const _bairroRaw = _sep >= 0 ? _cidadeRaw.slice(_sep + 3).trim() : "";
  const _bairroParsed = parseBairro(_bairroRaw);
  const [cidadeBase, setCidadeBase] = useState(_cidadeBase0);
  const [regioesSP, setRegioesSP] = useState<string[]>(_bairroParsed.regioes);
  const [bairro, setBairro] = useState(_bairroParsed.texto);

  const isSaoPaulo = cidadeBase.toLowerCase().includes("são paulo") || cidadeBase.toLowerCase().includes("sao paulo");
  function toggleRegiao(r: string) { setRegioesSP((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]); }
  const [faixaEtaria, setFaixaEtaria] = useState(profOriginal?.faixa_etaria ?? "");
  const [sobre, setSobre] = useState(profOriginal?.sobre ?? "");
  const [valorFormato, setValorFormato] = useState<"a_partir_de" | "faixa">(profOriginal?.valor_formato ?? "a_partir_de");
  const [valorMin, setValorMin] = useState(profOriginal?.valor_min ? String(profOriginal.valor_min) : "");
  const [valorMax, setValorMax] = useState(profOriginal?.valor_max ? String(profOriginal.valor_max) : "");
  const [convenio, setConvenio] = useState(profOriginal?.convenio_info ?? "");
  const [whatsapp, setWhatsapp] = useState(profOriginal?.whatsapp_agendamento ?? "");
  const [verificacaoData, setVerificacaoData] = useState(profOriginal?.verificacao_data ?? "");
  type FormacaoEdit = { tipo: string; area: string; instituicao: string; ano: string; status?: VerificacaoStatus; obs?: string };
  const parseFormacaoEdit = (f: { curso: string; instituicao_ano: string; verificado?: boolean; pendente?: boolean; obs?: string }): FormacaoEdit => {
    const partes = f.instituicao_ano.split(" — ");
    return { tipo: f.curso, area: partes[0] ?? "", instituicao: partes[1] ?? "", ano: partes[2] ?? "", status: toStatus(f.verificado, f.pendente), obs: f.obs };
  };
  const [formacao, setFormacao] = useState<FormacaoEdit[]>(
    profOriginal?.formacao.length
      ? profOriginal.formacao.map(parseFormacaoEdit)
      : [{ tipo: "", area: "", instituicao: "", ano: "" }, { tipo: "", area: "", instituicao: "", ano: "" }]
  );
  const [genero, setGenero] = useState<"F" | "M" | undefined>(profOriginal?.genero);
  const [convenios, setConvenios] = useState<string[]>(profOriginal?.convenios ?? []);
  const [convenioCustom, setConvenioCustom] = useState("");
  const [fotoUrl, setFotoUrl] = useState(profOriginal?.foto_url ?? "");
  const [fotoPosicao, setFotoPosicao] = useState(profOriginal?.foto_posicao ?? "center top");
  const [fotoPreview, setFotoPreview] = useState<string | null>(profOriginal?.foto_url ?? null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");

  const [oculto, setOculto] = useState(profOriginal?.oculto ?? false);
  const toStatus = (v?: boolean, p?: boolean): VerificacaoStatus => v ? "verificado" : p ? "pendente" : null;
  const [registroStatus, setRegistroStatus] = useState<VerificacaoStatus>(toStatus(profOriginal?.registro_verificado, profOriginal?.registro_pendente));
  const [registroObs, setRegistroObs] = useState(profOriginal?.registro_obs ?? "");
  const [sobreStatus, setSobreStatus] = useState<VerificacaoStatus>(toStatus(profOriginal?.sobre_verificado, profOriginal?.sobre_pendente));
  const [sobreObs, setSobreObs] = useState(profOriginal?.sobre_obs ?? "");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/inscricoes", { credentials: "include" }).then((r) => {
      if (r.ok) setAuthed(true);
      else setAuthed(false);
    });
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <p className="text-[14px] text-muted">Verificando acesso…</p>
      </div>
    );
  }

  if (authed === false) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[15px] text-ferrugem mb-4">Sessão expirada ou não autorizado.</p>
          <Link href="/admin" className="text-[14px] text-ardosia font-semibold">← Fazer login em /admin</Link>
        </div>
      </div>
    );
  }

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

  function adicionarConvenio() {
    const termo = convenioCustom.trim();
    if (!termo) return;
    if (!convenios.includes(termo)) setConvenios((prev) => [...prev, termo]);
    setConvenioCustom("");
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroFoto("");
    setUploadandoFoto(true);

    // Redimensiona e comprime via Canvas antes de enviar (evita payload > 4MB)
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX = 500;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.82).split(",")[1]);
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!base64) {
      setErroFoto("Não foi possível processar a imagem");
      setUploadandoFoto(false);
      return;
    }

    setFotoPreview(`data:image/jpeg;base64,${base64}`);

    const res = await fetch("/api/admin/foto", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: id, filename: `${id}.jpg`, content_base64: base64 }),
    });

    if (res.ok) {
      const { foto_url } = await res.json();
      setFotoUrl(foto_url);
    } else {
      const err = await res.json().catch(() => ({}));
      setErroFoto(err.error ?? "Erro no upload");
    }
    setUploadandoFoto(false);
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
      cidade: (() => { const b = isSaoPaulo ? buildBairro(regioesSP, bairro) : bairro.trim(); return b ? `${cidadeBase.trim()} — ${b}` : cidadeBase.trim(); })(),
      faixa_etaria: faixaEtaria.trim(),
      tempo_atuacao: tempoAtuacao || null,
      sobre: sobre.trim(),
      formacao: formacao
        .filter((f) => f.tipo || f.area || f.instituicao)
        .map((f) => ({
          curso: f.tipo,
          instituicao_ano: [f.area, f.instituicao, f.ano].filter(Boolean).join(" — "),
          verificado: f.status === "verificado",
          pendente: f.status === "pendente" || undefined,
          obs: f.obs,
        })),
      valor_formato: valorFormato,
      valor_min: isNaN(valorMinNum) ? 0 : valorMinNum,
      valor_max: valorMaxNum && !isNaN(valorMaxNum) ? valorMaxNum : null,
      convenio_info: convenio.trim(),
      convenios: convenios.length ? convenios : null,
      whatsapp_agendamento: whatsapp.trim() || null,
      verificacao_data: verificacaoData.trim().toLowerCase(),
      foto_url: fotoUrl || null,
      foto_posicao: fotoPosicao || null,
      genero: genero ?? undefined,
      oculto,
      registro_verificado: registroStatus === "verificado",
      registro_pendente: registroStatus === "pendente" || undefined,
      registro_obs: registroObs.trim() || undefined,
      sobre_verificado: sobreStatus === "verificado",
      sobre_pendente: sobreStatus === "pendente" || undefined,
      sobre_obs: sobreObs.trim() || undefined,
    };

    const res = await fetch("/api/admin/profissionais", {
      method: "PATCH",
      credentials: "include",
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

        {/* Toggle ocultar perfil */}
        <div className={`flex items-center justify-between rounded-[12px] px-4 py-3 mb-4 border ${oculto ? "bg-ferrugem/10 border-ferrugem/30" : "bg-white border-linha"}`}>
          <div>
            <div className={`text-[14px] font-semibold ${oculto ? "text-ferrugem" : "text-carvao"}`}>
              {oculto ? "Perfil oculto" : "Perfil visível"}
            </div>
            <div className="text-[12px] text-muted">{oculto ? "Não aparece na plataforma nem na busca" : "Aparece normalmente na plataforma"}</div>
          </div>
          <button
            type="button"
            onClick={() => setOculto((v) => !v)}
            className={`text-[13px] font-semibold px-4 py-2 rounded-[9px] cursor-pointer transition-colors ${oculto ? "bg-ferrugem text-white" : "bg-wash border border-linha text-carvao hover:border-ardosia"}`}
          >
            {oculto ? "Tornar visível" : "Ocultar perfil"}
          </button>
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
                  (() => {
                    const pp = fotoPosicao.split(" ");
                    const px2 = pp[0]; const py2 = pp.slice(1).join(" ") || "top";
                    const xs = px2 === "25%" ? "12%" : px2 === "75%" ? "-12%" : "0%";
                    const hh = px2 !== "center" && px2 !== "50%";
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={fotoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `center ${py2}`, ...(hh ? { transform: `scale(1.3) translateX(${xs})` } : {}) }} />;
                  })()
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
            {fotoPreview && (
              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[11.5px] font-medium text-muted">Posição da foto</span>
                {(() => {
                  const partsPos = fotoPosicao.split(" ");
                  const posX = partsPos[0] ?? "center";
                  const posY = partsPos.slice(1).join(" ") || "top";
                  return (
                    <>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { label: "Topo", y: "top" },
                          { label: "Centro", y: "center" },
                          { label: "Baixo", y: "bottom" },
                          { label: "Rosto acima", y: "20%" },
                        ].map((op) => (
                          <button key={op.y} type="button"
                            onClick={() => setFotoPosicao(`${posX} ${posY === op.y ? "center" : op.y}`)}
                            className={`text-[12px] font-medium px-3 py-1.5 rounded-[8px] border cursor-pointer transition-colors ${posY === op.y ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                            {op.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {[
                          { label: "← Esquerda", x: "25%" },
                          { label: "Direita →", x: "75%" },
                        ].map((op) => (
                          <button key={op.x} type="button"
                            onClick={() => setFotoPosicao(`${posX === op.x ? "center" : op.x} ${posY}`)}
                            className={`text-[12px] font-medium px-3 py-1.5 rounded-[8px] border cursor-pointer transition-colors ${posX === op.x ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                            {op.label}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
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

          {/* Gênero */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-medium text-cinza-texto">Gênero <span className="text-[11px] text-muted">(ajusta substantivo da profissão no perfil)</span></label>
            <div className="flex gap-2">
              {(["M", "F"] as const).map((g) => (
                <button key={g} type="button"
                  onClick={() => setGenero(genero === g ? undefined : g)}
                  className={`text-[13px] font-medium px-4 py-1.5 rounded-[8px] border cursor-pointer transition-colors ${genero === g ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                  {g === "M" ? "Masculino" : "Feminino"}
                </button>
              ))}
            </div>
          </div>

          {[
            { label: "Nome completo", value: nome, set: setNome, required: true },
            { label: "Título de exibição (ex: Psiquiatra da infância e adolescência)", value: tituloExibicao, set: setTituloExibicao, required: true },
          ].map(({ label, value, set, required }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-[12.5px] font-medium text-cinza-texto">{label}</label>
              <input type="text" value={value} onChange={(e) => set(e.target.value)} required={required}
                className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors" />
            </div>
          ))}

          {/* Registro no conselho — com checkbox de verificação */}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Registro no conselho</label>
            <input type="text" value={registro} onChange={(e) => setRegistro(e.target.value)} required
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors" />
            <VerificacaoRow status={registroStatus} onStatus={setRegistroStatus} obs={registroObs} onObs={setRegistroObs} />
          </div>

          {[
            { label: "RQE (só médicos — deixe vazio se não se aplica)", value: rqe, set: setRqe },
            { label: "Áreas de atuação (separadas por vírgula)", value: areas, set: setAreas, required: true },
            { label: "Modalidade", value: modalidade, set: setModalidade, required: true },
            { label: "Faixa etária", value: faixaEtaria, set: setFaixaEtaria, required: true },
            { label: "Convênio e pagamento", value: convenio, set: setConvenio, required: true },
            { label: "WhatsApp para agendamento (privado)", value: whatsapp, set: setWhatsapp },
            { label: "Verificado em (ex: Junho de 2026)", value: verificacaoData, set: setVerificacaoData },
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

          {/* Cidade e bairro */}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Cidade de atendimento</label>
            <input
              type="text"
              value={cidadeBase}
              onChange={(e) => setCidadeBase(e.target.value)}
              required
              placeholder="Ex: São Paulo, SP"
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
            />
          </div>
          {isSaoPaulo && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium text-cinza-texto">Região <span className="text-[11px] text-muted">(opcional)</span></label>
              <div className="flex flex-wrap gap-2">
                {REGIOES_SP.map((r) => (
                  <button key={r} type="button" onClick={() => toggleRegiao(r)}
                    className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium border transition-colors cursor-pointer ${regioesSP.includes(r) ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">
              Bairro <span className="text-[11px] text-muted">(opcional)</span>
            </label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder={isSaoPaulo ? "Ex: Pinheiros, Moema…" : "Ex: Pinheiros"}
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
            />
          </div>

          {/* Tempo de atuação — campo interno */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">
              Tempo de atuação <span className="text-[11px] text-muted">(interno — não aparece no perfil público)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPO_ATUACAO_OPCOES.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setTempoAtuacao((prev) => (prev === op ? "" : op))}
                  className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium border transition-colors cursor-pointer ${tempoAtuacao === op ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

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
            <VerificacaoRow status={sobreStatus} onStatus={setSobreStatus} obs={sobreObs} onObs={setSobreObs} />
          </div>

          {/* Formação */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">Formação</label>
            <datalist id="tipos-formacao">
              <option value="Graduação" />
              <option value="Especialização" />
              <option value="Pós-graduação" />
              <option value="Mestrado" />
              <option value="Mestrando" />
              <option value="Doutorado" />
              <option value="Doutorando" />
              <option value="Certificação" />
              <option value="Residência Médica" />
              <option value="Formação" />
            </datalist>
            {formacao.map((f, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex gap-1.5 items-center">
                  <input list="tipos-formacao" placeholder="Tipo" value={f.tipo}
                    onChange={(e) => { const n = [...formacao]; n[i] = { ...n[i], tipo: e.target.value }; setFormacao(n); }}
                    className="w-[120px] flex-none border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                  />
                  <input type="text" placeholder="Área" value={f.area}
                    onChange={(e) => { const n = [...formacao]; n[i] = { ...n[i], area: e.target.value }; setFormacao(n); }}
                    className="flex-1 border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                  />
                  <input type="text" placeholder="Instituição" value={f.instituicao}
                    onChange={(e) => { const n = [...formacao]; n[i] = { ...n[i], instituicao: e.target.value }; setFormacao(n); }}
                    className="flex-1 border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                  />
                  <input type="text" placeholder="Ano" value={f.ano}
                    onChange={(e) => { const n = [...formacao]; n[i] = { ...n[i], ano: e.target.value }; setFormacao(n); }}
                    className="w-[70px] flex-none border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                  />
                  {formacao.length > 1 && (
                    <button type="button" onClick={() => setFormacao(formacao.filter((_, j) => j !== i))}
                      className="text-[18px] text-muted cursor-pointer leading-none flex-none">×</button>
                  )}
                </div>
                <VerificacaoRow
                  status={f.status ?? null}
                  onStatus={(v) => { const n = [...formacao]; n[i] = { ...n[i], status: v }; setFormacao(n); }}
                  obs={f.obs ?? ""}
                  onObs={(v) => { const n = [...formacao]; n[i] = { ...n[i], obs: v }; setFormacao(n); }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormacao([...formacao, { tipo: "", area: "", instituicao: "", ano: "" }])}
              className="text-[13px] text-ardosia font-semibold text-left cursor-pointer"
            >
              + Adicionar linha
            </button>
          </div>

          {/* Convênios */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">
              Convênios atendidos <span className="text-[11px] text-muted">(opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CONVENIOS_COMUNS.map((conv) => (
                <button
                  key={conv}
                  type="button"
                  onClick={() => setConvenios((prev) => prev.includes(conv) ? prev.filter((c) => c !== conv) : [...prev, conv])}
                  className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium border transition-colors cursor-pointer ${convenios.includes(conv) ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}
                >
                  {conv}
                </button>
              ))}
              {convenios.filter((c) => !CONVENIOS_COMUNS.includes(c)).map((conv) => (
                <button
                  key={conv}
                  type="button"
                  onClick={() => setConvenios((prev) => prev.filter((c) => c !== conv))}
                  className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium border bg-ardosia-escura text-white border-ardosia-escura cursor-pointer flex items-center gap-1.5"
                >
                  {conv}
                  <span className="text-white/70 text-[15px] leading-none">×</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={convenioCustom}
                onChange={(e) => setConvenioCustom(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarConvenio(); } }}
                placeholder="Outro convênio…"
                className="flex-1 border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
              />
              <button
                type="button"
                onClick={adicionarConvenio}
                disabled={!convenioCustom.trim()}
                className="px-4 py-[10px] rounded-[10px] text-[13.5px] font-semibold bg-ardosia-escura text-white border border-ardosia-escura cursor-pointer disabled:opacity-40 transition-opacity"
              >
                + Adicionar
              </button>
            </div>
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
