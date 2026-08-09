type Variant = "principal" | "reverso" | "mono";

const CORES: Record<Variant, { onda1: string; onda2: string; texto: string }> = {
  principal: { onda1: "#BE6E4E", onda2: "#44606C", texto: "#BE6E4E" },
  reverso:   { onda1: "#E0A55E", onda2: "#F5EFE6", texto: "#F5EFE6" },
  mono:      { onda1: "#2C2722", onda2: "#2C2722", texto: "#2C2722" },
};

export function KiriLogoCompact({
  height = 38,
  variant = "principal",
  onDark = false,
}: {
  height?: number;
  variant?: Variant;
  onDark?: boolean;
}) {
  const resolvedVariant: Variant = onDark ? "reverso" : variant;
  const { onda1, onda2, texto } = CORES[resolvedVariant];
  const width = Math.round(height * 250 / 96);

  return (
    <svg
      viewBox="0 0 250 96"
      width={width}
      height={height}
      role="img"
      aria-label="Kiri"
      style={{ display: "block", flexShrink: 0 }}
    >
      <g transform="translate(2 11) scale(0.52)">
        <path
          d="M19 52 C31 37 43 37 52 50 C61 37 73 37 84 52"
          fill="none" stroke={onda1} strokeWidth="10"
          strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88"
          fill="none" stroke={onda2} strokeWidth="10"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
      <text
        x="85" y="66"
        fontFamily="Newsreader, Georgia, 'Times New Roman', serif"
        fontSize="58" fontWeight="500" letterSpacing="-1"
        fill={texto}
      >
        Kiri
      </text>
    </svg>
  );
}
