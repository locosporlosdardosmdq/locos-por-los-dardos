'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tournament, TournamentFormat, TournamentType, TournamentBracketMatch, MatchConfig } from '@/lib/types';
import { MOCK_TOURNAMENTS, MOCK_RANKINGS, MOCK_CURRENT_USER } from '@/lib/constants';
import { matchBroadcast, BroadcastMatchPayload } from '@/lib/broadcast';
import { TournamentBracket } from './TournamentBracket';
import { TournamentGroupStage, GroupMatch } from './TournamentGroupStage';
import { MatchDispatcherModal } from './MatchDispatcherModal';
import { PlayerEnrollModal } from './PlayerEnrollModal';
import { WebcamSetupModal } from './WebcamSetupModal';
import { DartScorer } from '@/components/anotador/DartScorer';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Shuffle, 
  Radio, 
  Flame, 
  Target, 
  Video, 
  CheckCircle2, 
  ArrowLeft,
  X,
  Tv,
  Calendar
} from 'lucide-react';

export const TournamentManager: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(MOCK_TOURNAMENTS[0].id);
  const [activeTab, setActiveTab] = useState<'BRACKET' | 'GROUPS' | 'PLAYERS' | 'LIVE_BOARD'>('BRACKET');

  // Transmisión en vivo
  const [liveMatch, setLiveMatch] = useState<BroadcastMatchPayload | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);

  // Partido seleccionado en bracket para dispatch
  const [selectedBracketMatch, setSelectedBracketMatch] = useState<TournamentBracketMatch | null>(null);

  // Partida en vivo activa en el Anotador Oficial
  const [activeLiveMatchConfig, setActiveLiveMatchConfig] = useState<MatchConfig | null>(null);
  const [activeLiveMatchOrigin, setActiveLiveMatchOrigin] = useState<{ type: 'BRACKET' | 'GROUP'; id: string } | null>(null);

  // Lista de inscriptos locales
  const [enrolledPlayers, setEnrolledPlayers] = useState([
    { id: MOCK_CURRENT_USER.id, name: MOCK_CURRENT_USER.fullName, nickname: MOCK_CURRENT_USER.nickname, avg: MOCK_CURRENT_USER.estimatedAvg, hasWebcam: true },
    ...MOCK_RANKINGS.map((p) => ({ id: p.id, name: p.fullName, nickname: p.nickname, avg: p.estimatedAvg, hasWebcam: true }))
  ]);

  // Formulario nuevo torneo
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TournamentType>('PRESENCIAL');
  const [newFormat, setNewFormat] = useState<TournamentFormat>('SINGLE_ELIMINATION');
  const [newBestOfLegs, setNewBestOfLegs] = useState(5);
  const [newVenue, setNewVenue] = useState('Sede Darderos Mar del Plata');
  const [newCity, setNewCity] = useState('Mar del Plata');
  const [newProvince, setNewProvince] = useState('Buenos Aires');
  const [newEntryFee, setNewEntryFee] = useState(10000);
  const [newPrizePool, setNewPrizePool] = useState(250000);
  const [newMaxParticipants, setNewMaxParticipants] = useState(32);

  useEffect(() => {
    const unsub = matchBroadcast.subscribe((data) => {
      setLiveMatch(data);
    });
    return () => unsub();
  }, []);

  const currentTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];

  // Actualizar resultado en el Cuadro Eliminatorio
  const handleUpdateMatchScore = (matchId: string, p1Score: number, p2Score: number, winnerId?: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTournamentId || !t.matches) return t;

        const updatedMatches = t.matches.map((m) => {
          if (m.id === matchId) {
            const isFinished = !!winnerId;
            return {
              ...m,
              scoreP1: p1Score,
              scoreP2: p2Score,
              winnerId,
              status: isFinished ? ('FINISHED' as const) : ('LIVE' as const)
            };
          }
          return m;
        });

        // Avanzar al ganador a la siguiente ronda si es R1 (Cuartos) o R2 (Semis)
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
      })
    );
  };

  // Lanzar partido de Grupo en el Anotador
  const handleLaunchGroupMatch = (match: GroupMatch, mode: 'LIVE' | 'ONLINE') => {
    const config: MatchConfig = {
      gameType: 'X01',
      startingScore: currentTournament.startingScore as any || 501,
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
    if (!match.player1 || !match.player2) return;

    const config: MatchConfig = {
      gameType: 'X01',
      startingScore: currentTournament.startingScore as any || 501,
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

    // Salir del modo anotador
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

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const newTourney: Tournament = {
      id: `torneo-${Date.now()}`,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newTitle,
      description: `Torneo oficial de competición federada. Modalidad ${newType.toLowerCase()}, mejor de ${newBestOfLegs} legs.`,
      type: newType,
      format: newFormat,
      startingScore: 501,
      outMode: 'DOUBLE_OUT',
      bestOfLegs: newBestOfLegs,
      maxParticipants: newMaxParticipants,
      registeredCount: 0,
      venueName: newVenue,
      city: newCity,
      province: newProvince,
      startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'REGISTRATION_OPEN',
      bannerImageUrl: '/logos/logo-mdq.png',
      entryFeeArs: newEntryFee,
      prizePoolArs: newPrizePool,
      organizer: 'Locos por los Dardos & Darderos Mar del Plata'
    };

    setTournaments([newTourney, ...tournaments]);
    setSelectedTournamentId(newTourney.id);
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

            {/* Selector y Botones de Acción */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

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

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#ef4444]/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Crear Torneo</span>
              </button>
            </div>
          </div>

          {/* Pestañas de Navegación del Torneo */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab('BRACKET')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === 'BRACKET'
                    ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/25'
                    : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Cuadro Eliminatorio (Brackets)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('GROUPS')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === 'GROUPS'
                    ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/25'
                    : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Fase de Grupos (Round Robin)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PLAYERS')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === 'PLAYERS'
                    ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/25'
                    : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Inscriptos ({enrolledPlayers.length}/{currentTournament.maxParticipants})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('LIVE_BOARD')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'LIVE_BOARD'
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
                Premio: <strong className="text-white">${currentTournament.prizePoolArs.toLocaleString('es-AR')} ARS</strong>
              </span>
              <span>•</span>
              <span>Inscripción: <strong className="text-white">${currentTournament.entryFeeArs.toLocaleString('es-AR')} ARS</strong></span>
            </div>
          </div>

          {/* CONTENIDO SEGÚN PESTAÑA */}
          {activeTab === 'BRACKET' && (
            <div className="bg-[#07090e] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#00e676]" />
                    <span>Cuadro Eliminatorio Oficial en Tiempo Real</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Toca cualquier partido activo para abrir el Anotador en Vivo o registrar el resultado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Emparejamientos recalculados por seed oficial y ranking.')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 text-xs font-bold border border-slate-700"
                >
                  <Shuffle className="w-3.5 h-3.5 text-[#00e676]" />
                  <span>Resortear Seeds</span>
                </button>
              </div>

              {currentTournament.matches && currentTournament.matches.length > 0 ? (
                <TournamentBracket
                  matches={currentTournament.matches}
                  onSelectMatch={(m) => setSelectedBracketMatch(m)}
                  onUpdateScore={handleUpdateMatchScore}
                  bestOfLegs={currentTournament.bestOfLegs}
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No hay partidos configurados para este torneo.
                </div>
              )}
            </div>
          )}

          {activeTab === 'GROUPS' && (
            <TournamentGroupStage
              tournamentTitle={currentTournament.title}
              bestOfLegs={currentTournament.bestOfLegs}
              onLaunchMatch={handleLaunchGroupMatch}
              onAdvanceToBracket={() => setActiveTab('BRACKET')}
            />
          )}

          {activeTab === 'PLAYERS' && (
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

          {activeTab === 'LIVE_BOARD' && (
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
        </>
      )}

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
          bestOfLegs={currentTournament.bestOfLegs}
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
            className="w-full max-w-md bg-[#07090e] border border-[#ef4444]/40 rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Crear Nuevo Torneo Oficial</h3>
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
                  placeholder="Ej: Open Ciudad de Mar del Plata 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Modalidad</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="PRESENCIAL">Presencial (Club)</option>
                    <option value="ONLINE">Online Conectado</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Formato</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-2.5 py-2 text-white"
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
                    value={newBestOfLegs}
                    onChange={(e) => setNewBestOfLegs(Number(e.target.value))}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Cupo Máximo</label>
                  <input
                    type="number"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(Number(e.target.value))}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Sede / Club</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs"
              >
                PUBLICAR TORNEO
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
