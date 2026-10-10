'use client';

import React from 'react';
import { NationalRankings } from '@/components/comunidad/NationalRankings';
import { BarChart3 } from 'lucide-react';

export default function RankingPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ranking Nacional Argentino
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tabla de posiciones oficial de jugadores federados en Argentina, categorizados por promedio (AVG 501), victorias y estadísticas avanzadas.
        </p>
      </div>

      <NationalRankings />
    </div>
  );
}
