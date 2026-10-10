'use client';

import React, { useState } from 'react';
import { MOCK_RANKINGS, MOCK_CURRENT_USER } from '@/lib/constants';
import { WebcamSetupModal } from './WebcamSetupModal';
import { 
  User, 
  Lock, 
  Video, 
  Calendar, 
  ShieldCheck, 
  Check, 
  X,
  Settings2
} from 'lucide-react';

interface PlayerEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollPlayer: (playerData: { name: string; pin: string; useWebcam: boolean }) => void;
}

export const PlayerEnrollModal: React.FC<PlayerEnrollModalProps> = ({
  isOpen,
  onClose,
  onEnrollPlayer
}) => {
  const [selectedPlayerName, setSelectedPlayerName] = useState(MOCK_CURRENT_USER.fullName);
  const [pin, setPin] = useState('1234');
  const [useWebcam, setUseWebcam] = useState(true);
  const [showWebcamModal, setShowWebcamModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerName.trim()) return;

    onEnrollPlayer({
      name: selectedPlayerName,
      pin,
      useWebcam
    });
    onClose();
  };

  const currentDateString = new Date().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-[#07090e] border border-[#ef4444]/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/95 space-y-4"
        >
          {/* Cabecera idéntica a la captura */}
          <div className="bg-[#0f1422] border-b border-[#ef4444]/20 px-5 py-3.5 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <h2 className="text-base font-black text-white tracking-wide">
              Configuración de participación
            </h2>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-xs border border-[#00e676] transition-colors"
            >
              Hecho
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Nombre del jugador / equipo */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase block">
                Nombre del jugador / equipo *
              </label>
              <select
                value={selectedPlayerName}
                onChange={(e) => setSelectedPlayerName(e.target.value)}
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              >
                <option value={MOCK_CURRENT_USER.fullName}>
                  {MOCK_CURRENT_USER.fullName} (@{MOCK_CURRENT_USER.nickname})
                </option>
                {MOCK_RANKINGS.map((p) => (
                  <option key={p.id} value={p.fullName}>
                    {p.fullName} (@{p.nickname}) • AVG {p.estimatedAvg}
                  </option>
                ))}
                <option value="Invitado / Nuevo Jugador">+ Inscribir con nombre personalizado</option>
              </select>
            </div>

            {selectedPlayerName === 'Invitado / Nuevo Jugador' && (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Escribí el nombre del jugador o equipo"
                  onChange={(e) => setSelectedPlayerName(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
                />
              </div>
            )}

            {/* Contraseña de participante */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase block">
                Contraseña de participante *
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Clave numérica (ej: 1234)"
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              />
              <p className="text-[10px] text-slate-500">
                Evita que otro jugador anote por vos en las pistas abiertas
              </p>
            </div>

            {/* Opciones de webcam */}
            <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWebcam}
                  onChange={(e) => setUseWebcam(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
                />
                <span className="text-xs font-bold text-white">Usar webcam (para juego online)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowWebcamModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#07090e] hover:bg-[#151a26] border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Video className="w-4 h-4 text-[#00e676]" />
                <span>Configuración de la webcam</span>
              </button>
            </div>

            {/* Fecha y hora */}
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Fecha y hora: <strong className="text-white">{currentDateString}</strong></span>
            </div>
          </div>
        </form>
      </div>

      <WebcamSetupModal
        isOpen={showWebcamModal}
        onClose={() => setShowWebcamModal(false)}
      />
    </>
  );
};
