import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas");
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const body = await request.json();
  const { nome_responsavel, contato, cidade, modalidade, observacoes, profissional_solicitado, consentimento } = body;

  if (!nome_responsavel || !contato || consentimento !== true) {
    return NextResponse.json({ erro: "Dados obrigatórios ausentes ou sem consentimento" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/encaminhamentos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      nome_responsavel,
      contato,
      cidade: cidade ?? null,
      modalidade: modalidade ?? null,
      observacoes: observacoes ?? null,
      profissional_solicitado: profissional_solicitado ?? null,
      consentimento: true,
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase:", res.status, erro);
    return NextResponse.json({ erro: "Falha ao registrar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
