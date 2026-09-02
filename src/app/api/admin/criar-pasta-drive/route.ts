import { NextResponse } from "next/server";

const GITHUB_REPO = "kirisaude/kiri-site";
const GITHUB_FILE = "src/data/profissionais.json";
const GITHUB_BRANCH = "main";
const PASTA_PRINCIPAL = "1GAnldHPnaJaz3l79sL_chJws0OKmqwKqKRxICaC6dolO-v1ZjwEaDmJ4Dwnl3YgjfNtoV2V4";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "Erro ao obter token Google");
  return data.access_token as string;
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) return NextResponse.json({ error: "GITHUB_TOKEN não configurado" }, { status: 500 });
  if (!process.env.GOOGLE_REFRESH_TOKEN) return NextResponse.json({ error: "Drive não configurado" }, { status: 503 });

  const { prof_id, nome } = await request.json() as { prof_id: string; nome: string };
  if (!prof_id || !nome) return NextResponse.json({ error: "prof_id e nome são obrigatórios" }, { status: 400 });

  // Busca JSON do GitHub e token Google em paralelo
  let fileRes: Response, accessToken: string;
  try {
    [fileRes, accessToken] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`,
        { headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json" }, cache: "no-store" }
      ),
      getAccessToken(),
    ]);
  } catch (e) {
    return NextResponse.json({ error: `Falha ao conectar: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }

  if (!fileRes.ok) return NextResponse.json({ error: "Erro ao buscar JSON do GitHub" }, { status: 502 });
  const fileData = await fileRes.json();
  const json = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

  // Verifica se já tem pasta
  const prof = json.profissionais.find((p: { id: string }) => p.id === prof_id);
  if (!prof) return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  if (prof.pasta_drive) return NextResponse.json({ error: "Profissional já tem pasta vinculada", pasta_drive: prof.pasta_drive }, { status: 409 });

  // Cria a pasta no Drive
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nome,
      mimeType: "application/vnd.google-apps.folder",
      parents: [PASTA_PRINCIPAL],
    }),
  });
  const folder = await createRes.json() as { id?: string; webViewLink?: string; error?: { message: string } };
  if (!createRes.ok) {
    return NextResponse.json({ error: `Erro ao criar pasta: ${folder.error?.message ?? "desconhecido"}` }, { status: 502 });
  }

  // Salva o link no JSON — tenta até 3 vezes buscando SHA atualizado em caso de conflito
  const githubBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
  const githubHeaders = { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" };

  let currentSha = fileData.sha;
  let currentJson = json;
  let saved = false;

  for (let attempt = 0; attempt < 3; attempt++) {
    const profEntry = currentJson.profissionais.find((p: { id: string }) => p.id === prof_id);
    if (!profEntry) break;
    profEntry.pasta_drive = folder.webViewLink;

    const putRes = await fetch(githubBase, {
      method: "PUT",
      headers: githubHeaders,
      body: JSON.stringify({
        message: `Drive: cria pasta para ${nome}`,
        content: Buffer.from(JSON.stringify(currentJson, null, 2)).toString("base64"),
        sha: currentSha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (putRes.ok) { saved = true; break; }

    // Conflito de SHA (409/422) — busca versão atual e tenta novamente
    const putErr = await putRes.json().catch(() => ({})) as { message?: string };
    const isConflict = putRes.status === 409 || putRes.status === 422 || /sha/i.test(putErr.message ?? "");
    if (!isConflict) break;

    const freshRes = await fetch(`${githubBase}?ref=${GITHUB_BRANCH}`, { headers: githubHeaders, cache: "no-store" });
    if (!freshRes.ok) break;
    const freshData = await freshRes.json();
    currentSha = freshData.sha;
    currentJson = JSON.parse(Buffer.from(freshData.content, "base64").toString("utf-8"));
  }

  if (!saved) return NextResponse.json({ error: "Pasta criada no Drive mas falha ao salvar no GitHub — tente novamente" }, { status: 502 });

  return NextResponse.json({ ok: true, pasta_drive: folder.webViewLink, folder_id: folder.id });
}
