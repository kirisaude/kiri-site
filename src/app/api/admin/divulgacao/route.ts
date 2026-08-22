import { NextResponse } from "next/server";

const GITHUB_REPO = "kirisaude/kiri-site";
const GITHUB_FILE = "src/data/divulgacao.json";
const GITHUB_BRANCH = "main";

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

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const token = process.env.GITHUB_TOKEN!;
  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
  return NextResponse.json(json.contatos ?? []);
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const token = process.env.GITHUB_TOKEN!;
  const { nome, email } = await request.json();
  if (!nome?.trim() || !email?.trim()) return NextResponse.json({ error: "nome e email obrigatórios" }, { status: 400 });

  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));

  const jaExiste = json.contatos.some((c: { email: string }) => c.email.toLowerCase() === email.toLowerCase().trim());
  if (jaExiste) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });

  const novoContato = {
    id: crypto.randomUUID(),
    nome: nome.trim(),
    email: email.toLowerCase().trim(),
    enviado_em: null as string | null,
    criado_em: new Date().toISOString(),
  };
  json.contatos.push(novoContato);
  await salvarArquivo(token, file.sha, json, `Divulgação: add ${novoContato.nome}`);
  return NextResponse.json(novoContato);
}

export async function PATCH(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const token = process.env.GITHUB_TOKEN!;
  const { id, enviado_em } = await request.json();

  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
  const contato = json.contatos.find((c: { id: string }) => c.id === id);
  if (!contato) return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 });

  contato.enviado_em = enviado_em;
  await salvarArquivo(token, file.sha, json, `Divulgação: mark sent ${contato.nome}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminAuthed(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const token = process.env.GITHUB_TOKEN!;
  const { id } = await request.json();

  const file = await getArquivo(token);
  const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));
  json.contatos = json.contatos.filter((c: { id: string }) => c.id !== id);
  await salvarArquivo(token, file.sha, json, `Divulgação: remove contato`);
  return NextResponse.json({ ok: true });
}
