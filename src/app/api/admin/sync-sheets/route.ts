import { createSign } from "crypto";
import { NextResponse } from "next/server";
import data from "@/data/profissionais.json";
import type { Profissional, ExperienciaInfantil, Formacao } from "@/types";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function getGoogleToken(clientEmail: string, privateKey: string): Promise<string> {
  // Garante que \n no env var viram newlines reais
  const key = privateKey.replace(/\\n/g, "\n");
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
  const sig = sign.sign(key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claim}.${sig}`,
  });
  const d = await res.json() as { access_token?: string; error?: string; error_description?: string };
  if (!d.access_token) throw new Error(`Token Google: ${d.error} — ${d.error_description}`);
  return d.access_token;
}

function buildRow(
  p: Profissional & { inscricao_id?: string | null; tempo_atuacao?: string | null; experiencias_infantil?: ExperienciaInfantil[] },
  extra: { email?: string | null; grupo_whatsapp?: boolean | null; tempo_atuacao?: string | null } | undefined
): (string | number)[] {
  function formatFormacao(formacao: Formacao[]): { grad: string; pos: string } {
    const grad = formacao.filter(f => /^graduaç/i.test(f.curso))
      .map(f => [f.curso, f.instituicao_ano].filter(Boolean).join(" — ")).join("; ");
    const pos = formacao.filter(f => !/^graduaç/i.test(f.curso) && (f.curso || f.instituicao_ano))
      .map(f => [f.curso, f.instituicao_ano].filter(Boolean).join(" — ")).join("; ");
    return { grad, pos };
  }
  function formatExp(exps: ExperienciaInfantil[] | undefined): string {
    return exps?.map(e => [e.descricao, e.tempo, e.faixa_etaria].filter(Boolean).join(" · ")).join("; ") ?? "";
  }
  const { grad, pos } = formatFormacao(p.formacao ?? []);
  return [
    p.id,
    p.nome,
    p.profissao,
    p.registro_conselho ?? "",
    p.rqe ?? "",
    p.whatsapp_agendamento ?? "",
    extra?.grupo_whatsapp == null ? "" : extra.grupo_whatsapp ? "Sim" : "Não",
    extra?.email ?? "",
    p.modalidade ?? "",
    p.cidade ?? "",
    p.verificacao_data ?? "",
    p.verificado ? "Sim" : "Não",
    p.oculto ? "Sim" : "Não",
    p.foto_url ? "Sim" : "Não",
    p.titulo_exibicao ?? "",
    p.faixa_etaria ?? "",
    Array.isArray(p.areas_atuacao) ? p.areas_atuacao.join("; ") : "",
    p.tempo_atuacao ?? extra?.tempo_atuacao ?? "",
    p.valor_min ?? "", p.valor_max ?? "",
    p.convenio_info ?? "",
    formatExp(p.experiencias_infantil),
    grad,
    pos,
  ];
}

const HEADERS = [
  "ID", "Nome", "Profissão", "Registro", "RQE",
  "WhatsApp agendamento", "Grupo WhatsApp Kiri", "E-mail",
  "Modalidade", "Cidade",
  "Data verificação", "Verificado", "Oculto", "Foto",
  "Título de exibição", "Faixa etária", "Áreas de atuação",
  "Tempo de atuação", "Valor mín (R$)", "Valor máx (R$)", "Convênio",
  "Experiências área infantil",
  "Graduação", "Especializações / pós",
];

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!saJson || !sheetId) {
    return NextResponse.json({ error: "Variáveis GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_SHEETS_ID não configuradas na Vercel" }, { status: 500 });
  }

  let sa: { client_email: string; private_key: string };
  try {
    // Extrai o primeiro objeto JSON válido — ignora conteúdo extra antes/depois
    const raw = saJson.trim();
    let depth = 0, inStr = false, esc = false, jsonStart = -1, jsonEnd = -1;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (esc) { esc = false; continue; }
      if (inStr) { if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') { inStr = true; continue; }
      if (c === "{") { if (depth === 0) jsonStart = i; depth++; }
      else if (c === "}") { depth--; if (depth === 0 && jsonStart >= 0) { jsonEnd = i; break; } }
    }
    const clean = jsonStart >= 0 && jsonEnd > jsonStart ? raw.slice(jsonStart, jsonEnd + 1) : raw;
    sa = JSON.parse(clean);
  } catch (e) {
    return NextResponse.json({ error: `JSON inválido: ${e}` }, { status: 500 });
  }

  const profissionais = data.profissionais as (Profissional & {
    inscricao_id?: string | null;
    tempo_atuacao?: string | null;
    experiencias_infantil?: ExperienciaInfantil[];
  })[];

  // Busca extras do Supabase
  type Extra = { id: string; email: string | null; grupo_whatsapp: boolean | null; tempo_atuacao: string | null };
  const extrasMap = new Map<string, Extra>();
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
        if (res.ok) for (const r of await res.json() as Extra[]) extrasMap.set(r.id, r);
      } catch { /* sem extras */ }
    }
  }

  let token: string;
  try {
    token = await getGoogleToken(sa.client_email, sa.private_key);
  } catch (e) {
    return NextResponse.json({ error: `Autenticação Google falhou: ${e}` }, { status: 500 });
  }

  const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Lê coluna A para saber quais IDs já existem e em qual linha
  const readRes = await fetch(`${base}/values/A:A`, { headers: auth });
  if (!readRes.ok) {
    return NextResponse.json({ error: `Erro ao ler planilha: ${await readRes.text()}` }, { status: 502 });
  }
  const readData = await readRes.json() as { values?: string[][] };
  const existingRows: string[] = (readData.values ?? []).map(r => r[0] ?? "");

  // Se planilha vazia, escreve cabeçalho
  if (existingRows.length === 0) {
    await fetch(`${base}/values/A1?valueInputOption=RAW`, {
      method: "PUT",
      headers: auth,
      body: JSON.stringify({ values: [HEADERS] }),
    });
    existingRows.push(...HEADERS.map((_, i) => i === 0 ? "ID" : ""));
  }

  // Mapa ID → número da linha (1-based)
  const idToRow = new Map<string, number>();
  existingRows.forEach((id, i) => { if (id && id !== "ID") idToRow.set(id, i + 1); });

  // Separa em updates e appends
  const toUpdate: { range: string; values: (string | number)[][] }[] = [];
  const toAppend: (string | number)[][] = [];

  for (const p of profissionais) {
    const extra = p.inscricao_id ? extrasMap.get(p.inscricao_id) : undefined;
    const row = buildRow(p, extra);
    const existingRowNum = idToRow.get(p.id);
    if (existingRowNum) {
      toUpdate.push({ range: `A${existingRowNum}`, values: [row] });
    } else {
      toAppend.push(row);
    }
  }

  // Atualiza linhas existentes em batch
  if (toUpdate.length > 0) {
    const batchRes = await fetch(`${base}/values:batchUpdate`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ valueInputOption: "RAW", data: toUpdate }),
    });
    if (!batchRes.ok) {
      return NextResponse.json({ error: `Erro ao atualizar linhas: ${await batchRes.text()}` }, { status: 502 });
    }
  }

  // Adiciona linhas novas no final
  if (toAppend.length > 0) {
    const appendRes = await fetch(`${base}/values/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ values: toAppend }),
    });
    if (!appendRes.ok) {
      return NextResponse.json({ error: `Erro ao adicionar linhas: ${await appendRes.text()}` }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, atualizados: toUpdate.length, adicionados: toAppend.length });
}
