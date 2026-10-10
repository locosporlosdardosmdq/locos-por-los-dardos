'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DartKeypad } from './DartKeypad';
import { CheckoutGuide } from './CheckoutGuide';
import { SoundEngine, VoiceCaller } from '@/lib/sound-effects';
import { saveCompletedMatch } from '@/lib/storage';
import { matchBroadcast } from '@/lib/broadcast';
import { 
  GameType, 
  OutMode, 
  CpuDifficulty, 
  DartThrow, 
  CricketMarkState 
} from '@/lib/types';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Trophy, 
  Bot, 
  User, 
  Settings2, 
  Sparkles,
  Target,
  Flame,
  Award
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

  // Estado de Entrenamiento Round the Clock (1..20 y Bull)
  const [rtcTarget, setRtcTarget] = useState<number>(1);
  const [rtcHits, setRtcHits] = useState<number>(0);

  // Opciones de audio
  const [voiceCallerEnabled, setVoiceCallerEnabled] = useState(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);

  // Fin de partido
  const [matchWinner, setMatchWinner] = useState<number | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');

  const targetLegsToWin = Math.ceil(bestOfLegs / 2);

  // Reiniciar estado
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
    setRtcTarget(1);
    setRtcHits(0);
  };

  // Turno de la CPU
  useEffect(() => {
    if (isVsCpu && currentTurn === 1 && matchWinner === null && gameType === 'X01') {
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

    let simulatedScore = 0;

    if (cpuRemaining <= 170 && outMode === 'DOUBLE_OUT') {
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

    const randomVariation = (Math.random() - 0.5) * 40;
    simulatedScore = Math.max(0, Math.min(180, Math.round(meanScores + randomVariation)));

    if (simulatedScore > cpuRemaining || (outMode === 'DOUBLE_OUT' && cpuRemaining - simulatedScore === 1)) {
      simulatedScore = 0;
    }

    handleScoreInput(simulatedScore, 1);
  };

  // Procesar entrada de puntuación (X01)
  const handleScoreInput = (visitScore: number, explicitPlayerIndex?: 0 | 1) => {
    if (matchWinner !== null) return;

    const pIdx = explicitPlayerIndex !== undefined ? explicitPlayerIndex : currentTurn;
    const currentRemaining = scores[pIdx];

    // Historial para UNDO
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

    if (isBust) {
      if (soundFxEnabled) SoundEngine.playBust();
      if (voiceCallerEnabled) VoiceCaller.announceBust();
      setLastAnnouncement(`¡Bust! Quedan ${currentRemaining}`);

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

      setCurrentTurn(pIdx === 0 ? 1 : 0);
      return;
    }

    // Efectos de visitas clave (Colores Diana Samurai 4)
    if (visitScore === 180) {
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#00b853', '#e52521', '#1d68ed', '#efe7d8'] // Colores de la diana
      });
      if (soundFxEnabled) SoundEngine.playBullseye();
      if (voiceCallerEnabled) VoiceCaller.announceScore(180, nextRemaining);
      setLastAnnouncement('🎯 ¡ONE HUNDRED AND EIGHTY! ¡180 PERFECTO!');
      setCount180s((prev) => {
        const c: [number, number] = [...prev];
        c[pIdx] += 1;
        return c;
      });
    } else if (visitScore >= 140) {
      if (soundFxEnabled) SoundEngine.playDartHit();
      if (voiceCallerEnabled) VoiceCaller.announceScore(visitScore, nextRemaining);
      setLastAnnouncement(`¡${visitScore}! Visita Sobresaliente`);
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

    // Cierre de pierna (Game Shot)
    if (nextRemaining === 0) {
      if (soundFxEnabled) SoundEngine.playGameShot();
      if (voiceCallerEnabled) VoiceCaller.speak(`¡Game Shot! Pierna para ${pIdx === 0 ? player1Name : player2Name}`);

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

      if (nextLegsWon[pIdx] >= targetLegsToWin) {
        setMatchWinner(pIdx);
        saveCompletedMatch({
          gameType: 'X01',
          legsTotal: bestOfLegs,
          winnerName: pIdx === 0 ? player1Name : player2Name,
          players: [
            {
              name: player1Name,
              score: scores[0],
              avg: parseFloat(calcAvg(0)),
              first9Avg: parseFloat(calcAvg(0)),
              legsWon: nextLegsWon[0],
              dartsThrown: totalDartsThrownMatch[0],
              isWinner: pIdx === 0,
            },
            {
              name: player2Name,
              score: scores[1],
              avg: parseFloat(calcAvg(1)),
              first9Avg: parseFloat(calcAvg(1)),
              legsWon: nextLegsWon[1],
              dartsThrown: totalDartsThrownMatch[1],
              isWinner: pIdx === 1,
            }
          ]
        });
        matchBroadcast.publish({
          matchId: 'live_match_main',
          gameType: 'X01',
          player1Name,
          player1Score: 0,
          player1Avg: parseFloat(calcAvg(0)),
          player1Legs: nextLegsWon[0],
          player2Name,
          player2Score: scores[1],
          player2Avg: parseFloat(calcAvg(1)),
          player2Legs: nextLegsWon[1],
          currentTurnIndex: pIdx,
          lastScore: visitScore,
          lastDarts: [],
          status: 'FINISHED',
          winner: pIdx === 0 ? player1Name : player2Name,
        });
        confetti({
          particleCount: 260,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#00b853', '#e52521', '#1d68ed', '#efe7d8']
        });
        SoundEngine.playSabotageCelebration();
        if (voiceCallerEnabled) {
          VoiceCaller.speak(`¡Game shot and the match! ¡Victoria para ${pIdx === 0 ? player1Name : player2Name}!`);
        }
        return;
      }

      setScores([startingScore, startingScore]);
      setLegNumber((prev) => prev + 1);
      setDartsThrownLeg([0, 0]);
      setCurrentTurn(legNumber % 2 === 0 ? 0 : 1);
      return;
    }

    setScores((prev) => {
      const copy: [number, number] = [...prev];
      copy[pIdx] = nextRemaining;
      return copy;
    });

    matchBroadcast.publish({
      matchId: 'live_match_main',
      gameType: 'X01',
      player1Name,
      player1Score: pIdx === 0 ? nextRemaining : scores[0],
      player1Avg: parseFloat(calcAvg(0)),
      player1Legs: legsWon[0],
      player2Name,
      player2Score: pIdx === 1 ? nextRemaining : scores[1],
      player2Avg: parseFloat(calcAvg(1)),
      player2Legs: legsWon[1],
      currentTurnIndex: pIdx === 0 ? 1 : 0,
      lastScore: visitScore,
      lastDarts: [],
      status: 'IN_PROGRESS',
    });

    if (voiceCallerEnabled && nextRemaining <= 170) {
      setTimeout(() => {
        VoiceCaller.announceCheckoutOpportunity(nextRemaining);
      }, 900);
    }

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

    setCricketMarks((prev) => {
      const next: [CricketMarkState, CricketMarkState] = [{ ...prev[0] }, { ...prev[1] }];
      next[playerIdx][target] = newMarks;
      return next;
    });

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

  // Manejo de Entrenamiento Round the Clock
  const handleRtcHit = () => {
    if (soundFxEnabled) SoundEngine.playDartHit();
    if (rtcTarget >= 20) {
      if (soundFxEnabled) SoundEngine.playGameShot();
      confetti({ particleCount: 150 });
      alert('¡Felicitaciones! Has completado el recorrido completo de la diana 1 al 20.');
      setRtcTarget(1);
    } else {
      setRtcTarget(prev => prev + 1);
      setRtcHits(prev => prev + 1);
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
      {/* Barra Superior en Gris Oscuro de Competición */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1c1f2b] border border-[#313647] rounded-3xl p-4 sm:px-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#00b853]/15 border border-[#00b853]/30 text-[#00b853]">
            <Target className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base">
                {gameType === 'X01' ? `${startingScore}` : gameType === 'CRICKET' ? 'CRICKET' : 'ROUND THE CLOCK'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg font-black bg-[#e52521]/20 text-[#e52521] border border-[#e52521]/40">
                {outMode.replace('_', ' ')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg font-bold bg-[#242836] text-[#efe7d8] border border-[#313647]">
                Leg {legNumber} • Mejor de {bestOfLegs}
              </span>
            </div>
            <span className="text-xs text-[#b8ad98]">
              {isVsCpu ? `Entrenamiento vs Bot (${cpuDifficulty})` : 'Partido Oficial 2 Jugadores'}
            </span>
          </div>
        </div>

        {/* Controles de Sonido, Opciones y Reinicio */}
        <div className="flex items-center gap-2">
          {/* Toggle Referee de Voz */}
          <button
            type="button"
            onClick={() => setVoiceCallerEnabled(!voiceCallerEnabled)}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              voiceCallerEnabled
                ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]/50 shadow-sm'
                : 'bg-[#242836] text-[#b8ad98] border-[#313647]'
            }`}
            title="Activar / Desactivar Árbitro de Voz"
          >
            {voiceCallerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Caller {voiceCallerEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Ajustes de Partida */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="p-2.5 rounded-2xl bg-[#242836] hover:bg-[#2b3040] text-[#efe7d8] border border-[#313647] flex items-center gap-1.5 text-xs font-bold transition-all"
          >
            <Settings2 className="w-4 h-4 text-[#1d68ed]" />
            <span className="hidden sm:inline">Configuración</span>
          </button>

          {/* Reiniciar */}
          <button
            type="button"
            onClick={() => resetMatch()}
            className="p-2.5 rounded-2xl bg-[#e52521]/20 hover:bg-[#e52521]/30 text-[#e52521] border border-[#e52521]/40 text-xs font-bold transition-all"
            title="Reiniciar Partido"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BANNER DINÁMICO DE ANUNCIO EN VERDE DIANA */}
      {lastAnnouncement && (
        <div className="text-center py-2 px-4 bg-[#14161f] border border-[#00b853]/40 rounded-2xl text-xs font-black text-[#00b853] animate-pulse shadow-md">
          📢 {lastAnnouncement}
        </div>
      )}

      {/* MARCADOR DUAL: PUNTUACIÓN GIGANTE ESTILO COMPETICIÓN PDC */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* JUGADOR 1 */}
        <div
          className={`relative rounded-3xl p-5 sm:p-7 transition-all duration-300 border flex flex-col justify-between ${
            currentTurn === 0
              ? 'bg-[#1e2332] border-[#00b853] shadow-[0_0_25px_rgba(0,184,83,0.35)] ring-2 ring-[#00b853]/50'
              : 'bg-[#1c1f2b]/80 border-[#313647] opacity-85'
          }`}
        >
          {/* Header Jugador 1 */}
          <div className="flex items-center justify-between border-b border-[#313647] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00b853]/20 border border-[#00b853]/40 flex items-center justify-center text-[#00b853] font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                  {player1Name}
                  {currentTurn === 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00b853] animate-ping"></span>
                  )}
                </h3>
                <span className="text-[11px] font-bold text-[#00b853]">
                  Piernas: {legsWon[0]} / {targetLegsToWin}
                </span>
              </div>
            </div>

            {/* Piernas Ganadas (Verde Diana) */}
            <div className="flex gap-1.5">
              {Array.from({ length: targetLegsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-6 rounded-md ${
                    i < legsWon[0] ? 'bg-[#00b853] shadow-md shadow-[#00b853]' : 'bg-[#242836]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Puntaje Gigante en Blanco Alambre */}
          <div className="py-6 sm:py-8 text-center">
            {gameType === 'X01' ? (
              <div className="space-y-1">
                <span className="font-black text-6xl sm:text-8xl tracking-tight text-white font-mono drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  {scores[0]}
                </span>
                <div className="text-xs font-semibold text-[#b8ad98]">
                  Dardos en pierna: <strong className="text-white">{dartsThrownLeg[0]}</strong>
                </div>
              </div>
            ) : gameType === 'CRICKET' ? (
              <div className="space-y-1">
                <span className="font-black text-5xl sm:text-7xl tracking-tight text-[#00b853] font-mono">
                  {cricketPoints[0]} pts
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-[#b8ad98]">Objetivo:</span>
                <div className="font-black text-6xl text-[#e52521] font-mono">
                  {rtcTarget === 21 ? 'BULL' : `D${rtcTarget}`}
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas en Vivo Jugador 1 */}
          <div className="grid grid-cols-3 gap-2 bg-[#14161f] rounded-2xl p-2.5 border border-[#313647] text-center text-xs">
            <div>
              <span className="text-[10px] text-[#b8ad98] uppercase font-black block">AVG</span>
              <span className="font-black text-[#00b853] text-sm font-mono">
                {calcAvg(0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#b8ad98] uppercase font-black block">180s</span>
              <span className="font-black text-[#e52521] text-sm">{count180s[0]}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#b8ad98] uppercase font-black block">Cierre Max</span>
              <span className="font-black text-[#1d68ed] text-sm">
                {highestCheckout[0] > 0 ? highestCheckout[0] : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* JUGADOR 2 / BOT CPU */}
        <div
          className={`relative rounded-3xl p-5 sm:p-7 transition-all duration-300 border flex flex-col justify-between ${
            currentTurn === 1
              ? 'bg-[#1e2332] border-[#00b853] shadow-[0_0_25px_rgba(0,184,83,0.35)] ring-2 ring-[#00b853]/50'
              : 'bg-[#1c1f2b]/80 border-[#313647] opacity-85'
          }`}
        >
          {/* Header Jugador 2 */}
          <div className="flex items-center justify-between border-b border-[#313647] pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                isVsCpu 
                  ? 'bg-[#1d68ed]/20 border-[#1d68ed]/40 text-[#38bdf8]' 
                  : 'bg-[#00b853]/20 border-[#00b853]/40 text-[#00b853]'
              }`}>
                {isVsCpu ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                  {isVsCpu ? `CPU (${cpuDifficulty})` : player2Name}
                  {currentTurn === 1 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00b853] animate-ping"></span>
                  )}
                </h3>
                <span className="text-[11px] font-bold text-[#00b853]">
                  Piernas: {legsWon[1]} / {targetLegsToWin}
                </span>
              </div>
            </div>

            {/* Piernas Ganadas */}
            <div className="flex gap-1.5">
              {Array.from({ length: targetLegsToWin }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-6 rounded-md ${
                    i < legsWon[1] ? 'bg-[#00b853] shadow-md shadow-[#00b853]' : 'bg-[#242836]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Puntaje Gigante en Blanco Alambre */}
          <div className="py-6 sm:py-8 text-center">
            {gameType === 'X01' ? (
              <div className="space-y-1">
                <span className="font-black text-6xl sm:text-8xl tracking-tight text-white font-mono drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  {scores[1]}
                </span>
                <div className="text-xs font-semibold text-[#b8ad98]">
                  Dardos en pierna: <strong className="text-white">{dartsThrownLeg[1]}</strong>
                </div>
              </div>
            ) : gameType === 'CRICKET' ? (
              <div className="space-y-1">
                <span className="font-black text-5xl sm:text-7xl tracking-tight text-[#00b853] font-mono">
                  {cricketPoints[1]} pts
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-[#b8ad98]">Aciertos:</span>
                <div className="font-black text-6xl text-[#00b853] font-mono">
                  {rtcHits}
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas en Vivo Jugador 2 */}
          <div className="grid grid-cols-3 gap-2 bg-[#14161f] rounded-2xl p-2.5 border border-[#313647] text-center text-xs">
            <div>
              <span className="text-[10px] text-[#b8ad98] uppercase font-black block">AVG</span>
              <span className="font-black text-[#00b853] text-sm font-mono">
                {calcAvg(1)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#b8ad98] uppercase font-black block">180s</span>
              <span className="font-black text-[#e52521] text-sm">{count180s[1]}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#b8ad98] uppercase font-black block">Cierre Max</span>
              <span className="font-black text-[#1d68ed] text-sm">
                {highestCheckout[1] > 0 ? highestCheckout[1] : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GUÍA DE CHECKOUT ACTIVA EN VERDE Y ROJO DIANA */}
      {gameType === 'X01' && (
        <CheckoutGuide
          remaining={scores[currentTurn]}
          isDoubleOut={outMode === 'DOUBLE_OUT'}
        />
      )}

      {/* TABLERO DE CRICKET (COLORES DE LA DIANA) */}
      {gameType === 'CRICKET' && (
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-5 shadow-xl">
          <h4 className="text-center text-xs font-black text-[#efe7d8] uppercase tracking-wider mb-3">
            Tablero Oficial de Marcas Cricket (15 al 20 & Bull)
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
                  className="grid grid-cols-3 items-center py-2 px-3 rounded-2xl bg-[#14161f] border border-[#313647] text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-black text-xl text-[#00b853] w-8">
                      {renderMark(p1Marks)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCricketHit(0, target, 1)}
                      className="px-2.5 py-1 bg-[#242836] hover:bg-[#00b853] hover:text-[#0d0e12] text-[#efe7d8] rounded-xl text-xs font-bold"
                    >
                      +1
                    </button>
                  </div>

                  <span className="font-black text-sm text-[#efe7d8] uppercase tracking-wider">
                    {target === '25' ? '🎯 BULL' : target}
                  </span>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCricketHit(1, target, 1)}
                      className="px-2.5 py-1 bg-[#242836] hover:bg-[#00b853] hover:text-[#0d0e12] text-[#efe7d8] rounded-xl text-xs font-bold"
                    >
                      +1
                    </button>
                    <span className="font-mono font-black text-xl text-[#00b853] w-8">
                      {renderMark(p2Marks)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODO ROUND THE CLOCK */}
      {gameType === 'ROUND_THE_CLOCK' && (
        <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 text-center space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            Entrenamiento de Precisión: Round the Clock
          </h4>
          <p className="text-xs text-[#b8ad98]">
            Lanza al número objetivo ({rtcTarget}). Haz clic en &quot;Acierto&quot; al clavar en el sector correspondiente.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRtcHit}
              className="px-8 py-4 bg-[#00b853] hover:bg-[#009e47] text-[#0d0e12] font-black text-sm rounded-2xl shadow-lg shadow-[#00b853]/25 uppercase tracking-wider"
            >
              🎯 ¡Acierto en {rtcTarget}!
            </button>
            <button
              onClick={() => {
                if (soundFxEnabled) SoundEngine.playBust();
              }}
              className="px-6 py-4 bg-[#242836] hover:bg-[#2e3345] text-[#b8ad98] font-bold text-sm rounded-2xl border border-[#313647]"
            >
              Fallo
            </button>
          </div>
        </div>
      )}

      {/* TECLADO TÁCTIL PRINCIPAL */}
      {gameType === 'X01' && (
        <DartKeypad
          onConfirmVisit={(score) => handleScoreInput(score)}
          onUndo={handleUndo}
          canUndo={history.length > 0}
          remainingScore={scores[currentTurn]}
          isDoubleOutRequired={outMode === 'DOUBLE_OUT'}
        />
      )}

      {/* MODAL DE VICTORIA CON CELEBRACIÓN DE LA DIANA */}
      {matchWinner !== null && (
        <div className="fixed inset-0 z-50 bg-[#14161f]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1c1f2b] border-2 border-[#00b853] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl shadow-[#00b853]/30 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-[#00b853]/20 border-2 border-[#00b853] mx-auto flex items-center justify-center mb-4 text-[#00b853]">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
              ¡GAME SHOT AND THE MATCH!
            </h2>
            <p className="text-[#00b853] font-black text-lg mb-6">
              {matchWinner === 0 ? player1Name : isVsCpu ? 'CPU' : player2Name} ha ganado el partido
            </p>

            <div className="bg-[#14161f] rounded-2xl p-4 border border-[#313647] grid grid-cols-2 gap-4 text-left mb-6 text-xs">
              <div>
                <span className="text-[#b8ad98] block">Piernas Ganadas:</span>
                <strong className="text-white text-base">
                  {legsWon[0]} - {legsWon[1]}
                </strong>
              </div>
              <div>
                <span className="text-[#b8ad98] block">Promedio Final ({player1Name}):</span>
                <strong className="text-[#00b853] text-base">{calcAvg(0)} AVG</strong>
              </div>
              <div>
                <span className="text-[#b8ad98] block">180s en Partido:</span>
                <strong className="text-[#e52521] text-base">
                  {count180s[0] + count180s[1]}
                </strong>
              </div>
              <div>
                <span className="text-[#b8ad98] block">Mayor Cierre:</span>
                <strong className="text-[#1d68ed] text-base">
                  {Math.max(highestCheckout[0], highestCheckout[1])}
                </strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => resetMatch()}
                className="flex-1 py-3.5 bg-[#00b853] hover:bg-[#009e47] text-[#0d0e12] font-black rounded-2xl text-sm transition-all shadow-lg shadow-[#00b853]/30"
              >
                Revancha / Nuevo Partido
              </button>
              <button
                type="button"
                onClick={() => setMatchWinner(null)}
                className="px-5 py-3.5 bg-[#242836] hover:bg-[#2b3040] text-white font-bold rounded-2xl text-sm border border-[#313647]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURACIÓN */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#14161f]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1f2b] border border-[#313647] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#00b853]" />
              Configurar Partida
            </h3>

            <div className="space-y-4 text-left text-xs">
              {/* Modo de juego */}
              <div>
                <label className="text-[#b8ad98] font-bold block mb-1.5 uppercase">
                  Modo de Juego
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGameType('X01')}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      gameType === 'X01'
                        ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]'
                        : 'bg-[#242836] text-[#b8ad98] border-[#313647]'
                    }`}
                  >
                    X01
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameType('CRICKET')}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      gameType === 'CRICKET'
                        ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]'
                        : 'bg-[#242836] text-[#b8ad98] border-[#313647]'
                    }`}
                  >
                    Cricket
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameType('ROUND_THE_CLOCK')}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      gameType === 'ROUND_THE_CLOCK'
                        ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]'
                        : 'bg-[#242836] text-[#b8ad98] border-[#313647]'
                    }`}
                  >
                    Clock 1-20
                  </button>
                </div>
              </div>

              {/* Puntos X01 */}
              {gameType === 'X01' && (
                <div>
                  <label className="text-[#b8ad98] font-bold block mb-1.5 uppercase">
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
                        className={`p-2 rounded-xl font-black border transition-all ${
                          startingScore === pts
                            ? 'bg-[#00b853] text-[#0d0e12] border-[#00b853]'
                            : 'bg-[#242836] text-[#efe7d8] border-[#313647]'
                        }`}
                      >
                        {pts}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Condición de Cierre */}
              {gameType === 'X01' && (
                <div>
                  <label className="text-[#b8ad98] font-bold block mb-1.5 uppercase">
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
                            ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]'
                            : 'bg-[#242836] text-[#b8ad98] border-[#313647]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Oponente */}
              <div>
                <label className="text-[#b8ad98] font-bold block mb-1.5 uppercase">
                  Oponente
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setIsVsCpu(false)}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      !isVsCpu
                        ? 'bg-[#00b853]/20 text-[#00b853] border-[#00b853]'
                        : 'bg-[#242836] text-[#b8ad98] border-[#313647]'
                    }`}
                  >
                    Jugador vs Jugador
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVsCpu(true)}
                    className={`p-2.5 rounded-xl font-bold border transition-all ${
                      isVsCpu
                        ? 'bg-[#1d68ed]/20 text-[#38bdf8] border-[#1d68ed]'
                        : 'bg-[#242836] text-[#b8ad98] border-[#313647]'
                    }`}
                  >
                    Entrenar vs CPU
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-full py-3.5 bg-[#00b853] hover:bg-[#009e47] text-[#0d0e12] font-black rounded-2xl text-sm transition-all"
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
