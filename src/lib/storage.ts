/**
 * Persistencia Offline-First para Locos por los Dardos • Argentina & Darderos MDQ
 * Diseñado para operar 100% offline en clubes, pubs y canchas de tiro con mala señal.
 */

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
