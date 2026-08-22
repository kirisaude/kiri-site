import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { join } from "path";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: "email.locaweb.com.br",
    port: 587,
    secure: false,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    auth: {
      user: "contato@kirisaude.com.br",
      pass: process.env.LOCAWEB_EMAIL_PASS,
    },
  });
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { nome, email, assunto, corpo } = await request.json();
  if (!nome || !email || !assunto || !corpo) {
    return NextResponse.json({ error: "nome, email, assunto e corpo são obrigatórios" }, { status: 400 });
  }

  const corpoPersonalizado = corpo.replace(/\{nome\}/g, nome);

  if (!process.env.LOCAWEB_EMAIL_PASS) {
    return NextResponse.json({ error: "LOCAWEB_EMAIL_PASS não configurado no servidor" }, { status: 500 });
  }

  try {
    const pdfFamilias = readFileSync(join(process.cwd(), "public/kiri-familias.pdf"));
    const pdfProfissionais = readFileSync(join(process.cwd(), "public/kiri-profissionais.pdf"));

    const transporter = makeTransporter();
    await transporter.sendMail({
      from: `"Kiri Saúde" <contato@kirisaude.com.br>`,
      to: `${nome} <${email}>`,
      cc: "iohana.marques@unifesp.br",
      subject: assunto,
      html: corpoPersonalizado,
      attachments: [
        { filename: "Kiri Saúde — para profissionais.pdf", content: pdfProfissionais, contentType: "application/pdf" },
        { filename: "Kiri Saúde — para famílias.pdf", content: pdfFamilias, contentType: "application/pdf" },
      ],
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Erro ao enviar e-mail:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro ao enviar" }, { status: 500 });
  }
}
