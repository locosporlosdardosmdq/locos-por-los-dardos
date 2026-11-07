'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PlayerProfile, OutMode, RoundLegsConfig } from '@/lib/types';
import { 
  Sparkles, 
  Trophy, 
  Users, 
  Zap, 
  Repeat, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Target,
  Activity,
  Sliders,
  Eye
} from 'lucide-react';

export interface EnrolledPlayerAvgInput {
  id: string;
  name: string;
  nickname?: string;
  avg?: number;
}

export interface ResolvedPlayerAvg {
  id: string;
  name: string;
  effectiveAvg: number;
  source: 'APP_STATS' | 'DECLARED_PROFILE' | 'ENROLLED_DEFAULT';
  matchesPlayed: number;
}

export interface FormatRecommendation {
  id: 'GROUPS' | 'DOUBLE_ELIM' | 'SINGLE_ELIM';
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN';
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  groupsCount?: number;
  qualifiersPerGroup?: number;
  totalMatches: number;
  minMatchesPerPlayer: number;
  byesInBracket: number;
  estimatedMinutes2Boards: number;
  estimatedTotalMinutes: number;
  formattedDuration: string;
  phaseBreakdownText: string;
  avgMinutesPerMatch: number;
  avgMinutesPerLeg: number;
  perks: string[];
  isCurrentFormat: boolean;
}

export type TournamentFormatRecommendation = FormatRecommendation;

interface TournamentFormatAdvisorProps {
  enrolledCount: number;
  enrolledPlayers?: EnrolledPlayerAvgInput[];
  communityPlayers?: PlayerProfile[];
  currentFormat: string;
  groupsCount?: number;
  qualifiersPerGroup?: number;
  currentGroupsCount?: number;
  currentQualifiersPerGroup?: number;
  startingScore?: number;
  outMode?: OutMode;
  bestOfLegs?: number;
  roundLegsConfig?: RoundLegsConfig;
  onApplyFormat?: (rec: FormatRecommendation) => void;
  onApplyRecommendation?: (rec: FormatRecommendation) => void;
  isAdmin?: boolean;
}

function formatMinutesToHoursAndMins(totalMins: number): string {
  const rounded = Math.max(5, Math.round(totalMins));
  const hrs = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs}h 00m`;
  return `${hrs}h ${mins < 10 ? `0${mins}` : mins}m`;
}

/**
 * Calcula los minutos reales esperados por cada leg según:
 * - Puntaje inicial (301, 501, 701)
 * - Modo de salida (DOUBLE_OUT, SINGLE_OUT, MASTER_OUT)
 * - Promedio de 3 dardos (AVG) de los jugadores
 */
function calculateMinutesPerLeg(
  avg: number,
  startingScore: number = 501,
  outMode: OutMode = 'DOUBLE_OUT'
): number {
  const safeAvg = Math.max(20, Math.min(115, avg || 45));
  // Visitas base para cubrir el score inicial
  const baseVisitsWinner = startingScore / safeAvg;

  // Penalización realista de cierre en aro de dobles según el nivel del jugador
  let checkoutPenaltyVisits = 0.25;
  if (outMode === 'DOUBLE_OUT') {
    checkoutPenaltyVisits = Math.max(0.45, (68 - Math.min(68, safeAvg)) / 19);
  } else if (outMode === 'MASTER_OUT') {
    checkoutPenaltyVisits = Math.max(0.35, (65 - Math.min(65, safeAvg)) / 24);
  }

  const winnerVisits = baseVisitsWinner + checkoutPenaltyVisits;
  // En un leg disputado, el rival realiza aprox (winnerVisits - 0.5) visitas
  const totalVisitsInLeg = Math.max(6, winnerVisits * 2 - 0.5);

  // Tiempo físico promedio por visita (ir al oche, lanzar 3 dardos, retirar dardos y anotar): ~21 seg + 15 seg de transición de leg
  const totalSeconds = totalVisitsInLeg * 21 + 15;
  return Number((totalSeconds / 60).toFixed(1));
}

/**
 * Calcula la cantidad esperada de legs que se disputan en un partido "Primero a L legs" (Mejor de 2L - 1)
 */
function calculateExpectedLegsInMatch(legsToWin: number): number {
  const L = Math.max(1, legsToWin);
  if (L === 1) return 1;
  // Para jugadores de club competitivos, un partido Primero a L dura en promedio L + 0.45*(L-1) legs
  return Number((L + 0.45 * (L - 1)).toFixed(2));
}

export const TournamentFormatAdvisor: React.FC<TournamentFormatAdvisorProps> = ({
  enrolledCount,
  enrolledPlayers = [],
  communityPlayers = [],
  currentFormat,
  groupsCount,
  qualifiersPerGroup,
  currentGroupsCount,
  currentQualifiersPerGroup,
  startingScore = 501,
  outMode = 'DOUBLE_OUT',
  bestOfLegs = 3,
  roundLegsConfig,
  onApplyFormat,
  onApplyRecommendation,
  isAdmin = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showPlayersAvgBreakdown, setShowPlayersAvgBreakdown] = useState<boolean>(false);

  // Modo de cálculo de AVG: 'AUTO' (dinámico por estadísticas/declarado de los inscriptos) vs 'MANUAL' (valor único seteado)
  const [avgMode, setAvgMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [manualAvg, setManualAvg] = useState<number>(45.0);
  const [boardsCount, setBoardsCount] = useState<number>(2);

  // Distancia en legs para simular ("Primero a X legs")
  const initialLegsToWin = useMemo(() => {
    // En la app bestOfLegs suele guardar la meta de legs o el mejor de N; si es <= 5 tomamos directo o Math.ceil
    if (bestOfLegs <= 3) return bestOfLegs;
    return Math.ceil(bestOfLegs / 2);
  }, [bestOfLegs]);

  const [legsToWin, setLegsToWin] = useState<number>(initialLegsToWin);

  useEffect(() => {
    setLegsToWin(initialLegsToWin);
  }, [initialLegsToWin]);

  const applyHandler = onApplyFormat || onApplyRecommendation;
  const activeGroupsCount = currentGroupsCount ?? groupsCount ?? 2;
  const activeQualifiersPerGroup = currentQualifiersPerGroup ?? qualifiersPerGroup ?? 2;

  // 1. Resolver el AVG de cada jugador inscripto cruzando con las estadísticas dinámicas registradas en la App
  const resolvedPlayers = useMemo<ResolvedPlayerAvg[]>(() => {
    if (!enrolledPlayers || enrolledPlayers.length === 0) {
      return [];
    }

    return enrolledPlayers.map((ep) => {
      const epNameLower = (ep.name || '').trim().toLowerCase();
      const epNickLower = (ep.nickname || '').trim().toLowerCase();

      const matchedProfile = communityPlayers.find((cp) => {
        if (cp.id === ep.id) return true;
        const cpFull = (cp.fullName || '').trim().toLowerCase();
        const cpNick = (cp.nickname || '').trim().toLowerCase();
        if (epNameLower && (cpFull === epNameLower || cpNick === epNameLower)) return true;
        if (epNickLower && (cpNick === epNickLower || cpFull === epNickLower)) return true;
        return false;
      });

      // Prioridad 1: Estadísticas reales de partidas jugadas en la App
      if (
        matchedProfile &&
        matchedProfile.stats &&
        (matchedProfile.stats.matchesPlayed || 0) > 0 &&
        (matchedProfile.stats.overallAvg || 0) > 0
      ) {
        return {
          id: ep.id,
          name: ep.name,
          effectiveAvg: Number(matchedProfile.stats.overallAvg.toFixed(1)),
          source: 'APP_STATS' as const,
          matchesPlayed: matchedProfile.stats.matchesPlayed
        };
      }

      // Prioridad 2: AVG declarado en su perfil federado
      if (matchedProfile && (matchedProfile.estimatedAvg || 0) > 0) {
        return {
          id: ep.id,
          name: ep.name,
          effectiveAvg: Number(matchedProfile.estimatedAvg.toFixed(1)),
          source: 'DECLARED_PROFILE' as const,
          matchesPlayed: 0
        };
      }

      // Prioridad 3: AVG guardado en la inscripción o estándar de club (45.0)
      const fallbackAvg = ep.avg && ep.avg > 0 ? ep.avg : 45.0;
      return {
        id: ep.id,
        name: ep.name,
        effectiveAvg: Number(fallbackAvg.toFixed(1)),
        source: 'ENROLLED_DEFAULT' as const,
        matchesPlayed: 0
      };
    });
  }, [enrolledPlayers, communityPlayers]);

  // Estadísticas agregadas del plantel de inscriptos
  const rosterAvgStats = useMemo(() => {
    if (resolvedPlayers.length === 0) {
      return {
        meanAvg: 45.0,
        topHalfAvg: 50.0,
        minAvg: 45.0,
        maxAvg: 45.0,
        fromAppStatsCount: 0,
        fromDeclaredCount: enrolledCount
      };
    }

    const sum = resolvedPlayers.reduce((acc, p) => acc + p.effectiveAvg, 0);
    const meanAvg = Number((sum / resolvedPlayers.length).toFixed(1));

    const sortedDesc = [...resolvedPlayers].sort((a, b) => b.effectiveAvg - a.effectiveAvg);
    const topHalfCount = Math.max(1, Math.ceil(sortedDesc.length / 2));
    const topHalfSum = sortedDesc.slice(0, topHalfCount).reduce((acc, p) => acc + p.effectiveAvg, 0);
    const topHalfAvg = Number((topHalfSum / topHalfCount).toFixed(1));

    const minAvg = sortedDesc[sortedDesc.length - 1].effectiveAvg;
    const maxAvg = sortedDesc[0].effectiveAvg;
    const fromAppStatsCount = resolvedPlayers.filter((p) => p.source === 'APP_STATS').length;
    const fromDeclaredCount = resolvedPlayers.length - fromAppStatsCount;

    return {
      meanAvg,
      topHalfAvg,
      minAvg,
      maxAvg,
      fromAppStatsCount,
      fromDeclaredCount
    };
  }, [resolvedPlayers, enrolledCount]);

  // AVG efectivo que se usará para los cálculos según el modo elegido
  const activeBaseAvg = avgMode === 'AUTO' ? rosterAvgStats.meanAvg : manualAvg;
  const activePlayoffsAvg = avgMode === 'AUTO' ? rosterAvgStats.topHalfAvg : manualAvg;

  // Sincronizar manualAvg inicial con el promedio real del plantel la primera vez
  useEffect(() => {
    if (avgMode === 'AUTO' && rosterAvgStats.meanAvg > 0) {
      setManualAvg(rosterAvgStats.meanAvg);
    }
  }, [rosterAvgStats.meanAvg, avgMode]);

  const recommendations = useMemo<FormatRecommendation[]>(() => {
    const N = enrolledCount;
    if (N < 3) return [];

    const recs: FormatRecommendation[] = [];

    // Tiempo base por leg y por partido (con 2.5 min de llamado a diana + 9 dardos de calentamiento)
    const MATCH_OVERHEAD_MINS = 2.5;
    const minsPerLegBase = calculateMinutesPerLeg(activeBaseAvg, startingScore, outMode);
    const minsPerLegFinalRounds = calculateMinutesPerLeg(activePlayoffsAvg, startingScore, outMode);

    const expectedLegsBase = calculateExpectedLegsInMatch(legsToWin);
    const matchDurationBase = expectedLegsBase * minsPerLegBase + MATCH_OVERHEAD_MINS;

    // Legs configurados para Semis y Final si existen en roundLegsConfig
    const semiLegsTarget = roundLegsConfig?.semiFinals || legsToWin;
    const finalLegsTarget = roundLegsConfig?.finals || Math.max(legsToWin, semiLegsTarget);
    const grandFinalLegsTarget = roundLegsConfig?.grandFinal || finalLegsTarget;
    const losersLegsTarget = roundLegsConfig?.losersRound || legsToWin;

    const matchDurationSemis = calculateExpectedLegsInMatch(semiLegsTarget) * minsPerLegFinalRounds + MATCH_OVERHEAD_MINS;
    const matchDurationFinal = calculateExpectedLegsInMatch(finalLegsTarget) * minsPerLegFinalRounds + MATCH_OVERHEAD_MINS;
    const matchDurationGrandFinal = calculateExpectedLegsInMatch(grandFinalLegsTarget) * minsPerLegFinalRounds + MATCH_OVERHEAD_MINS;
    const matchDurationLosers = calculateExpectedLegsInMatch(losersLegsTarget) * minsPerLegBase + MATCH_OVERHEAD_MINS;

    // --- RECOMENDACIÓN 1: IDEAL DEPORTIVA (FASE DE GRUPOS + PLAYOFFS) ---
    let idealGroups = 2;
    let idealQualifiers = 2;

    if (N === 4) {
      idealGroups = 1;
      idealQualifiers = 4;
    } else if (N >= 5 && N <= 8) {
      idealGroups = 2;
      idealQualifiers = 2;
    } else if (N === 9) {
      idealGroups = 3;
      idealQualifiers = 2;
    } else if (N >= 10 && N <= 11) {
      idealGroups = 2;
      idealQualifiers = 2;
    } else if (N >= 12 && N <= 16) {
      idealGroups = 4;
      idealQualifiers = 2;
    } else if (N > 16) {
      idealGroups = 4;
      idealQualifiers = 2;
    }

    const basePerGroup = Math.floor(N / idealGroups);
    const extra = N % idealGroups;
    let groupMatchesCount = 0;
    for (let g = 0; g < idealGroups; g++) {
      const size = g < extra ? basePerGroup + 1 : basePerGroup;
      groupMatchesCount += (size * (size - 1)) / 2;
    }

    const totalPlayoffQualifiers = idealGroups * idealQualifiers;
    const playoffMatchesCount = totalPlayoffQualifiers > 1 ? totalPlayoffQualifiers - 1 : 0;
    const totalGroupsMatches = groupMatchesCount + playoffMatchesCount;

    // Cálculo por oleadas en dianas para Grupos + Playoffs:
    // Fase de grupos: los partidos se reparten en todas las dianas disponibles
    const groupWaves = Math.ceil(groupMatchesCount / boardsCount);
    const groupStageMinutes = Math.round(groupWaves * matchDurationBase);

    // Playoffs de grupos: Cuartos (si pasan 8) -> Semis (2 partidos) -> Final (1 partido)
    let playoffMinutes = 0;
    if (totalPlayoffQualifiers > 4) {
      const qfMatches = totalPlayoffQualifiers - 4;
      playoffMinutes += Math.ceil(qfMatches / boardsCount) * matchDurationBase;
    }
    if (totalPlayoffQualifiers >= 4) {
      // Semifinales: 2 partidos (máximo usan 2 dianas)
      playoffMinutes += Math.ceil(2 / Math.min(boardsCount, 2)) * matchDurationSemis;
    }
    if (totalPlayoffQualifiers >= 2) {
      // Final: 1 partido en 1 diana
      playoffMinutes += matchDurationFinal;
    }
    const totalGroupsDurationMins = Math.round(groupStageMinutes + playoffMinutes);

    const isGroupsCurrent = currentFormat === 'ROUND_ROBIN' && activeGroupsCount === idealGroups;

    recs.push({
      id: 'GROUPS',
      format: 'ROUND_ROBIN',
      badge: '🥇 Opción Ideal Deportiva',
      badgeColor: 'bg-emerald-500/20 text-[#00e676] border-emerald-500/40',
      title: `Fase de Grupos (${idealGroups} Zonas) + Playoffs`,
      subtitle: `${idealGroups} zonas de ${basePerGroup}${extra > 0 ? `-${basePerGroup + 1}` : ''} jugadores • Clasifican los ${idealQualifiers} primeros`,
      groupsCount: idealGroups,
      qualifiersPerGroup: idealQualifiers,
      totalMatches: totalGroupsMatches,
      minMatchesPerPlayer: Math.max(2, basePerGroup - 1),
      byesInBracket: 0,
      estimatedMinutes2Boards: totalGroupsDurationMins,
      estimatedTotalMinutes: totalGroupsDurationMins,
      formattedDuration: formatMinutesToHoursAndMins(totalGroupsDurationMins),
      phaseBreakdownText: `Zonas: ${formatMinutesToHoursAndMins(groupStageMinutes)} + Playoffs: ${formatMinutesToHoursAndMins(playoffMinutes)}`,
      avgMinutesPerMatch: Math.round(matchDurationBase),
      avgMinutesPerLeg: minsPerLegBase,
      perks: [
        'Cero Byes en fase de grupos: todos compiten desde el inicio',
        `Mínimo ${Math.max(2, basePerGroup - 1)} partidos garantizados por jugador`,
        `Cruces olímpicos en Playoffs (${totalPlayoffQualifiers} clasificados)`
      ],
      isCurrentFormat: isGroupsCurrent
    });

    // --- RECOMENDACIÓN 2: DOBLE ELIMINACIÓN NAKKA (DOBLE VIDA) ---
    const bracketSize = N <= 4 ? 4 : N <= 8 ? 8 : N <= 16 ? 16 : 32;
    const byesDE = bracketSize - N;
    const deMatchesCount = Math.max(N * 2 - 2, N + 2);
    const isDeCurrent = currentFormat === 'DOUBLE_ELIMINATION';

    // Cálculo por oleadas en Doble Eliminación:
    // Partidos en Winners: N - 1. Partidos en Losers: N - 2. Gran Final: 1.
    const winnersMatchesCount = Math.max(1, N - 1);
    const losersMatchesCount = Math.max(1, N - 2);
    // Las primeras rondas usan todas las dianas; las rondas finales de Losers y Gran Final son secuenciales en 1 diana
    const parallelDeMatches = Math.max(0, deMatchesCount - 3);
    const parallelDeWaves = Math.ceil(parallelDeMatches / boardsCount);
    // 3 últimos cruces (Final Winners / Final Losers / Gran Final) requieren turnos secuenciales
    const deWinnersLosersMins = Math.round(
      parallelDeWaves * ((matchDurationBase + matchDurationLosers) / 2) + matchDurationSemis + matchDurationLosers
    );
    const deGrandFinalMins = Math.round(matchDurationGrandFinal);
    const totalDeDurationMins = deWinnersLosersMins + deGrandFinalMins;

    recs.push({
      id: 'DOUBLE_ELIM',
      format: 'DOUBLE_ELIMINATION',
      badge: '🥈 Doble Vida (Estilo Nakka N01)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      title: 'Doble Eliminación (Winners + Losers)',
      subtitle: `Cuadro de ${bracketSize} con repesca • Emparejamiento Compacto en R1 y R2`,
      totalMatches: deMatchesCount,
      minMatchesPerPlayer: 2,
      byesInBracket: byesDE,
      estimatedMinutes2Boards: totalDeDurationMins,
      estimatedTotalMinutes: totalDeDurationMins,
      formattedDuration: formatMinutesToHoursAndMins(totalDeDurationMins),
      phaseBreakdownText: `Cuadros W/L (${winnersMatchesCount + losersMatchesCount} pj): ${formatMinutesToHoursAndMins(deWinnersLosersMins)} + Final: ${formatMinutesToHoursAndMins(deGrandFinalMins)}`,
      avgMinutesPerMatch: Math.round((matchDurationBase + matchDurationLosers) / 2),
      avgMinutesPerLeg: minsPerLegBase,
      perks: [
        'Segunda oportunidad garantizada (mínimo 2 derrotas para quedar eliminado)',
        'Emparejamiento compacto: Byes juegan de inmediato en Ronda 2',
        'Estándar oficial competitivo de Nakka N01 y Challonge'
      ],
      isCurrentFormat: isDeCurrent
    });

    // --- RECOMENDACIÓN 3: ELIMINACIÓN SIMPLE DIRECTA (MÁXIMA VELOCIDAD) ---
    const seMatchesCount = N - 1;
    const isSeCurrent = currentFormat === 'SINGLE_ELIMINATION';

    // Cálculo por rondas reales en Eliminación Simple:
    // Ronda 1 tiene (N - bracketSize/2) partidos reales
    const r1RealMatches = Math.max(0, N - bracketSize / 2);
    let seTotalMins = 0;
    if (r1RealMatches > 0) {
      seTotalMins += Math.ceil(r1RealMatches / boardsCount) * matchDurationBase;
    }
    // Rondas restantes desde bracketSize/4 hasta 1 (Final)
    let currentRoundMatches = Math.floor(bracketSize / 4);
    while (currentRoundMatches >= 1) {
      if (currentRoundMatches === 1) {
        // Final (y 3er puesto en paralelo si hay >= 2 dianas)
        seTotalMins += boardsCount >= 2 ? matchDurationFinal : matchDurationFinal + matchDurationSemis * 0.8;
      } else if (currentRoundMatches === 2) {
        // Semifinales
        seTotalMins += Math.ceil(2 / Math.min(boardsCount, 2)) * matchDurationSemis;
      } else {
        // Cuartos u Octavos
        seTotalMins += Math.ceil(currentRoundMatches / boardsCount) * matchDurationBase;
      }
      currentRoundMatches = Math.floor(currentRoundMatches / 2);
    }
    const totalSeDurationMins = Math.max(Math.round(matchDurationFinal), Math.round(seTotalMins));

    recs.push({
      id: 'SINGLE_ELIM',
      format: 'SINGLE_ELIMINATION',
      badge: '🥉 Cierre Rápido / Knockout',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      title: 'Eliminación Simple Directa',
      subtitle: `${seMatchesCount} partidos en total (+ 3º puesto) • Mínima duración`,
      totalMatches: seMatchesCount,
      minMatchesPerPlayer: 1,
      byesInBracket: byesDE,
      estimatedMinutes2Boards: totalSeDurationMins,
      estimatedTotalMinutes: totalSeDurationMins,
      formattedDuration: formatMinutesToHoursAndMins(totalSeDurationMins),
      phaseBreakdownText: `Rondas previas: ${formatMinutesToHoursAndMins(Math.max(10, totalSeDurationMins - Math.round(matchDurationFinal)))} + Final: ${formatMinutesToHoursAndMins(matchDurationFinal)}`,
      avgMinutesPerMatch: Math.round(matchDurationBase),
      avgMinutesPerLeg: minsPerLegBase,
      perks: [
        `Finaliza en ~${formatMinutesToHoursAndMins(totalSeDurationMins)} usando ${boardsCount} ${boardsCount === 1 ? 'diana' : 'dianas'}`,
        'Llave compacta con máxima cantidad de cruces simultáneos',
        'Ideal si se dispone de ventana horaria acotada en la sede'
      ],
      isCurrentFormat: isSeCurrent
    });

    return recs;
  }, [
    enrolledCount,
    currentFormat,
    activeGroupsCount,
    activeQualifiersPerGroup,
    activeBaseAvg,
    activePlayoffsAvg,
    startingScore,
    outMode,
    legsToWin,
    boardsCount,
    roundLegsConfig
  ]);

  if (enrolledCount < 3 || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#0a0f1d] border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 transition-all">
      {/* Cabecera del Asesor */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#00e676]/20 border border-[#00e676]/40 flex items-center justify-center text-[#00e676] shadow-md shadow-[#00e676]/10 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Asesor Inteligente de Formato & Estimador de Tiempos</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {enrolledCount} inscriptos
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>
                  AVG {avgMode === 'AUTO' ? `Dinámico: ${activeBaseAvg}` : `Manual: ${activeBaseAvg}`}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cálculo dinámico de duración de llave según el AVG real registrado en la App / declarado, cantidad de dianas y modalidad ({startingScore} {outMode === 'DOUBLE_OUT' ? 'Double Out' : 'Single Out'})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title={isExpanded ? 'Contraer recomendaciones' : 'Expandir recomendaciones'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Panel de Simulación de Tiempo por AVG, Dianas y Legs */}
          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Selector de Modo de AVG: Dinámico vs Manual */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#00e676]" />
                    <span>Base de Cálculo de AVG:</span>
                  </span>

                  <div className="inline-flex rounded-xl bg-[#07090e] p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setAvgMode('AUTO')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 ${
                        avgMode === 'AUTO'
                          ? 'bg-[#00e676] text-[#07090e] shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Activity className="w-3 h-3" />
                      <span>Automático Inscriptos ({rosterAvgStats.meanAvg} AVG)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvgMode('MANUAL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 ${
                        avgMode === 'MANUAL'
                          ? 'bg-amber-400 text-[#07090e] shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Setear AVG Único Manual</span>
                    </button>
                  </div>

                  {resolvedPlayers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPlayersAvgBreakdown(!showPlayersAvgBreakdown)}
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Ver qué AVG se está utilizando para cada jugador inscripto"
                    >
                      <Eye className="w-3 h-3 text-[#00e676]" />
                      <span>{showPlayersAvgBreakdown ? 'Ocultar' : 'Ver'} AVG de los {resolvedPlayers.length} inscriptos</span>
                    </button>
                  )}
                </div>

                {/* Detalle del origen de los datos en modo AUTO, o controles de Slider en modo MANUAL */}
                {avgMode === 'AUTO' ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pl-0.5">
                    <span>
                      📊 Promedio general del cuadro: <strong className="text-white">{rosterAvgStats.meanAvg} AVG</strong> (Rango: {rosterAvgStats.minAvg} – {rosterAvgStats.maxAvg})
                    </span>
                    <span>
                      ⚡ Con estadísticas reales en App: <strong className="text-[#00e676]">{rosterAvgStats.fromAppStatsCount} jug.</strong>
                    </span>
                    <span>
                      📋 Con AVG declarado en ficha: <strong className="text-blue-300">{rosterAvgStats.fromDeclaredCount} jug.</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
                      <input
                        type="range"
                        min={25}
                        max={95}
                        step={0.5}
                        value={manualAvg}
                        onChange={(e) => setManualAvg( parseFloat(e.target.value) || 45 )}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex items-center bg-[#07090e] border border-amber-500/40 rounded-lg px-2 py-1">
                        <input
                          type="number"
                          min={20}
                          max={120}
                          step={0.5}
                          value={manualAvg}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) setManualAvg(Math.max(20, Math.min(120, val)));
                          }}
                          className="w-12 bg-transparent text-amber-300 font-mono font-black text-xs text-center focus:outline-none"
                        />
                        <span className="text-[10px] font-bold text-slate-400">AVG</span>
                      </div>
                    </div>

                    {/* Presets rápidos de AVG */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {[
                        { label: '35 Principiante', val: 35 },
                        { label: '45 Intermedio', val: 45 },
                        { label: '55 Avanzado', val: 55 },
                        { label: '70 Pro', val: 70 }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setManualAvg(preset.val)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                            Math.abs(manualAvg - preset.val) < 0.5
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-[#07090e] text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Controles de Dianas Simultáneas y Distancia de Partido */}
              <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                {/* Selector de Dianas en el Club */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    🎯 Dianas Simultáneas:
                  </span>
                  <div className="inline-flex rounded-xl bg-[#07090e] p-0.5 border border-slate-800">
                    {[1, 2, 3, 4].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBoardsCount(b)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                          boardsCount === b
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {b} {b === 1 ? 'Diana' : 'Dianas'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector de Distancia Base (Primero a X legs) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    🏁 Distancia Base:
                  </span>
                  <div className="inline-flex rounded-xl bg-[#07090e] p-0.5 border border-slate-800">
                    {[
                      { l: 2, label: '1º a 2 (Bo3)' },
                      { l: 3, label: '1º a 3 (Bo5)' },
                      { l: 4, label: '1º a 4 (Bo7)' },
                      { l: 5, label: '1º a 5 (Bo9)' }
                    ].map((opt) => (
                      <button
                        key={opt.l}
                        type="button"
                        onClick={() => setLegsToWin(opt.l)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                          legsToWin === opt.l
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desglose desplegable de los AVG individuales de cada inscripto */}
            {showPlayersAvgBreakdown && resolvedPlayers.length > 0 && (
              <div className="pt-2.5 border-t border-slate-800/90">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Padrón de Inscriptos y Origen de su AVG para la Simulación</span>
                  <span>
                    ⚡ = Estadística dinámica real (partidas jugadas en App) • 📋 = AVG declarado en perfil
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                  {resolvedPlayers.map((rp) => (
                    <div
                      key={rp.id}
                      className="px-2.5 py-1.5 rounded-xl bg-[#07090e] border border-slate-800/90 flex items-center justify-between gap-1.5 text-[11px]"
                    >
                      <span className="truncate font-bold text-slate-200" title={rp.name}>
                        {rp.name}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] shrink-0 ${
                          rp.source === 'APP_STATS'
                            ? 'bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30'
                            : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        }`}
                        title={
                          rp.source === 'APP_STATS'
                            ? `Estadística real en App (${rp.matchesPlayed} partidos registrados)`
                            : 'AVG declarado por el jugador en su ficha'
                        }
                      >
                        {rp.source === 'APP_STATS' ? '⚡ ' : '📋 '}
                        {rp.effectiveAvg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grilla de las 3 Opciones de Formato con Estimación Dinámica de Tiempo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {recommendations.map((rec) => {
              const isFast = rec.estimatedTotalMinutes <= 150;
              const isModerate = rec.estimatedTotalMinutes > 150 && rec.estimatedTotalMinutes <= 240;

              return (
                <div
                  key={rec.id}
                  className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all relative ${
                    rec.isCurrentFormat
                      ? 'bg-[#0f172a] border-[#00e676] shadow-lg shadow-[#00e676]/10 ring-1 ring-[#00e676]/50'
                      : 'bg-[#111622]/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Badges superiores */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${rec.badgeColor}`}>
                        {rec.badge}
                      </span>
                      {rec.isCurrentFormat && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#00e676] text-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Activo</span>
                        </span>
                      )}
                    </div>

                    {/* Título y subtítulo */}
                    <div>
                      <h5 className="text-sm font-black text-white">{rec.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rec.subtitle}</p>
                    </div>

                    {/* Bloque Destacado de Tiempo Estimado según AVG */}
                    <div className="rounded-xl bg-[#07090e] border border-slate-800 p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Duración Estimada ({boardsCount} {boardsCount === 1 ? 'diana' : 'dianas'}):</span>
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-mono font-black px-2 py-0.5 rounded-lg border ${
                            isFast
                              ? 'bg-[#00e676]/15 text-[#00e676] border-[#00e676]/30'
                              : isModerate
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-red-500/15 text-red-300 border-red-500/30'
                          }`}
                        >
                          ~{rec.formattedDuration}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium flex items-center justify-between pt-0.5">
                        <span>{rec.phaseBreakdownText}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1 mt-1">
                        <span>
                          ⏱️ <strong>~{rec.avgMinutesPerMatch} min</strong> / partido (1º a {legsToWin} legs)
                        </span>
                        <span>
                          🎯 <strong>~{rec.avgMinutesPerLeg} min</strong> / leg (AVG {activeBaseAvg})
                        </span>
                      </div>
                    </div>

                    {/* Métricas clave de la llave */}
                    <div className="grid grid-cols-3 gap-1.5 py-1.5 border-y border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Trophy className="w-3 h-3 text-[#00e676] shrink-0" />
                        <span><strong>{rec.totalMatches}</strong> partidos</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Users className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>Mín. <strong>{rec.minMatchesPerPlayer}</strong> pj/jug.</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Target className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>{rec.byesInBracket === 0 ? '0 Byes' : `${rec.byesInBracket} Byes`}</span>
                      </div>
                    </div>

                    {/* Ventajas */}
                    <ul className="space-y-1 text-[10px] text-slate-300">
                      {rec.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#00e676] font-bold">✓</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botón de Aplicación (Solo Administradores) */}
                  <div className="pt-3 mt-3 border-t border-slate-800/80">
                    {isAdmin && applyHandler ? (
                      <button
                        type="button"
                        onClick={() => applyHandler(rec)}
                        disabled={rec.isCurrentFormat}
                        className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                          rec.isCurrentFormat
                            ? 'bg-slate-800 text-slate-400 cursor-default opacity-80'
                            : rec.id === 'GROUPS'
                            ? 'bg-[#00e676] hover:bg-[#00c853] text-black shadow-[#00e676]/20'
                            : rec.id === 'DOUBLE_ELIM'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                        }`}
                      >
                        <span>{rec.isCurrentFormat ? 'Formato Actual en Uso' : `✨ Aplicar ${rec.title}`}</span>
                        {!rec.isCurrentFormat && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <div className="text-center text-[10px] text-slate-500 italic">
                        Formato sugerido para organizadores
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
