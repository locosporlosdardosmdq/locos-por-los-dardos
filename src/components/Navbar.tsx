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
      icon: Target,
      highlight: true
    },
    {
      href: '/torneos',
      label: 'Torneos',
      badge: 'N01',
      icon: Trophy
    },
    {
      href: '/ranking',
      label: 'Ranking',
      icon: BarChart3
    },
    {
      href: '/tienda',
      label: 'Tienda',
      badge: 'MP',
      icon: ShoppingBag
    },
    {
      href: '/perfil',
      label: 'Mi Perfil',
      icon: User
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo y Marca */}
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
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      link.badge === 'PRO' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Acciones del Navbar (Carrito + PWA + Perfil Rápido) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Botón Carrito si hay tienda */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/60"
                title="Carrito de compras Mercado Pago"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce-short">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Botón Instalar PWA */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all border border-emerald-400/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar App</span>
              </button>
            )}

            {/* Botón Jugar Rápido */}
            <Link
              href="/anotador"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              <Sparkles className="w-4 h-4" />
              <span>Anotar Partida</span>
            </Link>
          </div>

          {/* Botón Menú Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-lg bg-slate-800 text-slate-200"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile Desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c1222] border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
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
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-extrabold bg-slate-800 text-slate-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {!isInstalled && (
              <button
                onClick={() => {
                  handleInstallClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                Instalar Aplicación (PWA)
              </button>
            )}
            <Link
              href="/anotador"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md"
            >
              Lanzar Anotador en Vivo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
