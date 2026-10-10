'use client';

import React, { useState } from 'react';
import { DartThrow } from '@/lib/types';
import { Delete, Check, CornerDownLeft, Sparkles, RefreshCw } from 'lucide-react';

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
        mult = 2; // Double bull
        label = 'D-BULL (50)';
      } else {
        val = 25;
        mult = 1;
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

    // Si ya completó los 3 dardos, calcular total sugerido
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
    <div className="bg-[#101728] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3">
      {/* Selector de Modo de Teclado */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setInputMode('TOTAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'TOTAL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Puntaje Total
          </button>
          <button
            type="button"
            onClick={() => setInputMode('INDIVIDUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              inputMode === 'INDIVIDUAL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
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
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-all"
            title="Deshacer último turno"
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Deshacer</span>
          </button>
        )}
      </div>

      {inputMode === 'TOTAL' ? (
        /* MODO TOTAL (ESTILO MY DART TRAINING) */
        <div className="flex flex-col gap-3">
          {/* Display del puntaje ingresado */}
          <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 min-h-[56px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Puntos del Turno:
            </span>
            <span className="text-3xl font-black text-emerald-400 tracking-wider font-mono">
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
                className={`py-2 rounded-lg text-xs font-black transition-all ${
                  score === 180
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 col-span-1'
                    : score >= 100
                    ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/90 border border-slate-700/40'
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
                className="py-3.5 sm:py-4 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:text-slate-950 text-white font-black text-xl rounded-xl border border-slate-700/60 shadow-sm transition-all"
              >
                {digit}
              </button>
            ))}

            {/* Fila inferior: CLR, 0, OK */}
            <button
              type="button"
              onClick={handleClearTotal}
              className="py-3.5 sm:py-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-sm rounded-xl border border-rose-800/50 flex items-center justify-center gap-1 transition-all"
            >
              <Delete className="w-4 h-4" />
              <span>CLR</span>
            </button>

            <button
              type="button"
              onClick={() => handleNumClick('0')}
              className="py-3.5 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xl rounded-xl border border-slate-700/60 shadow-sm transition-all"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleConfirmTotal}
              className="py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-base rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>OK</span>
            </button>
          </div>
        </div>
      ) : (
        /* MODO INDIVIDUAL (DARDO POR DARDO: SINGLE, DOUBLE, TRIPLE, BULL) */
        <div className="flex flex-col gap-3">
          {/* Visualización de los 3 dardos de la visita */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            {[0, 1, 2].map((idx) => {
              const dart = individualDarts[idx];
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center min-h-[50px] ${
                    dart
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : idx === individualDarts.length
                      ? 'bg-slate-900 border-amber-500/50 text-amber-400 animate-pulse'
                      : 'bg-slate-900/50 border-slate-800 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Dardo {idx + 1}
                  </span>
                  <span className="font-extrabold text-sm">
                    {dart ? dart.label : idx === individualDarts.length ? 'Tirar...' : '-'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Multiplicadores: Single, Double, Triple */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentMultiplier(1)}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                currentMultiplier === 1
                  ? 'bg-slate-200 text-slate-950 shadow-md'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
              }`}
            >
              SIMPLE (1x)
            </button>
            <button
              type="button"
              onClick={() => setCurrentMultiplier(2)}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                currentMultiplier === 2
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800/90 text-cyan-400 hover:bg-slate-700'
              }`}
            >
              DOBLE (2x)
            </button>
            <button
              type="button"
              onClick={() => setCurrentMultiplier(3)}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                currentMultiplier === 3
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800/90 text-amber-400 hover:bg-slate-700'
              }`}
            >
              TRIPLE (3x)
            </button>
          </div>

          {/* Grilla de números 1 al 20 + Bull + Miss */}
          <div className="grid grid-cols-5 gap-1.5">
            {[20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleThrowDart(n)}
                className={`py-2.5 rounded-lg font-black text-sm transition-all active:scale-95 ${
                  currentMultiplier === 3
                    ? 'bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                    : currentMultiplier === 2
                    ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60'
                }`}
              >
                {currentMultiplier === 3 ? `T${n}` : currentMultiplier === 2 ? `D${n}` : n}
              </button>
            ))}
          </div>

          {/* Especiales: Diana (Bull), Fuera (Miss) y Acciones */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleThrowDart(25)}
              className="py-2.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-500/40 flex items-center justify-center gap-1"
            >
              🎯 BULL
            </button>
            <button
              type="button"
              onClick={() => handleThrowDart(0)}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs rounded-xl border border-slate-700"
            >
              MISS (0)
            </button>
            <button
              type="button"
              onClick={handleClearIndividual}
              className="py-2.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 font-bold text-xs rounded-xl border border-rose-800/40"
            >
              BORRAR
            </button>
            <button
              type="button"
              disabled={individualDarts.length === 0}
              onClick={handleConfirmIndividualEarly}
              className="py-2.5 bg-emerald-500 disabled:opacity-40 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
            >
              ENVIAR ({individualDarts.reduce((acc, d) => acc + d.score, 0)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
