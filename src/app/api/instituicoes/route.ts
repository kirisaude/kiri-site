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
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return NextResponse.json([], { status: 200 });
  return NextResponse.json(await res.json(), {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
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
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ nome_extenso: nome_extenso?.trim() || null }),
  });

  if (!res.ok) return NextResponse.json({ error: "Erro ao atualizar" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
