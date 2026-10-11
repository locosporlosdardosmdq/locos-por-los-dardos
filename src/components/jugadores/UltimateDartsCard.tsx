'use client';

import React from 'react';
import Link from 'next/link';
import { Target, ArrowUpRight } from 'lucide-react';

export type HistoryCompetitionType = 'INDIVIDUAL' | 'STANDALONE_TOURNAMENT' | 'LOCAL_LEAGUE' | 'NATIONAL_LEAGUE' | 'TOURNAMENT' | 'LEAGUE';

export interface RecentHistoryItem {
  id: string;
  eventType: HistoryCompetitionType;
  eventName: string;
  targetId: string;
  targetTab: string;
  date: string;
  opponentName: string;
  isWin: boolean;
  scoreLegs: string;
  avg: number;
  roundOrStage?: string;
  modality?: 'ONLINE' | 'PRESENCIAL';
  isDoublePoints?: boolean;
  pointsEarned?: number;
  highestCheckout?: number;
  count180s?: number;
}

export interface UltimateDartsCardData {
  id: string;
  name: string;
  nickname: string;
  avatarUrl?: string;
  photoUrl?: string;
  nationality?: string;
  countryCode?: string;
  province: string;
  city: string;
  club: string;
  avg: number;
  category: 'ELITE' | 'AVANZADA' | 'INTERMEDIA' | 'PRINCIPIANTE';
  matchesWon: number;
  matchesTotal: number;
  count180s: number;
  highestCheckout: number;
  isVerified?: boolean;
  majorTitle?: string;
  walkOnSong?: string;
  dartBrand?: string;
  dartWeight?: number;
  bestLeg?: number;
  nationalPoints?: number;
  nationalRank?: number;
  mdqLeaguePoints?: number;
  mdqLeagueRank?: number;
  presentialPoints?: number;
  presentialRank?: number;
  presentialPodiums?: string;
  lastTournamentRank?: number;
  lastTournamentName?: string;
  lastTournamentDate?: string;
  lastTournamentTrophy?: 'GOLD' | 'SILVER' | 'BRONZE' | 'NONE';
  tournamentsWonList?: Array<{ id?: string; name: string; year: number; stage?: string }>;
  recentHistory?: RecentHistoryItem[];
}

export type RankingMode = 'AVG' | 'LIGA_ARG' | 'LIGA_MDQ' | 'PRESENCIAL_MDQ';

interface UltimateDartsCardProps {
  player: UltimateDartsCardData;
  showActions?: boolean;
  rankingMode?: RankingMode;
  displayRank?: number;
}

const TIER_THEMES = {
  ELITE: {
    borderColor: '#ffe600', // Oro brillante auténtico Luke Littler
    borderGlow: 'rgba(255, 230, 0, 0.45)',
    accentColor: '#ffe600',
    subColor: '#fef08a',
    bgDark: '#090214',
    bgMid: '#1e0a38',
    bgLight: '#3d1b6e',
    swirlColor: '#7c3aed',
    labelColor: '#e9d5ff',
    badgeText: 'ELITE PRO'
  },
  AVANZADA: {
    borderColor: '#ef4444', // Rojo Diana Oficial
    borderGlow: 'rgba(239, 68, 68, 0.45)',
    accentColor: '#ef4444',
    subColor: '#fca5a5',
    bgDark: '#0d0204',
    bgMid: '#28050b',
    bgLight: '#4d0d18',
    swirlColor: '#b91c1c',
    labelColor: '#fecaca',
    badgeText: 'AVANZADA'
  },
  INTERMEDIA: {
    borderColor: '#38bdf8', // Azul Eléctrico
    borderGlow: 'rgba(56, 189, 248, 0.45)',
    accentColor: '#38bdf8',
    subColor: '#bae6fd',
    bgDark: '#020914',
    bgMid: '#061733',
    bgLight: '#0d3266',
    swirlColor: '#0284c7',
    labelColor: '#bfdbfe',
    badgeText: 'INTERMEDIA'
  },
  PRINCIPIANTE: {
    borderColor: '#00e676', // Verde Diana Oficial
    borderGlow: 'rgba(0, 230, 118, 0.45)',
    accentColor: '#00e676',
    subColor: '#86efac',
    bgDark: '#010d07',
    bgMid: '#052414',
    bgLight: '#0d4828',
    swirlColor: '#16a34a',
    labelColor: '#bbf7d0',
    badgeText: 'PRINCIPIANTE'
  }
};

/**
 * Renderiza la bandera nacional oficial en formato vectorial SVG
 */
const renderSvgFlag = (countryCode: string = 'AR') => {
  const code = countryCode.toUpperCase();

  if (code === 'AR' || code === 'ARGENTINA') {
    return (
      <g>
        {/* Bandera Argentina: Celeste, Blanco, Celeste + Sol de Mayo */}
        <rect x="0" y="0" width="46" height="28" rx="2" fill="#75AADB" />
        <rect x="0" y="9.33" width="46" height="9.33" fill="#FFFFFF" />
        <circle cx="23" cy="14" r="3.6" fill="#F6B40E" />
        <circle cx="23" cy="14" r="1.8" fill="#85340A" opacity="0.4" />
      </g>
    );
  }

  if (code === 'GB' || code === 'EN' || code === 'UK' || code === 'INGLATERRA') {
    return (
      <g>
        {/* Cruz de San Jorge (Inglaterra - Luke Littler style) */}
        <rect x="0" y="0" width="46" height="28" rx="2" fill="#FFFFFF" />
        <rect x="19" y="0" width="8" height="28" fill="#CE1124" />
        <rect x="0" y="10" width="46" height="8" fill="#CE1124" />
      </g>
    );
  }

  if (code === 'ES' || code === 'ESPAÑA') {
    return (
      <g>
        {/* Bandera de España */}
        <rect x="0" y="0" width="46" height="28" rx="2" fill="#AA151B" />
        <rect x="0" y="7" width="46" height="14" fill="#F1BF00" />
      </g>
    );
  }

  if (code === 'UY' || code === 'URUGUAY') {
    return (
      <g>
        {/* Bandera de Uruguay */}
        <rect x="0" y="0" width="46" height="28" rx="2" fill="#FFFFFF" />
        <rect x="0" y="0" width="46" height="3.5" fill="#0038A8" />
        <rect x="0" y="7" width="46" height="3.5" fill="#0038A8" />
        <rect x="0" y="14" width="46" height="3.5" fill="#0038A8" />
        <rect x="0" y="21" width="46" height="3.5" fill="#0038A8" />
        <rect x="0" y="0" width="16" height="14" fill="#FFFFFF" />
        <circle cx="8" cy="7" r="3" fill="#F6B40E" />
      </g>
    );
  }

  // Fallback: bandera argentina por defecto
  return (
    <g>
      <rect x="0" y="0" width="46" height="28" rx="2" fill="#75AADB" />
      <rect x="0" y="9.33" width="46" height="9.33" fill="#FFFFFF" />
      <circle cx="23" cy="14" r="3.6" fill="#F6B40E" />
    </g>
  );
};

/**
 * Determina la última mejor actuación del jugador:
 * Prioriza la Liga (Nacional o Local), y si no tiene datos de liga, de un torneo.
 * Si estuvo entre los primeros 6 (Top 6), se hace mención explícita a ese puesto.
 */
function getPlayerPerformance(player: UltimateDartsCardData) {
  const natRank = (player.nationalRank && player.nationalRank > 0) ? player.nationalRank : null;
  const mdqRank = (player.mdqLeagueRank && player.mdqLeagueRank > 0) ? player.mdqLeagueRank : null;

  let bestLeagueRank: number | null = null;
  let bestLeagueName = '';
  let leagueScopeLabel = 'LIGA NACIONAL';

  if (natRank && (!mdqRank || natRank <= mdqRank)) {
    bestLeagueRank = natRank;
    bestLeagueName = 'LIGA NACIONAL OFICIAL 2026';
    leagueScopeLabel = 'NACIONAL';
  } else if (mdqRank) {
    bestLeagueRank = mdqRank;
    bestLeagueName = 'LIGA MARPLATENSE 2026';
    leagueScopeLabel = 'DARDEROS MDQ';
  }

  // CASO 1: TIENE DATOS EN LIGA
  if (bestLeagueRank !== null) {
    const isTop6 = bestLeagueRank <= 6;
    let rankLabel = `PUESTO #${bestLeagueRank}`;
    if (bestLeagueRank === 1) rankLabel = 'CAMPEÓN';
    else if (bestLeagueRank === 2) rankLabel = 'SUBCAMPEÓN';
    else if (bestLeagueRank === 3) rankLabel = '3ER PUESTO';
    else if (bestLeagueRank === 4) rankLabel = '4TO PUESTO';
    else if (bestLeagueRank === 5) rankLabel = '5TO PUESTO';
    else if (bestLeagueRank === 6) rankLabel = '6TO PUESTO';

    const trophyIcon = bestLeagueRank === 1 ? '🏆' : bestLeagueRank === 2 ? '🥈' : bestLeagueRank === 3 ? '🥉' : '⭐';

    return {
      number: `#${bestLeagueRank}`,
      rank: bestLeagueRank,
      rankLabel,
      trophyIcon,
      cornerLine1: 'LIGA',
      cornerLine2: leagueScopeLabel,
      competitionName: bestLeagueName,
      badgeTitle: isTop6 ? `${trophyIcon} #${bestLeagueRank} ${rankLabel}` : `PUESTO #${bestLeagueRank}`,
      badgeSubtitle: bestLeagueName,
      isTop6,
      source: 'LEAGUE'
    };
  }

  // CASO 2: NO TIENE DATOS EN LIGA -> TOMA DATOS DE UN TORNEO
  const tourneyRank = (player.lastTournamentRank && player.lastTournamentRank > 0) 
    ? player.lastTournamentRank 
    : (player.presentialRank && player.presentialRank > 0 ? player.presentialRank : null);

  const rawTourneyName = player.lastTournamentName 
    || (player.presentialPodiums ? 'GRAN OPEN MAR DEL PLATA 2026' : 'COPA COSTA ATLÁNTICA 2026');
  const tourneyName = rawTourneyName.split('•')[0].trim().toUpperCase();

  if (tourneyRank !== null) {
    const isTop6 = tourneyRank <= 6;
    let rankLabel = `PUESTO #${tourneyRank}`;
    if (tourneyRank === 1) rankLabel = 'CAMPEÓN';
    else if (tourneyRank === 2) rankLabel = 'SUBCAMPEÓN';
    else if (tourneyRank === 3) rankLabel = '3ER PUESTO';
    else if (tourneyRank === 4) rankLabel = '4TO PUESTO';
    else if (tourneyRank === 5) rankLabel = '5TO PUESTO';
    else if (tourneyRank === 6) rankLabel = '6TO PUESTO';

    const trophyIcon = tourneyRank === 1 ? '🏆' : tourneyRank === 2 ? '🥈' : tourneyRank === 3 ? '🥉' : '⭐';

    return {
      number: `#${tourneyRank}`,
      rank: tourneyRank,
      rankLabel,
      trophyIcon,
      cornerLine1: 'TORNEO',
      cornerLine2: 'OFICIAL',
      competitionName: tourneyName,
      badgeTitle: isTop6 ? `${trophyIcon} #${tourneyRank} ${rankLabel}` : `PUESTO #${tourneyRank}`,
      badgeSubtitle: tourneyName,
      isTop6,
      source: 'TOURNAMENT'
    };
  }

  // CASO 3: CIRCUITO FEDERADO GENERAL
  return {
    number: '#1',
    rank: 1,
    rankLabel: 'CAMPEÓN',
    trophyIcon: '🏆',
    cornerLine1: 'CIRCUITO',
    cornerLine2: 'FEDERADO',
    competitionName: 'CIRCUITO NACIONAL 2026',
    badgeTitle: '🏆 #1 CAMPEÓN OFICIAL',
    badgeSubtitle: 'CIRCUITO NACIONAL 2026',
    isTop6: true,
    source: 'CIRCUIT'
  };
}

/**
 * Formatea el nombre para la carta oficial:
 * 1. Remueve apodos entre paréntesis (...), corchetes [...] o comillas "...", '...', «...»
 * 2. Si el jugador carga dos nombres y el apellido (o dos apellidos), usa sólo el primer nombre y apellido.
 *    Ejemplos:
 *    - "Mariano Alberto Deux" -> "Mariano Deux"
 *    - "Juan Carlos Pérez" -> "Juan Pérez"
 *    - "Mariano Deux (ICEMAN)" -> "Mariano Deux"
 *    - "Juan Carlos Gómez López" -> "Juan Gómez"
 *    - "Juan de la Rosa" -> "Juan de la Rosa"
 */
export function formatCardPlayerName(rawName: string): string {
  if (!rawName) return '';
  let clean = rawName
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s*["'«][^"'»]*["'»]/g, '')
    .trim();

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) {
    return clean;
  }

  const particles = ['de', 'del', 'la', 'las', 'los', 'san', 'santa', 'van', 'von', 'da', 'di'];

  // Caso 3 partes (ej: "Juan Carlos Pérez" o "Juan de la Rosa")
  if (parts.length === 3) {
    if (particles.includes(parts[1].toLowerCase())) {
      return clean;
    }
    return `${parts[0]} ${parts[2]}`;
  }

  // Caso 4 o más partes
  if (particles.includes(parts[1].toLowerCase())) {
    return parts.slice(0, 4).join(' ');
  }

  if (particles.includes(parts[2].toLowerCase())) {
    return `${parts[0]} ${parts.slice(2).join(' ')}`;
  }

  // 2 nombres y 2 apellidos (ej: "Juan Carlos Pérez Gómez") -> primer nombre y primer apellido
  return `${parts[0]} ${parts[2]}`;
}


export const UltimateDartsCard: React.FC<UltimateDartsCardProps> = ({
  player,
  showActions = true,
  rankingMode,
  displayRank
}) => {
  const theme = TIER_THEMES[player.category] || TIER_THEMES.ELITE;
  const cardId = `card-${player.id}`;
  const clipId = `fut-clip-${player.id}`;
  const bgGradId = `bg-grad-${player.id}`;
  const fadeGradId = `fade-grad-${player.id}`;

  // Geometría del escudo de Luke Littler / Ultimate Darts (viewBox: 0 0 340 540)
  const outerPath = "M 34,44 C 70,14 125,18 152,32 C 160,36 180,36 188,32 C 215,18 270,14 306,44 C 324,56 328,70 328,95 L 328,255 L 310,270 L 328,285 L 328,435 C 328,458 314,476 295,488 L 170,536 L 45,488 C 26,476 12,458 12,435 L 12,285 L 30,270 L 12,255 L 12,95 C 12,70 16,56 34,44 Z";
  const innerPath = "M 39,49 C 72,21 123,25 151,37 C 160,41 180,41 189,37 C 217,25 268,21 301,49 C 317,60 321,74 321,97 L 321,254 L 306,270 L 321,286 L 321,431 C 321,451 309,467 292,478 L 170,523 L 48,478 C 31,467 19,451 19,431 L 19,286 L 34,270 L 19,254 L 19,97 C 19,74 23,60 39,49 Z";

  const bestPerformance = getPlayerPerformance(player);
  const formattedName = formatCardPlayerName(player.name).toUpperCase();

  // Parseo del título o badge según el criterio de ranking seleccionado o última mejor actuación
  let titleNumber = bestPerformance.number;
  let titleText = bestPerformance.cornerLine1;
  let subtitleText = bestPerformance.cornerLine2;

  if (rankingMode === 'AVG') {
    titleNumber = `#${displayRank || 1}`;
    titleText = `${player.avg.toFixed(1)} AVG`;
    subtitleText = 'APP 501';
  } else if (rankingMode === 'LIGA_ARG') {
    titleNumber = `#${player.nationalRank || displayRank || 1}`;
    titleText = 'LIGA';
    subtitleText = 'ARGENTINA';
  } else if (rankingMode === 'LIGA_MDQ') {
    titleNumber = player.mdqLeagueRank ? `#${player.mdqLeagueRank}` : 'MDQ';
    titleText = 'LIGA';
    subtitleText = 'DARDEROS';
  } else if (rankingMode === 'PRESENCIAL_MDQ') {
    titleNumber = `#${player.presentialRank || displayRank || 1}`;
    titleText = 'TORNEO';
    subtitleText = 'PRESENCIAL';
  }

  return (
    <div className="flex flex-col items-center group select-none w-full max-w-[290px]">
      {/* Contenedor SVG Escalable Vectorial Completo */}
      <div 
        className="w-full aspect-[340/545] transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02]"
        style={{
          filter: `drop-shadow(0 15px 25px rgba(0,0,0,0.85)) drop-shadow(0 0 18px ${theme.borderGlow})`
        }}
      >
        <svg 
          viewBox="0 0 340 545" 
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Clip Path que recorta exactamente el interior del escudo */}
            <clipPath id={clipId}>
              <path d={innerPath} />
            </clipPath>

            {/* Gradiente de fondo líquido / mármol */}
            <radialGradient id={bgGradId} cx="65%" cy="30%" r="75%">
              <stop offset="0%" stopColor={theme.bgLight} />
              <stop offset="45%" stopColor={theme.bgMid} />
              <stop offset="100%" stopColor={theme.bgDark} />
            </radialGradient>

            {/* Difuminado suave para fundir el torso del jugador con la textura */}
            <linearGradient id={fadeGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.bgDark} stopOpacity="0" />
              <stop offset="60%" stopColor={theme.bgDark} stopOpacity="0.85" />
              <stop offset="100%" stopColor={theme.bgDark} stopOpacity="1" />
            </linearGradient>

            {/* Sombra para textos */}
            <filter id={`text-shadow-${cardId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.95" />
            </filter>
          </defs>

          {/* CONTENIDO INTERNO RECORTADO */}
          <g clipPath={`url(#${clipId})`}>
            {/* Fondo base */}
            <rect x="0" y="0" width="340" height="540" fill={`url(#${bgGradId})`} />

            {/* Texturas orgánicas de humo / mármol (estilo Luke Littler) */}
            <path 
              d="M -20,120 Q 80,40 160,110 T 360,90 L 360,-20 L -20,-20 Z" 
              fill={theme.swirlColor} 
              opacity="0.18" 
            />
            <path 
              d="M -30,220 C 60,180 120,290 220,220 C 280,180 320,260 380,210 L 380,360 C 280,390 180,310 100,380 Z" 
              fill={theme.swirlColor} 
              opacity="0.12" 
            />
            <circle cx="240" cy="120" r="140" fill={theme.swirlColor} opacity="0.22" filter="blur(30px)" />
            <circle cx="80" cy="380" r="120" fill={theme.swirlColor} opacity="0.15" filter="blur(30px)" />

            {/* RETRATO FOTOGRÁFICO DEL JUGADOR (Posicionado a la derecha, pose PDC) */}
            {player.photoUrl ? (
              <g>
                <image 
                  href={player.photoUrl} 
                  x="85" 
                  y="20" 
                  width="240" 
                  height="260" 
                  preserveAspectRatio="xMidYMin slice"
                />
                {/* Degradado inferior para fundir el corte del torso */}
                <rect x="0" y="195" width="340" height="75" fill={`url(#${fadeGradId})`} />
              </g>
            ) : (
              <g>
                <rect x="130" y="55" width="140" height="170" rx="20" fill="#000000" opacity="0.4" />
                <text 
                  x="200" 
                  y="155" 
                  textAnchor="middle" 
                  fill={theme.accentColor} 
                  fontSize="48" 
                  fontWeight="900" 
                  fontFamily="'Impact', 'Arial Black', sans-serif"
                >
                  {player.nickname.slice(0, 2).toUpperCase()}
                </text>
              </g>
            )}

            {/* COLUMNA SUPERIOR IZQUIERDA: LOGRO / PUESTO, BANDERA Y 180S */}
            <g transform="translate(38, 50)">
              {/* Número o Logro Principal (#1, 1x o Ranking) */}
              <text 
                x="0" 
                y="34" 
                fill={theme.accentColor} 
                fontSize={titleNumber.length > 3 ? "32" : "38"} 
                fontWeight="900" 
                fontFamily="'Impact', 'Arial Black', sans-serif"
                letterSpacing="-1"
                filter={`url(#text-shadow-${cardId})`}
              >
                {titleNumber}
              </text>
              
              <text 
                x="0" 
                y="48" 
                fill={theme.accentColor} 
                fontSize="8" 
                fontWeight="800" 
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.4"
              >
                {titleText}
              </text>
              <text 
                x="0" 
                y="59" 
                fill={theme.subColor} 
                fontSize="7" 
                fontWeight="700" 
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.4"
              >
                {subtitleText}
              </text>

              {/* Bandera Nacional Vectorial */}
              <g transform="translate(0, 70)">
                <rect x="-1.5" y="-1.5" width="49" height="31" rx="3" fill="#000000" stroke={theme.borderColor} strokeWidth="1.5" />
                {renderSvgFlag(player.countryCode || player.nationality || 'AR')}
              </g>

              {/* Métrica de 180s en Carrera */}
              <g transform="translate(0, 122)">
                <text 
                  x="0" 
                  y="20" 
                  fill={theme.accentColor} 
                  fontSize="25" 
                  fontWeight="900" 
                  fontFamily="'Impact', 'Arial Black', sans-serif"
                  filter={`url(#text-shadow-${cardId})`}
                >
                  {player.count180s}
                </text>
                <text 
                  x="28" 
                  y="11" 
                  fill={theme.subColor} 
                  fontSize="7.5" 
                  fontWeight="800" 
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  TOTAL
                </text>
                <text 
                  x="28" 
                  y="20" 
                  fill="#ffffff" 
                  fontSize="7.5" 
                  fontWeight="800" 
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  180s
                </text>
              </g>
            </g>

            {/* FRANJA CENTRAL: NOMBRE DEL JUGADOR (Dorado / Impact con autoajuste de ancho) */}
            <g transform="translate(170, 252)">
              <text 
                x="0" 
                y="0" 
                textAnchor="middle" 
                fill={theme.accentColor} 
                fontSize={
                  formattedName.length > 20 ? 15 :
                  formattedName.length > 17 ? 17 :
                  formattedName.length > 14 ? 19 :
                  formattedName.length > 11 ? 21 : 23
                } 
                fontWeight="900" 
                fontFamily="'Impact', 'Arial Black', sans-serif"
                letterSpacing={formattedName.length > 16 ? "0.3" : formattedName.length > 12 ? "0.8" : "1.2"}
                textLength={formattedName.length > 15 ? "225" : undefined}
                lengthAdjust={formattedName.length > 15 ? "spacingAndGlyphs" : undefined}
                filter={`url(#text-shadow-${cardId})`}
              >
                {formattedName}
              </text>
              
              {/* CÁPSULA ESPACIOSA DE ÚLTIMA COMPETENCIA DISPUTADA (Prioridad Liga o Torneo, Top 6 destacado) */}
              <g transform="translate(0, 9)">
                <rect 
                  x="-135" 
                  y="0" 
                  width="270" 
                  height="32" 
                  rx="7" 
                  fill="#050811" 
                  fillOpacity="0.95" 
                  stroke={theme.borderColor} 
                  strokeWidth="1.2"
                />
                
                {/* Renglón 1: Puesto y Trofeo (Top 6 explícito) */}
                <text 
                  x="0" 
                  y="14" 
                  textAnchor="middle" 
                  fill={bestPerformance.isTop6 ? theme.accentColor : '#ffffff'} 
                  fontSize="9.5" 
                  fontWeight="900" 
                  fontFamily="system-ui, -apple-system, sans-serif"
                  letterSpacing="0.6"
                >
                  {bestPerformance.badgeTitle}
                </text>

                {/* Renglón 2: Nombre de la competición disputada */}
                <text 
                  x="0" 
                  y="26" 
                  textAnchor="middle" 
                  fill={theme.subColor} 
                  fontSize="7.5" 
                  fontWeight="800" 
                  fontFamily="system-ui, -apple-system, sans-serif"
                  letterSpacing="0.5"
                >
                  {bestPerformance.badgeSubtitle}
                </text>
              </g>
            </g>

            {/* SEPARADOR HORIZONTAL DORADO */}
            <line 
              x1="45" 
              y1="302" 
              x2="295" 
              y2="302" 
              stroke={theme.borderColor} 
              strokeWidth="1.5" 
              opacity="0.85" 
            />

            {/* SEPARADOR VERTICAL ENTRE LAS 2 COLUMNAS */}
            <line 
              x1="170" 
              y1="310" 
              x2="170" 
              y2="442" 
              stroke={theme.borderColor} 
              strokeWidth="1.5" 
              opacity="0.85" 
            />

            {/* GRILLA DE ATRIBUTOS (2 COLUMNAS IDÉNTICAS A LUKE LITTLER) */}
            {/* Fila 1: HOME TOWN | DARTS */}
            <g transform="translate(0, 324)">
              {/* Columna Izquierda */}
              <text x="105" y="0" textAnchor="middle" fill={theme.labelColor} fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">
                HOME TOWN
              </text>
              <text x="105" y="16" textAnchor="middle" fill="#ffffff" fontSize="12.5" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                {player.city.toUpperCase()}
              </text>

              {/* Columna Derecha */}
              <text x="235" y="0" textAnchor="middle" fill={theme.labelColor} fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">
                DARTS
              </text>
              <text x="235" y="16" textAnchor="middle" fill={theme.accentColor} fontSize="12.5" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                {player.dartBrand ? player.dartBrand.toUpperCase() : 'TARGET 90%'}
              </text>
            </g>

            {/* Fila 2: NICKNAME | WEIGHT */}
            <g transform="translate(0, 368)">
              {/* Columna Izquierda */}
              <text x="105" y="0" textAnchor="middle" fill={theme.labelColor} fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">
                NICKNAME
              </text>
              <text x="105" y="16" textAnchor="middle" fill={theme.accentColor} fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                {player.nickname.toUpperCase()}
              </text>

              {/* Columna Derecha */}
              <text x="235" y="0" textAnchor="middle" fill={theme.labelColor} fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">
                WEIGHT
              </text>
              <text x="235" y="16" textAnchor="middle" fill="#ffffff" fontSize="12.5" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                {player.dartWeight ? `${player.dartWeight} grams` : '24 grams'}
              </text>
            </g>

            {/* Fila 3: PROMEDIO 501 | MAYOR CIERRE */}
            <g transform="translate(0, 412)">
              {/* Columna Izquierda */}
              <text x="105" y="0" textAnchor="middle" fill={theme.labelColor} fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">
                PROMEDIO 501
              </text>
              <text x="105" y="16" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="'Impact', 'Arial Black', sans-serif" letterSpacing="0.5">
                {player.avg.toFixed(1)} AVG
              </text>

              {/* Columna Derecha */}
              <text x="235" y="0" textAnchor="middle" fill={theme.labelColor} fontSize="8.5" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.8">
                MAYOR CIERRE
              </text>
              <text x="235" y="16" textAnchor="middle" fill={theme.accentColor} fontSize="13" fontWeight="900" fontFamily="'Impact', 'Arial Black', sans-serif" letterSpacing="0.5">
                {player.highestCheckout} PTS
              </text>
            </g>

            {/* ESCUDO DE MARCA EN LA PUNTA INFERIOR: ULTIMATE DARTS */}
            <g transform="translate(170, 468)">
              {/* Escudito / Placa dorada */}
              <path 
                d="M -24,-14 L 24,-14 L 28,4 L 0,18 L -28,4 Z" 
                fill="#000000" 
                stroke={theme.borderColor} 
                strokeWidth="1.2" 
                opacity="0.95" 
              />
              <text 
                x="0" 
                y="-3" 
                textAnchor="middle" 
                fill={theme.accentColor} 
                fontSize="6.5" 
                fontWeight="900" 
                letterSpacing="1.2"
                fontFamily="system-ui, sans-serif"
              >
                ULTIMATE
              </text>
              <text 
                x="0" 
                y="5" 
                textAnchor="middle" 
                fill={theme.accentColor} 
                fontSize="6.5" 
                fontWeight="900" 
                letterSpacing="1.2"
                fontFamily="system-ui, sans-serif"
              >
                DARTS
              </text>
              <text 
                x="0" 
                y="13" 
                textAnchor="middle" 
                fill="#cbd5e1" 
                fontSize="4.8" 
                fontWeight="700" 
                letterSpacing="0.5"
                fontFamily="system-ui, sans-serif"
              >
                DARDEROS MDQ
              </text>
            </g>
          </g>

          {/* BORDES DORADOS Y MUESCAS LATERALES (SUPERPUESTOS AL FRENTE) */}
          {/* Borde Exterior Grueso */}
          <path 
            d={outerPath} 
            stroke={theme.borderColor} 
            strokeWidth="6" 
            strokeLinejoin="round"
            fill="none"
          />

          {/* Borde Interior Fino */}
          <path 
            d={innerPath} 
            stroke={theme.borderColor} 
            strokeWidth="1.6" 
            strokeLinejoin="round"
            fill="none"
            opacity="0.95"
          />

          {/* Muescas / Flechas triangulares amarillas en laterales medios */}
          <polygon points="328,255 310,270 328,285" fill={theme.borderColor} />
          <polygon points="12,255 30,270 12,285" fill={theme.borderColor} />
        </svg>
      </div>

      {/* BOTONES DE ACCIÓN PARA LA PLATAFORMA DE JUEGO */}
      {showActions && (
        <div className="w-full max-w-[300px] flex items-center gap-2 mt-3 z-30">
          <Link
            href="/anotador"
            className="flex-1 py-2 px-3 rounded-xl font-black text-xs text-center uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95"
            style={{
              backgroundColor: '#00e676',
              color: '#07090e'
            }}
          >
            <Target className="w-4 h-4 stroke-[2.5]" />
            <span>Desafiar</span>
          </Link>

          <Link
            href="/perfil"
            className="py-2 px-4 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1 active:scale-95"
          >
            <span>Ficha</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
