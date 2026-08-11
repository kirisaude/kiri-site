import { NextResponse } from "next/server";
import { Resend } from "resend";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];

function gerarToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function emailFollowup(token: string, profNome: string, responsavelNome: string, lembrete = false): string {
  const primeiro = responsavelNome.split(" ")[0];
  const primeiroProfNome = profNome.split(" ")[0];
  const url = `https://kirisaude.com.br/followup/${token}`;
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#F5EFE6;color:#2C2722;">
      <div style="margin-bottom:24px;">
        <span style="font-size:22px;font-weight:600;color:#BE6E4E;">Kiri</span>
      </div>
      <h1 style="font-size:20px;font-weight:600;margin:0 0 12px 0;">
        ${lembrete ? `${primeiro}, você ainda precisa de ajuda?` : `Olá, ${primeiro}!`}
      </h1>
      <p style="font-size:15px;line-height:1.65;margin:0 0 20px 0;color:#4A4038;">
        ${lembrete
          ? `Há alguns dias te indicamos ${profNome}. Não temos sua resposta ainda — tudo certo? Conta pra gente em 1 minuto, nos ajuda muito!`
          : `Há alguns dias te indicamos ${primeiroProfNome} pela Kiri. Conseguiu entrar em contato? Conta pra gente como foi — leva menos de 1 minuto!`
        }
      </p>
      <a href="${url}"
         style="display:inline-block;background:#BE6E4E;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;margin-bottom:28px;">
        Responder agora →
      </a>
      <p style="font-size:13px;color:#9A8C78;margin:0;">
        Dúvidas? Fale com a equipe Kiri pelo <a href="https://wa.me/5511993197202" style="color:#44606C;">WhatsApp</a>.
      </p>
    </div>
  `;
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const tressDiasAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const onzeDiasAtras = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString();

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

  // Busca encaminhamentos com status=encaminhado e criado há 3+ dias
  const encRes = await fetch(
    `${supabaseUrl}/rest/v1/encaminhamentos?status=eq.encaminhado&criado_em=lte.${tressDiasAtras}&select=id,nome_responsavel,contato,profissional_solicitado`,
    { headers }
  );
  const encaminhamentos = encRes.ok ? await encRes.json() as { id: string; nome_responsavel: string; contato: string; profissional_solicitado: string | null }[] : [];

  // Busca followups existentes para não duplicar
  const fupRes = await fetch(`${supabaseUrl}/rest/v1/followups?select=encaminhamento_id`, { headers });
  const existentes = fupRes.ok ? (await fupRes.json() as { encaminhamento_id: string }[]).map(f => f.encaminhamento_id) : [];

  let criados = 0;
  let emailsEnviados = 0;
  const resend = resendKey ? new Resend(resendKey) : null;

  for (const enc of encaminhamentos) {
    if (existentes.includes(enc.id)) continue;

    const prof = enc.profissional_solicitado ? profissionais.find(p => p.id === enc.profissional_solicitado) : null;
    const profNome = prof?.nome ?? "o profissional indicado";
    const isEmail = enc.contato.includes("@");
    const token = gerarToken();

    const followupData = {
      encaminhamento_id: enc.id,
      token,
      profissional_nome: profNome,
      responsavel_nome: enc.nome_responsavel,
      contato: enc.contato,
      contato_tipo: isEmail ? "email" : "whatsapp",
      email_enviado_em: null as string | null,
    };

    if (isEmail && resend) {
      try {
        await resend.emails.send({
          from: "Kiri <contato@kirisaude.com.br>",
          to: enc.contato,
          subject: `Kiri — Como foi o contato com ${profNome.split(" ")[0]}?`,
          html: emailFollowup(token, profNome, enc.nome_responsavel),
        });
        followupData.email_enviado_em = new Date().toISOString();
        emailsEnviados++;
      } catch { /* segue sem e-mail */ }
    }

    await fetch(`${supabaseUrl}/rest/v1/followups`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(followupData),
    });
    criados++;
  }

  // Lembretes D+14 para emails sem resposta
  let lembretes = 0;
  if (resend) {
    const lembreteRes = await fetch(
      `${supabaseUrl}/rest/v1/followups?contato_tipo=eq.email&contatou=is.null&lembrete_enviado_em=is.null&email_enviado_em=lte.${onzeDiasAtras}&select=id,token,profissional_nome,responsavel_nome,contato`,
      { headers }
    );
    const paraLembrete = lembreteRes.ok ? await lembreteRes.json() as { id: string; token: string; profissional_nome: string; responsavel_nome: string; contato: string }[] : [];

    for (const fup of paraLembrete) {
      try {
        await resend.emails.send({
          from: "Kiri <contato@kirisaude.com.br>",
          to: fup.contato,
          subject: `Kiri — Você conseguiu agendar com ${fup.profissional_nome?.split(" ")[0] ?? "o profissional"}?`,
          html: emailFollowup(fup.token, fup.profissional_nome ?? "", fup.responsavel_nome ?? "", true),
        });
        await fetch(`${supabaseUrl}/rest/v1/followups?id=eq.${fup.id}`, {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ lembrete_enviado_em: new Date().toISOString() }),
        });
        lembretes++;
      } catch { /* ignora */ }
    }
  }

  return NextResponse.json({ ok: true, criados, emailsEnviados, lembretes });
}
