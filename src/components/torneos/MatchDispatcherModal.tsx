'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Target, 
  FileEdit, 
  X, 
  Trophy, 
  Users, 
  CheckCircle2, 
  Tv, 
  Video 
} from 'lucide-react';

interface MatchDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchTitle: string;
  player1Name: string;
  player2Name: string;
  bestOfLegs: number;
  onLaunchLiveMatch: () => void;
  onLaunchOnlineMatch: () => void;
  onSaveQuickResult: (scoreP1: number, scoreP2: number, winnerId: string) => void;
  player1Id: string;
  player2Id: string;
}

export const MatchDispatcherModal: React.FC<MatchDispatcherModalProps> = ({
  isOpen,
  onClose,
  matchTitle,
  player1Name,
  player2Name,
  bestOfLegs,
  onLaunchLiveMatch,
  onLaunchOnlineMatch,
  onSaveQuickResult,
  player1Id,
  player2Id
}) => {
  const [mode, setMode] = useState<'SELECT' | 'QUICK_RESULT'>('SELECT');
  const [quickScoreP1, setQuickScoreP1] = useState(0);
  const [quickScoreP2, setQuickScoreP2] = useState(0);

  if (!isOpen) return null;

  const targetToWin = Math.ceil(bestOfLegs / 2);

  const handleConfirmQuickResult = () => {
    let winnerId = '';
    if (quickScoreP1 >= targetToWin) winnerId = player1Id;
    else if (quickScoreP2 >= targetToWin) winnerId = player2Id;
    else {
      winnerId = quickScoreP1 > quickScoreP2 ? player1Id : player2Id;
    }

    onSaveQuickResult(quickScoreP1, quickScoreP2, winnerId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#07090e] border border-[#ef4444]/40 rounded-3xl p-5 space-y-4 shadow-2xl shadow-black/95">
        {/* Cabecera del Cruce */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ef4444]/20">
          <div>
            <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider block">
              {matchTitle}
            </span>
            <h3 className="text-sm font-black text-white">
              {player1Name} <span className="text-slate-500">vs</span> {player2Name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'SELECT' ? (
          <div className="space-y-2.5">
            {/* Opción 1: Online (Conectado / Remoto) */}
            <button
              onClick={() => {
                onLaunchOnlineMatch();
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-[#111622] hover:bg-[#182030] border border-[#0284c7]/40 hover:border-[#0284c7] flex items-center gap-3.5 transition-all text-left group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#0284c7] group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white group-hover:text-[#0284c7] transition-colors">
                  Partida Online
                </div>
                <div className="text-xs text-slate-400">
                  Sala remota con video, cámara de diana y sincronización
                </div>
              </div>
            </button>

            {/* Opción 2: Live Presencial (En el Club / Diana) */}
            <button
              onClick={() => {
                onLaunchLiveMatch();
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-[#111622] hover:bg-[#182030] border border-[#00e676]/40 hover:border-[#00e676] flex items-center gap-3.5 transition-all text-left group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#00e676]/20 border border-[#00e676]/40 flex items-center justify-center text-[#00e676] group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white group-hover:text-[#00e676] transition-colors">
                  Anotador en Vivo (En el Club)
                </div>
                <div className="text-xs text-slate-400">
                  Marcador táctil de pista, árbitro oficial y transmisión a TV
                </div>
              </div>
            </button>

            {/* Opción 3: Registrar Resultados Directos */}
            <button
              onClick={() => setMode('QUICK_RESULT')}
              className="w-full p-3.5 rounded-2xl bg-[#111622] hover:bg-[#182030] border border-[#ef4444]/40 hover:border-[#ef4444] flex items-center gap-3.5 transition-all text-left group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 flex items-center justify-center text-[#ef4444] group-hover:scale-105 transition-transform">
                <FileEdit className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white group-hover:text-[#ef4444] transition-colors">
                  Registrar Resultados
                </div>
                <div className="text-xs text-slate-400">
                  Carga manual directa de legs ganados (WO o planilla)
                </div>
              </div>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors mt-2"
            >
              Cancelar
            </button>
          </div>
        ) : (
          /* Modo Carga Rápida de Resultado */
          <div className="space-y-4">
            <div className="text-xs text-slate-400 text-center">
              Ingresá los legs ganados por cada jugador (Primero a {targetToWin} legs):
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-xs font-bold text-white truncate mb-1">{player1Name}</div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setQuickScoreP1(Math.max(0, quickScoreP1 - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-black text-[#00e676] w-8">{quickScoreP1}</span>
                  <button
                    onClick={() => setQuickScoreP1(Math.min(targetToWin, quickScoreP1 + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-xs font-bold text-white truncate mb-1">{player2Name}</div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setQuickScoreP2(Math.max(0, quickScoreP2 - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-black text-[#00e676] w-8">{quickScoreP2}</span>
                  <button
                    onClick={() => setQuickScoreP2(Math.min(targetToWin, quickScoreP2 + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmQuickResult}
                className="flex-1 py-3 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs hover:bg-[#00c864] transition-colors"
              >
                CONFIRMAR RESULTADO
              </button>
              <button
                onClick={() => setMode('SELECT')}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
