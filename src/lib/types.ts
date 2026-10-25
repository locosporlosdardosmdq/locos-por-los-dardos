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

export interface PlayerTournamentWin {
  id: string;
  name: string;
  year: number;
  stage?: string;
}

export type HistoryCompetitionType = 'INDIVIDUAL' | 'STANDALONE_TOURNAMENT' | 'LOCAL_LEAGUE' | 'NATIONAL_LEAGUE' | 'TOURNAMENT' | 'LEAGUE';

export interface PlayerHistoryDateItem {
  id: string;
  eventName: string;
  eventType: HistoryCompetitionType;
  targetId: string;
  targetTab: 'ACTIVE_TAB' | 'HISTORY_TAB' | 'LEAGUES_TAB';
  date: string;
  roundOrStage: string;
  opponentName: string;
  scoreLegs: string;
  isWin: boolean;
  avg: number;
  modality?: 'ONLINE' | 'PRESENCIAL';
  isDoublePoints?: boolean;
  pointsEarned?: number;
  highestCheckout?: number;
  count180s?: number;
}

export interface PlayerProfile {
  id: string;
  email: string;
  nickname: string;
  fullName: string;
  phone?: string;
  province: string;
  city: string;
  nationality?: string;
  countryCode?: string;
  avatarUrl: string;
  photoUrl?: string;
  logoUrl?: string;
  club?: string;
  estimatedAvg: number;
  category: PlayerCategory;
  isVerified?: boolean;
  isProfileComplete?: boolean;
  bio?: string;
  birthDate?: string; // Formato YYYY-MM-DD
  age?: number;
  associationRole?: string; // ej: 'Tesorero • Asociación Mar del Plata'
  majorTitle?: string;
  preferredDartWeight?: number;
  dartBrand?: string;
  role?: 'SUPERADMIN' | 'ADMIN' | 'ORGANIZER' | 'PLAYER';
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  stats: PlayerStats;
  tournamentsWonList?: PlayerTournamentWin[];
  lastTournamentRank?: number;
  lastTournamentName?: string;
  lastTournamentDate?: string;
  lastTournamentTrophy?: 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';
  recentHistory?: PlayerHistoryDateItem[];
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
  teammateNickname?: string;
  isBot?: boolean;
  botAvg?: number;
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
  isOnlineRoom?: boolean;
  onlineRoomCode?: string;
  localPlayerIndex?: 0 | 1;
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

export interface RoundLegsConfig {
  distanceMode?: 'LEGS' | 'SETS';
  legsPerSet?: number;
  quarterFinals?: number;
  semiFinals?: number;
  finals?: number;
  losersRound?: number;
  losersFinals?: number;
  grandFinal?: number;
}

export interface TournamentBracketMatch {
  id: string;
  round: number; // 1, 2, 3...
  matchIndex: number;
  bracketType?: 'WINNERS' | 'LOSERS' | 'FINALS';
  distanceMode?: 'LEGS' | 'SETS';
  legTarget?: number;
  setTarget?: number;
  scoreSetsP1?: number;
  scoreSetsP2?: number;
  player1?: { id: string; name: string; avatarUrl: string; seed?: number; nationality?: string; countryCode?: string };
  player2?: { id: string; name: string; avatarUrl: string; seed?: number; nationality?: string; countryCode?: string };
  scoreP1: number;
  scoreP2: number;
  winnerId?: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  scheduledTime?: string;
  note?: string; // ej: "W.O. (Walkover)", "Abandono", "Manual"
  nextMatchId?: string;
  nextSlot?: 1 | 2;
  loserNextMatchId?: string;
  loserNextSlot?: 1 | 2;
  isBye?: boolean;
}

export interface PodiumPlace {
  id: string;
  name: string;
  avatarUrl?: string;
  scoreDisplay?: string;
}

export interface TournamentPodium {
  first?: PodiumPlace;
  second?: PodiumPlace;
  third?: PodiumPlace;
}

export interface TournamentStats {
  championId?: string;
  championName?: string;
  championAvatar?: string;
  runnerUpId?: string;
  runnerUpName?: string;
  highestAvgPlayer?: string;
  highestAvgScore?: number;
  total180s?: number;
  highestCheckout?: number;
  highestCheckoutPlayer?: string;
  bestLegDarts?: number;
  bestLegPlayer?: string;
  totalMatchesPlayed?: number;
  totalLegsPlayed?: number;
}

export type CompetitionMode = 'STANDALONE_DAY' | 'LOCAL_LEAGUE' | 'NATIONAL_LEAGUE';
export type NationalStageType = 'ONLINE' | 'PRESENCIAL_OFICIAL';
export type LeagueScope = 'LOCAL' | 'NATIONAL';

export interface LeagueStanding {
  playerId: string;
  playerName: string;
  nickname: string;
  avatarUrl?: string;
  club: string;
  city: string;
  province: string;
  points: number;
  playedDates: number;
  tournamentsWon: number;
  podiums: number;
  avg: number;
}

export interface League {
  id: string;
  slug: string;
  name: string;
  scope: LeagueScope;
  description: string;
  season: string;
  organizerClub: string;
  city?: string;
  province?: string;
  isOfficialNational?: boolean;
  doublePointsOnPresential?: boolean;
  activeTournamentsCount: number;
  standings: LeagueStanding[];
  creatorId?: string;
  creatorName?: string;
  status?: 'REGISTRATION' | 'ACTIVE' | 'FINISHED';
  coAdminIds?: string[];
  createdAt: string;
}

export interface Tournament {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: TournamentType;
  format: TournamentFormat;
  competitionMode?: CompetitionMode;
  leagueId?: string;
  leagueName?: string;
  nationalStageType?: NationalStageType;
  pointsMultiplier?: number;
  startingScore: number;
  outMode: OutMode;
  bestOfLegs: number;
  roundLegsConfig?: RoundLegsConfig;
  groupsCount?: number;
  playersPerGroup?: number;
  qualifiersPerGroup?: number;
  doubleRoundRobin?: boolean;
  tiebreakerDifference?: boolean;
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
  isPaid?: boolean;
  hasCashPrizes?: boolean;
  isDoubles?: boolean;
  prizesBreakdown?: {
    first: number;
    second: number;
    third: number;
  };
  organizer: string;
  creatorId?: string;
  creatorName?: string;
  coAdminIds?: string[];
  matches?: TournamentBracketMatch[];
  stats?: TournamentStats;
  podium?: TournamentPodium;
  enrolledPlayers?: Array<{
    id: string;
    name: string;
    nickname?: string;
    avatarUrl?: string;
    seed?: number;
    nationality?: string;
    countryCode?: string;
    avg?: number;
    hasWebcam?: boolean;
    isBye?: boolean;
    enrolledAt?: string;
  }>;
  groupStageData?: any;
}

export type AssociationScope = 'MDQ' | 'ARGENTINA';

export interface AssociationAuthority {
  id: string;
  scope: AssociationScope;
  playerId?: string;
  name: string;
  nickname?: string;
  roleTitle: string; // ej: 'Presidente', 'Vicepresidente', 'Secretario General', 'Tesorero', 'Director de Torneos', etc.
  photoUrl: string;
  avatarUrl?: string;
  club?: string;
  city?: string;
  province?: string;
  bio?: string;
  orderIndex: number;
  tier?: number;
  phoneWhatsApp?: string;
  email?: string;
}

export interface AssociationBankAccount {
  bankName: string;
  accountType: string; // 'Cuenta Corriente', 'Caja de Ahorro', 'Mercado Pago'
  holderName: string;
  cuitCuil: string;
  alias: string;
  cbuCvu: string;
  adminWhatsAppPhone: string; // ej: '5492235551234'
  adminWhatsAppName: string; // ej: 'Mariano Deux (ICEMAN)'
  notes?: string;
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

// Configuración de Vitrinas Dinámicas de la Landing Page
export interface LandingShowcaseSettings {
  heroTournament: {
    enabled: boolean;
    tagBadge: string;
    subBadge: string;
    title: string;
    highlightCity: string;
    year: string;
    description: string;
    date: string;
    venue: string;
    prizePool: string;
    registeredCount: number;
    maxParticipants: number;
    googleFormUrl: string;
    autoSyncGoogleForm: boolean;
    lastSyncedAt?: string;
    tournamentId?: string;
    galleryImages?: string[];
    registrationMode?: 'IN_APP' | 'GOOGLE_FORM' | 'HYBRID';
    ctaButtonText: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    bannerDesktopUrl?: string;
    bannerMobileUrl?: string;
  };
  communitySection: {
    enabled: boolean;
    tag: string;
    title: string;
    highlightText: string;
    description: string;
    backgroundImageUrl: string;
    overlayOpacity: number; // 10..90 %
    provincesCount: number;
    tournamentsCount: string;
    playersCount: string;
    record180sText: string;
    pilars: Array<{ title: string; desc: string }>;
  };
  affiliatedClubs: Array<{
    id: string;
    name: string;
    city: string;
    province: string;
    address: string;
    boardsCount: number;
    logoUrl: string;
    isCentral?: boolean;
    status: 'ACTIVO' | 'EN_AFILIACION';
    description: string;
  }>;
}

// Registro Unificado para el Gran Torneo Oficial (PDC Qualifier Standard & Logística Sociedad de Fomento)
export type AttendanceDays = 'SATURDAY_ONLY' | 'SUNDAY_ONLY' | 'BOTH_DAYS';

export interface GrandTournamentRegistration {
  id: string;
  tournamentId?: string;
  tournamentTitle?: string;
  registeredAt: string;
  // Identificación Oficial y PDC
  fullName: string;
  nickname: string;
  dniOrPassport: string;
  nationality: string;
  countryCode: string; // ej 'AR', 'UY', 'BR', 'CL', etc.
  city: string;
  province: string;
  club: string;
  email: string;
  phoneWhatsApp: string;
  // Logística Sociedad de Fomento Nueva Pompeya
  attendanceDays: AttendanceDays; // 'SATURDAY_ONLY' | 'SUNDAY_ONLY' | 'BOTH_DAYS'
  companionsCount: number; // Acompañantes que concurrirán a la Sociedad de Fomento
  dinnerComensalesCount: number; // Comensales para la cena de bienvenida del sábado
  dietaryRestrictions?: string; // Celíaco, vegetariano, alergias, etc.
  notes?: string;
  // Competencias oficiales del domingo
  competeSingles?: boolean; // Torneo 501 Individual Oficial
  competeDoubles?: boolean; // Torneo 501 Parejas Oficial
  doublesPartnerMode?: 'BLIND_DRAW' | 'DEFINED_PARTNER'; // Sorteo a ciegas vs dupla definida
  doublesPartnerName?: string; // Nombre/Apodo de la pareja si está definida
  // Estado y pago
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'EXEMPT';
  paymentMethod?: string;
}

