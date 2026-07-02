import { NextResponse } from "next/server";
import type { Profissional } from "@/types";

const GITHUB_REPO = "kirisaude/kiri-site";
const GITHUB_FILE = "src/data/profissionais.json";
const GITHUB_BRANCH = "main";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function getArquivoAtual(token: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error("Erro ao buscar arquivo do GitHub");
  return res.json();
}

async function commitProfissional(token: string, novoConteudo: string, sha: string) {
  const encoded = Buffer.from(novoConteudo).toString("base64");
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Adiciona profissional via admin Kiri",
        content: encoded,
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao commitar: ${err}`);
  }
  return res.json();
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN não configurado" }, { status: 500 });
  }

  const novoProfissional = (await request.json()) as Profissional;

  // Busca arquivo atual
  const arquivo = await getArquivoAtual(token);
  const conteudoAtual = JSON.parse(
    Buffer.from(arquivo.content, "base64").toString("utf-8")
  ) as { profissionais: Profissional[] };

  // Gera próximo ID
  const ids = conteudoAtual.profissionais
    .map((p) => parseInt(p.id.replace("kiri-", "")))
    .filter((n) => !isNaN(n));
  const proximoNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  novoProfissional.id = `kiri-${String(proximoNum).padStart(3, "0")}`;
  novoProfissional.verificado = true;
  if (!novoProfissional.card_token) {
    novoProfissional.card_token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }

  // Adiciona e serializa
  conteudoAtual.profissionais.push(novoProfissional);
  const novoConteudo = JSON.stringify(conteudoAtual, null, 2);

  await commitProfissional(token, novoConteudo, arquivo.sha);

  return NextResponse.json({ ok: true, id: novoProfissional.id });
}
