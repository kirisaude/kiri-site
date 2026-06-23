import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
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
    `${supabaseUrl}/rest/v1/encaminhamentos?order=criado_em.desc&limit=100`,
    {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar encaminhamentos" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
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

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id e status obrigatórios" }, { status: 400 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/encaminhamentos?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/encaminhamentos?id=eq.${id}`,
    {
      method: "DELETE",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
