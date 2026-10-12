'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Sparkles, 
  ChevronRight,
  Flame,
  ExternalLink
} from 'lucide-react';
import { getStoredLandingShowcases, DEFAULT_LANDING_SHOWCASES } from '@/lib/storage';
import { LandingShowcaseSettings } from '@/lib/types';

export const TournamentHeroBanner: React.FC = () => {
  const [heroSettings, setHeroSettings] = useState<LandingShowcaseSettings['heroTournament']>(() => {
    return getStoredLandingShowcases(DEFAULT_LANDING_SHOWCASES).heroTournament;
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.heroTournament) {
        setHeroSettings(e.detail.heroTournament);
      }
    };
    window.addEventListener('lpld_showcases_updated', handleUpdate);
    return () => window.removeEventListener('lpld_showcases_updated', handleUpdate);
  }, []);

  if (!heroSettings.enabled) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#1c1f2b] border-2 border-[#00b853]/60 shadow-[0_0_35px_rgba(0,184,83,0.2)] p-6 sm:p-8 lg:p-10">
      {/* Resplandores de la diana: verde y rojo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00b853]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#e52521]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Contenido Informativo y Promocional */}
        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          {/* Tag de Evento Oficial en Rojo y Verde Diana */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="bg-[#e52521] text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-500/30">
              <Flame className="w-3.5 h-3.5 fill-white" />
              {heroSettings.tagBadge || 'Próximo Gran Torneo Oficial'}
            </span>
            <span className="bg-[#242836] text-[#00b853] border border-[#00b853]/40 text-xs font-black px-3 py-1 rounded-full">
              {heroSettings.subBadge || 'Inscripciones Abiertas • Cupos Limitados'}
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {heroSettings.title} <span className="text-[#00b853]">{heroSettings.highlightCity}</span> {heroSettings.year}
          </h1>
          <p className="text-sm sm:text-base text-[#efe7d8] leading-relaxed">
            {heroSettings.description}
          </p>

          {/* Metadata Rápida: Fecha, Lugar, Premio en Marfil Sisal y Verde Diana */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                <Calendar className="w-3 h-3 text-[#00b853]" /> Fecha
              </span>
              <strong className="text-xs sm:text-sm text-[#efe7d8] font-black block mt-0.5">
                {heroSettings.date}
              </strong>
            </div>

            <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                <MapPin className="w-3 h-3 text-[#e52521]" /> Sede
              </span>
              <strong className="text-xs sm:text-sm text-[#efe7d8] font-black block mt-0.5 truncate" title={heroSettings.venue}>
                {heroSettings.venue}
              </strong>
            </div>

            <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                <DollarSign className="w-3 h-3 text-[#00b853]" /> Bolsa
              </span>
              <strong className="text-xs sm:text-sm text-[#00b853] font-black block mt-0.5 font-mono">
                {heroSettings.prizePool}
              </strong>
            </div>

            <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                <Users className="w-3 h-3 text-[#1d68ed]" /> Inscriptos
              </span>
              <strong className="text-xs sm:text-sm text-[#efe7d8] font-black block mt-0.5">
                {heroSettings.registeredCount} / {heroSettings.maxParticipants}
              </strong>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
            {heroSettings.googleFormUrl ? (
              <a
                href={heroSettings.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#00b853] hover:bg-[#00c853] active:scale-95 text-[#0d0e12] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#00b853]/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-[#0d0e12]" />
                <span>{heroSettings.ctaButtonText || 'Inscripción Rápida'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link
                href="/torneos"
                className="px-6 py-3.5 bg-[#00b853] hover:bg-[#00c853] active:scale-95 text-[#0d0e12] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#00b853]/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-[#0d0e12]" />
                <span>{heroSettings.ctaButtonText || 'Inscripción Rápida'}</span>
              </Link>
            )}

            <Link
              href="/torneos"
              className="px-6 py-3.5 bg-[#242836] hover:bg-[#2b3040] text-[#efe7d8] font-bold text-sm rounded-2xl border border-[#313647] transition-all flex items-center gap-1.5"
            >
              <span>Ver Cuadro y Reglamento</span>
              <ChevronRight className="w-4 h-4 text-[#00b853]" />
            </Link>
          </div>
        </div>

        {/* Bloque Visual de Identidad de Marca: +25% Preponderancia para Darderos MDQ */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#14161f] border border-[#313647] rounded-3xl backdrop-blur-md shadow-2xl relative w-full lg:w-auto text-center min-w-[280px]">
          <div className="text-[11px] font-black uppercase text-[#00b853] tracking-wider mb-3">
            Organiza & Fiscaliza
          </div>

          {/* Comparativa Visual: Darderos MDQ 125px vs Dardos Arg 100px (+25%) */}
          <div className="flex items-center justify-center gap-4 py-2">
            {/* Darderos MDQ (+25% de tamaño con halo Verde Diana) */}
            <div
              className="relative w-28 h-28 filter drop-shadow-[0_0_20px_rgba(0,184,83,0.5)] transform hover:scale-105 transition-transform"
              title="Darderos Mar del Plata (+25% Preponderancia Oficial)"
            >
              <Image
                src="/logos/logo-mdq.png"
                alt="Darderos Mar del Plata"
                fill
                className="object-contain"
                priority
              />
            </div>

            <span className="text-[#e52521] font-black text-sm">✕</span>

            {/* Locos por los Dardos Argentina */}
            <div
              className="relative w-20 h-20 opacity-90 transform hover:scale-105 transition-transform"
              title="Locos por los Dardos Argentina"
            >
              <Image
                src="/logos/dardos-argentina.png"
                alt="Locos por los Dardos"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#313647] text-xs">
            <span className="font-bold text-[#efe7d8] block">Sede Anfitriona Oficial</span>
            <span className="text-[#b8ad98] text-[11px]">Mar del Plata • Buenos Aires</span>
          </div>
        </div>
      </div>
    </div>
  );
};
