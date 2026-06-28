import { notFound } from "next/navigation";
import { PlaceholderPhoto } from "@/components/PlaceholderPhoto";
import { KiriLogoCompact } from "@/components/KiriLogoCompact";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";
import { valorDisplay } from "@/types";

const profissionais = data.profissionais as Profissional[];

export function generateStaticParams() {
  return profissionais.map((p) => ({ token: p.card_token }));
}

function buildWaUrl(numero: string, nome: string): string {
  const limpo = numero.replace(/\D/g, "");
  const comPais = limpo.startsWith("55") ? limpo : `55${limpo}`;
  const msg = encodeURIComponent(
    `Olá, ${nome.split(" ")[0]}! Encontrei você pela Kiri e gostaria de agendar uma consulta.`
  );
  return `https://wa.me/${comPais}?text=${msg}`;
}

export default async function CardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = profissionais.find((pro) => pro.card_token === token);
  if (!p) notFound();

  const waUrl = p.whatsapp_agendamento ? buildWaUrl(p.whatsapp_agendamento, p.nome) : null;

  return (
    <div className="min-h-screen bg-creme flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-sm">

        {/* Header Kiri */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <KiriLogoCompact height={30} />
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-[20px] border border-linha shadow-[0_4px_24px_-8px_rgba(60,55,45,0.18)] overflow-hidden">

          {/* Cabeçalho do profissional */}
          <div className="flex flex-col items-center text-center px-6 pt-8 pb-6 border-b border-linha-sutil">
            <PlaceholderPhoto size={88} radius={20} />
            <h1 className="font-serif text-[22px] font-semibold text-carvao mt-4 leading-[1.2]">
              {p.nome}
            </h1>
            <p className="text-[14px] text-cinza-texto mt-1 leading-[1.35]">
              {p.titulo_exibicao}
            </p>
            <p className="text-[12px] text-muted mt-1">
              {p.registro_conselho}
            </p>
          </div>

          {/* Detalhes */}
          <div className="px-6 py-5 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <rect x="2.5" y="4" width="15" height="10" rx="1.6" stroke="#6E8893" strokeWidth="1.4" />
                <line x1="7" y1="17.2" x2="13" y2="17.2" stroke="#6E8893" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="text-[14px] text-carvao-sutil">{p.modalidade}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <path d="M10 18 C10 18 16 12 16 7.5 A6 6 0 1 0 4 7.5 C4 12 10 18 10 18 Z" stroke="#6E8893" strokeWidth="1.4" strokeLinejoin="round" />
                <circle cx="10" cy="7.6" r="2.1" stroke="#6E8893" strokeWidth="1.4" />
              </svg>
              <span className="text-[14px] text-carvao-sutil">{p.cidade}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="10" cy="6" r="3" stroke="#6E8893" strokeWidth="1.4" />
                <path d="M4.5 16 C4.5 12 15.5 12 15.5 16" stroke="#6E8893" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="text-[14px] text-carvao-sutil">{p.faixa_etaria}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                <rect x="2.5" y="5" width="15" height="10.5" rx="2" stroke="#6E8893" strokeWidth="1.3" />
                <path d="M2.8 8.2 L17.2 8.2" stroke="#6E8893" strokeWidth="1.3" />
                <circle cx="13.8" cy="11.6" r="1.1" fill="#6E8893" />
              </svg>
              <span className="text-[14px] text-carvao-sutil">Consulta particular · {valorDisplay(p)}</span>
            </div>

            {/* Áreas */}
            <div className="flex flex-wrap gap-[6px] mt-1">
              {p.areas_atuacao.map((area) => (
                <span key={area} className="text-[12px] font-semibold text-ardosia-escura bg-wash-azulado border border-borda-azulada px-[10px] py-[4px] rounded-[7px]">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* CTA WhatsApp */}
          <div className="px-5 pb-6">
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#22A85A] text-white font-semibold text-[16px] rounded-[14px] py-[16px] no-underline shadow-[0_6px_18px_-6px_rgba(34,168,90,0.45)]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 2.003C6.486 2.003 2 6.486 2 12c0 1.762.46 3.441 1.34 4.921L2 22l5.233-1.312A9.953 9.953 0 0012 22c5.514 0 10-4.483 10-9.997 0-2.669-1.037-5.178-2.921-7.064A9.944 9.944 0 0012 2.003z" />
                </svg>
                Falar no WhatsApp
              </a>
            ) : (
              <div className="text-center py-3">
                <p className="text-[13px] text-muted leading-[1.5]">
                  Contato não disponível ainda.<br />Fale com a equipe Kiri:{" "}
                  <a href="mailto:contato@kirisaude.com.br" className="underline text-cinza-texto">
                    contato@kirisaude.com.br
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-6 text-center">
          <p className="text-[12px] text-muted leading-[1.6]">
            Card enviado pela equipe Kiri<br />
            <a href="https://www.kirisaude.com.br" className="underline text-muted">
              kirisaude.com.br
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
