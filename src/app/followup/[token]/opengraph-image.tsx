import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Avaliação — Kiri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SIMBOLO_B64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJLaXJpIj4KICA8cGF0aCBkPSJNMTkgNTIgQzMxIDM3IDQzIDM3IDUyIDUwIEM2MSAzNyA3MyAzNyA4NCA1MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQkU2RTRFIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4KICA8cGF0aCBkPSJNMzggODggQzUwIDczIDYyIDczIDcxIDg2IEM4MCA3MyA5MiA3MyAxMDQgODgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzQ0NjA2QyIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg==";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", backgroundColor: "#F5EFE6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0px" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/svg+xml;base64,${SIMBOLO_B64}`} width={72} height={72} alt="" />
          <div style={{ fontSize: "88px", fontWeight: "500", color: "#BE6E4E", fontFamily: "Georgia, serif", letterSpacing: "-0.01em", lineHeight: 1, display: "flex" }}>
            Kiri
          </div>
        </div>
        <div style={{ fontSize: "34px", color: "#2C2722", marginTop: "36px", fontFamily: "Georgia, serif", fontWeight: "400", lineHeight: 1.3, display: "flex", textAlign: "center" }}>
          Como foi sua experiência?
        </div>
        <div style={{ fontSize: "22px", color: "#9A8C78", marginTop: "16px", fontFamily: "Georgia, serif", fontWeight: "400", lineHeight: 1, display: "flex" }}>
          Leva menos de 1 minuto
        </div>
      </div>
    ),
    { ...size }
  );
}
