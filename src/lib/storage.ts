/**
 * Persistencia Offline-First para Locos por los Dardos • Argentina & Darderos MDQ
 * Diseñado para operar 100% offline en clubes, pubs y canchas de tiro con mala señal.
 */

import { MatchConfig, LandingShowcaseSettings, GrandTournamentRegistration, PlayerStats, PlayerHistoryDateItem, PlayerScopedStats, CompetitionScope, MatchLegBreakdown, MatchLegVisitCompact, PlayerHistoryMatchSummary } from './types';
import { getAdminRequestHeaders } from './client-auth';

export interface SavedMatchPlayer {
  id?: string;
  name: string;
  nickname?: string;
  score: number;
  avg: number;
  first9Avg?: number;
  legsWon: number;
  dartsThrown: number;
  bestLegDarts?: number;
  highestCheckout?: number;
  checkoutAttempts?: number;
  checkoutHits?: number;
  count180s?: number;
  count140Plus?: number;
  count100Plus?: number;
  count60Plus?: number;
  isWinner: boolean;
}

export interface SavedMatch {
  id: string;
  matchSignature?: string;
  gameType: 'X01' | 'CRICKET' | 'ROUND_THE_CLOCK';
  startingScore?: number;
  date: string;
  time?: string;
  isVsCpu?: boolean;
  cpuDifficulty?: string;
  competitionScope?: CompetitionScope;
  tournamentId?: string;
  tournamentTitle?: string;
  leagueId?: string;
  leagueName?: string;
  roundOrStage?: string;
  modality?: 'ONLINE' | 'PRESENCIAL';
  isDoublePoints?: boolean;
  pointsEarned?: number;
  players: SavedMatchPlayer[];
  legsTotal: number;
  winnerName?: string;
  legsBreakdown?: MatchLegBreakdown[];
}

export function createEmptyPlayerStats(initialAvg = 0): PlayerStats {
  return {
    overallAvg: initialAvg,
    first9Avg: initialAvg,
    matchesPlayed: 0,
    matchesWon: 0,
    legsPlayed: 0,
    legsWon: 0,
    highestCheckout: 0,
    checkoutAttempts: 0,
    checkoutHits: 0,
    checkoutPercentage: 0,
    count180s: 0,
    count140Plus: 0,
    count100Plus: 0,
    count60Plus: 0,
    bestLegDarts: 0
  };
}

export function mergePlayerMatchStats(
  prevStats: Partial<PlayerStats> | undefined,
  mp: SavedMatchPlayer,
  legsTotal: number
): PlayerStats {
  const prev = { ...createEmptyPlayerStats(0), ...(prevStats || {}) };
  const m = prev.matchesPlayed || 0;
  const newPlayed = m + 1;
  const newWon = (prev.matchesWon || 0) + (mp.isWinner ? 1 : 0);
  const newLegsPlayed = (prev.legsPlayed || 0) + Math.max(legsTotal || 0, mp.legsWon || 0, 1);
  const newLegsWon = (prev.legsWon || 0) + (mp.legsWon || 0);

  const mpAvg = Number.isFinite(mp.avg) ? mp.avg : 0;
  const mpFirst9 = Number.isFinite(mp.first9Avg) && (mp.first9Avg || 0) > 0 ? (mp.first9Avg as number) : mpAvg;

  const newOverallAvg = m === 0
    ? Number(mpAvg.toFixed(2))
    : Number((((prev.overallAvg * m) + mpAvg) / newPlayed).toFixed(2));

  const newFirst9Avg = m === 0
    ? Number(mpFirst9.toFixed(2))
    : Number((((prev.first9Avg * m) + mpFirst9) / newPlayed).toFixed(2));

  const mpCheckout = mp.highestCheckout ?? (mp.isWinner ? mp.score : 0) ?? 0;
  const newHighestCheckout = Math.max(prev.highestCheckout || 0, mpCheckout);

  const inferredHits = mp.checkoutHits !== undefined ? mp.checkoutHits : (mp.legsWon || 0);
  const inferredAttempts = mp.checkoutAttempts !== undefined
    ? Math.max(mp.checkoutAttempts, inferredHits)
    : Math.max(inferredHits, mp.legsWon > 0 ? mp.legsWon * 2 : 1);

  const newCheckoutAttempts = (prev.checkoutAttempts || 0) + inferredAttempts;
  const newCheckoutHits = (prev.checkoutHits || 0) + inferredHits;
  const newCheckoutPercentage = newCheckoutAttempts > 0
    ? Number(((newCheckoutHits / newCheckoutAttempts) * 100).toFixed(1))
    : 0;

  const candidateBestLeg = mp.bestLegDarts && mp.bestLegDarts > 0 && mp.bestLegDarts < 99
    ? mp.bestLegDarts
    : (mp.dartsThrown && mp.dartsThrown > 0 && mp.dartsThrown < 99 ? mp.dartsThrown : 0);

  const newBestLegDarts = candidateBestLeg > 0
    ? (prev.bestLegDarts > 0 ? Math.min(prev.bestLegDarts, candidateBestLeg) : candidateBestLeg)
    : (prev.bestLegDarts || 0);

  return {
    overallAvg: newOverallAvg,
    first9Avg: newFirst9Avg,
    matchesPlayed: newPlayed,
    matchesWon: newWon,
    legsPlayed: newLegsPlayed,
    legsWon: newLegsWon,
    highestCheckout: newHighestCheckout,
    checkoutAttempts: newCheckoutAttempts,
    checkoutHits: newCheckoutHits,
    checkoutPercentage: newCheckoutPercentage,
    count180s: (prev.count180s || 0) + (mp.count180s || 0),
    count140Plus: (prev.count140Plus || 0) + (mp.count140Plus || 0),
    count100Plus: (prev.count100Plus || 0) + (mp.count100Plus || 0),
    count60Plus: (prev.count60Plus || 0) + (mp.count60Plus || 0),
    bestLegDarts: newBestLegDarts
  };
}

function normalizeIdentityToken(str?: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function doesMatchPlayerBelongToProfile(mp: SavedMatchPlayer, profile: any): boolean {
  if (!mp || !profile) return false;
  if (mp.id && profile.id && mp.id === profile.id && mp.id !== 'p1-local' && mp.id !== 'p2-local') {
    return true;
  }
  const mpName = normalizeIdentityToken(mp.name);
  const mpNick = normalizeIdentityToken(mp.nickname);
  const profName = normalizeIdentityToken(profile.fullName || profile.name);
  const profNick = normalizeIdentityToken(profile.nickname);

  if (!mpName && !mpNick) return false;

  if (profNick && (mpName === profNick || mpNick === profNick || mpName.includes(` ${profNick}`) || mpName.startsWith(`${profNick} `))) {
    return true;
  }
  if (profName && (mpName === profName || mpName.includes(profName) || profName.includes(mpName))) {
    return true;
  }
  // Caso especial Mariano Deux / ICEMAN
  const isProfileIceman = profNick === 'iceman' || profName.includes('mariano deux') || (profile.email || '').toLowerCase() === 'marianodeux@gmail.com';
  const isMpIceman = mpName === 'iceman' || mpNick === 'iceman' || mpName.includes('mariano deux') || mpName.includes('iceman');
  if (isProfileIceman && isMpIceman) return true;

  return false;
}

export function isBotMatchOrOpponent(item: any): boolean {
  if (!item) return false;
  if (item.isVsCpu === true || item.competitionScope === 'BOT' || item.eventType === 'BOT') {
    return true;
  }
  const tokensToCheck: string[] = [];
  if (item.opponentName) tokensToCheck.push(String(item.opponentName));
  if (item.winnerName) tokensToCheck.push(String(item.winnerName));
  if (Array.isArray(item.players)) {
    for (const p of item.players) {
      if (p?.id) tokensToCheck.push(String(p.id));
      if (p?.name) tokensToCheck.push(String(p.name));
      if (p?.nickname) tokensToCheck.push(String(p.nickname));
    }
  }
  const combined = normalizeIdentityToken(tokensToCheck.join(' '));
  return (
    combined.includes('dartbot') ||
    combined.includes('cpu ') ||
    combined.startsWith('cpu') ||
    combined.includes(' bot ') ||
    combined.startsWith('bot ') ||
    combined.endsWith(' bot') ||
    combined === 'bot' ||
    combined.includes('maquina')
  );
}

export function extractMatchTimeStr(match: any): string {
  if (!match) return '';
  if (typeof match.time === 'string' && /^\d{1,2}:\d{2}/.test(match.time.trim())) {
    return match.time.trim();
  }
  if (Array.isArray(match.turnHistory) && match.turnHistory.length > 0 && match.turnHistory[0]?.timeStr) {
    return String(match.turnHistory[0].timeStr);
  }
  if (typeof match.date === 'string' && match.date.includes('T')) {
    const d = new Date(match.date);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  }
  if (typeof match.id === 'string') {
    const tsMatch = match.id.match(/(\d{13})/);
    if (tsMatch) {
      const ts = parseInt(tsMatch[1], 10);
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    }
  }
  return '';
}

export function computeCanonicalMatchSignature(match: Partial<SavedMatch>): string {
  const p0 = match.players?.[0];
  const p1 = match.players?.[1];
  const dateDay = (match.date || '').split('T')[0] || 'nodate';
  const name0 = normalizeIdentityToken(p0?.name || p0?.nickname || 'p1');
  const name1 = normalizeIdentityToken(p1?.name || p1?.nickname || 'p2');
  return [
    dateDay,
    match.gameType || 'X01',
    name0,
    name1,
    p0?.legsWon ?? 0,
    p1?.legsWon ?? 0,
    Number(p0?.avg || 0).toFixed(1),
    Number(p1?.avg || 0).toFixed(1),
    match.tournamentId || match.leagueId || 'standalone'
  ].join('|');
}

export function buildLegsBreakdownFromTurnHistory(
  turnHistory: any[] | undefined,
  startingScore: number = 501,
  legsWon: [number, number] = [0, 0],
  p1Name: string = 'Jugador 1',
  p2Name: string = 'Jugador 2'
): MatchLegBreakdown[] {
  if (!Array.isArray(turnHistory) || turnHistory.length === 0) {
    return [];
  }

  // En X01Board, turnHistory guarda el turno más reciente primero; invertimos para orden cronológico
  const chronological = [...turnHistory].reverse();
  const byLeg = new Map<number, any[]>();

  for (const t of chronological) {
    const legNum = Number(t.legIndex) || 1;
    if (!byLeg.has(legNum)) {
      byLeg.set(legNum, []);
    }
    byLeg.get(legNum)!.push(t);
  }

  const legs: MatchLegBreakdown[] = [];
  const sortedLegNums = Array.from(byLeg.keys()).sort((a, b) => a - b);

  for (const legNum of sortedLegNums) {
    const turns = byLeg.get(legNum) || [];
    if (turns.length === 0) continue;

    const starterIndex: 0 | 1 = turns[0]?.playerIndex === 1 ? 1 : 0;
    let dartsP1 = 0;
    let dartsP2 = 0;
    let pointsP1 = 0;
    let pointsP2 = 0;
    let highVisitP1 = 0;
    let highVisitP2 = 0;
    let checkoutScore = 0;
    let winnerIndex: 0 | 1 = 0;
    let foundZero = false;

    const visits: MatchLegVisitCompact[] = [];
    let p1VisitCount = 0;
    let p2VisitCount = 0;

    for (const t of turns) {
      const pIdx: 0 | 1 = t.playerIndex === 1 ? 1 : 0;
      const isBust = !!t.isBust;
      const score = isBust ? 0 : (Number(t.score) || 0);
      const remAfter = Number(t.remainingAfter ?? startingScore);

      if (pIdx === 0) {
        p1VisitCount += 1;
        dartsP1 += 3;
        pointsP1 += score;
        if (score > highVisitP1) highVisitP1 = score;
      } else {
        p2VisitCount += 1;
        dartsP2 += 3;
        pointsP2 += score;
        if (score > highVisitP2) highVisitP2 = score;
      }

      const roundNum = pIdx === 0 ? p1VisitCount : p2VisitCount;
      visits.push({
        r: roundNum,
        p: pIdx,
        s: score,
        rem: remAfter,
        ...(isBust ? { bust: true } : {})
      });

      if (!isBust && remAfter === 0) {
        winnerIndex = pIdx;
        checkoutScore = score;
        foundZero = true;
      }
    }

    if (!foundZero) {
      winnerIndex = legsWon[0] >= legsWon[1] ? 0 : 1;
    }

    const avgP1 = dartsP1 > 0 ? Number(((pointsP1 / dartsP1) * 3).toFixed(2)) : 0;
    const avgP2 = dartsP2 > 0 ? Number(((pointsP2 / dartsP2) * 3).toFixed(2)) : 0;

    legs.push({
      legNumber: legNum,
      winnerIndex,
      winnerName: winnerIndex === 0 ? p1Name : p2Name,
      starterIndex,
      dartsP1,
      dartsP2,
      avgP1,
      avgP2,
      checkoutScore: checkoutScore || undefined,
      highVisitP1,
      highVisitP2,
      visits
    });
  }

  return legs;
}

export function synthesizeLegsBreakdownFromSummary(summary: {
  startingScore?: number;
  p1Name: string;
  p2Name: string;
  legsP1: number;
  legsP2: number;
  avgP1: number;
  avgP2: number;
  dartsP1?: number;
  dartsP2?: number;
  bestLegP1?: number;
  bestLegP2?: number;
  highFinishP1?: number;
  highFinishP2?: number;
}): MatchLegBreakdown[] {
  const totalLegs = Math.max(1, (summary.legsP1 || 0) + (summary.legsP2 || 0));
  const startPts = summary.startingScore || 501;
  const result: MatchLegBreakdown[] = [];

  let remWinsP1 = summary.legsP1 || 0;
  let remWinsP2 = summary.legsP2 || 0;

  const estDartsPerLegP1 = summary.avgP1 > 0
    ? Math.max(9, Math.round((startPts / summary.avgP1) * 3))
    : 24;
  const estDartsPerLegP2 = summary.avgP2 > 0
    ? Math.max(9, Math.round((startPts / summary.avgP2) * 3))
    : 27;

  for (let i = 1; i <= totalLegs; i++) {
    let winnerIdx: 0 | 1 = 0;
    if (remWinsP1 > 0 && (remWinsP2 === 0 || i % 2 === 1)) {
      winnerIdx = 0;
      remWinsP1 -= 1;
    } else if (remWinsP2 > 0) {
      winnerIdx = 1;
      remWinsP2 -= 1;
    } else {
      winnerIdx = 0;
    }

    const isBestLegForP1 = winnerIdx === 0 && i === 1 && summary.bestLegP1 && summary.bestLegP1 > 0 && summary.bestLegP1 < 90;
    const isBestLegForP2 = winnerIdx === 1 && i === 1 && summary.bestLegP2 && summary.bestLegP2 > 0 && summary.bestLegP2 < 90;

    const legDartsP1 = isBestLegForP1
      ? summary.bestLegP1!
      : (summary.dartsP1 && totalLegs > 0 && summary.dartsP1 >= totalLegs * 9
          ? Math.round(summary.dartsP1 / totalLegs)
          : estDartsPerLegP1);

    const legDartsP2 = isBestLegForP2
      ? summary.bestLegP2!
      : (summary.dartsP2 && totalLegs > 0 && summary.dartsP2 >= totalLegs * 9
          ? Math.round(summary.dartsP2 / totalLegs)
          : estDartsPerLegP2);

    const checkout = winnerIdx === 0
      ? (i === 1 && summary.highFinishP1 ? summary.highFinishP1 : undefined)
      : (i === 1 && summary.highFinishP2 ? summary.highFinishP2 : undefined);

    result.push({
      legNumber: i,
      winnerIndex: winnerIdx,
      winnerName: winnerIdx === 0 ? summary.p1Name : summary.p2Name,
      starterIndex: ((i - 1) % 2) as 0 | 1,
      dartsP1: legDartsP1,
      dartsP2: legDartsP2,
      avgP1: Number((summary.avgP1 || 0).toFixed(2)),
      avgP2: Number((summary.avgP2 || 0).toFixed(2)),
      checkoutScore: checkout,
      isSynthesized: true
    });
  }

  return result;
}

export function buildMatchSummaryFromSavedMatch(
  match: SavedMatch,
  includeLegVisits: boolean = false
): PlayerHistoryMatchSummary {
  const p0 = match.players?.[0] || ({ name: 'Jugador 1', avg: 0, legsWon: 0, dartsThrown: 0, isWinner: true } as SavedMatchPlayer);
  const p1 = match.players?.[1] || ({ name: 'Jugador 2', avg: 0, legsWon: 0, dartsThrown: 0, isWinner: false } as SavedMatchPlayer);

  const rawLegs = Array.isArray(match.legsBreakdown) && match.legsBreakdown.length > 0
    ? match.legsBreakdown.map(l => includeLegVisits ? l : { ...l, visits: undefined })
    : synthesizeLegsBreakdownFromSummary({
        startingScore: match.startingScore || 501,
        p1Name: p0.name || p0.nickname || 'Jugador 1',
        p2Name: p1.name || p1.nickname || 'Jugador 2',
        legsP1: p0.legsWon || 0,
        legsP2: p1.legsWon || 0,
        avgP1: p0.avg || 0,
        avgP2: p1.avg || 0,
        dartsP1: p0.dartsThrown || 0,
        dartsP2: p1.dartsThrown || 0,
        bestLegP1: p0.bestLegDarts || 0,
        bestLegP2: p1.bestLegDarts || 0,
        highFinishP1: p0.highestCheckout || p0.score || 0,
        highFinishP2: p1.highestCheckout || p1.score || 0
      });

  const hitsP1 = p0.checkoutHits !== undefined ? p0.checkoutHits : (p0.legsWon || 0);
  const attP1 = p0.checkoutAttempts !== undefined ? Math.max(p0.checkoutAttempts, hitsP1) : Math.max(hitsP1, (p0.legsWon || 0) * 2);
  const hitsP2 = p1.checkoutHits !== undefined ? p1.checkoutHits : (p1.legsWon || 0);
  const attP2 = p1.checkoutAttempts !== undefined ? Math.max(p1.checkoutAttempts, hitsP2) : Math.max(hitsP2, (p1.legsWon || 0) * 2);

  return {
    gameType: match.gameType || 'X01',
    startingScore: match.startingScore || 501,
    p1Name: p0.name || p0.nickname || 'Jugador 1',
    p2Name: p1.name || p1.nickname || 'Jugador 2',
    legsP1: p0.legsWon || 0,
    legsP2: p1.legsWon || 0,
    avgP1: Number((p0.avg || 0).toFixed(2)),
    avgP2: Number((p1.avg || 0).toFixed(2)),
    first9P1: Number((p0.first9Avg || p0.avg || 0).toFixed(2)),
    first9P2: Number((p1.first9Avg || p1.avg || 0).toFixed(2)),
    dartsP1: p0.dartsThrown || 0,
    dartsP2: p1.dartsThrown || 0,
    checkoutHitsP1: hitsP1,
    checkoutAttemptsP1: attP1,
    checkoutHitsP2: hitsP2,
    checkoutAttemptsP2: attP2,
    highFinishP1: p0.highestCheckout || (p0.isWinner ? p0.score : 0) || 0,
    highFinishP2: p1.highestCheckout || (p1.isWinner ? p1.score : 0) || 0,
    bestLegP1: p0.bestLegDarts && p0.bestLegDarts < 99 ? p0.bestLegDarts : 0,
    bestLegP2: p1.bestLegDarts && p1.bestLegDarts < 99 ? p1.bestLegDarts : 0,
    count100sP1: p0.count100Plus || 0,
    count100sP2: p1.count100Plus || 0,
    count140sP1: p0.count140Plus || 0,
    count140sP2: p1.count140Plus || 0,
    count180sP1: p0.count180s || 0,
    count180sP2: p1.count180s || 0,
    legsBreakdown: rawLegs
  };
}

export function resolveMatchScope(match: Partial<SavedMatch>): Exclude<CompetitionScope, 'BOT'> {
  if (match.competitionScope && match.competitionScope !== 'BOT') {
    return match.competitionScope;
  }
  const titleLower = `${match.leagueName || ''} ${match.tournamentTitle || ''}`.toLowerCase();
  if (titleLower.includes('nacional') || titleLower.includes('arg') || titleLower.includes('federad')) {
    return 'NATIONAL_LEAGUE';
  }
  if (match.leagueId || match.leagueName || titleLower.includes('liga')) {
    return 'LOCAL_LEAGUE';
  }
  if (match.tournamentId || match.tournamentTitle) {
    return 'STANDALONE_TOURNAMENT';
  }
  return 'INDIVIDUAL';
}

export function applyMatchToPlayerProfile(profile: any, match: SavedMatch): { updated: boolean; profile: any } {
  if (!profile || isBotMatchOrOpponent(match) || !Array.isArray(match.players) || match.players.length < 2) {
    return { updated: false, profile };
  }

  const p0 = match.players[0];
  const p1 = match.players[1];
  const isP0 = doesMatchPlayerBelongToProfile(p0, profile);
  const isP1 = !isP0 && doesMatchPlayerBelongToProfile(p1, profile);

  if (!isP0 && !isP1) {
    return { updated: false, profile };
  }

  const myPlayer = isP0 ? p0 : p1;
  const oppPlayer = isP0 ? p1 : p0;

  const prevScoped: PlayerScopedStats = {
    individual: profile.scopedStats?.individual,
    standaloneTournament: profile.scopedStats?.standaloneTournament,
    localLeague: profile.scopedStats?.localLeague,
    nationalLeague: profile.scopedStats?.nationalLeague,
    nationalPointsOnline: profile.scopedStats?.nationalPointsOnline || 0,
    nationalPointsPresencial: profile.scopedStats?.nationalPointsPresencial || 0,
    nationalTotalPoints: profile.scopedStats?.nationalTotalPoints || 0,
    byCompetitionId: { ...(profile.scopedStats?.byCompetitionId || {}) },
    syncedMatchIds: [...(profile.scopedStats?.syncedMatchIds || [])]
  };

  const canonicalSig = computeCanonicalMatchSignature(match);
  const matchKey = match.matchSignature || canonicalSig;

  if (prevScoped.syncedMatchIds?.includes(canonicalSig) || (matchKey && prevScoped.syncedMatchIds?.includes(matchKey))) {
    return { updated: false, profile };
  }
  if (match.id && prevScoped.syncedMatchIds?.includes(match.id)) {
    return { updated: false, profile };
  }

  const scope = resolveMatchScope(match);
  const legsTotal = match.legsTotal || ((p0.legsWon || 0) + (p1.legsWon || 0)) || 1;

  // 1. Actualizar estadística oficial global acumulada del perfil
  const updatedGlobalStats = mergePlayerMatchStats(profile.stats, myPlayer, legsTotal);

  // 2. Actualizar estadística aislada según el ámbito (Scope)
  if (scope === 'INDIVIDUAL') {
    prevScoped.individual = mergePlayerMatchStats(prevScoped.individual, myPlayer, legsTotal);
  } else if (scope === 'STANDALONE_TOURNAMENT') {
    prevScoped.standaloneTournament = mergePlayerMatchStats(prevScoped.standaloneTournament, myPlayer, legsTotal);
  } else if (scope === 'LOCAL_LEAGUE') {
    prevScoped.localLeague = mergePlayerMatchStats(prevScoped.localLeague, myPlayer, legsTotal);
  } else if (scope === 'NATIONAL_LEAGUE') {
    prevScoped.nationalLeague = mergePlayerMatchStats(prevScoped.nationalLeague, myPlayer, legsTotal);
    const basePts = myPlayer.isWinner ? 15 : 5;
    const isDouble = !!match.isDoublePoints || match.modality === 'PRESENCIAL';
    const earned = match.pointsEarned ?? (isDouble ? basePts * 2 : basePts);
    if (isDouble) {
      prevScoped.nationalPointsPresencial = (prevScoped.nationalPointsPresencial || 0) + earned;
    } else {
      prevScoped.nationalPointsOnline = (prevScoped.nationalPointsOnline || 0) + earned;
    }
    prevScoped.nationalTotalPoints = (prevScoped.nationalPointsOnline || 0) + (prevScoped.nationalPointsPresencial || 0);
  }

  // 3. Si pertenece a un Torneo o Liga específica, mantener métrica propia de esa Liga/Torneo
  if (scope !== 'INDIVIDUAL') {
    const compId = match.leagueId || match.tournamentId || normalizeIdentityToken(match.leagueName || match.tournamentTitle || 'torneo-oficial');
    const compName = match.leagueName || match.tournamentTitle || (scope === 'NATIONAL_LEAGUE' ? 'Liga Nacional Argentina' : scope === 'LOCAL_LEAGUE' ? 'Liga Local Oficial' : 'Torneo Oficial');
    const existingComp = prevScoped.byCompetitionId?.[compId];
    const basePts = myPlayer.isWinner ? 15 : 5;
    const isDouble = scope === 'NATIONAL_LEAGUE' && (!!match.isDoublePoints || match.modality === 'PRESENCIAL');
    const earned = match.pointsEarned ?? (isDouble ? basePts * 2 : basePts);

    if (prevScoped.byCompetitionId) {
      prevScoped.byCompetitionId[compId] = {
        id: compId,
        name: compName,
        scope,
        modality: match.modality || (isDouble ? 'PRESENCIAL' : 'ONLINE'),
        isDoublePoints: isDouble,
        pointsEarned: (existingComp?.pointsEarned || 0) + earned,
        lastPlayed: match.date,
        stats: mergePlayerMatchStats(existingComp?.stats, myPlayer, legsTotal)
      };
    }
  }

  if (canonicalSig && !prevScoped.syncedMatchIds?.includes(canonicalSig)) {
    prevScoped.syncedMatchIds?.push(canonicalSig);
  }
  if (matchKey && matchKey !== canonicalSig && !prevScoped.syncedMatchIds?.includes(matchKey)) {
    prevScoped.syncedMatchIds?.push(matchKey);
  }
  if (match.id && !prevScoped.syncedMatchIds?.includes(match.id)) {
    prevScoped.syncedMatchIds?.push(match.id);
  }

  // 4. Registrar en recentHistory para trazabilidad por ámbito (con hora y resumen de partida/legs)
  const isDouble = scope === 'NATIONAL_LEAGUE' && (!!match.isDoublePoints || match.modality === 'PRESENCIAL');
  const basePts = myPlayer.isWinner ? 15 : 5;
  const computedPoints = scope === 'INDIVIDUAL' ? undefined : (match.pointsEarned ?? (isDouble ? basePts * 2 : basePts));
  const resolvedTime = extractMatchTimeStr(match);

  const historyItem: PlayerHistoryDateItem = {
    id: match.id,
    matchSignature: canonicalSig,
    eventName: match.leagueName || match.tournamentTitle || (scope === 'NATIONAL_LEAGUE' ? 'Liga Nacional Argentina' : scope === 'LOCAL_LEAGUE' ? 'Liga Local Oficial' : scope === 'STANDALONE_TOURNAMENT' ? 'Torneo Oficial' : 'Partida Individual 1 vs 1'),
    eventType: scope,
    targetId: match.leagueId || match.tournamentId || match.id,
    targetTab: scope === 'LOCAL_LEAGUE' || scope === 'NATIONAL_LEAGUE' ? 'LEAGUES_TAB' : 'HISTORY_TAB',
    date: match.date ? match.date.split('T')[0] : new Date().toISOString().split('T')[0],
    time: resolvedTime || undefined,
    roundOrStage: match.roundOrStage || (scope === 'INDIVIDUAL' ? `Anotador Oficial (${match.gameType})` : 'Cruces Oficiales'),
    opponentName: oppPlayer.name,
    scoreLegs: `${ myPlayer.legsWon ?? 0 } - ${ oppPlayer.legsWon ?? 0 }`,
    isWin: !!myPlayer.isWinner,
    avg: Number((myPlayer.avg || 0).toFixed(2)),
    modality: match.modality || (isDouble ? 'PRESENCIAL' : 'ONLINE'),
    isDoublePoints: isDouble,
    pointsEarned: computedPoints,
    highestCheckout: myPlayer.highestCheckout || 0,
    count180s: myPlayer.count180s || 0,
    matchSummary: buildMatchSummaryFromSavedMatch(match, false)
  };

  const existingHistory: PlayerHistoryDateItem[] = Array.isArray(profile.recentHistory) ? profile.recentHistory : [];
  const itemDedupKey = `${historyItem.date}|${normalizeIdentityToken(historyItem.opponentName)}|${historyItem.scoreLegs}|${Number(historyItem.avg).toFixed(1)}`;
  const filteredHistory = existingHistory.filter(h => {
    if (h.id === match.id) return false;
    if (h.matchSignature && h.matchSignature === canonicalSig) return false;
    const hKey = `${(h.date || '').split('T')[0]}|${normalizeIdentityToken(h.opponentName)}|${h.scoreLegs}|${Number(h.avg || 0).toFixed(1)}`;
    return hKey !== itemDedupKey;
  });
  const updatedHistory = [historyItem, ...filteredHistory].slice(0, 40);

  const updatedProfile = {
    ...profile,
    estimatedAvg: updatedGlobalStats.overallAvg > 0 ? updatedGlobalStats.overallAvg : profile.estimatedAvg,
    stats: updatedGlobalStats,
    scopedStats: prevScoped,
    recentHistory: updatedHistory
  };

  return { updated: true, profile: updatedProfile };
}


const STORAGE_KEYS = {
  MATCHES: 'lpld_matches_history_v1',
  BOT_MATCHES: 'lpld_bot_matches_history_v1',
  BOT_STATS: 'lpld_bot_stats_v1',
  ACTIVE_SESSION: 'lpld_active_match_session_v1',
  CURRENT_PLAYER: 'lpld_player_profile_v1',
  LAST_PLAYER: 'lpld_last_player_v1',
  RECENT_ACCOUNTS: 'lpld_recent_accounts_v1',
  OFFLINE_QUEUE: 'lpld_sync_queue_v1',
  TOURNAMENTS: 'lpld_tournaments_local_v1',
  GRAND_REGISTRATIONS: 'lpld_grand_tournament_registrations_v1',
};

export function syncMatchResultToCloud(match: SavedMatch): void {
  if (typeof window === 'undefined' || isBotMatchOrOpponent(match)) return;
  fetch('/api/jugadores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAdminRequestHeaders() },
    body: JSON.stringify({ action: 'RECORD_MATCH', match })
  }).catch((err) => {
    console.warn('[Storage Cloud Match Sync] Error sincronizando partida en la nube:', err);
  });
}

// --- Persistencia de Partidas (Anotador) ---
export function saveCompletedMatch(match: Omit<SavedMatch, 'id' | 'date'> & { id?: string; date?: string }): SavedMatch {
  if (typeof window === 'undefined') return match as SavedMatch;

  const isVsBot = isBotMatchOrOpponent(match);
  const nowIso = match.date && match.date.includes('T') ? match.date : new Date().toISOString();
  const resolvedId = match.id || `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const tempMatchForSig: Partial<SavedMatch> = {
    ...match,
    id: resolvedId,
    date: nowIso
  };
  const computedSignature = computeCanonicalMatchSignature(tempMatchForSig);
  const resolvedTime = extractMatchTimeStr(tempMatchForSig) || new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

  const newMatch: SavedMatch = {
    ...match,
    id: resolvedId,
    matchSignature: computedSignature,
    isVsCpu: isVsBot,
    competitionScope: isVsBot ? 'BOT' : resolveMatchScope(match),
    date: nowIso,
    time: resolvedTime
  };

  try {
    // Si la partida es contra el BOT (Modo Práctica), se guarda de forma aislada
    // para no alterar el promedio oficial ni el ranking federado del jugador
    if (newMatch.isVsCpu) {
      const existingBot = getBotMatches();
      const duplicateBot = existingBot.find(
        m => m.id === newMatch.id || computeCanonicalMatchSignature(m) === computedSignature
      );
      if (duplicateBot) {
        return duplicateBot;
      }

      const updatedBot = [newMatch, ...existingBot].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.BOT_MATCHES, JSON.stringify(updatedBot));
      recalculateBotStatsFromMatches(updatedBot);
      return newMatch;
    }

    // Partida Competitiva Oficial (PvP: Individual, Torneos Locales, Ligas Locales o Liga Nacional)
    const existing = getSavedMatches();
    const duplicateOfficial = existing.find(
      m => m.id === newMatch.id || computeCanonicalMatchSignature(m) === computedSignature
    );
    const matchToProcess = duplicateOfficial || newMatch;

    if (!duplicateOfficial) {
      const updated = [newMatch, ...existing].slice(0, 80); // Mantenemos las últimas 80 partidas en local
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));
    } else if (newMatch.legsBreakdown && (!duplicateOfficial.legsBreakdown || duplicateOfficial.legsBreakdown.length === 0)) {
      // Si llega versión enriquecida con legsBreakdown, actualizar en local
      duplicateOfficial.legsBreakdown = newMatch.legsBreakdown;
      duplicateOfficial.time = duplicateOfficial.time || newMatch.time;
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(existing));
    }

    // Actualizar inmediatamente el perfil local del jugador conectado (y cuentas recientes)
    try {
      const rawCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER);
      if (rawCurrent) {
        const currentProf = JSON.parse(rawCurrent);
        const { updated: profChanged, profile: newProf } = applyMatchToPlayerProfile(currentProf, matchToProcess);
        if (profChanged) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(newProf));
          localStorage.setItem(STORAGE_KEYS.LAST_PLAYER, JSON.stringify(newProf));
          window.dispatchEvent(new CustomEvent('lpld_profile_updated', { detail: newProf }));
          window.dispatchEvent(new CustomEvent('lpld_player_stats_updated', { detail: newProf }));
        }
      }
    } catch (profErr) {
      console.warn('[Storage] Error actualizando perfil local tras partida:', profErr);
    }

    // Sincronizar en la nube para ambos jugadores (Player 1 y Player 2)
    if (!duplicateOfficial) {
      syncMatchResultToCloud(matchToProcess);
      queueForSync('MATCH', matchToProcess);
    }

    window.dispatchEvent(new CustomEvent('lpld_matches_updated', { detail: matchToProcess }));
    return matchToProcess;
  } catch (err) {
    console.warn('[Storage] Error al guardar partida offline:', err);
  }

  return newMatch;
}

function recalculateBotStatsFromMatches(botMatches: SavedMatch[]) {
  if (typeof window === 'undefined') return;
  let played = 0;
  let won = 0;
  let sumAvg = 0;
  let sumFirst9 = 0;
  let highCo = 0;
  let c180 = 0;
  let c140 = 0;
  let c100 = 0;
  let bestLeg = 0;

  for (const bm of botMatches) {
    const p1 = bm.players?.[0];
    if (!p1) continue;
    played += 1;
    if (p1.isWinner) won += 1;
    sumAvg += p1.avg || 0;
    sumFirst9 += p1.first9Avg || p1.avg || 0;
    const co = p1.highestCheckout || (p1.isWinner ? p1.score : 0) || 0;
    if (co > highCo) highCo = co;
    c180 += p1.count180s || 0;
    c140 += p1.count140Plus || 0;
    c100 += p1.count100Plus || 0;
    const bl = p1.bestLegDarts && p1.bestLegDarts > 0 && p1.bestLegDarts < 99 ? p1.bestLegDarts : 0;
    if (bl > 0) {
      bestLeg = bestLeg > 0 ? Math.min(bestLeg, bl) : bl;
    }
  }

  const updatedBotStats = {
    matchesPlayed: played,
    matchesWon: won,
    overallAvg: played > 0 ? Number((sumAvg / played).toFixed(2)) : 0,
    first9Avg: played > 0 ? Number((sumFirst9 / played).toFixed(2)) : 0,
    highestCheckout: highCo,
    count180s: c180,
    count140Plus: c140,
    count100Plus: c100,
    bestLegDarts: bestLeg,
    lastPlayed: botMatches[0]?.date || new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.BOT_STATS, JSON.stringify(updatedBotStats));
  window.dispatchEvent(new CustomEvent('lpld_bot_stats_updated', { detail: updatedBotStats }));
}

export function sanitizeAndDeduplicateProfileMatches(
  profile: any,
  localOfficialMatches: SavedMatch[] = []
): { cleaned: boolean; profile: any } {
  if (!profile) return { cleaned: false, profile };

  const rawHistory: PlayerHistoryDateItem[] = Array.isArray(profile.recentHistory) ? profile.recentHistory : [];
  const seenKeys = new Set<string>();
  const cleanHistory: PlayerHistoryDateItem[] = [];
  let hadDuplicatesOrBotsInHistory = false;

  for (const h of rawHistory) {
    if (!h) continue;
    if (isBotMatchOrOpponent(h)) {
      hadDuplicatesOrBotsInHistory = true;
      continue;
    }
    const day = (h.date || '').split('T')[0] || 'nodate';
    const key = `${day}|${normalizeIdentityToken(h.opponentName)}|${h.scoreLegs}|${Number(h.avg || 0).toFixed(1)}`;
    if (seenKeys.has(key)) {
      hadDuplicatesOrBotsInHistory = true;
      continue;
    }
    seenKeys.add(key);

    // Enriquecer con hora y matchSummary si existe en localOfficialMatches
    const matchingSaved = localOfficialMatches.find(m => {
      if (m.id === h.id) return true;
      const mDay = (m.date || '').split('T')[0] || 'nodate';
      if (mDay !== day) return false;
      const p0Name = normalizeIdentityToken(m.players?.[0]?.name || '');
      const p1Name = normalizeIdentityToken(m.players?.[1]?.name || '');
      const oppNorm = normalizeIdentityToken(h.opponentName);
      return p0Name.includes(oppNorm) || p1Name.includes(oppNorm) || oppNorm.includes(p0Name) || oppNorm.includes(p1Name);
    });

    const enrichedTime = h.time || (matchingSaved ? extractMatchTimeStr(matchingSaved) : extractMatchTimeStr(h));
    const enrichedSummary = h.matchSummary || (matchingSaved ? buildMatchSummaryFromSavedMatch(matchingSaved, false) : undefined);

    if (enrichedTime !== h.time || (!h.matchSummary && enrichedSummary)) {
      hadDuplicatesOrBotsInHistory = true;
    }

    cleanHistory.push({
      ...h,
      date: day,
      time: enrichedTime || undefined,
      matchSummary: enrichedSummary
    });
  }

  // Verificar si el contador de Partidas Individuales o Globales estaba inflado por duplicados previos
  const indivHistoryCount = cleanHistory.filter(h => h.eventType === 'INDIVIDUAL').length;
  const currentIndivPlayed = profile.scopedStats?.individual?.matchesPlayed || 0;
  const statsMismatch =
    hadDuplicatesOrBotsInHistory ||
    (indivHistoryCount > 0 && currentIndivPlayed !== indivHistoryCount) ||
    (cleanHistory.length === 0 && currentIndivPlayed > 0 && localOfficialMatches.length === 0);

  if (!statsMismatch && localOfficialMatches.length === 0) {
    return { cleaned: false, profile };
  }

  // Reconstruir limpiamente desde cero aplicando únicamente las partidas únicas reales del jugador
  let rebuiltProfile: any = {
    ...profile,
    stats: createEmptyPlayerStats(profile.estimatedAvg || 48.0),
    scopedStats: {
      individual: createEmptyPlayerStats(0),
      standaloneTournament: createEmptyPlayerStats(0),
      localLeague: createEmptyPlayerStats(0),
      nationalLeague: createEmptyPlayerStats(0),
      nationalPointsOnline: 0,
      nationalPointsPresencial: 0,
      nationalTotalPoints: 0,
      byCompetitionId: {},
      syncedMatchIds: []
    },
    recentHistory: []
  };

  // 1. Aplicar todas las partidas oficiales únicas guardadas en el dispositivo (orden cronológico)
  const chronologicalSaved = [...localOfficialMatches].reverse();
  for (const m of chronologicalSaved) {
    const res = applyMatchToPlayerProfile(rebuiltProfile, m);
    if (res.updated) {
      rebuiltProfile = res.profile;
    }
  }

  // 2. Si había ítems únicos en recentHistory (ej. venidos de la nube desde otro dispositivo) que no estaban en localOfficialMatches, aplicarlos también
  const chronologicalHistory = [...cleanHistory].reverse();
  for (const h of chronologicalHistory) {
    const day = (h.date || '').split('T')[0] || 'nodate';
    const alreadyInRebuilt = (rebuiltProfile.recentHistory || []).some((rh: PlayerHistoryDateItem) => {
      const rDay = (rh.date || '').split('T')[0] || 'nodate';
      return (
        rh.id === h.id ||
        (rDay === day &&
          normalizeIdentityToken(rh.opponentName) === normalizeIdentityToken(h.opponentName) &&
          rh.scoreLegs === h.scoreLegs &&
          Number(rh.avg || 0).toFixed(1) === Number(h.avg || 0).toFixed(1))
      );
    });

    if (!alreadyInRebuilt) {
      const parts = (h.scoreLegs || '0 - 0').split('-').map(s => parseInt(s.trim(), 10) || 0);
      const myLegs = parts[0] || 0;
      const oppLegs = parts[1] || 0;
      const syntheticMatch: SavedMatch = {
        id: h.id || `hist_${Date.now()}`,
        gameType: h.matchSummary?.gameType || 'X01',
        date: h.date,
        time: h.time,
        competitionScope: (h.eventType === 'TOURNAMENT' ? 'STANDALONE_TOURNAMENT' : h.eventType === 'LEAGUE' ? 'LOCAL_LEAGUE' : h.eventType) as CompetitionScope,
        leagueName: h.eventType === 'LOCAL_LEAGUE' || h.eventType === 'NATIONAL_LEAGUE' ? h.eventName : undefined,
        tournamentTitle: h.eventType === 'STANDALONE_TOURNAMENT' ? h.eventName : undefined,
        roundOrStage: h.roundOrStage,
        modality: h.modality,
        isDoublePoints: h.isDoublePoints,
        pointsEarned: h.pointsEarned,
        legsTotal: Math.max(1, myLegs + oppLegs),
        legsBreakdown: h.matchSummary?.legsBreakdown,
        players: [
          {
            id: profile.id,
            name: profile.fullName || profile.nickname || 'Jugador',
            nickname: profile.nickname,
            score: h.highestCheckout || 0,
            avg: h.avg || 0,
            first9Avg: h.matchSummary?.first9P1 || h.avg || 0,
            legsWon: myLegs,
            dartsThrown: h.matchSummary?.dartsP1 || 0,
            bestLegDarts: h.matchSummary?.bestLegP1 || 0,
            highestCheckout: h.highestCheckout || 0,
            checkoutHits: h.matchSummary?.checkoutHitsP1 ?? myLegs,
            checkoutAttempts: h.matchSummary?.checkoutAttemptsP1 ?? Math.max(myLegs, myLegs * 2),
            count180s: h.count180s || 0,
            count140Plus: h.matchSummary?.count140sP1 || 0,
            count100Plus: h.matchSummary?.count100sP1 || 0,
            isWinner: !!h.isWin
          },
          {
            name: h.opponentName || 'Rival',
            score: h.matchSummary?.highFinishP2 || 0,
            avg: h.matchSummary?.avgP2 || 0,
            first9Avg: h.matchSummary?.first9P2 || 0,
            legsWon: oppLegs,
            dartsThrown: h.matchSummary?.dartsP2 || 0,
            bestLegDarts: h.matchSummary?.bestLegP2 || 0,
            highestCheckout: h.matchSummary?.highFinishP2 || 0,
            checkoutHits: h.matchSummary?.checkoutHitsP2 ?? oppLegs,
            checkoutAttempts: h.matchSummary?.checkoutAttemptsP2 ?? Math.max(oppLegs, oppLegs * 2),
            count180s: h.matchSummary?.count180sP2 || 0,
            count140Plus: h.matchSummary?.count140sP2 || 0,
            count100Plus: h.matchSummary?.count100sP2 || 0,
            isWinner: !h.isWin
          }
        ]
      };
      const res = applyMatchToPlayerProfile(rebuiltProfile, syntheticMatch);
      if (res.updated) {
        rebuiltProfile = res.profile;
      }
    }
  }

  return { cleaned: true, profile: rebuiltProfile };
}

export function reconcileSavedMatchesWithProfile(baseProfile?: any): any {
  if (typeof window === 'undefined') return baseProfile;
  try {
    // 1. Verificar si quedó alguna sesión activa atascada con partida ya terminada (0 puntos restantes o legs cumplidos)
    try {
      const activeRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (activeRaw) {
        const session = JSON.parse(activeRaw);
        if (session && session.config && Array.isArray(session.legsWon)) {
          const targetLegs = Math.ceil((session.config.bestOfLegs || 3) / 2);
          const p1Legs = session.legsWon[0] || 0;
          const p2Legs = session.legsWon[1] || 0;
          const p1Zero = Array.isArray(session.scores) && session.scores[0] === 0;
          const p2Zero = Array.isArray(session.scores) && session.scores[1] === 0;

          if (p1Legs >= targetLegs || p2Legs >= targetLegs || p1Zero || p2Zero) {
            const finalP1Legs = p1Zero && p1Legs < targetLegs ? p1Legs + 1 : p1Legs;
            const finalP2Legs = p2Zero && p2Legs < targetLegs ? p2Legs + 1 : p2Legs;
            if (finalP1Legs >= targetLegs || finalP2Legs >= targetLegs) {
              const isP1Winner = finalP1Legs >= finalP2Legs;
              const p1Avg = session.totalDartsMatch?.[0] > 0
                ? Number(((session.totalPointsMatch[0] / session.totalDartsMatch[0]) * 3).toFixed(2))
                : 0;
              const p2Avg = session.totalDartsMatch?.[1] > 0
                ? Number(((session.totalPointsMatch[1] / session.totalDartsMatch[1]) * 3).toFixed(2))
                : 0;
              const p1First9 = session.first9Darts?.[0] > 0
                ? Number(((session.first9Points[0] / session.first9Darts[0]) * 3).toFixed(2))
                : p1Avg;
              const p2First9 = session.first9Darts?.[1] > 0
                ? Number(((session.first9Points[1] / session.first9Darts[1]) * 3).toFixed(2))
                : p2Avg;

              const legsBreakdown = buildLegsBreakdownFromTurnHistory(
                session.turnHistory,
                session.config.startingScore || 501,
                [finalP1Legs, finalP2Legs],
                session.config.player1?.name || 'Jugador 1',
                session.config.player2?.name || 'Jugador 2'
              );

              saveCompletedMatch({
                id: session.id,
                date: session.savedAt || session.updatedAt || session.startedAt || new Date().toISOString(),
                gameType: (session.config.gameType === 'CRICKET' ? 'CRICKET' : 'X01'),
                startingScore: session.config.startingScore || 501,
                isVsCpu: session.config.isVsCpu,
                cpuDifficulty: session.config.cpuDifficulty,
                competitionScope: session.config.competitionScope,
                tournamentId: session.config.tournamentId,
                tournamentTitle: session.config.tournamentTitle,
                leagueId: session.config.leagueId,
                leagueName: session.config.leagueName,
                roundOrStage: session.config.roundOrStage,
                modality: session.config.modality,
                isDoublePoints: session.config.isDoublePoints,
                legsBreakdown,
                players: [
                  {
                    id: session.config.player1?.id,
                    name: session.config.player1?.name || 'Jugador 1',
                    nickname: session.config.player1?.nickname,
                    score: session.highestCheckout?.[0] || 0,
                    avg: p1Avg,
                    first9Avg: p1First9,
                    legsWon: finalP1Legs,
                    dartsThrown: session.totalDartsMatch?.[0] || 0,
                    bestLegDarts: session.bestLegDarts?.[0] < 99 ? session.bestLegDarts[0] : 0,
                    highestCheckout: session.highestCheckout?.[0] || 0,
                    count180s: session.count180s?.[0] || 0,
                    count140Plus: session.count140s?.[0] || 0,
                    count100Plus: session.count100s?.[0] || 0,
                    isWinner: isP1Winner
                  },
                  {
                    id: session.config.player2?.id,
                    name: session.config.player2?.name || 'Jugador 2',
                    nickname: session.config.player2?.nickname,
                    score: session.highestCheckout?.[1] || 0,
                    avg: p2Avg,
                    first9Avg: p2First9,
                    legsWon: finalP2Legs,
                    dartsThrown: session.totalDartsMatch?.[1] || 0,
                    bestLegDarts: session.bestLegDarts?.[1] < 99 ? session.bestLegDarts[1] : 0,
                    highestCheckout: session.highestCheckout?.[1] || 0,
                    count180s: session.count180s?.[1] || 0,
                    count140Plus: session.count140s?.[1] || 0,
                    count100Plus: session.count100s?.[1] || 0,
                    isWinner: !isP1Winner
                  }
                ],
                legsTotal: finalP1Legs + finalP2Legs,
                winnerName: isP1Winner ? session.config.player1?.name : session.config.player2?.name
              });
              localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
            }
          }
        }
      }
    } catch {}

    // 2. Saneamiento y deduplicación de lpld_matches_history_v1 (elimina las repeticiones y separa partidas vs CPU DartBot)
    const rawSaved = getSavedMatches();
    const seenOfficialSigs = new Set<string>();
    const cleanOfficialMatches: SavedMatch[] = [];
    const migratedBotMatches: SavedMatch[] = [];
    let localMatchesChanged = false;

    for (const m of rawSaved) {
      if (!m || !Array.isArray(m.players) || m.players.length < 2) {
        localMatchesChanged = true;
        continue;
      }
      const sig = computeCanonicalMatchSignature(m);
      const timeStr = extractMatchTimeStr(m);

      if (isBotMatchOrOpponent(m)) {
        localMatchesChanged = true;
        migratedBotMatches.push({
          ...m,
          isVsCpu: true,
          competitionScope: 'BOT',
          matchSignature: sig,
          time: timeStr || m.time
        });
        continue;
      }

      if (seenOfficialSigs.has(sig)) {
        // Duplicado detectado (ej: la partida con Albaitero guardada 3 veces el viernes)
        localMatchesChanged = true;
        continue;
      }
      seenOfficialSigs.add(sig);

      const enrichedMatch: SavedMatch = {
        ...m,
        matchSignature: sig,
        time: timeStr || m.time,
        competitionScope: m.competitionScope || resolveMatchScope(m)
      };
      if (m.matchSignature !== sig || m.time !== enrichedMatch.time) {
        localMatchesChanged = true;
      }
      cleanOfficialMatches.push(enrichedMatch);
    }

    if (localMatchesChanged) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(cleanOfficialMatches));
    }

    if (migratedBotMatches.length > 0) {
      const existingBots = getBotMatches();
      const seenBotSigs = new Set<string>(existingBots.map(b => computeCanonicalMatchSignature(b)));
      const mergedBots = [...existingBots];
      for (const bm of migratedBotMatches) {
        const bSig = computeCanonicalMatchSignature(bm);
        if (!seenBotSigs.has(bSig)) {
          seenBotSigs.add(bSig);
          mergedBots.push(bm);
        }
      }
      localStorage.setItem(STORAGE_KEYS.BOT_MATCHES, JSON.stringify(mergedBots.slice(0, 50)));
      recalculateBotStatsFromMatches(mergedBots);
    }

    // 3. Reconciliar y desduplicar el perfil actual
    let current = baseProfile || getCurrentPlayerProfile();
    if (!current) return baseProfile;

    const { cleaned, profile: sanitizedProfile } = sanitizeAndDeduplicateProfileMatches(current, cleanOfficialMatches);
    if (cleaned || localMatchesChanged) {
      current = sanitizedProfile;
      localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(current));
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYER, JSON.stringify(current));

      // Sincronizar el perfil limpio y desduplicado en Supabase
      fetch('/api/jugadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminRequestHeaders() },
        body: JSON.stringify({ profile: current })
      }).catch(() => {});

      for (const m of cleanOfficialMatches) {
        syncMatchResultToCloud(m);
      }
    }

    return current;
  } catch {
    return baseProfile;
  }
}

export function getSavedMatches(): SavedMatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearSavedMatches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.MATCHES);
}

// --- Estadísticas y Partidas en Modo Práctica vs BOT (Máquina) ---
export function getBotMatches(): SavedMatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOT_MATCHES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getBotStats(): {
  matchesPlayed: number;
  matchesWon: number;
  overallAvg: number;
  first9Avg: number;
  highestCheckout: number;
  count180s: number;
  count140Plus: number;
  count100Plus: number;
  bestLegDarts: number;
  lastPlayed?: string;
} {
  const fallback = {
    matchesPlayed: 0,
    matchesWon: 0,
    overallAvg: 0,
    first9Avg: 0,
    highestCheckout: 0,
    count180s: 0,
    count140Plus: 0,
    count100Plus: 0,
    bestLegDarts: 0
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOT_STATS);
    return data ? { ...fallback, ...JSON.parse(data) } : fallback;
  } catch {
    return fallback;
  }
}

// --- Cola de Sincronización Remota (Offline-to-Online) ---
export interface SyncItem {
  id: string;
  type: 'MATCH' | 'PROFILE' | 'TOURNAMENT_RESULT';
  payload: any;
  createdAt: string;
}

export function queueForSync(type: SyncItem['type'], payload: any): void {
  if (typeof window === 'undefined') return;
  try {
    const queueData = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    const queue: SyncItem[] = queueData ? JSON.parse(queueData) : [];
    queue.push({
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.warn('[Storage] Error encolando sincronización:', err);
  }
}

export function getSyncQueue(): SyncItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const queue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
}

export function clearSyncQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
}

// --- Persistencia de Perfil de Jugador ---
export function getCurrentPlayerProfile(defaultProfile?: any): any {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYER);
    if (!data) return defaultProfile;
    const parsed = JSON.parse(data);

    // Auto-migración si el perfil en localStorage tiene datos de prueba antiguos
    if (parsed && (parsed.avatarUrl === '/logos/logo-mdq.png' || parsed.stats?.overallAvg === 50.0 || parsed.photoUrl?.includes('logo-mdq'))) {
      if (defaultProfile) {
        const updated = {
          ...defaultProfile,
          ...parsed,
          avatarUrl: defaultProfile.avatarUrl,
          photoUrl: parsed.photoUrl && !parsed.photoUrl.includes('logo-mdq') ? parsed.photoUrl : defaultProfile.photoUrl,
          logoUrl: defaultProfile.logoUrl,
          estimatedAvg: defaultProfile.estimatedAvg,
          stats: {
            ...defaultProfile.stats,
            overallAvg: defaultProfile.stats.overallAvg,
            first9Avg: defaultProfile.stats.first9Avg
          }
        };
        try {
          localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(updated));
        } catch {}
        return updated;
      }
    }

    return parsed;
  } catch {
    return defaultProfile;
  }
}

export function saveCurrentPlayerProfile(profile: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(profile));
    // Guardar el último jugador conectado en este dispositivo para recuperación rápida al cerrar sesión
    localStorage.setItem(STORAGE_KEYS.LAST_PLAYER, JSON.stringify(profile));

    // Mantener lista de cuentas recientes de este dispositivo (máx 5)
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.RECENT_ACCOUNTS);
      let recent: any[] = existingRaw ? JSON.parse(existingRaw) : [];
      recent = recent.filter(p => (
        (p.id && p.id !== profile.id) &&
        (p.email && p.email.toLowerCase() !== (profile.email || '').toLowerCase()) &&
        (p.nickname && p.nickname.toLowerCase() !== (profile.nickname || '').toLowerCase())
      ));
      recent.unshift(profile);
      localStorage.setItem(STORAGE_KEYS.RECENT_ACCOUNTS, JSON.stringify(recent.slice(0, 5)));
    } catch {}

    // Notificar cambio a componentes oyentes
    window.dispatchEvent(new CustomEvent('lpld_profile_updated', { detail: profile }));

    // Sincronizar asíncronamente con Supabase en la nube
    fetch('/api/jugadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminRequestHeaders() },
      body: JSON.stringify({ profile })
    }).then(async (res) => {
      if (!res.ok) {
        console.warn('[Storage Cloud Sync] Servidor respondió con status:', res.status);
        return;
      }
      const data = await res.json();
      if (data.success && data.profile?.id && data.profile.id !== profile.id) {
        const reconciled = { ...profile, id: data.profile.id };
        localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(reconciled));
        localStorage.setItem(STORAGE_KEYS.LAST_PLAYER, JSON.stringify(reconciled));
      }
    }).catch((err) => {
      console.warn('[Storage Cloud Sync] Error al sincronizar con Supabase:', err);
    });
  } catch (err) {
    console.warn('[Storage] Error al guardar perfil de jugador:', err);
  }
}

export const savePlayerProfile = saveCurrentPlayerProfile;

export function getLastPlayerProfile(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_PLAYER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRecentAccounts(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_ACCOUNTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearCurrentPlayerSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAYER);
    // NOTA: Se preserva STORAGE_KEYS.LAST_PLAYER y STORAGE_KEYS.RECENT_ACCOUNTS para facilitar el reingreso en este dispositivo
    window.dispatchEvent(new CustomEvent('lpld_session_logged_out', { detail: null }));
    window.dispatchEvent(new CustomEvent('lpld_profile_updated', { detail: null }));
  } catch (err) {
    console.warn('[Storage] Error al limpiar sesión:', err);
  }
}

export async function fetchRegisteredPlayersFromCloud(includeAll = false): Promise<any[]> {
  try {
    const url = includeAll ? '/api/jugadores?all=true' : '/api/jugadores';
    const res = await fetch(url, {
      headers: includeAll ? getAdminRequestHeaders() : undefined
    });
    if (!res.ok) throw new Error('Error al consultar /api/jugadores');
    const data = await res.json();
    if (data.success && Array.isArray(data.players)) {
      return data.players;
    }
  } catch (err) {
    console.warn('[Storage] Error fetching registered players from cloud:', err);
  }
  return [];
}

// --- Persistencia de Torneos Activos e Historial ---
const TOURNAMENT_KEYS = {
  ACTIVE: 'lpld_tournaments_active_v2',
  HISTORY: 'lpld_tournaments_history_v2'
};

export function getStoredTournaments(fallback: any[] = []): any[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(TOURNAMENT_KEYS.ACTIVE);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function sanitizePlayerAvatar(p?: any) {
  if (!p) return p;
  if (typeof p.avatarUrl === 'string' && (p.avatarUrl.startsWith('data:image/') || p.avatarUrl.length > 500)) {
    const { avatarUrl, ...rest } = p;
    return rest;
  }
  return p;
}

export function sanitizeTournamentPayload(t: any) {
  if (!t || typeof t !== 'object') return t;
  const clean = { ...t };
  if (Array.isArray(clean.enrolledPlayers)) {
    clean.enrolledPlayers = clean.enrolledPlayers.map((p: any) => sanitizePlayerAvatar(p));
  }
  if (Array.isArray(clean.matches)) {
    clean.matches = clean.matches.map((m: any) => ({
      ...m,
      player1: sanitizePlayerAvatar(m.player1),
      player2: sanitizePlayerAvatar(m.player2),
    }));
  }
  return clean;
}

export function saveStoredTournaments(tournaments: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = Array.isArray(tournaments) ? tournaments.map(sanitizeTournamentPayload) : tournaments;
    localStorage.setItem(TOURNAMENT_KEYS.ACTIVE, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('[Storage] Error guardando torneos activos:', err);
  }
}

export async function fetchTournamentsFromCloud(): Promise<any[]> {
  try {
    const res = await fetch('/api/torneos');
    if (!res.ok) throw new Error('Error al consultar /api/torneos');
    const data = await res.json();
    if (data.success && Array.isArray(data.tournaments)) {
      return data.tournaments;
    }
  } catch (err) {
    console.warn('[Storage] Error fetching tournaments from cloud:', err);
  }
  return [];
}

export async function saveTournamentToCloud(tournament: any): Promise<boolean> {
  try {
    const cleanTournament = sanitizeTournamentPayload(tournament);
    const res = await fetch('/api/torneos', {
      method: 'POST',
      headers: getAdminRequestHeaders(),
      body: JSON.stringify({ tournament: cleanTournament })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Error saving tournament to cloud:', err);
    return false;
  }
}

export async function deleteTournamentFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/torneos?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAdminRequestHeaders()
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Error deleting tournament from cloud:', err);
    return false;
  }
}

export function getStoredTournamentHistory(fallback: any[] = []): any[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(TOURNAMENT_KEYS.HISTORY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredTournamentHistory(history: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOURNAMENT_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.warn('[Storage] Error guardando historial de torneos:', err);
  }
}

// --- Persistencia de Ligas Oficiales y Locales ---
const LEAGUE_KEYS = {
  LEAGUES: 'lpld_leagues_v1'
};

export function getStoredLeagues(fallback: any[] = []): any[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(LEAGUE_KEYS.LEAGUES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredLeagues(leagues: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEAGUE_KEYS.LEAGUES, JSON.stringify(leagues));
  } catch (err) {
    console.warn('[Storage] Error guardando ligas:', err);
  }
}

// --- Persistencia de Sesión de Partida Activa (Stand By & Recuperación Ininterrumpida) ---
export interface ActiveMatchSession {
  config: MatchConfig;
  gameType: 'X01' | 'CRICKET';
  status: 'IN_PROGRESS' | 'STAND_BY';
  scores: [number, number];
  currentTurn: 0 | 1;
  starterTurn: 0 | 1;
  p1TeammateTurn?: 0 | 1;
  p2TeammateTurn?: 0 | 1;
  setsWon: [number, number];
  legsWon: [number, number];
  dartsThrownLeg: [number, number];
  totalPointsMatch: [number, number];
  totalDartsMatch: [number, number];
  first9Points: [number, number];
  first9Darts: [number, number];
  count100s: [number, number];
  count140s: [number, number];
  count180s: [number, number];
  highestCheckout: [number, number];
  bestLegDarts: [number, number];
  history: any[];
  turnHistory: any[];
  // Campos específicos de Cricket
  cricketMarks?: [Record<string, number>, Record<string, number>];
  cricketPoints?: [number, number];
  // Datos de torneo o liga asociada
  tournamentId?: string;
  tournamentTitle?: string;
  matchId?: string;
  isLeague?: boolean;
  savedAt: string;
}

export function getActiveMatchSession(): ActiveMatchSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveActiveMatchSession(session: ActiveMatchSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('lpld_active_match_changed', { detail: session }));
  } catch (err) {
    console.warn('[Storage] Error al guardar sesión activa:', err);
  }
}

export function clearActiveMatchSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    window.dispatchEvent(new CustomEvent('lpld_active_match_changed', { detail: null }));
  } catch (err) {
    console.warn('[Storage] Error al limpiar sesión activa:', err);
  }
}

// --- Persistencia de Autoridades y Cuentas de la Asociación ---
const ASSOCIATION_KEYS = {
  AUTHORITIES: 'lpld_association_authorities_v1',
  BANK_ACCOUNT: 'lpld_association_bank_account_v1'
};

export function getStoredAssociationAuthorities(fallback: any[] = []): any[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(ASSOCIATION_KEYS.AUTHORITIES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredAssociationAuthorities(authorities: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASSOCIATION_KEYS.AUTHORITIES, JSON.stringify(authorities));
    window.dispatchEvent(new CustomEvent('lpld_association_updated', { detail: authorities }));
    saveAssociationAuthoritiesToCloud(authorities).catch(() => {});
  } catch (err) {
    console.warn('[Storage] Error al guardar autoridades:', err);
  }
}

export async function fetchAssociationAuthoritiesFromCloud(): Promise<any[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/config?key=association_authorities');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      localStorage.setItem(ASSOCIATION_KEYS.AUTHORITIES, JSON.stringify(data.data));
      window.dispatchEvent(new CustomEvent('lpld_association_updated', { detail: data.data }));
      return data.data;
    }
  } catch (err) {
    console.warn('[Storage] Error al recuperar autoridades desde la nube:', err);
  }
  return null;
}

export async function saveAssociationAuthoritiesToCloud(authorities: any[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const headers = { 'Content-Type': 'application/json', ...getAdminRequestHeaders() };
    const res = await fetch('/api/config', {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'association_authorities', data: authorities })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Error al guardar autoridades en la nube:', err);
    return false;
  }
}

export function getStoredAssociationBankAccount(fallback?: any): any {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(ASSOCIATION_KEYS.BANK_ACCOUNT);
    if (data) return JSON.parse(data);
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredAssociationBankAccount(account: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASSOCIATION_KEYS.BANK_ACCOUNT, JSON.stringify(account));
    window.dispatchEvent(new CustomEvent('lpld_association_bank_updated', { detail: account }));
    saveAssociationBankAccountToCloud(account).catch(() => {});
  } catch (err) {
    console.warn('[Storage] Error al guardar datos bancarios de la asociación:', err);
  }
}

export async function fetchAssociationBankAccountFromCloud(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/config?key=association_bank');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      localStorage.setItem(ASSOCIATION_KEYS.BANK_ACCOUNT, JSON.stringify(data.data));
      window.dispatchEvent(new CustomEvent('lpld_association_bank_updated', { detail: data.data }));
      return data.data;
    }
  } catch (err) {
    console.warn('[Storage] Error al recuperar cuenta bancaria desde la nube:', err);
  }
  return null;
}

export async function saveAssociationBankAccountToCloud(account: any): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const headers = { 'Content-Type': 'application/json', ...getAdminRequestHeaders() };
    const res = await fetch('/api/config', {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'association_bank', data: account })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Error al guardar cuenta bancaria en la nube:', err);
    return false;
  }
}

// --- Persistencia de Vitrinas Dinámicas de la Landing Page ---
const SHOWCASE_KEYS = {
  SHOWCASES: 'lpld_landing_showcases_v1'
};

export const DEFAULT_LANDING_SHOWCASES: LandingShowcaseSettings = {
  heroTournament: {
    enabled: true,
    tagBadge: 'Próximo Gran Torneo Oficial',
    subBadge: 'Inscripciones Abiertas • Cupos Limitados',
    title: 'Gran Open',
    highlightCity: 'Mar del Plata',
    year: '2026',
    description: 'La cita cumbre de los dardos en la Costa Atlántica y Argentina. Dos jornadas de máxima adrenalina: fase de grupos, llaves directas 501 Doble Out, marcadores digitales táctiles y transmisión oficial.',
    date: '21 y 22 Nov',
    venue: 'Sociedad de Fomento Nueva Pompeya',
    prizePool: '$0 ARS',
    registeredCount: 0,
    maxParticipants: 32,
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScTorneoOficialLPD2026/viewform',
    autoSyncGoogleForm: true,
    lastSyncedAt: 'Hoy, 10:45 hs',
    tournamentId: 'torneo-open-mdq-2026',
    galleryImages: [
      '/images/gallery-venue-pompeya.jpg',
      '/images/gallery-trophies.jpg',
      '/images/darderos.jpeg'
    ],
    registrationMode: 'IN_APP',
    ctaButtonText: 'Inscripción Rápida',
    secondaryButtonText: 'Ver Cuadro y Reglamento',
    secondaryButtonUrl: '/torneos',
    bannerDesktopUrl: '',
    bannerMobileUrl: ''
  },
  communitySection: {
    enabled: true,
    tag: 'Comunidad Nacional de Dardos',
    title: 'La plataforma que une a todos los',
    highlightText: 'darderos del país',
    description: 'Nacida de la pasión de los jugadores de Darderos Mar del Plata y expandida a cada rincón de Argentina. Aquí puedes registrar tus partidas tiro a tiro, medir tu promedio histórico, competir en torneos presenciales y online con cuadros interactivos, y equiparte con material profesional importado.',
    backgroundImageUrl: '/images/darderos.jpeg',
    overlayOpacity: 40,
    provincesCount: 24,
    tournamentsCount: '35+',
    playersCount: '1.200+',
    record180sText: 'Registro Vivo',
    pilars: [
      { title: 'Anotador PWA:', desc: 'funciona offline en cualquier pub o club.' },
      { title: 'Categorización por AVG:', desc: 'Principiante a Elite.' },
      { title: 'Torneos Oficiales:', desc: 'llaves y cruces en vivo.' },
      { title: 'Mercado Pago:', desc: 'cuotas en pesos y envíos al país.' }
    ]
  },
  affiliatedClubs: [
    {
      id: 'club-mdq-central',
      name: 'Club Darderos Mar del Plata',
      city: 'Mar del Plata',
      province: 'Buenos Aires',
      address: 'Sede Central Oficial • Calle Alvarado 2450',
      boardsCount: 6,
      logoUrl: '/logos/logo-mdq.png',
      isCentral: true,
      status: 'ACTIVO',
      description: '6 dianas profesionales Samurai y Winmau Blade 6 con iluminación led circular y marcadores digitales para torneos oficiales.'
    },
    {
      id: 'club-caba-espacio',
      name: 'Espacio Dardos Buenos Aires',
      city: 'Palermo, CABA',
      province: 'Ciudad Autónoma de Buenos Aires',
      address: 'Honduras 4820, Palermo Soho',
      boardsCount: 4,
      logoUrl: '/logos/dardos-argentina.png',
      isCentral: false,
      status: 'ACTIVO',
      description: 'Liga Metropolitana 501 Doble Out los jueves por la noche y clínicas de lanzamiento para principiantes.'
    },
    {
      id: 'club-interior-federal',
      name: 'Circuito Federal del Interior',
      city: 'Rosario • Córdoba • Mendoza',
      province: 'Santa Fe / Córdoba',
      address: 'Sedes Multiclub Regionales',
      boardsCount: 8,
      logoUrl: '/logos/dardos-argentina.png',
      isCentral: false,
      status: 'ACTIVO',
      description: 'Encuentros mensuales y fechas clasificatorias para el Gran Open de Mar del Plata con puntaje nacional.'
    }
  ]
};

export function getStoredLandingShowcases(fallback: LandingShowcaseSettings = DEFAULT_LANDING_SHOWCASES): LandingShowcaseSettings {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(SHOWCASE_KEYS.SHOWCASES);
    const grandRegs = getStoredGrandTournamentRegistrations();
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.heroTournament && parsed.communitySection) {
        // Sanitizar el número simulado 38 si no existen 38 registros en la realidad
        let realCount = parsed.heroTournament.registeredCount;
        if (realCount === 38 && grandRegs.length !== 38) {
          realCount = grandRegs.length;
        } else if (grandRegs.length > 0) {
          realCount = Math.max(realCount || 0, grandRegs.length);
        }
        return {
          ...fallback,
          ...parsed,
          heroTournament: {
            ...fallback.heroTournament,
            ...parsed.heroTournament,
            registeredCount: realCount ?? grandRegs.length
          },
          communitySection: { ...fallback.communitySection, ...parsed.communitySection },
          affiliatedClubs: Array.isArray(parsed.affiliatedClubs) ? parsed.affiliatedClubs : fallback.affiliatedClubs
        };
      }
    }
    return {
      ...fallback,
      heroTournament: {
        ...fallback.heroTournament,
        registeredCount: grandRegs.length
      }
    };
  } catch {
    return fallback;
  }
}

export function saveStoredLandingShowcases(settings: LandingShowcaseSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHOWCASE_KEYS.SHOWCASES, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('lpld_showcases_updated', { detail: settings }));
    // Sincronización transparente con Supabase PostgreSQL
    saveLandingShowcasesToCloud(settings).catch(() => {});
  } catch (err) {
    console.warn('[Storage] Error al guardar vitrinas de la landing:', err);
  }
}

export async function fetchLandingShowcasesFromCloud(): Promise<LandingShowcaseSettings | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/showcases');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.showcases) {
      localStorage.setItem(SHOWCASE_KEYS.SHOWCASES, JSON.stringify(data.showcases));
      window.dispatchEvent(new CustomEvent('lpld_showcases_updated', { detail: data.showcases }));
      return data.showcases;
    }
  } catch (err) {
    console.warn('[Storage] Error al obtener vitrinas de la nube:', err);
  }
  return null;
}

export async function saveLandingShowcasesToCloud(settings: LandingShowcaseSettings): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/showcases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminRequestHeaders() },
      body: JSON.stringify({ showcases: settings })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Error al persistir vitrinas en la nube:', err);
    return false;
  }
}

// --- Persistencia de Inscripciones Oficiales & PDC (Sociedad de Fomento Nueva Pompeya) ---
export function getStoredGrandTournamentRegistrations(): GrandTournamentRegistration[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GRAND_REGISTRATIONS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Storage] Error leyendo inscripciones del Gran Torneo:', err);
  }
  return [];
}

export function saveStoredGrandTournamentRegistrations(registrations: GrandTournamentRegistration[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.GRAND_REGISTRATIONS, JSON.stringify(registrations));
    window.dispatchEvent(new CustomEvent('lpld_grand_registrations_updated', { detail: registrations }));
  } catch (err) {
    console.warn('[Storage] Error guardando inscripciones del Gran Torneo:', err);
  }
}

export function addGrandTournamentRegistration(reg: GrandTournamentRegistration): GrandTournamentRegistration[] {
  const current = getStoredGrandTournamentRegistrations();
  // Evitar duplicados por DNI o pasaporte o ID
  const existingIdx = current.findIndex(r => 
    r.id === reg.id || 
    (r.dniOrPassport && reg.dniOrPassport && r.dniOrPassport.trim().toLowerCase() === reg.dniOrPassport.trim().toLowerCase())
  );
  let updated: GrandTournamentRegistration[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = reg;
  } else {
    updated = [reg, ...current];
  }
  saveStoredGrandTournamentRegistrations(updated);
  
  // Sincronizar en segundo plano con Supabase PostgreSQL
  saveGrandTournamentRegistrationToCloud(reg).catch(err => {
    console.warn('[Storage] Fallback local activo, error en sync cloud:', err);
  });

  return updated;
}

export async function fetchGrandTournamentRegistrationsFromCloud(tournamentId?: string): Promise<GrandTournamentRegistration[]> {
  try {
    const url = tournamentId ? `/api/inscripciones?tournamentId=${encodeURIComponent(tournamentId)}` : '/api/inscripciones';
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: getAdminRequestHeaders()
    });
    if (!res.ok) throw new Error('Error al consultar /api/inscripciones');
    const data = await res.json();
    if (data.success && Array.isArray(data.registrations)) {
      return data.registrations;
    }
  } catch (err) {
    console.warn('[Storage] Error fetching grand registrations from cloud:', err);
  }
  return [];
}

export interface GrandRegistrationSyncResult {
  success: boolean;
  profile?: any;
  isNewProfileCreated?: boolean;
}

export async function saveGrandTournamentRegistrationToCloud(reg: GrandTournamentRegistration): Promise<GrandRegistrationSyncResult> {
  try {
    const res = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminRequestHeaders() },
      body: JSON.stringify({ registration: reg })
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    return {
      success: !!data.success,
      profile: data.profile,
      isNewProfileCreated: !!data.isNewProfileCreated
    };
  } catch (err) {
    console.warn('[Storage] Error saving grand registration to cloud:', err);
    return { success: false };
  }
}




