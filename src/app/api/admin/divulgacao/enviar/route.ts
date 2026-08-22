import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

const transporter = nodemailer.createTransport({
  host: "email.locaweb.com.br",
  port: 587,
  secure: false,
  auth: {
    user: "contato@kirisaude.com.br",
    pass: process.env.LOCAWEB_EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { nome, email, assunto, corpo } = await request.json();
  if (!nome || !email || !assunto || !corpo) {
    return NextResponse.json({ error: "nome, email, assunto e corpo são obrigatórios" }, { status: 400 });
  }

  const corpoPersonalizado = corpo.replace(/\{nome\}/g, nome);

  try {
    await transporter.sendMail({
      from: `"Kiri Saúde" <contato@kirisaude.com.br>`,
      to: `${nome} <${email}>`,
      cc: "iohana.marques@unifesp.br",
      subject: assunto,
      html: corpoPersonalizado,
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Erro ao enviar e-mail:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao enviar" }, { status: 500 });
  }
}
