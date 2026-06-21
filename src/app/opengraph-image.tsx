import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kiri — Rede selecionada de neurodesenvolvimento infantil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontRes = await fetch("https://fonts.gstatic.com/s/newsreader/v20/cY9qfjOCX1hbuyalUrK8iaYLGAQ.woff2");
  const fontBuf = await fontRes.arrayBuffer();
  const fontB64 = Buffer.from(fontBuf).toString("base64");

  // OG image inteiro como SVG — evita limitações do Satori com texto e stroke
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <style>
      @font-face {
        font-family: 'Newsreader';
        font-weight: 500;
        src: url('data:font/woff2;base64,${fontB64}') format('woff2');
      }
    </style>
  </defs>
  <rect width="1200" height="630" fill="#F5EFE6"/>

  <!-- Logo horizontal: símbolo à esquerda, Kiri à direita, centrado em y=255 -->
  <svg x="390" y="178" width="100" height="100" viewBox="0 0 120 120">
    <path d="M19 52 C31 37 43 37 52 50 C61 37 73 37 84 52" fill="none" stroke="#BE6E4E" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88" fill="none" stroke="#44606C" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <text x="510" y="268" font-family="Newsreader, serif" font-size="120" font-weight="500" fill="#BE6E4E">Kiri</text>

  <!-- Linha divisória -->
  <rect x="476" y="318" width="248" height="2" rx="1" fill="#D8C7B0"/>

  <!-- Tagline -->
  <text x="600" y="370" text-anchor="middle" font-family="Newsreader, serif" font-size="26" font-weight="400" fill="#44606C">Rede selecionada de neurodesenvolvimento infantil</text>

  <!-- URL -->
  <text x="600" y="414" text-anchor="middle" font-family="Newsreader, serif" font-size="18" font-weight="400" fill="#9A8C78">kirisaude.com.br</text>
</svg>`;

  const ogB64 = Buffer.from(ogSvg).toString("base64");

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`data:image/svg+xml;base64,${ogB64}`} width={1200} height={630} alt="Kiri" />
    ),
    { ...size }
  );
}
