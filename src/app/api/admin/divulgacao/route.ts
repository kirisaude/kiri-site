import { NextResponse } from "next/server";

const GITHUB_REPO = "kirisaude/kiri-site";
const GITHUB_FILE = "src/data/divulgacao.json";
const GITHUB_BRANCH = "main";

type Lista = "pediatras" | "profissionais" | "linkedin";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function getArquivo(token: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, cache: "no-store" }
  );
  if (!res.ok) throw new Error("Erro ao buscar arquivo");
  return res.json();
}

async function salvarArquivo(token: string, sha: string, json: object, mensagem: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: mensagem,
        content: Buffer.from(JSON.stringify(json, null, 2)).toString("base64"),
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!res.ok) throw new Error("Erro ao salvar arquivo");
}

function getLista(url: string): Lista {
  const lista = new URL(url).searchParams.get("lista");
  if (lista === "profissionais") return "profissionais";
  if (lista === "linkedin") return "linkedin";
  return "pediatras";
}

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = getLista(request.url);
  const token = process.env.GITHUB_TOKEN!;
  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
  return NextResponse.json(json[lista] ?? []);
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = getLista(request.url);
  const token = process.env.GITHUB_TOKEN!;
  const body = await request.json();
  const { nome, cidade } = body;
  if (!nome?.trim()) return NextResponse.json({ error: "nome obrigatório" }, { status: 400 });

  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
  if (!json[lista]) json[lista] = [];

  let novoContato: Record<string, unknown>;

  if (lista === "linkedin") {
    const { perfil_url } = body;
    if (!perfil_url?.trim()) return NextResponse.json({ error: "perfil_url obrigatório" }, { status: 400 });
    novoContato = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      perfil_url: perfil_url.trim(),
      cidade: cidade?.trim() || null,
      status: "pendente",
      criado_em: new Date().toISOString(),
    };
  } else {
    const { email } = body;
    if (!email?.trim()) return NextResponse.json({ error: "email obrigatório" }, { status: 400 });
    const jaExiste = json[lista].some((c: { email: string }) => c.email.toLowerCase() === email.toLowerCase().trim());
    if (jaExiste) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    novoContato = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      cidade: cidade?.trim() || null,
      enviado_em: null,
      criado_em: new Date().toISOString(),
    };
  }

  json[lista].push(novoContato);
  await salvarArquivo(token, file.sha, json, `Divulgação (${lista}): add ${novoContato.nome}`);
  return NextResponse.json(novoContato);
}

export async function PATCH(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = getLista(request.url);
  const token = process.env.GITHUB_TOKEN!;
  const body = await request.json();
  const { id } = body;

  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
  const contato = (json[lista] ?? []).find((c: { id: string }) => c.id === id);
  if (!contato) return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 });

  if (lista === "linkedin") {
    contato.status = body.status;
    await salvarArquivo(token, file.sha, json, `Divulgação (linkedin): status ${body.status} — ${contato.nome}`);
  } else {
    contato.enviado_em = body.enviado_em;
    await salvarArquivo(token, file.sha, json, `Divulgação (${lista}): mark sent ${contato.nome}`);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = getLista(request.url);
  const token = process.env.GITHUB_TOKEN!;
  const { id } = await request.json();

  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
  json[lista] = (json[lista] ?? []).filter((c: { id: string }) => c.id !== id);
  await salvarArquivo(token, file.sha, json, `Divulgação (${lista}): remove contato`);
  return NextResponse.json({ ok: true });
}
