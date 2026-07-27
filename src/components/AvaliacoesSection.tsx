"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Avaliacao {
  id: string;
  criado_em: string;
  nota: number;
  data_atendimento: string;
  texto: string | null;
}

function Estrelas({ nota, size = 14 }: { nota: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L14.9 8.6L22 9.3L16.8 14.1L18.4 21L12 17.4L5.6 21L7.2 14.1L2 9.3L9.1 8.6Z"
            fill={nota >= n ? "#E0A55E" : "none"}
            stroke={nota >= n ? "#E0A55E" : "#D8C7B0"}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

function formatarMesAno(ym: string) {
  if (!ym) return "";
  const [ano, mes] = ym.split("-");
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
}

export function AvaliacoesSection({ profissionalId }: { profissionalId: string }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch(`/api/avaliacoes?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((data) => setAvaliacoes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [profissionalId]);

  if (carregando) return null;

  const media = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ferrugem">Avaliações</div>
          {avaliacoes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Estrelas nota={Math.round(media)} size={12} />
              <span className="text-[12.5px] font-semibold text-carvao">{media.toFixed(1)}</span>
              <span className="text-[12px] text-muted">({avaliacoes.length})</span>
            </div>
          )}
        </div>
        <Link
          href={`/avaliar/${profissionalId}`}
          className="text-[12.5px] font-semibold text-ardosia no-underline hover:underline"
        >
          + Avaliar
        </Link>
      </div>

      {avaliacoes.length === 0 ? (
        <p className="text-[13.5px] text-muted">
          Nenhuma avaliação ainda.{" "}
          <Link href={`/avaliar/${profissionalId}`} className="text-ardosia no-underline hover:underline">
            Seja o primeiro a avaliar.
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {avaliacoes.map((a) => (
            <div key={a.id} className="bg-white border border-linha rounded-[13px] px-4 py-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Estrelas nota={a.nota} size={13} />
                <span className="text-[12px] text-muted">{formatarMesAno(a.data_atendimento)}</span>
              </div>
              {a.texto && (
                <p className="text-[13.5px] text-carvao-sutil leading-[1.6] m-0">{a.texto}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
