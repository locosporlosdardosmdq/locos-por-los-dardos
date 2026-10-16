'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { League, LeagueStanding } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  Shield, 
  Flame, 
  Award, 
  Users, 
  Sparkles, 
  Calendar, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Target,
  ExternalLink,
  Trash2,
  Pencil
} from 'lucide-react';

interface LeagueManagerProps {
  leagues: League[];
  onOpenCreateLeague: () => void;
  onSelectLeague?: (leagueId: string) => void;
  onSelectPlayer?: (playerId: string, playerName?: string) => void;
  isAdmin?: boolean;
  onDeleteLeague?: (leagueId: string, leagueName: string) => void;
  onEditLeague?: (league: League) => void;
}

export const LeagueManager: React.FC<LeagueManagerProps> = ({
  leagues,
  onOpenCreateLeague,
  onSelectLeague,
  onSelectPlayer,
  isAdmin = false,
  onDeleteLeague,
  onEditLeague
}) => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(
    leagues[0]?.id || 'league-national-argentina'
  );
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Años disponibles de ligas
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    leagues.forEach((l) => {
      const match = l.season.match(/\d{4}/) || l.name.match(/\d{4}/);
      if (match) years.add(match[0]);
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [leagues]);

  // Ligas filtradas por año seleccionado
  const filteredLeagues = useMemo(() => {
    if (selectedYear === 'ALL') return leagues;
    return leagues.filter((l) => l.season.includes(selectedYear) || l.name.includes(selectedYear));
  }, [leagues, selectedYear]);

  // Liga activa
  const selectedLeague = filteredLeagues.find((l) => l.id === selectedLeagueId) || filteredLeagues[0] || leagues[0] || null;

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de Ligas con Logo Oficial de Dardos Argentina */}
      <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffe600]/10 border border-[#ffe600]/30 text-[#ffe600] text-xs font-black uppercase tracking-wider mb-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Campeonatos y Ligas Oficiales</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Estructura Oficial de Ligas de Dardos
            </h2>
          </div>

          {/* LOGO OFICIAL DARDOS ARGENTINA (UBICACIÓN EXACTA MARCADA CON CÍRCULO ROJO) */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#07090e] border border-[#38bdf8]/40 shadow-xl shadow-black/40 flex-shrink-0">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/logos/dardos-argentina.png"
                alt="Dardos Argentina"
                fill
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-black uppercase text-[#38bdf8] tracking-widest block">
                Circuito Federado
              </span>
              <span className="text-xs font-black text-white block leading-tight">
                Dardos Argentina
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateLeague}
              className="px-4 py-2.5 rounded-2xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00e676]/20 transition-all active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Crear Nueva Liga</span>
            </button>
          )}
        </div>

        {/* BUSCADOR POR AÑO Y DESPLEGABLE DEPENDIENTE CON LOS NOMBRES DE LAS LIGAS */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#07090e] border border-[#1e2638]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador / Selector por Año */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-slate-300">Año / Temporada:</span>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const y = e.target.value;
                  setSelectedYear(y);
                  const matching = y === 'ALL' ? leagues : leagues.filter(l => l.season.includes(y) || l.name.includes(y));
                  if (matching.length > 0) setSelectedLeagueId(matching[0].id);
                }}
                className="bg-[#111622] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-white focus:outline-none focus:border-[#ffe600]"
              >
                <option value="ALL">Todas las Temporadas</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>Temporada {year}</option>
                ))}
              </select>
            </div>

            {/* Desplegable dependiente con los nombres de las Ligas */}
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-xs font-black text-slate-300">Liga Seleccionada:</span>
              <select
                value={selectedLeagueId}
                onChange={(e) => setSelectedLeagueId(e.target.value)}
                className="bg-[#111622] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-black text-white focus:outline-none focus:border-[#00e676]"
              >
                {filteredLeagues.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.scope === 'NATIONAL' ? '🇦🇷 ' : '📍 '} {l.name} ({l.season})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-bold">
            Mostrando {filteredLeagues.length} {filteredLeagues.length === 1 ? 'liga' : 'ligas'}
          </span>
        </div>

        {/* Tarjetas / Grid de las Ligas del Año Seleccionado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredLeagues.map((league) => {
            const isSelected = league.id === selectedLeagueId;
            const isNational = league.scope === 'NATIONAL';

            return (
              <div
                key={league.id}
                onClick={() => setSelectedLeagueId(league.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? isNational
                      ? 'bg-[#38bdf8]/10 border-[#38bdf8] ring-2 ring-[#38bdf8]/40 shadow-xl'
                      : 'bg-[#ffe600]/10 border-[#ffe600] ring-2 ring-[#ffe600]/40 shadow-xl'
                    : 'bg-[#07090e] border-[#1e2638] hover:border-slate-600'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider ${
                        isNational
                          ? 'bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8]'
                          : 'bg-[#ffe600]/20 border-[#ffe600]/40 text-[#ffe600]'
                      }`}
                    >
                      {isNational ? '🇦🇷 Liga Nacional Oficial' : '📍 Liga Local'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isAdmin && onEditLeague && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditLeague(league);
                          }}
                          className="p-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 transition-all"
                          title="Editar Liga"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                      {/* Logo de la entidad organizadora */}
                      <div className="relative w-6 h-6 flex-shrink-0" title={isNational ? 'Dardos Argentina' : 'Darderos Mar del Plata'}>
                        <Image
                          src={isNational ? '/logos/dardos-argentina.png' : '/logos/logo-mdq.png'}
                          alt={isNational ? 'Dardos Argentina' : 'Darderos MDQ'}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-white leading-snug line-clamp-2">
                    {league.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {league.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Users className="w-3.5 h-3.5" />
                    <span>{league.standings.length} jugadores</span>
                  </span>
                  <span className="font-bold text-white">{league.season}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle y Tabla de Posiciones de la Liga Seleccionada */}
      {selectedLeague && (
        <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          {/* Banner de la Liga con Logo Oficial correspondiente */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
            <div className="flex items-start gap-4">
              {/* Logo Oficial: Dardos Argentina si es Nacional, Darderos MDQ si es Local */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/60 border border-slate-700 p-1 flex-shrink-0 shadow-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={selectedLeague.scope === 'NATIONAL' ? '/logos/dardos-argentina.png' : '/logos/logo-mdq.png'}
                  alt={selectedLeague.scope === 'NATIONAL' ? 'Dardos Argentina' : 'Darderos Mar del Plata'}
                  fill
                  className="object-contain p-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-lg border uppercase ${
                      selectedLeague.scope === 'NATIONAL'
                        ? 'bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8]'
                        : 'bg-[#ffe600]/20 border-[#ffe600]/40 text-[#ffe600]'
                    }`}
                  >
                    {selectedLeague.scope === 'NATIONAL' ? '🇦🇷 Liga Nacional Federada' : '📍 Liga Local'}
                  </span>
                  <span className="text-xs text-slate-400">{selectedLeague.season}</span>
                  {selectedLeague.doublePointsOnPresential && (
                    <span className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Fechas Presenciales Oficiales: Puntos Dobles (x2)</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {selectedLeague.name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-[#00e676]" />
                    <span>Organiza: <strong>{selectedLeague.organizerClub}</strong></span>
                  </span>
                  {selectedLeague.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedLeague.city}, {selectedLeague.province}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5">
              {/* Botones exclusivos para administradores de torneo */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  {onEditLeague && (
                    <button
                      type="button"
                      onClick={() => onEditLeague(selectedLeague)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold text-xs border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                      title="Editar nombre, temporada, sedes y reglas de esta liga"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar Liga</span>
                    </button>
                  )}
                  {onDeleteLeague && (
                    <button
                      type="button"
                      onClick={() => onDeleteLeague(selectedLeague.id, selectedLeague.name)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444] text-[#ef4444] hover:text-white font-bold text-xs border border-[#ef4444]/30 flex items-center gap-1.5 transition-all shadow-sm"
                      title="Eliminar esta liga del circuito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Liga</span>
                    </button>
                  )}
                </div>
              )}

              {/* Aviso especial de Clasificatorio Internacional si es Nacional */}
              {selectedLeague.scope === 'NATIONAL' && (
                <div className="p-3.5 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 max-w-sm text-xs space-y-1">
                  <span className="font-black text-[#38bdf8] flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <span>Clasificatorio a Torneos Internacionales</span>
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Los mejores jugadores de esta tabla clasificarán directamente para representar a Argentina en certámenes internacionales de la PDC y WDF. Las fechas presenciales en Mar del Plata otorgan puntuación doble obligatoria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tabla Oficial de Posiciones con Interacción de Ficha de Jugador */}
          <div className="overflow-x-auto">
            <div className="text-xs text-slate-400 pb-2 flex items-center justify-between">
              <span>Haz click sobre cualquier jugador para ver su ficha, títulos ganados e historial de fechas.</span>
              <span className="text-[#00e676] font-bold">● Tabla Actualizada en Vivo</span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-black uppercase text-slate-400">
                  <th className="py-3 px-3">POS</th>
                  <th className="py-3 px-3">JUGADOR / APODO</th>
                  <th className="py-3 px-3">CLUB / CIUDAD</th>
                  <th className="py-3 px-3 text-center">FECHAS (PJ)</th>
                  <th className="py-3 px-3 text-center">TÍTULOS</th>
                  <th className="py-3 px-3 text-center">PODIOS</th>
                  <th className="py-3 px-3 text-center">AVG 501</th>
                  <th className="py-3 px-4 text-right">PUNTOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedLeague.standings.map((st, idx) => {
                  const isTop1 = idx === 0;

                  return (
                    <tr 
                      key={st.playerId}
                      onClick={() => onSelectPlayer && onSelectPlayer(st.playerId, st.playerName)}
                      className={`hover:bg-[#111622] transition-colors cursor-pointer group ${
                        isTop1 ? 'bg-[#ffe600]/5 font-medium' : ''
                      }`}
                      title="Click para ver ficha y estadísticas completas del jugador"
                    >
                      {/* Posición */}
                      <td className="py-3 px-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                              : idx === 1
                              ? 'bg-slate-300 text-black'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-[#07090e] border border-slate-700 text-slate-300'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>

                      {/* Jugador con enlace visual */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl overflow-hidden bg-black/60 border border-slate-700 relative flex-shrink-0 group-hover:border-[#00e676] transition-colors">
                            {st.avatarUrl ? (
                              <Image src={st.avatarUrl} alt={st.playerName} fill className="object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">
                                {st.nickname.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block leading-tight group-hover:text-[#00e676] transition-colors">
                              {st.playerName}
                            </span>
                            <span className="text-[10px] text-amber-400 font-medium">"{st.nickname}"</span>
                          </div>
                        </div>
                      </td>

                      {/* Club / Ciudad */}
                      <td className="py-3 px-3 text-slate-300">
                        <div>
                          <span className="block font-medium">{st.club}</span>
                          <span className="text-[10px] text-slate-500">{st.city}, {st.province}</span>
                        </div>
                      </td>

                      {/* Fechas jugadas */}
                      <td className="py-3 px-3 text-center text-slate-300 font-mono">
                        {st.playedDates}
                      </td>

                      {/* Títulos ganados */}
                      <td className="py-3 px-3 text-center">
                        {st.tournamentsWon > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 font-black font-mono">
                            {st.tournamentsWon}x
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Podios */}
                      <td className="py-3 px-3 text-center text-slate-300 font-mono">
                        {st.podiums > 0 ? `${st.podiums}x` : '-'}
                      </td>

                      {/* Promedio AVG */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-black text-[#00e676] font-mono">
                          {st.avg.toFixed(1)}
                        </span>
                      </td>

                      {/* Puntos acumulados */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-amber-400 text-sm font-mono tracking-tight">
                          {st.points.toLocaleString('es-AR')} PTS
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
