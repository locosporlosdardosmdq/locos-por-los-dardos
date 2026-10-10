'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tournament } from '@/lib/types';
import { MOCK_TOURNAMENTS } from '@/lib/constants';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';

export const TournamentHeroBanner: React.FC = () => {
  const featuredTournament: Tournament = MOCK_TOURNAMENTS[0]; // Open Mar del Plata 2026
  const [registered, setRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1629] via-[#0f1d36] to-[#0a1220] border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] p-6 sm:p-8 lg:p-10">
      {/* Luces y efectos deportivos de fondo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Contenido Informativo y Promocional */}
        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          {/* Tag de Evento Oficial */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              Próximo Gran Torneo Oficial
            </span>
            <span className="bg-slate-800/90 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
              Inscripciones Abiertas • Cupos Limitados
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Gran Open <span className="text-emerald-400">Mar del Plata</span> 2026
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            La cita cumbre de los dardos en la Costa Atlántica y Argentina. Dos jornadas de máxima adrenalina: fase de grupos, llaves directas 501 Doble Out, marcadores digitales táctiles y transmisión oficial.
          </p>

          {/* Metadata Rápida: Fecha, Lugar, Premio */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center lg:justify-start gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" /> Fecha
              </span>
              <strong className="text-xs sm:text-sm text-white font-black block mt-0.5">
                14 y 15 Nov
              </strong>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center lg:justify-start gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Sede
              </span>
              <strong className="text-xs sm:text-sm text-white font-black block mt-0.5 truncate" title="Mar del Plata">
                MDQ Central
              </strong>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center lg:justify-start gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Bolsa
              </span>
              <strong className="text-xs sm:text-sm text-emerald-400 font-black block mt-0.5">
                $450.000 ARS
              </strong>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center lg:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center lg:justify-start gap-1">
                <Users className="w-3 h-3 text-emerald-400" /> Inscriptos
              </span>
              <strong className="text-xs sm:text-sm text-white font-black block mt-0.5">
                {featuredTournament.registeredCount} / {featuredTournament.maxParticipants}
              </strong>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{registered ? 'Inscripto ✓' : 'Inscripción Rápida'}</span>
            </button>

            <Link
              href="/torneos"
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>Ver Cuadro y Reglamento</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>

        {/* Bloque Visual de Identidad de Marca: Preponderancia +25% Darderos MDQ */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 border border-emerald-500/30 rounded-3xl backdrop-blur-md shadow-2xl relative w-full lg:w-auto text-center min-w-[280px]">
          <div className="text-[11px] font-black uppercase text-emerald-400 tracking-wider mb-3">
            Organiza & Fiscaliza
          </div>

          {/* Comparativa Visual de Preponderancia: Darderos MDQ 125px vs Dardos Arg 100px (+25%) */}
          <div className="flex items-center justify-center gap-4 py-2">
            {/* Darderos MDQ (+25% de tamaño) */}
            <div
              className="relative w-28 h-28 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] transform hover:scale-105 transition-transform"
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

            <span className="text-slate-600 font-black text-sm">✕</span>

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

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="font-bold text-white block">Sede Anfitriona Oficial</span>
            <span className="text-slate-400 text-[11px]">Mar del Plata • Buenos Aires</span>
          </div>
        </div>
      </div>

      {/* Modal de Inscripción Rápida */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101729] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
              <Trophy className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">
              Inscripción al Torneo
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {featuredTournament.title}
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Modalidad:</span>
                <strong className="text-white">Presencial (501 Doble Out)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Arancel de Inscripción:</span>
                <strong className="text-emerald-400 font-mono text-sm">
                  ${featuredTournament.entryFeeArs.toLocaleString('es-AR')} ARS
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Medio de Pago:</span>
                <strong className="text-cyan-400">Mercado Pago / Efectivo en Sede</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRegistered(true);
                  setShowModal(false);
                  alert('¡Inscripción confirmada! Te esperamos en Mar del Plata el 14 de Noviembre.');
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Confirmar Inscripción
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
