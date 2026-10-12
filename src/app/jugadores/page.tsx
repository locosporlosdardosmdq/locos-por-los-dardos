import React from 'react';
import { PlayerDirectory } from '@/components/jugadores/PlayerDirectory';
import { Users, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { getRegisteredPlayersServer } from '@/lib/server-players';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function JugadoresPage() {
  const initialPlayers = await getRegisteredPlayersServer();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Directorio Federal de Jugadores
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comunidad de dardistas en Argentina: perfiles deportivos, clubes federados, promedios (AVG) y estadísticas oficiales.
          </p>
        </div>

        <Link
          href="/perfil"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" />
          <span>Registrar Mi Ficha</span>
        </Link>
      </div>

      <PlayerDirectory initialPlayers={initialPlayers} />
    </div>
  );
}
