'use client';

import React, { useState } from 'react';
import { Trophy, ArrowLeft, BarChart2, CheckCircle2, Calendar, Clock, Target, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { MatchLegBreakdown } from '@/lib/types';
import { synthesizeLegsBreakdownFromSummary } from '@/lib/storage';

interface MatchPdcStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  p1Name: string;
  p2Name: string;
  stats: {
    gameType?: 'X01' | 'CRICKET' | 'ROUND_THE_CLOCK';
    startingScore?: number;
    date?: string;
    time?: string;
    legsP1: number;
    legsP2: number;
    avgP1: string;
    avgP2: string;
    first9P1?: string;
    first9P2?: string;
    dartsP1?: number;
    dartsP2?: number;
    checkoutHitsP1?: number;
    checkoutAttemptsP1?: number;
    checkoutHitsP2?: number;
    checkoutAttemptsP2?: number;
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
    legsBreakdown?: MatchLegBreakdown[];
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
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'LEGS'>('GENERAL');
  const [expandedLeg, setExpandedLeg] = useState<number | null>(null);

  if (!isOpen) return null;

  const isCricket = stats.gameType === 'CRICKET';
  const isP1Winner = (stats.legsP1 || 0) >= (stats.legsP2 || 0);

  const legsList: MatchLegBreakdown[] =
    Array.isArray(stats.legsBreakdown) && stats.legsBreakdown.length > 0
      ? stats.legsBreakdown
      : synthesizeLegsBreakdownFromSummary({
          startingScore: stats.startingScore || 501,
          p1Name,
          p2Name,
          legsP1: stats.legsP1 || 0,
          legsP2: stats.legsP2 || 0,
          avgP1: parseFloat(stats.avgP1 || '0') || 0,
          avgP2: parseFloat(stats.avgP2 || '0') || 0,
          dartsP1: stats.dartsP1 || 0,
          dartsP2: stats.dartsP2 || 0,
          bestLegP1: stats.bestLegP1 || 0,
          bestLegP2: stats.bestLegP2 || 0,
          highFinishP1: stats.highFinishP1 || 0,
          highFinishP2: stats.highFinishP2 || 0
        });

  const coPctP1 =
    stats.checkoutAttemptsP1 && stats.checkoutAttemptsP1 > 0
      ? (((stats.checkoutHitsP1 ?? stats.legsP1) / stats.checkoutAttemptsP1) * 100).toFixed(1)
      : null;
  const coPctP2 =
    stats.checkoutAttemptsP2 && stats.checkoutAttemptsP2 > 0
      ? (((stats.checkoutHitsP2 ?? stats.legsP2) / stats.checkoutAttemptsP2) * 100).toFixed(1)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#07090e] border border-[#ef4444]/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="bg-[#0f1422] border-b border-[#ef4444]/20 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>

          <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
            Estadísticas de la Partida
          </h2>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'GENERAL' ? 'LEGS' : 'GENERAL')}
            className="px-3 py-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] text-xs font-black border border-[#00e676] transition-colors cursor-pointer"
          >
            {activeTab === 'GENERAL' ? `Ver Legs (${legsList.length})` : 'Ver General'}
          </button>
        </div>

        {/* Título de Torneo / Partido + Fecha y Hora */}
        <div className="py-2.5 px-4 bg-[#0a0d15] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="text-xs font-black text-slate-300 truncate">{tournamentTitle}</div>
          {(stats.date || stats.time) && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              {stats.date && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00e676]" />
                  {stats.date}
                </span>
              )}
              {stats.time && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#141a29] text-amber-300 border border-amber-500/30 font-bold">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {stats.time} hs
                </span>
              )}
            </div>
          )}
        </div>

        {/* Selector de Pestaña: Resumen General vs Detalle de Legs */}
        <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#0b0f19] border-b border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'GENERAL'
                ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/20'
                : 'bg-[#121826] text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Partido en General</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LEGS')}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'LEGS'
                ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/20'
                : 'bg-[#121826] text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Legs Individuales ({legsList.length})</span>
          </button>
        </div>

        {/* Encabezado de Jugadores enfrentados */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 bg-[#0f1422]/70 border-b border-slate-800 flex-shrink-0">
          <div className="text-center min-w-0">
            <span className="text-sm font-black text-white block truncate">{p1Name}</span>
            {isP1Winner && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#00e676] uppercase">
                <Trophy className="w-3 h-3" /> Victoria
              </span>
            )}
          </div>
          <div className="px-3 text-center">
            <span className="px-2.5 py-1 rounded-xl bg-black border border-slate-700 font-mono font-black text-sm text-white">
              {stats.legsP1} - {stats.legsP2}
            </span>
          </div>
          <div className="text-center min-w-0">
            <span className="text-sm font-black text-white block truncate">{p2Name}</span>
            {!isP1Winner && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#00e676] uppercase">
                <Trophy className="w-3 h-3" /> Victoria
              </span>
            )}
          </div>
        </div>

        {/* Contenido con Scroll interno */}
        <div className="overflow-y-auto flex-1">
          {activeTab === 'GENERAL' ? (
            <div className="divide-y divide-slate-800/80 text-sm">
              {/* Legs */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                <div className="text-center font-black text-white text-base">{stats.legsP1}</div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Legs Ganados</div>
                <div className="text-center font-black text-white text-base">{stats.legsP2}</div>
              </div>

              {!isCricket ? (
                <>
                  {/* 3 Darts Average */}
                  <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                    <div className="text-center font-black text-[#00e676] text-base font-mono">{stats.avgP1}</div>
                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">3 Darts (AVG)</div>
                    <div className="text-center font-black text-[#00e676] text-base font-mono">{stats.avgP2}</div>
                  </div>

                  {/* First 9 Average */}
                  <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                    <div className="text-center font-black text-white text-base font-mono">{stats.first9P1 || stats.avgP1 || '0.00'}</div>
                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">First 9 AVG</div>
                    <div className="text-center font-black text-white text-base font-mono">{stats.first9P2 || stats.avgP2 || '0.00'}</div>
                  </div>

                  {/* % Cierre en Dobles */}
                  {(coPctP1 !== null || coPctP2 !== null) && (
                    <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                      <div className="text-center font-black text-amber-300 text-xs sm:text-sm font-mono">
                        {coPctP1 ? `${coPctP1}% (${stats.checkoutHitsP1 ?? stats.legsP1}/${stats.checkoutAttemptsP1})` : `${stats.legsP1}/${stats.legsP1}`}
                      </div>
                      <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">% Cierre Dobles</div>
                      <div className="text-center font-black text-amber-300 text-xs sm:text-sm font-mono">
                        {coPctP2 ? `${coPctP2}% (${stats.checkoutHitsP2 ?? stats.legsP2}/${stats.checkoutAttemptsP2})` : `${stats.legsP2}/${stats.legsP2}`}
                      </div>
                    </div>
                  )}

                  {/* 100+ (Toneladas) */}
                  <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                    <div className="text-center font-black text-white font-mono">{stats.count100sP1}</div>
                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">100+</div>
                    <div className="text-center font-black text-white font-mono">{stats.count100sP2}</div>
                  </div>

                  {/* 140+ */}
                  <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                    <div className="text-center font-black text-white font-mono">{stats.count140sP1}</div>
                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">140+</div>
                    <div className="text-center font-black text-white font-mono">{stats.count140sP2}</div>
                  </div>

                  {/* 180's */}
                  <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 bg-[#ef4444]/5 hover:bg-[#ef4444]/10">
                    <div className="text-center font-black text-[#ef4444] text-base font-mono">{stats.count180sP1}</div>
                    <div className="text-center text-xs font-black text-[#ef4444] uppercase tracking-wider">180's</div>
                    <div className="text-center font-black text-[#ef4444] text-base font-mono">{stats.count180sP2}</div>
                  </div>

                  {/* High Finish */}
                  <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                    <div className="text-center font-black text-sky-400 font-mono">{stats.highFinishP1 || 0} pts</div>
                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Mayor Cierre</div>
                    <div className="text-center font-black text-sky-400 font-mono">{stats.highFinishP2 || 0} pts</div>
                  </div>

                  {/* Best Leg */}
                  <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                    <div className="text-center font-black text-white font-mono">
                      {stats.bestLegP1 && stats.bestLegP1 < 90 ? `${stats.bestLegP1} dardos` : '-'}
                    </div>
                    <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Mejor Leg</div>
                    <div className="text-center font-black text-white font-mono">
                      {stats.bestLegP2 && stats.bestLegP2 < 90 ? `${stats.bestLegP2} dardos` : '-'}
                    </div>
                  </div>

                  {/* Total Dardos */}
                  {((stats.dartsP1 || 0) > 0 || (stats.dartsP2 || 0) > 0) && (
                    <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                      <div className="text-center font-bold text-slate-300 font-mono text-xs">{stats.dartsP1 || '-'} dardos</div>
                      <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Dardos Lanzados</div>
                      <div className="text-center font-bold text-slate-300 font-mono text-xs">{stats.dartsP2 || '-'} dardos</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center py-2.5 px-4 hover:bg-[#111622]/40">
                  <div className="text-center font-black text-[#00e676] text-base">{stats.mprP1 || '0.00'}</div>
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">MPR</div>
                  <div className="text-center font-black text-[#00e676] text-base">{stats.mprP2 || '0.00'}</div>
                </div>
              )}
            </div>
          ) : (
            /* Pestaña 2: Detalle de Legs Individuales */
            <div className="p-3.5 space-y-2.5">
              {legsList.map((leg) => {
                const isLegP1Win = leg.winnerIndex === 0;
                const hasVisits = Array.isArray(leg.visits) && leg.visits.length > 0;
                const isExpanded = expandedLeg === leg.legNumber;

                // Agrupar visitas por ronda para mostrar tabla lado a lado si se expande
                const maxRound = hasVisits
                  ? Math.max(...leg.visits!.map((v) => v.r), 1)
                  : 0;

                return (
                  <div
                    key={leg.legNumber}
                    className="rounded-2xl bg-[#0e1320] border border-slate-800 overflow-hidden"
                  >
                    <div className="px-3.5 py-2.5 bg-[#131a2b] border-b border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-[#00e676]/15 border border-[#00e676]/40 text-[#00e676] font-black text-xs">
                          LEG #{leg.legNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-300">
                          Ganador:{' '}
                          <strong className="text-white">
                            {isLegP1Win ? p1Name : p2Name}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {leg.checkoutScore && leg.checkoutScore > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono font-bold text-[10px] flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Cierre: {leg.checkoutScore} pts
                          </span>
                        ) : null}
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Saque: {leg.starterIndex === 1 ? p2Name : p1Name}
                        </span>
                      </div>
                    </div>

                    {/* Métricas del Leg cara a cara */}
                    <div className="grid grid-cols-3 items-center py-2.5 px-3 text-xs divide-x divide-slate-800/70">
                      <div className="text-center space-y-0.5 pr-2">
                        <div className={`font-black font-mono text-sm ${isLegP1Win ? 'text-[#00e676]' : 'text-white'}`}>
                          {Number(leg.avgP1 || 0).toFixed(1)} AVG
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {leg.dartsP1 > 0 ? `${leg.dartsP1} dardos` : '-'}
                          {leg.highVisitP1 ? ` • Max: ${leg.highVisitP1}` : ''}
                        </div>
                      </div>

                      <div className="text-center px-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Rendimiento Leg
                        </span>
                        <span className="text-[11px] font-bold text-amber-300">
                          {isLegP1Win ? '1 - 0' : '0 - 1'}
                        </span>
                      </div>

                      <div className="text-center space-y-0.5 pl-2">
                        <div className={`font-black font-mono text-sm ${!isLegP1Win ? 'text-[#00e676]' : 'text-white'}`}>
                          {Number(leg.avgP2 || 0).toFixed(1)} AVG
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {leg.dartsP2 > 0 ? `${leg.dartsP2} dardos` : '-'}
                          {leg.highVisitP2 ? ` • Max: ${leg.highVisitP2}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Botón para expandir visitas ronda por ronda si están disponibles */}
                    {hasVisits && (
                      <div className="border-t border-slate-800/80 bg-[#090d16]">
                        <button
                          type="button"
                          onClick={() => setExpandedLeg(isExpanded ? null : leg.legNumber)}
                          className="w-full py-1.5 px-3 text-[11px] font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Ocultar visitas ronda por ronda' : `Ver detalle de tiros (${maxRound} rondas)`}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-2.5 pt-1 divide-y divide-slate-800/50 text-[11px] font-mono">
                            <div className="grid grid-cols-[1fr_auto_1fr] text-slate-500 pb-1 font-sans font-bold text-[10px] uppercase">
                              <div className="text-center">{p1Name} (Tiro / Rest.)</div>
                              <div className="px-2 text-center">Ronda</div>
                              <div className="text-center">{p2Name} (Tiro / Rest.)</div>
                            </div>
                            {Array.from({ length: maxRound }, (_, idx) => idx + 1).map((rNum) => {
                              const v1 = leg.visits!.find((v) => v.r === rNum && v.p === 0);
                              const v2 = leg.visits!.find((v) => v.r === rNum && v.p === 1);
                              return (
                                <div key={rNum} className="grid grid-cols-[1fr_auto_1fr] py-1 items-center">
                                  <div className="text-center">
                                    {v1 ? (
                                      <span className={v1.bust ? 'text-red-400' : v1.rem === 0 ? 'text-[#00e676] font-black' : 'text-slate-200'}>
                                        {v1.bust ? 'BUST' : `+${v1.s}`} <span className="text-slate-500">({v1.rem})</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-600">-</span>
                                    )}
                                  </div>
                                  <div className="px-2 text-center text-[10px] text-slate-500">R{rNum}</div>
                                  <div className="text-center">
                                    {v2 ? (
                                      <span className={v2.bust ? 'text-red-400' : v2.rem === 0 ? 'text-[#00e676] font-black' : 'text-slate-200'}>
                                        {v2.bust ? 'BUST' : `+${v2.s}`} <span className="text-slate-500">({v2.rem})</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-600">-</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón inferior para cerrar */}
        <div className="p-3 bg-[#0a0d15] border-t border-slate-800 flex flex-col gap-2 justify-center flex-shrink-0">
          <div className="text-center text-[11px] font-bold text-[#00e676] flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Datos oficiales sincronizados en Estadísticas e Historial</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00e676]/20 transition-colors cursor-pointer"
          >
            Cerrar Resumen de Partida
          </button>
        </div>
      </div>
    </div>
  );
};
