import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIMBOLO_B64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJLaXJpIj4KICA8cGF0aCBkPSJNMTkgNTIgQzMxIDM3IDQzIDM3IDUyIDUwIEM2MSAzNyA3MyAzNyA4NCA1MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQkU2RTRFIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4KICA8cGF0aCBkPSJNMzggODggQzUwIDczIDYyIDczIDcxIDg2IEM4MCA3MyA5MiA3MyAxMDQgODgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzQ0NjA2QyIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg==";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          backgroundColor: "#2C4650",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 88px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/svg+xml;base64,${SIMBOLO_B64}`} width={56} height={56} alt="" />
          <div
            style={{
              fontSize: "64px",
              fontWeight: "500",
              color: "#BE6E4E",
              fontFamily: "Georgia, serif",
              lineHeight: 1,
              display: "flex",
            }}
          >
            Kiri
          </div>
        </div>

        {/* Título */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: "600",
            color: "white",
            fontFamily: "Georgia, serif",
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          Uma rede de profissionais verificados para neurodesenvolvimento infantil.
        </div>

        {/* Descrição + URL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              fontSize: "38px",
              color: "rgba(255,255,255,0.65)",
              fontFamily: "sans-serif",
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            Psicólogos, fonoaudiólogos, neuropediatras, terapeutas ocupacionais e mais — com formação conferida.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "2.5px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px", display: "flex" }}>✓</div>
            </div>
            <div
              style={{
                fontSize: "34px",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "sans-serif",
                display: "flex",
              }}
            >
              kirisaude.com.br
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
