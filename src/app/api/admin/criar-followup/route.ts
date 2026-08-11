import { NextResponse } from "next/server";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

function gerarToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const { encaminhamento_id } = await request.json() as { encaminhamento_id: string };
  if (!encaminhamento_id) return NextResponse.json({ error: "encaminhamento_id obrigatório" }, { status: 400 });

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

  // Verifica se já existe
  const existeRes = await fetch(
    `${supabaseUrl}/rest/v1/followups?encaminhamento_id=eq.${encaminhamento_id}&select=*&limit=1`,
    { headers }
  );
  if (existeRes.ok) {
    const existentes = await existeRes.json() as unknown[];
    if (existentes.length > 0) return NextResponse.json(existentes[0]);
  }

  // Busca o encaminhamento
  const encRes = await fetch(
    `${supabaseUrl}/rest/v1/encaminhamentos?id=eq.${encaminhamento_id}&select=*&limit=1`,
    { headers }
  );
  if (!encRes.ok) return NextResponse.json({ error: "Encaminhamento não encontrado" }, { status: 404 });
  const [enc] = await encRes.json() as { id: string; nome_responsavel: string; contato: string; profissional_solicitado: string | null }[];
  if (!enc) return NextResponse.json({ error: "Encaminhamento não encontrado" }, { status: 404 });

  const prof = enc.profissional_solicitado ? profissionais.find(p => p.id === enc.profissional_solicitado) : null;
  const token = gerarToken();

  const followupData = {
    encaminhamento_id: enc.id,
    token,
    profissional_nome: prof?.nome ?? null,
    responsavel_nome: enc.nome_responsavel,
    contato: enc.contato,
    contato_tipo: enc.contato.includes("@") ? "email" : "whatsapp",
  };

  const criarRes = await fetch(`${supabaseUrl}/rest/v1/followups`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(followupData),
  });

  if (!criarRes.ok) {
    const err = await criarRes.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  const [criado] = await criarRes.json() as unknown[];
  return NextResponse.json(criado);
}
