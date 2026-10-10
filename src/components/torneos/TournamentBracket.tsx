'use client';

import React from 'react';
import Image from 'next/image';
import { TournamentBracketMatch } from '@/lib/types';
import { Trophy, Clock, CheckCircle2, Play } from 'lucide-react';

interface TournamentBracketProps {
  matches: TournamentBracketMatch[];
  onUpdateScore?: (matchId: string, p1Score: number, p2Score: number, winnerId?: string) => void;
  bestOfLegs?: number;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  matches,
  onUpdateScore,
  bestOfLegs = 7
}) => {
  // Agrupar partidas por ronda
  // Ronda 1 = Cuartos (4 partidas), Ronda 2 = Semis (2 partidas), Ronda 3 = Final (1 partida)
  const round1 = matches.filter((m) => m.round === 1);
  const round2 = matches.filter((m) => m.round === 2);
  const round3 = matches.filter((m) => m.round === 3);

  const legsToWin = Math.ceil(bestOfLegs / 2);

  const renderMatchCard = (m: TournamentBracketMatch) => {
    const isP1Winner = m.winnerId && m.player1 && m.winnerId === m.player1.id;
    const isP2Winner = m.winnerId && m.player2 && m.winnerId === m.player2.id;

    return (
      <div
        key={m.id}
        className={`w-72 rounded-2xl border p-3 shadow-lg transition-all ${
          m.status === 'LIVE'
            ? 'bg-[#132238] border-emerald-500 ring-2 ring-emerald-500/30'
            : m.status === 'FINISHED'
            ? 'bg-[#0f172a] border-slate-800'
            : 'bg-[#0b101d] border-slate-800/80'
        }`}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2">
          <span>Partida #{m.matchIndex + 1}</span>
          {m.status === 'LIVE' ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/50 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              EN VIVO
            </span>
          ) : m.status === 'FINISHED' ? (
            <span className="text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Finalizado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              {m.scheduledTime || 'Pendiente'}
            </span>
          )}
        </div>

        {/* Jugador 1 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition-all ${
            isP1Winner
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-white font-extrabold'
              : 'bg-slate-900/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {m.player1?.avatarUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                <Image src={m.player1.avatarUrl} alt={m.player1.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                ?
              </div>
            )}
            <span className="text-xs truncate">
              {m.player1 ? m.player1.name : 'Por definir'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                isP1Winner ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
              }`}
            >
              {m.scoreP1}
            </span>
            {onUpdateScore && m.player1 && m.player2 && m.status !== 'FINISHED' && (
              <button
                type="button"
                onClick={() => {
                  const newScore = m.scoreP1 + 1;
                  const winner = newScore >= legsToWin ? m.player1?.id : undefined;
                  onUpdateScore(m.id, newScore, m.scoreP2, winner);
                }}
                className="w-5 h-5 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 rounded text-xs font-bold"
                title="Sumar pierna"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Jugador 2 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            isP2Winner
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-white font-extrabold'
              : 'bg-slate-900/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {m.player2?.avatarUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                <Image src={m.player2.avatarUrl} alt={m.player2.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                ?
              </div>
            )}
            <span className="text-xs truncate">
              {m.player2 ? m.player2.name : 'Por definir'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                isP2Winner ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
              }`}
            >
              {m.scoreP2}
            </span>
            {onUpdateScore && m.player1 && m.player2 && m.status !== 'FINISHED' && (
              <button
                type="button"
                onClick={() => {
                  const newScore = m.scoreP2 + 1;
                  const winner = newScore >= legsToWin ? m.player2?.id : undefined;
                  onUpdateScore(m.id, m.scoreP1, newScore, winner);
                }}
                className="w-5 h-5 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 rounded text-xs font-bold"
                title="Sumar pierna"
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-[950px] flex items-center justify-between gap-8 px-4">
        {/* COLUMNA CUARTOS DE FINAL */}
        <div className="space-y-6 flex-1">
          <div className="text-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">
              Cuartos de Final
            </h4>
            <span className="text-[10px] text-slate-500 font-bold">Al mejor de {bestOfLegs} legs</span>
          </div>
          <div className="space-y-4">
            {round1.map(renderMatchCard)}
          </div>
        </div>

        {/* CONECTOR FLECHA */}
        <div className="text-slate-700 font-bold text-xl select-none">→</div>

        {/* COLUMNA SEMIFINALES */}
        <div className="space-y-12 flex-1">
          <div className="text-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Semifinales
            </h4>
            <span className="text-[10px] text-slate-500 font-bold">Al mejor de {bestOfLegs} legs</span>
          </div>
          <div className="space-y-12">
            {round2.map(renderMatchCard)}
          </div>
        </div>

        {/* CONECTOR FLECHA */}
        <div className="text-slate-700 font-bold text-xl select-none">→</div>

        {/* COLUMNA GRAN FINAL */}
        <div className="space-y-6 flex-1">
          <div className="text-center pb-2 border-b border-slate-800">
            <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Gran Final
            </h4>
            <span className="text-[10px] text-slate-500 font-bold">Por el Campeonato Oficial</span>
          </div>
          <div className="flex justify-center pt-8">
            {round3.map(renderMatchCard)}
          </div>
        </div>
      </div>
    </div>
  );
};
