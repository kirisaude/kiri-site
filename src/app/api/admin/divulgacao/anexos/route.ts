import { NextResponse } from "next/server";

const GITHUB_REPO = "kirisaude/kiri-site";
const GITHUB_DATA_FILE = "src/data/divulgacao.json";
const GITHUB_BRANCH = "main";

type Lista = "pediatras" | "profissionais";
type Anexo = { filename: string; path: string };

function isAdminAuthed(request: Request) {
  return (request.headers.get("cookie") ?? "").includes("kiri_admin=ok");
}

function getLista(url: string): Lista {
  const l = new URL(url).searchParams.get("lista");
  return l === "profissionais" ? "profissionais" : "pediatras";
}

async function getDataFile(token: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_FILE}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, cache: "no-store" }
  );
  if (!res.ok) throw new Error("Erro ao buscar divulgacao.json");
  return res.json();
}

async function saveDataFile(token: string, sha: string, data: Record<string, unknown>, message: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_DATA_FILE}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message, content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"), sha, branch: GITHUB_BRANCH }),
    }
  );
  if (!res.ok) throw new Error("Erro ao salvar divulgacao.json");
}

async function uploadFile(token: string, path: string, contentBase64: string, filename: string) {
  // Check if file already exists to get its SHA
  const existing = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, cache: "no-store" }
  );
  const sha = existing.ok ? (await existing.json() as { sha: string }).sha : undefined;

  const body: Record<string, unknown> = {
    message: `Divulgação: upload anexo ${filename}`,
    content: contentBase64,
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao fazer upload: ${err}`);
  }
}

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = getLista(request.url);
  const token = process.env.GITHUB_TOKEN!;
  const file = await getDataFile(token);
  const data = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8")) as Record<string, unknown>;
  const anexos = (data._anexos as Record<Lista, Anexo[]> | undefined)?.[lista] ?? [];
  return NextResponse.json(anexos);
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = getLista(request.url);
  const token = process.env.GITHUB_TOKEN!;
  const { filename, content_base64 } = await request.json() as { filename: string; content_base64: string };
  if (!filename || !content_base64) return NextResponse.json({ error: "filename e content_base64 obrigatórios" }, { status: 400 });

  // Sanitize filename for GitHub path
  const safeName = filename.replace(/[^a-zA-Z0-9\-_.ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïðñòóôõöøùúûüý ]/g, "_");
  const path = `public/attachments/${safeName}`;

  await uploadFile(token, path, content_base64, filename);

  const file = await getDataFile(token);
  const data = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8")) as Record<string, unknown>;
  if (!data._anexos) data._anexos = { pediatras: [], profissionais: [] };
  const anexos = data._anexos as Record<Lista, Anexo[]>;
  if (!anexos[lista]) anexos[lista] = [];

  const jaExiste = anexos[lista].some((a) => a.filename === filename);
  if (!jaExiste) {
    anexos[lista].push({ filename, path });
    await saveDataFile(token, file.sha, data, `Divulgação (${lista}): adicionar anexo ${filename}`);
  }

  return NextResponse.json({ filename, path });
}

export async function DELETE(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = getLista(request.url);
  const token = process.env.GITHUB_TOKEN!;
  const { filename } = await request.json() as { filename: string };

  const file = await getDataFile(token);
  const data = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8")) as Record<string, unknown>;
  const anexos = data._anexos as Record<Lista, Anexo[]> | undefined;
  if (anexos?.[lista]) {
    anexos[lista] = anexos[lista].filter((a) => a.filename !== filename);
    await saveDataFile(token, file.sha, data, `Divulgação (${lista}): remover anexo ${filename}`);
  }
  return NextResponse.json({ ok: true });
}
