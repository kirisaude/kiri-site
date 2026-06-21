import Link from "next/link";

export default function ConfirmacaoPage() {
  return (
    <div className="min-h-screen bg-creme flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 px-2">
        {/* Nav */}
        <div className="flex items-center justify-end px-4 pt-5">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-white border border-linha flex items-center justify-center no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M5 5 L15 15 M15 5 L5 15" stroke="#564F45" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center text-center px-[26px] pt-[18px]">
          {/* Emblema */}
          <div className="w-[84px] h-[84px] rounded-full bg-wash-azulado border border-borda-azulada flex items-center justify-center mt-3.5">
            <svg width="38" height="38" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="#44606C" strokeWidth="1.3" />
              <path d="M6.4 11.3 L9.4 14.3 L15.6 7.4" stroke="#44606C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="font-serif text-[26px] font-medium leading-[1.25] tracking-[-0.01em] text-carvao mt-6" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Recebemos suas informações. Obrigada pela confiança.
          </h1>

          <p className="mt-4 text-[14.5px] leading-[1.6] text-cinza-texto" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Agora uma pessoa da nossa equipe vai ler com atenção o que você contou e selecionar os profissionais mais adequados para o seu caso. Você recebe esse retorno por WhatsApp ou e-mail em até 3 dias úteis.
          </p>

          {/* Reforço */}
          <div className="mt-[22px] w-full bg-white border border-linha rounded-[14px] px-4 py-[15px] flex items-center gap-[11px] text-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 3 L20 6 L20 12 C20 17 16.4 20 12 21.5 C7.6 20 4 17 4 12 L4 6 Z" stroke="#BE6E4E" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M9 12 L11.2 14.2 L15.2 9.4" stroke="#BE6E4E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[13.5px] leading-[1.5] text-carvao-sutil">
              Cada caso é avaliado individualmente, com cuidado e sigilo.
            </span>
          </div>

          {/* Aviso */}
          <div className="mt-[18px] flex gap-[9px] items-start text-left px-0.5">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="10" cy="10" r="8.2" stroke="#9A8C78" strokeWidth="1.4" />
              <line x1="10" y1="9" x2="10" y2="14" stroke="#9A8C78" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="6.3" r="1.05" fill="#9A8C78" />
            </svg>
            <p className="text-[11.5px] leading-[1.5] text-muted m-0">
              Se for uma situação urgente ou de risco, procure um serviço de atendimento presencial imediato.
            </p>
          </div>
        </div>

        {/* Ação secundária */}
        <div className="px-[26px] pt-[18px] pb-8">
          <button className="w-full font-semibold text-[14.5px] text-cinza-texto bg-white border border-linha rounded-[13px] py-[14px] cursor-pointer inline-flex items-center justify-center gap-[9px]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="#9A8C78" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" stroke="#9A8C78" strokeWidth="1.5" />
              <circle cx="17" cy="7" r="1.1" fill="#9A8C78" />
            </svg>
            Acompanhar nosso conteúdo
          </button>
          <p className="mt-[11px] text-center text-[11.5px] text-muted">
            Conteúdo sobre neurodesenvolvimento infantil no Instagram.
          </p>
        </div>
      </div>
    </div>
  );
}
