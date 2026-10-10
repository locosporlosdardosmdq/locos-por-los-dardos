'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlayerCategory, PlayerProfile } from '@/lib/types';
import { MOCK_RANKINGS, CATEGORY_DETAILS, PROVINCIAS_ARGENTINA } from '@/lib/constants';
import { 
  Trophy, 
  Medal, 
  Filter, 
  MapPin, 
  ArrowUpDown, 
  Target, 
  Award, 
  Flame, 
  Crosshair 
} from 'lucide-react';

export const NationalRankings: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PlayerCategory | 'ALL'>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  // Filtrado
  const filteredRankings = MOCK_RANKINGS.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchProv = selectedProvince === 'ALL' || p.province === selectedProvince;
    return matchCat && matchProv;
  }).sort((a, b) => b.stats.overallAvg - a.stats.overallAvg);

  const top3 = filteredRankings.slice(0, 3);

  return (
    <div className="w-full space-y-6">
      {/* Controles de Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d1322] border border-slate-800 rounded-2xl p-4 shadow-lg">
        {/* Filtro por Categorías */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            Todas las Categorías
          </button>
          {(Object.keys(CATEGORY_DETAILS) as PlayerCategory[]).map((cat) => {
            const detail = CATEGORY_DETAILS[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-white'
                }`}
              >
                {detail.label}
              </button>
            );
          })}
        </div>

        {/* Filtro por Provincia */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
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

      {/* PODIO TOP 3 DESTACADO */}
      {top3.length >= 3 && selectedProvince === 'ALL' && selectedCategory === 'ALL' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Segundo Lugar (Plata) */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 text-center flex flex-col justify-between order-2 md:order-1 relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-950 font-black text-xs px-3 py-0.5 rounded-full uppercase shadow">
              #2 Plata
            </div>
            <div className="pt-2">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-slate-400 bg-slate-900 p-1 mb-2">
                <Image src={top3[1].avatarUrl} alt={top3[1].nickname} fill className="object-contain" />
              </div>
              <h4 className="font-extrabold text-white text-base">{top3[1].nickname}</h4>
              <p className="text-xs text-slate-400">{top3[1].city}, {top3[1].province}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">AVG</span>
                <strong className="text-emerald-400 font-mono text-base">{top3[1].stats.overallAvg.toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">180s</span>
                <strong className="text-amber-400 text-base">{top3[1].stats.count180s}</strong>
              </div>
            </div>
          </div>

          {/* Primer Lugar (Oro) - Más alto y destacado */}
          <div className="bg-gradient-to-b from-[#182744] to-[#0d1629] border-2 border-amber-500/60 rounded-3xl p-6 text-center flex flex-col justify-between order-1 md:order-2 relative shadow-2xl shadow-amber-500/10 -mt-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 fill-slate-950" />
              #1 Campeón Nacional
            </div>
            <div className="pt-2">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-400 bg-slate-900 p-1 mb-2 shadow-lg shadow-amber-500/20">
                <Image src={top3[0].avatarUrl} alt={top3[0].nickname} fill className="object-contain" />
              </div>
              <h4 className="font-black text-white text-lg tracking-tight">{top3[0].nickname}</h4>
              <p className="text-xs text-slate-300">{top3[0].city}, {top3[0].province}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">AVG GLOBAL</span>
                <strong className="text-emerald-400 font-mono text-xl">{top3[0].stats.overallAvg.toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">180s</span>
                <strong className="text-amber-400 text-xl">{top3[0].stats.count180s}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">MAX CIERRE</span>
                <strong className="text-cyan-400 text-xl">{top3[0].stats.highestCheckout}</strong>
              </div>
            </div>
          </div>

          {/* Tercer Lugar (Bronce) */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 text-center flex flex-col justify-between order-3 relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-xs px-3 py-0.5 rounded-full uppercase shadow">
              #3 Bronce
            </div>
            <div className="pt-2">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-amber-700 bg-slate-900 p-1 mb-2">
                <Image src={top3[2].avatarUrl} alt={top3[2].nickname} fill className="object-contain" />
              </div>
              <h4 className="font-extrabold text-white text-base">{top3[2].nickname}</h4>
              <p className="text-xs text-slate-400">{top3[2].city}, {top3[2].province}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">AVG</span>
                <strong className="text-emerald-400 font-mono text-base">{top3[2].stats.overallAvg.toFixed(1)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">180s</span>
                <strong className="text-amber-400 text-base">{top3[2].stats.count180s}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLA COMPLETA DE CLASIFICACIÓN */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0e1628] text-slate-400 uppercase font-black tracking-wider border-b border-slate-800 text-[11px]">
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
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredRankings.map((player, idx) => {
                const catInfo = CATEGORY_DETAILS[player.category];
                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-black">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950 font-bold'
                            : idx === 2
                            ? 'bg-amber-700 text-white font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                          <Image src={player.avatarUrl} alt={player.nickname} fill className="object-contain" />
                        </div>
                        <div>
                          <strong className="text-white block text-sm">{player.nickname}</strong>
                          <span className="text-[11px] text-slate-400">{player.fullName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${catInfo.badgeClass}`}>
                        {catInfo.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-400">
                      {player.city}, {player.province.replace('Ciudad Autónoma de Buenos Aires (CABA)', 'CABA')}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-400 text-sm">
                      {player.stats.overallAvg.toFixed(1)}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                      {player.stats.first9Avg.toFixed(1)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="text-white font-bold">{player.stats.matchesWon}</span>
                      <span className="text-slate-500">/{player.stats.matchesPlayed}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-amber-400">
                      {player.stats.count180s}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-cyan-400">
                      {player.stats.highestCheckout}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono text-emerald-300">
                      {player.stats.checkoutPercentage.toFixed(1)}%
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
