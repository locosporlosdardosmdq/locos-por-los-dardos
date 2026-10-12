'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MOCK_CURRENT_USER, getCountryFlag, isUserAdmin } from '@/lib/constants';
import { getCurrentPlayerProfile, clearCurrentPlayerSession } from '@/lib/storage';
import { PlayerProfile } from '@/lib/types';
import { LoginModal } from '@/components/perfil/LoginModal';
import { InvitePlayersModal } from '@/components/comunidad/InvitePlayersModal';
import { InstallAppButton } from './InstallAppButton';
import { 
  ShoppingBag, 
  Trophy, 
  Target, 
  BarChart3, 
  Users, 
  Settings, 
  UserCog,
  LogOut,
  X,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  MessageCircle
} from 'lucide-react';

interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  mobileOpen,
  onCloseMobile
}) => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<PlayerProfile>(() => {
    return getCurrentPlayerProfile(MOCK_CURRENT_USER);
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      } else {
        const fresh = getCurrentPlayerProfile(MOCK_CURRENT_USER);
        setCurrentUser(fresh);
      }
    };
    window.addEventListener('lpld_profile_updated', handleUpdate);
    return () => window.removeEventListener('lpld_profile_updated', handleUpdate);
  }, []);

  const handleLogout = () => {
    if (confirm(`¿Deseas cerrar la sesión de ${currentUser.nickname || currentUser.fullName}?`)) {
      clearCurrentPlayerSession();
      setIsLoginModalOpen(true);
    }
  };

  // Módulos oficiales en el orden exacto solicitado:
  // 1. La tienda online
  // 1. Torneos (Gestor propio de llaves, grupos y competición en vivo)
  // 2. Anotador
  // 3. Ranking
  // 4. Jugadores
  // 5. Configuración / Mi Perfil
  // Nota: Tienda Online desactivada temporalmente hasta definir productos comerciales
  const menuItems = [
    /* {
      title: 'La Tienda Online',
      href: '/tienda',
      icon: ShoppingBag,
      badge: 'MP',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      description: 'Equipamiento profesional y repuestos'
    }, */
    {
      title: 'Torneos',
      subTitle: 'Llaves y Grupos',
      href: '/torneos',
      icon: Trophy,
      badge: 'VIVO',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Gestor de cuadros, cruces y partidas en vivo'
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
    },
    {
      title: 'Asociación',
      subTitle: 'MDQ & Argentina',
      href: '/asociacion',
      icon: ShieldCheck,
      badge: 'SEDE',
      badgeColor: 'bg-emerald-500/20 text-[#00e676] border-emerald-500/30',
      description: 'Autoridades oficiales y datos de la asociación'
    },
    {
      title: 'Reglamento & Fair Play',
      subTitle: 'Código de Conducta',
      href: '/reglamento',
      icon: BookOpen,
      badge: 'OFICIAL',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Normativa federada, medidas y juego online'
    },
    ...(isUserAdmin(currentUser?.email) ? [{
      title: 'Superadmin',
      subTitle: 'Centro de Control',
      href: '/superadmin',
      icon: ShieldAlert,
      badge: 'ROOT',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      description: 'Infraestructura, vitrinas y comisión directiva'
    }] : [])
  ];

  // Render del contenido del sidebar según el estado expandido (isHovered en desktop o true en móvil)
  const renderSidebarContent = (isExpanded: boolean, isMobileView: boolean) => (
    <div className="flex flex-col h-full bg-[#0a0e17] select-none">
      {/* Encabezado: SOLO TEXTO (sin logos ni imágenes) */}
      <div className={`p-4 border-b border-[#1a2333] flex items-center justify-between transition-all ${
        !isExpanded ? 'justify-center p-3' : 'px-4'
      }`}>
        <Link 
          href="/" 
          onClick={onCloseMobile}
          className="flex items-center overflow-hidden group"
          title="Locos por los Dardos"
        >
          {!isExpanded ? (
            <div className="py-1 flex flex-col items-center justify-center select-none text-center">
              <span className="font-black text-sm text-white tracking-wider leading-none group-hover:text-[#00e676] transition-colors">
                LPD
              </span>
              <span className="font-bold text-[9px] text-[#ef4444] tracking-tight leading-none mt-1">
                MDQ
              </span>
            </div>
          ) : (
            <div className="flex flex-col select-none">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white uppercase leading-snug group-hover:text-[#00e676] transition-colors">
                  Locos por los <span className="text-[#00e676]">Dardos</span>
                </span>
                <span className="bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                  ARG
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mt-0.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                Circuito Federal
              </span>
            </div>
          )}
        </Link>

        {/* Únicamente botón cerrar en móvil */}
        {isMobileView && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0f1524] hover:bg-[#141c2e] border border-[#1e2a40]"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Botón Acción Rápida: ANOTAR PARTIDA */}
      <div className="p-3 border-b border-[#1a2333]">
        <Link
          href="/anotador"
          prefetch={true}
          onClick={onCloseMobile}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md ${
            !isExpanded 
              ? 'px-2 bg-[#00e676] text-[#07090e] hover:bg-[#00c853]' 
              : 'px-4 bg-[#00e676] text-[#07090e] hover:bg-[#00c853] hover:shadow-[0_0_15px_rgba(0,230,118,0.35)]'
          }`}
          title="Anotar Partida en Vivo"
        >
          <Target className="w-4 h-4 stroke-[2.5]" />
          {isExpanded && <span>Anotar Partida</span>}
        </Link>
      </div>

      {/* Navegación Principal con los Módulos */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {isExpanded && (
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
              } ${!isExpanded ? 'justify-center px-2' : ''}`}
              title={!isExpanded ? `${item.title} ${item.subTitle ? `(${item.subTitle})` : ''}` : undefined}
            >
              {/* Barra activa lateral */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00e676] rounded-r" />
              )}

              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-[#00e676]' : 'text-slate-400 group-hover:text-white'
              }`} />

              {isExpanded && (
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

      {/* Sede Oficial: Logo de Darderos Mar del Plata antes de la división del jugador */}
      <div className="p-3 border-t border-[#1a2333]/80 bg-[#080d16]">
        <div className={`flex items-center gap-2.5 ${!isExpanded ? 'justify-center' : ''}`}>
          <div className="relative w-8 h-8 rounded-xl bg-black/60 border border-[#ef4444]/40 p-1 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.25)]">
            <Image
              src="/logos/logo-mdq.png"
              alt="Darderos Mar del Plata"
              width={28}
              height={28}
              className="w-full h-full object-contain"
            />
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-white block truncate leading-tight">
                Darderos Mar del Plata
              </span>
              <span className="text-[10px] font-bold text-[#ef4444] block truncate">
                Sede Oficial del Circuito
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botón de Invitar por WhatsApp */}
      <div className="p-2 border-t border-[#1a2333]/60 bg-[#090e18]">
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            setIsInviteModalOpen(true);
          }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all border bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00e676] border-emerald-500/30 ${
            !isExpanded ? 'justify-center px-1.5' : ''
          }`}
          title="Invitar Jugadores por WhatsApp"
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0 text-[#00e676]" />
          {isExpanded && (
            <div className="flex-1 text-left flex items-center justify-between min-w-0">
              <span className="truncate">Invitar por WhatsApp</span>
              <span className="text-[9px] bg-emerald-500/20 text-[#00e676] px-1.5 py-0.2 rounded font-black border border-emerald-500/30 ml-1">
                LINK
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Botón de Instalación PWA en Celular */}
      <InstallAppButton variant="sidebar" isCollapsed={!isExpanded} />

      {/* División donde figura el jugador logueado con Acceso a Modificar Perfil y Cerrar Sesión */}
      <div className="p-3 border-t border-[#1a2333] bg-[#0c121e]">
        <div className={`flex items-center gap-2 ${!isExpanded ? 'flex-col gap-2' : 'justify-between'}`}>
          <Link
            href="/perfil"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
            title="Ir a mi perfil"
          >
            <div className="relative w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00e676] flex items-center justify-center font-black text-xs flex-shrink-0">
              <span>{currentUser.nickname?.slice(0, 2).toUpperCase() || 'PL'}</span>
              <span className="absolute -bottom-1 -right-1 text-xs select-none" title={currentUser.nationality || 'Argentina'}>
                {getCountryFlag(currentUser.countryCode || currentUser.nationality)}
              </span>
            </div>

            {isExpanded && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white block truncate leading-tight">
                    {currentUser.nickname || currentUser.fullName}
                  </span>
                  {currentUser.role === 'ADMIN' && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#ef4444] text-white uppercase tracking-wider">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-[#00e676] block truncate">
                  {currentUser.estimatedAvg.toFixed(1)} AVG • {currentUser.category}
                </span>
              </div>
            )}
          </Link>

          {/* Acciones de Cuenta: Modificar Perfil y Cerrar Sesión */}
          {isExpanded ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href="/perfil"
                onClick={onCloseMobile}
                title="Modificar Perfil"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2333] border border-transparent hover:border-slate-700 transition-colors"
              >
                <UserCog className="w-4 h-4 text-slate-300 hover:text-[#00e676]" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#ef4444] hover:bg-[#1a2333] border border-transparent hover:border-red-900/40 transition-colors"
              >
                <LogOut className="w-4 h-4 text-[#ef4444]" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 items-center pt-1 border-t border-[#1a2333]/50 w-full">
              <Link
                href="/perfil"
                onClick={onCloseMobile}
                title="Modificar Perfil"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2333] transition-colors"
              >
                <UserCog className="w-3.5 h-3.5 text-slate-300" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#ef4444] hover:bg-[#1a2333] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-[#ef4444]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop (lg+): Colapso y Expansión gobernado 100% por el Hover del Mouse */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out border-r border-[#1a2333] ${
          isHovered 
            ? 'w-64 shadow-[20px_0_40px_rgba(0,0,0,0.85)] border-r-[#1e2a40]' 
            : 'w-20'
        }`}
      >
        {renderSidebarContent(isHovered, false)}
      </aside>

      {/* Drawer móvil con Backdrop táctil */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop oscurecido */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Panel deslizante */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true, true)}
          </div>
        </div>
      )}

      {/* Modal interactivo de Inicio de Sesión y Selección de Cuenta */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Modal de Invitación por WhatsApp */}
      <InvitePlayersModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviterName={currentUser.nickname || currentUser.fullName}
      />
    </>
  );
};
