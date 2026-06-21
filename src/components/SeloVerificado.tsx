interface CheckIconProps {
  size?: number;
}

function CheckIcon({ size = 18 }: CheckIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-label="Formação verificada" style={{ flexShrink: 0 }}>
      <title>Formação verificada</title>
      <circle cx="11" cy="11" r="10" fill="none" stroke="#44606C" strokeWidth="1.4" />
      <path
        d="M6.6 11.2 L9.6 14.2 L15.4 7.6"
        fill="none"
        stroke="#44606C"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SeloEtiqueta() {
  return (
    <span className="inline-flex items-center gap-1 bg-wash-azulado border border-borda-azulada rounded-full px-2 py-0.5">
      <CheckIcon size={13} />
      <span className="text-[10px] font-semibold tracking-[0.06em] uppercase text-ardosia-escura">
        Verificado
      </span>
    </span>
  );
}

export function SeloLockup() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckIcon size={19} />
      <span className="text-[13px] font-semibold text-ardosia-escura leading-tight">
        Formação verificada
      </span>
    </span>
  );
}

export function SeloMini() {
  return (
    <span className="inline-flex items-center gap-1">
      <CheckIcon size={13} />
      <span className="text-[10px] font-semibold tracking-[0.06em] uppercase text-ardosia-escura">
        Verificado
      </span>
    </span>
  );
}
