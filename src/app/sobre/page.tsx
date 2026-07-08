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

          <p className="font-serif text-[24px] md:text-[26px] leading-[1.45] font-normal text-carvao m-0" style={{ textWrap: "balance" } as React.CSSProperties}>
            Encontrar o profissional certo para uma criança com suspeita de TEA, TDAH ou atraso de desenvolvimento costuma ser, para as famílias, uma segunda jornada tão difícil quanto o próprio diagnóstico.
          </p>

          <p className="text-[17px] md:text-[17.5px] leading-[1.7] text-cinza-texto m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Esse padrão se repete. Na prática clínica, o que se vê com frequência são famílias que chegam ao consultório já exaustas — não pela falta de diagnóstico, mas pela ausência de um caminho claro depois dele. Listas desatualizadas, nomes sem contexto, profissionais indicados sem que se saiba ao certo qual é a formação real ou se a atuação com neurodesenvolvimento infantil vai além do autodeclarado. O sistema não organiza esse fluxo — e as famílias acabam tomando decisões importantes com informação insuficiente.
          </p>

          <p className="text-[18px] md:text-[19px] leading-[1.65] text-ardosia font-medium m-0">
            A Kiri nasceu para mudar isso.
          </p>

          <p className="text-[17px] md:text-[17.5px] leading-[1.7] text-cinza-texto m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Não somos uma lista de nomes. Somos uma rede criteriosamente reunida — cada profissional verificado quanto à formação e à atuação real na área. O objetivo é que a família chegue até o cuidador certo sem ter que percorrer um labirinto para isso.
          </p>

          <p className="text-[17px] md:text-[17.5px] leading-[1.7] text-cinza-texto m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            O nome vem do kiri-kiri, o menor dos falcões — de visão aguçada e voo preciso. A ideia é essa: clareza onde costuma haver ruído.
          </p>

        </div>

        {/* Assinatura */}
        <div className="mx-[30px] mt-[36px] border-t border-linha pt-6 flex flex-col gap-1">
          <p className="text-[16px] font-semibold text-carvao m-0">Iohana Marques</p>
          <p className="text-[14px] text-muted m-0">Idealizadora</p>
          <p className="text-[14px] text-cinza-texto m-0">Médica residente em Psiquiatria · UNIFESP</p>
          <p className="text-[14px] text-cinza-texto m-0">Engenheira Civil · USP</p>
        </div>

        <Footer className="mx-[30px] mt-7" />
      </div>
    </div>
  );
}
