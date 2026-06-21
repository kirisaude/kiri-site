import { KiriLogo } from "@/components/KiriLogo";
import { NavBack } from "@/components/NavBack";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-creme">
      <div className="max-w-3xl mx-auto pb-10 w-full px-2">
        {/* Nav */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-1">
          <NavBack label="Sobre a Kiri" />
        </div>

        {/* Logo centralizado */}
        <div className="px-[26px] pt-[22px] flex flex-col items-center text-center">
          <KiriLogo size={88} />
          <div className="font-serif text-[36px] font-medium text-ferrugem tracking-[-0.01em] mt-3.5">
            Kiri
          </div>
        </div>

        {/* Manifesto */}
        <div className="px-[30px] pt-[30px] flex flex-col gap-5">
          <p className="font-serif text-[24px] md:text-[26px] leading-[1.45] font-normal text-carvao m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Encontrar o apoio certo para uma criança com TEA ou TDAH não devia ser um voo solitário.
          </p>

          <p className="text-[18px] md:text-[19px] leading-[1.65] text-ardosia font-medium m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            A Kiri nasceu para guiar essa jornada.
          </p>

          <p className="text-[17px] md:text-[17.5px] leading-[1.7] text-cinza-texto m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            O nome vem do kiri-kiri, o menor dos falcões, de visão aguçada e voo preciso.
          </p>

          <p className="text-[17px] md:text-[17.5px] leading-[1.7] text-cinza-texto m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Mais que uma lista de nomes, somos o encontro entre a sua família e uma rede multidisciplinar criteriosamente reunida — a clareza de uma boa plataforma com o olhar humano de quem entende cada singularidade.
          </p>

          <p className="text-[17px] md:text-[17.5px] leading-[1.7] text-cinza-texto m-0" style={{ textWrap: "pretty" } as React.CSSProperties}>
            Para que cada criança descubra as próprias asas e voe no seu próprio tempo.
          </p>
        </div>

        {/* Assinatura */}
        <div className="mx-[30px] mt-[30px] bg-[#EFE6D6] rounded-[16px] px-6 py-6 text-center">
          <p className="font-serif text-[22px] md:text-[24px] italic leading-[1.4] text-carvao m-0">
            Kiri. Precisão no encontro,<br />acolhimento na jornada.
          </p>
        </div>

        {/* Rodapé */}
        <div className="mx-[30px] mt-7 pt-4 border-t border-linha flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KiriLogo size={18} />
            <span className="text-[12.5px] text-muted">Kiri · Rede selecionada de neurodesenvolvimento</span>
          </div>
          <a href="/termos" className="text-[12.5px] text-muted hover:text-cinza-texto transition-colors no-underline">Termos de Uso</a>
        </div>
      </div>
    </div>
  );
}
