import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { senha } = await request.json();
  const senhaCorreta = process.env.KIRI_SENHA;

  if (!senhaCorreta || senha.trim() !== senhaCorreta.trim()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("kiri_acesso", "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return response;
}
