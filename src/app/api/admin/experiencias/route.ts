import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function verificarAdmin() {
  const jar = await cookies();
  return jar.get("kiri_admin")?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  if (!(await verificarAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/experiencias?select=*&order=criado_em.desc`,
    {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar experiências" }, { status: 500 });
  }

  return NextResponse.json(await res.json());
}

export async function DELETE(request: Request) {
  if (!(await verificarAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const { id } = await request.json();

  const res = await fetch(`${supabaseUrl}/rest/v1/experiencias?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
