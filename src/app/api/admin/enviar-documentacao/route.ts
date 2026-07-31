import { NextResponse } from "next/server";
import { Resend } from "resend";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey || !resendKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const { ids } = await request.json() as { ids: string[] };
  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "Nenhum ID fornecido" }, { status: 400 });
  }

  const filter = ids.map(id => `id.eq.${id}`).join(",");
  const res = await fetch(
    `${supabaseUrl}/rest/v1/inscricoes_profissionais?or=(${filter})&select=id,nome,email`,
    {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 500 });
  }

  const inscricoes: { id: string; nome: string; email: string | null }[] = await res.json();
  const resend = new Resend(resendKey);

  let enviados = 0;
  let semEmail = 0;

  for (const insc of inscricoes) {
    if (!insc.email) { semEmail++; continue; }
    const primeiroNome = insc.nome.split(" ")[0];
    await resend.emails.send({
      from: "Kiri <contato@kirisaude.com.br>",
      to: insc.email,
      subject: "Kiri — Envie sua documentação para concluir o cadastro",
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #2C2722; background: #F5EFE6;">
          <div style="margin-bottom: 28px;">
            <span style="font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #BE6E4E; letter-spacing: 0.01em;">Kiri</span>
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
            Este é um e-mail automático. Para dúvidas, fale pelo <a href="https://wa.me/5511993197202" style="color: #44606C;">WhatsApp da Kiri</a>.
          </p>
        </div>
      `,
    }).catch(() => {});
    enviados++;
  }

  return NextResponse.json({ enviados, semEmail });
}
