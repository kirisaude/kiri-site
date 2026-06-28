"use client";

import { useState, useEffect } from "react";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import type { Profissional } from "@/types";
import { PROFISSOES_ORDENADAS } from "@/types";

export default function ProPage() {
  const [authed, setAuthed] = useState(false);
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  useEffect(() => {
    fetch("/api/pro/directory").then((r) => {
      if (r.ok) {
        r.json().then((d) => { setAuthed(true); setProfissionais(d); });
      }
    });
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    const res = await fetch("/api/pro/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    if (res.ok) {
      const dir = await fetch("/api/pro/directory");
      if (dir.ok) {
        setProfissionais(await dir.json());
        setAuthed(true);
      }
    } else if (res.status === 429) {
      setErro("Muitas tentativas. Aguarde alguns minutos.");
    } else {
      setErro("Senha incorreta.");
    }
    setCarregando(false);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-creme flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 w-full max-w-[320px]">
          <div className="flex flex-col items-center gap-2">
            <KiriLogoCompact height={36} />
            <p className="text-[13px] text-muted text-center leading-[1.5]">
              Acesso exclusivo para profissionais da rede
            </p>
          </div>
          <form onSubmit={login} className="w-full flex flex-col gap-3">
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha da rede"
              autoFocus
              className="w-full border border-linha rounded-[11px] px-4 py-[13px] text-[15px] text-carvao bg-white outline-none focus:border-ardosia transition-colors placeholder:text-muted"
            />
            {erro && <p className="text-[13px] text-ferrugem text-center">{erro}</p>}
            <button
              type="submit"
              disabled={carregando || !senha}
              className="w-full bg-ardosia-escura text-white font-semibold text-[14px] rounded-[11px] py-[13px] cursor-pointer disabled:opacity-50"
            >
              {carregando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const agrupados = PROFISSOES_ORDENADAS.map((prof) => ({
    categoria: prof,
    membros: profissionais.filter((p) => p.profissao === prof),
  })).filter((g) => g.membros.length > 0);

  return (
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur-sm border-b border-linha px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <KiriLogoCompact height={28} />
        </div>
        <span className="text-[12px] text-muted ml-auto">{profissionais.length} profissionais</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-10">

        <div className="bg-[#F6E6CC] border border-ambar-borda rounded-[14px] px-4 py-3">
          <p className="text-[13px] text-ambar-texto leading-[1.6]">
            Esta área é exclusiva para profissionais verificados da rede Kiri. Os contatos aqui exibidos são para conexão direta entre colegas — troca de experiências, dúvidas e colaboração multiprofissional. Não compartilhe dados de pacientes por nenhum canal desta plataforma.
          </p>
        </div>

        {agrupados.map(({ categoria, membros }) => (
          <div key={categoria}>
            <h2 className="font-serif text-[18px] font-semibold text-carvao mb-3">{categoria}</h2>
            <div className="flex flex-col gap-3">
              {membros.map((p) => {
                const digits = (p.whatsapp_agendamento ?? "").replace(/\D/g, "");
                const numero = digits.startsWith("55") ? digits : `55${digits}`;
                const waUrl = digits.length >= 10
                  ? `https://wa.me/${numero}?text=${encodeURIComponent(`Olá, ${p.nome.split(" ")[0]}! Aqui é [seu nome], também faço parte da rede Kiri. Gostaria de me conectar com você.`)}`
                  : null;

                return (
                  <div key={p.id} className="bg-white border border-borda-azulada rounded-[14px] px-4 py-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-serif text-[16px] font-semibold text-carvao">{p.nome}</div>
                        <div className="text-[12.5px] text-muted mt-0.5">{p.cidade} · {p.modalidade}</div>
                      </div>
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center gap-1.5 bg-[#25D366] text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-[8px] no-underline"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </a>
                      )}
                    </div>

                    {p.areas_atuacao.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.areas_atuacao.slice(0, 4).map((area) => (
                          <span key={area} className="text-[11.5px] text-ardosia-escura bg-wash-azulado border border-borda-azulada px-2.5 py-1 rounded-[6px]">
                            {area}
                          </span>
                        ))}
                        {p.areas_atuacao.length > 4 && (
                          <span className="text-[11.5px] text-muted px-1">+{p.areas_atuacao.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1 border-t border-linha">
                      <span className="text-[12px] text-muted">{p.faixa_etaria}</span>
                      <a
                        href={`/profissional/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-ardosia font-medium ml-auto no-underline hover:underline"
                      >
                        Ver perfil público ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {profissionais.length === 0 && (
          <p className="text-[14px] text-muted text-center py-12">Nenhum profissional publicado ainda.</p>
        )}
      </div>
    </div>
  );
}
