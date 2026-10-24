'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tournament } from '@/lib/types';
import { getStoredTournaments } from '@/lib/storage';
import { NakkaTvBracketView } from '@/components/torneos/NakkaTvBracketView';
import { Tv, RefreshCw, Trophy, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function TvBracketContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('id');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournamentsList, setTournamentsList] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Storage local
        const local = getStoredTournaments();
        setTournamentsList(local);

        let selected = local.find(t => t.id === tournamentId) || null;

        // 2. Fetch API cloud si no se encontró o para refrescar
        try {
          const res = await fetch('/api/torneos');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.tournaments) && data.tournaments.length > 0) {
              setTournamentsList(data.tournaments);
              if (tournamentId) {
                const cloudFound = data.tournaments.find((t: Tournament) => t.id === tournamentId);
                if (cloudFound) selected = cloudFound;
              } else if (!selected && data.tournaments.length > 0) {
                // Auto-seleccionar el torneo activo más relevante
                selected = data.tournaments.find((t: Tournament) => t.status === 'IN_PROGRESS') || data.tournaments[0];
              }
            }
          }
        } catch {
          // Fallback a local
        }

        if (!selected && local.length > 0) {
          selected = local.find(t => t.status === 'IN_PROGRESS') || local[0];
        }

        setTournament(selected);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 animate-pulse">
          <Tv className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-wider text-white">
          Sincronizando Pantalla TV 32&quot; Estilo Nakka...
        </h1>
        <p className="text-xs text-gray-400 mt-2">
          Cargando llaves eliminatorias y tanteador en vivo para visualización en club
        </p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider text-white mb-2">
          No se encontró ningún torneo activo
        </h1>
        <p className="text-sm text-gray-400 max-w-md mb-6">
          Para proyectar en la TV de 32&quot;, selecciona un torneo creado o genera uno nuevo desde el Gestor Oficial.
        </p>

        {tournamentsList.length > 0 && (
          <div className="w-full max-w-md bg-[#0f1422] border border-[#1e2638] rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Torneos Disponibles para Proyectar:
            </p>
            <div className="space-y-2">
              {tournamentsList.map(t => (
                <Link
                  key={t.id}
                  href={`/torneos/tv-bracket?id=${t.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#07090e] hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/40 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white group-hover:text-emerald-300">
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-gray-400">
                    {t.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/torneos"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-wider text-xs transition-colors"
        >
          Ir al Gestor de Torneos
        </Link>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <NakkaTvBracketView
        tournament={tournament}
        isStandalonePage={true}
      />
    </div>
  );
}

export default function TvBracketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <TvBracketContent />
    </Suspense>
  );
}
