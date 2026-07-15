export interface Formacao {
  curso: string;
  instituicao_ano: string;
  verificado?: boolean;
  pendente?: boolean;
  oculto?: boolean;
  obs?: string;
}

export interface Profissional {
  id: string;
  nome: string;
  profissao: string;
  titulo_exibicao: string;
  registro_conselho: string;
  rqe: string | null;
  areas_atuacao: string[];
  formacao: Formacao[];
  sobre: string;
  modalidade: string;
  cidade: string;
  faixa_etaria: string;
  valor_formato: "a_partir_de" | "faixa";
  valor_min: number | null;
  valor_max: number | null;
  convenio_info: string;
  convenios?: string[] | null;
  tempo_atuacao?: string | null;
  verificado: boolean;
  verificacao_data: string;
  foto_url: string | null;
  foto_posicao?: string | null;
  genero?: "F" | "M";
  oculto?: boolean;
  registro_verificado?: boolean;
  registro_pendente?: boolean;
  registro_obs?: string;
  sobre_verificado?: boolean;
  sobre_pendente?: boolean;
  sobre_obs?: string;
  whatsapp_agendamento: string | null;
  card_token: string;
}

export const PROFISSOES_ORDENADAS = [
  "Psiquiatra",
  "Psiquiatra da infância e adolescência",
  "Neuropediatra",
  "Neuropsicólogo",
  "Psicólogo",
  "Fonoaudiólogo",
  "Terapeuta ocupacional",
  "Fisioterapeuta",
  "Nutricionista",
  "Psicopedagogo",
] as const;

export const PROFISSAO_PLURAL: Record<string, string> = {
  "Psiquiatra": "Psiquiatras",
  "Psiquiatra da infância e adolescência": "Psiquiatras da infância e adolescência",
  "Neuropediatra": "Neuropediatras",
  "Neuropsicólogo": "Neuropsicólogos",
  "Psicólogo": "Psicólogos",
  "Fonoaudiólogo": "Fonoaudiólogos",
  "Terapeuta ocupacional": "Terapeutas ocupacionais",
  "Fisioterapeuta": "Fisioterapeutas",
  "Nutricionista": "Nutricionistas",
  "Psicopedagogo": "Psicopedagogos",
};

export function valorDisplay(p: Pick<Profissional, "valor_formato" | "valor_min" | "valor_max">): string | null {
  if (p.valor_min == null || p.valor_min === 0) return null;
  if (p.valor_formato === "a_partir_de") {
    return `a partir de R$ ${p.valor_min}`;
  }
  if (p.valor_max == null) return `a partir de R$ ${p.valor_min}`;
  return `R$ ${p.valor_min}–${p.valor_max}`;
}

export function feminizarTitulo(titulo: string): string {
  return titulo
    .replace(/ólogo\b/g, "óloga")
    .replace(/ogo\b/g, "oga");
}

export function cidadeCurta(cidade: string): string {
  return cidade.split(" —")[0].trim();
}

export function modalidadeCurta(modalidade: string): string {
  if (modalidade === "Presencial e online") return "Pres. e online";
  if (modalidade === "Somente presencial") return "Presencial";
  if (modalidade === "Somente online") return "Online";
  return modalidade;
}
