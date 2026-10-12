'use client';

import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '@/lib/types';
import { 
  getCurrentPlayerProfile, 
  saveCurrentPlayerProfile, 
  getLastPlayerProfile,
  clearCurrentPlayerSession
} from '@/lib/storage';
import { getCountryFlag, validateAdminCredentials, USER_ICEMAN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { 
  LogIn, 
  User, 
  Search, 
  X, 
  ArrowRight, 
  Lock, 
  UserPlus,
  Smartphone,
  Mail,
  CheckCircle2,
  Loader2,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const [activeTab, setActiveTab] = useState<'MAGIC_LINK' | 'DEVICE'>('MAGIC_LINK');
  const [devicePlayer, setDevicePlayer] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login de Superadmin por clave maestra
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Flujo Magic Link + OTP
  const [magicEmail, setMagicEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [magicStep, setMagicStep] = useState<'INPUT_EMAIL' | 'INPUT_OTP'>('INPUT_EMAIL');
  const [magicStatusMsg, setMagicStatusMsg] = useState<string | null>(null);
  const [magicErrorMsg, setMagicErrorMsg] = useState<string | null>(null);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  // Búsqueda por Apodo para recuperar cuenta por correo
  const [searchNickname, setSearchNickname] = useState('');
  const [searchedProfile, setSearchedProfile] = useState<PlayerProfile | null>(null);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const stored = getLastPlayerProfile();
      setDevicePlayer(stored);
      if (stored && stored.nickname) {
        setActiveTab('DEVICE');
      } else {
        setActiveTab('MAGIC_LINK');
      }
      setShowAdminPasswordPrompt(false);
      setAdminPasswordInput('');
      setAdminError(null);
      setMagicErrorMsg(null);
      setMagicStatusMsg(null);
      setMagicStep('INPUT_EMAIL');
      setOtpCode('');
      setSearchedProfile(null);
      setSearchStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Confirmar clave de administrador local para Mariano Deux (ICEMAN)
  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateAdminCredentials('marianodeux@gmail.com', adminPasswordInput);
    if (!isValid) {
      setAdminError('Contraseña incorrecta. Acceso exclusivo para el administrador Mariano Deux.');
      return;
    }

    saveCurrentPlayerProfile(USER_ICEMAN);
    setShowAdminPasswordPrompt(false);
    onClose();
  };

  // 1. Enviar Enlace Mágico / Código OTP por Email
  const handleSendMagicLink = async (e: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const email = (directEmail || magicEmail).trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setMagicErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Caso especial para Mariano Deux (ICEMAN): ofrecer clave maestra directa
    if (email === 'marianodeux@gmail.com' && !directEmail) {
      setShowAdminPasswordPrompt(true);
      return;
    }

    setIsMagicLoading(true);
    setMagicErrorMsg(null);
    setMagicStatusMsg(null);

    try {
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback` 
        : 'https://locosporlosdardos.com.ar/auth/callback';

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        throw error;
      }

      setMagicEmail(email);
      setMagicStep('INPUT_OTP');
      setMagicStatusMsg(`¡Código enviado! Revisa tu correo (${email}). Ingresa los 6 números aquí para entrar.`);
    } catch (err: any) {
      console.error('[Magic Link Error]:', err);
      setMagicErrorMsg(err.message || 'No se pudo enviar el correo de acceso. Intenta nuevamente.');
    } finally {
      setIsMagicLoading(false);
    }
  };

  // 2. Verificar Código OTP de 6 dígitos
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = magicEmail.trim().toLowerCase();
    const token = otpCode.trim();

    if (!token || token.length < 6) {
      setMagicErrorMsg('Ingresa el código numérico de 6 dígitos.');
      return;
    }

    setIsMagicLoading(true);
    setMagicErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        throw error;
      }

      // Usuario autenticado exitosamente en Supabase Auth
      // Sincronizar su ficha deportiva desde la base de datos
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'LOGIN', identifier: email })
        });
        const profData = await res.json();
        if (profData.success && profData.profile) {
          saveCurrentPlayerProfile(profData.profile);
        } else {
          // Si el email no tiene ficha creada aún, inicializar una ficha limpia
          saveCurrentPlayerProfile({
            id: data.user?.id || `user-${Date.now()}`,
            email,
            nickname: email.split('@')[0].toUpperCase(),
            fullName: email.split('@')[0],
            category: 'INTERMEDIA',
            estimatedAvg: 45.0,
            isProfileComplete: false
          });
        }
      } catch (syncErr) {
        console.warn('Error syncing profile after OTP:', syncErr);
      }

      onClose();
    } catch (err: any) {
      console.error('[Verify OTP Error]:', err);
      setMagicErrorMsg(err.message || 'Código incorrecto o vencido. Por favor intenta de nuevo.');
    } finally {
      setIsMagicLoading(false);
    }
  };

  // Buscar por apodo para recuperar email seguro
  const handleSearchNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    const nick = searchNickname.trim();
    if (!nick) return;

    setIsLoading(true);
    setSearchStatus(null);
    setSearchedProfile(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOGIN', identifier: nick })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setSearchedProfile(data.profile);
      } else {
        setSearchStatus('No se encontró ningún jugador con ese apodo en la base de datos.');
      }
    } catch {
      setSearchStatus('Error al consultar el servidor. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgetDevice = () => {
    clearCurrentPlayerSession();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lpld_last_player_v1');
    }
    setDevicePlayer(null);
    setActiveTab('MAGIC_LINK');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0f1422] border-2 border-[#1e2638] rounded-3xl shadow-2xl shadow-black p-5 sm:p-7 space-y-5 my-auto text-left relative overflow-hidden transition-colors">
        {/* Halo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e676]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[#1e2638] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00e676]/15 border border-[#00e676]/40 text-[#00e676] flex items-center justify-center shadow-md">
              <LogIn className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Acceso a tu Ficha de Jugador
              </h2>
              <p className="text-xs text-[#b8ad98]">
                Autenticación segura del Circuito Federal de Dardos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación por pestañas */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#14161f] border border-[#1e2638] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('MAGIC_LINK')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'MAGIC_LINK'
                ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#1a2333]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Código por Email</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DEVICE')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'DEVICE'
                ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#1a2333]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Este Dispositivo</span>
          </button>
        </div>

        {/* CONTENIDO 1: ACCESO SEGURO POR EMAIL (MAGIC LINK + OTP) */}
        {activeTab === 'MAGIC_LINK' && (
          <div className="space-y-4 py-1">
            {showAdminPasswordPrompt ? (
              <form onSubmit={handleAdminAuthSubmit} className="space-y-4 p-4 rounded-2xl bg-[#14161f] border border-amber-500/40">
                <div className="flex items-center gap-2 text-amber-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Acceso de Administrador (ICEMAN)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Ingresa tu contraseña de Superadministrador para entrar en este equipo:
                </p>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Contraseña Maestra..."
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-[#1c1f2b] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                {adminError && <p className="text-xs text-red-400 font-bold">{adminError}</p>}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPasswordPrompt(false);
                      handleSendMagicLink({ preventDefault: () => {} } as any, 'marianodeux@gmail.com');
                    }}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    O enviarme código OTP a mi email
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            ) : magicStep === 'INPUT_EMAIL' ? (
              <form onSubmit={handleSendMagicLink} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300">
                  <p className="font-bold text-white mb-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    Acceso protegido sin contraseñas
                  </p>
                  Escribe el email de tu ficha y te enviaremos un código numérico de 6 dígitos.
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Tu Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ej: tu.email@gmail.com"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    className="w-full bg-[#14161f] border border-[#313647] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00e676]"
                  />
                </div>

                {magicErrorMsg && (
                  <p className="text-xs text-red-400 font-bold">{magicErrorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={isMagicLoading || !magicEmail.trim()}
                  className="w-full py-3 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#00e676]/25 disabled:opacity-50 active:scale-98"
                >
                  {isMagicLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando código...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Código de Acceso</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-slate-300">
                  <p className="font-bold text-[#00e676] mb-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Código de 6 dígitos enviado
                  </p>
                  Revisa tu casilla ({magicEmail}) e ingresa los 6 números aquí:
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#14161f] border-2 border-[#00e676]/50 rounded-xl px-4 py-3 text-center text-xl font-black tracking-widest text-[#00e676] focus:outline-none focus:border-[#00e676]"
                  />
                </div>

                {magicErrorMsg && (
                  <p className="text-xs text-red-400 font-bold">{magicErrorMsg}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMagicStep('INPUT_EMAIL');
                      setMagicErrorMsg(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#1e2638] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                  >
                    Cambiar Email
                  </button>
                  <button
                    type="submit"
                    disabled={isMagicLoading || otpCode.length < 6}
                    className="flex-1 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isMagicLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <span>Verificar y Entrar</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Buscar cuenta por Apodo */}
            <div className="pt-3 border-t border-[#1e2638] space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                ¿No recuerdas con qué email te registraste?
              </span>
              <form onSubmit={handleSearchNickname} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tu apodo (ej: ZEUS)..."
                  value={searchNickname}
                  onChange={(e) => setSearchNickname(e.target.value)}
                  className="flex-1 bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || !searchNickname.trim()}
                  className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-black text-xs transition-all disabled:opacity-50"
                >
                  Buscar
                </button>
              </form>

              {searchStatus && (
                <p className="text-xs text-slate-400 font-bold">{searchStatus}</p>
              )}

              {searchedProfile && (
                <div className="p-3 rounded-2xl bg-[#14161f] border border-sky-500/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-white block">
                      @{searchedProfile.nickname} ({searchedProfile.fullName})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Email: {searchedProfile.email ? `${searchedProfile.email.slice(0, 3)}***@${searchedProfile.email.split('@')[1] || '...'}` : 'No configurado'}
                    </span>
                  </div>
                  {searchedProfile.email && (
                    <button
                      type="button"
                      onClick={() => handleSendMagicLink({ preventDefault: () => {} } as any, searchedProfile.email)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 text-black font-black text-xs hover:bg-sky-400"
                    >
                      Enviar código
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO 2: ESTE DISPOSITIVO */}
        {activeTab === 'DEVICE' && (
          <div className="space-y-4 py-1">
            {devicePlayer && devicePlayer.nickname ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#14161f] to-[#14161f] border-2 border-[#00e676]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-2xl bg-[#00e676]/20 border border-[#00e676]/50 text-[#00e676] flex items-center justify-center font-black text-sm flex-shrink-0">
                    {devicePlayer.nickname ? devicePlayer.nickname.slice(0, 2).toUpperCase() : 'PL'}
                    <span className="absolute -bottom-1 -right-1 text-xs">
                      {getCountryFlag(devicePlayer.countryCode || devicePlayer.nationality)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-[#00e676] uppercase tracking-wider flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      Sesión activa en este equipo
                    </span>
                    <span className="text-sm font-black text-white block truncate">
                      {devicePlayer.nickname} ({devicePlayer.fullName})
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      {devicePlayer.city || 'Mar del Plata'} • {devicePlayer.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      saveCurrentPlayerProfile(devicePlayer);
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00e676]/25 active:scale-95"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    title="Cerrar sesión en este equipo"
                    onClick={handleForgetDevice}
                    className="p-2.5 rounded-xl bg-[#1e2638] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-[#14161f] border border-[#1e2638] space-y-2">
                <Smartphone className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">
                  No hay ninguna cuenta guardada previamente en este equipo.
                </p>
                <p className="text-[11px] text-slate-500">
                  Ingresa con tu correo en la pestaña anterior para guardar tu sesión.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('MAGIC_LINK')}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#00e676] text-black font-black text-xs"
                >
                  Entrar con mi Email
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pie: Registro de nueva ficha */}
        <div className="pt-4 border-t border-[#1e2638] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            ¿Primera vez en la plataforma?
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenRegister) {
                onOpenRegister();
              } else if (typeof window !== 'undefined') {
                window.location.href = '/perfil';
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-[#1e2638] hover:bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40 font-black text-xs flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrar Nueva Ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
