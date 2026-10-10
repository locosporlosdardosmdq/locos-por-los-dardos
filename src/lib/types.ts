export type PlayerCategory = 'PRINCIPIANTE' | 'INTERMEDIA' | 'AVANZADA' | 'ELITE';

export interface PlayerStats {
  overallAvg: number;
  first9Avg: number;
  matchesPlayed: number;
  matchesWon: number;
  legsPlayed: number;
  legsWon: number;
  highestCheckout: number;
  checkoutAttempts: number;
  checkoutHits: number;
  checkoutPercentage: number;
  count180s: number;
  count140Plus: number;
  count100Plus: number;
  count60Plus: number;
  bestLegDarts: number;
}

export interface PlayerProfile {
  id: string;
  email: string;
  nickname: string;
  fullName: string;
  phone?: string;
  province: string;
  city: string;
  avatarUrl: string;
  estimatedAvg: number;
  category: PlayerCategory;
  isVerified?: boolean;
  bio?: string;
  preferredDartWeight?: number;
  stats: PlayerStats;
  createdAt?: string;
}

export type GameType = 'X01' | 'CRICKET' | 'ROUND_THE_CLOCK' | 'HALVE_IT';
export type CricketMode = 'DEFAULT' | 'CUT_THROAT' | 'NO_SCORE';
export type OutMode = 'SINGLE_OUT' | 'DOUBLE_OUT' | 'MASTER_OUT';
export type InputFormat = 'SCORE' | 'DART_BY_DART';
export type DistanceType = 'LEGS' | 'SETS';
export type CpuDifficulty = 'BEGINNER' | 'MEDIUM' | 'ADVANCED' | 'PRO';

export interface ParticipantPlayer {
  id: string;
  name: string;
  nickname?: string;
  avatarUrl?: string;
  teammateId?: string;
  teammateName?: string;
  isBot?: boolean;
}

export interface MatchConfig {
  gameType: GameType;
  cricketMode?: CricketMode;
  startingScore: 170 | 301 | 501 | 701;
  outMode: OutMode;
  inputFormat: InputFormat;
  distanceType: DistanceType;
  bestOfSets: number;
  bestOfLegs: number;
  doubleIn: boolean;
  twoClearLegs: boolean;
  isDoubles: boolean;
  isVsCpu: boolean;
  cpuDifficulty: CpuDifficulty;
  player1: ParticipantPlayer;
  player2: ParticipantPlayer;
  // Campos retrocompatibles y contexto de competición
  player1Name?: string;
  player2Name?: string;
  tournamentTitle?: string;
}

export interface DartThrow {
  multiplier: 0 | 1 | 2 | 3; // 0=Miss, 1=Single, 2=Double, 3=Treble
  sector: number; // 0..20, 25 (bull), 50 (double bull)
  score: number; // sector * multiplier
  label: string; // "T20", "D16", "S5", "BULL", "MISS"
}

export interface VisitLog {
  id: string;
  playerIndex: number;
  roundNumber: number;
  darts: DartThrow[];
  score: number;
  isBust: boolean;
  isCheckout: boolean;
  remainingScoreBefore: number;
  remainingScoreAfter: number;
}

export interface CricketMarkState {
  [sector: string]: number; // sector '15','16','17','18','19','20','25' -> count 0..3
}

export type TournamentType = 'PRESENCIAL' | 'ONLINE';
export type TournamentFormat = 'SINGLE_ELIMINATION' | 'ROUND_ROBIN' | 'DOUBLE_ELIMINATION' | 'HYBRID';
export type TournamentStatus = 'UPCOMING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface TournamentBracketMatch {
  id: string;
  round: number; // 1, 2, 3...
  matchIndex: number;
  player1?: { id: string; name: string; avatarUrl: string; seed?: number };
  player2?: { id: string; name: string; avatarUrl: string; seed?: number };
  scoreP1: number;
  scoreP2: number;
  winnerId?: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  scheduledTime?: string;
}

export interface Tournament {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: TournamentType;
  format: TournamentFormat;
  startingScore: number;
  outMode: OutMode;
  bestOfLegs: number;
  maxParticipants: number;
  registeredCount: number;
  venueName: string;
  city: string;
  province: string;
  startDate: string;
  endDate?: string;
  status: TournamentStatus;
  bannerImageUrl: string;
  entryFeeArs: number;
  prizePoolArs: number;
  organizer: string;
  matches?: TournamentBracketMatch[];
}

export type ProductCategory = 'DARDOS' | 'PLUMAS' | 'CANAS' | 'CARTUCHERAS' | 'DIANAS' | 'ACCESORIOS';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  priceArs: number;
  originalPriceArs?: number;
  stock: number;
  description: string;
  weightGrams?: number;
  material?: string;
  imageUrl: string;
  isFeatured: boolean;
  rating?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
