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
    titulo: "1. Quem Somos e Canal de Contato",
    blocos: [
      { tipo: "p", texto: "A Kiri é uma plataforma digital voltada a organizar o fluxo de busca e facilitar o contato direto entre famílias e profissionais de saúde independentes que atuam com neurodesenvolvimento infantil. Para os fins desta Política, a Kiri atua como Controladora dos dados pessoais coletados pela plataforma, nos termos da LGPD." },
      { tipo: "p", texto: "Qualquer dúvida, reclamação ou solicitação relacionada aos seus dados pessoais pode ser enviada diretamente para o nosso Encarregado de Proteção de Dados através do e-mail oficial: contato@kirisaude.com.br" },
    ],
  },
  {
    titulo: "2. Dados Coletados, Finalidades e Bases Legais",
    blocos: [
      { tipo: "destaque", texto: "Formulário de Direcionamento (Famílias)" },
      { tipo: "p", texto: "Coletamos o nome completo do responsável legal, informações de contato (WhatsApp ou e-mail), cidade e modalidade de atendimento de preferência. Esses dados são utilizados exclusivamente para viabilizar e facilitar o contato com o profissional escolhido. As respostas contêm contexto de saúde implícito (busca por atendimento em neurodesenvolvimento), caracterizando dados pessoais sensíveis (art. 5º, II da LGPD) e dados de crianças ou adolescentes (art. 14 da LGPD)." },
      { tipo: "p", texto: "Base Legal: Tratamento realizado com base no consentimento livre, informado e inequívoco do responsável legal, manifestado em observância ao melhor interesse da criança (art. 11, I e art. 14, § 1º da LGPD)." },
      { tipo: "destaque", texto: "Formulário de Inscrição de Profissionais" },
      { tipo: "p", texto: "Coletamos nome completo, profissão, número de registro no respectivo conselho de classe profissional, especialidade, áreas de atuação, formação acadêmica, localização e contatos profissionais. Esses dados são utilizados para a análise de elegibilidade técnica e preenchimento do perfil público na rede Kiri." },
      { tipo: "p", texto: "Base Legal: Consentimento livre e inequívoco do titular (art. 7º, I da LGPD)." },
      { tipo: "destaque", texto: "Formulário de Reporte de Perfil" },
      { tipo: "p", texto: "Coletamos a descrição do problema relatado e o identificador do profissional em questão. O reporte é processado de forma anônima pela equipe Kiri para fins de controle de qualidade e auditoria interna da plataforma." },
      { tipo: "destaque", texto: "Credenciais de Acesso" },
      { tipo: "p", texto: "Não coletamos nem armazenamos senhas. O controle de acesso administrativo à plataforma é verificado exclusivamente por uma credencial de sessão técnica (cookie httpOnly) que expira automaticamente em 30 (trinta) dias." },
      { tipo: "destaque", texto: "Dados de Navegação" },
      { tipo: "p", texto: "Em respeito à sua privacidade, não utilizamos ferramentas invasivas de rastreamento de comportamento, mapas de calor, pixels de terceiros ou serviços analíticos (analytics) nesta etapa da plataforma." },
    ],
  },
  {
    titulo: "3. Compartilhamento e Operação de Dados",
    blocos: [
      { tipo: "destaque", texto: "Armazenamento e Infraestrutura" },
      { tipo: "p", texto: "Todos os dados coletados através da plataforma são armazenados no Brasil, utilizando a infraestrutura de servidores da Supabase Inc., com região configurada em São Paulo (South America — sa-east-1). A Supabase atua estritamente como Operadora dos dados, seguindo nossas diretrizes de segurança (art. 39 da LGPD). Não há transferência internacional de dados." },
      { tipo: "destaque", texto: "Comercialização Proibida" },
      { tipo: "p", texto: "A Kiri não vende, não cede, não aluga e não compartilha dados pessoais com terceiros para fins comerciais, publicitários ou de marketing." },
      { tipo: "destaque", texto: "Fluxo de Contato com Profissionais" },
      { tipo: "p", texto: "Os dados de contato fornecidos pelas famílias serão compartilhados unicamente com o profissional de saúde selecionado de forma autônoma pela própria família para viabilizar o agendamento ou contato inicial." },
      { tipo: "destaque", texto: "Isenção de Responsabilidade Clínica" },
      { tipo: "p", texto: "A partir do momento em que o contato é iniciado, o profissional de saúde passa a ser o único e exclusivo Controlador e responsável pelo tratamento dos dados subsequentes, os quais estarão integralmente sujeitos ao sigilo profissional e às normas ético-clínicas de seus respectivos conselhos de classe (CFM, CFP, CREFITO, CRFa, CRN, etc.). A Kiri não possui acesso, ingerência ou responsabilidade sobre consultas, prontuários ou comunicações externas à plataforma." },
      { tipo: "destaque", texto: "Cumprimento Legal" },
      { tipo: "p", texto: "Os dados poderão ser compartilhados com autoridades públicas competentes caso haja estrita obrigação legal ou ordem judicial válida." },
    ],
  },
  {
    titulo: "4. Período de Retenção e Descarte",
    blocos: [
      { tipo: "destaque", texto: "Dados de Famílias" },
      { tipo: "p", texto: "As informações dos formulários de direcionamento são retidas pelo prazo máximo de 12 (doze) meses a partir do preenchimento, para fins de suporte e verificação de fluxo, ou até que o titular solicite sua exclusão, o que ocorrer primeiro." },
      { tipo: "destaque", texto: "Dados de Profissionais" },
      { tipo: "p", texto: "As informações são retidas e exibidas enquanto o profissional mantiver seu perfil ativo e compuser a rede Kiri. Em caso de candidaturas não aprovadas, os dados correspondentes serão integralmente excluídos em até 6 (seis) meses após a comunicação da negativa." },
      { tipo: "destaque", texto: "Término do Tratamento" },
      { tipo: "p", texto: "Após os prazos estipulados ou mediante revogação do consentimento, os dados são eliminados definitivamente dos servidores, salvo nas hipóteses de guarda obrigatória autorizadas pelo art. 16 da LGPD." },
    ],
  },
  {
    titulo: "5. Direitos dos Titulares de Dados",
    blocos: [
      { tipo: "p", texto: "Em conformidade com o artigo 18 da LGPD, qualquer usuário da plataforma (seja profissional ou responsável legal) pode, a qualquer momento, exercer seus direitos de:" },
      { tipo: "alineas", itens: [
        "(a) Confirmar a existência de tratamento e acessar seus dados pessoais de forma clara;",
        "(b) Corrigir dados incompletos, inexatos ou desatualizados;",
        "(c) Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;",
        "(d) Solicitar a portabilidade dos dados a outro fornecedor de serviço, nos termos da regulamentação da ANPD;",
        "(e) Revogar o consentimento previamente fornecido, sendo informado sobre as consequências da negativa (como a impossibilidade de utilizar o fluxo de contato).",
      ]},
      { tipo: "p", texto: "Para exercer estes direitos, envie uma mensagem para contato@kirisaude.com.br com o assunto \"Direitos LGPD\". Suas solicitações serão analisadas e respondidas gratuitamente no prazo legal de até 15 (quinze) dias." },
    ],
  },
  {
    titulo: "6. Cookies Técnicos",
    blocos: [
      { tipo: "p", texto: "A Kiri utiliza um único cookie estritamente técnico e de sessão para controle de acesso ao painel administrativo interno da plataforma. Este cookie possui a propriedade httpOnly (o que impede o acesso ou manipulação por scripts de terceiros ou códigos JavaScript maliciosos), não é coletado de usuários finais, não rastreia hábitos de consumo ou navegação externa e é automaticamente invalidado após 30 dias ou mediante a limpeza de dados do navegador." },
    ],
  },
  {
    titulo: "7. Medidas de Segurança da Informação",
    blocos: [
      { tipo: "p", texto: "Implementamos práticas de segurança técnicas e administrativas adequadas para proteger os dados pessoais contra acessos não autorizados, destruição, perda, alteração ou comunicação indevida. Isso inclui:" },
      { tipo: "lista", itens: [
        "Criptografia de dados em trânsito através de protocolo seguro HTTPS;",
        "Controle estrito de acessos aos bancos de dados por meio de políticas de segurança a nível de linha (Row Level Security — RLS no Supabase);",
        "Políticas de dupla autenticação (2FA) em todas as ferramentas administrativas.",
      ]},
      { tipo: "p", texto: "Nota de Realidade Digital: Embora adotemos padrões rígidos de proteção, a segurança absoluta em ambiente de internet não pode ser garantida contra ataques cibernéticos extraordinários. Na remota hipótese de um incidente de segurança que possa acarretar risco ou dano relevante aos titulares, comunicaremos imediatamente os afetados e a Autoridade Nacional de Proteção de Dados (ANPD), nos termos da lei." },
    ],
  },
  {
    titulo: "8. Proteção de Crianças e Adolescentes",
    blocos: [
      { tipo: "p", texto: "A Kiri é uma plataforma direcionada a adultos (pais e responsáveis legais). Não coletamos intencionalmente ou de forma direta dados inseridos por menores de idade. Ao preencher qualquer formulário, o usuário declara expressamente possuir capacidade civil e ser o detentor da autoridade parental ou tutela legal sobre o menor envolvido, assumindo total responsabilidade pelas informações inseridas." },
    ],
  },
  {
    titulo: "9. Alterações desta Política",
    blocos: [
      { tipo: "p", texto: "Esta Política de Privacidade poderá ser atualizada periodicamente para refletir melhorias técnicas ou mudanças legislativas. Sempre que uma alteração material for realizada, a data da \"Última atualização\" no topo deste documento será modificada. O uso contínuo dos serviços após a publicação das alterações constituirá aceitação tácita das novas condições." },
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
            <span className="text-muted mt-[2px] flex-shrink-0">—</span>
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
  const hasEmail = bloco.texto.includes("contato@kirisaude.com.br");
  if (hasEmail) {
    const parts = bloco.texto.split("contato@kirisaude.com.br");
    return (
      <p className="text-[15.5px] md:text-[16.5px] leading-[1.7] text-cinza-texto m-0">
        {parts[0]}
        <Link href="mailto:contato@kirisaude.com.br" className="underline text-cinza-texto">
          contato@kirisaude.com.br
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

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Política de Privacidade" />
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
              Política de Privacidade
            </h1>
            <p className="mt-3 text-[14px] text-muted leading-[1.6]">
              Última atualização: junho de 2026
            </p>
          </div>

          <IndiceAccordion secoes={SECOES.map((s) => s.titulo)} />

          <div className="px-[22px] pt-4 pb-2">
            <p className="text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto">
              Esta Política de Privacidade descreve como a Kiri coleta, usa, armazena e protege
              os dados pessoais de quem utiliza nossa plataforma, em estrita conformidade com a
              Lei Geral de Proteção de Dados Pessoais (LGPD — Lei n.º 13.709/2018).
            </p>
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
