import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const body = await request.json();
  const {
    nome, email, profissao, registro_conselho, rqe, tempo_atuacao,
    areas_atuacao, faixa_etaria, modalidade, cidade, bairro,
    valor_medio, aceita_convenio, graduacao, pos_graduacao,
    apresentacao, site_perfil, como_conheceu, whatsapp_agendamento,
    grupo_whatsapp, consentimento,
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
      nome, email: email || null, profissao, registro_conselho,
      rqe: rqe || null,
      tempo_atuacao: tempo_atuacao || null,
      areas_atuacao: areas_atuacao || null,
      faixa_etaria: faixa_etaria || null,
      modalidade: modalidade || null,
      cidade: cidade || null,
      bairro: bairro || null,
      valor_medio: valor_medio || null,
      aceita_convenio: aceita_convenio ?? null,
      graduacao: graduacao || null,
      pos_graduacao: pos_graduacao || null,
      apresentacao: apresentacao || null,
      site_perfil: site_perfil || null,
      como_conheceu: como_conheceu || null,
      whatsapp_agendamento: whatsapp_agendamento || null,
      grupo_whatsapp: grupo_whatsapp ?? false,
      consentimento: true,
      status: "pendente",
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase inscricao:", res.status, erro);
    return NextResponse.json({ erro: "Falha ao registrar inscrição" }, { status: 500 });
  }

  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (sheetsUrl) {
    const agoraDate = new Date();
    const data = agoraDate.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const horario = agoraDate.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
    fetch(sheetsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        horario,
        nome,
        email: email || "",
        profissao,
        cidade: cidade || "",
        modalidade: modalidade || "",
        whatsapp: whatsapp_agendamento || "",
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
