import { UltimateDartsCardData } from '@/components/jugadores/UltimateDartsCard';

export const ICEMAN_CARD_DATA: UltimateDartsCardData = {
  id: 'user-iceman-admin',
  name: 'Mariano Deux (ICEMAN)',
  nickname: 'ICEMAN',
  avatarUrl: '/images/iceman-perfil.png',
  photoUrl: '/images/iceman-perfil.png',
  logoUrl: '/logos/logo-iceman-card.png',
  nationality: 'Argentina',
  countryCode: 'AR',
  province: 'Buenos Aires',
  city: 'Mar del Plata',
  club: 'Darderos Mar del Plata',
  avg: 48.0,
  category: 'INTERMEDIA',
  matchesWon: 0,
  matchesTotal: 0,
  count180s: 0,
  highestCheckout: 0,
  isVerified: true,
  majorTitle: 'ADMINISTRADOR OFICIAL',
  dartBrand: 'TARGET 90%',
  dartWeight: 24,
  bestLeg: 0,
  nationalPoints: 0,
  nationalRank: 1,
  mdqLeaguePoints: 0,
  mdqLeagueRank: 1,
  presentialPoints: 0,
  presentialRank: 1,
  tournamentsWonList: [],
  recentHistory: []
};

export const CANONICAL_PLAYERS: UltimateDartsCardData[] = [
  ICEMAN_CARD_DATA
];

export function findCanonicalPlayer(query: string, nameFallback?: string): UltimateDartsCardData | null {
  if (!query && !nameFallback) return null;
  const q = (query || '').toLowerCase().trim();
  const fallback = (nameFallback || '').toLowerCase().trim();

  // Mapeo directo de ICEMAN / Mariano Deux
  if (
    q === 'user-iceman-admin' || 
    q === 'user-iceman' || 
    q.includes('iceman') || 
    fallback.includes('iceman') ||
    q.includes('mariano') ||
    fallback.includes('mariano')
  ) {
    return CANONICAL_PLAYERS[0];
  }

  const directMatch = CANONICAL_PLAYERS.find(
    (p) =>
      p.id.toLowerCase() === q ||
      p.nickname.toLowerCase() === q ||
      p.name.toLowerCase() === q ||
      p.name.toLowerCase().includes(q) ||
      p.nickname.toLowerCase().includes(q)
  );
  if (directMatch) return directMatch;

  if (fallback) {
    const fallbackMatch = CANONICAL_PLAYERS.find(
      (p) =>
        p.name.toLowerCase() === fallback ||
        p.nickname.toLowerCase() === fallback ||
        p.name.toLowerCase().includes(fallback) ||
        p.nickname.toLowerCase().includes(fallback)
    );
    if (fallbackMatch) return fallbackMatch;
  }

  return null;
}
