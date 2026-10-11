'use client';

import React, { useState, useEffect } from 'react';
import { MatchConfig } from '@/lib/types';
import { SoundEngine, VoiceCaller } from '@/lib/sound-effects';
import { saveActiveMatchSession, clearActiveMatchSession } from '@/lib/storage';
import { formatCardPlayerName } from '@/components/jugadores/UltimateDartsCard';
import { ExitMatchModal } from './ExitMatchModal';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  RotateCcw, 
  HelpCircle, 
  BarChart3, 
  Check, 
  Sparkles,
  Trophy
} from 'lucide-react';

interface CricketBoardProps {
  config: MatchConfig;
  onExit: () => void;
  onMatchComplete: (stats: any) => void;
  voiceCallerEnabled: boolean;
  soundFxEnabled: boolean;
  onOpenStats: () => void;
}

// 7 sectores de Cricket
const CRICKET_SECTORS = ['20', '19', '18', '17', '16', '15', '25'] as const;
type CricketSector = typeof CRICKET_SECTORS[number];

const SECTOR_LABELS: Record<CricketSector, string> = {
  '20': '20',
  '19': '19',
  '18': '18',
  '17': '17',
  '16': '16',
  '15': '15',
  '25': 'Bull'
};

export const CricketBoard: React.FC<CricketBoardProps> = ({
  config,
  onExit,
  onMatchComplete,
  voiceCallerEnabled,
  soundFxEnabled,
  onOpenStats
}) => {
  const cricketMode = config.cricketMode || 'DEFAULT';

  // Marcas por jugador (0 a 3 por sector)
  const [marks, setMarks] = useState<[Record<CricketSector, number>, Record<CricketSector, number>]>([
    { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 },
    { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 }
  ]);

  // Puntos acumulados por jugador
  const [points, setPoints] = useState<[number, number]>([0, 0]);

  // Rondas jugadas y dardos tirados
  const [rounds, setRounds] = useState<[number, number]>([1, 1]);
  const [totalMarksMatch, setTotalMarksMatch] = useState<[number, number]>([0, 0]);

  // Turno actual (0 o 1)
  const [currentTurn, setCurrentTurn] = useState<0 | 1>(0);

  // Sets y legs ganados
  const [legsWon, setLegsWon] = useState<[number, number]>([0, 0]);
  const [setsWon, setSetsWon] = useState<[number, number]>([0, 0]);

  // Impactos acumulados en la ronda actual (hasta 3 dardos)
  const [currentVisitHits, setCurrentVisitHits] = useState<{ sector: CricketSector; multiplier: number }[]>([]);

  // Historial para deshacer
  const [history, setHistory] = useState<any[]>([]);

  // Modal de ayuda
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleBackClick = () => {
    if (history.length === 0 && currentVisitHits.length === 0) {
      clearActiveMatchSession();
      onExit();
      return;
    }
    setShowExitModal(true);
  };

  const handleStandBy = () => {
    saveActiveMatchSession({
      config,
      gameType: 'CRICKET',
      status: 'STAND_BY',
      scores: [points[0], points[1]],
      currentTurn,
      starterTurn: 0,
      setsWon,
      legsWon,
      dartsThrownLeg: [0, 0],
      totalPointsMatch: [points[0], points[1]],
      totalDartsMatch: [0, 0],
      first9Points: [0, 0],
      first9Darts: [0, 0],
      count100s: [0, 0],
      count140s: [0, 0],
      count180s: [0, 0],
      highestCheckout: [0, 0],
      bestLegDarts: [99, 99],
      history,
      turnHistory: [],
      cricketMarks: marks,
      cricketPoints: points,
      tournamentTitle: config.tournamentTitle,
      savedAt: new Date().toISOString()
    });
    setShowExitModal(false);
    onExit();
  };

  const handleAbandon = () => {
    setShowExitModal(false);
    clearActiveMatchSession();

    if (config.tournamentTitle) {
      const opponentIdx: 0 | 1 = currentTurn === 0 ? 1 : 0;
      const targetLegs = Math.ceil(config.bestOfLegs / 2);
      const abandonmentLegs: [number, number] = opponentIdx === 0 ? [targetLegs, legsWon[1]] : [legsWon[0], targetLegs];
      onMatchComplete({
        winnerIndex: opponentIdx,
        winnerName: opponentIdx === 0 ? p1Display : p2Display,
        gameType: 'CRICKET',
        cricketMode,
        points,
        legsWon: abandonmentLegs,
        setsWon,
        mprP1: getMPR(0),
        mprP2: getMPR(1),
        roundsP1: rounds[0],
        roundsP2: rounds[1],
        note: 'W.O. (Abandono)'
      });
    } else {
      onExit();
    }
  };

  // Nombres
  const p1Display = config.player1.name;
  const p2Display = config.player2.name;

  // Marcas abiertas pendientes (sobre 21 en total: 7 sectores x 3 marcas)
  const getOpenMarks = (pIdx: 0 | 1) => {
    let closedMarks = 0;
    CRICKET_SECTORS.forEach((sec) => {
      closedMarks += marks[pIdx][sec];
    });
    return Math.max(0, 21 - closedMarks);
  };

  // Cálculo de MPR (Marks Per Round)
  const getMPR = (pIdx: 0 | 1) => {
    const roundCount = rounds[pIdx];
    if (roundCount <= 1 && totalMarksMatch[pIdx] === 0) return '0.00';
    return (totalMarksMatch[pIdx] / Math.max(1, roundCount)).toFixed(2);
  };

  // Símbolo de marcas: \ -> X -> ⊗
  const renderMarkSymbol = (count: number) => {
    if (count === 0) return null;
    if (count === 1) {
      return <span className="text-white font-black text-lg select-none">/</span>;
    }
    if (count === 2) {
      return <span className="text-white font-black text-lg select-none">✕</span>;
    }
    return (
      <span className="w-7 h-7 rounded-full border-2 border-[#00e676] flex items-center justify-center text-[#00e676] font-black text-sm select-none shadow-sm shadow-[#00e676]/30">
        ⊗
      </span>
    );
  };

  // Registrar impacto de dardo en la ronda actual
  const handleHitSector = (sector: CricketSector, multiplier: number) => {
    const currentDartCount = currentVisitHits.reduce((acc, h) => acc + (sector === '25' && multiplier === 2 ? 1 : 1), 0);
    if (currentDartCount >= 3) return; // Máximo 3 dardos por visita

    if (soundFxEnabled) SoundEngine.playDartHit();
    setCurrentVisitHits([...currentVisitHits, { sector, multiplier }]);
  };

  // Confirmar visita (botón OK o no Hit)
  const handleConfirmVisit = () => {
    // Snapshot para deshacer
    const snapshot = {
      marks: JSON.parse(JSON.stringify(marks)),
      points: [...points],
      rounds: [...rounds],
      totalMarksMatch: [...totalMarksMatch],
      currentTurn,
      legsWon: [...legsWon],
      setsWon: [...setsWon]
    };

    if (currentVisitHits.length === 0) {
      // no Hit
      const newRounds = [...rounds] as [number, number];
      newRounds[currentTurn] += 1;
      setRounds(newRounds);
      setHistory([...history, snapshot]);
      advanceTurn();
      return;
    }

    // Calcular marcas y puntos resultantes
    const updatedMarks = JSON.parse(JSON.stringify(marks));
    const updatedPoints = [...points] as [number, number];
    let newMarksGainedThisRound = 0;

    const opponentIdx = currentTurn === 0 ? 1 : 0;

    currentVisitHits.forEach(({ sector, multiplier }) => {
      const currentSectorMarks = updatedMarks[currentTurn][sector];
      const opponentMarks = updatedMarks[opponentIdx][sector];
      const sectorPointValue = sector === '25' ? 25 : parseInt(sector, 10);

      const availableToClose = Math.max(0, 3 - currentSectorMarks);
      const appliedMarks = Math.min(availableToClose, multiplier);
      const surplusMarks = multiplier - appliedMarks;

      updatedMarks[currentTurn][sector] = Math.min(3, currentSectorMarks + appliedMarks);
      newMarksGainedThisRound += appliedMarks;

      // Puntos si el rival aún no cerró y no estamos en NO_SCORE
      if (cricketMode !== 'NO_SCORE' && surplusMarks > 0 && opponentMarks < 3) {
        const addedPts = surplusMarks * sectorPointValue;
        if (cricketMode === 'DEFAULT') {
          updatedPoints[currentTurn] += addedPts;
        } else if (cricketMode === 'CUT_THROAT') {
          // Penalización al oponente
          updatedPoints[opponentIdx] += addedPts;
        }
      }
    });

    // Actualizar acumuladores
    const newTotalMarks = [...totalMarksMatch] as [number, number];
    newTotalMarks[currentTurn] += newMarksGainedThisRound;
    setTotalMarksMatch(newTotalMarks);

    const newRounds = [...rounds] as [number, number];
    newRounds[currentTurn] += 1;
    setRounds(newRounds);

    setMarks(updatedMarks);
    setPoints(updatedPoints);
    setHistory([...history, snapshot]);
    setCurrentVisitHits([]);

    // ¿Ganó el leg?
    const isClosedAll = CRICKET_SECTORS.every((sec) => updatedMarks[currentTurn][sec] >= 3);
    let isWinner = false;

    if (isClosedAll) {
      if (cricketMode === 'DEFAULT') {
        isWinner = updatedPoints[currentTurn] >= updatedPoints[opponentIdx];
      } else if (cricketMode === 'CUT_THROAT') {
        isWinner = updatedPoints[currentTurn] <= updatedPoints[opponentIdx];
      } else {
        isWinner = true; // NO_SCORE
      }
    }

    if (isWinner) {
      handleLegWin();
    } else {
      advanceTurn();
    }
  };

  const handleLegWin = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    if (soundFxEnabled) SoundEngine.playGameShot();
    if (voiceCallerEnabled) VoiceCaller.speakGameShot();

    const newLegs = [...legsWon] as [number, number];
    newLegs[currentTurn] += 1;
    setLegsWon(newLegs);

    const targetLegs = Math.ceil(config.bestOfLegs / 2);
    if (newLegs[currentTurn] >= targetLegs) {
      finishMatch(currentTurn);
    } else {
      // Siguiente leg
      setMarks([
        { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 },
        { '20': 0, '19': 0, '18': 0, '17': 0, '16': 0, '15': 0, '25': 0 }
      ]);
      setPoints([0, 0]);
      setCurrentVisitHits([]);
      setCurrentTurn(currentTurn === 0 ? 1 : 0);
    }
  };

  const finishMatch = (winnerIdx: 0 | 1) => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    setTimeout(() => {
      onMatchComplete({
        winnerIndex: winnerIdx,
        winnerName: winnerIdx === 0 ? p1Display : p2Display,
        gameType: 'CRICKET',
        cricketMode,
        points,
        legsWon,
        setsWon,
        mprP1: getMPR(0),
        mprP2: getMPR(1),
        roundsP1: rounds[0],
        roundsP2: rounds[1]
      });
    }, 1800);
  };

  const advanceTurn = () => {
    setCurrentTurn(currentTurn === 0 ? 1 : 0);
    setCurrentVisitHits([]);
  };

  // Deshacer
  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setMarks(prev.marks);
    setPoints(prev.points);
    setRounds(prev.rounds);
    setTotalMarksMatch(prev.totalMarksMatch);
    setCurrentTurn(prev.currentTurn);
    setLegsWon(prev.legsWon);
    setSetsWon(prev.setsWon);
    setHistory(history.slice(0, -1));
    setCurrentVisitHits([]);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-black border border-[#ef4444]/40 rounded-3xl p-3 sm:p-5 shadow-2xl shadow-black space-y-3 select-none">
      {/* Cabecera idéntica a la captura con botón Volver/Pausar */}
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
            <h2 className="text-lg font-black text-white leading-tight">Cricket</h2>
            <p className="text-[10px] text-slate-400">
              Modo: <span className="text-[#00e676] font-bold">{cricketMode}</span> • Legs: {config.bestOfLegs}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStats}
            title="Estadísticas"
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
          <button
            onClick={() => setShowHelpModal(true)}
            title="Reglas"
            className="p-1.5 rounded-xl bg-black text-slate-300 hover:text-white border border-slate-800"
          >
            <HelpCircle className="w-4 h-4 text-[#00e676]" />
          </button>
        </div>
      </div>

      {/* Cards de Jugadores (Puntos, MPR, Round, Open - Fondo Negro Puro) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Jugador 1 */}
        <div
          className={`rounded-2xl p-3 text-center transition-all ${
            currentTurn === 0
              ? 'bg-black border-2 border-[#00e676] shadow-xl shadow-[#00e676]/20'
              : 'bg-black border border-slate-800 opacity-70'
          }`}
        >
          <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate mb-1">
            {formatCardPlayerName(p1Display)}
          </div>
          <div className="text-4xl font-black text-white tracking-tight my-1">
            {points[0]}
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-bold pt-1 border-t border-slate-800/60">
            <div>
              <div className="text-slate-500 uppercase">MPR</div>
              <div className="text-white">{getMPR(0)}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase">Round</div>
              <div className="text-white">{rounds[0]}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase">Open</div>
              <div className="text-[#ef4444]">{getOpenMarks(0)}</div>
            </div>
          </div>
        </div>

        {/* Jugador 2 */}
        <div
          className={`rounded-2xl p-3 text-center transition-all ${
            currentTurn === 1
              ? 'bg-black border-2 border-[#00e676] shadow-xl shadow-[#00e676]/20'
              : 'bg-black border border-slate-800 opacity-70'
          }`}
        >
          <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate mb-1">
            {formatCardPlayerName(p2Display)}
          </div>
          <div className="text-4xl font-black text-white tracking-tight my-1">
            {points[1]}
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-bold pt-1 border-t border-slate-800/60">
            <div>
              <div className="text-slate-500 uppercase">MPR</div>
              <div className="text-white">{getMPR(1)}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase">Round</div>
              <div className="text-white">{rounds[1]}</div>
            </div>
            <div>
              <div className="text-slate-500 uppercase">Open</div>
              <div className="text-[#ef4444]">{getOpenMarks(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Sets / Legs (S/L) */}
      <div className="flex items-center justify-between px-6 py-1 bg-white rounded-lg text-slate-900 font-black text-xs sm:text-sm shadow-md">
        <span>{legsWon[0]}</span>
        <span className="text-slate-600 tracking-widest text-[11px]">S/L</span>
        <span>{legsWon[1]}</span>
      </div>

      {/* PIZARRA TÁCTIL DE MARCAS (5 COLUMNAS IDÉNTICA A LA CAPTURA) */}
      <div className="bg-[#0f1422] border border-[#ef4444]/30 rounded-2xl p-2 space-y-1">
        {CRICKET_SECTORS.map((sec) => {
          const isRed = ['20', '18', '16', '25'].includes(sec);
          const isGreen = ['19', '17', '15'].includes(sec);

          return (
            <div key={sec} className="grid grid-cols-5 gap-1.5 items-center">
              {/* Marcas Jugador 1 */}
              <div
                className={`h-10 rounded-xl bg-[#07090e] border flex items-center justify-center transition-all ${
                  marks[0][sec] >= 3
                    ? 'border-[#00e676] bg-[#00e676]/10'
                    : 'border-slate-800'
                }`}
              >
                {renderMarkSymbol(marks[0][sec])}
              </div>

              {/* Botón Doble (D) */}
              <button
                onClick={() => handleHitSector(sec, sec === '25' ? 2 : 2)}
                className={`h-10 rounded-xl font-black text-xs sm:text-sm border transition-all ${
                  isRed
                    ? 'bg-[#111622] hover:bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                    : 'bg-[#111622] hover:bg-[#00e676]/20 text-[#00e676] border-[#00e676]/30'
                }`}
              >
                {sec === '25' ? 'DBull' : `D${sec}`}
              </button>

              {/* Botón Simple */}
              <button
                onClick={() => handleHitSector(sec, 1)}
                className="h-10 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-white font-black text-sm sm:text-base border border-slate-700"
              >
                {SECTOR_LABELS[sec]}
              </button>

              {/* Botón Triple (T) o Vacío en Bull */}
              {sec !== '25' ? (
                <button
                  onClick={() => handleHitSector(sec, 3)}
                  className={`h-10 rounded-xl font-black text-xs sm:text-sm border transition-all ${
                    isRed
                      ? 'bg-[#111622] hover:bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                      : 'bg-[#111622] hover:bg-[#00e676]/20 text-[#00e676] border-[#00e676]/30'
                  }`}
                >
                  T{sec}
                </button>
              ) : (
                <div className="h-10 rounded-xl bg-transparent" />
              )}

              {/* Marcas Jugador 2 */}
              <div
                className={`h-10 rounded-xl bg-[#07090e] border flex items-center justify-center transition-all ${
                  marks[1][sec] >= 3
                    ? 'border-[#00e676] bg-[#00e676]/10'
                    : 'border-slate-800'
                }`}
              >
                {renderMarkSymbol(marks[1][sec])}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visor de impactos de la ronda actual */}
      <div className="h-10 rounded-xl bg-[#111622] border border-slate-800 flex items-center justify-center px-4 text-xs sm:text-sm font-bold text-white tracking-wide">
        {currentVisitHits.length === 0 ? (
          <span className="text-slate-500">Tocá los sectores para anotar hasta 3 dardos</span>
        ) : (
          <div className="flex items-center gap-3">
            {currentVisitHits.map((h, i) => (
              <span key={i} className="text-[#00e676]">
                {h.sector === '25' ? (h.multiplier === 2 ? 'DBull' : 'Bull') : `${h.multiplier > 1 ? (h.multiplier === 2 ? 'D' : 'T') : ''}${h.sector}`}
                <span className="text-slate-400 text-[10px] ml-1 font-normal">({h.multiplier} marcas)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Botón de confirmación OK / no Hit */}
      <button
        onClick={handleConfirmVisit}
        className={`w-full py-3.5 rounded-2xl font-black text-base tracking-wider transition-all transform active:scale-[0.99] border shadow-lg ${
          currentVisitHits.length > 0
            ? 'bg-[#00e676] hover:bg-[#00c864] text-[#07090e] border-[#00e676] shadow-[#00e676]/20'
            : 'bg-[#00e676]/80 hover:bg-[#00e676] text-[#07090e] border-[#00e676]/80'
        }`}
      >
        {currentVisitHits.length > 0 ? 'OK' : 'no Hit'}
      </button>

      {/* MODAL: Reglas de Cricket */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#07090e] border border-[#00e676]/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">Reglas del Cricket</h3>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>• Marcá los sectores del 15 al 20 y el Bull 3 veces cada uno.</p>
              <p>• Un simple vale 1 marca, un doble 2 marcas y un triple 3 marcas.</p>
              <p>• Si tenés un sector cerrado y el rival no, cada dardo extra suma puntos a tu favor (en modo Default).</p>
              <p>• Gana quien cierre los 7 sectores y tenga más puntos.</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}

      {/* MODAL OFICIAL DE SALIDA / STAND BY / ABANDONO */}
      <ExitMatchModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onStandBy={handleStandBy}
        onAbandon={handleAbandon}
        matchTitle={config.tournamentTitle || 'Partida de Cricket'}
        isTournamentMatch={!!config.tournamentTitle}
        player1Name={p1Display}
        player2Name={p2Display}
        currentScoreOrLegs={`P1: ${points[0]} pts (${legsWon[0]} legs) • P2: ${points[1]} pts (${legsWon[1]} legs)`}
      />
    </div>
  );
};
