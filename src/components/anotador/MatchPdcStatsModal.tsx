'use client';

import React from 'react';
import { Trophy, ArrowLeft, BarChart2, CheckCircle2, X } from 'lucide-react';

interface MatchPdcStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  p1Name: string;
  p2Name: string;
  stats: {
    gameType?: 'X01' | 'CRICKET';
    legsP1: number;
    legsP2: number;
    avgP1: string;
    avgP2: string;
    first9P1?: string;
    first9P2?: string;
    count100sP1: number;
    count100sP2: number;
    count140sP1: number;
    count140sP2: number;
    count180sP1: number;
    count180sP2: number;
    highFinishP1?: number;
    highFinishP2?: number;
    bestLegP1?: number;
    bestLegP2?: number;
    mprP1?: string;
    mprP2?: string;
  };
  tournamentTitle?: string;
}

export const MatchPdcStatsModal: React.FC<MatchPdcStatsModalProps> = ({
  isOpen,
  onClose,
  p1Name,
  p2Name,
  stats,
  tournamentTitle = 'Partida Oficial • Locos por los Dardos'
}) => {
  if (!isOpen) return null;

  const isCricket = stats.gameType === 'CRICKET';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#07090e] border border-[#ef4444]/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/90">
        {/* Cabecera idéntica a la captura */}
        <div className="bg-[#0f1422] border-b border-[#ef4444]/20 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>

          <h2 className="text-base font-black text-white tracking-wide">
            Estadísticas Oficiales
          </h2>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] text-xs font-black border border-[#00e676] transition-colors"
          >
            Puntuación
          </button>
        </div>

        {/* Título de Torneo / Partido */}
        <div className="text-center py-2.5 px-4 bg-[#0a0d15] border-b border-slate-800/80">
          <div className="text-xs font-black text-slate-300 truncate">{tournamentTitle}</div>
        </div>

        {/* Encabezado de Jugadores enfrentados */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 bg-[#0f1422]/70 border-b border-slate-800">
          <div className="text-center">
            <span className="text-sm font-black text-white block truncate">{p1Name}</span>
          </div>
          <div className="text-xs font-bold text-[#00e676] px-3">
            Detalles ▾
          </div>
          <div className="text-center">
            <span className="text-sm font-black text-white block truncate">{p2Name}</span>
          </div>
        </div>

        {/* Tabla Comparativa de Métricas PDC idéntica a la captura */}
        <div className="divide-y divide-slate-800/80 text-sm">
          {/* Legs */}
          <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
            <div className="text-center font-black text-white text-base">{stats.legsP1}</div>
            <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Legs</div>
            <div className="text-center font-black text-white text-base">{stats.legsP2}</div>
          </div>

          {!isCricket ? (
            <>
              {/* 3 Darts Average */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-[#00e676] text-base">{stats.avgP1}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">3 Darts (AVG)</div>
                <div className="text-center font-black text-[#00e676] text-base">{stats.avgP2}</div>
              </div>

              {/* First 9 Average */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-white text-base">{stats.first9P1 || '0.00'}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">First 9</div>
                <div className="text-center font-black text-white text-base">{stats.first9P2 || '0.00'}</div>
              </div>

              {/* 100+ (Toneladas) */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-white">{stats.count100sP1}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">100+</div>
                <div className="text-center font-black text-white">{stats.count100sP2}</div>
              </div>

              {/* 140+ */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-white">{stats.count140sP1}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">140+</div>
                <div className="text-center font-black text-white">{stats.count140sP2}</div>
              </div>

              {/* 180's */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 bg-[#ef4444]/5 hover:bg-[#ef4444]/10">
                <div className="text-center font-black text-[#ef4444] text-base">{stats.count180sP1}</div>
                <div className="text-center text-xs font-black text-[#ef4444] uppercase tracking-wider">180's</div>
                <div className="text-center font-black text-[#ef4444] text-base">{stats.count180sP2}</div>
              </div>

              {/* High Finish */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-white">{stats.highFinishP1 || 0}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">High Finish</div>
                <div className="text-center font-black text-white">{stats.highFinishP2 || 0}</div>
              </div>

              {/* Best Leg */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-white">{stats.bestLegP1 && stats.bestLegP1 < 90 ? `${stats.bestLegP1} d.` : '-'}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Best Leg</div>
                <div className="text-center font-black text-white">{stats.bestLegP2 && stats.bestLegP2 < 90 ? `${stats.bestLegP2} d.` : '-'}</div>
              </div>
            </>
          ) : (
            <>
              {/* MPR en Cricket */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-[#00e676] text-base">{stats.mprP1 || '0.00'}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">MPR</div>
                <div className="text-center font-black text-[#00e676] text-base">{stats.mprP2 || '0.00'}</div>
              </div>
            </>
          )}
        </div>

        {/* Botón inferior para cerrar */}
        <div className="p-3 bg-[#0a0d15] border-t border-slate-800 flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
          >
            Cerrar Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
};
