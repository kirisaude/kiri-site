import { KiriLogoFull } from "@/components/KiriLogoFull";
import { Footer } from "@/components/Footer";
import { NavBack } from "@/components/NavBack";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="w-full px-4 pt-4 pb-2">
        <NavBack label="Sobre a Kiri" />
      </div>

      <div className="max-w-3xl mx-auto pb-10 w-full px-2">

        <div className="px-[26px] pt-[22px] flex flex-col items-center text-center">
          <KiriLogoFull height={80} />
        </div>

        <div className="px-[30px] pt-[30px] flex flex-col gap-5">

          <p className="font-serif text-[19px] md:text-[21px] leading-[1.55] font-normal text-carvao m-0 text-justify">
            Encontrar o profissional certo para uma criança com suspeita de TEA, TDAH ou atraso de desenvolvimento costuma ser, para as famílias, uma segunda jornada tão difícil quanto o próprio diagnóstico.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0 text-justify">
            Esse padrão se repete. Na prática clínica, o que se vê com frequência são famílias que chegam ao consultório já exaustas — não pela falta de diagnóstico, mas pela ausência de um caminho claro depois dele. Listas desatualizadas, nomes sem contexto, profissionais indicados sem que se saiba ao certo qual é a formação real ou se a atuação com neurodesenvolvimento infantil vai além do autodeclarado. O sistema não organiza esse fluxo — e as famílias acabam tomando decisões importantes com informação insuficiente.
          </p>

          <p className="text-[17px] md:text-[18px] leading-[1.65] text-ardosia font-medium m-0">
            A Kiri nasceu para mudar isso.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0 text-justify">
            Não somos uma lista de nomes. Somos uma rede criteriosamente reunida — cada profissional verificado quanto à formação e à atuação real na área. O objetivo é que a família chegue até o cuidador certo sem ter que percorrer um labirinto para isso.
          </p>

          <p className="text-[16px] md:text-[17px] leading-[1.75] text-cinza-texto m-0 text-justify">
            O nome vem do kiri-kiri, o menor dos falcões — de visão aguçada e voo preciso.
          </p>

        </div>

        <div className="mx-[30px] mt-10 relative pt-[68px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascote.png"
            alt="Kiri-kiri"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 object-contain z-10"
          />
          <div className="bg-[#FAF0E4] border border-[#E8DDD0] rounded-[16px] px-6 py-5 text-center">
            <p className="font-serif italic text-[18px] md:text-[20px] leading-[1.65] text-carvao m-0">
              A ideia é essa: clareza onde costuma haver ruído.
            </p>
          </div>
        </div>

        <Footer className="mx-[30px] mt-7" />
      </div>
    </div>
  );
}
