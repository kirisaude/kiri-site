import { NextResponse } from "next/server";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

function getProId(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/kiri_pro_id=([0-9a-f-]{36})/);
  const inscricaoId = match?.[1];
  if (!inscricaoId) return null;
  const prof = (data.profissionais as Profissional[]).find(p => p.inscricao_id === inscricaoId);
  return prof?.id ?? null;
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const profissionalId = getProId(request);
  if (!profissionalId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/encaminhamentos_pro?profissional_id=eq.${profissionalId}&order=criado_em.desc`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  );

  if (!res.ok) return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 502 });

  const encaminhamentos = await res.json();
  return NextResponse.json(encaminhamentos);
}

export async function PATCH(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const profissionalId = getProId(request);
  if (!profissionalId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id, status, data_consulta_agendada } = await request.json() as {
    id: string;
    status?: string;
    data_consulta_agendada?: string | null;
  };

  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const STATUS_VALIDOS = ["pendente", "contato_iniciado", "convertido_em_consulta", "nao_convertido"];
  if (status && !STATUS_VALIDOS.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { atualizado_em: new Date().toISOString() };
  if (status) patch.status = status;
  if (data_consulta_agendada !== undefined) patch.data_consulta_agendada = data_consulta_agendada;

  // Garante que o encaminhamento pertence ao profissional autenticado
  const res = await fetch(
    `${supabaseUrl}/rest/v1/encaminhamentos_pro?id=eq.${id}&profissional_id=eq.${profissionalId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey!,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    }
  );

  if (!res.ok) return NextResponse.json({ error: "Erro ao atualizar" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
