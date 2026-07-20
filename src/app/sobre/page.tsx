import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Sobre a Kiri" />
      </div>

      <div className="max-w-3xl mx-auto pb-10 w-full px-2">

        {/* Cabeçalho — alinhado à esquerda */}
        <div className="px-[26px] pt-8">
          <div className="flex items-center gap-3">
            <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M19 52 C31 37 43 37 52 50 C61 37 73 37 84 52" stroke="#BE6E4E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M38 88 C50 73 62 73 71 86 C80 73 92 73 104 88" stroke="#44606C" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="font-serif text-[40px] md:text-[44px] font-medium leading-[1.15] tracking-[-0.02em] text-carvao m-0">
              Sobre a Kiri
            </h1>
          </div>
        </div>

        <div className="px-[26px] pt-[28px] flex flex-col gap-8">

          <p className="font-serif text-[19px] md:text-[21px] leading-[1.55] font-normal text-carvao m-0">
            Para famílias com crianças em suspeita de TEA, TDAH ou atraso de desenvolvimento, encontrar o profissional certo costuma ser uma segunda jornada, tão desgastante quanto o diagnóstico em si.
          </p>

          <div className="flex flex-col gap-4">
            <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0">
              O que se vê com frequência são famílias já exaustas chegando ao consultório. Não pela falta de diagnóstico, mas pela ausência de um caminho claro depois dele:
            </p>
            <ul className="flex flex-col gap-2.5 pl-1">
              {[
                "Listas desatualizadas, sem contexto sobre formação ou especialidade.",
                "Indicações informais sem nenhuma verificação de qualificação real.",
                "Impossibilidade de saber se o profissional realmente atua com neurodesenvolvimento infantil.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-[15.5px] md:text-[16.5px] leading-[1.6] text-cinza-texto">
                  <span className="text-ferrugem/50 mt-[4px] flex-shrink-0 text-[9px]">●</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pull-quote editorial */}
          <p className="font-serif text-[28px] md:text-[31px] font-medium leading-[1.2] tracking-[-0.01em] text-ardosia mt-2 m-0">
            A Kiri nasceu para mudar isso.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0">
            Não somos uma lista de nomes. Somos uma rede criteriosamente reunida: cada profissional é verificado quanto à formação e à atuação real na área. O objetivo é que a família chegue até o cuidador certo sem ter que percorrer um labirinto para isso.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0">
            O nome vem do kiri-kiri, o menor dos falcões, de visão aguçada e voo preciso.
          </p>

        </div>

        {/* Bloco final — borda esquerda ardósia, sem itálico centralizado — item 16 */}
        <div className="mx-[26px] mt-10 bg-white border-l-[3px] border-[#44606C] pl-5 pr-4 py-4 rounded-r-[8px]">
          <p className="text-[18px] md:text-[19px] leading-[1.65] text-carvao m-0">
            A ideia é essa: clareza onde costuma haver ruído.
          </p>
        </div>

        <Footer className="mx-[26px] mt-8" />
      </div>
    </div>
  );
}
