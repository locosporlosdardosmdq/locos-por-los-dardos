'use client';

import React, { useState, useEffect } from 'react';
import { MatchDispatcherModal } from './MatchDispatcherModal';
import { PlayerProfile } from '@/lib/types';
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

export interface GroupEnrolledPlayer {
  id: string;
  name: string;
  nickname?: string;
  avatarUrl?: string;
  seed?: number;
  avg?: number;
  isBye?: boolean;
}

interface TournamentGroupStageProps {
  tournamentTitle: string;
  bestOfLegs: number;
  groupsCount?: number;
  qualifiersPerGroup?: number;
  enrolledPlayers?: GroupEnrolledPlayer[];
  onLaunchMatch: (match: GroupMatch, mode: 'LIVE' | 'ONLINE') => void;
  onAdvanceToBracket?: (qualifiedPlayers: GroupPlayer[]) => void;
  onUpdateQualifiersPerGroup?: (count: number) => void;
}

interface ZoneData {
  players: GroupPlayer[];
  matches: GroupMatch[];
}

function initializeAllZones(enrolled: GroupEnrolledPlayer[], totalZones: number): Record<number, ZoneData> {
  const state: Record<number, ZoneData> = {};
  for (let i = 0; i < totalZones; i++) {
    const players = buildGroupPlayersForZone(enrolled, i, totalZones);
    const matches = buildRoundRobinMatches(players, i);
    state[i] = { players, matches };
  }
  return state;
}

export const TournamentGroupStage: React.FC<TournamentGroupStageProps> = ({
  tournamentTitle,
  bestOfLegs,
  groupsCount = 2,
  qualifiersPerGroup = 2,
  enrolledPlayers = [],
  onLaunchMatch,
  onAdvanceToBracket,
  onUpdateQualifiersPerGroup
}) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [qualifiersCount, setQualifiersCount] = useState<number>(qualifiersPerGroup);

  useEffect(() => {
    setQualifiersCount(qualifiersPerGroup);
  }, [qualifiersPerGroup]);

  // Almacenar el estado de TODAS las zonas de forma independiente para que alternar entre zonas no borre resultados
  const [zonesState, setZonesState] = useState<Record<number, ZoneData>>(() => {
    return initializeAllZones(enrolledPlayers, groupsCount);
  });

  const enrolledFingerprint = enrolledPlayers.map((p) => p.id).join(',');

  // Si cambia la estructura o cantidad de zonas, sincronizar preservando zonas existentes
  useEffect(() => {
    setZonesState((prev) => {
      const allZonesPresent = Array.from({ length: groupsCount }).every((_, i) => !!prev[i]);
      if (!allZonesPresent) {
        return initializeAllZones(enrolledPlayers, groupsCount);
      }
      return prev;
    });
  }, [enrolledFingerprint, groupsCount]);

  // Obtener datos de la zona actualmente seleccionada
  const currentZoneData = zonesState[selectedGroupIndex] || {
    players: buildGroupPlayersForZone(enrolledPlayers, selectedGroupIndex, groupsCount),
    matches: buildRoundRobinMatches(buildGroupPlayersForZone(enrolledPlayers, selectedGroupIndex, groupsCount), selectedGroupIndex)
  };

  const groupPlayers = currentZoneData.players;
  const groupMatches = currentZoneData.matches;

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
    // Guardia de seguridad: evitar doble conteo si el partido ya estaba finalizado
    if (activeDispatchMatch.status === 'FINISHED') return;

    setZonesState((prev) => {
      const current = prev[selectedGroupIndex] || currentZoneData;
      const updatedMatches = current.matches.map((m) =>
        m.id === activeDispatchMatch.id
          ? {
              ...m,
              scoreP1,
              scoreP2,
              status: 'FINISHED' as const,
              winnerId
            }
          : m
      );

      const updatedPlayers = current.players.map((p) => {
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
      });

      return {
        ...prev,
        [selectedGroupIndex]: {
          players: updatedPlayers,
          matches: updatedMatches
        }
      };
    });
  };

  // Función para cruzar los mejores clasificados de TODAS las zonas hacia la llave de playoffs
  const handleAdvanceAllToPlayoffs = () => {
    if (!onAdvanceToBracket) return;

    const allQualifiedPlayers: GroupPlayer[] = [];
    for (let i = 0; i < groupsCount; i++) {
      const zoneData = zonesState[i];
      if (zoneData) {
        const sorted = [...zoneData.players].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const diffB = b.legsFor - b.legsAgainst;
          const diffA = a.legsFor - a.legsAgainst;
          if (diffB !== diffA) return diffB - diffA;
          return b.legsFor - a.legsFor;
        });
        allQualifiedPlayers.push(...sorted.slice(0, qualifiersCount));
      }
    }

    onAdvanceToBracket(allQualifiedPlayers);
  };

  return (
    <div className="space-y-5">
      {/* SELECTOR DE ZONAS / GRUPOS */}
      {groupsCount > 1 && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black border border-slate-800">
          {Array.from({ length: groupsCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedGroupIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                selectedGroupIndex === idx
                  ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Zona {String.fromCharCode(65 + idx)} • Grupo {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Cabecera y controles del grupo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f1422] border border-[#ef4444]/30 rounded-2xl p-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00e676]" />
            <span>Zona {String.fromCharCode(65 + selectedGroupIndex)} • Grupo {selectedGroupIndex + 1} • Round Robin</span>
          </h3>
          <p className="text-xs text-slate-400">
            Victoria = 2 pts • Criterio de desempate: 1º Puntos, 2º Dif Legs (+/-), 3º Legs a favor
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SELECTOR: CUÁNTOS PASAN A LA SIGUIENTE INSTANCIA */}
          <div className="flex items-center gap-2 bg-[#07090e] px-3 py-1.5 rounded-xl border border-slate-700">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pasan a Playoffs:</span>
            </label>
            <select
              value={qualifiersCount}
              onChange={(e) => {
                const val = Math.max(1, Number(e.target.value));
                setQualifiersCount(val);
                if (onUpdateQualifiersPerGroup) {
                  onUpdateQualifiersPerGroup(val);
                }
              }}
              className="bg-[#111622] border border-emerald-500/60 rounded-lg px-2 py-0.5 text-xs font-black text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value={1}>🥇 Solo el 1º (Puntero)</option>
              <option value={2}>🥈 Primeros 2 (1º y 2º)</option>
              <option value={3}>🥉 Primeros 3</option>
              <option value={4}>🎖️ Primeros 4</option>
            </select>
          </div>

          {onAdvanceToBracket && (
            <button
              onClick={handleAdvanceAllToPlayoffs}
              className="px-3.5 py-2 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00e676]/20"
            >
              <span>Cruzar Clasificados a Playoffs ({qualifiersCount} x Zona)</span>
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
                const isClassified = idx < qualifiersCount;

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
                            ? 'bg-[#eab308] text-black shadow-sm shadow-[#eab308]/40'
                            : idx === 1 && qualifiersCount >= 2
                            ? 'bg-slate-300 text-black'
                            : idx === 2 && qualifiersCount >= 3
                            ? 'bg-amber-700 text-white'
                            : isClassified
                            ? 'bg-emerald-500/80 text-black font-extrabold'
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
                          <span className="text-[10px] bg-[#00e676]/20 text-[#00e676] px-2 py-0.5 rounded-full font-bold border border-[#00e676]/30">
                            ✓ Clasifica ({idx + 1}º)
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
          matchTitle={`Fase de Grupos • Zona ${String.fromCharCode(65 + selectedGroupIndex)}`}
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

// Asignar jugadores a cada zona (serpenteante o modular) y rellenar cupos mínimos de 4 por zona
function buildGroupPlayersForZone(
  enrolled: GroupEnrolledPlayer[],
  zoneIndex: number,
  totalZones: number
): GroupPlayer[] {
  // Filtrar jugadores correspondientes a esta zona
  const zoneEnrolled = enrolled.filter((_, idx) => idx % totalZones === zoneIndex);

  const players: GroupPlayer[] = zoneEnrolled.map((p) => ({
    id: p.id,
    name: p.name || p.nickname || 'Jugador',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    legsFor: 0,
    legsAgainst: 0,
    points: 0
  }));

  // Asegurar mínimo de 4 integrantes para la zona
  const targetCount = Math.max(4, players.length);
  while (players.length < targetCount) {
    const slotNum = players.length + 1;
    players.push({
      id: `slot-z${zoneIndex}-${slotNum}`,
      name: `Por Acreditar #${slotNum}`,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      legsFor: 0,
      legsAgainst: 0,
      points: 0
    });
  }

  return players;
}

// Generar todos los cruces Round Robin (todos contra todos) del grupo
function buildRoundRobinMatches(players: GroupPlayer[], zoneIndex: number): GroupMatch[] {
  const matches: GroupMatch[] = [];
  let matchCounter = 1;

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `gm-z${zoneIndex}-${matchCounter++}`,
        player1Id: players[i].id,
        player2Id: players[j].id,
        player1Name: players[i].name,
        player2Name: players[j].name,
        scoreP1: 0,
        scoreP2: 0,
        status: 'SCHEDULED'
      });
    }
  }

  return matches;
}
