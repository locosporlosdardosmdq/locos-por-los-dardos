'use client';

import React, { useState } from 'react';
import { MatchDispatcherModal } from './MatchDispatcherModal';
import { 
  Users, 
  Trophy, 
  Shuffle, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Target
} from 'lucide-react';

export interface GroupPlayer {
  id: string;
  name: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  legsFor: number;
  legsAgainst: number;
  points: number;
}

export interface GroupMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  scoreP1: number;
  scoreP2: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  winnerId?: string;
}

interface TournamentGroupStageProps {
  tournamentTitle: string;
  bestOfLegs: number;
  onLaunchMatch: (match: GroupMatch, mode: 'LIVE' | 'ONLINE') => void;
  onAdvanceToBracket?: (qualifiedPlayers: GroupPlayer[]) => void;
}

export const TournamentGroupStage: React.FC<TournamentGroupStageProps> = ({
  tournamentTitle,
  bestOfLegs,
  onLaunchMatch,
  onAdvanceToBracket
}) => {
  // Grupo 1 inicial con jugadores de la comunidad
  const [groupPlayers, setGroupPlayers] = useState<GroupPlayer[]>([
    { id: 'p1', name: 'Facundo López (Tiburón MDQ)', matchesPlayed: 2, matchesWon: 2, matchesLost: 0, legsFor: 4, legsAgainst: 1, points: 4 },
    { id: 'p2', name: 'Martín Rossi (Sniper CABA)', matchesPlayed: 2, matchesWon: 1, matchesLost: 1, legsFor: 3, legsAgainst: 2, points: 2 },
    { id: 'p3', name: 'Diego Gómez (Flecha Negra)', matchesPlayed: 2, matchesWon: 1, matchesLost: 1, legsFor: 2, legsAgainst: 3, points: 2 },
    { id: 'p4', name: 'Lucas Pereyra (El Zurdo)', matchesPlayed: 2, matchesWon: 0, matchesLost: 2, legsFor: 1, legsAgainst: 4, points: 0 }
  ]);

  // Partidos del grupo
  const [groupMatches, setGroupMatches] = useState<GroupMatch[]>([
    { id: 'gm-1', player1Id: 'p1', player2Id: 'p2', player1Name: 'Facundo López', player2Name: 'Martín Rossi', scoreP1: 2, scoreP2: 1, status: 'FINISHED', winnerId: 'p1' },
    { id: 'gm-2', player1Id: 'p3', player2Id: 'p4', player1Name: 'Diego Gómez', player2Name: 'Lucas Pereyra', scoreP1: 2, scoreP2: 0, status: 'FINISHED', winnerId: 'p3' },
    { id: 'gm-3', player1Id: 'p1', player2Id: 'p3', player1Name: 'Facundo López', player2Name: 'Diego Gómez', scoreP1: 2, scoreP2: 0, status: 'FINISHED', winnerId: 'p1' },
    { id: 'gm-4', player1Id: 'p2', player2Id: 'p4', player1Name: 'Martín Rossi', player2Name: 'Lucas Pereyra', scoreP1: 2, scoreP2: 1, status: 'FINISHED', winnerId: 'p2' },
    { id: 'gm-5', player1Id: 'p1', player2Id: 'p4', player1Name: 'Facundo López', player2Name: 'Lucas Pereyra', scoreP1: 0, scoreP2: 0, status: 'SCHEDULED' },
    { id: 'gm-6', player1Id: 'p2', player2Id: 'p3', player1Name: 'Martín Rossi', player2Name: 'Diego Gómez', scoreP1: 0, scoreP2: 0, status: 'SCHEDULED' }
  ]);

  // Partido seleccionado para el dispatcher modal
  const [activeDispatchMatch, setActiveDispatchMatch] = useState<GroupMatch | null>(null);

  // Ordenar posiciones por puntos y diferencia de legs (+/-)
  const sortedStandings = [...groupPlayers].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffB = b.legsFor - b.legsAgainst;
    const diffA = a.legsFor - a.legsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.legsFor - a.legsFor;
  });

  const handleSaveQuickResult = (scoreP1: number, scoreP2: number, winnerId: string) => {
    if (!activeDispatchMatch) return;

    // Actualizar partido
    setGroupMatches((prev) =>
      prev.map((m) =>
        m.id === activeDispatchMatch.id
          ? {
              ...m,
              scoreP1,
              scoreP2,
              status: 'FINISHED' as const,
              winnerId
            }
          : m
      )
    );

    // Actualizar estadísticas del grupo
    setGroupPlayers((prev) =>
      prev.map((p) => {
        if (p.id === activeDispatchMatch.player1Id) {
          const isWinner = winnerId === p.id;
          return {
            ...p,
            matchesPlayed: p.matchesPlayed + 1,
            matchesWon: isWinner ? p.matchesWon + 1 : p.matchesWon,
            matchesLost: !isWinner ? p.matchesLost + 1 : p.matchesLost,
            legsFor: p.legsFor + scoreP1,
            legsAgainst: p.legsAgainst + scoreP2,
            points: p.points + (isWinner ? 2 : 0)
          };
        }
        if (p.id === activeDispatchMatch.player2Id) {
          const isWinner = winnerId === p.id;
          return {
            ...p,
            matchesPlayed: p.matchesPlayed + 1,
            matchesWon: isWinner ? p.matchesWon + 1 : p.matchesWon,
            matchesLost: !isWinner ? p.matchesLost + 1 : p.matchesLost,
            legsFor: p.legsFor + scoreP2,
            legsAgainst: p.legsAgainst + scoreP1,
            points: p.points + (isWinner ? 2 : 0)
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-5">
      {/* Cabecera y controles del grupo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f1422] border border-[#ef4444]/30 rounded-2xl p-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00e676]" />
            <span>Grupo 1 • Round Robin (Todos contra Todos)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Victoria = 2 pts • Criterio de desempate: 1º Puntos, 2º Dif Legs (+/-), 3º Legs a favor
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAdvanceToBracket && (
            <button
              onClick={() => onAdvanceToBracket(sortedStandings.slice(0, 2))}
              className="px-3.5 py-2 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00e676]/20"
            >
              <span>Cruzar a Cuadro Final</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* TABLA DE POSICIONES OFICIAL DEL GRUPO */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#07090e] border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-3 text-center w-12">Pos</th>
                <th className="py-3 px-4">Jugador / Equipo</th>
                <th className="py-3 px-3 text-center">PJ</th>
                <th className="py-3 px-3 text-center">G</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">LF</th>
                <th className="py-3 px-3 text-center">LC</th>
                <th className="py-3 px-3 text-center">+/-</th>
                <th className="py-3 px-4 text-center font-black text-[#00e676]">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-bold">
              {sortedStandings.map((p, idx) => {
                const diff = p.legsFor - p.legsAgainst;
                const isClassified = idx < 2;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isClassified ? 'bg-[#00e676]/5 hover:bg-[#00e676]/10' : 'hover:bg-[#111622]'
                    }`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          idx === 0
                            ? 'bg-[#eab308] text-black'
                            : idx === 1
                            ? 'bg-slate-300 text-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-white">
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {isClassified && (
                          <span className="text-[10px] bg-[#00e676]/20 text-[#00e676] px-2 py-0.5 rounded-full font-bold">
                            Clasifica
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-400">{p.matchesPlayed}</td>
                    <td className="py-3.5 px-3 text-center text-[#00e676]">{p.matchesWon}</td>
                    <td className="py-3.5 px-3 text-center text-[#ef4444]">{p.matchesLost}</td>
                    <td className="py-3.5 px-3 text-center">{p.legsFor}</td>
                    <td className="py-3.5 px-3 text-center">{p.legsAgainst}</td>
                    <td
                      className={`py-3.5 px-3 text-center font-black ${
                        diff > 0 ? 'text-[#00e676]' : diff < 0 ? 'text-[#ef4444]' : 'text-slate-400'
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-[#00e676] text-sm">
                      {p.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRILLA DE ENFRENTAMIENTOS Y CRUCES DE PARTIDOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
            Partidos del Grupo (Toca para jugar en vivo o cargar resultado)
          </h4>
          <span className="text-[11px] text-slate-400">Primero a 2 legs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groupMatches.map((m) => {
            const isFinished = m.status === 'FINISHED';

            return (
              <div
                key={m.id}
                onClick={() => setActiveDispatchMatch(m)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-md ${
                  isFinished
                    ? 'bg-[#0f1422] border-slate-800 hover:border-slate-600'
                    : 'bg-[#0f1422] border-[#ef4444]/40 hover:border-[#00e676]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-bold">Legs al mejor de {bestOfLegs}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                      isFinished
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-[#ef4444]/20 text-[#ef4444] animate-pulse'
                    }`}
                  >
                    {isFinished ? 'FINALIZADO' : 'POR JUGAR'}
                  </span>
                </div>

                <div className="flex items-center justify-between font-black text-sm">
                  <div className="truncate flex-1">
                    <span className={m.winnerId === m.player1Id ? 'text-[#00e676]' : 'text-white'}>
                      {m.player1Name}
                    </span>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-[#07090e] border border-slate-800 text-center mx-2 text-xs font-black">
                    {isFinished ? `${m.scoreP1} - ${m.scoreP2}` : 'vs'}
                  </div>

                  <div className="truncate flex-1 text-right">
                    <span className={m.winnerId === m.player2Id ? 'text-[#00e676]' : 'text-white'}>
                      {m.player2Name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISPATCHER MODAL */}
      {activeDispatchMatch && (
        <MatchDispatcherModal
          isOpen={!!activeDispatchMatch}
          onClose={() => setActiveDispatchMatch(null)}
          matchTitle="Fase de Grupos • Grupo 1"
          player1Name={activeDispatchMatch.player1Name}
          player2Name={activeDispatchMatch.player2Name}
          player1Id={activeDispatchMatch.player1Id}
          player2Id={activeDispatchMatch.player2Id}
          bestOfLegs={bestOfLegs}
          onLaunchLiveMatch={() => onLaunchMatch(activeDispatchMatch, 'LIVE')}
          onLaunchOnlineMatch={() => onLaunchMatch(activeDispatchMatch, 'ONLINE')}
          onSaveQuickResult={handleSaveQuickResult}
        />
      )}
    </div>
  );
};
