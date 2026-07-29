import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const body = await request.json();
  const {
    nome, email, genero, profissao, profissao_secundaria,
    registro_conselho, registro_conselho_secundario, rqe, tempo_atuacao,
    areas_atuacao, faixa_etaria, modalidade, cidade, bairro,
    valor_medio, aceita_convenio, convenios_nomes,
    graduacao, pos_graduacao, lattes,
    apresentacao, site_perfil, como_conheceu, whatsapp_agendamento,
    grupo_whatsapp, experiencia_infantil, cpf_consentimento, consentimento,
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
      nome,
      email: email || null,
      genero: genero || null,
      profissao,
      profissao_secundaria: profissao_secundaria || null,
      registro_conselho,
      registro_conselho_secundario: registro_conselho_secundario || null,
      rqe: rqe || null,
      tempo_atuacao: tempo_atuacao || null,
      areas_atuacao: areas_atuacao || null,
      faixa_etaria: faixa_etaria || null,
      modalidade: modalidade || null,
      cidade: cidade || null,
      bairro: bairro || null,
      valor_medio: valor_medio || null,
      aceita_convenio: aceita_convenio ?? null,
      convenios_nomes: convenios_nomes || null,
      graduacao: graduacao || null,
      pos_graduacao: pos_graduacao || null,
      lattes: lattes || null,
      apresentacao: apresentacao || null,
      site_perfil: site_perfil || null,
      como_conheceu: como_conheceu || null,
      whatsapp_agendamento: whatsapp_agendamento || null,
      experiencia_infantil: experiencia_infantil || null,
      grupo_whatsapp: grupo_whatsapp ?? false,
      cpf_consentimento: cpf_consentimento || null,
      consentimento: true,
      status: "pendente",
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase inscricao:", res.status, erro);
    return NextResponse.json({ erro: `Falha ao registrar inscrição (${res.status}): ${erro}` }, { status: 500 });
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

  // E-mail automático com link de documentação
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && email) {
    const resend = new Resend(resendKey);
    const primeiroNome = nome.split(" ")[0];
    resend.emails.send({
      from: "Kiri <nao-responda@kirisaude.com.br>",
      to: email,
      subject: "Kiri — Envie sua documentação para concluir o cadastro",
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #2C2722; background: #F5EFE6;">
          <div style="margin-bottom: 28px;">
            <img src="https://www.kirisaude.com.br/logo-kiri-principal.png" alt="Kiri" height="36" style="display:block;" />
          </div>
          <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 12px 0; color: #2C2722;">Olá, ${primeiroNome}!</h1>
          <p style="font-size: 15px; line-height: 1.65; margin: 0 0 16px 0; color: #4A4038;">
            Recebemos sua inscrição na rede Kiri. Para concluir o processo, precisamos que você envie sua documentação pelo link abaixo.
          </p>
          <div style="margin: 24px 0;">
            <a href="https://forms.gle/p4dptue63CP5Gt5Y8"
               style="display: inline-block; background: #44606C; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 10px;">
              Enviar documentação →
            </a>
          </div>
          <p style="font-size: 13px; line-height: 1.6; color: #6E6055; margin: 0 0 8px 0;"><strong>O que enviar:</strong></p>
          <ul style="font-size: 13px; line-height: 1.8; color: #6E6055; margin: 0 0 24px 0; padding-left: 18px;">
            <li>Foto profissional (fundo neutro, rosto nítido, preferencialmente 1:1)</li>
            <li>Certidão de regularidade no conselho da sua profissão (atualizada)</li>
            <li>Diploma de graduação</li>
            <li>Certificados de especialização, residência, mestrado ou doutorado (se houver)</li>
          </ul>
          <p style="font-size: 13px; color: #9A8C78; margin: 0;">
            Este é um e-mail automático. Para dúvidas, entre em contato pelo WhatsApp da Kiri.
          </p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
