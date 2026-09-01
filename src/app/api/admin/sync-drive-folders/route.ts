import { NextResponse } from "next/server";

const GITHUB_REPO = "kirisaude/kiri-site";
const GITHUB_FILE = "src/data/profissionais.json";
const GITHUB_BRANCH = "main";
const PASTA_PRINCIPAL = "1GAnldHPnaJaz3l79sL_chJws0OKmqwKqKRxICaC6dolO-v1ZjwEaDmJ4Dwnl3YgjfNtoV2V4";
const PASTA_SECUNDARIA = "1beQZWIyBS6sSQnMX1qBF5WMVfzFZayC7";

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

async function listarSubpastas(accessToken: string, folderId: string) {
  const query = encodeURIComponent(`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=200`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Erro ao listar pastas do Drive");
  return (data.files ?? []) as { id: string; name: string; webViewLink: string }[];
}

function normalizar(nome: string) {
  return nome.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\bdr\.?\s*/gi, "").replace(/\bdra\.?\s*/gi, "")
    .replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) return NextResponse.json({ error: "GITHUB_TOKEN não configurado" }, { status: 500 });
  if (!process.env.GOOGLE_REFRESH_TOKEN) return NextResponse.json({ error: "Drive não configurado" }, { status: 503 });

  // Busca arquivo do GitHub e token Google em paralelo
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

  // Lista subpastas do Drive
  let pastas1: { id: string; name: string; webViewLink: string }[], pastas2: typeof pastas1;
  try {
    [pastas1, pastas2] = await Promise.all([
      listarSubpastas(accessToken, PASTA_PRINCIPAL),
      listarSubpastas(accessToken, PASTA_SECUNDARIA),
    ]);
  } catch (e) {
    return NextResponse.json({ error: `Erro ao listar pastas do Drive: ${e instanceof Error ? e.message : e}` }, { status: 502 });
  }
  const todasPastas = [...pastas1, ...pastas2];

  // Mapeia profissionais sem pasta_drive
  const vinculados: string[] = [];
  for (const prof of json.profissionais) {
    if (prof.pasta_drive) continue;
    const nomeNorm = normalizar(prof.nome);
    const match = todasPastas.find((p) => {
      const pastaNorm = normalizar(p.name);
      return (
        pastaNorm.includes(nomeNorm) ||
        nomeNorm.includes(pastaNorm) ||
        nomeNorm.split(" ").filter((w: string) => w.length > 3).every((w: string) => pastaNorm.includes(w))
      );
    });
    if (match) {
      prof.pasta_drive = match.webViewLink;
      vinculados.push(`${prof.nome} → ${match.name}`);
    }
  }

  if (vinculados.length === 0) {
    return NextResponse.json({ ok: true, vinculados: 0, mensagem: "Nenhuma pasta nova encontrada." });
  }

  // Salva via GitHub API
  const novoConteudo = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");
  const putRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Sync Drive folders: ${vinculados.length} profissional(is) vinculado(s)`,
        content: novoConteudo,
        sha: fileData.sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!putRes.ok) return NextResponse.json({ error: "Erro ao salvar no GitHub" }, { status: 502 });

  return NextResponse.json({ ok: true, vinculados: vinculados.length, detalhes: vinculados });
}
