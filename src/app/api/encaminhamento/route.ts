import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const body = await request.json();
  const { nome_responsavel, contato, cidade, modalidade, observacoes, profissional_solicitado, consentimento } = body;

  if (!nome_responsavel || !contato || consentimento !== true) {
    return NextResponse.json({ erro: "Dados obrigatórios ausentes ou sem consentimento" }, { status: 400 });
  }

  const { error } = await supabase.from("encaminhamentos").insert({
    nome_responsavel,
    contato,
    cidade: cidade ?? null,
    modalidade: modalidade ?? null,
    observacoes: observacoes ?? null,
    profissional_solicitado: profissional_solicitado ?? null,
    consentimento: true,
  });

  if (error) {
    return NextResponse.json({ erro: "Falha ao registrar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
