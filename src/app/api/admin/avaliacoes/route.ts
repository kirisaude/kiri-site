import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

const URL = () => process.env.SUPABASE_URL!;
const KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const res = await fetch(
    `${URL()}/rest/v1/avaliacoes?order=criado_em.desc&limit=200`,
    { headers: { "apikey": KEY(), "Authorization": `Bearer ${KEY()}` } }
  );

  if (!res.ok) return NextResponse.json({ error: "Erro ao buscar" }, { status: 502 });
  return NextResponse.json(await res.json());
}

export async function PATCH(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, aprovado } = await request.json();

  const res = await fetch(`${URL()}/rest/v1/avaliacoes?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": KEY(),
      "Authorization": `Bearer ${KEY()}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ aprovado }),
  });

  if (!res.ok) return NextResponse.json({ error: "Erro ao atualizar" }, { status: 502 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await request.json();

  const res = await fetch(`${URL()}/rest/v1/avaliacoes?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      "apikey": KEY(),
      "Authorization": `Bearer ${KEY()}`,
      "Prefer": "return=minimal",
    },
  });

  if (!res.ok) return NextResponse.json({ error: "Erro ao excluir" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
