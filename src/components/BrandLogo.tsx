import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  // Preponderancia de Darderos Mar del Plata: exactamente +25% de tamaño visual
  const dimensions = {
    sm: { mdq: 38, arg: 30, text: 'text-sm' },        // 30 * 1.26 ~ +25%
    md: { mdq: 50, arg: 40, text: 'text-base' },      // 40 * 1.25 = 50px (+25%)
    lg: { mdq: 75, arg: 60, text: 'text-xl' },        // 60 * 1.25 = 75px (+25%)
    hero: { mdq: 110, arg: 88, text: 'text-3xl' },    // 88 * 1.25 = 110px (+25%)
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Contenedor de Logos Oficiales */}
      <div className="flex items-center gap-2 relative">
        {/* Logo Darderos Mar del Plata: +25% Preponderancia visual */}
        <div
          style={{ width: `${dimensions.mdq}px`, height: `${dimensions.mdq}px` }}
          className="relative transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]"
          title="Darderos Mar del Plata - Sede Principal (+25% Preponderancia)"
        >
          <Image
            src="/logos/logo-mdq.png"
            alt="Darderos Mar del Plata"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Separador deportivo sutil */}
        <span className="text-slate-600 font-bold select-none text-xs">✕</span>

        {/* Logo Locos por los Dardos Argentina */}
        <div
          style={{ width: `${dimensions.arg}px`, height: `${dimensions.arg}px` }}
          className="relative transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.25)] opacity-95"
          title="Locos por los Dardos Argentina - Comunidad Nacional"
        >
          <Image
            src="/logos/dardos-argentina.png"
            alt="Comunidad Dardos Argentina"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-white uppercase ${dimensions.text}`}>
              Locos por los <span className="text-emerald-400">Dardos</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
              ARG
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            impulsado por <strong className="text-emerald-300">Darderos MDQ</strong>
          </span>
        </div>
      )}
    </div>
  );
};
