import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";

type Bloco =
  | { tipo: "p"; texto: string }
  | { tipo: "destaque"; texto: string }
  | { tipo: "lista"; itens: string[] };

const SECOES: { titulo: string; blocos: Bloco[] }[] = [
  {
    titulo: "1. O que é a Kiri",
    blocos: [
      { tipo: "p", texto: "A Kiri é uma plataforma digital que atua como um facilitador de busca e canal de contato inicial entre famílias e profissionais de saúde independentes, especializados em neurodesenvolvimento infantil." },
      { tipo: "p", texto: "O uso da plataforma, o preenchimento de formulários ou o direcionamento de contatos não cria, sob nenhuma hipótese, vínculo terapêutico, clínico, assistencial ou hospitalar entre a Kiri e o usuário." },
    ],
  },
  {
    titulo: "2. Natureza e Escopo do Serviço",
    blocos: [
      { tipo: "destaque", texto: "O que a Kiri oferece" },
      { tipo: "p", texto: "(a) Acesso a uma listagem curada de profissionais de saúde que declaram atender aos critérios de verificação documental da plataforma; (b) Um canal técnico de direcionamento para que a família envie sua demanda inicial ao especialista escolhido; e (c) Disponibilização de informações e conteúdos de caráter estritamente educativo e informativo sobre as diferentes especialidades da área de neurodesenvolvimento." },
      { tipo: "destaque", texto: "O que a Kiri NÃO realiza" },
      { tipo: "p", texto: "Avaliações clínicas, consultas, triagens diagnósticas, prescrições médicas ou terapêuticas, emissão de laudos, acompanhamento ou qualquer outro ato privativo de profissionais de saúde legalmente habilitados." },
      { tipo: "destaque", texto: "Inexistência de Aconselhamento" },
      { tipo: "p", texto: "Nenhuma informação veiculada na plataforma — incluindo textos explicativos, nomenclaturas de filtros, descrições de perfis ou automações de direcionamento — deve ser interpretada como aconselhamento médico, psicológico ou terapêutico." },
    ],
  },
  {
    titulo: "3. Responsabilidade Técnica e Autonomia Profissional",
    blocos: [
      { tipo: "p", texto: "A responsabilidade técnica pelo diagnóstico, pela linha terapêutica adotada, pela conduta e pelo sigilo das informações clínicas é integralmente do profissional de saúde escolhido de forma soberana pelo usuário, nos termos da legislação brasileira (Lei n.º 8.080/1990) e dos respectivos Códigos de Ética Profissional (CFM, CFP, CREFITO, CRFa, etc.)." },
      { tipo: "p", texto: "A Kiri não interfere, não orienta, não supervisiona, não audita e não responde pelas decisões clínicas tomadas pelo profissional ou pelas escolhas feitas pela família durante ou após o atendimento. O agendamento, honorários e o tratamento subsequente ocorrem em ambiente totalmente externo e alheio à plataforma." },
    ],
  },
  {
    titulo: "4. Ausência de Garantia de Resultados Clínicos",
    blocos: [
      { tipo: "p", texto: "O usuário reconhece que as condições ligadas ao neurodesenvolvimento infantil (como o TEA e o TDAH) possuem alta variabilidade individual e demandam acompanhamento especializado, contínuo e multiprofissional. A Kiri não garante, não promete e não insinua qualquer resultado clínico, cura, melhora, eficácia de métodos específicos ou prognóstico decorrente da utilização da plataforma ou do contato com os profissionais listados." },
    ],
  },
  {
    titulo: "5. Selo \"Verificado\" — Alcance e Limitações",
    blocos: [
      { tipo: "p", texto: "O selo \"Verificado\" exibido nos perfis dos profissionais atesta exclusivamente que, na data da última checagem periódica realizada pela plataforma (conforme indicado no perfil), o profissional apresentou documentos comprobatórios válidos de: (a) registro ativo e regular perante o seu respectivo conselho de classe; e (b) especialização ou formação declarada aplicável ao escopo da plataforma." },
      { tipo: "destaque", texto: "Limitação da Verificação" },
      { tipo: "p", texto: "Esta verificação é um procedimento pontual e periódico. A Kiri não monitora em tempo real e não se responsabiliza por alterações imediatas de status profissional, suspensões de registro, processos administrativos ou judiciais supervenientes à data da última checagem. É de responsabilidade do usuário confirmar a regularidade atual do profissional junto ao respectivo conselho de classe antes de iniciar qualquer consulta." },
    ],
  },
  {
    titulo: "6. Limitação de Responsabilidade Civil",
    blocos: [
      { tipo: "p", texto: "Na máxima extensão permitida pela legislação brasileira aplicável (incluindo o Código de Defesa do Consumidor e o Marco Civil da Internet), a Kiri, na qualidade de provedora de tecnologia e busca, não será responsabilizada por:" },
      { tipo: "lista", itens: [
        "Qualquer dano, direto ou indireto, decorrente de indisponibilidades técnicas temporárias da plataforma;",
        "Erros médicos, imperícia, imprudência, negligência, quebra de sigilo profissional ou falhas contratuais cometidas pelos profissionais de saúde listados;",
        "Conteúdos, descrições clínicas ou dados biográficos incorretos inseridos pelos próprios profissionais em seus perfis, comprometendo-se a plataforma a corrigir eventuais inconsistências assim que formalmente notificada.",
      ]},
    ],
  },
  {
    titulo: "7. Proteção de Dados Pessoais",
    blocos: [
      { tipo: "p", texto: "O tratamento de dados pessoais na plataforma ocorre em estrita observância à Lei Geral de Proteção de Dados (Lei n.º 13.709/2018 — LGPD), com armazenamento seguro em território nacional. Para compreender detalhadamente como seus dados de contato e dados sensíveis de saúde são protegidos, retidos e como exercer seus direitos de titular, consulte a nossa Política de Privacidade." },
    ],
  },
  {
    titulo: "8. Alterações destes Termos",
    blocos: [
      { tipo: "p", texto: "A Kiri reserva-se o direito de atualizar ou modificar estes Termos de Uso a qualquer momento, visando refletir melhorias técnicas ou ajustes operacionais. Alterações materiais serão informadas diretamente na plataforma. O uso continuado dos nossos serviços após a publicação dos termos atualizados constituirá sua aceitação tácita das novas condições." },
    ],
  },
  {
    titulo: "9. Legislação Aplicável e Foro",
    blocos: [
      { tipo: "p", texto: "Estes Termos são regidos e interpretados de acordo com as leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias decorrentes deste instrumento, fica eleito o foro da Comarca de São Paulo — SP, com expressa renúncia a qualquer outro, por mais privilegiado que seja ou venha a ser." },
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
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Termos de Uso" />
      </div>

      <div className="max-w-3xl mx-auto pb-16 w-full px-2">

        <div className="px-[22px] pt-4 pb-2">
          <h1 className="font-serif text-[32px] md:text-[38px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0">
            Termos de Uso
          </h1>
          <p className="mt-3 text-[14px] text-muted leading-[1.6]">
            Última atualização: junho de 2026
          </p>
          <p className="mt-4 text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto">
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
          <p className="text-[14px] leading-[1.6] text-ambar-texto m-0">
            <strong>A Kiri não é uma clínica e não realiza diagnósticos.</strong> Toda responsabilidade técnica, ética e civil pelo atendimento, conduta e acompanhamento clínico é exclusiva do profissional de saúde selecionado pelo usuário. Em caso de urgência, emergência, crise ou risco imediato à integridade física, procure o pronto-socorro mais próximo ou ligue para os serviços públicos de emergência (192 / 193).
          </p>
        </div>

        <div className="px-[22px] mt-8 flex flex-col gap-8">
          {SECOES.map((s) => (
            <div key={s.titulo}>
              <h2 className="font-serif text-[20px] md:text-[22px] font-semibold text-carvao leading-[1.25] mb-3">
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
  );
}
