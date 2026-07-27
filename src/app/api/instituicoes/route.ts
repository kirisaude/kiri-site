import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

const SUPABASE_URL = () => process.env.SUPABASE_URL!;
const SUPABASE_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL()}/rest/v1/instituicoes?select=sigla,nome_extenso&order=sigla.asc`,
    {
      headers: { "apikey": SUPABASE_KEY(), "Authorization": `Bearer ${SUPABASE_KEY()}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return NextResponse.json([], { status: 200 });
  return NextResponse.json(await res.json(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { sigla, nome_extenso } = await request.json();
  if (!sigla) return NextResponse.json({ error: "sigla obrigatória" }, { status: 400 });

  const res = await fetch(`${SUPABASE_URL()}/rest/v1/instituicoes?sigla=eq.${encodeURIComponent(sigla)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY(),
      "Authorization": `Bearer ${SUPABASE_KEY()}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({ nome_extenso: nome_extenso?.trim() || null }),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ error: `Supabase ${res.status}: ${body}` }, { status: 502 });
  }

  const updated = await res.json() as unknown[];
  if (!Array.isArray(updated) || updated.length === 0) {
    return NextResponse.json({ error: "Nenhuma linha atualizada — execute o GRANT no Supabase" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
