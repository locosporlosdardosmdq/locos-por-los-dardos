'use client';

import React from 'react';
import Image from 'next/image';
import { TournamentBracketMatch } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { Trophy, Clock, CheckCircle2, Play, ShieldAlert } from 'lucide-react';

interface TournamentBracketProps {
  matches: TournamentBracketMatch[];
  onSelectMatch?: (match: TournamentBracketMatch) => void;
  onUpdateScore?: (matchId: string, p1Score: number, p2Score: number, winnerId?: string, note?: string) => void;
  bestOfLegs?: number;
  isAdmin?: boolean;
  onAdminEditMatch?: (match: TournamentBracketMatch) => void;
  onSelectPlayer?: (player: any) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  onSelectMatch,
  onUpdateScore,
  bestOfLegs = 5,
  isAdmin = false,
  onAdminEditMatch,
  onSelectPlayer
}) => {
  const round1 = matches.filter((m) => m.round === 1);
  const round2 = matches.filter((m) => m.round === 2);
  const round3 = matches.filter((m) => m.round === 3);

  const legsToWin = Math.ceil(bestOfLegs / 2);

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
              }
            }}
            title={m.player1 ? "Ver ficha y estadísticas del jugador" : undefined}
            className={`flex items-center gap-2 truncate ${m.player1 ? 'cursor-pointer hover:text-[#00e676]' : ''}`}
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
              {m.player1 ? m.player1.name : 'Por definir'}
            </span>
          </div>

          <span
            className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
              isP1Winner ? 'bg-[#00e676] text-[#07090e]' : 'bg-[#07090e] text-white border border-slate-800'
            }`}
          >
            {m.scoreP1}
          </span>
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
              }
            }}
            title={m.player2 ? "Ver ficha y estadísticas del jugador" : undefined}
            className={`flex items-center gap-2 truncate ${m.player2 ? 'cursor-pointer hover:text-[#00e676]' : ''}`}
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
              {m.player2 ? m.player2.name : 'Por definir'}
            </span>
          </div>

          <span
            className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-lg ${
              isP2Winner ? 'bg-[#00e676] text-[#07090e]' : 'bg-[#07090e] text-white border border-slate-800'
            }`}
          >
            {m.scoreP2}
          </span>
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
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[940px] flex items-start gap-12 justify-between px-2">
        {/* RONDA 1: CUARTOS DE FINAL */}
        {round1.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-2 border-b border-[#ef4444]/30">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Cuartos de Final
              </span>
              <span className="text-[10px] bg-[#ef4444]/20 text-[#ef4444] px-2 py-0.5 rounded-full font-bold">
                {round1.length} partidos
              </span>
            </div>
            <div className="flex flex-col gap-6">{round1.map(renderMatchCard)}</div>
          </div>
        )}

        {/* RONDA 2: SEMIFINALES */}
        {round2.length > 0 && (
          <div className="flex flex-col gap-6 pt-12">
            <div className="flex items-center gap-2 pb-2 border-b border-[#00e676]/30">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Semifinales
              </span>
              <span className="text-[10px] bg-[#00e676]/20 text-[#00e676] px-2 py-0.5 rounded-full font-bold">
                {round2.length} partidos
              </span>
            </div>
            <div className="flex flex-col gap-16">{round2.map(renderMatchCard)}</div>
          </div>
        )}

        {/* RONDA 3: GRAN FINAL */}
        {round3.length > 0 && (
          <div className="flex flex-col gap-6 pt-24">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-500/30">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Gran Final del Torneo
              </span>
            </div>
            <div className="flex flex-col gap-6">{round3.map(renderMatchCard)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
