"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";

const PROFISSOES = [
  "Psiquiatra da infância e adolescência",
  "Neuropediatra",
  "Neuropsicólogo",
  "Psicólogo",
  "Fonoaudiólogo",
  "Terapeuta ocupacional",
  "Fisioterapeuta",
  "Nutricionista",
];
const AREAS = ["TEA", "TDAH", "Atraso de desenvolvimento", "Comunicação aumentativa", "Dificuldades de aprendizagem", "Ansiedade infantil", "Comportamento", "Outro"];
const FAIXAS = ["Bebês (0–2 anos)", "Pré-escola (3–5 anos)", "Crianças (6–12 anos)", "Adolescentes (13–18 anos)"];

export default function InscricaoProfissionalPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [profissao, setProfissao] = useState("");
  const [registroConselho, setRegistroConselho] = useState("");
  const [rqe, setRqe] = useState("");
  const [areasAtuacao, setAreasAtuacao] = useState<string[]>([]);
  const [faixaEtaria, setFaixaEtaria] = useState<string[]>([]);
  const [tempoAtuacao, setTempoAtuacao] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [cidade, setCidade] = useState("");
  const [valorMedio, setValorMedio] = useState("");
  const [aceitaConvenio, setAceitaConvenio] = useState("");
  const [graduacao, setGraduacao] = useState("");
  const [posGraduacao, setPosGraduacao] = useState("");
  const [apresentacao, setApresentacao] = useState("");
  const [sitePerfil, setSitePerfil] = useState("");
  const [comoConheceu, setComoConheceu] = useState("");
  const [whatsappAgendamento, setWhatsappAgendamento] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [grupoWhatsapp, setGrupoWhatsapp] = useState(false);
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function toggleArea(area: string) {
    setAreasAtuacao((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function toggleFaixa(faixa: string) {
    setFaixaEtaria((prev) =>
      prev.includes(faixa) ? prev.filter((f) => f !== faixa) : [...prev, faixa]
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!consentimento) {
      setErro("É necessário aceitar o uso dos seus dados para continuar.");
      return;
    }
    setEnviando(true);
    setErro("");

    const res = await fetch("/api/inscricao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome.trim(),
        profissao: profissao.trim(),
        registro_conselho: registroConselho.trim(),
        rqe: rqe.trim() || null,
        tempo_atuacao: tempoAtuacao || null,
        areas_atuacao: areasAtuacao.join(", ") || null,
        faixa_etaria: faixaEtaria.join(", ") || null,
        modalidade: modalidade || null,
        cidade: cidade.trim() || null,
        valor_medio: valorMedio.trim() || null,
        aceita_convenio: aceitaConvenio === "Sim" ? true : aceitaConvenio === "Não" ? false : null,
        graduacao: graduacao.trim() || null,
        pos_graduacao: posGraduacao.trim() || null,
        apresentacao: apresentacao.trim() || null,
        site_perfil: sitePerfil.trim() || null,
        como_conheceu: comoConheceu.trim() || null,
        whatsapp_agendamento: whatsappAgendamento.trim() || null,
        grupo_whatsapp: grupoWhatsapp,
        consentimento: true,
      }),
    });

    if (res.ok) {
      setEnviado(true);
    } else {
      const data = await res.json();
      setErro(data.erro ?? "Ocorreu um erro. Tente novamente.");
    }
    setEnviando(false);
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
  const labelClass = "text-[13px] font-semibold text-carvao";

  return (
    <div className="min-h-screen bg-creme flex flex-col">
      <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between">
        <NavBack />
        <span className="text-[12.5px] font-semibold tracking-[0.04em] text-muted">Inscrição de profissional</span>
        <div className="w-9 h-9" />
      </div>

      <div className="max-w-2xl mx-auto w-full flex-1 px-[18px]">
        <div className="pt-8 pb-2">
          <h1 className="font-serif text-[28px] font-medium leading-[1.25] text-carvao m-0">Faça parte da rede Kiri</h1>
          <p className="text-[15.5px] leading-[1.55] text-cinza-texto2 mt-3 mb-0">
            Analisamos cada inscrição individualmente. Se o seu perfil atender aos nossos critérios, entraremos em contato em até 15 dias.
          </p>
        </div>

        {/* Critérios */}
        <div className="mt-5 bg-wash-azulado border border-borda-azulada rounded-[14px] px-4 py-4">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto mb-3">O que verificamos</div>
          <div className="flex flex-col gap-2.5">
            {[
              "Registro ativo e regular no conselho (CRM, CRP, CFFa, COFFITO ou CRN)",
              "Formação na área e atuação em neurodesenvolvimento infantil",
              "Registro ativo e regular perante o conselho de classe",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="10" cy="10" r="8.4" stroke="#44606C" strokeWidth="1.3" />
                  <path d="M6.3 10.2 L8.8 12.7 L13.8 7" stroke="#44606C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[13.5px] leading-[1.5] text-ardosia-escura">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={enviar} className="mt-6 flex flex-col gap-5 pb-12">

          {/* Aceite dos termos */}
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

          {/* Dados profissionais */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Nome completo <span className="text-ferrugem">*</span></label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Como aparecerá no perfil" className={inputClass} />
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

          {/* Áreas */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Áreas de atuação <span className="text-ferrugem">*</span></label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((area) => (
                <button key={area} type="button" onClick={() => toggleArea(area)}
                  className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${areasAtuacao.includes(area) ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Faixa etária */}
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

          {/* Modalidade */}
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
            <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo, SP — Pinheiros" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Valor médio da consulta</label>
            <input type="text" value={valorMedio} onChange={(e) => setValorMedio(e.target.value)} placeholder="Ex: R$ 350 por sessão" className={inputClass} />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Aceita convênio?</label>
            <div className="flex gap-2">
              {["Sim", "Não", "Apenas alguns"].map((op) => (
                <button key={op} type="button"
                  onClick={() => setAceitaConvenio(aceitaConvenio === op ? "" : op)}
                  className={`px-3.5 py-2 rounded-[10px] text-[13.5px] font-medium border transition-colors cursor-pointer ${aceitaConvenio === op ? "bg-ardosia-escura text-white border-ardosia-escura" : "bg-white text-carvao border-linha"}`}>
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Formação */}
          <div className="bg-wash-azulado border border-borda-azulada rounded-[14px] px-4 py-4">
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto mb-2">Comprovação de formação</div>
            <p className="text-[13.5px] leading-[1.6] text-ardosia-escura">
              Os documentos que comprovem as formações e especializações listadas abaixo serão solicitados pela equipe Kiri após o contato inicial. O envio ocorre em etapa posterior ao preenchimento deste formulário.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Graduação <span className="text-ferrugem">*</span></label>
            <input type="text" value={graduacao} onChange={(e) => setGraduacao(e.target.value)} required placeholder="Ex: Fonoaudiologia — USP · 2015" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Pós-graduação, residência ou especialização</label>
            <textarea value={posGraduacao} onChange={(e) => setPosGraduacao(e.target.value)} rows={3}
              placeholder="Liste os mais relevantes para sua atuação em neurodesenvolvimento"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted resize-none w-full" />
          </div>

          {/* Apresentação */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Apresentação <span className="text-ferrugem">*</span></label>
            <textarea value={apresentacao} onChange={(e) => setApresentacao(e.target.value)} required rows={4}
              placeholder="Como você atende? O que as famílias podem esperar? Escreva como se estivesse se apresentando a um pai ou mãe."
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted resize-none w-full" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Site, Instagram ou LinkedIn <span className="text-[12px] font-normal text-muted">(opcional)</span></label>
            <input type="text" value={sitePerfil} onChange={(e) => setSitePerfil(e.target.value)} placeholder="https://" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Como conheceu a Kiri? <span className="text-[12px] font-normal text-muted">(opcional)</span></label>
            <input type="text" value={comoConheceu} onChange={(e) => setComoConheceu(e.target.value)} placeholder="Indicação, Instagram, busca…" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>WhatsApp para agendamento <span className="text-ferrugem">*</span></label>
            <input
              type="tel"
              value={whatsappAgendamento}
              onChange={(e) => setWhatsappAgendamento(e.target.value)}
              required
              placeholder="(11) 99999-9999"
              className={inputClass}
            />
            <p className="text-[12px] text-muted leading-[1.5]">
              Número que a Kiri usará para encaminhar as famílias diretamente para você. Não aparecerá no seu perfil público.
            </p>
          </div>

          {/* Grupo WhatsApp */}
          <div className="bg-white border border-linha rounded-[13px] px-4 py-4">
            <label className="flex gap-3 cursor-pointer">
              <input type="checkbox" checked={grupoWhatsapp} onChange={(e) => setGrupoWhatsapp(e.target.checked)} className="mt-0.5 w-4 h-4 flex-none accent-ardosia" />
              <span className="text-[13px] leading-[1.6] text-cinza-texto2">
                Tenho interesse em participar do grupo de profissionais da Rede Kiri no WhatsApp, para troca de informações e novidades entre os membros da rede.
              </span>
            </label>
          </div>

          {/* Consentimento */}
          <div className="bg-wash-azulado border border-borda-azulada rounded-[13px] px-4 py-4 flex flex-col gap-3">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto">Declaração de consentimento</p>
            <p className="text-[13px] leading-[1.65] text-cinza-texto2 italic">
              Ao preencher este formulário e marcar a opção abaixo, o profissional declara ter lido, compreendido e concordado integralmente com os{" "}
              <a href="/termos" className="underline not-italic" target="_blank">Termos de Uso</a>
              {" "}e a{" "}
              <a href="/politica-de-privacidade" className="underline not-italic" target="_blank">Política de Privacidade</a>
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

          {erro && <p className="text-[13.5px] text-ferrugem">{erro}</p>}

          <button type="submit" disabled={enviando || !aceitaTermos || !consentimento || !nome || !profissao || !registroConselho || !tempoAtuacao || !graduacao || !apresentacao || !whatsappAgendamento || !cidade || !modalidade || areasAtuacao.length === 0 || faixaEtaria.length === 0}
            className="w-full bg-ardosia-escura text-white font-semibold text-[16px] rounded-[13px] py-[15px] cursor-pointer disabled:opacity-50 transition-opacity">
            {enviando ? "Enviando…" : "Enviar inscrição"}

          </button>

        </form>

        <Footer className="mt-2 mb-8" />
      </div>
    </div>
  );
}
