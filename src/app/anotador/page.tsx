'use client';

import React from 'react';
import { DartScorer } from '@/components/anotador/DartScorer';
import { Target, Zap } from 'lucide-react';

export default function AnotadorPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* Encabezado Rápido */}
      <div className="flex items-center justify-between bg-board-card border border-board-border rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-board-green/20 text-board-green border border-board-green/30 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-board-sisal">
              Anotador en Vivo Profesional
            </h1>
            <p className="text-xs text-board-sisal-muted">
              Inspirado en My Dart Training • X01, Cricket, Bot AI, Teclado Táctil y Árbitro de Voz
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-board-green bg-board-green/10 border border-board-green/30 px-3 py-1.5 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-board-green" />
          <span>Soporte Offline PWA</span>
        </div>
      </div>

      {/* Componente Núcleo del Anotador */}
      <DartScorer />
    </div>
  );
}
