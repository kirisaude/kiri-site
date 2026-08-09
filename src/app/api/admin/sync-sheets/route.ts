import { createSign } from "crypto";
import { NextResponse } from "next/server";
import data from "@/data/profissionais.json";
import type { Profissional, ExperienciaInfantil, Formacao } from "@/types";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function getGoogleToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);
  const sig = sign.sign(privateKey, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claim}.${sig}`,
  });
  const d = await res.json() as { access_token?: string; error?: string };
  if (!d.access_token) throw new Error(d.error ?? "Falha ao obter token Google");
  return d.access_token;
}

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

function formatExperiencias(exps: ExperienciaInfantil[] | undefined): string {
  if (!exps || exps.length === 0) return "";
  return exps.map(e => [e.descricao, e.tempo, e.faixa_etaria].filter(Boolean).join(" · ")).join("; ");
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!saJson || !sheetId) {
    return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_SHEETS_ID não configurados" }, { status: 500 });
  }

  let sa: { client_email: string; private_key: string };
  try {
    sa = JSON.parse(saJson);
  } catch {
    return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_JSON inválido" }, { status: 500 });
  }

  const profissionais = data.profissionais as (Profissional & {
    inscricao_id?: string | null;
    tempo_atuacao?: string | null;
    experiencias_infantil?: ExperienciaInfantil[];
  })[];

  // Busca extras do Supabase
  type InscricaoExtra = { id: string; email: string | null; grupo_whatsapp: boolean | null; tempo_atuacao: string | null };
  const extrasMap = new Map<string, InscricaoExtra>();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    const ids = profissionais.map(p => p.inscricao_id).filter(Boolean) as string[];
    if (ids.length > 0) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/inscricoes_profissionais?or=(${ids.map(id => `id.eq.${id}`).join(",")})&select=id,email,grupo_whatsapp,tempo_atuacao`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
        );
        if (res.ok) {
          const rows = await res.json() as InscricaoExtra[];
          for (const r of rows) extrasMap.set(r.id, r);
        }
      } catch { /* continua sem extras */ }
    }
  }

  // Monta linhas
  const HEADERS = [
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
    const { grad, pos } = formatFormacao(p.formacao ?? []);
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
      p.tempo_atuacao ?? extra?.tempo_atuacao ?? "",
      extra?.grupo_whatsapp == null ? "" : extra.grupo_whatsapp ? "Sim" : "Não",
      p.valor_min ?? "",
      p.valor_max ?? "",
      p.convenio_info ?? "",
      p.whatsapp_agendamento ?? "",
      extra?.email ?? "",
      grad,
      pos,
      formatExperiencias(p.experiencias_infantil),
      p.oculto ? "Sim" : "Não",
      p.foto_url ? "Sim" : "Não",
      p.verificado ? "Sim" : "Não",
      p.verificacao_data ?? "",
    ];
  });

  // Autentica e escreve na planilha
  const token = await getGoogleToken(sa.client_email, sa.private_key);
  const range = "A1";
  const values = [HEADERS, ...rows];

  // Limpa a planilha primeiro
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:Z:clear`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  // Escreve tudo do zero
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    }
  );

  if (!writeRes.ok) {
    const err = await writeRes.text();
    return NextResponse.json({ error: `Erro ao escrever na planilha: ${err}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, linhas: rows.length });
}
