import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kiri — Rede selecionada de neurodesenvolvimento infantil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const newsreaderRes = await fetch(
    "https://fonts.gstatic.com/s/newsreader/v20/cY9qfjOCX1hbuyalUrK8iaYLGAQ.woff2"
  );
  const newsreaderData = await newsreaderRes.arrayBuffer();

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
          width={72}
          height={72}
          alt=""
        />
        <div style={{ fontSize: "100px", fontWeight: "500", color: "#BE6E4E", letterSpacing: "-0.01em", lineHeight: 1, fontFamily: "Newsreader, serif", display: "flex", marginTop: "12px" }}>
          Kiri
        </div>
        <div style={{ fontSize: "24px", color: "#44606C", marginTop: "20px", fontFamily: "Newsreader, serif", fontWeight: "400", lineHeight: 1.4, display: "flex", whiteSpace: "nowrap" }}>
          Rede selecionada de neurodesenvolvimento infantil
        </div>
        <div style={{ fontSize: "17px", color: "#9A8C78", marginTop: "18px", fontFamily: "Newsreader, serif", display: "flex" }}>
          kirisaude.com.br
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Newsreader", data: newsreaderData, weight: 500, style: "normal" }],
    }
  );
}
