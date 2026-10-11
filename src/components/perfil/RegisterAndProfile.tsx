'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayerProfile, PlayerCategory } from '@/lib/types';
import { 
  PROVINCIAS_ARGENTINA, 
  calculateCategory, 
  CATEGORY_DETAILS, 
  MOCK_CURRENT_USER, 
  USER_ICEMAN,
  COUNTRIES, 
  getCountryFlag, 
  isUserAdmin 
} from '@/lib/constants';
import { getCurrentPlayerProfile, saveCurrentPlayerProfile } from '@/lib/storage';
import { UltimateDartsCard, UltimateDartsCardData } from '@/components/jugadores/UltimateDartsCard';
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
  Edit3,
  Globe,
  ShieldAlert,
  LogIn,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

export const RegisterAndProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'REGISTER_EDIT'>('PROFILE');
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    return getCurrentPlayerProfile(MOCK_CURRENT_USER);
  });

  // Form State
  const [fullName, setFullName] = useState(profile.fullName);
  const [nickname, setNickname] = useState(profile.nickname);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || '');
  const [nationality, setNationality] = useState(profile.nationality || 'Argentina');
  const [countryCode, setCountryCode] = useState(profile.countryCode || 'AR');
  const [province, setProvince] = useState(profile.province);
  const [city, setCity] = useState(profile.city);
  const [estimatedAvg, setEstimatedAvg] = useState<number>(profile.estimatedAvg);
  const [bio, setBio] = useState(profile.bio || '');
  const [preferredWeight, setPreferredWeight] = useState<number>(profile.preferredDartWeight || 23);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincronizar estado cuando se actualiza el perfil en storage
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setProfile(e.detail);
        setFullName(e.detail.fullName);
        setNickname(e.detail.nickname);
        setEmail(e.detail.email);
        setNationality(e.detail.nationality || 'Argentina');
        setCountryCode(e.detail.countryCode || 'AR');
        setProvince(e.detail.province);
        setCity(e.detail.city);
        setEstimatedAvg(e.detail.estimatedAvg);
      }
    };
    window.addEventListener('lpld_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('lpld_profile_updated', handleProfileUpdate);
  }, []);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => {
    return profile.photoUrl || null;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('webp')) {
      alert('Se recomienda una imagen en formato PNG (o WebP) con fondo transparente para un resultado óptimo en tu carta oficial de dardos.');
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Redimensionar y formatear a 400x520 px preservando canal alfa transparente
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 520;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 400, 520);
          
          const scale = Math.min(400 / img.width, 520 / img.height);
          const x = (400 - img.width * scale) / 2;
          const y = (520 - img.height * scale); // Anclar al pie
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          const dataUrl = canvas.toDataURL('image/png');
          
          setCustomPhoto(dataUrl);
          const updatedProfile = { ...profile, photoUrl: dataUrl };
          setProfile(updatedProfile);
          saveCurrentPlayerProfile(updatedProfile);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lpld_profile_updated', { detail: updatedProfile }));
          }
        }
        setUploadingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setCustomPhoto(null);
    const updatedProfile = { ...profile, photoUrl: undefined };
    setProfile(updatedProfile);
    saveCurrentPlayerProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lpld_profile_updated', { detail: updatedProfile }));
    }
  };

  const calculatedCategory = calculateCategory(estimatedAvg);
  const categoryInfo = CATEGORY_DETAILS[calculatedCategory];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = isUserAdmin(email);
    const updated: PlayerProfile = {
      ...profile,
      fullName,
      nickname,
      email,
      phone,
      nationality,
      countryCode,
      province,
      city,
      estimatedAvg,
      category: calculatedCategory,
      bio,
      preferredDartWeight: preferredWeight,
      role: isAdmin ? 'ADMIN' : (profile.role || 'PLAYER')
    };
    setProfile(updated);
    saveCurrentPlayerProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('PROFILE');
    }, 1200);
  };

  const handleSwitchToIceman = () => {
    setProfile(USER_ICEMAN);
    setFullName(USER_ICEMAN.fullName);
    setNickname(USER_ICEMAN.nickname);
    setEmail(USER_ICEMAN.email);
    setPhone(USER_ICEMAN.phone || '');
    setNationality(USER_ICEMAN.nationality || 'Argentina');
    setCountryCode(USER_ICEMAN.countryCode || 'AR');
    setProvince(USER_ICEMAN.province);
    setCity(USER_ICEMAN.city);
    setEstimatedAvg(USER_ICEMAN.estimatedAvg);
    setBio(USER_ICEMAN.bio || '');
    saveCurrentPlayerProfile(USER_ICEMAN);
    alert('¡Sesión iniciada con éxito como ICEMAN (Superadministrador Full)!');
  };

  const currentCategoryInfo = CATEGORY_DETAILS[profile.category];
  const flag = getCountryFlag(profile.countryCode || profile.nationality);
  const isProfileAdmin = isUserAdmin(profile);

  const currentUserCardData: UltimateDartsCardData = {
    id: profile.id,
    name: profile.fullName || profile.nickname,
    nickname: profile.nickname,
    avatarUrl: profile.avatarUrl || '/images/iceman-perfil.png',
    photoUrl: customPhoto || profile.photoUrl || profile.avatarUrl || '/images/iceman-perfil.png',
    logoUrl: profile.logoUrl || (profile.id === 'user-iceman-admin' || profile.nickname === 'ICEMAN' ? '/logos/logo-iceman-card.png' : undefined),
    nationality: profile.nationality || 'Argentina',
    countryCode: profile.countryCode || 'AR',
    province: profile.province,
    city: profile.city,
    club: (profile as any).club || 'Darderos Mar del Plata',
    avg: profile.stats.overallAvg || profile.estimatedAvg || 48.0,
    category: profile.category,
    matchesWon: profile.stats.matchesWon || 0,
    matchesTotal: profile.stats.matchesPlayed || 0,
    count180s: profile.stats.count180s || 0,
    highestCheckout: profile.stats.highestCheckout || 0,
    isVerified: profile.isVerified,
    nationalRank: 1,
    nationalPoints: 0,
    mdqLeagueRank: 1,
    mdqLeaguePoints: 0,
    dartBrand: 'TARGET 90%',
    dartWeight: profile.preferredDartWeight || 24,
    bestLeg: profile.stats.bestLegDarts || 0
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Selector de Pestañas en Gris Oscuro */}
      <div className="flex flex-wrap items-center justify-between bg-[#1c1f2b] border border-[#313647] p-2 rounded-2xl gap-2">
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

        <div className="flex items-center gap-2">
          {/* Botón de acceso rápido para ICEMAN */}
          {!isProfileAdmin && (
            <button
              type="button"
              onClick={handleSwitchToIceman}
              className="px-3 py-1.5 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/40 text-xs font-black flex items-center gap-1.5 transition-all"
              title="Iniciar sesión como ICEMAN (Superadministrador)"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login ICEMAN (Admin)</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-[#00b853] px-3 font-bold bg-[#14161f] border border-[#313647] rounded-xl py-1.5">
            <span className="text-base select-none">{flag}</span>
            <ShieldCheck className="w-4 h-4" />
            <span>
              {profile.countryCode === 'AR' || !profile.countryCode
                ? 'Jugador Federado Argentino'
                : `Jugador Internacional (${profile.nationality})`}
            </span>
          </div>
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
                    src={profile.avatarUrl || '/logos/logo-mdq.png'}
                    alt={profile.nickname}
                    fill
                    className="object-contain p-2"
                  />
                  <span className="absolute bottom-1 right-1 text-xl select-none" title={profile.nationality || 'Argentina'}>
                    {flag}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-3xl select-none" title={profile.nationality || 'Argentina'}>
                      {flag}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {profile.nickname}
                    </h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg border bg-[#00b853]/20 text-[#00b853] border-[#00b853]/40">
                      {currentCategoryInfo.label}
                    </span>
                    {isProfileAdmin && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#ef4444] text-white flex items-center gap-1 shadow-md shadow-[#ef4444]/30">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        ADMINISTRADOR FULL
                      </span>
                    )}
                    {profile.isVerified && (
                      <span className="text-[#00b853] flex items-center gap-1 text-xs font-black bg-[#00b853]/15 px-2 py-0.5 rounded-md border border-[#00b853]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <p className="text-[#efe7d8] font-medium text-sm flex flex-wrap items-center gap-2">
                    <span>{profile.fullName}</span>
                    <span className="text-[#313647]">•</span>
                    <span className="flex items-center gap-1.5 text-white font-bold text-xs bg-[#14161f] px-2.5 py-0.5 rounded-lg border border-[#313647]">
                      <span className="text-sm select-none">{flag}</span>
                      <span>{profile.nationality || 'Argentina'}</span>
                    </span>
                    <span className="text-[#313647]">•</span>
                    <span className="flex items-center gap-1 text-[#b8ad98] text-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#00b853]" />
                      {profile.city}{profile.province ? `, ${profile.province}` : ''}
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

          {/* Carta Coleccionable Oficial Ultimate Darts del Jugador */}
          <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" />
                <span>Colección Oficial Ultimate Darts 2026</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Tu Carta Coleccionable Oficial
              </h3>
              <p className="text-sm text-[#b8ad98] leading-relaxed">
                Esta es tu tarjeta oficial de competición en el circuito federado. Cuenta con silueta de escudo coleccionable, bandera nacional, registro de 180s y tus atributos deportivos sincronizados en tiempo real.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="px-3 py-1 rounded-xl bg-[#14161f] border border-[#313647] text-xs font-bold text-[#efe7d8] flex items-center gap-1.5">
                  <span className="text-base select-none">{flag}</span>
                  <span>{profile.nationality || 'Argentina'}</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#00b853]/15 border border-[#00b853]/30 text-xs font-bold text-[#00b853] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Darderos Mar del Plata Oficial</span>
                </span>
              </div>

              {/* UPLOADER DE FOTO OFICIAL CON FONDO TRANSPARENTE Y FORMATEO AUTOMÁTICO */}
              <div className="p-4 rounded-2xl bg-[#14161f] border border-amber-400/40 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Foto Oficial para tu Carta Ultimate Darts
                  </span>
                </div>
                <p className="text-[11px] text-[#b8ad98] leading-relaxed">
                  Para que tu carta luzca profesional al estilo PDC, sube tu foto en formato <strong className="text-amber-400 font-black">PNG con fondo transparente</strong> (sin fondo). El sistema la formateará automáticamente al tamaño exacto de la tarjeta (400x520 px).
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0d0e12] font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-400/20 active:scale-95">
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{uploadingPhoto ? 'Procesando en canvas...' : 'Subir Foto PNG Transparente'}</span>
                    <input
                      type="file"
                      accept="image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                  </label>

                  {customPhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl bg-[#242836] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center flex-shrink-0">
              <UltimateDartsCard player={currentUserCardData} showActions={false} />
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
                  / {profile.stats.matchesPlayed} PJ ({profile.stats.matchesPlayed > 0 ? ((profile.stats.matchesWon / profile.stats.matchesPlayed) * 100).toFixed(0) : 0}% Win)
                </span>
              </div>
              <div className="w-full bg-[#14161f] h-2 rounded-full mt-2 overflow-hidden border border-[#313647]">
                <div
                  className="bg-[#00b853] h-full rounded-full"
                  style={{ width: `${profile.stats.matchesPlayed > 0 ? (profile.stats.matchesWon / profile.stats.matchesPlayed) * 100 : 0}%` }}
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
              <p className="text-[10px] text-[#b8ad98]/70 mt-1">Mejor Leg: {profile.stats.bestLegDarts} dardos</p>
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
              <div className="p-6 rounded-2xl bg-[#14161f] border border-[#313647] text-center space-y-2">
                <Target className="w-8 h-8 text-[#00b853] mx-auto opacity-70" />
                <span className="text-xs font-bold text-[#efe7d8] block">Sin partidas disputadas aún</span>
                <p className="text-[11px] text-[#b8ad98] max-w-xs mx-auto leading-relaxed">
                  Tus estadísticas están en 0. Al disputar partidas en el anotador oficial o en torneos, tu evolución histórica se registrará automáticamente aquí.
                </p>
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
            <div className="mb-4 p-3.5 rounded-2xl bg-[#14161f] border border-amber-500/40 flex items-start gap-3">
              <Camera className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-white block font-black uppercase tracking-wider">
                  Configuración de Foto de Perfil & Tarjeta Coleccionable
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  Recordá que para la tarjeta de jugador, <span className="text-amber-400 font-bold">el fondo de la foto debe ser transparente</span> (PNG sin fondo recortado). Podés cambiar tu foto oficial desde la pestaña <em>Perfil & Estadísticas</em>.
                </p>
              </div>
            </div>

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
                  placeholder="Ej: Mariano Deux"
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

              {/* Nacionalidad y Bandera Oficial */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00b853]" />
                  <span>Nacionalidad Oficial & Bandera</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-11 rounded-xl bg-[#14161f] border border-[#00b853]/40 flex items-center justify-center text-2xl select-none flex-shrink-0 shadow-sm">
                    {getCountryFlag(countryCode || nationality)}
                  </div>
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      const sel = COUNTRIES.find((c) => c.code === e.target.value);
                      if (sel) {
                        setCountryCode(sel.code);
                        setNationality(sel.name);
                      }
                    }}
                    className="flex-1 bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#efe7d8] block mb-1 uppercase">
                  Provincia {countryCode === 'AR' ? '(Argentina)' : '/ Región'}
                </label>
                {countryCode === 'AR' ? (
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
                ) : (
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00b853]"
                    placeholder="Región o Estado"
                  />
                )}
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
