import React from 'react';
import Link from 'next/link';
import { 
  Target, 
  ShieldCheck, 
  Scale, 
  Trophy, 
  Video, 
  WifiOff, 
  Volume2, 
  Award, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ArrowLeft,
  Tv,
  Compass,
  Eye
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export const metadata = {
  title: 'Reglamento Oficial, Código de Conducta & Fair Play • Locos por los Dardos',
  description: 'Manual Oficial de Competición de Locos por los Dardos Argentina y Darderos Mar del Plata. Medidas reglamentarias, sistema federado de puntuación, etiqueta deportiva y protocolo online.'
};

export default function ReglamentoPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20">
      {/* Cabecera Hero */}
      <div className="relative bg-gradient-to-b from-[#111624] via-[#090d15] to-[#07090e] border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 pt-10 pb-12 overflow-hidden">
        {/* Glows de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00e676]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#ef4444]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white transition-colors bg-[#07090e] border border-slate-800 px-3 py-1.5 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la Plataforma</span>
            </Link>

            <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Documento Federado Vigente 2026</span>
            </span>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Manual Federado • Circuito Nacional Argentino</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Reglamento Oficial, Código de Conducta & Fair Play
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
              Normativa general, medidas físicas reglamentarias de la diana, sistema de cómputo de puntos por modalidad (Individuales, Torneos de un Día, Ligas Locales y Liga Nacional), código de etiqueta deportiva y protocolo técnico para partidas conectadas online.
            </p>
          </div>

          {/* Índice Rápido de Capítulos */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4">
            <a
              href="#capitulo-1"
              className="p-3 rounded-xl bg-[#0f1422] border border-slate-800 hover:border-[#00e676] transition-all text-center group"
            >
              <Target className="w-4 h-4 text-[#00e676] mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-200 block">Capítulo I</span>
              <span className="text-[10px] text-slate-400 block truncate">Medidas & Diana</span>
            </a>

            <a
              href="#capitulo-2"
              className="p-3 rounded-xl bg-[#0f1422] border border-slate-800 hover:border-amber-400 transition-all text-center group"
            >
              <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-200 block">Capítulo II</span>
              <span className="text-[10px] text-slate-400 block truncate">Puntos & Ligas (x2)</span>
            </a>

            <a
              href="#capitulo-3"
              className="p-3 rounded-xl bg-[#0f1422] border border-slate-800 hover:border-sky-400 transition-all text-center group"
            >
              <Scale className="w-4 h-4 text-sky-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-200 block">Capítulo III</span>
              <span className="text-[10px] text-slate-400 block truncate">Código de Etiqueta</span>
            </a>

            <a
              href="#capitulo-4"
              className="p-3 rounded-xl bg-[#0f1422] border border-slate-800 hover:border-rose-400 transition-all text-center group"
            >
              <Video className="w-4 h-4 text-[#ef4444] mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-200 block">Capítulo IV</span>
              <span className="text-[10px] text-slate-400 block truncate">Cámara & Online</span>
            </a>

            <a
              href="#capitulo-5"
              className="p-3 rounded-xl bg-[#0f1422] border border-slate-800 hover:border-purple-400 transition-all text-center group"
            >
              <WifiOff className="w-4 h-4 text-purple-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-200 block">Capítulo V</span>
              <span className="text-[10px] text-slate-400 block truncate">W.O. & Desconexión</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* ======================================================== */}
        {/* CAPÍTULO I: MEDIDAS Y ESPECIFICACIONES TÉCNICAS          */}
        {/* ======================================================== */}
        <section id="capitulo-1" className="scroll-mt-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00e676]/15 border border-[#00e676]/30 flex items-center justify-center text-[#00e676] flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#00e676]">Capítulo I</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Especificaciones Técnicas y Medidas Reglamentarias
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <span>🎯 Medidas Oficiales de Montaje</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Altura del Bullseye:</strong> 1.73 m (5 pies 8 pulgadas) desde el suelo nivelado hasta el centro geométrico del Bullseye rojo (50 puntos).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Distancia de Tiro (Diana):</strong> 2.37 m (7 pies 9¼ pulgadas) medida horizontalmente desde la cara frontal de la diana hasta el borde posterior de la línea de tiro.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Distancia Diagonal:</strong> 2.93 m (9 pies 7½ pulgadas) medida en línea recta desde el Bullseye hasta la línea de tiro sobre el suelo.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Diana Reglamentaria:</strong> Fabricada en sisal prensado de cerdas naturales con alambre fino empotrado (*blade wire*) sin grapas para minimizar rebotes.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-sky-300 flex items-center gap-2">
                <span>🏹 Modalidades Oficiales de Juego</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-black text-white text-xs">1. 501 Doble Out (X01 Estándar PDC)</h4>
                  <p className="mt-0.5 text-slate-400">
                    Los jugadores inician con 501 puntos y descuentan con cada visita de 3 dardos. Es <strong className="text-[#00e676]">obligatorio cerrar en un sector Doble (D)</strong> o en la Diana Central (Bullseye de 50 puntos). Si un tiro reduce el puntaje restante a 1 o a menos de 0, se declara <strong className="text-[#ef4444]">Bust</strong> (tiro nulo; se descarta la visita y se restituye el puntaje anterior).
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-white text-xs">2. Cricket Oficial</h4>
                  <p className="mt-0.5 text-slate-400">
                    Se juegan los sectores 15, 16, 17, 18, 19, 20 y Bullseye. Cada sector requiere 3 marcas para ser abierto. Si un jugador abre un sector antes que su rival, suma puntos por cada impacto posterior. Gana el jugador que cierra todos los sectores con puntaje igual o superior.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DIAGRAMA VISUAL OFICIAL DE MEDIDAS DE PISTA (DARDOS ARGENTINA PRO MEASUREMENT GUIDE) */}
          <div className="bg-[#0f1422] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#00e676] tracking-wider px-2.5 py-0.5 rounded-full bg-[#00e676]/10 border border-[#00e676]/20">
                  Infografía Oficial Homologada
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 flex items-center gap-2">
                  <span>📐 Pista Oficial de Lanzamiento • Pro Measurement Guide</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esquema reglamentario de la WDF, PDC y Federación Argentina para montaje de canchas en clubes y sedes oficiales.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Norma Homologada 2026</span>
                </span>
              </div>
            </div>

            {/* Contenedor de la Imagen con overlay explicativo */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-black group shadow-2xl">
              <img
                src="/images/medidas-cancha.jpg"
                alt="Medidas Reglamentarias de Pista y Montaje de Diana - Locos por los Dardos Argentina"
                className="w-full h-auto max-h-[680px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
              />

              <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-bold text-white">
                  <div className="flex items-center gap-2 bg-[#07090e] px-3 py-1.5 rounded-xl border border-yellow-400/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    <span><strong className="text-yellow-400 font-mono text-sm">173 cm</strong>: Altura al Centro del Bullseye</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#07090e] px-3 py-1.5 rounded-xl border border-yellow-400/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    <span><strong className="text-yellow-400 font-mono text-sm">237 cm</strong>: Distancia Horizontal a Diana</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#07090e] px-3 py-1.5 rounded-xl border border-yellow-400/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    <span><strong className="text-yellow-400 font-mono text-sm">293 cm</strong>: Hipotenusa Diagonal de Tiro</span>
                  </div>
                </div>

                <a
                  href="/images/medidas-cancha.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] text-xs font-black rounded-xl transition-all shadow-lg shadow-[#00e676]/20 flex items-center gap-1.5 ml-auto"
                >
                  <Eye className="w-4 h-4" />
                  <span>Abrir en Pantalla Completa</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CAPÍTULO II: MODALIDADES DE COMPETICIÓN Y PUNTOS        */}
        {/* ======================================================== */}
        <section id="capitulo-2" className="scroll-mt-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">Capítulo II</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Modalidades de Competición y Sistema de Cómputo de Puntos
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            La plataforma y circuito federado divide la participación de los jugadores en <strong className="text-white">4 categorías canónicas</strong>, cada una con un tratamiento estadístico y de ranking independiente:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modalidad 1: Individuales */}
            <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-purple-400/20 text-purple-300 border border-purple-400/30">
                  Modalidad 1
                </span>
                <span className="text-xs font-bold text-slate-400">Anotador Oficial</span>
              </div>
              <h3 className="text-sm font-black text-white">Partidas Individuales & Retos Casuales</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Encuentros amistosos entre dos jugadores, práctica individual o duelos contra el Bot AI en el anotador.
              </p>
              <div className="p-3 rounded-xl bg-[#07090e] border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-purple-300 block mb-0.5">Cómputo en la App:</strong>
                Alimentan el promedio general (AVG), la cantidad de 180s y los récords personales (Mejor Pierna, Mayor Cierre). <strong className="text-rose-400">NO suman puntos ni alteran tablas de torneos o ligas oficiales.</strong>
              </div>
            </div>

            {/* Modalidad 2: Torneos de un Día */}
            <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30">
                  Modalidad 2
                </span>
                <span className="text-xs font-bold text-slate-400">Copas & Relámpago</span>
              </div>
              <h3 className="text-sm font-black text-white">Torneos Oficiales de un Día (Open)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Certámenes independientes con eliminación simple o doble eliminación (Winners & Losers) que se resuelven en una única fecha.
              </p>
              <div className="p-3 rounded-xl bg-[#07090e] border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-[#00e676] block mb-0.5">Cómputo en la App:</strong>
                Otorgan copas y medallas al palmarés del jugador (<strong className="text-amber-300">#1 Campeón, #2 Subcampeón, #3 Podio de Bronce</strong>). Se computan en el historial de títulos de la ficha deportiva.
              </div>
            </div>

            {/* Modalidad 3: Ligas Locales */}
            <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-sky-400/20 text-sky-300 border border-sky-400/30">
                  Modalidad 3
                </span>
                <span className="text-xs font-bold text-slate-400">MDQ & Clubes Federados</span>
              </div>
              <h3 className="text-sm font-black text-white">Ligas Locales (Presencial & Online)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Competencias zonales (ej: Liga Marplatense 2026 • Darderos MDQ) disputadas a lo largo de varias fechas y zonas por temporada.
              </p>
              <div className="p-3 rounded-xl bg-[#07090e] border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-sky-300 block mb-0.5">Cómputo en la App & Participación Online:</strong>
                <strong className="text-white">Admite fechas presenciales en la sede y fechas conectadas online.</strong> Cada fecha disputada suma a la tabla acumulada de la liga local (Puntos, Partidos Ganados, Diferencia de Legs $+/-$).
              </div>
            </div>

            {/* Modalidad 4: Liga Nacional Oficial */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0f1422] to-amber-950/20 border-2 border-amber-400/50 space-y-2.5 shadow-lg shadow-amber-500/10">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-400/25 text-amber-300 border border-amber-400/50 flex items-center gap-1">
                  <span>⚡</span>
                  <span>Modalidad 4 • Federada</span>
                </span>
                <span className="text-xs font-black text-amber-400">Regla Oficial x2 Pts</span>
              </div>
              <h3 className="text-sm font-black text-white">Liga Nacional Oficial de Argentina</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Única Liga Nacional Oficial de Argentina, de carácter federal y <strong className="text-amber-300">clasificatoria oficial a torneos internacionales</strong>.
              </p>
              <div className="p-3 rounded-xl bg-[#07090e] border border-amber-400/30 text-[11px] text-slate-300 space-y-1">
                <div>
                  🌐 <strong className="text-white">Fechas Online:</strong> Suman <strong className="text-sky-300 font-mono">1x Puntos</strong> normales a la tabla nacional.
                </div>
                <div>
                  ⚡ <strong className="text-amber-300">Fechas Presenciales Oficiales:</strong> Otorgan el <strong className="text-amber-400 font-black font-mono">DOBLE DE PUNTOS (x2)</strong> para premiar el esfuerzo de concurrencia y la presencia en las sedes deportivas del país.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CAPÍTULO III: CÓDIGO DE ETIQUETA Y FAIR PLAY             */}
        {/* ======================================================== */}
        <section id="capitulo-3" className="scroll-mt-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-sky-400 flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-400">Capítulo III</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Código de Etiqueta y Fair Play en la Diana
              </h2>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
                <div className="text-rose-400 font-black text-xs flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  <span>1. Silencio en el Lanzamiento</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Está terminantemente prohibido hablar, hacer ruidos corporales, gesticular o cruzar la línea de visión del rival mientras está parado en la diana en posición de tiro.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
                <div className="text-amber-400 font-black text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>2. Distancia al Oche</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El jugador en espera debe permanecer al menos 60 cm detrás de la línea de tiro. No debe aproximarse a la diana hasta que el lanzador haya completado sus 3 dardos.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
                <div className="text-[#00e676] font-black text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. Retiro de Dardos</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ningún dardo debe ser tocado o retirado de la diana hasta que el anotador haya registrado la visita o el juez/rival haya verificado el puntaje exacto.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong className="text-white">Tradición Dartera:</strong> Saludo cordial de puño/mano antes de iniciar (<em className="text-amber-300">"Good Darts"</em>) y felicitación deportiva al concluir el match, independientemente del marcador.
              </span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CAPÍTULO IV: REQUERIMIENTOS TÉCNICOS ONLINE              */}
        {/* ======================================================== */}
        <section id="capitulo-4" className="scroll-mt-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] flex-shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#ef4444]">Capítulo IV</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Requerimientos Técnicos para Partidas Online
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Para garantizar la transparencia, honestidad y validez de las partidas remotas disputadas por internet, los participantes deben cumplir con los siguientes estándares de pista:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-sky-300 flex items-center gap-2">
                <span>📹 Disposición de la Cámara de Diana</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Ángulo Perpendicular:</strong> La cámara debe apuntar frontalmente o con un ángulo máximo de 30° respecto al plano de la diana, a una distancia aproximada de 1.0 m a 1.5 m.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Encuadre Total:</strong> Los 20 sectores numéricos, el anillo de dobles exterior, el anillo de triples y el Bull central deben ser visibles en el 100% de la toma sin recortes.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Iluminación sin Sombras:</strong> Se exige iluminación uniforme (aro de luz LED preferente) que evite sombras proyectadas que impidan discernir el alambre o sector exacto del impacto.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <span>🎙️ Audio Abierto & Validación de Impacto</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Micrófono Activo:</strong> El micrófono de pista debe permanecer encendido durante el lanzamiento para que el rival y árbitros puedan escuchar acústicamente los 3 impactos sobre el sisal.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Prohibido Manipular antes de Anotar:</strong> Los dardos deben permanecer clavados en la diana hasta que el marcador o rival confirmen la visita. Tocar los dardos antes anula la tirada.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Celular como Cámara Secundaria:</strong> Se permite utilizar el teléfono móvil como cámara de diana conectada mediante escaneo de código QR en la app.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CAPÍTULO V: DESCONEXIONES Y WALKOVER (W.O.)             */}
        {/* ======================================================== */}
        <section id="capitulo-5" className="scroll-mt-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-400/15 border border-purple-400/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">Capítulo V</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Protocolo de Conectividad, Desconexiones & Walkover (W.O.)
              </h2>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
                <div className="text-amber-400 font-black text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Tolerancia Inicial (10 Min)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Existe un período de gracia estricto de <strong className="text-white">10 minutos</strong> desde el horario pactado en el fixture. Si un jugador no ingresa a la sala ni responde por los canales oficiales, se declara victoria por <strong className="text-rose-400">Walkover (W.O.)</strong> a favor del rival presente.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
                <div className="text-sky-400 font-black text-xs flex items-center gap-1.5">
                  <WifiOff className="w-4 h-4" />
                  <span>Caída de Conexión (5 Min)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Si un competidor sufre un corte de luz o caída de red durante un match, la partida queda en <strong className="text-white">Stand By</strong> por un lapso máximo de <strong className="text-amber-300">5 minutos</strong> para su restablecimiento.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800 space-y-1.5">
                <div className="text-[#00e676] font-black text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reanudación de Match</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Al reconectarse, la partida se reanuda en el leg y puntaje exacto donde fue congelada. Si expira el tiempo de espera, el administrador asigna los puntos al rival.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-start gap-3 text-xs text-slate-300">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Potestad Arbitral de la Organización (ICEMAN & Administradores Oficiales):</strong>
                <span>
                  Los administradores oficiales de la plataforma poseen la facultad exclusiva de editar marcadores, validar apelaciones técnicas mediante revisión de video de partidas grabadas, y rectificar cualquier llave eliminatoria o tabla de liga ante discrepancias fundamentadas.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Cierre y Contacto */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#090d17] to-[#0d1322] border border-slate-800 text-center space-y-3">
          <BrandLogo size="md" />
          <h3 className="text-base font-black text-white">
            Locos por los Dardos Argentina & Darderos Mar del Plata
          </h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Por dudas o inquietudes sobre el reglamento de competición, comunicate con el comité arbitral oficial en nuestras sedes físicas o mediante los canales de la comunidad.
          </p>
          <div className="pt-2">
            <Link
              href="/torneos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-black font-black text-xs transition-colors shadow-lg shadow-[#00e676]/20"
            >
              <span>Ver Cuadros & Torneos Oficiales</span>
              <Trophy className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
