'use client';

import React, { useState, useEffect } from 'react';
import { PlayerProfile, PlayerCategory } from '@/lib/types';
import { 
  PROVINCIAS_ARGENTINA, 
  calculateCategory, 
  CATEGORY_DETAILS, 
  MOCK_CURRENT_USER, 
  USER_ICEMAN,
  DEFAULT_NEW_PLAYER,
  COUNTRIES, 
  getCountryFlag 
} from '@/lib/constants';
import { getCurrentPlayerProfile, saveCurrentPlayerProfile } from '@/lib/storage';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  User, 
  MapPin, 
  Trophy, 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Globe, 
  Sparkles,
  Camera,
  Crown
} from 'lucide-react';

export const OnboardingProfileModal: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('Argentina');
  const [countryCode, setCountryCode] = useState('AR');
  const [province, setProvince] = useState('Buenos Aires');
  const [city, setCity] = useState('Mar del Plata');
  const [estimatedAvg, setEstimatedAvg] = useState<number>(40.0);
  const [preferredWeight, setPreferredWeight] = useState<number>(24);
  const [dartBrand, setDartBrand] = useState<string>('TARGET 90%');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializar perfil desde storage
  useEffect(() => {
    setIsMounted(true);
    const loaded = getCurrentPlayerProfile(DEFAULT_NEW_PLAYER);
    setProfile(loaded);
    if (loaded) {
      if (loaded.fullName) setFullName(loaded.fullName);
      if (loaded.nickname) setNickname(loaded.nickname);
      if (loaded.email) setEmail(loaded.email);
      if (loaded.nationality) setNationality(loaded.nationality);
      if (loaded.countryCode) setCountryCode(loaded.countryCode);
      if (loaded.province) setProvince(loaded.province);
      if (loaded.city) setCity(loaded.city);
      if (loaded.estimatedAvg) setEstimatedAvg(loaded.estimatedAvg);
      if (loaded.preferredDartWeight) setPreferredWeight(loaded.preferredDartWeight);
      if (loaded.dartBrand) setDartBrand(loaded.dartBrand);
    }

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };
    window.addEventListener('lpld_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('lpld_profile_updated', handleProfileUpdate);
  }, []);

  if (!isMounted || !profile) return null;

  // Si el perfil ya fue completado, no mostrar el modal bloqueante
  if (profile.isProfileComplete === true) {
    return null;
  }

  const currentCategory = calculateCategory(estimatedAvg);
  const categoryInfo = CATEGORY_DETAILS[currentCategory];
  const flag = getCountryFlag(countryCode || nationality);

  const handleCountryChange = (name: string) => {
    setNationality(name);
    const found = COUNTRIES.find((c) => c.name === name);
    if (found) {
      setCountryCode(found.code);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Por favor, ingresa tu Nombre y Apellido.');
      return;
    }
    if (!nickname.trim()) {
      setErrorMsg('Por favor, ingresa tu Apodo / Nickname de jugador.');
      return;
    }

    setErrorMsg(null);
    const newCategory = calculateCategory(estimatedAvg);

    const completedProfile: PlayerProfile = {
      ...profile,
      id: profile.id && profile.id !== 'player-new-guest' ? profile.id : `player-${Date.now()}`,
      fullName: fullName.trim(),
      nickname: nickname.trim(),
      email: email.trim() || `${nickname.trim().toLowerCase().replace(/\s+/g, '')}@dardos.com.ar`,
      phone: phone.trim(),
      nationality,
      countryCode,
      province,
      city: city.trim() || 'Mar del Plata',
      estimatedAvg,
      category: newCategory,
      isVerified: true,
      isProfileComplete: true,
      preferredDartWeight: preferredWeight,
      dartBrand: dartBrand.trim(),
      role: 'PLAYER',
      stats: {
        ...(profile.stats || {}),
        overallAvg: estimatedAvg,
        first9Avg: estimatedAvg
      }
    };

    saveCurrentPlayerProfile(completedProfile);
    setProfile(completedProfile);
  };

  const handleAdminLogin = () => {
    saveCurrentPlayerProfile(USER_ICEMAN);
    setProfile(USER_ICEMAN);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f1422] border-2 border-[#00e676]/60 rounded-3xl shadow-2xl shadow-black p-5 sm:p-8 space-y-6 my-auto text-left relative overflow-hidden">
        {/* Halo decorativo de diana */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00e676]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera de Bienvenida */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40">
                <Target className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#00e676] bg-[#00e676]/10 px-2.5 py-0.5 rounded-full border border-[#00e676]/30">
                Paso Obligatorio • Primer Ingreso
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Completa tu Ficha Oficial de Jugador
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Para ingresar al anotador en vivo, competir en torneos y figurar en el ranking nacional, debes presentar tu ficha deportiva oficial.
            </p>
          </div>
          <div className="hidden sm:block flex-shrink-0">
            <BrandLogo size="sm" showText={false} />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fila 1: Nombre y Apodo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                Nombre y Apellido <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e676]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                Apodo / Nickname Deportivo <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej: El Tirador, Sniper, etc."
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e676]"
              />
            </div>
          </div>

          {/* Fila 2: Email y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuemail@ejemplo.com"
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e676]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                Teléfono / WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 223 ..."
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e676]"
              />
            </div>
          </div>

          {/* Fila 3: Nacionalidad y Provincia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00e676]" />
                Nacionalidad ({flag})
              </label>
              <select
                value={nationality}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e676]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ef4444]" />
                Provincia (Circuito Federal)
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e676]"
              >
                {PROVINCIAS_ARGENTINA.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 4: Promedio Estimado (AVG) con Slider y Categoría en Tiempo Real */}
          <div className="p-4 rounded-2xl bg-[#07090e] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-300">
                  Promedio Estimado (3 Darts AVG en 501)
                </span>
                <p className="text-[11px] text-slate-500">
                  El sistema te asignará una categoría inicial para torneos y rankings.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#00e676] font-mono">
                  {estimatedAvg.toFixed(1)}
                </span>
                <div className="text-[10px] font-black text-amber-400 uppercase">
                  {categoryInfo.label}
                </div>
              </div>
            </div>

            <input
              type="range"
              min="25"
              max="105"
              step="0.5"
              value={estimatedAvg}
              onChange={(e) => setEstimatedAvg(parseFloat(e.target.value))}
              className="w-full accent-[#00e676] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
              <span>Principiante (&lt; 45)</span>
              <span>Intermedia (45 - 60)</span>
              <span>Avanzada (60 - 80)</span>
              <span>Elite (&gt; 80)</span>
            </div>
          </div>

          {/* Fila 5: Equipamiento Oficial de Dardos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                Marca de Dardos
              </label>
              <input
                type="text"
                value={dartBrand}
                onChange={(e) => setDartBrand(e.target.value)}
                placeholder="Ej: TARGET 90%, WINMAU..."
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e676]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Peso de los Dardos
                </label>
                <span className="text-xs font-mono font-bold text-[#00e676]">{preferredWeight}g</span>
              </div>
              <input
                type="range"
                min="16"
                max="32"
                step="0.5"
                value={preferredWeight}
                onChange={(e) => setPreferredWeight(parseFloat(e.target.value))}
                className="w-full accent-[#00e676] cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Botón de Confirmación Principal */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-sm uppercase tracking-wider shadow-xl shadow-[#00e676]/25 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Guardar Ficha Oficial y Comenzar a Jugar</span>
          </button>
        </form>

        {/* Acceso para Administrador Mariano Deux */}
        <div className="pt-4 border-t border-[#1e2638] flex items-center justify-between text-xs">
          <span className="text-slate-500">¿Eres el administrador de la plataforma?</span>
          <button
            type="button"
            onClick={handleAdminLogin}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors underline underline-offset-4"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Iniciar sesión como ICEMAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
