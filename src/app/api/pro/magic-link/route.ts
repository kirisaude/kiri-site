import { NextResponse } from "next/server";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const tentativas = new Map<string, { count: number; resetAt: number }>();

function getIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const agora = Date.now();
  const janela = 15 * 60 * 1000;
  const reg = tentativas.get(ip);
  if (reg && agora < reg.resetAt) {
    if (reg.count >= 5) return NextResponse.json({ ok: true }); // silencioso para não revelar
    reg.count++;
  } else {
    tentativas.set(ip, { count: 1, resetAt: agora + janela });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey || !resendKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const { email } = await request.json() as { email: string };
  if (!email?.trim()) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });

  const emailNorm = email.toLowerCase().trim();

  // Busca inscrição pelo e-mail
  const res = await fetch(
    `${supabaseUrl}/rest/v1/inscricoes_profissionais?email=eq.${encodeURIComponent(emailNorm)}&select=id,nome`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  );
  const [inscricao] = await res.json() as Array<{ id: string; nome: string }>;

  // Resposta sempre idêntica — não revelar se e-mail existe
  if (!inscricao) return NextResponse.json({ ok: true });

  // Verifica se existe profissional verificado com esse inscricao_id
  const prof = (data.profissionais as Profissional[]).find(p => p.inscricao_id === inscricao.id);
  if (!prof) return NextResponse.json({ ok: true });

  // Invalida tokens anteriores não usados para esse e-mail
  await fetch(
    `${supabaseUrl}/rest/v1/pro_auth_tokens?email=eq.${encodeURIComponent(emailNorm)}&usado=eq.false`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ usado: true }),
    }
  );

  // Cria token
  const token = randomBytes(32).toString("hex");
  const expira_em = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await fetch(`${supabaseUrl}/rest/v1/pro_auth_tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email: emailNorm, inscricao_id: inscricao.id, token, expira_em }),
  });

  // Envia e-mail com magic link
  const link = `https://kirisaude.com.br/api/pro/confirmar?token=${token}`;
  const primeiroNome = inscricao.nome.split(" ")[0];
  const resend = new Resend(resendKey);

  await resend.emails.send({
    from: "Kiri <contato@kirisaude.com.br>",
    to: emailNorm,
    subject: "Kiri — Acesse seu painel profissional",
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #2C2722; background: #F5EFE6;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 22px; font-weight: 600; color: #BE6E4E;">Kiri</span>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0; color: #2C2722;">Olá, ${primeiroNome}!</h1>
        <p style="font-size: 15px; line-height: 1.65; margin: 0 0 24px 0; color: #4A4038;">
          Clique no botão abaixo para acessar seu painel na rede Kiri. O link é válido por <strong>1 hora</strong> e pode ser usado uma única vez.
        </p>
        <div style="margin: 0 0 28px 0;">
          <a href="${link}"
             style="display: inline-block; background: #44606C; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 10px;">
            Acessar meu painel →
          </a>
        </div>
        <p style="font-size: 13px; color: #9A8C78; margin: 0;">
          Se você não solicitou este acesso, ignore este e-mail. Para dúvidas, fale pelo
          <a href="https://wa.me/5511993197202" style="color: #44606C;">WhatsApp da Kiri</a>.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
