'use client';

import React, { useState, useEffect } from 'react';
import { TournamentBracketMatch } from '@/lib/types';
import { 
  Globe, 
  Target, 
  FileEdit, 
  X, 
  Trophy, 
  Users, 
  CheckCircle2, 
  Tv, 
  Video,
  ShieldAlert,
  RotateCcw,
  UserX,
  UserPlus,
  AlertTriangle,
  Check
} from 'lucide-react';

interface MatchDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchTitle: string;
  player1Name: string;
  player2Name: string;
  bestOfLegs: number;
  onLaunchLiveMatch: () => void;
  onLaunchOnlineMatch: () => void;
  onSaveQuickResult: (scoreP1: number, scoreP2: number, winnerId: string, note?: string) => void;
  player1Id: string;
  player2Id: string;
  match?: TournamentBracketMatch | null;
  isAdmin?: boolean;
  onAdvanceWalkover?: (winnerId: string, absentPlayerName: string) => void;
  onResetMatch?: () => void;
  onAssignSlot?: (slotIndex: 1 | 2) => void;
}

export const MatchDispatcherModal: React.FC<MatchDispatcherModalProps> = ({
  isOpen,
  onClose,
  matchTitle,
  player1Name,
  player2Name,
  bestOfLegs,
  onLaunchLiveMatch,
  onLaunchOnlineMatch,
  onSaveQuickResult,
  player1Id,
  player2Id,
  match,
  isAdmin = false,
  onAdvanceWalkover,
  onResetMatch,
  onAssignSlot
}) => {
  const [mode, setMode] = useState<'SELECT' | 'QUICK_RESULT' | 'WALKOVER'>('SELECT');
  const [quickScoreP1, setQuickScoreP1] = useState(match?.scoreP1 || 0);
  const [quickScoreP2, setQuickScoreP2] = useState(match?.scoreP2 || 0);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>(match?.winnerId || '');
  const [resultNote, setResultNote] = useState<string>(match?.note || '');

  useEffect(() => {
    if (match) {
      setQuickScoreP1(match.scoreP1 || 0);
      setQuickScoreP2(match.scoreP2 || 0);
      setSelectedWinnerId(match.winnerId || '');
      setResultNote(match.note || '');
    }
  }, [match]);

  if (!isOpen) return null;

  const targetToWin = match?.legTarget || Math.ceil(bestOfLegs / 2);
  const hasBothPlayers = Boolean(
    player1Name && player2Name && 
    player1Name !== 'Por definir' && player2Name !== 'Por definir' &&
    !player1Name.startsWith('Por definir') && !player2Name.startsWith('Por definir')
  );

  const handleConfirmQuickResult = () => {
    let finalWinnerId = selectedWinnerId;
    if (!finalWinnerId) {
      if (quickScoreP1 >= targetToWin) finalWinnerId = player1Id;
      else if (quickScoreP2 >= targetToWin) finalWinnerId = player2Id;
      else {
        finalWinnerId = quickScoreP1 > quickScoreP2 ? player1Id : player2Id;
      }
    }

    onSaveQuickResult(quickScoreP1, quickScoreP2, finalWinnerId, resultNote || undefined);
    onClose();
  };

  const handleWalkoverConfirm = (winnerId: string, absentName: string) => {
    if (onAdvanceWalkover) {
      if (window.confirm(`¿Confirmas declarar ausente a "${absentName}" y avanzar al rival por Walkover (W.O.)?`)) {
        onAdvanceWalkover(winnerId, absentName);
        onClose();
      }
    }
  };

  const handleResetConfirm = () => {
    if (onResetMatch) {
      if (window.confirm('¿Estás seguro de eliminar los datos de este partido? Se reseteará el tanteador a 0-0 y se retirará al ganador de la siguiente ronda de forma segura.')) {
        onResetMatch();
        onClose();
      }
    }
  };

  const isFinished = match?.status === 'FINISHED' || Boolean(match?.winnerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#07090e] border-2 border-[#ef4444]/40 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl shadow-black/95 max-h-[92vh] overflow-y-auto">
        {/* Cabecera del Cruce */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ef4444]/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#ef4444] uppercase tracking-wider block">
                {matchTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                1º a {targetToWin} legs
              </span>
              {isFinished && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  FINALIZADO
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              {player1Name} <span className="text-slate-500 font-normal">vs</span> {player2Name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tanteador Actual del Cruce */}
        <div className="grid grid-cols-2 gap-3 bg-[#111622] p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between pr-2 border-r border-slate-800">
            <span className="text-xs font-bold text-slate-200 truncate">{player1Name}</span>
            <span className="font-mono font-black text-lg text-white ml-2">
              {match ? match.scoreP1 : quickScoreP1}
            </span>
          </div>
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-bold text-slate-200 truncate">{player2Name}</span>
            <span className="font-mono font-black text-lg text-white ml-2">
              {match ? match.scoreP2 : quickScoreP2}
            </span>
          </div>
        </div>

        {mode === 'SELECT' ? (
          <div className="space-y-4">
            {/* 1. OPCIONES DE JUEGO (SI AMBOS ESTÁN LISTOS) */}
            {hasBothPlayers && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Lanzar Partido (Estilo Nakka N01)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Opción 1: Live Presencial */}
                  <button
                    onClick={() => {
                      onLaunchLiveMatch();
                      onClose();
                    }}
                    className="w-full p-4 rounded-2xl bg-[#111622] hover:bg-[#182030] border border-[#00e676]/40 hover:border-[#00e676] flex flex-col gap-2 transition-all text-left group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00e676]/20 border border-[#00e676]/40 flex items-center justify-center text-[#00e676] group-hover:scale-105 transition-transform flex-shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white group-hover:text-[#00e676] transition-colors">
                          Anotador en Vivo
                        </div>
                        <span className="text-[10px] font-bold text-[#00e676] uppercase tracking-wider">
                          Presencial en Club
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      Entra directo a tirar a la diana con audio del árbitro y transmisión a TV.
                    </div>
                  </button>

                  {/* Opción 2: Online */}
                  <button
                    onClick={() => {
                      onLaunchOnlineMatch();
                      onClose();
                    }}
                    className="w-full p-4 rounded-2xl bg-[#111622] hover:bg-[#182030] border border-[#0284c7]/40 hover:border-[#0284c7] flex flex-col gap-2 transition-all text-left group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#0284c7] group-hover:scale-105 transition-transform flex-shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white group-hover:text-[#0284c7] transition-colors">
                          Partida Online
                        </div>
                        <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider">
                          Remota Conectada
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      Sala remota WebRTC con cámara y sincronización dardo a dardo.
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 2. GESTIÓN Y EDICIÓN DE LLAVE (ESTILO NAKKA) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Acciones del Cruce / Edición de Llave
              </span>

              <div className="space-y-2">
                {/* Botón Cargar / Editar Resultado */}
                <button
                  type="button"
                  onClick={() => setMode('QUICK_RESULT')}
                  className="w-full p-3 rounded-2xl bg-[#111622] hover:bg-[#182030] border border-amber-500/40 hover:border-amber-400 flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <FileEdit className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        {isFinished ? 'Modificar Resultado Oficial' : 'Cargar / Editar Resultado Directo'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fijar legs ganados por cada jugador y definir el ganador para avanzar de ronda.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">➔</span>
                </button>

                {/* Acciones Exclusivas de Administrador / Creador */}
                {isAdmin && (
                  <>
                    {/* Declarar Walkover (W.O.) */}
                    {hasBothPlayers && onAdvanceWalkover && !isFinished && (
                      <button
                        type="button"
                        onClick={() => setMode('WALKOVER')}
                        className="w-full p-3 rounded-2xl bg-[#111622] hover:bg-[#182030] border border-blue-500/40 hover:border-blue-400 flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                            <UserX className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white">Declarar Walkover (W.O.)</div>
                            <div className="text-[10px] text-slate-400">
                              Avanzar al jugador presente ante la incomparecencia o retiro del rival.
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-blue-400 font-bold">➔</span>
                      </button>
                    )}

                    {/* Editar Datos del Partido (Asignar Slots) */}
                    {onAssignSlot && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onAssignSlot(1);
                            onClose();
                          }}
                          className="p-2.5 rounded-xl bg-[#111622] hover:bg-slate-800 border border-slate-700 text-left transition-all"
                        >
                          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                            <UserPlus className="w-3 h-3 text-cyan-400" />
                            <span>Slot 1</span>
                          </div>
                          <div className="text-xs font-black text-white truncate mt-0.5">
                            Cambiar: {player1Name}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onAssignSlot(2);
                            onClose();
                          }}
                          className="p-2.5 rounded-xl bg-[#111622] hover:bg-slate-800 border border-slate-700 text-left transition-all"
                        >
                          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                            <UserPlus className="w-3 h-3 text-cyan-400" />
                            <span>Slot 2</span>
                          </div>
                          <div className="text-xs font-black text-white truncate mt-0.5">
                            Cambiar: {player2Name}
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Resetear / Eliminar Datos del Partido */}
                    {onResetMatch && (match?.scoreP1 !== 0 || match?.scoreP2 !== 0 || Boolean(match?.winnerId)) && (
                      <button
                        type="button"
                        onClick={handleResetConfirm}
                        className="w-full p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center gap-2 text-xs font-bold transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Eliminar los Datos del Partido (Resetear a 0-0 y desclasificar)</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
            >
              Cerrar Menú
            </button>
          </div>
        ) : mode === 'QUICK_RESULT' ? (
          /* MODO CARGA / EDICIÓN DE RESULTADO DIRECTO */
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-xs text-slate-400 text-center">
              Fijar legs ganados por cada jugador (Primero a {targetToWin} legs para avanzar):
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-xs font-bold text-white truncate mb-1">{player1Name}</div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(0, quickScoreP1 - 1);
                      setQuickScoreP1(next);
                      if (next >= targetToWin) setSelectedWinnerId(player1Id);
                      else if (quickScoreP2 >= targetToWin) setSelectedWinnerId(player2Id);
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-black text-[#00e676] w-8">{quickScoreP1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = quickScoreP1 + 1;
                      setQuickScoreP1(next);
                      if (next >= targetToWin) setSelectedWinnerId(player1Id);
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3 text-center">
                <div className="text-xs font-bold text-white truncate mb-1">{player2Name}</div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(0, quickScoreP2 - 1);
                      setQuickScoreP2(next);
                      if (next >= targetToWin) setSelectedWinnerId(player2Id);
                      else if (quickScoreP1 >= targetToWin) setSelectedWinnerId(player1Id);
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="text-2xl font-black text-[#00e676] w-8">{quickScoreP2}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = quickScoreP2 + 1;
                      setQuickScoreP2(next);
                      if (next >= targetToWin) setSelectedWinnerId(player2Id);
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Ganador Seleccionado */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Ganador Oficial:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWinnerId(player1Id)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedWinnerId === player1Id
                      ? 'bg-[#00e676] text-[#07090e] border-[#00e676] shadow'
                      : 'bg-[#111622] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {player1Name}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWinnerId(player2Id)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedWinnerId === player2Id
                      ? 'bg-[#00e676] text-[#07090e] border-[#00e676] shadow'
                      : 'bg-[#111622] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {player2Name}
                </button>
              </div>
            </div>

            {/* Nota opcional */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Nota del Resultado (Opcional):</label>
              <input
                type="text"
                value={resultNote}
                onChange={(e) => setResultNote(e.target.value)}
                placeholder="Ej: W.O., Planilla oficial, etc."
                className="w-full bg-[#111622] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00e676]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmQuickResult}
                className="flex-1 py-3 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs hover:bg-[#00c864] transition-colors"
              >
                CONFIRMAR Y AVANZAR GANADOR
              </button>
              <button
                type="button"
                onClick={() => setMode('SELECT')}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          /* MODO WALKOVER */
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-xs text-slate-300">
              Selecciona cuál jugador se presentó para otorgarle la victoria por Walkover (W.O.) y avanzar de ronda:
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleWalkoverConfirm(player1Id, player2Name)}
                className="w-full p-3.5 rounded-2xl bg-[#111622] hover:bg-[#1a2436] border border-[#00e676]/40 text-left transition-all"
              >
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#00e676]" />
                  <span>Avanzar a {player1Name}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {player2Name} será marcado como ausente (W.O.).
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleWalkoverConfirm(player2Id, player1Name)}
                className="w-full p-3.5 rounded-2xl bg-[#111622] hover:bg-[#1a2436] border border-[#00e676]/40 text-left transition-all"
              >
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#00e676]" />
                  <span>Avanzar a {player2Name}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {player1Name} será marcado como ausente (W.O.).
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMode('SELECT')}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
