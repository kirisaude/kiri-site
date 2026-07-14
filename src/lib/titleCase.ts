const CONECTORES = new Set(["de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "e", "ou", "a", "o", "as", "os", "para", "com", "por", "entre", "ao", "à", "aos", "às", "um", "uma"]);

export function titleCasePT(str: string) {
  return str.replace(/\S+/g, (word, offset) => {
    const clean = word.toLowerCase();
    if (offset === 0 || !CONECTORES.has(clean)) return clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
  });
}
