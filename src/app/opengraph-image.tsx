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

        {/* Nome */}
        <div
          style={{
            fontSize: "110px",
            fontWeight: "500",
            color: "#BE6E4E",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            fontFamily: "Georgia, serif",
          }}
        >
          Kiri
        </div>

        {/* Linha decorativa */}
        <div
          style={{
            width: "64px",
            height: "3px",
            backgroundColor: "#BE6E4E",
            marginTop: "24px",
            borderRadius: "2px",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#44606C",
            marginTop: "24px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "500",
            textAlign: "center",
            maxWidth: "680px",
            lineHeight: 1.4,
          }}
        >
          Rede selecionada de neurodesenvolvimento infantil
        </div>
      </div>
    ),
    { ...size }
  );
}
