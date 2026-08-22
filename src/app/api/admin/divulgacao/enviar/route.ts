import { NextResponse } from "next/server";
import { Resend } from "resend";
import { readFileSync } from "fs";
import { join } from "path";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { nome, email, assunto, corpo } = await request.json();
  if (!nome || !email || !assunto || !corpo) {
    return NextResponse.json({ error: "nome, email, assunto e corpo são obrigatórios" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY não configurado" }, { status: 500 });
  }

  const corpoPersonalizado = corpo.replace(/\{nome\}/g, nome);

  try {
    const pdfFamilias = readFileSync(join(process.cwd(), "public/kiri-familias.pdf"));
    const pdfProfissionais = readFileSync(join(process.cwd(), "public/kiri-profissionais.pdf"));

    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: "Kiri Saúde <contato@kirisaude.com.br>",
      to: `${nome} <${email}>`,
      cc: ["iohana.marques@unifesp.br"],
      subject: assunto,
      html: corpoPersonalizado,
      attachments: [
        {
          filename: "Kiri Saúde — para profissionais.pdf",
          content: pdfProfissionais,
        },
        {
          filename: "Kiri Saúde — para famílias.pdf",
          content: pdfFamilias,
        },
      ],
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
