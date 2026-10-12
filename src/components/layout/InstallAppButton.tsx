'use client';

import React from 'react';
import { useInstallPwa } from '@/app/providers';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';

interface InstallAppButtonProps {
  variant?: 'sidebar' | 'banner' | 'profile';
  isCollapsed?: boolean;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  variant = 'sidebar',
  isCollapsed = false
}) => {
  const { isInstalled, promptInstall } = useInstallPwa();

  if (isInstalled) {
    if (variant === 'sidebar' && !isCollapsed) {
      return (
        <div className="mx-2 mb-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-[11px] text-[#00e676]">
          <span className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            App Instalada
          </span>
          <span className="text-[10px] text-slate-400">Offline Ready</span>
        </div>
      );
    }
    return null;
  }

  if (variant === 'sidebar') {
    if (isCollapsed) {
      return (
        <button
          type="button"
          onClick={promptInstall}
          title="Instalar App en el Celular"
          className="mx-auto mb-2 p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-sky-500/20 border border-[#00e676]/40 text-[#00e676] hover:bg-[#00e676] hover:text-[#07090e] transition-all flex items-center justify-center shadow-md active:scale-95"
        >
          <Download className="w-4 h-4" />
        </button>
      );
    }

    return (
      <div className="mx-2 mb-2">
        <button
          type="button"
          onClick={promptInstall}
          className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-[#00e676]/20 via-[#141d2b] to-sky-500/20 hover:from-[#00e676]/30 hover:to-sky-500/30 border border-[#00e676]/50 text-white font-black text-xs flex items-center justify-between transition-all shadow-md group active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00e676]/20 text-[#00e676] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="block leading-tight text-white font-black text-[11px]">
                Instalar App en el Celular
              </span>
              <span className="block leading-tight text-[9px] text-[#00e676] font-bold">
                PWA • 100% Pantalla Completa
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-[#00e676] text-[#07090e] font-black px-1.5 py-0.5 rounded uppercase">
            Instalar
          </span>
        </button>
      </div>
    );
  }

  // Variante Banner para perfil o home
  return (
    <button
      type="button"
      onClick={promptInstall}
      className="px-4 py-2.5 rounded-2xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#00e676]/20 active:scale-95"
    >
      <Smartphone className="w-4 h-4 stroke-[2.5]" />
      <span>Instalar App en tu Celular</span>
    </button>
  );
};
