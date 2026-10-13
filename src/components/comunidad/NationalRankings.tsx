'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayerCategory, PlayerProfile } from '@/lib/types';
import { USER_ICEMAN, CATEGORY_DETAILS, PROVINCIAS_ARGENTINA } from '@/lib/constants';
import { fetchRegisteredPlayersFromCloud } from '@/lib/storage';
import { 
  Trophy, 
  MapPin, 
} from 'lucide-react';

export const NationalRankings: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PlayerCategory | 'ALL'>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [players, setPlayers] = useState<PlayerProfile[]>([USER_ICEMAN]);

  useEffect(() => {
    fetchRegisteredPlayersFromCloud().then((cloud) => {
      if (cloud && cloud.length > 0) {
        setPlayers(cloud);
      }
    });
  }, []);

  // Filtrado
  const filteredRankings = players.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchProv = selectedProvince === 'ALL' || p.province === selectedProvince;
    return matchCat && matchProv;
  }).sort((a, b) => (b.stats?.overallAvg || b.estimatedAvg || 0) - (a.stats?.overallAvg || a.estimatedAvg || 0));

  const top3 = filteredRankings.slice(0, 3);

  const hasOfficialCompetitiveData = players.some(
    (p) =>
      (p.stats?.matchesPlayed || 0) > 0 ||
      (p.stats?.matchesWon || 0) > 0 ||
      (p.tournamentsWonList && p.tournamentsWonList.length > 0) ||
      Boolean(p.lastTournamentRank)
  );

  return (
    <div className="w-full space-y-6">
      {/* Controles de Filtros con Estilo Diana */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1c1f2b] border border-[#313647] rounded-3xl p-4 sm:p-5 shadow-lg">
        {/* Filtro por Categorías */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#00b853] text-[#0d0e12] shadow-md shadow-[#00b853]/25'
                : 'bg-[#242836] text-[#b8ad98] hover:text-white border border-[#313647]'
            }`}
          >
            Todas las Categorías
          </button>
          {(Object.keys(CATEGORY_DETAILS) as PlayerCategory[]).map((cat) => {
            const detail = CATEGORY_DETAILS[cat];
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]'
                    : 'bg-[#242836]/60 text-[#b8ad98] border-[#313647] hover:text-white'
                }`}
              >
                {detail.label}
              </button>
            );
          })}
        </div>

        {/* Filtro por Provincia */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00b853] flex-shrink-0" />
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-[#14161f] border border-[#313647] rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#00b853]"
          >
            <option value="ALL">Todas las Provincias</option>
            {PROVINCIAS_ARGENTINA.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ESTADO LIMPIO: AÚN NO HAY PODIOS DISPUTADOS */}
      {!hasOfficialCompetitiveData && selectedProvince === 'ALL' && selectedCategory === 'ALL' && (
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#00b853]/15 border border-[#00b853]/30 flex items-center justify-center mx-auto text-[#00b853] shadow-lg shadow-[#00b853]/20">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Podio Oficial de la Temporada {new Date().getFullYear()}
            </h3>
            <p className="text-xs text-[#b8ad98] leading-relaxed">
              Aún no se registran podios oficiales en la temporada actual. Los podios de <strong>Oro</strong>, <strong>Plata</strong> y <strong>Bronce</strong> se coronarán y habilitarán automáticamente con los resultados del primer torneo oficial disputado.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14161f] border border-[#313647] text-[11px] font-bold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Padrón oficial federado ordenado por AVG en la tabla inferior
            </span>
          </div>
        </div>
      )}

      {/* PODIO TOP 3 DESTACADO SI HAY COMPETENCIAS DISPUTADAS */}
      {hasOfficialCompetitiveData && top3.length >= 3 && selectedProvince === 'ALL' && selectedCategory === 'ALL' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Segundo Lugar (Plata / Marfil Sisal) */}
          <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-5 text-center flex flex-col justify-between order-2 md:order-1 relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#efe7d8] text-[#0d0e12] font-black text-xs px-3.5 py-0.5 rounded-full uppercase shadow">
              #2 Plata
            </div>
            <div className="pt-2">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[#efe7d8] bg-[#14161f] p-1 mb-2">
                {top3[1].avatarUrl ? (
                  <Image src={top3[1].avatarUrl} alt={top3[1].nickname} fill className="object-contain" />
                ) : (
                  <div className="w-full h-full bg-[#efe7d8]/20 text-[#efe7d8] flex items-center justify-center text-sm font-black">
                    {top3[1].nickname.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <h4 className="font-black text-white text-base">{top3[1].nickname}</h4>
              <p className="text-xs text-[#b8ad98]">{top3[1].city}, {top3[1].province}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#313647] flex justify-around text-xs">
              <div>
                <span className="text-[10px] text-[#b8ad98] font-black block">AVG</span>
                <strong className="text-[#00b853] font-mono text-base">{(top3[1].stats?.overallAvg || top3[1].estimatedAvg || 0).toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#b8ad98] font-black block">180s</span>
                <strong className="text-[#e52521] text-base">{top3[1].stats?.count180s || 0}</strong>
              </div>
            </div>
          </div>

          {/* Primer Lugar (Oro / Verde Diana Campeón) */}
          <div className="bg-[#1e2332] border-2 border-[#00b853] rounded-3xl p-6 text-center flex flex-col justify-between order-1 md:order-2 relative shadow-2xl shadow-[#00b853]/20 -mt-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00b853] text-[#0d0e12] font-black text-xs px-4 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 fill-[#0d0e12]" />
              #1 Campeón Nacional
            </div>
            <div className="pt-2">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#00b853] bg-[#14161f] p-1 mb-2 shadow-lg shadow-[#00b853]/30">
                {top3[0].avatarUrl ? (
                  <Image src={top3[0].avatarUrl} alt={top3[0].nickname} fill className="object-contain" />
                ) : (
                  <div className="w-full h-full bg-[#00b853]/20 text-[#00b853] flex items-center justify-center text-lg font-black">
                    {top3[0].nickname.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <h4 className="font-black text-white text-lg tracking-tight">{top3[0].nickname}</h4>
              <p className="text-xs text-[#efe7d8]">{top3[0].city}, {top3[0].province}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#313647] flex justify-around text-xs">
              <div>
                <span className="text-[10px] text-[#b8ad98] font-black block">AVG GLOBAL</span>
                <strong className="text-[#00b853] font-mono text-2xl">{(top3[0].stats?.overallAvg || top3[0].estimatedAvg || 0).toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#b8ad98] font-black block">180s</span>
                <strong className="text-[#e52521] text-2xl">{top3[0].stats?.count180s || 0}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#b8ad98] font-black block">MAX CIERRE</span>
                <strong className="text-[#1d68ed] text-2xl">{top3[0].stats?.highestCheckout || 0}</strong>
              </div>
            </div>
          </div>

          {/* Tercer Lugar (Bronce / Rojo Bullseye) */}
          <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-5 text-center flex flex-col justify-between order-3 relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e52521] text-white font-black text-xs px-3.5 py-0.5 rounded-full uppercase shadow">
              #3 Bronce
            </div>
            <div className="pt-2">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[#e52521] bg-[#14161f] p-1 mb-2">
                {top3[2].avatarUrl ? (
                  <Image src={top3[2].avatarUrl} alt={top3[2].nickname} fill className="object-contain" />
                ) : (
                  <div className="w-full h-full bg-[#e52521]/20 text-[#e52521] flex items-center justify-center text-sm font-black">
                    {top3[2].nickname.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <h4 className="font-black text-white text-base">{top3[2].nickname}</h4>
              <p className="text-xs text-[#b8ad98]">{top3[2].city}, {top3[2].province}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#313647] flex justify-around text-xs">
              <div>
                <span className="text-[10px] text-[#b8ad98] font-black block">AVG</span>
                <strong className="text-[#00b853] font-mono text-base">{(top3[2].stats?.overallAvg || top3[2].estimatedAvg || 0).toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#b8ad98] font-black block">180s</span>
                <strong className="text-[#e52521] text-base">{top3[2].stats?.count180s || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLA COMPLETA DE CLASIFICACIÓN CON FONDO GRIS OSCURO */}
      <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#14161f] text-[#b8ad98] uppercase font-black tracking-wider border-b border-[#313647] text-[11px]">
              <tr>
                <th className="py-4 px-4 text-center">Pos</th>
                <th className="py-4 px-4">Jugador</th>
                <th className="py-4 px-3">Categoría</th>
                <th className="py-4 px-3">Ubicación</th>
                <th className="py-4 px-4 text-center font-mono">AVG 501</th>
                <th className="py-4 px-3 text-center">First 9</th>
                <th className="py-4 px-3 text-center">Partidos</th>
                <th className="py-4 px-3 text-center">180s</th>
                <th className="py-4 px-3 text-center">Mayor Cierre</th>
                <th className="py-4 px-3 text-center">% Dobles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#313647]/70 text-[#efe7d8]">
              {filteredRankings.map((player, idx) => {
                const catInfo = CATEGORY_DETAILS[player.category];
                return (
                  <tr
                    key={player.id}
                    className="hover:bg-[#242836] transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-black">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0
                            ? 'bg-[#00b853] text-[#0d0e12] font-black'
                            : idx === 1
                            ? 'bg-[#efe7d8] text-[#0d0e12] font-bold'
                            : idx === 2
                            ? 'bg-[#e52521] text-white font-bold'
                            : 'text-[#b8ad98]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#14161f] flex-shrink-0 border border-white/10">
                          {player.avatarUrl ? (
                            <Image src={player.avatarUrl} alt={player.nickname} fill className="object-contain" />
                          ) : (
                            <div className="w-full h-full bg-[#00b853]/20 text-[#00b853] flex items-center justify-center text-[10px] font-black">
                              {(player.nickname || 'D').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <strong className="text-white block text-sm">{player.nickname}</strong>
                          <span className="text-[11px] text-[#b8ad98]">{player.fullName || player.nickname}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                        player.category === 'ELITE'
                          ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]/40'
                          : player.category === 'AVANZADA'
                          ? 'bg-[#1d68ed]/20 text-[#38bdf8] border-[#1d68ed]/40'
                          : player.category === 'INTERMEDIA'
                          ? 'bg-[#e52521]/20 text-[#e52521] border-[#e52521]/40'
                          : 'bg-[#efe7d8]/20 text-[#efe7d8] border-[#efe7d8]/40'
                      }`}>
                        {catInfo?.label || 'Principiante'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-[#b8ad98]">
                      {player.city || 'Mar del Plata'}, {(player.province || 'Buenos Aires').replace('Ciudad Autónoma de Buenos Aires (CABA)', 'CABA')}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-black text-[#00b853] text-sm">
                      {(player.stats?.overallAvg || player.estimatedAvg || 0).toFixed(1)}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-[#efe7d8]">
                      {(player.stats?.first9Avg || player.estimatedAvg || 0).toFixed(1)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="text-white font-bold">{player.stats?.matchesWon || 0}</span>
                      <span className="text-[#b8ad98]">/{player.stats?.matchesPlayed || 0}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-[#e52521]">
                      {player.stats?.count180s || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-[#1d68ed]">
                      {player.stats?.highestCheckout || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-[#00b853]">
                      {(player.stats?.checkoutPercentage || 0).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
