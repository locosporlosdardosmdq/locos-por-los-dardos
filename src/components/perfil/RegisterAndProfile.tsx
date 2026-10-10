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
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
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
      {/* Selector de Pestañas en Gris Oscuro */}
      <div className="flex items-center justify-between bg-[#1c1f2b] border border-[#313647] p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-[#00b853] text-[#0d0e12] shadow-md shadow-[#00b853]/20'
                : 'text-[#b8ad98] hover:text-white hover:bg-[#242836]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil & Estadísticas</span>
          </button>
          <button
            onClick={() => setActiveTab('REGISTER_EDIT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === 'REGISTER_EDIT'
                ? 'bg-[#00b853] text-[#0d0e12] shadow-md shadow-[#00b853]/20'
                : 'text-[#b8ad98] hover:text-white hover:bg-[#242836]'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Ficha / Modificar Datos</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#00b853] px-3 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Jugador Federado Argentino</span>
        </div>
      </div>

      {activeTab === 'PROFILE' ? (
        /* VISTA DE PERFIL & ESTADÍSTICAS */
        <div className="space-y-6">
          {/* Header Tarjeta del Jugador en Gris Oscuro con halo Verde Diana */}
          <div className="relative overflow-hidden rounded-3xl bg-[#1c1f2b] border border-[#313647] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00b853]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#00b853] shadow-xl bg-[#14161f] p-1 flex-shrink-0">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.nickname}
                    fill
                    className="object-contain p-2"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#00b853] border-2 border-[#14161f] rounded-full"></span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {profile.nickname}
                    </h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg border bg-[#00b853]/20 text-[#00b853] border-[#00b853]/40">
                      {currentCategoryInfo.label}
                    </span>
                    {profile.isVerified && (
                      <span className="text-[#00b853] flex items-center gap-1 text-xs font-black bg-[#00b853]/15 px-2 py-0.5 rounded-md border border-[#00b853]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <p className="text-[#efe7d8] font-medium text-sm flex items-center gap-2">
                    <span>{profile.fullName}</span>
                    <span className="text-[#313647]">•</span>
                    <span className="flex items-center gap-1 text-[#b8ad98] text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#00b853]" />
                      {profile.city}, {profile.province}
                    </span>
                  </p>

                  <p className="text-xs text-[#b8ad98] max-w-xl leading-relaxed pt-1">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Tarjeta AVG Resumida */}
              <div className="flex flex-row md:flex-col items-center justify-center bg-[#14161f] border border-[#313647] rounded-2xl p-4 sm:px-6 w-full md:w-auto text-center gap-3">
                <div>
                  <span className="text-[11px] font-black text-[#b8ad98] uppercase tracking-wider block">
                    Promedio Global 501
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-[#00b853] font-mono tracking-tight">
                      {profile.stats.overallAvg.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#b8ad98] font-bold">AVG</span>
                  </div>
                </div>

                <div className="w-full pt-2 border-t border-[#313647] flex items-center justify-between text-xs text-[#b8ad98] gap-4">
                  <span>First 9: <strong className="text-[#efe7d8]">{profile.stats.first9Avg.toFixed(1)}</strong></span>
                  <span>Dardos: <strong className="text-white">{profile.preferredDartWeight}g</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de Rendimiento en Gris Oscuro */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#1c1f2b] border border-[#313647] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-[#b8ad98] mb-2">
                <span className="text-xs font-black uppercase">Partidos</span>
                <Trophy className="w-4 h-4 text-[#00b853]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {profile.stats.matchesWon}
                </span>
                <span className="text-xs text-[#b8ad98]">
                  / {profile.stats.matchesPlayed} PJ ({((profile.stats.matchesWon / profile.stats.matchesPlayed) * 100).toFixed(0)}% Win)
                </span>
              </div>
              <div className="w-full bg-[#14161f] h-2 rounded-full mt-2 overflow-hidden border border-[#313647]">
                <div
                  className="bg-[#00b853] h-full rounded-full"
                  style={{ width: `${(profile.stats.matchesWon / profile.stats.matchesPlayed) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#1c1f2b] border border-[#313647] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-[#b8ad98] mb-2">
                <span className="text-xs font-black uppercase">% Cierre Dobles</span>
                <Crosshair className="w-4 h-4 text-[#e52521]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#e52521] font-mono">
                  {profile.stats.checkoutPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-[#b8ad98]">
                  ({profile.stats.checkoutHits}/{profile.stats.checkoutAttempts})
                </span>
              </div>
              <div className="w-full bg-[#14161f] h-2 rounded-full mt-2 overflow-hidden border border-[#313647]">
                <div
                  className="bg-[#e52521] h-full rounded-full"
                  style={{ width: `${profile.stats.checkoutPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-[#1c1f2b] border border-[#313647] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-[#b8ad98] mb-2">
                <span className="text-xs font-black uppercase">Mayor Cierre</span>
                <Zap className="w-4 h-4 text-[#1d68ed]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#38bdf8] font-mono">
                  {profile.stats.highestCheckout}
                </span>
                <span className="text-xs text-[#b8ad98]">Puntos</span>
              </div>
              <p className="text-[10px] text-[#b8ad98]/70 mt-1">Mejor pierna: {profile.stats.bestLegDarts} dardos</p>
            </div>

            <div className="bg-[#1c1f2b] border border-[#313647] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-[#b8ad98] mb-2">
                <span className="text-xs font-black uppercase">Visitas Clave</span>
                <Target className="w-4 h-4 text-[#00b853]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#00b853]">
                  {profile.stats.count180s}
                </span>
                <span className="text-xs text-[#b8ad98]">
                  x 180s • {profile.stats.count140Plus} x 140+
                </span>
              </div>
              <p className="text-[10px] text-[#b8ad98]/70 mt-1">{profile.stats.count100Plus} visitas de 100+</p>
            </div>
          </div>

          {/* Historial y Esquema de Categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-5 shadow-lg">
              <h3 className="font-black text-sm text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00b853]" />
                Evolución Histórica de AVG (Últimas fechas)
              </h3>
              <div className="space-y-2.5">
                {[
                  { fecha: 'Fecha 5 - Torneo MDQ 2026', avg: 68.2, piernas: '4-2', rival: 'Martín Rossi' },
                  { fecha: 'Fecha 4 - Liga Federal Online', avg: 65.4, piernas: '3-1', rival: 'Diego Gómez' },
                  { fecha: 'Fecha 3 - Amistoso Darderos MDQ', avg: 63.8, piernas: '5-4', rival: 'Lucas Pereyra' },
                  { fecha: 'Fecha 2 - Copa Costa Atlántica', avg: 61.5, piernas: '2-4', rival: 'Carlos Méndez' },
                  { fecha: 'Fecha 1 - Apertura Primavera', avg: 59.8, piernas: '4-0', rival: 'Rodrigo Morales' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#14161f] border border-[#313647] text-xs"
                  >
                    <div>
                      <strong className="text-white block">{item.fecha}</strong>
                      <span className="text-[#b8ad98]">vs {item.rival} ({item.piernas})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#00b853] font-mono font-black text-sm">
                        {item.avg.toFixed(1)} AVG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-5 shadow-lg">
              <h3 className="font-black text-sm text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#00b853]" />
                Esquema de Categorías Oficiales
              </h3>
              <div className="space-y-2.5">
                {(Object.keys(CATEGORY_DETAILS) as PlayerCategory[]).map((catKey) => {
                  const item = CATEGORY_DETAILS[catKey];
                  const isCurrent = profile.category === catKey;

                  return (
                    <div
                      key={catKey}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#00b853]/15 border-[#00b853] shadow-md shadow-[#00b853]/20'
                          : 'bg-[#14161f] border-[#313647]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase text-[#efe7d8]">
                          {item.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-black text-[#00b853] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tu Categoría
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#b8ad98] leading-snug">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FORMULARIO DE REGISTRO & ESTIMACIÓN DE AVG */
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-[#00b853]" />
              Ficha del Jugador & Categorización Automática
            </h2>
            <p className="text-xs text-[#b8ad98] mt-1">
              Completa tus datos para integrarte al ranking oficial de Dardos Argentina y Darderos Mar del Plata.
            </p>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-[#00b853]/20 border border-[#00b853]/60 text-[#00b853] text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              ¡Datos guardados con éxito! Tu categoría asignada es {categoryInfo.label}.
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                  placeholder="Ej: Facundo López"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase">
                  Apodo (Nickname Deportivo)
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                  placeholder="Ej: El Halcón MDQ"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                  placeholder="jugador@dardos.ar"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                  placeholder="+54 9 223 555-0192"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase">
                  Provincia (Argentina)
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                >
                  {PROVINCIAS_ARGENTINA.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase">
                  Ciudad / Localidad
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                  placeholder="Ej: Mar del Plata"
                />
              </div>
            </div>

            {/* SECCIÓN ESTIMACIÓN DE AVG AUTOMÁTICA EN VERDE DIANA */}
            <div className="bg-[#14161f] border-2 border-[#00b853]/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#00b853]" />
                    Promedio Estimado en 501 (AVG)
                  </h4>
                  <p className="text-xs text-[#b8ad98]">
                    Ajusta tu promedio por visita para que el sistema asigne tu categoría automáticamente.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-[#00b853] font-mono">
                    {estimatedAvg.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#b8ad98] block font-bold">Puntos / 3 dardos</span>
                </div>
              </div>

              <input
                type="range"
                min="20"
                max="100"
                step="0.5"
                value={estimatedAvg}
                onChange={(e) => setEstimatedAvg(parseFloat(e.target.value))}
                className="w-full accent-[#00b853] h-2 bg-[#242836] rounded-lg cursor-pointer"
              />

              <div className="p-4 rounded-xl bg-[#1c1f2b] border border-[#313647] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#b8ad98] uppercase font-bold block">
                    Categoría Asignada Oficial:
                  </span>
                  <span className="text-base font-black px-3 py-1 rounded-lg border inline-block mt-1 bg-[#00b853]/20 text-[#00b853] border-[#00b853]/50">
                    {categoryInfo.label}
                  </span>
                </div>
                <p className="text-xs text-[#efe7d8] max-w-sm">
                  {categoryInfo.desc}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-[#00b853] hover:bg-[#009e47] text-[#0d0e12] font-black rounded-2xl text-sm transition-all shadow-lg shadow-[#00b853]/25 flex items-center justify-center gap-2"
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
