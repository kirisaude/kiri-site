import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const body = await request.json();
  const { profissional_id, tipo_problema, descricao } = body;

  if (!profissional_id || !tipo_problema) {
    return NextResponse.json({ erro: "Dados obrigatórios ausentes" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/reportes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      profissional_id,
      tipo_problema,
      descricao: descricao || null,
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase reporte:", res.status, erro);
    return NextResponse.json({ erro: "Falha ao registrar reporte" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
