"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";

export default function AcessoPage() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(false);

    const res = await fetch("/api/acesso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setErro(true);
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-[340px]">
        <div className="flex items-center gap-3">
          <KiriLogoCompact height={38} />
        </div>

        <p className="text-[14px] text-cinza-texto text-center leading-[1.55]">
          Esta versão é restrita. Digite a senha para continuar.
        </p>

        <form onSubmit={entrar} className="w-full flex flex-col gap-3">
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha de acesso"
            autoFocus
            className="w-full border border-linha rounded-[11px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
          />
          {erro && (
            <p className="text-[13px] text-ferrugem text-center">
              Senha incorreta. Tente novamente.
            </p>
          )}
          <button
            type="submit"
            disabled={carregando || !senha}
            className="w-full bg-ardosia-escura text-white font-semibold text-[14px] rounded-[11px] py-[13px] cursor-pointer disabled:opacity-50 transition-opacity"
          >
            {carregando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
