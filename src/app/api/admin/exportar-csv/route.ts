import { NextResponse } from "next/server";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) {
    return new Response("Não autorizado", { status: 401 });
  }

  const profissionais = data.profissionais as (Profissional & { inscricao_id?: string | null })[];

  // Busca e-mails do Supabase para quem tem inscricao_id
  const emailMap = new Map<string, string>();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    const ids = profissionais.map(p => p.inscricao_id).filter(Boolean) as string[];
    if (ids.length > 0) {
      const filter = ids.map(id => `id.eq.${id}`).join(",");
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/inscricoes_profissionais?or=(${filter})&select=id,email`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
        );
        if (res.ok) {
          const rows = await res.json() as { id: string; email: string | null }[];
          for (const r of rows) {
            if (r.email) emailMap.set(r.id, r.email);
          }
        }
      } catch { /* sem email */ }
    }
  }

  const COLS = [
    "ID", "Nome", "Profissão", "Título de exibição", "Registro", "RQE",
    "Áreas de atuação", "Modalidade", "Cidade", "Faixa etária",
    "Valor mín (R$)", "Valor máx (R$)", "Convênio",
    "WhatsApp agendamento", "E-mail", "Oculto", "Foto", "Verificado", "Data verificação",
  ];

  const rows = profissionais.map(p => {
    const email = p.inscricao_id ? (emailMap.get(p.inscricao_id) ?? "") : "";
    return [
      p.id,
      p.nome,
      p.profissao,
      p.titulo_exibicao ?? "",
      p.registro_conselho ?? "",
      p.rqe ?? "",
      Array.isArray(p.areas_atuacao) ? p.areas_atuacao.join("; ") : "",
      p.modalidade ?? "",
      p.cidade ?? "",
      p.faixa_etaria ?? "",
      p.valor_min ?? "",
      p.valor_max ?? "",
      p.convenio_info ?? "",
      p.whatsapp_agendamento ?? "",
      email,
      p.oculto ? "Sim" : "Não",
      p.foto_url ? "Sim" : "Não",
      p.verificado ? "Sim" : "Não",
      p.verificacao_data ?? "",
    ].map(esc).join(",");
  });

  const csv = [COLS.map(esc).join(","), ...rows].join("\r\n");
  const now = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kiri-profissionais-${now}.csv"`,
    },
  });
}
