import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

async function gerarTermoPDF(nome: string, profissao: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontReg = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 60;
  const contentWidth = pageWidth - 2 * margin;
  const cinza = rgb(0.17, 0.15, 0.13);
  const ferrugem = rgb(0.745, 0.431, 0.306);
  const muted = rgb(0.6, 0.57, 0.53);

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function addPage() {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  function drawWrapped(text: string, font: typeof fontReg, size: number, color = cinza, indent = 0) {
    const lineH = size * 1.55;
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > contentWidth - indent && line) {
        if (y < margin + lineH * 2) addPage();
        page.drawText(line, { x: margin + indent, y, size, font, color });
        y -= lineH;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      if (y < margin + lineH * 2) addPage();
      page.drawText(line, { x: margin + indent, y, size, font, color });
      y -= lineH;
    }
  }

  function gap(pts = 8) { y -= pts; }

  page.drawText("Kiri", { x: margin, y, size: 20, font: fontBold, color: ferrugem });
  y -= 28;
  drawWrapped("Termo de Adesão e Consentimento — Rede Kiri", fontBold, 14);
  gap(4);
  const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  drawWrapped(`Data: ${hoje}`, fontReg, 10, muted);
  drawWrapped(`Profissional: ${nome}`, fontReg, 10, muted);
  drawWrapped(`Área: ${profissao}`, fontReg, 10, muted);
  gap(12);
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.85, 0.82, 0.78) });
  gap(14);

  drawWrapped(
    "Ao integrar a Rede Kiri — Rede de Cuidado ao Neurodesenvolvimento Infantil, o profissional identificado acima concorda com as premissas abaixo:",
    fontReg, 11
  );
  gap(10);

  const secoes = [
    { titulo: "1. Objeto e Propósito", texto: "Ao integrar a Rede Kiri, o profissional passa a compor uma rede de indicação de especialistas em neurodesenvolvimento infantil, cujos dados serão exibidos publicamente na plataforma para facilitar o acesso das famílias a atendimento especializado. A Kiri reserva-se o direito de desligar da rede profissionais cujas condutas sejam incompatíveis com a ética profissional ou que comprometam a confiança das famílias." },
    { titulo: "2. Uso e Exposição de Dados — LGPD", texto: "O profissional autoriza a Kiri a exibir publicamente os dados profissionais fornecidos (nome, registro, especialidade, áreas de atuação, descrição clínica e foto). O profissional pode solicitar alteração ou exclusão a qualquer momento pelo e-mail contato@kirisaude.com.br." },
    { titulo: "3. Integração e Encaminhamentos", texto: "O profissional autoriza o compartilhamento do seu contato direto (e-mail ou WhatsApp profissional) com os demais membros da rede, exclusivamente para fins de encaminhamentos internos entre profissionais." },
    { titulo: "4. Condições de Participação", texto: "A participação na Rede Kiri é gratuita. Qualquer alteração nas condições de participação será comunicada com antecedência mínima de 30 dias. O profissional poderá solicitar o encerramento da sua participação a qualquer momento, mediante comunicação por escrito." },
    { titulo: "5. Declaração de Consentimento", texto: "Ao assinar este documento digitalmente, o profissional declara ter lido, compreendido e concordado integralmente com os Termos de Uso e a Política de Privacidade da plataforma Kiri, dando seu consentimento livre, informado e inequívoco para o tratamento dos dados fornecidos, nos termos da Lei Geral de Proteção de Dados (Lei n.o 13.709/2018 — LGPD)." },
  ];

  for (const s of secoes) {
    drawWrapped(s.titulo, fontBold, 11);
    gap(2);
    drawWrapped(s.texto, fontReg, 11);
    gap(12);
  }

  gap(8);
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.85, 0.82, 0.78) });
  gap(8);
  drawWrapped("Este documento foi gerado automaticamente pela plataforma Kiri — kirisaude.com.br", fontReg, 9, muted);

  return doc.save();
}

async function criarDocumentoAutentique(token: string, pdfBytes: Uint8Array, nome: string, email: string) {
  const query = `
    mutation CreateDocument($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) {
      createDocument(document: $document, signers: $signers, file: $file) {
        id
        name
      }
    }
  `;

  const operations = JSON.stringify({
    query,
    variables: {
      document: { name: `Termo de Adesão — ${nome}` },
      signers: [{ email, action: "SIGN" }],
      file: null,
    },
  });

  const formData = new FormData();
  formData.append("operations", operations);
  formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
  formData.append("0", new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }), "termo.pdf");

  const res = await fetch("https://api.autentique.com.br/v2/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await res.json();
  if (result.errors) throw new Error(result.errors[0]?.message ?? "Erro Autentique");
  return result.data?.createDocument as { id: string; name: string } | undefined;
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const autentiqueToken = process.env.AUTENTIQUE_API_TOKEN;

  if (!supabaseUrl || !supabaseKey || !autentiqueToken) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
  }

  const { inscricao_id } = await request.json() as { inscricao_id: string };
  if (!inscricao_id) {
    return NextResponse.json({ error: "inscricao_id obrigatório" }, { status: 400 });
  }

  // Busca nome e email da inscrição
  const inscRes = await fetch(
    `${supabaseUrl}/rest/v1/inscricoes_profissionais?id=eq.${inscricao_id}&select=nome,email,profissao`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );
  const [inscricao] = await inscRes.json() as Array<{ nome: string; email: string | null; profissao: string }>;

  if (!inscricao) return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 });
  if (!inscricao.email) return NextResponse.json({ error: "Profissional sem e-mail cadastrado" }, { status: 422 });

  const pdfBytes = await gerarTermoPDF(inscricao.nome, inscricao.profissao);
  const doc = await criarDocumentoAutentique(autentiqueToken, pdfBytes, inscricao.nome, inscricao.email);

  if (!doc?.id) {
    return NextResponse.json({ error: "Autentique não retornou ID do documento" }, { status: 500 });
  }

  // Salva document_id na inscrição
  await fetch(`${supabaseUrl}/rest/v1/inscricoes_profissionais?id=eq.${inscricao_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      autentique_document_id: doc.id,
      autentique_enviado_em: new Date().toISOString(),
    }),
  });

  return NextResponse.json({ ok: true, document_id: doc.id });
}
