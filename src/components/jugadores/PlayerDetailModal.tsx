'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UltimateDartsCardData, RecentHistoryItem } from '@/components/jugadores/UltimateDartsCard';
import { getCountryFlag } from '@/lib/constants';
import { 
  Trophy, 
  X, 
  MapPin, 
  Medal, 
  Calendar, 
  TrendingUp, 
  Target, 
  Zap, 
  ArrowUpRight, 
  ShieldCheck, 
  Award,
  Sparkles,
  ExternalLink,
  Flame
} from 'lucide-react';

type HistoryTabType = 'NATIONAL_LEAGUE' | 'LOCAL_LEAGUE' | 'STANDALONE_TOURNAMENT' | 'INDIVIDUAL';

interface PlayerDetailModalProps {
  player: UltimateDartsCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToEvent?: (eventType: 'TOURNAMENT' | 'LEAGUE', targetId: string, targetTab: string) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  isOpen,
  onClose,
  onNavigateToEvent
}) => {
  const router = useRouter();
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTabType>('NATIONAL_LEAGUE');

  if (!isOpen || !player) return null;

  const flag = getCountryFlag(player.countryCode || player.nationality);

  const handleEventClick = (eventType: 'TOURNAMENT' | 'LEAGUE', targetId: string, targetTab: string) => {
    onClose();
    if (onNavigateToEvent) {
      onNavigateToEvent(eventType, targetId, targetTab);
    } else {
      router.push(`/torneos?tab=${targetTab}&id=${targetId}`);
    }
  };

  const wonTournaments = player.tournamentsWonList || [];
  const lastRank = player.lastTournamentRank;
  const lastTourneyName = player.lastTournamentName || 'Torneo Apertura Verano 2026 • Copa Mar del Plata';
  const lastTourneyDate = player.lastTournamentDate || '15/02/2026';
  const lastTrophy = player.lastTournamentTrophy || (lastRank === 1 ? 'GOLD' : lastRank === 2 ? 'SILVER' : lastRank === 3 ? 'BRONZE' : 'NONE');

  const allHistory = player.recentHistory || [];

  const getCategoryForItem = (item: RecentHistoryItem): HistoryTabType => {
    if (item.eventType === 'NATIONAL_LEAGUE') return 'NATIONAL_LEAGUE';
    if (item.eventType === 'LOCAL_LEAGUE') return 'LOCAL_LEAGUE';
    if (item.eventType === 'STANDALONE_TOURNAMENT') return 'STANDALONE_TOURNAMENT';
    if (item.eventType === 'INDIVIDUAL') return 'INDIVIDUAL';
    if (item.eventType === 'LEAGUE') {
      if (item.eventName.toLowerCase().includes('nacional') || item.targetId.includes('national')) {
        return 'NATIONAL_LEAGUE';
      }
      return 'LOCAL_LEAGUE';
    }
    if (item.eventType === 'TOURNAMENT') return 'STANDALONE_TOURNAMENT';
    return 'INDIVIDUAL';
  };

  const filteredHistory = allHistory.filter((item) => getCategoryForItem(item) === activeHistoryTab);

  const categoryAvg = filteredHistory.length > 0
    ? filteredHistory.reduce((acc, cur) => acc + cur.avg, 0) / filteredHistory.length
    : player.avg;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#07090e] border-2 border-[#ffe600] rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl shadow-black max-h-[92vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white p-2 rounded-xl bg-[#111622] hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado del Jugador */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-800 pb-5">
          {/* Foto oficial o Avatar recortado */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#090214] border-2 border-[#ffe600] p-1 flex-shrink-0 shadow-lg shadow-[#ffe600]/20 overflow-hidden">
            <Image
              src={player.photoUrl || player.avatarUrl || '/logos/logo-mdq.png'}
              alt={player.name}
              fill
              className="object-contain p-1"
            />
            <span className="absolute bottom-1 right-1 text-xl select-none" title={player.nationality || 'Argentina'}>
              {flag}
            </span>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-2xl select-none">{flag}</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {player.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-[#ffe600]/20 text-[#ffe600] border border-[#ffe600]/40">
                "{player.nickname}"
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-black uppercase bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30">
                {player.category}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-white font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00e676]" />
                <span>{player.club}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>{player.city}, {player.province}</span>
              </span>
            </div>

            {player.majorTitle && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black mt-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{player.majorTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 1: ÚLTIMO TORNEO DISPUTADO & PUESTO OCUPADO */}
        {/* ======================================================== */}
        <div className="bg-[#0f1422] border border-[#1e2a40] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>Último Torneo Oficial Disputado</span>
            </span>
            <span className="text-[11px] text-slate-400 font-bold">{lastTourneyDate}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#07090e] border border-slate-800">
            <div>
              <h4 className="text-sm font-black text-white">{lastTourneyName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Torneo Oficial del Circuito • 501 Doble Out</p>
            </div>

            {/* PUESTO OCUPADO CON ÍCONO DE TROFEO / MEDALLA SEGÚN CORRESPONDA */}
            <div className="flex-shrink-0">
              {lastTrophy === 'GOLD' || lastRank === 1 ? (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-amber-500/10 border-2 border-amber-400 text-amber-300 font-black shadow-lg shadow-amber-500/20">
                  <div className="relative flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <div className="leading-tight">
                    <span className="text-sm font-black block text-amber-300">#1 CAMPEÓN</span>
                    <span className="text-[10px] text-amber-400/90 font-bold">Copa de Oro</span>
                  </div>
                </div>
              ) : lastTrophy === 'SILVER' || lastRank === 2 ? (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-300/25 to-slate-400/10 border-2 border-slate-300 text-slate-200 font-black shadow-lg shadow-slate-300/15">
                  <div className="relative flex items-center justify-center text-xl">
                    🥈
                  </div>
                  <div className="leading-tight">
                    <span className="text-sm font-black block text-white">#2 SUBCAMPEÓN</span>
                    <span className="text-[10px] text-slate-300 font-bold">Copa de Plata</span>
                  </div>
                </div>
              ) : lastTrophy === 'BRONZE' || lastRank === 3 ? (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-700/30 to-amber-800/10 border-2 border-amber-600 text-amber-300 font-black shadow-lg shadow-amber-700/20">
                  <div className="relative flex items-center justify-center text-xl">
                    🥉
                  </div>
                  <div className="leading-tight">
                    <span className="text-sm font-black block text-amber-200">#3 TERCER PUESTO</span>
                    <span className="text-[10px] text-amber-400/90 font-bold">Copa de Bronce (Podio)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-black text-xs">
                  <span>Puesto #{lastRank || 4}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 2: TORNEOS QUE GANÓ (TÍTULOS OFICIALES) */}
        {/* ======================================================== */}
        <div className="bg-[#0f1422] border border-[#1e2a40] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Torneos Oficiales Ganados (Títulos)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-400 text-xs font-black font-mono">
              {wonTournaments.length} {wonTournaments.length === 1 ? 'Título' : 'Títulos'}
            </span>
          </div>

          {wonTournaments.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 text-center text-xs text-slate-500">
              Aún no registra campeonatos de torneos oficiales. Actualmente disputando las llaves del circuito.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {wonTournaments.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-[#07090e] border border-amber-500/30 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-black border border-amber-400 flex items-center justify-center text-lg flex-shrink-0 shadow-md shadow-amber-500/20">
                    🏆
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-black text-white block truncate leading-tight">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                      Temporada {t.year} • {t.stage || 'Campeón de Oro'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 3: MÉTRICAS Y ESTADÍSTICAS OFICIALES PDC */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 block">AVG Oficial</span>
            <span className="text-2xl font-black text-[#00e676] font-mono mt-0.5 block">{player.avg.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500">3 Darts Average</span>
          </div>

          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 block">180s Cantados</span>
            <span className="text-2xl font-black text-[#ef4444] font-mono mt-0.5 block">{player.count180s}</span>
            <span className="text-[10px] text-slate-500">Visitas Perfectas</span>
          </div>

          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Mayor Cierre</span>
            <span className="text-2xl font-black text-[#38bdf8] font-mono mt-0.5 block">{player.highestCheckout}</span>
            <span className="text-[10px] text-slate-500">Puntos High Finish</span>
          </div>

          <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Partidos Ganados</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              {player.matchesWon}
              <span className="text-xs text-slate-400 font-normal">/{player.matchesTotal}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {player.matchesTotal > 0 ? `${Math.round((player.matchesWon / player.matchesTotal) * 100)}% Eficacia` : '0%'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 4: ESTADÍSTICAS Y PARTICIPACIÓN EN 4 PESTAÑAS   */}
        {/* ======================================================== */}
        <div className="bg-[#0f1422] border border-[#1e2a40] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00e676]" />
                <span>Historial de Participación & Estadísticas Oficiales</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Desglose oficial por modalidad de competición y circuito deportivo
              </p>
            </div>
            <Link
              href="/reglamento"
              target="_blank"
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors self-end sm:self-auto"
            >
              <span>Ver Reglamento & Cómputo de Puntos</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* SELECTOR DE 4 PESTAÑAS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#07090e] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveHistoryTab('NATIONAL_LEAGUE')}
              className={`py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                activeHistoryTab === 'NATIONAL_LEAGUE'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🇦🇷</span>
              <span className="truncate">Liga Nacional</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-black/30 font-mono">⚡x2</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHistoryTab('LOCAL_LEAGUE')}
              className={`py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                activeHistoryTab === 'LOCAL_LEAGUE'
                  ? 'bg-sky-400 text-black shadow-md shadow-sky-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🛡️</span>
              <span className="truncate">Ligas Locales</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHistoryTab('STANDALONE_TOURNAMENT')}
              className={`py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                activeHistoryTab === 'STANDALONE_TOURNAMENT'
                  ? 'bg-[#00e676] text-black shadow-md shadow-[#00e676]/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🏆</span>
              <span className="truncate">Torneos 1 Día</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHistoryTab('INDIVIDUAL')}
              className={`py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                activeHistoryTab === 'INDIVIDUAL'
                  ? 'bg-purple-400 text-black shadow-md shadow-purple-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🎯</span>
              <span className="truncate">Individuales</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* PANEL DE ESTADÍSTICAS SEGÚN LA PESTAÑA ACTIVA            */}
          {/* ======================================================== */}
          {activeHistoryTab === 'NATIONAL_LEAGUE' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center text-sm font-black flex-shrink-0">
                    🇦🇷
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-amber-300">
                      Única Liga Nacional Oficial de Argentina • Circuito Federal
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Clasificatoria oficial a torneos internacionales. Fechas online 1x pts y fechas presenciales oficiales con doble puntaje (<span className="text-amber-400 font-bold">⚡ x2 Pts</span>).
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black font-mono self-end sm:self-auto flex-shrink-0">
                  Ranking #{player.nationalRank || 1} • {player.nationalPoints || 1850} Pts
                </div>
              </div>

              {/* Métricas específicas de Liga Nacional */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Posición Nacional</span>
                  <span className="text-lg font-black text-amber-400 font-mono block mt-0.5">#{player.nationalRank || 1}</span>
                  <span className="text-[9px] text-slate-500">Puntaje Federal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Puntos Acumulados</span>
                  <span className="text-lg font-black text-white font-mono block mt-0.5">{player.nationalPoints || 1850}</span>
                  <span className="text-[9px] text-amber-400/90 font-bold">Con Fechas Presenciales x2</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Fechas Disputadas</span>
                  <span className="text-lg font-black text-sky-400 font-mono block mt-0.5">
                    {filteredHistory.length || 2}
                  </span>
                  <span className="text-[9px] text-slate-500">Online & Presenciales</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">AVG Liga Nacional</span>
                  <span className="text-lg font-black text-[#00e676] font-mono block mt-0.5">
                    {categoryAvg.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-500">Promedio de Fechas</span>
                </div>
              </div>
            </div>
          )}

          {activeHistoryTab === 'LOCAL_LEAGUE' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-400/10 border border-sky-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-400/20 text-sky-300 flex items-center justify-center text-sm font-black flex-shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-sky-300">
                      Ligas Locales Oficiales (MDQ & Clubes Federados)
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Competencias zonales de regularidad acumulada. Admite participación presencial en sede y fechas conectadas online.
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-sky-400/20 border border-sky-400/40 text-sky-300 text-xs font-black font-mono self-end sm:self-auto flex-shrink-0">
                  Ranking Local #{player.mdqLeagueRank || 1} • {player.mdqLeaguePoints || 980} Pts
                </div>
              </div>

              {/* Métricas específicas de Ligas Locales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Posición Local</span>
                  <span className="text-lg font-black text-sky-400 font-mono block mt-0.5">#{player.mdqLeagueRank || 1}</span>
                  <span className="text-[9px] text-slate-500">{player.city}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Puntos de Liga</span>
                  <span className="text-lg font-black text-white font-mono block mt-0.5">{player.mdqLeaguePoints || 980}</span>
                  <span className="text-[9px] text-sky-400/90 font-bold">Temporada 2026</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Fechas Jugadas</span>
                  <span className="text-lg font-black text-amber-400 font-mono block mt-0.5">
                    {filteredHistory.length || 2}
                  </span>
                  <span className="text-[9px] text-slate-500">Online + Presencial Sede</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">AVG Liga Local</span>
                  <span className="text-lg font-black text-[#00e676] font-mono block mt-0.5">
                    {categoryAvg.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-500">Promedio en Liga</span>
                </div>
              </div>
            </div>
          )}

          {activeHistoryTab === 'STANDALONE_TOURNAMENT' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#00e676]/10 border border-[#00e676]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00e676]/20 text-[#00e676] flex items-center justify-center text-sm font-black flex-shrink-0">
                    🏆
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#00e676]">
                      Torneos de un Día (Copas, Opens & Relámpago)
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Competencias de eliminación directa o doble eliminación independientes de ligas. Otorgan trofeos y medallas de campeonato.
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] text-xs font-black font-mono self-end sm:self-auto flex-shrink-0">
                  {wonTournaments.length} Títulos Oficiales
                </div>
              </div>

              {/* Métricas específicas de Torneos de un Día */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Títulos de Oro</span>
                  <span className="text-lg font-black text-amber-400 font-mono block mt-0.5">{wonTournaments.length} 🏆</span>
                  <span className="text-[9px] text-slate-500">Copas de Campeón</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Mejor Actuación</span>
                  <span className="text-lg font-black text-white font-mono block mt-0.5">#{lastRank || 1}</span>
                  <span className="text-[9px] text-[#00e676] font-bold">Top 6 Circuito</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Partidos en Cuadro</span>
                  <span className="text-lg font-black text-sky-400 font-mono block mt-0.5">
                    {filteredHistory.length || 2} PJ
                  </span>
                  <span className="text-[9px] text-slate-500">Llaves Disputadas</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">AVG en Torneos</span>
                  <span className="text-lg font-black text-[#00e676] font-mono block mt-0.5">
                    {categoryAvg.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-500">Presión Competitiva</span>
                </div>
              </div>
            </div>
          )}

          {activeHistoryTab === 'INDIVIDUAL' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-400/10 border border-purple-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-400/20 text-purple-300 flex items-center justify-center text-sm font-black flex-shrink-0">
                    🎯
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-purple-300">
                      Partidas Individuales (Retos, Práctica & Anotador en Vivo)
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Encuentros casuales, entrenamientos vs CPU y retos amistosos. Suman al promedio personal (AVG) pero no modifican fixtures oficiales.
                    </p>
                  </div>
                </div>
                <Link
                  href="/anotador"
                  className="px-2.5 py-1 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/40 text-purple-300 text-xs font-black self-end sm:self-auto flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <span>Iniciar Reto</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Métricas específicas de Partidas Individuales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Partidas Casuales</span>
                  <span className="text-lg font-black text-purple-300 font-mono block mt-0.5">
                    {player.matchesTotal}
                  </span>
                  <span className="text-[9px] text-slate-500">Historial Anotador</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Victorias Personales</span>
                  <span className="text-lg font-black text-[#00e676] font-mono block mt-0.5">
                    {player.matchesWon}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {player.matchesTotal > 0 ? `${Math.round((player.matchesWon / player.matchesTotal) * 100)}% Eficacia` : '0%'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Mejor Leg</span>
                  <span className="text-lg font-black text-amber-400 font-mono block mt-0.5">
                    {player.bestLeg ? `${player.bestLeg} Dardos` : '12 Dardos'}
                  </span>
                  <span className="text-[9px] text-slate-500">Récord en 501</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">AVG en Individual</span>
                  <span className="text-lg font-black text-[#00e676] font-mono block mt-0.5">
                    {categoryAvg.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-500">3 Darts Average</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LISTADO DE PARTIDAS FILTRADAS POR LA PESTAÑA ACTIVA     */}
          {/* ======================================================== */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
              Encuentros Disputados en esta Modalidad ({filteredHistory.length})
            </span>

            {filteredHistory.length === 0 ? (
              <div className="p-5 rounded-xl bg-[#07090e] border border-slate-800 text-center space-y-1.5">
                <p className="text-xs text-slate-400 font-bold">
                  Aún no registra encuentros finalizados en esta modalidad.
                </p>
                <p className="text-[11px] text-slate-500">
                  Las partidas y fechas correspondientes a esta categoría se sincronizarán aquí automáticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((item) => {
                  const isWon = item.isWin;
                  const isOnline = item.modality === 'ONLINE';
                  const isDouble = item.isDoublePoints;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#07090e] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm shadow-black"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black border ${
                            activeHistoryTab === 'NATIONAL_LEAGUE'
                              ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                              : activeHistoryTab === 'LOCAL_LEAGUE'
                              ? 'bg-sky-400/15 text-sky-300 border-sky-400/30'
                              : activeHistoryTab === 'STANDALONE_TOURNAMENT'
                              ? 'bg-[#00e676]/15 text-[#00e676] border-[#00e676]/30'
                              : 'bg-purple-400/15 text-purple-300 border-purple-400/30'
                          }`}
                        >
                          {activeHistoryTab === 'NATIONAL_LEAGUE' && '🇦🇷'}
                          {activeHistoryTab === 'LOCAL_LEAGUE' && '🛡️'}
                          {activeHistoryTab === 'STANDALONE_TOURNAMENT' && '🏆'}
                          {activeHistoryTab === 'INDIVIDUAL' && '🎯'}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-white">{item.eventName}</span>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isWon
                                  ? 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30'
                                  : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                              }`}
                            >
                              {isWon ? 'Victoria' : 'Derrota'} ({item.scoreLegs})
                            </span>

                            {/* BADGE ONLINE / PRESENCIAL */}
                            {item.modality && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${
                                  isOnline
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {isOnline ? '🌐 Online' : '🏢 Presencial Sede'}
                              </span>
                            )}

                            {/* BADGE DOBLE PUNTAJE X2 */}
                            {isDouble && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gradient-to-r from-amber-400/25 to-amber-500/15 text-amber-300 border border-amber-400/50 flex items-center gap-1 shadow-sm shadow-amber-500/20">
                                <span>⚡</span>
                                <span>Presencial x2 Puntos</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-300">{item.date}</span>
                            <span>•</span>
                            <span>{item.roundOrStage || 'Ronda Oficial'}</span>
                            <span>•</span>
                            <span>vs <strong className="text-white">{item.opponentName}</strong></span>
                            <span>•</span>
                            <span className="text-[#00e676] font-mono font-bold">{item.avg.toFixed(1)} AVG</span>
                            {item.highestCheckout && item.highestCheckout > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-sky-300 font-mono font-bold">Cierre {item.highestCheckout}</span>
                              </>
                            )}
                            {item.count180s && item.count180s > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-rose-400 font-mono font-bold">{item.count180s}x 180</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ACCIÓN DE ENLACE */}
                      {item.eventType === 'INDIVIDUAL' || item.targetId === 'scorer-practice' ? (
                        <Link
                          href="/anotador"
                          className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-purple-900/40 text-purple-300 hover:text-white font-black text-xs border border-purple-500/30 hover:border-purple-400 flex items-center gap-1.5 transition-all self-end sm:self-center"
                        >
                          <span>Anotador</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleEventClick(
                              item.eventType === 'STANDALONE_TOURNAMENT' ? 'TOURNAMENT' : 'LEAGUE',
                              item.targetId,
                              item.targetTab
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1e2a40] text-slate-200 hover:text-white font-black text-xs border border-slate-700 hover:border-[#00e676] flex items-center gap-1.5 transition-all self-end sm:self-center"
                        >
                          <span>
                            {item.eventType === 'STANDALONE_TOURNAMENT' ? 'Ver Torneo' : 'Ver Liga'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#00e676]" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
