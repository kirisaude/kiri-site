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

  // Salva o link no JSON e envia ao GitHub
  prof.pasta_drive = folder.webViewLink;
  const novoConteudo = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");
  const putRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Drive: cria pasta para ${nome}`,
        content: novoConteudo,
        sha: fileData.sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!putRes.ok) return NextResponse.json({ error: "Pasta criada no Drive mas falha ao salvar no GitHub" }, { status: 502 });

  return NextResponse.json({ ok: true, pasta_drive: folder.webViewLink, folder_id: folder.id });
}
