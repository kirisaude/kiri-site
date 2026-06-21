import Link from "next/link";
import { KiriLogo } from "@/components/KiriLogo";
import { NavBack } from "@/components/NavBack";

export default function AvaliacaoPage() {
  return (
    <div className="min-h-screen bg-creme flex flex-col">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Avaliação do neurodesenvolvimento" />
      </div>

      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 px-2">
        {/* Conteúdo */}
        <div className="flex-1 px-[22px] pt-2 flex flex-col">
          {/* Emblema */}
          <div className="self-center w-[76px] h-[76px] rounded-full bg-wash-quente border border-borda-quente flex items-center justify-center mt-1.5">
            <KiriLogo size={38} />
          </div>

          <h1 className="font-serif text-[30px] md:text-[34px] font-medium leading-[1.22] tracking-[-0.01em] text-carvao text-center mt-5" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Você não precisa ter um diagnóstico para começar.
          </h1>

          <p className="mt-8 text-[16.5px] md:text-[17.5px] leading-[1.65] text-cinza-texto text-center" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Muitas famílias chegam aqui só com a sensação de que algo está diferente — no jeito de se comunicar, de se relacionar, de aprender ou de se desenvolver. Está tudo bem não ter um nome ainda. A gente ajuda você a encontrar o profissional certo para entender melhor.
          </p>

          {/* Como funciona */}
          <div className="mt-6 bg-white border border-linha rounded-[16px] px-4 py-[18px]">
            <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-muted mb-3.5">
              Como funciona
            </div>
            <div className="flex flex-col gap-0">
              {[
                { n: "1", titulo: "Você responde a algumas perguntas", desc: "Nos conte, em poucos passos, o que tem observado no comportamento da criança.", linha: true },
                { n: "2", titulo: "Nós direcionamos o seu caso", desc: "Apresentamos os profissionais especializados da nossa rede mais alinhados às suas necessidades.", linha: true },
                { n: "3", titulo: "Você escolhe com quem começar", desc: "Avalie os perfis verificados e agende a consulta diretamente com o especialista escolhido.", linha: false },
              ].map((passo) => (
                <div key={passo.n} className="flex gap-[13px] items-start">
                  <div className="flex flex-col items-center flex-none">
                    <div className="w-[30px] h-[30px] rounded-full bg-wash-quente border border-borda-quente flex items-center justify-center font-serif text-[15px] font-semibold text-ferrugem">
                      {passo.n}
                    </div>
                    {passo.linha && <div className="w-[1.5px] h-[28px] bg-borda-quente" />}
                  </div>
                  <div className="pt-[5px] pb-[14px]">
                    <div className="text-[16px] md:text-[17px] font-semibold text-carvao leading-[1.3]">{passo.titulo}</div>
                    <div className="text-[14px] md:text-[15px] leading-[1.55] text-cinza-texto mt-1">{passo.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso */}
          <div className="mt-4 flex gap-[9px] items-start px-0.5">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M10 2.5 L16.5 5.2 L16.5 10 C16.5 14 13.7 16.5 10 17.8 C6.3 16.5 3.5 14 3.5 10 L3.5 5.2 Z" stroke="#9A8C78" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M7.4 10 L9.2 11.8 L12.8 7.8" stroke="#9A8C78" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[13px] leading-[1.55] text-muted m-0">
              Esta é uma orientação para ajudar você a encontrar o caminho — não é uma avaliação nem um diagnóstico feito aqui. Suas informações são tratadas com sigilo.
            </p>
          </div>
        </div>

        {/* Termos */}
        <div className="px-[22px] pb-2 text-center">
          <a href="/termos" className="text-[12px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos de Uso</a>
        </div>

        {/* Botão fixo */}
        <div className="px-[22px] pt-3.5 pb-8 bg-gradient-to-t from-creme via-creme/90 to-transparent">
          <Link
            href="/formulario"
            className="block w-full text-center font-semibold text-[16px] text-white bg-ferrugem rounded-[13px] py-4 cursor-pointer shadow-[0_8px_20px_-10px_rgba(160,70,90,0.6)] no-underline"
          >
            Começar — leva poucos minutos
          </Link>
        </div>
      </div>
    </div>
  );
}
