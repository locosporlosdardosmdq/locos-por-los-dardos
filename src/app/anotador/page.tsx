'use client';

import React, { Suspense } from 'react';
import { DartScorer } from '@/components/anotador/DartScorer';
import { Target, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function AnotadorContent() {
  const searchParams = useSearchParams();
  const salaCode = searchParams.get('sala') || searchParams.get('room') || undefined;

  return (
    <div className="w-full max-w-[1700px] mx-auto px-1 sm:px-4 lg:px-6 py-1 sm:py-6 space-y-2 sm:space-y-4">
      {/* Encabezado Rápido Oficial (Oculto en móviles para priorizar espacio vertical para el juego) */}
      <div className="hidden lg:flex items-center justify-between bg-[#0f1422] border border-[#ef4444]/30 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] inline-block animate-pulse" />
              {salaCode ? `Sala Online: ${salaCode}` : 'Anotador Oficial en Vivo'}
            </h1>
            <p className="text-xs text-slate-400">
              Locos por los Dardos & Darderos MDQ • 501 Doble Out, Cricket, Parejas, Salas Online y Árbitro Oficial
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#00e676] bg-[#00e676]/10 border border-[#00e676]/30 px-3 py-1.5 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-[#00e676]" />
          <span>Sincronización PWA Offline</span>
        </div>
      </div>

      {/* Componente Núcleo del Anotador */}
      <DartScorer initialOnlineRoomCode={salaCode} />
    </div>
  );
}

export default function AnotadorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Cargando anotador en vivo...</div>}>
      <AnotadorContent />
    </Suspense>
  );
}
