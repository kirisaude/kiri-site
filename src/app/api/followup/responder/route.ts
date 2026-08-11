import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function headers() {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token obrigatório" }, { status: 400 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/followups?token=eq.${token}&select=*&limit=1`,
    { headers: headers() }
  );
  if (!res.ok) return NextResponse.json({ error: "Erro interno" }, { status: 502 });
  const rows = await res.json() as unknown[];
  if (!rows.length) return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const { token, ...campos } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token obrigatório" }, { status: 400 });
  }

  // Busca o followup
  const busca = await fetch(
    `${SUPABASE_URL}/rest/v1/followups?token=eq.${token}&select=id,concluido_em&limit=1`,
    { headers: headers() }
  );
  if (!busca.ok) return NextResponse.json({ error: "Erro interno" }, { status: 502 });
  const rows = await busca.json() as { id: string; concluido_em: string | null }[];
  if (!rows.length) return NextResponse.json({ error: "Token inválido" }, { status: 404 });
  const { id, concluido_em } = rows[0];

  if (concluido_em) return NextResponse.json({ ok: true, jaRespondido: true });

  const deveConcluir = campos.contatou === false || "nps_plataforma" in campos;
  const update = {
    ...campos,
    ...(deveConcluir ? { concluido_em: new Date().toISOString() } : {}),
  };

  const patch = await fetch(`${SUPABASE_URL}/rest/v1/followups?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(update),
  });

  if (!patch.ok) return NextResponse.json({ error: "Erro ao salvar" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
