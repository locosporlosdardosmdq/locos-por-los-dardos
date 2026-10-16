'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tournament, 
  TournamentFormat, 
  TournamentType, 
  TournamentStatus,
  CompetitionMode,
  NationalStageType,
  RoundLegsConfig,
  League
} from '@/lib/types';
import { 
  X, 
  Trophy, 
  Lock, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Users, 
  Settings, 
  ShieldAlert, 
  Sparkles,
  Flame,
  Zap,
  Save
} from 'lucide-react';

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  leagues?: League[];
  isAdmin?: boolean;
  onSaveTournament: (updatedTourney: Tournament, shouldRegenerateMatches: boolean) => void;
}

export const EditTournamentModal: React.FC<EditTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  leagues = [],
  isAdmin = false,
  onSaveTournament
}) => {
  if (!isOpen || !tournament) return null;

  // Detectar si el torneo ya tiene desarrollo deportivo iniciado
  const hasMatchesPlayed = useMemo(() => {
    return tournament.matches?.some((m) => m.status === 'LIVE' || m.status === 'FINISHED') || false;
  }, [tournament]);

  const enrolledCount = tournament.enrolledPlayers?.length || tournament.registeredCount || 1;

  // Estados locales del formulario
  const [title, setTitle] = useState(tournament.title);
  const [description, setDescription] = useState(tournament.description);
  const [status, setStatus] = useState<TournamentStatus>(tournament.status);
  const [type, setType] = useState<TournamentType>(tournament.type);
  const [format, setFormat] = useState<TournamentFormat>(tournament.format);
  const [competitionMode, setCompetitionMode] = useState<CompetitionMode>(tournament.competitionMode || 'STANDALONE_DAY');
  const [leagueId, setLeagueId] = useState<string>(tournament.leagueId || 'league-local-mdq');
  const [nationalStageType, setNationalStageType] = useState<NationalStageType>(tournament.nationalStageType || 'ONLINE');
  const [venueName, setVenueName] = useState(tournament.venueName);
  const [city, setCity] = useState(tournament.city);
  const [province, setProvince] = useState(tournament.province);
  const [startDate, setStartDate] = useState(tournament.startDate ? tournament.startDate.slice(0, 16) : '');
  const [maxParticipants, setMaxParticipants] = useState(tournament.maxParticipants);
  const [bestOfLegs, setBestOfLegs] = useState(tournament.bestOfLegs);
  const [isPaid, setIsPaid] = useState<boolean>(tournament.isPaid !== false && tournament.entryFeeArs > 0);
  const [entryFeeArs, setEntryFeeArs] = useState(tournament.entryFeeArs || 0);
  const [prizePoolArs, setPrizePoolArs] = useState(tournament.prizePoolArs || 0);

  // Configuración de Distancia x Ronda
  const [showDetailedLegs, setShowDetailedLegs] = useState(false);
  const [quarterLegs, setQuarterLegs] = useState(tournament.roundLegsConfig?.quarterFinals || 3);
  const [semiLegs, setSemiLegs] = useState(tournament.roundLegsConfig?.semiFinals || 4);
  const [finalsLegs, setFinalsLegs] = useState(tournament.roundLegsConfig?.finals || 5);
  const [grandFinalLegs, setGrandFinalLegs] = useState(tournament.roundLegsConfig?.grandFinal || 5);

  // Sincronizar estado cuando cambia el torneo seleccionado
  useEffect(() => {
    if (tournament) {
      setTitle(tournament.title);
      setDescription(tournament.description);
      setStatus(tournament.status);
      setType(tournament.type);
      setFormat(tournament.format);
      setCompetitionMode(tournament.competitionMode || 'STANDALONE_DAY');
      setLeagueId(tournament.leagueId || 'league-local-mdq');
      setNationalStageType(tournament.nationalStageType || 'ONLINE');
      setVenueName(tournament.venueName);
      setCity(tournament.city);
      setProvince(tournament.province);
      setStartDate(tournament.startDate ? tournament.startDate.slice(0, 16) : '');
      setMaxParticipants(tournament.maxParticipants);
      setBestOfLegs(tournament.bestOfLegs);
      setIsPaid(tournament.isPaid !== false && tournament.entryFeeArs > 0);
      setEntryFeeArs(tournament.entryFeeArs || 0);
      setPrizePoolArs(tournament.prizePoolArs || 0);
      setQuarterLegs(tournament.roundLegsConfig?.quarterFinals || 3);
      setSemiLegs(tournament.roundLegsConfig?.semiFinals || 4);
      setFinalsLegs(tournament.roundLegsConfig?.finals || 5);
      setGrandFinalLegs(tournament.roundLegsConfig?.grandFinal || 5);
    }
  }, [tournament]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('El nombre del torneo no puede estar vacío.');
      return;
    }

    if (maxParticipants < enrolledCount) {
      alert(`El cupo máximo (${maxParticipants}) no puede ser menor a la cantidad de jugadores ya inscriptos (${enrolledCount}).`);
      return;
    }

    const formatChanged = format !== tournament.format;
    const shouldRegenerateMatches = !hasMatchesPlayed && formatChanged;

    const selectedLeague = competitionMode === 'LOCAL_LEAGUE'
      ? leagues.find((l) => l.id === leagueId)
      : (competitionMode === 'NATIONAL_LEAGUE' ? leagues.find((l) => l.scope === 'NATIONAL') : undefined);

    const pointsMultiplier = competitionMode === 'NATIONAL_LEAGUE' && nationalStageType === 'PRESENCIAL_OFICIAL' ? 2 : 1;

    const roundLegsConfig: RoundLegsConfig = {
      quarterFinals: quarterLegs,
      semiFinals: semiLegs,
      finals: finalsLegs,
      grandFinal: grandFinalLegs,
      distanceMode: tournament.roundLegsConfig?.distanceMode || 'LEGS'
    };

    // Si los partidos no se regeneran pero cambió la distancia, propagar legTarget a partidos pendientes
    let updatedMatches = tournament.matches;
    if (!shouldRegenerateMatches && tournament.matches && tournament.matches.length > 0) {
      updatedMatches = tournament.matches.map((m) => {
        if (m.status === 'SCHEDULED') {
          return {
            ...m,
            legTarget: m.note?.includes('Final') ? finalsLegs : m.note?.includes('Semi') ? semiLegs : bestOfLegs
          };
        }
        return m;
      });
    }

    const updatedTourney: Tournament = {
      ...tournament,
      title: title.trim(),
      description: description.trim(),
      status,
      type,
      format,
      competitionMode,
      leagueId: selectedLeague?.id,
      leagueName: selectedLeague?.name,
      nationalStageType: competitionMode === 'NATIONAL_LEAGUE' ? nationalStageType : undefined,
      pointsMultiplier,
      venueName: venueName.trim(),
      city: city.trim(),
      province: province.trim(),
      startDate: startDate ? new Date(startDate).toISOString() : tournament.startDate,
      maxParticipants,
      bestOfLegs,
      roundLegsConfig,
      isPaid,
      entryFeeArs: isPaid ? entryFeeArs : 0,
      prizePoolArs: isPaid ? prizePoolArs : 0,
      prizesBreakdown: isPaid ? {
        first: Math.round(prizePoolArs * 0.60),
        second: Math.round(prizePoolArs * 0.30),
        third: Math.round(prizePoolArs * 0.10)
      } : undefined,
      matches: updatedMatches
    };

    onSaveTournament(updatedTourney, shouldRegenerateMatches);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101d] border-2 border-blue-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-blue-500/10 overflow-hidden">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#080c16]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Editar Configuración del Torneo</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ajustes de metadatos, estado, fechas, sede y parámetros de juego
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de Diagnóstico de Estabilidad */}
        {hasMatchesPlayed ? (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Torneo con partidos disputados o en vivo:</strong> Por estabilidad e integridad del certamen, el <strong>Formato de Competición</strong> queda congelado para no romper el cuadro ni los resultados ya jugados. Puedes editar libremente nombres, sedes, fechas, premios y estado.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-blue-500/10 border-b border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Torneo en fase previa (0 partidos jugados):</strong> Puedes modificar cualquier parámetro. Si cambias de Formato (ej. a Doble Eliminación), la llave se regenerará con los inscriptos actuales.
            </div>
          </div>
        )}

        {/* Formulario Scrolleable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Nombre y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">Nombre / Título del Torneo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Estado de Competición *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="REGISTRATION_OPEN">🟢 Inscripción Abierta</option>
                <option value="IN_PROGRESS">🟡 En Juego (Cerrado)</option>
                <option value="FINISHED">⚪ Finalizado</option>
                <option value="CANCELLED">🔴 Cancelado</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">Descripción / Reglas Especiales</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Modalidad y Formato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Modalidad de Pista</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="PRESENCIAL">Presencial (En Club)</option>
                <option value="ONLINE">Online Conectado (WebRTC)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center justify-between">
                <span>Formato de Competición</span>
                {hasMatchesPlayed && (
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Bloqueado en juego
                  </span>
                )}
              </label>
              <select
                value={format}
                disabled={hasMatchesPlayed}
                onChange={(e) => setFormat(e.target.value as any)}
                className={`w-full rounded-xl px-3 py-2 font-bold focus:outline-none ${
                  hasMatchesPlayed
                    ? 'bg-[#1a2234] border border-slate-800 text-slate-400 cursor-not-allowed opacity-80'
                    : 'bg-[#111827] border border-slate-700 text-white focus:border-blue-500'
                }`}
              >
                <option value="SINGLE_ELIMINATION">Eliminación Simple (Cuadro KO)</option>
                <option value="DOUBLE_ELIMINATION">Doble Eliminación (Winners & Losers)</option>
                <option value="ROUND_ROBIN">Fase de Grupos (Liga)</option>
              </select>
            </div>
          </div>

          {/* Sede y Ubicación */}
          <div className="bg-[#0f1422] p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <MapPin className="w-4 h-4 text-[#ef4444]" />
              <span>Sede y Localidad</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <label className="text-[10px] text-slate-400 block mb-0.5">Nombre de la Sede</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Provincia</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fechas y Cupo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">Fecha y Hora de Inicio</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center justify-between">
                <span>Cupo Máximo</span>
                <span className="text-[10px] text-slate-400 font-normal">({enrolledCount} inscriptos)</span>
              </label>
              <input
                type="number"
                min={enrolledCount}
                max={64}
                value={maxParticipants}
                onChange={(e) => {
                  const val = Math.max(enrolledCount, Number(e.target.value));
                  setMaxParticipants(val);
                  if (isPaid) setPrizePoolArs(Math.round(val * entryFeeArs));
                }}
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Configuración de Costos y Premios */}
          <div className="bg-[#0f1422] p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#00e676]" />
                <span>Inscripción y Premiación</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsPaid(checked);
                    if (!checked) {
                      setEntryFeeArs(0);
                      setPrizePoolArs(0);
                    } else if (entryFeeArs === 0) {
                      setEntryFeeArs(10000);
                      setPrizePoolArs(maxParticipants * 10000);
                    }
                  }}
                  className="rounded border-slate-700 text-[#00e676] focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-300">Torneo Arancelado con Premio</span>
              </label>
            </div>

            {isPaid ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Costo de Entrada (ARS)</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={entryFeeArs}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setEntryFeeArs(val);
                        setPrizePoolArs(Math.round(maxParticipants * val));
                      }}
                      className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Pozo de Premios Total (ARS)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={prizePoolArs}
                      onChange={(e) => setPrizePoolArs(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-1.5 text-[#00e676] font-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="font-black text-amber-400">1º Puesto (60%)</div>
                    <div className="font-bold text-white mt-0.5">${Math.round(prizePoolArs * 0.60).toLocaleString('es-AR')}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="font-black text-slate-300">2º Puesto (30%)</div>
                    <div className="font-bold text-white mt-0.5">${Math.round(prizePoolArs * 0.30).toLocaleString('es-AR')}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-700/10 border border-amber-700/30">
                    <div className="font-black text-amber-600">3º Puesto (10%)</div>
                    <div className="font-bold text-white mt-0.5">${Math.round(prizePoolArs * 0.10).toLocaleString('es-AR')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400 italic bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                Torneo gratuito. Se compite por puntos oficiales de ranking y medallas federativas.
              </div>
            )}
          </div>

          {/* Distancia de Juego Base y x Ronda */}
          <div className="bg-[#0f1422] p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Distancia de Juego</span>
                <span className="text-[10px] text-slate-400">Legs requeridos para ganar partidos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">Base (Mejor de):</span>
                <input
                  type="number"
                  min="1"
                  max="19"
                  value={bestOfLegs}
                  onChange={(e) => setBestOfLegs(Number(e.target.value))}
                  className="w-16 bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-center text-white font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetailedLegs(!showDetailedLegs)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>{showDetailedLegs ? '▲ Ocultar configuración por rondas' : '▼ Personalizar distancia por rondas (Cuartos, Semis, Final)'}</span>
            </button>

            {showDetailedLegs && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Cuartos</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={quarterLegs}
                    onChange={(e) => setQuarterLegs(Number(e.target.value))}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-center text-white font-bold"
                  />
                  <span className="text-[9px] text-slate-500 block text-center mt-0.5">1º a {Math.ceil(quarterLegs / 2)}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Semifinales</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={semiLegs}
                    onChange={(e) => setSemiLegs(Number(e.target.value))}
                    className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2 py-1 text-center text-white font-bold"
                  />
                  <span className="text-[9px] text-slate-500 block text-center mt-0.5">1º a {Math.ceil(semiLegs / 2)}</span>
                </div>
                <div>
                  <label className="text-[10px] text-amber-400 block mb-0.5 font-bold">Gran Final</label>
                  <input
                    type="number"
                    min="1"
                    max="19"
                    value={finalsLegs}
                    onChange={(e) => setFinalsLegs(Number(e.target.value))}
                    className="w-full bg-[#07090e] border border-amber-500/50 rounded-xl px-2 py-1 text-center text-amber-300 font-black"
                  />
                  <span className="text-[9px] text-amber-400 block text-center mt-0.5">1º a {Math.ceil(finalsLegs / 2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer de Acciones */}
          <div className="p-4 bg-[#080c16] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
