export interface Formacao {
  curso: string;
  instituicao_ano: string;
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
  valor_min: number;
  valor_max: number | null;
  convenio_info: string;
  verificado: boolean;
  verificacao_data: string;
  foto_url: string | null;
}

export const PROFISSOES_ORDENADAS = [
  "Psiquiatra da infância e adolescência",
  "Neuropediatra",
  "Neuropsicólogo",
  "Psicólogo",
  "Fonoaudiólogo",
  "Terapeuta ocupacional",
  "Fisioterapeuta",
  "Nutricionista",
] as const;

export const PROFISSAO_PLURAL: Record<string, string> = {
  "Psiquiatra da infância e adolescência": "Psiquiatras da infância e adolescência",
  "Neuropediatra": "Neuropediatras",
  "Neuropsicólogo": "Neuropsicólogos",
  "Psicólogo": "Psicólogos",
  "Fonoaudiólogo": "Fonoaudiólogos",
  "Terapeuta ocupacional": "Terapeutas ocupacionais",
  "Fisioterapeuta": "Fisioterapeutas",
  "Nutricionista": "Nutricionistas",
};

export function valorDisplay(p: Pick<Profissional, "valor_formato" | "valor_min" | "valor_max">): string {
  if (p.valor_formato === "a_partir_de") {
    return `a partir de R$ ${p.valor_min}`;
  }
  return `R$ ${p.valor_min}–${p.valor_max}`;
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
