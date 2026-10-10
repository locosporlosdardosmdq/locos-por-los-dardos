'use client';

import React from 'react';
import { CHECKOUT_GUIDE } from '@/lib/constants';
import { Target, Zap } from 'lucide-react';

interface CheckoutGuideProps {
  remaining: number;
  isDoubleOut?: boolean;
}

export const CheckoutGuide: React.FC<CheckoutGuideProps> = ({
  remaining,
  isDoubleOut = true
}) => {
  if (!isDoubleOut || remaining > 170 || remaining <= 1) {
    return null;
  }

  // Comprobar si es un número bogey (imposible de cerrar en 3 dardos con doble: 169, 168, 166, 165, 163, 162, 159)
  const bogusScores = [169, 168, 166, 165, 163, 162, 159];
  const isBogey = bogusScores.includes(remaining);

  if (isBogey) {
    return (
      <div className="bg-[#e52521]/15 border border-[#e52521]/40 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs">
        <span className="text-[#e52521] font-bold flex items-center gap-1.5">
          <Zap className="w-4 h-4 stroke-[2.5]" />
          Puntuación Bogey ({remaining}): Imposible cerrar en 3 dardos.
        </span>
        <span className="text-[#b8ad98] text-[11px] font-semibold">Bajar a número de cierre seguro</span>
      </div>
    );
  }

  const route = CHECKOUT_GUIDE[remaining];

  // Si no está explícito en la tabla fija pero es menor a 100, calcular ruta típica
  let displayRoute = route;
  if (!displayRoute) {
    if (remaining <= 40 && remaining % 2 === 0) {
      displayRoute = [`D${remaining / 2}`];
    } else if (remaining <= 40) {
      displayRoute = [`S1`, `D${(remaining - 1) / 2}`];
    } else if (remaining <= 60) {
      const odd = remaining % 2 !== 0;
      if (odd) {
        displayRoute = [`S${remaining - 40}`, 'D20'];
      } else {
        displayRoute = [`S${remaining - 40}`, 'D20'];
      }
    } else if (remaining <= 100) {
      displayRoute = ['T20', `D${(remaining - 60) / 2}`];
    }
  }

  if (!displayRoute || displayRoute.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1c1f2b] border border-[#313647] rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00b853] animate-ping"></div>
        <Target className="w-4 h-4 text-[#00b853]" />
        <span className="text-xs font-black text-[#efe7d8] uppercase tracking-wider">
          Ruta de Cierre Oficial ({remaining}):
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {displayRoute.map((step, idx) => (
          <span
            key={idx}
            className={`font-black text-xs px-3 py-1.5 rounded-xl border shadow-sm font-mono ${
              step.startsWith('D') || step === 'BULL'
                ? 'bg-[#e52521] text-white border-[#e52521] text-sm shadow-red-500/20' // Cierre Doble en Rojo Diana
                : step.startsWith('T')
                ? 'bg-[#00b853] text-[#0d0e12] border-[#00b853] text-sm shadow-green-500/20' // Triples preparatorios en Verde Diana
                : 'bg-[#efe7d8] text-[#0d0e12] border-[#efe7d8]' // Simples en Marfil Sisal
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
};
