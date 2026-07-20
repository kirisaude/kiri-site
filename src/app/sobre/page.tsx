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
          <h1 className="font-serif text-[32px] md:text-[36px] font-medium leading-[1.2] tracking-[-0.01em] text-carvao m-0">
            Sobre a Kiri
          </h1>
        </div>

        <div className="px-[26px] pt-[28px] flex flex-col gap-6">

          <p className="font-serif text-[19px] md:text-[21px] leading-[1.55] font-normal text-carvao m-0">
            Encontrar o profissional certo para uma criança com suspeita de TEA, TDAH ou atraso de desenvolvimento costuma ser, para as famílias, uma segunda jornada tão difícil quanto o próprio diagnóstico.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0">
            Esse padrão se repete. Na prática clínica, o que se vê com frequência são famílias que chegam ao consultório já exaustas — não pela falta de diagnóstico, mas pela ausência de um caminho claro depois dele. Listas desatualizadas, nomes sem contexto, profissionais indicados sem que se saiba ao certo qual é a formação real ou se a atuação com neurodesenvolvimento infantil vai além do autodeclarado. O sistema não organiza esse fluxo — e as famílias acabam tomando decisões importantes com informação insuficiente.
          </p>

          {/* Pull-quote editorial — item 14/15 */}
          <p className="font-serif text-[34px] md:text-[38px] font-medium leading-[1.15] tracking-[-0.01em] text-ardosia m-0">
            A Kiri nasceu para mudar isso.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0">
            Não somos uma lista de nomes. Somos uma rede criteriosamente reunida — cada profissional verificado quanto à formação e à atuação real na área. O objetivo é que a família chegue até o cuidador certo sem ter que percorrer um labirinto para isso.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0">
            O nome vem do kiri-kiri, o menor dos falcões — de visão aguçada e voo preciso.
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
