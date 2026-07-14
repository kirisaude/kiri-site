import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

export async function POST(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }
  if (!sheetsUrl) {
    return NextResponse.json({ error: "Planilha não configurada" }, { status: 500 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/inscricoes_profissionais?order=criado_em.asc`,
    {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 502 });
  }

  const inscricoes = await res.json();

  const statusLabel: Record<string, string> = {
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    pendente: "Aguardando documentos",
  };

  let exportados = 0;
  for (const i of inscricoes) {
    const dt = new Date(i.criado_em);
    const data = dt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const horario = dt.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
    try {
      await fetch(sheetsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          horario,
          nome: i.nome || "",
          email: i.email || "",
          profissao: i.profissao || "",
          cidade: i.cidade || "",
          modalidade: i.modalidade || "",
          whatsapp: i.whatsapp_agendamento || "",
          status: statusLabel[i.status] ?? i.status,
        }),
      });
      exportados++;
    } catch {
      // continua para o próximo
    }
  }

  return NextResponse.json({ ok: true, exportados });
}
