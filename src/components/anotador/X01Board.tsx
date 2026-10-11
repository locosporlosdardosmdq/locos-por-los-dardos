'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MatchConfig, DartThrow } from '@/lib/types';
import { SoundEngine, VoiceCaller, isAppAudioMuted, setAppAudioMuted } from '@/lib/sound-effects';
import { getSuggestedCheckout } from '@/lib/constants';
import { saveActiveMatchSession, clearActiveMatchSession, ActiveMatchSession } from '@/lib/storage';
import { formatCardPlayerName } from '@/components/jugadores/UltimateDartsCard';
import { ExitMatchModal } from './ExitMatchModal';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Save, 
  Wrench, 
  RotateCcw, 
  Trophy, 
  BarChart3, 
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle2,
  Tv,
  Camera,
  Mic,
  MicOff
} from 'lucide-react';
import { matchBroadcast } from '@/lib/broadcast';

export interface TurnRecord {
  id: string;
  roundIndex: number;
  legIndex: number;
  playerIndex: 0 | 1;
  playerName: string;
  score: number;
  remainingBefore: number;
  remainingAfter: number;
  isBust: boolean;
  timeStr: string;
}

interface X01BoardProps {
  config: MatchConfig;
  onExit: () => void;
  onMatchComplete: (stats: any) => void;
  voiceCallerEnabled: boolean;
  soundFxEnabled: boolean;
  onOpenStats: () => void;
  initialSession?: ActiveMatchSession | null;
  onStandBy?: () => void;
}

export const X01Board: React.FC<X01BoardProps> = ({
  config,
  onExit,
  onMatchComplete,
  voiceCallerEnabled,
  soundFxEnabled,
  onOpenStats,
  initialSession,
  onStandBy
}) => {
  // Puntuaciones restantes
  const [scores, setScores] = useState<[number, number]>(() => 
    initialSession?.scores || [config.startingScore, config.startingScore]
  );

  // Turno actual: 0 (P1) o 1 (P2)
  const [currentTurn, setCurrentTurn] = useState<0 | 1>(() => initialSession?.currentTurn ?? 0);

  // Saque inicial del leg actual
  const [starterTurn, setStarterTurn] = useState<0 | 1>(() => initialSession?.starterTurn ?? 0);

  // Sub-turnos para parejas (0 o 1 de cada pareja)
  const [p1TeammateTurn, setP1TeammateTurn] = useState<0 | 1>(() => initialSession?.p1TeammateTurn ?? 0);
  const [p2TeammateTurn, setP2TeammateTurn] = useState<0 | 1>(() => initialSession?.p2TeammateTurn ?? 0);

  // Sets y Legs ganados
  const [setsWon, setSetsWon] = useState<[number, number]>(() => initialSession?.setsWon || [0, 0]);
  const [legsWon, setLegsWon] = useState<[number, number]>(() => initialSession?.legsWon || [0, 0]);

  // Entrada numérica tecleada
  const [typedInput, setTypedInput] = useState<string>('');
  const [isRemainingInputMode, setIsRemainingInputMode] = useState<boolean>(false);

  // Métricas acumuladas del partido
  const [dartsThrownLeg, setDartsThrownLeg] = useState<[number, number]>(() => initialSession?.dartsThrownLeg || [0, 0]);
  const [totalPointsMatch, setTotalPointsMatch] = useState<[number, number]>(() => initialSession?.totalPointsMatch || [0, 0]);
  const [totalDartsMatch, setTotalDartsMatch] = useState<[number, number]>(() => initialSession?.totalDartsMatch || [0, 0]);

  // First 9 tracking
  const [first9Points, setFirst9Points] = useState<[number, number]>(() => initialSession?.first9Points || [0, 0]);
  const [first9Darts, setFirst9Darts] = useState<[number, number]>(() => initialSession?.first9Darts || [0, 0]);

  // Hitos
  const [count100s, setCount100s] = useState<[number, number]>(() => initialSession?.count100s || [0, 0]);
  const [count140s, setCount140s] = useState<[number, number]>(() => initialSession?.count140s || [0, 0]);
  const [count180s, setCount180s] = useState<[number, number]>(() => initialSession?.count180s || [0, 0]);
  const [highestCheckout, setHighestCheckout] = useState<[number, number]>(() => initialSession?.highestCheckout || [0, 0]);
  const [bestLegDarts, setBestLegDarts] = useState<[number, number]>(() => initialSession?.bestLegDarts || [99, 99]);

  // Historial de la partida para deshacer
  const [history, setHistory] = useState<any[]>(() => initialSession?.history || []);

  // Registro detallado de visitas/puntuaciones de la partida en juego
  const [turnHistory, setTurnHistory] = useState<TurnRecord[]>(() => initialSession?.turnHistory || []);

  // Estado de silenciar audios de Russ Bray
  const [isMuted, setIsMuted] = useState<boolean>(() => isAppAudioMuted());

  // Instancia final de partida ganada (en espera de confirmación de salida)
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const [matchWinnerIndex, setMatchWinnerIndex] = useState<0 | 1 | null>(null);

  // Modal de opciones para Volver / Stand By / Abandonar
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Cámara y Micrófono en dispositivo móvil (Opción 1: Alternancia diana rival y voz en vivo)
  const [showMobileCamera, setShowMobileCamera] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const mobileStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (showMobileCamera && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        .then((stream) => {
          mobileStreamRef.current = stream;
          if (mobileVideoRef.current) {
            mobileVideoRef.current.srcObject = stream;
          }

          // Inicializar análisis de voz para vúmetro / feedback en tiempo real
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0 && typeof AudioContext !== 'undefined') {
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              audioContextRef.current = audioCtx;
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);
              analyserRef.current = analyser;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const detectSpeech = () => {
                if (analyserRef.current) {
                  analyserRef.current.getByteFrequencyData(dataArray);
                  let sum = 0;
                  for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                  }
                  const avg = sum / dataArray.length;
                  setIsSpeaking(avg > 18 && !isMicMuted);
                }
                animationFrameRef.current = requestAnimationFrame(detectSpeech);
              };
              detectSpeech();
            } catch (e) {
              console.warn('[Audio] No se pudo iniciar analizador de voz:', e);
            }
          }
        })
        .catch((err) => {
          console.warn('Cámara o micrófono no disponible:', err);
        });
    } else {
      if (mobileStreamRef.current) {
        mobileStreamRef.current.getTracks().forEach((t) => t.stop());
        mobileStreamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsSpeaking(false);
    }
  }, [showMobileCamera]);

  // Manejar silenciado de micrófono en caliente
  useEffect(() => {
    if (mobileStreamRef.current) {
      mobileStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
    }
  }, [isMicMuted]);

  // Si cambia el turno al usuario local (0), ocultar cámara y mostrar teclado de 5 columnas automáticamente
  useEffect(() => {
    if (currentTurn === 0 && showMobileCamera) {
      setShowMobileCamera(false);
    }
  }, [currentTurn]);

  // Manejador de Pop-out 2ª Pantalla / TV (Opción 1 para PC)
  const handleOpenPopout = () => {
    if (typeof window !== 'undefined') {
      window.open(
        '/anotador/camara-popout',
        'DianaPopout',
        'width=1100,height=750,menubar=no,toolbar=no,location=no,status=no'
      );
    }
  };

  // Referencias para transición de scroll entre diana y puntuaciones
  const boardRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBoard = () => {
    boardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-guardado de sesión activa en localStorage ante cada visita para blindar contra navegación accidental
  useEffect(() => {
    if (!isMatchFinished && (turnHistory.length > 0 || history.length > 0)) {
      saveActiveMatchSession({
        config,
        gameType: 'X01',
        status: 'IN_PROGRESS',
        scores,
        currentTurn,
        starterTurn,
        p1TeammateTurn,
        p2TeammateTurn,
        setsWon,
        legsWon,
        dartsThrownLeg,
        totalPointsMatch,
        totalDartsMatch,
        first9Points,
        first9Darts,
        count100s,
        count140s,
        count180s,
        highestCheckout,
        bestLegDarts,
        history,
        turnHistory,
        tournamentTitle: config.tournamentTitle,
        savedAt: new Date().toISOString()
      });
    }
  }, [scores, currentTurn, legsWon, setsWon, turnHistory, isMatchFinished]);

  const handleBackClick = () => {
    // Si no se registró ningún tiro, vuelve directo a configurar partida
    if (history.length === 0 && turnHistory.length === 0) {
      clearActiveMatchSession();
      onExit();
      return;
    }
    // Si la partida ya está iniciada, abre modal de opciones (Stand By / Abandonar / Continuar)
    setShowExitModal(true);
  };

  const handleStandBy = () => {
    saveActiveMatchSession({
      config,
      gameType: 'X01',
      status: 'STAND_BY',
      scores,
      currentTurn,
      starterTurn,
      p1TeammateTurn,
      p2TeammateTurn,
      setsWon,
      legsWon,
      dartsThrownLeg,
      totalPointsMatch,
      totalDartsMatch,
      first9Points,
      first9Darts,
      count100s,
      count140s,
      count180s,
      highestCheckout,
      bestLegDarts,
      history,
      turnHistory,
      tournamentTitle: config.tournamentTitle,
      savedAt: new Date().toISOString()
    });
    setShowExitModal(false);
    if (onStandBy) {
      onStandBy();
    } else {
      onExit();
    }
  };

  const handleAbandon = () => {
    setShowExitModal(false);
    clearActiveMatchSession();

    if (config.tournamentTitle) {
      // Si es partida de torneo o liga: Walkover al adversario
      const opponentIdx: 0 | 1 = currentTurn === 0 ? 1 : 0;
      const targetLegs = Math.ceil(config.bestOfLegs / 2);
      const abandonmentLegs: [number, number] = opponentIdx === 0 ? [targetLegs, legsWon[1]] : [legsWon[0], targetLegs];
      onMatchComplete({
        winnerIndex: opponentIdx,
        winnerName: opponentIdx === 0 ? p1Display : p2Display,
        scores,
        legsWon: abandonmentLegs,
        setsWon,
        avgP1: getAvg(0),
        avgP2: getAvg(1),
        first9P1: getFirst9Avg(0),
        first9P2: getFirst9Avg(1),
        count100s,
        count140s,
        count180s,
        highestCheckout,
        bestLegDarts,
        turnHistory,
        note: 'W.O. (Abandono)'
      });
    } else {
      // Partida individual casual: simplemente cancelar y volver
      onExit();
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAppAudioMuted(next);
    showFeedback(next ? 'Audios Silenciados' : 'Audios Activados (Russ Bray)', next ? '#ef4444' : '#00e676');
  };

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

  // Emitir estado en tiempo real para 2ª pantalla / Pop-out Window
  const broadcastCurrentState = (lastScoreValue: number = 0, isFinishedState: boolean = isMatchFinished) => {
    const p1Darts = totalDartsMatch[0] || dartsThrownLeg[0] || 0;
    const p2Darts = totalDartsMatch[1] || dartsThrownLeg[1] || 0;
    const p1CalculatedAvg = p1Darts > 0 ? ((totalPointsMatch[0] / p1Darts) * 3) : 0;
    const p2CalculatedAvg = p2Darts > 0 ? ((totalPointsMatch[1] / p2Darts) * 3) : 0;

    matchBroadcast.publish({
      matchId: `match-${config.tournamentTitle || 'live'}`,
      gameType: 'X01',
      tournamentTitle: config.tournamentTitle,
      distanceMode: config.distanceType,
      bestOfLegs: config.bestOfLegs,
      bestOfSets: config.bestOfSets,
      player1Name: p1Display,
      player1Score: scores[0],
      player1Avg: p1CalculatedAvg,
      player1Legs: legsWon[0],
      player1Sets: setsWon[0],
      player2Name: p2Display,
      player2Score: scores[1],
      player2Avg: p2CalculatedAvg,
      player2Legs: legsWon[1],
      player2Sets: setsWon[1],
      currentTurnIndex: currentTurn,
      lastScore: lastScoreValue,
      lastDarts: [],
      status: isFinishedState ? 'FINISHED' : 'IN_PROGRESS',
      checkoutSuggestion: getSuggestedCheckout(scores[currentTurn]) || undefined,
      winner: isFinishedState ? (matchWinnerIndex === 0 ? p1Display : p2Display) : undefined
    });
  };

  useEffect(() => {
    broadcastCurrentState(0, isMatchFinished);
  }, [scores, currentTurn, legsWon, setsWon, isMatchFinished]);

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

      // Registrar turno en historial de puntuaciones en juego
      const newBustTurn: TurnRecord = {
        id: `turn-${Date.now()}-${Math.random()}`,
        roundIndex: Math.floor((totalDartsMatch[0] + totalDartsMatch[1]) / 6) + 1,
        legIndex: legsWon[0] + legsWon[1] + 1,
        playerIndex: currentTurn,
        playerName: currentTurn === 0 ? p1Display : p2Display,
        score: 0,
        remainingBefore: currentScore,
        remainingAfter: currentScore,
        isBust: true,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTurnHistory((prev) => [newBustTurn, ...prev]);

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

    // Registrar turno en historial de puntuaciones
    const newValidTurn: TurnRecord = {
      id: `turn-${Date.now()}-${Math.random()}`,
      roundIndex: Math.floor((totalDartsMatch[0] + totalDartsMatch[1]) / 6) + 1,
      legIndex: legsWon[0] + legsWon[1] + 1,
      playerIndex: currentTurn,
      playerName: currentTurn === 0 ? p1Display : p2Display,
      score,
      remainingBefore: currentScore,
      remainingAfter: newRemaining,
      isBust: false,
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTurnHistory((prev) => [newValidTurn, ...prev]);

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

  // Instancia final de partida: queda a la espera del exit del usuario sin bloquear el deshacer
  const finishMatch = (winnerIdx: 0 | 1) => {
    setIsMatchFinished(true);
    setMatchWinnerIndex(winnerIdx);
    showFeedback(`🏆 ¡VICTORIA DE ${winnerIdx === 0 ? p1Display : p2Display}!`, '#00e676');
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
  };

  // Confirmar y salir de la partida guardando estadísticas
  const confirmExitMatch = () => {
    const winnerIdx = matchWinnerIndex !== null ? matchWinnerIndex : currentTurn;
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
      bestLegDarts,
      turnHistory
    });
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
    setTurnHistory((prev) => prev.slice(1));
    if (isMatchFinished) {
      setIsMatchFinished(false);
      setMatchWinnerIndex(null);
    }
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

  // Sugerencia de Checkout oficial (2 a 170)
  const currentCheckout = getSuggestedCheckout(scores[currentTurn]);

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* PANEL 1: TABLERO DE TIRO PRINCIPAL (Fondo negro puro, dimensiones preservadas) */}
      <div 
        ref={boardRef}
        className="w-full bg-black border border-[#ef4444]/40 rounded-3xl p-3 sm:p-5 shadow-2xl shadow-black space-y-3.5 select-none"
      >
        {/* Cabecera superior oficial con botón Volver integrado */}
        <div className="flex items-center justify-between pb-2 border-b border-[#ef4444]/20">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackClick}
              title="Volver o pausar partida"
              className="p-1.5 rounded-xl bg-black hover:bg-[#151515] text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                  {config.tournamentTitle ? `${config.tournamentTitle} • Diana Asignada` : 'Partida individual'}
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
            {/* Botón Ver Diana Rival vs Teclado (Para móviles en partidas con cámara) */}
            <button
              onClick={() => setShowMobileCamera(!showMobileCamera)}
              title={showMobileCamera ? 'Ver Teclado de Tiro' : 'Ver Diana de Rival en Vivo'}
              className={`p-1.5 rounded-xl border transition-colors ${
                showMobileCamera 
                  ? 'bg-[#ffe600]/20 text-[#ffe600] border-[#ffe600]/60' 
                  : 'bg-black text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Botón Pop-out 2ª Pantalla / TV (Opción 1) */}
            <button
              onClick={handleOpenPopout}
              title="Abrir Cámara y Marcador en 2ª Pantalla o TV (Pop-out)"
              className="p-1.5 rounded-xl bg-black text-[#38bdf8] hover:bg-[#151515] border border-[#38bdf8]/40 hover:border-[#38bdf8] transition-colors"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Botón Micrófono para Hablar con el Rival (Partida Online) */}
            <button
              onClick={() => {
                const next = !isMicMuted;
                setIsMicMuted(next);
                showFeedback(next ? 'Micrófono silenciado' : 'Micrófono activo (hablando con rival)', next ? '#ef4444' : '#00e676');
              }}
              title={isMicMuted ? 'Activar Micrófono (Hablar con el Rival)' : 'Silenciar Micrófono'}
              className={`p-1.5 rounded-xl border transition-all ${
                isMicMuted 
                  ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40 hover:bg-[#ef4444]/30' 
                  : isSpeaking
                    ? 'bg-[#00e676]/30 text-[#00e676] border-[#00e676] ring-2 ring-[#00e676]/60 animate-pulse'
                    : 'bg-black text-[#00e676] border-[#00e676]/30 hover:bg-[#151515]'
              }`}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Botón Silenciar / Activar Audios de Russ Bray */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Activar Sonidos (Russ Bray)' : 'Silenciar Audios'}
              className={`p-1.5 rounded-xl border transition-colors ${
                isMuted 
                  ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40 hover:bg-[#ef4444]/30' 
                  : 'bg-black text-[#00e676] border-[#00e676]/30 hover:bg-[#151515]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenStats}
              title="Estadísticas Oficiales"
              className="p-1.5 rounded-xl bg-black text-[#00e676] hover:bg-[#151515] border border-[#00e676]/30"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Deshacer"
              className="p-1.5 rounded-xl bg-black text-slate-300 hover:text-white disabled:opacity-30 border border-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instancia de Final de Partida: Banner con opción de Salir (EXIT) o Deshacer para corregir */}
        {isMatchFinished && (
          <div className="bg-[#0f1422] border-2 border-[#00e676] rounded-2xl p-3 text-center shadow-2xl animate-in fade-in space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#00e676] font-black text-sm">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>¡PARTIDA FINALIZADA! GANADOR: {matchWinnerIndex === 0 ? p1Display : p2Display}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Podés revisar puntuaciones, corregir con Deshacer si hubo un error, o confirmar la salida.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleUndo}
                className="py-2 px-3 rounded-xl bg-[#111622] hover:bg-[#182030] text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>Deshacer / Corregir</span>
              </button>
              <button
                onClick={confirmExitMatch}
                className="py-2 px-4 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00e676]/20 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>FINALIZAR PARTIDA (EXIT)</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner flotante de feedback (Bust, 180, etc.) */}
        {feedbackBanner && (
          <div
            className="text-center py-1.5 px-3 rounded-xl text-xs font-black shadow-lg transition-all animate-pulse"
            style={{ backgroundColor: `${feedbackBanner.color}20`, color: feedbackBanner.color, borderColor: feedbackBanner.color }}
          >
            {feedbackBanner.text}
          </div>
        )}

      {/* Marcador Superior de Jugadores (Cards Enfrentadas - Fondo Negro Puro) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Jugador 1 */}
        <div
          className={`rounded-2xl p-3 text-center transition-all ${
            currentTurn === 0
              ? 'bg-black border-2 border-[#00e676] shadow-xl shadow-[#00e676]/20'
              : 'bg-black border border-slate-800/90 opacity-70'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            {currentTurn === 0 && <span className="text-[#00e676] text-xs font-black">▶</span>}
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate max-w-[130px]">
              {formatCardPlayerName(p1Display)}
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
              ? 'bg-black border-2 border-[#00e676] shadow-xl shadow-[#00e676]/20'
              : 'bg-black border border-slate-800/90 opacity-70'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            {currentTurn === 1 && <span className="text-[#00e676] text-xs font-black">▶</span>}
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate max-w-[130px]">
              {formatCardPlayerName(p2Display)}
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
          className="py-2.5 px-2 rounded-xl bg-black hover:bg-[#151515] border border-[#ef4444]/40 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#ef4444]" />
          <span>switch Starter</span>
        </button>

        {/* Display central con borde diana y cierre sugerido oficial en reposo */}
        <div
          onClick={handleConfirmTyped}
          className={`h-11 rounded-xl bg-black border-2 flex items-center justify-center font-black transition-all cursor-pointer ${
            typedInput
              ? 'border-[#00e676] text-[#00e676] bg-[#00e676]/10 shadow-md shadow-[#00e676]/20 text-xl'
              : 'border-[#ef4444]/40 text-[#00e676]'
          }`}
        >
          {typedInput ? (
            typedInput
          ) : isRemainingInputMode ? (
            <span className="text-xs text-slate-400 font-bold uppercase">Restante</span>
          ) : currentCheckout ? (
            <div className="flex flex-col items-center justify-center leading-tight py-0.5 px-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Cierre ({scores[currentTurn]})
              </span>
              <span className="text-xs sm:text-sm font-black text-[#00e676] tracking-wider truncate max-w-[140px]">
                {currentCheckout}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {scores[currentTurn] <= 170 ? 'Sin Opción' : 'Tirada'}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsRemainingInputMode(!isRemainingInputMode)}
          className={`py-2.5 px-2 rounded-xl border text-[11px] font-black tracking-wider transition-colors ${
            isRemainingInputMode
              ? 'bg-[#ef4444] text-white border-[#ef4444]'
              : 'bg-black text-slate-300 border-slate-700 hover:border-slate-500'
          }`}
        >
          REMAINING
        </button>
      </div>

      {/* CÁMARA MÓVIL EN VIVO (OPCIÓN 1) vs TECLADO TÁCTIL ERGONÓMICO */}
      {showMobileCamera ? (
        <div className="bg-[#0f1422] border-2 border-[#ffe600]/50 rounded-2xl p-3 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-black text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Diana de Rival en Vivo</span>
            </div>
            <button
              onClick={() => setShowMobileCamera(false)}
              className="px-2.5 py-1 rounded-lg bg-[#00e676] text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm"
            >
              <span>⌨️ Ver Teclado</span>
            </button>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
            <video
              ref={mobileVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-300">
              Tirador: {getCurrentShooterName()}
            </div>
            {/* Indicador de voz activo sobre el video */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700 text-[10px]">
              {isMicMuted ? (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <MicOff className="w-3 h-3" /> Silenciado
                </span>
              ) : isSpeaking ? (
                <span className="text-[#00e676] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-ping" />
                  <Mic className="w-3 h-3 text-[#00e676]" /> Hablando
                </span>
              ) : (
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Micrófono ON
                </span>
              )}
            </div>
          </div>

          {/* Panel de Control de Audio & Voz con el Contrincante */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/70 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                const next = !isMicMuted;
                setIsMicMuted(next);
                showFeedback(next ? 'Micrófono silenciado' : 'Micrófono activo para hablar con el rival', next ? '#ef4444' : '#00e676');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                isMicMuted 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30' 
                  : isSpeaking 
                    ? 'bg-[#00e676]/30 text-[#00e676] border border-[#00e676] ring-2 ring-[#00e676]/50 animate-pulse' 
                    : 'bg-[#111622] text-[#00e676] border border-[#00e676]/40 hover:bg-[#1a2234]'
              }`}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMicMuted ? 'Activar Micrófono' : isSpeaking ? 'Hablando en Vivo' : 'Silenciar Micrófono'}</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium">
              {isMicMuted ? 'Rival no te escucha' : 'Hablá con tu rival en vivo'}
            </span>
          </div>

          <button
            onClick={() => setShowMobileCamera(false)}
            className="w-full py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-[#00e676]/20"
          >
            <span>Ir al Teclado para Anotar Tiro</span>
          </button>
        </div>
      ) : (
        /* TECLADO ERGONÓMICO DE 5 COLUMNAS IDÉNTICO A LA CAPTURA */
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
      )}

      {/* Indicador de tirador activo al pie y enlace a visitas */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-400 border-t border-slate-800/60">
        <span>
          Turno de tiro en la diana: <strong className="font-black text-[#00e676]">{getCurrentShooterName()}</strong>
        </span>
        <button
          onClick={scrollToHistory}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-[#111622] hover:bg-[#182030] px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-[#00e676]" />
          <span>Ver Visitas ({turnHistory.length})</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* PANEL 2: TABLA DE PUNTUACIONES Y VISITAS EN JUEGO (Mismas dimensiones exactas) */}
    <div
      ref={historyRef}
      className="w-full bg-[#07090e] border border-[#ef4444]/30 rounded-3xl p-3 sm:p-5 shadow-2xl shadow-black/90 space-y-3.5 select-none"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#ef4444]/20">
        <div className="flex items-center gap-2">
          <button
            onClick={scrollToBoard}
            className="py-1 px-2.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 hover:text-white flex items-center gap-1 text-xs font-bold border border-slate-800 transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-[#00e676]" />
            <span>Volver a Diana</span>
          </button>
          <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#00e676]" />
            <span>Puntuaciones de la Partida</span>
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-400">
          {turnHistory.length} Visitas
        </span>
      </div>

      {/* Resumen en vivo de métricas comparativas */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-[#0f1422] rounded-xl p-2.5 border border-slate-800">
          <span className="text-slate-400 font-bold block text-[10px] uppercase truncate">{p1Display}</span>
          <div className="text-[#00e676] font-black text-base mt-0.5">{getAvg(0)} AVG</div>
          <div className="text-slate-400 text-[10px] mt-0.5">180s: {count180s[0]} • Mayor Cierre: {highestCheckout[0]}</div>
        </div>
        <div className="bg-[#0f1422] rounded-xl p-2.5 border border-slate-800">
          <span className="text-slate-400 font-bold block text-[10px] uppercase truncate">{p2Display}</span>
          <div className="text-[#00e676] font-black text-base mt-0.5">{getAvg(1)} AVG</div>
          <div className="text-slate-400 text-[10px] mt-0.5">180s: {count180s[1]} • Mayor Cierre: {highestCheckout[1]}</div>
        </div>
      </div>

      {/* Tabla de visitas scrollable */}
      <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800 bg-[#0b0e17]">
        {turnHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-semibold">
            Todavía no se registraron visitas en esta partida.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111622] text-slate-400 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Jugador</th>
                <th className="py-2 px-3 text-center">Tiro</th>
                <th className="py-2 px-3 text-right">Queda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {turnHistory.map((t, idx) => (
                <tr key={t.id || idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-3 text-slate-500 text-[11px] font-mono">
                    {turnHistory.length - idx}
                  </td>
                  <td className="py-2 px-3 text-white truncate max-w-[120px]">
                    {t.playerName}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {t.isBust ? (
                      <span className="text-[#ef4444] font-black">BUST</span>
                    ) : t.score === 180 ? (
                      <span className="text-[#00e676] font-black animate-pulse">180!</span>
                    ) : (
                      <span className={t.score >= 100 ? 'text-[#00e676] font-black' : 'text-slate-200'}>
                        {t.score}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400 font-mono">
                    {t.remainingAfter}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Botón inferior para volver */}
      <button
        onClick={scrollToBoard}
        className="w-full py-2.5 px-3 rounded-xl bg-[#111622] hover:bg-[#182030] text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
      >
        <ChevronUp className="w-4 h-4 text-[#00e676]" />
        <span>Subir al Tablero de Tiro</span>
      </button>
    </div>

    {/* MODAL OFICIAL DE SALIDA / STAND BY / ABANDONO */}
    <ExitMatchModal
      isOpen={showExitModal}
      onClose={() => setShowExitModal(false)}
      onStandBy={handleStandBy}
      onAbandon={handleAbandon}
      matchTitle={config.tournamentTitle || 'Partida Individual'}
      isTournamentMatch={!!config.tournamentTitle}
      player1Name={p1Display}
      player2Name={p2Display}
      currentScoreOrLegs={`P1: ${scores[0]} pts (${legsWon[0]} legs) • P2: ${scores[1]} pts (${legsWon[1]} legs)`}
    />
  </div>
);
};
