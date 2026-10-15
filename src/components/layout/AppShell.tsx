'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { AppBottomNav } from './AppBottomNav';
import { CartDrawer } from '@/components/tienda/CartDrawer';
import { OnboardingProfileModal } from '@/components/perfil/OnboardingProfileModal';
import { useCart } from '@/app/providers';
import { getActiveMatchSession, ActiveMatchSession } from '@/lib/storage';
import { Play, Target, ArrowRight } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, clearCart } = useCart();
  const pathname = usePathname();
  const [activeSession, setActiveSession] = useState<ActiveMatchSession | null>(null);

  useEffect(() => {
    setActiveSession(getActiveMatchSession());

    const handleSessionChange = (e: any) => {
      setActiveSession(e.detail || null);
    };

    window.addEventListener('lpld_active_match_changed', handleSessionChange);
    return () => {
      window.removeEventListener('lpld_active_match_changed', handleSessionChange);
    };
  }, []);

  const isPlayingAnotador = pathname === '/anotador';

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans antialiased">
      {/* Modal obligatorio de primer ingreso si el usuario no ha completado su perfil */}
      <OnboardingProfileModal />

      {/* Menú lateral con colapso/expansión gobernado 100% por Hover del Mouse en PC */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Contenedor principal: margen fijo en desktop (lg:pl-20) para evitar saltos de pantalla */}
      <div className="flex-1 flex flex-col lg:pl-20 transition-all duration-300 ease-in-out">
        {/* BANNER GLOBAL PERSISTENTE: PARTIDA EN JUEGO */}
        {activeSession && !isPlayingAnotador && (
          <aside aria-label="Partida activa en curso" className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b-2 border-[#00e676] px-3 sm:px-6 py-2 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e676]"></span>
              </span>
              <div className="flex items-center gap-1.5 truncate text-xs">
                <span className="font-black text-[#00e676] uppercase tracking-wider hidden sm:inline">Partida en Curso:</span>
                <span className="font-black text-white truncate">
                  {activeSession.config.player1.name} <span className="text-slate-500 font-normal">vs</span> {activeSession.config.player2.name}
                </span>
                {activeSession.config.isOnlineRoom && activeSession.config.onlineRoomCode && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30 hidden md:inline">
                    Sala {activeSession.config.onlineRoomCode}
                  </span>
                )}
                <span className="text-slate-400 text-[11px] hidden lg:inline">
                  • {activeSession.scores[0]} pts ({activeSession.legsWon[0]}L) vs {activeSession.scores[1]} pts ({activeSession.legsWon[1]}L)
                </span>
              </div>
            </div>

            <Link
              href="/anotador"
              className="flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00e676]/20 transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Volver a la Partida ↗</span>
            </Link>
          </aside>
        )}

        {/* Contenido de página a pantalla completa */}
        <main className="flex-1 w-full bg-[#07090e] pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Barra de Navegación Inferior Ergonómica para Celulares y Tablets */}
      <AppBottomNav onOpenMobileMenu={() => setMobileOpen(true)} />

      {/* Carrito de Compras lateral accesible en toda la app */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
};
