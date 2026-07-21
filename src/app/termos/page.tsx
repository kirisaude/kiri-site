import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";
import { IndiceAccordion } from "@/components/IndiceAccordion";

type Bloco =
  | { tipo: "p"; texto: string }
  | { tipo: "destaque"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "alineas"; itens: string[] };

const SECOES: { titulo: string; blocos: Bloco[] }[] = [
  {
    titulo: "1. Objeto da Plataforma e Capacidade Civil",
    blocos: [
      { tipo: "p", texto: "A Kiri consiste em um ecossistema digital que atua como provedor de tecnologia, oferecendo um catálogo organizado e facilitação de contato inicial entre famílias e profissionais de saúde independentes e autônomos que atuam com neurodesenvolvimento infantil." },
      { tipo: "destaque", texto: "Capacidade e Representação" },
      { tipo: "p", texto: "Ao aceitar estes termos, o usuário declara ser maior de 18 anos ou emancipado, possuir plena capacidade civil e, quando aplicável, deter a legítima representação legal, guarda ou poder familiar sobre o menor de idade cujos dados ou histórico venham a ser informados para fins de contato." },
      { tipo: "destaque", texto: "Ausência de Vínculo" },
      { tipo: "p", texto: "O uso da plataforma, o preenchimento de campos de mensagem ou o envio de dados para contato não cria, sob nenhuma hipótese ou pretexto, qualquer vínculo terapêutico, clínico, assistencial, consumerista de saúde ou hospitalar entre a Kiri e o usuário." },
    ],
  },
  {
    titulo: "2. Natureza e Limitações do Serviço",
    blocos: [
      { tipo: "destaque", texto: "O que a Kiri disponibiliza" },
      { tipo: "alineas", itens: [
        "(a) Acesso a uma listagem organizada de profissionais de saúde que atendem aos critérios objetivos de verificação de regularidade documental da plataforma;",
        "(b) Uma ferramenta tecnológica de mensageria para que o próprio usuário, por sua livre escolha, envie sua demanda inicial diretamente ao especialista escolhido; e",
        "(c) Conteúdos informativos de caráter estritamente educativo, sem qualquer caráter de recomendação individualizada.",
      ]},
      { tipo: "destaque", texto: "O que a Kiri NÃO realiza" },
      { tipo: "p", texto: "Avaliações clínicas, consultas, triagens diagnósticas, indicação imperativa de condutas, prescrições médicas ou terapêuticas, emissão de laudos, exames ou qualquer outro ato privativo de profissionais de saúde legalmente habilitados." },
      { tipo: "destaque", texto: "Inexistência de Aconselhamento" },
      { tipo: "p", texto: "Nenhuma informação veiculada na plataforma — incluindo textos de apoio, e-mails informativos, respostas automáticas, filtros de busca ou descrições textuais de perfis — constitui ou substitui o aconselhamento médico, psicológico ou terapêutico." },
    ],
  },
  {
    titulo: "3. Autonomia Profissional e Ausência de Vínculo",
    blocos: [
      { tipo: "p", texto: "A responsabilidade técnica pelo diagnóstico, pela linha de intervenção adotada, pela conduta, evolução e pelo sigilo absoluto das informações clínicas é integralmente do profissional de saúde escolhido de forma soberana pelo usuário, nos termos da legislação brasileira (Lei n.º 8.080/1990) e dos respectivos Códigos de Ética Profissional (CFM, CFP, CREFITO, CRFa, CRN, etc.)." },
      { tipo: "p", texto: "A Kiri não possui qualquer ingerência, não orienta, não supervisiona, não audita e não responde pelas decisões clínicas tomadas pelo profissional ou pelas escolhas feitas pela família. Os honorários, agendamentos e a prestação dos serviços de saúde subsequentes ocorrem em ambiente totalmente externo, físico ou digital, alheio e independente da plataforma Kiri." },
    ],
  },
  {
    titulo: "4. Ausência de Garantia de Resultados Clínicos",
    blocos: [
      { tipo: "p", texto: "O usuário declara estar ciente de que as condições ligadas ao neurodesenvolvimento infantil (como o TEA e o TDAH) possuem alta variabilidade individual e demandam acompanhamento especializado, contínuo e necessariamente multidisciplinar. A Kiri atua como mero facilitador de busca de contatos e, por isso, não garante, não promete e não assegura qualquer resultado clínico, melhora, eficácia de abordagens terapêuticas ou prognóstico específico." },
    ],
  },
  {
    titulo: "5. Parâmetros do Selo \"Verificado\" e Exclusão de Monitoramento",
    blocos: [
      { tipo: "p", texto: "O selo \"Verificado\" exibido nos perfis dos profissionais atesta exclusivamente que, na data da última checagem periódica realizada pela plataforma (explicitada no perfil do profissional), o especialista apresentou documentos válidos que comprovavam:" },
      { tipo: "alineas", itens: [
        "(a) registro ativo e regular perante o seu respectivo conselho de classe profissional; e",
        "(b) titulação, especialização ou formação declarada condizente com o escopo da plataforma.",
      ]},
      { tipo: "destaque", texto: "Inexistência de Monitoramento em Tempo Real" },
      { tipo: "p", texto: "Esta verificação é um procedimento meramente burocrático, pontual e periódico. A Kiri não monitora em tempo real e não responde por alterações supervenientes de status profissional, suspensões de registro, cassações, processos éticos em andamento (visto que correm sob sigilo legal nos conselhos de classe) ou encerramento de atividades ocorridos após a data da última checagem. É dever e responsabilidade do usuário confirmar a regularidade atual do profissional perante o respectivo conselho antes do início de qualquer ato clínico." },
    ],
  },
  {
    titulo: "6. Exclusão de Responsabilidade Civil da Plataforma",
    blocos: [
      { tipo: "p", texto: "Na máxima extensão permitida pela legislação brasileira aplicável, por atuar estritamente como provedora de tecnologia e busca (nos termos dos artigos 18 e 19 do Marco Civil da Internet e diretrizes do Código de Defesa do Consumidor), a Kiri não responde por:" },
      { tipo: "lista", itens: [
        "Quaisquer danos decorrentes de indisponibilidades técnicas temporárias, instabilidades de rede ou manutenção da plataforma;",
        "Atos de imperícia, imprudência, negligência, erro de diagnóstico, quebra de sigilo profissional ou quebras contratuais cometidas pelos profissionais de saúde contatados pelo usuário;",
        "Dados biográficos, descrições clínicas ou contatos desatualizados ou incorretos fornecidos voluntariamente pelos próprios profissionais em seus perfis, comprometendo-se a plataforma a retificar as informações assim que formalmente notificada.",
      ]},
    ],
  },
  {
    titulo: "7. Proteção de Dados Pessoais",
    blocos: [
      { tipo: "p", texto: "O tratamento de dados pessoais no âmbito da plataforma ocorre em estrita observância à Lei Geral de Proteção de Dados (Lei n.º 13.709/2018 — LGPD). Para compreender de forma detalhada como seus dados de contato e dados sensíveis de saúde são protegidos, armazenados ou eliminados, consulte a nossa Política de Privacidade, que integra este documento para todos os fins de direito." },
    ],
  },
  {
    titulo: "8. Alterações destes Termos",
    blocos: [
      { tipo: "p", texto: "A Kiri reserva-se o direito de atualizar ou modificar estes Termos de Uso a qualquer momento para refletir melhorias técnicas, novas funcionalidades ou ajustes regulatórios. Alterações materiais serão informadas visivelmente na interface da plataforma. O uso continuado dos nossos serviços após a publicação dos termos atualizados constituirá sua aceitação inequívoca das novas condições." },
    ],
  },
  {
    titulo: "9. Legislação Aplicável e Foro Eleito",
    blocos: [
      { tipo: "p", texto: "Estes Termos de Uso são regidos, interpretados e executados de acordo com as leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias ou litígios decorrentes deste instrumento, as partes elegem o foro da Comarca de São Paulo — SP, com expressa e irrevogável renúncia a qualquer outro, por mais privilegiado que seja ou venha a ser." },
    ],
  },
];

function Bloco({ bloco }: { bloco: Bloco }) {
  if (bloco.tipo === "destaque") {
    return (
      <p className="text-[15.5px] md:text-[16.5px] leading-[1.7] text-carvao font-semibold m-0 mt-1">
        {bloco.texto}
      </p>
    );
  }
  if (bloco.tipo === "lista") {
    return (
      <ul className="flex flex-col gap-2 pl-1">
        {bloco.itens.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] md:text-[16px] leading-[1.7] text-cinza-texto">
            <span className="text-muted mt-[3px] flex-shrink-0 text-[10px]">●</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (bloco.tipo === "alineas") {
    return (
      <div className="flex flex-col gap-2.5 pl-2">
        {bloco.itens.map((item, i) => (
          <p key={i} className="text-[15px] md:text-[16px] leading-[1.7] text-cinza-texto m-0">
            {item}
          </p>
        ))}
      </div>
    );
  }
  if (bloco.texto.includes("Política de Privacidade")) {
    const parts = bloco.texto.split("Política de Privacidade");
    return (
      <p className="text-[15.5px] md:text-[16.5px] leading-[1.7] text-cinza-texto m-0">
        {parts[0]}
        <Link href="/politica-de-privacidade" className="underline text-cinza-texto">
          Política de Privacidade
        </Link>
        {parts[1]}
      </p>
    );
  }
  return (
    <p className="text-[15.5px] md:text-[16.5px] leading-[1.7] text-cinza-texto m-0">
      {bloco.texto}
    </p>
  );
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-creme overflow-x-hidden">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Termos de Uso" />
      </div>

      <div className="max-w-3xl lg:max-w-[1060px] mx-auto w-full pb-16 px-2 lg:px-6 lg:flex lg:gap-10 lg:items-start">

        {/* Sumário lateral — lg+ */}
        <aside className="hidden lg:block w-[196px] flex-shrink-0">
          <div className="sticky top-8 pt-4">
            <p className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted mb-2 pl-3">Sumário</p>
            <nav className="flex flex-col">
              {SECOES.map((s, i) => (
                <a
                  key={i}
                  href={`#secao-${i + 1}`}
                  className="text-[12px] leading-[1.45] text-muted no-underline hover:text-carvao transition-colors py-[5px] border-l border-[#E2D6C0] pl-3 hover:border-[#BE6E4E] block"
                >
                  {s.titulo}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">

          <div className="px-[22px] pt-4 pb-2">
            <h1 className="font-serif text-[32px] md:text-[38px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0">
              Termos de Uso
            </h1>
            <p className="mt-3 text-[14px] text-muted leading-[1.6]">
              Última atualização: junho de 2026
            </p>
          </div>

          <IndiceAccordion secoes={SECOES.map((s) => s.titulo)} />

          <div className="px-[22px] pt-4 pb-2">
            <p className="text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto">
              Seja bem-vindo à Kiri. Ao acessar, navegar ou utilizar nossa plataforma, você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer das condições aqui estabelecidas, orientamos que interrompa imediatamente o uso dos nossos serviços.
            </p>
          </div>

          {/* Aviso em destaque */}
          <div className="mx-[18px] mt-6 bg-[#F6E6CC] border border-ambar-borda rounded-[14px] px-5 py-4 flex gap-3">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="10" cy="10" r="8.2" stroke="#BE8A3E" strokeWidth="1.5" />
              <line x1="10" y1="9" x2="10" y2="14" stroke="#BE8A3E" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="10" cy="6.3" r="1.05" fill="#BE8A3E" />
            </svg>
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-bold tracking-[0.06em] uppercase text-ambar-texto m-0">
                Aviso de Limitação de Responsabilidade (Art. 54, §4º do CDC)
              </p>
              <p className="text-[14px] leading-[1.6] text-ambar-texto m-0">
                <strong>A Kiri é exclusivamente uma ferramenta tecnológica de classificados e facilitação de busca de contatos.</strong> Não somos uma clínica, não prestamos serviços de saúde de qualquer natureza, não realizamos triagens clínicas e não elaboramos diagnósticos. Toda responsabilidade técnica, ética, administrativa e civil pelo atendimento, condutas e acompanhamento clínico é exclusiva do profissional de saúde selecionado de forma independente pelo usuário.
              </p>
              <p className="text-[14px] leading-[1.6] text-ambar-texto font-semibold m-0">
                Em caso de urgência, emergência, crise de saúde mental ou risco imediato à integridade física, procure o pronto-socorro mais próximo ou acione os serviços públicos de emergência (192 / 193).
              </p>
            </div>
          </div>

          <div className="px-[22px] mt-8 flex flex-col gap-8">
            {SECOES.map((s, idx) => (
              <div key={s.titulo}>
                <h2 id={`secao-${idx + 1}`} className="font-serif text-[20px] md:text-[22px] font-semibold text-carvao leading-[1.25] mb-3">
                  {s.titulo}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {s.blocos.map((b, i) => (
                    <Bloco key={i} bloco={b} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Footer className="mx-[22px] mt-12" />
        </div>
      </div>
    </div>
  );
}
