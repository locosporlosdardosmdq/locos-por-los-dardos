'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TournamentBracketMatch, PlayerProfile } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { X, UserPlus, Zap, Trash2, Search, CheckCircle2, ShieldCheck, User } from 'lucide-react';

interface EnrolledPlayerItem {
  id: string;
  name: string;
  nickname?: string;
  avatarUrl?: string;
  seed?: number;
  avg?: number;
  nationality?: string;
  countryCode?: string;
}

interface SlotAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: TournamentBracketMatch | null;
  slotIndex: 1 | 2;
  enrolledPlayers: EnrolledPlayerItem[];
  communityPlayers?: PlayerProfile[];
  onAssign: (choice: { player?: any; isBye?: boolean; isClear?: boolean }) => void;
}

export const SlotAssignModal: React.FC<SlotAssignModalProps> = ({
  isOpen,
  onClose,
  match,
  slotIndex,
  enrolledPlayers,
  communityPlayers = [],
  onAssign
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ENROLLED' | 'COMMUNITY' | 'CUSTOM'>('ENROLLED');
  const [customName, setCustomName] = useState('');
  const [customAvg, setCustomAvg] = useState(45);

  if (!isOpen || !match) return null;

  const currentSlotPlayer = slotIndex === 1 ? match.player1 : match.player2;
  const opposingSlotPlayer = slotIndex === 1 ? match.player2 : match.player1;

  const filteredEnrolled = enrolledPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCommunity = communityPlayers.filter((p) =>
    (p.fullName && p.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectPlayer = (player: any) => {
    onAssign({ player });
    onClose();
  };

  const handleAssignBye = () => {
    onAssign({ isBye: true });
    onClose();
  };

  const handleClearSlot = () => {
    onAssign({ isClear: true });
    onClose();
  };

  const handleAssignCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAssign({
      player: {
        id: `guest-${Date.now()}`,
        name: customName.trim(),
        nickname: customName.trim(),
        avatarUrl: '/logos/logo-mdq.png',
        avg: customAvg,
        nationality: 'Argentina',
        countryCode: 'AR'
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101d] border-2 border-blue-500/40 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-blue-500/10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#080c16]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Asignación de Slot (Nakka N01)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Slot {slotIndex}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Partido #{match.matchIndex + 1} • {match.note || 'Ronda 1'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estado actual del slot y Acciones Rápidas */}
        <div className="p-4 bg-[#0d1424] border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Estado actual del Slot {slotIndex}:</span>
            {currentSlotPlayer ? (
              <span className="text-white font-black flex items-center gap-1.5 bg-[#111827] px-2.5 py-1 rounded-xl border border-slate-700">
                <span>{getCountryFlag(currentSlotPlayer.countryCode || currentSlotPlayer.nationality || 'AR')}</span>
                <span>{currentSlotPlayer.name}</span>
              </span>
            ) : (
              <span className="text-amber-400 font-bold italic bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
                Vacante / Por definir
              </span>
            )}
          </div>

          {opposingSlotPlayer && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>Rival (Slot {slotIndex === 1 ? 2 : 1}):</span>
              <strong className="text-slate-200">{opposingSlotPlayer.name}</strong>
            </div>
          )}

          {/* Botones de acción directa tipo Nakka */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleAssignBye}
              className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Asigna Pase Libre (BYE). Si el rival está en el otro slot, avanzará automáticamente a la siguiente ronda."
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Pase Libre (BYE)</span>
            </button>

            <button
              type="button"
              onClick={handleClearSlot}
              className="py-2 px-3 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444]/25 border border-[#ef4444]/40 text-[#ef4444] font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              title="Desocupa este slot y lo deja vacío ('Por definir')"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Desocupar Slot</span>
            </button>
          </div>
        </div>

        {/* Selector de pestañas */}
        <div className="flex border-b border-slate-800 bg-[#070a14] px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ENROLLED')}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'ENROLLED'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Inscriptos ({enrolledPlayers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMMUNITY')}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'COMMUNITY'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Comunidad LPD
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CUSTOM')}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'CUSTOM'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            + Invitado Manual
          </button>
        </div>

        {/* Buscador para listas */}
        {activeTab !== 'CUSTOM' && (
          <div className="p-3 bg-[#090e1c] border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre o apodo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Lista de Jugadores */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'ENROLLED' && (
            <>
              {filteredEnrolled.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No hay inscriptos que coincidan con la búsqueda.
                </div>
              ) : (
                filteredEnrolled.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl bg-[#0f1627] border border-slate-800/80 hover:border-blue-500/50 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs select-none">
                        {getCountryFlag(p.countryCode || p.nationality || 'AR')}
                      </span>
                      {p.avatarUrl ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black">
                          <Image src={p.avatarUrl} alt={p.name} fill className="object-contain" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-xs flex items-center justify-center font-bold text-slate-400">
                          {p.name.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-black text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400">
                          @{p.nickname || p.name} {p.avg ? `• AVG ${p.avg}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPlayer(p)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      Asignar
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'COMMUNITY' && (
            <>
              {filteredCommunity.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No hay jugadores registrados en la comunidad que coincidan.
                </div>
              ) : (
                filteredCommunity.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl bg-[#0f1627] border border-slate-800/80 hover:border-blue-500/50 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs select-none">
                        {getCountryFlag(p.countryCode || p.nationality || 'AR')}
                      </span>
                      {p.avatarUrl ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black">
                          <Image src={p.avatarUrl} alt={p.fullName} fill className="object-contain" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-xs flex items-center justify-center font-bold text-slate-400">
                          {p.fullName.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-black text-white">{p.fullName}</div>
                        <div className="text-[10px] text-slate-400">
                          @{p.nickname} • AVG {p.estimatedAvg || 45}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPlayer({
                        id: p.id,
                        name: p.fullName,
                        nickname: p.nickname,
                        avatarUrl: p.avatarUrl,
                        avg: p.estimatedAvg || 45,
                        nationality: p.nationality,
                        countryCode: p.countryCode
                      })}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      Asignar
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'CUSTOM' && (
            <form onSubmit={handleAssignCustom} className="space-y-4 p-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Jugador</label>
                <input
                  type="text"
                  placeholder="Ej: Martín Gómez"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Promedio Estimado (AVG)</label>
                <input
                  type="number"
                  min="20"
                  max="120"
                  value={customAvg}
                  onChange={(e) => setCustomAvg(Number(e.target.value))}
                  className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                Asignar al Slot {slotIndex}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080c16] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
