/**
 * Persistencia Offline-First para Locos por los Dardos • Argentina & Darderos MDQ
 * Diseñado para operar 100% offline en clubes, pubs y canchas de tiro con mala señal.
 */

import { MatchConfig } from './types';

export interface SavedMatch {
  id: string;
  gameType: 'X01' | 'CRICKET' | 'ROUND_THE_CLOCK';
  date: string;
  players: {
    name: string;
    score: number;
    avg: number;
    first9Avg?: number;
    legsWon: number;
    dartsThrown: number;
    isWinner: boolean;
  }[];
  legsTotal: number;
  winnerName?: string;
  tournamentId?: string;
}

const STORAGE_KEYS = {
  MATCHES: 'lpld_matches_history_v1',
  ACTIVE_SESSION: 'lpld_active_match_session_v1',
  CURRENT_PLAYER: 'lpld_player_profile_v1',
  OFFLINE_QUEUE: 'lpld_sync_queue_v1',
  TOURNAMENTS: 'lpld_tournaments_local_v1',
};

// --- Persistencia de Partidas (Anotador) ---
export function saveCompletedMatch(match: Omit<SavedMatch, 'id' | 'date'>): SavedMatch {
  if (typeof window === 'undefined') return match as SavedMatch;

  const newMatch: SavedMatch = {
    ...match,
    id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString(),
  };

  try {
    const existing = getSavedMatches();
    const updated = [newMatch, ...existing].slice(0, 50); // Mantenemos las últimas 50 partidas en local
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));

    // Agregar a cola de sincronización si se requiere backend
    queueForSync('MATCH', newMatch);
  } catch (err) {
    console.warn('[Storage] Error al guardar partida offline:', err);
  }

  return newMatch;
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
    return JSON.parse(data);
  } catch {
    return defaultProfile;
  }
}

export function saveCurrentPlayerProfile(profile: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYER, JSON.stringify(profile));
    // Notificar cambio a componentes oyentes
    window.dispatchEvent(new CustomEvent('lpld_profile_updated', { detail: profile }));
  } catch (err) {
    console.warn('[Storage] Error al guardar perfil de jugador:', err);
  }
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

export function saveStoredTournaments(tournaments: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOURNAMENT_KEYS.ACTIVE, JSON.stringify(tournaments));
  } catch (err) {
    console.warn('[Storage] Error guardando torneos activos:', err);
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


