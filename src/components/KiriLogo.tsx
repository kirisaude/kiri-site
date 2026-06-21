export function KiriLogo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      style={{ overflow: "visible", flexShrink: 0, display: "block" }}
    >
      <path
        d="M19 52 C31 37 43 37 52 50 C61 37 73 37 84 52"
        fill="none"
        stroke="#BE6E4E"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88"
        fill="none"
        stroke="#44606C"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
