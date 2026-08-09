import data from "@/data/profissionais.json";
import type { Profissional, ExperienciaInfantil, Formacao } from "@/types";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

type InscricaoExtra = {
  id: string;
  email: string | null;
  grupo_whatsapp: boolean | null;
  tempo_atuacao: string | null;
};

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) {
    return new Response("Não autorizado", { status: 401 });
  }

  const profissionais = data.profissionais as (Profissional & {
    inscricao_id?: string | null;
    experiencias_infantil?: ExperienciaInfantil[];
  })[];

  // Busca dados extras do Supabase para quem tem inscricao_id
  const extrasMap = new Map<string, InscricaoExtra>();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    const ids = profissionais.map(p => p.inscricao_id).filter(Boolean) as string[];
    if (ids.length > 0) {
      const filter = ids.map(id => `id.eq.${id}`).join(",");
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/inscricoes_profissionais?or=(${filter})&select=id,email,grupo_whatsapp,tempo_atuacao`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
        );
        if (res.ok) {
          const rows = await res.json() as InscricaoExtra[];
          for (const r of rows) extrasMap.set(r.id, r);
        }
      } catch { /* sem dados extras */ }
    }
  }

  // Formata formação: separa graduação e pós/especializações
  function formatFormacao(formacao: Formacao[]): { grad: string; pos: string } {
    const grad = formacao
      .filter(f => /^graduaç/i.test(f.curso))
      .map(f => [f.curso, f.instituicao_ano].filter(Boolean).join(" — "))
      .join("; ");
    const pos = formacao
      .filter(f => !/^graduaç/i.test(f.curso) && (f.curso || f.instituicao_ano))
      .map(f => [f.curso, f.instituicao_ano].filter(Boolean).join(" — "))
      .join("; ");
    return { grad, pos };
  }

  // Formata experiências infantis
  function formatExperiencias(exps: ExperienciaInfantil[] | undefined): string {
    if (!exps || exps.length === 0) return "";
    return exps.map(e => {
      const partes = [e.descricao, e.tempo, e.faixa_etaria].filter(Boolean);
      return partes.join(" · ");
    }).join("; ");
  }

  const COLS = [
    "ID", "Nome", "Profissão", "Título de exibição", "Registro", "RQE",
    "Áreas de atuação", "Modalidade", "Cidade", "Faixa etária",
    "Tempo de atuação", "Grupo WhatsApp Kiri",
    "Valor mín (R$)", "Valor máx (R$)", "Convênio",
    "WhatsApp agendamento", "E-mail",
    "Graduação", "Especializações / pós",
    "Experiências área infantil",
    "Oculto", "Foto", "Verificado", "Data verificação",
  ];

  const rows = profissionais.map(p => {
    const extra = p.inscricao_id ? extrasMap.get(p.inscricao_id) : undefined;
    const email = extra?.email ?? "";
    const grupoWa = extra?.grupo_whatsapp == null ? "" : extra.grupo_whatsapp ? "Sim" : "Não";
    const tempoAtuacao = (p as { tempo_atuacao?: string | null }).tempo_atuacao ?? extra?.tempo_atuacao ?? "";
    const { grad, pos } = formatFormacao(p.formacao ?? []);
    const exps = formatExperiencias(p.experiencias_infantil);

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
      tempoAtuacao,
      grupoWa,
      p.valor_min ?? "",
      p.valor_max ?? "",
      p.convenio_info ?? "",
      p.whatsapp_agendamento ?? "",
      email,
      grad,
      pos,
      exps,
      p.oculto ? "Sim" : "Não",
      p.foto_url ? "Sim" : "Não",
      p.verificado ? "Sim" : "Não",
      p.verificacao_data ?? "",
    ].map(esc).join(",");
  });

  const csv = "﻿" + [COLS.map(esc).join(","), ...rows].join("\r\n");
  const now = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kiri-profissionais-${now}.csv"`,
    },
  });
}
