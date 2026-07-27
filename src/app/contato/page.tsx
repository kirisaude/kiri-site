"use client";

import { useState } from "react";
import { NavBack } from "@/components/NavBack";
import { Footer } from "@/components/Footer";

export default function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem }),
      });

      if (res.ok) {
        setEnviado(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data.erro ?? "Ocorreu um erro. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const inputClass = "border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted w-full";

  if (enviado) {
    return (
      <div className="min-h-screen bg-creme flex flex-col">
        <div className="w-full px-4 pt-4 pb-2 flex items-center">
          <NavBack />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#E6F4EE] flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11.5L8.5 16L18 7" stroke="#1A7A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-serif text-[22px] font-semibold text-carvao mb-2">Mensagem enviada</h1>
          <p className="text-[15px] text-cinza-texto leading-[1.65] max-w-sm">
            Obrigada pelo contato. Retornaremos em breve.
          </p>
        </div>
        <div className="px-[18px] mb-8">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme flex flex-col">
      <div className="w-full px-4 pt-4 pb-2 flex items-center">
        <NavBack />
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-[18px] py-8 flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-[26px] font-semibold text-carvao mb-1.5">Fale conosco</h1>
          <p className="text-[15px] text-cinza-texto leading-[1.65]">
            Dúvidas, sugestões ou qualquer assunto — estamos aqui.
          </p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-carvao">Nome <span className="text-ferrugem">*</span></label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Seu nome"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-carvao">
              E-mail <span className="text-[13px] font-normal text-muted">(opcional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Para recebermos retorno"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-carvao">Mensagem <span className="text-ferrugem">*</span></label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              required
              rows={5}
              placeholder="Como podemos ajudar?"
              className="border border-linha rounded-[12px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted w-full resize-none"
            />
          </div>

          {erro && (
            <p className="text-[13.5px] text-ferrugem">{erro}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="bg-ardosia-escura text-white text-[15px] font-semibold rounded-[13px] py-[14px] cursor-pointer disabled:opacity-50 transition-opacity"
          >
            {enviando ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
      </div>

      <div className="px-[18px] mb-8">
        <Footer />
      </div>
    </div>
  );
}
