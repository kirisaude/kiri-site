"use client";

import { useState } from "react";

interface Props {
  secoes: string[];
}

export function IndiceAccordion({ secoes }: Props) {
  const [aberto, setAberto] = useState(false);

  function irPara(id: string) {
    setAberto(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="lg:hidden mx-[22px] mt-4 border border-[#E2D6C0] rounded-[12px] overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white cursor-pointer"
      >
        <span className="text-[12px] font-semibold tracking-[0.07em] uppercase text-muted">Índice</span>
        <svg
          width="16" height="16" viewBox="0 0 20 20" fill="none"
          style={{ transition: "transform 0.2s", transform: aberto ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
        >
          <path d="M5 7.5 L10 12.5 L15 7.5" stroke="#9A8C78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {aberto && (
        <div className="border-t border-[#E2D6C0] bg-white flex flex-col divide-y divide-[#F0E8DC]">
          {secoes.map((titulo, i) => (
            <button
              key={i}
              onClick={() => irPara(`secao-${i + 1}`)}
              className="text-left px-4 py-[11px] text-[13px] leading-[1.45] text-cinza-texto cursor-pointer hover:bg-[#FAF6F0] transition-colors"
            >
              {titulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
