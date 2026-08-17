import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

const profissionais = data.profissionais as Profissional[];

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function parseObs(obs: string | null, chave: string): string {
  if (!obs) return "";
  const m = obs.match(new RegExp(`${chave}: ([^—]+)`));
  return m ? m[1].trim() : "";
}

function parsePagamento(obs: string | null): string {
  if (!obs) return "";
  const conv = obs.match(/Convênio: ([^—(]+)/)?.[1].trim();
  if (conv) return `Convênio — ${conv}`;
  const pag = obs.match(/Pagamento: ([^—]+)/)?.[1].trim();
  return pag ?? "";
}

type Encaminhamento = {
  id: string;
  criado_em: string;
  nome_responsavel: string;
  contato: string;
  cidade: string | null;
  modalidade: string | null;
  profissional_solicitado: string | null;
  observacoes: string | null;
  status: string | null;
};

type Followup = {
  encaminhamento_id: string;
  concluido_em: string | null;
  agendou: boolean | null;
  desfecho: string | null;
};

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) {
    return new Response("Não autorizado", { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return new Response("Configuração incompleta", { status: 500 });
  }

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

  const [encRes, fupRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/encaminhamentos?order=criado_em.desc&limit=500&select=id,criado_em,nome_responsavel,contato,cidade,modalidade,profissional_solicitado,observacoes,status`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/followups?select=encaminhamento_id,concluido_em,agendou,desfecho&limit=500`, { headers }),
  ]);

  const encaminhamentos: Encaminhamento[] = encRes.ok ? await encRes.json() : [];
  const followups: Followup[] = fupRes.ok ? await fupRes.json() : [];

  const fupMap = new Map<string, Followup>();
  for (const f of followups) fupMap.set(f.encaminhamento_id, f);

  const COLS = [
    "Nome familiar",
    "Canal",
    "Cidade",
    "Modalidade",
    "Pagamento",
    "Tipo de profissional buscado",
    "Profissional indicado",
    "Data do pedido",
    "Status",
    "Data encerramento follow-up",
    "Converteu?",
    "Motivo / Anotação",
  ];

  const rows = encaminhamentos.map((e) => {
    const fup = fupMap.get(e.id);
    const prof = profissionais.find((p) => p.id === e.profissional_solicitado);
    const canal = e.contato?.includes("@") ? "E-mail" : "WhatsApp";
    const profIndicado = prof ? prof.nome : (e.profissional_solicitado ? e.profissional_solicitado : "Curadoria geral");
    const converteu = fup?.agendou === true ? "Sim" : fup?.agendou === false ? "Não" : "";
    const dataEncerramento = fup?.concluido_em ? new Date(fup.concluido_em).toLocaleDateString("pt-BR") : "";
    const tipoProfissional = parseObs(e.observacoes, "Profissional");
    const pagamento = parsePagamento(e.observacoes);

    return [
      e.nome_responsavel,
      canal,
      e.cidade ?? "",
      e.modalidade ?? "",
      pagamento,
      tipoProfissional,
      profIndicado,
      new Date(e.criado_em).toLocaleDateString("pt-BR"),
      e.status ?? "pendente",
      dataEncerramento,
      converteu,
      fup?.desfecho ?? "",
    ].map(esc).join(",");
  });

  const csv = "﻿" + [COLS.map(esc).join(","), ...rows].join("\r\n");
  const now = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kiri-encaminhamentos-${now}.csv"`,
    },
  });
}
