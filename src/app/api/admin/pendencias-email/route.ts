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

  const { inscricao_id, pendencias } = await request.json() as { inscricao_id: string; pendencias: string };

  const res = await fetch(
    `${supabaseUrl}/rest/v1/inscricoes_profissionais?id=eq.${inscricao_id}&select=nome,email`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  );
  if (!res.ok) return NextResponse.json({ error: "Erro ao buscar inscrição" }, { status: 500 });

  const [insc] = await res.json() as { nome: string; email: string | null }[];
  if (!insc) return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
  if (!insc.email) return NextResponse.json({ error: "Profissional sem e-mail cadastrado" }, { status: 400 });

  const primeiroNome = insc.nome.split(" ")[0];
  const itens = pendencias
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<li style="margin-bottom:6px;">${l}</li>`)
    .join("");

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "Kiri <contato@kirisaude.com.br>",
    to: insc.email,
    subject: "Kiri — Documentos pendentes para ativar seu perfil",
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2C2722;background:#F5EFE6;">
        <div style="margin-bottom:28px;">
          <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#BE6E4E;">Kiri</span>
        </div>
        <h1 style="font-size:22px;font-weight:600;margin:0 0 12px 0;color:#2C2722;">Olá, ${primeiroNome}!</h1>
        <p style="font-size:15px;line-height:1.65;margin:0 0 20px 0;color:#4A4038;">
          Seu perfil na Kiri está quase pronto. Para ativarmos, precisamos dos seguintes itens:
        </p>
        <ul style="font-size:14px;line-height:1.8;color:#4A4038;margin:0 0 28px 0;padding-left:20px;">
          ${itens}
        </ul>
        <div style="margin-bottom:28px;">
          <a href="https://forms.gle/p4dptue63CP5Gt5Y8"
             style="display:inline-block;background:#44606C;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:600;padding:14px 28px;border-radius:10px;">
            Enviar documentação →
          </a>
        </div>
        <p style="font-size:13px;color:#9A8C78;margin:0;">
          Dúvidas? Fale pelo <a href="https://wa.me/5511993197202" style="color:#44606C;">WhatsApp da Kiri</a>.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
