'use client';

import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '@/lib/types';
import { 
  getCurrentPlayerProfile, 
  saveCurrentPlayerProfile, 
  fetchRegisteredPlayersFromCloud,
  getLastPlayerProfile,
  getRecentAccounts 
} from '@/lib/storage';
import { getCountryFlag, validateAdminCredentials, USER_ICEMAN } from '@/lib/constants';
import { 
  LogIn, 
  User, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  X, 
  ArrowRight, 
  Lock, 
  UserPlus,
  Smartphone,
  History
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const [lastPlayer, setLastPlayer] = useState<PlayerProfile | null>(null);
  const [recentAccounts, setRecentAccounts] = useState<PlayerProfile[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<PlayerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [selectedAdminToAuth, setSelectedAdminToAuth] = useState<PlayerProfile | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setLastPlayer(getLastPlayerProfile());
      setRecentAccounts(getRecentAccounts());
      loadPlayers();
      setSearchError(null);
      setAdminError(null);
      setSelectedAdminToAuth(null);
    }
  }, [isOpen]);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const players = await fetchRegisteredPlayersFromCloud();
      if (players && players.length > 0) {
        setRegisteredPlayers(players);
      } else {
        setRegisteredPlayers([USER_ICEMAN]);
      }
    } catch {
      setRegisteredPlayers([USER_ICEMAN]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Manejar selección de cuenta
  const handleSelectPlayer = (player: PlayerProfile) => {
    // Si la cuenta es de Mariano Deux / ICEMAN (Admin), requiere contraseña maestra
    if (player.email?.toLowerCase() === 'marianodeux@gmail.com' || player.nickname?.toUpperCase() === 'ICEMAN') {
      setSelectedAdminToAuth(player);
      setAdminPasswordInput('');
      setAdminError(null);
      return;
    }

    // Para cualquier otro jugador de la comunidad
    saveCurrentPlayerProfile(player);
    onClose();
  };

  // Confirmar clave de administrador
  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminToAuth) return;

    const isValid = validateAdminCredentials(selectedAdminToAuth.email, adminPasswordInput);
    if (!isValid) {
      setAdminError('Contraseña incorrecta. Acceso exclusivo para el administrador Mariano Deux.');
      return;
    }

    saveCurrentPlayerProfile(selectedAdminToAuth);
    setSelectedAdminToAuth(null);
    onClose();
  };

  // Buscar por email o nickname contra la API de Supabase
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    setIsLoading(true);
    setSearchError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOGIN', identifier: query })
      });

      const data = await res.json();
      if (data.success && data.profile) {
        handleSelectPlayer(data.profile);
      } else {
        setSearchError(data.error || 'No se encontró ningún jugador registrado con ese correo o apodo.');
      }
    } catch (err: any) {
      setSearchError('Error de conexión con el servidor. Por favor, reintenta en unos instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0f1422] border-2 border-[#1e2638] hover:border-[#00e676]/40 rounded-3xl shadow-2xl shadow-black p-5 sm:p-7 space-y-5 my-auto text-left relative overflow-hidden transition-colors">
        {/* Halo de fondo decorativo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00e676]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-[#1e2638] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00e676]/15 border border-[#00e676]/40 text-[#00e676] flex items-center justify-center shadow-md">
              <LogIn className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Iniciar Sesión / Cambiar Jugador
              </h2>
              <p className="text-xs text-[#b8ad98]">
                Selecciona tu perfil o ingresa con tu correo / apodo.
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

        {/* Sub-modal: Validación de Contraseña para Mariano Deux (ICEMAN) */}
        {selectedAdminToAuth ? (
          <form onSubmit={handleAdminAuthSubmit} className="space-y-4 p-4 rounded-2xl bg-[#14161f] border border-amber-500/40">
            <div className="flex items-center gap-2 text-amber-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">
                Verificación de Administrador ({selectedAdminToAuth.nickname})
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Ingresa la contraseña maestra para habilitar la sesión de administración de <strong>Mariano Deux</strong>.
            </p>
            <div>
              <input
                type="password"
                required
                autoFocus
                placeholder="Contraseña Maestra..."
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-[#1c1f2b] border border-[#313647] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            {adminError && (
              <p className="text-xs text-red-400 font-bold">{adminError}</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAdminToAuth(null)}
                className="px-4 py-2 rounded-xl bg-[#242836] text-slate-300 text-xs font-bold hover:text-white"
              >
                Volver
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all shadow-md"
              >
                Acceder a ICEMAN
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* 1. TARJETA DESTACADA: ÚLTIMO JUGADOR EN ESTE DISPOSITIVO */}
            {lastPlayer && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#14161f] to-[#14161f] border-2 border-[#00e676]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-2xl bg-[#00e676]/20 border border-[#00e676]/50 text-[#00e676] flex items-center justify-center font-black text-sm flex-shrink-0">
                    {lastPlayer.nickname ? lastPlayer.nickname.slice(0, 2).toUpperCase() : 'PL'}
                    <span className="absolute -bottom-1 -right-1 text-xs">
                      {getCountryFlag(lastPlayer.countryCode || lastPlayer.nationality)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-[#00e676] uppercase tracking-wider flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      Último jugador en este celular
                    </span>
                    <span className="text-sm font-black text-white block truncate">
                      {lastPlayer.nickname || lastPlayer.fullName}
                    </span>
                    <span className="text-xs text-slate-400 block truncate">
                      {lastPlayer.city || 'Mar del Plata'} • {lastPlayer.category}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlayer(lastPlayer)}
                  className="px-4 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#00e676]/25 active:scale-95 flex-shrink-0"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )}

            {/* 2. PERFILES REGISTRADOS EN LA COMUNIDAD */}
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#00e676]" />
                Perfiles Registrados en el Circuito ({registeredPlayers.length})
              </span>

              {isLoading && registeredPlayers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Cargando perfiles desde Supabase...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {registeredPlayers.map((player) => (
                    <button
                      key={player.id || player.nickname}
                      type="button"
                      onClick={() => handleSelectPlayer(player)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#14161f] border border-[#1e2638] hover:border-[#00e676]/60 hover:bg-[#1a2333] transition-all text-left group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00e676] flex items-center justify-center font-black text-xs flex-shrink-0">
                          {player.nickname ? player.nickname.slice(0, 2).toUpperCase() : 'PL'}
                          <span className="absolute -bottom-1 -right-1 text-[10px]">
                            {getCountryFlag(player.countryCode || player.nationality)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-white block truncate group-hover:text-[#00e676] transition-colors">
                            {player.nickname || player.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {player.city} • {player.category}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e676] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. BÚSQUEDA POR EMAIL O APODO */}
            <form onSubmit={handleSearchSubmit} className="space-y-2 pt-2 border-t border-[#1e2638]">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                Buscar Otra Cuenta Registrada
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ingresa tu Email o Apodo (ej: ZEUS)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 bg-[#14161f] border border-[#313647] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || !searchInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-black text-xs transition-all disabled:opacity-50"
                >
                  Buscar
                </button>
              </div>
              {searchError && (
                <p className="text-xs text-red-400 font-bold">{searchError}</p>
              )}
            </form>

            {/* 4. BOTÓN PARA CREAR NUEVO JUGADOR */}
            <div className="pt-2 border-t border-[#1e2638] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                ¿No estás en la lista?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenRegister) onOpenRegister();
                }}
                className="px-4 py-2 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00e676]/20 active:scale-95"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Registrar Nueva Ficha</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
