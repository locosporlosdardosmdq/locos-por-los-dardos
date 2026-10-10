'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { DartKeypad } from './DartKeypad';
import { CheckoutGuide } from './CheckoutGuide';
import { SoundEngine, VoiceCaller } from '@/lib/sound-effects';
import { 
  GameType, 
  OutMode, 
  CpuDifficulty, 
  DartThrow, 
  VisitLog, 
  CricketMarkState 
} from '@/lib/types';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Trophy, 
  Bot, 
  User, 
  Flame, 
  Settings2, 
  Sparkles,
  ArrowRight,
  Target
} from 'lucide-react';

interface DartScorerProps {
  initialGameType?: GameType;
  initialStartingScore?: 170 | 301 | 501 | 701;
}

export const DartScorer: React.FC<DartScorerProps> = ({
  initialGameType = 'X01',
  initialStartingScore = 501
}) => {
  // Configuración de Partida
  const [gameType, setGameType] = useState<GameType>(initialGameType);
  const [startingScore, setStartingScore] = useState<170 | 301 | 501 | 701>(initialStartingScore);
  const [outMode, setOutMode] = useState<OutMode>('DOUBLE_OUT');
  const [bestOfLegs, setBestOfLegs] = useState<number>(5);
  const [isVsCpu, setIsVsCpu] = useState<boolean>(false);
  const [cpuDifficulty, setCpuDifficulty] = useState<CpuDifficulty>('MEDIUM');

  // Jugadores
  const [player1Name, setPlayer1Name] = useState('Jugador 1');
  const [player2Name, setPlayer2Name] = useState('Jugador 2');

  // Estado del Partido X01
  const [currentTurn, setCurrentTurn] = useState<0 | 1>(0); // 0=Player 1, 1=Player 2
  const [scores, setScores] = useState<[number, number]>([startingScore, startingScore]);
  const [legsWon, setLegsWon] = useState<[number, number]>([0, 0]);
  const [legNumber, setLegNumber] = useState<number>(1);
  const [dartsThrownLeg, setDartsThrownLeg] = useState<[number, number]>([0, 0]);
  const [totalPointsScored, setTotalPointsScored] = useState<[number, number]>([0, 0]);
  const [totalDartsThrownMatch, setTotalDartsThrownMatch] = useState<[number, number]>([0, 0]);
  const [count180s, setCount180s] = useState<[number, number]>([0, 0]);
  const [count140s, setCount140s] = useState<[number, number]>([0, 0]);
  const [count100s, setCount100s] = useState<[number, number]>([0, 0]);
  const [highestCheckout, setHighestCheckout] = useState<[number, number]>([0, 0]);

  // Historial para Deshacer
  const [history, setHistory] = useState<any[]>([]);

  // Estado de Cricket (15, 16, 17, 18, 19, 20, 25)
  const cricketTargets = ['20', '19', '18', '17', '16', '15', '25'];
  const [cricketMarks, setCricketMarks] = useState<[CricketMarkState, CricketMarkState]>([
    { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 },
    { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 }
  ]);
  const [cricketPoints, setCricketPoints] = useState<[number, number]>([0, 0]);

  // Opciones de audio
  const [voiceCallerEnabled, setVoiceCallerEnabled] = useState(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);

  // Fin de partido
  const [matchWinner, setMatchWinner] = useState<number | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');

  const targetLegsToWin = Math.ceil(bestOfLegs / 2);

  // Reiniciar estado al cambiar puntaje o configuración
  const resetMatch = (newStartScore = startingScore) => {
    setScores([newStartScore, newStartScore]);
    setLegsWon([0, 0]);
    setLegNumber(1);
    setCurrentTurn(0);
    setDartsThrownLeg([0, 0]);
    setTotalPointsScored([0, 0]);
    setTotalDartsThrownMatch([0, 0]);
    setCount180s([0, 0]);
    setCount140s([0, 0]);
    setCount100s([0, 0]);
    setHighestCheckout([0, 0]);
    setHistory([]);
    setMatchWinner(null);
    setCricketMarks([
      { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 },
      { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 }
    ]);
    setCricketPoints([0, 0]);
  };

  // Turno de la CPU
  useEffect(() => {
    if (isVsCpu && currentTurn === 1 && matchWinner === null) {
      const timer = setTimeout(() => {
        executeCpuTurn();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, isVsCpu, matchWinner, scores]);

  // Cálculo de promedios (3-dart average)
  const calcAvg = (playerIdx: 0 | 1) => {
    const darts = totalDartsThrownMatch[playerIdx];
    if (darts === 0) return '0.00';
    const pts = totalPointsScored[playerIdx];
    return ((pts / darts) * 3).toFixed(2);
  };

  // Simulación de turno de CPU
  const executeCpuTurn = () => {
    if (matchWinner !== null) return;
    const cpuRemaining = scores[1];

    // Simulación según nivel
    // Beginner: ~35-45 AVG
    // Medium: ~50-60 AVG
    // Advanced: ~65-75 AVG
    // Pro: ~85-100 AVG
    let simulatedScore = 0;

    if (cpuRemaining <= 170 && outMode === 'DOUBLE_OUT') {
      // Intento de cierre de la CPU
      const chanceOfOut = {
        BEGINNER: 0.15,
        MEDIUM: 0.35,
        ADVANCED: 0.55,
        PRO: 0.8
      }[cpuDifficulty];

      if (Math.random() < chanceOfOut && cpuRemaining <= 40 && cpuRemaining % 2 === 0) {
        handleScoreInput(cpuRemaining, 1);
        return;
      }
    }

    const meanScores = {
      BEGINNER: 40,
      MEDIUM: 55,
      ADVANCED: 72,
      PRO: 92
    }[cpuDifficulty];

    // Variabilidad normalizada
    const randomVariation = (Math.random() - 0.5) * 40;
    simulatedScore = Math.max(0, Math.min(180, Math.round(meanScores + randomVariation)));

    // Si se pasa (Bust)
    if (simulatedScore > cpuRemaining || (outMode === 'DOUBLE_OUT' && cpuRemaining - simulatedScore === 1)) {
      simulatedScore = 0; // Se pasa o no cierra
    }

    handleScoreInput(simulatedScore, 1);
  };

  // Procesar entrada de puntuación (X01)
  const handleScoreInput = (visitScore: number, explicitPlayerIndex?: 0 | 1) => {
    if (matchWinner !== null) return;

    const pIdx = explicitPlayerIndex !== undefined ? explicitPlayerIndex : currentTurn;
    const currentRemaining = scores[pIdx];

    // Guardar estado en historial para UNDO
    setHistory((prev) => [
      ...prev,
      {
        scores: [...scores],
        legsWon: [...legsWon],
        legNumber,
        currentTurn,
        dartsThrownLeg: [...dartsThrownLeg],
        totalPointsScored: [...totalPointsScored],
        totalDartsThrownMatch: [...totalDartsThrownMatch],
        count180s: [...count180s],
        count140s: [...count140s],
        count100s: [...count100s],
        highestCheckout: [...highestCheckout]
      }
    ]);

    // Verificar si es BUST
    let isBust = false;
    let nextRemaining = currentRemaining - visitScore;

    if (nextRemaining < 0) {
      isBust = true;
    } else if (outMode === 'DOUBLE_OUT' && nextRemaining === 1) {
      isBust = true;
    } else if (outMode === 'DOUBLE_OUT' && nextRemaining === 0 && visitScore === 0) {
      isBust = true;
    }

    // Efectos de audio y llamadas
    if (isBust) {
      if (soundFxEnabled) SoundEngine.playBust();
      if (voiceCallerEnabled) VoiceCaller.announceBust();
      setLastAnnouncement(`Bust! Quedan ${currentRemaining}`);

      // Avanzar dardos tirados (3 dardos por visita)
      setDartsThrownLeg((prev) => {
        const copy: [number, number] = [...prev];
        copy[pIdx] += 3;
        return copy;
      });
      setTotalDartsThrownMatch((prev) => {
        const copy: [number, number] = [...prev];
        copy[pIdx] += 3;
        return copy;
      });

      // Cambio de turno
      setCurrentTurn(pIdx === 0 ? 1 : 0);
      return;
    }

    // Si NO es bust:
    if (visitScore === 180) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
      if (soundFxEnabled) SoundEngine.playBullseye();
      if (voiceCallerEnabled) VoiceCaller.announceScore(180, nextRemaining);
      setLastAnnouncement('¡ONE HUNDRED AND EIGHTY!');
      setCount180s((prev) => {
        const c: [number, number] = [...prev];
        c[pIdx] += 1;
        return c;
      });
    } else if (visitScore >= 140) {
      if (soundFxEnabled) SoundEngine.playDartHit();
      if (voiceCallerEnabled) VoiceCaller.announceScore(visitScore, nextRemaining);
      setLastAnnouncement(`¡${visitScore}! Visita sobresaliente`);
      setCount140s((prev) => {
        const c: [number, number] = [...prev];
        c[pIdx] += 1;
        return c;
      });
    } else if (visitScore >= 100) {
      if (soundFxEnabled) SoundEngine.playDartHit();
      if (voiceCallerEnabled) VoiceCaller.announceScore(visitScore, nextRemaining);
      setLastAnnouncement(`Tonelada: ¡${visitScore}!`);
      setCount100s((prev) => {
        const c: [number, number] = [...prev];
        c[pIdx] += 1;
        return c;
      });
    } else {
      if (soundFxEnabled) SoundEngine.playDartHit();
      if (voiceCallerEnabled) VoiceCaller.announceScore(visitScore, nextRemaining);
      setLastAnnouncement(`${visitScore} anotados`);
    }

    // Sumar estadísticas
    setTotalPointsScored((prev) => {
      const c: [number, number] = [...prev];
      c[pIdx] += visitScore;
      return c;
    });
    setDartsThrownLeg((prev) => {
      const c: [number, number] = [...prev];
      c[pIdx] += 3;
      return c;
    });
    setTotalDartsThrownMatch((prev) => {
      const c: [number, number] = [...prev];
      c[pIdx] += 3;
      return c;
    });

    // ¿Es checkout / Cierre de Pierna?
    if (nextRemaining === 0) {
      // Cerró la pierna!
      if (soundFxEnabled) SoundEngine.playGameShot();
      if (voiceCallerEnabled) VoiceCaller.speak(`¡Game Shot! Pierna para ${pIdx === 0 ? player1Name : player2Name}`);

      // Registrar Checkout más alto
      if (visitScore > highestCheckout[pIdx]) {
        setHighestCheckout((prev) => {
          const c: [number, number] = [...prev];
          c[pIdx] = visitScore;
          return c;
        });
      }

      const nextLegsWon = [...legsWon] as [number, number];
      nextLegsWon[pIdx] += 1;
      setLegsWon(nextLegsWon);

      // ¿Ganó el partido?
      if (nextLegsWon[pIdx] >= targetLegsToWin) {
        setMatchWinner(pIdx);
        confetti({
          particleCount: 250,
          spread: 120,
          origin: { y: 0.5 }
        });
        SoundEngine.playSabotageCelebration();
        if (voiceCallerEnabled) {
          VoiceCaller.speak(`¡Game shot and the match! ¡Victoria para ${pIdx === 0 ? player1Name : player2Name}!`);
        }
        return;
      }

      // Siguiente pierna
      setScores([startingScore, startingScore]);
      setLegNumber((prev) => prev + 1);
      setDartsThrownLeg([0, 0]);
      // Quien empieza la siguiente pierna rota
      setCurrentTurn(legNumber % 2 === 0 ? 0 : 1);
      return;
    }

    // Actualizar puntaje restante
    setScores((prev) => {
      const copy: [number, number] = [...prev];
      copy[pIdx] = nextRemaining;
      return copy;
    });

    // Si quedó en tiro de cierre, el caller puede anunciarlo
    if (voiceCallerEnabled && nextRemaining <= 170) {
      setTimeout(() => {
        VoiceCaller.announceCheckoutOpportunity(nextRemaining);
      }, 900);
    }

    // Cambiar turno
    setCurrentTurn(pIdx === 0 ? 1 : 0);
  };

  // Manejo de Cricket
  const handleCricketHit = (playerIdx: 0 | 1, target: string, count: number) => {
    if (matchWinner !== null) return;
    const current = cricketMarks[playerIdx][target] || 0;
    const newMarks = Math.min(3, current + count);
    const overflow = Math.max(0, current + count - 3);

    const opponentIdx = playerIdx === 0 ? 1 : 0;
    const opponentMarks = cricketMarks[opponentIdx][target] || 0;

    // Actualizar marcas
    setCricketMarks((prev) => {
      const next: [CricketMarkState, CricketMarkState] = [{ ...prev[0] }, { ...prev[1] }];
      next[playerIdx][target] = newMarks;
      return next;
    });

    // Si el oponente no lo tiene cerrado y hay desborde, sumar puntos
    if (overflow > 0 && opponentMarks < 3) {
      const targetValue = target === '25' ? 25 : parseInt(target, 10);
      const pointsScored = overflow * targetValue;
      setCricketPoints((prev) => {
        const copy: [number, number] = [...prev];
        copy[playerIdx] += pointsScored;
        return copy;
      });
      if (soundFxEnabled) SoundEngine.playBullseye();
    } else {
      if (soundFxEnabled) SoundEngine.playDartHit();
    }
  };

  // Deshacer (Undo)
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setScores(lastState.scores);
    setLegsWon(lastState.legsWon);
    setLegNumber(lastState.legNumber);
    setCurrentTurn(lastState.currentTurn);
    setDartsThrownLeg(lastState.dartsThrownLeg);
    setTotalPointsScored(lastState.totalPointsScored);
    setTotalDartsThrownMatch(lastState.totalDartsThrownMatch);
    setCount180s(lastState.count180s);
    setCount140s(lastState.count140s);
    setCount100s(lastState.count100s);
    setHighestCheckout(lastState.highestCheckout);
    setMatchWinner(null);
    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 p-2 sm:p-4">
      {/* Barra Superior de Control del Anotador */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1222] border border-slate-800 rounded-2xl p-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base">
                {gameType === 'X01' ? `${startingScore}` : 'CRICKET'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-extrabold bg-slate-800 text-emerald-400 border border-slate-700">
                {outMode.replace('_', ' ')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
                Leg {legNumber} • Mejor de {bestOfLegs}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {isVsCpu ? `Entrenamiento vs Bot (${cpuDifficulty})` : 'Partido 2 Jugadores'}
            </span>
          </div>
        </div>

        {/* Controles de Audio y Ajustes */}
        <div className="flex items-center gap-2">
          {/* Toggle Caller de Voz */}
          <button
            type="button"
            onClick={() => setVoiceCallerEnabled(!voiceCallerEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              voiceCallerEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
            title="Activar/Desactivar Árbitro de Voz"
          >
            {voiceCallerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Caller {voiceCallerEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Botón Configuración */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 text-xs font-semibold transition-all"
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Configuración</span>
          </button>

          {/* Botón Reiniciar */}
          <button
            type="button"
            onClick={() => resetMatch()}
            className="p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all"
            title="Reiniciar Partido"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ANUNCIADOR DINÁMICO */}
      {lastAnnouncement && (
        <div className="text-center py-1.5 px-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400 animate-pulse">
          📢 {lastAnnouncement}
        </div>
      )}

      {/* PANTALLA PRINCIPAL DE PUNTAJES (MARCADOR ESTILO MY DART TRAINING) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* JUGADOR 1 */}
        <div
          className={`relative rounded-3xl p-4 sm:p-6 transition-all duration-300 border flex flex-col justify-between ${
            currentTurn === 0
              ? 'bg-gradient-to-b from-[#132238] to-[#0e1726] border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/40'
              : 'bg-[#0f172a]/70 border-slate-800 opacity-80'
          }`}
        >
          {/* Header Jugador 1 */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  {player1Name}
                  {currentTurn === 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </h3>
                <span className="text-[11px] font-bold text-emerald-400">
                  Piernas: {legsWon[0]} / {targetLegsToWin}
                </span>
              </div>
            </div>

            {/* Piernas Ganadas */}
            <div className="flex gap-1">
              {Array.from({ length: targetLegsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-5 rounded-sm ${
                    i < legsWon[0] ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Puntaje Gigante Jugador 1 */}
          <div className="py-6 sm:py-8 text-center">
            {gameType === 'X01' ? (
              <div className="space-y-1">
                <span className="font-black text-6xl sm:text-8xl tracking-tight text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  {scores[0]}
                </span>
                <div className="text-xs font-semibold text-slate-400">
                  Dardos en pierna: <strong className="text-white">{dartsThrownLeg[0]}</strong>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-black text-5xl sm:text-7xl tracking-tight text-emerald-400 font-mono">
                  {cricketPoints[0]} pts
                </span>
              </div>
            )}
          </div>

          {/* Estadísticas en Vivo Jugador 1 */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">AVG</span>
              <span className="font-extrabold text-emerald-400 text-sm font-mono">
                {calcAvg(0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">180s</span>
              <span className="font-extrabold text-amber-400 text-sm">{count180s[0]}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cierre Max</span>
              <span className="font-extrabold text-cyan-400 text-sm">
                {highestCheckout[0] > 0 ? highestCheckout[0] : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* JUGADOR 2 / BOT CPU */}
        <div
          className={`relative rounded-3xl p-4 sm:p-6 transition-all duration-300 border flex flex-col justify-between ${
            currentTurn === 1
              ? 'bg-gradient-to-b from-[#132238] to-[#0e1726] border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/40'
              : 'bg-[#0f172a]/70 border-slate-800 opacity-80'
          }`}
        >
          {/* Header Jugador 2 */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                isVsCpu 
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' 
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                {isVsCpu ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  {isVsCpu ? `CPU (${cpuDifficulty})` : player2Name}
                  {currentTurn === 1 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </h3>
                <span className="text-[11px] font-bold text-emerald-400">
                  Piernas: {legsWon[1]} / {targetLegsToWin}
                </span>
              </div>
            </div>

            {/* Piernas Ganadas */}
            <div className="flex gap-1">
              {Array.from({ length: targetLegsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-5 rounded-sm ${
                    i < legsWon[1] ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Puntaje Gigante Jugador 2 */}
          <div className="py-6 sm:py-8 text-center">
            {gameType === 'X01' ? (
              <div className="space-y-1">
                <span className="font-black text-6xl sm:text-8xl tracking-tight text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  {scores[1]}
                </span>
                <div className="text-xs font-semibold text-slate-400">
                  Dardos en pierna: <strong className="text-white">{dartsThrownLeg[1]}</strong>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="font-black text-5xl sm:text-7xl tracking-tight text-emerald-400 font-mono">
                  {cricketPoints[1]} pts
                </span>
              </div>
            )}
          </div>

          {/* Estadísticas en Vivo Jugador 2 */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">AVG</span>
              <span className="font-extrabold text-emerald-400 text-sm font-mono">
                {calcAvg(1)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">180s</span>
              <span className="font-extrabold text-amber-400 text-sm">{count180s[1]}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cierre Max</span>
              <span className="font-extrabold text-cyan-400 text-sm">
                {highestCheckout[1] > 0 ? highestCheckout[1] : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GUÍA DE CHECKOUT ACTIVA PARA EL JUGADOR DE TURNO */}
      {gameType === 'X01' && (
        <CheckoutGuide
          remaining={scores[currentTurn]}
          isDoubleOut={outMode === 'DOUBLE_OUT'}
        />
      )}

      {/* TABLERO DE CRICKET (SI EL MODO ES CRICKET) */}
      {gameType === 'CRICKET' && (
        <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h4 className="text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
            Tablero de Marcas Cricket (15 al 20 & Bull)
          </h4>
          <div className="space-y-2">
            {cricketTargets.map((target) => {
              const p1Marks = cricketMarks[0][target] || 0;
              const p2Marks = cricketMarks[1][target] || 0;

              const renderMark = (count: number) => {
                if (count === 1) return '/';
                if (count === 2) return '✕';
                if (count >= 3) return '⨂';
                return '-';
              };

              return (
                <div
                  key={target}
                  className="grid grid-cols-3 items-center py-2 px-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-black text-lg text-emerald-400 w-8">
                      {renderMark(p1Marks)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCricketHit(0, target, 1)}
                      className="px-2 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 rounded text-xs font-bold"
                    >
                      +1
                    </button>
                  </div>

                  <span className="font-black text-sm text-white uppercase tracking-wider">
                    {target === '25' ? '🎯 BULL' : target}
                  </span>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCricketHit(1, target, 1)}
                      className="px-2 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 rounded text-xs font-bold"
                    >
                      +1
                    </button>
                    <span className="font-mono font-black text-lg text-emerald-400 w-8">
                      {renderMark(p2Marks)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TECLADO NUMÉRICO TÁCTIL (ESTILO MY DART TRAINING) */}
      {gameType === 'X01' && (
        <DartKeypad
          onConfirmVisit={(score) => handleScoreInput(score)}
          onUndo={handleUndo}
          canUndo={history.length > 0}
          remainingScore={scores[currentTurn]}
          isDoubleOutRequired={outMode === 'DOUBLE_OUT'}
        />
      )}

      {/* MODAL DE VICTORIA / GAME SHOT AND THE MATCH */}
      {matchWinner !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101729] border border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl shadow-emerald-500/20 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center mb-4 text-emerald-300">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
              ¡VICTORIA!
            </h2>
            <p className="text-emerald-400 font-extrabold text-lg mb-6">
              {matchWinner === 0 ? player1Name : isVsCpu ? 'CPU' : player2Name} ha ganado el partido
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 grid grid-cols-2 gap-4 text-left mb-6 text-xs">
              <div>
                <span className="text-slate-400 block">Piernas Ganadas:</span>
                <strong className="text-white text-base">
                  {legsWon[0]} - {legsWon[1]}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Promedio Final ({player1Name}):</span>
                <strong className="text-emerald-400 text-base">{calcAvg(0)} AVG</strong>
              </div>
              <div>
                <span className="text-slate-400 block">180s en Partido:</span>
                <strong className="text-amber-400 text-base">
                  {count180s[0] + count180s[1]}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Mayor Cierre:</span>
                <strong className="text-cyan-400 text-base">
                  {Math.max(highestCheckout[0], highestCheckout[1])}
                </strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => resetMatch()}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/30"
              >
                Revancha / Nuevo Partido
              </button>
              <button
                type="button"
                onClick={() => setMatchWinner(null)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURACIÓN DE PARTIDA */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101729] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-400" />
              Configurar Partida
            </h3>

            <div className="space-y-4 text-left text-xs">
              {/* Modo de juego */}
              <div>
                <label className="text-slate-400 font-bold block mb-1.5 uppercase">
                  Modo de Juego
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGameType('X01')}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      gameType === 'X01'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    X01 Clásico
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameType('CRICKET')}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      gameType === 'CRICKET'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Cricket
                  </button>
                </div>
              </div>

              {/* Puntos X01 */}
              {gameType === 'X01' && (
                <div>
                  <label className="text-slate-400 font-bold block mb-1.5 uppercase">
                    Puntuación Inicial
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[170, 301, 501, 701].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => {
                          setStartingScore(pts as any);
                          resetMatch(pts as any);
                        }}
                        className={`p-2 rounded-xl font-bold border transition-all ${
                          startingScore === pts
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {pts}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Regla de Cierre */}
              {gameType === 'X01' && (
                <div>
                  <label className="text-slate-400 font-bold block mb-1.5 uppercase">
                    Condición de Salida / Cierre
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'SINGLE_OUT', label: 'Single Out' },
                      { key: 'DOUBLE_OUT', label: 'Double Out' },
                      { key: 'MASTER_OUT', label: 'Master Out' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setOutMode(opt.key as any)}
                        className={`p-2 rounded-xl font-bold border text-[11px] transition-all ${
                          outMode === opt.key
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Modo Vs CPU */}
              <div>
                <label className="text-slate-400 font-bold block mb-1.5 uppercase">
                  Oponente
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setIsVsCpu(false)}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      !isVsCpu
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Jugador vs Jugador
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVsCpu(true)}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      isVsCpu
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Entrenar vs CPU
                  </button>
                </div>

                {isVsCpu && (
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[
                      { key: 'BEGINNER', label: 'Principiante (~40)' },
                      { key: 'MEDIUM', label: 'Medio (~55)' },
                      { key: 'ADVANCED', label: 'Avanzado (~70)' },
                      { key: 'PRO', label: 'Pro (~85)' }
                    ].map((diff) => (
                      <button
                        key={diff.key}
                        type="button"
                        onClick={() => setCpuDifficulty(diff.key as any)}
                        className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                          cpuDifficulty === diff.key
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mejor de Legs */}
              <div>
                <label className="text-slate-400 font-bold block mb-1.5 uppercase">
                  Distancia de Piernas (Best of Legs)
                </label>
                <div className="flex gap-2">
                  {[1, 3, 5, 7, 9].map((legs) => (
                    <button
                      key={legs}
                      type="button"
                      onClick={() => setBestOfLegs(legs)}
                      className={`flex-1 py-2 rounded-xl font-bold border ${
                        bestOfLegs === legs
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {legs}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all"
              >
                Guardar y Volver a la Partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
