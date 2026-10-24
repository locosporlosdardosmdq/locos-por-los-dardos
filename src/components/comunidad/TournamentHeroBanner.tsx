'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  Flame,
  ExternalLink,
  Camera,
  ShieldCheck,
  Pause,
  Play
} from 'lucide-react';
import { getStoredLandingShowcases, DEFAULT_LANDING_SHOWCASES } from '@/lib/storage';
import { LandingShowcaseSettings } from '@/lib/types';
import { GrandTournamentEnrollModal } from './GrandTournamentEnrollModal';

const DEFAULT_GALLERY_IMAGES = [
  '/images/gallery-venue-pompeya.jpg',
  '/images/gallery-trophies.jpg',
  '/images/darderos.jpeg'
];

export const TournamentHeroBanner: React.FC = () => {
  const [heroSettings, setHeroSettings] = useState<LandingShowcaseSettings['heroTournament']>(() => {
    return getStoredLandingShowcases(DEFAULT_LANDING_SHOWCASES).heroTournament;
  });

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [activeCardTab, setActiveCardTab] = useState<'GALLERY' | 'ORGANIZA'>('GALLERY');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.heroTournament) {
        setHeroSettings(e.detail.heroTournament);
      }
    };
    window.addEventListener('lpld_showcases_updated', handleUpdate);
    return () => window.removeEventListener('lpld_showcases_updated', handleUpdate);
  }, []);

  const galleryList = (heroSettings.galleryImages && heroSettings.galleryImages.length > 0)
    ? heroSettings.galleryImages
    : DEFAULT_GALLERY_IMAGES;

  // Auto-rotación del slider cada 5 segundos si no está pausado
  useEffect(() => {
    if (activeCardTab !== 'GALLERY' || isPaused || galleryList.length <= 1) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % galleryList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeCardTab, isPaused, galleryList.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSliderIndex((prev) => (prev - 1 + galleryList.length) % galleryList.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSliderIndex((prev) => (prev + 1) % galleryList.length);
  };

  if (!heroSettings.enabled) return null;

  const isGoogleFormOnly = heroSettings.registrationMode === 'GOOGLE_FORM';
  const isHybrid = heroSettings.registrationMode === 'HYBRID';

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-[#1c1f2b] border-2 border-[#00b853]/60 shadow-[0_0_35px_rgba(0,184,83,0.2)] p-6 sm:p-8 lg:p-10">
        {/* Resplandores de la diana: verde y rojo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00b853]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#e52521]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Contenido Informativo y Promocional */}
          <div className="space-y-4 flex-1 max-w-3xl text-center lg:text-left">
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
            <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 pt-2">
              <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left flex-1 sm:flex-none sm:min-w-[110px]">
                <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                  <Calendar className="w-3 h-3 text-[#00b853]" /> Fecha
                </span>
                <strong className="text-xs sm:text-sm text-[#efe7d8] font-black block mt-0.5 whitespace-nowrap">
                  {heroSettings.date}
                </strong>
              </div>

              <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left w-full sm:w-auto sm:flex-[2.5] sm:min-w-[220px]">
                <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                  <MapPin className="w-3 h-3 text-[#e52521]" /> Sede
                </span>
                <strong className="text-xs sm:text-sm text-[#efe7d8] font-black block mt-0.5 break-words" title={heroSettings.venue}>
                  {heroSettings.venue}
                </strong>
              </div>

              <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left flex-1 sm:flex-none sm:min-w-[105px]">
                <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                  <DollarSign className="w-3 h-3 text-[#00b853]" /> Bolsa
                </span>
                <strong className="text-xs sm:text-sm text-[#00b853] font-black block mt-0.5 font-mono whitespace-nowrap">
                  {heroSettings.prizePool}
                </strong>
              </div>

              <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-3 text-center lg:text-left flex-1 sm:flex-none sm:min-w-[105px]">
                <span className="text-[10px] uppercase font-black text-[#b8ad98] block flex items-center justify-center lg:justify-start gap-1">
                  <Users className="w-3 h-3 text-[#1d68ed]" /> Inscriptos
                </span>
                <strong className="text-xs sm:text-sm text-[#efe7d8] font-black block mt-0.5 whitespace-nowrap">
                  {heroSettings.registeredCount} / {heroSettings.maxParticipants}
                </strong>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
              {isGoogleFormOnly ? (
                <a
                  href={heroSettings.googleFormUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-[#00b853] hover:bg-[#00c853] active:scale-95 text-[#0d0e12] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#00b853]/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-[#0d0e12]" />
                  <span>{heroSettings.ctaButtonText || 'Inscripción Rápida'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(true)}
                  className="px-6 py-3.5 bg-[#00b853] hover:bg-[#00c853] active:scale-95 text-[#0d0e12] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#00b853]/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-[#0d0e12]" />
                  <span>{heroSettings.ctaButtonText || 'Inscripción Rápida'}</span>
                </button>
              )}

              {(() => {
                const secondaryUrl = heroSettings.secondaryButtonUrl || '/torneos';
                const secondaryText = heroSettings.secondaryButtonText || 'Ver Cuadro y Reglamento';
                const isExternal = secondaryUrl.startsWith('http://') || secondaryUrl.startsWith('https://');

                return isExternal ? (
                  <a
                    href={secondaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-[#242836] hover:bg-[#2b3040] text-[#efe7d8] font-bold text-sm rounded-2xl border border-[#313647] transition-all flex items-center gap-1.5"
                  >
                    <span>{secondaryText}</span>
                    <ExternalLink className="w-4 h-4 text-[#00b853]" />
                  </a>
                ) : (
                  <Link
                    href={secondaryUrl}
                    className="px-6 py-3.5 bg-[#242836] hover:bg-[#2b3040] text-[#efe7d8] font-bold text-sm rounded-2xl border border-[#313647] transition-all flex items-center gap-1.5"
                  >
                    <span>{secondaryText}</span>
                    <ChevronRight className="w-4 h-4 text-[#00b853]" />
                  </Link>
                );
              })()}
            </div>

            {/* Enlace híbrido opcional a Google Forms si está activo */}
            {isHybrid && heroSettings.googleFormUrl && (
              <div className="pt-1 flex items-center justify-center lg:justify-start">
                <a
                  href={heroSettings.googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-[#00b853] underline flex items-center gap-1 transition-colors"
                >
                  <span>¿Prefieres registrarte externamente? Completar en Google Forms</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Bloque Visual Interactivo: Slider de Imágenes de Torneo / Sede + Emblema Oficial (+25% MDQ) */}
          <div 
            className="w-full lg:w-[380px] xl:w-[420px] bg-[#14161f] border border-[#313647] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Barra Superior con Selector de Pestañas y Contador */}
            <div className="bg-[#0b0e14]/90 backdrop-blur-md px-3.5 py-2.5 border-b border-[#313647] flex items-center justify-between z-20">
              <div className="flex items-center gap-1 bg-[#1a1f2e] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveCardTab('GALLERY')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                    activeCardTab === 'GALLERY'
                      ? 'bg-[#00b853] text-[#07090e] shadow-md shadow-[#00b853]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Galería Sede</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCardTab('ORGANIZA')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                    activeCardTab === 'ORGANIZA'
                      ? 'bg-[#00b853] text-[#07090e] shadow-md shadow-[#00b853]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Fiscaliza</span>
                </button>
              </div>

              {activeCardTab === 'GALLERY' && galleryList.length > 1 && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="text-white font-bold">{sliderIndex + 1}</span>
                  <span>/</span>
                  <span>{galleryList.length}</span>
                </div>
              )}
            </div>

            {/* Vista 1: Slider / Galería de Imágenes */}
            {activeCardTab === 'GALLERY' ? (
              <div className="relative w-full h-[270px] sm:h-[300px] overflow-hidden group bg-black">
                {/* Imagen del Slider Actual */}
                <Image
                  key={sliderIndex}
                  src={galleryList[sliderIndex] || DEFAULT_GALLERY_IMAGES[0]}
                  alt={`Galería Gran Torneo - Imagen ${sliderIndex + 1}`}
                  fill
                  className="object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                  priority
                />

                {/* Sombra y viñeta inferior para legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none"></div>

                {/* Controles de Navegación del Slider (< y >) */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#00b853] text-white hover:text-black flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
                      title="Imagen Anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#00b853] text-white hover:text-black flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
                      title="Siguiente Imagen"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Watermark y Sede en el pie del slider */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                  <div className="leading-tight">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#00b853] block drop-shadow">
                      Sociedad de Fomento Pompeya
                    </span>
                    <span className="text-xs font-bold text-white drop-shadow block">
                      Mar del Plata • Sede Oficial
                    </span>
                  </div>

                  {/* Micro-logos superpuestos (+25% MDQ) */}
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-xl border border-white/15">
                    <div className="relative w-7 h-7 filter drop-shadow-[0_0_8px_rgba(0,184,83,0.6)]">
                      <Image
                        src="/logos/logo-mdq.png"
                        alt="MDQ"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-red-500 font-bold text-[10px]">✕</span>
                    <div className="relative w-5 h-5">
                      <Image
                        src="/logos/dardos-argentina.png"
                        alt="ARG"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Puntos de navegación al pie */}
                {galleryList.length > 1 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {galleryList.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSliderIndex(idx)}
                        className={`transition-all rounded-full ${
                          sliderIndex === idx
                            ? 'w-4 h-1.5 bg-[#00b853]'
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Vista 2: Emblema Oficial Organiza & Fiscaliza (+25% Preponderancia MDQ) */
              <div className="flex flex-col items-center justify-center p-6 text-center h-[270px] sm:h-[300px] relative">
                <div className="text-[11px] font-black uppercase text-[#00b853] tracking-wider mb-2">
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
                  <span className="text-[#b8ad98] text-[11px]">Sociedad de Fomento Nueva Pompeya • Mar del Plata</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL IN-APP: INSCRIPCIÓN Y REGISTRO COMPLETO (PDC + LOGÍSTICA FOMENTO) */}
      <GrandTournamentEnrollModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        heroSettings={heroSettings}
      />
    </>
  );
};
