import { PlayerCategory, Tournament, Product, PlayerProfile, League, AssociationAuthority, AssociationBankAccount } from './types';

export const PROVINCIAS_ARGENTINA = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires (CABA)',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

export const ARGENTINE_PROVINCES = PROVINCIAS_ARGENTINA;

export function calculateCategory(avg: number): PlayerCategory {
  if (avg >= 70) return 'ELITE';
  if (avg >= 55) return 'AVANZADA';
  if (avg >= 40) return 'INTERMEDIA';
  return 'PRINCIPIANTE';
}

/**
 * Calcula la edad exacta de un jugador a partir de su fecha de nacimiento (YYYY-MM-DD)
 * Evita problemas de desfase horario separando año, mes y día de forma determinista.
 */
export function calculateAgeFromBirthDate(birthDateStr: string | null | undefined): number | undefined {
  if (!birthDateStr) return undefined;
  const clean = birthDateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length < 3) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }
  return (age >= 0 && age <= 120) ? age : undefined;
}

export const CATEGORY_DETAILS: Record<PlayerCategory, { label: string; minAvg: number; color: string; badgeClass: string; desc: string }> = {
  PRINCIPIANTE: {
    label: 'Principiante',
    minAvg: 0,
    color: '#94a3b8',
    badgeClass: 'bg-slate-700/50 text-slate-300 border-slate-600',
    desc: 'Jugadores en formación y recreativos (< 40.0 AVG)'
  },
  INTERMEDIA: {
    label: 'Intermedia',
    minAvg: 40,
    color: '#1d68ed',
    badgeClass: 'bg-board-blue/20 text-blue-400 border-board-blue/40',
    desc: 'Consolidación de técnica y cierres regulares (40.0 - 54.9 AVG)'
  },
  AVANZADA: {
    label: 'Avanzada',
    minAvg: 55,
    color: '#e52521',
    badgeClass: 'bg-board-red/20 text-red-400 border-board-red/40',
    desc: 'Alta consistencia competitiva y dobles seguros (55.0 - 69.9 AVG)'
  },
  ELITE: {
    label: 'Elite Pro',
    minAvg: 70,
    color: '#00b853',
    badgeClass: 'bg-board-green/20 text-board-green border-board-green/40',
    desc: 'Máximo nivel nacional y aspiración internacional (70.0+ AVG)'
  }
};

export const PLAYER_CATEGORIES = CATEGORY_DETAILS;

// Tabla de Cierres Oficial X01 (Exacta a la tabla reglamentaria de 2 a 170)
export const OFFICIAL_CHECKOUT_TABLE: Record<number, string> = {
  170: 'T20 T20 D/BULL',
  169: 'SIN OPCIÓN',
  168: 'SIN OPCIÓN',
  167: 'T20 T19 D/BULL',
  166: 'SIN OPCIÓN',
  165: 'SIN OPCIÓN',
  164: 'T20 T18 D/BULL',
  163: 'SIN OPCIÓN',
  162: 'SIN OPCIÓN',
  161: 'T20 T17 D/BULL',
  160: 'T20 T20 D20',
  159: 'SIN OPCIÓN',
  158: 'T20 T20 D19',
  157: 'T20 T19 D20',
  156: 'T20 T20 D18',
  155: 'T20 T19 D19',
  154: 'T20 T18 D20',
  153: 'T20 T19 D18',
  152: 'T20 T20 D16',
  151: 'T20 T17 D20',
  150: 'T20 T18 D18',
  149: 'T20 T19 D16',
  148: 'T20 T16 D20',
  147: 'T20 T17 D18',
  146: 'T20 T18 D16',
  145: 'T20 T15 D20',
  144: 'T20 T20 D12',
  143: 'T20 T17 D6',
  142: 'T20 T14 D20',
  141: 'T20 T19 D12',
  140: 'T20 T16 D16',
  139: 'T19 T14 D20',
  138: 'T20 T18 D12',
  137: 'T19 T16 D16',
  136: 'T20 T20 D8',
  135: 'T20 T17 D12',
  134: 'T20 T14 D16',
  133: 'T20 T19 D8',
  132: 'T20 T16 D12',
  131: 'T20 T13 D16',
  130: 'T20 T20 D5',
  129: 'T19 T16 D12',
  128: 'T18 T14 D16',
  127: 'T20 T17 D8',
  126: 'T19 T19 D6',
  125: 'BULL T20 D20',
  124: 'T20 T16 D8',
  123: 'T19 T16 D9',
  122: 'T18 T20 D4',
  121: 'T17 T10 D20',
  120: 'T20 20 D20',
  119: 'T19 T10 D16',
  118: 'T20 18 D20',
  117: 'T20 17 D20',
  116: 'T20 16 D20',
  115: 'T20 15 D20',
  114: 'T20 14 D20',
  113: 'T20 13 D20',
  112: 'T20 12 D20',
  111: 'T20 19 D16',
  110: 'T20 18 D16',
  109: 'T19 20 D16',
  108: 'T20 16 D16',
  107: 'T19 18 D16',
  106: 'T20 14 D16',
  105: 'T19 16 D16',
  104: 'T18 18 D16',
  103: 'T20 3 D20',
  102: 'T20 10 D16',
  101: 'T20 1 D20',
  100: 'T20 D20',
  99: 'T19 10 D16',
  98: 'T20 D19',
  97: 'T19 D20',
  96: 'T20 D18',
  95: 'T19 D19',
  94: 'T18 D20',
  93: 'T19 D18',
  92: 'T20 D16',
  91: 'T17 D20',
  90: 'T20 D15',
  89: 'T19 D16',
  88: 'T16 D20',
  87: 'T17 D18',
  86: 'T18 D16',
  85: 'T15 D20',
  84: 'T20 D12',
  83: 'T17 D16',
  82: 'T14 D20',
  81: 'T19 D12',
  80: 'T20 D10',
  79: 'T19 D11',
  78: 'T18 D12',
  77: 'T19 D10',
  76: 'T20 D8',
  75: 'T17 D12',
  74: 'T14 D16',
  73: 'T19 D8',
  72: 'T16 D12',
  71: 'T13 D16',
  70: 'T10 D20',
  69: 'T15 D12',
  68: 'T20 D4',
  67: 'T17 D8',
  66: 'T10 D18',
  65: 'T19 D4',
  64: 'T16 D8',
  63: 'T13 D12',
  62: 'T10 D16',
  61: 'T15 D8',
  60: '20 D20',
  59: '19 D20',
  58: '18 D20',
  57: '17 D20',
  56: '16 D20',
  55: '15 D20',
  54: '14 D20',
  53: '13 D20',
  52: '12 D20',
  51: '11 D20',
  50: 'D/BULL',
  49: '9 D20',
  48: '16 D16',
  47: '15 D16',
  46: '14 D16',
  45: '13 D16',
  44: '12 D16',
  43: '11 D16',
  42: '10 D16',
  41: '9 D16',
  40: 'D20',
  39: '7 D16',
  38: 'D19',
  37: '5 D16',
  36: 'D18',
  35: '3 D16',
  34: 'D17',
  33: '1 D16',
  32: 'D16',
  31: '7 D12',
  30: 'D15',
  29: '5 D12',
  28: 'D14',
  27: '3 D12',
  26: 'D13',
  25: '9 D8',
  24: 'D12',
  23: '7 D8',
  22: 'D11',
  21: '5 D8',
  20: 'D10',
  19: '3 D8',
  18: 'D9',
  17: '1 D8',
  16: 'D8',
  15: '7 D4',
  14: 'D7',
  13: '5 D4',
  12: 'D6',
  11: '3 D4',
  10: 'D5',
  9: '1 D4',
  8: 'D4',
  7: '3 D2',
  6: 'D3',
  5: '1 D2',
  4: 'D2',
  3: '1 D1',
  2: 'D1'
};

export const CHECKOUT_GUIDE: Record<number, string> = OFFICIAL_CHECKOUT_TABLE;

export function getSuggestedCheckout(remaining: number): string | null {
  if (remaining < 2 || remaining > 170) return null;
  return OFFICIAL_CHECKOUT_TABLE[remaining] || null;
}


// Lista de Países y Banderas Oficiales
export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿' }
];

export function getCountryFlag(countryOrCode?: string): string {
  if (!countryOrCode) return '🇦🇷';
  const clean = countryOrCode.trim().toLowerCase();
  const found = COUNTRIES.find(
    (c) => c.name.toLowerCase() === clean || c.code.toLowerCase() === clean
  );
  return found ? found.flag : '🇦🇷';
}

// Lista oficial de Administradores Full de la Plataforma
export const ADMIN_EMAILS: string[] = [
  'marianodeux@gmail.com'
];

// Clave de seguridad administrativa para proteger el acceso a ICEMAN
export const ADMIN_MASTER_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PIN || 'ICEMAN2026!';

export function validateAdminCredentials(email: string, pass: string): boolean {
  const isEmailValid = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.trim().toLowerCase());
  const isPassValid = pass.trim() === ADMIN_MASTER_PASSWORD;
  return isEmailValid && isPassValid;
}

// Comprueba si un usuario tiene rol de SUPERADMIN (acceso a /superadmin y control total de servidores/sistema)
export function isUserSuperAdmin(emailOrUser?: string | PlayerProfile | null): boolean {
  if (!emailOrUser) return false;
  if (typeof emailOrUser === 'string') {
    return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === emailOrUser.trim().toLowerCase());
  }
  if (emailOrUser.email && ADMIN_EMAILS.some((adm) => adm.toLowerCase() === emailOrUser.email.trim().toLowerCase())) {
    return true;
  }
  return emailOrUser.role === 'SUPERADMIN';
}

// Comprueba si un usuario tiene permisos de Administración de Torneos, Ligas y Llaves (SUPERADMIN o ADMIN)
export function canUserManageTournaments(emailOrUser?: string | PlayerProfile | null): boolean {
  if (!emailOrUser) return false;
  if (isUserSuperAdmin(emailOrUser)) return true;
  if (typeof emailOrUser !== 'string' && (emailOrUser.role === 'ADMIN' || emailOrUser.role === 'ORGANIZER')) {
    return true;
  }
  return false;
}

// Mantener compatibilidad con llamadas existentes a isUserAdmin (superadmins y administradores de torneos)
export function isUserAdmin(emailOrUser?: string | PlayerProfile | null): boolean {
  return canUserManageTournaments(emailOrUser);
}

// Lista de torneos: Inicialmente limpia sin torneos mock no deseados
export const MOCK_TOURNAMENTS: Tournament[] = [];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-winmau-blade6',
    name: 'Diana Winmau Blade 6 Triple Core Carbon',
    slug: 'diana-winmau-blade-6-triple-core',
    brand: 'Winmau',
    category: 'DIANAS',
    priceArs: 245000,
    originalPriceArs: 275000,
    stock: 6,
    description: 'La diana oficial de la WDF y PDC. Cerda sisal de África Oriental premium, alambre ultrafino Density Control y núcleo de fibra de carbono para máxima retención sin rebotes.',
    material: 'Sisal Africano Premium & Carbono',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    isFeatured: true,
    rating: 4.9
  },
  {
    id: 'prod-target-luke-littler',
    name: 'Dardos Target Luke Littler G1 90% Tungsten 22g',
    slug: 'dardos-target-luke-littler-g1-22g',
    brand: 'Target Darts',
    category: 'DARDOS',
    priceArs: 185000,
    stock: 12,
    description: 'Edición oficial del fenómeno mundial Luke "The Nuke" Littler. Barril con micro-grip cónico en 90% tungsteno suizo, puntas Swiss Point intercambiables y cañas Pro Grip.',
    weightGrams: 22.0,
    material: '90% Tungsteno Suizo',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
    isFeatured: true,
    rating: 5.0
  },
  {
    id: 'prod-red-dragon-snakebite',
    name: 'Dardos Red Dragon Peter Wright Snakebite Mamba 24g',
    slug: 'dardos-red-dragon-snakebite-mamba-24g',
    brand: 'Red Dragon',
    category: 'DARDOS',
    priceArs: 168000,
    originalPriceArs: 189000,
    stock: 8,
    description: 'Diseñados por el campeón mundial Peter Wright. Grip ultra agresivo fresado en triple eje con recubrimiento verde iónico y balance central optimizado.',
    weightGrams: 24.0,
    material: '90% Tungsteno',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    isFeatured: true,
    rating: 4.8
  },
  {
    id: 'prod-harrows-supergrip-carbon',
    name: 'Pack x3 Cañas Harrows Supergrip Carbon Medium',
    slug: 'pack-canas-harrows-supergrip-carbon',
    brand: 'Harrows',
    category: 'CANAS',
    priceArs: 14500,
    stock: 35,
    description: 'Compuesto de carbono reforzado de ultra alta densidad que previene roturas en caídas. Anillo de ajuste machined que fija las plumas de manera inamovible.',
    material: 'Carbon Composite',
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&auto=format&fit=crop&q=80',
    isFeatured: false,
    rating: 4.7
  },
  {
    id: 'prod-target-k-flex',
    name: 'Sistema Integrado Pluma/Caña Target K-Flex No.6 26mm',
    slug: 'plumas-canas-target-k-flex',
    brand: 'Target Darts',
    category: 'PLUMAS',
    priceArs: 28000,
    stock: 24,
    description: 'Innovación revolucionaria todo-en-uno que mantiene siempre un ángulo perfecto de 90°. Extremadamente ligeras y con durabilidad 5x superior a plumas tradicionales.',
    material: 'Polímero Especial Flexible',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    isFeatured: true,
    rating: 4.9
  },
  {
    id: 'prod-case-takoma-xl',
    name: 'Estuche Cartuchera Rígida Target Takoma XL',
    slug: 'estuche-target-takoma-xl',
    brand: 'Target Darts',
    category: 'CARTUCHERAS',
    priceArs: 48000,
    stock: 14,
    description: 'Cartuchera de armadura EVA de alta resistencia con capacidad para 2 sets de dardos armados completos, bolsillos con cierre para cañas, repuestos y billetera.',
    material: 'EVA Rígida Termomoldeada',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    isFeatured: false,
    rating: 4.8
  }
];

export const USER_ICEMAN: PlayerProfile = {
  id: 'user-iceman-admin',
  email: 'marianodeux@gmail.com',
  nickname: 'ICEMAN',
  fullName: 'Mariano Deux (ICEMAN)',
  phone: '+54 9 223 521-8765',
  nationality: 'Argentina',
  countryCode: 'AR',
  province: 'Buenos Aires',
  city: 'Mar del Plata',
  avatarUrl: '/images/iceman-perfil.png',
  photoUrl: '/images/iceman-perfil.png',
  logoUrl: '/logos/logo-iceman.png',
  estimatedAvg: 48.0,
  category: 'INTERMEDIA',
  isVerified: true,
  isProfileComplete: true,
  role: 'SUPERADMIN',
  birthDate: '1982-05-15',
  age: 44,
  bio: 'Presidente y Administrador Oficial • Asociación de Dardos Mar del Plata & Dardos Argentina.',
  preferredDartWeight: 24.0,
  dartBrand: 'TARGET 90%',
  stats: {
    overallAvg: 48.0,
    first9Avg: 48.0,
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
  }
};

export const DEFAULT_NEW_PLAYER: PlayerProfile = {
  id: 'player-new-guest',
  email: '',
  nickname: '',
  fullName: '',
  phone: '',
  nationality: 'Argentina',
  countryCode: 'AR',
  province: 'Buenos Aires',
  city: 'Mar del Plata',
  avatarUrl: '',
  photoUrl: '',
  estimatedAvg: 40.0,
  category: 'PRINCIPIANTE',
  isVerified: false,
  isProfileComplete: false,
  role: 'PLAYER',
  bio: '',
  preferredDartWeight: 24.0,
  dartBrand: 'TARGET 90%',
  stats: {
    overallAvg: 0,
    first9Avg: 0,
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
  }
};

// Por defecto para nuevos visitantes es un perfil pendiente de completar
export const MOCK_CURRENT_USER: PlayerProfile = DEFAULT_NEW_PLAYER;

export const MOCK_RANKINGS: PlayerProfile[] = [
  USER_ICEMAN
];

// Ligas Oficiales de Dardos (Nacional y Locales)
export const DEFAULT_LEAGUES: League[] = [
  {
    id: 'league-national-argentina',
    slug: 'liga-nacional-oficial-argentina',
    name: 'Liga Nacional Oficial de Dardos Argentina 2026',
    scope: 'NATIONAL',
    description: 'Circuito federal con fechas presenciales puntuables x2 y clasificación internacional PDC.',
    season: '2026',
    organizerClub: 'Locos por los Dardos Argentina',
    isOfficialNational: true,
    doublePointsOnPresential: true,
    activeTournamentsCount: 2,
    standings: [],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'league-mdq-2026',
    slug: 'liga-marplatense-dardos-2026',
    name: 'Liga Marplatense de Dardos 2026',
    scope: 'LOCAL',
    description: 'Circuito local oficial con sede en la Sociedad de Fomento Nueva Pompeya.',
    season: '2026',
    organizerClub: 'Darderos Mar del Plata',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    isOfficialNational: false,
    doublePointsOnPresential: true,
    activeTournamentsCount: 2,
    standings: [],
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// JERARQUÍA OFICIAL DE ORGANIGRAMA DIRECTIVO
export type AuthorityTier = 'PRESIDENCIA' | 'MESA_DIRECTIVA' | 'SECRETARIAS' | 'VOCALES';

export function getAuthorityHierarchyWeight(roleTitle: string): number {
  const clean = (roleTitle || '').trim().toLowerCase();
  
  // Nivel 1: Presidencia (peso 100 - 199)
  if (clean.includes('presidente') && !clean.includes('vice')) {
    return 100;
  }
  
  // Nivel 2: Mesa Directiva Ejecutiva (peso 200 - 299)
  if (clean.includes('vicepresidente') || clean.includes('vice presidente') || clean.includes('vice-presidente')) {
    return 200;
  }
  if (clean.includes('secretario general') || clean.includes('secretaria general')) {
    return 210;
  }
  if (clean.includes('tesorero') || clean.includes('tesorera') || clean.includes('finanzas')) {
    return 220;
  }
  if (clean.includes('prosecretario') || clean.includes('protesorero') || clean.includes('pro-tesorero')) {
    return 230;
  }
  
  // Nivel 3: Secretarías y Direcciones Operativas (peso 300 - 399)
  if (clean.includes('tecnolog') || clean.includes('sistema')) {
    return 300;
  }
  if (clean.includes('prensa') || clean.includes('difusión') || clean.includes('difusion') || clean.includes('comunicaci')) {
    return 310;
  }
  if (clean.includes('torneo') || clean.includes('competici') || clean.includes('deportiv') || clean.includes('arbitr')) {
    return 320;
  }
  if (clean.includes('secretari') || clean.includes('director') || clean.includes('coordinad')) {
    return 350;
  }
  
  // Nivel 4: Cuerpo de Vocales & Logística (peso 400 - 499)
  if (clean.includes('vocal titular') && !clean.includes('área') && !clean.includes('area') && !clean.includes('responsable')) {
    return 400;
  }
  if (clean.includes('vocal')) {
    return 410;
  }
  if (clean.includes('revisor') || clean.includes('fiscal')) {
    return 450;
  }
  
  return 490;
}

export function getAuthorityTierInfo(roleTitle: string): {
  tierNumber: 1 | 2 | 3 | 4;
  tierId: AuthorityTier;
  tierTitle: string;
  tierBadgeColor: string;
  tierDescription: string;
} {
  const weight = getAuthorityHierarchyWeight(roleTitle);
  if (weight < 200) {
    return {
      tierNumber: 1,
      tierId: 'PRESIDENCIA',
      tierTitle: 'Presidencia Institucional',
      tierBadgeColor: 'from-amber-500 to-amber-600 text-black',
      tierDescription: 'Máxima autoridad ejecutiva y representación institucional de la Asociación.'
    };
  }
  if (weight < 300) {
    return {
      tierNumber: 2,
      tierId: 'MESA_DIRECTIVA',
      tierTitle: 'Mesa Directiva Ejecutiva',
      tierBadgeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      tierDescription: 'Gobierno de gestión, tesorería, secretaría y administración patrimonial.'
    };
  }
  if (weight < 400) {
    return {
      tierNumber: 3,
      tierId: 'SECRETARIAS',
      tierTitle: 'Secretarías & Direcciones Operativas',
      tierBadgeColor: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
      tierDescription: 'Direcciones técnicas, infraestructura tecnológica, prensa y difusión.'
    };
  }
  return {
    tierNumber: 4,
    tierId: 'VOCALES',
    tierTitle: 'Cuerpo de Vocales & Logística de Pista',
    tierBadgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    tierDescription: 'Fiscalización, logística de equipamiento y comisiones de apoyo deportivo.'
  };
}

// AUTORIDADES OFICIALES DE LA ASOCIACIÓN
export const DEFAULT_ASSOCIATION_AUTHORITIES: AssociationAuthority[] = [
  // ASOCIACIÓN MARPLATENSE DE DARDOS (DARDEROS MDQ) - ESTRUCTURA ORGANIGRAMA
  {
    id: 'auth-mdq-1',
    scope: 'MDQ',
    playerId: 'user-zeus-mdq',
    name: 'Gabriel Rubio',
    nickname: 'ZEUS',
    roleTitle: 'Presidente',
    email: 'airesrvice@gmail.com',
    phoneWhatsApp: '+542236959902',
    photoUrl: '/logos/logo-mdq.png',
    avatarUrl: '/logos/logo-mdq.png',
    club: 'Darderos Mar del Plata Oficial',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    bio: 'Presidente de la Asociación Marplatense de Dardos. Liderazgo institucional y federativo.',
    orderIndex: 1
  },
  {
    id: 'auth-mdq-2',
    scope: 'MDQ',
    playerId: 'user-carpo-mdq',
    name: 'Victor Albaitero',
    nickname: 'CARPO',
    roleTitle: 'Vicepresidente',
    photoUrl: '/logos/logo-mdq.png',
    avatarUrl: '/logos/logo-mdq.png',
    club: 'Darderos Mar del Plata',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    bio: 'Vicepresidente de Darderos Mar del Plata. Coordinación directiva y deportiva.',
    orderIndex: 2
  },
  {
    id: 'auth-mdq-3',
    scope: 'MDQ',
    playerId: 'user-iceman-admin',
    name: 'Mariano Deux',
    nickname: 'ICEMAN',
    roleTitle: 'Tesorero',
    photoUrl: '/images/iceman-perfil.png',
    avatarUrl: '/images/iceman-perfil.png',
    club: 'Darderos Mar del Plata',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    bio: 'Fundador de Darderos Mar del Plata y Locos por los Dardos. Tesorería y administración de finanzas.',
    orderIndex: 3,
    phoneWhatsApp: '5492235218765',
    email: 'marianodeux@gmail.com'
  },
  {
    id: 'auth-mdq-4',
    scope: 'MDQ',
    playerId: 'user-cashier-mdq',
    name: 'Héctor Valentín Giménez',
    nickname: 'THE CASHIER',
    roleTitle: 'Vocal Titular',
    photoUrl: '/logos/logo-mdq.png',
    avatarUrl: '/logos/logo-mdq.png',
    club: 'Darderos Mar del Plata',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    bio: 'Vocal titular de la Comisión Directiva. Fiscalización y apoyo en torneos oficiales.',
    orderIndex: 4
  },

  // ASOCIACIÓN / FEDERACIÓN DARDOS ARGENTINA
  {
    id: 'auth-arg-1',
    scope: 'ARGENTINA',
    playerId: 'user-iceman-admin',
    name: 'Mariano Deux',
    nickname: 'ICEMAN',
    roleTitle: 'Presidente Nacional',
    photoUrl: '/images/iceman-perfil.png',
    avatarUrl: '/images/iceman-perfil.png',
    club: 'Darderos Mar del Plata',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    bio: 'Coordinador del Circuito Federal Nacional y nexo con certámenes clasificatorios internacionales.',
    orderIndex: 1,
    phoneWhatsApp: '5492235218765',
    email: 'marianodeux@gmail.com'
  }
];

// DATOS BANCARIOS OFICIALES DE LA ASOCIACIÓN PARA INSCRIPCIONES
export const DEFAULT_ASSOCIATION_BANK_ACCOUNT: AssociationBankAccount = {
  bankName: 'Banco Provincia de Buenos Aires',
  accountType: 'Cuenta Corriente Especial',
  holderName: 'Asociación de Dardos Mar del Plata',
  cuitCuil: '30-71849201-4',
  alias: 'DARDOS.MDQ.OFICIAL',
  cbuCvu: '0140323501980054321098',
  adminWhatsAppPhone: '5492235218765',
  adminWhatsAppName: 'Mariano Deux (ICEMAN)',
  notes: 'Enviar comprobante de transferencia por WhatsApp indicando nombre completo y torneo para confirmar el cupo en la llave.'
};


