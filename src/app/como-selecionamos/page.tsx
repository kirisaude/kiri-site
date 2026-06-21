import { KiriLogo } from "@/components/KiriLogo";
import { NavBack } from "@/components/NavBack";

const ITENS = [
  {
    titulo: "Registro ativo e regular no conselho",
    detalhe: "CRM, CRP, CFFa, COFFITO ou CRN — conforme a profissão.",
  },
  {
    titulo: "Formação na área conferida",
    detalhe: "Título ou RQE quando aplicável, e atuação em neurodesenvolvimento infantil.",
  },
  {
    titulo: "Situação ética regular",
    detalhe: "Sem pendências que impeçam o exercício da profissão.",
  },
];

export default function ComoSelecionamosPage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-2">
        <NavBack label="Sobre a rede" />
      </div>

      <div className="max-w-3xl mx-auto pb-10 w-full px-2">
        {/* Título */}
        <div className="px-[22px] pt-8">
          <h1 className="font-serif text-[32px] md:text-[36px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Como selecionamos os profissionais
          </h1>
          <p className="mt-4 text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Em vez de uma lista infinita, reunimos uma rede pequena e selecionada — e somos transparentes sobre o critério. Em neurodesenvolvimento, a avaliação cuidadosa costuma ser multidisciplinar, por isso reunimos diferentes especialidades numa só rede.
          </p>
        </div>

        {/* O que verificamos */}
        <div className="mx-[18px] mt-[26px] bg-white border border-borda-azulada rounded-[16px] overflow-hidden">
          <div className="flex items-center gap-[9px] bg-wash-azulado px-4 py-[13px]">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
              <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[14.5px] font-bold tracking-[0.03em] text-ardosia-escura">
              O que verificamos
            </span>
          </div>
          <div className="px-4 pb-1.5">
            {ITENS.map((item, i) => (
              <div key={i} className="flex gap-3 py-4 border-t border-linha-sutil">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="10" cy="10" r="8.4" stroke="#6E8893" strokeWidth="1.4" />
                  <path d="M6.3 10.2 L8.8 12.7 L13.8 7" stroke="#6E8893" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <div className="text-[16px] font-semibold text-carvao leading-[1.3]">{item.titulo}</div>
                  <div className="text-[14.5px] leading-[1.55] text-cinza-texto2 mt-1">{item.detalhe}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O que significa */}
        <div className="mx-[22px] mt-[26px]">
          <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-muted mb-3">
            O que isso significa para você
          </div>
          <p className="text-[16.5px] md:text-[17px] leading-[1.65] text-carvao-sutil m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Todo profissional aqui teve formação e registro verificados, um a um. Não classificamos quem é "melhor" — garantimos que cada um cumpre um critério real e transparente, para você escolher com segurança o profissional certo para o seu caso.
          </p>
        </div>

        {/* Responsabilidade */}
        <div className="mx-[18px] mt-[26px] bg-[#EFE6D6] rounded-[14px] px-4 py-[15px] flex gap-[11px]">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="10" cy="10" r="8.2" stroke="#8A7E6A" strokeWidth="1.4" />
            <line x1="10" y1="9" x2="10" y2="14" stroke="#8A7E6A" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="6.3" r="1.05" fill="#8A7E6A" />
          </svg>
          <div className="flex flex-col gap-2.5">
            <p className="text-[14px] leading-[1.6] text-[#6E5326] m-0">
              Verificamos a qualificação e o registro de cada profissional. A escolha de com quem seguir e a condução do cuidado continuam sendo decisão da família, em conjunto com o profissional. A responsabilidade técnica pelo atendimento — diagnóstico, conduta e acompanhamento — é integralmente do profissional de saúde escolhido.
            </p>
            <p className="text-[14px] leading-[1.6] text-[#6E5326] m-0">
              A verificação é periódica. A data da última checagem está indicada em cada perfil (Mês/Ano). A Kiri não monitora alterações em tempo real — recomendamos consultar o conselho de classe competente para confirmar a situação atual do profissional antes de iniciar qualquer atendimento.
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mx-[18px] mt-7 pt-4 border-t border-linha flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KiriLogo size={20} />
            <span className="text-[13px] text-muted">Kiri · Rede selecionada de neurodesenvolvimento</span>
          </div>
          <a href="/termos" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos de Uso</a>
        </div>
      </div>
    </div>
  );
}
