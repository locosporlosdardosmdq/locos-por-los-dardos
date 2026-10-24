'use client';

import React, { useState } from 'react';
import { NationalRankings } from '@/components/comunidad/NationalRankings';
import { MortalKombatStats } from '@/components/ranking/MortalKombatStats';
import { BarChart3, Flame, Trophy, Swords } from 'lucide-react';

export default function RankingPage() {
  const [rankingView, setRankingView] = useState<'LEADERBOARD' | 'MORTAL_KOMBAT'>('LEADERBOARD');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* HEADER DE RANKING */}
      <div className="border-b border-board-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-board-green/20 text-board-green border border-board-green/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-board-sisal tracking-tight">
              Ranking Nacional &amp; Estadísticas Oficiales
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-board-sisal-muted mt-1">
            Tabla de posiciones oficial de jugadores federados en Argentina, categorizados por promedio (AVG 501), victorias y salón de récords.
          </p>
        </div>

        {/* SELECTOR DE MODO DE RANKING */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0f1422] border border-[#1e2638] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setRankingView('LEADERBOARD')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              rankingView === 'LEADERBOARD'
                ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => setRankingView('MORTAL_KOMBAT')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              rankingView === 'MORTAL_KOMBAT'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30 border border-red-400/50'
                : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Flame className="w-4 h-4 text-red-500 fill-red-500/20 animate-pulse" />
            <span>🔥 180s &amp; Top 5 Cierres</span>
          </button>
        </div>
      </div>

      {/* VISTAS */}
      {rankingView === 'LEADERBOARD' ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          <NationalRankings />

          {/* Banner de acceso a Mortal Kombat al pie */}
          <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#0f1422] to-amber-950/30 border-2 border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black uppercase tracking-wide text-white">
                  ¿Quieres ver a los reyes de los 180s y los cierres más altos?
                </h4>
                <p className="text-xs text-gray-400">
                  Descubre las cartas de peleadores de Mortal Kombat con el Top 5 de checkouts y el Salón de la Fama.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRankingView('MORTAL_KOMBAT')}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-lg shadow-red-600/30"
            >
              Ver Salón Mortal Kombat ↗
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          <MortalKombatStats />
        </div>
      )}
    </div>
  );
}
