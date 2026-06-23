import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

// Guarda IDs rejeitados em memória (reinicia com o processo)
// Para persistência real, usar KV/banco de dados
const rejeitados = new Set<string>();

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await request.json();
  rejeitados.add(id);
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json({ rejeitados: Array.from(rejeitados) });
}
