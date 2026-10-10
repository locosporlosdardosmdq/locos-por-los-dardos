'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tournament, TournamentBracketMatch, TournamentFormat, TournamentType } from '@/lib/types';
import { MOCK_TOURNAMENTS, PROVINCIAS_ARGENTINA } from '@/lib/constants';
import { TournamentBracket } from './TournamentBracket';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Shuffle, 
  CheckCircle2, 
  Radio, 
  SlidersHorizontal 
} from 'lucide-react';

export const TournamentManager: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(MOCK_TOURNAMENTS[0].id);
  const [activeTab, setActiveTab] = useState<'BRACKET' | 'GROUPS' | 'PLAYERS'>('BRACKET');
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  // Actualizar resultados en vivo del bracket
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

        // Si hay ganador, avanzar al siguiente cuadro (e.g. de cuartos m1 a semifinal sem1)
        if (winnerId) {
          const match = t.matches.find((m) => m.id === matchId);
          if (match && match.round === 1) {
            // Avanzar a ronda 2
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
      description: `Torneo oficial organizado bajo formato Nakka n01. Modalidad ${newType.toLowerCase()}, mejor de ${newBestOfLegs} legs.`,
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
      {/* Barra de Selección de Torneos & Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c1222] border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900 p-1 flex-shrink-0">
            <Image
              src={currentTournament.bannerImageUrl}
              alt={currentTournament.title}
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {currentTournament.type}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {currentTournament.format.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {currentTournament.title}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentTournament.venueName} • {currentTournament.city}, {currentTournament.province}</span>
            </p>
          </div>
        </div>

        {/* Selector y Botón Crear */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
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
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Torneo</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Torneo: Cuadro / Grupos / Jugadores */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('BRACKET')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'BRACKET'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Cuadro de Eliminación (Brackets)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GROUPS')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'GROUPS'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Fase de Grupos (Round Robin)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PLAYERS')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'PLAYERS'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Inscriptos ({currentTournament.registeredCount}/{currentTournament.maxParticipants})
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Premio: <strong>${currentTournament.prizePoolArs.toLocaleString('es-AR')} ARS</strong>
          </span>
          <span>•</span>
          <span>Inscripción: <strong>${currentTournament.entryFeeArs.toLocaleString('es-AR')} ARS</strong></span>
        </div>
      </div>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      {activeTab === 'BRACKET' && (
        <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Llave Eliminatoria en Tiempo Real (Estilo Nakka n01)
              </h3>
              <p className="text-xs text-slate-400">
                Haz clic en el botón '+' para actualizar piernas ganadas o registrar el paso a la siguiente ronda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert('Emparejamientos recalculados por seed y sorteo oficial.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
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
            <div className="text-center py-12 text-slate-500 text-sm">
              Las llaves para este torneo se generarán al cerrar las inscripciones.
            </div>
          )}
        </div>
      )}

      {activeTab === 'GROUPS' && (
        <div className="space-y-6">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Grupo A • Sede Mar del Plata
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold border-b border-slate-800">
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
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {[
                    { name: 'Facundo "El Halcón" López', pj: 3, pg: 3, pp: 0, lp: 12, lm: 3, dif: '+9', pts: 6, q: true },
                    { name: 'Lucas "Bullseye" Pereyra', pj: 3, pg: 2, pp: 1, lp: 9, lm: 7, dif: '+2', pts: 4, q: true },
                    { name: 'Carlos "180" Méndez', pj: 3, pg: 1, pp: 2, lp: 6, lm: 10, dif: '-4', pts: 2, q: false },
                    { name: 'Rodrigo Morales', pj: 3, pg: 0, pp: 3, lp: 3, lm: 12, dif: '-9', pts: 0, q: false },
                  ].map((row, idx) => (
                    <tr key={idx} className={row.q ? 'bg-emerald-950/20' : ''}>
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          row.q ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        {row.name}
                      </td>
                      <td className="py-3 px-3 text-center">{row.pj}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">{row.pg}</td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">{row.pp}</td>
                      <td className="py-3 px-3 text-center">{row.lp}</td>
                      <td className="py-3 px-3 text-center">{row.lm}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{row.dif}</td>
                      <td className="py-3 px-4 text-center font-mono font-black text-emerald-400 text-sm">
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
        <div className="bg-[#0b101c] border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Lista Oficial de Inscriptos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { seed: 1, name: 'Facundo López', nick: 'El Halcón MDQ', prov: 'Buenos Aires', cat: 'AVANZADA', paid: true },
              { seed: 2, name: 'Martín Rossi', nick: 'Sniper CABA', prov: 'CABA', cat: 'ELITE', paid: true },
              { seed: 3, name: 'Diego Gómez', nick: 'Tungsteno Rosario', prov: 'Santa Fe', cat: 'AVANZADA', paid: true },
              { seed: 4, name: 'Lucas Pereyra', nick: 'Bullseye Córdoba', prov: 'Córdoba', cat: 'AVANZADA', paid: true },
              { seed: 5, name: 'Carlos Méndez', nick: 'Charly 180 MDQ', prov: 'Buenos Aires', cat: 'INTERMEDIA', paid: true },
              { seed: 6, name: 'Rodrigo Morales', nick: 'El Rayo Cuyano', prov: 'Mendoza', cat: 'INTERMEDIA', paid: true },
            ].map((p) => (
              <div
                key={p.seed}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      SEED #{p.seed}
                    </span>
                    <strong className="text-sm text-white">{p.name}</strong>
                  </div>
                  <span className="text-xs text-slate-400 block">{p.nick} • {p.prov}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Confirmado
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVO TORNEO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101729] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-emerald-400" />
              Crear Nuevo Torneo (Nakka n01)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configura torneos presenciales en sedes o competiciones 100% online con brackets automatizados.
            </p>

            <form onSubmit={handleCreateTournament} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1 uppercase">Título del Torneo</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Torneo Clausura Mar del Plata 501"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 uppercase">Modalidad</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                  >
                    <option value="PRESENCIAL">Presencial (Sede / Club)</option>
                    <option value="ONLINE">Online (Webcam / Discord)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 uppercase">Estructura</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
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
                  <label className="text-slate-300 font-bold block mb-1 uppercase">Best of Legs</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={newBestOfLegs}
                    onChange={(e) => setNewBestOfLegs(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1 uppercase">Cupo Jugadores</label>
                  <input
                    type="number"
                    min="8"
                    max="128"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1 uppercase">Inscripción (ARS)</label>
                  <input
                    type="number"
                    step="1000"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 uppercase">Sede / Lugar</label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1 uppercase">Ciudad</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
                >
                  Crear y Publicar Torneo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
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
