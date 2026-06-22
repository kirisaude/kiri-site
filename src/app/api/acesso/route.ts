import { NextResponse } from "next/server";

// Rate limiting simples em memória (reinicia com o processo)
// Para produção com múltiplas instâncias, migrar para Redis/KV
const tentativas = new Map<string, { count: number; resetAt: number }>();
const MAX_TENTATIVAS = 10;
const JANELA_MS = 15 * 60 * 1000; // 15 minutos

function getIp(request: Request): string {
  return (
    (request.headers as Headers).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const agora = Date.now();

  const registro = tentativas.get(ip);
  if (registro && agora < registro.resetAt) {
    if (registro.count >= MAX_TENTATIVAS) {
      return NextResponse.json({ ok: false, bloqueado: true }, { status: 429 });
    }
    registro.count++;
  } else {
    tentativas.set(ip, { count: 1, resetAt: agora + JANELA_MS });
  }

  const { senha } = await request.json();
  const senhaCorreta = process.env.KIRI_SENHA;

  if (!senhaCorreta || senha.trim() !== senhaCorreta.trim()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Senha correta — limpa o contador desse IP
  tentativas.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("kiri_acesso", "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return response;
}
