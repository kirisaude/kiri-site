"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";

export default function ProEntrarPage() {
  const searchParams = useSearchParams();
  const erro = searchParams.get("erro");

  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroLocal, setErroLocal] = useState("");

  useEffect(() => {
    // Se já tem cookie de sessão individual, redireciona para o dashboard
    fetch("/api/pro/encaminhamentos", { credentials: "include" }).then((r) => {
      if (r.ok || r.status !== 401) window.location.href = "/pro/dashboard";
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEnviando(true);
    setErroLocal("");

    const res = await fetch("/api/pro/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (res.ok) {
      setEnviado(true);
    } else {
      setErroLocal("Erro ao enviar. Tente novamente.");
    }
    setEnviando(false);
  }

  const msgErro =
    erro === "link_invalido" ? "Link inválido. Solicite um novo acesso abaixo." :
    erro === "link_expirado" ? "Link expirado. Solicite um novo acesso abaixo." :
    null;

  return (
    <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-[340px]">
        <div className="flex flex-col items-center gap-2">
          <KiriLogoCompact height={36} />
          <p className="text-[13px] text-muted text-center leading-[1.5]">
            Painel exclusivo para profissionais da rede
          </p>
        </div>

        {!enviado ? (
          <>
            {(msgErro || erroLocal) && (
              <div className="w-full bg-[#FCF0EB] border border-[#E8C4B0] rounded-[10px] px-4 py-3">
                <p className="text-[13px] text-ferrugem">{msgErro ?? erroLocal}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <div>
                <label className="block text-[12.5px] font-medium text-carvao mb-1.5">
                  E-mail cadastrado na Kiri
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com.br"
                  autoFocus
                  required
                  className="w-full border border-linha rounded-[11px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
                />
              </div>
              <button
                type="submit"
                disabled={enviando || !email.trim()}
                className="w-full bg-ardosia-escura text-white font-semibold text-[14px] rounded-[11px] py-[13px] cursor-pointer disabled:opacity-50 transition-opacity"
              >
                {enviando ? "Enviando…" : "Receber link de acesso"}
              </button>
            </form>
            <p className="text-[12px] text-muted text-center leading-[1.55]">
              Enviaremos um link para o e-mail que você usou ao se cadastrar na rede Kiri.
              O link é válido por 1 hora.
            </p>
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#2D7A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-carvao mb-1">Link enviado!</p>
              <p className="text-[13px] text-muted leading-[1.6]">
                Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para acessar seu painel.
              </p>
            </div>
            <button
              onClick={() => { setEnviado(false); setEmail(""); }}
              className="text-[13px] text-ardosia hover:underline cursor-pointer"
            >
              Usar outro e-mail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
