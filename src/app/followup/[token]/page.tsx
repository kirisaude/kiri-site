"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Followup {
  id: string;
  token: string;
  profissional_nome: string | null;
  responsavel_nome: string | null;
  concluido_em: string | null;
}

type Etapa = 1 | 2 | 3 | "nao-contato" | "nao-agendou" | "obrigada";

function Estrelas({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-12 h-12 rounded-full text-[20px] border-2 transition-all cursor-pointer font-semibold ${
            value >= n
              ? "bg-ferrugem border-ferrugem text-white"
              : "bg-white border-linha text-muted hover:border-ferrugem"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function FollowupPage() {
  const { token } = useParams<{ token: string }>();
  const [followup, setFollowup] = useState<Followup | null>(null);
  const [erro, setErro] = useState("");
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [enviando, setEnviando] = useState(false);

  // Etapa nao-contato
  const [motivoNaoContato, setMotivoNaoContato] = useState("");
  const [querNovoNaoContato, setQuerNovoNaoContato] = useState(false);

  // Etapa nao-agendou
  const [motivoNaoAgendou, setMotivoNaoAgendou] = useState("");
  const [querNovoNaoAgendou, setQuerNovoNaoAgendou] = useState(false);

  // Etapa 3 NPS
  const [npsProfissional, setNpsProfissional] = useState(0);
  const [npsPlataforma, setNpsPlataforma] = useState(0);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    fetch(`/api/followup/responder?token=${token}`)
      .then(r => r.json())
      .then((d: Followup & { error?: string }) => {
        if (d.error) { setErro("Link inválido ou expirado."); return; }
        setFollowup(d);
        if (d.concluido_em) setEtapa("obrigada");
      })
      .catch(() => setErro("Erro ao carregar. Tente novamente."));
  }, [token]);

  async function enviar(dados: Record<string, unknown>, proximaEtapa: Etapa) {
    setEnviando(true);
    try {
      await fetch("/api/followup/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...dados }),
      });
      setEtapa(proximaEtapa);
    } catch {
      setErro("Erro ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const profNome = followup?.profissional_nome ?? "o profissional";
  const primeiroProfNome = profNome.split(" ")[0];

  if (erro) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="text-[22px] font-serif font-medium text-carvao mb-2">Ops</div>
          <p className="text-[15px] text-cinza-texto">{erro}</p>
        </div>
      </div>
    );
  }

  if (!followup) {
    return (
      <div className="min-h-screen bg-creme flex items-center justify-center">
        <p className="text-[14px] text-muted">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme px-5 py-10 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="font-serif text-[22px] font-semibold text-ferrugem mb-8">Kiri</div>

        {etapa === "obrigada" && (
          <div className="bg-white border border-linha rounded-[16px] px-6 py-8 text-center">
            <div className="text-[40px] mb-4">🌱</div>
            <h1 className="font-serif text-[20px] font-semibold text-carvao mb-3">Obrigada pelo feedback!</h1>
            <p className="text-[15px] text-cinza-texto leading-[1.65]">
              Sua resposta nos ajuda a melhorar o cuidado oferecido pela Kiri.
            </p>
          </div>
        )}

        {etapa === 1 && (
          <div className="bg-white border border-linha rounded-[16px] px-6 py-7">
            <div className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-4">Passo 1 de 3</div>
            <h1 className="font-serif text-[20px] font-semibold text-carvao mb-6 leading-snug">
              Você entrou em contato com {primeiroProfNome}?
            </h1>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => { enviar({ contatou: true }, 2); }}
                className="w-full py-4 rounded-[12px] bg-ardosia text-white font-semibold text-[15px] cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: "#44606C" }}
              >
                Sim, entrei em contato
              </button>
              <button
                type="button"
                onClick={() => setEtapa("nao-contato")}
                className="w-full py-4 rounded-[12px] border border-linha text-cinza-texto font-semibold text-[15px] cursor-pointer hover:bg-[#F5EFE6] transition-colors"
              >
                Ainda não / Não consegui
              </button>
            </div>
          </div>
        )}

        {etapa === "nao-contato" && (
          <div className="bg-white border border-linha rounded-[16px] px-6 py-7">
            <h1 className="font-serif text-[20px] font-semibold text-carvao mb-2 leading-snug">
              O que aconteceu?
            </h1>
            <p className="text-[14px] text-muted mb-5">Opcional — nos ajuda a entender como melhorar.</p>
            <textarea
              value={motivoNaoContato}
              onChange={e => setMotivoNaoContato(e.target.value)}
              rows={4}
              placeholder="Ex: não recebi resposta, tentei mas não consegui horário…"
              className="w-full border border-linha rounded-[10px] px-4 py-3 text-[14px] text-carvao placeholder:text-muted outline-none focus:border-ardosia resize-none mb-4"
            />
            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={querNovoNaoContato}
                onChange={e => setQuerNovoNaoContato(e.target.checked)}
                className="w-5 h-5 accent-ardosia cursor-pointer"
              />
              <span className="text-[14px] text-carvao">Gostaria que a Kiri me ajudasse a encontrar outro profissional</span>
            </label>
            <button
              type="button"
              disabled={enviando}
              onClick={() => enviar({ contatou: false, motivo_nao_contato: motivoNaoContato || null, quer_novo_encaminhamento: querNovoNaoContato }, "obrigada")}
              className="w-full py-4 rounded-[12px] bg-ferrugem text-white font-semibold text-[15px] cursor-pointer disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Enviar resposta"}
            </button>
          </div>
        )}

        {etapa === 2 && (
          <div className="bg-white border border-linha rounded-[16px] px-6 py-7">
            <div className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-4">Passo 2 de 3</div>
            <h1 className="font-serif text-[20px] font-semibold text-carvao mb-6 leading-snug">
              Conseguiu agendar uma consulta com {primeiroProfNome}?
            </h1>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setEtapa(3)}
                className="w-full py-4 rounded-[12px] font-semibold text-[15px] cursor-pointer hover:opacity-90 transition-opacity text-white"
                style={{ background: "#44606C" }}
              >
                Sim, agendei!
              </button>
              <button
                type="button"
                onClick={() => setEtapa("nao-agendou")}
                className="w-full py-4 rounded-[12px] border border-linha text-cinza-texto font-semibold text-[15px] cursor-pointer hover:bg-[#F5EFE6] transition-colors"
              >
                Não consegui agendar
              </button>
            </div>
          </div>
        )}

        {etapa === "nao-agendou" && (
          <div className="bg-white border border-linha rounded-[16px] px-6 py-7">
            <h1 className="font-serif text-[20px] font-semibold text-carvao mb-2 leading-snug">
              O que aconteceu?
            </h1>
            <p className="text-[14px] text-muted mb-5">Opcional — nos ajuda a entender como melhorar.</p>
            <textarea
              value={motivoNaoAgendou}
              onChange={e => setMotivoNaoAgendou(e.target.value)}
              rows={4}
              placeholder="Ex: valor fora do orçamento, sem horário disponível…"
              className="w-full border border-linha rounded-[10px] px-4 py-3 text-[14px] text-carvao placeholder:text-muted outline-none focus:border-ardosia resize-none mb-4"
            />
            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={querNovoNaoAgendou}
                onChange={e => setQuerNovoNaoAgendou(e.target.checked)}
                className="w-5 h-5 accent-ardosia cursor-pointer"
              />
              <span className="text-[14px] text-carvao">Quero indicação de outro profissional</span>
            </label>
            <button
              type="button"
              disabled={enviando}
              onClick={() => enviar({ agendou: false, motivo_nao_agendamento: motivoNaoAgendou || null, quer_novo_encaminhamento: querNovoNaoAgendou }, "obrigada")}
              className="w-full py-4 rounded-[12px] bg-ferrugem text-white font-semibold text-[15px] cursor-pointer disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Enviar resposta"}
            </button>
          </div>
        )}

        {etapa === 3 && (
          <div className="bg-white border border-linha rounded-[16px] px-6 py-7">
            <div className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-4">Passo 3 de 3</div>
            <h1 className="font-serif text-[20px] font-semibold text-carvao mb-7 leading-snug">
              Sua experiência
            </h1>

            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-carvao mb-3">
                Como foi a experiência com {primeiroProfNome}?
              </label>
              <Estrelas value={npsProfissional} onChange={setNpsProfissional} />
              <div className="flex justify-between mt-1 text-[11px] text-muted">
                <span>Ruim</span><span>Excelente</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-carvao mb-3">
                Como avalia a Kiri como plataforma?
              </label>
              <Estrelas value={npsPlataforma} onChange={setNpsPlataforma} />
              <div className="flex justify-between mt-1 text-[11px] text-muted">
                <span>Ruim</span><span>Excelente</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-carvao mb-2">
                Comentário <span className="font-normal text-muted">(opcional)</span>
              </label>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                rows={3}
                placeholder="Conte mais sobre sua experiência…"
                className="w-full border border-linha rounded-[10px] px-4 py-3 text-[14px] text-carvao placeholder:text-muted outline-none focus:border-ardosia resize-none"
              />
            </div>

            <button
              type="button"
              disabled={enviando || npsProfissional === 0 || npsPlataforma === 0}
              onClick={() => enviar({ agendou: true, nps_profissional: npsProfissional, nps_plataforma: npsPlataforma, comentario: comentario || null }, "obrigada")}
              className="w-full py-4 rounded-[12px] bg-ferrugem text-white font-semibold text-[15px] cursor-pointer disabled:opacity-40"
            >
              {enviando ? "Enviando…" : "Enviar avaliação"}
            </button>
            {(npsProfissional === 0 || npsPlataforma === 0) && (
              <p className="text-[12px] text-muted text-center mt-2">Selecione uma nota para cada item</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
