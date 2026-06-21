import { KiriLogo } from "@/components/KiriLogo";
import { NavBack } from "@/components/NavBack";

const SECOES = [
  {
    titulo: "1. O que é a Kiri",
    texto: [
      "A Kiri é uma plataforma digital de busca e facilitação de contato entre famílias e profissionais de saúde especializados em neurodesenvolvimento infantil. A Kiri não é uma clínica, não presta serviços de saúde e não integra a equipe de nenhum profissional listado.",
      "O uso da plataforma não cria vínculo terapêutico, clínico ou assistencial entre a Kiri e o usuário.",
    ],
  },
  {
    titulo: "2. Natureza do serviço — o que a Kiri faz e o que não faz",
    texto: [
      "A Kiri oferece: (a) uma lista curada de profissionais de saúde que atendem voluntariamente aos critérios de verificação da plataforma; (b) um canal de contato inicial (formulário de encaminhamento) para que a família possa expressar sua demanda; e (c) orientação geral sobre especialidades e o processo de avaliação do neurodesenvolvimento.",
      "A Kiri não realiza: avaliações clínicas, triagem diagnóstica, prescrição, diagnóstico, acompanhamento terapêutico ou qualquer outro ato privativo de profissional de saúde legalmente habilitado.",
      "Nenhuma informação fornecida pela plataforma — seja em textos, filtros, descrições de perfil ou respostas do formulário — constitui aconselhamento médico, psicológico ou terapêutico.",
    ],
  },
  {
    titulo: "3. Responsabilidade técnica pelo tratamento",
    texto: [
      "A responsabilidade técnica pelo diagnóstico, pela conduta clínica e pelo acompanhamento terapêutico é integralmente do profissional de saúde escolhido pelo usuário, nos termos dos respectivos Códigos de Ética e da legislação vigente (Lei n.º 8.080/1990 e normas do conselho de classe competente).",
      "A Kiri não interfere, orienta, supervisiona nem responde pelas decisões clínicas tomadas pelo profissional ou pela família durante ou após o atendimento. Quaisquer orientações, diagnósticos, prescrições ou tratamentos são de exclusiva responsabilidade do profissional que os emitiu.",
      "O usuário reconhece que os resultados de qualquer intervenção de saúde dependem de múltiplos fatores individuais e não podem ser garantidos por qualquer plataforma de busca.",
    ],
  },
  {
    titulo: "4. Ausência de garantia de resultados clínicos",
    texto: [
      "A Kiri não garante, promete nem insinua qualquer resultado clínico decorrente da utilização da plataforma ou do contato com profissionais listados. Encaminhar um usuário a um profissional não implica endosso de método, abordagem ou desfecho terapêutico.",
      "Condições como TEA e TDAH envolvem alta variabilidade individual e demandam avaliação multidisciplinar especializada. A Kiri não está apta a prever, estimar nem assegurar qualquer prognóstico.",
    ],
  },
  {
    titulo: "5. Selo 'Verificado' — alcance e limitações",
    texto: [
      "O selo 'Verificado' exibido nos perfis atesta exclusivamente que, na data da última checagem periódica indicada no perfil (Mês/Ano), os documentos e registros apresentados pelo profissional — incluindo registro ativo no conselho de classe competente, formação declarada e ausência de pendências éticas identificáveis — estavam válidos e em conformidade com os critérios da plataforma.",
      "A verificação é realizada periodicamente e de forma pontual. A Kiri não monitora em tempo real eventuais alterações no status profissional, cancelamentos de registro, abertura de processos éticos ou quaisquer outras mudanças ocorridas após a data da última checagem. O usuário é encorajado a consultar diretamente o conselho de classe competente para confirmar a situação atual do profissional antes de iniciar qualquer atendimento.",
      "A Kiri não se responsabiliza por alterações imediatas de status profissional ocorridas entre os intervalos de verificação.",
    ],
  },
  {
    titulo: "6. Limitação de responsabilidade",
    texto: [
      "A Kiri atua exclusivamente como provedora de tecnologia e facilitação de busca, não prestando serviços de saúde, diagnóstico ou tratamentos clínicos.",
      "Na máxima extensão permitida pela legislação brasileira aplicável, a Kiri não será responsabilizada por: (a) danos decorrentes do uso ou da incapacidade de uso da plataforma; (b) pela conduta, erro médico, imperícia, negligência ou resultado do atendimento prestado por qualquer profissional listado; (c) por informações incorretas ou desatualizadas fornecidas por terceiros, resguardado o compromisso da plataforma de corrigir eventuais inconsistências assim que formalmente notificada.",
    ],
  },
  {
    titulo: "7. Dados pessoais",
    texto: [
      "O tratamento de dados pessoais coletados pela plataforma obedece à Lei Geral de Proteção de Dados Pessoais (Lei n.º 13.709/2018 — LGPD). As informações fornecidas no formulário de encaminhamento são utilizadas exclusivamente para a triagem e o contato com o profissional indicado, não sendo compartilhadas com terceiros sem consentimento do titular, exceto quando exigido por lei.",
    ],
  },
  {
    titulo: "8. Modificações dos Termos",
    texto: [
      "A Kiri reserva-se o direito de atualizar estes Termos a qualquer momento. Alterações substanciais serão comunicadas por meio da plataforma. O uso continuado da plataforma após a publicação de novos Termos implica a aceitação das alterações.",
    ],
  },
  {
    titulo: "9. Foro e legislação aplicável",
    texto: [
      "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo — SP para dirimir quaisquer controvérsias decorrentes deste instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
    ],
  },
];

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-2">
        <NavBack label="Termos de Uso" />
      </div>

      <div className="max-w-3xl mx-auto pb-16 w-full px-2">

        {/* Cabeçalho */}
        <div className="px-[22px] pt-4 pb-2">
          <h1 className="font-serif text-[32px] md:text-[38px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0">
            Termos de Uso
          </h1>
          <p className="mt-3 text-[14px] text-muted leading-[1.6]">
            Última atualização: junho de 2026
          </p>
          <p className="mt-4 text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto">
            Ao acessar ou utilizar a plataforma Kiri, você concorda com estes Termos de Uso. Leia-os com atenção antes de prosseguir.
          </p>
        </div>

        {/* Aviso em destaque */}
        <div className="mx-[18px] mt-6 bg-[#F6E6CC] border border-ambar-borda rounded-[14px] px-5 py-4 flex gap-3">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="10" cy="10" r="8.2" stroke="#BE8A3E" strokeWidth="1.5" />
            <line x1="10" y1="9" x2="10" y2="14" stroke="#BE8A3E" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="6.3" r="1.05" fill="#BE8A3E" />
          </svg>
          <p className="text-[14px] leading-[1.6] text-ambar-texto m-0">
            <strong>A Kiri não é uma clínica e não realiza diagnósticos.</strong> Toda responsabilidade técnica pelo atendimento clínico é do profissional de saúde escolhido pelo usuário. Em caso de urgência ou risco, procure um pronto-socorro.
          </p>
        </div>

        {/* Seções */}
        <div className="px-[22px] mt-8 flex flex-col gap-8">
          {SECOES.map((s) => (
            <div key={s.titulo}>
              <h2 className="font-serif text-[20px] md:text-[22px] font-semibold text-carvao leading-[1.25] mb-3">
                {s.titulo}
              </h2>
              <div className="flex flex-col gap-3">
                {s.texto.map((p, i) => (
                  <p key={i} className="text-[15.5px] md:text-[16.5px] leading-[1.7] text-cinza-texto m-0">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="mx-[22px] mt-12 pt-5 border-t border-linha flex items-center gap-2">
          <KiriLogo size={18} />
          <span className="text-[12.5px] text-muted">Kiri · Rede selecionada de neurodesenvolvimento infantil</span>
        </div>
      </div>
    </div>
  );
}
