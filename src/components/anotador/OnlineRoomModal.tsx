'use client';

import React, { useState, useEffect } from 'react';
import { MatchConfig, ParticipantPlayer, PlayerProfile } from '@/lib/types';
import { getCurrentPlayerProfile } from '@/lib/storage';
import { DEFAULT_NEW_PLAYER } from '@/lib/constants';
import { OnlineRoom, normalizeRoomCode } from '@/lib/online-rooms';
import { hostPeerRoom, joinPeerRoom, setActiveWebRtcHandler } from '@/lib/webrtc-room';
import { 
  Globe, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  X, 
  ArrowRight, 
  Loader2, 
  Flame, 
  Target,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMatchConfig: MatchConfig;
  onRoomReady: (room: OnlineRoom, localPlayerIndex: 0 | 1) => void;
  initialCode?: string;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  currentMatchConfig,
  onRoomReady,
  initialCode
}) => {
  const [tab, setTab] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [createdRoom, setCreatedRoom] = useState<OnlineRoom | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState(initialCode || '');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Obtener perfil del usuario actual logueado
  const activeProfile: PlayerProfile = getCurrentPlayerProfile(DEFAULT_NEW_PLAYER);
  const localPlayer: ParticipantPlayer = {
    id: activeProfile.id || `player-${Date.now()}`,
    name: activeProfile.fullName || 'Jugador Local',
    nickname: activeProfile.nickname || 'Jugador',
    avatarUrl: activeProfile.avatarUrl || activeProfile.photoUrl || '/images/iceman-perfil.png'
  };

  useEffect(() => {
    if (initialCode) {
      setTab('JOIN');
      setJoinCodeInput(initialCode.toUpperCase());
    }
  }, [initialCode]);

  // Sondeo para el creador esperando que se una el rival
  useEffect(() => {
    if (!createdRoom || createdRoom.status !== 'WAITING') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/salas?codigo=${createdRoom.code}`);
        const data = await res.json();
        if (data.success && data.room) {
          if (data.room.status === 'PLAYING' && data.room.player2) {
            clearInterval(interval);
            onRoomReady(data.room, 0); // Local es P1 (Host)
          }
        }
      } catch (err) {
        // Ignorar fallo de red puntual
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [createdRoom, onRoomReady]);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/salas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          hostPlayer: localPlayer,
          config: currentMatchConfig
        })
      });

      const data = await res.json();
      if (data.success && data.room) {
        setCreatedRoom(data.room);

        // Inicializar host WebRTC P2P en segundo plano para conexión directa instantánea
        try {
          const handler = await hostPeerRoom(
            data.room.code,
            localPlayer,
            currentMatchConfig,
            (readyRoom) => {
              onRoomReady(readyRoom, 0); // Local es P1 (Host)
            },
            () => {},
            (err) => console.log('[WebRTC Host Notice]:', err)
          );
          setActiveWebRtcHandler(handler);
        } catch (e) {
          console.warn('[WebRTC Init]: Fallback a API Polling activado.');
        }
      } else {
        setErrorMsg(data.error || 'No se pudo crear la sala.');
      }
    } catch (e: any) {
      setErrorMsg('Error de conexión al crear sala.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = normalizeRoomCode(joinCodeInput);
    if (!cleanCode) {
      setErrorMsg('Por favor ingresa un código de sala válido.');
      return;
    }

    setIsJoining(true);
    setErrorMsg(null);

    let joinedSuccess = false;

    // 1. Intento paralelo inmediato por WebRTC P2P
    try {
      const handler = await joinPeerRoom(
        cleanCode,
        localPlayer,
        (readyRoom) => {
          if (!joinedSuccess) {
            joinedSuccess = true;
            setActiveWebRtcHandler(handler);
            setIsJoining(false);
            onRoomReady(readyRoom, 1); // Local es P2 (Guest)
          }
        },
        () => {},
        (webrtcErr) => {
          console.log('[WebRTC Guest Notice]:', webrtcErr);
        }
      );
      if (handler) {
        setActiveWebRtcHandler(handler);
      }
    } catch (err) {
      // Ignorar, fallback a HTTP API
    }

    // 2. Consulta concurrente vía API REST
    try {
      const res = await fetch('/api/salas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'JOIN',
          code: cleanCode,
          guestPlayer: localPlayer
        })
      });

      const data = await res.json();
      if (data.success && data.room) {
        if (!joinedSuccess) {
          joinedSuccess = true;
          onRoomReady(data.room, 1); // Local es P2 (Guest)
        }
      } else {
        if (!joinedSuccess) {
          setErrorMsg(data.error || 'La sala especificada no está disponible o ya caducó.');
        }
      }
    } catch (e: any) {
      if (!joinedSuccess) {
        setErrorMsg('Error de conexión al intentar unirse a la sala.');
      }
    } finally {
      if (!joinedSuccess) {
        setIsJoining(false);
      }
    }
  };

  const roomLink = typeof window !== 'undefined' && createdRoom 
    ? `${window.location.origin}/anotador?sala=${createdRoom.code}` 
    : '';

  const handleCopyLink = () => {
    if (!roomLink) return;
    navigator.clipboard.writeText(roomLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const shareWhatsAppText = createdRoom
    ? encodeURIComponent(
        `🎯 ¡Hola! Te invito a jugar una partida online de dardos en Locos por los Dardos.\n\n🔗 Conéctate directamente aquí: ${roomLink}\nO ingresa el Código de Sala: ${createdRoom.code}`
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0f1422] border-2 border-[#0284c7]/50 rounded-3xl p-5 sm:p-7 space-y-5 text-left relative shadow-2xl shadow-black overflow-hidden">
        {/* Halo decorativo de sala */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0284c7]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2638]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0284c7]/20 rounded-xl border border-[#0284c7]/40 text-[#38bdf8]">
              <Globe className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Partida en Sala Online (1 vs 1)
              </h2>
              <p className="text-xs text-slate-400">
                Conéctate a distancia dardo a dardo en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-400 text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tabs de Crear vs Unirse */}
        {!createdRoom && (
          <div className="grid grid-cols-2 gap-2 bg-[#07090e] p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setTab('CREATE');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                tab === 'CREATE'
                  ? 'bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Sala
            </button>
            <button
              onClick={() => {
                setTab('JOIN');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                tab === 'JOIN'
                  ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unirse a Sala
            </button>
          </div>
        )}

        {/* VISTA 1: CREAR SALA */}
        {tab === 'CREATE' && !createdRoom && (
          <div className="space-y-4">
            <div className="bg-[#07090e] p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Configuración del Partido
              </span>
              <div className="flex items-center justify-between text-sm font-black text-white">
                <span>Modo: {currentMatchConfig.gameType}</span>
                <span className="text-[#00e676]">{currentMatchConfig.startingScore} pts</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Distancia: Al mejor de {currentMatchConfig.bestOfLegs} legs</span>
                <span>Salida: {currentMatchConfig.outMode === 'DOUBLE_OUT' ? 'Doble Out' : 'Simple'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#111622] rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-slate-700 flex items-center justify-center font-black text-[#00e676] text-xs">
                {localPlayer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white">Anfitrión: {localPlayer.name}</div>
                <div className="text-[11px] text-slate-400">@{localPlayer.nickname} • Tú (Jugador 1)</div>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#0284c7]/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando Sala...</span>
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  <span>Generar Sala Online y Obtener Código</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* VISTA 1.B: SALA CREADA (ESPERANDO RIVAL) */}
        {createdRoom && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center p-4 bg-[#07090e] border border-[#0284c7]/40 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-[#38bdf8] uppercase tracking-widest block">
                Código Oficial de Sala
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest select-all">
                {createdRoom.code}
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#00e676]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Código Copiado' : 'Copiar Código'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00e676]" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Enlace Copiado' : 'Copiar Enlace'}</span>
                </button>
              </div>
            </div>

            {/* Botón WhatsApp directo */}
            <a
              href={`https://wa.me/?text=${shareWhatsAppText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-[#07090e] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-transform active:scale-95 text-center"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>Invitar Contrincante por WhatsApp</span>
            </a>

            {/* Spinner esperando rival */}
            <div className="p-3 bg-[#111622] rounded-xl border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 text-[#38bdf8] animate-spin flex-shrink-0" />
              <span>
                Esperando que tu contrincante ingrese con su usuario... La partida iniciará automáticamente.
              </span>
            </div>
          </div>
        )}

        {/* VISTA 2: UNIRSE A SALA */}
        {tab === 'JOIN' && !createdRoom && (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                Código de Sala
              </label>
              <input
                type="text"
                required
                value={joinCodeInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s+/g, '').toUpperCase();
                  setJoinCodeInput(val);
                }}
                placeholder="Ej: DART-RYZD o RYZD"
                className="w-full bg-[#07090e] border-2 border-slate-700 focus:border-[#00e676] rounded-2xl px-4 py-3 text-lg font-mono font-black text-white text-center tracking-widest placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-[#111622] rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-black border border-slate-700 flex items-center justify-center font-black text-[#00e676] text-xs">
                {localPlayer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white">Te unirás como: {localPlayer.name}</div>
                <div className="text-[11px] text-slate-400">@{localPlayer.nickname} • Jugador 2 (Rival)</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-4 rounded-2xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-sm uppercase tracking-wider shadow-xl shadow-[#00e676]/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Conectando a la Sala...</span>
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  <span>Conectarme a la Partida</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
