import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";

const SECOES = [
  {
    titulo: "1. Quem somos",
    texto: [
      "A Kiri é uma plataforma digital de busca e facilitação de contato entre famílias e profissionais de saúde especializados em neurodesenvolvimento infantil. Para os fins desta Política, a Kiri atua como controladora dos dados pessoais coletados pela plataforma, nos termos da Lei Geral de Proteção de Dados Pessoais (Lei n.º 13.709/2018 — LGPD).",
      "Dúvidas ou solicitações relacionadas a dados pessoais podem ser enviadas para: kirisaude@gmail.com",
    ],
  },
  {
    titulo: "2. Quais dados coletamos e por quê",
    texto: [
      "Formulário de encaminhamento (famílias): coletamos nome completo do responsável, contato (WhatsApp ou e-mail), cidade e modalidade de preferência. Esses dados são utilizados exclusivamente para realizar o encaminhamento ao profissional indicado e para o contato inicial da equipe Kiri. As respostas incluem contexto de saúde implícito (busca por profissional de neurodesenvolvimento), classificado como dado sensível pela LGPD — categoria especial (art. 11). A base legal utilizada é o consentimento livre, informado e inequívoco do titular (art. 11, I).",
      "Formulário de inscrição de profissionais: coletamos nome, profissão, número de registro no conselho, especialidade, áreas de atuação, formação acadêmica, localização e contato. Esses dados são utilizados exclusivamente para análise da candidatura à rede Kiri. A base legal é o consentimento do titular.",
      "Formulário de reporte de perfil: coletamos o tipo de problema reportado e o identificador do profissional em questão. O reporte é processado de forma anônima pela equipe Kiri.",
      "Acesso à plataforma: não armazenamos senhas. O acesso é verificado por uma credencial de sessão (cookie httpOnly) que expira em 30 dias.",
      "Dados de navegação: não utilizamos ferramentas de rastreamento (analytics, pixels de terceiros) neste momento.",
    ],
  },
  {
    titulo: "3. Com quem compartilhamos os dados",
    texto: [
      "Os dados do formulário de encaminhamento (famílias) são armazenados no Brasil, em servidores da Supabase Inc. com região configurada em São Paulo (South America). O formulário de inscrição de profissionais é processado pelo Tally.so (Tally Solutions Inc.), plataforma com sede nos Estados Unidos, com transferência internacional baseada em cláusulas contratuais adequadas. Ambos os serviços atuam como operadores dos dados, nos termos do art. 39 da LGPD.",
      "A Kiri não vende, cede nem compartilha dados pessoais com terceiros para fins comerciais ou publicitários.",
      "Os dados podem ser compartilhados com o profissional de saúde solicitado, exclusivamente para viabilizar o encaminhamento. O profissional, ao receber o contato, passa a ser responsável pelo tratamento dos dados no âmbito do atendimento clínico.",
      "Em casos exigidos por lei ou ordem judicial, os dados podem ser divulgados às autoridades competentes.",
    ],
  },
  {
    titulo: "4. Por quanto tempo armazenamos os dados",
    texto: [
      "Formulário de famílias: as respostas são retidas por até 12 meses a partir da data de preenchimento, ou até a solicitação de exclusão pelo titular, o que ocorrer primeiro.",
      "Formulário de inscrição de profissionais: as respostas são retidas enquanto a candidatura estiver em análise ou enquanto o profissional compuser a rede Kiri. Candidaturas não aprovadas são excluídas em até 6 meses após a comunicação.",
      "Após os prazos acima, os dados são excluídos do banco de dados Supabase e dos sistemas do Tally mediante solicitação da equipe Kiri.",
    ],
  },
  {
    titulo: "5. Seus direitos como titular",
    texto: [
      "Nos termos da LGPD (art. 18), você tem direito a: (a) confirmar a existência de tratamento; (b) acessar seus dados; (c) corrigir dados incompletos, inexatos ou desatualizados; (d) solicitar a anonimização, bloqueio ou eliminação de dados desnecessários; (e) obter informações sobre o compartilhamento com terceiros; (f) revogar o consentimento a qualquer momento.",
      "Para exercer qualquer desses direitos, envie um e-mail para kirisaude@gmail.com com o assunto 'Direitos LGPD'. Responderemos em até 15 dias úteis.",
    ],
  },
  {
    titulo: "6. Cookies",
    texto: [
      "Utilizamos um único cookie de sessão (kiri_acesso) para controle de acesso à plataforma. Esse cookie é httpOnly (não acessível por JavaScript), não rastreia comportamento de navegação e expira em 30 dias ou ao limpar os dados do navegador.",
      "Não utilizamos cookies de terceiros, pixels de rastreamento ou ferramentas de publicidade.",
    ],
  },
  {
    titulo: "7. Segurança",
    texto: [
      "Adotamos medidas técnicas adequadas para proteger os dados contra acesso não autorizado, perda ou divulgação indevida, incluindo comunicação via HTTPS, armazenamento com controle de acesso por Row Level Security (Supabase) e acesso restrito às credenciais de produção.",
      "Como toda plataforma digital, não podemos garantir segurança absoluta. Em caso de incidente relevante, notificaremos os titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD) nos prazos legais.",
    ],
  },
  {
    titulo: "8. Crianças e adolescentes",
    texto: [
      "A plataforma Kiri é destinada a responsáveis legais de crianças e adolescentes. Não coletamos dados diretamente de menores. O responsável legal, ao preencher o formulário, declara ter capacidade legal para fazê-lo em nome do menor.",
      "O tratamento de dados relacionados a crianças é realizado com cuidado redobrado, observando o interesse superior do menor conforme art. 14 da LGPD.",
    ],
  },
  {
    titulo: "9. Alterações nesta Política",
    texto: [
      "Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas na plataforma. O uso continuado após a publicação implica aceite das novas condições.",
      "Última atualização: junho de 2026.",
    ],
  },
];

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Política de Privacidade" />
      </div>

      <div className="max-w-3xl mx-auto pb-16 w-full px-2">
        <div className="px-[22px] pt-4 pb-2">
          <h1 className="font-serif text-[32px] md:text-[38px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0">
            Política de Privacidade
          </h1>
          <p className="mt-3 text-[14px] text-muted leading-[1.6]">
            Última atualização: junho de 2026
          </p>
          <p className="mt-4 text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto">
            Esta Política descreve como a Kiri coleta, usa, armazena e protege
            os dados pessoais de quem usa a plataforma, em conformidade com a
            Lei Geral de Proteção de Dados (LGPD — Lei n.º 13.709/2018).
          </p>
        </div>

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

        <Footer className="mx-[22px] mt-12" />
      </div>
    </div>
  );
}
