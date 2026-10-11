'use client';

import React, { useState, useEffect } from 'react';
import { TournamentBracketMatch } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  UserX, 
  RotateCcw, 
  Save, 
  Award, 
  AlertTriangle 
} from 'lucide-react';

interface AdminMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: TournamentBracketMatch | null;
  onSaveScore: (matchId: string, p1Score: number, p2Score: number, winnerId?: string, note?: string) => void;
  onAdvanceWalkover: (matchId: string, winnerId: string, absentPlayerName: string) => void;
  onResetMatch: (matchId: string) => void;
}

export const AdminMatchModal: React.FC<AdminMatchModalProps> = ({
  isOpen,
  onClose,
  match,
  onSaveScore,
  onAdvanceWalkover,
  onResetMatch
}) => {
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (match) {
      setScoreP1(match.scoreP1 || 0);
      setScoreP2(match.scoreP2 || 0);
      setSelectedWinnerId(match.winnerId || '');
      setNote(match.note || '');
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const p1Name = match.player1?.name || 'Jugador 1';
  const p2Name = match.player2?.name || 'Jugador 2';
  const p1Id = match.player1?.id;
  const p2Id = match.player2?.id;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScore(match.id, scoreP1, scoreP2, selectedWinnerId || undefined, note || undefined);
    onClose();
  };

  const handleWalkover = (winnerId: string, absentName: string) => {
    if (confirm(`¿Declarar ausente a "${absentName}" y avanzar al rival por Walkover (W.O.)?`)) {
      onAdvanceWalkover(match.id, winnerId, absentName);
      onClose();
    }
  };

  const handleReset = () => {
    if (confirm(`¿Estás seguro de resetear la partida #${match.matchIndex + 1}? Se borrará el resultado y se retirará al ganador de la siguiente ronda.`)) {
      onResetMatch(match.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0a0e17] border-2 border-[#ef4444] rounded-3xl p-6 shadow-2xl shadow-black text-white space-y-5">
        {/* Cabecera con Badge de Admin */}
        <div className="flex items-center justify-between border-b border-[#ef4444]/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Administrador de Llave
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#ef4444] text-white px-2 py-0.5 rounded-md">
                  ICEMAN FULL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Edición manual de resultados y avance por jugador ausente (Ronda {match.round} • Partida #{match.matchIndex + 1})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#111622] hover:bg-[#1a2234] border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario de Edición de Resultado Manual */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-[#0f1422] border border-[#1e2a40] rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              1. Modificar Marcador de Legs
            </span>

            {/* Fila Jugador 1 */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141a29] border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">
                  {getCountryFlag(match.player1?.countryCode || match.player1?.nationality || 'AR')}
                </span>
                <span className="text-sm font-black text-white truncate">
                  {p1Name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-bold">Legs:</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={scoreP1}
                  onChange={(e) => setScoreP1(parseInt(e.target.value) || 0)}
                  className="w-16 bg-[#07090e] border border-slate-700 rounded-lg px-2.5 py-1 text-center font-mono font-black text-base text-white focus:outline-none focus:border-[#00e676]"
                />
              </div>
            </div>

            {/* Fila Jugador 2 */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#141a29] border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">
                  {getCountryFlag(match.player2?.countryCode || match.player2?.nationality || 'AR')}
                </span>
                <span className="text-sm font-black text-white truncate">
                  {p2Name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-bold">Legs:</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={scoreP2}
                  onChange={(e) => setScoreP2(parseInt(e.target.value) || 0)}
                  className="w-16 bg-[#07090e] border border-slate-700 rounded-lg px-2.5 py-1 text-center font-mono font-black text-base text-white focus:outline-none focus:border-[#00e676]"
                />
              </div>
            </div>

            {/* Ganador Explícito */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Ganador Oficial:
              </label>
              <select
                value={selectedWinnerId}
                onChange={(e) => setSelectedWinnerId(e.target.value)}
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              >
                <option value="">-- Sin ganador definido (En juego o pendiente) --</option>
                {p1Id && <option value={p1Id}>{p1Name} (Avanza de Ronda)</option>}
                {p2Id && <option value={p2Id}>{p2Name} (Avanza de Ronda)</option>}
              </select>
            </div>

            {/* Nota opcional */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Nota de Partido (Opcional):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Manual, Decisión Arbitral, etc."
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e676]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Resultado Manual</span>
            </button>
          </div>
        </form>

        {/* Sección 2: Avanzar por Jugador Ausente (W.O. - Walkover) */}
        <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <UserX className="w-4 h-4" />
            <span>2. Declarar Jugador Ausente (Walkover / W.O.)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Si un jugador no se presentó a la diana, avanzá al rival automáticamente con victoria por W.O.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {p1Id && p2Name && (
              <button
                type="button"
                onClick={() => handleWalkover(p1Id, p2Name)}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title={`Avanzar a ${p1Name} porque ${p2Name} no se presentó`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                <span className="truncate">Avanzar a {p1Name} (W.O.)</span>
              </button>
            )}

            {p2Id && p1Name && (
              <button
                type="button"
                onClick={() => handleWalkover(p2Id, p1Name)}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title={`Avanzar a ${p2Name} porque ${p1Name} no se presentó`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                <span className="truncate">Avanzar a {p2Name} (W.O.)</span>
              </button>
            )}
          </div>
        </div>

        {/* Sección 3: Resetear o Limpiar Partida */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-[#161c2b] hover:bg-[#22161b] text-slate-400 hover:text-[#ef4444] border border-slate-800 hover:border-[#ef4444]/40 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Borrar resultados y devolver la partida a pendiente"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resetear Partido a 0-0</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
