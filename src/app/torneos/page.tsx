'use client';

import React from 'react';
import { TournamentManager } from '@/components/torneos/TournamentManager';
import { Trophy } from 'lucide-react';

export default function TorneosPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
      <TournamentManager />
    </div>
  );
}
