import { NextResponse } from "next/server";
import { Resend } from "resend";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

const ANEXOS_POR_LISTA: Record<string, Array<{ filename: string; path: string }>> = {
  pediatras: [
    { filename: "Kiri Saúde — para profissionais.pdf", path: "public/kiri-profissionais.pdf" },
    { filename: "Kiri Saúde — para famílias.pdf", path: "public/kiri-familias.pdf" },
  ],
  profissionais: [
    { filename: "Kiri Saúde — para profissionais.pdf", path: "public/kiri-profissionais.pdf" },
    { filename: "Termo de adesão — Kiri Saúde.pdf", path: "public/termo-de-adesao-kiri.pdf" },
  ],
};

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { nome, email, assunto, corpo, lista } = await request.json();
  if (!nome || !email || !assunto || !corpo) {
    return NextResponse.json({ error: "nome, email, assunto e corpo são obrigatórios" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY não configurado" }, { status: 500 });
  }

  const corpoPersonalizado = corpo.replace(/\{nome\}/g, nome);
  const configAnexos = ANEXOS_POR_LISTA[lista ?? "pediatras"] ?? ANEXOS_POR_LISTA.pediatras;

  const attachments = configAnexos
    .filter((a) => existsSync(join(process.cwd(), a.path)))
    .map((a) => ({
      filename: a.filename,
      content: readFileSync(join(process.cwd(), a.path)),
    }));

  try {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: "Kiri Saúde <contato@kirisaude.com.br>",
      to: `${nome} <${email}>`,
      cc: ["iohana.marques@unifesp.br"],
      subject: assunto,
      html: corpoPersonalizado,
      attachments,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Erro ao enviar e-mail:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao enviar" }, { status: 500 });
  }
}
