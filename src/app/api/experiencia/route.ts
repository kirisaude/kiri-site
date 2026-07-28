import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ erro: "Corpo inválido" }, { status: 400 });
  }

  const { profissional_id, data_atendimento, comentario, consentimento } = body;

  if (!profissional_id || consentimento !== true) {
    return NextResponse.json(
      { erro: "Dados obrigatórios ausentes ou consentimento não concedido" },
      { status: 400 }
    );
  }

  if (!comentario || !comentario.trim()) {
    return NextResponse.json({ erro: "O relato não pode estar em branco" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/experiencias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      profissional_id,
      data_atendimento: data_atendimento || null,
      comentario: comentario.trim(),
      consentimento: true,
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase experiencia:", res.status, erro);
    return NextResponse.json({ erro: "Falha ao registrar relato" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
