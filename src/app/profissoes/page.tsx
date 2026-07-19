import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";

const PROFISSOES = [
  {
    grupo: "Médicos",
    profissoes: ["Psiquiatra", "Psiquiatra da infância e adolescência", "Neuropediatra", "Neurologista"],
    conselho: "Conselho Regional de Medicina (CRM)",
    registro: "CRM seguido de número e sigla do estado — ex: CRM/BA 12345",
    como: "O CFM (Conselho Federal de Medicina) disponibiliza uma busca pública onde é possível confirmar se o registro está ativo e sem restrições.",
    obs: null,
  },
  {
    grupo: "Psicólogos e Neuropsicólogos",
    profissoes: ["Psicólogo", "Neuropsicólogo"],
    conselho: "Conselho Regional de Psicologia (CRP)",
    registro: "CRP seguido de número da regional e número de inscrição — ex: CRP 03/12345",
    como: "O CFP (Conselho Federal de Psicologia) oferece uma consulta pública de registros, onde é possível verificar situação, especialidade reconhecida e eventuais sanções.",
    obs: "A Neuropsicologia é uma especialidade reconhecida pelo CFP. O profissional que a exerce é sempre psicólogo com formação adicional na área.",
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
    conselho: "Associação Brasileira de Psicopedagogia (ABPp)",
    registro: "A psicopedagogia não tem conselho de classe próprio. O profissional tem graduação em outra área (psicologia, pedagogia, etc.) e especialização em psicopedagogia.",
    como: "Para verificar, é possível consultar o conselho da profissão de base (ex: CRP para psicólogos) e checar se o profissional tem pós-graduação ou certificação reconhecida pela ABPp.",
    obs: null,
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
          {PROFISSOES.map((item) => (
            <div key={item.grupo} className="bg-white border border-linha rounded-[16px] overflow-hidden">
              <div className="bg-wash-azulado px-4 py-[12px] border-b border-borda-azulada">
                <div className="text-[13px] font-bold tracking-[0.04em] uppercase text-ardosia-escura">{item.grupo}</div>
                <div className="text-[13px] text-cinza-texto2 mt-[2px]">
                  {item.profissoes.join(" · ")}
                </div>
              </div>
              <div className="px-4 py-4 flex flex-col gap-3">
                <div className="flex gap-2.5">
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ardosia min-w-[80px] pt-[1px]">Conselho</span>
                  <span className="text-[15px] text-carvao-sutil leading-[1.5]">{item.conselho}</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ardosia min-w-[80px] pt-[1px]">Registro</span>
                  <span className="text-[14.5px] text-cinza-texto leading-[1.5]">{item.registro}</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-ardosia min-w-[80px] pt-[1px]">Verificar</span>
                  <span className="text-[14.5px] text-cinza-texto leading-[1.5]">{item.como}</span>
                </div>
                {item.obs && (
                  <div className="mt-1 bg-[#F5EDE4] rounded-[10px] px-3 py-2.5 text-[13.5px] text-[#6E5326] leading-[1.55]">
                    {item.obs}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-[18px] mt-[26px] bg-[#EFE6D6] rounded-[14px] px-4 py-[15px] flex gap-[11px]">
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
