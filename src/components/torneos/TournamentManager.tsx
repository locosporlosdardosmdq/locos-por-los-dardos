'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tournament, TournamentFormat, TournamentType } from '@/lib/types';
import { MOCK_TOURNAMENTS } from '@/lib/constants';
import { matchBroadcast, BroadcastMatchPayload } from '@/lib/broadcast';
import { TournamentBracket } from './TournamentBracket';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Shuffle,
  Radio,
  Flame,
  Target
} from 'lucide-react';

export const TournamentManager: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(MOCK_TOURNAMENTS[0].id);
  const [activeTab, setActiveTab] = useState<'BRACKET' | 'GROUPS' | 'PLAYERS' | 'LIVE_BOARD'>('BRACKET');
  const [liveMatch, setLiveMatch] = useState<BroadcastMatchPayload | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const unsub = matchBroadcast.subscribe((data) => {
      setLiveMatch(data);
    });
    return () => unsub();
  }, []);

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

  const currentTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];

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

        if (winnerId) {
          const match = t.matches.find((m) => m.id === matchId);
          if (match && match.round === 1) {
            const targetSemi = updatedMatches.find(
              (m) => m.round === 2 && m.matchIndex === Math.floor(match.matchIndex / 2)
            );
            if (targetSemi) {
              const winningPlayer = match.player1?.id === winnerId ? match.player1 : match.player2;
              if (match.matchIndex % 2 === 0) {
                targetSemi.player1 = winningPlayer;
              } else {
                targetSemi.player2 = winningPlayer;
              }
            }
          }
        }

        return { ...t, matches: updatedMatches };
      })
    );
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
      registeredCount: 8,
      venueName: newVenue,
      city: newCity,
      province: newProvince,
      startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: 'REGISTRATION_OPEN',
      bannerImageUrl: newCity.toLowerCase().includes('mar del plata') ? '/logos/logo-mdq.png' : '/logos/dardos-argentina.png',
      entryFeeArs: newEntryFee,
      prizePoolArs: newPrizePool,
      organizer: 'Comunidad Locos por los Dardos',
      matches: [
        {
          id: `m-init-1`,
          round: 1,
          matchIndex: 0,
          player1: { id: 'p1', name: 'Facundo López', avatarUrl: '/logos/logo-mdq.png', seed: 1 },
          player2: { id: 'p2', name: 'Martín Rossi', avatarUrl: '/logos/dardos-argentina.png', seed: 8 },
          scoreP1: 0,
          scoreP2: 0,
          status: 'SCHEDULED',
          scheduledTime: '17:00'
        },
        {
          id: `m-init-2`,
          round: 1,
          matchIndex: 1,
          player1: { id: 'p3', name: 'Diego Gómez', avatarUrl: '/logos/dardos-argentina.png', seed: 4 },
          player2: { id: 'p4', name: 'Lucas Pereyra', avatarUrl: '/logos/dardos-argentina.png', seed: 5 },
          scoreP1: 0,
          scoreP2: 0,
          status: 'SCHEDULED',
          scheduledTime: '17:30'
        },
        {
          id: `m-init-sem`,
          round: 2,
          matchIndex: 0,
          scoreP1: 0,
          scoreP2: 0,
          status: 'SCHEDULED',
          scheduledTime: '19:00'
        }
      ]
    };

    setTournaments([newTourney, ...tournaments]);
    setSelectedTournamentId(newTourney.id);
    setShowCreateModal(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Barra de Selección de Torneos en Gris Oscuro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1c1f2b] border border-[#313647] rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[#00b853]/40 bg-[#14161f] p-1 flex-shrink-0">
            <Image
              src={currentTournament.bannerImageUrl}
              alt={currentTournament.title}
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#00b853]/20 text-[#00b853] border border-[#00b853]/40">
                {currentTournament.type}
              </span>
              <span className="text-[10px] font-black text-[#b8ad98] uppercase">
                {currentTournament.format.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {currentTournament.title}
            </h2>
            <p className="text-xs text-[#b8ad98] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#00b853]" />
              <span>{currentTournament.venueName} • {currentTournament.city}, {currentTournament.province}</span>
            </p>
          </div>
        </div>

        {/* Selector y Botón Crear */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-[#14161f] border border-[#313647] rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00b853]"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00b853] hover:bg-[#009e47] text-[#0d0e12] font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00b853]/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear Torneo</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Torneo */}
      <div className="flex items-center justify-between border-b border-[#313647] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('BRACKET')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'BRACKET'
                ? 'bg-[#00b853] text-[#0d0e12] shadow-md shadow-[#00b853]/25'
                : 'bg-[#1c1f2b] text-[#b8ad98] hover:text-white border border-[#313647]'
            }`}
          >
            Cuadro de Eliminación (Brackets)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GROUPS')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'GROUPS'
                ? 'bg-[#00b853] text-[#0d0e12] shadow-md shadow-[#00b853]/25'
                : 'bg-[#1c1f2b] text-[#b8ad98] hover:text-white border border-[#313647]'
            }`}
          >
            Fase de Grupos (Round Robin)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PLAYERS')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'PLAYERS'
                ? 'bg-[#00b853] text-[#0d0e12] shadow-md shadow-[#00b853]/25'
                : 'bg-[#1c1f2b] text-[#b8ad98] hover:text-white border border-[#313647]'
            }`}
          >
            Inscriptos ({currentTournament.registeredCount}/{currentTournament.maxParticipants})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LIVE_BOARD')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'LIVE_BOARD'
                ? 'bg-[#e52521] text-white shadow-md shadow-[#e52521]/25'
                : 'bg-[#1c1f2b] text-[#b8ad98] hover:text-white border border-[#313647]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#e52521] animate-ping" />
            <span>Tablero en Vivo</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#b8ad98]">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#00b853]" />
            Premio: <strong>${currentTournament.prizePoolArs.toLocaleString('es-AR')} ARS</strong>
          </span>
          <span>•</span>
          <span>Inscripción: <strong>${currentTournament.entryFeeArs.toLocaleString('es-AR')} ARS</strong></span>
        </div>
      </div>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      {activeTab === 'BRACKET' && (
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#00b853]" />
                Cuadro Eliminatorio Oficial en Tiempo Real
              </h3>
              <p className="text-xs text-[#b8ad98]">
                Haz clic en el botón &apos;+&apos; para actualizar piernas ganadas o registrar el paso a la siguiente ronda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert('Emparejamientos recalculados por seed y sorteo oficial.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242836] hover:bg-[#2b3040] text-[#efe7d8] text-xs font-bold border border-[#313647]"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#00b853]" />
              <span>Resortear Seeds</span>
            </button>
          </div>

          {currentTournament.matches && currentTournament.matches.length > 0 ? (
            <TournamentBracket
              matches={currentTournament.matches}
              onUpdateScore={handleUpdateMatchScore}
              bestOfLegs={currentTournament.bestOfLegs}
            />
          ) : (
            <div className="text-center py-12 text-[#b8ad98] text-sm">
              Las llaves para este torneo se generarán al cerrar las inscripciones.
            </div>
          )}
        </div>
      )}

      {activeTab === 'GROUPS' && (
        <div className="space-y-6">
          <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00b853]" />
              Grupo A • Sede Mar del Plata
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#14161f] text-[#b8ad98] uppercase font-bold border-b border-[#313647]">
                  <tr>
                    <th className="py-3 px-4">Jugador</th>
                    <th className="py-3 px-3 text-center">PJ</th>
                    <th className="py-3 px-3 text-center">PG</th>
                    <th className="py-3 px-3 text-center">PP</th>
                    <th className="py-3 px-3 text-center">Legs +</th>
                    <th className="py-3 px-3 text-center">Legs -</th>
                    <th className="py-3 px-3 text-center">Dif</th>
                    <th className="py-3 px-4 text-center">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#313647] text-[#efe7d8]">
                  {[
                    { name: 'Facundo "El Halcón" López', pj: 3, pg: 3, pp: 0, lp: 12, lm: 3, dif: '+9', pts: 6, q: true },
                    { name: 'Lucas "Bullseye" Pereyra', pj: 3, pg: 2, pp: 1, lp: 9, lm: 7, dif: '+2', pts: 4, q: true },
                    { name: 'Carlos "180" Méndez', pj: 3, pg: 1, pp: 2, lp: 6, lm: 10, dif: '-4', pts: 2, q: false },
                    { name: 'Rodrigo Morales', pj: 3, pg: 0, pp: 3, lp: 3, lm: 12, dif: '-9', pts: 0, q: false },
                  ].map((row, idx) => (
                    <tr key={idx} className={row.q ? 'bg-[#00b853]/10' : ''}>
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          row.q ? 'bg-[#00b853] text-[#0d0e12] font-black' : 'bg-[#242836] text-[#b8ad98]'
                        }`}>
                          {idx + 1}
                        </span>
                        {row.name}
                      </td>
                      <td className="py-3 px-3 text-center">{row.pj}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#00b853]">{row.pg}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#e52521]">{row.pp}</td>
                      <td className="py-3 px-3 text-center">{row.lp}</td>
                      <td className="py-3 px-3 text-center">{row.lm}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{row.dif}</td>
                      <td className="py-3 px-4 text-center font-mono font-black text-[#00b853] text-sm">
                        {row.pts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PLAYERS' && (
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 shadow-2xl">
          <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00b853]" />
            Lista Oficial de Inscriptos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { seed: 1, name: 'Facundo López', nick: 'El Halcón MDQ', prov: 'Buenos Aires', paid: true },
              { seed: 2, name: 'Martín Rossi', nick: 'Sniper CABA', prov: 'CABA', paid: true },
              { seed: 3, name: 'Diego Gómez', nick: 'Tungsteno Rosario', prov: 'Santa Fe', paid: true },
              { seed: 4, name: 'Lucas Pereyra', nick: 'Bullseye Córdoba', prov: 'Córdoba', paid: true },
              { seed: 5, name: 'Carlos Méndez', nick: 'Charly 180 MDQ', prov: 'Buenos Aires', paid: true },
              { seed: 6, name: 'Rodrigo Morales', nick: 'El Rayo Cuyano', prov: 'Mendoza', paid: true },
            ].map((p) => (
              <div
                key={p.seed}
                className="p-3.5 rounded-2xl bg-[#14161f] border border-[#313647] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#00b853]/20 text-[#00b853] border border-[#00b853]/40">
                      SEED #{p.seed}
                    </span>
                    <strong className="text-sm text-white">{p.name}</strong>
                  </div>
                  <span className="text-xs text-[#b8ad98] block">{p.nick} • {p.prov}</span>
                </div>
                <span className="text-[10px] font-bold text-[#00b853] bg-[#00b853]/15 px-2 py-0.5 rounded border border-[#00b853]/40">
                  Confirmado
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA TABLERO EN VIVO */}
      {activeTab === 'LIVE_BOARD' && (
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#313647] pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-[#e52521]/20 text-[#e52521] border border-[#e52521]/30">
                <Radio className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Espejo de Pista en Vivo (Live Oche)</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#e52521] text-white">
                    EN VIVO
                  </span>
                </h3>
                <p className="text-xs text-[#b8ad98]">
                  Transmisión dardo por dardo sincronizada en tiempo real con el Anotador Oficial.
                </p>
              </div>
            </div>

            <div className="text-xs text-[#b8ad98] bg-[#14161f] border border-[#313647] px-3.5 py-2 rounded-xl flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00b853]" />
              <span>Diana Oficial: <strong>Samurai 4</strong></span>
            </div>
          </div>

          {liveMatch ? (
            <div className="space-y-6">
              {/* Marcador Principal TV Broadcast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Jugador 1 */}
                <div className={`p-6 rounded-3xl border transition-all ${
                  liveMatch.currentTurnIndex === 0
                    ? 'bg-[#14161f] border-[#00b853] shadow-lg shadow-[#00b853]/20 ring-1 ring-[#00b853]'
                    : 'bg-[#14161f]/60 border-[#313647]'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#b8ad98]">
                      Jugador 1 {liveMatch.currentTurnIndex === 0 && '• Tirando ahora'}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-[#00b853]/20 text-[#00b853] border border-[#00b853]/40">
                      Legs: {liveMatch.player1Legs}
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white truncate mb-2">
                    {liveMatch.player1Name}
                  </h4>
                  <div className="text-5xl sm:text-6xl font-black text-[#efe7d8] font-mono tracking-tighter">
                    {liveMatch.player1Score}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#313647] flex items-center justify-between text-xs text-[#b8ad98]">
                    <span>AVG: <strong className="text-white">{liveMatch.player1Avg.toFixed(1)}</strong></span>
                    {liveMatch.status === 'FINISHED' && liveMatch.winner === liveMatch.player1Name && (
                      <span className="text-xs font-black text-[#00b853] flex items-center gap-1">
                        🏆 ¡Ganador!
                      </span>
                    )}
                  </div>
                </div>

                {/* Jugador 2 */}
                <div className={`p-6 rounded-3xl border transition-all ${
                  liveMatch.currentTurnIndex === 1
                    ? 'bg-[#14161f] border-[#00b853] shadow-lg shadow-[#00b853]/20 ring-1 ring-[#00b853]'
                    : 'bg-[#14161f]/60 border-[#313647]'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-[#b8ad98]">
                      Jugador 2 {liveMatch.currentTurnIndex === 1 && '• Tirando ahora'}
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-[#00b853]/20 text-[#00b853] border border-[#00b853]/40">
                      Legs: {liveMatch.player2Legs}
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white truncate mb-2">
                    {liveMatch.player2Name}
                  </h4>
                  <div className="text-5xl sm:text-6xl font-black text-[#efe7d8] font-mono tracking-tighter">
                    {liveMatch.player2Score}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#313647] flex items-center justify-between text-xs text-[#b8ad98]">
                    <span>AVG: <strong className="text-white">{liveMatch.player2Avg.toFixed(1)}</strong></span>
                    {liveMatch.status === 'FINISHED' && liveMatch.winner === liveMatch.player2Name && (
                      <span className="text-xs font-black text-[#00b853] flex items-center gap-1">
                        🏆 ¡Ganador!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Última jugada */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-[#313647] flex items-center justify-between text-xs">
                <span className="text-[#b8ad98]">Última Puntuación Registrada:</span>
                <span className="font-black text-[#00b853] text-sm">+{liveMatch.lastScore} pts</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-3xl bg-[#14161f] border border-[#313647] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1c1f2b] border border-[#313647] flex items-center justify-center text-[#b8ad98]">
                <Radio className="w-6 h-6 text-[#1d68ed]" />
              </div>
              <h4 className="text-base font-black text-white">
                Esperando señal del Anotador en Vivo...
              </h4>
              <p className="text-xs text-[#b8ad98] max-w-md mx-auto">
                Inicia una partida en el menú <strong>Anotador</strong> (en este dispositivo o en otra pestaña/tablet) y la transmisión de la pista aparecerá automáticamente aquí para los espectadores del club.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL CREAR NUEVO TORNEO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#14161f]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#00b853]" />
              Crear Nuevo Torneo Oficial
            </h3>
            <p className="text-xs text-[#b8ad98] mb-6">
              Configura torneos presenciales en sedes o competiciones 100% online con brackets automatizados.
            </p>

            <form onSubmit={handleCreateTournament} className="space-y-4 text-xs">
              <div>
                <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Título del Torneo</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Torneo Clausura Mar del Plata 501"
                  className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00b853]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Modalidad</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2.5 text-white"
                  >
                    <option value="PRESENCIAL">Presencial (Sede / Club)</option>
                    <option value="ONLINE">Online (Webcam / Discord)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Estructura</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2.5 text-white"
                  >
                    <option value="SINGLE_ELIMINATION">Eliminación Directa</option>
                    <option value="DOUBLE_ELIMINATION">Doble Eliminación</option>
                    <option value="ROUND_ROBIN">Fase de Grupos (Round Robin)</option>
                    <option value="HYBRID">Híbrido (Grupos + Llaves)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Best of Legs</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={newBestOfLegs}
                    onChange={(e) => setNewBestOfLegs(parseInt(e.target.value, 10))}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Cupo Jugadores</label>
                  <input
                    type="number"
                    min="8"
                    max="128"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(parseInt(e.target.value, 10))}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Inscripción (ARS)</label>
                  <input
                    type="number"
                    step="1000"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(parseFloat(e.target.value))}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Sede / Lugar</label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#efe7d8] font-bold block mb-1 uppercase">Ciudad</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#00b853] hover:bg-[#009e47] text-[#0d0e12] font-black rounded-xl text-sm transition-all shadow-md shadow-[#00b853]/20"
                >
                  Crear y Publicar Torneo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 bg-[#242836] hover:bg-[#2e3345] text-white font-bold rounded-xl text-sm border border-[#313647]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
