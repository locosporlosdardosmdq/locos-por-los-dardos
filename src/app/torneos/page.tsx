'use client';

import React from 'react';
import { TournamentManager } from '@/components/torneos/TournamentManager';
import { Trophy } from 'lucide-react';

export default function TorneosPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-board-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-board-blue/20 text-board-blue border border-board-blue/30">
              <Trophy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestor de Torneos Oficial • Llaves y Grupos en Vivo
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-board-sisal-muted mt-1">
            Crea y administra torneos Presenciales y Online con llaves de eliminación directa, doble eliminación y fase de grupos (Round Robin).
          </p>
        </div>
      </div>

      <TournamentManager />
    </div>
  );
}
