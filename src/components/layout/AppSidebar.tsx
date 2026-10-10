'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../BrandLogo';
import { 
  ShoppingBag, 
  Trophy, 
  Target, 
  BarChart3, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle,
  X,
  Sparkles,
  Shield
} from 'lucide-react';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const pathname = usePathname();

  // Módulos requeridos por el usuario en el orden exacto solicitado:
  // 1. La tienda online
  // 2. Torneos (comportamiento Nakka n01)
  // 3. Anotador
  // 4. Ranking
  // 5. Jugadores
  // 6. Configuración / Mi Perfil
  const menuItems = [
    {
      title: 'La Tienda Online',
      href: '/tienda',
      icon: ShoppingBag,
      badge: 'MP',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      description: 'Equipamiento profesional y repuestos'
    },
    {
      title: 'Torneos',
      subTitle: 'Nakka n01',
      href: '/torneos',
      icon: Trophy,
      badge: 'N01',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Gestor y llaves en vivo estilo Nakka'
    },
    {
      title: 'Anotador',
      subTitle: 'My Dart Training',
      href: '/anotador',
      icon: Target,
      badge: 'PRO',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Marcador táctil con árbitro de voz'
    },
    {
      title: 'Ranking',
      href: '/ranking',
      icon: BarChart3,
      badge: 'TOP',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      description: 'Tabla de posiciones nacional federada'
    },
    {
      title: 'Jugadores',
      href: '/jugadores',
      icon: Users,
      badge: 'ARG',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      description: 'Directorio federal y fichas deportivas'
    },
    {
      title: 'Configuración / Mi Perfil',
      href: '/perfil',
      icon: Settings,
      badge: 'AVG',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      description: 'Datos personales y cálculo de categoría'
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0e17] border-r border-[#1a2333] select-none">
      {/* Encabezado con Identidad Oficial */}
      <div className={`p-4 border-b border-[#1a2333] flex items-center justify-between transition-all ${
        collapsed ? 'justify-center p-3' : 'px-4'
      }`}>
        <Link 
          href="/" 
          onClick={onCloseMobile}
          className="flex items-center gap-2 overflow-hidden"
        >
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-[#0f1524] border border-[#1e2a40] flex items-center justify-center p-1 hover:border-[#00e676] transition-colors" title="Locos por los Dardos • Argentina & Darderos MDQ">
              <BrandLogo size="sm" showText={false} />
            </div>
          ) : (
            <BrandLogo size="sm" showText={true} />
          )}
        </Link>

        {/* Botón Cerrar en móvil */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141c2e]"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Botón Acción Rápida: ANOTAR PARTIDA */}
      <div className="p-3 border-b border-[#1a2333]">
        <Link
          href="/anotador"
          prefetch={true}
          onClick={onCloseMobile}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md ${
            collapsed 
              ? 'px-2 bg-[#00e676] text-[#07090e] hover:bg-[#00c853]' 
              : 'px-4 bg-[#00e676] text-[#07090e] hover:bg-[#00c853] hover:shadow-[0_0_15px_rgba(0,230,118,0.35)]'
          }`}
          title="Anotar Partida en Vivo"
        >
          <Target className="w-4 h-4 stroke-[2.5]" />
          {!collapsed && <span>Anotar Partida</span>}
        </Link>
      </div>

      {/* Navegación Principal con los Módulos */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Módulos de la Plataforma
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative ${
                isActive
                  ? 'bg-[#0f172a] text-white border border-[#00e676]/50 shadow-[0_0_12px_rgba(0,230,118,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#111728]'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? `${item.title} ${item.subTitle ? `(${item.subTitle})` : ''}` : undefined}
            >
              {/* Barra activa lateral */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00e676] rounded-r" />
              )}

              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-[#00e676]' : 'text-slate-400 group-hover:text-white'
              }`} />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="truncate">
                    <span className="block truncate text-slate-100 group-hover:text-white">
                      {item.title}
                    </span>
                    {item.subTitle && (
                      <span className="text-[10px] font-normal text-slate-500 block truncate">
                        {item.subTitle}
                      </span>
                    )}
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ml-2 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Perfil Rápido en Footer del Sidebar */}
      <div className="p-3 border-t border-[#1a2333] bg-[#0c121e]/80">
        <Link
          href="/perfil"
          onClick={onCloseMobile}
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#141c2e] transition-colors ${
            collapsed ? 'justify-center p-1' : ''
          }`}
          title="Ver mi perfil de jugador"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00e676] flex items-center justify-center font-black text-xs flex-shrink-0">
            FL
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-white block truncate leading-tight">
                Facundo López
              </span>
              <span className="text-[10px] font-semibold text-[#00e676] block truncate">
                62.4 AVG • Avanzada
              </span>
            </div>
          )}
        </Link>

        {/* Botón Colapsar / Expandir (Desktop) */}
        <div className="hidden lg:flex items-center justify-between mt-2 pt-2 border-t border-[#1a2333]/60 text-slate-400">
          {!collapsed && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Menú Lateral
            </span>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141c2e] transition-colors ${
              collapsed ? 'w-full flex justify-center' : ''
            }`}
            title={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            aria-label="Colapsar menú lateral"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fijo para Desktop (lg+) */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Drawer móvil con Backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop oscurecido */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Panel deslizante */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
