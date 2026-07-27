import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const { nome, email, topico, mensagem } = await request.json();

  if (!nome?.trim() || !email?.trim() || !mensagem?.trim()) {
    return NextResponse.json({ erro: "Nome, e-mail e mensagem são obrigatórios" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/contatos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      nome: nome.trim(),
      email: email.trim(),
      topico: topico?.trim() || null,
      mensagem: mensagem.trim(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Supabase contato erro:", res.status, err);
    return NextResponse.json({ erro: "Erro ao registrar mensagem" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/contatos?order=criado_em.desc&limit=200`,
    {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar contatos" }, { status: 502 });
  }

  return NextResponse.json(await res.json());
}

export async function PATCH(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const { id, lido } = await request.json();

  const res = await fetch(`${supabaseUrl}/rest/v1/contatos?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ lido }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
