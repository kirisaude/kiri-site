import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const SIMBOLO_B64 =
  "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJLaXJpIj4KICA8cGF0aCBkPSJNMTkgNTIgQzMxIDM3IDQzIDM3IDUyIDUwIEM2MSAzNyA3MyAzNyA4NCA1MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQkU2RTRFIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4KICA8cGF0aCBkPSJNMzggODggQzUwIDczIDYyIDczIDcxIDg2IEM4MCA3MyA5MiA3MyAxMDQgODgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzQ0NjA2QyIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+Cjwvc3ZnPg==";

export async function GET() {
  const [fontMedium, fontRegular] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Newsreader-Medium.ttf")),
    readFile(join(process.cwd(), "public/fonts/Newsreader-Regular.ttf")),
  ]);

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
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/svg+xml;base64,${SIMBOLO_B64}`} width={52} height={52} alt="" />
          <div
            style={{
              fontSize: "56px",
              fontWeight: 500,
              color: "#BE6E4E",
              fontFamily: "Newsreader",
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
            fontSize: "88px",
            fontWeight: 500,
            color: "white",
            fontFamily: "Newsreader",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          Uma rede de profissionais verificados para neurodesenvolvimento infantil.
        </div>

        {/* Descrição + URL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              fontFamily: "Newsreader",
              lineHeight: 1.55,
              display: "flex",
            }}
          >
            Psicólogos, fonoaudiólogos, neuropediatras, terapeutas ocupacionais e mais — com formação conferida, para você decidir com segurança.
          </div>

          {/* URL com ícone de check */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg
              width="30"
              height="30"
              viewBox="0 0 22 22"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="10" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <path d="M6.6 11.2 L9.6 14.2 L15.4 7.6" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div
              style={{
                fontSize: "32px",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "Newsreader",
                fontWeight: 400,
                display: "flex",
              }}
            >
              kirisaude.com.br
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: "Newsreader", data: fontMedium, weight: 500, style: "normal" },
        { name: "Newsreader", data: fontRegular, weight: 400, style: "normal" },
      ],
    }
  );
}
