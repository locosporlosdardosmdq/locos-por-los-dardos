'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UltimateDartsCardData } from '@/components/jugadores/UltimateDartsCard';
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
        {/* SECCIÓN 4: HISTÓRICO DE ÚLTIMAS FECHAS CON LINKS NAVEGABLES */}
        {/* ======================================================== */}
        <div className="bg-[#0f1422] border border-[#1e2a40] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#00e676]" />
              <span>Histórico de Últimas Fechas (Ligas & Torneos)</span>
            </span>
            <span className="text-[11px] text-slate-400">Click en cada fecha para ver su detalle oficial</span>
          </div>

          {(!player.recentHistory || player.recentHistory.length === 0) ? (
            <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 text-center text-xs text-slate-500">
              Sin registros de fechas anteriores en la base federada.
            </div>
          ) : (
            <div className="space-y-2">
              {player.recentHistory.map((item) => {
                const isTournament = item.eventType === 'TOURNAMENT';

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#07090e] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-xs font-black flex items-center justify-center flex-shrink-0 ${
                        isTournament 
                          ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30' 
                          : 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30'
                      }`}>
                        {isTournament ? <Trophy className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{item.eventName}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            item.isWin ? 'bg-[#00e676]/20 text-[#00e676]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                          }`}>
                            {item.isWin ? 'Victoria' : 'Derrota'} ({item.scoreLegs})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>vs {item.opponentName}</span>
                          <span>•</span>
                          <span className="text-[#00e676] font-mono font-bold">{item.avg.toFixed(1)} AVG</span>
                        </div>
                      </div>
                    </div>

                    {/* BOTÓN CON LINK AL DETALLE DE LA FECHA / TORNEO / LIGA */}
                    <button
                      type="button"
                      onClick={() => handleEventClick(item.eventType, item.targetId, item.targetTab)}
                      className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1e2a40] text-slate-200 hover:text-white font-black text-xs border border-slate-700 hover:border-[#00e676] flex items-center gap-1.5 transition-all self-end sm:self-center"
                    >
                      <span>{isTournament ? 'Ver Torneo' : 'Ver Liga'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#00e676]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
