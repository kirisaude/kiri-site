const CONECTORES = new Set(["de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "e", "ou", "a", "o", "as", "os", "para", "com", "por", "entre", "ao", "à", "aos", "às", "um", "uma"]);

// Siglas/institutos que sempre ficam em maiúsculas
const SIGLAS_FIXAS = new Set(["tea", "tdah", "usp", "unifesp", "fmusp", "crp", "crm", "crefito", "coren", "cfp", "rqe", "clasi", "casi", "abenepi", "abda", "aba", "pecs", "dir", "easi", "sipt", "spm"]);

const ESTADO_SIGLA: Record<string, string> = {
  "acre": "AC", "alagoas": "AL", "amapa": "AP", "amazonas": "AM",
  "bahia": "BA", "ceara": "CE", "distrito federal": "DF", "espirito santo": "ES",
  "goias": "GO", "maranhao": "MA", "mato grosso do sul": "MS", "mato grosso": "MT",
  "minas gerais": "MG", "para": "PA", "paraiba": "PB", "parana": "PR",
  "pernambuco": "PE", "piaui": "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN",
  "rio grande do sul": "RS", "rondonia": "RO", "roraima": "RR", "santa catarina": "SC",
  "sao paulo": "SP", "sergipe": "SE", "tocantins": "TO",
};

function semAcento(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function normalizarCidade(raw: string): string {
  const s = raw.trim();
  let cidade = s;
  let uf: string | null = null;

  let m: RegExpMatchArray | null;

  // "Cidade, SP" ou "Cidade, sp"
  m = s.match(/^(.+?)\s*,\s*([A-Za-z]{2})$/);
  if (m) { cidade = m[1].trim(); uf = m[2].toUpperCase(); }

  // "Cidade - SP"
  if (!uf) { m = s.match(/^(.+?)\s+-\s+([A-Za-z]{2})$/); if (m) { cidade = m[1].trim(); uf = m[2].toUpperCase(); } }

  // "Cidade-SP" ou "Cidade-sp"
  if (!uf) { m = s.match(/^(.+?)-([A-Za-z]{2})$/); if (m) { cidade = m[1].trim(); uf = m[2].toUpperCase(); } }

  // "Cidade, São Paulo" (nome completo do estado)
  if (!uf) {
    m = s.match(/^(.+?)\s*,\s*(.{4,})$/);
    if (m) {
      const sigla = ESTADO_SIGLA[semAcento(m[2].trim())];
      if (sigla) { cidade = m[1].trim(); uf = sigla; }
    }
  }

  return uf ? `${titleCasePT(cidade.toLowerCase())}, ${uf}` : titleCasePT(cidade.toLowerCase());
}

export function titleCasePT(str: string) {
  const todoMaiusculo = str === str.toUpperCase();
  return str.replace(/\S+/g, (word, offset) => {
    const lower = word.toLowerCase().replace(/[^a-zà-ú]/g, "");
    // Siglas fixas sempre em maiúsculas
    if (SIGLAS_FIXAS.has(lower)) return word.toUpperCase();
    // Preserva siglas já escritas em maiúsculas quando o texto não é todo caps (inclui hífens e dígitos: DSM-V, CID-10)
    if (!todoMaiusculo && word.length > 1 && word === word.toUpperCase() && /^[A-ZÀ-Ú0-9][A-ZÀ-Ú0-9\-]*$/.test(word)) return word;
    const clean = word.toLowerCase();
    if (offset === 0 || !CONECTORES.has(clean)) return clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
  });
}
