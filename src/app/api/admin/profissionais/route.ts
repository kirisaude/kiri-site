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
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Erro ao buscar arquivo do GitHub");
  return res.json();
}

export async function PATCH(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN não configurado" }, { status: 500 });
  }

  const atualizacao = (await request.json()) as Profissional;
  if (!atualizacao.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const arquivo = await getArquivoAtual(token);
  const dados = JSON.parse(
    Buffer.from(arquivo.content, "base64").toString("utf-8")
  ) as { profissionais: Profissional[] };

  const idx = dados.profissionais.findIndex((p) => p.id === atualizacao.id);
  if (idx === -1) return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });

  const cardToken = dados.profissionais[idx].card_token || crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  dados.profissionais[idx] = { ...dados.profissionais[idx], ...atualizacao, card_token: cardToken };

  const novoConteudo = JSON.stringify(dados, null, 2);
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
        message: `Edita profissional ${atualizacao.id} via admin Kiri`,
        content: encoded,
        sha: arquivo.sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Erro ao commitar: ${err}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN não configurado" }, { status: 500 });
  }

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const arquivo = await getArquivoAtual(token);
  const dados = JSON.parse(
    Buffer.from(arquivo.content, "base64").toString("utf-8")
  ) as { profissionais: Profissional[] };

  const antes = dados.profissionais.length;
  dados.profissionais = dados.profissionais.filter((p) => p.id !== id);

  if (dados.profissionais.length === antes) {
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }

  const novoConteudo = JSON.stringify(dados, null, 2);
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
        message: `Remove profissional ${id} via admin Kiri`,
        content: encoded,
        sha: arquivo.sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Erro ao commitar: ${err}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
