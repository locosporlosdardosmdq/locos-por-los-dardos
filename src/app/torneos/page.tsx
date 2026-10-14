'use client';

import React, { Suspense } from 'react';
import { TournamentManager } from '@/components/torneos/TournamentManager';
import { useSearchParams } from 'next/navigation';

function TorneosContent() {
  const searchParams = useSearchParams();
  const enrollId = searchParams.get('inscribir') || undefined;
  const tournamentId = searchParams.get('torneo') || searchParams.get('id') || enrollId;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
      <TournamentManager 
        initialTournamentId={tournamentId}
        initialEnroll={!!enrollId}
      />
    </div>
  );
}

export default function TorneosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Cargando torneos oficiales...</div>}>
      <TorneosContent />
    </Suspense>
  );
}
