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
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjYwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjI2MCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJLaXJpIj4KICAKICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjAgNikgc2NhbGUoMSkiPgogICAgPHBhdGggZD0iTTE5IDUyIEMzMSAzNyA0MyAzNyA1MiA1MCBDNjEgMzcgNzMgMzcgODQgNTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0JFNkU0RSIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgICA8cGF0aCBkPSJNMzggODggQzUwIDczIDYyIDczIDcxIDg2IEM4MCA3MyA5MiA3MyAxMDQgODgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzQ0NjA2QyIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+CiAgPC9nPgogIAogIDx0ZXh0IHg9IjE4MCIgeT0iMjM1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iTmV3c3JlYWRlciwgR2VvcmdpYSwgJiMzOTtUaW1lcyBOZXcgUm9tYW4mIzM5Oywgc2VyaWYiIGZvbnQtc2l6ZT0iMTE2IiBmb250LXdlaWdodD0iNTAwIiBmaWxsPSIjQkU2RTRFIj5LaXJpPC90ZXh0Pgo8L3N2Zz4="
          width={360}
          height={260}
          alt="Kiri"
        />
        <div style={{ fontSize: "26px", color: "#44606C", marginTop: "20px", fontFamily: "system-ui, sans-serif", fontWeight: "500", textAlign: "center", lineHeight: 1.4, display: "flex" }}>
          Rede selecionada de neurodesenvolvimento infantil
        </div>
        <div style={{ fontSize: "18px", color: "#9A8C78", marginTop: "20px", fontFamily: "system-ui, sans-serif", display: "flex" }}>
          kirisaude.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
