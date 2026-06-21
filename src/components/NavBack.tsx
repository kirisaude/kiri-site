"use client";

import { useRouter } from "next/navigation";

interface NavBackProps {
  label?: string;
  href?: string;
}

export function NavBack({ label, href }: NavBackProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 px-4 py-1">
      <button
        onClick={() => (href ? router.push(href) : router.back())}
        className="w-9 h-9 rounded-full bg-white border border-linha flex items-center justify-center flex-shrink-0 cursor-pointer"
        aria-label="Voltar"
      >
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 4 L6.5 10 L12.5 16"
            stroke="#2C2722"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {label && (
        <span className="text-[12.5px] font-semibold tracking-[0.04em] text-muted">
          {label}
        </span>
      )}
    </div>
  );
}
