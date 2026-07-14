const CONECTORES = new Set(["de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "e", "ou", "a", "o", "as", "os", "para", "com", "por", "entre", "ao", "à", "aos", "às", "um", "uma"]);

export function titleCasePT(str: string) {
  // Se o texto inteiro está em caps (ex: nome digitado em maiúsculas), não preserva siglas
  const todoMaiusculo = str === str.toUpperCase();
  return str.replace(/\S+/g, (word, offset) => {
    // Preserva siglas (TEA, TDAH, USP...) apenas quando o texto não é todo maiúsculo
    if (!todoMaiusculo && word.length > 1 && word === word.toUpperCase() && /^[A-ZÀ-Ú]+$/.test(word)) return word;
    const clean = word.toLowerCase();
    if (offset === 0 || !CONECTORES.has(clean)) return clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
  });
}
