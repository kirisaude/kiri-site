import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { getDriveAccessToken, listDriveFiles, downloadDriveFile } from "@/lib/googleDrive";

const profissionais = data.profissionais as Profissional[];

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

const MIME_SUPORTADO = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_ARQUIVOS = 5;

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { profissional_id } = await request.json() as { profissional_id: string };
  if (!profissional_id) {
    return NextResponse.json({ error: "profissional_id obrigatório" }, { status: 400 });
  }

  const prof = profissionais.find((p) => p.id === profissional_id);
  if (!prof) {
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }
  if (!prof.pasta_drive) {
    return NextResponse.json({ error: "Profissional sem pasta Drive configurada" }, { status: 400 });
  }
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Drive não configurado" }, { status: 503 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API Claude não configurada" }, { status: 503 });
  }

  const accessToken = await getDriveAccessToken();
  const arquivos = await listDriveFiles(prof.pasta_drive, accessToken);
  const suportados = arquivos.filter((a) => MIME_SUPORTADO.has(a.mimeType)).slice(0, MAX_ARQUIVOS);

  if (suportados.length === 0) {
    return NextResponse.json({
      ok: true,
      resultado: "Nenhum documento (PDF, imagem) encontrado na pasta do profissional.",
      arquivos_analisados: 0,
    });
  }

  const conteudo: NonNullable<MessageParam["content"]> = [
    {
      type: "text",
      text: `Você é um assistente da plataforma Kiri, diretório de profissionais de saúde mental e desenvolvimento infantil.

Analise os documentos enviados pelo profissional abaixo e valide se estão corretos e suficientes para ativação do perfil.

**Profissional:** ${prof.nome}
**Profissão:** ${prof.profissao}
**Registro no conselho:** ${prof.registro_conselho ?? "não informado"}
${prof.rqe ? `**RQE:** ${prof.rqe}` : ""}

**Documentos esperados (conforme profissão):**
- Diploma ou certificado de graduação
- Registro ativo no conselho de classe (CRM, CRP, CRFa, CREFITO, CRN, etc.)
- Para médicos especialistas: título de especialista ou RQE
- Certidão de regularidade junto ao conselho (se disponível)

Para cada documento analise:
1. Tipo do documento identificado
2. Nome/dados do profissional batem com o cadastro?
3. Documento está vigente (não vencido)?
4. Registro no conselho bate com o cadastro?
5. Alguma inconsistência ou pendência?

Ao final, dê um parecer: **APROVADO**, **PENDENTE** (com lista do que falta) ou **REPROVADO** (com motivo).`,
    },
  ];

  let analisados = 0;
  for (const arq of suportados) {
    try {
      const buffer = await downloadDriveFile(arq.id, accessToken);
      if (buffer.byteLength > MAX_BYTES) continue;

      const base64 = Buffer.from(buffer).toString("base64");

      if (arq.mimeType === "application/pdf") {
        conteudo.push({
          type: "document",
          source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
          title: arq.name,
        });
      } else {
        const imgMime = arq.mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        conteudo.push({
          type: "image",
          source: { type: "base64" as const, media_type: imgMime, data: base64 },
        });
      }
      analisados++;
    } catch {
      // ignora arquivo com falha de download
    }
  }

  if (analisados === 0) {
    return NextResponse.json({
      ok: true,
      resultado: "Não foi possível baixar nenhum documento para análise.",
      arquivos_analisados: 0,
    });
  }

  conteudo.push({
    type: "text",
    text: "Analise os documentos acima e forneça o parecer detalhado.",
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: conteudo }],
  });

  const msg = await stream.finalMessage();

  const textos = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return NextResponse.json({
    ok: true,
    resultado: textos,
    arquivos_analisados: analisados,
    arquivos_disponiveis: suportados.map((a) => ({ nome: a.name, tipo: a.mimeType })),
  });
}
