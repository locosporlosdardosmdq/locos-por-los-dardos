import { UltimateDartsCardData } from '@/components/jugadores/UltimateDartsCard';
import { PlayerHistoryDateItem, PlayerTournamentWin } from './types';

export const CANONICAL_PLAYERS: UltimateDartsCardData[] = [
  {
    id: 'p-0',
    name: 'Mariano Deux (ICEMAN)',
    nickname: 'ICEMAN',
    avatarUrl: '/logos/logo-mdq.png',
    photoUrl: '/images/players/iceman.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    club: 'Darderos Mar del Plata',
    avg: 75.0,
    category: 'ELITE',
    matchesWon: 95,
    matchesTotal: 120,
    count180s: 58,
    highestCheckout: 170,
    isVerified: true,
    majorTitle: '1x SUPERADMIN & CAMPEÓN MDQ',
    walkOnSong: 'AC/DC - THUNDERSTRUCK',
    dartBrand: 'TARGET 90%',
    dartWeight: 24,
    bestLeg: 11,
    nationalPoints: 1850,
    nationalRank: 1,
    mdqLeaguePoints: 980,
    mdqLeagueRank: 1,
    presentialPoints: 420,
    presentialRank: 1,
    presentialPodiums: '1x Campeón • 1x Finalista',
    tournamentsWonList: [
      {
        id: 'hist-torneo-apertura-2026',
        name: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
        year: 2026,
        stage: 'Gran Final'
      },
      {
        id: 'hist-open-mdq-2025',
        name: 'Gran Open Mar del Plata 2025 • Copa Costa Atlántica',
        year: 2025,
        stage: 'Gran Final'
      }
    ],
    lastTournamentRank: 1,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'GOLD',
    recentHistory: [
      {
        id: 'hist-m-ice-1',
        eventName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
        eventType: 'TOURNAMENT',
        targetId: 'hist-torneo-apertura-2026',
        targetTab: 'HISTORY_TAB',
        date: '15/02/2026',
        roundOrStage: 'Gran Final (Oro)',
        opponentName: 'Martín Rossi (Sniper CABA)',
        scoreLegs: '3 - 2',
        isWin: true,
        avg: 79.8
      },
      {
        id: 'hist-m-ice-2',
        eventName: 'Liga Nacional Oficial de Argentina • Fecha 4',
        eventType: 'LEAGUE',
        targetId: 'league-national-argentina',
        targetTab: 'LEAGUES_TAB',
        date: '08/02/2026',
        roundOrStage: 'Fecha 4 Nacional',
        opponentName: 'Facundo López (El Halcón MDQ)',
        scoreLegs: '4 - 1',
        isWin: true,
        avg: 76.4
      },
      {
        id: 'hist-m-ice-3',
        eventName: 'Liga Marplatense 2026 • Darderos MDQ',
        eventType: 'LEAGUE',
        targetId: 'league-local-mdq',
        targetTab: 'LEAGUES_TAB',
        date: '01/02/2026',
        roundOrStage: 'Fecha 6 Local',
        opponentName: 'Carlos Méndez (Charly)',
        scoreLegs: '5 - 3',
        isWin: true,
        avg: 74.2
      },
      {
        id: 'hist-m-ice-4',
        eventName: 'Gran Open Mar del Plata 2025 • Copa Costa Atlántica',
        eventType: 'TOURNAMENT',
        targetId: 'hist-open-mdq-2025',
        targetTab: 'HISTORY_TAB',
        date: '20/11/2025',
        roundOrStage: 'Gran Final',
        opponentName: 'Facundo López (El Halcón)',
        scoreLegs: '4 - 2',
        isWin: true,
        avg: 78.5
      }
    ]
  },
  {
    id: 'p-1',
    name: 'Facundo López',
    nickname: 'El Halcón MDQ',
    avatarUrl: '/logos/logo-mdq.png',
    photoUrl: '/images/players/halcon.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    club: 'Darderos Mar del Plata',
    avg: 74.8,
    category: 'ELITE',
    matchesWon: 42,
    matchesTotal: 48,
    count180s: 38,
    highestCheckout: 161,
    isVerified: true,
    majorTitle: '1x CAMPEÓN COSTA ATLÁNTICA',
    walkOnSong: 'PITBULL - GREENLIGHT',
    dartBrand: 'TARGET SWISS 90%',
    dartWeight: 23,
    bestLeg: 12,
    nationalPoints: 1780,
    nationalRank: 2,
    mdqLeaguePoints: 940,
    mdqLeagueRank: 2,
    presentialPoints: 390,
    presentialRank: 2,
    presentialPodiums: '1x Campeón Costa Atlántica',
    tournamentsWonList: [
      {
        id: 'hist-invierno-mdq-2025',
        name: 'Copa Invierno 2025 • Sede Darderos MDQ',
        year: 2025,
        stage: 'Gran Final'
      }
    ],
    lastTournamentRank: 3,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'BRONZE',
    recentHistory: [
      {
        id: 'hist-m-fac-1',
        eventName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
        eventType: 'TOURNAMENT',
        targetId: 'hist-torneo-apertura-2026',
        targetTab: 'HISTORY_TAB',
        date: '15/02/2026',
        roundOrStage: 'Cuartos de Final',
        opponentName: 'Mariano Deux (ICEMAN)',
        scoreLegs: '1 - 3',
        isWin: false,
        avg: 72.5
      },
      {
        id: 'hist-m-fac-2',
        eventName: 'Liga Nacional Oficial de Argentina • Fecha 4',
        eventType: 'LEAGUE',
        targetId: 'league-national-argentina',
        targetTab: 'LEAGUES_TAB',
        date: '08/02/2026',
        roundOrStage: 'Fecha 4 Nacional',
        opponentName: 'Mariano Deux (ICEMAN)',
        scoreLegs: '1 - 4',
        isWin: false,
        avg: 73.0
      },
      {
        id: 'hist-m-fac-3',
        eventName: 'Copa Invierno 2025 • Sede Darderos MDQ',
        eventType: 'TOURNAMENT',
        targetId: 'hist-invierno-mdq-2025',
        targetTab: 'HISTORY_TAB',
        date: '12/07/2025',
        roundOrStage: 'Gran Final',
        opponentName: 'Diego Gómez (Tungsteno)',
        scoreLegs: '4 - 1',
        isWin: true,
        avg: 76.2
      }
    ]
  },
  {
    id: 'p-2',
    name: 'Martín Rossi',
    nickname: 'Sniper CABA',
    avatarUrl: '/logos/dardos-argentina.png',
    photoUrl: '/images/players/sniper.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'CABA',
    city: 'Buenos Aires',
    club: 'Dardos Capital',
    avg: 71.2,
    category: 'ELITE',
    matchesWon: 36,
    matchesTotal: 44,
    count180s: 29,
    highestCheckout: 156,
    isVerified: true,
    majorTitle: '1x LÍDER RANKING CABA',
    walkOnSong: 'QUEEN - WE WILL ROCK YOU',
    dartBrand: 'WINMAU BLADE 24G',
    dartWeight: 24,
    bestLeg: 11,
    nationalPoints: 1690,
    nationalRank: 3,
    mdqLeaguePoints: 0,
    mdqLeagueRank: 0,
    presentialPoints: 260,
    presentialRank: 4,
    presentialPodiums: '1x Semifinalista MDQ',
    tournamentsWonList: [
      {
        id: 'hist-open-caba-2025',
        name: 'Open Metropolitano CABA 2025',
        year: 2025,
        stage: 'Gran Final'
      }
    ],
    lastTournamentRank: 2,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'SILVER',
    recentHistory: [
      {
        id: 'hist-m-mar-1',
        eventName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
        eventType: 'TOURNAMENT',
        targetId: 'hist-torneo-apertura-2026',
        targetTab: 'HISTORY_TAB',
        date: '15/02/2026',
        roundOrStage: 'Gran Final',
        opponentName: 'Mariano Deux (ICEMAN)',
        scoreLegs: '2 - 3',
        isWin: false,
        avg: 75.4
      },
      {
        id: 'hist-m-mar-2',
        eventName: 'Liga Nacional Oficial de Argentina • Fecha 4',
        eventType: 'LEAGUE',
        targetId: 'league-national-argentina',
        targetTab: 'LEAGUES_TAB',
        date: '08/02/2026',
        roundOrStage: 'Fecha 4 Nacional',
        opponentName: 'Diego Gómez (Tungsteno)',
        scoreLegs: '3 - 2',
        isWin: true,
        avg: 72.8
      },
      {
        id: 'hist-m-mar-3',
        eventName: 'Open Metropolitano CABA 2025',
        eventType: 'TOURNAMENT',
        targetId: 'hist-open-caba-2025',
        targetTab: 'HISTORY_TAB',
        date: '14/10/2025',
        roundOrStage: 'Gran Final',
        opponentName: 'Lucas Pereyra (Bullseye)',
        scoreLegs: '4 - 1',
        isWin: true,
        avg: 74.0
      }
    ]
  },
  {
    id: 'p-3',
    name: 'Diego Gómez',
    nickname: 'Tungsteno Rosario',
    avatarUrl: '/logos/dardos-argentina.png',
    photoUrl: '/images/players/tungsteno.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Santa Fe',
    city: 'Rosario',
    club: 'Rosario Darts Club',
    avg: 66.5,
    category: 'AVANZADA',
    matchesWon: 29,
    matchesTotal: 38,
    count180s: 21,
    highestCheckout: 140,
    isVerified: true,
    majorTitle: '1x CAMPEÓN SANTA FE',
    walkOnSong: 'LOS PALMERAS - EL BOMBÓN',
    dartBrand: 'RED DRAGON 24G',
    dartWeight: 24,
    bestLeg: 13,
    nationalPoints: 1520,
    nationalRank: 4,
    mdqLeaguePoints: 0,
    mdqLeagueRank: 0,
    presentialPoints: 240,
    presentialRank: 5,
    presentialPodiums: '1x Semifinalista MDQ',
    tournamentsWonList: [
      {
        id: 'hist-torneo-rosario-2025',
        name: 'Torneo Anual Rosario Darts 2025',
        year: 2025,
        stage: 'Gran Final'
      }
    ],
    lastTournamentRank: 3,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'BRONZE',
    recentHistory: [
      {
        id: 'hist-m-dg-1',
        eventName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
        eventType: 'TOURNAMENT',
        targetId: 'hist-torneo-apertura-2026',
        targetTab: 'HISTORY_TAB',
        date: '15/02/2026',
        roundOrStage: 'Cuartos de Final',
        opponentName: 'Martín Rossi (Sniper CABA)',
        scoreLegs: '2 - 3',
        isWin: false,
        avg: 67.2
      },
      {
        id: 'hist-m-dg-2',
        eventName: 'Liga Nacional Oficial de Argentina • Fecha 4',
        eventType: 'LEAGUE',
        targetId: 'league-national-argentina',
        targetTab: 'LEAGUES_TAB',
        date: '08/02/2026',
        roundOrStage: 'Fecha 4 Nacional',
        opponentName: 'Martín Rossi (Sniper)',
        scoreLegs: '2 - 3',
        isWin: false,
        avg: 66.8
      }
    ]
  },
  {
    id: 'p-4',
    name: 'Lucas Pereyra',
    nickname: 'Bullseye Córdoba',
    avatarUrl: '/logos/dardos-argentina.png',
    photoUrl: '/images/players/sniper.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Córdoba',
    city: 'Córdoba Capital',
    club: 'Córdoba Dardos Asoc.',
    avg: 63.8,
    category: 'AVANZADA',
    matchesWon: 25,
    matchesTotal: 34,
    count180s: 18,
    highestCheckout: 130,
    isVerified: true,
    majorTitle: '1x SUB-CAMPEÓN CENTRO',
    walkOnSong: 'LA KONGA - UNIVERSO',
    dartBrand: 'HARROWS CARBON',
    dartWeight: 23,
    bestLeg: 14,
    nationalPoints: 1410,
    nationalRank: 5,
    mdqLeaguePoints: 0,
    mdqLeagueRank: 0,
    presentialPoints: 180,
    presentialRank: 6,
    presentialPodiums: 'Cuartos de Final MDQ',
    tournamentsWonList: [],
    lastTournamentRank: 4,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'NONE',
    recentHistory: [
      {
        id: 'hist-m-lp-1',
        eventName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
        eventType: 'TOURNAMENT',
        targetId: 'hist-torneo-apertura-2026',
        targetTab: 'HISTORY_TAB',
        date: '15/02/2026',
        roundOrStage: 'Semifinal',
        opponentName: 'Mariano Deux (ICEMAN)',
        scoreLegs: '0 - 3',
        isWin: false,
        avg: 64.1
      }
    ]
  },
  {
    id: 'p-5',
    name: 'Carlos Méndez',
    nickname: 'Charly 180 MDQ',
    avatarUrl: '/logos/logo-mdq.png',
    photoUrl: '/images/players/halcon.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    club: 'Darderos Mar del Plata',
    avg: 59.4,
    category: 'AVANZADA',
    matchesWon: 22,
    matchesTotal: 31,
    count180s: 16,
    highestCheckout: 121,
    isVerified: true,
    majorTitle: '1x FINALISTA MDQ 2026',
    walkOnSong: 'SODA STEREO - DE MÚSICA LIGERA',
    dartBrand: 'WINMAU 22G',
    dartWeight: 22,
    bestLeg: 14,
    nationalPoints: 1340,
    nationalRank: 6,
    mdqLeaguePoints: 790,
    mdqLeagueRank: 3,
    presentialPoints: 310,
    presentialRank: 3,
    presentialPodiums: '1x Finalista Presencial',
    tournamentsWonList: [],
    lastTournamentRank: 5,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'NONE',
    recentHistory: [
      {
        id: 'hist-m-cm-1',
        eventName: 'Liga Marplatense 2026 • Darderos MDQ',
        eventType: 'LEAGUE',
        targetId: 'league-local-mdq',
        targetTab: 'LEAGUES_TAB',
        date: '01/02/2026',
        roundOrStage: 'Fecha 6 Local',
        opponentName: 'Mariano Deux (ICEMAN)',
        scoreLegs: '3 - 5',
        isWin: false,
        avg: 60.5
      }
    ]
  },
  {
    id: 'p-6',
    name: 'Rodrigo Morales',
    nickname: 'El Rayo Cuyano',
    avatarUrl: '/logos/dardos-argentina.png',
    photoUrl: '/images/players/tungsteno.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Mendoza',
    city: 'Godoy Cruz',
    club: 'Cuyo Darts',
    avg: 52.1,
    category: 'INTERMEDIA',
    matchesWon: 18,
    matchesTotal: 29,
    count180s: 11,
    highestCheckout: 116,
    isVerified: false,
    majorTitle: '1x CAMPEÓN CUYANO',
    walkOnSong: 'ENANITOS VERDES - LAMENTO',
    dartBrand: 'TARGET 80%',
    dartWeight: 23,
    bestLeg: 16,
    nationalPoints: 1190,
    nationalRank: 7,
    mdqLeaguePoints: 0,
    mdqLeagueRank: 0,
    presentialPoints: 120,
    presentialRank: 8,
    presentialPodiums: 'Ronda 2 Presencial',
    tournamentsWonList: [
      {
        id: 'hist-cuyo-2025',
        name: 'Copa Vendimia Darts 2025',
        year: 2025,
        stage: 'Gran Final'
      }
    ],
    lastTournamentRank: 7,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'NONE',
    recentHistory: []
  },
  {
    id: 'p-7',
    name: 'Joaquín Benítez',
    nickname: 'Tiro Certero',
    avatarUrl: '/logos/dardos-argentina.png',
    photoUrl: '/images/players/iceman.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Neuquén',
    city: 'Neuquén',
    club: 'Patagonia Darts',
    avg: 48.9,
    category: 'INTERMEDIA',
    matchesWon: 15,
    matchesTotal: 26,
    count180s: 8,
    highestCheckout: 108,
    isVerified: false,
    majorTitle: '1x CAMPEÓN PATAGONIA',
    walkOnSong: 'BERSUIT - MI CARAMELO',
    dartBrand: 'TARGET 90%',
    dartWeight: 24,
    bestLeg: 17,
    nationalPoints: 1080,
    nationalRank: 8,
    mdqLeaguePoints: 0,
    mdqLeagueRank: 0,
    presentialPoints: 110,
    presentialRank: 9,
    presentialPodiums: 'Ronda 1 Presencial',
    tournamentsWonList: [],
    lastTournamentRank: 6,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'NONE',
    recentHistory: []
  },
  {
    id: 'p-8',
    name: 'Esteban Navarro',
    nickname: 'Doble 20 Litoral',
    avatarUrl: '/logos/dardos-argentina.png',
    photoUrl: '/images/players/sniper.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Entre Ríos',
    city: 'Paraná',
    club: 'Litoral Darts',
    avg: 43.5,
    category: 'PRINCIPIANTE',
    matchesWon: 11,
    matchesTotal: 22,
    count180s: 5,
    highestCheckout: 96,
    isVerified: false,
    majorTitle: 'PROMESAS DEL LITORAL',
    walkOnSong: 'LOS PALMERAS - SOY SABALERO',
    dartBrand: 'WINMAU 22G',
    dartWeight: 22,
    bestLeg: 18,
    nationalPoints: 990,
    nationalRank: 9,
    mdqLeaguePoints: 0,
    mdqLeagueRank: 0,
    presentialPoints: 90,
    presentialRank: 10,
    presentialPodiums: 'Fase de Grupos',
    tournamentsWonList: [],
    lastTournamentRank: 9,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'NONE',
    recentHistory: []
  },
  {
    id: 'p-9',
    name: 'Mariano Silva',
    nickname: 'Flecha MDQ',
    avatarUrl: '/logos/logo-mdq.png',
    photoUrl: '/images/players/halcon.jpg',
    nationality: 'Argentina',
    countryCode: 'AR',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    club: 'Darderos Mar del Plata',
    avg: 38.2,
    category: 'PRINCIPIANTE',
    matchesWon: 8,
    matchesTotal: 19,
    count180s: 3,
    highestCheckout: 84,
    isVerified: false,
    majorTitle: 'ESCUELA DARDEROS MDQ',
    walkOnSong: 'CALLEJEROS - UNA NUEVA NOCHE',
    dartBrand: 'HARROWS 21G',
    dartWeight: 21,
    bestLeg: 20,
    nationalPoints: 820,
    nationalRank: 10,
    mdqLeaguePoints: 610,
    mdqLeagueRank: 4,
    presentialPoints: 70,
    presentialRank: 11,
    presentialPodiums: 'Ronda Preliminar',
    tournamentsWonList: [],
    lastTournamentRank: 10,
    lastTournamentName: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
    lastTournamentDate: '15/02/2026',
    lastTournamentTrophy: 'NONE',
    recentHistory: []
  }
];

export function findCanonicalPlayer(query: string, nameFallback?: string): UltimateDartsCardData | null {
  if (!query && !nameFallback) return null;
  const q = (query || '').toLowerCase().trim();
  const fallback = (nameFallback || '').toLowerCase().trim();

  // Mapeo directo de IDs especiales de ligas / admin
  if (q === 'user-iceman-admin' || q === 'user-iceman' || q.includes('iceman') || fallback.includes('iceman')) {
    return CANONICAL_PLAYERS[0];
  }
  if (q === 'user-mdq-001' || q.includes('halcon') || q.includes('halcón') || fallback.includes('halcon') || fallback.includes('halcón')) {
    const halcon = CANONICAL_PLAYERS.find(p => p.nickname.toLowerCase().includes('halc') || p.name.toLowerCase().includes('facundo'));
    if (halcon) return halcon;
  }
  if (q === 'rank-1' || q.includes('sniper') || fallback.includes('sniper') || fallback.includes('rossi')) {
    const sniper = CANONICAL_PLAYERS.find(p => p.nickname.toLowerCase().includes('sniper') || p.name.toLowerCase().includes('rossi'));
    if (sniper) return sniper;
  }
  if (q === 'rank-3' || fallback.includes('gómez') || fallback.includes('gomez') || fallback.includes('tungsteno')) {
    const dg = CANONICAL_PLAYERS.find(p => p.name.toLowerCase().includes('gómez') || p.name.toLowerCase().includes('gomez'));
    if (dg) return dg;
  }
  if (q === 'rank-4' || fallback.includes('pereyra') || fallback.includes('córdoba')) {
    const lp = CANONICAL_PLAYERS.find(p => p.name.toLowerCase().includes('pereyra'));
    if (lp) return lp;
  }
  if (q === 'rank-5' || fallback.includes('méndez') || fallback.includes('mendez') || fallback.includes('charly')) {
    const cm = CANONICAL_PLAYERS.find(p => p.name.toLowerCase().includes('méndez') || p.name.toLowerCase().includes('mendez'));
    if (cm) return cm;
  }

  // Búsqueda directa por id, nickname, name o match bidireccional
  const directMatch = CANONICAL_PLAYERS.find(
    (p) =>
      p.id.toLowerCase() === q ||
      p.nickname.toLowerCase() === q ||
      p.name.toLowerCase() === q ||
      p.name.toLowerCase().includes(q) ||
      p.nickname.toLowerCase().includes(q) ||
      q.includes(p.name.toLowerCase()) ||
      q.includes(p.nickname.toLowerCase())
  );
  if (directMatch) return directMatch;

  // Fallback con el nombre
  if (fallback) {
    const fallbackMatch = CANONICAL_PLAYERS.find(
      (p) =>
        p.name.toLowerCase() === fallback ||
        p.nickname.toLowerCase() === fallback ||
        p.name.toLowerCase().includes(fallback) ||
        p.nickname.toLowerCase().includes(fallback) ||
        fallback.includes(p.name.toLowerCase()) ||
        fallback.includes(p.nickname.toLowerCase())
    );
    if (fallbackMatch) return fallbackMatch;
  }

  return null;
}

