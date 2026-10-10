'use client';

import React, { useState } from 'react';
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
  Target
} from 'lucide-react';

interface LeagueManagerProps {
  leagues: League[];
  onOpenCreateLeague: () => void;
  onSelectLeague?: (leagueId: string) => void;
}

export const LeagueManager: React.FC<LeagueManagerProps> = ({
  leagues,
  onOpenCreateLeague,
  onSelectLeague
}) => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(
    leagues[0]?.id || 'league-national-argentina'
  );

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId) || leagues[0] || null;

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de Ligas */}
      <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffe600]/10 border border-[#ffe600]/30 text-[#ffe600] text-xs font-black uppercase tracking-wider mb-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Campeonatos y Ligas Oficiales</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Estructura Oficial de Ligas de Dardos
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenCreateLeague}
            className="px-4 py-2.5 rounded-2xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00e676]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crear Nueva Liga</span>
          </button>
        </div>

        {/* Tarjetas / Tabs de las Ligas Existentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {leagues.map((league) => {
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

                    {league.doublePointsOnPresential && (
                      <span className="text-[10px] font-black text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        <span>Presencial x2</span>
                      </span>
                    )}
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
          {/* Banner de la Liga */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-lg border uppercase ${
                    selectedLeague.scope === 'NATIONAL'
                      ? 'bg-[#38bdf8]/20 border-[#38bdf8]/40 text-[#38bdf8]'
                      : 'bg-[#ffe600]/20 border-[#ffe600]/40 text-[#ffe600]'
                  }`}
                >
                  {selectedLeague.scope === 'NATIONAL' ? 'Liga Nacional Oficial' : 'Liga Local'}
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

          {/* Tabla Oficial de Posiciones */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">Pos</th>
                  <th className="py-3 px-3">Jugador / Apodo</th>
                  <th className="py-3 px-3">Club / Ciudad</th>
                  <th className="py-3 px-3 text-center">Fechas (PJ)</th>
                  <th className="py-3 px-3 text-center">Títulos</th>
                  <th className="py-3 px-3 text-center">Podios</th>
                  <th className="py-3 px-3 text-center">AVG 501</th>
                  <th className="py-3 px-4 text-right">PUNTOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedLeague.standings.map((st, idx) => {
                  const isTop1 = idx === 0;
                  const isTop3 = idx < 3;

                  return (
                    <tr 
                      key={st.playerId}
                      className={`hover:bg-[#111622] transition-colors ${
                        isTop1 ? 'bg-[#ffe600]/5 font-medium' : ''
                      }`}
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

                      {/* Jugador */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl overflow-hidden bg-black/60 border border-slate-700 relative flex-shrink-0">
                            {st.avatarUrl ? (
                              <Image src={st.avatarUrl} alt={st.playerName} fill className="object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">
                                {st.nickname.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block leading-tight">{st.playerName}</span>
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

                      {/* AVG */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-black text-[#00e676] font-mono">
                          {st.avg.toFixed(1)}
                        </span>
                      </td>

                      {/* Puntos de Liga */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-black font-mono text-amber-400 tracking-tight">
                          {st.points.toLocaleString()} PTS
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
