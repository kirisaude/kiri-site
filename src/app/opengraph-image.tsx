import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kiri — Rede selecionada de neurodesenvolvimento infantil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Carrega Newsreader e emite como base64 dentro do SVG
  const fontRes = await fetch("https://fonts.gstatic.com/s/newsreader/v20/cY9qfjOCX1hbuyalUrK8iaYLGAQ.woff2");
  const fontBuf = await fontRes.arrayBuffer();
  const fontB64 = Buffer.from(fontBuf).toString("base64");

  // SVG do logo completo com fonte embutida
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" width="360" height="260">
  <defs>
    <style>
      @font-face {
        font-family: 'Newsreader';
        font-weight: 500;
        src: url('data:font/woff2;base64,${fontB64}') format('woff2');
      }
    </style>
  </defs>
  <g transform="translate(120 6)">
    <path d="M19 52 C31 37 43 37 52 50 C61 37 73 37 84 52" fill="none" stroke="#BE6E4E" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88" fill="none" stroke="#44606C" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="180" y="235" text-anchor="middle" font-family="Newsreader, serif" font-size="116" font-weight="500" fill="#BE6E4E">Kiri</text>
</svg>`;

  const logoB64 = Buffer.from(logoSvg).toString("base64");
  const logoSrc = `data:image/svg+xml;base64,${logoB64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#F5EFE6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={360} height={260} alt="Kiri" />
        <div style={{ fontSize: "22px", color: "#44606C", marginTop: "16px", fontFamily: "serif", fontWeight: "400", lineHeight: 1.4, display: "flex", letterSpacing: "0.01em" }}>
          Rede selecionada de neurodesenvolvimento infantil
        </div>
        <div style={{ fontSize: "16px", color: "#9A8C78", marginTop: "14px", fontFamily: "serif", display: "flex" }}>
          kirisaude.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
