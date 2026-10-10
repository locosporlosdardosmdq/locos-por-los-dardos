'use client';

import React, { useState } from 'react';
import { MatchGameSettings } from './MatchGameSettings';
import { X01Board } from './X01Board';
import { CricketBoard } from './CricketBoard';
import { MatchPdcStatsModal } from './MatchPdcStatsModal';
import { MatchConfig } from '@/lib/types';
import { MOCK_CURRENT_USER, MOCK_RANKINGS } from '@/lib/constants';
import { saveCompletedMatch } from '@/lib/storage';
import { matchBroadcast } from '@/lib/broadcast';

interface DartScorerProps {
  initialConfig?: Partial<MatchConfig>;
  onTournamentMatchFinished?: (result: any) => void;
}

export const DartScorer: React.FC<DartScorerProps> = ({
  initialConfig,
  onTournamentMatchFinished
}) => {
  // Configuración por defecto
  const defaultMatchConfig: MatchConfig = {
    gameType: 'X01',
    startingScore: 501,
    outMode: 'DOUBLE_OUT',
    inputFormat: 'SCORE',
    distanceType: 'LEGS',
    bestOfSets: 1,
    bestOfLegs: 3,
    doubleIn: false,
    twoClearLegs: false,
    isDoubles: false,
    isVsCpu: false,
    cpuDifficulty: 'MEDIUM',
    player1: {
      id: MOCK_CURRENT_USER.id,
      name: MOCK_CURRENT_USER.fullName,
      nickname: MOCK_CURRENT_USER.nickname,
      avatarUrl: MOCK_CURRENT_USER.avatarUrl
    },
    player2: {
      id: MOCK_RANKINGS[0].id,
      name: MOCK_RANKINGS[0].fullName,
      nickname: MOCK_RANKINGS[0].nickname,
      avatarUrl: MOCK_RANKINGS[0].avatarUrl
    },
    player1Name: MOCK_CURRENT_USER.fullName,
    player2Name: MOCK_RANKINGS[0].fullName,
    ...initialConfig
  };

  const [activeConfig, setActiveConfig] = useState<MatchConfig>(defaultMatchConfig);
  const [viewState, setViewState] = useState<'SETTINGS' | 'PLAYING'>('SETTINGS');

  // Estado de Audio y Árbitro
  const [voiceCallerEnabled, setVoiceCallerEnabled] = useState(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState(true);

  // Modal de Estadísticas PDC
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [matchStatsData, setMatchStatsData] = useState<any>({
    gameType: 'X01',
    legsP1: 0,
    legsP2: 0,
    avgP1: '0.00',
    avgP2: '0.00',
    first9P1: '0.00',
    first9P2: '0.00',
    count100sP1: 0,
    count100sP2: 0,
    count140sP1: 0,
    count140sP2: 0,
    count180sP1: 0,
    count180sP2: 0,
    highFinishP1: 0,
    highFinishP2: 0,
    bestLegP1: 0,
    bestLegP2: 0
  });

  // Iniciar partida desde la pantalla de configuración previa
  const handleStartMatch = (config: MatchConfig) => {
    setActiveConfig(config);
    setViewState('PLAYING');

    // Inicializar broadcast de partido para las pantallas del club
    matchBroadcast.publish({
      matchId: `match-${Date.now()}`,
      gameType: config.gameType,
      player1Name: config.player1.name,
      player1Score: config.startingScore,
      player1Avg: 0,
      player1Legs: 0,
      player2Name: config.player2.name,
      player2Score: config.startingScore,
      player2Avg: 0,
      player2Legs: 0,
      currentTurnIndex: 0,
      lastScore: 0,
      lastDarts: [],
      status: 'IN_PROGRESS'
    });
  };

  // Salir de la partida
  const handleExitMatch = () => {
    if (confirm('¿Estás seguro de que querés salir de la partida en curso?')) {
      setViewState('SETTINGS');
    }
  };

  // Partida completada (Game Shot & Match)
  const handleMatchCompleted = (result: any) => {
    const isP1Winner = result.winnerIndex === 0;

    const statsPayload = {
      gameType: activeConfig.gameType,
      legsP1: result.legsWon ? result.legsWon[0] : isP1Winner ? 1 : 0,
      legsP2: result.legsWon ? result.legsWon[1] : isP1Winner ? 0 : 1,
      avgP1: result.avgP1 || '0.00',
      avgP2: result.avgP2 || '0.00',
      first9P1: result.first9P1 || '0.00',
      first9P2: result.first9P2 || '0.00',
      count100sP1: result.count100s ? result.count100s[0] : 0,
      count100sP2: result.count100s ? result.count100s[1] : 0,
      count140sP1: result.count140s ? result.count140s[0] : 0,
      count140sP2: result.count140s ? result.count140s[1] : 0,
      count180sP1: result.count180s ? result.count180s[0] : 0,
      count180sP2: result.count180s ? result.count180s[1] : 0,
      highFinishP1: result.highestCheckout ? result.highestCheckout[0] : 0,
      highFinishP2: result.highestCheckout ? result.highestCheckout[1] : 0,
      bestLegP1: result.bestLegDarts ? result.bestLegDarts[0] : 0,
      bestLegP2: result.bestLegDarts ? result.bestLegDarts[1] : 0,
      mprP1: result.mprP1 || '0.00',
      mprP2: result.mprP2 || '0.00'
    };

    setMatchStatsData(statsPayload);
    setShowStatsModal(true);

    // Guardar en persistencia local
    try {
      saveCompletedMatch({
        gameType: (activeConfig.gameType === 'X01' ? 'X01' : 'CRICKET') as any,
        players: [
          {
            name: activeConfig.player1.name,
            score: 0,
            avg: parseFloat(result.avgP1 || '0'),
            first9Avg: parseFloat(result.first9P1 || '0'),
            legsWon: statsPayload.legsP1,
            dartsThrown: result.totalDartsMatch ? result.totalDartsMatch[0] : 0,
            isWinner: isP1Winner
          },
          {
            name: activeConfig.player2.name,
            score: 0,
            avg: parseFloat(result.avgP2 || '0'),
            first9Avg: parseFloat(result.first9P2 || '0'),
            legsWon: statsPayload.legsP2,
            dartsThrown: result.totalDartsMatch ? result.totalDartsMatch[1] : 0,
            isWinner: !isP1Winner
          }
        ],
        legsTotal: statsPayload.legsP1 + statsPayload.legsP2,
        winnerName: result.winnerName
      });
    } catch (e) {
      console.warn('Error guardando partido localmente:', e);
    }

    // Si viene de un torneo
    if (onTournamentMatchFinished) {
      onTournamentMatchFinished(result);
    }
  };

  return (
    <div className="w-full">
      {viewState === 'SETTINGS' ? (
        <MatchGameSettings
          onStartMatch={handleStartMatch}
          voiceCallerEnabled={voiceCallerEnabled}
          onToggleVoiceCaller={() => setVoiceCallerEnabled(!voiceCallerEnabled)}
          soundFxEnabled={soundFxEnabled}
          onToggleSoundFx={() => setSoundFxEnabled(!soundFxEnabled)}
        />
      ) : activeConfig.gameType === 'X01' ? (
        <X01Board
          config={activeConfig}
          onExit={handleExitMatch}
          onMatchComplete={handleMatchCompleted}
          voiceCallerEnabled={voiceCallerEnabled}
          soundFxEnabled={soundFxEnabled}
          onOpenStats={() => setShowStatsModal(true)}
        />
      ) : (
        <CricketBoard
          config={activeConfig}
          onExit={handleExitMatch}
          onMatchComplete={handleMatchCompleted}
          voiceCallerEnabled={voiceCallerEnabled}
          soundFxEnabled={soundFxEnabled}
          onOpenStats={() => setShowStatsModal(true)}
        />
      )}

      {/* Modal de Estadísticas Oficiales PDC */}
      <MatchPdcStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        p1Name={activeConfig.player1.name}
        p2Name={activeConfig.player2.name}
        stats={matchStatsData}
      />
    </div>
  );
};
