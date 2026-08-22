import { NextResponse } from "next/server";
import { Resend } from "resend";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { getDriveAccessToken, listDriveFiles } from "@/lib/googleDrive";

const profissionais = data.profissionais as Profissional[];

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Drive não configurado" }, { status: 503 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.KIRI_ADMIN_EMAIL ?? "contato@kirisaude.com.br";

  const comPasta = profissionais.filter((p) => p.pasta_drive);
  if (comPasta.length === 0) {
    return NextResponse.json({ ok: true, novos: 0 });
  }

  const accessToken = await getDriveAccessToken();
  const limite = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();

  interface NovoArquivo {
    profissional: string;
    id: string;
    arquivo: string;
    link: string;
    enviadoEm: string;
  }

  const novos: NovoArquivo[] = [];

  for (const prof of comPasta) {
    try {
      const arquivos = await listDriveFiles(prof.pasta_drive!, accessToken);
      for (const arq of arquivos) {
        if (arq.createdTime >= limite) {
          novos.push({
            profissional: prof.nome,
            id: prof.id,
            arquivo: arq.name,
            link: arq.webViewLink,
            enviadoEm: arq.createdTime,
          });
        }
      }
    } catch {
      // ignora erros por pasta individual
    }
  }

  if (novos.length === 0) {
    return NextResponse.json({ ok: true, novos: 0 });
  }

  if (resendKey) {
    const linhas = novos
      .map(
        (n) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">${n.profissional} (${n.id})</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">
            <a href="${n.link}" style="color:#44606C;">${n.arquivo}</a>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;white-space:nowrap;">
            ${new Date(n.enviadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
          </td>
        </tr>`
      )
      .join("");

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Kiri <contato@kirisaude.com.br>",
      to: adminEmail,
      subject: `Kiri — ${novos.length} novo${novos.length > 1 ? "s" : ""} documento${novos.length > 1 ? "s" : ""} no Drive`,
      html: `
        <div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:32px 24px;background:#F5EFE6;color:#2C2722;">
          <div style="margin-bottom:24px;">
            <span style="font-size:22px;font-weight:600;color:#BE6E4E;">Kiri</span>
          </div>
          <h1 style="font-size:20px;font-weight:600;margin:0 0 8px 0;">Novos documentos no Drive</h1>
          <p style="font-size:14px;color:#9A8C78;margin:0 0 24px 0;">
            ${novos.length} arquivo${novos.length > 1 ? "s" : ""} enviado${novos.length > 1 ? "s" : ""} nas últimas 24h.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4A4038;">
            <thead>
              <tr style="background:#e8ddd0;">
                <th style="padding:8px 12px;text-align:left;">Profissional</th>
                <th style="padding:8px 12px;text-align:left;">Arquivo</th>
                <th style="padding:8px 12px;text-align:left;">Enviado em</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
          <div style="margin-top:28px;">
            <a href="https://kirisaude.com.br/admin"
               style="display:inline-block;background:#44606C;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
              Abrir painel admin →
            </a>
          </div>
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true, novos: novos.length });
}
