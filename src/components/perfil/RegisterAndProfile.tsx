'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlayerProfile, PlayerCategory } from '@/lib/types';
import { PROVINCIAS_ARGENTINA, calculateCategory, CATEGORY_DETAILS, MOCK_CURRENT_USER } from '@/lib/constants';
import { 
  User, 
  MapPin, 
  Trophy, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Crosshair,
  Award,
  Zap,
  Edit3
} from 'lucide-react';

export const RegisterAndProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'REGISTER_EDIT'>('PROFILE');
  const [profile, setProfile] = useState<PlayerProfile>(MOCK_CURRENT_USER);

  // Form State
  const [fullName, setFullName] = useState(profile.fullName);
  const [nickname, setNickname] = useState(profile.nickname);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || '');
  const [province, setProvince] = useState(profile.province);
  const [city, setCity] = useState(profile.city);
  const [estimatedAvg, setEstimatedAvg] = useState<number>(profile.estimatedAvg);
  const [bio, setBio] = useState(profile.bio || '');
  const [preferredWeight, setPreferredWeight] = useState<number>(profile.preferredDartWeight || 23);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Categoría calculada automáticamente en tiempo real
  const calculatedCategory = calculateCategory(estimatedAvg);
  const categoryInfo = CATEGORY_DETAILS[calculatedCategory];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlayerProfile = {
      ...profile,
      fullName,
      nickname,
      email,
      phone,
      province,
      city,
      estimatedAvg,
      category: calculatedCategory,
      bio,
      preferredDartWeight: preferredWeight
    };
    setProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('PROFILE');
    }, 1200);
  };

  const currentCategoryInfo = CATEGORY_DETAILS[profile.category];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Selector de Pestañas: Mi Dashboard vs Editar/Registrar */}
      <div className="flex items-center justify-between bg-[#0e1526] border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil & Estadísticas</span>
          </button>
          <button
            onClick={() => setActiveTab('REGISTER_EDIT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'REGISTER_EDIT'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Formulario de Registro / Modificar Datos</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 px-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Jugador Federado Argentino</span>
        </div>
      </div>

      {activeTab === 'PROFILE' ? (
        /* VISTA DE PERFIL & ESTADÍSTICAS */
        <div className="space-y-6">
          {/* Header Tarjeta del Jugador */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10192e] via-[#0d1424] to-[#080d1a] border border-slate-800 p-6 sm:p-8 shadow-2xl">
            {/* Brillo de fondo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar con aura según categoría */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-xl bg-slate-900 p-1 flex-shrink-0">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.nickname}
                    fill
                    className="object-contain p-2"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {profile.nickname}
                    </h2>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${currentCategoryInfo.badgeClass}`}>
                      {currentCategoryInfo.label}
                    </span>
                    {profile.isVerified && (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 font-medium text-sm flex items-center gap-2">
                    <span>{profile.fullName}</span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {profile.city}, {profile.province}
                    </span>
                  </p>

                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed pt-1">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Tarjeta AVG Resumida */}
              <div className="flex flex-row md:flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:px-6 w-full md:w-auto text-center gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Promedio Global 501
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                      {profile.stats.overallAvg.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">AVG</span>
                  </div>
                </div>

                <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 gap-4">
                  <span>First 9: <strong className="text-amber-400">{profile.stats.first9Avg.toFixed(1)}</strong></span>
                  <span>Dardos: <strong className="text-white">{profile.preferredDartWeight}g</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de Métricas de Rendimiento Deportivo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Partidos Ganados / Perdidos */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Partidos</span>
                <Trophy className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {profile.stats.matchesWon}
                </span>
                <span className="text-xs text-slate-400">
                  / {profile.stats.matchesPlayed} PJ ({((profile.stats.matchesWon / profile.stats.matchesPlayed) * 100).toFixed(0)}% Win)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(profile.stats.matchesWon / profile.stats.matchesPlayed) * 100}%` }}
                />
              </div>
            </div>

            {/* Efectividad en Dobles / Checkout % */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">% Cierre Dobles</span>
                <Crosshair className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {profile.stats.checkoutPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400">
                  ({profile.stats.checkoutHits}/{profile.stats.checkoutAttempts})
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{ width: `${profile.stats.checkoutPercentage}%` }}
                />
              </div>
            </div>

            {/* Mayor Cierre / Highest Checkout */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Mayor Cierre</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {profile.stats.highestCheckout}
                </span>
                <span className="text-xs text-slate-400">Puntos</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Mejor pierna: {profile.stats.bestLegDarts} dardos</p>
            </div>

            {/* Toneladas y 180s */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Visitas Clave</span>
                <Sparkles className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-400">
                  {profile.stats.count180s}
                </span>
                <span className="text-xs text-slate-400">
                  x 180s • {profile.stats.count140Plus} x 140+
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{profile.stats.count100Plus} visitas de 100+</p>
            </div>
          </div>

          {/* Historial de Evolución y Partidas Recientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Evolución de AVG */}
            <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Evolución Histórica de AVG (Últimas 5 fechas)
              </h3>
              <div className="space-y-3">
                {[
                  { fecha: 'Fecha 5 - Torneo MDQ 2026', avg: 68.2, piernas: '4-2', rival: 'Martín Rossi' },
                  { fecha: 'Fecha 4 - Liga Federal Online', avg: 65.4, piernas: '3-1', rival: 'Diego Gómez' },
                  { fecha: 'Fecha 3 - Amistoso Darderos MDQ', avg: 63.8, piernas: '5-4', rival: 'Lucas Pereyra' },
                  { fecha: 'Fecha 2 - Copa Costa Atlántica', avg: 61.5, piernas: '2-4', rival: 'Carlos Méndez' },
                  { fecha: 'Fecha 1 - Apertura Primavera', avg: 59.8, piernas: '4-0', rival: 'Rodrigo Morales' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <strong className="text-white block">{item.fecha}</strong>
                      <span className="text-slate-400">vs {item.rival} ({item.piernas})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        {item.avg.toFixed(1)} AVG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clasificación de Categorías de la Comunidad */}
            <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Esquema de Categorías Oficiales Argentina
              </h3>
              <div className="space-y-2.5">
                {(Object.keys(CATEGORY_DETAILS) as PlayerCategory[]).map((catKey) => {
                  const item = CATEGORY_DETAILS[catKey];
                  const isCurrent = profile.category === catKey;

                  return (
                    <div
                      key={catKey}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/40 border-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded border ${item.badgeClass}`}>
                          {item.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tu Categoría
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FORMULARIO DE REGISTRO & ESTIMACIÓN DE AVG AUTOMÁTICA */
        <div className="bg-[#0e1526] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-emerald-400" />
              Ficha del Jugador & Categorización Automática
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Completa tus datos para integrarte al ranking oficial de Dardos Argentina y Darderos Mar del Plata.
            </p>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ¡Datos guardados con éxito! Tu categoría asignada es {categoryInfo.label}.
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ej: Facundo López"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Apodo (Nickname Deportivo)
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ej: El Halcón MDQ"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="jugador@dardos.ar"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="+54 9 223 555-0192"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Provincia (Argentina)
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {PROVINCIAS_ARGENTINA.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Ciudad / Localidad
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Ej: Mar del Plata"
                />
              </div>
            </div>

            {/* SECCIÓN CRÍTICA: ESTIMACIÓN DE AVG Y CATEGORIZACIÓN AUTOMÁTICA */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Promedio Estimado en 501 (AVG)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ajusta tu promedio por visita para que el sistema asigne automáticamente tu categoría competitiva.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {estimatedAvg.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 block font-bold">Puntos / 3 dardos</span>
                </div>
              </div>

              {/* Slider de AVG */}
              <input
                type="range"
                min="20"
                max="100"
                step="0.5"
                value={estimatedAvg}
                onChange={(e) => setEstimatedAvg(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Categoría Asignada Dinámicamente */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">
                    Categoría Asignada Automáticamente:
                  </span>
                  <span className={`text-base font-black px-3 py-1 rounded-lg border inline-block mt-1 ${categoryInfo.badgeClass}`}>
                    {categoryInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-sm">
                  {categoryInfo.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Peso de Dardos Preferido (Gramos)
                </label>
                <input
                  type="number"
                  min="16"
                  max="32"
                  step="0.5"
                  value={preferredWeight}
                  onChange={(e) => setPreferredWeight(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                  Bio / Presentación
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Club donde entrenas, años jugando..."
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Guardar y Actualizar Perfil Competitivo</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
