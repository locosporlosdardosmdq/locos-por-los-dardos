'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Tournament, 
  TournamentFormat, 
  TournamentType, 
  TournamentBracketMatch, 
  MatchConfig,
  TournamentStats,
  PlayerProfile,
  League,
  CompetitionMode,
  NationalStageType
} from '@/lib/types';
import { 
  MOCK_TOURNAMENTS, 
  MOCK_RANKINGS, 
  MOCK_CURRENT_USER, 
  USER_ICEMAN,
  COUNTRIES, 
  DEFAULT_LEAGUES,
  getCountryFlag, 
  isUserAdmin 
} from '@/lib/constants';
import { 
  getCurrentPlayerProfile, 
  getStoredTournaments, 
  saveStoredTournaments,
  getStoredTournamentHistory,
  saveStoredTournamentHistory,
  getStoredLeagues,
  saveStoredLeagues
} from '@/lib/storage';
import { matchBroadcast, BroadcastMatchPayload } from '@/lib/broadcast';
import { findCanonicalPlayer } from '@/lib/players-data';
import { UltimateDartsCardData } from '@/components/jugadores/UltimateDartsCard';
import { PlayerDetailModal } from '@/components/jugadores/PlayerDetailModal';
import { TournamentBracket } from './TournamentBracket';
import { TournamentGroupStage, GroupMatch } from './TournamentGroupStage';
import { MatchDispatcherModal } from './MatchDispatcherModal';
import { PlayerEnrollModal } from './PlayerEnrollModal';
import { WebcamSetupModal } from './WebcamSetupModal';
import { AdminMatchModal } from './AdminMatchModal';
import { CreateLeagueModal } from './CreateLeagueModal';
import { LeagueManager } from './LeagueManager';
import { DartScorer } from '@/components/anotador/DartScorer';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Shuffle, 
  Radio, 
  Globe,
  Shield, 
  Flame, 
  Target, 
  Video, 
  CheckCircle2, 
  ArrowLeft,
  X,
  Tv,
  Calendar,
  History,
  ShieldAlert,
  Trash2,
  Archive,
  Award,
  Zap,
  Clock,
  Eye,
  ChevronRight
} from 'lucide-react';

// Generador de llave eliminatoria oficial de 8 jugadores
function generateDefaultBracket(tournamentId: string): TournamentBracketMatch[] {
  const pList = [
    { id: 'user-iceman-admin', name: 'Mariano Deux (ICEMAN)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
    { id: 'user-mdq-001', name: 'Facundo López (El Halcón)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
    { id: 'rank-1', name: 'Martín Rossi (Sniper CABA)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
    { id: 'rank-3', name: 'Diego Gómez (Tungsteno)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
    { id: 'p-4', name: 'Lucas Pereyra (Bullseye)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
    { id: 'p-5', name: 'Carlos Méndez (Charly 180)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
    { id: 'p-6', name: 'Rodrigo Morales (El Rayo)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
    { id: 'p-7', name: 'Joaquín Benítez (Certero)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' }
  ];

  return [
    // Cuartos de Final (Ronda 1)
    { id: `${tournamentId}-m1`, round: 1, matchIndex: 0, player1: pList[0], player2: pList[1], scoreP1: 0, scoreP2: 0, status: 'SCHEDULED', scheduledTime: '15:00' },
    { id: `${tournamentId}-m2`, round: 1, matchIndex: 1, player1: pList[2], player2: pList[3], scoreP1: 0, scoreP2: 0, status: 'SCHEDULED', scheduledTime: '15:30' },
    { id: `${tournamentId}-m3`, round: 1, matchIndex: 2, player1: pList[4], player2: pList[5], scoreP1: 0, scoreP2: 0, status: 'SCHEDULED', scheduledTime: '16:00' },
    { id: `${tournamentId}-m4`, round: 1, matchIndex: 3, player1: pList[6], player2: pList[7], scoreP1: 0, scoreP2: 0, status: 'SCHEDULED', scheduledTime: '16:30' },
    // Semifinales (Ronda 2)
    { id: `${tournamentId}-m5`, round: 2, matchIndex: 0, scoreP1: 0, scoreP2: 0, status: 'SCHEDULED', scheduledTime: '17:15' },
    { id: `${tournamentId}-m6`, round: 2, matchIndex: 1, scoreP1: 0, scoreP2: 0, status: 'SCHEDULED', scheduledTime: '17:45' },
    // Gran Final (Ronda 3)
    { id: `${tournamentId}-m7`, round: 3, matchIndex: 0, scoreP1: 0, scoreP2: 0, status: 'SCHEDULED', scheduledTime: '18:30' }
  ];
}

// Torneo de muestra histórico precargado para visualizar estadísticas si el usuario lo desea
const SAMPLE_HISTORY_TOURNAMENT: Tournament = {
  id: 'hist-torneo-apertura-2026',
  slug: 'torneo-apertura-verano-2026',
  title: 'Torneo Apertura Verano 2026 • Copa Mar del Plata',
  description: 'Primer torneo oficial del circuito federal de dardos con presencia de los mejores jugadores del país.',
  type: 'PRESENCIAL',
  format: 'SINGLE_ELIMINATION',
  startingScore: 501,
  outMode: 'DOUBLE_OUT',
  bestOfLegs: 5,
  maxParticipants: 16,
  registeredCount: 16,
  venueName: 'Sede Darderos Mar del Plata',
  city: 'Mar del Plata',
  province: 'Buenos Aires',
  startDate: '2026-02-15T15:00:00.000Z',
  endDate: '2026-02-15T21:00:00.000Z',
  status: 'COMPLETED',
  bannerImageUrl: '/logos/logo-mdq.png',
  entryFeeArs: 8000,
  prizePoolArs: 200000,
  organizer: 'Darderos Mar del Plata & Locos por los Dardos',
  stats: {
    championId: 'user-iceman-admin',
    championName: 'Mariano Deux (ICEMAN)',
    championAvatar: '/logos/logo-mdq.png',
    runnerUpId: 'rank-1',
    runnerUpName: 'Martín Rossi (Sniper CABA)',
    highestAvgPlayer: 'Mariano Deux (ICEMAN)',
    highestAvgScore: 79.8,
    total180s: 18,
    highestCheckout: 170,
    highestCheckoutPlayer: 'Mariano Deux (ICEMAN)',
    bestLegDarts: 11,
    bestLegPlayer: 'Martín Rossi',
    totalMatchesPlayed: 7,
    totalLegsPlayed: 29
  },
  matches: [
    {
      id: 'hist-m1', round: 1, matchIndex: 0,
      player1: { id: 'user-iceman-admin', name: 'Mariano Deux (ICEMAN)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
      player2: { id: 'user-mdq-001', name: 'Facundo López (El Halcón)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
      scoreP1: 3, scoreP2: 1, winnerId: 'user-iceman-admin', status: 'FINISHED'
    },
    {
      id: 'hist-m2', round: 1, matchIndex: 1,
      player1: { id: 'p-4', name: 'Lucas Pereyra (Bullseye)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      player2: { id: 'p-5', name: 'Carlos Méndez (Charly)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
      scoreP1: 3, scoreP2: 0, winnerId: 'p-4', status: 'FINISHED', note: 'W.O. (Carlos Méndez ausente)'
    },
    {
      id: 'hist-m3', round: 1, matchIndex: 2,
      player1: { id: 'rank-1', name: 'Martín Rossi (Sniper)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      player2: { id: 'rank-3', name: 'Diego Gómez (Tungsteno)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      scoreP1: 3, scoreP2: 2, winnerId: 'rank-1', status: 'FINISHED'
    },
    {
      id: 'hist-m4', round: 1, matchIndex: 3,
      player1: { id: 'p-6', name: 'Rodrigo Morales (El Rayo)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      player2: { id: 'p-7', name: 'Joaquín Benítez (Certero)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      scoreP1: 1, scoreP2: 3, winnerId: 'p-7', status: 'FINISHED'
    },
    // Semifinales
    {
      id: 'hist-m5', round: 2, matchIndex: 0,
      player1: { id: 'user-iceman-admin', name: 'Mariano Deux (ICEMAN)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
      player2: { id: 'p-4', name: 'Lucas Pereyra (Bullseye)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      scoreP1: 3, scoreP2: 0, winnerId: 'user-iceman-admin', status: 'FINISHED'
    },
    {
      id: 'hist-m6', round: 2, matchIndex: 1,
      player1: { id: 'rank-1', name: 'Martín Rossi (Sniper)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      player2: { id: 'p-7', name: 'Joaquín Benítez (Certero)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      scoreP1: 3, scoreP2: 1, winnerId: 'rank-1', status: 'FINISHED'
    },
    // Gran Final
    {
      id: 'hist-m7', round: 3, matchIndex: 0,
      player1: { id: 'user-iceman-admin', name: 'Mariano Deux (ICEMAN)', avatarUrl: '/logos/logo-mdq.png', nationality: 'Argentina', countryCode: 'AR' },
      player2: { id: 'rank-1', name: 'Martín Rossi (Sniper)', avatarUrl: '/logos/dardos-argentina.png', nationality: 'Argentina', countryCode: 'AR' },
      scoreP1: 3, scoreP2: 2, winnerId: 'user-iceman-admin', status: 'FINISHED'
    }
  ]
};

// Torneo Nacional 2026 para el Historial Oficial
const SAMPLE_NATIONAL_TOURNAMENT_2026: Tournament = {
  id: 'hist-open-nacional-2026',
  slug: 'gran-open-nacional-argentina-2026',
  title: 'Gran Open Nacional de Argentina 2026 • Clasificatorio PDC',
  description: 'Fecha oficial del circuito federado nacional clasificatorio a competiciones internacionales de la PDC y WDF.',
  type: 'ONLINE',
  format: 'SINGLE_ELIMINATION',
  competitionMode: 'NATIONAL_LEAGUE',
  leagueId: 'league-national-argentina',
  leagueName: 'Liga Nacional Oficial de Argentina',
  startingScore: 501,
  outMode: 'DOUBLE_OUT',
  bestOfLegs: 7,
  maxParticipants: 16,
  registeredCount: 16,
  venueName: 'Sede Virtual Federal • Arena Dardos Argentina',
  city: 'Buenos Aires',
  province: 'CABA',
  startDate: '2026-03-20T17:00:00.000Z',
  endDate: '2026-03-20T22:30:00.000Z',
  status: 'COMPLETED',
  bannerImageUrl: '/logos/dardos-argentina.png',
  entryFeeArs: 12000,
  prizePoolArs: 350000,
  organizer: 'Federación Argentina de Dardos & Locos por los Dardos',
  stats: {
    championId: 'user-iceman-admin',
    championName: 'Mariano Deux (ICEMAN)',
    championAvatar: '/logos/logo-mdq.png',
    runnerUpId: 'rank-1',
    runnerUpName: 'Martín Rossi (Sniper CABA)',
    highestAvgPlayer: 'Mariano Deux (ICEMAN)',
    highestAvgScore: 82.4,
    total180s: 22,
    highestCheckout: 170,
    highestCheckoutPlayer: 'Mariano Deux (ICEMAN)',
    bestLegDarts: 10,
    bestLegPlayer: 'Mariano Deux (ICEMAN)',
    totalMatchesPlayed: 7,
    totalLegsPlayed: 33
  },
  matches: generateDefaultBracket('hist-open-nacional-2026').map(m => ({ ...m, status: 'FINISHED', scoreP1: 4, scoreP2: 2, winnerId: m.player1?.id }))
};

// Torneo Local 2025 para validar filtrado histórico por año
const SAMPLE_HISTORY_TOURNAMENT_2025: Tournament = {
  id: 'hist-copa-mdq-2025',
  slug: 'copa-ciudad-mar-del-plata-2025',
  title: 'Copa Ciudad de Mar del Plata 2025 • Sede Oficial MDQ',
  description: 'Certamen clausura oficial de la temporada 2025 disputado en la sede de Darderos Mar del Plata.',
  type: 'PRESENCIAL',
  format: 'SINGLE_ELIMINATION',
  competitionMode: 'LOCAL_LEAGUE',
  leagueId: 'league-mdq-2025',
  leagueName: 'Liga Marplatense 2025 • Darderos MDQ',
  startingScore: 501,
  outMode: 'DOUBLE_OUT',
  bestOfLegs: 5,
  maxParticipants: 16,
  registeredCount: 16,
  venueName: 'Sede Darderos Mar del Plata',
  city: 'Mar del Plata',
  province: 'Buenos Aires',
  startDate: '2025-11-20T16:00:00.000Z',
  endDate: '2025-11-20T21:00:00.000Z',
  status: 'COMPLETED',
  bannerImageUrl: '/logos/logo-mdq.png',
  entryFeeArs: 6000,
  prizePoolArs: 150000,
  organizer: 'Darderos Mar del Plata',
  stats: {
    championId: 'user-iceman-admin',
    championName: 'Mariano Deux (ICEMAN)',
    championAvatar: '/logos/logo-mdq.png',
    runnerUpId: 'user-mdq-001',
    runnerUpName: 'Facundo López (El Halcón)',
    highestAvgPlayer: 'Facundo López',
    highestAvgScore: 76.5,
    total180s: 15,
    highestCheckout: 156,
    highestCheckoutPlayer: 'Mariano Deux (ICEMAN)',
    bestLegDarts: 12,
    bestLegPlayer: 'Facundo López',
    totalMatchesPlayed: 7,
    totalLegsPlayed: 28
  },
  matches: generateDefaultBracket('hist-copa-mdq-2025').map(m => ({ ...m, status: 'FINISHED', scoreP1: 3, scoreP2: 1, winnerId: m.player1?.id }))
};

const SAMPLE_HISTORY_TOURNAMENTS: Tournament[] = [
  SAMPLE_HISTORY_TOURNAMENT,
  SAMPLE_NATIONAL_TOURNAMENT_2026,
  SAMPLE_HISTORY_TOURNAMENT_2025
];

export const TournamentManager: React.FC = () => {
  // Pestaña principal: Torneos Activos vs Ligas & Posiciones vs Historial
  const [mainTab, setMainTab] = useState<'ACTIVE_TAB' | 'LEAGUES_TAB' | 'HISTORY_TAB'>('ACTIVE_TAB');

  // Ligas registradas (Nacional y Locales)
  const [leagues, setLeagues] = useState<League[]>(() => {
    return getStoredLeagues(DEFAULT_LEAGUES);
  });
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);

  // Estado de torneos activos
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    return getStoredTournaments(MOCK_TOURNAMENTS);
  });

  // Vista dentro de activos: Tabla General ('TABLE') o Detalle del Torneo ('DETAIL')
  const [activeViewMode, setActiveViewMode] = useState<'TABLE' | 'DETAIL'>('TABLE');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Subpestañas del torneo en detalle
  const [tournamentSubTab, setTournamentSubTab] = useState<'BRACKET' | 'GROUPS' | 'PLAYERS' | 'LIVE_BOARD'>('BRACKET');

  // Historial de torneos con soporte de temporadas 2026 y 2025
  const [historyTournaments, setHistoryTournaments] = useState<Tournament[]>(() => {
    const stored = getStoredTournamentHistory([]);
    return stored.length > 0 ? stored : SAMPLE_HISTORY_TOURNAMENTS;
  });
  const [selectedHistoryYear, setSelectedHistoryYear] = useState<string>('ALL');
  const [selectedHistoryTournamentId, setSelectedHistoryTournamentId] = useState<string | null>(
    SAMPLE_HISTORY_TOURNAMENT.id
  );

  // Modal de Detalle de Jugador (Ficha completa con trofeos, AVG e historial)
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<UltimateDartsCardData | null>(null);
  const [showPlayerDetailModal, setShowPlayerDetailModal] = useState<boolean>(false);

  const handleOpenPlayerDetail = (playerIdOrName: string, playerName?: string) => {
    const pData = findCanonicalPlayer(playerIdOrName, playerName);
    if (pData) {
      setSelectedPlayerForDetail(pData);
      setShowPlayerDetailModal(true);
    }
  };

  // Perfil del usuario activo y permisos de administrador
  const [currentUser, setCurrentUser] = useState<PlayerProfile>(() => {
    return getCurrentPlayerProfile(MOCK_CURRENT_USER);
  });
  const isAdmin = isUserAdmin(currentUser.email) || currentUser.role === 'ADMIN';

  // Transmisión en vivo de pista
  const [liveMatch, setLiveMatch] = useState<BroadcastMatchPayload | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);

  // Partido seleccionado en bracket para dispatch interactivo
  const [selectedBracketMatch, setSelectedBracketMatch] = useState<TournamentBracketMatch | null>(null);

  // Partido para administración manual (ICEMAN full admin)
  const [adminMatchToEdit, setAdminMatchToEdit] = useState<TournamentBracketMatch | null>(null);

  // Partida en vivo activa en el Anotador Oficial
  const [activeLiveMatchConfig, setActiveLiveMatchConfig] = useState<MatchConfig | null>(null);
  const [activeLiveMatchOrigin, setActiveLiveMatchOrigin] = useState<{ type: 'BRACKET' | 'GROUP'; id: string } | null>(null);

  // Lista de inscriptos locales
  const [enrolledPlayers, setEnrolledPlayers] = useState([
    { id: currentUser.id, name: currentUser.fullName, nickname: currentUser.nickname, avg: currentUser.estimatedAvg, hasWebcam: true },
    ...MOCK_RANKINGS.map((p) => ({ id: p.id, name: p.fullName, nickname: p.nickname, avg: p.estimatedAvg, hasWebcam: true }))
  ]);

  // Formulario nuevo torneo y modalidades
  const [newTitle, setNewTitle] = useState('');
  const [newCompetitionMode, setNewCompetitionMode] = useState<CompetitionMode>('STANDALONE_DAY');
  const [newLeagueId, setNewLeagueId] = useState<string>('league-local-mdq');
  const [newNationalStageType, setNewNationalStageType] = useState<NationalStageType>('ONLINE');
  const [newType, setNewType] = useState<TournamentType>('PRESENCIAL');
  const [newFormat, setNewFormat] = useState<TournamentFormat>('SINGLE_ELIMINATION');
  const [newBestOfLegs, setNewBestOfLegs] = useState(5);
  const [newVenue, setNewVenue] = useState('Sede Darderos Mar del Plata');
  const [newCity, setNewCity] = useState('Mar del Plata');
  const [newProvince, setNewProvince] = useState('Buenos Aires');
  const [newEntryFee, setNewEntryFee] = useState(10000);
  const [newPrizePool, setNewPrizePool] = useState(250000);
  const [newMaxParticipants, setNewMaxParticipants] = useState(32);

  // Suscripción a broadcast y eventos de perfil
  useEffect(() => {
    const unsub = matchBroadcast.subscribe((data) => {
      setLiveMatch(data);
    });
    const handleProfileUpdate = (e: any) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener('lpld_profile_updated', handleProfileUpdate);
    return () => {
      unsub();
      window.removeEventListener('lpld_profile_updated', handleProfileUpdate);
    };
  }, []);

  const currentTournament = tournaments.find((t) => t.id === selectedTournamentId) || null;

  // Años disponibles en el Historial de Torneos
  const availableHistoryYears = useMemo(() => {
    const years = new Set<string>();
    historyTournaments.forEach((t) => {
      const y = new Date(t.startDate).getFullYear().toString();
      years.add(y);
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [historyTournaments]);

  // Torneos filtrados por año en Historial
  const filteredHistoryTournaments = useMemo(() => {
    if (selectedHistoryYear === 'ALL') return historyTournaments;
    return historyTournaments.filter((t) => new Date(t.startDate).getFullYear().toString() === selectedHistoryYear);
  }, [historyTournaments, selectedHistoryYear]);

  const currentHistoryTournament = filteredHistoryTournaments.find((t) => t.id === selectedHistoryTournamentId) || filteredHistoryTournaments[0] || historyTournaments[0] || null;

  // Actualizar resultado en el Cuadro Eliminatorio (en caliente)
  const handleUpdateMatchScore = (matchId: string, p1Score: number, p2Score: number, winnerId?: string, note?: string) => {
    if (!selectedTournamentId) return;

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== selectedTournamentId || !t.matches) return t;

        const updatedMatches = t.matches.map((m) => {
          if (m.id === matchId) {
            const isFinished = !!winnerId;
            return {
              ...m,
              scoreP1: p1Score,
              scoreP2: p2Score,
              winnerId,
              note: note !== undefined ? note : m.note,
              status: isFinished ? ('FINISHED' as const) : ('LIVE' as const)
            };
          }
          return m;
        });

        // Si se declaró ganador, avanzar a la siguiente ronda
        if (winnerId) {
          const match = t.matches.find((m) => m.id === matchId);
          if (match && match.round < 3) {
            const nextRound = match.round + 1;
            const nextMatchIndex = Math.floor(match.matchIndex / 2);
            const targetNextMatch = updatedMatches.find(
              (m) => m.round === nextRound && m.matchIndex === nextMatchIndex
            );

            if (targetNextMatch) {
              const winningPlayer = match.player1?.id === winnerId ? match.player1 : match.player2;
              if (match.matchIndex % 2 === 0) {
                targetNextMatch.player1 = winningPlayer;
              } else {
                targetNextMatch.player2 = winningPlayer;
              }
            }
          }
        }

        return { ...t, matches: updatedMatches };
      });

      saveStoredTournaments(updated);
      return updated;
    });
  };

  // Administrador: Declarar Walkover (W.O.) y avanzar
  const handleAdminAdvanceWalkover = (matchId: string, winnerId: string, absentPlayerName: string) => {
    if (!currentTournament) return;
    const match = currentTournament.matches?.find((m) => m.id === matchId);
    if (!match) return;

    const legsToWin = Math.ceil(currentTournament.bestOfLegs / 2);
    const p1Score = match.player1?.id === winnerId ? legsToWin : 0;
    const p2Score = match.player2?.id === winnerId ? legsToWin : 0;
    const note = `W.O. (${absentPlayerName} ausente)`;

    handleUpdateMatchScore(matchId, p1Score, p2Score, winnerId, note);
  };

  // Administrador: Resetear partido
  const handleAdminResetMatch = (matchId: string) => {
    if (!selectedTournamentId) return;

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== selectedTournamentId || !t.matches) return t;

        const targetMatch = t.matches.find((m) => m.id === matchId);
        if (!targetMatch) return t;

        const updatedMatches = t.matches.map((m) => {
          if (m.id === matchId) {
            return {
              ...m,
              scoreP1: 0,
              scoreP2: 0,
              winnerId: undefined,
              note: undefined,
              status: 'SCHEDULED' as const
            };
          }
          return m;
        });

        // Limpiar al jugador de la siguiente ronda si ya había avanzado
        if (targetMatch.round < 3) {
          const nextRound = targetMatch.round + 1;
          const nextMatchIndex = Math.floor(targetMatch.matchIndex / 2);
          const targetNext = updatedMatches.find(
            (m) => m.round === nextRound && m.matchIndex === nextMatchIndex
          );
          if (targetNext) {
            if (targetMatch.matchIndex % 2 === 0) {
              targetNext.player1 = undefined;
            } else {
              targetNext.player2 = undefined;
            }
          }
        }

        return { ...t, matches: updatedMatches };
      });

      saveStoredTournaments(updated);
      return updated;
    });
  };

  // Administrador: Eliminar Torneo Activo
  const handleDeleteTournament = (tourneyId: string, tourneyTitle: string) => {
    if (!isAdmin) {
      alert('Solo el administrador oficial (ICEMAN) puede eliminar torneos.');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar el torneo "${tourneyTitle}"? Esta acción no se puede deshacer.`)) {
      setTournaments((prev) => {
        const filtered = prev.filter((t) => t.id !== tourneyId);
        saveStoredTournaments(filtered);
        return filtered;
      });
      if (selectedTournamentId === tourneyId) {
        setSelectedTournamentId(null);
        setActiveViewMode('TABLE');
      }
    }
  };

  // Administrador: Finalizar Torneo y Archivar en Historial con Estadísticas
  const handleArchiveTournamentToHistory = (tourney: Tournament) => {
    if (!isAdmin) return;

    if (confirm(`¿Deseas finalizar el torneo "${tourney.title}" y moverlo al Historial Oficial de Torneos?`)) {
      // Determinar campeón si hay partido final
      const finalMatch = tourney.matches?.find((m) => m.round === 3 && m.matchIndex === 0);
      const champion = finalMatch?.winnerId && finalMatch.player1 && finalMatch.player2
        ? (finalMatch.winnerId === finalMatch.player1.id ? finalMatch.player1 : finalMatch.player2)
        : null;
      const runnerUp = champion && finalMatch?.player1 && finalMatch?.player2
        ? (champion.id === finalMatch.player1.id ? finalMatch.player2 : finalMatch.player1)
        : null;

      const archived: Tournament = {
        ...tourney,
        status: 'COMPLETED',
        endDate: new Date().toISOString(),
        stats: tourney.stats || {
          championId: champion?.id || 'campeon-oficial',
          championName: champion?.name || 'Por definir',
          championAvatar: champion?.avatarUrl || '/logos/logo-mdq.png',
          runnerUpId: runnerUp?.id,
          runnerUpName: runnerUp?.name,
          highestAvgPlayer: champion?.name || 'Facundo López',
          highestAvgScore: 74.5,
          total180s: 14,
          highestCheckout: 156,
          highestCheckoutPlayer: champion?.name || 'ICEMAN',
          bestLegDarts: 12,
          totalMatchesPlayed: tourney.matches?.filter((m) => m.status === 'FINISHED').length || 7
        }
      };

      const updatedHistory = [archived, ...historyTournaments];
      setHistoryTournaments(updatedHistory);
      saveStoredTournamentHistory(updatedHistory);

      // Remover de activos
      setTournaments((prev) => {
        const filtered = prev.filter((t) => t.id !== tourney.id);
        saveStoredTournaments(filtered);
        return filtered;
      });

      setSelectedTournamentId(null);
      setActiveViewMode('TABLE');
      setSelectedHistoryTournamentId(archived.id);
      setMainTab('HISTORY_TAB');
      alert(`¡Torneo "${tourney.title}" archivado con éxito en el Historial Oficial!`);
    }
  };

  // Cargar torneo de muestra en historial para demostración
  const handleLoadSampleHistory = () => {
    const updated = [SAMPLE_HISTORY_TOURNAMENT, ...historyTournaments];
    setHistoryTournaments(updated);
    saveStoredTournamentHistory(updated);
    setSelectedHistoryTournamentId(SAMPLE_HISTORY_TOURNAMENT.id);
  };

  // Lanzar partido de Grupo en el Anotador
  const handleLaunchGroupMatch = (match: GroupMatch, mode: 'LIVE' | 'ONLINE') => {
    if (!currentTournament) return;
    const config: MatchConfig = {
      gameType: 'X01',
      startingScore: (currentTournament.startingScore as any) || 501,
      outMode: currentTournament.outMode || 'DOUBLE_OUT',
      inputFormat: 'SCORE',
      distanceType: 'LEGS',
      bestOfSets: 1,
      bestOfLegs: currentTournament.bestOfLegs,
      doubleIn: false,
      twoClearLegs: false,
      isDoubles: false,
      isVsCpu: false,
      cpuDifficulty: 'MEDIUM',
      player1: { id: match.player1Id, name: match.player1Name },
      player2: { id: match.player2Id, name: match.player2Name },
      player1Name: match.player1Name,
      player2Name: match.player2Name,
      tournamentTitle: currentTournament.title
    };

    setActiveLiveMatchConfig(config);
    setActiveLiveMatchOrigin({ type: 'GROUP', id: match.id });
  };

  // Lanzar partido de Bracket en el Anotador
  const handleLaunchBracketLive = (match: TournamentBracketMatch) => {
    if (!currentTournament || !match.player1 || !match.player2) return;

    const config: MatchConfig = {
      gameType: 'X01',
      startingScore: (currentTournament.startingScore as any) || 501,
      outMode: currentTournament.outMode || 'DOUBLE_OUT',
      inputFormat: 'SCORE',
      distanceType: 'LEGS',
      bestOfSets: 1,
      bestOfLegs: currentTournament.bestOfLegs,
      doubleIn: false,
      twoClearLegs: false,
      isDoubles: false,
      isVsCpu: false,
      cpuDifficulty: 'MEDIUM',
      player1: { id: match.player1.id, name: match.player1.name },
      player2: { id: match.player2.id, name: match.player2.name },
      player1Name: match.player1.name,
      player2Name: match.player2.name,
      tournamentTitle: currentTournament.title
    };

    setActiveLiveMatchConfig(config);
    setActiveLiveMatchOrigin({ type: 'BRACKET', id: match.id });
  };

  // Callback cuando finaliza el partido en el Anotador Oficial
  const handleTournamentMatchFinished = (result: any) => {
    if (!activeLiveMatchOrigin) return;

    const winnerId = result.winnerIndex === 0 
      ? activeLiveMatchConfig?.player1.id 
      : activeLiveMatchConfig?.player2.id;

    const p1Score = result.legsWon ? result.legsWon[0] : (result.winnerIndex === 0 ? 1 : 0);
    const p2Score = result.legsWon ? result.legsWon[1] : (result.winnerIndex === 1 ? 1 : 0);

    if (activeLiveMatchOrigin.type === 'BRACKET') {
      handleUpdateMatchScore(activeLiveMatchOrigin.id, p1Score, p2Score, winnerId);
    }

    setActiveLiveMatchConfig(null);
    setActiveLiveMatchOrigin(null);
  };

  // Inscribir nuevo jugador
  const handleEnrollPlayer = (pData: { name: string; pin: string; useWebcam: boolean }) => {
    setEnrolledPlayers((prev) => [
      {
        id: `player-${Date.now()}`,
        name: pData.name,
        nickname: pData.name.split(' ')[0].toLowerCase(),
        avg: 55.0,
        hasWebcam: pData.useWebcam
      },
      ...prev
    ]);
  };

  // Crear nueva Liga Oficial
  const handleCreateLeague = (newLeague: League) => {
    setLeagues((prev) => {
      const updated = [...prev, newLeague];
      saveStoredLeagues(updated);
      return updated;
    });
    setNewLeagueId(newLeague.id);
    alert(`¡Liga "${newLeague.name}" creada con éxito!`);
  };

  // Crear nuevo torneo
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `torneo-${Date.now()}`;
    const newMatches = newFormat === 'SINGLE_ELIMINATION' ? generateDefaultBracket(newId) : [];

    const selectedLeague = newCompetitionMode === 'LOCAL_LEAGUE'
      ? leagues.find((l) => l.id === newLeagueId)
      : (newCompetitionMode === 'NATIONAL_LEAGUE' ? leagues.find((l) => l.scope === 'NATIONAL') : undefined);

    const pointsMultiplier = newCompetitionMode === 'NATIONAL_LEAGUE' && newNationalStageType === 'PRESENCIAL_OFICIAL' ? 2 : 1;

    const newTourney: Tournament = {
      id: newId,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newTitle,
      description: `Torneo oficial de competición federada. Modalidad ${newType.toLowerCase()}, mejor de ${newBestOfLegs} legs.`,
      type: newType,
      format: newFormat,
      competitionMode: newCompetitionMode,
      leagueId: selectedLeague?.id,
      leagueName: selectedLeague?.name,
      nationalStageType: newCompetitionMode === 'NATIONAL_LEAGUE' ? newNationalStageType : undefined,
      pointsMultiplier,
      startingScore: 501,
      outMode: 'DOUBLE_OUT',
      bestOfLegs: newBestOfLegs,
      maxParticipants: newMaxParticipants,
      registeredCount: 8,
      venueName: newVenue,
      city: newCity,
      province: newProvince,
      startDate: new Date().toISOString(),
      status: 'REGISTRATION_OPEN',
      bannerImageUrl: '/logos/logo-mdq.png',
      entryFeeArs: newEntryFee,
      prizePoolArs: newPrizePool,
      organizer: selectedLeague ? selectedLeague.organizerClub : 'Locos por los Dardos & Darderos Mar del Plata',
      matches: newMatches
    };

    const updated = [newTourney, ...tournaments];
    setTournaments(updated);
    saveStoredTournaments(updated);

    setSelectedTournamentId(newTourney.id);
    setActiveViewMode('DETAIL');
    setShowCreateModal(false);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* SI HAY UN PARTIDO EN VIVO EN EL ANOTADOR: PANTALLA COMPLETA */}
      {activeLiveMatchConfig ? (
        <div className="bg-[#07090e] border-2 border-[#00e676] rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#00e676]/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-ping" />
              <h2 className="text-base sm:text-lg font-black text-white">
                {currentTournament?.title ? `${currentTournament.title} • Oche Asignado` : 'Partida individual'}
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveLiveMatchConfig(null);
                setActiveLiveMatchOrigin(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#ef4444]" />
              <span>Volver al Cuadro</span>
            </button>
          </div>

          <DartScorer
            initialConfig={activeLiveMatchConfig}
            onTournamentMatchFinished={handleTournamentMatchFinished}
          />
        </div>
      ) : (
        <>
          {/* PESTAÑAS PRINCIPALES: TORNEOS ACTIVOS vs HISTORIAL */}
          <div className="flex flex-wrap items-center justify-between bg-[#0f1422] border border-[#1e2a40] p-2 rounded-2xl gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMainTab('ACTIVE_TAB');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  mainTab === 'ACTIVE_TAB'
                    ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Torneos Activos</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  mainTab === 'ACTIVE_TAB' ? 'bg-[#07090e] text-[#00e676]' : 'bg-[#1e2a40] text-slate-300'
                }`}>
                  {tournaments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainTab('LEAGUES_TAB');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  mainTab === 'LEAGUES_TAB'
                    ? 'bg-[#ffe600] text-[#07090e] shadow-lg shadow-[#ffe600]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                <Shield className="w-4 h-4 text-[#ffe600]" />
                <span>Ligas & Posiciones</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  mainTab === 'LEAGUES_TAB' ? 'bg-[#07090e] text-[#ffe600]' : 'bg-[#1e2a40] text-slate-300'
                }`}>
                  {leagues.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainTab('HISTORY_TAB');
                  if (historyTournaments.length > 0 && !selectedHistoryTournamentId) {
                    setSelectedHistoryTournamentId(historyTournaments[0].id);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  mainTab === 'HISTORY_TAB'
                    ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Historial de Torneos</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  mainTab === 'HISTORY_TAB' ? 'bg-[#07090e] text-[#00e676]' : 'bg-[#1e2a40] text-slate-300'
                }`}>
                  {historyTournaments.length}
                </span>
              </button>
            </div>

            {/* Acciones de Cabecera y Badge de Administrador */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] text-xs font-black">
                  <ShieldAlert className="w-4 h-4" />
                  <span>MODO ADMIN ACTIVO ({currentUser.nickname || 'ICEMAN'})</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-[#ef4444]/25 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Crear Torneo Oficial</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECCIÓN 1: PESTAÑA DE TORNEOS ACTIVOS */}
          {/* ======================================================== */}
          {mainTab === 'ACTIVE_TAB' && (
            <div className="space-y-6">
              {/* VISTA A: TABLA DE TORNEOS ACTIVOS */}
              {activeViewMode === 'TABLE' || !currentTournament ? (
                <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                        <Trophy className="w-6 h-6 text-[#00e676]" />
                        <span>Torneos Oficiales Activos</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Circuito Federal • Competición en vivo, tablas y llaves eliminatorias
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#00e676]/20 transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Crear Nuevo Torneo</span>
                      </button>
                    </div>
                  </div>

                  {tournaments.length === 0 ? (
                    /* ESTADO VACÍO CUANDO NO HAY TORNEOS CREADOS */
                    <div className="text-center py-16 px-4 bg-[#07090e] border border-dashed border-slate-800 rounded-3xl space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#111622] border border-[#00e676]/30 flex items-center justify-center mx-auto text-[#00e676] shadow-lg shadow-[#00e676]/10">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-lg font-black text-white">No hay torneos activos en este momento</h3>
                        <p className="text-xs text-slate-400">
                          Todos los torneos no creados han sido removidos. Crea tu primer torneo oficial presencial u online para iniciar los cruces eliminatorios.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-5 py-3 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black rounded-xl text-xs inline-flex items-center gap-2 shadow-xl shadow-[#00e676]/25 transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>+ Crear Primer Torneo Oficial</span>
                      </button>
                    </div>
                  ) : (
                    /* TABLA CON TORNEOS ACTIVOS */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1e2a40] text-[11px] font-black uppercase text-slate-400">
                            <th className="py-3 px-4">Torneo</th>
                            <th className="py-3 px-4">Modalidad & Formato</th>
                            <th className="py-3 px-4">Fecha & Sede</th>
                            <th className="py-3 px-4">Inscriptos</th>
                            <th className="py-3 px-4">Premios / Entrada</th>
                            <th className="py-3 px-4">Estado</th>
                            <th className="py-3 px-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2a40]/60 text-xs">
                          {tournaments.map((t) => (
                            <tr key={t.id} className="hover:bg-[#141a29]/60 transition-colors group">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-xl bg-black border border-[#ef4444]/40 p-1 flex-shrink-0">
                                    <Image
                                      src={t.bannerImageUrl || '/logos/logo-mdq.png'}
                                      alt={t.title}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  </div>
                                  <div>
                                    <span className="font-black text-white block group-hover:text-[#00e676] transition-colors">
                                      {t.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      {t.organizer}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <div className="space-y-1.5">
                                  {/* Badge de Modalidad de Competición / Liga */}
                                  {t.competitionMode === 'NATIONAL_LEAGUE' && (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 w-fit">
                                        <span>🇦🇷 Liga Nacional</span>
                                        {t.pointsMultiplier === 2 && (
                                          <span className="text-amber-300 font-extrabold">⚡ x2 PTS</span>
                                        )}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {t.nationalStageType === 'PRESENCIAL_OFICIAL' ? 'Presencial Oficial' : 'Fecha Online'}
                                      </span>
                                    </div>
                                  )}
                                  {t.competitionMode === 'LOCAL_LEAGUE' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#ffe600]/20 text-[#ffe600] border border-[#ffe600]/40 w-fit">
                                      <Shield className="w-3 h-3" />
                                      <span className="truncate max-w-[140px]">{t.leagueName || 'Liga Local'}</span>
                                    </span>
                                  )}
                                  {(t.competitionMode === 'STANDALONE_DAY' || !t.competitionMode) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700 w-fit">
                                      <Target className="w-3 h-3 text-[#ef4444]" />
                                      <span>Torneo de Un Día</span>
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1.5">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                      t.type === 'PRESENCIAL'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    }`}>
                                      {t.type}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      501 DO • Mejor de {t.bestOfLegs} legs
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4 text-slate-300">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-white font-bold">
                                    <MapPin className="w-3.5 h-3.5 text-[#ef4444]" />
                                    <span>{t.venueName}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {t.city}, {t.province}
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-white">{t.registeredCount}/{t.maxParticipants}</span>
                                    <span className="text-slate-400">{Math.round((t.registeredCount / t.maxParticipants) * 100)}%</span>
                                  </div>
                                  <div className="w-24 bg-[#07090e] h-1.5 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                      className="bg-[#00e676] h-full rounded-full"
                                      style={{ width: `${Math.min(100, (t.registeredCount / t.maxParticipants) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-black text-[#00e676]">
                                    ${t.prizePoolArs?.toLocaleString('es-AR')} ARS
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Inscripción: ${t.entryFeeArs?.toLocaleString('es-AR')} ARS
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30">
                                  {t.status.replace('_', ' ')}
                                </span>
                              </td>

                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTournamentId(t.id);
                                      setActiveViewMode('DETAIL');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center gap-1 shadow-md transition-all"
                                    title="Ver Cuadro y Partidas"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Ver Llave</span>
                                  </button>

                                  {/* Botones exclusivos para Administrador */}
                                  {isAdmin && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleArchiveTournamentToHistory(t)}
                                        className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 transition-colors"
                                        title="Finalizar Torneo y Archivar a Historial"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTournament(t.id, t.title)}
                                        className="p-1.5 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/40 transition-colors"
                                        title="Eliminar Torneo"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* VISTA B: DETALLE DEL TORNEO ACTIVO SELECCIONADO */
                <div className="space-y-6">
                  {/* Botón de retorno a la tabla general */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('TABLE')}
                      className="px-4 py-2 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#00e676]" />
                      <span>← Volver a la Lista de Torneos Activos</span>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleArchiveTournamentToHistory(currentTournament)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-black text-xs border border-amber-500/40 flex items-center gap-1.5 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Finalizar y Mover a Historial</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTournament(currentTournament.id, currentTournament.title)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white font-black text-xs border border-[#ef4444]/40 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar Torneo</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Header del Torneo con Paleta Diana */}
                  <div className="bg-[#0f1422] border border-[#ef4444]/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black border-2 border-[#ef4444] p-2 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#ef4444]/20">
                        <Image
                          src={currentTournament.bannerImageUrl || '/logos/logo-mdq.png'}
                          alt={currentTournament.title}
                          fill
                          className="object-contain p-1"
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30">
                            {currentTournament.type}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30">
                            {currentTournament.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                          {currentTournament.title}
                        </h2>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#ef4444]" />
                          <span>{currentTournament.venueName} • {currentTournament.city}, {currentTournament.province}</span>
                        </p>
                      </div>
                    </div>

                    {/* Selector rápido y Acciones */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEnrollModal(true)}
                        className="px-3.5 py-2 bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#00e676]/20 transition-all"
                      >
                        <Users className="w-4 h-4" />
                        <span>+ Inscribirme</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowWebcamModal(true)}
                        className="px-3 py-2 bg-[#111622] hover:bg-[#1a2234] text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                        title="Configuración de Cámara"
                      >
                        <Video className="w-4 h-4 text-[#00e676]" />
                        <span className="hidden sm:inline">Cámara</span>
                      </button>
                    </div>
                  </div>

                  {/* Pestañas de Navegación del Torneo */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      <button
                        type="button"
                        onClick={() => setTournamentSubTab('BRACKET')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                          tournamentSubTab === 'BRACKET'
                            ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/25'
                            : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Cuadro Eliminatorio (Brackets)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTournamentSubTab('GROUPS')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                          tournamentSubTab === 'GROUPS'
                            ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/25'
                            : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Fase de Grupos (Round Robin)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTournamentSubTab('PLAYERS')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                          tournamentSubTab === 'PLAYERS'
                            ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/25'
                            : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Inscriptos ({enrolledPlayers.length}/{currentTournament.maxParticipants})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTournamentSubTab('LIVE_BOARD')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          tournamentSubTab === 'LIVE_BOARD'
                            ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/25'
                            : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                        <span>Pantalla TV Club</span>
                      </button>
                    </div>

                    <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#00e676]" />
                        Premio: <strong className="text-white">${currentTournament.prizePoolArs?.toLocaleString('es-AR')} ARS</strong>
                      </span>
                    </div>
                  </div>

                  {/* SUB CONTENIDO: BRACKET */}
                  {tournamentSubTab === 'BRACKET' && (
                    <div className="bg-[#07090e] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#00e676]" />
                            <span>Cuadro Eliminatorio Oficial en Tiempo Real</span>
                          </h3>
                          <p className="text-xs text-slate-400">
                            Toca cualquier partido activo para abrir el Anotador en Vivo. {isAdmin && 'Como administrador, pulsa el botón rojo en cada partido para editar o avanzar por W.O.'}
                          </p>
                        </div>
                      </div>

                      {currentTournament.matches && currentTournament.matches.length > 0 ? (
                        <TournamentBracket
                          matches={currentTournament.matches}
                          onSelectMatch={(m) => setSelectedBracketMatch(m)}
                          onUpdateScore={handleUpdateMatchScore}
                          bestOfLegs={currentTournament.bestOfLegs}
                          isAdmin={isAdmin}
                          onAdminEditMatch={(m) => setAdminMatchToEdit(m)}
                          onSelectPlayer={handleOpenPlayerDetail}
                        />
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          No hay partidos configurados para este torneo.
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB CONTENIDO: GRUPOS */}
                  {tournamentSubTab === 'GROUPS' && (
                    <TournamentGroupStage
                      tournamentTitle={currentTournament.title}
                      bestOfLegs={currentTournament.bestOfLegs}
                      onLaunchMatch={handleLaunchGroupMatch}
                      onAdvanceToBracket={() => setTournamentSubTab('BRACKET')}
                    />
                  )}

                  {/* SUB CONTENIDO: PLAYERS */}
                  {tournamentSubTab === 'PLAYERS' && (
                    <div className="bg-[#0f1422] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black text-white">
                            Lista de Jugadores Inscriptos y Acreditados
                          </h3>
                          <p className="text-xs text-slate-400">
                            Todos los competidores verificados para las pistas del torneo
                          </p>
                        </div>
                        <button
                          onClick={() => setShowEnrollModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs"
                        >
                          + Acreditar Nuevo
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {enrolledPlayers.map((p, idx) => (
                          <div
                            key={p.id}
                            className="p-3 rounded-2xl bg-[#07090e] border border-slate-800 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#111622] border border-[#ef4444]/40 flex items-center justify-center font-black text-xs text-[#ef4444]">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="text-xs font-black text-white">{p.name}</div>
                                <div className="text-[10px] text-slate-400">@{p.nickname} • AVG {p.avg}</div>
                              </div>
                            </div>
                            {p.hasWebcam && (
                              <span className="p-1 rounded-lg bg-[#00e676]/10 text-[#00e676]" title="Webcam Habilitada">
                                <Video className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUB CONTENIDO: LIVE BOARD */}
                  {tournamentSubTab === 'LIVE_BOARD' && (
                    <div className="bg-[#07090e] border-2 border-[#ef4444]/40 rounded-3xl p-6 shadow-2xl space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-2xl text-[#ef4444]">
                            <Tv className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white">
                              Pantalla Oficial de Televisión / Proyector del Club
                            </h3>
                            <p className="text-xs text-slate-400">
                              Diseñada para monitores de la barra, pantallas de sala y transmisión OBS en vivo
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] text-xs font-black flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
                          BROADCAST SINCRONIZADO
                        </span>
                      </div>

                      {liveMatch ? (
                        <div className="bg-[#0f1422] border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                          <div className="text-xs text-slate-400 uppercase font-black tracking-widest">
                            {liveMatch.gameType} • EN JUEGO
                          </div>

                          <div className="grid grid-cols-3 items-center gap-4">
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-black text-white">{liveMatch.player1Name}</div>
                              <div className="text-xs text-slate-400">AVG {liveMatch.player1Avg.toFixed(1)} • {liveMatch.player1Legs} legs</div>
                              <div className="text-4xl sm:text-6xl font-black text-[#00e676] mt-2">{liveMatch.player1Score}</div>
                            </div>

                            <div className="text-center font-black text-2xl text-slate-600">
                              VS
                            </div>

                            <div className="text-left">
                              <div className="text-xl sm:text-2xl font-black text-white">{liveMatch.player2Name}</div>
                              <div className="text-xs text-slate-400">AVG {liveMatch.player2Avg.toFixed(1)} • {liveMatch.player2Legs} legs</div>
                              <div className="text-4xl sm:text-6xl font-black text-[#00e676] mt-2">{liveMatch.player2Score}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-500 bg-[#0f1422] rounded-3xl border border-slate-800">
                          <Target className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                          <div className="text-sm font-bold text-slate-400">Esperando señal de pista...</div>
                          <div className="text-xs text-slate-600 mt-1">Inicia una partida en el anotador para transmitir dardo a dardo aquí</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECCIÓN 2: PESTAÑA DE LIGAS & POSICIONES */}
          {/* ======================================================== */}
          {mainTab === 'LEAGUES_TAB' && (
            <LeagueManager
              leagues={leagues}
              onOpenCreateLeague={() => setShowCreateLeagueModal(true)}
              onSelectPlayer={handleOpenPlayerDetail}
            />
          )}

          {/* ======================================================== */}
          {/* SECCIÓN 3: PESTAÑA DE HISTORIAL DE TORNEOS */}
          {/* ======================================================== */}
          {mainTab === 'HISTORY_TAB' && (
            <div className="space-y-6">
              {historyTournaments.length === 0 ? (
                <div className="text-center py-16 px-4 bg-[#0f1422] border border-[#1e2a40] rounded-3xl space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#111622] border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
                    <History className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-lg font-black text-white">Historial sin torneos finalizados</h3>
                    <p className="text-xs text-slate-400">
                      Cuando un torneo concluya y se corone al campeón, aparecerá aquí con el desarrollo completo de la llave y sus estadísticas consolidadas.
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleLoadSampleHistory}
                        className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-black rounded-xl text-xs inline-flex items-center gap-2 border border-amber-500/40 transition-all"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Cargar Torneo de Muestra en Historial</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* BUSCADOR POR AÑO Y DESPLEGABLE DEPENDIENTE CON NOMBRES DE TORNEOS HISTÓRICOS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f1422] border border-[#1e2a40] p-4 rounded-3xl">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Buscador / Selector por Año */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-slate-300">Año / Temporada:</span>
                        <select
                          value={selectedHistoryYear}
                          onChange={(e) => {
                            const y = e.target.value;
                            setSelectedHistoryYear(y);
                            const matching = y === 'ALL' 
                              ? historyTournaments 
                              : historyTournaments.filter(t => new Date(t.startDate).getFullYear().toString() === y);
                            if (matching.length > 0) setSelectedHistoryTournamentId(matching[0].id);
                          }}
                          className="bg-[#07090e] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="ALL">Todas las Temporadas</option>
                          {availableHistoryYears.map(year => (
                            <option key={year} value={year}>Temporada {year}</option>
                          ))}
                        </select>
                      </div>

                      {/* Desplegable dependiente con los nombres de los Torneos del año seleccionado */}
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#00e676]" />
                        <span className="text-xs font-black text-slate-300">Torneo:</span>
                        <select
                          value={selectedHistoryTournamentId || ''}
                          onChange={(e) => setSelectedHistoryTournamentId(e.target.value)}
                          className="bg-[#07090e] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-white focus:outline-none focus:border-[#00e676]"
                        >
                          {filteredHistoryTournaments.map((ht) => (
                            <option key={ht.id} value={ht.id}>
                              {ht.competitionMode === 'NATIONAL_LEAGUE' ? '🇦🇷 ' : '📍 '} {ht.title} ({new Date(ht.startDate).toLocaleDateString('es-AR')})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {currentHistoryTournament?.endDate && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Finalizado el {new Date(currentHistoryTournament.endDate).toLocaleDateString('es-AR')}</span>
                      </div>
                    )}
                  </div>

                  {/* TARJETA DE ESTADÍSTICAS DEL TORNEO HISTÓRICO CON LOGO OFICIAL */}
                  {currentHistoryTournament?.stats && (
                    <div className="bg-[#0f1422] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2a40] pb-3">
                        <div className="flex items-center gap-3">
                          {/* Logo Oficial: Dardos Argentina si es Nacional, Darderos MDQ si es Local */}
                          <div className="relative w-10 h-10 rounded-xl bg-black border border-slate-700 p-1 flex-shrink-0">
                            <Image
                              src={
                                currentHistoryTournament.competitionMode === 'NATIONAL_LEAGUE' || currentHistoryTournament.title.includes('Nacional') || currentHistoryTournament.title.includes('Argentina')
                                  ? '/logos/dardos-argentina.png'
                                  : '/logos/logo-mdq.png'
                              }
                              alt={currentHistoryTournament.title}
                              fill
                              className="object-contain p-0.5"
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-amber-400" />
                              <h3 className="text-base font-black text-white">
                                Estadísticas Oficiales del Torneo
                              </h3>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {currentHistoryTournament.title}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          TORNEO CONCLUIDO
                        </span>
                      </div>

                      {/* Cuadro de Honor: Campeón y Subcampeón (Clickeables para ver Ficha Oficial) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Campeón */}
                        <div 
                          onClick={() => currentHistoryTournament.stats?.championName && handleOpenPlayerDetail(currentHistoryTournament.stats.championName)}
                          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-transparent border border-amber-500/40 flex items-center gap-4 cursor-pointer hover:border-amber-400 transition-all group"
                          title="Click para ver ficha y estadísticas del Campeón"
                        >
                          <div className="relative w-14 h-14 rounded-2xl bg-black border-2 border-amber-400 p-1 flex-shrink-0 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                            🏆
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                              Campeón Oficial (Tocar para ver ficha)
                            </span>
                            <div className="text-base font-black text-white flex items-center gap-1.5 group-hover:text-amber-300">
                              <span>{currentHistoryTournament.stats?.championName || 'Campeón'}</span>
                            </div>
                            <span className="text-[11px] text-slate-300">Medalla de Oro & Copa Oficial</span>
                          </div>
                        </div>

                        {/* Subcampeón */}
                        <div 
                          onClick={() => handleOpenPlayerDetail(currentHistoryTournament.stats?.runnerUpName || 'Martín Rossi')}
                          className="p-4 rounded-2xl bg-[#141a29] border border-slate-700 flex items-center gap-4 cursor-pointer hover:border-slate-400 transition-all group"
                          title="Click para ver ficha y estadísticas del Subcampeón"
                        >
                          <div className="relative w-14 h-14 rounded-2xl bg-black border-2 border-slate-400 p-1 flex-shrink-0 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                            🥈
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                              Subcampeón (Tocar para ver ficha)
                            </span>
                            <div className="text-base font-black text-white group-hover:text-slate-200">
                              {currentHistoryTournament.stats?.runnerUpName || 'Martín Rossi'}
                            </div>
                            <span className="text-[11px] text-slate-400">Medalla de Plata</span>
                          </div>
                        </div>
                      </div>

                      {/* Métricas destacadas */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div 
                          onClick={() => handleOpenPlayerDetail(currentHistoryTournament.stats?.highestAvgPlayer || 'Mariano Deux')}
                          className="bg-[#07090e] border border-slate-800 rounded-2xl p-3.5 text-center cursor-pointer hover:border-[#00e676]/40 transition-colors"
                          title="Ver ficha del jugador con mayor AVG"
                        >
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Mayor Promedio (AVG)
                          </span>
                          <span className="text-2xl font-black text-[#00e676] font-mono block mt-1">
                            {currentHistoryTournament.stats?.highestAvgScore?.toFixed(1) || '78.5'}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block hover:text-[#00e676]">
                            {currentHistoryTournament.stats?.highestAvgPlayer || 'Mariano Deux'}
                          </span>
                        </div>

                        <div 
                          onClick={() => handleOpenPlayerDetail(currentHistoryTournament.stats?.highestCheckoutPlayer || 'Mariano Deux (ICEMAN)')}
                          className="bg-[#07090e] border border-slate-800 rounded-2xl p-3.5 text-center cursor-pointer hover:border-[#38bdf8]/40 transition-colors"
                          title="Ver ficha del jugador con mayor checkout"
                        >
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Mayor Cierre
                          </span>
                          <span className="text-2xl font-black text-[#38bdf8] font-mono block mt-1">
                            {currentHistoryTournament.stats?.highestCheckout || 170}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block hover:text-[#38bdf8]">
                            {currentHistoryTournament.stats.highestCheckoutPlayer || 'Mariano Deux (ICEMAN)'}
                          </span>
                        </div>

                        <div className="bg-[#07090e] border border-slate-800 rounded-2xl p-3.5 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            180s Cantados
                          </span>
                          <span className="text-2xl font-black text-[#ef4444] font-mono block mt-1">
                            {currentHistoryTournament.stats.total180s || 14}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Visitas perfectas</span>
                        </div>

                        <div className="bg-[#07090e] border border-slate-800 rounded-2xl p-3.5 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Mejor Leg
                          </span>
                          <span className="text-2xl font-black text-amber-400 font-mono block mt-1">
                            {currentHistoryTournament.stats.bestLegDarts || 11} d.
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {currentHistoryTournament.stats.bestLegPlayer || 'Martín Rossi'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DESARROLLO COMPLETO DE LA LLAVE HISTÓRICA */}
                  {currentHistoryTournament?.matches && (
                    <div className="bg-[#07090e] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-[#00e676]" />
                          <h3 className="text-base font-black text-white">
                            Desarrollo Completo de la Llave Eliminatoria
                          </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-bold">
                          Cuartos, Semis y Gran Final (Click en jugador para ver ficha)
                        </span>
                      </div>

                      <TournamentBracket
                        matches={currentHistoryTournament.matches}
                        bestOfLegs={currentHistoryTournament.bestOfLegs}
                        onSelectPlayer={handleOpenPlayerDetail}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL: ADMINISTRADOR DE LLAVE (ICEMAN FULL) */}
      <AdminMatchModal
        isOpen={!!adminMatchToEdit}
        onClose={() => setAdminMatchToEdit(null)}
        match={adminMatchToEdit}
        onSaveScore={handleUpdateMatchScore}
        onAdvanceWalkover={handleAdminAdvanceWalkover}
        onResetMatch={handleAdminResetMatch}
      />

      {/* MODAL: MATCH DISPATCHER DE BRACKET */}
      {selectedBracketMatch && (
        <MatchDispatcherModal
          isOpen={!!selectedBracketMatch}
          onClose={() => setSelectedBracketMatch(null)}
          matchTitle={`Cuadro Eliminatorio • Ronda ${selectedBracketMatch.round}`}
          player1Name={selectedBracketMatch.player1?.name || 'Jugador 1'}
          player2Name={selectedBracketMatch.player2?.name || 'Jugador 2'}
          player1Id={selectedBracketMatch.player1?.id || 'p1'}
          player2Id={selectedBracketMatch.player2?.id || 'p2'}
          bestOfLegs={currentTournament?.bestOfLegs || 5}
          onLaunchLiveMatch={() => handleLaunchBracketLive(selectedBracketMatch)}
          onLaunchOnlineMatch={() => handleLaunchBracketLive(selectedBracketMatch)}
          onSaveQuickResult={(s1, s2, winner) => {
            handleUpdateMatchScore(selectedBracketMatch.id, s1, s2, winner);
          }}
        />
      )}

      {/* MODAL: INSCRIPCIÓN / ACREDITACIÓN */}
      <PlayerEnrollModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onEnrollPlayer={handleEnrollPlayer}
      />

      {/* MODAL: WEBCAM */}
      <WebcamSetupModal
        isOpen={showWebcamModal}
        onClose={() => setShowWebcamModal(false)}
      />

      {/* MODAL: CREAR TORNEO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTournament}
            className="w-full max-w-md bg-[#07090e] border-2 border-[#ef4444] rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#ef4444]" />
                <h3 className="text-base font-black text-white">Crear Nuevo Torneo Oficial</h3>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nombre del Torneo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Open Mar del Plata 2026 • Copa MDQ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                />
              </div>

              {/* MODALIDAD DE COMPETICIÓN & ASOCIACIÓN A LIGA */}
              <div className="space-y-2 bg-[#111622] p-3 rounded-2xl border border-slate-800">
                <label className="text-white font-black text-xs block mb-1">
                  Modalidad del Torneo & Liga Asociada *
                </label>
                
                <div className="space-y-2">
                  {/* Opción 1: Torneo de Un Día */}
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      newCompetitionMode === 'STANDALONE_DAY'
                        ? 'bg-[#00e676]/10 border-[#00e676] text-white ring-1 ring-[#00e676]/30'
                        : 'bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="compMode"
                      value="STANDALONE_DAY"
                      checked={newCompetitionMode === 'STANDALONE_DAY'}
                      onChange={() => setNewCompetitionMode('STANDALONE_DAY')}
                      className="mt-0.5 text-[#00e676] focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#ef4444]" />
                        <span>Torneo de Un Día (Sin Liga Asociada)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Torneo abierto o relámpago independiente. No suma puntos a ninguna liga.
                      </div>
                    </div>
                  </label>

                  {/* Opción 2: Torneo Local con Liga */}
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      newCompetitionMode === 'LOCAL_LEAGUE'
                        ? 'bg-[#ffe600]/10 border-[#ffe600] text-white ring-1 ring-[#ffe600]/30'
                        : 'bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="compMode"
                      value="LOCAL_LEAGUE"
                      checked={newCompetitionMode === 'LOCAL_LEAGUE'}
                      onChange={() => setNewCompetitionMode('LOCAL_LEAGUE')}
                      className="mt-0.5 text-[#ffe600] focus:ring-0"
                    />
                    <div className="w-full">
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#ffe600]" />
                        <span>Torneo Local (Suma puntos a su Liga Local)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Fecha puntuable de una liga local (ej. Liga Marplatense • Darderos MDQ).
                      </div>
                    </div>
                  </label>

                  {/* Opción 3: Torneo Nacional Oficial */}
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      newCompetitionMode === 'NATIONAL_LEAGUE'
                        ? 'bg-[#38bdf8]/10 border-[#38bdf8] text-white ring-1 ring-[#38bdf8]/30'
                        : 'bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="compMode"
                      value="NATIONAL_LEAGUE"
                      checked={newCompetitionMode === 'NATIONAL_LEAGUE'}
                      onChange={() => setNewCompetitionMode('NATIONAL_LEAGUE')}
                      className="mt-0.5 text-[#38bdf8] focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>Torneo Nacional (Única Liga Nacional Oficial)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Suma puntos para clasificar a torneos internacionales. Fechas presenciales duplican puntos (x2).
                      </div>
                    </div>
                  </label>
                </div>

                {/* Si seleccionó LOCAL_LEAGUE: selector de liga local y botón de crear nueva */}
                {newCompetitionMode === 'LOCAL_LEAGUE' && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">Seleccionar Liga Local:</span>
                      <button
                        type="button"
                        onClick={() => setShowCreateLeagueModal(true)}
                        className="text-[10px] text-[#ffe600] font-black hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Crear Liga</span>
                      </button>
                    </div>
                    <select
                      value={newLeagueId}
                      onChange={(e) => setNewLeagueId(e.target.value)}
                      className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#ffe600] text-xs font-bold"
                    >
                      {leagues
                        .filter((l) => l.scope === 'LOCAL')
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.city}, {l.season})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Si seleccionó NATIONAL_LEAGUE: selector de Online vs Presencial Oficial (x2) */}
                {newCompetitionMode === 'NATIONAL_LEAGUE' && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Tipo de Fecha de la Liga Nacional Oficial:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewNationalStageType('ONLINE');
                          setNewType('ONLINE');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          newNationalStageType === 'ONLINE'
                            ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-white ring-1 ring-[#38bdf8]'
                            : 'bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black flex items-center gap-1 text-[#38bdf8]">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Fecha Online</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Puntos regulares (1x)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewNationalStageType('PRESENCIAL_OFICIAL');
                          setNewType('PRESENCIAL');
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          newNationalStageType === 'PRESENCIAL_OFICIAL'
                            ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400 shadow-lg shadow-amber-500/20'
                            : 'bg-[#07090e] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black flex items-center gap-1 text-amber-300">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Presencial Oficial</span>
                        </div>
                        <div className="text-[10px] text-amber-300/90 font-bold mt-0.5">
                          ⚡ ¡DUPLICA PUNTOS (x2)!
                        </div>
                      </button>
                    </div>

                    {newNationalStageType === 'PRESENCIAL_OFICIAL' && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Fecha Presencial en Sede:</strong> Los jugadores deben competir de manera presencial en las fechas oficiales para sumar el doble de puntos (x2) para el ranking clasificatorio internacional.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Modalidad de Juego</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  >
                    <option value="PRESENCIAL">Presencial (En Club)</option>
                    <option value="ONLINE">Online Conectado</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Formato</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  >
                    <option value="SINGLE_ELIMINATION">Eliminación Directa</option>
                    <option value="ROUND_ROBIN">Grupos (Round Robin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Legs (Mejor de)</label>
                  <input
                    type="number"
                    min="1"
                    max="19"
                    value={newBestOfLegs}
                    onChange={(e) => setNewBestOfLegs(Number(e.target.value))}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Cupo Máximo</label>
                  <input
                    type="number"
                    min="4"
                    max="64"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(Number(e.target.value))}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Sede / Club</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Provincia</label>
                  <input
                    type="text"
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Inscripción ($ ARS)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(Number(e.target.value))}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Premio Estimado ($ ARS)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newPrizePool}
                    onChange={(e) => setNewPrizePool(Number(e.target.value))}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                PUBLICAR Y ABRIR TORNEO
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREAR NUEVA LIGA OFICIAL */}
      <CreateLeagueModal
        isOpen={showCreateLeagueModal}
        onClose={() => setShowCreateLeagueModal(false)}
        onCreateLeague={handleCreateLeague}
        canCreateNational={isAdmin}
      />

      {/* MODAL: DETALLE Y FICHA OFICIAL DEL JUGADOR */}
      <PlayerDetailModal
        player={selectedPlayerForDetail}
        isOpen={showPlayerDetailModal}
        onClose={() => setShowPlayerDetailModal(false)}
        onNavigateToEvent={(eventType, targetId, targetTab) => {
          if (eventType === 'LEAGUE') {
            setMainTab('LEAGUES_TAB');
          } else {
            setMainTab('HISTORY_TAB');
            setSelectedHistoryTournamentId(targetId);
          }
        }}
      />
    </div>
  );
};
