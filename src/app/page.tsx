'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TournamentHeroBanner } from '@/components/comunidad/TournamentHeroBanner';
import { NationalRankings } from '@/components/comunidad/NationalRankings';
import { BrandLogo } from '@/components/BrandLogo';
import { getStoredAssociationBankAccount, fetchAssociationBankAccountFromCloud } from '@/lib/storage';
import { DEFAULT_ASSOCIATION_BANK_ACCOUNT } from '@/lib/constants';
import { AssociationBankAccount } from '@/lib/types';
import { 
  Target, 
  Trophy, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck
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
        <div className="relative rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/15 overflow-hidden">
          {/* Fondo de foto Darderos nítida y visible con overlay sutil */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/darderos.jpeg')" }}
          />
          {/* Overlay suave y translúcido que permite apreciar los rostros y dianas con gran nitidez */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/45" />
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-ping"></span>
                <span className="text-xs font-black uppercase text-[#00e676] tracking-wider drop-shadow-md">
                  Comunidad Nacional de Dardos
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                La plataforma que une a todos los <span className="text-[#00e676]">darderos del país</span>.
              </h2>

              <p className="text-white text-sm sm:text-base leading-relaxed font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                Nacida de la pasión de los jugadores de <strong className="text-[#00e676]">Darderos Mar del Plata</strong> y expandida a cada rincón de Argentina. Aquí puedes registrar tus partidas tiro a tiro, medir tu promedio histórico, competir en torneos presenciales y online con cuadros interactivos, y equiparte con material profesional importado.
              </p>

              {/* Pilares clave con estilo deportivo - Cuadros 90% transparentes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-white bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Anotador PWA:</strong> funciona offline en cualquier pub o club.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Categorización por AVG:</strong> Principiante a Elite.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Torneos Oficiales:</strong> llaves y cruces en vivo.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                  <span><strong>Mercado Pago:</strong> cuotas en pesos y envíos al país.</span>
                </div>
              </div>
            </div>

            {/* Showcase Visual de la Comunidad - Cuadro 90% transparente */}
            <div className="lg:col-span-5 bg-black/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 text-center shadow-2xl space-y-4">
              <div className="flex justify-center pb-2">
                <BrandLogo size="lg" />
              </div>
              <p className="text-xs text-slate-300 leading-snug drop-shadow-sm">
                Más de <strong className="text-white">1.200 jugadores</strong> activos compitiendo en ligas provinciales y torneos abiertos.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-center">
                <div className="bg-black/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                  <span className="font-black text-[#00e676] text-lg font-mono">24</span>
                  <span className="text-[10px] text-slate-300 block font-bold">Provincias</span>
                </div>
                <div className="bg-black/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                  <span className="font-black text-[#ef4444] text-lg font-mono">35+</span>
                  <span className="text-[10px] text-slate-300 block font-bold">Torneos / Año</span>
                </div>
                <div className="bg-black/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                  <span className="font-black text-[#0284c7] text-lg font-mono">180s</span>
                  <span className="text-[10px] text-slate-300 block font-bold">Registro Vivo</span>
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

      {/* 6. VITRINA OFICIAL: DATOS PARA PAGO DE INSCRIPCIONES A TORNEOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomePaymentShowcase />
      </section>
    </div>
  );
}

function HomePaymentShowcase() {
  const [account, setAccount] = React.useState<AssociationBankAccount>(() => {
    return getStoredAssociationBankAccount(DEFAULT_ASSOCIATION_BANK_ACCOUNT);
  });
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Sincronizar cuenta bancaria oficial en vivo desde Supabase PostgreSQL
    fetchAssociationBankAccountFromCloud().then((cloudBank) => {
      if (cloudBank) setAccount(cloudBank);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) setAccount(e.detail);
    };
    window.addEventListener('lpld_association_bank_updated', handleUpdate);
    return () => window.removeEventListener('lpld_association_bank_updated', handleUpdate);
  }, []);

  const handleCopy = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hola ${account.adminWhatsAppName}! Te envío el comprobante de pago de inscripción a torneo en Locos por los Dardos.`
  );
  const whatsappUrl = `https://wa.me/${account.adminWhatsAppPhone.replace(/\D/g, '')}?text=${whatsappMessage}`;

  return (
    <div className="bg-[#0f1422] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cuenta Bancaria Oficial de Cobros</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Datos para Pago de Inscripciones a Torneos
          </h3>
          <p className="text-xs text-[#b8ad98]">
            Cuenta habilitada para recepción de transferencias bancarias oficiales de competidores.
          </p>
        </div>

        <Link
          href="/asociacion"
          className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-[#14161f] border border-[#1e2638] transition-colors flex items-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-[#00e676]" />
          <span>Ver Comisión Directiva</span>
        </Link>
      </div>

      {/* Columnas de Datos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Banco */}
        <div className="p-4 rounded-2xl bg-[#14161f] border border-[#1e2638] space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Banco / Entidad
          </span>
          <p className="text-sm font-black text-white">{account.bankName}</p>
          <p className="text-[11px] text-slate-400">{account.accountType}</p>
        </div>

        {/* Titular */}
        <div className="p-4 rounded-2xl bg-[#14161f] border border-[#1e2638] space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Titular de la Cuenta
          </span>
          <p className="text-sm font-black text-white">{account.holderName}</p>
          <p className="text-[11px] text-slate-400">CUIT: {account.cuitCuil}</p>
        </div>

        {/* Alias */}
        <div className="p-4 rounded-2xl bg-[#14161f] border border-amber-500/20 space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              Alias CBU / CVU
            </span>
            <p className="text-sm font-black text-white font-mono">{account.alias}</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(account.alias, 'alias')}
            className="mt-2 w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedField === 'alias' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Alias</span>
              </>
            )}
          </button>
        </div>

        {/* CBU */}
        <div className="p-4 rounded-2xl bg-[#14161f] border border-amber-500/20 space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              CBU / CVU
            </span>
            <p className="text-xs font-bold text-white font-mono break-all leading-tight">{account.cbuCvu}</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(account.cbuCvu, 'cbu')}
            className="mt-2 w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedField === 'cbu' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar CBU</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Envío de Comprobante por WhatsApp */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-[#00e676] flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-black text-white block">
              Envío de Comprobante por WhatsApp al Administrador Designado
            </span>
            <p className="text-[11px] text-slate-300">
              Administración: <strong>{account.adminWhatsAppName}</strong> • Enviar comprobante indicando nombre completo y torneo para confirmar el cupo.
            </p>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Abrir Chat de WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
