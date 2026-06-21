import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kiri — Rede selecionada de neurodesenvolvimento infantil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Círculo decorativo fundo */}
        <div
          style={{
            position: "absolute",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            backgroundColor: "#EDE3D3",
            top: "-120px",
            right: "-80px",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            backgroundColor: "#E2D6C0",
            bottom: "-80px",
            left: "-60px",
            opacity: 0.4,
          }}
        />

        {/* Logo — símbolo Kiri */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path d="M19 52 C31 37 43 37 52 50 C61 37 73 37 84 52" fill="none" stroke="#BE6E4E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88" fill="none" stroke="#44606C" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Nome */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: "500",
            color: "#BE6E4E",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginTop: "20px",
          }}
        >
          Kiri
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            color: "#44606C",
            marginTop: "20px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "500",
            letterSpacing: "0.01em",
            textAlign: "center",
            maxWidth: "640px",
            lineHeight: 1.4,
          }}
        >
          Rede selecionada de neurodesenvolvimento infantil
        </div>

        {/* Linha separadora */}
        <div
          style={{
            width: "48px",
            height: "2px",
            backgroundColor: "#D8C7B0",
            marginTop: "28px",
          }}
        />

        {/* Subtexto */}
        <div
          style={{
            fontSize: "19px",
            color: "#9A8C78",
            marginTop: "20px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "400",
            textAlign: "center",
            maxWidth: "560px",
            lineHeight: 1.5,
          }}
        >
          TEA · TDAH · Neurodesenvolvimento
          {"\n"}Formação verificada, contato pela Kiri
        </div>
      </div>
    ),
    { ...size }
  );
}
