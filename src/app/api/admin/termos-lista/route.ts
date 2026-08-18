import { NextResponse } from "next/server";
import { titleCasePT } from "@/lib/titleCase";
import { readFileSync } from "fs";
import { join } from "path";

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
    `${supabaseUrl}/rest/v1/inscricoes_profissionais?select=id,nome,email,profissao,autentique_document_id,autentique_enviado_em&status=neq.excluido&order=criado_em.desc`,
    { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
  );

  if (!res.ok) return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 502 });

  const lista: Array<{ id: string; nome: string; email: string | null; profissao: string; autentique_document_id: string | null; autentique_enviado_em: string | null }> = await res.json();

  // Monta mapa inscricao_id → { prof_id, email } para link de edição e fallback de email
  let inscricaoMapa: Record<string, { prof_id: string; email?: string | null }> = {};
  try {
    const json = JSON.parse(readFileSync(join(process.cwd(), "src/data/profissionais.json"), "utf-8"));
    for (const p of json.profissionais ?? []) {
      if (p.inscricao_id) inscricaoMapa[p.inscricao_id] = { prof_id: p.id, email: p.email ?? null };
    }
  } catch { /* se falhar, segue sem o mapeamento */ }

  return NextResponse.json(
    lista.map((i) => {
      const mapa = inscricaoMapa[i.id];
      return {
        ...i,
        nome: titleCasePT(i.nome),
        email: i.email || mapa?.email || null,
        prof_id: mapa?.prof_id ?? null,
      };
    })
  );
}
