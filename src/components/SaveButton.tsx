"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "kiri_salvos";

export function SaveButton({ profissionalId }: { profissionalId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    setSaved(list.includes(profissionalId));
  }, [profissionalId]);

  const toggle = () => {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    const updated = list.includes(profissionalId)
      ? list.filter((id) => id !== profissionalId)
      : [...list, profissionalId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(updated.includes(profissionalId));
  };

  return (
    <button
      onClick={toggle}
      className={`mt-[18px] w-full font-semibold text-[13px] border rounded-[11px] py-[11px] cursor-pointer inline-flex items-center justify-center gap-[7px] transition-colors ${
        saved
          ? "text-white bg-ardosia-escura border-ardosia"
          : "text-cinza-texto bg-white border-linha hover:bg-areia"
      }`}
    >
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M5 3 L15 3 C15.6 3 16 3.4 16 4 L16 17 L10 13 L4 17 L4 4 C4 3.4 4.4 3 5 3 Z"
          stroke={saved ? "white" : "#9A8C78"}
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={saved ? "white" : "none"}
        />
      </svg>
      {saved ? "Salvo" : "Salvar para depois"}
    </button>
  );
}
