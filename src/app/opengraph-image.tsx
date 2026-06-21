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

        {/* Logo — dois pássaros em SVG */}
        <svg
          width="96"
          height="96"
          viewBox="0 0 120 120"
          fill="none"
          style={{ overflow: "visible" }}
        >
          {/* pássaro de cima — ferrugem */}
          <path
            d="M20 38 C28 20 52 14 72 22 C88 28 100 24 108 16 C104 32 92 42 74 40 C88 44 96 54 92 66 C80 52 58 48 40 54 C48 44 38 36 20 38 Z"
            fill="none"
            stroke="#BE6E4E"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* pássaro de baixo — ardósia */}
          <path
            d="M12 82 C20 64 44 58 64 66 C80 72 92 68 100 60 C96 76 84 86 66 84 C80 88 88 98 84 110 C72 96 50 92 32 98 C40 88 30 80 12 82 Z"
            fill="none"
            stroke="#44606C"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
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
