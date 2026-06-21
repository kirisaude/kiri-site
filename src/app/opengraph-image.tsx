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
          gap: "0px",
        }}
      >
        <div style={{ fontSize: "120px", fontWeight: "500", color: "#BE6E4E", letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "Georgia, serif", display: "flex" }}>
          Kiri
        </div>
        <div style={{ width: "56px", height: "3px", backgroundColor: "#BE6E4E", marginTop: "28px", borderRadius: "2px", display: "flex" }} />
        <div style={{ fontSize: "30px", color: "#44606C", marginTop: "28px", fontFamily: "system-ui, sans-serif", fontWeight: "500", textAlign: "center", lineHeight: 1.4, display: "flex" }}>
          Rede selecionada de neurodesenvolvimento infantil
        </div>
        <div style={{ fontSize: "20px", color: "#9A8C78", marginTop: "32px", fontFamily: "system-ui, sans-serif", display: "flex" }}>
          kirisaude.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
