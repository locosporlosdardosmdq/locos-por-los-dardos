'use client';

import React, { useState, useEffect } from 'react';
import { MatchDispatcherModal } from './MatchDispatcherModal';
import { TournamentBracketMatch } from '@/lib/types';
import { 
  Users, 
  Trophy, 
  Shuffle, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Target,
  Dices,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export interface GroupPlayer {
  id: string;
  name: string;
  nickname?: string;
  avatarUrl?: string;
  avg?: number;
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

export interface ZoneData {
  players: GroupPlayer[];
  matches: GroupMatch[];
}

interface TournamentGroupStageProps {
  tournamentId?: string;
  tournamentTitle: string;
  bestOfLegs: number;
  groupsCount?: number;
  qualifiersPerGroup?: number;
  enrolledPlayers?: GroupEnrolledPlayer[];
  isDoubles?: boolean;
  isAdmin?: boolean;
  savedGroupData?: any;
  onLaunchMatch: (match: GroupMatch, mode: 'LIVE' | 'ONLINE') => void;
  onAdvanceToBracket?: (qualifiedPlayers: GroupPlayer[], bracketMatches: TournamentBracketMatch[]) => void;
  onUpdateQualifiersPerGroup?: (count: number) => void;
  onSaveGroupData?: (data: any) => void;
}

export const TournamentGroupStage: React.FC<TournamentGroupStageProps> = ({
  tournamentId = 'tourney',
  tournamentTitle,
  bestOfLegs,
  groupsCount = 2,
  qualifiersPerGroup = 2,
  enrolledPlayers = [],
  isDoubles = false,
  isAdmin = true,
  savedGroupData,
  onLaunchMatch,
  onAdvanceToBracket,
  onUpdateQualifiersPerGroup,
  onSaveGroupData
}) => {
  const isDoublesTournament = isDoubles || tournamentTitle.toLowerCase().includes('pareja') || tournamentTitle.toLowerCase().includes('dupla');

  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1); // -1 = Ver Todas las Zonas (Vista Agrupada Completa)
  const [qualifiersCount, setQualifiersCount] = useState<number>(qualifiersPerGroup);
  const [isDrawn, setIsDrawn] = useState<boolean>(() => !!savedGroupData?.isDrawn);

  // Duplas conformadas (si es torneo de parejas)
  const [pairsList, setPairsList] = useState<GroupEnrolledPlayer[]>(() => {
    if (savedGroupData?.pairs && savedGroupData.pairs.length > 0) {
      return savedGroupData.pairs;
    }
    if (isDoublesTournament && enrolledPlayers.length >= 2) {
      return buildPairsFromEnrolled(enrolledPlayers);
    }
    return [];
  });

  // Almacenar el estado de TODAS las zonas
  const [zonesState, setZonesState] = useState<Record<number, ZoneData>>(() => {
    if (savedGroupData?.zonesState && Object.keys(savedGroupData.zonesState).length > 0) {
      return savedGroupData.zonesState;
    }
    const pool = (isDoublesTournament && pairsList.length > 0) ? pairsList : enrolledPlayers;
    return initializeAllZones(pool, groupsCount);
  });

  useEffect(() => {
    setQualifiersCount(qualifiersPerGroup);
  }, [qualifiersPerGroup]);

  // Si no se sortearon las parejas aún en modalidad dobles, crearlas por defecto
  useEffect(() => {
    if (isDoublesTournament && pairsList.length === 0 && enrolledPlayers.length >= 2) {
      const generatedPairs = buildPairsFromEnrolled(enrolledPlayers);
      setPairsList(generatedPairs);
      if (!isDrawn) {
        const initialZones = initializeAllZones(generatedPairs, groupsCount);
        setZonesState(initialZones);
      }
    }
  }, [isDoublesTournament, enrolledPlayers.length]);

  // Sorteo a Ciegas de Parejas (Blind Draw)
  const handleBlindDrawPairs = () => {
    if (enrolledPlayers.length < 2) {
      alert('Se necesitan al menos 2 jugadores inscriptos para sortear parejas.');
      return;
    }

    if (!confirm('¿Deseas realizar el Sorteo a Ciegas (Blind Draw) de Parejas? Se mezclarán aleatoriamente los inscriptos para armar las duplas oficiales.')) {
      return;
    }

    const shuffled = [...enrolledPlayers].sort(() => Math.random() - 0.5);
    const newPairs = buildPairsFromEnrolled(shuffled);
    setPairsList(newPairs);

    // Automáticamente sortear las nuevas parejas en las zonas
    const newZones = distributeIntoZones(newPairs, groupsCount);
    setZonesState(newZones);
    setIsDrawn(true);

    if (onSaveGroupData) {
      onSaveGroupData({
        isDrawn: true,
        pairs: newPairs,
        zonesState: newZones,
        updatedAt: new Date().toISOString()
      });
    }

    alert(`¡Sorteo a Ciegas completado! Se conformaron ${newPairs.length} parejas y se distribuyeron en los grupos.`);
  };

  // Sorteo Oficial de Grupos / Zonas
  const handleDrawGroups = () => {
    const competitorPool = (isDoublesTournament && pairsList.length > 0) ? pairsList : enrolledPlayers;

    if (competitorPool.length === 0) {
      alert('No hay jugadores o parejas inscriptas para realizar el sorteo de grupos.');
      return;
    }

    if (isDrawn) {
      if (!confirm('⚠️ Advertencia: Los grupos ya fueron sorteados previamente. Si realizas un nuevo sorteo se redistribuirán los participantes y se reiniciarán los resultados de los partidos. ¿Deseas continuar?')) {
        return;
      }
    }

    // Barajar competidores con Fisher-Yates
    const shuffled = [...competitorPool].sort(() => Math.random() - 0.5);
    const newZones = distributeIntoZones(shuffled, groupsCount);

    setZonesState(newZones);
    setIsDrawn(true);

    if (onSaveGroupData) {
      onSaveGroupData({
        isDrawn: true,
        pairs: isDoublesTournament ? pairsList : undefined,
        zonesState: newZones,
        updatedAt: new Date().toISOString()
      });
    }

    alert(`¡Sorteo de Grupos realizado con éxito! Se distribuyeron ${competitorPool.length} participantes equitativamente en ${groupsCount} zonas.`);
  };

  // Partido seleccionado para el dispatcher modal con su zona de origen
  const [activeDispatchMatch, setActiveDispatchMatch] = useState<{ match: GroupMatch; zoneIndex: number } | null>(null);

  const handleSaveQuickResult = (scoreP1: number, scoreP2: number, winnerId: string) => {
    if (!activeDispatchMatch) return;
    if (activeDispatchMatch.match.status === 'FINISHED') return;

    const targetZone = activeDispatchMatch.zoneIndex;
    const matchId = activeDispatchMatch.match.id;

    setZonesState((prev) => {
      const current = prev[targetZone] || { players: [], matches: [] };
      const updatedMatches = current.matches.map((m) =>
        m.id === matchId
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
        if (p.id === activeDispatchMatch.match.player1Id) {
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
        if (p.id === activeDispatchMatch.match.player2Id) {
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

      const nextZonesState = {
        ...prev,
        [targetZone]: {
          players: updatedPlayers,
          matches: updatedMatches
        }
      };

      if (onSaveGroupData) {
        onSaveGroupData({
          isDrawn: true,
          pairs: isDoublesTournament ? pairsList : undefined,
          zonesState: nextZonesState,
          updatedAt: new Date().toISOString()
        });
      }

      return nextZonesState;
    });
  };

  // Función para armar la llave eliminatoria cruzada (Playoffs)
  const handleAdvanceAllToPlayoffs = () => {
    if (!onAdvanceToBracket) return;

    // Recolectar clasificados por zona
    const zoneRankings: Record<number, GroupPlayer[]> = {};
    const allQualifiedList: GroupPlayer[] = [];

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
        const qualifiers = sorted.slice(0, qualifiersCount);
        zoneRankings[i] = qualifiers;
        allQualifiedList.push(...qualifiers);
      }
    }

    if (allQualifiedList.length < 2) {
      alert('Se necesitan al menos 2 jugadores/equipos clasificados para armar la llave de playoffs.');
      return;
    }

    // Generar los cruces de playoffs cruzados (Cross-Seeding)
    const playoffMatches = generatePlayoffCrossMatches(
      zoneRankings,
      groupsCount,
      qualifiersCount,
      tournamentId,
      bestOfLegs
    );

    onAdvanceToBracket(allQualifiedList, playoffMatches);
  };

  return (
    <div className="space-y-6">
      {/* BANNER DE MODALIDAD Y CENTRO DE SORTEO */}
      <div className="bg-[#0f1422] border border-[#ef4444]/40 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Fase de Grupos • Round Robin ({groupsCount} Zonas)</span>
            </span>

            {isDoublesTournament && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Modalidad Parejas (Duplas)</span>
              </span>
            )}

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isDrawn 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {isDrawn ? '✓ Grupos Sorteados y Activos' : '⏳ Pendiente de Sorteo'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {tournamentTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cada zona juega su propio Round Robin independiente • Victoria = 2 pts • Criterio: Puntos, Dif. Legs, Legs a favor
          </p>
        </div>

        {/* ACCIONES DE SORTEO Y ADMINISTRACIÓN */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            {isDoublesTournament && (
              <button
                type="button"
                onClick={handleBlindDrawPairs}
                className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                title="Armar o re-sortear las duplas aleatoriamente a ciegas"
              >
                <Shuffle className="w-4 h-4" />
                <span>Sortear Parejas (Blind Draw)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDrawGroups}
              className="px-4 py-2 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#00e676]/20 active:scale-95"
              title="Sortear aleatoriamente la composición de cada zona"
            >
              <Dices className="w-4 h-4 stroke-[2.5]" />
              <span>{isDrawn ? 'Re-Sortear Grupos' : 'Sortear Grupos'}</span>
            </button>
          </div>
        )}
      </div>

      {/* SELECTOR DE PESTAÑAS POR ZONA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black border border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedGroupIndex(-1)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              selectedGroupIndex === -1
                ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ver Todas las Zonas (Vista Agrupada)</span>
          </button>
          {Array.from({ length: groupsCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedGroupIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedGroupIndex === idx
                  ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>Zona {String.fromCharCode(65 + idx)}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedGroupIndex === idx ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {zonesState[idx]?.players?.length || 4}
              </span>
            </button>
          ))}
        </div>

        {/* CONTROLES DE CLASIFICACIÓN Y ARMAR PLAYOFFS */}
        <div className="flex flex-wrap items-center gap-2.5">
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
                if (onUpdateQualifiersPerGroup) onUpdateQualifiersPerGroup(val);
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
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-400/25 active:scale-95"
              title="Generar los cruces de playoffs en base a las posiciones de cada grupo y armar la llave eliminatoria"
            >
              <Trophy className="w-4 h-4 fill-black" />
              <span>Armar Llave de Playoffs ({qualifiersCount * groupsCount} Equipos)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* RENDERIZADO DE ZONAS Y SUS PARTIDAS AGRUPADAS */}
      <div className="space-y-6">
        {(selectedGroupIndex === -1 ? Array.from({ length: groupsCount }).map((_, idx) => idx) : [selectedGroupIndex]).map((zoneIdx) => {
          const zoneData = zonesState[zoneIdx] || { players: [], matches: [] };
          const players = zoneData.players;
          const matches = zoneData.matches;
          const sorted = [...players].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const diffB = b.legsFor - b.legsAgainst;
            const diffA = a.legsFor - a.legsAgainst;
            if (diffB !== diffA) return diffB - diffA;
            return b.legsFor - a.legsFor;
          });
          const zoneLetter = String.fromCharCode(65 + zoneIdx);

          return (
            <div key={zoneIdx} className="space-y-4 bg-[#0a0e17] border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl">
              {/* Cabecera de Zona */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#00e676] border border-emerald-500/40 flex items-center justify-center font-black text-sm">
                    {zoneLetter}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Zona {zoneLetter} • Partidas y Posiciones</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {players.length} {isDoublesTournament ? 'Parejas' : 'Competidores'} • Round Robin individual (todos contra todos en la zona)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                  Clasifican los {qualifiersCount} mejores
                </span>
              </div>

              {/* COMPOSICIÓN DE LA ZONA */}
              <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-3.5">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#00e676]" />
                  <span>Integrantes sorteados en la Zona {zoneLetter}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {players.map((p, idx) => (
                    <div
                      key={p.id}
                      className="bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <span className="text-xs font-black text-white block truncate">
                          {p.name}
                        </span>
                        {p.avg && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            AVG {p.avg.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABLA DE POSICIONES OFICIAL */}
              <div className="bg-[#0f1422] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#07090e]/80 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">Pos</th>
                        <th className="py-2.5 px-3">{isDoublesTournament ? 'Pareja / Dupla' : 'Jugador'}</th>
                        <th className="py-2.5 px-2 text-center">PJ</th>
                        <th className="py-2.5 px-2 text-center">G</th>
                        <th className="py-2.5 px-2 text-center">P</th>
                        <th className="py-2.5 px-2 text-center">LF</th>
                        <th className="py-2.5 px-2 text-center">LC</th>
                        <th className="py-2.5 px-2 text-center">+/-</th>
                        <th className="py-2.5 px-3 text-center font-black text-[#00e676]">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-bold">
                      {sorted.map((p, idx) => {
                        const diff = p.legsFor - p.legsAgainst;
                        const isClassified = idx < qualifiersCount;

                        return (
                          <tr
                            key={p.id}
                            className={`transition-colors ${
                              isClassified ? 'bg-[#00e676]/5 hover:bg-[#00e676]/10' : 'hover:bg-[#111622]'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
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
                            <td className="py-2.5 px-3 font-black text-white">
                              <div className="flex items-center gap-2">
                                <span>{p.name}</span>
                                {isClassified && (
                                  <span className="text-[9px] bg-[#00e676]/20 text-[#00e676] px-1.5 py-0.2 rounded-full font-bold border border-[#00e676]/30">
                                    ✓ Clasifica ({idx + 1}º)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{p.matchesPlayed}</td>
                            <td className="py-2.5 px-2 text-center text-[#00e676]">{p.matchesWon}</td>
                            <td className="py-2.5 px-2 text-center text-[#ef4444]">{p.matchesLost}</td>
                            <td className="py-2.5 px-2 text-center">{p.legsFor}</td>
                            <td className="py-2.5 px-2 text-center">{p.legsAgainst}</td>
                            <td
                              className={`py-2.5 px-2 text-center font-black ${
                                diff > 0 ? 'text-[#00e676]' : diff < 0 ? 'text-[#ef4444]' : 'text-slate-400'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black text-[#00e676] text-xs">
                              {p.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PARTIDAS AGRUPADAS DE LA ZONA */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#ef4444]" />
                    <span>Partidas Agrupadas • Zona {zoneLetter} (Toca para jugar o anotar)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Al mejor de {bestOfLegs} legs (primero a {Math.ceil(bestOfLegs / 2)})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {matches.map((m) => {
                    const isFinished = m.status === 'FINISHED';

                    return (
                      <div
                        key={m.id}
                        onClick={() => setActiveDispatchMatch({ match: m, zoneIndex: zoneIdx })}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group shadow-md ${
                          isFinished
                            ? 'bg-[#0f1422] border-slate-800 hover:border-slate-600'
                            : 'bg-[#0f1422] border-[#ef4444]/40 hover:border-[#00e676]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                          <span className="font-bold">Legs al mejor de {bestOfLegs}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                              isFinished
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-[#ef4444]/20 text-[#ef4444] animate-pulse'
                            }`}
                          >
                            {isFinished ? 'FINALIZADO' : 'POR JUGAR'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between font-black text-xs sm:text-sm">
                          <div className="truncate flex-1">
                            <span className={m.winnerId === m.player1Id ? 'text-[#00e676]' : 'text-white'}>
                              {m.player1Name}
                            </span>
                          </div>

                          <div className="px-2.5 py-1 rounded-xl bg-[#07090e] border border-slate-800 text-center mx-1.5 text-xs font-black">
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
            </div>
          );
        })}
      </div>

      {/* DISPATCHER MODAL */}
      {activeDispatchMatch && (
        <MatchDispatcherModal
          isOpen={!!activeDispatchMatch}
          onClose={() => setActiveDispatchMatch(null)}
          matchTitle={`Fase de Grupos • Zona ${String.fromCharCode(65 + activeDispatchMatch.zoneIndex)}`}
          player1Name={activeDispatchMatch.match.player1Name}
          player2Name={activeDispatchMatch.match.player2Name}
          player1Id={activeDispatchMatch.match.player1Id}
          player2Id={activeDispatchMatch.match.player2Id}
          bestOfLegs={bestOfLegs}
          onLaunchLiveMatch={() => onLaunchMatch(activeDispatchMatch.match, 'LIVE')}
          onLaunchOnlineMatch={() => onLaunchMatch(activeDispatchMatch.match, 'ONLINE')}
          onSaveQuickResult={handleSaveQuickResult}
        />
      )}
    </div>
  );
};

// Generar duplas a partir de inscriptos individuales
function buildPairsFromEnrolled(enrolled: GroupEnrolledPlayer[]): GroupEnrolledPlayer[] {
  const pairs: GroupEnrolledPlayer[] = [];
  for (let i = 0; i < enrolled.length; i += 2) {
    const p1 = enrolled[i];
    const p2 = enrolled[i + 1];

    if (p2) {
      pairs.push({
        id: `pair-${p1.id}-${p2.id}`,
        name: `${p1.nickname || p1.name} & ${p2.nickname || p2.name}`,
        nickname: `${p1.nickname || p1.name} / ${p2.nickname || p2.name}`,
        avatarUrl: p1.avatarUrl || p2.avatarUrl || '/logos/logo-mdq.png',
        seed: Math.floor(i / 2) + 1,
        avg: Math.round(((p1.avg || 45) + (p2.avg || 45)) / 2)
      });
    } else {
      pairs.push({
        id: `pair-${p1.id}-solo`,
        name: `${p1.nickname || p1.name} (Libre)`,
        nickname: p1.nickname || p1.name,
        avatarUrl: p1.avatarUrl || '/logos/logo-mdq.png',
        seed: Math.floor(i / 2) + 1,
        avg: p1.avg || 45
      });
    }
  }
  return pairs;
}

// Distribuir competidores en Zonas equitativas y generar Round Robin
function distributeIntoZones(
  competitors: GroupEnrolledPlayer[],
  totalZones: number
): Record<number, ZoneData> {
  const state: Record<number, ZoneData> = {};
  const zonePlayersMap: Record<number, GroupPlayer[]> = {};

  for (let i = 0; i < totalZones; i++) {
    zonePlayersMap[i] = [];
  }

  // Distribución equitativa
  competitors.forEach((c, idx) => {
    const zIdx = idx % totalZones;
    zonePlayersMap[zIdx].push({
      id: c.id,
      name: c.name || c.nickname || 'Competidor',
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      legsFor: 0,
      legsAgainst: 0,
      points: 0
    });
  });

  // Asegurar mínimo de 4 cupos por zona para una fase de grupos competitiva
  for (let z = 0; z < totalZones; z++) {
    const players = zonePlayersMap[z];
    const target = Math.max(4, players.length);
    while (players.length < target) {
      const slotNum = players.length + 1;
      players.push({
        id: `slot-z${z}-${slotNum}`,
        name: `Por Acreditar #${slotNum}`,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        legsFor: 0,
        legsAgainst: 0,
        points: 0
      });
    }

    const matches = buildRoundRobinMatches(players, z);
    state[z] = { players, matches };
  }

  return state;
}

// Inicialización de zonas (fallback si no se ha sorteado)
function initializeAllZones(enrolled: GroupEnrolledPlayer[], totalZones: number): Record<number, ZoneData> {
  return distributeIntoZones(enrolled, totalZones);
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

// Generador de Llave de Playoffs con Cross-Seeding (Olímpico)
function generatePlayoffCrossMatches(
  zoneRankings: Record<number, GroupPlayer[]>,
  totalZones: number,
  qualifiersPerZone: number,
  tourneyId: string,
  bestOfLegs: number
): TournamentBracketMatch[] {
  const legTarget = Math.ceil(bestOfLegs / 2);

  type BracketPlayer = {
    id: string;
    name: string;
    avatarUrl: string;
    seed?: number;
    nationality?: string;
    countryCode?: string;
  };

  const toParticipant = (p: GroupPlayer, seedNum: number): BracketPlayer => ({
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl || '/logos/logo-mdq.png',
    seed: seedNum,
    nationality: 'Argentina',
    countryCode: 'AR'
  });

  // CASO 1: 2 ZONAS y 2 CLASIFICADOS POR ZONA (4 Clasificados -> Semifinales y Final)
  if (totalZones === 2 && qualifiersPerZone >= 2) {
    const a1 = zoneRankings[0]?.[0] ? toParticipant(zoneRankings[0][0], 1) : undefined;
    const a2 = zoneRankings[0]?.[1] ? toParticipant(zoneRankings[0][1], 3) : undefined;
    const b1 = zoneRankings[1]?.[0] ? toParticipant(zoneRankings[1][0], 2) : undefined;
    const b2 = zoneRankings[1]?.[1] ? toParticipant(zoneRankings[1][1], 4) : undefined;

    const semi1Id = `${tourneyId}-playoff_r1_m1`;
    const semi2Id = `${tourneyId}-playoff_r1_m2`;
    const finalId = `${tourneyId}-playoff_r2_m1`;

    const semi1: TournamentBracketMatch = {
      id: semi1Id,
      round: 1,
      matchIndex: 0,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget,
      player1: a1,
      player2: b2,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Semifinal 1 (1ºA vs 2ºB)',
      nextMatchId: finalId,
      nextSlot: 1
    };

    const semi2: TournamentBracketMatch = {
      id: semi2Id,
      round: 1,
      matchIndex: 1,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget,
      player1: b1,
      player2: a2,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Semifinal 2 (1ºB vs 2ºA)',
      nextMatchId: finalId,
      nextSlot: 2
    };

    const finalMatch: TournamentBracketMatch = {
      id: finalId,
      round: 2,
      matchIndex: 0,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget: legTarget + 1,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Gran Final del Torneo'
    };

    return [semi1, semi2, finalMatch];
  }

  // CASO 2: 4 ZONAS y 2 CLASIFICADOS POR ZONA (8 Clasificados -> Cuartos, Semis y Final)
  if (totalZones === 4 && qualifiersPerZone >= 2) {
    const a1 = zoneRankings[0]?.[0] ? toParticipant(zoneRankings[0][0], 1) : undefined;
    const a2 = zoneRankings[0]?.[1] ? toParticipant(zoneRankings[0][1], 5) : undefined;
    const b1 = zoneRankings[1]?.[0] ? toParticipant(zoneRankings[1][0], 2) : undefined;
    const b2 = zoneRankings[1]?.[1] ? toParticipant(zoneRankings[1][1], 6) : undefined;
    const c1 = zoneRankings[2]?.[0] ? toParticipant(zoneRankings[2][0], 3) : undefined;
    const c2 = zoneRankings[2]?.[1] ? toParticipant(zoneRankings[2][1], 7) : undefined;
    const d1 = zoneRankings[3]?.[0] ? toParticipant(zoneRankings[3][0], 4) : undefined;
    const d2 = zoneRankings[3]?.[1] ? toParticipant(zoneRankings[3][1], 8) : undefined;

    const qf1Id = `${tourneyId}-playoff_r1_m1`;
    const qf2Id = `${tourneyId}-playoff_r1_m2`;
    const qf3Id = `${tourneyId}-playoff_r1_m3`;
    const qf4Id = `${tourneyId}-playoff_r1_m4`;

    const semi1Id = `${tourneyId}-playoff_r2_m1`;
    const semi2Id = `${tourneyId}-playoff_r2_m2`;
    const finalId = `${tourneyId}-playoff_r3_m1`;

    const qf1: TournamentBracketMatch = {
      id: qf1Id,
      round: 1,
      matchIndex: 0,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget,
      player1: a1,
      player2: b2,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Cuartos 1 (1ºA vs 2ºB)',
      nextMatchId: semi1Id,
      nextSlot: 1
    };

    const qf2: TournamentBracketMatch = {
      id: qf2Id,
      round: 1,
      matchIndex: 1,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget,
      player1: c1,
      player2: d2,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Cuartos 2 (1ºC vs 2ºD)',
      nextMatchId: semi1Id,
      nextSlot: 2
    };

    const qf3: TournamentBracketMatch = {
      id: qf3Id,
      round: 1,
      matchIndex: 2,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget,
      player1: b1,
      player2: a2,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Cuartos 3 (1ºB vs 2ºA)',
      nextMatchId: semi2Id,
      nextSlot: 1
    };

    const qf4: TournamentBracketMatch = {
      id: qf4Id,
      round: 1,
      matchIndex: 3,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget,
      player1: d1,
      player2: c2,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Cuartos 4 (1ºD vs 2ºC)',
      nextMatchId: semi2Id,
      nextSlot: 2
    };

    const semi1: TournamentBracketMatch = {
      id: semi1Id,
      round: 2,
      matchIndex: 0,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget: legTarget + 1,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Semifinales',
      nextMatchId: finalId,
      nextSlot: 1
    };

    const semi2: TournamentBracketMatch = {
      id: semi2Id,
      round: 2,
      matchIndex: 1,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget: legTarget + 1,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Semifinales',
      nextMatchId: finalId,
      nextSlot: 2
    };

    const finalMatch: TournamentBracketMatch = {
      id: finalId,
      round: 3,
      matchIndex: 0,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget: legTarget + 2,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Gran Final del Torneo'
    };

    return [qf1, qf2, qf3, qf4, semi1, semi2, finalMatch];
  }

  // CASO 3: 2 ZONAS con solo 1 CLASIFICADO (2 Equipos -> Final Directa)
  if (totalZones === 2 && qualifiersPerZone === 1) {
    const a1 = zoneRankings[0]?.[0] ? toParticipant(zoneRankings[0][0], 1) : undefined;
    const b1 = zoneRankings[1]?.[0] ? toParticipant(zoneRankings[1][0], 2) : undefined;

    return [{
      id: `${tourneyId}-playoff_r1_m1`,
      round: 1,
      matchIndex: 0,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget: legTarget + 1,
      player1: a1,
      player2: b1,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Gran Final (1º Zona A vs 1º Zona B)'
    }];
  }

  // CASO GENÉRICO DE RESPALDO (Cruces secuenciales)
  const allOrdered: BracketPlayer[] = [];
  let seedCounter = 1;
  for (let z = 0; z < totalZones; z++) {
    (zoneRankings[z] || []).forEach((p) => {
      allOrdered.push(toParticipant(p, seedCounter++));
    });
  }

  const matches: TournamentBracketMatch[] = [];
  const half = Math.floor(allOrdered.length / 2);
  const finalId = `${tourneyId}-playoff_r2_m1`;

  for (let i = 0; i < half; i++) {
    matches.push({
      id: `${tourneyId}-playoff_r1_m${i + 1}`,
      round: 1,
      matchIndex: i,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget,
      player1: allOrdered[i],
      player2: allOrdered[allOrdered.length - 1 - i],
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: `Playoff Ronda 1 • Llave #${i + 1}`,
      nextMatchId: half > 1 ? finalId : undefined,
      nextSlot: (i % 2 === 0 ? 1 : 2) as 1 | 2
    });
  }

  if (half > 1) {
    matches.push({
      id: finalId,
      round: 2,
      matchIndex: 0,
      bracketType: 'WINNERS',
      distanceMode: 'LEGS',
      legTarget: legTarget + 1,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Gran Final'
    });
  }

  return matches;
}
