"use client";

import { useEffect, useState } from "react";
import { KiriLogoFull } from "@/components/KiriLogoFull";

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
      <div className="bg-creme rounded-[20px] max-w-[440px] w-full px-9 py-8 shadow-xl relative">

        {/* X fechar */}
        <button
          onClick={fechar}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-cinza-texto2 hover:text-carvao hover:bg-areia/40 rounded-full transition-colors cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <KiriLogoFull height={40} />
        </div>

        {/* Título */}
        <h2
          className="text-[27px] text-carvao text-center leading-snug mb-4"
          style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontWeight: 500 }}
        >
          Bem-vindo à Kiri
        </h2>

        {/* Parágrafos */}
        <p className="text-[15px] text-cinza-texto leading-[1.6] text-center mb-2.5">
          A Kiri é uma plataforma de conexão entre famílias e especialistas em neurodesenvolvimento infantil.
        </p>

        <p className="text-[15px] text-cinza-texto leading-[1.6] text-center mb-4">
          Aqui você encontra profissionais verificados para orientar o cuidado do seu filho: fonoaudiólogos, psicólogos, terapeutas ocupacionais, neuropediatras e outros.
        </p>

        {/* Caixa de aviso */}
        <div
          className="rounded-[10px] px-4 py-3 mb-5"
          style={{ background: "#F4E7D5", border: "1px solid #D8C7B0" }}
        >
          <p className="text-[13.5px] text-carvao leading-[1.65]">
            <strong className="font-semibold">A Kiri não realiza atendimentos.</strong>{" "}
            Somos uma rede de indicação: você encontra o profissional certo, entra em contato diretamente e agenda com ele.
          </p>
        </div>

        {/* Frase solta acima do botão */}
        <p
          className="text-[14px] text-ardosia text-center mb-3"
          style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontStyle: "italic" }}
        >
          Esperamos que encontre o profissional ideal para a sua família.
        </p>

        {/* Botão ferrugem */}
        <button
          onClick={fechar}
          className="w-full bg-ferrugem text-creme font-semibold text-[15px] rounded-[12px] py-[15px] cursor-pointer hover:opacity-90 transition-opacity"
        >
          Começar a explorar →
        </button>

      </div>
    </div>
  );
}
