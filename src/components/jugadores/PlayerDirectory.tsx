'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ARGENTINE_PROVINCES, PLAYER_CATEGORIES, getCountryFlag } from '@/lib/constants';
import { UltimateDartsCard, UltimateDartsCardData, RankingMode } from './UltimateDartsCard';
import { CANONICAL_PLAYERS } from '@/lib/players-data';
import { 
  Users, 
  Search, 
  MapPin, 
  Trophy, 
  Flame, 
  Target, 
  ShieldCheck, 
  ArrowUpRight,
  Filter,
  Medal,
  Activity,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const MOCK_PLAYERS: UltimateDartsCardData[] = CANONICAL_PLAYERS;

export const PlayerDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('TODAS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [rankingMode, setRankingMode] = useState<RankingMode>('AVG');
  const [onlyMdqLeague, setOnlyMdqLeague] = useState(false);

  // Filtrado y Ordenamiento
  const filteredAndSortedPlayers = useMemo(() => {
    let result = MOCK_PLAYERS.filter((player) => {
      const matchesSearch = 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.club.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProvince = selectedProvince === 'TODAS' || player.province === selectedProvince;
      const matchesCategory = selectedCategory === 'TODAS' || player.category === selectedCategory;

      // Filtro especial si se desea ver exclusivamente a jugadores de la Liga Marplatense
      const matchesMdqExclusive = !onlyMdqLeague || 
        player.club.includes('Darderos Mar del Plata') || 
        player.city === 'Mar del Plata' || 
        (player.mdqLeaguePoints && player.mdqLeaguePoints > 0);

      return matchesSearch && matchesProvince && matchesCategory && matchesMdqExclusive;
    });

    // Ordenamiento estricto según la competencia seleccionada
    return result.sort((a, b) => {
      if (rankingMode === 'AVG') {
        return b.avg - a.avg;
      }
      if (rankingMode === 'LIGA_ARG') {
        return (b.nationalPoints || 0) - (a.nationalPoints || 0);
      }
      if (rankingMode === 'LIGA_MDQ') {
        return (b.mdqLeaguePoints || 0) - (a.mdqLeaguePoints || 0);
      }
      if (rankingMode === 'PRESENCIAL_MDQ') {
        return (b.presentialPoints || 0) - (a.presentialPoints || 0);
      }
      return 0;
    });
  }, [searchTerm, selectedProvince, selectedCategory, rankingMode, onlyMdqLeague]);

  return (
    <div className="space-y-6">
      {/* SELECTOR PRINCIPAL DE CRITERIO DE COMPETICIÓN / RANKING (4 MODALIDADES) */}
      <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Criterio Oficial de Ordenamiento & Competición</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Clasificación y Cartas Coleccionables 2026
            </h2>
          </div>

          {/* Botones / Chips de Selección de Ranking */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            {/* 1. Mayor AVG en la App */}
            <button
              type="button"
              onClick={() => {
                setRankingMode('AVG');
                setOnlyMdqLeague(false);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                rankingMode === 'AVG'
                  ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/25 ring-2 ring-[#00e676]/50'
                  : 'bg-[#07090e] text-slate-300 hover:text-white border border-[#1e2638] hover:border-slate-600'
              }`}
            >
              <Target className="w-4 h-4 stroke-[2.5]" />
              <span>Mayor AVG (App)</span>
            </button>

            {/* 2. Liga Argentina */}
            <button
              type="button"
              onClick={() => {
                setRankingMode('LIGA_ARG');
                setOnlyMdqLeague(false);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                rankingMode === 'LIGA_ARG'
                  ? 'bg-[#38bdf8] text-[#07090e] shadow-lg shadow-[#38bdf8]/25 ring-2 ring-[#38bdf8]/50'
                  : 'bg-[#07090e] text-slate-300 hover:text-white border border-[#1e2638] hover:border-slate-600'
              }`}
            >
              <span className="text-base select-none leading-none">🇦🇷</span>
              <span>Liga Argentina</span>
            </button>

            {/* 3. Liga Marplatense */}
            <button
              type="button"
              onClick={() => setRankingMode('LIGA_MDQ')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                rankingMode === 'LIGA_MDQ'
                  ? 'bg-[#ffe600] text-[#07090e] shadow-lg shadow-[#ffe600]/25 ring-2 ring-[#ffe600]/50'
                  : 'bg-[#07090e] text-slate-300 hover:text-white border border-[#1e2638] hover:border-slate-600'
              }`}
            >
              <span className="text-base select-none leading-none">🌊</span>
              <span>Liga Marplatense</span>
            </button>

            {/* 4. Torneos Oficiales Presenciales en Mar del Plata */}
            <button
              type="button"
              onClick={() => {
                setRankingMode('PRESENCIAL_MDQ');
                setOnlyMdqLeague(false);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                rankingMode === 'PRESENCIAL_MDQ'
                  ? 'bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/25 ring-2 ring-[#ef4444]/50'
                  : 'bg-[#07090e] text-slate-300 hover:text-white border border-[#1e2638] hover:border-slate-600'
              }`}
            >
              <Trophy className="w-4 h-4 stroke-[2.5]" />
              <span>Presenciales MDQ</span>
            </button>
          </div>
        </div>

        {/* Barra de Contexto y Toggle de Liga Marplatense */}
        <div className="pt-3 border-t border-[#1e2638] flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></span>
            {rankingMode === 'AVG' && (
              <span>
                Ordenando por <strong>Mayor Promedio 501 (AVG)</strong> registrado en las partidas del anotador oficial de la App.
              </span>
            )}
            {rankingMode === 'LIGA_ARG' && (
              <span>
                Ordenando por <strong>Puntos Acumulados de la Liga Argentina</strong> (Circuito Federal con partidas y torneos oficiales).
              </span>
            )}
            {rankingMode === 'LIGA_MDQ' && (
              <span>
                Ordenando por la <strong>Liga Marplatense Oficial</strong> (Puntaje de campeonato regular en Club Darderos Mar del Plata).
              </span>
            )}
            {rankingMode === 'PRESENCIAL_MDQ' && (
              <span>
                Ordenando por desempeño en <strong>Torneos Oficiales Presenciales</strong> (Se disputan dos fechas al año en Mar del Plata: Gran Open y Copa Costa Atlántica).
              </span>
            )}
          </div>

          {/* Toggle para filtrar exclusivamente miembros de la Liga Marplatense */}
          {rankingMode === 'LIGA_MDQ' && (
            <label className="flex items-center gap-2 cursor-pointer bg-[#07090e] px-3 py-1.5 rounded-xl border border-[#ffe600]/40 text-[#ffe600] font-bold text-xs select-none">
              <input
                type="checkbox"
                checked={onlyMdqLeague}
                onChange={(e) => setOnlyMdqLeague(e.target.checked)}
                className="w-4 h-4 accent-[#ffe600] rounded cursor-pointer"
              />
              <span>Solo jugadores de la Liga MDQ</span>
            </label>
          )}

          {rankingMode === 'PRESENCIAL_MDQ' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#fca5a5] font-bold text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Circuito 2 Fechas Anuales en MDQ</span>
            </span>
          )}
        </div>
      </div>

      {/* FILTROS ADICIONALES: BUSCADOR Y SELECTORES */}
      <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Barra de Búsqueda */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apodo o club..."
            className="w-full bg-[#07090e] border border-[#1e2638] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e676]"
          />
        </div>

        {/* Selectores Provincia & Categoría */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Selector de Provincia */}
          <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1e2638] rounded-2xl px-3 py-2 text-xs">
            <MapPin className="w-4 h-4 text-[#00e676]" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODAS">Toda la Argentina</option>
              {ARGENTINE_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Categoría */}
          <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1e2638] rounded-2xl px-3 py-2 text-xs">
            <Trophy className="w-4 h-4 text-[#0284c7]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODAS">Todas las Categorías</option>
              <option value="ELITE">Elite Pro (70+ AVG)</option>
              <option value="AVANZADA">Avanzada (55-69.9)</option>
              <option value="INTERMEDIA">Intermedia (40-54.9)</option>
              <option value="PRINCIPIANTE">Principiante (0-39.9)</option>
            </select>
          </div>
        </div>
      </div>

      {/* METADATOS Y CONTADOR DE CARTAS */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span>Mostrando <strong>{filteredAndSortedPlayers.length}</strong> cartas oficiales</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            Colección Oficial Ultimate Darts 2026
          </span>
        </div>

        <span className="flex items-center gap-1 text-[#00e676]">
          <ShieldCheck className="w-4 h-4" />
          <span>Federación Oficial Locos por los Dardos & Darderos MDQ</span>
        </span>
      </div>

      {/* GRILLA DE CARTAS COLECCIONABLES ULTIMATE DARTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 justify-items-center pt-2">
        {filteredAndSortedPlayers.map((player, index) => (
          <UltimateDartsCard 
            key={player.id} 
            player={player} 
            rankingMode={rankingMode}
            displayRank={index + 1}
          />
        ))}
      </div>
    </div>
  );
};
