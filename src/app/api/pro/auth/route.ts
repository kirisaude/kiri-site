import { NextResponse } from "next/server";

const tentativas = new Map<string, { count: number; resetAt: number }>();

function getIp(req: Request) {
  return (req.headers as Headers).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const agora = Date.now();
  const janela = 15 * 60 * 1000;
  const registro = tentativas.get(ip);

  if (registro && agora < registro.resetAt) {
    if (registro.count >= 10) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }
    registro.count++;
  } else {
    tentativas.set(ip, { count: 1, resetAt: agora + janela });
  }

  const { senha } = await request.json();
  const senhaCorreta = process.env.KIRI_PRO_SENHA;

  if (!senhaCorreta || senha.trim() !== senhaCorreta.trim()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  tentativas.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("kiri_pro", "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return response;
}
