import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

  // Cabeçalho
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

  // Corpo
  drawWrapped(
    "Ao integrar a Rede Kiri — Rede de Cuidado ao Neurodesenvolvimento Infantil, o profissional identificado acima concorda com as premissas abaixo:",
    fontReg, 11
  );
  gap(10);

  const secoes = [
    {
      titulo: "1. Objeto e Propósito",
      texto: "Ao integrar a Rede Kiri, o profissional passa a compor uma rede de indicação de especialistas em neurodesenvolvimento infantil, cujos dados serão exibidos publicamente na plataforma para facilitar o acesso das famílias a atendimento especializado. A Kiri reserva-se o direito de desligar da rede profissionais cujas condutas sejam incompatíveis com a ética profissional ou que comprometam a confiança das famílias.",
    },
    {
      titulo: "2. Uso e Exposição de Dados — LGPD",
      texto: "O profissional autoriza a Kiri a exibir publicamente os dados profissionais fornecidos (nome, registro, especialidade, áreas de atuação, descrição clínica e foto). O profissional pode solicitar alteração ou exclusão a qualquer momento pelo e-mail contato@kirisaude.com.br.",
    },
    {
      titulo: "3. Integração e Encaminhamentos",
      texto: "O profissional autoriza o compartilhamento do seu contato direto (e-mail ou WhatsApp profissional) com os demais membros da rede, exclusivamente para fins de encaminhamentos internos entre profissionais.",
    },
    {
      titulo: "4. Condições de Participação",
      texto: "A participação na Rede Kiri é gratuita. Qualquer alteração nas condições de participação será comunicada com antecedência mínima de 30 dias. O profissional poderá solicitar o encerramento da sua participação a qualquer momento, mediante comunicação por escrito.",
    },
    {
      titulo: "5. Declaração de Consentimento",
      texto: "Ao assinar este documento digitalmente, o profissional declara ter lido, compreendido e concordado integralmente com os Termos de Uso e a Política de Privacidade da plataforma Kiri, dando seu consentimento livre, informado e inequívoco para o tratamento dos dados fornecidos, nos termos da Lei Geral de Proteção de Dados (Lei n.o 13.709/2018 — LGPD).",
    },
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
  return result.data?.createDocument;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ erro: "Configuração incompleta" }, { status: 500 });
  }

  const body = await request.json();
  const {
    nome, email, genero, profissao, profissao_secundaria,
    registro_conselho, registro_conselho_secundario, rqe, tempo_atuacao,
    areas_atuacao, faixa_etaria, modalidade, cidade, bairro,
    valor_medio, aceita_convenio, convenios_nomes,
    graduacao, pos_graduacao, lattes,
    apresentacao, site_perfil, como_conheceu, whatsapp_agendamento,
    grupo_whatsapp, experiencia_infantil, consentimento,
  } = body;

  if (!nome || !profissao || !registro_conselho || consentimento !== true) {
    return NextResponse.json({ erro: "Dados obrigatórios ausentes ou sem consentimento" }, { status: 400 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/inscricoes_profissionais`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      nome,
      email: email || null,
      genero: genero || null,
      profissao,
      profissao_secundaria: profissao_secundaria || null,
      registro_conselho,
      registro_conselho_secundario: registro_conselho_secundario || null,
      rqe: rqe || null,
      tempo_atuacao: tempo_atuacao || null,
      areas_atuacao: areas_atuacao || null,
      faixa_etaria: faixa_etaria || null,
      modalidade: modalidade || null,
      cidade: cidade || null,
      bairro: bairro || null,
      valor_medio: valor_medio || null,
      aceita_convenio: aceita_convenio ?? null,
      convenios_nomes: convenios_nomes || null,
      graduacao: graduacao || null,
      pos_graduacao: pos_graduacao || null,
      lattes: lattes || null,
      apresentacao: apresentacao || null,
      site_perfil: site_perfil || null,
      como_conheceu: como_conheceu || null,
      whatsapp_agendamento: whatsapp_agendamento || null,
      experiencia_infantil: experiencia_infantil || null,
      grupo_whatsapp: grupo_whatsapp ?? false,
      consentimento: true,
      status: "pendente",
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase inscricao:", res.status, erro);
    return NextResponse.json({ erro: `Falha ao registrar inscrição (${res.status}): ${erro}` }, { status: 500 });
  }

  const [inscricao] = await res.json() as Array<{ id: string }>;
  const inscricaoId = inscricao?.id;

  // Google Sheets
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (sheetsUrl) {
    const agoraDate = new Date();
    const data = agoraDate.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const horario = agoraDate.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
    fetch(sheetsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, horario, nome, email: email || "", profissao, cidade: cidade || "", modalidade: modalidade || "", whatsapp: whatsapp_agendamento || "" }),
    }).catch(() => {});
  }

  // Autentique — gera PDF do termo e envia para assinatura digital; salva o document_id de volta no Supabase
  const autentiqueToken = process.env.AUTENTIQUE_API_TOKEN;
  if (autentiqueToken && email && inscricaoId) {
    gerarTermoPDF(nome, profissao)
      .then((pdfBytes) => criarDocumentoAutentique(autentiqueToken, pdfBytes, nome, email))
      .then((doc) => {
        if (!doc?.id) return;
        return fetch(`${supabaseUrl}/rest/v1/inscricoes_profissionais?id=eq.${inscricaoId}`, {
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
      })
      .catch((err) => console.error("Erro Autentique:", err));
  }

  // E-mail automático com link de documentação
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && email) {
    const resend = new Resend(resendKey);
    const primeiroNome = nome.split(" ")[0];
    resend.emails.send({
      from: "Kiri <contato@kirisaude.com.br>",
      to: email,
      subject: "Kiri — Envie sua documentação para concluir o cadastro",
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #2C2722; background: #F5EFE6;">
          <div style="margin-bottom: 28px;">
            <span style="font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #BE6E4E; letter-spacing: 0.01em;">Kiri</span>
          </div>
          <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 12px 0; color: #2C2722;">Olá, ${primeiroNome}!</h1>
          <p style="font-size: 15px; line-height: 1.65; margin: 0 0 16px 0; color: #4A4038;">
            Recebemos sua inscrição na rede Kiri. Para concluir o processo, precisamos que você envie sua documentação pelo link abaixo.
          </p>
          <div style="margin: 24px 0;">
            <a href="https://forms.gle/p4dptue63CP5Gt5Y8"
               style="display: inline-block; background: #44606C; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 10px;">
              Enviar documentação →
            </a>
          </div>
          <p style="font-size: 13px; line-height: 1.6; color: #6E6055; margin: 0 0 8px 0;"><strong>O que enviar:</strong></p>
          <ul style="font-size: 13px; line-height: 1.8; color: #6E6055; margin: 0 0 24px 0; padding-left: 18px;">
            <li>Foto profissional (fundo neutro, rosto nítido, preferencialmente 1:1)</li>
            <li>Certidão de regularidade no conselho da sua profissão (atualizada)</li>
            <li>Diploma de graduação</li>
            <li>Certificados de especialização, residência, mestrado ou doutorado (se houver)</li>
          </ul>
          <p style="font-size: 13px; color: #9A8C78; margin: 0;">
            Este é um e-mail automático. Para dúvidas, fale pelo <a href="https://wa.me/5511993197202" style="color: #44606C;">WhatsApp da Kiri</a>.
          </p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
