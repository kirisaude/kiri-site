import { createSign } from "crypto";
import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function getGoogleToken(clientEmail: string, privateKey: string): Promise<string> {
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

function parseField(obs: string | null, chave: string): string {
  if (!obs) return "";
  const m = obs.match(new RegExp(`${chave}: ([^—]+)`));
  return m ? m[1].trim() : "";
}

function parsePagamento(obs: string | null): string {
  if (!obs) return "";
  const conv = obs.match(/Convênio: ([^—(]+)/)?.[1].trim();
  if (conv) {
    const aceitaParticular = obs.includes("aceita particular");
    return `Convênio — ${conv}${aceitaParticular ? " (aceita particular)" : ""}`;
  }
  const pag = obs.match(/Pagamento: ([^—]+)/)?.[1].trim();
  return pag ?? "";
}

function parseObjetivo(obs: string | null): string {
  if (!obs) return "";
  return obs
    .replace(/Demanda: [^—]+(?:—\s*)?/g, "")
    .replace(/Faixa etária: [^—]+(?:—\s*)?/g, "")
    .replace(/Profissional: [^—]+(?:—\s*)?/g, "")
    .replace(/Convênio: [^—]+(?:—\s*)?/g, "")
    .replace(/Pagamento: [^—]+(?:—\s*)?/g, "")
    .replace(/\(aceita particular[^)]*\)/g, "")
    .replace(/—/g, "")
    .trim();
}

type Encaminhamento = {
  id: string;
  criado_em: string;
  nome_responsavel: string;
  contato: string;
  cidade: string | null;
  modalidade: string | null;
  profissional_solicitado: string | null;
  observacoes: string | null;
  status: string | null;
};

type Followup = {
  encaminhamento_id: string;
  concluido_em: string | null;
  agendou: boolean | null;
  desfecho: string | null;
};

const HEADERS = [
  "ID",
  "Nome familiar",
  "Canal",
  "Cidade",
  "Modalidade",
  "Pagamento",
  "Tipo de profissional buscado",
  "Demanda principal",
  "Faixa etária",
  "O que busca / Detalhes",
  "Data do pedido",
  "Status",
  "Data encerramento follow-up",
  "Converteu?",
  "Motivo / Anotação",
];

function buildRow(e: Encaminhamento, fup: Followup | undefined): (string | number)[] {
  const canal = e.contato?.includes("@") ? "E-mail" : "WhatsApp";
  const pagamento = parsePagamento(e.observacoes);
  const tipoProfissional = parseField(e.observacoes, "Profissional");
  const demanda = parseField(e.observacoes, "Demanda");
  const faixaEtaria = parseField(e.observacoes, "Faixa etária");
  const objetivo = parseObjetivo(e.observacoes);
  const dataEncerramento = fup?.concluido_em ? new Date(fup.concluido_em).toLocaleDateString("pt-BR") : "";
  const converteu = fup?.agendou === true ? "Sim" : fup?.agendou === false ? "Não" : "";

  return [
    e.id,
    e.nome_responsavel,
    canal,
    e.cidade ?? "",
    e.modalidade ?? "",
    pagamento,
    tipoProfissional,
    demanda,
    faixaEtaria,
    objetivo,
    new Date(e.criado_em).toLocaleDateString("pt-BR"),
    e.status ?? "novo",
    dataEncerramento,
    converteu,
    fup?.desfecho ?? "",
  ];
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEETS_CURADORIA_ID;
  if (!saJson || !sheetId) {
    return NextResponse.json({ error: "Variáveis GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_SHEETS_CURADORIA_ID não configuradas na Vercel" }, { status: 500 });
  }

  let sa: { client_email: string; private_key: string };
  try {
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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

  const [encRes, fupRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/encaminhamentos?profissional_solicitado=is.null&order=criado_em.desc&limit=1000&select=id,criado_em,nome_responsavel,contato,cidade,modalidade,profissional_solicitado,observacoes,status`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/followups?select=encaminhamento_id,concluido_em,agendou,desfecho&limit=1000`, { headers }),
  ]);

  const encaminhamentos: Encaminhamento[] = encRes.ok ? await encRes.json() : [];
  const followups: Followup[] = fupRes.ok ? await fupRes.json() : [];
  const fupMap = new Map<string, Followup>();
  for (const f of followups) fupMap.set(f.encaminhamento_id, f);

  let token: string;
  try {
    token = await getGoogleToken(sa.client_email, sa.private_key);
  } catch (e) {
    return NextResponse.json({ error: `Autenticação Google falhou: ${e}` }, { status: 500 });
  }

  const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const readRes = await fetch(`${base}/values/A:A`, { headers: auth });
  if (!readRes.ok) {
    return NextResponse.json({ error: `Erro ao ler planilha: ${await readRes.text()}` }, { status: 502 });
  }
  const readData = await readRes.json() as { values?: string[][] };
  const existingRows: string[] = (readData.values ?? []).map(r => r[0] ?? "");

  if (existingRows.length === 0) {
    await fetch(`${base}/values/A1?valueInputOption=RAW`, {
      method: "PUT",
      headers: auth,
      body: JSON.stringify({ values: [HEADERS] }),
    });
    existingRows.push(...HEADERS.map((_, i) => i === 0 ? "ID" : ""));
  }

  const idToRow = new Map<string, number>();
  existingRows.forEach((id, i) => { if (id && id !== "ID") idToRow.set(id, i + 1); });

  const toUpdate: { range: string; values: (string | number)[][] }[] = [];
  const toAppend: (string | number)[][] = [];

  for (const e of encaminhamentos) {
    const row = buildRow(e, fupMap.get(e.id));
    const existingRowNum = idToRow.get(e.id);
    if (existingRowNum) {
      toUpdate.push({ range: `A${existingRowNum}`, values: [row] });
    } else {
      toAppend.push(row);
    }
  }

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
