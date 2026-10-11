'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { 
  Target, 
  Trophy, 
  ShoppingBag, 
  User, 
  BarChart3, 
  Menu, 
  X, 
  Download, 
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount = 0, onOpenCart }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navLinks = [
    {
      href: '/anotador',
      label: 'Anotador',
      badge: 'PRO',
      badgeColor: 'bg-[#e52521]/20 text-[#e52521] border-[#e52521]/40', // Rojo diana
      icon: Target,
      highlight: true
    },
    {
      href: '/torneos',
      label: 'Torneos',
      badge: 'VIVO',
      badgeColor: 'bg-[#1d68ed]/20 text-[#38bdf8] border-[#1d68ed]/40', // Azul Samurai
      icon: Trophy
    },
    {
      href: '/ranking',
      label: 'Ranking',
      icon: BarChart3
    },
    {
      href: '/jugadores',
      label: 'Jugadores',
      badge: 'ARG',
      badgeColor: 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]/40', // Verde diana
      icon: User
    },
    {
      href: '/perfil',
      label: 'Mi Perfil',
      icon: User
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#14161f]/95 backdrop-blur-md border-b border-[#313647] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo y Marca Oficial (+25% Preponderancia Darderos MDQ) */}
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <BrandLogo size="md" />
          </Link>

          {/* Enlaces de Navegación Escritorio */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00b853]/15 text-[#00b853] border border-[#00b853]/40 shadow-[0_0_15px_rgba(0,184,83,0.25)]'
                      : 'text-[#efe7d8] hover:text-white hover:bg-[#1c1f2b]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00b853]' : 'text-[#b8ad98]'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black uppercase border ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Acciones del Navbar (Carrito + PWA + Botón Anotar Partida) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Botón Carrito si hay tienda */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-[#1c1f2b] hover:bg-[#242836] text-[#efe7d8] hover:text-white transition-all border border-[#313647]"
                title="Carrito de compras Mercado Pago"
              >
                <ShoppingBag className="w-5 h-5 text-[#00b853]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e52521] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce-short">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Botón Instalar PWA */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1d68ed] to-[#00b853] hover:brightness-110 text-white text-xs font-black shadow-md shadow-blue-900/30 transition-all border border-blue-400/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar App</span>
              </button>
            )}

            {/* Botón Jugar Rápido en Verde Diana */}
            <Link
              href="/anotador"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00b853] hover:bg-[#009b46] active:scale-95 text-[#0d0e12] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00b853]/25 hover:shadow-[#00b853]/40"
            >
              <Sparkles className="w-4 h-4 fill-[#0d0e12]" />
              <span>Anotar Partida</span>
            </Link>
          </div>

          {/* Botón Menú Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-lg bg-[#1c1f2b] text-[#efe7d8]"
              >
                <ShoppingBag className="w-5 h-5 text-[#00b853]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e52521] text-white text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#1c1f2b] text-[#efe7d8] hover:text-white border border-[#313647]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161822] border-b border-[#313647] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-[#00b853]/20 text-[#00b853] border border-[#00b853]/40'
                    : 'text-[#efe7d8] hover:bg-[#1c1f2b]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#00b853]" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${link.badgeColor}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#313647] flex flex-col gap-2">
            {!isInstalled && (
              <button
                onClick={() => {
                  handleInstallClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1c1f2b] text-[#00b853] border border-[#00b853]/30 text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                Instalar Aplicación (PWA)
              </button>
            )}
            <Link
              href="/anotador"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-[#00b853] text-[#0d0e12] font-black text-xs uppercase tracking-wider shadow-md"
            >
              Lanzar Anotador en Vivo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
