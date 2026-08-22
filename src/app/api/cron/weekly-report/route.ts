import { NextResponse } from "next/server";
import { Resend } from "resend";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];

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
  const adminEmail = process.env.KIRI_ADMIN_EMAIL ?? "contato@kirisaude.com.br";

  const pendentes = profissionais.filter(
    (p) => p.registro_pendente || p.sobre_pendente || p.oculto
  );

  let inscricoes: { id: string; nome: string; email: string | null; profissao: string | null; criado_em: string; status: string }[] = [];

  if (supabaseUrl && supabaseKey) {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
    const res = await fetch(
      `${supabaseUrl}/rest/v1/inscricoes_profissionais?criado_em=gte.${seteDiasAtras}&select=id,nome,email,profissao,criado_em,status&order=criado_em.desc`,
      { headers }
    );
    if (res.ok) {
      inscricoes = await res.json();
    }
  }

  if (!resendKey) {
    return NextResponse.json({ ok: true, pendentes: pendentes.length, inscricoes: inscricoes.length });
  }

  const linhasPendentes = pendentes.length === 0
    ? `<p style="font-size:14px;color:#9A8C78;">Nenhum profissional com pendências.</p>`
    : `
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4A4038;">
        <thead>
          <tr style="background:#e8ddd0;">
            <th style="padding:8px 12px;text-align:left;">Profissional</th>
            <th style="padding:8px 12px;text-align:left;">Profissão</th>
            <th style="padding:8px 12px;text-align:left;">Pendências</th>
          </tr>
        </thead>
        <tbody>
          ${pendentes.map((p) => {
            const flags = [
              p.registro_pendente ? "registro" : "",
              p.sobre_pendente ? "sobre" : "",
              p.oculto ? "oculto" : "",
            ].filter(Boolean).join(", ");
            return `
              <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">${p.nome} (${p.id})</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">${p.profissao}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">${flags}</td>
              </tr>`;
          }).join("")}
        </tbody>
      </table>`;

  const linhasInscricoes = inscricoes.length === 0
    ? `<p style="font-size:14px;color:#9A8C78;">Nenhuma inscrição na última semana.</p>`
    : `
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4A4038;">
        <thead>
          <tr style="background:#e8ddd0;">
            <th style="padding:8px 12px;text-align:left;">Nome</th>
            <th style="padding:8px 12px;text-align:left;">Profissão</th>
            <th style="padding:8px 12px;text-align:left;">Status</th>
            <th style="padding:8px 12px;text-align:left;">Data</th>
          </tr>
        </thead>
        <tbody>
          ${inscricoes.map((i) => `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">${i.nome}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">${i.profissao ?? "—"}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;">${i.status}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e8ddd0;white-space:nowrap;">
                ${new Date(i.criado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
              </td>
            </tr>`).join("")}
        </tbody>
      </table>`;

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "Kiri <contato@kirisaude.com.br>",
    to: adminEmail,
    subject: `Kiri — Relatório semanal: ${pendentes.length} pendente${pendentes.length !== 1 ? "s" : ""}, ${inscricoes.length} inscrição${inscricoes.length !== 1 ? "ões" : ""} nova${inscricoes.length !== 1 ? "s" : ""}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:680px;margin:0 auto;padding:32px 24px;background:#F5EFE6;color:#2C2722;">
        <div style="margin-bottom:24px;">
          <span style="font-size:22px;font-weight:600;color:#BE6E4E;">Kiri</span>
        </div>
        <h1 style="font-size:20px;font-weight:600;margin:0 0 4px 0;">Relatório semanal</h1>
        <p style="font-size:13px;color:#9A8C78;margin:0 0 32px 0;">
          ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" })}
        </p>

        <h2 style="font-size:16px;font-weight:600;margin:0 0 12px 0;color:#BE6E4E;">
          Profissionais com pendências (${pendentes.length})
        </h2>
        ${linhasPendentes}

        <h2 style="font-size:16px;font-weight:600;margin:32px 0 12px 0;color:#BE6E4E;">
          Novas inscrições — últimos 7 dias (${inscricoes.length})
        </h2>
        ${linhasInscricoes}

        <div style="margin-top:32px;">
          <a href="https://kirisaude.com.br/admin"
             style="display:inline-block;background:#44606C;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
            Abrir painel admin →
          </a>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, pendentes: pendentes.length, inscricoes: inscricoes.length });
}
