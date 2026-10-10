'use client';

import React from 'react';
import { DartScorer } from '@/components/anotador/DartScorer';
import { Target, Zap } from 'lucide-react';

export default function AnotadorPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* Encabezado Rápido Oficial */}
      <div className="flex items-center justify-between bg-[#0f1422] border border-[#ef4444]/30 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white">
              Anotador Oficial en Vivo
            </h1>
            <p className="text-xs text-slate-400">
              Locos por los Dardos & Darderos MDQ • 501 Doble Out, Cricket, Parejas y Árbitro Oficial
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#00e676] bg-[#00e676]/10 border border-[#00e676]/30 px-3 py-1.5 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-[#00e676]" />
          <span>Sincronización PWA Offline</span>
        </div>
      </div>

      {/* Componente Núcleo del Anotador */}
      <DartScorer />
    </div>
  );
}
