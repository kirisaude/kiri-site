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
  const [registroConselhoSecundario, setRegistroConselhoSecundario] = useState("");
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
  const [aceitaTermo, setAceitaTermo] = useState(false);
  const [experienciasInfantil, setExperienciasInfantil] = useState([{ descricao: "", tempo: "", faixa_etaria: "" }]);
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

    if (!nome.trim()) { setErro("Preencha o nome completo."); return; }
    if (!email.trim()) { setErro("Preencha o e-mail."); return; }
    if (!whatsappAgendamento.trim()) { setErro("Preencha o WhatsApp para agendamento."); return; }
    if (!profissao) { setErro("Selecione a profissão."); return; }
    if (!registroConselho.trim()) { setErro("Preencha o número de registro no conselho."); return; }
    if (!graduacaoCurso.trim()) { setErro("Preencha a área de graduação."); return; }
    if (!graduacaoInstituicao.trim()) { setErro("Preencha a instituição de graduação."); return; }
    if (!graduacaoAno.trim()) { setErro("Preencha o ano de conclusão da graduação."); return; }
    if (!tempoAtuacao) { setErro("Selecione o tempo de atuação na área."); return; }
    if (areasAtuacao.length === 0) { setErro("Selecione ao menos uma área de atuação."); return; }
    if (faixaEtaria.length === 0) { setErro("Selecione ao menos uma faixa etária atendida."); return; }
    if (!experienciasInfantil.some((exp) => exp.descricao.trim())) { setErro("Descreva ao menos uma experiência com atendimento infantil."); return; }
    if (!modalidade) { setErro("Selecione a modalidade de atendimento (Presencial, Online ou ambos)."); return; }
    if (!cidade.trim()) { setErro("Preencha a cidade de atendimento."); return; }
    if (isSaoPaulo && regioesSP.length === 0) { setErro("Selecione ao menos uma região de atendimento em São Paulo."); return; }
    if (!aceitaConvenio) { setErro("Selecione se aceita convênio."); return; }
    if (!apresentacao.trim()) { setErro("Preencha a apresentação."); return; }
    if (!aceitaTermos) { setErro("Aceite os Termos de Uso e a Política de Privacidade."); return; }
    if (!aceitaTermo) { setErro("Leia e aceite o Termo de Adesão e Consentimento."); return; }
    if (!consentimento) { setErro("Aceite a Declaração de Consentimento."); return; }

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
          registro_conselho_secundario: registroConselhoSecundario.trim() || null,
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
          experiencia_infantil: experienciasInfantil
            .filter((e) => e.descricao.trim())
            .map((e) => [e.descricao.trim(), e.tempo.trim(), e.faixa_etaria.trim()].filter(Boolean).join(" — "))
            .join("\n") || null,
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
      <div className="min-h-screen bg-creme flex flex-col overflow-x-hidden">
        <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between">
          <NavBack />
          <span className="text-[12.5px] font-semibold tracking-[0.04em] text-muted">Inscrição de profissional</span>
          <div className="w-9 h-9" />
        </div>

        <div className="max-w-2xl mx-auto w-full px-[18px] pt-8 pb-12 flex flex-col gap-7">

          {/* Indicador de progresso */}
          <div className="flex items-center gap-2 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-ardosia flex items-center justify-center flex-none">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-ardosia">Dados enviados</span>
            </div>
            <div className="w-8 h-px bg-linha" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-ferrugem flex items-center justify-center flex-none">
                <span className="text-[11px] font-bold text-white">2</span>
              </div>
              <span className="text-[13px] font-semibold text-ferrugem">Documentação</span>
            </div>
          </div>

          {/* Título */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-[60px] h-[60px] rounded-full bg-[#FDF3EC] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#BE6E4E" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M14 2v6h6" stroke="#BE6E4E" strokeWidth="1.6" strokeLinejoin="round"/>
                <line x1="8" y1="13" x2="16" y2="13" stroke="#BE6E4E" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="8" y1="17" x2="13" y2="17" stroke="#BE6E4E" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="font-serif text-[24px] font-medium text-carvao m-0">Quase lá! Envie sua documentação.</h1>
              <p className="text-[15px] leading-[1.65] text-cinza-texto2 m-0">
                Para concluir sua inscrição, precisamos dos documentos que comprovam sua formação. O envio é feito pelo link abaixo — leva menos de 5 minutos.
              </p>
            </div>
          </div>

          {/* Box de documentos necessários */}
          <div className="bg-white border border-linha rounded-[16px] px-5 py-5 flex flex-col gap-3">
            <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-muted">O que enviar</div>
            <div className="flex flex-col gap-2.5">
              {[
                "Foto profissional (fundo neutro, rosto nítido, preferencialmente quadrada 1:1)",
                "Certidão de regularidade no conselho da sua profissão — emitida pelo site do conselho (CRP, CRM, CFFa, COFFITO etc.), confirmando registro ativo e regular",
                "Diploma de graduação",
                "Certificados de especialização, residência, mestrado, doutorado ou outros (se houver)",
              ].map((doc) => (
                <div key={doc} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-ferrugem flex-none mt-[7px]" />
                  <span className="text-[14px] text-carvao-sutil leading-[1.5]">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA principal */}
          <a
            href="https://forms.gle/p4dptue63CP5Gt5Y8"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center font-semibold text-[16px] text-white bg-ferrugem rounded-[13px] py-[15px] no-underline shadow-[0_8px_20px_-10px_rgba(190,110,78,0.45)]"
          >
            Enviar documentação →
          </a>

          <p className="text-[12.5px] text-muted text-center leading-[1.6]">
            O link também será enviado para o e-mail cadastrado caso precise acessar depois.
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full border border-linha text-cinza-texto font-medium text-[14px] rounded-[13px] py-[12px] cursor-pointer hover:bg-[#F0EBE3] transition-colors"
          >
            Enviar depois e voltar ao início
          </button>

          {/* Convite Instagram */}
          <div className="bg-white border border-linha rounded-[16px] px-5 py-5 flex flex-col gap-3 text-center">
            <p className="text-[18px] font-serif font-medium text-carvao m-0 leading-snug">
              Ajude a Kiri a crescer <span className="ml-1">🌱</span>
            </p>
            <p className="text-[13.5px] text-cinza-texto2 leading-[1.65] m-0">
              Compartilhe com colegas que atuam com neurodesenvolvimento e com famílias que possam se beneficiar da rede. Cada indicação fortalece o cuidado coletivo.
            </p>
            <a
              href="https://www.instagram.com/kiri.saude"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#F5EFE6] border border-[#D8C7B0] text-ferrugem font-semibold text-[14px] rounded-[11px] py-[12px] no-underline hover:bg-[#EDE4D8] transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
              Siga-nos no Instagram
            </a>
          </div>
        </div>

        <Footer className="mx-[18px] mt-auto mb-8" />
      </div>
    );
  }

  const inputClass = "border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted w-full";
  const labelClass = "text-[15px] font-semibold text-carvao";

  return (
    <div className="min-h-screen bg-creme flex flex-col overflow-x-hidden">
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
                Os documentos que comprovem as formações e especializações listadas abaixo serão solicitados na próxima etapa, logo após o envio desta ficha.
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
                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Número de registro no conselho <span className="text-ferrugem">*</span></label>
                    <input type="text" value={registroConselho} onChange={(e) => setRegistroConselho(e.target.value)} required placeholder="Ex: CRP 06/12345 ou CRM 123456-SP" className={inputClass} />
                    <p className="text-[12px] text-muted leading-[1.55] mt-0.5">
                      Na próxima etapa, será necessário enviar a <strong className="text-carvao">certidão de regularidade</strong> emitida pelo site do seu conselho (CRP, CRM, CFFa, COFFITO etc.), confirmando que o registro está ativo e regular.
                    </p>
                  </div>

                  <div>
                    <p className="text-[13px] text-muted mb-1.5">Segunda profissão <span className="font-normal">(opcional)</span></p>
                    <div className="flex flex-wrap gap-2">
                      {PROFISSOES.filter((op) => op !== profissao).map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => { setProfissaoSecundaria(profissaoSecundaria === op ? "" : op); setRegistroConselhoSecundario(""); }}
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

                    {profissaoSecundaria && (
                      <div className="flex flex-col gap-1.5 mt-3">
                        <label className={labelClass}>Registro no conselho — {profissaoSecundaria} <span className="text-[12px] font-normal text-muted">(opcional)</span></label>
                        <input type="text" value={registroConselhoSecundario} onChange={(e) => setRegistroConselhoSecundario(e.target.value)} placeholder="Ex: CRM 123456-SP" className={inputClass} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {["Neuropsicólogo", "Psicólogo", "Fonoaudiólogo", "Psicopedagogo"].includes(profissao) && (
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Sufixo profissional <span className="text-[12px] font-normal text-muted">(para exibir "Psicóloga" em vez de "Psicólogo", por exemplo)</span></label>
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
            )}

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
              <label className={labelClass}>Experiência com atendimento infantil <span className="text-ferrugem">*</span></label>
              <p className="text-[12.5px] text-muted -mt-1 leading-[1.55]">Descreva experiências relevantes com crianças — contexto, duração e faixa etária.</p>
              {experienciasInfantil.map((exp, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input
                      type="text"
                      placeholder="Descrição (ex: Atendimento em clínica de crianças com TEA)"
                      value={exp.descricao}
                      onChange={(e) => { const n = [...experienciasInfantil]; n[i] = { ...n[i], descricao: e.target.value }; setExperienciasInfantil(n); }}
                      className={inputClass + " w-full"}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tempo (ex: 4 anos)"
                        value={exp.tempo}
                        onChange={(e) => { const n = [...experienciasInfantil]; n[i] = { ...n[i], tempo: e.target.value }; setExperienciasInfantil(n); }}
                        className={inputClass + " flex-1"}
                      />
                      <input
                        type="text"
                        placeholder="Faixa etária (ex: 3–10 anos)"
                        value={exp.faixa_etaria}
                        onChange={(e) => { const n = [...experienciasInfantil]; n[i] = { ...n[i], faixa_etaria: e.target.value }; setExperienciasInfantil(n); }}
                        className={inputClass + " flex-1"}
                      />
                    </div>
                  </div>
                  {experienciasInfantil.length > 1 && (
                    <button type="button" onClick={() => setExperienciasInfantil(experienciasInfantil.filter((_, j) => j !== i))}
                      className="text-[20px] text-muted cursor-pointer leading-none mt-3 flex-none">×</button>
                  )}
                </div>
              ))}
              <button type="button"
                onClick={() => setExperienciasInfantil([...experienciasInfantil, { descricao: "", tempo: "", faixa_etaria: "" }])}
                className="text-[13px] text-ardosia font-semibold text-left cursor-pointer w-fit">
                + Adicionar outra experiência
              </button>
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

            {/* Termo de Adesão */}
            <div className="border border-linha rounded-[13px] overflow-hidden">
              <details>
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none bg-white list-none">
                  <div className="flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <span className="text-[13.5px] font-semibold text-carvao">Termo de Adesão e Consentimento — Rede Kiri</span>
                  </div>
                  <span className="text-[11px] text-muted font-medium">ver ▾</span>
                </summary>
                <div className="px-4 pb-4 pt-2 bg-[#FAFAF8] border-t border-linha flex flex-col gap-3 text-[12.5px] text-cinza-texto2 leading-[1.65]">
                  <p>Ao integrar a <strong>Rede Kiri — Rede de Cuidado ao Neurodesenvolvimento Infantil</strong>, você concorda com as premissas abaixo:</p>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-carvao text-[12px]">1. Objeto e Propósito</p>
                    <p>Ao integrar a Rede Kiri, o profissional passa a compor uma rede de indicação de especialistas em neurodesenvolvimento infantil, cujos dados serão exibidos publicamente na plataforma para facilitar o acesso das famílias a atendimento especializado. A Kiri reserva-se o direito de desligar da rede profissionais cujas condutas sejam incompatíveis com a ética profissional ou que comprometam a confiança das famílias.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-carvao text-[12px]">2. Uso e Exposição de Dados — LGPD</p>
                    <p>Você autoriza a Kiri a exibir publicamente os dados profissionais fornecidos (nome, registro, especialidade, áreas de atuação, descrição clínica e foto). Você pode solicitar alteração ou exclusão a qualquer momento pelo e-mail <span className="text-ardosia">contato@kirisaude.com.br</span>.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-carvao text-[12px]">3. Integração e Encaminhamentos</p>
                    <p>Você autoriza o compartilhamento do seu contato direto (e-mail ou WhatsApp profissional) com os demais membros da rede, exclusivamente para fins de encaminhamentos internos entre profissionais.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-carvao text-[12px]">4. Condições de Participação</p>
                    <p>A participação na Rede Kiri é gratuita. Qualquer alteração nas condições será comunicada com antecedência. Você poderá solicitar o encerramento da sua participação a qualquer momento.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-carvao text-[12px]">5. Veracidade das Informações</p>
                    <p>O profissional declara que todas as informações fornecidas — incluindo formação acadêmica, registros de conselho, especializações e áreas de atuação — são verdadeiras e atualizadas, sendo de sua exclusiva responsabilidade mantê-las corretas. A Kiri não se responsabiliza por dados inverídicos constados nos diplomas e documentos enviados, cabendo ao profissional responder civil e eticamente por qualquer inexatidão.</p>
                  </div>
                </div>
              </details>
              <div className="px-4 py-4 bg-white border-t border-linha flex flex-col gap-3">
                <div className="bg-[#EFF4F6] border border-[#C5D8DF] rounded-[10px] px-3.5 py-3 flex items-start gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" className="flex-none mt-[1px]">
                    <circle cx="10" cy="10" r="8.4" stroke="#44606C" strokeWidth="1.4"/>
                    <path d="M10 6v4M10 13.5v.5" stroke="#44606C" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[12.5px] leading-[1.6] text-ardosia-escura m-0">
                    Após o envio, você receberá um e-mail separado do <strong>Autentique</strong> para assinar este termo digitalmente com seu <strong>certificado ICP-Brasil</strong>.
                  </p>
                </div>
                <label className="flex gap-3 cursor-pointer items-start">
                  <input type="checkbox" checked={aceitaTermo} onChange={(e) => setAceitaTermo(e.target.checked)} className="mt-0.5 w-4 h-4 flex-none accent-ardosia" />
                  <span className="text-[13px] leading-[1.6] text-cinza-texto2">
                    Li e concordo com o <strong>Termo de Adesão e Consentimento da Rede Kiri</strong>, dando meu consentimento para o uso dos dados conforme descrito.
                  </span>
                </label>
              </div>
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

          <button type="submit" disabled={enviando}
            className="w-full bg-ardosia-escura text-white font-semibold text-[16px] rounded-[13px] py-[15px] cursor-pointer disabled:opacity-50 transition-opacity">
            {enviando ? "Enviando…" : "Enviar inscrição"}
          </button>

        </form>

        <Footer className="mt-2 mb-8" />
      </div>
    </div>
  );
}
