'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TournamentBracketMatch, TournamentPodium } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { TournamentPodiumView } from './TournamentPodiumView';
import { Trophy, Clock, CheckCircle2, Play, ShieldAlert, Zap, Repeat, Award, Trash2, UserPlus, Users, Shuffle, Tv, Dices } from 'lucide-react';

interface TournamentBracketProps {
  matches: TournamentBracketMatch[];
  onSelectMatch?: (match: TournamentBracketMatch) => void;
  onUpdateScore?: (matchId: string, p1Score: number, p2Score: number, winnerId?: string, note?: string) => void;
  bestOfLegs?: number;
  isAdmin?: boolean;
  onAdminEditMatch?: (match: TournamentBracketMatch) => void;
  onSelectPlayer?: (player: any) => void;
  podium?: TournamentPodium;
  prizesBreakdown?: { first: number; second: number; third: number };
  enrolledCount?: number;
  onAutoAssign?: (isRandom: boolean) => void;
  onClearBracket?: () => void;
  onAssignSlot?: (match: TournamentBracketMatch, slotIndex: 1 | 2) => void;
  onOpenTvView?: () => void;
  onBlindDrawPairs?: () => void;
  isDoubles?: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  onSelectMatch,
  onUpdateScore,
  bestOfLegs = 5,
  isAdmin = false,
  onAdminEditMatch,
  onSelectPlayer,
  podium,
  prizesBreakdown,
  enrolledCount,
  onAutoAssign,
  onClearBracket,
  onAssignSlot,
  onOpenTvView,
  onBlindDrawPairs,
  isDoubles = false
}) => {
  const isDoubleElim = matches.some((m) => m.bracketType === 'LOSERS');
  const [deTab, setDeTab] = useState<'ALL' | 'WINNERS' | 'LOSERS' | 'FINALS'>('ALL');
  const [isRandomSeeding, setIsRandomSeeding] = useState<boolean>(true);

  // Separación dinámica para Eliminación Simple
  const singleMatches = matches.filter((m) => (!m.bracketType || m.bracketType === 'WINNERS' || m.bracketType === 'FINALS') && m.id !== 'se_third_place');
  const singleRounds = Array.from(new Set(singleMatches.map((m) => m.round))).sort((a, b) => a - b);
  const maxSingleRound = singleRounds.length > 0 ? Math.max(...singleRounds) : 1;
  const thirdPlaceMatch = matches.find((m) => m.id === 'se_third_place');

  // Separación dinámica para Doble Eliminación
  const winnersMatches = matches.filter((m) => m.bracketType === 'WINNERS');
  const winnersRounds = Array.from(new Set(winnersMatches.map((m) => m.round))).sort((a, b) => a - b);
  const maxWinnersRound = winnersRounds.length > 0 ? Math.max(...winnersRounds) : 1;

  const losersMatches = matches.filter((m) => m.bracketType === 'LOSERS');
  const losersRounds = Array.from(new Set(losersMatches.map((m) => m.round))).sort((a, b) => a - b);
  const maxLosersRound = losersRounds.length > 0 ? Math.max(...losersRounds) : 1;

  const grandFinalMatches = matches.filter((m) => m.bracketType === 'FINALS' && m.id !== 'se_third_place');

  const legsToWin = Math.ceil(bestOfLegs / 2);

  const getSingleRoundTitle = (r: number, max: number) => {
    if (r === max) return 'Gran Final del Torneo';
    if (r === max - 1) return 'Semifinales';
    if (r === max - 2) return 'Cuartos de Final';
    if (r === max - 3) return 'Octavos de Final';
    return `Ronda ${r}`;
  };

  const getWinnersRoundTitle = (r: number, max: number) => {
    if (r === max) return 'Final de Ganadores';
    if (r === max - 1) return 'Semifinales de Ganadores';
    if (r === max - 2) return 'Cuartos de Ganadores';
    return `Ganadores • Ronda ${r}`;
  };

  const getLosersRoundTitle = (r: number, max: number) => {
    if (r === max) return 'Final de Perdedores';
    if (r === max - 1) return 'Semifinal de Perdedores';
    return `Perdedores • Ronda ${r}`;
  };

  const renderMatchCard = (m: TournamentBracketMatch) => {
    const isP1Winner = m.winnerId && m.player1 && m.winnerId === m.player1.id;
    const isP2Winner = m.winnerId && m.player2 && m.winnerId === m.player2.id;
    const isFinished = m.status === 'FINISHED';
    const isPlayable = m.player1 && m.player2 && !isFinished;

    return (
      <div
        key={m.id}
        onClick={() => {
          if (onSelectMatch && m.player1 && m.player2) {
            onSelectMatch(m);
          }
        }}
        className={`w-72 rounded-2xl border p-3.5 shadow-xl transition-all cursor-pointer group relative ${
          m.status === 'LIVE'
            ? 'bg-[#0f1422] border-[#00e676] ring-2 ring-[#00e676]/40 shadow-[#00e676]/20'
            : isFinished
            ? 'bg-[#0f1422] border-slate-800 hover:border-slate-700'
            : isPlayable
            ? 'bg-[#0f1422] border-[#ef4444]/40 hover:border-[#00e676]'
            : 'bg-[#07090e] border-slate-800/80 opacity-60'
        }`}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span>Partida #{m.matchIndex + 1}</span>
            {m.distanceMode === 'SETS' ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#ffe600]/15 text-[#ffe600] border border-[#ffe600]/30">
                1º a {m.setTarget || 3} Sets
              </span>
            ) : m.legTarget ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                1º a {m.legTarget} Legs
              </span>
            ) : null}
            {m.note && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {m.note}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {m.status === 'LIVE' ? (
              <span className="flex items-center gap-1.5 text-[#00e676] bg-[#00e676]/15 px-2.5 py-0.5 rounded-full border border-[#00e676]/40 animate-pulse font-black text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]"></span>
                EN VIVO
              </span>
            ) : isFinished ? (
              <span className="text-slate-400 flex items-center gap-1 font-semibold text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00e676]" />
                Finalizado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                <Clock className="w-3 h-3" />
                {m.scheduledTime || 'Pendiente'}
              </span>
            )}

            {/* Botón de Herramientas de Administrador */}
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAdminEditMatch) onAdminEditMatch(m);
                }}
                className="p-1 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/40 transition-colors"
                title="Administrar Llave (Editar resultado / W.O. / Reset)"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Jugador 1 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition-all ${
            isP1Winner
              ? 'bg-[#00e676]/15 border border-[#00e676]/50 text-white font-black'
              : 'bg-[#111622] text-slate-200'
          }`}
        >
          <div 
            onClick={(e) => {
              if (m.player1 && onSelectPlayer) {
                e.stopPropagation();
                onSelectPlayer(m.player1.id || m.player1.name);
              } else if (isAdmin && onAssignSlot && m.round === 1 && m.status === 'SCHEDULED') {
                e.stopPropagation();
                onAssignSlot(m, 1);
              }
            }}
            title={m.player1 ? "Ver ficha y estadísticas del jugador" : isAdmin && onAssignSlot && m.round === 1 ? "Click para asignar jugador" : undefined}
            className={`flex items-center gap-2 truncate ${m.player1 ? 'cursor-pointer hover:text-[#00e676]' : isAdmin && onAssignSlot && m.round === 1 ? 'cursor-pointer hover:text-blue-400' : ''}`}
          >
            <span className="text-sm select-none" title={m.player1?.nationality || 'Argentina'}>
              {getCountryFlag(m.player1?.countryCode || m.player1?.nationality || 'AR')}
            </span>
            {m.player1?.avatarUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-black">
                <Image src={m.player1.avatarUrl} alt={m.player1.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                {m.player1?.name ? m.player1.name.slice(0, 1) : '?'}
              </div>
            )}
            <span className="text-xs truncate font-bold">
              {m.player1 ? m.player1.name : (
                <span className="text-slate-500 italic">Por definir</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isAdmin && onAssignSlot && m.round === 1 && m.status === 'SCHEDULED' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignSlot(m, 1);
                }}
                className="p-1 rounded-md bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[9px] font-bold flex items-center gap-0.5"
                title="Asignar / Cambiar Jugador en Slot 1"
              >
                <UserPlus className="w-3 h-3" />
              </button>
            )}
            {m.distanceMode === 'SETS' && (
              <span className="font-mono font-bold text-xs text-[#ffe600] px-1.5 py-0.5 rounded bg-[#ffe600]/10 border border-[#ffe600]/30" title="Sets ganados">
                {m.scoreSetsP1 || 0}S
              </span>
            )}
            <span
              className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                isP1Winner ? 'bg-[#00e676] text-[#07090e]' : 'bg-[#07090e] text-white border border-slate-800'
              }`}
            >
              {m.scoreP1}
            </span>
          </div>
        </div>

        {/* Jugador 2 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            isP2Winner
              ? 'bg-[#00e676]/15 border border-[#00e676]/50 text-white font-black'
              : 'bg-[#111622] text-slate-200'
          }`}
        >
          <div 
            onClick={(e) => {
              if (m.player2 && onSelectPlayer) {
                e.stopPropagation();
                onSelectPlayer(m.player2.id || m.player2.name);
              } else if (isAdmin && onAssignSlot && m.round === 1 && m.status === 'SCHEDULED') {
                e.stopPropagation();
                onAssignSlot(m, 2);
              }
            }}
            title={m.player2 ? "Ver ficha y estadísticas del jugador" : isAdmin && onAssignSlot && m.round === 1 ? "Click para asignar jugador" : undefined}
            className={`flex items-center gap-2 truncate ${m.player2 ? 'cursor-pointer hover:text-[#00e676]' : isAdmin && onAssignSlot && m.round === 1 ? 'cursor-pointer hover:text-blue-400' : ''}`}
          >
            <span className="text-sm select-none" title={m.player2?.nationality || 'Argentina'}>
              {getCountryFlag(m.player2?.countryCode || m.player2?.nationality || 'AR')}
            </span>
            {m.player2?.avatarUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-black">
                <Image src={m.player2.avatarUrl} alt={m.player2.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                {m.player2?.name ? m.player2.name.slice(0, 1) : '?'}
              </div>
            )}
            <span className="text-xs truncate font-bold">
              {m.player2 ? m.player2.name : (
                <span className="text-slate-500 italic">Por definir</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isAdmin && onAssignSlot && m.round === 1 && m.status === 'SCHEDULED' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignSlot(m, 2);
                }}
                className="p-1 rounded-md bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[9px] font-bold flex items-center gap-0.5"
                title="Asignar / Cambiar Jugador en Slot 2"
              >
                <UserPlus className="w-3 h-3" />
              </button>
            )}
            {m.distanceMode === 'SETS' && (
              <span className="font-mono font-bold text-xs text-[#ffe600] px-1.5 py-0.5 rounded bg-[#ffe600]/10 border border-[#ffe600]/30" title="Sets ganados">
                {m.scoreSetsP2 || 0}S
              </span>
            )}
            <span
              className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
                isP2Winner ? 'bg-[#00e676] text-[#07090e]' : 'bg-[#07090e] text-white border border-slate-800'
              }`}
            >
              {m.scoreP2}
            </span>
          </div>
        </div>

        {/* Call to action si es jugable */}
        {isPlayable && (
          <div className="pt-2 mt-2 border-t border-slate-800/80 text-center">
            <span className="text-[10px] font-black text-[#00e676] group-hover:underline flex items-center justify-center gap-1">
              <Play className="w-3 h-3 fill-current" />
              <span>Tocar para abrir partida</span>
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* PODIO OFICIAL DE PREMIACIÓN (CHALLONGE / N01 STYLE) */}
      {podium && (podium.first || podium.second || podium.third) && (
        <TournamentPodiumView
          podium={podium}
          prizesBreakdown={prizesBreakdown}
          onSelectPlayer={onSelectPlayer ? (id, name) => onSelectPlayer({ id, name }) : undefined}
        />
      )}

      {/* BARRA DE HERRAMIENTAS DE GESTIÓN DE LLAVE ESTILO NAKKA N01 */}
      {isAdmin && (onAutoAssign || onClearBracket) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090d16] border border-blue-500/30 shadow-lg shadow-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-2">
                <span>Gestión de Llave (Estilo Nakka N01)</span>
                {enrolledCount !== undefined && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {enrolledCount} inscriptos
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Siembra automática o asignación manual slot a slot para la primera ronda
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Checkbox Modo Aleatorio */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111622] border border-slate-700 text-xs text-slate-200 cursor-pointer hover:border-slate-500 transition-colors select-none">
              <input
                type="checkbox"
                checked={isRandomSeeding}
                onChange={(e) => setIsRandomSeeding(e.target.checked)}
                className="rounded border-slate-700 text-[#00e676] focus:ring-0"
              />
              <span className="font-bold flex items-center gap-1">
                <Shuffle className="w-3 h-3 text-slate-400" />
                Aleatorio
              </span>
            </label>

            {/* Botón Asignación Automática */}
            {onAutoAssign && (
              <button
                type="button"
                onClick={() => onAutoAssign(isRandomSeeding)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
                title="Sembrar automáticamente los inscriptos en los partidos de la primera ronda"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Asignación Automática</span>
              </button>
            )}

            {/* Botón Sorteo a Ciegas de Parejas (Blind Draw) */}
            {onBlindDrawPairs && (
              <button
                type="button"
                onClick={onBlindDrawPairs}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
                title="Sortear duplas aleatorias entre los inscriptos y sembrarlas en la llave"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>🎲 Sortear Parejas (Blind Draw)</span>
              </button>
            )}

            {/* Botón Despejar Llave */}
            {onClearBracket && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Seguro que deseas despejar los emparejamientos de la llave? Los jugadores inscriptos no se borrarán del torneo.')) {
                    onClearBracket();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/40 font-black text-xs transition-all active:scale-95"
                title="Limpiar emparejamientos y dejar los slots vacíos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Despejar Llave</span>
              </button>
            )}

            {/* Botón Pantalla TV 32" Estilo Nakka */}
            {onOpenTvView && (
              <button
                type="button"
                onClick={onOpenTvView}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 ml-auto"
                title="Abrir pantalla completa para TV de 32'' sin scroll (Estilo Nakka N01)"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>📺 Pantalla TV 32&quot; (Nakka) ↗</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑAS DE DOBLE ELIMINACIÓN (SI APLICA) */}
      {isDoubleElim && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black border border-slate-800">
          <button
            type="button"
            onClick={() => setDeTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              deTab === 'ALL'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            👁️ Ver Todo
          </button>
          <button
            type="button"
            onClick={() => setDeTab('WINNERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              deTab === 'WINNERS'
                ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                : 'text-slate-400 hover:text-[#00e676] hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#00e676]" />
            <span>Ganadores (Por Arriba)</span>
          </button>
          <button
            type="button"
            onClick={() => setDeTab('LOSERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              deTab === 'LOSERS'
                ? 'bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/20'
                : 'text-slate-400 hover:text-[#ef4444] hover:bg-slate-900'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>Perdedores (Por Abajo)</span>
          </button>
          <button
            type="button"
            onClick={() => setDeTab('FINALS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              deTab === 'FINALS'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Gran Final</span>
          </button>
        </div>
      )}

      {/* VISTA 1: DOBLE ELIMINACIÓN */}
      {isDoubleElim ? (
        <div className="space-y-8">
          {/* SECCIÓN A: CUADRO DE GANADORES (POR ARRIBA) */}
          {(deTab === 'ALL' || deTab === 'WINNERS') && (
            <div className="space-y-3 bg-black/60 border border-[#00e676]/30 p-4 rounded-3xl">
              <div className="flex items-center justify-between border-b border-[#00e676]/20 pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#00e676]" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Cuadro de Ganadores • Por Arriba (Winners Bracket)
                  </h4>
                </div>
                <span className="text-[11px] text-[#00e676] font-bold">
                  El perdedor desciende al cuadro de perdedores
                </span>
              </div>

              <div className="w-full overflow-x-auto pb-3">
                <div className="min-w-[940px] flex items-start gap-10 justify-between px-2">
                  {winnersRounds.map((r, idx) => {
                    const roundList = winnersMatches.filter((m) => m.round === r);
                    const paddingTop = idx === 0 ? '' : idx === 1 ? 'pt-10' : 'pt-20';
                    return (
                      <div key={`w-round-${r}`} className={`flex flex-col gap-5 ${paddingTop}`}>
                        <div className="text-xs font-black text-[#00e676] uppercase tracking-wider pb-1 border-b border-[#00e676]/20 flex items-center justify-between">
                          <span>{getWinnersRoundTitle(r, maxWinnersRound)}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({roundList.length})</span>
                        </div>
                        <div className="flex flex-col gap-5">{roundList.map(renderMatchCard)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN B: CUADRO DE PERDEDORES (POR ABAJO) */}
          {(deTab === 'ALL' || deTab === 'LOSERS') && (
            <div className="space-y-3 bg-black/60 border border-[#ef4444]/30 p-4 rounded-3xl">
              <div className="flex items-center justify-between border-b border-[#ef4444]/20 pb-2">
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-[#ef4444]" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Cuadro de Perdedores • Por Abajo (Losers Bracket)
                  </h4>
                </div>
                <span className="text-[11px] text-[#ef4444] font-bold">
                  Segunda derrota = Eliminación definitiva
                </span>
              </div>

              <div className="w-full overflow-x-auto pb-3">
                <div className="min-w-[940px] flex items-start gap-10 justify-between px-2">
                  {losersRounds.map((r, idx) => {
                    const roundList = losersMatches.filter((m) => m.round === r);
                    const paddingTop = idx === 0 ? '' : idx % 2 === 1 ? 'pt-8' : 'pt-14';
                    return (
                      <div key={`l-round-${r}`} className={`flex flex-col gap-5 ${paddingTop}`}>
                        <div className="text-xs font-black text-[#ef4444] uppercase tracking-wider pb-1 border-b border-[#ef4444]/20 flex items-center justify-between">
                          <span>{getLosersRoundTitle(r, maxLosersRound)}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({roundList.length})</span>
                        </div>
                        <div className="flex flex-col gap-5">{roundList.map(renderMatchCard)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN C: GRAN FINAL (CAMPEÓN GANADORES vs CAMPEÓN PERDEDORES) */}
          {(deTab === 'ALL' || deTab === 'FINALS') && grandFinalMatches.length > 0 && (
            <div className="bg-black/90 border-2 border-amber-500/60 p-5 rounded-3xl space-y-3 shadow-2xl shadow-amber-500/10">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                    Gran Final del Torneo (Campeón Ganadores vs Campeón Perdedores)
                  </h4>
                </div>
                <span className="text-[11px] text-amber-400 font-bold">
                  Partida de Campeonato
                </span>
              </div>
              <div className="flex items-center justify-center py-4">
                {grandFinalMatches.map(renderMatchCard)}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VISTA 2: ELIMINACIÓN DIRECTA ESTÁNDAR (DINÁMICA) */
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[940px] flex items-start gap-12 justify-between px-2">
            {singleRounds.map((r, idx) => {
              const roundList = matches.filter(
                (m) => m.round === r && (!m.bracketType || m.bracketType === 'WINNERS' || (r === maxSingleRound && m.bracketType === 'FINALS')) && m.id !== 'se_third_place'
              );
              const paddingTop = idx === 0 ? '' : idx === 1 ? 'pt-12' : idx === 2 ? 'pt-24' : 'pt-32';
              return (
                <div key={`s-round-${r}`} className={`flex flex-col gap-6 ${paddingTop}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {getSingleRoundTitle(r, maxSingleRound)}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                      {roundList.length} {roundList.length === 1 ? 'partido' : 'partidos'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-6">{roundList.map(renderMatchCard)}</div>
                </div>
              );
            })}

            {/* PARTIDO OPCIONAL POR EL 3ER PUESTO */}
            {thirdPlaceMatch && (
              <div className="flex flex-col gap-6 pt-24">
                <div className="flex items-center gap-2 pb-2 border-b border-[#cd7f32]/40">
                  <Award className="w-4 h-4 text-[#cd7f32]" />
                  <span className="text-xs font-black text-[#cd7f32] uppercase tracking-wider">
                    3º y 4º Puesto (Bronce)
                  </span>
                </div>
                <div className="flex flex-col gap-6">{renderMatchCard(thirdPlaceMatch)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
