"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";
import { PROFISSOES_ORDENADAS } from "@/types";

const PROFISSOES = [...PROFISSOES_ORDENADAS];
const AREAS = ["TEA", "TDAH", "Atraso de desenvolvimento", "Comunicação aumentativa", "Dificuldades de aprendizagem", "Ansiedade", "Depressão", "TOC"];
const FAIXAS = ["Bebês (0–2 anos)", "Pré-escola (3–5 anos)", "Crianças (6–12 anos)", "Adolescentes (13–18 anos)"];
const CONVENIOS_LISTA = ["Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro Saúde", "Hapvida", "Notre Dame Intermédica", "Prevent Senior", "Golden Cross", "Care Plus", "Omint", "Assim Saúde"];

function formatarWhatsapp(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function BlockTitle({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 mb-1 border-b border-[#E2D6C0]">
      <span className="font-bold text-ferrugem text-[15px] leading-none">{num}.</span>
      <h2 className="text-[17px] font-semibold text-carvao m-0">{title}</h2>
    </div>
  );
}

export default function InscricaoProfissionalPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState<"M" | "F" | "">("");
  const [profissao, setProfissao] = useState("");
  const [profissaoSecundaria, setProfissaoSecundaria] = useState("");
  const [registroConselho, setRegistroConselho] = useState("");
  const [rqe, setRqe] = useState("");
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>([]);
  const [faixaEtaria, setFaixaEtaria] = useState<string[]>([]);
  const [tempoAtuacao, setTempoAtuacao] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [regioesSP, setRegioesSP] = useState<string[]>([]);

  const REGIOES_SP = ["Centro", "Norte", "Sul", "Leste", "Oeste"];
  const isSaoPaulo = cidade.toLowerCase().includes("são paulo") || cidade.toLowerCase().includes("sao paulo");

  function toggleRegiao(regiao: string) {
    setRegioesSP((prev) => prev.includes(regiao) ? prev.filter((r) => r !== regiao) : [...prev, regiao]);
  }
  const [valorMedio, setValorMedio] = useState("");
  const [aceitaConvenio, setAceitaConvenio] = useState("");
  const [conveniosSelecionados, setConveniosSelecionados] = useState<string[]>([]);
  const [convenioOutro, setConvenioOutro] = useState("");
  const [graduacaoCurso, setGraduacaoCurso] = useState("");
  const [graduacaoInstituicao, setGraduacaoInstituicao] = useState("");
  const [graduacaoAno, setGraduacaoAno] = useState("");
  const [posGraduacoes, setPosGraduacoes] = useState([{ tipo: "", titulo: "", instituicao: "", ano: "" }]);
  const [mestrados, setMestrados] = useState([{ tipo: "", titulo: "", instituicao: "", ano: "" }]);
  const [apresentacao, setApresentacao] = useState("");
  const [sitePerfil, setSitePerfil] = useState("");
  const [lattes, setLattes] = useState("");
  const [email, setEmail] = useState("");
  const [comoConheceu, setComoConheceu] = useState("");
  const [whatsappAgendamento, setWhatsappAgendamento] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [grupoWhatsapp, setGrupoWhatsapp] = useState(false);
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const [areaCustom, setAreaCustom] = useState("");

  const secaoRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const [etapaAtual, setEtapaAtual] = useState(1);

  useEffect(() => {
    function atualizar() {
      const meio = window.scrollY + window.innerHeight * 0.35;
      let etapa = 1;
      secaoRefs.current.forEach((ref, i) => {
        if (ref && ref.getBoundingClientRect().top + window.scrollY <= meio) {
          etapa = i + 1;
        }
      });
      setEtapaAtual(etapa);
    }
    window.addEventListener("scroll", atualizar, { passive: true });
    return () => window.removeEventListener("scroll", atualizar);
  }, []);

  function toggleArea(area: string) {
    setAreasAtuacao((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function adicionarAreaCustom() {
    const termo = areaCustom.trim();
    if (!termo) return;
    if (!areasAtuacao.includes(termo)) {
      setAreasAtuacao((prev) => [...prev, termo]);
    }
    setAreaCustom("");
  }

  function toggleFaixa(faixa: string) {
    setFaixaEtaria((prev) =>
      prev.includes(faixa) ? prev.filter((f) => f !== faixa) : [...prev, faixa]
    );
  }

  function toggleConvenio(nome: string) {
    setConveniosSelecionados((prev) =>
      prev.includes(nome) ? prev.filter((c) => c !== nome) : [...prev, nome]
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!consentimento) {
      setErro("É necessário aceitar o uso dos seus dados para continuar.");
      return;
    }
    if (!graduacaoInstituicao.trim() || !graduacaoAno.trim()) {
      setErro("Preencha a instituição e o ano de conclusão da graduação.");
      return;
    }
    setEnviando(true);
    setErro("");

    try {
      const res = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          genero: genero || null,
          email: email.trim() || null,
          profissao: profissao.trim(),
          profissao_secundaria: profissaoSecundaria.trim() || null,
          registro_conselho: registroConselho.trim(),
          rqe: rqe.trim() || null,
          tempo_atuacao: tempoAtuacao || null,
          areas_atuacao: areasAtuacao.join(", ") || null,
          faixa_etaria: faixaEtaria.join(", ") || null,
          modalidade: modalidade || null,
          cidade: cidade.trim() || null,
          bairro: isSaoPaulo
            ? [regioesSP.length ? `Regiões: ${regioesSP.join(", ")}` : null, bairro.trim() || null].filter(Boolean).join(" — ") || null
            : bairro.trim() || null,
          valor_medio: valorMedio.trim() || null,
          aceita_convenio: aceitaConvenio === "Sim" ? true : aceitaConvenio === "Não" ? false : null,
          convenios_nomes: (() => {
            const lista = [...conveniosSelecionados];
            if (convenioOutro.trim()) lista.push(convenioOutro.trim());
            return lista.length ? lista.join(", ") : null;
          })(),
          graduacao: [graduacaoCurso.trim(), graduacaoInstituicao.trim(), graduacaoAno.trim()].filter(Boolean).join(" — ") || null,
          pos_graduacao: [
            ...posGraduacoes.filter((p) => p.titulo.trim() || p.instituicao.trim()).map((p) => [p.tipo.trim(), p.titulo.trim(), p.instituicao.trim(), p.ano.trim()].filter(Boolean).join(" — ")),
            ...mestrados.filter((m) => m.titulo.trim() || m.tipo.trim()).map((m) => [m.tipo.trim(), m.titulo.trim(), m.instituicao.trim(), m.ano.trim()].filter(Boolean).join(" — ")),
          ].filter(Boolean).join("\n") || null,
          apresentacao: apresentacao.trim() || null,
          site_perfil: sitePerfil.trim() || null,
          lattes: lattes.trim() || null,
          como_conheceu: comoConheceu.trim() || null,
          whatsapp_agendamento: whatsappAgendamento.trim() || null,
          grupo_whatsapp: grupoWhatsapp,
          consentimento: true,
        }),
      });

      if (res.ok) {
        setEnviado(true);
      } else {
        let mensagem = "Ocorreu um erro. Tente novamente.";
        try {
          const data = await res.json();
          mensagem = data.erro ?? mensagem;
        } catch { /* resposta não-JSON */ }
        setErro(mensagem);
      }
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-ardosia/10 flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5 L9.5 17 L19 7" stroke="#44606C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-serif text-[26px] font-medium text-carvao mb-3">Recebemos sua inscrição.</h1>
        <p className="text-[15px] leading-[1.6] text-cinza-texto2 max-w-[320px]">
          Obrigada pelo interesse em fazer parte da Kiri. Analisamos cada perfil individualmente e retornamos em breve.
        </p>
        <button onClick={() => router.push("/")} className="mt-8 text-[14px] font-semibold text-ardosia cursor-pointer">
          ← Voltar ao início
        </button>
      </div>
    );
  }

  const inputClass = "border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted w-full";
  const labelClass = "text-[15px] font-semibold text-carvao";

  return (
    <div className="min-h-screen bg-creme flex flex-col">
      <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between">
        <NavBack />
        <span className="text-[12.5px] font-semibold tracking-[0.04em] text-muted">Inscrição de profissional</span>
        <div className="w-9 h-9" />
      </div>

      {/* Indicador de etapa fixo */}
      <div className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-[#E2D6C0] px-[18px] py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5 items-center">
          {[1, 2, 3, 4].map((e) => (
            <div
              key={e}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                e === etapaAtual ? "w-5 bg-ardosia-escura" : e < etapaAtual ? "w-2 bg-ardosia/50" : "w-2 bg-[#D8C7B0]"
              }`}
            />
          ))}
        </div>
        <span className="text-[12px] font-medium text-cinza-texto2">Etapa {etapaAtual} de 4</span>
      </div>

      <div className="max-w-2xl mx-auto w-full flex-1 px-[18px]">
        {/* Cabeçalho — alinhado à esquerda */}
        <div className="pt-8 pb-2 flex flex-col items-start text-left">
          <h1 className="font-serif text-[28px] font-medium leading-[1.25] text-carvao m-0">Faça parte da rede Kiri</h1>
          <p className="text-[15.5px] leading-[1.55] text-cinza-texto2 mt-3 mb-0">
            Analisamos cada inscrição individualmente. Se o seu perfil atender aos nossos critérios, entraremos em contato em breve.
          </p>
        </div>

        {/* O que verificamos — ícone único no título */}
        <div className="mt-5 bg-[#FAF0E4] border border-[#E8DDD0] rounded-[14px] px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="8.4" stroke="#BE6E4E" strokeWidth="1.3" />
              <path d="M6.3 10.2 L8.8 12.7 L13.8 7" stroke="#BE6E4E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8A6A40]">O que verificamos</div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              "Registro ativo e regular no conselho (CRM, CRP, CFFa, COFFITO ou CRN)",
              "Formação na área e atuação em neurodesenvolvimento infantil",
              "Verificação dos títulos e formações de cada profissional",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="text-[#BE6E4E] text-[18px] leading-[1.1] mt-[-2px]">·</span>
                <span className="text-[13.5px] leading-[1.5] text-carvao">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={enviar} className="mt-8 flex flex-col gap-10 pb-12">

          {/* ── 1. Dados pessoais ── */}
          <div
            className="flex flex-col gap-5"
            ref={(el) => { secaoRefs.current[0] = el; }}
          >
            <BlockTitle num={1} title="Dados pessoais" />

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nome completo <span className="text-ferrugem">*</span></label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Como aparecerá no perfil" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Pronome profissional <span className="text-[12px] font-normal text-muted">(para exibir "Psicóloga" em vez de "Psicólogo", por exemplo)</span></label>
              <div className="flex gap-2">
                {(["M", "F"] as const).map((g) => (
                  <button key={g} type="button"
                    onClick={() => setGenero(genero === g ? "" : g)}
                    className={`px-4 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${genero === g ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                    {g === "M" ? "Masculino" : "Feminino"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>E-mail <span className="text-ferrugem">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className={inputClass}
              />
              <p className="text-[12px] text-muted leading-[1.5]">
                Usado pela equipe Kiri para solicitar documentos e comunicar o andamento da inscrição. Não aparecerá no perfil público.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>WhatsApp para agendamento <span className="text-ferrugem">*</span></label>
              <input
                type="tel"
                value={whatsappAgendamento}
                onChange={(e) => setWhatsappAgendamento(formatarWhatsapp(e.target.value))}
                required
                placeholder="(11) 99999-9999"
                className={inputClass}
              />
              <p className="text-[12px] text-muted leading-[1.5]">
                Número que a Kiri usará para encaminhar as famílias diretamente para você. Não aparecerá no seu perfil público.
              </p>
            </div>
          </div>

          {/* ── 2. Formação ── */}
          <div
            className="flex flex-col gap-5"
            ref={(el) => { secaoRefs.current[1] = el; }}
          >
            <BlockTitle num={2} title="Formação" />

            <div className="bg-wash-azulado border border-borda-azulada rounded-[14px] px-4 py-4">
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto mb-2">Comprovação de formação</div>
              <p className="text-[13.5px] leading-[1.6] text-ardosia-escura">
                Os documentos que comprovem as formações e especializações listadas abaixo serão solicitados pela equipe Kiri após o contato inicial. O envio ocorre em etapa posterior ao preenchimento deste formulário.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Profissão <span className="text-ferrugem">*</span></label>
              <div className="flex flex-wrap gap-2">
                {PROFISSOES.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setProfissao(profissao === op ? "" : op)}
                    className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${
                      profissao === op
                        ? "bg-ardosia-escura text-white border-ardosia-escura"
                        : "bg-white text-carvao border-linha"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
              {profissao && (
                <div className="mt-2">
                  <p className="text-[13px] text-muted mb-1.5">Segunda profissão <span className="font-normal">(opcional)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {PROFISSOES.filter((op) => op !== profissao).map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setProfissaoSecundaria(profissaoSecundaria === op ? "" : op)}
                        className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${
                          profissaoSecundaria === op
                            ? "bg-ardosia text-white border-ardosia"
                            : "bg-white text-cinza-texto border-linha"
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Número de registro no conselho <span className="text-ferrugem">*</span></label>
              <input type="text" value={registroConselho} onChange={(e) => setRegistroConselho(e.target.value)} required placeholder="Ex: CRP 06/12345 ou CRM 123456-SP" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>RQE <span className="text-[12px] font-normal text-muted">(somente médicos com especialidade)</span></label>
              <input type="text" value={rqe} onChange={(e) => setRqe(e.target.value)} placeholder="Ex: RQE 28714" className={inputClass} />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Graduação <span className="text-ferrugem">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11.5px] font-medium text-muted">Área de graduação <span className="text-ferrugem">*</span></span>
                  <input type="text" value={graduacaoCurso} onChange={(e) => setGraduacaoCurso(e.target.value)} required placeholder="Ex: Psicologia" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11.5px] font-medium text-muted">Instituição de graduação <span className="text-ferrugem">*</span></span>
                  <input type="text" value={graduacaoInstituicao} onChange={(e) => setGraduacaoInstituicao(e.target.value)} required placeholder="Ex: USP" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11.5px] font-medium text-muted">Ano de conclusão <span className="text-ferrugem">*</span></span>
                  <input type="text" value={graduacaoAno} onChange={(e) => setGraduacaoAno(e.target.value)} required placeholder="Ex: 2015" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Pós-graduação, residência, especialização ou certificação</label>
              {posGraduacoes.map((p, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_1fr_90px] gap-2">
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Categoria</span>}
                    <select value={p.tipo}
                      onChange={(e) => { const n = [...posGraduacoes]; n[i] = { ...n[i], tipo: e.target.value }; setPosGraduacoes(n); }}
                      className="border border-linha rounded-[12px] px-3 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors w-full cursor-pointer">
                      <option value="">Selecionar…</option>
                      <option value="Especialização">Especialização</option>
                      <option value="Pós-graduação">Pós-graduação</option>
                      <option value="Certificação">Certificação</option>
                      <option value="Certificação Internacional">Certificação Internacional</option>
                      <option value="Residência Médica">Residência Médica</option>
                      <option value="Formação">Formação</option>
                      <option value="Aperfeiçoamento">Aperfeiçoamento</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Área / título</span>}
                    <input type="text" value={p.titulo}
                      onChange={(e) => { const n = [...posGraduacoes]; n[i] = { ...n[i], titulo: e.target.value }; setPosGraduacoes(n); }}
                      placeholder="Ex: Integração sensorial" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Instituição</span>}
                    <input type="text" value={p.instituicao}
                      onChange={(e) => { const n = [...posGraduacoes]; n[i] = { ...n[i], instituicao: e.target.value }; setPosGraduacoes(n); }}
                      placeholder="Ex: UNIFESP" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Ano</span>}
                    <input type="text" value={p.ano}
                      onChange={(e) => { const n = [...posGraduacoes]; n[i] = { ...n[i], ano: e.target.value }; setPosGraduacoes(n); }}
                      placeholder="Ex: 2022" className={inputClass} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setPosGraduacoes([...posGraduacoes, { tipo: "", titulo: "", instituicao: "", ano: "" }])}
                className="text-[13px] text-ardosia font-semibold text-left cursor-pointer w-fit">
                + Adicionar outra
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Mestrado, doutorado ou pós-doutorado <span className="text-[12px] font-normal text-muted">(opcional)</span></label>
              {mestrados.map((m, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[160px_1fr_1fr_90px] gap-2">
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Categoria</span>}
                    <select value={m.tipo}
                      onChange={(e) => { const n = [...mestrados]; n[i] = { ...n[i], tipo: e.target.value }; setMestrados(n); }}
                      className="border border-linha rounded-[12px] px-3 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors w-full cursor-pointer">
                      <option value="">Selecionar…</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                      <option value="Mestrando">Mestrando</option>
                      <option value="Doutorando">Doutorando</option>
                      <option value="Pós-doutorado">Pós-doutorado</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Área</span>}
                    <input type="text" value={m.titulo}
                      onChange={(e) => { const n = [...mestrados]; n[i] = { ...n[i], titulo: e.target.value }; setMestrados(n); }}
                      placeholder="Ex: Neurociências" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Instituição</span>}
                    <input type="text" value={m.instituicao}
                      onChange={(e) => { const n = [...mestrados]; n[i] = { ...n[i], instituicao: e.target.value }; setMestrados(n); }}
                      placeholder="Ex: UNIFESP" className={inputClass} />
                  </div>
                  <div className="flex flex-col gap-1">
                    {i === 0 && <span className="text-[11.5px] font-medium text-muted">Ano</span>}
                    <input type="text" value={m.ano}
                      onChange={(e) => { const n = [...mestrados]; n[i] = { ...n[i], ano: e.target.value }; setMestrados(n); }}
                      placeholder="Ex: 2018" className={inputClass} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setMestrados([...mestrados, { tipo: "", titulo: "", instituicao: "", ano: "" }])}
                className="text-[13px] text-ardosia font-semibold text-left cursor-pointer w-fit">
                + Adicionar outro
              </button>
            </div>

            {/* Campos opcionais de formação */}
            <div className="bg-[#F5F2EE] rounded-[12px] px-4 py-4 flex flex-col gap-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted">Currículo (opcional)</span>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Currículo Lattes</label>
                <input type="text" value={lattes} onChange={(e) => setLattes(e.target.value)} placeholder="http://lattes.cnpq.br/..." className={inputClass} />
              </div>
            </div>
          </div>

          {/* ── 3. Atuação profissional ── */}
          <div
            className="flex flex-col gap-5"
            ref={(el) => { secaoRefs.current[2] = el; }}
          >
            <BlockTitle num={3} title="Atuação profissional" />

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Tempo de atuação na área <span className="text-ferrugem">*</span></label>
              <div className="flex flex-wrap gap-2">
                {["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"].map((op) => (
                  <button key={op} type="button" onClick={() => setTempoAtuacao(tempoAtuacao === op ? "" : op)}
                    className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${tempoAtuacao === op ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Áreas de atuação <span className="text-ferrugem">*</span></label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((area) => (
                  <button key={area} type="button" onClick={() => toggleArea(area)}
                    className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${areasAtuacao.includes(area) ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                    {area}
                  </button>
                ))}
                {areasAtuacao.filter((a) => !AREAS.includes(a)).map((area) => (
                  <button key={area} type="button" onClick={() => toggleArea(area)}
                    className="px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer bg-ardosia-escura text-white border-ardosia-escura flex items-center gap-1.5">
                    {area}
                    <span className="text-white/70 text-[15px] leading-none">×</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={areaCustom}
                  onChange={(e) => setAreaCustom(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarAreaCustom(); } }}
                  placeholder="Outra área (ex: Estimulação precoce)…"
                  className="flex-1 border border-linha rounded-[10px] px-3.5 py-[10px] text-[14px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={adicionarAreaCustom}
                  disabled={!areaCustom.trim()}
                  className="px-4 py-[10px] rounded-[10px] text-[13.5px] font-semibold bg-ardosia-escura text-white border border-ardosia-escura cursor-pointer disabled:opacity-40 transition-opacity"
                >
                  + Adicionar
                </button>
              </div>
              <p className="text-[12.5px] text-muted leading-[1.55]">
                Algumas áreas exigem formação específica além da graduação — nesses casos, o certificado correspondente será solicitado na etapa de envio de documentos.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Faixa etária atendida <span className="text-ferrugem">*</span></label>
              <div className="flex flex-wrap gap-2">
                {FAIXAS.map((faixa) => (
                  <button key={faixa} type="button" onClick={() => toggleFaixa(faixa)}
                    className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${faixaEtaria.includes(faixa) ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                    {faixa}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Modalidade de atendimento <span className="text-ferrugem">*</span></label>
              <div className="flex gap-2 flex-wrap">
                {["Presencial", "Online", "Presencial e online"].map((op) => (
                  <button key={op} type="button" onClick={() => setModalidade(modalidade === op ? "" : op)}
                    className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${modalidade === op ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Cidade de atendimento presencial <span className="text-ferrugem">*</span></label>
              <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo, SP" className={inputClass} />
            </div>

            {isSaoPaulo && (
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Região de atendimento <span className="text-ferrugem">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {REGIOES_SP.map((r) => (
                    <button key={r} type="button" onClick={() => toggleRegiao(r)}
                      className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${regioesSP.includes(r) ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Bairro <span className="text-[12px] font-normal text-muted">(opcional)</span></label>
              <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder={isSaoPaulo ? "Ex: Pinheiros, Moema…" : "Ex: Pinheiros"} className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Valor médio da consulta <span className="text-[12px] font-normal text-muted">(opcional)</span></label>
              <input type="text" value={valorMedio} onChange={(e) => setValorMedio(e.target.value)} placeholder="Ex: R$ 350 por sessão" className={inputClass} />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Aceita convênio? <span className="text-ferrugem">*</span></label>
              <div className="flex gap-2 flex-wrap">
                <button type="button"
                  onClick={() => setAceitaConvenio(aceitaConvenio === "Sim" ? "" : "Sim")}
                  className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${aceitaConvenio === "Sim" ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                  Sim
                </button>
                <button type="button"
                  onClick={() => setAceitaConvenio(aceitaConvenio === "Não" ? "" : "Não")}
                  className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${aceitaConvenio === "Não" ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                  Não
                </button>
                <button type="button"
                  onClick={() => setAceitaConvenio(aceitaConvenio === "Apenas alguns" ? "" : "Apenas alguns")}
                  className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${aceitaConvenio === "Apenas alguns" ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                  Apenas alguns
                </button>
              </div>
              {(aceitaConvenio === "Sim" || aceitaConvenio === "Apenas alguns") && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[11.5px] font-medium text-muted">Quais convênios?</span>
                  <div className="flex flex-wrap gap-2">
                    {CONVENIOS_LISTA.map((conv) => (
                      <button key={conv} type="button" onClick={() => toggleConvenio(conv)}
                        className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${conveniosSelecionados.includes(conv) ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                        {conv}
                      </button>
                    ))}
                    <input
                      type="text"
                      value={convenioOutro}
                      onChange={(e) => setConvenioOutro(e.target.value)}
                      placeholder="Outro…"
                      className="px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border border-linha bg-white text-carvao outline-none focus:border-ardosia transition-colors placeholder:text-muted w-36"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Apresentação <span className="text-ferrugem">*</span></label>
              <textarea value={apresentacao} onChange={(e) => setApresentacao(e.target.value)} required rows={4}
                placeholder="Como você atende? O que as famílias podem esperar? Escreva como se estivesse se apresentando a um pai ou mãe."
                className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted resize-none w-full" />
            </div>

            {/* Campos opcionais de perfil */}
            <div className="bg-[#F5F2EE] rounded-[12px] px-4 py-4 flex flex-col gap-4">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted">Campos opcionais</span>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Site, Instagram ou LinkedIn</label>
                <input type="text" value={sitePerfil} onChange={(e) => setSitePerfil(e.target.value)} placeholder="https://" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Como conheceu a Kiri?</label>
                <input type="text" value={comoConheceu} onChange={(e) => setComoConheceu(e.target.value)} placeholder="Indicação, Instagram, busca…" className={inputClass} />
              </div>
            </div>
          </div>

          {/* ── 4. Consentimento ── */}
          <div
            className="flex flex-col gap-4"
            ref={(el) => { secaoRefs.current[3] = el; }}
          >
            <BlockTitle num={4} title="Consentimento" />

            <div className="bg-white border border-linha rounded-[13px] px-4 py-4">
              <label className="flex gap-3 cursor-pointer">
                <input type="checkbox" checked={aceitaTermos} onChange={(e) => setAceitaTermos(e.target.checked)} className="mt-0.5 w-4 h-4 flex-none accent-ardosia" />
                <span className="text-[13px] leading-[1.6] text-cinza-texto2">
                  Li e aceito os{" "}
                  <a href="/termos" className="underline text-cinza-texto2" target="_blank">Termos de Uso</a>
                  {" "}e a{" "}
                  <a href="/politica-de-privacidade" className="underline text-cinza-texto2" target="_blank">Política de Privacidade</a>
                  {" "}da plataforma Kiri.
                </span>
              </label>
            </div>

            <div className="bg-white border border-linha rounded-[13px] px-4 py-4">
              <label className="flex gap-3 cursor-pointer">
                <input type="checkbox" checked={grupoWhatsapp} onChange={(e) => setGrupoWhatsapp(e.target.checked)} className="mt-0.5 w-4 h-4 flex-none accent-ardosia" />
                <span className="text-[13px] leading-[1.6] text-cinza-texto2">
                  Tenho interesse em participar do grupo de profissionais da Rede Kiri no WhatsApp, para troca de informações e novidades entre os membros da rede.
                </span>
              </label>
            </div>

            {/* Declaração de consentimento — cor da marca */}
            <div className="bg-[#E5EAEC] border border-[#B8CDD3] rounded-[13px] px-4 py-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto m-0">Declaração de consentimento</p>
              <p className="text-[13px] leading-[1.65] text-cinza-texto2 m-0">
                Ao preencher este formulário e marcar a opção abaixo, o profissional declara ter lido, compreendido e concordado integralmente com os{" "}
                <a href="/termos" className="underline" target="_blank">Termos de Uso</a>
                {" "}e a{" "}
                <a href="/politica-de-privacidade" className="underline" target="_blank">Política de Privacidade</a>
                {" "}da plataforma Kiri, dando seu consentimento livre, informado e inequívoco para o tratamento dos dados fornecidos, nos termos da Lei Geral de Proteção de Dados (Lei n.º 13.709/2018 — LGPD).
              </p>
              <label className="flex gap-3 cursor-pointer">
                <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} className="mt-0.5 w-4 h-4 flex-none accent-ardosia" />
                <span className="text-[13px] leading-[1.6] text-cinza-texto2">
                  Li e concordo com os{" "}
                  <a href="/termos" className="underline text-cinza-texto2" target="_blank">Termos de Uso</a>
                  {" "}e a{" "}
                  <a href="/politica-de-privacidade" className="underline text-cinza-texto2" target="_blank">Política de Privacidade</a>
                  {" "}e dou meu consentimento para o tratamento dos dados fornecidos.
                </span>
              </label>
            </div>
          </div>

          {erro && <p className="text-[13.5px] text-ferrugem">{erro}</p>}

          <button type="submit" disabled={enviando || !aceitaTermos || !consentimento || !nome || !profissao || !registroConselho || !tempoAtuacao || !graduacaoCurso || !graduacaoInstituicao || !graduacaoAno || !aceitaConvenio || !apresentacao || !email || !whatsappAgendamento || !cidade || !modalidade || areasAtuacao.length === 0 || faixaEtaria.length === 0 || (isSaoPaulo && regioesSP.length === 0)}
            className="w-full bg-ardosia-escura text-white font-semibold text-[16px] rounded-[13px] py-[15px] cursor-pointer disabled:opacity-50 transition-opacity">
            {enviando ? "Enviando…" : "Enviar inscrição"}
          </button>

        </form>

        <Footer className="mt-2 mb-8" />
      </div>
    </div>
  );
}
