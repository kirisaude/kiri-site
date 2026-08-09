type Variant = "principal" | "reverso" | "mono";

const CORES: Record<Variant, { onda1: string; onda2: string }> = {
  principal: { onda1: "#BE6E4E", onda2: "#44606C" },
  reverso:   { onda1: "#E0A55E", onda2: "#F5EFE6" },
  mono:      { onda1: "#2C2722", onda2: "#2C2722" },
};

export function KiriLogo({ size = 26, variant = "principal" }: { size?: number; variant?: Variant }) {
  const { onda1, onda2 } = CORES[variant];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      style={{ overflow: "visible", flexShrink: 0, display: "block" }}
    >
      <path
        d="M19 52 C31 37 43 37 52 50 C61 37 73 37 84 52"
        fill="none" stroke={onda1} strokeWidth="10" strokeLinecap="round"
      />
      <path
        d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88"
        fill="none" stroke={onda2} strokeWidth="10" strokeLinecap="round"
      />
    </svg>
  );
}
