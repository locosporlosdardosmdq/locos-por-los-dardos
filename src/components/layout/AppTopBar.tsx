'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/app/providers';
import { BrandLogo } from '../BrandLogo';
import { 
  Menu, 
  ShoppingBag, 
  Download, 
  Target, 
  Trophy, 
  BarChart3, 
  Users, 
  Settings, 
  Sparkles,
  Zap
} from 'lucide-react';

interface AppTopBarProps {
  onOpenMobileSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  onOpenMobileSidebar,
  sidebarCollapsed
}) => {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      alert('Para instalar la PWA de Dardos:\nEn Android: Menú de Chrome > "Agregar a pantalla principal"\nEn iOS: Botón Compartir > "Agregar al inicio"');
    }
  };

  const getPageTitle = () => {
    if (pathname === '/') return 'Comunidad Oficial de Dardos Argentina';
    if (pathname.startsWith('/anotador')) return 'Anotador en Vivo • My Dart Training';
    if (pathname.startsWith('/torneos')) return 'Torneos Oficiales • Formato Nakka n01';
    if (pathname.startsWith('/tienda')) return 'Tienda Oficial de Dardos • Mercado Pago ARS';
    if (pathname.startsWith('/ranking')) return 'Ranking Nacional Argentino';
    if (pathname.startsWith('/jugadores')) return 'Directorio Federal de Jugadores';
    if (pathname.startsWith('/perfil')) return 'Configuración & Perfil Deportivo';
    return 'Locos por los Dardos';
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#0a0e17]/95 backdrop-blur-md border-b border-[#1a2333] px-3 sm:px-6 flex items-center justify-between">
      {/* Izquierda: Botón Hamburguesa Móvil + Título de Sección */}
      <div className="flex items-center gap-3">
        {/* Hamburguesa en móvil */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-[#0f1524] border border-[#1e2a40] hover:border-[#00e676]"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo en móvil */}
        <div className="lg:hidden">
          <Link href="/">
            <BrandLogo size="sm" showText={false} />
          </Link>
        </div>

        {/* Título de la Sección Activa en Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse"></span>
          <h1 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Derecha: Botones de Acción (Idénticos a la Captura 1 del Usuario) */}
      <div className="flex items-center gap-2.5">
        {/* Carrito de Compras */}
        <button
          type="button"
          onClick={openCart}
          className="relative p-2.5 rounded-xl text-slate-300 hover:text-white bg-[#0f1524] border border-[#1e2a40] hover:border-emerald-500/50 transition-colors"
          title="Ver Carrito de Compras"
          aria-label="Carrito de compras"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#00e676] text-[#07090e] font-black text-[10px] flex items-center justify-center shadow-lg shadow-emerald-500/40">
              {totalItems}
            </span>
          )}
        </button>

        {/* Botón: Instalar App (Azul Cian como en Captura 1) */}
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs tracking-wide transition-all shadow-md shadow-sky-600/25"
            title="Instalar aplicación en tu dispositivo"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Instalar App</span>
          </button>
        )}

        {/* Botón: ANOTAR PARTIDA (Verde Neón Brillante como en Captura 1) */}
        <Link
          href="/anotador"
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:scale-105"
        >
          <Target className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">ANOTAR PARTIDA</span>
          <span className="sm:hidden">ANOTAR</span>
        </Link>
      </div>
    </header>
  );
};
