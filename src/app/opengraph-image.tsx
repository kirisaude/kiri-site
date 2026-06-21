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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJLaXJpIj4KICA8cGF0aCBkPSJNMTkgNTIgQzMxIDM3IDQzIDM3IDUyIDUwIEM2MSAzNyA3MyAzNyA4NCA1MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQkU2RTRFIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4KICA8cGF0aCBkPSJNMzggODggQzUwIDczIDYyIDczIDcxIDg2IEM4MCA3MyA5MiA3MyAxMDQgODgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzQ0NjA2QyIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg=="
          width={100}
          height={100}
          alt=""
        />
        <div style={{ fontSize: "96px", fontWeight: "500", color: "#BE6E4E", letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "Georgia, serif", display: "flex", marginTop: "8px" }}>
          Kiri
        </div>
        <div style={{ fontSize: "26px", color: "#44606C", marginTop: "24px", fontFamily: "Georgia, serif", fontWeight: "400", textAlign: "center", lineHeight: 1.4, display: "flex" }}>
          Rede selecionada de neurodesenvolvimento infantil
        </div>
        <div style={{ fontSize: "18px", color: "#9A8C78", marginTop: "20px", fontFamily: "Georgia, serif", display: "flex" }}>
          kirisaude.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
