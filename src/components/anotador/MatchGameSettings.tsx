'use client';

import React, { useState } from 'react';
import { 
  GameType, 
  CricketMode, 
  MatchConfig, 
  ParticipantPlayer,
  PlayerProfile 
} from '@/lib/types';
import { MOCK_RANKINGS, MOCK_CURRENT_USER } from '@/lib/constants';
import { 
  ArrowLeft, 
  Play, 
  UserPlus, 
  Users, 
  Settings2, 
  HelpCircle, 
  Check, 
  X, 
  Volume2, 
  VolumeX,
  Target,
  Flame,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MatchGameSettingsProps {
  onStartMatch: (config: MatchConfig) => void;
  onBack?: () => void;
  voiceCallerEnabled: boolean;
  onToggleVoiceCaller: () => void;
  soundFxEnabled: boolean;
  onToggleSoundFx: () => void;
}

export const MatchGameSettings: React.FC<MatchGameSettingsProps> = ({
  onStartMatch,
  onBack,
  voiceCallerEnabled,
  onToggleVoiceCaller,
  soundFxEnabled,
  onToggleSoundFx
}) => {
  // Modo de juego principal
  const [gameType, setGameType] = useState<GameType>('X01');

  // Modo de juego Cricket
  const [cricketMode, setCricketMode] = useState<CricketMode>('DEFAULT');
  const [showCricketModeModal, setShowCricketModeModal] = useState(false);
  const [showCricketHelpModal, setShowCricketHelpModal] = useState(false);

  // Modalidad Parejas (2 vs 2)
  const [isDoubles, setIsDoubles] = useState(false);

  // Jugadores seleccionados
  const [player1, setPlayer1] = useState<ParticipantPlayer>({
    id: MOCK_CURRENT_USER.id,
    name: MOCK_CURRENT_USER.fullName,
    nickname: MOCK_CURRENT_USER.nickname,
    avatarUrl: MOCK_CURRENT_USER.avatarUrl
  });

  const [player2, setPlayer2] = useState<ParticipantPlayer>({
    id: 'guest-rival',
    name: 'Rival / Invitado',
    nickname: 'Rival',
    avatarUrl: '/logos/logo-mdq.png'
  });

  // Compañeros en caso de parejas
  const [p1Teammate, setP1Teammate] = useState<ParticipantPlayer>({
    id: 'guest-team-p1',
    name: 'Pareja Jugador 1',
    nickname: 'Pareja 1',
    avatarUrl: '/logos/logo-mdq.png'
  });

  const [p2Teammate, setP2Teammate] = useState<ParticipantPlayer>({
    id: 'guest-team-p2',
    name: 'Pareja Jugador 2',
    nickname: 'Pareja 2',
    avatarUrl: '/logos/logo-mdq.png'
  });

  // Modal de selección de jugador de la app
  const [pickingSlot, setPickingSlot] = useState<'p1' | 'p2' | 'p1Team' | 'p2Team' | null>(null);
  const [customPlayerName, setCustomPlayerName] = useState('');
  const [showCreatePlayerModal, setShowCreatePlayerModal] = useState(false);

  // Formato de entrada
  const [inputFormat, setInputFormat] = useState<'SCORE' | 'DART_BY_DART'>('SCORE');

  // Distancia
  const [distanceType, setDistanceType] = useState<'LEGS' | 'SETS'>('LEGS');
  const [setsCount, setSetsCount] = useState<number>(1);
  const [legsCount, setLegsCount] = useState<number>(3);

  // Configuración X01
  const [startScore, setStartScore] = useState<170 | 301 | 501 | 701>(501);
  const [doubleIn, setDoubleIn] = useState(false);
  const [doubleOut, setDoubleOut] = useState(true);
  const [twoClearLegs, setTwoClearLegs] = useState(false);
  const [untilAllFinished, setUntilAllFinished] = useState(false);

  // Cricket Whiteboard View
  const [whiteboardView, setWhiteboardView] = useState(true);

  // Modal de Ajustes de Audio/Árbitro
  const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false);

  // Jugadores disponibles en la comunidad
  const availablePlayers: PlayerProfile[] = [MOCK_CURRENT_USER];

  const handleSelectExistingPlayer = (profile: PlayerProfile) => {
    if (!pickingSlot) return;
    const mapped: ParticipantPlayer = {
      id: profile.id,
      name: profile.fullName,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl
    };

    if (pickingSlot === 'p1') setPlayer1(mapped);
    if (pickingSlot === 'p2') setPlayer2(mapped);
    if (pickingSlot === 'p1Team') setP1Teammate(mapped);
    if (pickingSlot === 'p2Team') setP2Teammate(mapped);

    setPickingSlot(null);
  };

  const handleCreateCustomPlayer = () => {
    if (!customPlayerName.trim() || !pickingSlot) return;
    const newP: ParticipantPlayer = {
      id: `guest-${Date.now()}`,
      name: customPlayerName.trim(),
      nickname: customPlayerName.trim()
    };

    if (pickingSlot === 'p1') setPlayer1(newP);
    if (pickingSlot === 'p2') setPlayer2(newP);
    if (pickingSlot === 'p1Team') setP1Teammate(newP);
    if (pickingSlot === 'p2Team') setP2Teammate(newP);

    setCustomPlayerName('');
    setShowCreatePlayerModal(false);
    setPickingSlot(null);
  };

  const handleStart = () => {
    const finalP1: ParticipantPlayer = isDoubles
      ? { ...player1, teammateId: p1Teammate.id, teammateName: p1Teammate.name }
      : player1;

    const finalP2: ParticipantPlayer = isDoubles
      ? { ...player2, teammateId: p2Teammate.id, teammateName: p2Teammate.name }
      : player2;

    const config: MatchConfig = {
      gameType,
      cricketMode: gameType === 'CRICKET' ? cricketMode : undefined,
      startingScore: startScore,
      outMode: doubleOut ? 'DOUBLE_OUT' : 'SINGLE_OUT',
      inputFormat,
      distanceType,
      bestOfSets: setsCount,
      bestOfLegs: legsCount,
      doubleIn,
      twoClearLegs,
      isDoubles,
      isVsCpu: false,
      cpuDifficulty: 'MEDIUM',
      player1: finalP1,
      player2: finalP2,
      player1Name: isDoubles ? `${player1.name} / ${p1Teammate.name}` : player1.name,
      player2Name: isDoubles ? `${player2.name} / ${p2Teammate.name}` : player2.name
    };

    onStartMatch(config);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#07090e] border border-[#ef4444]/30 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/80 space-y-5">
      {/* Cabecera idéntica a las capturas */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ef4444]/20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 transition-colors border border-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {gameType === 'X01' ? 'Configuración 501 / X01' : 'Configuración de Cricket'}
            </h2>
            <p className="text-xs text-slate-400">
              {gameType === 'X01'
                ? 'Ajustá jugadores, legs y comenzá la partida en vivo'
                : 'Definí modo de puntuación y competidores'}
            </p>
          </div>
        </div>

        {/* Selector de Juego 501 vs Cricket */}
        <div className="flex bg-[#111622] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setGameType('X01')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              gameType === 'X01'
                ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            501
          </button>
          <button
            onClick={() => setGameType('CRICKET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              gameType === 'CRICKET'
                ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cricket
          </button>
        </div>
      </div>

      {/* Botón Principal START (Verde Diana dominante) */}
      <button
        onClick={handleStart}
        className="w-full py-4 rounded-2xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-lg tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-[#00e676]/25 transition-all transform active:scale-[0.99] border border-[#00e676]"
      >
        <Play className="w-6 h-6 fill-current" />
        <span>COMENZAR PARTIDA</span>
      </button>

      {/* Selector de Modalidad: Individual vs Parejas (2 vs 2) */}
      <div className="bg-[#0f1422] border border-[#ef4444]/30 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#ef4444]/15 rounded-xl border border-[#ef4444]/30 text-[#ef4444]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-black text-white">Modalidad por Parejas (2 vs 2)</div>
            <div className="text-[11px] text-slate-400">Rotación de 4 turnos vinculada a los perfiles</div>
          </div>
        </div>

        <button
          onClick={() => setIsDoubles(!isDoubles)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isDoubles ? 'bg-[#ef4444]' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isDoubles ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Bloque de Jugadores */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isDoubles ? 'Parejas Seleccionadas' : 'Jugadores del Partido'}
          </span>
          <span className="text-[11px] text-[#ef4444] font-semibold">
            {isDoubles ? '2 contra 2' : '1 contra 1'}
          </span>
        </div>

        {/* Pareja / Jugador 1 */}
        <div className="bg-[#111622] border border-[#ef4444]/40 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#ef4444] uppercase">
              {isDoubles ? 'Pareja 1 (A)' : 'Jugador 1'}
            </span>
            <button
              onClick={() => setPickingSlot('p1')}
              className="text-xs font-bold text-[#00e676] hover:underline"
            >
              Cambiar
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07090e] border border-[#ef4444]/40 flex items-center justify-center font-black text-[#ef4444]">
              {player1.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-black text-white">{player1.name}</div>
              <div className="text-xs text-slate-400">@{player1.nickname || 'jugador1'}</div>
            </div>
          </div>

          {/* Compañero 1 si es parejas */}
          {isDoubles && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#07090e] border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                  {p1Teammate.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{p1Teammate.name} (Compañero)</div>
                  <div className="text-[10px] text-slate-400">@{p1Teammate.nickname || 'teammate'}</div>
                </div>
              </div>
              <button
                onClick={() => setPickingSlot('p1Team')}
                className="text-[11px] font-bold text-[#00e676] hover:underline"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>

        {/* Pareja / Jugador 2 */}
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase">
              {isDoubles ? 'Pareja 2 (B)' : 'Jugador 2'}
            </span>
            <button
              onClick={() => setPickingSlot('p2')}
              className="text-xs font-bold text-[#00e676] hover:underline"
            >
              Cambiar
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07090e] border border-slate-700 flex items-center justify-center font-black text-white">
              {player2.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-black text-white">{player2.name}</div>
              <div className="text-xs text-slate-400">@{player2.nickname || 'jugador2'}</div>
            </div>
          </div>

          {/* Compañero 2 si es parejas */}
          {isDoubles && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#07090e] border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                  {p2Teammate.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{p2Teammate.name} (Compañero)</div>
                  <div className="text-[10px] text-slate-400">@{p2Teammate.nickname || 'teammate'}</div>
                </div>
              </div>
              <button
                onClick={() => setPickingSlot('p2Team')}
                className="text-[11px] font-bold text-[#00e676] hover:underline"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Si es Cricket: Selector de Modo de Cricket (Default / Cut Throat / No Score) */}
      {gameType === 'CRICKET' && (
        <div className="bg-[#111622] border border-[#00e676]/30 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modo de Cricket</div>
            <button
              onClick={() => setShowCricketHelpModal(true)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00e676]" />
              <span>Reglas</span>
            </button>
          </div>

          <div
            onClick={() => setShowCricketModeModal(true)}
            className="w-full bg-[#07090e] border border-slate-800 hover:border-[#00e676] rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div>
              <div className="text-sm font-black text-white">
                {cricketMode === 'DEFAULT' && 'Default (Scoring estándar)'}
                {cricketMode === 'CUT_THROAT' && 'Cut Throat (Garganta Cortada)'}
                {cricketMode === 'NO_SCORE' && 'No Score (Solo Marcas)'}
              </div>
              <div className="text-[11px] text-slate-400">
                {cricketMode === 'DEFAULT' && 'Puntos acumulados en sectores abiertos por el rival'}
                {cricketMode === 'CUT_THROAT' && 'Penalización de puntos a los rivales que no cerraron'}
                {cricketMode === 'NO_SCORE' && 'Gana quien cierre los 7 sectores primero'}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>

          {/* Toggle Whiteboard view */}
          <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={whiteboardView}
              onChange={(e) => setWhiteboardView(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
            />
            <span className="text-xs text-slate-300 font-medium">Pizarra interactiva de marcas (Whiteboard View)</span>
          </label>
        </div>
      )}

      {/* Formato de Entrada (Score vs Dardo a Dardo) */}
      {gameType === 'X01' && (
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formato de Entrada</span>
          <div className="grid grid-cols-2 gap-2 bg-[#07090e] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setInputFormat('SCORE')}
              className={`py-2 rounded-lg text-xs font-black transition-all ${
                inputFormat === 'SCORE'
                  ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Puntuación Total (Score)
            </button>
            <button
              onClick={() => setInputFormat('DART_BY_DART')}
              className={`py-2 rounded-lg text-xs font-black transition-all ${
                inputFormat === 'DART_BY_DART'
                  ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dardo por Dardo
            </button>
          </div>
        </div>
      )}

      {/* Distancia: Sets y Legs */}
      <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distancia de Partida</span>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Modalidad</label>
            <button
              onClick={() => setDistanceType(distanceType === 'LEGS' ? 'SETS' : 'LEGS')}
              className="w-full py-2.5 px-2 rounded-xl bg-[#07090e] border border-slate-700 text-xs font-bold text-white text-center hover:border-slate-500"
            >
              {distanceType === 'LEGS' ? 'Al mejor de Legs' : 'Al mejor de Sets'}
            </button>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Sets (Best of)</label>
            <select
              value={setsCount}
              disabled={distanceType === 'LEGS'}
              onChange={(e) => setSetsCount(Number(e.target.value))}
              className="w-full py-2.5 px-2 rounded-xl bg-[#07090e] border border-slate-700 text-xs font-bold text-white text-center disabled:opacity-40"
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Legs (Best of)</label>
            <select
              value={legsCount}
              onChange={(e) => setLegsCount(Number(e.target.value))}
              className="w-full py-2.5 px-2 rounded-xl bg-[#07090e] border border-slate-700 text-xs font-bold text-white text-center"
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={9}>9</option>
              <option value={11}>11</option>
            </select>
          </div>
        </div>
      </div>

      {/* Puntuación Inicial (en X01) */}
      {gameType === 'X01' && (
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puntuación Inicial</span>
          <div className="grid grid-cols-4 gap-2">
            {[170, 301, 501, 701].map((sc) => (
              <button
                key={sc}
                onClick={() => setStartScore(sc as any)}
                className={`py-2 rounded-xl font-black text-xs transition-all ${
                  startScore === sc
                    ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/30 border border-[#ef4444]'
                    : 'bg-[#07090e] text-slate-300 border border-slate-800 hover:border-slate-600'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          {/* Opciones de reglas X01 */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doubleIn}
                onChange={(e) => setDoubleIn(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#ef4444] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-xs text-slate-300">Double In (Entrada)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={doubleOut}
                onChange={(e) => setDoubleOut(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#ef4444] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-xs text-slate-300">Double Out (Salida)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={twoClearLegs}
                onChange={(e) => setTwoClearLegs(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#ef4444] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-xs text-slate-300">Diferencia de 2 legs</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={untilAllFinished}
                onChange={(e) => setUntilAllFinished(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#ef4444] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-xs text-slate-300">Hasta terminar</span>
            </label>
          </div>
        </div>
      )}

      {/* Botón Inferior de Ajustes de Árbitro / Audio */}
      <button
        onClick={() => setShowAudioSettingsModal(true)}
        className="w-full py-3 rounded-xl bg-[#111622] hover:bg-[#182030] border border-slate-800 text-slate-300 text-xs font-black flex items-center justify-center gap-2 transition-colors"
      >
        <Settings2 className="w-4 h-4 text-[#ef4444]" />
        <span>AJUSTES DE ÁRBITRO Y SONIDO EN PARTIDA</span>
      </button>

      {/* MODAL: Selección de Jugador Registrado en la App */}
      {pickingSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#07090e] border border-[#ef4444]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Seleccionar Jugador de la Comunidad</h3>
              <button onClick={() => setPickingSlot(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {availablePlayers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectExistingPlayer(p)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#111622] hover:bg-[#1a2234] border border-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#07090e] border border-slate-700 flex items-center justify-center font-black text-[#ef4444] text-xs">
                      {p.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400">@{p.nickname} • AVG {p.estimatedAvg}</div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-[#00e676]" />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => setShowCreatePlayerModal(true)}
                className="flex-1 py-2.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-[#00e676]" />
                <span>+ Jugador Rápido / Invitado</span>
              </button>
              <button
                onClick={() => setPickingSlot(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Crear Jugador Rápido */}
      {showCreatePlayerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#07090e] border border-[#ef4444]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Nombre del Jugador Invitado</h3>
            <input
              type="text"
              placeholder="Ej: El Tirador del Club"
              value={customPlayerName}
              onChange={(e) => setCustomPlayerName(e.target.value)}
              className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00e676]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateCustomPlayer}
                className="flex-1 py-2 rounded-xl bg-[#00e676] text-[#07090e] text-xs font-black"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowCreatePlayerModal(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Selección de Modo de Cricket (Default / Cut Throat / No Score) */}
      {showCricketModeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#07090e] border border-[#00e676]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Modo de Cricket</h3>
            <div className="space-y-2">
              {[
                { id: 'DEFAULT', title: 'Default (Scoring estándar)', desc: 'Puntuación normal al anotar sobre números que el rival no cerró' },
                { id: 'CUT_THROAT', title: 'Cut Throat (Garganta Cortada)', desc: 'Penalizás con puntos a los rivales que aún tienen el número abierto' },
                { id: 'NO_SCORE', title: 'No Score (Solo Marcas)', desc: 'Gana quien cierre los 7 sectores primero sin importar puntos' }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setCricketMode(m.id as CricketMode);
                    setShowCricketModeModal(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    cricketMode === m.id
                      ? 'bg-[#00e676]/10 border-[#00e676]'
                      : 'bg-[#111622] border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{m.title}</span>
                    {cricketMode === m.id && <Check className="w-4 h-4 text-[#00e676]" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCricketModeModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Reglas de Cricket */}
      {showCricketHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#07090e] border border-[#00e676]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Reglas Oficiales de Cricket</h3>
              <button onClick={() => setShowCricketHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <div>
                <strong className="text-white block mb-0.5">Cricket Clásico:</strong>
                Se compite en los sectores del 15 al 20 y el Bullseye. Cada uno requiere 3 marcas para cerrarse. Un simple vale 1 marca, un doble 2 marcas y un triple 3 marcas.
              </div>
              <div>
                <strong className="text-[#00e676] block mb-0.5">Modo Default:</strong>
                Si cerrás un número y tu oponente aún lo tiene abierto, cada impacto extra suma puntos directos a tu favor. Gana quien cierre los 7 sectores y posea igual o mayor puntaje.
              </div>
              <div>
                <strong className="text-[#ef4444] block mb-0.5">Modo Cut Throat:</strong>
                Los puntos extras se le cargan como penalización al oponente que no cerró. Gana quien cierre todos los sectores con el menor puntaje.
              </div>
              <div>
                <strong className="text-slate-400 block mb-0.5">Modo No Score:</strong>
                Gana pura y exclusivamente quien cierre los 7 sectores primero.
              </div>
            </div>
            <button
              onClick={() => setShowCricketHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Ajustes de Árbitro y Sonido */}
      {showAudioSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#07090e] border border-[#ef4444]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Ajustes de Árbitro y Audio</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111622] border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-[#00e676]" />
                  <span className="text-xs font-bold text-white">Árbitro de Voz ("180", Game Shot)</span>
                </div>
                <button
                  onClick={onToggleVoiceCaller}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                    voiceCallerEnabled ? 'bg-[#00e676] text-[#07090e]' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {voiceCallerEnabled ? 'ACTIVADO' : 'MUTED'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111622] border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-xs font-bold text-white">Efectos de Diana y Aplausos</span>
                </div>
                <button
                  onClick={onToggleSoundFx}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                    soundFxEnabled ? 'bg-[#ef4444] text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {soundFxEnabled ? 'ACTIVADO' : 'MUTED'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAudioSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs"
            >
              LISTO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
