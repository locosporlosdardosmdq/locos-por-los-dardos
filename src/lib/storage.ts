/**
 * Persistencia Offline-First para Locos por los Dardos • Argentina & Darderos MDQ
 * Diseñado para operar 100% offline en clubes, pubs y canchas de tiro con mala señal.
 */

import { MatchConfig, LandingShowcaseSettings, GrandTournamentRegistration } from './types';

export interface SavedMatch {
  id: string;
  gameType: 'X01' | 'CRICKET' | 'ROUND_THE_CLOCK';
  date: string;
  isVsCpu?: boolean;
  cpuDifficulty?: string;
  players: {
    name: string;
    score: number;
    avg: number;
    first9Avg?: number;
    legsWon: number;
    dartsThrown: number;
    highestCheckout?: number;
    count180s?: number;
    count140Plus?: number;
    count100Plus?: number;
    isWinner: boolean;
  }[];
  legsTotal: number;
  winnerName?: string;
  tournamentId?: string;
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

// --- Persistencia de Partidas (Anotador) ---
export function saveCompletedMatch(match: Omit<SavedMatch, 'id' | 'date'>): SavedMatch {
  if (typeof window === 'undefined') return match as SavedMatch;

  const newMatch: SavedMatch = {
    ...match,
    id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString(),
  };

  try {
    // Si la partida es contra el BOT (Modo Práctica), se guarda de forma aislada
    // para no alterar el promedio oficial ni el ranking federado del jugador
    if (newMatch.isVsCpu) {
      const existingBot = getBotMatches();
      const updatedBot = [newMatch, ...existingBot].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.BOT_MATCHES, JSON.stringify(updatedBot));

      // Actualizar estadísticas acumuladas de práctica vs Máquina
      const p1 = newMatch.players[0];
      const prevStats = getBotStats();
      const isWinner = p1 ? p1.isWinner : false;
      const p1Avg = p1 ? p1.avg : 0;
      const p1First9 = p1?.first9Avg || p1Avg;

      const newPlayed = prevStats.matchesPlayed + 1;
      const newWon = prevStats.matchesWon + (isWinner ? 1 : 0);
      const newAvg = Number(((prevStats.overallAvg * prevStats.matchesPlayed + p1Avg) / newPlayed).toFixed(2));
      const newFirst9 = Number(((prevStats.first9Avg * prevStats.matchesPlayed + p1First9) / newPlayed).toFixed(2));

      const p1Checkout = p1?.highestCheckout || p1?.score || 0;
      const p1Darts = p1?.dartsThrown && p1.dartsThrown > 0 ? p1.dartsThrown : 0;

      const updatedBotStats = {
        matchesPlayed: newPlayed,
        matchesWon: newWon,
        overallAvg: newAvg,
        first9Avg: newFirst9,
        highestCheckout: Math.max(prevStats.highestCheckout || 0, p1Checkout),
        count180s: (prevStats.count180s || 0) + (p1?.count180s || 0),
        count140Plus: (prevStats.count140Plus || 0) + (p1?.count140Plus || 0),
        count100Plus: (prevStats.count100Plus || 0) + (p1?.count100Plus || 0),
        bestLegDarts: p1Darts > 0
          ? (prevStats.bestLegDarts > 0 ? Math.min(prevStats.bestLegDarts, p1Darts) : p1Darts)
          : (prevStats.bestLegDarts || 0),
        lastPlayed: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.BOT_STATS, JSON.stringify(updatedBotStats));
      window.dispatchEvent(new CustomEvent('lpld_bot_stats_updated', { detail: updatedBotStats }));
      return newMatch;
    }

    // Partida Competitiva Oficial (PvP, Torneos, Ligas)
    const existing = getSavedMatches();
    const updated = [newMatch, ...existing].slice(0, 50); // Mantenemos las últimas 50 partidas en local
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));

    // Agregar a cola de sincronización para backend oficial
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
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(url);
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

export function saveStoredTournaments(tournaments: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOURNAMENT_KEYS.ACTIVE, JSON.stringify(tournaments));
  } catch (err) {
    console.warn('[Storage] Error guardando torneos activos:', err);
  }
}

export async function fetchTournamentsFromCloud(): Promise<any[]> {
  try {
    const res = await fetch('/api/torneos', { cache: 'no-store' });
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
    const res = await fetch('/api/torneos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament })
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
      method: 'DELETE'
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
  } catch (err) {
    console.warn('[Storage] Error al guardar autoridades:', err);
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
  } catch (err) {
    console.warn('[Storage] Error al guardar datos bancarios de la asociación:', err);
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
  } catch (err) {
    console.warn('[Storage] Error al guardar vitrinas de la landing:', err);
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
    const res = await fetch(url, { cache: 'no-store' });
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

export async function saveGrandTournamentRegistrationToCloud(reg: GrandTournamentRegistration): Promise<boolean> {
  try {
    const res = await fetch('/api/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration: reg })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Error saving grand registration to cloud:', err);
    return false;
  }
}




