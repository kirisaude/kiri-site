import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const body = await request.json();
  const {
    nome, profissao, registro_conselho, rqe,
    areas_atuacao, faixa_etaria, modalidade, cidade,
    valor_medio, aceita_convenio, graduacao, pos_graduacao,
    apresentacao, site_perfil, como_conheceu, consentimento,
  } = body;

  if (!nome || !profissao || !registro_conselho || consentimento !== true) {
    return NextResponse.json({ erro: "Dados obrigatórios ausentes ou sem consentimento" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/inscricoes_profissionais`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      nome, profissao, registro_conselho,
      rqe: rqe || null,
      areas_atuacao: areas_atuacao || null,
      faixa_etaria: faixa_etaria || null,
      modalidade: modalidade || null,
      cidade: cidade || null,
      valor_medio: valor_medio || null,
      aceita_convenio: aceita_convenio ?? null,
      graduacao: graduacao || null,
      pos_graduacao: pos_graduacao || null,
      apresentacao: apresentacao || null,
      site_perfil: site_perfil || null,
      como_conheceu: como_conheceu || null,
      consentimento: true,
      status: "pendente",
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase inscricao:", res.status, erro);
    return NextResponse.json({ erro: "Falha ao registrar inscrição" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
