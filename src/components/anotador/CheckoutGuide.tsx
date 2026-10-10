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
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Puntuación Bogey ({remaining}): No hay cierre directo de 3 dardos.
        </span>
        <span className="text-slate-400 text-[11px]">Bajar a número par o seguro</span>
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
    <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-lg shadow-emerald-950/20">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
        <Target className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Ruta de Cierre ({remaining}):
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {displayRoute.map((step, idx) => (
          <span
            key={idx}
            className={`font-black text-xs px-2.5 py-1 rounded-lg border shadow-sm ${
              step.startsWith('D') || step === 'BULL'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-mono text-sm'
                : step.startsWith('T')
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
};
