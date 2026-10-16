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
  NationalStageType,
  RoundLegsConfig
} from '@/lib/types';
import { 
  MOCK_TOURNAMENTS, 
  MOCK_RANKINGS, 
  MOCK_CURRENT_USER, 
  USER_ICEMAN,
  COUNTRIES, 
  DEFAULT_LEAGUES,
  getCountryFlag, 
  isUserAdmin,
  canUserManageTournaments
} from '@/lib/constants';
import { 
  getCurrentPlayerProfile, 
  getStoredTournaments, 
  saveStoredTournaments,
  getStoredTournamentHistory,
  saveStoredTournamentHistory,
  getStoredLeagues,
  saveStoredLeagues,
  fetchRegisteredPlayersFromCloud,
  fetchTournamentsFromCloud,
  saveTournamentToCloud,
  deleteTournamentFromCloud
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
import { SlotAssignModal } from './SlotAssignModal';
import { CreateLeagueModal } from './CreateLeagueModal';
import { LeagueManager } from './LeagueManager';
import { EditTournamentModal } from './EditTournamentModal';
import { EditLeagueModal } from './EditLeagueModal';
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
  ChevronRight,
  Share2,
  Link2,
  MessageCircle,
  Check,
  Pencil,
  Lock,
  Unlock,
  Play
} from 'lucide-react';

import { 
  generateSingleElimination, 
  generateDoubleElimination, 
  reportResult, 
  computePodium, 
  resetMatchSafely, 
  getNextPowerOfTwo,
  Participant 
} from '@/lib/bracket-engine';

// Helper de traducción y estilo visual de estados de torneo en español (sin cortes)
export function getTournamentStatusBadge(status: string) {
  switch (status) {
    case 'REGISTRATION_OPEN':
      return { label: 'Inscripción Abierta', className: 'bg-[#00e676]/15 text-[#00e676] border-[#00e676]/40' };
    case 'IN_PROGRESS':
      return { label: 'En Juego', className: 'bg-amber-500/15 text-amber-400 border-amber-500/40 animate-pulse' };
    case 'FINISHED':
      return { label: 'Finalizado', className: 'bg-slate-700/30 text-slate-300 border-slate-700/50' };
    case 'CANCELLED':
      return { label: 'Cancelado', className: 'bg-red-500/15 text-red-400 border-red-500/40' };
    default:
      return { label: status.replace('_', ' '), className: 'bg-[#00e676]/15 text-[#00e676] border-[#00e676]/40' };
  }
}
import { TournamentPodiumView } from './TournamentPodiumView';

// Helper para crear la lista de participantes para la siembra (Seeding)
function createTournamentParticipants(maxCount: number, firstPlayer?: PlayerProfile): Participant[] {
  const pList: Participant[] = [];

  // Jugador 1: Admin o usuario activo con foto y bandera
  pList.push({
    id: firstPlayer?.id || 'user-iceman-admin',
    name: firstPlayer?.fullName || 'Mariano Deux (ICEMAN)',
    nickname: firstPlayer?.nickname || 'ICEMAN',
    avatarUrl: firstPlayer?.avatarUrl || '/images/iceman-perfil.png',
    seed: 1,
    nationality: firstPlayer?.nationality || 'Argentina',
    countryCode: firstPlayer?.countryCode || 'AR'
  });

  // Demás cupos abiertos para acreditación
  for (let i = 2; i <= maxCount; i++) {
    pList.push({
      id: `slot-${i}`,
      name: `Por Acreditar #${i}`,
      avatarUrl: '/logos/logo-mdq.png',
      seed: i,
      nationality: 'Argentina',
      countryCode: 'AR'
    });
  }

  return pList;
}

// Generador de Eliminación Simple puro (Challonge/N01) con punteros y Byes
function generateDefaultBracket(
  tournamentId: string,
  roundLegs?: RoundLegsConfig,
  defaultLegs: number = 3,
  maxCount: number = 8,
  firstPlayer?: PlayerProfile
): TournamentBracketMatch[] {
  const participants = createTournamentParticipants(maxCount, firstPlayer);
  const distMode = roundLegs?.distanceMode || 'LEGS';
  const qfVal = roundLegs?.quarterFinals || defaultLegs;

  const rawMatches = generateSingleElimination(participants, {
    seeding: 'RANKED',
    includeThirdPlace: true,
    legTarget: qfVal,
    distanceMode: distMode
  });

  return rawMatches.map((m) => ({
    ...m,
    id: `${tournamentId}-${m.id}`,
    nextMatchId: m.nextMatchId ? `${tournamentId}-${m.nextMatchId}` : undefined,
    loserNextMatchId: m.loserNextMatchId ? `${tournamentId}-${m.loserNextMatchId}` : undefined
  }));
}

// Generador oficial de Doble Eliminación puro (Winners, Losers y Gran Final)
function generateDoubleEliminationBracket(
  tournamentId: string,
  roundLegs?: RoundLegsConfig,
  defaultLegs: number = 3,
  maxCount: number = 8,
  firstPlayer?: PlayerProfile
): TournamentBracketMatch[] {
  const participants = createTournamentParticipants(maxCount, firstPlayer);
  const distMode = roundLegs?.distanceMode || 'LEGS';
  const qfVal = roundLegs?.quarterFinals || defaultLegs;

  const rawMatches = generateDoubleElimination(participants, {
    seeding: 'RANKED',
    legTarget: qfVal,
    distanceMode: distMode
  });

  return rawMatches.map((m) => ({
    ...m,
    id: `${tournamentId}-${m.id}`,
    nextMatchId: m.nextMatchId ? `${tournamentId}-${m.nextMatchId}` : undefined,
    loserNextMatchId: m.loserNextMatchId ? `${tournamentId}-${m.loserNextMatchId}` : undefined
  }));
}

// Torneos históricos en limpio para producción
const SAMPLE_HISTORY_TOURNAMENTS: Tournament[] = [];

// Interfaz de props para soporte de deep linking y auto-inscripción
export interface TournamentManagerProps {
  initialTournamentId?: string | null;
  initialEnroll?: boolean;
}

export const TournamentManager: React.FC<TournamentManagerProps> = ({
  initialTournamentId,
  initialEnroll
}) => {
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

  // Estados de edición de Torneos y Ligas
  const [tournamentToEdit, setTournamentToEdit] = useState<Tournament | null>(null);
  const [leagueToEdit, setLeagueToEdit] = useState<League | null>(null);

  // Estado de feedback al copiar enlaces de inscripción
  const [copiedTournamentId, setCopiedTournamentId] = useState<string | null>(null);

  // Subpestañas del torneo en detalle
  const [tournamentSubTab, setTournamentSubTab] = useState<'BRACKET' | 'GROUPS' | 'PLAYERS' | 'LIVE_BOARD'>('BRACKET');

  // Historial de torneos con soporte de temporadas 2026 y 2025
  const [historyTournaments, setHistoryTournaments] = useState<Tournament[]>(() => {
    return getStoredTournamentHistory([]);
  });
  const [selectedHistoryYear, setSelectedHistoryYear] = useState<string>('ALL');
  const [selectedHistoryTournamentId, setSelectedHistoryTournamentId] = useState<string | null>(null);

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
  const isAdmin = canUserManageTournaments(currentUser);

  // Sincronización bidireccional con Supabase PostgreSQL en la nube
  useEffect(() => {
    let isMounted = true;
    fetchTournamentsFromCloud().then((cloudTourneys) => {
      if (!isMounted) return;
      if (cloudTourneys && cloudTourneys.length > 0) {
        setTournaments(cloudTourneys);
        saveStoredTournaments(cloudTourneys);
      } else {
        // Si la nube aún no tiene torneos, migrar automáticamente los locales a Supabase
        const local = getStoredTournaments(MOCK_TOURNAMENTS);
        if (local && local.length > 0) {
          local.forEach((t) => saveTournamentToCloud(t));
        }
      }
    }).catch((err) => console.warn('[TournamentManager] Error sincronizando torneos desde la nube:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Soporte de enlace directo para ver torneo o auto-abrir inscripción
  useEffect(() => {
    if (!initialTournamentId) return;
    const target = tournaments.find((t) => t.id === initialTournamentId || t.slug === initialTournamentId);
    if (target) {
      setSelectedTournamentId(target.id);
      setActiveViewMode('DETAIL');
      if (initialEnroll) {
        setShowEnrollModal(true);
      }
    }
  }, [initialTournamentId, initialEnroll, tournaments]);

  // Copiar link directo de inscripción al portapapeles
  const handleCopyEnrollLink = (tourney: Tournament, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://locosporlosdardos.com.ar';
    const link = `${origin}/torneos?inscribir=${tourney.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedTournamentId(tourney.id);
        setTimeout(() => setCopiedTournamentId(null), 3000);
      }).catch(() => {});
    }
  };

  // Generar URL de WhatsApp para invitar e inscribirse directamente
  const getWhatsAppShareUrl = (tourney: Tournament) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://locosporlosdardos.com.ar';
    const link = `${origin}/torneos?inscribir=${tourney.id}`;
    const text = `🎯 *¡Inscripción Abierta para ${tourney.title}!* 🎯\nModalidad: ${tourney.format === 'DOUBLE_ELIMINATION' ? 'Doble Eliminación' : 'Eliminación Simple'}\n${tourney.isPaid ? `Premio: $${tourney.prizePoolArs?.toLocaleString('es-AR')} ARS` : 'Torneo Gratuito'}\n\n👉 *Inscríbete directamente aquí:* ${link}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

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

  // Modal de asignación de slots estilo Nakka N01
  const [slotAssignTarget, setSlotAssignTarget] = useState<{ match: TournamentBracketMatch; slotIndex: 1 | 2 } | null>(null);

  // Jugadores de la comunidad disponibles en la nube
  const [communityPlayers, setCommunityPlayers] = useState<PlayerProfile[]>([]);

  // Lista de inscriptos locales (fallback)
  const [enrolledPlayers, setEnrolledPlayers] = useState([
    { id: currentUser.id, name: currentUser.fullName, nickname: currentUser.nickname, avg: currentUser.estimatedAvg || 48, hasWebcam: true }
  ]);

  useEffect(() => {
    fetchRegisteredPlayersFromCloud().then((cloud) => {
      if (cloud && cloud.length > 0) {
        setCommunityPlayers(cloud);
        setEnrolledPlayers((prev) => {
          const map = new Map<string, { id: string; name: string; nickname: string; avg: number; hasWebcam: boolean }>();
          prev.forEach((p) => map.set(p.id, p));
          cloud.forEach((c) => {
            if (!map.has(c.id)) {
              map.set(c.id, {
                id: c.id,
                name: c.fullName || c.nickname,
                nickname: c.nickname,
                avg: c.estimatedAvg || c.stats?.overallAvg || 45,
                hasWebcam: true
              });
            }
          });
          return Array.from(map.values());
        });
      }
    });
  }, []);

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
  const [newIsPaid, setNewIsPaid] = useState<boolean>(true);
  const [newEntryFee, setNewEntryFee] = useState(10000);
  const [newMaxParticipants, setNewMaxParticipants] = useState(32);
  const [newPrizePool, setNewPrizePool] = useState(320000); // 32 * 10000 auto calculado

  // Configuración Detallada por Instancia de Llave
  const [showDetailedConfig, setShowDetailedConfig] = useState(false);
  const [newDistanceMode, setNewDistanceMode] = useState<'LEGS' | 'SETS'>('LEGS');
  const [newLegsPerSet, setNewLegsPerSet] = useState<number>(5);
  const [newQuarterLegs, setNewQuarterLegs] = useState(3);
  const [newSemiLegs, setNewSemiLegs] = useState(4);
  const [newFinalsLegs, setNewFinalsLegs] = useState(5);
  const [newLosersRoundLegs, setNewLosersRoundLegs] = useState(3);
  const [newLosersFinalsLegs, setNewLosersFinalsLegs] = useState(4);
  const [newGrandFinalLegs, setNewGrandFinalLegs] = useState(5);

  // Configuración de Zonas / Liga
  const [newGroupsCount, setNewGroupsCount] = useState(2);
  const [newPlayersPerGroup, setNewPlayersPerGroup] = useState(4);
  const [newQualifiersPerGroup, setNewQualifiersPerGroup] = useState(2);
  const [newDoubleRoundRobin, setNewDoubleRoundRobin] = useState(false);
  const [newTiebreakerDifference, setNewTiebreakerDifference] = useState(true);

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

  // Actualizar resultado en el Cuadro Eliminatorio (en caliente con Pure Engine)
  const handleUpdateMatchScore = (matchId: string, p1Score: number, p2Score: number, winnerId?: string, note?: string) => {
    if (!selectedTournamentId) return;

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== selectedTournamentId || !t.matches) return t;

        let updatedMatches: TournamentBracketMatch[];
        if (winnerId) {
          // Motor puro: enrutamiento exacto por punteros (nextMatchId / loserNextMatchId)
          updatedMatches = reportResult(t.matches, matchId, {
            scoreP1: p1Score,
            scoreP2: p2Score,
            winnerId,
            note
          });
        } else {
          // Partido en vivo sin ganador definitivo todavía
          updatedMatches = t.matches.map((m) => {
            if (m.id === matchId) {
              return {
                ...m,
                scoreP1: p1Score,
                scoreP2: p2Score,
                note: note !== undefined ? note : m.note,
                status: 'LIVE' as const
              };
            }
            return m;
          });
        }

        // Computar Podio Oficial de Premiación automáticamente (1º Oro, 2º Plata, 3º Bronce)
        const format = t.format === 'DOUBLE_ELIMINATION' ? 'DOUBLE_ELIMINATION' : 'SINGLE_ELIMINATION';
        const calculatedPodium = computePodium(updatedMatches, format);

        return {
          ...t,
          matches: updatedMatches,
          podium: calculatedPodium
        };
      });

      saveStoredTournaments(updated);
      const updatedTourney = updated.find(t => t.id === selectedTournamentId);
      if (updatedTourney) saveTournamentToCloud(updatedTourney);
      return updated;
    });
  };

  // Administrador: Declarar Walkover (W.O.) y avanzar
  const handleAdminAdvanceWalkover = (matchId: string, winnerId: string, absentPlayerName: string) => {
    if (!currentTournament) return;
    const match = currentTournament.matches?.find((m) => m.id === matchId);
    if (!match) return;

    const legsToWin = match.legTarget || Math.ceil(currentTournament.bestOfLegs / 2);
    const p1Score = match.player1?.id === winnerId ? legsToWin : 0;
    const p2Score = match.player2?.id === winnerId ? legsToWin : 0;
    const note = `W.O. (${absentPlayerName} ausente)`;

    handleUpdateMatchScore(matchId, p1Score, p2Score, winnerId, note);
  };

  // Administrador: Resetear partido de forma segura con cascada
  const handleAdminResetMatch = (matchId: string) => {
    if (!selectedTournamentId) return;

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== selectedTournamentId || !t.matches) return t;

        const updatedMatches = resetMatchSafely(t.matches, matchId, true);
        const format = t.format === 'DOUBLE_ELIMINATION' ? 'DOUBLE_ELIMINATION' : 'SINGLE_ELIMINATION';
        const calculatedPodium = computePodium(updatedMatches, format);

        return {
          ...t,
          matches: updatedMatches,
          podium: calculatedPodium
        };
      });

      saveStoredTournaments(updated);
      const updatedTourney = updated.find(t => t.id === selectedTournamentId);
      if (updatedTourney) saveTournamentToCloud(updatedTourney);
      return updated;
    });
  };

  // Inscriptos del torneo actual (por torneo específico, con soporte fallback)
  const tournamentEnrolledList = useMemo(() => {
    if (!currentTournament) return [];
    if (currentTournament.enrolledPlayers && currentTournament.enrolledPlayers.length > 0) {
      return currentTournament.enrolledPlayers;
    }
    return [
      {
        id: currentUser.id,
        name: currentUser.fullName,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl || '/images/iceman-perfil.png',
        seed: 1,
        avg: currentUser.estimatedAvg || 48,
        hasWebcam: true,
        nationality: currentUser.nationality || 'Argentina',
        countryCode: currentUser.countryCode || 'AR',
        enrolledAt: currentTournament.startDate
      }
    ];
  }, [currentTournament, currentUser]);

  // Inscripción y acreditación de jugadores al torneo
  const handleEnrollPlayer = (playerData: { name: string; pin: string; useWebcam: boolean }) => {
    if (!currentTournament) return;

    const matchedProfile = communityPlayers.find(
      (cp) => cp.fullName?.toLowerCase() === playerData.name.toLowerCase() ||
              cp.nickname?.toLowerCase() === playerData.name.toLowerCase()
    ) || (currentUser.fullName?.toLowerCase() === playerData.name.toLowerCase() ? currentUser : null);

    const newPlayerItem = {
      id: matchedProfile?.id || `enrolled-${Date.now()}`,
      name: matchedProfile?.fullName || playerData.name,
      nickname: matchedProfile?.nickname || playerData.name,
      avatarUrl: matchedProfile?.avatarUrl || '/logos/logo-mdq.png',
      seed: (currentTournament.enrolledPlayers?.length || 0) + 1,
      avg: matchedProfile?.estimatedAvg || 45,
      nationality: matchedProfile?.nationality || 'Argentina',
      countryCode: matchedProfile?.countryCode || 'AR',
      enrolledAt: new Date().toISOString()
    };

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== currentTournament.id) return t;

        const currentEnrolled = t.enrolledPlayers || [];
        if (currentEnrolled.some((p) => p.id === newPlayerItem.id || p.name.toLowerCase() === newPlayerItem.name.toLowerCase())) {
          alert(`"${newPlayerItem.name}" ya se encuentra inscripto en este torneo.`);
          return t;
        }

        const newEnrolled = [...currentEnrolled, newPlayerItem];
        return {
          ...t,
          enrolledPlayers: newEnrolled,
          registeredCount: newEnrolled.length
        };
      });

      saveStoredTournaments(updated);
      const updatedTourney = updated.find((t) => t.id === currentTournament.id);
      if (updatedTourney) saveTournamentToCloud(updatedTourney);
      return updated;
    });

    setShowEnrollModal(false);
  };

  // Motor Nakka N01: Asignación Automática de la Llave
  const handleAutoAssignBracket = (isRandom: boolean) => {
    if (!currentTournament) return;
    const participants: Participant[] = tournamentEnrolledList.map((p, idx) => ({
      id: p.id,
      name: p.name,
      nickname: p.nickname,
      avatarUrl: p.avatarUrl || '/logos/logo-mdq.png',
      seed: p.seed || idx + 1,
      nationality: p.nationality || 'Argentina',
      countryCode: p.countryCode || 'AR'
    }));

    if (participants.length === 0) {
      alert('Debes tener al menos un jugador inscripto para realizar la asignación.');
      return;
    }

    const bracketSize = getNextPowerOfTwo(currentTournament.maxParticipants || participants.length);
    const legTarget = currentTournament.bestOfLegs || 3;
    const distMode = currentTournament.roundLegsConfig?.distanceMode || 'LEGS';

    let rawMatches: TournamentBracketMatch[] = [];
    if (currentTournament.format === 'DOUBLE_ELIMINATION') {
      rawMatches = generateDoubleElimination(participants, {
        bracketSize,
        seeding: isRandom ? 'RANDOM' : 'RANKED',
        legTarget,
        distanceMode: distMode
      });
    } else {
      rawMatches = generateSingleElimination(participants, {
        bracketSize,
        seeding: isRandom ? 'RANDOM' : 'RANKED',
        includeThirdPlace: true,
        legTarget,
        distanceMode: distMode
      });
    }

    const namespacedMatches = rawMatches.map((m) => ({
      ...m,
      id: m.id.startsWith(currentTournament.id) ? m.id : `${currentTournament.id}-${m.id}`,
      nextMatchId: m.nextMatchId ? (m.nextMatchId.startsWith(currentTournament.id) ? m.nextMatchId : `${currentTournament.id}-${m.nextMatchId}`) : undefined,
      loserNextMatchId: m.loserNextMatchId ? (m.loserNextMatchId.startsWith(currentTournament.id) ? m.loserNextMatchId : `${currentTournament.id}-${m.loserNextMatchId}`) : undefined
    }));

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== currentTournament.id) return t;
        return {
          ...t,
          matches: namespacedMatches
        };
      });
      saveStoredTournaments(updated);
      const updatedTourney = updated.find((t) => t.id === currentTournament.id);
      if (updatedTourney) saveTournamentToCloud(updatedTourney);
      return updated;
    });
  };

  // Motor Nakka N01: Despejar / Limpiar Llave a Slots Vacíos
  const handleClearBracket = () => {
    if (!currentTournament) return;
    const bracketSize = getNextPowerOfTwo(currentTournament.maxParticipants || 8);
    const legTarget = currentTournament.bestOfLegs || 3;
    const distMode = currentTournament.roundLegsConfig?.distanceMode || 'LEGS';

    let rawMatches: TournamentBracketMatch[] = [];
    if (currentTournament.format === 'DOUBLE_ELIMINATION') {
      rawMatches = generateDoubleElimination([], {
        bracketSize,
        legTarget,
        distanceMode: distMode
      });
    } else {
      rawMatches = generateSingleElimination([], {
        bracketSize,
        includeThirdPlace: true,
        legTarget,
        distanceMode: distMode
      });
    }

    const clearedMatches = rawMatches.map((m) => ({
      ...m,
      id: m.id.startsWith(currentTournament.id) ? m.id : `${currentTournament.id}-${m.id}`,
      nextMatchId: m.nextMatchId ? (m.nextMatchId.startsWith(currentTournament.id) ? m.nextMatchId : `${currentTournament.id}-${m.nextMatchId}`) : undefined,
      loserNextMatchId: m.loserNextMatchId ? (m.loserNextMatchId.startsWith(currentTournament.id) ? m.loserNextMatchId : `${currentTournament.id}-${m.loserNextMatchId}`) : undefined,
      player1: undefined,
      player2: undefined,
      scoreP1: 0,
      scoreP2: 0,
      winnerId: undefined,
      status: 'SCHEDULED' as const
    }));

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== currentTournament.id) return t;
        return {
          ...t,
          matches: clearedMatches,
          podium: {}
        };
      });
      saveStoredTournaments(updated);
      const updatedTourney = updated.find((t) => t.id === currentTournament.id);
      if (updatedTourney) saveTournamentToCloud(updatedTourney);
      return updated;
    });
  };

  // Motor Nakka N01: Confirmar asignación manual slot a slot
  const handleConfirmSlotAssign = (choice: { player?: any; isBye?: boolean; isClear?: boolean }) => {
    if (!currentTournament || !slotAssignTarget) return;
    const { match, slotIndex } = slotAssignTarget;

    setTournaments((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== currentTournament.id || !t.matches) return t;

        let updatedMatches = t.matches.map((m) => {
          if (m.id !== match.id) return m;

          const newMatch = { ...m };
          if (choice.isClear) {
            if (slotIndex === 1) newMatch.player1 = undefined;
            else newMatch.player2 = undefined;
            newMatch.scoreP1 = 0;
            newMatch.scoreP2 = 0;
            newMatch.winnerId = undefined;
            newMatch.status = 'SCHEDULED';
          } else if (choice.isBye) {
            if (slotIndex === 1) newMatch.player1 = undefined;
            else newMatch.player2 = undefined;
          } else if (choice.player) {
            const assignedPlayer = {
              id: choice.player.id,
              name: choice.player.name || choice.player.fullName,
              nickname: choice.player.nickname,
              avatarUrl: choice.player.avatarUrl || '/logos/logo-mdq.png',
              seed: choice.player.seed,
              nationality: choice.player.nationality || 'Argentina',
              countryCode: choice.player.countryCode || 'AR'
            };
            if (slotIndex === 1) newMatch.player1 = assignedPlayer;
            else newMatch.player2 = assignedPlayer;
          }
          return newMatch;
        });

        // Si se asignó un BYE y en el otro slot hay un jugador, auto-avanzar con reportResult
        const targetMatch = updatedMatches.find((m) => m.id === match.id);
        if (targetMatch && choice.isBye) {
          const activePlayer = slotIndex === 1 ? targetMatch.player2 : targetMatch.player1;
          if (activePlayer) {
            updatedMatches = reportResult(updatedMatches, targetMatch.id, {
              scoreP1: slotIndex === 1 ? 0 : (targetMatch.legTarget || 3),
              scoreP2: slotIndex === 1 ? (targetMatch.legTarget || 3) : 0,
              winnerId: activePlayer.id,
              note: 'Pase Automático (BYE)'
            });
          }
        }

        const format = t.format === 'DOUBLE_ELIMINATION' ? 'DOUBLE_ELIMINATION' : 'SINGLE_ELIMINATION';
        const calculatedPodium = computePodium(updatedMatches, format);

        return {
          ...t,
          matches: updatedMatches,
          podium: calculatedPodium
        };
      });

      saveStoredTournaments(updated);
      const updatedTourney = updated.find((t) => t.id === currentTournament.id);
      if (updatedTourney) saveTournamentToCloud(updatedTourney);
      return updated;
    });

    setSlotAssignTarget(null);
  };

  // Administrador: Eliminar Torneo Activo
  const handleDeleteTournament = (tourneyId: string, tourneyTitle: string) => {
    if (!isAdmin) {
      alert('Solo un administrador designado o Superadmin puede eliminar torneos.');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar el torneo "${tourneyTitle}"? Esta acción no se puede deshacer.`)) {
      setTournaments((prev) => {
        const filtered = prev.filter((t) => t.id !== tourneyId);
        saveStoredTournaments(filtered);
        deleteTournamentFromCloud(tourneyId);
        return filtered;
      });
      if (selectedTournamentId === tourneyId) {
        setSelectedTournamentId(null);
        setActiveViewMode('TABLE');
      }
    }
  };

  // Administrador: Eliminar Liga Oficial o Local
  const handleDeleteLeague = (leagueId: string, leagueTitle: string) => {
    if (!isAdmin) {
      alert('Solo un administrador designado o Superadmin puede eliminar ligas.');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar la liga "${leagueTitle}"? Esta acción no se puede deshacer.`)) {
      setLeagues((prev) => {
        const filtered = prev.filter((l) => l.id !== leagueId);
        saveStoredLeagues(filtered);
        return filtered;
      });
    }
  };

  // Administrador / Nakka Style: Iniciar Sesión (Cerrar Inscripción) o Reabrirla
  const handleToggleTournamentSession = (tourney: Tournament) => {
    if (!isAdmin) {
      alert('Solo los administradores oficiales pueden controlar el estado de sesión del torneo.');
      return;
    }

    if (tourney.status === 'REGISTRATION_OPEN') {
      const hasEnrolled = (tourney.enrolledPlayers && tourney.enrolledPlayers.length > 0) || (tourney.registeredCount && tourney.registeredCount > 0);
      if (!hasEnrolled) {
        if (!confirm('Este torneo no cuenta con jugadores inscriptos aún. ¿Deseas iniciarlo de todas formas con los slots por acreditar?')) {
          return;
        }
      }

      const updatedTourney: Tournament = {
        ...tourney,
        status: 'IN_PROGRESS'
      };

      setTournaments((prev) => {
        const next = prev.map((t) => (t.id === tourney.id ? updatedTourney : t));
        saveStoredTournaments(next);
        saveTournamentToCloud(updatedTourney);
        return next;
      });
    } else if (tourney.status === 'IN_PROGRESS') {
      // Reabrir inscripción (si no hay partidos jugados o terminados)
      const hasPlayedMatches = tourney.matches?.some((m) => m.status === 'LIVE' || m.status === 'FINISHED');
      if (hasPlayedMatches) {
        alert('No es posible reabrir la inscripción porque el torneo ya cuenta con partidos disputados o en vivo.');
        return;
      }

      if (confirm(`¿Deseas reabrir las inscripciones para "${tourney.title}"? Los jugadores podrán volver a anotarse.`)) {
        const updatedTourney: Tournament = {
          ...tourney,
          status: 'REGISTRATION_OPEN'
        };

        setTournaments((prev) => {
          const next = prev.map((t) => (t.id === tourney.id ? updatedTourney : t));
          saveStoredTournaments(next);
          saveTournamentToCloud(updatedTourney);
          return next;
        });
      }
    }
  };

  // Guardar Torneo Editado con validación de estabilidad y regeneración segura si aplica
  const handleSaveEditedTournament = (updatedTourney: Tournament, shouldRegenerateMatches: boolean) => {
    let finalTourney = { ...updatedTourney };

    if (shouldRegenerateMatches) {
      const participants: Participant[] = (updatedTourney.enrolledPlayers && updatedTourney.enrolledPlayers.length > 0)
        ? updatedTourney.enrolledPlayers.map((p, idx) => ({
            id: p.id,
            name: p.name,
            nickname: p.nickname,
            avatarUrl: p.avatarUrl || '/logos/logo-mdq.png',
            seed: p.seed || idx + 1,
            nationality: p.nationality || 'Argentina',
            countryCode: p.countryCode || 'AR'
          }))
        : createTournamentParticipants(updatedTourney.maxParticipants, currentUser || undefined);

      const bracketSize = getNextPowerOfTwo(updatedTourney.maxParticipants || participants.length);
      const legTarget = updatedTourney.bestOfLegs || 3;
      const distMode = updatedTourney.roundLegsConfig?.distanceMode || 'LEGS';

      let rawMatches: TournamentBracketMatch[] = [];
      if (updatedTourney.format === 'DOUBLE_ELIMINATION') {
        rawMatches = generateDoubleElimination(participants, {
          bracketSize,
          seeding: 'RANKED',
          legTarget,
          distanceMode: distMode
        });
      } else {
        rawMatches = generateSingleElimination(participants, {
          bracketSize,
          seeding: 'RANKED',
          includeThirdPlace: true,
          legTarget,
          distanceMode: distMode
        });
      }

      const namespacedMatches = rawMatches.map((m) => ({
        ...m,
        id: m.id.startsWith(updatedTourney.id) ? m.id : `${updatedTourney.id}-${m.id}`,
        nextMatchId: m.nextMatchId ? (m.nextMatchId.startsWith(updatedTourney.id) ? m.nextMatchId : `${updatedTourney.id}-${m.nextMatchId}`) : undefined,
        loserNextMatchId: m.loserNextMatchId ? (m.loserNextMatchId.startsWith(updatedTourney.id) ? m.loserNextMatchId : `${updatedTourney.id}-${m.loserNextMatchId}`) : undefined
      }));

      finalTourney.matches = namespacedMatches;
    }

    setTournaments((prev) => {
      const next = prev.map((t) => (t.id === finalTourney.id ? finalTourney : t));
      saveStoredTournaments(next);
      saveTournamentToCloud(finalTourney);
      return next;
    });
  };

  // Guardar Liga Editada
  const handleSaveEditedLeague = (updatedLeague: League) => {
    setLeagues((prev) => {
      const next = prev.map((l) => (l.id === updatedLeague.id ? updatedLeague : l));
      saveStoredLeagues(next);
      return next;
    });
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
          highestAvgPlayer: champion?.name || 'Mariano Deux (ICEMAN)',
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
    // Vacío en producción
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

    const roundLegsConfig: RoundLegsConfig = {
      distanceMode: newDistanceMode,
      legsPerSet: newDistanceMode === 'SETS' ? newLegsPerSet : undefined,
      quarterFinals: newQuarterLegs,
      semiFinals: newSemiLegs,
      finals: newFinalsLegs,
      losersRound: newLosersRoundLegs,
      losersFinals: newLosersFinalsLegs,
      grandFinal: newGrandFinalLegs
    };

    let newMatches: TournamentBracketMatch[] = [];
    if (newFormat === 'SINGLE_ELIMINATION') {
      newMatches = generateDefaultBracket(newId, roundLegsConfig, newBestOfLegs, newMaxParticipants, currentUser);
    } else if (newFormat === 'DOUBLE_ELIMINATION') {
      newMatches = generateDoubleEliminationBracket(newId, roundLegsConfig, newBestOfLegs, newMaxParticipants, currentUser);
    }

    const selectedLeague = newCompetitionMode === 'LOCAL_LEAGUE'
      ? leagues.find((l) => l.id === newLeagueId)
      : (newCompetitionMode === 'NATIONAL_LEAGUE' ? leagues.find((l) => l.scope === 'NATIONAL') : undefined);

    const pointsMultiplier = newCompetitionMode === 'NATIONAL_LEAGUE' && newNationalStageType === 'PRESENCIAL_OFICIAL' ? 2 : 1;

    const newTourney: Tournament = {
      id: newId,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newTitle,
      description: `Torneo oficial de competición federada. Modalidad ${newType.toLowerCase()}, formato ${newFormat === 'DOUBLE_ELIMINATION' ? 'Doble Eliminación' : newFormat === 'ROUND_ROBIN' ? 'Liga / Grupos' : 'Eliminación Simple'}.`,
      type: newType,
      format: newFormat,
      podium: {},
      competitionMode: newCompetitionMode,
      leagueId: selectedLeague?.id,
      leagueName: selectedLeague?.name,
      nationalStageType: newCompetitionMode === 'NATIONAL_LEAGUE' ? newNationalStageType : undefined,
      pointsMultiplier,
      startingScore: 501,
      outMode: 'DOUBLE_OUT',
      bestOfLegs: newBestOfLegs,
      roundLegsConfig,
      groupsCount: newGroupsCount,
      playersPerGroup: newPlayersPerGroup,
      qualifiersPerGroup: newQualifiersPerGroup,
      doubleRoundRobin: newDoubleRoundRobin,
      tiebreakerDifference: newTiebreakerDifference,
      maxParticipants: newMaxParticipants,
      registeredCount: 1,
      enrolledPlayers: [
        {
          id: currentUser.id,
          name: currentUser.fullName,
          nickname: currentUser.nickname,
          avatarUrl: currentUser.avatarUrl || '/images/iceman-perfil.png',
          seed: 1,
          avg: currentUser.estimatedAvg || 48,
          nationality: currentUser.nationality || 'Argentina',
          countryCode: currentUser.countryCode || 'AR',
          enrolledAt: new Date().toISOString()
        }
      ],
      venueName: newVenue,
      city: newCity,
      province: newProvince,
      startDate: new Date().toISOString(),
      status: 'REGISTRATION_OPEN',
      bannerImageUrl: '/logos/logo-mdq.png',
      isPaid: newIsPaid,
      entryFeeArs: newIsPaid ? newEntryFee : 0,
      prizePoolArs: newIsPaid ? newPrizePool : 0,
      prizesBreakdown: newIsPaid ? {
        first: Math.round(newPrizePool * 0.60),
        second: Math.round(newPrizePool * 0.30),
        third: Math.round(newPrizePool * 0.10)
      } : undefined,
      organizer: selectedLeague ? selectedLeague.organizerClub : 'Locos por los Dardos & Darderos Mar del Plata',
      matches: newMatches
    };

    const updated = [newTourney, ...tournaments];
    setTournaments(updated);
    saveStoredTournaments(updated);
    saveTournamentToCloud(newTourney);

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
                {currentTournament?.title ? `${currentTournament.title} • Diana Asignada` : 'Partida individual'}
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-[#0f1422] border border-[#1e2a40] p-1.5 sm:p-2 rounded-2xl gap-2 sm:gap-3">
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setMainTab('ACTIVE_TAB');
                }}
                className={`flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider transition-all min-w-0 ${
                  mainTab === 'ACTIVE_TAB'
                    ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">Torneos Activos</span>
                <span className="truncate sm:hidden">Activos</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black min-w-[18px] text-center ${
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
                className={`flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider transition-all min-w-0 ${
                  mainTab === 'LEAGUES_TAB'
                    ? 'bg-[#ffe600] text-[#07090e] shadow-lg shadow-[#ffe600]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffe600] flex-shrink-0" />
                <span className="truncate hidden sm:inline">Ligas & Posiciones</span>
                <span className="truncate sm:hidden">Ligas</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black min-w-[18px] text-center ${
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
                className={`flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider transition-all min-w-0 ${
                  mainTab === 'HISTORY_TAB'
                    ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">Historial de Torneos</span>
                <span className="truncate sm:hidden">Historial</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black min-w-[18px] text-center ${
                  mainTab === 'HISTORY_TAB' ? 'bg-[#07090e] text-[#00e676]' : 'bg-[#1e2a40] text-slate-300'
                }`}>
                  {historyTournaments.length}
                </span>
              </button>
            </div>

            {/* Acciones de Cabecera y Badge de Administrador */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isAdmin && (
                <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444] text-[11px] sm:text-xs font-black flex-1 sm:flex-none">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">ADMIN ({currentUser.nickname || 'ICEMAN'})</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#ef4444]/25 transition-all flex-1 sm:flex-none"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] flex-shrink-0" />
                <span>+ Crear Torneo</span>
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
                                {t.isPaid === false || t.entryFeeArs === 0 ? (
                                  <div className="space-y-0.5">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-block">
                                      🎉 Gratuito
                                    </span>
                                    <div className="text-[10px] text-slate-400">
                                      Puntos de Ranking / Medallas
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <div className="font-black text-[#00e676]">
                                      ${t.prizePoolArs?.toLocaleString('es-AR')} ARS
                                    </div>
                                    <div className="text-[10px] text-amber-400 font-semibold">
                                      Inscripción: ${t.entryFeeArs?.toLocaleString('es-AR')} ARS
                                    </div>
                                    <div className="text-[9px] text-slate-400">
                                      1º: 60% • 2º: 30% • 3º: 10%
                                    </div>
                                  </div>
                                )}
                              </td>

                              <td className="py-4 px-4 whitespace-nowrap">
                                {(() => {
                                  const s = getTournamentStatusBadge(t.status);
                                  return (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm ${s.className}`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                      <span>{s.label}</span>
                                    </span>
                                  );
                                })()}
                              </td>

                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {/* Botón Copiar Link Directo de Inscripción */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyEnrollLink(t, e)}
                                    className={`px-2.5 py-1.5 rounded-xl border font-black text-xs flex items-center gap-1 transition-all ${
                                      copiedTournamentId === t.id
                                        ? 'bg-[#00e676] text-black border-[#00e676] shadow-md shadow-[#00e676]/30'
                                        : 'bg-[#111622] hover:bg-[#1a2234] text-slate-200 border-slate-700 hover:border-[#00e676]'
                                    }`}
                                    title="Copiar enlace directo de inscripción para compartir"
                                  >
                                    {copiedTournamentId === t.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>¡Copiado!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Share2 className="w-3.5 h-3.5 text-[#00e676]" />
                                        <span className="hidden sm:inline">Compartir</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Botón WhatsApp Directo */}
                                  <a
                                    href={getWhatsAppShareUrl(t)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 transition-colors flex items-center justify-center shadow-sm"
                                    title="Invitar por WhatsApp con enlace directo a inscripción"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>

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
                                        onClick={() => setTournamentToEdit(t)}
                                        className="p-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/40 transition-colors"
                                        title="Editar Torneo (Nombre, Fechas, Sede, Distancia, Premios)"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleTournamentSession(t)}
                                        className={`p-1.5 rounded-xl border transition-colors ${
                                          t.status === 'REGISTRATION_OPEN'
                                            ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border-amber-500/40'
                                            : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/40'
                                        }`}
                                        title={
                                          t.status === 'REGISTRATION_OPEN'
                                            ? 'Cerrar Inscripción e Iniciar Sesión (Nakka style)'
                                            : 'Reabrir Inscripción'
                                        }
                                      >
                                        {t.status === 'REGISTRATION_OPEN' ? (
                                          <Lock className="w-3.5 h-3.5" />
                                        ) : (
                                          <Unlock className="w-3.5 h-3.5" />
                                        )}
                                      </button>

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
                          {(() => {
                            const s = getTournamentStatusBadge(currentTournament.status);
                            return (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap inline-flex items-center gap-1.5 ${s.className}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                <span>{s.label}</span>
                              </span>
                            );
                          })()}
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
                      {/* Botón Compartir Link Directo */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyEnrollLink(currentTournament, e)}
                        className={`px-3 py-2 rounded-xl border font-black text-xs flex items-center gap-1.5 transition-all ${
                          copiedTournamentId === currentTournament.id
                            ? 'bg-[#00e676] text-black border-[#00e676] shadow-md shadow-[#00e676]/30'
                            : 'bg-[#111622] hover:bg-[#1a2234] text-slate-200 border-slate-700 hover:border-[#00e676]'
                        }`}
                        title="Copiar enlace para invitar a otros jugadores"
                      >
                        {copiedTournamentId === currentTournament.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡Link Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 text-[#00e676]" />
                            <span>Compartir Link</span>
                          </>
                        )}
                      </button>

                      {/* Botón WhatsApp */}
                      <a
                        href={getWhatsAppShareUrl(currentTournament)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                        title="Enviar invitación por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>

                      {currentTournament.status === 'REGISTRATION_OPEN' ? (
                        <button
                          type="button"
                          onClick={() => setShowEnrollModal(true)}
                          className="px-3.5 py-2 bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#00e676]/20 transition-all"
                        >
                          <Users className="w-4 h-4" />
                          <span>+ Inscribirme</span>
                        </button>
                      ) : (
                        <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Inscripción Cerrada ({currentTournament.status === 'IN_PROGRESS' ? 'En Sesión' : 'Finalizado'})</span>
                        </div>
                      )}

                      {/* Controles de Administrador: Poner en Sesión y Editar Torneo */}
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleTournamentSession(currentTournament)}
                            className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 border transition-all ${
                              currentTournament.status === 'REGISTRATION_OPEN'
                                ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border-amber-500/40 shadow-sm'
                                : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/40 shadow-sm'
                            }`}
                            title={
                              currentTournament.status === 'REGISTRATION_OPEN'
                                ? 'Cerrar inscripciones e iniciar sesión del torneo (Nakka style)'
                                : 'Reabrir inscripciones si aún no se jugaron partidos'
                            }
                          >
                            {currentTournament.status === 'REGISTRATION_OPEN' ? (
                              <>
                                <Lock className="w-4 h-4 text-amber-400" />
                                <span>Iniciar Sesión (Cerrar Cupo)</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-4 h-4 text-emerald-400" />
                                <span>Reabrir Inscripción</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setTournamentToEdit(currentTournament)}
                            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                            title="Editar nombre, sede, fechas, premios y parámetros de juego"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Editar Torneo</span>
                          </button>
                        </>
                      )}

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
                        Inscriptos ({tournamentEnrolledList.length}/{currentTournament.maxParticipants})
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
                            Toca cualquier partido activo para abrir el Anotador en Vivo. {isAdmin && 'Como administrador, pulsa Asignación Automática (Nakka N01) o toca cualquier slot para sembrarlo manualmente.'}
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
                          podium={currentTournament.podium}
                          prizesBreakdown={currentTournament.prizesBreakdown}
                          enrolledCount={tournamentEnrolledList.length}
                          onAutoAssign={handleAutoAssignBracket}
                          onClearBracket={handleClearBracket}
                          onAssignSlot={(match, slotIndex) => setSlotAssignTarget({ match, slotIndex })}
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
                      groupsCount={currentTournament.groupsCount || 2}
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
                            Lista de Jugadores Inscriptos y Acreditados ({tournamentEnrolledList.length})
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
                        {tournamentEnrolledList.map((p, idx) => (
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
              isAdmin={isAdmin}
              onDeleteLeague={handleDeleteLeague}
              onEditLeague={(league) => setLeagueToEdit(league)}
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
                          onClick={() => handleOpenPlayerDetail(currentHistoryTournament.stats?.runnerUpName || 'Subcampeón')}
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
                              {currentHistoryTournament.stats?.runnerUpName || 'Subcampeón'}
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
                            {currentHistoryTournament.stats.bestLegPlayer || 'Subcampeón'}
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
                        podium={currentHistoryTournament.podium}
                        prizesBreakdown={currentHistoryTournament.prizesBreakdown}
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
        allMatches={currentTournament?.matches}
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
        tournament={currentTournament}
        onEnrollPlayer={handleEnrollPlayer}
      />

      {/* MODAL: WEBCAM */}
      <WebcamSetupModal
        isOpen={showWebcamModal}
        onClose={() => setShowWebcamModal(false)}
      />

      {/* MODAL: CREAR TORNEO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-5 flex justify-center items-start sm:items-center">
          <form
            onSubmit={handleCreateTournament}
            className="w-full max-w-lg bg-[#07090e] border-2 border-[#ef4444] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y"
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
                  <label className="text-slate-300 font-bold block mb-1">Formato de Competición *</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#00e676]"
                  >
                    <option value="SINGLE_ELIMINATION">Eliminación Simple (Cuadro)</option>
                    <option value="DOUBLE_ELIMINATION">Doble Eliminación (Ganadores y Perdedores)</option>
                    <option value="ROUND_ROBIN">Liga / Fase de Grupos</option>
                  </select>
                </div>
              </div>

              {/* SI ES FORMATO LIGA / GRUPOS: CONFIGURACIÓN DE ZONAS (ESTILO OFICIAL) */}
              {newFormat === 'ROUND_ROBIN' && (
                <div className="bg-[#111622] p-3 rounded-2xl border border-[#00e676]/40 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-white font-black text-xs">
                    <Users className="w-4 h-4 text-[#00e676]" />
                    <span>Configuración de Zonas / Grupos (Liga)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Nº de Grupos</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={newGroupsCount}
                        onChange={(e) => setNewGroupsCount(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1.5 text-white text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Jugadores x Grupo</label>
                      <input
                        type="number"
                        min="2"
                        max="16"
                        value={newPlayersPerGroup}
                        onChange={(e) => setNewPlayersPerGroup(Math.max(2, Number(e.target.value)))}
                        className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1.5 text-white text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Pasan a Playoffs</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={newQualifiersPerGroup}
                        onChange={(e) => setNewQualifiersPerGroup(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1.5 text-white text-xs text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-slate-800 text-[11px]">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDoubleRoundRobin}
                        onChange={(e) => setNewDoubleRoundRobin(e.target.checked)}
                        className="rounded border-slate-700 text-[#00e676] focus:ring-0"
                      />
                      <span>Ida y vuelta (partidos ida y revancha)</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTiebreakerDifference}
                        onChange={(e) => setNewTiebreakerDifference(e.target.checked)}
                        className="rounded border-slate-700 text-[#00e676] focus:ring-0"
                      />
                      <span>Priorizar diferencia de legs (+/-) en la clasificación</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TOGGLE Y PANEL DE CONFIGURACIÓN DETALLADA POR INSTANCIA DE LLAVE */}
              <div className="bg-[#111622] p-3 rounded-2xl border border-slate-800 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowDetailedConfig(!showDetailedConfig)}
                  className="w-full flex items-center justify-between text-xs font-black text-white hover:text-[#00e676] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-[#ffe600]" />
                    <span>Configuración detallada por instancia de llave</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {showDetailedConfig ? '▲ Ocultar' : '▼ Configurar Distancia x Ronda'}
                  </span>
                </button>

                {showDetailedConfig && (
                  <div className="space-y-3 pt-2.5 border-t border-slate-800 animate-in fade-in">
                    {/* Selector de Modo de Distancia: Solo Legs vs Sets */}
                    <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">Medida de Distancia:</span>
                        <div className="flex items-center gap-1 bg-[#111622] p-0.5 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            onClick={() => setNewDistanceMode('LEGS')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${
                              newDistanceMode === 'LEGS'
                                ? 'bg-[#00e676] text-black shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            🎯 Solo Legs
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewDistanceMode('SETS')}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${
                              newDistanceMode === 'SETS'
                                ? 'bg-[#ffe600] text-black shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            🏆 Sets + Legs
                          </button>
                        </div>
                      </div>

                      {newDistanceMode === 'SETS' ? (
                        <div className="p-2.5 rounded-lg bg-[#ffe600]/10 border border-[#ffe600]/25 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-white font-bold block">Legs requeridos por Set:</span>
                            <span className="text-[10px] text-slate-400">
                              (Ej: 5 legs = gana el set quien consiga {Math.ceil(newLegsPerSet / 2)} legs)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <input
                              type="number"
                              min="1"
                              max="11"
                              step="2"
                              value={newLegsPerSet}
                              onChange={(e) => setNewLegsPerSet(Math.max(1, Number(e.target.value)))}
                              className="w-14 bg-[#07090e] border border-[#ffe600]/50 rounded-lg px-2 py-1 text-center font-black text-xs text-[#ffe600]"
                            />
                            <span className="text-[10px] text-slate-400 font-bold">Legs/Set</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 leading-snug">
                          Partidas a distancia directa por legs (ej: Al mejor de 5 legs = gana quien llegue primero a 3 legs).
                        </div>
                      )}
                    </div>

                    {newFormat === 'DOUBLE_ELIMINATION' ? (
                      <div className="space-y-3">
                        {/* CUADRO DE GANADORES */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#00e676] flex items-center justify-between">
                            <span>Cuadro de Ganadores (Por Arriba)</span>
                            <span className="text-slate-500 font-normal">
                              {newDistanceMode === 'SETS' ? 'Sets para ganar' : 'Legs al mejor de'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                                Cuartos ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="15"
                                value={newQuarterLegs}
                                onChange={(e) => setNewQuarterLegs(Number(e.target.value))}
                                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-white text-xs text-center font-bold"
                              />
                              <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                                1º a {Math.ceil(newQuarterLegs / 2)}
                              </span>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                                Semis ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="15"
                                value={newSemiLegs}
                                onChange={(e) => setNewSemiLegs(Number(e.target.value))}
                                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-white text-xs text-center font-bold"
                              />
                              <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                                1º a {Math.ceil(newSemiLegs / 2)}
                              </span>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                                Final Ganadores ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="15"
                                value={newFinalsLegs}
                                onChange={(e) => setNewFinalsLegs(Number(e.target.value))}
                                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-white text-xs text-center font-bold"
                              />
                              <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                                1º a {Math.ceil(newFinalsLegs / 2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CUADRO DE PERDEDORES Y GRAN FINAL */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-800">
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#ef4444] flex items-center justify-between">
                            <span>Cuadro de Perdedores (Por Abajo) & Gran Final</span>
                            <span className="text-slate-500 font-normal">
                              {newDistanceMode === 'SETS' ? 'Sets para ganar' : 'Legs al mejor de'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                                Rondas Repesca ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="15"
                                value={newLosersRoundLegs}
                                onChange={(e) => setNewLosersRoundLegs(Number(e.target.value))}
                                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-white text-xs text-center font-bold"
                              />
                              <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                                1º a {Math.ceil(newLosersRoundLegs / 2)}
                              </span>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                                Final Perdedores ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="15"
                                value={newLosersFinalsLegs}
                                onChange={(e) => setNewLosersFinalsLegs(Number(e.target.value))}
                                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-white text-xs text-center font-bold"
                              />
                              <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                                1º a {Math.ceil(newLosersFinalsLegs / 2)}
                              </span>
                            </div>
                            <div>
                              <label className="text-[10px] text-amber-400 block mb-0.5 font-black">
                                Gran Final ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="19"
                                value={newGrandFinalLegs}
                                onChange={(e) => setNewGrandFinalLegs(Number(e.target.value))}
                                className="w-full bg-[#07090e] border border-amber-500 rounded-xl px-2 py-1 text-amber-300 text-xs text-center font-black"
                              />
                              <span className="text-[9px] text-amber-400/90 font-bold block text-center mt-0.5">
                                1º a {Math.ceil(newGrandFinalLegs / 2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                            Cuartos ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="15"
                            value={newQuarterLegs}
                            onChange={(e) => setNewQuarterLegs(Number(e.target.value))}
                            className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-white text-xs text-center font-bold"
                          />
                          <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                            1º a {Math.ceil(newQuarterLegs / 2)}
                          </span>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                            Semifinales ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="15"
                            value={newSemiLegs}
                            onChange={(e) => setNewSemiLegs(Number(e.target.value))}
                            className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-white text-xs text-center font-bold"
                          />
                          <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                            1º a {Math.ceil(newSemiLegs / 2)}
                          </span>
                        </div>
                        <div>
                          <label className="text-[10px] text-amber-400 block mb-0.5 font-black">
                            Gran Final ({newDistanceMode === 'SETS' ? 'Sets' : 'Legs'})
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="19"
                            value={newFinalsLegs}
                            onChange={(e) => setNewFinalsLegs(Number(e.target.value))}
                            className="w-full bg-[#07090e] border border-amber-500 rounded-xl px-2 py-1 text-amber-300 text-xs text-center font-black"
                          />
                          <span className="text-[9px] text-amber-400/90 font-bold block text-center mt-0.5">
                            1º a {Math.ceil(newFinalsLegs / 2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Legs Base (Mejor de)</label>
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
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewMaxParticipants(val);
                      if (newIsPaid) {
                        setNewPrizePool(Math.round(val * newEntryFee));
                      }
                    }}
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

              {/* MODALIDAD DE INSCRIPCIÓN Y PREMIACIÓN */}
              <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3.5 space-y-3">
                <label className="text-slate-300 font-bold text-xs block">
                  Modalidad de Inscripción y Premiación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewIsPaid(false);
                      setNewEntryFee(0);
                      setNewPrizePool(0);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      !newIsPaid 
                        ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20' 
                        : 'bg-[#07090e] text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span>🎉 Gratuito (Sin Costo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewIsPaid(true);
                      const defaultFee = 10000;
                      setNewEntryFee(defaultFee);
                      setNewPrizePool(newMaxParticipants * defaultFee);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      newIsPaid 
                        ? 'bg-amber-400 text-[#07090e] shadow-lg shadow-amber-400/20' 
                        : 'bg-[#07090e] text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span>💰 Con Inscripción ($ ARS)</span>
                  </button>
                </div>

                {newIsPaid ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-xs">
                          Inscripción ($ ARS)
                        </label>
                        <input
                          type="number"
                          min="500"
                          step="500"
                          value={newEntryFee}
                          onChange={(e) => {
                            const fee = Math.max(0, Number(e.target.value));
                            setNewEntryFee(fee);
                            setNewPrizePool(Math.round(newMaxParticipants * fee));
                          }}
                          className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-xs">
                          Pozo Estimado ($ ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={newPrizePool}
                          onChange={(e) => setNewPrizePool(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-[#00e676] text-xs font-black focus:outline-none focus:border-[#00e676]"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>⚡ Auto-calculado: Cupo ({newMaxParticipants}) × Inscripción (${newEntryFee.toLocaleString('es-AR')}) = ${(newMaxParticipants * newEntryFee).toLocaleString('es-AR')}</span>
                      <span className="text-amber-400 font-semibold">(Editable)</span>
                    </p>

                    {/* DESGLOSE OFICIAL: 60% 1º, 30% 2º, 10% 3º */}
                    <div className="bg-[#07090e] border border-amber-500/30 rounded-xl p-2.5">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>🏆 Distribución Oficial de Premios</span>
                        <span className="text-slate-400 font-normal">Pozo: ${newPrizePool.toLocaleString('es-AR')} ARS</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-[#111622] border border-amber-500/40 rounded-lg p-2">
                          <div className="text-[10px] font-black text-amber-400">🥇 1º Puesto (60%)</div>
                          <div className="text-xs font-black text-white mt-1">
                            ${Math.round(newPrizePool * 0.60).toLocaleString('es-AR')}
                          </div>
                        </div>
                        <div className="bg-[#111622] border border-slate-600 rounded-lg p-2">
                          <div className="text-[10px] font-black text-slate-300">🥈 2º Puesto (30%)</div>
                          <div className="text-xs font-black text-white mt-1">
                            ${Math.round(newPrizePool * 0.30).toLocaleString('es-AR')}
                          </div>
                        </div>
                        <div className="bg-[#111622] border border-amber-700/40 rounded-lg p-2">
                          <div className="text-[10px] font-black text-amber-600">🥉 3º Puesto (10%)</div>
                          <div className="text-xs font-black text-white mt-1">
                            ${Math.round(newPrizePool * 0.10).toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#07090e] border border-emerald-500/20 rounded-xl text-center">
                    <span className="text-xs font-bold text-emerald-400">
                      🎉 Torneo abierto gratuito sin costo de inscripción. Se disputarán puntos de ranking y medallas federativas.
                    </span>
                  </div>
                )}
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

      {/* MODAL: INSCRIPCIÓN OFICIAL AL TORNEO */}
      <PlayerEnrollModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        tournament={currentTournament}
        onEnrollPlayer={handleEnrollPlayer}
      />

      {/* MODAL: ASIGNACIÓN DE SLOT ESTILO NAKKA N01 */}
      <SlotAssignModal
        isOpen={Boolean(slotAssignTarget)}
        onClose={() => setSlotAssignTarget(null)}
        match={slotAssignTarget?.match || null}
        slotIndex={slotAssignTarget?.slotIndex || 1}
        enrolledPlayers={tournamentEnrolledList}
        communityPlayers={communityPlayers}
        onAssign={handleConfirmSlotAssign}
      />

      {/* MODAL: EDITAR CONFIGURACIÓN DEL TORNEO */}
      <EditTournamentModal
        isOpen={Boolean(tournamentToEdit)}
        onClose={() => setTournamentToEdit(null)}
        tournament={tournamentToEdit}
        leagues={leagues}
        isAdmin={isAdmin}
        onSaveTournament={handleSaveEditedTournament}
      />

      {/* MODAL: EDITAR CONFIGURACIÓN DE LA LIGA */}
      <EditLeagueModal
        isOpen={Boolean(leagueToEdit)}
        onClose={() => setLeagueToEdit(null)}
        league={leagueToEdit}
        onSaveLeague={handleSaveEditedLeague}
      />
    </div>
  );
};
