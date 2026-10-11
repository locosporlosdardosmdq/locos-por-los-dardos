'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TournamentHeroBanner } from '@/components/comunidad/TournamentHeroBanner';
import { NationalRankings } from '@/components/comunidad/NationalRankings';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  Target, 
  Trophy, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-16">
      {/* 1. HEAD / BANNER PROMOCIONAL DESTACADO (HERO TORNEOS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <TournamentHeroBanner />
      </section>

      {/* 2. SECCIÓN INFORMATIVA & COMUNIDAD DE DARDOS ARGENTINA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-ping"></span>
                <span className="text-xs font-black uppercase text-[#00e676] tracking-wider">
                  Comunidad Nacional de Dardos
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                La plataforma que une a todos los <span className="text-[#00e676]">darderos del país</span>.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Nacida de la pasión de los jugadores de <strong className="text-[#00e676]">Darderos Mar del Plata</strong> y expandida a cada rincón de Argentina. Aquí puedes registrar tus partidas tiro a tiro, medir tu promedio histórico, competir en torneos presenciales y online con cuadros interactivos, y equiparte con material profesional importado.
              </p>

              {/* Pilares clave con estilo deportivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-[#07090e] p-3 rounded-2xl border border-[#1e2638]">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Anotador PWA:</strong> funciona offline en cualquier pub o club.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-[#07090e] p-3 rounded-2xl border border-[#1e2638]">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Categorización por AVG:</strong> Principiante a Elite.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-[#07090e] p-3 rounded-2xl border border-[#1e2638]">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Torneos Oficiales:</strong> llaves y cruces en vivo.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-[#07090e] p-3 rounded-2xl border border-[#1e2638]">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Mercado Pago:</strong> cuotas en pesos y envíos al país.</span>
                </div>
              </div>
            </div>

            {/* Showcase Visual de la Comunidad */}
            <div className="lg:col-span-5 bg-[#07090e] border border-[#1e2638] rounded-3xl p-6 text-center shadow-xl space-y-4">
              <div className="flex justify-center pb-2">
                <BrandLogo size="lg" />
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Más de <strong className="text-white">1.200 jugadores</strong> activos compitiendo en ligas provinciales y torneos abiertos.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e2638] text-center">
                <div className="bg-[#0f1422] p-3 rounded-2xl border border-[#1e2638]">
                  <span className="font-black text-[#00e676] text-lg font-mono">24</span>
                  <span className="text-[10px] text-slate-400 block font-bold">Provincias</span>
                </div>
                <div className="bg-[#0f1422] p-3 rounded-2xl border border-[#1e2638]">
                  <span className="font-black text-[#ef4444] text-lg font-mono">35+</span>
                  <span className="text-[10px] text-slate-400 block font-bold">Torneos / Año</span>
                </div>
                <div className="bg-[#0f1422] p-3 rounded-2xl border border-[#1e2638]">
                  <span className="font-black text-[#0284c7] text-lg font-mono">180s</span>
                  <span className="text-[10px] text-slate-400 block font-bold">Registro Vivo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACCESOS DIRECTOS A LOS 4 MÓDULOS DE LA PLATAFORMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Módulos Oficiales
          </h2>
          <p className="text-xs sm:text-sm text-[#b8ad98] mt-1">
            Diseñados para entrenamiento personal, competencia federada y equipamiento oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Anotador */}
          <Link
            href="/anotador"
            className="group bg-[#0f1422] hover:bg-[#151d30] border border-[#1e2638] hover:border-[#00e676]/60 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-[#00e676] group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#00e676] transition-colors">
                Anotador en Vivo
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estilo My Dart Training con teclado táctil rápido, modo X01, Cricket, bot inteligente, referee de voz ("180", "Game shot") y entrenamientos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex items-center justify-between text-xs font-black text-[#00e676]">
              <span>Lanzar Marcador</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Torneos Oficiales */}
          <Link
            href="/torneos"
            className="group bg-[#0f1422] hover:bg-[#151d30] border border-[#1e2638] hover:border-sky-500/60 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#38bdf8] transition-colors">
                Torneos en Vivo
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gestión de llaves eliminatorias directas, doble eliminación y fase de grupos presenciales y online con actualización ronda a ronda.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex items-center justify-between text-xs font-black text-[#38bdf8]">
              <span>Ver Cuadros y Llaves</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Ranking & Categorías */}
          <Link
            href="/ranking"
            className="group bg-[#0f1422] hover:bg-[#151d30] border border-[#1e2638] hover:border-[#00e676]/60 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-[#00e676] group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#00e676] transition-colors">
                Ranking Nacional
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tabla oficial de posiciones por AVG en 501 dividida por categorías: Principiante, Intermedia, Avanzada y Elite en Argentina.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex items-center justify-between text-xs font-black text-[#00e676]">
              <span>Consultar Leaderboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Directorio Federal de Jugadores */}
          <Link
            href="/jugadores"
            className="group bg-[#0f1422] hover:bg-[#151d30] border border-[#1e2638] hover:border-cyan-500/60 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                Directorio Federal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cartas oficiales coleccionables de jugadores, estadísticas históricas, categorías por promedio y retadores federales.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2638] flex items-center justify-between text-xs font-black text-cyan-400">
              <span>Explorar Jugadores</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. RANKING Y ESTADÍSTICAS PÚBLICAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-black uppercase text-[#00b853] tracking-wider">
              Circuito Oficial 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ranking Nacional de Jugadores
            </h2>
          </div>
          <Link
            href="/ranking"
            className="text-xs font-black text-[#00b853] hover:text-[#009e47] flex items-center gap-1"
          >
            <span>Ver ranking completo con filtros</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <NationalRankings />
      </section>

      {/* 5. SEDES Y CLUBES DESTACADOS (CON PREPONDERANCIA DARDEROS MAR DEL PLATA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Sedes y Clubes Afiliados
            </h3>
            <p className="text-xs text-[#b8ad98] mt-1">
              Lugares donde puedes acercarte a tirar unos dardos, entrenar y participar de fechas puntuables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sede Mar del Plata (Preponderante con relieve Verde Diana) */}
            <div className="p-5 rounded-2xl bg-[#14161f] border-2 border-[#00b853] shadow-lg relative">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#00b853] text-[#0d0e12] absolute top-4 right-4">
                Sede Central
              </span>
              <div className="relative w-12 h-12 mb-3">
                <Image src="/logos/logo-mdq.png" alt="Darderos MDQ" fill className="object-contain" />
              </div>
              <h4 className="font-black text-white text-base">Club Darderos Mar del Plata</h4>
              <p className="text-xs text-[#b8ad98] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00b853]" />
                Mar del Plata, Pcia. Buenos Aires
              </p>
              <p className="text-xs text-[#efe7d8] mt-2">
                6 dianas profesionales Samurai y Winmau Blade 6 con iluminación led circular y marcadores digitales para torneos oficiales.
              </p>
            </div>

            {/* Sede CABA */}
            <div className="p-5 rounded-2xl bg-[#14161f] border border-[#313647]">
              <div className="relative w-10 h-10 mb-3">
                <Image src="/logos/dardos-argentina.png" alt="Dardos CABA" fill className="object-contain" />
              </div>
              <h4 className="font-black text-white text-base">Espacio Dardos Buenos Aires</h4>
              <p className="text-xs text-[#b8ad98] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#e52521]" />
                Palermo, CABA
              </p>
              <p className="text-xs text-[#efe7d8] mt-2">
                Liga Metropolitana 501 Doble Out los jueves por la noche y clínicas de lanzamiento para principiantes.
              </p>
            </div>

            {/* Sede Interior */}
            <div className="p-5 rounded-2xl bg-[#14161f] border border-[#313647]">
              <div className="relative w-10 h-10 mb-3">
                <Image src="/logos/dardos-argentina.png" alt="Dardos Interior" fill className="object-contain" />
              </div>
              <h4 className="font-black text-white text-base">Circuito Federal del Interior</h4>
              <p className="text-xs text-[#b8ad98] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1d68ed]" />
                Rosario • Córdoba • Mendoza
              </p>
              <p className="text-xs text-[#efe7d8] mt-2">
                Encuentros mensuales y fechas clasificatorias para el Gran Open de Mar del Plata con puntaje nacional.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
