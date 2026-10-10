'use client';

import React from 'react';
import { DartScorer } from '@/components/anotador/DartScorer';
import { Target, Zap } from 'lucide-react';

export default function AnotadorPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* Encabezado Rápido */}
      <div className="flex items-center justify-between bg-[#0b101c] border border-slate-800 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white">
              Anotador en Vivo Profesional
            </h1>
            <p className="text-xs text-slate-400">
              Inspirado en My Dart Training • X01, Cricket, Bot AI, Teclado Táctil y Árbitro de Voz
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
          <Zap className="w-3.5 h-3.5" />
          <span>Soporte Offline PWA</span>
        </div>
      </div>

      {/* Componente Núcleo del Anotador */}
      <DartScorer />
    </div>
  );
}
