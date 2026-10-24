'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Tournament, TournamentBracketMatch } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { getStoredTournaments } from '@/lib/storage';
import { 
  Trophy, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  RefreshCw, 
  Tv, 
  ChevronRight, 
  Layers, 
  Target, 
  Clock, 
  X,
  Play,
  CheckCircle2,
  Columns,
  RotateCw
} from 'lucide-react';

interface NakkaTvBracketViewProps {
  tournament: Tournament;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export const NakkaTvBracketView: React.FC<NakkaTvBracketViewProps> = ({
  tournament: initialTournament,
  onClose,
  isStandalonePage = false
}) => {
  const [tournament, setTournament] = useState<Tournament>(initialTournament);
  const [theme, setTheme] = useState<'DARK' | 'LIGHT'>('DARK');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'BRACKET' | 'GROUPS' | 'SPLIT' | 'RESULTS'>('BRACKET');
  const [bracketViewSlice, setBracketViewSlice] = useState<'ALL' | 'TOP_HALF' | 'BOTTOM_HALF' | 'FINALS'>('ALL');
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'AUTO' | 'COMPACT' | 'COMFORTABLE'>('AUTO');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronización en vivo cada 3.5s o por eventos locales
  useEffect(() => {
    const handleUpdate = () => {
      const all = getStoredTournaments();
      const found = all.find((t) => t.id === tournament.id);
      if (found) setTournament(found);
    };

    window.addEventListener('lpld_tournaments_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/torneos?id=${tournament.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.tournament) {
            setTournament(data.tournament);
          }
        }
      } catch {
        handleUpdate();
      }
    }, 3500);

    return () => {
      window.removeEventListener('lpld_tournaments_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [tournament.id]);

  // Ciclo de auto-rotación de vistas para TV si está activo
  useEffect(() => {
    if (!autoRotate) return;
    const views: ('ALL' | 'TOP_HALF' | 'BOTTOM_HALF' | 'FINALS')[] = ['ALL', 'TOP_HALF', 'BOTTOM_HALF', 'FINALS'];
    const timer = setInterval(() => {
      setBracketViewSlice((prev) => {
        const nextIdx = (views.indexOf(prev) + 1) % views.length;
        return views[nextIdx];
      });
    }, 18000);
    return () => clearInterval(timer);
  }, [autoRotate]);

  // Pantalla Completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const matches = tournament.matches || [];
  // Excluir tercer puesto del árbol principal
  const treeMatches = matches.filter((m) => m.id !== 'se_third_place');
  const thirdPlaceMatch = matches.find((m) => m.id === 'se_third_place');

  // Rondas existentes
  const rounds = Array.from(new Set(treeMatches.map((m) => m.round))).sort((a, b) => a - b);
  const maxRound = rounds.length > 0 ? Math.max(...rounds) : 1;

  // Filtrado según rebanada elegida (para TV con fuente extra gigante)
  const getFilteredRoundMatches = (r: number) => {
    const roundMatches = treeMatches.filter((m) => m.round === r).sort((a, b) => a.matchIndex - b.matchIndex);
    if (bracketViewSlice === 'ALL') return roundMatches;

    if (r === maxRound || r === maxRound - 1) {
      // Las semifinales y finales siempre se muestran
      return roundMatches;
    }

    const half = Math.ceil(roundMatches.length / 2);
    if (bracketViewSlice === 'TOP_HALF') {
      return roundMatches.slice(0, half);
    }
    if (bracketViewSlice === 'BOTTOM_HALF') {
      return roundMatches.slice(half);
    }
    if (bracketViewSlice === 'FINALS') {
      // Solo rondas avanzadas (últimas 2 o 3)
      return r >= maxRound - 2 ? roundMatches : [];
    }
    return roundMatches;
  };

  const getRoundName = (r: number) => {
    if (r === maxRound) return 'FINAL';
    if (r === maxRound - 1) return 'SEMIFINAL';
    if (r === maxRound - 2) return 'TOP-8 (CUARTOS)';
    if (r === maxRound - 3) return 'OCTAVOS (R16)';
    if (r === maxRound - 4) return 'DIECISEISAVOS (R32)';
    return `RONDA ${r}`;
  };

  const isDark = theme === 'DARK';

  // Paletas de color
  const bgClass = isDark ? 'bg-[#07090e] text-slate-100' : 'bg-[#f4f6f9] text-slate-800';
  const headerBgClass = isDark 
    ? 'bg-gradient-to-r from-[#0d121f] via-[#121829] to-[#0d121f] border-b border-slate-800' 
    : 'bg-[#0f5132] text-white border-b border-[#0b3d26]';
  const cardBgClass = isDark ? 'bg-[#0f1422] border-slate-800' : 'bg-white border-slate-300';
  const playerRowClass = isDark ? 'bg-[#141b2d]' : 'bg-[#f8f9fa]';

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen max-h-screen overflow-hidden flex flex-col font-sans select-none ${bgClass}`}
    >
      {/* 1. CABECERA TELEVISIVA ESTILO NAKKA N01 */}
      <header className={`px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-20 shadow-md ${headerBgClass}`}>
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-[#146c43] hover:bg-[#115b39] text-white'
              }`}
            >
              <X className="w-4 h-4" />
              <span>Volver</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676]">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-none uppercase">
                  {tournament.title}
                </h1>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  tournament.status === 'COMPLETED' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30 animate-pulse'
                }`}>
                  {tournament.status === 'COMPLETED' ? 'FINALIZADO' : 'EN VIVO'}
                </span>
              </div>
              <div className={`text-[11px] mt-0.5 flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-slate-200'}`}>
                <span>📍 {tournament.venueName || 'Sede Central'} • {tournament.city}</span>
                <span>🎯 {tournament.bestOfLegs ? `Primero a ${Math.ceil(tournament.bestOfLegs / 2)} legs (Mejor de ${tournament.bestOfLegs})` : '501 Doble Out'}</span>
                {tournament.hasCashPrizes && tournament.prizePoolArs > 0 && (
                  <span className="text-amber-300 font-bold">💰 Pozo: ${tournament.prizePoolArs.toLocaleString('es-AR')} ARS</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de Vista (Nakka Tabs) */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-black/30 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('BRACKET')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'BRACKET' 
                ? (isDark ? 'bg-white text-black shadow' : 'bg-white text-[#0f5132] shadow font-black') 
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-emerald-100 hover:text-white')
            }`}
          >
            Cuadro (Llave)
          </button>

          {(tournament.groupsCount && tournament.groupsCount > 0) && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('GROUPS')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'GROUPS' 
                    ? (isDark ? 'bg-white text-black shadow' : 'bg-white text-[#0f5132] shadow font-black') 
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-emerald-100 hover:text-white')
                }`}
              >
                Round Robin (Grupos)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SPLIT')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'SPLIT' 
                    ? (isDark ? 'bg-white text-black shadow' : 'bg-white text-[#0f5132] shadow font-black') 
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-emerald-100 hover:text-white')
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Grupos + Cuadro TV</span>
              </button>
            </>
          )}
        </div>

        {/* Controles de Pantalla TV */}
        <div className="flex items-center gap-2">
          {/* Selector de Rebanada / Zoom para TV */}
          <div className="hidden lg:flex items-center gap-1 bg-black/20 p-0.5 rounded-xl border border-white/10 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setBracketViewSlice('ALL')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                bracketViewSlice === 'ALL' 
                  ? (isDark ? 'bg-[#00e676] text-black font-black' : 'bg-white text-[#0f5132] font-black') 
                  : (isDark ? 'text-slate-400' : 'text-emerald-100')
              }`}
              title="Mostrar toda la llave en una pantalla sin scroll"
            >
              100% Pantalla
            </button>
            <button
              type="button"
              onClick={() => setBracketViewSlice('TOP_HALF')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                bracketViewSlice === 'TOP_HALF' 
                  ? (isDark ? 'bg-[#00e676] text-black font-black' : 'bg-white text-[#0f5132] font-black') 
                  : (isDark ? 'text-slate-400' : 'text-emerald-100')
              }`}
              title="Mitad Superior"
            >
              Mitad Alta
            </button>
            <button
              type="button"
              onClick={() => setBracketViewSlice('BOTTOM_HALF')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                bracketViewSlice === 'BOTTOM_HALF' 
                  ? (isDark ? 'bg-[#00e676] text-black font-black' : 'bg-white text-[#0f5132] font-black') 
                  : (isDark ? 'text-slate-400' : 'text-emerald-100')
              }`}
              title="Mitad Inferior"
            >
              Mitad Baja
            </button>
            <button
              type="button"
              onClick={() => setBracketViewSlice('FINALS')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                bracketViewSlice === 'FINALS' 
                  ? (isDark ? 'bg-amber-400 text-black font-black' : 'bg-white text-[#0f5132] font-black') 
                  : (isDark ? 'text-slate-400' : 'text-emerald-100')
              }`}
              title="Solo Cuartos, Semis y Final"
            >
              Finales
            </button>
          </div>

          {/* Toggle Auto-Rotación */}
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              autoRotate 
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 animate-pulse' 
                : (isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-[#146c43] text-white border-emerald-700')
            }`}
            title="Auto-rotar vistas cada 18 segundos"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline text-[10px]">Auto-TV</span>
          </button>

          {/* Tema Claro / Oscuro */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'LIGHT' : 'DARK')}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-400' : 'bg-[#146c43] hover:bg-[#115b39] text-white'
            }`}
            title={isDark ? 'Cambiar a Modo Claro Nakka' : 'Cambiar a Modo Oscuro LPLD'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Pantalla Completa TV */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#00e676] hover:bg-[#00c965] text-[#07090e] font-black flex items-center gap-1.5 shadow-lg shadow-[#00e676]/20 transition-all"
            title="Ver en Pantalla Completa (F11 / TV)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs">TV 32"</span>
          </button>
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL: LLAVE ESTILO NAKKA SIN SCROLL */}
      <main className="flex-1 overflow-hidden p-2 sm:p-3 relative flex flex-col">
        {activeTab === 'BRACKET' && (
          <div className="flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Columnas de Rondas */}
            <div className="flex-1 w-full h-full grid gap-2 sm:gap-4 overflow-hidden" style={{
              gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))`
            }}>
              {rounds.map((roundNum) => {
                const roundMatches = getFilteredRoundMatches(roundNum);
                const title = getRoundName(roundNum);

                return (
                  <div
                    key={roundNum}
                    className="flex flex-col h-full overflow-hidden justify-between"
                  >
                    {/* Encabezado de la Ronda (estilo Nakka) */}
                    <div className={`text-center py-1.5 px-2 rounded-xl font-black text-xs tracking-wider uppercase mb-2 flex-shrink-0 ${
                      roundNum === maxRound 
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                        : (isDark ? 'bg-[#111622] text-slate-300 border border-slate-800' : 'bg-slate-200 text-slate-700 border border-slate-300')
                    }`}>
                      {title}
                    </div>

                    {/* Lista de Partidos Distribuidos Uniformemente para que quepan al 100% */}
                    <div className="flex-1 flex flex-col justify-around gap-1.5 overflow-hidden">
                      {roundMatches.map((match) => {
                        const isP1Winner = match.winnerId && match.player1 && match.winnerId === match.player1.id;
                        const isP2Winner = match.winnerId && match.player2 && match.winnerId === match.player2.id;
                        const isLive = match.status === 'LIVE';

                        return (
                          <div
                            key={match.id}
                            className={`rounded-xl border transition-all relative overflow-hidden flex flex-col justify-center px-2 py-1 shadow-sm ${
                              isLive
                                ? (isDark 
                                    ? 'bg-[#162032] border-[#00e676] shadow-[0_0_15px_rgba(0,230,118,0.3)] ring-1 ring-[#00e676]' 
                                    : 'bg-emerald-50 border-[#0f5132] shadow-md ring-1 ring-[#0f5132]')
                                : cardBgClass
                            }`}
                          >
                            {/* Live Badge Superior si está en curso */}
                            {isLive && (
                              <div className="absolute top-0 right-0 bg-[#00e676] text-black font-black text-[9px] px-1.5 py-0.2 rounded-bl-md flex items-center gap-1 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                                <span>EN VIVO</span>
                              </div>
                            )}

                            {/* FILA JUGADOR 1 */}
                            <div className={`flex items-center justify-between py-0.5 px-1 rounded-md text-xs transition-colors ${
                              isP1Winner 
                                ? (isDark ? 'bg-[#00e676]/20 text-[#00e676] font-black' : 'bg-[#e8f5e9] text-[#0f5132] font-black') 
                                : ''
                            }`}>
                              <div className="flex items-center gap-1.5 truncate flex-1 pr-1">
                                <span className="text-[10px] text-slate-400 font-bold w-4 flex-shrink-0">
                                  {match.player1?.seed || match.matchIndex * 2 + 1}
                                </span>
                                <span className="text-xs select-none">
                                  {getCountryFlag(match.player1?.countryCode || match.player1?.nationality || 'AR')}
                                </span>
                                <span className="truncate font-bold">
                                  {match.player1 ? match.player1.name : <span className="text-slate-500 italic">Por definir</span>}
                                </span>
                                {match.player1 && (
                                  <span className="text-[10px] text-slate-400 font-normal hidden xl:inline">
                                    (AVG {(match.player1 as any).avg || 48})
                                  </span>
                                )}
                              </div>
                              <div className={`w-6 h-5 rounded flex items-center justify-center font-mono font-black text-xs flex-shrink-0 border ${
                                isP1Winner
                                  ? 'bg-[#00e676] text-black border-[#00e676]'
                                  : (isDark ? 'bg-[#07090e] text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300')
                              }`}>
                                {match.status === 'SCHEDULED' && !match.scoreP1 && !match.scoreP2 ? '-' : match.scoreP1}
                              </div>
                            </div>

                            {/* FILA JUGADOR 2 */}
                            <div className={`flex items-center justify-between py-0.5 px-1 rounded-md text-xs mt-0.5 transition-colors ${
                              isP2Winner 
                                ? (isDark ? 'bg-[#00e676]/20 text-[#00e676] font-black' : 'bg-[#e8f5e9] text-[#0f5132] font-black') 
                                : ''
                            }`}>
                              <div className="flex items-center gap-1.5 truncate flex-1 pr-1">
                                <span className="text-[10px] text-slate-400 font-bold w-4 flex-shrink-0">
                                  {match.player2?.seed || match.matchIndex * 2 + 2}
                                </span>
                                <span className="text-xs select-none">
                                  {getCountryFlag(match.player2?.countryCode || match.player2?.nationality || 'AR')}
                                </span>
                                <span className="truncate font-bold">
                                  {match.player2 ? match.player2.name : <span className="text-slate-500 italic">Por definir</span>}
                                </span>
                                {match.player2 && (
                                  <span className="text-[10px] text-slate-400 font-normal hidden xl:inline">
                                    (AVG {(match.player2 as any).avg || 45})
                                  </span>
                                )}
                              </div>
                              <div className={`w-6 h-5 rounded flex items-center justify-center font-mono font-black text-xs flex-shrink-0 border ${
                                isP2Winner
                                  ? 'bg-[#00e676] text-black border-[#00e676]'
                                  : (isDark ? 'bg-[#07090e] text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300')
                              }`}>
                                {match.status === 'SCHEDULED' && !match.scoreP1 && !match.scoreP2 ? '-' : match.scoreP2}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Partido por el 3er Puesto (Nakka style al pie) */}
            {thirdPlaceMatch && (
              <div className={`mt-2 p-2 rounded-2xl border flex items-center justify-between flex-shrink-0 ${
                isDark ? 'bg-[#0c101c] border-amber-500/30' : 'bg-amber-50 border-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs">
                    🥉
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-amber-400 block">
                      Partido por el 3er Puesto
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Disputa del último escalón del podio oficial
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span>{thirdPlaceMatch.player1?.name || 'Por definir'}</span>
                    <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 font-mono font-black border border-amber-500/30">
                      {thirdPlaceMatch.scoreP1}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-500">VS</span>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 font-mono font-black border border-amber-500/30">
                      {thirdPlaceMatch.scoreP2}
                    </span>
                    <span>{thirdPlaceMatch.player2?.name || 'Por definir'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. VISTA DE GRUPOS ROUND ROBIN (MATRIZ NAKKA N01) */}
        {(activeTab === 'GROUPS' || activeTab === 'SPLIT') && (
          <div className={`w-full overflow-y-auto ${activeTab === 'SPLIT' ? 'h-1/2 pb-2 border-b border-slate-700' : 'h-full'}`}>
            <div className="text-xs font-black uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className={isDark ? 'text-emerald-400' : 'text-[#0f5132]'}>
                Fase de Grupos • Round Robin ({tournament.groupsCount || 4} Zonas)
              </span>
              <span className="text-[10px] text-slate-400">
                Pasan a Playoffs los 2 mejores de cada grupo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {Array.from({ length: tournament.groupsCount || 4 }).map((_, groupIdx) => {
                const groupLetter = String.fromCharCode(65 + groupIdx); // A, B, C, D
                const groupNum = groupIdx + 1;

                return (
                  <div
                    key={groupIdx}
                    className={`rounded-2xl border p-2.5 shadow-sm ${cardBgClass}`}
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/50">
                      <span className="text-xs font-black text-white">Grupo {groupNum}</span>
                      <span className="text-[10px] text-slate-400 font-bold">Primero a 4 legs</span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-slate-400 border-b border-slate-800">
                          <th className="py-1 px-1">#</th>
                          <th className="py-1 px-1">Nombre</th>
                          <th className="py-1 px-1 text-center">G-P</th>
                          <th className="py-1 px-1 text-center">Legs</th>
                          <th className="py-1 px-1 text-center">Pos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {Array.from({ length: tournament.playersPerGroup || 4 }).map((_, pIdx) => {
                          const player = tournament.enrolledPlayers?.[groupIdx * 4 + pIdx];
                          const isTop2 = pIdx < 2;

                          return (
                            <tr
                              key={pIdx}
                              className={`py-1 text-xs ${isTop2 ? (isDark ? 'text-emerald-300 font-bold' : 'text-emerald-800 font-bold') : ''}`}
                            >
                              <td className="py-1 px-1 text-slate-400 font-mono text-[10px]">{pIdx + 1}</td>
                              <td className="py-1 px-1 truncate max-w-[120px]">
                                {player ? player.name : `Jugador ${groupLetter}${pIdx + 1}`}
                              </td>
                              <td className="py-1 px-1 text-center font-mono text-[10px]">0-0</td>
                              <td className="py-1 px-1 text-center font-mono text-[10px]">0-0</td>
                              <td className="py-1 px-1 text-center font-mono font-black text-[10px]">
                                {isTop2 ? <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">Q</span> : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER BROADCAST EN VIVO */}
      <footer className={`px-4 py-1.5 flex items-center justify-between text-[11px] border-t flex-shrink-0 ${
        isDark ? 'bg-[#0a0e18] border-slate-800 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
          <span className="font-bold text-white">LPLD Live TV Engine</span>
          <span className="text-slate-500">•</span>
          <span>Sincronización online en vivo cada 3.5s con anotadores de pista</span>
        </div>

        <div className="flex items-center gap-4">
          <span>Organiza: <strong>{tournament.organizer || 'Darderos Mar del Plata'}</strong></span>
          <span className="hidden sm:inline font-mono">
            {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
          </span>
        </div>
      </footer>
    </div>
  );
};
