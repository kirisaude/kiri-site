"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "kiri_welcome_seen";

export function WelcomeModal() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setVisivel(true);
    }
  }, []);

  function fechar() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(44, 39, 34, 0.55)" }}
    >
      <div className="bg-creme rounded-[20px] max-w-[440px] w-full px-7 py-8 shadow-xl">
        <div className="mb-5">
          <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: "#BE6E4E", letterSpacing: "0.01em" }}>
            Kiri
          </span>
        </div>

        <h2 className="text-[20px] font-semibold text-carvao leading-snug mb-3">
          Bem-vindo à Kiri ♡
        </h2>

        <p className="text-[14.5px] text-cinza-texto leading-[1.65] mb-3">
          A Kiri é uma plataforma de conexão entre famílias e especialistas em neurodesenvolvimento infantil.
        </p>

        <p className="text-[14.5px] text-cinza-texto leading-[1.65] mb-4">
          Aqui você encontra profissionais verificados — fonoaudiólogos, psicólogos, terapeutas ocupacionais, neuropediatras e outros — para orientar o cuidado do seu filho.
        </p>

        <div className="bg-ferrugem/8 border border-ferrugem/20 rounded-[12px] px-4 py-3.5 mb-5">
          <p className="text-[14px] text-carvao leading-[1.65]">
            <strong className="font-semibold">A Kiri não realiza atendimentos.</strong> Somos uma rede de indicação: você encontra o profissional certo, entra em contato diretamente e agenda com ele.
          </p>
        </div>

        <button
          onClick={fechar}
          className="w-full bg-ardosia-escura text-white rounded-[12px] pt-3 pb-4 cursor-pointer hover:opacity-90 transition-opacity flex flex-col items-center gap-0.5"
        >
          <span style={{ fontFamily: "Georgia, serif" }} className="text-[12px] font-normal opacity-75 italic">
            Esperamos que encontre o profissional ideal para a sua família.
          </span>
          <span className="font-semibold text-[15px]">Começar a explorar →</span>
        </button>
      </div>
    </div>
  );
}
