import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";
import { KiriSymbol } from "@/components/KiriSymbol";

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
    titulo: "Verificação dos títulos e formações de cada profissional",
    detalhe: "Diploma, pós-graduação ou especialização conferidos em relação à área de atuação declarada.",
  },
];

export default function ComoSelecionamosPage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Sobre a rede" />
      </div>

      <div className="max-w-3xl mx-auto pb-10 w-full px-2">

        {/* Cabeçalho — alinhado à esquerda */}
        <div className="px-[22px] pt-8 flex flex-col items-start text-left">
          <div className="flex items-center gap-3">
            <KiriSymbol height={46} />
            <h1 className="font-serif text-[32px] md:text-[36px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
              Como selecionamos os profissionais
            </h1>
          </div>
          <p className="mt-6 text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Em vez de uma lista infinita, reunimos uma rede pequena e selecionada — e somos transparentes sobre o critério. Em neurodesenvolvimento, a avaliação cuidadosa costuma ser multidisciplinar, por isso reunimos diferentes especialidades numa só rede.
          </p>
        </div>

        {/* O que verificamos — contador "03", check só no título, itens com número */}
        <div className="mx-[18px] mt-[32px] bg-white border border-borda-azulada rounded-[16px] overflow-hidden">
          <div className="flex items-center gap-3 bg-wash-azulado px-4 py-[13px]">
            <span className="font-serif text-[30px] font-medium text-ferrugem-escura leading-none select-none">03</span>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.4" />
                <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[14.5px] font-bold tracking-[0.03em] text-ardosia-escura">O que verificamos</span>
            </div>
          </div>
          <div className="px-4 pb-1.5">
            {ITENS.map((item, i) => (
              <div key={i} className="flex gap-3 py-4 border-t border-linha-sutil">
                <span className="font-serif text-[15px] font-medium text-ferrugem-escura leading-none pt-[3px] min-w-[22px] select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="text-[16px] font-semibold text-carvao leading-[1.3]">{item.titulo}</div>
                  <div className="text-[14.5px] leading-[1.55] text-cinza-texto2 mt-1">{item.detalhe}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O que isso significa — destaque maior com wash ardósia */}
        <div className="mx-[18px] mt-[20px] bg-[#E5EAEC] border border-[#B8CDD3] rounded-[16px] px-5 py-5">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ardosia-texto mb-3">
            O que isso significa para você
          </div>
          <p className="text-[17px] md:text-[18px] leading-[1.65] text-ardosia-escura m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Todo profissional aqui teve formação e registro verificados, um a um. Não classificamos quem é "melhor" — garantimos que cada um cumpre um critério real e transparente, para você escolher com segurança o profissional certo para o seu caso.
          </p>
        </div>

        {/* Nota de responsabilidade — discreta, só filete superior */}
        <div className="mx-[18px] mt-[28px] pt-5 border-t border-[#E2D6C0] flex gap-[10px]">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
            <circle cx="10" cy="10" r="8.2" stroke="#B0A090" strokeWidth="1.4" />
            <line x1="10" y1="9" x2="10" y2="14" stroke="#B0A090" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="6.3" r="1.05" fill="#B0A090" />
          </svg>
          <div className="flex flex-col gap-2.5">
            <p className="text-[13.5px] leading-[1.6] text-muted m-0">
              Verificamos a qualificação e o registro de cada profissional, periodicamente. A data da última checagem está indicada em cada perfil (Mês/Ano). A Kiri não monitora alterações em tempo real — recomendamos consultar o conselho de classe competente para confirmar a situação atual do profissional antes de iniciar qualquer atendimento.
            </p>
            <p className="text-[13.5px] leading-[1.6] text-muted m-0">
              A escolha de com quem seguir e a condução do cuidado continuam sendo decisão da família, em conjunto com o profissional. A responsabilidade técnica pelo atendimento — diagnóstico, conduta e acompanhamento — é integralmente do profissional de saúde escolhido.
            </p>
          </div>
        </div>

        {/* CTA para profissionais */}
        <div className="mx-[18px] mt-[52px] flex flex-col items-center text-center gap-4 py-6 border-t border-linha">
          <p className="font-serif text-[20px] md:text-[22px] leading-[1.45] text-carvao m-0">
            É profissional de saúde e quer fazer parte da rede?
          </p>
          <Link
            href="/profissionais/inscricao"
            className="inline-flex items-center gap-2 font-semibold text-[15px] text-white bg-ardosia-escura rounded-[12px] px-6 py-3 no-underline shadow-[0_6px_18px_-8px_rgba(44,70,80,0.4)]"
          >
            Quero fazer parte da rede
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M7 4 L13 10 L7 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <Footer className="mx-[18px] mt-4" />
      </div>
    </div>
  );
}
