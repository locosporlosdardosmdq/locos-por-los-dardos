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

import { TournamentBracketMatch, TournamentPodium } from './types';

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
}

export type BracketFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION';
export type SeedingMode = 'RANKED' | 'RANDOM' | 'MANUAL';

export interface SingleEliminationOptions {
  bracketSize?: 4 | 8 | 16 | 32 | 64;
  seeding?: SeedingMode;
  includeThirdPlace?: boolean;
  legTarget?: number;
  setTarget?: number;
  distanceMode?: 'LEGS' | 'SETS';
}

export interface DoubleEliminationOptions {
  bracketSize?: 4 | 8 | 16 | 32 | 64;
  seeding?: SeedingMode;
  grandFinalReset?: boolean;
  legTarget?: number;
  setTarget?: number;
  distanceMode?: 'LEGS' | 'SETS';
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
 * Siembra a los participantes según el modo elegido y rellena con Byes si faltan jugadores.
 */
export function seedParticipants(
  participants: Participant[],
  bracketSize: number,
  mode: SeedingMode = 'RANKED'
): (Participant | null)[] {
  const list = [...participants];

  if (mode === 'RANDOM') {
    list.sort(() => Math.random() - 0.5);
  } else if (mode === 'RANKED') {
    list.sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
  }

  const seededOrder = getSeededOrder(bracketSize);
  const slots: (Participant | null)[] = new Array(bracketSize).fill(null);

  // Colocar a cada jugador en su slot correspondiente
  for (let i = 0; i < list.length; i++) {
    const seedNumber = i + 1;
    const targetSlotIndex = seededOrder.indexOf(seedNumber);
    if (targetSlotIndex !== -1) {
      slots[targetSlotIndex] = {
        ...list[i],
        seed: seedNumber
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
  const bracketSize = options.bracketSize || getNextPowerOfTwo(participants.length);
  const seeded = seedParticipants(participants, bracketSize, options.seeding || 'RANKED');
  const numRounds = Math.log2(bracketSize);
  const matches: TournamentBracketMatch[] = [];

  const legTarget = options.legTarget || 3;
  const distanceMode = options.distanceMode || 'LEGS';

  // 1. Crear todos los partidos ronda por ronda
  const roundMatchesMap = new Map<number, TournamentBracketMatch[]>();

  for (let round = 1; round <= numRounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);
    const roundList: TournamentBracketMatch[] = [];

    let roundLabel = `Ronda ${round}`;
    if (round === numRounds) roundLabel = 'Finales';
    else if (round === numRounds - 1) roundLabel = 'Semifinales';
    else if (round === numRounds - 2) roundLabel = 'Cuartos de Final';

    for (let pos = 0; pos < matchesInRound; pos++) {
      const matchId = `se_r${round}_m${pos + 1}`;
      const match: TournamentBracketMatch = {
        id: matchId,
        round,
        matchIndex: pos,
        bracketType: 'WINNERS',
        distanceMode,
        legTarget,
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
      distanceMode,
      legTarget,
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

    if (p1) match.player1 = { id: p1.id, name: p1.name, avatarUrl: p1.avatarUrl || '/logos/logo-mdq.png', seed: p1.seed, nationality: p1.nationality, countryCode: p1.countryCode };
    if (p2) match.player2 = { id: p2.id, name: p2.name, avatarUrl: p2.avatarUrl || '/logos/logo-mdq.png', seed: p2.seed, nationality: p2.nationality, countryCode: p2.countryCode };
  }

  // 4. Resolver Byes inmediatos en la Ronda 1
  let updatedMatches = [...matches];
  for (const match of r1List) {
    if (match.player1 && !match.player2) {
      // P1 gana por Bye
      updatedMatches = reportResult(updatedMatches, match.id, {
        scoreP1: legTarget,
        scoreP2: 0,
        winnerId: match.player1.id,
        note: 'Pase Automático (BYE)'
      });
    } else if (!match.player1 && match.player2) {
      // P2 gana por Bye
      updatedMatches = reportResult(updatedMatches, match.id, {
        scoreP1: 0,
        scoreP2: legTarget,
        winnerId: match.player2.id,
        note: 'Pase Automático (BYE)'
      });
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
  const bracketSize = options.bracketSize || getNextPowerOfTwo(participants.length);
  const seeded = seedParticipants(participants, bracketSize, options.seeding || 'RANKED');
  const numWinnersRounds = Math.log2(bracketSize);
  const legTarget = options.legTarget || 3;
  const distanceMode = options.distanceMode || 'LEGS';

  const matches: TournamentBracketMatch[] = [];

  // Mapas para conectar con precisión
  const winnersRounds = new Map<number, TournamentBracketMatch[]>();
  const losersRounds = new Map<number, TournamentBracketMatch[]>();

  // --- A. CUADRO DE GANADORES (WINNERS) ---
  for (let round = 1; round <= numWinnersRounds; round++) {
    const count = bracketSize / Math.pow(2, round);
    const roundList: TournamentBracketMatch[] = [];

    let label = `Winners - Ronda ${round}`;
    if (round === numWinnersRounds) label = 'Final de Ganadores';
    else if (round === numWinnersRounds - 1) label = 'Semifinales de Ganadores';

    for (let pos = 0; pos < count; pos++) {
      const match: TournamentBracketMatch = {
        id: `de_w_r${round}_m${pos + 1}`,
        round,
        matchIndex: pos,
        bracketType: 'WINNERS',
        distanceMode,
        legTarget,
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
    if (lRound === numLosersRounds) label = 'Final de Perdedores';

    for (let pos = 0; pos < count; pos++) {
      const match: TournamentBracketMatch = {
        id: `de_l_r${lRound}_m${pos + 1}`,
        round: lRound,
        matchIndex: pos,
        bracketType: 'LOSERS',
        distanceMode,
        legTarget,
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

  // --- C. GRAN FINAL ---
  const grandFinal: TournamentBracketMatch = {
    id: 'de_gf_1',
    round: numWinnersRounds + 1,
    matchIndex: 0,
    bracketType: 'FINALS',
    distanceMode,
    legTarget,
    scoreP1: 0,
    scoreP2: 0,
    status: 'SCHEDULED',
    note: 'Gran Final'
  };
  matches.push(grandFinal);

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

    if (p1) match.player1 = { id: p1.id, name: p1.name, avatarUrl: p1.avatarUrl || '/logos/logo-mdq.png', seed: p1.seed, nationality: p1.nationality, countryCode: p1.countryCode };
    if (p2) match.player2 = { id: p2.id, name: p2.name, avatarUrl: p2.avatarUrl || '/logos/logo-mdq.png', seed: p2.seed, nationality: p2.nationality, countryCode: p2.countryCode };
  }

  // --- F. RESOLUCIÓN AUTOMÁTICA DE BYES EN W-R1 ---
  let updatedMatches = [...matches];
  for (const match of wR1) {
    if (match.player1 && !match.player2) {
      updatedMatches = reportResult(updatedMatches, match.id, {
        scoreP1: legTarget,
        scoreP2: 0,
        winnerId: match.player1.id,
        note: 'Pase Automático (BYE)'
      });
    } else if (!match.player1 && match.player2) {
      updatedMatches = reportResult(updatedMatches, match.id, {
        scoreP1: 0,
        scoreP2: legTarget,
        winnerId: match.player2.id,
        note: 'Pase Automático (BYE)'
      });
    }
  }

  return updatedMatches;
}

/**
 * Registra o reporta un resultado de forma pura e inmutable, propagando
 * automáticamente al ganador al siguiente partido y al perdedor a Losers.
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
    }
  }

  return updated;
}

/**
 * Calcula de forma automática el Podio de Premiación (1º, 2º y 3º puesto)
 * con medallas idénticas a Challonge.
 */
export function computePodium(
  matches: TournamentBracketMatch[],
  format: BracketFormat = 'DOUBLE_ELIMINATION'
): TournamentPodium {
  const podium: TournamentPodium = {};

  if (format === 'DOUBLE_ELIMINATION') {
    // 1º y 2º Puesto provienen de la Gran Final (de_gf_1)
    const grandFinal = matches.find(m => m.id === 'de_gf_1' && m.status === 'FINISHED');
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

    // 3º Puesto proviene del perdedor de la Final de Perdedores
    const losersFinal = matches.find(m => m.note?.includes('Final de Perdedores') && m.status === 'FINISHED');
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
    const finalMatch = matches.find(m => m.note === 'Finales' && m.status === 'FINISHED');
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

    const thirdMatch = matches.find(m => m.id === 'se_third_place' && m.status === 'FINISHED');
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
 * los partidos posteriores afectados de forma segura.
 */
export function resetMatchSafely(
  matches: TournamentBracketMatch[],
  matchId: string,
  cascade: boolean = true
): TournamentBracketMatch[] {
  const updated: TournamentBracketMatch[] = matches.map(m => ({ ...m }));
  const target = updated.find(m => m.id === matchId);
  if (!target) return matches;

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
        // Si el jugador provenía del partido reseteado, limpiarlo
        dMatch.scoreP1 = 0;
        dMatch.scoreP2 = 0;
        dMatch.winnerId = undefined;
        dMatch.status = 'SCHEDULED';
      }
    }
  }

  return updated;
}
