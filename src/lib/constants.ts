import { PlayerCategory, Tournament, Product, PlayerProfile, League } from './types';

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

export function isUserAdmin(emailOrUser?: string | PlayerProfile | null): boolean {
  if (!emailOrUser) return false;
  const email = typeof emailOrUser === 'string' ? emailOrUser : emailOrUser.email;
  if (!email) return false;
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase());
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
  phone: '+54 9 223 000-0000',
  nationality: 'Argentina',
  countryCode: 'AR',
  province: 'Buenos Aires',
  city: 'Mar del Plata',
  avatarUrl: '/logos/logo-mdq.png',
  estimatedAvg: 75.0,
  category: 'ELITE',
  isVerified: true,
  role: 'ADMIN',
  bio: 'Administrador Full de Torneos y Plataforma Oficial • Locos por los Dardos & Darderos Mar del Plata.',
  preferredDartWeight: 24.0,
  stats: {
    overallAvg: 74.5,
    first9Avg: 82.0,
    matchesPlayed: 120,
    matchesWon: 95,
    legsPlayed: 480,
    legsWon: 340,
    highestCheckout: 170,
    checkoutAttempts: 250,
    checkoutHits: 110,
    checkoutPercentage: 44.0,
    count180s: 58,
    count140Plus: 210,
    count100Plus: 650,
    count60Plus: 1200,
    bestLegDarts: 11
  }
};

export const MOCK_CURRENT_USER: PlayerProfile = USER_ICEMAN;

export const MOCK_RANKINGS: PlayerProfile[] = [
  {
    id: 'rank-1',
    email: 'martin.sniper@darts.ar',
    nickname: 'Sniper CABA',
    fullName: 'Martín Rossi',
    province: 'Ciudad Autónoma de Buenos Aires (CABA)',
    city: 'Palermo',
    avatarUrl: '/logos/dardos-argentina.png',
    estimatedAvg: 78.4,
    category: 'ELITE',
    stats: {
      overallAvg: 79.2,
      first9Avg: 88.5,
      matchesPlayed: 112,
      matchesWon: 91,
      legsPlayed: 450,
      legsWon: 330,
      highestCheckout: 170,
      checkoutAttempts: 310,
      checkoutHits: 135,
      checkoutPercentage: 43.5,
      count180s: 74,
      count140Plus: 260,
      count100Plus: 680,
      count60Plus: 1200,
      bestLegDarts: 11
    }
  },
  {
    id: 'user-mdq-001',
    email: 'facundo.mdq@dardosargentina.com',
    nickname: 'El Halcón MDQ',
    fullName: 'Facundo López',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    avatarUrl: '/logos/logo-mdq.png',
    estimatedAvg: 68.5,
    category: 'AVANZADA',
    stats: {
      overallAvg: 64.8,
      first9Avg: 73.2,
      matchesPlayed: 84,
      matchesWon: 59,
      legsPlayed: 320,
      legsWon: 204,
      highestCheckout: 156,
      checkoutAttempts: 210,
      checkoutHits: 78,
      checkoutPercentage: 37.1,
      count180s: 31,
      count140Plus: 142,
      count100Plus: 420,
      count60Plus: 890,
      bestLegDarts: 14
    }
  },
  {
    id: 'rank-3',
    email: 'diego.tungsteno@darts.ar',
    nickname: 'Tungsteno Rosario',
    fullName: 'Diego Gómez',
    province: 'Santa Fe',
    city: 'Rosario',
    avatarUrl: '/logos/dardos-argentina.png',
    estimatedAvg: 67.0,
    category: 'AVANZADA',
    stats: {
      overallAvg: 66.4,
      first9Avg: 74.0,
      matchesPlayed: 75,
      matchesWon: 48,
      legsPlayed: 290,
      legsWon: 178,
      highestCheckout: 144,
      checkoutAttempts: 195,
      checkoutHits: 68,
      checkoutPercentage: 34.8,
      count180s: 28,
      count140Plus: 118,
      count100Plus: 390,
      count60Plus: 760,
      bestLegDarts: 15
    }
  },
  {
    id: 'rank-4',
    email: 'lucas.bullseye@darts.ar',
    nickname: 'Bullseye Córdoba',
    fullName: 'Lucas Pereyra',
    province: 'Córdoba',
    city: 'Villa Carlos Paz',
    avatarUrl: '/logos/dardos-argentina.png',
    estimatedAvg: 62.8,
    category: 'AVANZADA',
    stats: {
      overallAvg: 63.1,
      first9Avg: 70.4,
      matchesPlayed: 62,
      matchesWon: 39,
      legsPlayed: 240,
      legsWon: 142,
      highestCheckout: 130,
      checkoutAttempts: 170,
      checkoutHits: 56,
      checkoutPercentage: 32.9,
      count180s: 19,
      count140Plus: 98,
      count100Plus: 310,
      count60Plus: 640,
      bestLegDarts: 16
    }
  },
  {
    id: 'rank-5',
    email: 'carlos.mdq@dardosargentina.com',
    nickname: 'Charly 180 MDQ',
    fullName: 'Carlos Méndez',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    avatarUrl: '/logos/logo-mdq.png',
    estimatedAvg: 51.5,
    category: 'INTERMEDIA',
    stats: {
      overallAvg: 52.8,
      first9Avg: 58.2,
      matchesPlayed: 54,
      matchesWon: 30,
      legsPlayed: 210,
      legsWon: 110,
      highestCheckout: 116,
      checkoutAttempts: 150,
      checkoutHits: 41,
      checkoutPercentage: 27.3,
      count180s: 12,
      count140Plus: 64,
      count100Plus: 230,
      count60Plus: 520,
      bestLegDarts: 18
    }
  },
  {
    id: 'rank-6',
    email: 'rodrigo.mendoza@darts.ar',
    nickname: 'El Rayo Cuyano',
    fullName: 'Rodrigo Morales',
    province: 'Mendoza',
    city: 'Godoy Cruz',
    avatarUrl: '/logos/dardos-argentina.png',
    estimatedAvg: 48.0,
    category: 'INTERMEDIA',
    stats: {
      overallAvg: 49.6,
      first9Avg: 54.0,
      matchesPlayed: 44,
      matchesWon: 22,
      legsPlayed: 180,
      legsWon: 88,
      highestCheckout: 104,
      checkoutAttempts: 130,
      checkoutHits: 33,
      checkoutPercentage: 25.3,
      count180s: 7,
      count140Plus: 45,
      count100Plus: 180,
      count60Plus: 440,
      bestLegDarts: 20
    }
  },
  {
    id: 'rank-7',
    email: 'gonzalo.novato@darts.ar',
    nickname: 'Gonza D1',
    fullName: 'Gonzalo Navarro',
    province: 'Buenos Aires',
    city: 'Bahía Blanca',
    avatarUrl: '/logos/dardos-argentina.png',
    estimatedAvg: 36.5,
    category: 'PRINCIPIANTE',
    stats: {
      overallAvg: 37.2,
      first9Avg: 41.0,
      matchesPlayed: 28,
      matchesWon: 11,
      legsPlayed: 110,
      legsWon: 42,
      highestCheckout: 76,
      checkoutAttempts: 95,
      checkoutHits: 19,
      checkoutPercentage: 20.0,
      count180s: 1,
      count140Plus: 15,
      count100Plus: 72,
      count60Plus: 230,
      bestLegDarts: 24
    }
  }
];

// Ligas Oficiales de Dardos (Nacional y Locales)
export const DEFAULT_LEAGUES: League[] = [
  {
    id: 'league-national-argentina',
    slug: 'liga-nacional-argentina-2026',
    name: 'Liga Nacional Oficial de Argentina • Clasificatorio Internacional 2026',
    scope: 'NATIONAL',
    description: 'Única Liga Nacional Oficial de dardos en Argentina. Clasificatoria para los torneos y mundiales internacionales. Modalidad online con fechas oficiales presenciales en Mar del Plata que duplican la puntuación (x2).',
    season: 'Temporada 2026',
    organizerClub: 'Locos por los Dardos & Federación Argentina',
    isOfficialNational: true,
    doublePointsOnPresential: true,
    activeTournamentsCount: 4,
    createdAt: '2026-01-15T00:00:00.000Z',
    standings: [
      {
        playerId: 'user-iceman-admin',
        playerName: 'Mariano Deux (ICEMAN)',
        nickname: 'ICEMAN',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 1850,
        playedDates: 4,
        tournamentsWon: 2,
        podiums: 3,
        avg: 75.0
      },
      {
        playerId: 'user-mdq-001',
        playerName: 'Facundo López',
        nickname: 'El Halcón MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 1780,
        playedDates: 4,
        tournamentsWon: 1,
        podiums: 3,
        avg: 74.8
      },
      {
        playerId: 'rank-1',
        playerName: 'Martín Rossi',
        nickname: 'Sniper CABA',
        avatarUrl: '/logos/dardos-argentina.png',
        club: 'Dardos Capital',
        city: 'Buenos Aires',
        province: 'CABA',
        points: 1690,
        playedDates: 4,
        tournamentsWon: 1,
        podiums: 2,
        avg: 71.2
      },
      {
        playerId: 'rank-3',
        playerName: 'Diego Gómez',
        nickname: 'Tungsteno Rosario',
        avatarUrl: '/logos/dardos-argentina.png',
        club: 'Rosario Darts Club',
        city: 'Rosario',
        province: 'Santa Fe',
        points: 1520,
        playedDates: 4,
        tournamentsWon: 0,
        podiums: 2,
        avg: 66.5
      },
      {
        playerId: 'rank-4',
        playerName: 'Lucas Pereyra',
        nickname: 'Bullseye Córdoba',
        avatarUrl: '/logos/dardos-argentina.png',
        club: 'Córdoba Dardos Asoc.',
        city: 'Córdoba Capital',
        province: 'Córdoba',
        points: 1410,
        playedDates: 4,
        tournamentsWon: 0,
        podiums: 1,
        avg: 63.8
      },
      {
        playerId: 'rank-5',
        playerName: 'Carlos Méndez',
        nickname: 'Charly 180 MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 1340,
        playedDates: 4,
        tournamentsWon: 0,
        podiums: 1,
        avg: 59.4
      },
      {
        playerId: 'rank-6',
        playerName: 'Rodrigo Morales',
        nickname: 'El Rayo Cuyano',
        avatarUrl: '/logos/dardos-argentina.png',
        club: 'Cuyo Darts',
        city: 'Godoy Cruz',
        province: 'Mendoza',
        points: 1190,
        playedDates: 3,
        tournamentsWon: 0,
        podiums: 0,
        avg: 52.1
      },
      {
        playerId: 'p-7',
        playerName: 'Joaquín Benítez',
        nickname: 'Tiro Certero',
        avatarUrl: '/logos/dardos-argentina.png',
        club: 'Patagonia Darts',
        city: 'Neuquén',
        province: 'Neuquén',
        points: 1080,
        playedDates: 3,
        tournamentsWon: 0,
        podiums: 0,
        avg: 48.9
      },
      {
        playerId: 'p-8',
        playerName: 'Esteban Navarro',
        nickname: 'Doble 20 Litoral',
        avatarUrl: '/logos/dardos-argentina.png',
        club: 'Litoral Darts',
        city: 'Paraná',
        province: 'Entre Ríos',
        points: 990,
        playedDates: 3,
        tournamentsWon: 0,
        podiums: 0,
        avg: 43.5
      },
      {
        playerId: 'p-9',
        playerName: 'Mariano Silva',
        nickname: 'Flecha MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 820,
        playedDates: 3,
        tournamentsWon: 0,
        podiums: 0,
        avg: 38.2
      }
    ]
  },
  {
    id: 'league-local-mdq',
    slug: 'liga-marplatense-2026',
    name: 'Liga Marplatense 2026 • Darderos Mar del Plata',
    scope: 'LOCAL',
    description: 'Campeonato oficial regular de la ciudad de Mar del Plata. Disputado fecha a fecha en la sede oficial de Darderos Mar del Plata.',
    season: 'Temporada 2026',
    organizerClub: 'Darderos Mar del Plata (Sede Oficial)',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    isOfficialNational: false,
    doublePointsOnPresential: false,
    activeTournamentsCount: 6,
    createdAt: '2026-01-20T00:00:00.000Z',
    standings: [
      {
        playerId: 'user-iceman-admin',
        playerName: 'Mariano Deux (ICEMAN)',
        nickname: 'ICEMAN',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 980,
        playedDates: 6,
        tournamentsWon: 4,
        podiums: 5,
        avg: 75.0
      },
      {
        playerId: 'user-mdq-001',
        playerName: 'Facundo López',
        nickname: 'El Halcón MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 940,
        playedDates: 6,
        tournamentsWon: 2,
        podiums: 5,
        avg: 74.8
      },
      {
        playerId: 'rank-5',
        playerName: 'Carlos Méndez',
        nickname: 'Charly 180 MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 790,
        playedDates: 6,
        tournamentsWon: 0,
        podiums: 3,
        avg: 59.4
      },
      {
        playerId: 'p-9',
        playerName: 'Mariano Silva',
        nickname: 'Flecha MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 610,
        playedDates: 5,
        tournamentsWon: 0,
        podiums: 1,
        avg: 38.2
      }
    ]
  },
  {
    id: 'league-national-2025',
    slug: 'liga-nacional-argentina-2025',
    name: 'Liga Nacional Oficial de Argentina 2025',
    scope: 'NATIONAL',
    description: 'Edición oficial 2025 del circuito nacional federado de la Asociación de Dardos Argentina.',
    season: 'Temporada 2025',
    organizerClub: 'Locos por los Dardos & Federación Argentina',
    isOfficialNational: true,
    doublePointsOnPresential: true,
    activeTournamentsCount: 8,
    createdAt: '2025-01-15T00:00:00.000Z',
    standings: [
      {
        playerId: 'user-iceman-admin',
        playerName: 'Mariano Deux (ICEMAN)',
        nickname: 'ICEMAN',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 2100,
        playedDates: 8,
        tournamentsWon: 5,
        podiums: 7,
        avg: 76.2
      },
      {
        playerId: 'user-mdq-001',
        playerName: 'Facundo López',
        nickname: 'El Halcón MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 1950,
        playedDates: 8,
        tournamentsWon: 2,
        podiums: 6,
        avg: 74.0
      },
      {
        playerId: 'rank-1',
        playerName: 'Martín Rossi',
        nickname: 'Sniper CABA',
        avatarUrl: '/logos/dardos-argentina.png',
        club: 'Dardos Capital',
        city: 'Buenos Aires',
        province: 'CABA',
        points: 1820,
        playedDates: 8,
        tournamentsWon: 1,
        podiums: 5,
        avg: 72.5
      }
    ]
  },
  {
    id: 'league-mdq-2025',
    slug: 'liga-marplatense-2025',
    name: 'Liga Marplatense 2025 • Darderos Mar del Plata',
    scope: 'LOCAL',
    description: 'Torneo regular anual 2025 disputado en la sede oficial de Darderos Mar del Plata.',
    season: 'Temporada 2025',
    organizerClub: 'Darderos Mar del Plata',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    isOfficialNational: false,
    doublePointsOnPresential: false,
    activeTournamentsCount: 6,
    createdAt: '2025-02-01T00:00:00.000Z',
    standings: [
      {
        playerId: 'user-iceman-admin',
        playerName: 'Mariano Deux (ICEMAN)',
        nickname: 'ICEMAN',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 1150,
        playedDates: 6,
        tournamentsWon: 4,
        podiums: 5,
        avg: 75.8
      },
      {
        playerId: 'user-mdq-001',
        playerName: 'Facundo López',
        nickname: 'El Halcón MDQ',
        avatarUrl: '/logos/logo-mdq.png',
        club: 'Darderos Mar del Plata',
        city: 'Mar del Plata',
        province: 'Buenos Aires',
        points: 1080,
        playedDates: 6,
        tournamentsWon: 2,
        podiums: 5,
        avg: 75.1
      }
    ]
  }
];


