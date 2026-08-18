"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import data from "@/data/profissionais.json";
import type { Profissional, ExperienciaInfantil } from "@/types";
import { PROFISSOES_ORDENADAS } from "@/types";
import { titleCasePT } from "@/lib/titleCase";

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
  const [profissaoSecundaria, setProfissaoSecundaria] = useState(profOriginal?.profissao_secundaria ?? "");
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
  const [valorFormato, setValorFormato] = useState<"a_partir_de" | "faixa" | null>(profOriginal?.valor_min ? (profOriginal?.valor_formato ?? "a_partir_de") : null);
  const [valorMin, setValorMin] = useState(profOriginal?.valor_min ? String(profOriginal.valor_min) : "");
  const [valorMax, setValorMax] = useState(profOriginal?.valor_max ? String(profOriginal.valor_max) : "");
  const [valorFormatoSec, setValorFormatoSec] = useState<"a_partir_de" | "faixa">(profOriginal?.valor_formato_secundario ?? "a_partir_de");
  const [valorMinSec, setValorMinSec] = useState(profOriginal?.valor_min_secundario ? String(profOriginal.valor_min_secundario) : "");
  const [valorMaxSec, setValorMaxSec] = useState(profOriginal?.valor_max_secundario ? String(profOriginal.valor_max_secundario) : "");
  const [valorPacote, setValorPacote] = useState(profOriginal?.valor_pacote ? String(profOriginal.valor_pacote) : "");
  const [valorPacoteObs, setValorPacoteObs] = useState(profOriginal?.valor_pacote_obs ?? "");
  const [convenio, setConvenio] = useState(profOriginal?.convenio_info ?? "");
  const [whatsapp, setWhatsapp] = useState(profOriginal?.whatsapp_agendamento ?? "");
  const [verificacaoData, setVerificacaoData] = useState(profOriginal?.verificacao_data ?? "");
  const toStatus = (v?: boolean, p?: boolean): VerificacaoStatus => v ? "verificado" : p ? "pendente" : null;
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
  const [experienciasInfantil, setExperienciasInfantil] = useState<ExperienciaInfantil[]>(
    profOriginal?.experiencias_infantil?.length
      ? profOriginal.experiencias_infantil
      : []
  );
  const [genero, setGenero] = useState<"F" | "M" | undefined>(profOriginal?.genero);
  const [convenios, setConvenios] = useState<string[]>(profOriginal?.convenios ?? []);
  const [convenioCustom, setConvenioCustom] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(profOriginal?.foto_url ?? "");
  const [fotoPosicao, setFotoPosicao] = useState(profOriginal?.foto_posicao ?? "center top");
  const [fotoPreview, setFotoPreview] = useState<string | null>(profOriginal?.foto_url ?? null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");

  const [pastaDrive, setPastaDrive] = useState(profOriginal?.pasta_drive ?? "");
  const [certidaoEnviadaEm, setCertidaoEnviadaEm] = useState<string | null>(profOriginal?.certidao_enviada_em ?? null);
  const [oculto, setOculto] = useState(profOriginal?.oculto ?? false);
  const [registroStatus, setRegistroStatus] = useState<VerificacaoStatus>(toStatus(profOriginal?.registro_verificado, profOriginal?.registro_pendente));
  const [registroObs, setRegistroObs] = useState(profOriginal?.registro_obs ?? "");
  const [sobreStatus, setSobreStatus] = useState<VerificacaoStatus>(toStatus(profOriginal?.sobre_verificado, profOriginal?.sobre_pendente));
  const [sobreObs, setSobreObs] = useState(profOriginal?.sobre_obs ?? "");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);

  const PENDENCIAS_PADRAO = `Foto profissional (fundo neutro, rosto nítido, preferencialmente formato quadrado 1:1)
Certidão de regularidade no conselho de classe (atualizada)
Diploma de graduação
Certificados de especialização / residência / pós-graduação`;
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendenciasTexto, setPendenciasTexto] = useState(PENDENCIAS_PADRAO);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [erroEmail, setErroEmail] = useState("");
  const [emailManual, setEmailManual] = useState("");

  async function enviarEmailPendencias() {
    if (!profOriginal?.inscricao_id) { setErroEmail("Sem inscricao_id — não é possível buscar o e-mail."); return; }
    setEnviandoEmail(true); setErroEmail(""); setEmailEnviado(false);
    const res = await fetch("/api/admin/pendencias-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        inscricao_id: profOriginal.inscricao_id,
        pendencias: pendenciasTexto,
        ...(emailManual.trim() ? { email_override: emailManual.trim() } : {}),
      }),
    });
    if (res.ok) { setEmailEnviado(true); setTimeout(() => setShowEmailModal(false), 1800); }
    else {
      const d = await res.json();
      setErroEmail(d.error === "sem_email" ? "sem_email" : (d.error ?? "Erro ao enviar"));
    }
    setEnviandoEmail(false);
  }

  // Autentique
  const [autentiqueDocId, setAutentiqueDocId] = useState<string | null>(null);
  const [autentiqueEnviadoEm, setAutentiqueEnviadoEm] = useState<string | null>(null);
  const [autentiqueStatusData, setAutentiqueStatusData] = useState<{
    signed: boolean; signed_at: string | null; signer_email: string | null;
  } | null>(null);
  const [verificandoTermo, setVerificandoTermo] = useState(false);
  const [enviandoTermo, setEnviandoTermo] = useState(false);
  const [erroTermo, setErroTermo] = useState("");
  const [termoAcao, setTermoAcao] = useState<"" | "enviado" | "verificado">("");

  async function verificarTermo() {
    if (!autentiqueDocId) return;
    setVerificandoTermo(true); setErroTermo(""); setTermoAcao("");
    const res = await fetch(`/api/admin/status-termo?document_id=${autentiqueDocId}`, { credentials: "include" });
    if (res.ok) {
      const d = await res.json();
      setAutentiqueStatusData({ signed: d.signed, signed_at: d.signed_at, signer_email: d.signer_email });
      setTermoAcao("verificado");
    } else {
      setErroTermo("Erro ao consultar Autentique");
    }
    setVerificandoTermo(false);
  }

  async function enviarTermo() {
    if (!profOriginal?.inscricao_id) { setErroTermo("Sem inscricao_id"); return; }
    setEnviandoTermo(true); setErroTermo(""); setTermoAcao("");
    const res = await fetch("/api/admin/enviar-termo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ inscricao_id: profOriginal.inscricao_id }),
    });
    const d = await res.json();
    if (res.ok && d.document_id) {
      setAutentiqueDocId(d.document_id);
      setAutentiqueEnviadoEm(new Date().toISOString());
      setAutentiqueStatusData(null);
      setTermoAcao("enviado");
    } else {
      setErroTermo(d.error ?? "Erro ao enviar termo");
    }
    setEnviandoTermo(false);
  }

  useEffect(() => {
    fetch("/api/admin/inscricoes", { credentials: "include" }).then((r) => {
      if (r.ok) setAuthed(true);
      else setAuthed(false);
    });
  }, []);

  useEffect(() => {
    if (!profOriginal?.inscricao_id) return;
    fetch(`/api/admin/inscricoes?id=${profOriginal.inscricao_id}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.autentique_document_id) setAutentiqueDocId(d.autentique_document_id);
        if (d?.autentique_enviado_em) setAutentiqueEnviadoEm(d.autentique_enviado_em);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profOriginal?.inscricao_id]);

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

  async function salvar(e: React.FormEvent, publicarSemPendentes = false) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso("");

    const areasLista = areas.split(",").map((a) => titleCasePT(a.trim().toLowerCase())).filter(Boolean);
    const valorMinNum = parseInt(valorMin.replace(/\D/g, ""), 10);
    const valorMaxNum = valorMax ? parseInt(valorMax.replace(/\D/g, ""), 10) : null;

    const payload: Partial<Profissional> & { id: string } = {
      id,
      nome: nome.trim(),
      profissao: profissao.trim(),
      profissao_secundaria: profissaoSecundaria.trim() || null,
      titulo_exibicao: tituloExibicao.trim(),
      registro_conselho: registro.trim() || null,
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
          oculto: (publicarSemPendentes && f.status === "pendente") || undefined,
          obs: f.obs,
        })),
      valor_formato: valorFormato ?? "a_partir_de",
      valor_min: valorFormato && !isNaN(valorMinNum) ? valorMinNum : null,
      valor_max: valorFormato === "faixa" && valorMaxNum && !isNaN(valorMaxNum) ? valorMaxNum : null,
      valor_formato_secundario: profissaoSecundaria ? valorFormatoSec : null,
      valor_min_secundario: (() => { const n = parseInt(valorMinSec.replace(/\D/g, ""), 10); return profissaoSecundaria && !isNaN(n) ? n : null; })(),
      valor_max_secundario: (() => { const n = parseInt(valorMaxSec.replace(/\D/g, ""), 10); return profissaoSecundaria && valorFormatoSec === "faixa" && !isNaN(n) ? n : null; })(),
      valor_pacote: (() => { const n = parseInt(valorPacote.replace(/\D/g, ""), 10); return !isNaN(n) && n > 0 ? n : null; })(),
      valor_pacote_obs: valorPacoteObs.trim() || null,
      convenio_info: convenio.trim(),
      convenios: convenios.length ? convenios : null,
      whatsapp_agendamento: whatsapp.trim() || null,
      verificacao_data: verificacaoData.trim().toLowerCase(),
      foto_url: fotoUrl || null,
      foto_posicao: fotoPosicao || null,
      genero: genero ?? undefined,
      oculto: oculto,
      registro_verificado: registroStatus === "verificado",
      registro_pendente: registroStatus === "pendente" || undefined,
      registro_obs: registroObs.trim() || undefined,
      sobre_verificado: sobreStatus === "verificado",
      sobre_pendente: sobreStatus === "pendente" || undefined,
      sobre_obs: sobreObs.trim() || undefined,
      experiencias_infantil: experienciasInfantil.filter(e => e.descricao.trim()).length
        ? experienciasInfantil.filter(e => e.descricao.trim()).map(e => ({ descricao: e.descricao.trim(), tempo: e.tempo?.trim() || undefined, faixa_etaria: e.faixa_etaria?.trim() || undefined }))
        : null,
      pasta_drive: pastaDrive.trim() || null,
      certidao_enviada_em: certidaoEnviadaEm || null,
    };

    try {
      const res = await fetch("/api/admin/profissionais", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSucesso(publicarSemPendentes ? "Publicado! Itens com verificação pendente foram ocultados. O site atualiza em ~1 min." : "Salvo! O site atualiza em ~1 min.");
        setTimeout(() => router.push("/admin?aba=profissionais"), 2500);
      } else {
        const err = await res.json().catch(() => ({}));
        setErro(err.error ?? `Erro ${res.status} ao salvar`);
      }
    } catch (err) {
      setErro(`Erro de rede: ${err instanceof Error ? err.message : "tente novamente"}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-[13px] font-semibold text-ardosia no-underline">← Admin</Link>
        <span className="text-[13px] text-muted">/ Editar profissional</span>
        <div className="flex items-center gap-2 ml-auto">
          {pastaDrive ? (
            <a
              href={pastaDrive}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ardosia-escura bg-wash-azulado border border-borda-azulada rounded-[8px] px-3 py-1.5 no-underline hover:opacity-80 transition-opacity"
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path d="M10 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" stroke="#44606C" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13 2h5v5M18 2l-8 8" stroke="#44606C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pasta no Drive
            </a>
          ) : null}
          <KiriLogoCompact height={28} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="font-serif text-[20px] font-semibold text-carvao bg-transparent border-b border-linha outline-none focus:border-ardosia w-full pb-0.5"
            />
            <div className="text-[13px] text-muted mt-1">{profOriginal.id}</div>
          </div>
          <Link
            href={`/profissional/${profOriginal.id}`}
            target="_blank"
            className="ml-auto flex-none text-[13px] font-medium text-ardosia no-underline"
          >
            Ver perfil ↗
          </Link>
        </div>
        <form onSubmit={salvar} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 items-start">

          {/* COLUNA ESQUERDA — identidade, credenciais, localização */}
          <div className="flex flex-col gap-4">

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

          {/* Segunda profissão */}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Segunda profissão <span className="font-normal text-muted">(opcional)</span></label>
            <select
              value={profissaoSecundaria ?? ""}
              onChange={(e) => setProfissaoSecundaria(e.target.value)}
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
            >
              <option value="">— nenhuma —</option>
              {PROFISSOES_ORDENADAS.filter((p) => p !== profissao).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Valor — segunda profissão */}
          {profissaoSecundaria && (
            <div className="flex flex-col gap-2 pl-4 border-l-2 border-linha">
              <label className="text-[12.5px] font-medium text-cinza-texto">Valor como {profissaoSecundaria} <span className="font-normal text-muted">(opcional)</span></label>
              <div className="flex gap-3">
                {(["a_partir_de", "faixa"] as const).map((fmt) => (
                  <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={valorFormatoSec === fmt} onChange={() => setValorFormatoSec(fmt)} className="accent-ardosia-escura" />
                    <span className="text-[13.5px] text-carvao">{fmt === "a_partir_de" ? "A partir de" : "Faixa"}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[12px] text-cinza-texto">{valorFormatoSec === "faixa" ? "Valor mínimo" : "Valor (R$)"}</label>
                  <input type="text" value={valorMinSec} onChange={(e) => setValorMinSec(e.target.value)}
                    placeholder="ex: 250"
                    className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors" />
                </div>
                {valorFormatoSec === "faixa" && (
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[12px] text-cinza-texto">Valor máximo</label>
                    <input type="text" value={valorMaxSec} onChange={(e) => setValorMaxSec(e.target.value)}
                      placeholder="ex: 400"
                      className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sufixo profissional — só para profissões com conjugação M/F distinta */}
          {["Neuropsicólogo", "Psicólogo", "Fonoaudiólogo", "Psicopedagogo"].includes(profissao) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium text-cinza-texto">
                Sufixo profissional <span className="text-[11px] text-muted">(ex: Psicóloga vs Psicólogo)</span>
              </label>
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
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">Título de exibição (ex: Psiquiatra da infância e adolescência)</label>
            <input type="text" value={tituloExibicao} onChange={(e) => setTituloExibicao(e.target.value)} required
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors" />
          </div>

          {/* Registro no conselho — com checkbox de verificação */}
          <div className="flex flex-col gap-1">
            <label className="text-[12.5px] font-medium text-cinza-texto">
              Registro no conselho
              {profissao === "Psicopedagogo" && <span className="ml-1 text-[11px] font-normal text-muted">(opcional — não há conselho de psicopedagogia)</span>}
            </label>
            {profissao === "Psicopedagogo" && (
              <p className="text-[11.5px] text-ambar-texto bg-[#FFF8ED] border border-[#E0A55E]/30 rounded-[8px] px-3 py-2 mb-1 leading-[1.5]">
                Psicopedagogia não tem conselho regulamentador. O CBO (Classificação Brasileira de Ocupações) não é um registro de conselho — pode deixar em branco ou registrar outro vínculo profissional, se houver.
              </p>
            )}
            <input type="text" value={registro} onChange={(e) => setRegistro(e.target.value)}
              required={profissao !== "Psicopedagogo"}
              placeholder={profissao === "Psicopedagogo" ? "Deixe em branco ou informe outro vínculo" : ""}
              className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted" />
            {(() => {
              const links: { label: string; url: string }[] = [];
              if (profissao === "Fonoaudiólogo") {
                links.push({ label: "CRFa-SP", url: "https://crfa-sp.implanta.net.br/servicosonline/Publico/ConsultaInscritos/" });
                links.push({ label: "CRFa-4 (Bahia)", url: "https://crefono4.conselho24horas.com.br/pesquisaprofissional" });
              }
              if (["Terapeuta ocupacional", "Fisioterapeuta"].includes(profissao))
                links.push({ label: "CREFITO-3", url: "https://www.crefito3.org.br/dsn/consultapf/buscas.html" });
              if (["Psiquiatra", "Psiquiatra da infância e adolescência", "Neuropediatra", "Neurologista"].includes(profissao)) {
                links.push({ label: "CFM", url: "https://portal.cfm.org.br/busca-medicos/" });
              }
              if (profissao === "Nutricionista")
                links.push({ label: "CFN", url: "https://cfn.org.br/consulta-nacional-de-nutricionistas/" });

              const isCRP = ["Psicólogo", "Neuropsicólogo"].includes(profissao);
              if (isCRP)
                links.push({ label: "CFP (busca por nome)", url: "https://cadastro.cfp.org.br/" });

              if (links.length === 0) return null;
              return (
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[11px] text-cinza-texto2 font-medium uppercase tracking-wide">
                    {isCRP ? "Verificar no CRP — busca feita pelo nome do profissional:" : "Verificar no conselho — copie o número acima e busque:"}
                  </span>
                  <div className="flex gap-2 flex-wrap items-center">
                    {links.map(l => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-ardosia text-[12px] text-ardosia hover:bg-ardosia hover:text-white transition-colors">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                  {isCRP && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11.5px] text-muted whitespace-nowrap">Nome para busca:</span>
                      <input
                        type="text"
                        readOnly
                        value={nome}
                        className="border border-linha rounded-[8px] px-2.5 py-1 text-[13px] text-carvao bg-[#F9F6F1] outline-none flex-1 cursor-text select-all"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
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
              {label.includes("WhatsApp") && value.trim() && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(value.trim())}
                  className="self-start text-[12px] font-semibold text-ardosia cursor-pointer hover:opacity-70 transition-opacity"
                >
                  Copiar número
                </button>
              )}
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

          </div>{/* /coluna esquerda */}

          {/* COLUNA DIREITA — conteúdo, valor, formação */}
          <div className="flex flex-col gap-4">

          {/* Valor */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">Formato do valor <span className="font-normal text-muted">(clique novamente para remover)</span></label>
            <div className="flex gap-3">
              {(["a_partir_de", "faixa"] as const).map((fmt) => (
                <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={valorFormato === fmt}
                    onChange={() => setValorFormato(fmt)}
                    onClick={() => { if (valorFormato === fmt) setValorFormato(null); }}
                    className="accent-ardosia-escura"
                  />
                  <span className="text-[13.5px] text-carvao">{fmt === "a_partir_de" ? "A partir de" : "Faixa"}</span>
                </label>
              ))}
            </div>
            {valorFormato && (
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
            )}
          </div>

          {/* Valor por pacote */}
          <div className="flex flex-col gap-2 bg-wash border border-linha rounded-[12px] px-4 py-3">
            <label className="text-[12.5px] font-medium text-cinza-texto">Valor por pacote <span className="font-normal text-muted">(opcional — ex: avaliação neuropsicológica)</span></label>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[12px] text-cinza-texto">Valor total (R$)</label>
                <input
                  type="text"
                  value={valorPacote}
                  onChange={(e) => setValorPacote(e.target.value)}
                  placeholder="ex: 1200"
                  className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-cinza-texto">Descrição do pacote</label>
              <input
                type="text"
                value={valorPacoteObs}
                onChange={(e) => setValorPacoteObs(e.target.value)}
                placeholder="ex: valor total da avaliação neuropsicológica"
                className="border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
              />
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
                <div className="flex flex-wrap gap-1.5 items-center">
                  <input list="tipos-formacao" placeholder="Tipo" value={f.tipo}
                    onChange={(e) => { const n = [...formacao]; n[i] = { ...n[i], tipo: e.target.value }; setFormacao(n); }}
                    className="w-[120px] flex-none border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                  />
                  <input type="text" placeholder="Área" value={f.area}
                    onChange={(e) => { const n = [...formacao]; n[i] = { ...n[i], area: e.target.value }; setFormacao(n); }}
                    className="flex-1 min-w-[130px] border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                  />
                  <input type="text" placeholder="Instituição" value={f.instituicao}
                    onChange={(e) => { const n = [...formacao]; n[i] = { ...n[i], instituicao: e.target.value }; setFormacao(n); }}
                    className="flex-1 min-w-[130px] border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
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
                {/^[A-Za-z]{2,8}$/.test(f.instituicao.trim()) && (
                  <p className="text-[11.5px] text-amber-600 pl-1 mt-0.5">
                    ⚠ Sigla sem nome completo — especifique a instituição, ex: &quot;Faculdade X ({f.instituicao.trim().toUpperCase()})&quot;
                  </p>
                )}
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

          {/* Experiências de atendimento infantil */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">
              Experiências de atendimento infantil <span className="text-[11px] text-muted">(opcional)</span>
            </label>
            {experienciasInfantil.map((exp, i) => (
              <div key={i} className="flex gap-1.5 items-start">
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Descrição (ex: Atendimento domiciliar de crianças com TEA)"
                    value={exp.descricao}
                    onChange={(e) => { const n = [...experienciasInfantil]; n[i] = { ...n[i], descricao: e.target.value }; setExperienciasInfantil(n); }}
                    className="border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted w-full"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Tempo (ex: 3 anos)"
                      value={exp.tempo ?? ""}
                      onChange={(e) => { const n = [...experienciasInfantil]; n[i] = { ...n[i], tempo: e.target.value }; setExperienciasInfantil(n); }}
                      className="flex-1 border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                    />
                    <input
                      type="text"
                      placeholder="Faixa etária (ex: 2–10 anos)"
                      value={exp.faixa_etaria ?? ""}
                      onChange={(e) => { const n = [...experienciasInfantil]; n[i] = { ...n[i], faixa_etaria: e.target.value }; setExperienciasInfantil(n); }}
                      className="flex-1 border border-linha rounded-[10px] px-2.5 py-[9px] text-[13px] text-carvao bg-white outline-none focus:border-ardosia placeholder:text-muted"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExperienciasInfantil(experienciasInfantil.filter((_, j) => j !== i))}
                  className="text-[18px] text-muted cursor-pointer leading-none flex-none mt-2"
                >×</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setExperienciasInfantil([...experienciasInfantil, { descricao: "", tempo: "", faixa_etaria: "" }])}
              className="text-[13px] text-ardosia font-semibold text-left cursor-pointer"
            >
              + Adicionar experiência
            </button>
          </div>

          {/* Convênios */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-cinza-texto">
              Convênios atendidos <span className="text-[11px] text-muted">(opcional)</span>
            </label>

            {/* Chips dos selecionados */}
            {convenios.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {convenios.map((conv) => (
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
            )}

            {/* Predefinidos expandíveis */}
            {showPresets && (
              <div className="flex flex-wrap gap-2">
                {CONVENIOS_COMUNS.filter((c) => !convenios.includes(c)).map((conv) => (
                  <button
                    key={conv}
                    type="button"
                    onClick={() => { setConvenios((prev) => [...prev, conv]); }}
                    className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium border bg-white text-carvao border-linha cursor-pointer hover:border-ardosia transition-colors"
                  >
                    {conv}
                  </button>
                ))}
              </div>
            )}

            {/* Input customizado + botão de expandir predefinidos */}
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
            <button
              type="button"
              onClick={() => setShowPresets((v) => !v)}
              className="text-[12px] text-ardosia font-medium text-left cursor-pointer w-fit"
            >
              {showPresets ? "▲ Ocultar opções comuns" : "▾ Selecionar convênio comum"}
            </button>
          </div>

          </div>{/* /coluna direita */}
          </div>{/* /grid */}

          {/* Rodapé compacto */}
          <div className="flex flex-col gap-2 pt-2 border-t border-linha">

            {/* Linha 1: certidão + solicitar + termo + status */}
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">

              {/* Certidão */}
              <button
                type="button"
                onClick={() => setCertidaoEnviadaEm(certidaoEnviadaEm ? null : new Date().toISOString())}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-[10px] rounded-[10px] border text-[13px] font-medium transition-colors cursor-pointer ${
                  certidaoEnviadaEm ? "bg-[#F0FAF3] border-[#B8D8C0] text-[#2E7D4F]" : "bg-white border-linha text-muted hover:border-ardosia"
                }`}
              >
                <span className={`flex-none w-[15px] h-[15px] rounded-[4px] border-2 flex items-center justify-center ${
                  certidaoEnviadaEm ? "bg-ardosia-escura border-ardosia-escura" : "bg-white border-current"
                }`}>
                  {certidaoEnviadaEm && <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                Certidão de regularidade enviada
                {certidaoEnviadaEm && <span className="text-[11.5px] opacity-70 font-normal">· {new Date(certidaoEnviadaEm).toLocaleDateString("pt-BR")}</span>}
              </button>

              {/* Solicitar docs */}
              <button
                type="button"
                onClick={() => { setPendenciasTexto(PENDENCIAS_PADRAO); setEmailEnviado(false); setErroEmail(""); setEmailManual(""); setShowEmailModal(true); }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-[10px] rounded-[10px] border border-linha bg-white text-[13px] font-medium text-ardosia hover:bg-wash cursor-pointer transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Solicitar documentos pendentes por e-mail
              </button>

              {/* Termo de adesão inline */}
              {profOriginal?.inscricao_id && (
                <div className="flex items-center gap-1.5 px-3 py-[10px] rounded-[10px] border border-linha bg-white">
                  <span className="text-[13px] font-semibold text-carvao">Termo:</span>
                  {autentiqueDocId ? (
                    autentiqueStatusData?.signed ? (
                      <span className="text-[11.5px] font-semibold text-verde-confirmacao bg-[#E8F5EE] px-2 py-0.5 rounded-full">✓ Assinado</span>
                    ) : (
                      <span className="text-[11.5px] font-semibold text-[#9A6A00] bg-[#FFF3CD] px-2 py-0.5 rounded-full">Aguardando</span>
                    )
                  ) : (
                    <span className="text-[11.5px] font-semibold text-ferrugem bg-[#FCF0EB] px-2 py-0.5 rounded-full">Não enviado</span>
                  )}
                  {autentiqueDocId && (
                    <button type="button" onClick={verificarTermo} disabled={verificandoTermo}
                      className="text-[12px] font-semibold text-ardosia border border-ardosia/50 rounded-[6px] px-2 py-0.5 cursor-pointer hover:bg-wash transition-colors disabled:opacity-50">
                      {verificandoTermo ? "…" : "Verificar"}
                    </button>
                  )}
                  <button type="button" onClick={enviarTermo} disabled={enviandoTermo}
                    className="text-[12px] font-semibold text-white bg-ferrugem rounded-[6px] px-2 py-0.5 cursor-pointer hover:bg-[#A85C3E] transition-colors disabled:opacity-50">
                    {enviandoTermo ? "…" : autentiqueDocId ? "Reenviar" : "Enviar termo"}
                  </button>
                </div>
              )}

              {/* Status — último item */}
              <div className="flex items-center gap-1.5 flex-none">
                <span className="text-[13px] font-medium text-muted">Status:</span>
                <div className="flex rounded-[9px] border border-linha overflow-hidden">
                  <button type="button" onClick={() => setOculto(true)}
                    className={`px-3 py-[10px] text-[13px] font-semibold transition-colors cursor-pointer ${oculto ? "bg-ferrugem text-white" : "bg-white text-muted hover:bg-wash"}`}>
                    Oculto
                  </button>
                  <button type="button" onClick={() => setOculto(false)}
                    className={`px-3 py-[10px] text-[13px] font-semibold transition-colors cursor-pointer border-l border-linha ${!oculto ? "bg-ardosia-escura text-white" : "bg-white text-muted hover:bg-wash"}`}>
                    Visível
                  </button>
                </div>
              </div>
            </div>

            {/* Avisos do termo */}
            {erroTermo && <p className="text-[11px] text-ferrugem">{erroTermo}</p>}
            {termoAcao === "enviado" && <p className="text-[11px] text-verde-confirmacao font-semibold">Termo enviado com sucesso!</p>}
            {autentiqueEnviadoEm && (
              <p className="text-[11px] text-muted">
                Termo enviado em {new Date(autentiqueEnviadoEm).toLocaleDateString("pt-BR")}
                {autentiqueStatusData?.signed && autentiqueStatusData.signed_at && <> · Assinado em {new Date(autentiqueStatusData.signed_at).toLocaleDateString("pt-BR")}</>}
              </p>
            )}

            {/* Linha 2: Drive */}
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <path d="M10 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13 2h5v5M18 2l-8 8" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="url"
                value={pastaDrive}
                onChange={(e) => setPastaDrive(e.target.value)}
                placeholder="Link da pasta do Drive (cole aqui)"
                className="flex-1 text-[12px] text-carvao placeholder:text-muted bg-transparent border-b border-linha outline-none focus:border-ardosia py-0.5"
              />
            </div>

            {erro && <p className="text-[12px] text-ferrugem">{erro}</p>}
            {sucesso && <p className="text-[12px] text-verde-confirmacao font-semibold">{sucesso}</p>}

            {/* Linha 3: Salvar + Publicar */}
            <div className="flex gap-3">
              <button type="submit" disabled={salvando}
                className="flex-1 bg-ardosia-escura text-white font-semibold text-[14px] rounded-[10px] py-[11px] cursor-pointer disabled:opacity-50">
                {salvando ? "Salvando…" : "Salvar"}
              </button>
              <button type="button" disabled={salvando}
                onClick={(e) => salvar(e as unknown as React.FormEvent, true)}
                className="flex-1 bg-white border border-ardosia text-ardosia font-semibold text-[13px] rounded-[10px] py-[11px] cursor-pointer disabled:opacity-50">
                {salvando ? "Publicando…" : "Publicar (sem pendentes)"}
              </button>
            </div>
          </div>
        </form>

        {/* Modal email pendências */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(44,39,34,0.5)" }}>
            <div className="bg-creme rounded-[18px] max-w-[460px] w-full px-7 py-6 shadow-xl relative">
              <button onClick={() => setShowEmailModal(false)} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-muted hover:text-carvao cursor-pointer">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              <div className="text-[16px] font-semibold text-carvao mb-1">Solicitar documentos pendentes</div>
              <div className="text-[12.5px] text-muted mb-4">Edite os itens abaixo — cada linha vira um bullet no e-mail enviado ao profissional.</div>
              <textarea
                value={pendenciasTexto}
                onChange={(e) => setPendenciasTexto(e.target.value)}
                rows={6}
                className="w-full border border-linha rounded-[10px] px-3.5 py-3 text-[13.5px] text-carvao bg-white outline-none focus:border-ardosia transition-colors resize-none mb-4"
              />
              {erroEmail === "sem_email" ? (
                <div className="mb-4">
                  <p className="text-[12.5px] text-ferrugem mb-2">Profissional sem e-mail cadastrado no formulário. Informe o e-mail manualmente:</p>
                  <input
                    type="email"
                    value={emailManual}
                    onChange={(e) => setEmailManual(e.target.value)}
                    placeholder="email@profissional.com.br"
                    className="w-full border border-ferrugem rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors"
                    autoFocus
                  />
                </div>
              ) : erroEmail ? (
                <p className="text-[12.5px] text-ferrugem mb-3">{erroEmail}</p>
              ) : null}
              {emailEnviado && <p className="text-[12.5px] text-verde-confirmacao font-semibold mb-3">E-mail enviado!</p>}
              <button
                onClick={enviarEmailPendencias}
                disabled={enviandoEmail || !pendenciasTexto.trim() || (erroEmail === "sem_email" && !emailManual.trim())}
                className="w-full bg-ardosia text-white font-semibold text-[14px] rounded-[11px] py-[13px] cursor-pointer disabled:opacity-50 transition-opacity"
              >
                {enviandoEmail ? "Enviando…" : "Enviar e-mail"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
