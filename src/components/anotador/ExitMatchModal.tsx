'use client';

import React from 'react';
import { 
  Pause, 
  Flag, 
  Play, 
  AlertTriangle, 
  Trophy, 
  ShieldAlert, 
  X,
  Clock
} from 'lucide-react';

interface ExitMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStandBy: () => void;
  onAbandon: () => void;
  matchTitle: string;
  isTournamentMatch: boolean;
  player1Name: string;
  player2Name: string;
  currentScoreOrLegs: string;
}

export const ExitMatchModal: React.FC<ExitMatchModalProps> = ({
  isOpen,
  onClose,
  onStandBy,
  onAbandon,
  matchTitle,
  isTournamentMatch,
  player1Name,
  player2Name,
  currentScoreOrLegs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-black border-2 border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl shadow-black">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">¿Pausar o Finalizar Partida?</h3>
              <p className="text-xs text-slate-400">Hay una partida activa en el marcador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0a0a0a] hover:bg-[#141414] text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen de la Partida */}
        <div className="bg-[#050505] border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
            {isTournamentMatch ? (
              <span className="text-[#ef4444] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                {matchTitle}
              </span>
            ) : (
              <span className="text-[#00e676]">Partida Individual</span>
            )}
          </div>
          <div className="text-sm sm:text-base font-black text-white truncate">
            {player1Name} <span className="text-slate-500 font-normal">vs</span> {player2Name}
          </div>
          <div className="text-xs font-bold text-slate-400 font-mono">
            {currentScoreOrLegs}
          </div>
        </div>

        {/* Alerta si es Torneo Oficial */}
        {isTournamentMatch && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/40 rounded-2xl p-3 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-[#ef4444] font-black">
              <ShieldAlert className="w-4 h-4" />
              <span>COMPETICIÓN OFICIAL EN JUEGO</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Si elegís <strong>Abandonar</strong>, se asignará automáticamente la victoria a tu adversario (Walkover) y avanzará en la llave. Los administradores oficiales cuentan con herramientas para editar el marcador si existió algún inconveniente de conexión.
            </p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="space-y-2.5 pt-1">
          {/* Opción 1: Dejar en Stand By (Pausar) */}
          <button
            onClick={onStandBy}
            className="w-full p-3.5 rounded-2xl bg-[#050505] hover:bg-[#111111] border-2 border-[#00e676]/40 hover:border-[#00e676] flex items-center gap-3 transition-all text-left group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00e676]/15 border border-[#00e676]/30 flex items-center justify-center text-[#00e676] shrink-0 group-hover:scale-105 transition-transform">
              <Pause className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-white group-hover:text-[#00e676] transition-colors flex items-center gap-2">
                <span>Suspender en Stand By</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00e676]/20 text-[#00e676]">
                  Recomendado
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Pausa la partida para que puedas navegar y retomarla dardo por dardo.
              </div>
            </div>
          </button>

          {/* Opción 2: Abandonar / Cancelar Partida */}
          <button
            onClick={onAbandon}
            className="w-full p-3 rounded-2xl bg-[#050505] hover:bg-[#140608] border border-[#ef4444]/40 hover:border-[#ef4444] flex items-center gap-3 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] shrink-0 group-hover:scale-105 transition-transform">
              <Flag className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-white group-hover:text-[#ef4444] transition-colors">
                {isTournamentMatch ? 'Declarar Abandono (Walkover Rival)' : 'Descartar Partida (Sin Guardar)'}
              </div>
              <div className="text-[11px] text-slate-400">
                {isTournamentMatch 
                  ? 'Asigna la victoria al contrincante y finaliza la partida oficial.'
                  : 'Cancela el juego actual y vuelve al selector de configuración.'}
              </div>
            </div>
          </button>
        </div>

        {/* Botón Inferior: Continuar Jugando */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-[#00e676] fill-[#00e676]" />
            <span>Continuar Jugando en la Diana</span>
          </button>
        </div>
      </div>
    </div>
  );
};
