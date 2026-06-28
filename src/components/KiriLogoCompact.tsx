// Compact logo matching kiri-logo-compacta.svg — for headers and footers
export function KiriLogoCompact({ height = 38 }: { height?: number }) {
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
          fill="none"
          stroke="#BE6E4E"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88"
          fill="none"
          stroke="#44606C"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="85"
        y="66"
        fontFamily="Newsreader, Georgia, 'Times New Roman', serif"
        fontSize="58"
        fontWeight="500"
        letterSpacing="-1"
        fill="#BE6E4E"
      >
        Kiri
      </text>
    </svg>
  );
}
