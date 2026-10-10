'use client';

import React, { useState } from 'react';
import { MatchConfig, DartThrow } from '@/lib/types';
import { SoundEngine, VoiceCaller } from '@/lib/sound-effects';
import { CHECKOUT_GUIDE } from '@/lib/constants';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  X, 
  Save, 
  Wrench, 
  RotateCcw, 
  Trophy, 
  BarChart3, 
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

interface X01BoardProps {
  config: MatchConfig;
  onExit: () => void;
  onMatchComplete: (stats: any) => void;
  voiceCallerEnabled: boolean;
  soundFxEnabled: boolean;
  onOpenStats: () => void;
}

export const X01Board: React.FC<X01BoardProps> = ({
  config,
  onExit,
  onMatchComplete,
  voiceCallerEnabled,
  soundFxEnabled,
  onOpenStats
}) => {
  // Puntuaciones restantes
  const [scores, setScores] = useState<[number, number]>([
    config.startingScore,
    config.startingScore
  ]);

  // Turno actual: 0 (P1) o 1 (P2)
  const [currentTurn, setCurrentTurn] = useState<0 | 1>(0);

  // Saque inicial del leg actual
  const [starterTurn, setStarterTurn] = useState<0 | 1>(0);

  // Sub-turnos para parejas (0 o 1 de cada pareja)
  const [p1TeammateTurn, setP1TeammateTurn] = useState<0 | 1>(0);
  const [p2TeammateTurn, setP2TeammateTurn] = useState<0 | 1>(0);

  // Sets y Legs ganados
  const [setsWon, setSetsWon] = useState<[number, number]>([0, 0]);
  const [legsWon, setLegsWon] = useState<[number, number]>([0, 0]);

  // Entrada numérica tecleada
  const [typedInput, setTypedInput] = useState<string>('');
  const [isRemainingInputMode, setIsRemainingInputMode] = useState<boolean>(false);

  // Métricas acumuladas del partido
  const [dartsThrownLeg, setDartsThrownLeg] = useState<[number, number]>([0, 0]);
  const [totalPointsMatch, setTotalPointsMatch] = useState<[number, number]>([0, 0]);
  const [totalDartsMatch, setTotalDartsMatch] = useState<[number, number]>([0, 0]);

  // First 9 tracking
  const [first9Points, setFirst9Points] = useState<[number, number]>([0, 0]);
  const [first9Darts, setFirst9Darts] = useState<[number, number]>([0, 0]);

  // Hitos
  const [count100s, setCount100s] = useState<[number, number]>([0, 0]);
  const [count140s, setCount140s] = useState<[number, number]>([0, 0]);
  const [count180s, setCount180s] = useState<[number, number]>([0, 0]);
  const [highestCheckout, setHighestCheckout] = useState<[number, number]>([0, 0]);
  const [bestLegDarts, setBestLegDarts] = useState<[number, number]>([99, 99]);

  // Historial de la partida para deshacer
  const [history, setHistory] = useState<any[]>([]);

  // Mensaje flotante de feedback (Bust, 180, Game Shot)
  const [feedbackBanner, setFeedbackBanner] = useState<{ text: string; color: string } | null>(null);

  // Cálculo de promedio 3-Darts
  const getAvg = (playerIdx: 0 | 1) => {
    const darts = totalDartsMatch[playerIdx];
    if (darts === 0) return '0.00';
    return ((totalPointsMatch[playerIdx] / darts) * 3).toFixed(2);
  };

  // Cálculo de First 9 AVG
  const getFirst9Avg = (playerIdx: 0 | 1) => {
    const darts = first9Darts[playerIdx];
    if (darts === 0) return '0.00';
    return ((first9Points[playerIdx] / darts) * 3).toFixed(2);
  };

  // Nombres de los jugadores en pantalla
  const p1Display = config.player1.name;
  const p2Display = config.player2.name;

  // Quién tira específicamente si es parejas
  const getCurrentShooterName = () => {
    if (!config.isDoubles) {
      return currentTurn === 0 ? p1Display : p2Display;
    }
    if (currentTurn === 0) {
      return p1TeammateTurn === 0
        ? config.player1.name
        : config.player1.teammateName || 'Compañero 1';
    } else {
      return p2TeammateTurn === 0
        ? config.player2.name
        : config.player2.teammateName || 'Compañero 2';
    }
  };

  // Alerta de feedback temporal
  const showFeedback = (text: string, color: string) => {
    setFeedbackBanner({ text, color });
    setTimeout(() => setFeedbackBanner(null), 2500);
  };

  // Procesar entrada de puntuación
  const submitScore = (score: number) => {
    if (isNaN(score) || score < 0 || score > 180) {
      showFeedback('Puntuación inválida (máx 180)', '#ef4444');
      return;
    }

    const currentScore = scores[currentTurn];
    const newRemaining = currentScore - score;

    // Snapshot para deshacer
    const snapshot = {
      scores: [...scores],
      currentTurn,
      starterTurn,
      p1TeammateTurn,
      p2TeammateTurn,
      legsWon: [...legsWon],
      setsWon: [...setsWon],
      dartsThrownLeg: [...dartsThrownLeg],
      totalPointsMatch: [...totalPointsMatch],
      totalDartsMatch: [...totalDartsMatch],
      first9Points: [...first9Points],
      first9Darts: [...first9Darts],
      count100s: [...count100s],
      count140s: [...count140s],
      count180s: [...count180s],
      highestCheckout: [...highestCheckout],
      bestLegDarts: [...bestLegDarts]
    };

    // Validar BUST
    const isBust = 
      newRemaining < 0 || 
      newRemaining === 1 || 
      (newRemaining === 0 && config.outMode === 'DOUBLE_OUT' && score === 1); // Cierre debe ser par/doble

    if (isBust) {
      if (soundFxEnabled) SoundEngine.playBust();
      if (voiceCallerEnabled) VoiceCaller.speakBust();
      showFeedback('¡BUST! (Pasado)', '#ef4444');

      // Actualizar solo dardos tirados (3 dardos de visita fallida)
      const newDartsLeg = [...dartsThrownLeg] as [number, number];
      newDartsLeg[currentTurn] += 3;
      setDartsThrownLeg(newDartsLeg);

      const newTotalDarts = [...totalDartsMatch] as [number, number];
      newTotalDarts[currentTurn] += 3;
      setTotalDartsMatch(newTotalDarts);

      setHistory([...history, snapshot]);
      setTypedInput('');
      advanceTurn();
      return;
    }

    // Tiro Válido
    if (soundFxEnabled) SoundEngine.playDartHit();

    // Actualizar conteo de hitos
    const new100s = [...count100s] as [number, number];
    const new140s = [...count140s] as [number, number];
    const new180s = [...count180s] as [number, number];

    if (score === 180) {
      new180s[currentTurn] += 1;
      setCount180s(new180s);
      if (soundFxEnabled) SoundEngine.play180();
      if (voiceCallerEnabled) VoiceCaller.speakScore(180);
      showFeedback('¡¡¡180 MÁXIMO PERFECTO!!!', '#00e676');
    } else if (score >= 140) {
      new140s[currentTurn] += 1;
      setCount140s(new140s);
      if (voiceCallerEnabled) VoiceCaller.speakScore(score);
    } else if (score >= 100) {
      new100s[currentTurn] += 1;
      setCount100s(new100s);
      if (voiceCallerEnabled) VoiceCaller.speakScore(score);
    } else if (score > 0) {
      if (voiceCallerEnabled) VoiceCaller.speakScore(score);
    }

    // Acumuladores
    const newDartsLeg = [...dartsThrownLeg] as [number, number];
    newDartsLeg[currentTurn] += 3;
    setDartsThrownLeg(newDartsLeg);

    const newTotalPoints = [...totalPointsMatch] as [number, number];
    newTotalPoints[currentTurn] += score;
    setTotalPointsMatch(newTotalPoints);

    const newTotalDarts = [...totalDartsMatch] as [number, number];
    newTotalDarts[currentTurn] += 3;
    setTotalDartsMatch(newTotalDarts);

    // First 9 tracking
    if (dartsThrownLeg[currentTurn] < 9) {
      const newF9Pts = [...first9Points] as [number, number];
      newF9Pts[currentTurn] += score;
      setFirst9Points(newF9Pts);

      const newF9Darts = [...first9Darts] as [number, number];
      newF9Darts[currentTurn] += 3;
      setFirst9Darts(newF9Darts);
    }

    // Actualizar marcador
    const updatedScores = [...scores] as [number, number];
    updatedScores[currentTurn] = newRemaining;
    setScores(updatedScores);
    setHistory([...history, snapshot]);
    setTypedInput('');

    // ¿LEG GANADO?
    if (newRemaining === 0) {
      handleLegWin(score);
    } else {
      advanceTurn();
    }
  };

  // Victoria de Leg
  const handleLegWin = (checkoutScore: number) => {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    if (soundFxEnabled) SoundEngine.playGameShot();
    if (voiceCallerEnabled) VoiceCaller.speakGameShot();

    // High Checkout
    const newHighCo = [...highestCheckout] as [number, number];
    if (checkoutScore > newHighCo[currentTurn]) {
      newHighCo[currentTurn] = checkoutScore;
      setHighestCheckout(newHighCo);
    }

    // Best Leg
    const dartsThisLeg = dartsThrownLeg[currentTurn] + 3;
    const newBestLeg = [...bestLegDarts] as [number, number];
    if (dartsThisLeg < newBestLeg[currentTurn]) {
      newBestLeg[currentTurn] = dartsThisLeg;
      setBestLegDarts(newBestLeg);
    }

    const newLegsWon = [...legsWon] as [number, number];
    newLegsWon[currentTurn] += 1;
    setLegsWon(newLegsWon);

    const targetLegs = Math.ceil(config.bestOfLegs / 2);

    if (newLegsWon[currentTurn] >= targetLegs) {
      // ¿Victoria de Set o Partido?
      if (config.distanceType === 'SETS') {
        const newSetsWon = [...setsWon] as [number, number];
        newSetsWon[currentTurn] += 1;
        setSetsWon(newSetsWon);

        const targetSets = Math.ceil(config.bestOfSets / 2);
        if (newSetsWon[currentTurn] >= targetSets) {
          finishMatch(currentTurn);
          return;
        } else {
          showFeedback(`¡Set para ${currentTurn === 0 ? p1Display : p2Display}!`, '#00e676');
          resetLeg(true);
        }
      } else {
        finishMatch(currentTurn);
        return;
      }
    } else {
      showFeedback(`¡Leg para ${currentTurn === 0 ? p1Display : p2Display}!`, '#00e676');
      resetLeg(false);
    }
  };

  const resetLeg = (newSet: boolean) => {
    setScores([config.startingScore, config.startingScore]);
    setDartsThrownLeg([0, 0]);
    if (newSet) setLegsWon([0, 0]);

    // Alternar saque
    const nextStarter = starterTurn === 0 ? 1 : 0;
    setStarterTurn(nextStarter);
    setCurrentTurn(nextStarter);
  };

  const finishMatch = (winnerIdx: 0 | 1) => {
    showFeedback(`🏆 ¡VICTORIA DE ${winnerIdx === 0 ? p1Display : p2Display}!`, '#00e676');
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

    setTimeout(() => {
      onMatchComplete({
        winnerIndex: winnerIdx,
        winnerName: winnerIdx === 0 ? p1Display : p2Display,
        scores,
        legsWon,
        setsWon,
        avgP1: getAvg(0),
        avgP2: getAvg(1),
        first9P1: getFirst9Avg(0),
        first9P2: getFirst9Avg(1),
        count100s,
        count140s,
        count180s,
        highestCheckout,
        bestLegDarts
      });
    }, 1800);
  };

  const advanceTurn = () => {
    if (config.isDoubles) {
      if (currentTurn === 0) {
        setP1TeammateTurn(p1TeammateTurn === 0 ? 1 : 0);
      } else {
        setP2TeammateTurn(p2TeammateTurn === 0 ? 1 : 0);
      }
    }
    setCurrentTurn(currentTurn === 0 ? 1 : 0);
  };

  // Botón switch Starter manual
  const handleSwitchStarter = () => {
    const nextTurn = currentTurn === 0 ? 1 : 0;
    setCurrentTurn(nextTurn);
    setStarterTurn(nextTurn);
    showFeedback(`Saque cambiado a ${nextTurn === 0 ? p1Display : p2Display}`, '#ef4444');
  };

  // Botón Deshacer
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setScores(previous.scores);
    setCurrentTurn(previous.currentTurn);
    setStarterTurn(previous.starterTurn);
    setP1TeammateTurn(previous.p1TeammateTurn);
    setP2TeammateTurn(previous.p2TeammateTurn);
    setLegsWon(previous.legsWon);
    setSetsWon(previous.setsWon);
    setDartsThrownLeg(previous.dartsThrownLeg);
    setTotalPointsMatch(previous.totalPointsMatch);
    setTotalDartsMatch(previous.totalDartsMatch);
    setFirst9Points(previous.first9Points);
    setFirst9Darts(previous.first9Darts);
    setCount100s(previous.count100s);
    setCount140s(previous.count140s);
    setCount180s(previous.count180s);
    setHighestCheckout(previous.highestCheckout);
    setBestLegDarts(previous.bestLegDarts);

    setHistory(history.slice(0, -1));
    setTypedInput('');
    showFeedback('Última visita deshecha', '#ef4444');
  };

  // Entrada por teclado numérico
  const handleKeypress = (val: string) => {
    if (typedInput.length >= 3) return;
    setTypedInput((prev) => prev + val);
  };

  const handleClear = () => {
    setTypedInput('');
  };

  const handleConfirmTyped = () => {
    if (!typedInput) return;
    const num = parseInt(typedInput, 10);
    if (isRemainingInputMode) {
      const scored = scores[currentTurn] - num;
      submitScore(scored);
      setIsRemainingInputMode(false);
    } else {
      submitScore(num);
    }
  };

  // Sugerencia de Checkout
  const currentCheckout = CHECKOUT_GUIDE[scores[currentTurn]];

  return (
    <div className="w-full max-w-lg mx-auto bg-[#07090e] border border-[#ef4444]/30 rounded-3xl p-3 sm:p-5 shadow-2xl shadow-black/90 space-y-3.5 select-none">
      {/* Cabecera superior idéntica a la captura */}
      <div className="flex items-center justify-between pb-2 border-b border-[#ef4444]/20">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="p-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                {config.tournamentTitle ? `${config.tournamentTitle} • Oche Asignado` : 'Partida individual'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white leading-tight">
              {config.startingScore}
            </h2>
            <p className="text-[10px] text-slate-400">
              {config.distanceType === 'SETS'
                ? `Al mejor de ${config.bestOfSets} Sets (Legs: ${config.bestOfLegs})`
                : `Al mejor de ${config.bestOfLegs} Legs`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStats}
            title="Estadísticas Oficiales"
            className="p-1.5 rounded-xl bg-[#111622] text-[#00e676] hover:bg-[#182030] border border-[#00e676]/30"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title="Deshacer"
            className="p-1.5 rounded-xl bg-[#111622] text-slate-300 hover:text-white disabled:opacity-30 border border-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onExit}
            title="Cerrar"
            className="p-1.5 rounded-xl bg-[#111622] text-[#ef4444] hover:bg-[#182030] border border-[#ef4444]/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Banner flotante de feedback (Bust, 180, etc.) */}
      {feedbackBanner && (
        <div
          className="text-center py-1.5 px-3 rounded-xl text-xs font-black shadow-lg transition-all animate-pulse"
          style={{ backgroundColor: `${feedbackBanner.color}20`, color: feedbackBanner.color, borderColor: feedbackBanner.color }}
        >
          {feedbackBanner.text}
        </div>
      )}

      {/* Marcador Superior de Jugadores (Cards Enfrentadas) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Jugador 1 */}
        <div
          className={`rounded-2xl p-3 text-center transition-all ${
            currentTurn === 0
              ? 'bg-[#0f1422] border-2 border-[#00e676] shadow-lg shadow-[#00e676]/15'
              : 'bg-[#0f1422]/60 border border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            {currentTurn === 0 && <span className="text-[#00e676] text-xs font-black">▶</span>}
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate max-w-[130px]">
              {p1Display}
            </span>
          </div>
          {config.isDoubles && (
            <div className="text-[10px] text-[#00e676] font-semibold mb-1 truncate">
              {p1TeammateTurn === 0 ? config.player1.name : config.player1.teammateName}
            </div>
          )}

          {/* Puntaje Restante Gigante */}
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight my-1">
            {scores[0]}
          </div>

          <div className="text-[11px] text-slate-400 font-bold">
            Avg. {getAvg(0)} • {dartsThrownLeg[0]} dardos
          </div>
        </div>

        {/* Jugador 2 */}
        <div
          className={`rounded-2xl p-3 text-center transition-all ${
            currentTurn === 1
              ? 'bg-[#0f1422] border-2 border-[#00e676] shadow-lg shadow-[#00e676]/15'
              : 'bg-[#0f1422]/60 border border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            {currentTurn === 1 && <span className="text-[#00e676] text-xs font-black">▶</span>}
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate max-w-[130px]">
              {p2Display}
            </span>
          </div>
          {config.isDoubles && (
            <div className="text-[10px] text-[#00e676] font-semibold mb-1 truncate">
              {p2TeammateTurn === 0 ? config.player2.name : config.player2.teammateName}
            </div>
          )}

          {/* Puntaje Restante Gigante */}
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight my-1">
            {scores[1]}
          </div>

          <div className="text-[11px] text-slate-400 font-bold">
            Avg. {getAvg(1)} • {dartsThrownLeg[1]} dardos
          </div>
        </div>
      </div>

      {/* Barra de Sets / Legs (S/L) idéntica a la captura */}
      <div className="flex items-center justify-between px-6 py-1 bg-white rounded-lg text-slate-900 font-black text-xs sm:text-sm shadow-md">
        <span>{config.distanceType === 'SETS' ? setsWon[0] : legsWon[0]}</span>
        <span className="text-slate-600 tracking-widest text-[11px]">S/L</span>
        <span>{config.distanceType === 'SETS' ? setsWon[1] : legsWon[1]}</span>
      </div>

      {/* Fila de controles rápidos y display de entrada */}
      <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2 items-center">
        <button
          onClick={handleSwitchStarter}
          className="py-2.5 px-2 rounded-xl bg-[#111622] hover:bg-[#1a2234] border border-[#ef4444]/40 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#ef4444]" />
          <span>switch Starter</span>
        </button>

        {/* Display central con borde diana */}
        <div
          onClick={handleConfirmTyped}
          className={`h-11 rounded-xl bg-[#07090e] border-2 flex items-center justify-center font-black text-xl transition-all cursor-pointer ${
            typedInput
              ? 'border-[#00e676] text-[#00e676] bg-[#00e676]/10 shadow-md shadow-[#00e676]/20'
              : 'border-[#ef4444]/40 text-slate-500'
          }`}
        >
          {typedInput ? typedInput : isRemainingInputMode ? 'Ingresá Restante' : 'Tirada'}
        </div>

        <button
          onClick={() => setIsRemainingInputMode(!isRemainingInputMode)}
          className={`py-2.5 px-2 rounded-xl border text-[11px] font-black tracking-wider transition-colors ${
            isRemainingInputMode
              ? 'bg-[#ef4444] text-white border-[#ef4444]'
              : 'bg-[#111622] text-slate-300 border-slate-700 hover:border-slate-500'
          }`}
        >
          REMAINING
        </button>
      </div>

      {/* Sugerencia de Checkout Interactiva */}
      {currentCheckout && (
        <div className="bg-[#111622] border border-[#00e676]/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Cierre sugerido ({scores[currentTurn]}):</span>
          <span className="text-[#00e676] font-black tracking-wider">{currentCheckout}</span>
        </div>
      )}

      {/* TECLADO ERGONÓMICO DE 5 COLUMNAS IDÉNTICO A LA CAPTURA */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* FILA 1 */}
        <button
          onClick={() => submitScore(26)}
          className="py-3 sm:py-3.5 rounded-xl bg-[#111622] hover:bg-[#182030] text-white font-black text-base border border-[#00e676]/40 shadow-sm"
        >
          26
        </button>
        <button
          onClick={() => handleKeypress('1')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          1
        </button>
        <button
          onClick={() => handleKeypress('2')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          2
        </button>
        <button
          onClick={() => handleKeypress('3')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          3
        </button>
        <button
          onClick={() => submitScore(60)}
          className="py-3 sm:py-3.5 rounded-xl bg-[#111622] hover:bg-[#182030] text-white font-black text-base border border-[#00e676]/40 shadow-sm"
        >
          60
        </button>

        {/* FILA 2 */}
        <button
          onClick={() => submitScore(41)}
          className="py-3 sm:py-3.5 rounded-xl bg-[#111622] hover:bg-[#182030] text-white font-black text-base border border-[#00e676]/40 shadow-sm"
        >
          41
        </button>
        <button
          onClick={() => handleKeypress('4')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          4
        </button>
        <button
          onClick={() => handleKeypress('5')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          5
        </button>
        <button
          onClick={() => handleKeypress('6')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          6
        </button>
        <button
          onClick={() => submitScore(85)}
          className="py-3 sm:py-3.5 rounded-xl bg-[#111622] hover:bg-[#182030] text-white font-black text-base border border-[#00e676]/40 shadow-sm"
        >
          85
        </button>

        {/* FILA 3 */}
        <button
          onClick={() => submitScore(45)}
          className="py-3 sm:py-3.5 rounded-xl bg-[#111622] hover:bg-[#182030] text-white font-black text-base border border-[#00e676]/40 shadow-sm"
        >
          45
        </button>
        <button
          onClick={() => handleKeypress('7')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          7
        </button>
        <button
          onClick={() => handleKeypress('8')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          8
        </button>
        <button
          onClick={() => handleKeypress('9')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          9
        </button>
        <button
          onClick={() => submitScore(100)}
          className="py-3 sm:py-3.5 rounded-xl bg-[#111622] hover:bg-[#182030] text-white font-black text-base border border-[#00e676]/40 shadow-sm"
        >
          100
        </button>

        {/* FILA 4 (CLR en Rojo Diana, 0, no Score en Carmesí) */}
        <button
          onClick={handleClear}
          className="py-3 sm:py-3.5 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] font-black text-sm border border-[#ef4444]/50 flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CLR</span>
        </button>
        <button
          onClick={handleConfirmTyped}
          disabled={!typedInput}
          className="py-3 sm:py-3.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-sm border border-[#00e676] disabled:opacity-30 disabled:bg-[#111622] disabled:text-slate-600 disabled:border-slate-800"
        >
          OK
        </button>
        <button
          onClick={() => handleKeypress('0')}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-white font-black text-lg border border-slate-800"
        >
          0
        </button>
        <button
          onClick={() => {
            if (typedInput.length > 0) {
              setTypedInput(typedInput.slice(0, -1));
            }
          }}
          className="py-3 sm:py-3.5 rounded-xl bg-[#0f1422] hover:bg-[#182030] text-slate-400 font-black text-base border border-slate-800"
        >
          ←
        </button>
        <button
          onClick={() => submitScore(0)}
          className="py-3 sm:py-3.5 rounded-xl bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] font-black text-xs border border-[#ef4444]/40 leading-tight"
        >
          no Score
        </button>
      </div>

      {/* Indicador de tirador activo al pie */}
      <div className="text-center pt-1 text-xs text-slate-400">
        Turno de tiro en el oche: <span className="font-black text-[#00e676]">{getCurrentShooterName()}</span>
      </div>
    </div>
  );
};
