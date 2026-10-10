'use client';

import React, { useState } from 'react';
import { DartThrow } from '@/lib/types';
import { Delete, Check, CornerDownLeft } from 'lucide-react';

interface DartKeypadProps {
  onConfirmVisit: (totalScore: number, darts?: DartThrow[]) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  remainingScore: number;
  isDoubleOutRequired: boolean;
}

export const DartKeypad: React.FC<DartKeypadProps> = ({
  onConfirmVisit,
  onUndo,
  canUndo = false,
  remainingScore,
  isDoubleOutRequired
}) => {
  const [inputMode, setInputMode] = useState<'TOTAL' | 'INDIVIDUAL'>('TOTAL');
  const [totalInput, setTotalInput] = useState<string>('');

  // Estado para modo Individual (3 dardos)
  const [individualDarts, setIndividualDarts] = useState<DartThrow[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<1 | 2 | 3>(1);

  // Manejo de teclado total
  const handleNumClick = (digit: string) => {
    if (totalInput.length >= 3) return;
    const nextVal = totalInput + digit;
    const num = parseInt(nextVal, 10);
    if (num <= 180) {
      setTotalInput(nextVal);
    }
  };

  const handleClearTotal = () => {
    setTotalInput('');
  };

  const handleQuickScore = (score: number) => {
    if (score <= remainingScore || score > 180) {
      onConfirmVisit(score);
      setTotalInput('');
    } else {
      setTotalInput(score.toString());
    }
  };

  const handleConfirmTotal = () => {
    const score = parseInt(totalInput, 10);
    if (isNaN(score)) {
      onConfirmVisit(0);
    } else {
      onConfirmVisit(score);
    }
    setTotalInput('');
  };

  // Manejo de dardos individuales
  const handleThrowDart = (sector: number) => {
    if (individualDarts.length >= 3) return;

    let mult: 0 | 1 | 2 | 3 = currentMultiplier;
    let label = '';
    let val = sector;

    if (sector === 25) {
      // Bullseye
      if (mult === 2 || mult === 3) {
        val = 50;
        mult = 2; // Double bull (Rojo centro)
        label = 'D-BULL (50)';
      } else {
        val = 25;
        mult = 1; // Outer bull (Verde)
        label = 'S-BULL (25)';
      }
    } else if (sector === 0) {
      mult = 0;
      val = 0;
      label = 'MISS (0)';
    } else {
      const prefix = mult === 3 ? 'T' : mult === 2 ? 'D' : 'S';
      label = `${prefix}${sector} (${sector * mult})`;
    }

    const dart: DartThrow = {
      sector,
      multiplier: mult,
      score: val === 50 || val === 25 ? val : sector * mult,
      label
    };

    const nextDarts = [...individualDarts, dart];
    setIndividualDarts(nextDarts);
    setCurrentMultiplier(1); // Reset a Single tras tirar

    // Si ya completó los 3 dardos, confirmar automáticamente
    if (nextDarts.length === 3) {
      const sum = nextDarts.reduce((acc, d) => acc + d.score, 0);
      onConfirmVisit(sum, nextDarts);
      setIndividualDarts([]);
    }
  };

  const handleClearIndividual = () => {
    setIndividualDarts([]);
    setCurrentMultiplier(1);
  };

  const handleConfirmIndividualEarly = () => {
    if (individualDarts.length === 0) return;
    const sum = individualDarts.reduce((acc, d) => acc + d.score, 0);
    onConfirmVisit(sum, individualDarts);
    setIndividualDarts([]);
    setCurrentMultiplier(1);
  };

  return (
    <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col gap-3">
      {/* Selector de Modo de Teclado con estilo Diana */}
      <div className="flex items-center justify-between gap-2 border-b border-[#1e2638] pb-3">
        <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-[#1e2638]">
          <button
            type="button"
            onClick={() => setInputMode('TOTAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              inputMode === 'TOTAL'
                ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Puntaje Total
          </button>
          <button
            type="button"
            onClick={() => setInputMode('INDIVIDUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              inputMode === 'INDIVIDUAL'
                ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dardo x Dardo (3)
          </button>
        </div>

        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131929] hover:bg-[#1a233a] text-slate-200 rounded-xl text-xs font-bold border border-[#1e2638] transition-all"
            title="Deshacer último turno"
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>Deshacer</span>
          </button>
        )}
      </div>

      {inputMode === 'TOTAL' ? (
        /* MODO TOTAL (ESTILO MY DART TRAINING CON COLORES DE LA CAPTURA 1) */
        <div className="flex flex-col gap-3">
          {/* Display de puntuación ingresada */}
          <div className="flex items-center justify-between bg-[#07090e] border border-[#1e2638] rounded-2xl px-5 py-3 min-h-[64px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Puntos del Turno:
            </span>
            <span className="text-4xl font-black text-[#00e676] tracking-wider font-mono">
              {totalInput || '0'}
            </span>
          </div>

          {/* Accesos rápidos frecuentes de dardos */}
          <div className="grid grid-cols-5 gap-1.5">
            {[26, 41, 45, 60, 81, 85, 100, 120, 140, 180].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => handleQuickScore(score)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  score === 180
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md shadow-red-500/30'
                    : score >= 100
                    ? 'bg-[#131929] text-[#00e676] hover:bg-[#1a233a] border border-emerald-500/40'
                    : 'bg-[#131929]/80 text-white hover:bg-[#1a233a] border border-[#1e2638]'
                }`}
              >
                {score}
              </button>
            ))}
          </div>

          {/* Teclado numérico táctil */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleNumClick(digit)}
                className="py-4 bg-[#131929] hover:bg-[#1c263d] active:bg-[#00e676] active:text-[#07090e] text-white font-black text-2xl rounded-2xl border border-[#1e2638] shadow-sm transition-all"
              >
                {digit}
              </button>
            ))}

            {/* Fila inferior: CLR (Rojo Diana), 0, OK (Verde Diana) */}
            <button
              type="button"
              onClick={handleClearTotal}
              className="py-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-black text-sm rounded-2xl border border-red-500/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Delete className="w-4 h-4 stroke-[2.5]" />
              <span>CLR</span>
            </button>

            <button
              type="button"
              onClick={() => handleNumClick('0')}
              className="py-4 bg-[#131929] hover:bg-[#1c263d] active:bg-[#00e676] active:text-[#07090e] text-white font-black text-2xl rounded-2xl border border-[#1e2638] shadow-sm transition-all"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleConfirmTotal}
              className="py-4 bg-[#00e676] hover:bg-[#00c853] active:scale-95 text-[#07090e] font-black text-base rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>OK</span>
            </button>
          </div>
        </div>
      ) : (
        /* MODO INDIVIDUAL (DARDO POR DARDO: COLORES DIANA SAMURAI 4) */
        <div className="flex flex-col gap-3">
          {/* Visualización de los 3 dardos de la visita */}
          <div className="grid grid-cols-3 gap-2 bg-[#14161f] p-3 rounded-2xl border border-[#313647]">
            {[0, 1, 2].map((idx) => {
              const dart = individualDarts[idx];
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center min-h-[54px] ${
                    dart
                      ? 'bg-[#00b853]/20 border-[#00b853]/60 text-[#00b853]'
                      : idx === individualDarts.length
                      ? 'bg-[#242836] border-[#e52521]/60 text-[#e52521] animate-pulse'
                      : 'bg-[#1c1f2b] border-[#313647] text-[#b8ad98]/40'
                  }`}
                >
                  <span className="text-[10px] uppercase font-black text-[#b8ad98]">
                    Dardo {idx + 1}
                  </span>
                  <span className="font-black text-sm">
                    {dart ? dart.label : idx === individualDarts.length ? 'Tirar...' : '-'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Multiplicadores: SIMPLE (Marfil Sisal), DOBLE (Rojo Diana), TRIPLE (Verde Diana) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setCurrentMultiplier(1)}
              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                currentMultiplier === 1
                  ? 'bg-[#efe7d8] text-[#0d0e12] border-[#efe7d8] shadow-md'
                  : 'bg-[#242836] text-[#efe7d8] hover:bg-[#2b3040] border-[#313647]'
              }`}
            >
              SIMPLE (1x)
            </button>
            <button
              type="button"
              onClick={() => setCurrentMultiplier(2)}
              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                currentMultiplier === 2
                  ? 'bg-[#e52521] text-white border-[#e52521] shadow-md shadow-red-500/30'
                  : 'bg-[#242836] text-[#e52521] hover:bg-[#2b3040] border-[#e52521]/40'
              }`}
            >
              DOBLE (2x)
            </button>
            <button
              type="button"
              onClick={() => setCurrentMultiplier(3)}
              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                currentMultiplier === 3
                  ? 'bg-[#00b853] text-[#0d0e12] border-[#00b853] shadow-md shadow-green-500/30'
                  : 'bg-[#242836] text-[#00b853] hover:bg-[#2b3040] border-[#00b853]/40'
              }`}
            >
              TRIPLE (3x)
            </button>
          </div>

          {/* Grilla de números de la diana */}
          <div className="grid grid-cols-5 gap-1.5">
            {[20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleThrowDart(n)}
                className={`py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 border ${
                  currentMultiplier === 3
                    ? 'bg-[#00b853]/20 border-[#00b853]/50 text-[#00b853] hover:bg-[#00b853]/30'
                    : currentMultiplier === 2
                    ? 'bg-[#e52521]/20 border-[#e52521]/50 text-[#e52521] hover:bg-[#e52521]/30'
                    : 'bg-[#242836] hover:bg-[#2e3345] text-white border-[#313647]'
                }`}
              >
                {currentMultiplier === 3 ? `T${n}` : currentMultiplier === 2 ? `D${n}` : n}
              </button>
            ))}
          </div>

          {/* Especiales: Diana Bull, Fuera Miss, Borrar, Enviar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleThrowDart(25)}
              className="py-2.5 bg-[#e52521] hover:bg-[#cf1e1a] text-white font-black text-xs rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center gap-1"
            >
              🎯 BULL
            </button>
            <button
              type="button"
              onClick={() => handleThrowDart(0)}
              className="py-2.5 bg-[#242836] hover:bg-[#2e3345] text-[#b8ad98] font-bold text-xs rounded-xl border border-[#313647]"
            >
              MISS (0)
            </button>
            <button
              type="button"
              onClick={handleClearIndividual}
              className="py-2.5 bg-[#e52521]/20 hover:bg-[#e52521]/30 text-[#e52521] font-bold text-xs rounded-xl border border-[#e52521]/40"
            >
              BORRAR
            </button>
            <button
              type="button"
              disabled={individualDarts.length === 0}
              onClick={handleConfirmIndividualEarly}
              className="py-2.5 bg-[#00b853] disabled:opacity-40 hover:bg-[#009e47] text-[#0d0e12] font-black text-xs rounded-xl shadow-md"
            >
              ENVIAR ({individualDarts.reduce((acc, d) => acc + d.score, 0)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
