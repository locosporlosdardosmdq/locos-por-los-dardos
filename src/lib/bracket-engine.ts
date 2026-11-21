/**
 * Motor Puro de Llaves y Torneos • Locos por los Dardos
 * Inspirado en la arquitectura matemática de Challonge y Nakka N01 Tournament.
 * 
 * Principios:
 * 1. 100% Inmutable y Libre de Efectos Secundarios (Pure Engine).
 * 2. Enrutamiento explícito por punteros (nextMatchId, loserNextMatchId, nextSlot).
 *    Cero heurísticas ambiguas tipo floor(index/2) que corrompan llaves de perdedores.
 * 3. Soporte de Byes automáticos para cualquier cantidad de participantes (4, 8, 16, 32, 64).
 * 4. Doble Eliminación estricta (Winners -> Losers -> Gran Final).
 * 5. Cálculo automático de Podio (1º Oro, 2º Plata, 3º Bronce).
 * 6. Edición administrativa con previsualización de impacto y cascada segura.
 */

import { TournamentBracketMatch, TournamentPodium, RoundLegsConfig, MatchRole } from './types';

export interface Participant {
  id: string;
  name: string;
  nickname?: string;
  avatarUrl?: string;
  seed?: number;
  avg?: number;
  nationality?: string;
  countryCode?: string;
  isBye?: boolean;
  teamMembers?: Array<{ id: string; name: string; avatarUrl?: string }>;
}

export type BracketFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION';
export type SeedingMode = 'RANKED' | 'RANDOM' | 'COMPACT' | 'MANUAL';

export interface SingleEliminationOptions {
  bracketSize?: 4 | 8 | 16 | 32 | 64;
  seeding?: SeedingMode;
  includeThirdPlace?: boolean;
  legTarget?: number;
  setTarget?: number;
  distanceMode?: 'LEGS' | 'SETS';
  resolveByes?: boolean;
  roundLegsConfig?: RoundLegsConfig;
}

export interface DoubleEliminationOptions {
  bracketSize?: 4 | 8 | 16 | 32 | 64;
  seeding?: SeedingMode;
  grandFinalReset?: boolean;
  legTarget?: number;
  setTarget?: number;
  distanceMode?: 'LEGS' | 'SETS';
  resolveByes?: boolean;
  roundLegsConfig?: RoundLegsConfig;
}

export type BracketConfig = SingleEliminationOptions & DoubleEliminationOptions;

/**
 * Resuelve y consolida las unidades reales de competición de un torneo.
 * En certámenes individuales, cada inscripto es una unidad.
 * En certámenes por parejas, consolida parejas pre-armadas y duplas de sorteo a ciegas,
 * evitando la duplicación artificial de cupos y la dispersión masiva de Byes innecesarios.
 */
export function resolveCompetitorUnits(tournament: {
  isDoubles?: boolean;
  enrolledPlayers?: Array<{
    id: string;
    name: string;
    nickname?: string;
    avatarUrl?: string;
    seed?: number;
    nationality?: string;
    countryCode?: string;
    avg?: number;
    teammateId?: string;
    teammateName?: string;
  }>;
  registeredPairs?: Array<{
    id: string;
    player1Id: string;
    player1Name: string;
    player1Avatar?: string;
    player2Id: string;
    player2Name: string;
    player2Avatar?: string;
    seed?: number;
  }>;
  groupStageData?: {
    pairs?: Array<any>;
  };
}): {
  competitors: Participant[];
  unpairedPlayers: Array<{ id: string; name: string; avatarUrl?: string }>;
} {
  const enrolled = tournament.enrolledPlayers || [];
  if (!tournament.isDoubles) {
    return {
      competitors: enrolled.map((p, idx) => ({
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        avatarUrl: p.avatarUrl || '/logos/logo-mdq.png',
        seed: p.seed ?? idx + 1,
        avg: p.avg,
        nationality: p.nationality || 'Argentina',
        countryCode: p.countryCode || 'AR'
      })),
      unpairedPlayers: []
    };
  }

  const competitors: Participant[] = [];
  const pairedPlayerIds = new Set<string>();

  // 1. Parejas registradas explícitas en registeredPairs
  const registeredPairs = tournament.registeredPairs || [];
  for (let i = 0; i < registeredPairs.length; i++) {
    const rp = registeredPairs[i];
    competitors.push({
      id: rp.id,
      name: `${rp.player1Name} / ${rp.player2Name}`,
      nickname: `${rp.player1Name.split(' ')[0]} & ${rp.player2Name.split(' ')[0]}`,
      avatarUrl: rp.player1Avatar || '/logos/logo-mdq.png',
      seed: rp.seed ?? (i + 1),
      nationality: 'Argentina',
      countryCode: 'AR',
      teamMembers: [
        { id: rp.player1Id, name: rp.player1Name, avatarUrl: rp.player1Avatar },
        { id: rp.player2Id, name: rp.player2Name, avatarUrl: rp.player2Avatar }
      ]
    });
    pairedPlayerIds.add(rp.player1Id);
    pairedPlayerIds.add(rp.player2Id);
  }

  // 2. Parejas de enrolledPlayers con teammateId
  const remaining = enrolled.filter((p) => !pairedPlayerIds.has(p.id));
  const processedTeammates = new Set<string>();

  for (const p of remaining) {
    if (processedTeammates.has(p.id)) continue;
    if (p.teammateId) {
      const mate = remaining.find((m) => m.id === p.teammateId);
      if (mate) {
        processedTeammates.add(p.id);
        processedTeammates.add(mate.id);
        pairedPlayerIds.add(p.id);
        pairedPlayerIds.add(mate.id);
        competitors.push({
          id: `pair-${p.id}-${mate.id}`,
          name: `${p.name} / ${mate.name}`,
          nickname: `${p.nickname || p.name.split(' ')[0]} & ${mate.nickname || mate.name.split(' ')[0]}`,
          avatarUrl: p.avatarUrl || '/logos/logo-mdq.png',
          seed: competitors.length + 1,
          nationality: p.nationality || 'Argentina',
          countryCode: p.countryCode || 'AR',
          teamMembers: [
            { id: p.id, name: p.name, avatarUrl: p.avatarUrl },
            { id: mate.id, name: mate.name, avatarUrl: mate.avatarUrl }
          ]
        });
      }
    }
  }

  // 3. Parejas sorteadas por Blind Draw en groupStageData.pairs
  if (tournament.groupStageData?.pairs && Array.isArray(tournament.groupStageData.pairs)) {
    for (const gp of tournament.groupStageData.pairs) {
      if (!competitors.some((c) => c.id === gp.id)) {
        competitors.push({
          id: gp.id,
          name: gp.name,
          nickname: gp.nickname,
          avatarUrl: gp.avatarUrl || '/logos/logo-mdq.png',
          seed: gp.seed ?? (competitors.length + 1),
          avg: gp.avg,
          nationality: gp.nationality || 'Argentina',
          countryCode: gp.countryCode || 'AR',
          teamMembers: gp.teamMembers
        });
        if (gp.teamMembers && Array.isArray(gp.teamMembers)) {
          gp.teamMembers.forEach((tm: any) => pairedPlayerIds.add(tm.id));
        }
      }
    }
  }

  // 4. Inscriptos que aún no poseen compañero asignado
  const unpairedPlayers = enrolled
    .filter((p) => !pairedPlayerIds.has(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl
    }));

  return { competitors, unpairedPlayers };
}

/**
 * Calcula la potencia de 2 más cercana hacia arriba (4, 8, 16, 32, 64)
 */
export function getNextPowerOfTwo(count: number): 4 | 8 | 16 | 32 | 64 {
  if (count <= 4) return 4;
  if (count <= 8) return 8;
  if (count <= 16) return 16;
  if (count <= 32) return 32;
  return 64;
}

/**
 * Retorna el orden estándar de cabezas de serie para un cuadro de tamaño N.
 * Ejemplo para N=8: [1, 8, 4, 5, 2, 7, 3, 6] (emparejamientos 1v8, 4v5, 2v7, 3v6).
 */
export function getSeededOrder(size: number): number[] {
  let rounds = Math.log2(size) - 1;
  let order = [1, 2];

  for (let i = 0; i < rounds; i++) {
    const next: number[] = [];
    const length = order.length * 2 + 1;
    for (const seed of order) {
      next.push(seed);
      next.push(length - seed);
    }
    order = next;
  }

  return order;
}

/**
 * Siembra compacta de club: agrupa Byes en pares hermanos para maximizar partidos inmediatos en Ronda 1 y Ronda 2.
 */
export function seedCompact(
  participants: Participant[],
  bracketSize: number
): (Participant | null)[] {
  const N = participants.length;
  if (N >= bracketSize) {
    return participants.slice(0, bracketSize).map((p, idx) => ({
      ...p,
      seed: p.seed ?? idx + 1
    }));
  }

  if (N <= 1) {
    const slots = new Array(bracketSize).fill(null);
    if (N === 1) slots[0] = { ...participants[0], seed: 1 };
    return slots;
  }

  const numMatches = bracketSize / 2;
  const numPairs = numMatches / 2;
  const numFull = N - numMatches;
  const numByes = bracketSize - N;
  const numByePairs = Math.floor(numByes / 2);
  const isOdd = numByes % 2 === 1;

  const pairTypes: ('FULL' | 'BYE' | 'ODD')[] = [];
  let byePairsLeft = numByePairs;
  let oddLeft = isOdd ? 1 : 0;
  let fullPairsLeft = Math.floor(numFull / 2);

  // Distribución balanceada entre la mitad superior y la mitad inferior
  for (let p = 0; p < numPairs; p++) {
    if (p % 2 === 0 && fullPairsLeft > 0) {
      pairTypes.push('FULL');
      fullPairsLeft--;
    } else if (byePairsLeft > 0) {
      pairTypes.push('BYE');
      byePairsLeft--;
    } else if (oddLeft > 0) {
      pairTypes.push('ODD');
      oddLeft--;
    } else if (fullPairsLeft > 0) {
      pairTypes.push('FULL');
      fullPairsLeft--;
    } else {
      pairTypes.push('BYE');
    }
  }

  const slots: (Participant | null)[] = new Array(bracketSize).fill(null);
  let pIdx = 0;

  for (let p = 0; p < numPairs; p++) {
    const type = pairTypes[p];
    const m1 = p * 2;
    const m2 = p * 2 + 1;
    if (type === 'FULL') {
      if (pIdx < N) slots[m1 * 2] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      if (pIdx < N) slots[m1 * 2 + 1] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      if (pIdx < N) slots[m2 * 2] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      if (pIdx < N) slots[m2 * 2 + 1] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
    } else if (type === 'BYE') {
      if (pIdx < N) slots[m1 * 2] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      slots[m1 * 2 + 1] = null;
      if (pIdx < N) slots[m2 * 2] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      slots[m2 * 2 + 1] = null;
    } else if (type === 'ODD') {
      if (pIdx < N) slots[m1 * 2] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      if (pIdx < N) slots[m1 * 2 + 1] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      if (pIdx < N) slots[m2 * 2] = { ...participants[pIdx], seed: pIdx + 1 };
      pIdx++;
      slots[m2 * 2 + 1] = null;
    }
  }

  return slots;
}

/**
 * Algoritmo Fisher-Yates genuino para mezcla aleatoria uniforme e imparcial.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Siembra a los participantes según el modo elegido y rellena con Byes si faltan jugadores.
 * Aplica distribución simétrica estándar n01darts / Challonge mediante getSeededOrder.
 */
export function seedParticipants(
  participants: Participant[],
  bracketSize: number,
  mode: SeedingMode = 'RANKED'
): (Participant | null)[] {
  let list = [...participants];

  if (mode === 'RANDOM') {
    list = shuffleArray(list);
  } else if (mode === 'COMPACT') {
    list.sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
    return seedCompact(list, bracketSize);
  } else if (mode === 'RANKED') {
    list.sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
  }

  const seededOrder = getSeededOrder(bracketSize);
  const slots: (Participant | null)[] = new Array(bracketSize).fill(null);

  // Colocar a cada jugador en su slot correspondiente según el árbol oficial
  for (let i = 0; i < list.length; i++) {
    const seedNumber = i + 1;
    const targetSlotIndex = seededOrder.indexOf(seedNumber);
    if (targetSlotIndex !== -1) {
      slots[targetSlotIndex] = {
        ...list[i],
        seed: list[i].seed ?? seedNumber
      };
    }
  }

  return slots;
}

/**
 * Genera una llave de Eliminación Simple con punteros exactos y resolución de Byes.
 */
export function generateSingleElimination(
  participants: Participant[],
  options: SingleEliminationOptions = {}
): TournamentBracketMatch[] {
  const bracketSize = options.bracketSize 
    ? getNextPowerOfTwo(options.bracketSize) 
    : getNextPowerOfTwo(participants.length || 8);
  const seeded = participants.length > 0 
    ? seedParticipants(participants, bracketSize, options.seeding || 'RANKED')
    : new Array(bracketSize).fill(null);
  const numRounds = Math.log2(bracketSize);
  const matches: TournamentBracketMatch[] = [];

  const legTarget = options.legTarget || 3;
  const distanceMode = options.distanceMode || 'LEGS';

  // 1. Crear todos los partidos ronda por ronda
  const roundMatchesMap = new Map<number, TournamentBracketMatch[]>();
  const roundLegs = options.roundLegsConfig;

  for (let round = 1; round <= numRounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);
    const roundList: TournamentBracketMatch[] = [];

    let roundLabel = `Ronda ${round}`;
    let role: MatchRole = 'MATCH';
    let roundTarget = legTarget;

    if (round === numRounds) {
      roundLabel = 'Finales';
      role = 'FINAL' as MatchRole;
      roundTarget = roundLegs?.finals || legTarget;
    } else if (round === numRounds - 1) {
      roundLabel = 'Semifinales';
      roundTarget = roundLegs?.semiFinals || legTarget;
    } else if (round === numRounds - 2) {
      roundLabel = 'Cuartos de Final';
      roundTarget = roundLegs?.quarterFinals || legTarget;
    }

    for (let pos = 0; pos < matchesInRound; pos++) {
      const matchId = `se_r${round}_m${pos + 1}`;
      const match: TournamentBracketMatch = {
        id: matchId,
        round,
        matchIndex: pos,
        bracketType: 'WINNERS',
        matchRole: role,
        distanceMode,
        legTarget: roundTarget,
        scoreP1: 0,
        scoreP2: 0,
        status: 'SCHEDULED',
        note: roundLabel
      };
      roundList.push(match);
      matches.push(match);
    }
    roundMatchesMap.set(round, roundList);
  }

  // Partido por el 3º Puesto (opcional)
  let thirdPlaceMatch: TournamentBracketMatch | null = null;
  if (options.includeThirdPlace && numRounds >= 2) {
    thirdPlaceMatch = {
      id: 'se_third_place',
      round: numRounds,
      matchIndex: 99,
      bracketType: 'FINALS',
      matchRole: 'THIRD_PLACE',
      distanceMode,
      legTarget: roundLegs?.semiFinals || legTarget,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: '3º y 4º Puesto'
    };
    matches.push(thirdPlaceMatch);
  }

  // 2. Conectar punteros de avance (nextMatchId, nextSlot, loserNextMatchId)
  for (let round = 1; round < numRounds; round++) {
    const currentList = roundMatchesMap.get(round)!;
    const nextList = roundMatchesMap.get(round + 1)!;

    for (let i = 0; i < currentList.length; i++) {
      const match = currentList[i];
      const targetMatchIndex = Math.floor(i / 2);
      const targetMatch = nextList[targetMatchIndex];
      const slot = (i % 2 === 0 ? 1 : 2) as 1 | 2;

      match.nextMatchId = targetMatch.id;
      match.nextSlot = slot;

      // Si es semifinal y hay partido por el 3er puesto, enviar al perdedor allí
      if (round === numRounds - 1 && thirdPlaceMatch) {
        match.loserNextMatchId = thirdPlaceMatch.id;
        match.loserNextSlot = slot;
      }
    }
  }

  // 3. Asignar los jugadores a la Ronda 1
  const r1List = roundMatchesMap.get(1)!;
  for (let i = 0; i < r1List.length; i++) {
    const p1 = seeded[i * 2];
    const p2 = seeded[i * 2 + 1];
    const match = r1List[i];

    if (p1) {
      match.player1 = { 
        id: p1.id, 
        name: p1.name, 
        avatarUrl: p1.avatarUrl || '/logos/logo-mdq.png', 
        seed: p1.seed, 
        nationality: p1.nationality, 
        countryCode: p1.countryCode,
        teamMembers: p1.teamMembers
      };
    }
    if (p2) {
      match.player2 = { 
        id: p2.id, 
        name: p2.name, 
        avatarUrl: p2.avatarUrl || '/logos/logo-mdq.png', 
        seed: p2.seed, 
        nationality: p2.nationality, 
        countryCode: p2.countryCode,
        teamMembers: p2.teamMembers
      };
    }
  }

  // 4. Registrar Byes en la Ronda 1 sin simular partidos jugados ficticios con 3-0
  // Solo se resuelven y avanzan a la Ronda 2 si resolveByes !== false (por defecto true)
  let updatedMatches = [...matches];
  if (options.resolveByes !== false) {
    for (const match of r1List) {
      if (match.player1 && !match.player2) {
        match.note = 'Pase Automático (BYE)';
        match.isBye = true;
        match.scoreP1 = 0;
        match.scoreP2 = 0;
        match.status = 'SCHEDULED';
        match.winnerId = match.player1.id;
        if (match.nextMatchId) {
          const next = updatedMatches.find(m => m.id === match.nextMatchId);
          if (next) {
            if (match.nextSlot === 1) next.player1 = { ...match.player1 };
            else next.player2 = { ...match.player1 };
          }
        }
      } else if (!match.player1 && match.player2) {
        match.note = 'Pase Automático (BYE)';
        match.isBye = true;
        match.scoreP1 = 0;
        match.scoreP2 = 0;
        match.status = 'SCHEDULED';
        match.winnerId = match.player2.id;
        if (match.nextMatchId) {
          const next = updatedMatches.find(m => m.id === match.nextMatchId);
          if (next) {
            if (match.nextSlot === 1) next.player1 = { ...match.player2 };
            else next.player2 = { ...match.player2 };
          }
        }
      }
    }
  }

  return updatedMatches;
}

/**
 * Genera una llave de Doble Eliminación profesional (estilo Challonge) con
 * Cuadro de Ganadores (Winners), Cuadro de Perdedores (Losers) y Gran Final.
 */
export function generateDoubleElimination(
  participants: Participant[],
  options: DoubleEliminationOptions = {}
): TournamentBracketMatch[] {
  const bracketSize = options.bracketSize 
    ? getNextPowerOfTwo(options.bracketSize) 
    : getNextPowerOfTwo(participants.length || 8);
  const seeded = participants.length > 0 
    ? seedParticipants(participants, bracketSize, options.seeding || 'RANKED')
    : new Array(bracketSize).fill(null);
  const numWinnersRounds = Math.log2(bracketSize);
  const legTarget = options.legTarget || 3;
  const distanceMode = options.distanceMode || 'LEGS';

  const matches: TournamentBracketMatch[] = [];

  // Mapas para conectar con precisión
  const winnersRounds = new Map<number, TournamentBracketMatch[]>();
  const losersRounds = new Map<number, TournamentBracketMatch[]>();
  const roundLegs = options.roundLegsConfig;

  // --- A. CUADRO DE GANADORES (WINNERS) ---
  for (let round = 1; round <= numWinnersRounds; round++) {
    const count = bracketSize / Math.pow(2, round);
    const roundList: TournamentBracketMatch[] = [];

    let label = `Winners - Ronda ${round}`;
    let role: MatchRole = 'MATCH';
    let roundTarget = legTarget;

    if (round === numWinnersRounds) {
      label = 'Final de Ganadores';
      role = 'WINNERS_FINAL';
      roundTarget = roundLegs?.finals || legTarget;
    } else if (round === numWinnersRounds - 1) {
      label = 'Semifinales de Ganadores';
      roundTarget = roundLegs?.semiFinals || legTarget;
    } else if (round === numWinnersRounds - 2) {
      label = 'Cuartos de Ganadores';
      roundTarget = roundLegs?.quarterFinals || legTarget;
    }

    for (let pos = 0; pos < count; pos++) {
      const match: TournamentBracketMatch = {
        id: `de_w_r${round}_m${pos + 1}`,
        round,
        matchIndex: pos,
        bracketType: 'WINNERS',
        matchRole: role,
        distanceMode,
        legTarget: roundTarget,
        scoreP1: 0,
        scoreP2: 0,
        status: 'SCHEDULED',
        note: label
      };
      roundList.push(match);
      matches.push(match);
    }
    winnersRounds.set(round, roundList);
  }

  // --- B. CUADRO DE PERDEDORES (LOSERS) ---
  // En Doble Eliminación para N=8 hay (2 * log2(N) - 2) = 4 rondas de Losers.
  const numLosersRounds = (numWinnersRounds - 1) * 2;

  for (let lRound = 1; lRound <= numLosersRounds; lRound++) {
    // La cantidad de partidos en Losers disminuye cada 2 rondas
    const exponent = Math.floor((lRound + 1) / 2);
    const count = bracketSize / Math.pow(2, exponent + 1);
    const roundList: TournamentBracketMatch[] = [];

    let label = `Perdedores de la ronda ${lRound}`;
    let role: MatchRole = 'MATCH';
    let roundTarget = roundLegs?.losersRound || legTarget;

    if (lRound === numLosersRounds) {
      label = 'Final de Perdedores';
      role = 'LOSERS_FINAL';
      roundTarget = roundLegs?.losersFinals || roundLegs?.semiFinals || legTarget;
    }

    for (let pos = 0; pos < count; pos++) {
      const match: TournamentBracketMatch = {
        id: `de_l_r${lRound}_m${pos + 1}`,
        round: lRound,
        matchIndex: pos,
        bracketType: 'LOSERS',
        matchRole: role,
        distanceMode,
        legTarget: roundTarget,
        scoreP1: 0,
        scoreP2: 0,
        status: 'SCHEDULED',
        note: label
      };
      roundList.push(match);
      matches.push(match);
    }
    losersRounds.set(lRound, roundList);
  }

  // --- C. GRAN FINAL & GRAN FINAL RESET (Si aplica) ---
  const grandFinal: TournamentBracketMatch = {
    id: 'de_gf_1',
    round: numWinnersRounds + 1,
    matchIndex: 0,
    bracketType: 'FINALS',
    matchRole: 'GRAND_FINAL_1',
    distanceMode,
    legTarget: roundLegs?.grandFinal || roundLegs?.finals || legTarget,
    scoreP1: 0,
    scoreP2: 0,
    status: 'SCHEDULED',
    note: 'Gran Final'
  };
  matches.push(grandFinal);

  let grandFinalResetMatch: TournamentBracketMatch | null = null;
  if (options.grandFinalReset !== false) {
    grandFinalResetMatch = {
      id: 'de_gf_2',
      round: numWinnersRounds + 2,
      matchIndex: 1,
      bracketType: 'FINALS',
      matchRole: 'GRAND_FINAL_2',
      distanceMode,
      legTarget: roundLegs?.grandFinal || roundLegs?.finals || legTarget,
      scoreP1: 0,
      scoreP2: 0,
      status: 'SCHEDULED',
      note: 'Gran Final (Desempate - Si es necesario)'
    };
    matches.push(grandFinalResetMatch);
    grandFinal.nextMatchId = grandFinalResetMatch.id;
    grandFinal.nextSlot = 1;
  }

  // --- D. ENRUTAMIENTO DE PUNTEROS ---

  // 1. Ganadores de Winners avanzan en Winners
  for (let round = 1; round < numWinnersRounds; round++) {
    const current = winnersRounds.get(round)!;
    const next = winnersRounds.get(round + 1)!;
    for (let i = 0; i < current.length; i++) {
      current[i].nextMatchId = next[Math.floor(i / 2)].id;
      current[i].nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
    }
  }

  // 2. Ganador de Winners Final avanza a Gran Final (Slot 1)
  const winnersFinal = winnersRounds.get(numWinnersRounds)![0];
  winnersFinal.nextMatchId = grandFinal.id;
  winnersFinal.nextSlot = 1;

  // 3. Perdedor de Winners Final cae a Losers Final (Slot 2)
  const losersFinal = losersRounds.get(numLosersRounds)![0];
  winnersFinal.loserNextMatchId = losersFinal.id;
  winnersFinal.loserNextSlot = 2;

  // 4. Perdedores de W-R1 caen a L-R1
  const wR1 = winnersRounds.get(1)!;
  const lR1 = losersRounds.get(1);
  if (lR1) {
    for (let i = 0; i < wR1.length; i++) {
      wR1[i].loserNextMatchId = lR1[Math.floor(i / 2)].id;
      wR1[i].loserNextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
    }
  }

  // 5. Perdedores de rondas intermedias de Winners caen a rondas pares de Losers
  for (let wRound = 2; wRound < numWinnersRounds; wRound++) {
    const wList = winnersRounds.get(wRound)!;
    const targetLRound = (wRound - 1) * 2;
    const lList = losersRounds.get(targetLRound);
    if (lList) {
      for (let i = 0; i < wList.length; i++) {
        const targetIndex = lList.length - 1 - i; // Inversión Challonge para evitar revanchas tempranas
        wList[i].loserNextMatchId = lList[targetIndex].id;
        wList[i].loserNextSlot = 2;
      }
    }
  }

  // 6. Progresión dentro de Losers
  for (let lRound = 1; lRound < numLosersRounds; lRound++) {
    const current = losersRounds.get(lRound)!;
    const next = losersRounds.get(lRound + 1)!;

    for (let i = 0; i < current.length; i++) {
      if (current.length === next.length) {
        // De ronda impar a par: cada ganador pasa a slot 1
        current[i].nextMatchId = next[i].id;
        current[i].nextSlot = 1;
      } else {
        // De ronda par a impar: dos ganadores se cruzan en un match
        current[i].nextMatchId = next[Math.floor(i / 2)].id;
        current[i].nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
      }
    }
  }

  // 7. Ganador de Losers Final avanza a Gran Final (Slot 2)
  losersFinal.nextMatchId = grandFinal.id;
  losersFinal.nextSlot = 2;

  // --- E. ASIGNACIÓN DE JUGADORES A WINNERS R1 ---
  for (let i = 0; i < wR1.length; i++) {
    const p1 = seeded[i * 2];
    const p2 = seeded[i * 2 + 1];
    const match = wR1[i];

    if (p1) {
      match.player1 = { 
        id: p1.id, 
        name: p1.name, 
        avatarUrl: p1.avatarUrl || '/logos/logo-mdq.png', 
        seed: p1.seed, 
        nationality: p1.nationality, 
        countryCode: p1.countryCode,
        teamMembers: p1.teamMembers
      };
    }
    if (p2) {
      match.player2 = { 
        id: p2.id, 
        name: p2.name, 
        avatarUrl: p2.avatarUrl || '/logos/logo-mdq.png', 
        seed: p2.seed, 
        nationality: p2.nationality, 
        countryCode: p2.countryCode,
        teamMembers: p2.teamMembers
      };
    }
  }

  // --- F. REGISTRO DE BYES EN W-R1 (Sin resultados 3-0 ficticios) ---
  // Solo se resuelven y avanzan a Winners Ronda 2 si resolveByes !== false (por defecto true)
  let updatedMatches = [...matches];
  if (options.resolveByes !== false) {
    for (const match of wR1) {
      if (match.player1 && !match.player2) {
        match.note = 'Pase Automático (BYE)';
        match.isBye = true;
        match.scoreP1 = 0;
        match.scoreP2 = 0;
        match.status = 'SCHEDULED';
        match.winnerId = match.player1.id;
        if (match.nextMatchId) {
          const next = updatedMatches.find(m => m.id === match.nextMatchId);
          if (next) {
            if (match.nextSlot === 1) next.player1 = { ...match.player1 };
            else next.player2 = { ...match.player1 };
          }
        }
      } else if (!match.player1 && match.player2) {
        match.note = 'Pase Automático (BYE)';
        match.isBye = true;
        match.scoreP1 = 0;
        match.scoreP2 = 0;
        match.status = 'SCHEDULED';
        match.winnerId = match.player2.id;
        if (match.nextMatchId) {
          const next = updatedMatches.find(m => m.id === match.nextMatchId);
          if (next) {
            if (match.nextSlot === 1) next.player1 = { ...match.player2 };
            else next.player2 = { ...match.player2 };
          }
        }
      }
    }
  }

  return updatedMatches;
}

/**
 * Determina de forma precisa si un torneo ya tiene partidos disputados en vivo o terminados
 * por jugadores reales (excluyendo Byes automáticos o slots vacíos).
 */
export function hasRealMatchesPlayed(
  tournamentOrMatches: { matches?: TournamentBracketMatch[] } | TournamentBracketMatch[] | undefined | null
): boolean {
  if (!tournamentOrMatches) return false;
  const matches = Array.isArray(tournamentOrMatches) ? tournamentOrMatches : tournamentOrMatches.matches;
  if (!matches || matches.length === 0) return false;
  return matches.some(m => 
    m.status === 'LIVE' || 
    (m.status === 'FINISHED' && m.player1 && m.player2 && !m.note?.includes('BYE') && !m.isBye && (m.scoreP1 > 0 || m.scoreP2 > 0))
  );
}

/**
 * Registra o reporta un resultado de forma pura e inmutable, propagando
 * automáticamente al ganador al siguiente partido y al perdedor a Losers.
 * Soporta desempate de Gran Final (Grand Final Reset) estilo n01darts / Challonge.
 */
export function reportResult(
  matches: TournamentBracketMatch[],
  matchId: string,
  result: {
    scoreP1: number;
    scoreP2: number;
    winnerId: string;
    note?: string;
  }
): TournamentBracketMatch[] {
  // Copia inmutable del array
  const updated: TournamentBracketMatch[] = matches.map(m => ({ ...m }));
  const matchIndex = updated.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return matches;

  const current = updated[matchIndex];
  const winner = current.player1?.id === result.winnerId 
    ? current.player1 
    : current.player2?.id === result.winnerId 
      ? current.player2 
      : null;

  const loser = current.player1?.id === result.winnerId 
    ? current.player2 
    : current.player1;

  // Actualizar el partido actual
  current.scoreP1 = result.scoreP1;
  current.scoreP2 = result.scoreP2;
  current.winnerId = result.winnerId;
  current.status = 'FINISHED';
  if (result.note) current.note = result.note;

  // Manejo especial de Gran Final en Doble Eliminación (Grand Final Reset)
  const isGrandFinal1 = current.matchRole === 'GRAND_FINAL_1' || current.id.endsWith('de_gf_1');
  const gfResetMatch = updated.find(m => m.matchRole === 'GRAND_FINAL_2' || m.id.endsWith('de_gf_2'));

  if (isGrandFinal1 && gfResetMatch) {
    const isP1Winner = winner?.id === current.player1?.id;
    if (isP1Winner) {
      // El finalista invicto de Winners gana la final: Torneo concluido, reset no requerido
      gfResetMatch.status = 'FINISHED';
      gfResetMatch.scoreP1 = 0;
      gfResetMatch.scoreP2 = 0;
      gfResetMatch.winnerId = winner?.id;
      gfResetMatch.note = 'No requerido (Ganó invicto)';
    } else {
      // El finalista de Losers gana la primera final: Ambos tienen 1 derrota -> Se juega el Reset
      gfResetMatch.player1 = current.player1 ? { ...current.player1 } : undefined;
      gfResetMatch.player2 = current.player2 ? { ...current.player2 } : undefined;
      gfResetMatch.status = 'SCHEDULED';
      gfResetMatch.scoreP1 = 0;
      gfResetMatch.scoreP2 = 0;
      gfResetMatch.winnerId = undefined;
      gfResetMatch.note = 'Gran Final Reset (Partido Decisivo)';
    }
    return updated;
  }

  // 1. Propagar Ganador al siguiente partido
  if (current.nextMatchId && winner) {
    const nextMatch = updated.find(m => m.id === current.nextMatchId);
    if (nextMatch) {
      if (current.nextSlot === 1) {
        nextMatch.player1 = { ...winner };
      } else {
        nextMatch.player2 = { ...winner };
      }
    }
  }

  // 2. Propagar Perdedor a Losers Bracket (Doble Eliminación)
  if (current.loserNextMatchId && loser) {
    const loserMatch = updated.find(m => m.id === current.loserNextMatchId);
    if (loserMatch) {
      if (current.loserNextSlot === 1) {
        loserMatch.player1 = { ...loser };
      } else {
        loserMatch.player2 = { ...loser };
      }

      // Detectar si el otro slot de loserMatch proviene de un partido de Winners que fue un BYE (sin perdedor real)
      const siblingSlot = current.loserNextSlot === 1 ? 2 : 1;
      const siblingWinnerMatch = updated.find(
        m => m.loserNextMatchId === loserMatch.id && m.loserNextSlot === siblingSlot
      );

      const siblingIsBye = siblingWinnerMatch && (
        siblingWinnerMatch.isBye || 
        siblingWinnerMatch.isDeadBye ||
        (!siblingWinnerMatch.player1 && !siblingWinnerMatch.player2)
      );

      if (siblingIsBye) {
        loserMatch.isBye = true;
        loserMatch.note = 'Pase Automático (BYE)';
        loserMatch.winnerId = loser.id;
        loserMatch.status = 'SCHEDULED';

        // Auto-avanzar al perdedor al siguiente partido de Losers
        if (loserMatch.nextMatchId) {
          const nextLoserMatch = updated.find(m => m.id === loserMatch.nextMatchId);
          if (nextLoserMatch) {
            if (loserMatch.nextSlot === 1) {
              nextLoserMatch.player1 = { ...loser };
            } else {
              nextLoserMatch.player2 = { ...loser };
            }
          }
        }
      }
    }
  }

  return updated;
}

/**
 * Propaga y resuelve Byes en cascada para Cuadro de Perdedores evitando partidos huérfanos.
 */
export function propagateBracketByes(matches: TournamentBracketMatch[]): TournamentBracketMatch[] {
  const updated = matches.map(m => ({ ...m }));
  let changed = false;

  for (let iter = 0; iter < 10; iter++) {
    changed = false;
    for (const m of updated) {
      if (m.bracketType === 'LOSERS' && m.status === 'SCHEDULED' && !m.isDeadBye) {
        const feed1 = updated.find(f => (f.nextMatchId === m.id && f.nextSlot === 1) || (f.loserNextMatchId === m.id && f.loserNextSlot === 1));
        const feed2 = updated.find(f => (f.nextMatchId === m.id && f.nextSlot === 2) || (f.loserNextMatchId === m.id && f.loserNextSlot === 2));

        const feed1Dead = feed1 && (feed1.isDeadBye || (feed1.isBye && !feed1.player1 && !feed1.player2));
        const feed2Dead = feed2 && (feed2.isDeadBye || (feed2.isBye && !feed2.player1 && !feed2.player2));

        if (feed1Dead && feed2Dead && !m.player1 && !m.player2) {
          m.isDeadBye = true;
          m.isBye = true;
          m.note = 'Pase Automático (DEAD BYE)';
          m.status = 'FINISHED';
          changed = true;
        } else if (feed1Dead && !m.player1 && m.player2) {
          m.isBye = true;
          m.note = 'Pase Automático (BYE)';
          m.winnerId = m.player2.id;
          if (m.nextMatchId) {
            const next = updated.find(n => n.id === m.nextMatchId);
            if (next) {
              if (m.nextSlot === 1) next.player1 = { ...m.player2 };
              else next.player2 = { ...m.player2 };
              changed = true;
            }
          }
        } else if (feed2Dead && m.player1 && !m.player2) {
          m.isBye = true;
          m.note = 'Pase Automático (BYE)';
          m.winnerId = m.player1.id;
          if (m.nextMatchId) {
            const next = updated.find(n => n.id === m.nextMatchId);
            if (next) {
              if (m.nextSlot === 1) next.player1 = { ...m.player1 };
              else next.player2 = { ...m.player1 };
              changed = true;
            }
          }
        }
      }
    }
    if (!changed) break;
  }

  return updated;
}

/**
 * Calcula de forma automática el Podio de Premiación (1º, 2º y 3º puesto)
 * con medallas idénticas a Challonge y compatibilidad con namespacing y Grand Final Reset.
 */
export function computePodium(
  matches: TournamentBracketMatch[],
  format: BracketFormat = 'DOUBLE_ELIMINATION'
): TournamentPodium {
  const podium: TournamentPodium = {};

  if (format === 'DOUBLE_ELIMINATION') {
    // 1. Verificar si se jugó el Gran Final Reset (de_gf_2)
    const gfReset = matches.find(m => 
      (m.matchRole === 'GRAND_FINAL_2' || m.id.endsWith('de_gf_2')) && 
      m.status === 'FINISHED' && 
      m.winnerId && 
      !m.note?.includes('No requerido')
    );

    if (gfReset && gfReset.winnerId) {
      const isP1 = gfReset.player1?.id === gfReset.winnerId;
      const champ = isP1 ? gfReset.player1 : gfReset.player2;
      const runner = isP1 ? gfReset.player2 : gfReset.player1;

      if (champ) {
        podium.first = {
          id: champ.id,
          name: champ.name,
          avatarUrl: champ.avatarUrl,
          scoreDisplay: `${gfReset.scoreP1}-${gfReset.scoreP2}`
        };
      }
      if (runner) {
        podium.second = {
          id: runner.id,
          name: runner.name,
          avatarUrl: runner.avatarUrl,
          scoreDisplay: isP1 ? `${gfReset.scoreP2}-${gfReset.scoreP1}` : `${gfReset.scoreP1}-${gfReset.scoreP2}`
        };
      }
    } else {
      // 2. Si no hubo Reset, 1º y 2º provienen de la Gran Final 1 (de_gf_1)
      const grandFinal = matches.find(m => 
        (m.matchRole === 'GRAND_FINAL_1' || m.id.endsWith('de_gf_1')) && 
        m.status === 'FINISHED' && 
        m.winnerId
      );

      if (grandFinal && grandFinal.winnerId) {
        const isP1 = grandFinal.player1?.id === grandFinal.winnerId;
        const champ = isP1 ? grandFinal.player1 : grandFinal.player2;
        const runner = isP1 ? grandFinal.player2 : grandFinal.player1;

        if (champ) {
          podium.first = {
            id: champ.id,
            name: champ.name,
            avatarUrl: champ.avatarUrl,
            scoreDisplay: `${grandFinal.scoreP1}-${grandFinal.scoreP2}`
          };
        }
        if (runner) {
          podium.second = {
            id: runner.id,
            name: runner.name,
            avatarUrl: runner.avatarUrl,
            scoreDisplay: isP1 ? `${grandFinal.scoreP2}-${grandFinal.scoreP1}` : `${grandFinal.scoreP1}-${grandFinal.scoreP2}`
          };
        }
      }
    }

    // 3º Puesto proviene del perdedor de la Final de Perdedores
    const losersFinal = matches.find(m => 
      (m.matchRole === 'LOSERS_FINAL' || m.note?.includes('Final de Perdedores')) && 
      m.status === 'FINISHED' && 
      m.winnerId
    );

    if (losersFinal && losersFinal.winnerId) {
      const isWinnerP1 = losersFinal.player1?.id === losersFinal.winnerId;
      const bronze = isWinnerP1 ? losersFinal.player2 : losersFinal.player1;
      if (bronze) {
        podium.third = {
          id: bronze.id,
          name: bronze.name,
          avatarUrl: bronze.avatarUrl,
          scoreDisplay: `${losersFinal.scoreP1}-${losersFinal.scoreP2}`
        };
      }
    }
  } else {
    // Single Elimination: Final y 3er Puesto
    const finalMatch = matches.find(m => 
      (m.matchRole === 'FINAL' || m.note === 'Finales' || m.note?.includes('Gran Final del Torneo')) && 
      !m.id.endsWith('se_third_place') && 
      m.status === 'FINISHED' && 
      m.winnerId
    );

    if (finalMatch && finalMatch.winnerId) {
      const isP1 = finalMatch.player1?.id === finalMatch.winnerId;
      const champ = isP1 ? finalMatch.player1 : finalMatch.player2;
      const runner = isP1 ? finalMatch.player2 : finalMatch.player1;

      if (champ) {
        podium.first = {
          id: champ.id,
          name: champ.name,
          avatarUrl: champ.avatarUrl,
          scoreDisplay: `${finalMatch.scoreP1}-${finalMatch.scoreP2}`
        };
      }
      if (runner) {
        podium.second = {
          id: runner.id,
          name: runner.name,
          avatarUrl: runner.avatarUrl
        };
      }
    }

    const thirdMatch = matches.find(m => 
      (m.matchRole === 'THIRD_PLACE' || m.id === 'se_third_place' || m.id.endsWith('se_third_place')) && 
      m.status === 'FINISHED' && 
      m.winnerId
    );

    if (thirdMatch && thirdMatch.winnerId) {
      const bronze = thirdMatch.player1?.id === thirdMatch.winnerId ? thirdMatch.player1 : thirdMatch.player2;
      if (bronze) {
        podium.third = {
          id: bronze.id,
          name: bronze.name,
          avatarUrl: bronze.avatarUrl,
          scoreDisplay: `${thirdMatch.scoreP1}-${thirdMatch.scoreP2}`
        };
      }
    }
  }

  return podium;
}

/**
 * Previsualiza el impacto de modificar o reiniciar un partido que ya tiene
 * partidos posteriores jugados (para mostrar aviso al administrador).
 */
export function previewDownstreamImpact(
  matches: TournamentBracketMatch[],
  targetMatchId: string
): string[] {
  const affected: string[] = [];
  const queue = [targetMatchId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const match = matches.find(m => m.id === currentId);
    if (!match) continue;

    if (match.nextMatchId && !affected.includes(match.nextMatchId)) {
      affected.push(match.nextMatchId);
      queue.push(match.nextMatchId);
    }
    if (match.loserNextMatchId && !affected.includes(match.loserNextMatchId)) {
      affected.push(match.loserNextMatchId);
      queue.push(match.loserNextMatchId);
    }
  }

  return affected;
}

/**
 * Resetea un partido a 0-0 y opcionalmente invalida en cascada todos
 * los partidos posteriores afectados de forma segura, vaciando los slots río abajo.
 */
export function resetMatchSafely(
  matches: TournamentBracketMatch[],
  matchId: string,
  cascade: boolean = true
): TournamentBracketMatch[] {
  const updated: TournamentBracketMatch[] = matches.map(m => ({ ...m }));
  const target = updated.find(m => m.id === matchId);
  if (!target) return matches;

  const previousWinnerId = target.winnerId;

  target.scoreP1 = 0;
  target.scoreP2 = 0;
  target.winnerId = undefined;
  target.status = 'SCHEDULED';
  target.note = target.note?.replace(' (Walkover)', '').replace(' (W.O.)', '');

  if (cascade) {
    const downstreamIds = previewDownstreamImpact(matches, matchId);
    for (const dId of downstreamIds) {
      const dMatch = updated.find(m => m.id === dId);
      if (dMatch) {
        // Vaciar slots del jugador que provenía del partido reseteado
        if (previousWinnerId) {
          if (dMatch.player1?.id === previousWinnerId) {
            dMatch.player1 = undefined;
          }
          if (dMatch.player2?.id === previousWinnerId) {
            dMatch.player2 = undefined;
          }
        }

        // Si este partido es receptor directo del partido reseteado, vaciar el slot correspondiente
        if (target.nextMatchId === dMatch.id) {
          if (target.nextSlot === 1) dMatch.player1 = undefined;
          else if (target.nextSlot === 2) dMatch.player2 = undefined;
        }
        if (target.loserNextMatchId === dMatch.id) {
          if (target.loserNextSlot === 1) dMatch.player1 = undefined;
          else if (target.loserNextSlot === 2) dMatch.player2 = undefined;
        }

        dMatch.scoreP1 = 0;
        dMatch.scoreP2 = 0;
        dMatch.winnerId = undefined;
        dMatch.status = 'SCHEDULED';
      }
    }
  }

  return updated;
}
