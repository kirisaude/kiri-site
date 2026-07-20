"use client";

import { useState } from "react";

export function SaveButton({ profissionalId: _ }: { profissionalId: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <button
      onClick={copiar}
      className={`mt-[18px] w-full font-semibold text-[14px] border rounded-[11px] py-3 cursor-pointer inline-flex items-center justify-center gap-[7px] transition-colors ${
        copiado
          ? "text-white bg-ardosia-escura border-ardosia-escura"
          : "text-cinza-texto bg-white border-linha hover:bg-areia"
      }`}
    >
      {copiado ? (
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <path d="M4 10.5 L8 14.5 L16 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="14.5" cy="5.5" r="2" stroke="#9A8C78" strokeWidth="1.4" />
          <circle cx="14.5" cy="14.5" r="2" stroke="#9A8C78" strokeWidth="1.4" />
          <circle cx="5.5" cy="10" r="2" stroke="#9A8C78" strokeWidth="1.4" />
          <line x1="7.4" y1="9" x2="12.6" y2="6.5" stroke="#9A8C78" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="7.4" y1="11" x2="12.6" y2="13.5" stroke="#9A8C78" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {copiado ? "Link copiado!" : "Compartilhar perfil"}
    </button>
  );
}
