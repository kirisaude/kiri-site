import { NextResponse } from "next/server";

const SUPABASE_URL = () => process.env.SUPABASE_URL!;
const SUPABASE_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profissionalId = searchParams.get("profissional_id");

  if (!profissionalId) {
    return NextResponse.json({ error: "profissional_id obrigatório" }, { status: 400 });
  }

  const res = await fetch(
    `${SUPABASE_URL()}/rest/v1/avaliacoes?profissional_id=eq.${profissionalId}&aprovado=eq.true&order=criado_em.desc`,
    {
      headers: {
        "apikey": SUPABASE_KEY(),
        "Authorization": `Bearer ${SUPABASE_KEY()}`,
      },
    }
  );

  if (!res.ok) return NextResponse.json([], { status: 200 });
  return NextResponse.json(await res.json());
}

export async function POST(request: Request) {
  const { profissional_id, nota, data_atendimento, texto } = await request.json();

  if (!profissional_id || !nota || !data_atendimento) {
    return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 });
  }
  if (nota < 1 || nota > 5) {
    return NextResponse.json({ erro: "Nota inválida" }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL()}/rest/v1/avaliacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY(),
      "Authorization": `Bearer ${SUPABASE_KEY()}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      profissional_id,
      nota,
      data_atendimento: data_atendimento.trim(),
      texto: texto?.trim() || null,
      aprovado: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase avaliacao erro:", res.status, err);
    return NextResponse.json({ erro: "Erro ao salvar avaliação" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
