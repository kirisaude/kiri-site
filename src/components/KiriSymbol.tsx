// Just the two bird curves from the Kiri logo, without the "Kiri" text
export function KiriSymbol({ height = 36 }: { height?: number }) {
  // viewBox crops to just the symbol area (two bird arcs with stroke padding)
  const aspect = 54 / 37;
  const width = Math.round(height * aspect);
  return (
    <svg
      viewBox="7 25 54 37"
      width={width}
      height={height}
      aria-hidden="true"
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
    </svg>
  );
}
