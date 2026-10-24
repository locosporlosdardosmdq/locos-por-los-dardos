'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayerProfile } from '@/lib/types';
import { fetchRegisteredPlayersFromCloud, getCurrentPlayerProfile } from '@/lib/storage';
import { USER_ICEMAN, getCountryFlag } from '@/lib/constants';
import { Flame, Zap, Trophy, Target, Shield, Skull, Sparkles, Plus, Award, Swords } from 'lucide-react';

interface HighCheckoutRecord {
  id: string;
  playerId: string;
  playerName: string;
  playerNickname: string;
  avatarUrl: string;
  nationality?: string;
  countryCode?: string;
  score: number;
  dartsCombo: string;
  eventName: string;
  date: string;
}

interface Club180Record {
  playerId: string;
  playerName: string;
  playerNickname: string;
  avatarUrl: string;
  nationality?: string;
  countryCode?: string;
  count180s: number;
  last180Date?: string;
  badgeTitle: string;
}

export const MortalKombatStats: React.FC = () => {
  const [players, setPlayers] = useState<PlayerProfile[]>([USER_ICEMAN]);
  const [activeTab, setActiveTab] = useState<'TOP5_CHECKOUTS' | 'CLUB_180' | 'ALL'>('ALL');
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [recordType, setRecordType] = useState<'CHECKOUT' | '180'>('CHECKOUT');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [customScore, setCustomScore] = useState(170);
  const [customCombo, setCustomCombo] = useState('T20 - T20 - BULL');
  const [customEvent, setCustomEvent] = useState('Campeonato Argentino MDQ 2026');

  // Récords persistidos en localStorage
  const [highCheckouts, setHighCheckouts] = useState<HighCheckoutRecord[]>([]);
  const [club180s, setClub180s] = useState<Club180Record[]>([]);

  useEffect(() => {
    // 1. Cargar jugadores registrados
    fetchRegisteredPlayersFromCloud().then((cloud) => {
      if (cloud && cloud.length > 0) {
        setPlayers(cloud);
        if (!selectedPlayerId) setSelectedPlayerId(cloud[0].id);
      }
    });

    // 2. Cargar récords de checkouts locales
    const storedCheckouts = localStorage.getItem('lpld_mortal_kombat_checkouts');
    if (storedCheckouts) {
      try {
        setHighCheckouts(JSON.parse(storedCheckouts));
      } catch {
        // Fallback
      }
    } else {
      // Benchmark inicial canónico para que la cartelera luzca estelar y lista para desafiar
      const initialBenchmarks: HighCheckoutRecord[] = [
        {
          id: 'hk-1',
          playerId: 'iceman-001',
          playerName: 'Mariano Deux',
          playerNickname: 'ICEMAN',
          avatarUrl: '/images/iceman-perfil.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          score: 170,
          dartsCombo: 'T20 • T20 • BULL (Big Fish) 🎯',
          eventName: 'Récord Máximo Histórico Mar del Plata',
          date: '2026'
        },
        {
          id: 'hk-2',
          playerId: 'user-zeus',
          playerName: 'Gabriel Rubio',
          playerNickname: 'ZEUS',
          avatarUrl: '/logos/logo-mdq.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          score: 164,
          dartsCombo: 'T20 • T18 • BULL 🎯',
          eventName: 'Liga Marplatense Oficial',
          date: '2026'
        },
        {
          id: 'hk-3',
          playerId: 'user-carpo',
          playerName: 'Victor Albaitero',
          playerNickname: 'CARPO',
          avatarUrl: '/logos/logo-mdq.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          score: 160,
          dartsCombo: 'T20 • T20 • D20 🎯',
          eventName: 'Circuito Federal Argentino',
          date: '2026'
        },
        {
          id: 'hk-4',
          playerId: 'user-gondizz',
          playerName: 'Gonzalo Fernández',
          playerNickname: 'GonDizz',
          avatarUrl: '/logos/logo-mdq.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          score: 156,
          dartsCombo: 'T20 • T20 • D18 🎯',
          eventName: 'Open Pompeya Arena',
          date: '2026'
        },
        {
          id: 'hk-5',
          playerId: 'user-cashier',
          playerName: 'Héctor Giménez',
          playerNickname: 'THE CASHIER',
          avatarUrl: '/logos/logo-mdq.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          score: 140,
          dartsCombo: 'T20 • T20 • D10 🎯',
          eventName: 'Torneo Oficial de Verano',
          date: '2026'
        }
      ];
      setHighCheckouts(initialBenchmarks);
      localStorage.setItem('lpld_mortal_kombat_checkouts', JSON.stringify(initialBenchmarks));
    }

    // 3. Cargar Club de los 180s
    const stored180s = localStorage.getItem('lpld_mortal_kombat_180s');
    if (stored180s) {
      try {
        setClub180s(JSON.parse(stored180s));
      } catch {
        // Fallback
      }
    } else {
      const initial180s: Club180Record[] = [
        {
          playerId: 'iceman-001',
          playerName: 'Mariano Deux',
          playerNickname: 'ICEMAN',
          avatarUrl: '/images/iceman-perfil.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          count180s: 18,
          last180Date: '2026-10',
          badgeTitle: 'GRAND MASTER 180'
        },
        {
          playerId: 'user-zeus',
          playerName: 'Gabriel Rubio',
          playerNickname: 'ZEUS',
          avatarUrl: '/logos/logo-mdq.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          count180s: 14,
          last180Date: '2026-10',
          badgeTitle: 'LIGHTNING STRIKER'
        },
        {
          playerId: 'user-carpo',
          playerName: 'Victor Albaitero',
          playerNickname: 'CARPO',
          avatarUrl: '/logos/logo-mdq.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          count180s: 11,
          last180Date: '2026-09',
          badgeTitle: 'TRIPLE 20 HUNTER'
        },
        {
          playerId: 'user-gondizz',
          playerName: 'Gonzalo Fernández',
          playerNickname: 'GonDizz',
          avatarUrl: '/logos/logo-mdq.png',
          nationality: 'Argentina',
          countryCode: 'AR',
          count180s: 8,
          last180Date: '2026-08',
          badgeTitle: 'MAXIMUM EXECUTIONER'
        }
      ];
      setClub180s(initial180s);
      localStorage.setItem('lpld_mortal_kombat_180s', JSON.stringify(initial180s));
    }
  }, [selectedPlayerId]);

  // Manejador para registrar nuevo 180 o High Checkout
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const p = players.find(x => x.id === selectedPlayerId) || USER_ICEMAN;

    if (recordType === 'CHECKOUT') {
      const newRec: HighCheckoutRecord = {
        id: `hk-${Date.now()}`,
        playerId: p.id,
        playerName: p.fullName || p.nickname,
        playerNickname: p.nickname || p.fullName,
        avatarUrl: p.avatarUrl || '/logos/logo-mdq.png',
        nationality: p.nationality || 'Argentina',
        countryCode: p.countryCode || 'AR',
        score: customScore,
        dartsCombo: customCombo,
        eventName: customEvent,
        date: new Date().getFullYear().toString()
      };

      const updated = [...highCheckouts, newRec]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Mantener el Top 5 estricto

      setHighCheckouts(updated);
      localStorage.setItem('lpld_mortal_kombat_checkouts', JSON.stringify(updated));
    } else {
      // 180
      const existing = club180s.find(c => c.playerId === p.id);
      let updated: Club180Record[];
      if (existing) {
        updated = club180s.map(c => c.playerId === p.id ? { ...c, count180s: c.count180s + 1, last180Date: new Date().toISOString().slice(0, 7) } : c);
      } else {
        updated = [
          ...club180s,
          {
            playerId: p.id,
            playerName: p.fullName || p.nickname,
            playerNickname: p.nickname || p.fullName,
            avatarUrl: p.avatarUrl || '/logos/logo-mdq.png',
            nationality: p.nationality || 'Argentina',
            countryCode: p.countryCode || 'AR',
            count180s: 1,
            last180Date: new Date().toISOString().slice(0, 7),
            badgeTitle: 'WARRIOR 180'
          }
        ];
      }
      updated.sort((a, b) => b.count180s - a.count180s);
      setClub180s(updated);
      localStorage.setItem('lpld_mortal_kombat_180s', JSON.stringify(updated));
    }

    setShowAddRecordModal(false);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* HEADER ARCADE MORTAL KOMBAT */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d0714] via-[#150a21] to-[#07090e] border-2 border-red-500/40 p-6 sm:p-8 shadow-2xl shadow-red-950/40">
        {/* Glow de fondo y relámpagos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-widest animate-pulse">
              <Swords className="w-4 h-4" />
              <span>Mortal Kombat Darts Arena • Récords de Élite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_16px_rgba(239,68,68,0.5)]">
              HALL OF FAME &amp; FATALITY FINISHES
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-medium">
              Los guerreros del dardo que alcanzaron la gloria máxima. Registros oficiales de los cierres más letales (Top 5) y el selecto Club de las 180 máximas puntuaciones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddRecordModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all active:scale-95 border border-red-400/50"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Hazaña</span>
            </button>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS ESTILO ARCADE */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-4 border-t border-red-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'ALL'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 border border-red-400'
                : 'bg-black/50 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            🔥 Ver Todo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TOP5_CHECKOUTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'TOP5_CHECKOUTS'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 border border-amber-300'
                : 'bg-black/50 text-gray-400 hover:text-amber-400 border border-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Top 5 Cierres Más Altos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CLUB_180')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'CLUB_180'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 border border-emerald-300'
                : 'bg-black/50 text-gray-400 hover:text-emerald-400 border border-white/10'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Club del 180</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: TOP 5 CIERRES MÁS ALTOS (MORTAL KOMBAT TOWER LADDER) */}
      {(activeTab === 'ALL' || activeTab === 'TOP5_CHECKOUTS') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>TOP 5 CIERRES MÁS ALTOS</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    FATALITY FINISHES
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Los cierres más espectaculares logrados con Double Out en competiciones de la Asociación
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {highCheckouts.slice(0, 5).map((record, index) => {
              const rank = index + 1;
              const isRank1 = rank === 1;
              const isRank2 = rank === 2;
              const isRank3 = rank === 3;

              const cardBorder = isRank1 
                ? 'border-amber-400/80 shadow-amber-500/30 bg-gradient-to-b from-[#221706] to-[#0c0906]' 
                : isRank2 
                ? 'border-slate-300/60 shadow-slate-400/20 bg-gradient-to-b from-[#181a20] to-[#0a0b0e]'
                : isRank3
                ? 'border-amber-700/60 shadow-amber-800/20 bg-gradient-to-b from-[#1a110a] to-[#090604]'
                : 'border-red-900/40 bg-gradient-to-b from-[#150a10] to-[#07090e]';

              const rankBadgeBg = isRank1
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black'
                : isRank2
                ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-black font-black'
                : isRank3
                ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-white font-black'
                : 'bg-red-950/80 text-red-400 border border-red-500/30';

              return (
                <div
                  key={record.id}
                  className={`relative group rounded-3xl border-2 ${cardBorder} p-4 flex flex-col items-center text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden`}
                >
                  {/* Halo de fuego detrás de la tarjeta */}
                  <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

                  {/* Número de Ranking Arcade */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-2.5 py-1 rounded-xl text-xs uppercase tracking-widest ${rankBadgeBg} shadow-md`}>
                      #{rank}
                    </span>
                  </div>

                  {/* Puntuación Gigante Checkout */}
                  <div className="mt-6 mb-3">
                    <div className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                      {record.score}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 block mt-0.5">
                      PUNTOS CHECKOUT
                    </span>
                  </div>

                  {/* Foto de Peleador Mortal Kombat */}
                  <div className="relative my-2">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-xl shadow-amber-500/20 bg-black relative group-hover:scale-105 transition-transform">
                      <Image
                        src={record.avatarUrl}
                        alt={record.playerName}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 text-base" title={record.nationality || 'Argentina'}>
                      {getCountryFlag(record.countryCode || record.nationality || 'AR')}
                    </span>
                  </div>

                  {/* Nombre y Nick del Peleador */}
                  <div className="mt-2 w-full">
                    <p className="text-xs text-gray-400 font-bold uppercase truncate">
                      {record.playerName}
                    </p>
                    <h4 className="text-base font-black text-white uppercase tracking-tight truncate drop-shadow">
                      &quot;{record.playerNickname}&quot;
                    </h4>
                  </div>

                  {/* Combinación de dardos / Combo Kill */}
                  <div className="mt-3 w-full bg-black/60 rounded-xl p-2 border border-amber-500/20">
                    <span className="text-[9px] font-black uppercase text-amber-400 block tracking-wider mb-0.5">
                      COMBINACIÓN GANADORA
                    </span>
                    <span className="text-xs font-black text-white font-mono block">
                      {record.dartsCombo}
                    </span>
                  </div>

                  {/* Evento y fecha */}
                  <div className="mt-3 pt-2 border-t border-white/5 w-full text-[10px] text-gray-400 truncate">
                    {record.eventName} ({record.date})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: CLUB DEL 180 (THE 180 MAXIMUMS GUILD) */}
      {(activeTab === 'ALL' || activeTab === 'CLUB_180') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>CLUB DEL 180 • SALÓN DE LA GLORIA</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    ONE HUNDRED AND EIGHTY!
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Los artilleros con mayor cantidad de 180s registrados oficialmente en dianas de sisal
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {club180s.map((warrior, idx) => {
              const isTop = idx === 0;

              return (
                <div
                  key={warrior.playerId}
                  className={`relative rounded-3xl border-2 ${
                    isTop
                      ? 'border-red-500 shadow-2xl shadow-red-600/30 bg-gradient-to-b from-[#26090e] via-[#140608] to-[#07090e]'
                      : 'border-slate-800 hover:border-red-500/50 bg-gradient-to-b from-[#111622] to-[#07090e]'
                  } p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 overflow-hidden group`}
                >
                  {/* Flama animada superior */}
                  {isTop && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 fill-current animate-bounce" />
                      LÍDER 180s
                    </div>
                  )}

                  {/* Foto con Anillo de Poder de Mortal Kombat */}
                  <div className="relative my-3">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-500 shadow-xl shadow-red-600/40 bg-black relative group-hover:scale-105 transition-transform">
                      <Image
                        src={warrior.avatarUrl}
                        alt={warrior.playerName}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-black/90 border border-red-500/50 flex items-center justify-center text-base">
                      {getCountryFlag(warrior.countryCode || warrior.nationality || 'AR')}
                    </div>
                  </div>

                  {/* Nombre y Título del Peleador */}
                  <div className="w-full">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 inline-block mb-1">
                      {warrior.badgeTitle}
                    </span>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight truncate">
                      {warrior.playerName}
                    </h4>
                    <p className="text-xs text-amber-400 font-black uppercase tracking-wider">
                      &quot;{warrior.playerNickname}&quot;
                    </p>
                  </div>

                  {/* Cantidad de 180s Gigante */}
                  <div className="mt-4 w-full bg-black/80 rounded-2xl p-3 border border-red-900/40 flex items-center justify-center gap-3">
                    <Flame className="w-6 h-6 text-red-500 fill-red-500/30 animate-pulse" />
                    <div className="text-left">
                      <span className="text-3xl font-black font-mono text-white leading-none block">
                        {warrior.count180s}
                      </span>
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                        180s OFICIALES
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL PARA REGISTRAR NUEVA HAZAÑA (180 O CIERRE) */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border-2 border-red-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Swords className="w-5 h-5 text-red-500" />
                <span>Registrar Hazaña Histórica</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRecordModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Tipo de Récord
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecordType('CHECKOUT')}
                    className={`p-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      recordType === 'CHECKOUT'
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-black/50 text-gray-400 border-slate-800'
                    }`}
                  >
                    🎯 Cierre Alto (Checkout)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordType('180')}
                    className={`p-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      recordType === '180'
                        ? 'bg-red-600 text-white border-red-400'
                        : 'bg-black/50 text-gray-400 border-slate-800'
                    }`}
                  >
                    🔥 180 Máximo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Jugador Federado
                </label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName || p.nickname} ({p.nickname})
                    </option>
                  ))}
                </select>
              </div>

              {recordType === 'CHECKOUT' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Puntaje del Cierre (Máx 170)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={170}
                      value={customScore}
                      onChange={(e) => setCustomScore(Number(e.target.value))}
                      className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Combinación de Dardos (Ej: T20 • T20 • BULL)
                    </label>
                    <input
                      type="text"
                      value={customCombo}
                      onChange={(e) => setCustomCombo(e.target.value)}
                      className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Torneo o Encuentro Oficial
                    </label>
                    <input
                      type="text"
                      value={customEvent}
                      onChange={(e) => setCustomEvent(e.target.value)}
                      className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30"
                >
                  Confirmar y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
