'use client';

import React from 'react';
import Image from 'next/image';
import { TournamentBracketMatch } from '@/lib/types';
import { Trophy, Clock, CheckCircle2 } from 'lucide-react';

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
        className={`w-72 rounded-2xl border p-3.5 shadow-xl transition-all ${
          m.status === 'LIVE'
            ? 'bg-[#1e2433] border-[#00b853] ring-2 ring-[#00b853]/40 shadow-[#00b853]/20'
            : m.status === 'FINISHED'
            ? 'bg-[#1c1f2b] border-[#313647]'
            : 'bg-[#14161f] border-[#313647]/80'
        }`}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between text-[11px] font-bold text-[#b8ad98] border-b border-[#313647] pb-2 mb-2">
          <span>Partida #{m.matchIndex + 1}</span>
          {m.status === 'LIVE' ? (
            <span className="flex items-center gap-1.5 text-[#00b853] bg-[#00b853]/15 px-2.5 py-0.5 rounded-full border border-[#00b853]/40 animate-pulse font-black text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b853]"></span>
              EN VIVO
            </span>
          ) : m.status === 'FINISHED' ? (
            <span className="text-[#b8ad98] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00b853]" />
              Finalizado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#b8ad98]/70">
              <Clock className="w-3 h-3" />
              {m.scheduledTime || 'Pendiente'}
            </span>
          )}
        </div>

        {/* Jugador 1 */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition-all ${
            isP1Winner
              ? 'bg-[#00b853]/20 border border-[#00b853]/50 text-white font-extrabold'
              : 'bg-[#242836] text-[#efe7d8]'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {m.player1?.avatarUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-[#14161f]">
                <Image src={m.player1.avatarUrl} alt={m.player1.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#14161f] text-[10px] flex items-center justify-center font-bold text-[#b8ad98]">
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
                isP1Winner ? 'bg-[#00b853] text-[#0d0e12]' : 'bg-[#14161f] text-white'
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
                className="w-5 h-5 bg-[#14161f] hover:bg-[#00b853] hover:text-[#0d0e12] text-[#efe7d8] rounded text-xs font-bold"
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
              ? 'bg-[#00b853]/20 border border-[#00b853]/50 text-white font-extrabold'
              : 'bg-[#242836] text-[#efe7d8]'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {m.player2?.avatarUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-[#14161f]">
                <Image src={m.player2.avatarUrl} alt={m.player2.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#14161f] text-[10px] flex items-center justify-center font-bold text-[#b8ad98]">
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
                isP2Winner ? 'bg-[#00b853] text-[#0d0e12]' : 'bg-[#14161f] text-white'
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
                className="w-5 h-5 bg-[#14161f] hover:bg-[#00b853] hover:text-[#0d0e12] text-[#efe7d8] rounded text-xs font-bold"
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
          <div className="text-center pb-2 border-b border-[#313647]">
            <h4 className="text-xs font-black uppercase text-[#00b853] tracking-wider">
              Cuartos de Final
            </h4>
            <span className="text-[10px] text-[#b8ad98] font-bold">Al mejor de {bestOfLegs} legs</span>
          </div>
          <div className="space-y-4">
            {round1.map(renderMatchCard)}
          </div>
        </div>

        {/* CONECTOR FLECHA */}
        <div className="text-[#313647] font-bold text-xl select-none">→</div>

        {/* COLUMNA SEMIFINALES EN AZUL SAMURAI */}
        <div className="space-y-12 flex-1">
          <div className="text-center pb-2 border-b border-[#313647]">
            <h4 className="text-xs font-black uppercase text-[#38bdf8] tracking-wider">
              Semifinales
            </h4>
            <span className="text-[10px] text-[#b8ad98] font-bold">Al mejor de {bestOfLegs} legs</span>
          </div>
          <div className="space-y-12">
            {round2.map(renderMatchCard)}
          </div>
        </div>

        {/* CONECTOR FLECHA */}
        <div className="text-[#313647] font-bold text-xl select-none">→</div>

        {/* COLUMNA GRAN FINAL EN ROJO BULLSEYE */}
        <div className="space-y-6 flex-1">
          <div className="text-center pb-2 border-b border-[#313647]">
            <h4 className="text-xs font-black uppercase text-[#e52521] tracking-wider flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#e52521]" />
              Gran Final
            </h4>
            <span className="text-[10px] text-[#b8ad98] font-bold">Por el Campeonato Oficial</span>
          </div>
          <div className="flex justify-center pt-8">
            {round3.map(renderMatchCard)}
          </div>
        </div>
      </div>
    </div>
  );
};
