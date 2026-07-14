const CONECTORES = new Set(["de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "e", "ou", "a", "o", "as", "os", "para", "com", "por", "entre", "ao", "à", "aos", "às", "um", "uma"]);

// Siglas/institutos que sempre ficam em maiúsculas
const SIGLAS_FIXAS = new Set(["tea", "tdah", "usp", "unifesp", "fmusp", "crp", "crm", "crefito", "coren", "cfp", "rqe", "clasi", "abenepi", "abda", "aba"]);

export function titleCasePT(str: string) {
  const todoMaiusculo = str === str.toUpperCase();
  return str.replace(/\S+/g, (word, offset) => {
    const lower = word.toLowerCase().replace(/[^a-zà-ú]/g, "");
    // Siglas fixas sempre em maiúsculas
    if (SIGLAS_FIXAS.has(lower)) return word.toUpperCase();
    // Preserva siglas já escritas em maiúsculas quando o texto não é todo caps
    if (!todoMaiusculo && word.length > 1 && word === word.toUpperCase() && /^[A-ZÀ-Ú]+$/.test(word)) return word;
    const clean = word.toLowerCase();
    if (offset === 0 || !CONECTORES.has(clean)) return clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
  });
}
