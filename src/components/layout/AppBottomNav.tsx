'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Target, 
  Trophy, 
  ShoppingBag, 
  BarChart3, 
  Menu 
} from 'lucide-react';

interface AppBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();

  const isTiendaActive = pathname.startsWith('/tienda');
  const isTorneosActive = pathname.startsWith('/torneos');
  const isAnotadorActive = pathname.startsWith('/anotador');
  const isRankingActive = pathname.startsWith('/ranking');

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-lg border-t border-[#1a2333] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Tienda */}
        <Link
          href="/tienda"
          prefetch={true}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isTiendaActive 
              ? 'text-[#00e676]' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">Tienda</span>
        </Link>

        {/* 2. Torneos */}
        <Link
          href="/torneos"
          prefetch={true}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isTorneosActive 
              ? 'text-[#00e676]' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">Torneos</span>
        </Link>

        {/* 3. ANOTADOR CENTRAL DESTACADO (Ideal para uso táctil en el oche) */}
        <Link
          href="/anotador"
          prefetch={true}
          className="relative -top-3.5 flex flex-col items-center justify-center"
          title="Anotador de Partida"
        >
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl transition-transform active:scale-95 ${
            isAnotadorActive
              ? 'bg-[#00e676] text-[#07090e] shadow-[0_0_20px_rgba(0,230,118,0.5)] ring-4 ring-[#07090e]'
              : 'bg-[#00e676] text-[#07090e] shadow-[0_0_15px_rgba(0,230,118,0.3)] ring-4 ring-[#07090e] hover:scale-105'
          }`}>
            <Target className="w-7 h-7 stroke-[2.8]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#00e676] mt-0.5 font-mono">
            Anotar
          </span>
        </Link>

        {/* 4. Ranking */}
        <Link
          href="/ranking"
          prefetch={true}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isRankingActive 
              ? 'text-[#00e676]' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">Ranking</span>
        </Link>

        {/* 5. Menú / Más */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
          aria-label="Abrir más opciones"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">Más</span>
        </button>
      </div>
    </nav>
  );
};
