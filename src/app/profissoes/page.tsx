import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";

const PROFISSOES = [
  {
    grupo: "Psicólogos e Neuropsicólogos",
    profissoes: ["Psicólogo", "Neuropsicólogo"],
    conselho: "Conselho Regional de Psicologia (CRP)",
    registro: "CRP seguido de número da regional e número de inscrição — ex: CRP 03/12345",
    como: "O CFP (Conselho Federal de Psicologia) oferece uma consulta pública de registros, onde é possível verificar situação, especialidade reconhecida e eventuais sanções.",
    obs: "A Neuropsicologia é uma especialidade reconhecida pelo CFP. O profissional que a exerce é sempre psicólogo com formação adicional em neuropsicologia.",
  },
  {
    grupo: "Fonoaudiólogos",
    profissoes: ["Fonoaudiólogo"],
    conselho: "Conselho Regional de Fonoaudiologia (CRFa)",
    registro: "CRFa seguido de número da regional e inscrição — ex: CRFa-5 12345",
    como: "O CFFa (Conselho Federal de Fonoaudiologia) disponibiliza consulta pública de profissionais cadastrados, com situação do registro.",
    obs: null,
  },
  {
    grupo: "Terapeutas ocupacionais e Fisioterapeutas",
    profissoes: ["Terapeuta ocupacional", "Fisioterapeuta"],
    conselho: "Conselho Regional de Fisioterapia e Terapia Ocupacional (CREFITO)",
    registro: "CREFITO seguido de número e sufixo da categoria — ex: CREFITO-3 12345-TO (terapia ocupacional) ou -F (fisioterapia)",
    como: "O COFFITO (Conselho Federal de Fisioterapia e Terapia Ocupacional) mantém consulta pública de registros.",
    obs: null,
  },
  {
    grupo: "Nutricionistas",
    profissoes: ["Nutricionista"],
    conselho: "Conselho Regional de Nutricionistas (CRN)",
    registro: "CRN seguido de número da regional e inscrição — ex: CRN-5 12345",
    como: "O CFN (Conselho Federal de Nutricionistas) disponibiliza consulta pública de profissionais e situação do registro.",
    obs: null,
  },
  {
    grupo: "Psicopedagogos",
    profissoes: ["Psicopedagogo"],
    conselho: "Sem conselho próprio (ainda)",
    registro: "Não há registro obrigatório em conselho de classe para psicopedagogos. Como a profissão ainda não é regulamentada em lei, não existem pré-requisitos legalmente definidos no momento.",
    como: "É possível consultar o conselho da profissão de base do profissional (ex: CRP se for psicólogo, CFFa se for fonoaudiólogo) e verificar se tem pós-graduação em psicopedagogia. A ABPp (Associação Brasileira de Psicopedagogia) é a principal entidade de referência da área, mas não tem poder fiscalizador como um conselho.",
    obs: [
      "O CFP trata a psicopedagogia como uma das 13 especialidades reconhecidas da Psicologia (Resolução CFP nº 3/2022) — ou seja, para psicólogos, ela é regulamentada dentro do sistema de conselhos de Psicologia, não como profissão à parte.",
      "Regulamentação em curso: a CCJ da Câmara aprovou em 2026 o projeto que prevê criar um conselho próprio para a profissão (PL 1675/2023 + PL 116/2024). O texto ainda precisa passar pelo Senado e ter sanção presidencial para entrar em vigor.",
    ],
  },
];

const ESPECIALIDADES_MEDICAS = [
  {
    nome: "Psiquiatra",
    descricao: "Residência médica em psiquiatria (3 anos) após a graduação em medicina. O RQE de psiquiatria é emitido pelo CRM como comprovante da especialidade.",
  },
  {
    nome: "Neurologista",
    descricao: "Residência médica em neurologia (3 anos) após a graduação. O RQE de neurologia comprova a especialização perante o CRM.",
  },
  {
    nome: "Psiquiatra da infância e adolescência",
    descricao: "Exige residência em psiquiatria completa + 1 ano adicional de residência em psiquiatria da infância e adolescência. Possui RQE específico para essa subespecialidade.",
  },
  {
    nome: "Neuropediatra",
    descricao: "Exige residência em pediatria ou neurologia (3 anos cada) seguida de residência em neuropediatria (2 anos). O RQE de neuropediatria é emitido pelo CRM.",
  },
];

export default function ProfissoesPage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="As profissões" />
      </div>

      <div className="max-w-3xl mx-auto pb-10 w-full px-2">
        <div className="px-[22px] pt-8">
          <h1 className="font-serif text-[32px] md:text-[36px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            As profissões da rede
          </h1>
          <p className="mt-4 text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Cada profissão de saúde no Brasil é regulamentada por um conselho de classe, responsável por emitir e manter os registros profissionais. É esse registro que garante que o profissional tem a formação exigida e está autorizado a exercer a profissão.
          </p>
          <p className="mt-3 text-[16px] md:text-[17px] leading-[1.65] text-cinza-texto" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Abaixo, um guia rápido por profissão — o conselho responsável e como qualquer pessoa pode verificar o registro.
          </p>
        </div>

        <div className="mx-[18px] mt-[28px] flex flex-col gap-4">

          {/* Médicos — card manual com sub-box de especialidades */}
          <div className="bg-white border border-[#E0D8CC] rounded-[16px] overflow-hidden">
            <div className="bg-[#F5EFE6] px-4 py-[12px] border-b border-[#E0D8CC]">
              <div className="text-[12px] font-bold tracking-[0.06em] uppercase text-ferrugem">Médicos</div>
              <div className="text-[13px] text-cinza-texto mt-[2px]">
                Psiquiatra · Psiquiatra da infância e adolescência · Neuropediatra · Neurologista
              </div>
            </div>
            <div className="px-4 py-4 flex flex-col gap-3">
              <div className="flex gap-2.5">
                <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ferrugem/70 min-w-[80px] pt-[1px]">Conselho</span>
                <span className="text-[15px] text-carvao-sutil leading-[1.5]">Conselho Regional de Medicina (CRM)</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ferrugem/70 min-w-[80px] pt-[1px]">Registro</span>
                <span className="text-[14.5px] text-cinza-texto leading-[1.5]">CRM seguido de número e sigla do estado — ex: CRM/BA 12345</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ferrugem/70 min-w-[80px] pt-[1px]">Verificar</span>
                <span className="text-[14.5px] text-cinza-texto leading-[1.5]">O CFM (Conselho Federal de Medicina) disponibiliza uma busca pública onde é possível confirmar se o registro está ativo e sem restrições.</span>
              </div>

              {/* Sub-box especialidades */}
              <div className="mt-1 bg-[#FAF6F0] border border-[#E0D8CC] rounded-[12px] overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-[#E0D8CC]">
                  <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-ferrugem/80">Especialidades e RQE</span>
                  <p className="text-[13px] text-cinza-texto leading-[1.5] mt-1 mb-0">
                    Além do CRM, cada especialidade médica exige residência na área. O RQE (Registro de Qualificação de Especialidade) é emitido pelo próprio CRM como comprovante formal da especialidade concluída.
                  </p>
                </div>
                <div className="divide-y divide-[#E8DFD5]">
                  {ESPECIALIDADES_MEDICAS.map((esp) => (
                    <div key={esp.nome} className="px-3.5 py-3 flex flex-col gap-[3px]">
                      <span className="text-[13.5px] font-semibold text-carvao">{esp.nome}</span>
                      <span className="text-[13px] text-cinza-texto leading-[1.5]">{esp.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Demais profissões */}
          {PROFISSOES.map((item) => (
            <div key={item.grupo} className="bg-white border border-[#E0D8CC] rounded-[16px] overflow-hidden">
              <div className="bg-[#F5EFE6] px-4 py-[12px] border-b border-[#E0D8CC]">
                <div className="text-[12px] font-bold tracking-[0.06em] uppercase text-ferrugem">{item.grupo}</div>
                <div className="text-[13px] text-cinza-texto mt-[2px]">
                  {item.profissoes.join(" · ")}
                </div>
              </div>
              <div className="px-4 py-4 flex flex-col gap-3">
                <div className="flex gap-2.5">
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ferrugem/70 min-w-[80px] pt-[1px]">Conselho</span>
                  <span className="text-[15px] text-carvao-sutil leading-[1.5]">{item.conselho}</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ferrugem/70 min-w-[80px] pt-[1px]">Registro</span>
                  <span className="text-[14.5px] text-cinza-texto leading-[1.5]">{item.registro}</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ferrugem/70 min-w-[80px] pt-[1px]">Verificar</span>
                  <span className="text-[14.5px] text-cinza-texto leading-[1.5]">{item.como}</span>
                </div>
                {item.obs && (Array.isArray(item.obs) ? item.obs : [item.obs]).map((o, i) => (
                  <div key={i} className="mt-1 bg-[#FAF6F0] border border-[#E0D8CC] rounded-[10px] px-3 py-2.5 text-[13.5px] text-cinza-texto leading-[1.55]">
                    {o}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sites de verificação */}
        <div className="mx-[18px] mt-[28px] bg-white border border-[#E0D8CC] rounded-[16px] overflow-hidden">
          <div className="bg-[#F5EFE6] px-4 py-[12px] border-b border-[#E0D8CC]">
            <div className="text-[12px] font-bold tracking-[0.06em] uppercase text-ferrugem">Sites de verificação pública</div>
            <div className="text-[13px] text-cinza-texto mt-[2px]">Acesso gratuito — qualquer pessoa pode consultar</div>
          </div>
          <div className="divide-y divide-linha-sutil">
            {[
              {
                label: "e-MEC",
                desc: "Verifica se uma instituição de ensino ou curso é reconhecido pelo MEC",
                url: "https://emec.mec.gov.br/emec/nova",
                profissao: "Todas as profissões",
              },
              {
                label: "CFM — Conselho Federal de Medicina",
                desc: "Consulta de médicos: CRM, situação do registro e especialidades (RQE)",
                url: "https://portal.cfm.org.br/busca-medicos",
                profissao: "Médicos",
              },
              {
                label: "CFP — Conselho Federal de Psicologia",
                desc: "Consulta de psicólogos: CRP, situação e especialidades reconhecidas",
                url: "https://cadastro.cfp.org.br",
                profissao: "Psicólogos · Neuropsicólogos",
              },
              {
                label: "CFFa — Conselho Federal de Fonoaudiologia",
                desc: "Consulta de fonoaudiólogos: situação do registro e regional",
                url: "https://www.fonoaudiologia.org.br/cffa/consulta-de-profissional",
                profissao: "Fonoaudiólogos",
              },
              {
                label: "COFFITO — Conselho Federal de Fisioterapia e Terapia Ocupacional",
                desc: "Consulta de fisioterapeutas e terapeutas ocupacionais: CREFITO e situação",
                url: "https://www.coffito.gov.br/nsite/?page_id=2340",
                profissao: "Terapeutas ocupacionais · Fisioterapeutas",
              },
              {
                label: "CFN — Conselho Federal de Nutricionistas",
                desc: "Consulta de nutricionistas: CRN e situação do registro",
                url: "https://www.cfn.org.br/index.php/consulta-de-profissionais",
                profissao: "Nutricionistas",
              },
            ].map((site) => (
              <a
                key={site.label}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-3.5 no-underline hover:bg-wash-azulado/50 transition-colors group"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
                  <circle cx="10" cy="10" r="8.5" stroke="#6E8893" strokeWidth="1.4" />
                  <path d="M7 10h6M10 7l3 3-3 3" stroke="#6E8893" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col gap-[2px]">
                  <span className="text-[14px] font-semibold text-ardosia-escura group-hover:text-ardosia leading-[1.3]">{site.label}</span>
                  <span className="text-[13px] text-cinza-texto leading-[1.4]">{site.desc}</span>
                  <span className="text-[11.5px] font-medium text-ardosia/70 mt-[2px]">{site.profissao}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mx-[18px] mt-[18px] bg-[#EFE6D6] rounded-[14px] px-4 py-[15px] flex gap-[11px]">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="10" cy="10" r="8.2" stroke="#8A7E6A" strokeWidth="1.4" />
            <line x1="10" y1="9" x2="10" y2="14" stroke="#8A7E6A" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="6.3" r="1.05" fill="#8A7E6A" />
          </svg>
          <p className="text-[14px] leading-[1.6] text-[#6E5326] m-0">
            A Kiri verifica o registro de cada profissional antes de incluí-lo na rede. Mesmo assim, recomendamos que as famílias confirmem a situação atual diretamente no conselho — os registros podem ter alterações após a nossa verificação.
          </p>
        </div>

        <Footer className="mx-[18px] mt-7" />
      </div>
    </div>
  );
}
