'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MatchConfig, DartThrow } from '@/lib/types';
import { SoundEngine, VoiceCaller, isAppAudioMuted, setAppAudioMuted, unlockAudio } from '@/lib/sound-effects';
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
  SwitchCamera,
  Mic,
  MicOff,
  Target,
  Settings2,
  Sliders,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  RefreshCw,
  LayoutGrid,
  Users,
  Video,
  VideoOff,
  Eye,
  EyeOff,
  X,
  Bot
} from 'lucide-react';
import { matchBroadcast } from '@/lib/broadcast';
import { normalizeRoomCode } from '@/lib/online-rooms';
import { 
  getActiveWebRtcHandler, 
  setActiveWebRtcHandler,
  hostPeerRoom,
  joinPeerRoom,
  setWebRtcThrowListener, 
  setWebRtcRemoteStreamListener, 
  getActiveRemoteStream 
} from '@/lib/webrtc-room';

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
  timestamp?: number;
}

/**
 * Extrae y formatea el apodo o Nick oficial del jugador para el Anotador
 */
function getPlayerDisplayNick(player: { name: string; nickname?: string; isBot?: boolean }): string {
  if (player.nickname && player.nickname.trim()) {
    return player.nickname.trim();
  }
  const matchParen = player.name.match(/\(([^)]+)\)/);
  if (matchParen && matchParen[1].trim()) {
    return matchParen[1].trim();
  }
  const matchQuotes = player.name.match(/["'«]([^"'»]+)["'»]/);
  if (matchQuotes && matchQuotes[1].trim()) {
    return matchQuotes[1].trim();
  }
  return formatCardPlayerName(player.name);
}

/**
 * Motor de Inteligencia Artificial para rivales CPU (Inspirado en My Dart Training)
 * Simula de forma realista visitas de 3 dardos según el AVG objetivo y probabilidades de cierre
 */
function calculateBotTurnScore(
  currentScore: number,
  targetAvg: number,
  outMode: 'SINGLE_OUT' | 'DOUBLE_OUT' | 'MASTER_OUT'
): number {
  const impossibleDoubleOutCheckouts = new Set([169, 168, 166, 165, 163, 162, 159]);
  const canCheckout = currentScore <= 170 && !impossibleDoubleOutCheckouts.has(currentScore) && currentScore > 1;

  if (canCheckout) {
    // Curva de checkout según nivel de AVG objetivo (estilo My Dart Training)
    const checkoutChance = Math.min(0.65, Math.max(0.10, (targetAvg - 20) / 100));
    const directDoubleBonus = currentScore <= 40 && currentScore % 2 === 0 ? 0.08 : 0;
    const finalCheckoutChance = Math.min(0.85, checkoutChance + directDoubleBonus);

    if (Math.random() < finalCheckoutChance) {
      return currentScore; // ¡Game Shot! Cierre exitoso
    }

    if (currentScore <= 40) {
      const roll = Math.random();
      if (roll < 0.08) {
        return currentScore + 1 > 180 ? 0 : currentScore - 1; // Bust accidental
      } else if (roll < 0.45) {
        return 0; // Dardos afuera de la diana
      } else {
        const half = Math.floor(currentScore / 2);
        if (half >= 2 && (currentScore - half) >= 2) {
          return half;
        }
        return 0;
      }
    }

    // Intento de setup a un doble cómodo (40, 32, 36, 24, 16)
    const desirableLeaves = [40, 32, 36, 24, 16];
    for (const leave of desirableLeaves) {
      const neededScore = currentScore - leave;
      if (neededScore > 0 && neededScore <= 140) {
        if (Math.random() < 0.45) {
          return neededScore;
        }
      }
    }
  }

  // Puntuación regular (Scoring phase) con distribución de diana real
  const commonScores = [26, 41, 45, 60, 60, 81, 85, 100, 100, 120, 140];
  const u1 = Math.random() || 0.001;
  const u2 = Math.random() || 0.001;
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const jitter = z0 * 16;
  let rawScore = Math.round(targetAvg + jitter);

  // Atracción a puntajes comunes de 3 dardos en sector 20
  if (Math.random() < 0.35) {
    const closest = commonScores.reduce((prev, curr) => 
      Math.abs(curr - rawScore) < Math.abs(prev - rawScore) ? curr : prev
    );
    if (Math.abs(closest - rawScore) < 18) {
      rawScore = closest;
    }
  }

  rawScore = Math.max(0, Math.min(180, rawScore));
  const impossible3DartScores = new Set([179, 178, 176, 175, 173, 172, 169, 166, 163]);
  if (impossible3DartScores.has(rawScore)) {
    rawScore -= 1;
  }

  const remainingAfter = currentScore - rawScore;
  if (remainingAfter < 0 || remainingAfter === 1) {
    if (currentScore > 60) {
      rawScore = Math.max(0, currentScore - 40);
    } else if (currentScore > 2) {
      if (Math.random() < 0.10) {
        return currentScore + 1; // bust
      }
      return 0;
    } else {
      return 0;
    }
  }

  return rawScore;
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

  // Cámara y Micrófono en dispositivo móvil/PC (Doble Diana P2P estilo Nakka N01)
  const [showMobileCamera, setShowMobileCamera] = useState<boolean>(() => !!config.isOnlineRoom);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment'); // Trasera por defecto en móviles
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraDeviceId, setSelectedCameraDeviceId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lpld_camera_device_id') || '';
    }
    return '';
  });
  const [showCameraSelectModal, setShowCameraSelectModal] = useState<boolean>(false);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState<boolean>(false);

  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const mobileStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stream remoto de la cámara y audio del contrincante vía WebRTC P2P
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(getActiveRemoteStream());
  const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState<boolean>(false);
  const [isRemoteVideoHidden, setIsRemoteVideoHidden] = useState<boolean>(false);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Modo de Alternancia de Cámara en Partidas Online (Nakka Style)
  // 'AUTO': conmuta automáticamente según el turno del tirador
  // 'DUAL': muestra ambas dianas (rival y local) lado a lado
  // 'RIVAL': fija la diana del rival
  // 'LOCAL': fija la diana propia
  const [cameraFocusMode, setCameraFocusMode] = useState<'AUTO' | 'DUAL' | 'RIVAL' | 'LOCAL'>('AUTO');
  const [isDesktopSplitEnabled, setIsDesktopSplitEnabled] = useState<boolean>(() => !!config.isOnlineRoom);
  const splitScreenVideoRef = useRef<HTMLVideoElement>(null);

  // Modal Emergente de Diana del Rival (Optimizado para PC y móviles)
  const [showRivalModal, setShowRivalModal] = useState<boolean>(false);
  const modalRemoteVideoRef = useRef<HTMLVideoElement>(null);

  // Inversión manual de orden de cámaras (Izquierda / Derecha) para vista Dual y Móvil
  const [isCamerasSwapped, setIsCamerasSwapped] = useState<boolean>(false);

  // Función Central de Apagado de Hardware y Desconexión WebRTC
  const cleanupHardwareAndWebRtc = useCallback((isAbandoning: boolean = false) => {
    console.log('[X01Board] Apagando hardware de cámara (isAbandoning:', isAbandoning, ')...');
    if (mobileStreamRef.current) {
      try {
        mobileStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      mobileStreamRef.current = null;
    }
    setLocalStream(null);
    if (mobileVideoRef.current) {
      mobileVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (modalRemoteVideoRef.current) {
      modalRemoteVideoRef.current.srcObject = null;
    }
    if (splitScreenVideoRef.current) {
      splitScreenVideoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Solo si el usuario abandona deliberadamente la partida se envía la señal de LEAVE y se destruye WebRTC.
    // Si es un simple cambio de pestaña/menú, la sala se mantiene viva para reconectar automáticamente.
    if (isAbandoning) {
      try {
        const webrtc = getActiveWebRtcHandler();
        if (webrtc) {
          if (typeof webrtc.sendLeave === 'function') {
            webrtc.sendLeave();
          }
          webrtc.destroy();
          setActiveWebRtcHandler(null);
        }
      } catch (e) {}
    }
  }, []);

  // Cleanup garantizado al desmontar el componente (navegación atrás, cambio de ruta, etc.)
  useEffect(() => {
    return () => {
      cleanupHardwareAndWebRtc(false);
    };
  }, [cleanupHardwareAndWebRtc]);

  const handleTogglePiP = async () => {
    try {
      if (typeof document !== 'undefined' && document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (modalRemoteVideoRef.current) {
        await modalRemoteVideoRef.current.requestPictureInPicture();
      } else if (remoteVideoRef.current) {
        await remoteVideoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP notice:', e);
    }
  };

  const handleRetryWebRtc = () => {
    showFeedback('Reconectando cámara y audio con el rival...', '#00e676');
    unlockAudio();
    try {
      const webrtc = getActiveWebRtcHandler();
      if (webrtc && mobileStreamRef.current) {
        webrtc.sendMediaStream(mobileStreamRef.current);
      } else if (config.isOnlineRoom && config.onlineRoomCode) {
        const cleanCode = normalizeRoomCode(config.onlineRoomCode);
        const playerIdx = (config.localPlayerIndex !== undefined ? config.localPlayerIndex : 0) as 0 | 1;
        if (playerIdx === 0) {
          hostPeerRoom(cleanCode, config.player1, config, () => {}, () => {}, () => {})
            .then((h) => {
              setActiveWebRtcHandler(h);
              if (mobileStreamRef.current) h.sendMediaStream(mobileStreamRef.current);
            }).catch(() => {});
        } else {
          joinPeerRoom(cleanCode, config.player2, () => {}, () => {}, () => {})
            .then((h) => {
              setActiveWebRtcHandler(h);
              if (mobileStreamRef.current) h.sendMediaStream(mobileStreamRef.current);
            }).catch(() => {});
        }
      }
    } catch (e) {}
  };

  // Detectar y listar dispositivos de cámara disponibles (webcam integrada, USB, OBS)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoInputs);
      }).catch((e) => console.warn('[EnumerateDevices Error]:', e));
    }
  }, [showMobileCamera]);

  useEffect(() => {
    setWebRtcRemoteStreamListener((stream) => {
      console.log('[WebRTC P2P] Stream de cámara/audio rival actualizado:', !!stream);
      setRemoteStream(stream);
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (modalRemoteVideoRef.current && stream) {
        modalRemoteVideoRef.current.srcObject = stream;
        modalRemoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().then(() => {
          setAudioAutoplayBlocked(false);
        }).catch((err) => {
          console.warn('[Audio WebRTC Autoplay Blocked]:', err);
          setAudioAutoplayBlocked(true);
        });
      }
    });

    return () => {
      setWebRtcRemoteStreamListener(null);
    };
  }, []);

  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (splitScreenVideoRef.current) {
        splitScreenVideoRef.current.srcObject = remoteStream;
        splitScreenVideoRef.current.play().catch(() => {});
      }
      if (modalRemoteVideoRef.current) {
        modalRemoteVideoRef.current.srcObject = remoteStream;
        modalRemoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.muted = isRemoteAudioMuted;
        remoteAudioRef.current.play().then(() => {
          setAudioAutoplayBlocked(false);
        }).catch((err) => {
          console.warn('[Audio WebRTC Autoplay Blocked on Device]:', err);
          setAudioAutoplayBlocked(true);
        });
      }
    }
  }, [remoteStream, showRivalModal, isRemoteAudioMuted, cameraFocusMode]);

  // Alternar entre cámara trasera (diana) y delantera (jugador)
  const handleToggleCameraFacing = () => {
    setCameraFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setSelectedCameraDeviceId('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lpld_camera_device_id');
    }
  };

  const handleSelectCameraDevice = (deviceId: string) => {
    setSelectedCameraDeviceId(deviceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lpld_camera_device_id', deviceId);
    }
    setShowCameraSelectModal(false);
    showFeedback('Cámara seleccionada y activada', '#00e676');
  };

  const handleToggleRemoteAudio = () => {
    const next = !isRemoteAudioMuted;
    setIsRemoteAudioMuted(next);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = next;
      if (!next) {
        remoteAudioRef.current.play().then(() => {
          setAudioAutoplayBlocked(false);
        }).catch((e) => console.warn('Remote audio play notice:', e));
      }
    }
    showFeedback(next ? 'Audio del rival silenciado' : 'Audio del rival activado', next ? '#ef4444' : '#00e676');
  };

  const handleToggleRemoteVideo = () => {
    const next = !isRemoteVideoHidden;
    setIsRemoteVideoHidden(next);
    showFeedback(next ? 'Video del rival ocultado' : 'Video del rival visible', next ? '#ef4444' : '#00e676');
  };

  const handleUnlockRemoteAudio = () => {
    setIsRemoteAudioMuted(false);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.play().then(() => {
        setAudioAutoplayBlocked(false);
        showFeedback('Audio del rival activado', '#00e676');
      }).catch((e) => {
        console.warn('Could not unlock audio:', e);
      });
    }
  };

  useEffect(() => {
    if (showMobileCamera && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      // Detener stream anterior si se está alternando de cámara
      if (mobileStreamRef.current) {
        mobileStreamRef.current.getTracks().forEach((t) => t.stop());
        mobileStreamRef.current = null;
      }

      // Constraints de video optimizados (480p / 720p 20fps) para evitar saturar subida en conexiones residenciales y 4G
      const videoConstraints: MediaTrackConstraints = selectedCameraDeviceId
        ? { 
            deviceId: { exact: selectedCameraDeviceId }, 
            width: { ideal: 854, max: 1280 }, 
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 20, max: 24 }
          }
        : { 
            facingMode: { ideal: cameraFacingMode }, 
            width: { ideal: 854, max: 1280 }, 
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 20, max: 24 }
          };

      const initSpeechAnalyser = (stream: MediaStream) => {
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
      };

      navigator.mediaDevices
        .getUserMedia({ 
          video: videoConstraints, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        .then((stream) => {
          mobileStreamRef.current = stream;
          setLocalStream(stream);
          if (mobileVideoRef.current) {
            mobileVideoRef.current.srcObject = stream;
          }

          // Transmitir inmediatamente la cámara al rival por WebRTC TURN P2P
          try {
            const webrtc = getActiveWebRtcHandler();
            if (webrtc) {
              webrtc.sendMediaStream(stream);
            }
          } catch (e) {
            console.warn('[WebRTC SendMediaStream Notice]:', e);
          }

          // Refrescar lista de cámaras una vez otorgado el permiso para obtener nombres legibles
          if (navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devs) => {
              setAvailableCameras(devs.filter((d) => d.kind === 'videoinput'));
            }).catch(() => {});
          }

          initSpeechAnalyser(stream);
        })
        .catch((err) => {
          console.warn('Cámara con constraints optimizados falló, intentando fallback simple:', err);
          // Fallback simple compatible con webcams de PC de escritorio y drivers genéricos
          if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices
              .getUserMedia({ 
                video: true, 
                audio: { echoCancellation: true, noiseSuppression: true } 
              })
              .then((fallbackStream) => {
                mobileStreamRef.current = fallbackStream;
                setLocalStream(fallbackStream);
                if (mobileVideoRef.current) {
                  mobileVideoRef.current.srcObject = fallbackStream;
                }
                try {
                  const webrtc = getActiveWebRtcHandler();
                  if (webrtc) webrtc.sendMediaStream(fallbackStream);
                } catch (e) {}
                initSpeechAnalyser(fallbackStream);
              })
              .catch((fallbackErr) => {
                console.warn('Cámara o micrófono no disponible en fallback:', fallbackErr);
              });
          }
        });
    } else {
      if (mobileStreamRef.current) {
        mobileStreamRef.current.getTracks().forEach((t) => t.stop());
        mobileStreamRef.current = null;
      }
      setLocalStream(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsSpeaking(false);
    }
  }, [showMobileCamera, cameraFacingMode, selectedCameraDeviceId]);

  // Manejar silenciado de micrófono en caliente
  useEffect(() => {
    if (mobileStreamRef.current) {
      mobileStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
    }
  }, [isMicMuted]);

  // En partidas locales no online, al volver el turno local se puede replegar la cámara si se desea
  useEffect(() => {
    if (!config.isOnlineRoom && currentTurn === 0 && showMobileCamera) {
      setShowMobileCamera(false);
    }
  }, [currentTurn, config.isOnlineRoom]);

  // Manejador de Ventana Pop-out Desacoplada para 2º Monitor o TV (Nakka Style)
  const handleOpenPopout = () => {
    if (typeof window !== 'undefined') {
      const roomParam = config.onlineRoomCode ? `?room=${encodeURIComponent(config.onlineRoomCode)}` : '';
      const popoutUrl = `/anotador/camara-popout${roomParam}`;
      const win = window.open(
        popoutUrl,
        'DianaRivalPopoutWindow',
        'width=1080,height=760,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      );
      if (win) {
        win.focus();
        showFeedback('Ventana Pop-out abierta para 2º monitor / TV', '#00e676');
        return;
      }
    }
    setShowRivalModal(true);
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

  // Auto-guardado de sesión activa en localStorage ante inicio de partida y cada visita
  useEffect(() => {
    if (!isMatchFinished) {
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
    // Si es partida online o ya se tiró algún dardo, abre modal de opciones (Stand By / Abandonar / Continuar)
    if (config.isOnlineRoom || history.length > 0 || turnHistory.length > 0) {
      setShowExitModal(true);
      return;
    }
    // Si es partida local sin tiros, vuelve directo a configurar partida
    cleanupHardwareAndWebRtc(true);
    clearActiveMatchSession();
    onExit();
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
    cleanupHardwareAndWebRtc(false);
    if (onStandBy) {
      onStandBy();
    } else {
      onExit();
    }
  };

  const handleAbandon = () => {
    setShowExitModal(false);
    cleanupHardwareAndWebRtc(true);
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

  // Nombres de los jugadores en pantalla (Priorizar Nicknames / Apodos oficiales)
  const p1Display = getPlayerDisplayNick(config.player1);
  const p2Display = getPlayerDisplayNick(config.player2);

  // Quién tira específicamente si es parejas
  const getCurrentShooterName = () => {
    if (!config.isDoubles) {
      return currentTurn === 0 ? p1Display : p2Display;
    }
    if (currentTurn === 0) {
      return p1TeammateTurn === 0
        ? (config.player1.nickname || config.player1.name)
        : (config.player1.teammateNickname || config.player1.teammateName || 'Compañero 1');
    } else {
      return p2TeammateTurn === 0
        ? (config.player2.nickname || config.player2.name)
        : (config.player2.teammateNickname || config.player2.teammateName || 'Compañero 2');
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
      starterTurnIndex: starterTurn,
      onlineRoomCode: config.onlineRoomCode,
      turnHistory: turnHistory.slice(0, 10).map((t) => ({
        playerName: t.playerName,
        score: t.score,
        remainingAfter: t.remainingAfter,
        isBust: t.isBust,
        timestamp: t.timestamp || Date.now()
      })),
      winner: isFinishedState ? (matchWinnerIndex === 0 ? p1Display : p2Display) : undefined
    });
  };

  useEffect(() => {
    broadcastCurrentState(0, isMatchFinished);
  }, [scores, currentTurn, legsWon, setsWon, isMatchFinished]);

  // Variables y Sincronización para Sala Online (1 vs 1 Remoto)
  const isOnline = !!config.isOnlineRoom;
  const localPlayerIdx: 0 | 1 = (config.localPlayerIndex !== undefined ? config.localPlayerIndex : 0) as 0 | 1;
  const rivalPlayerIdx: 0 | 1 = localPlayerIdx === 0 ? 1 : 0;
  const rivalDisplay = rivalPlayerIdx === 0 ? p1Display : p2Display;
  const isMyTurn = !isOnline || currentTurn === localPlayerIdx;
  const isRivalTurn = isOnline && currentTurn === rivalPlayerIdx;
  const lastSyncedThrowTimeRef = useRef<number>(Date.now());

  // Determinar qué diana debe verse en grande (Nakka Style Turn-based Camera)
  const shouldShowRivalCamera = useMemo(() => {
    if (cameraFocusMode === 'DUAL') return false; // El modo DUAL renderiza ambas dianas simultáneamente
    if (cameraFocusMode === 'RIVAL') return true;
    if (cameraFocusMode === 'LOCAL') return false;
    return isRivalTurn;
  }, [cameraFocusMode, isRivalTurn]);

  // Conectar stream a splitScreenVideoRef en tiempo real
  useEffect(() => {
    if (splitScreenVideoRef.current) {
      const targetStream = shouldShowRivalCamera ? remoteStream : (localStream || mobileStreamRef.current);
      splitScreenVideoRef.current.srcObject = targetStream || null;
      if (targetStream) {
        splitScreenVideoRef.current.play().catch(() => {});
      }
    }
  }, [shouldShowRivalCamera, remoteStream, localStream, showMobileCamera]);

  // Auto-conexión / Auto-Healing de WebRTC si la sala es online y no hay handler activo
  useEffect(() => {
    if (!config.isOnlineRoom || !config.onlineRoomCode) return;
    const cleanCode = normalizeRoomCode(config.onlineRoomCode);

    if (!getActiveWebRtcHandler()) {
      console.log('[WebRTC Auto-Healing] Conectando sala P2P:', cleanCode, 'rol:', localPlayerIdx);
      if (localPlayerIdx === 0) {
        hostPeerRoom(
          cleanCode,
          config.player1,
          config,
          () => {},
          () => {},
          (err) => console.log('[WebRTC AutoHost Notice]:', err)
        ).then((handler) => {
          setActiveWebRtcHandler(handler);
          if (mobileStreamRef.current) {
            handler.sendMediaStream(mobileStreamRef.current);
          }
        }).catch(() => {});
      } else {
        joinPeerRoom(
          cleanCode,
          config.player2,
          () => {},
          () => {},
          (err) => console.log('[WebRTC AutoJoin Notice]:', err)
        ).then((handler) => {
          setActiveWebRtcHandler(handler);
          if (mobileStreamRef.current) {
            handler.sendMediaStream(mobileStreamRef.current);
          }
        }).catch(() => {});
      }
    } else {
      const handler = getActiveWebRtcHandler();
      if (handler && mobileStreamRef.current) {
        handler.sendMediaStream(mobileStreamRef.current);
      }
    }
  }, [config.isOnlineRoom, config.onlineRoomCode, localPlayerIdx]);

  // Sincronización instantánea de tiradas vía WebRTC P2P (< 30ms)
  useEffect(() => {
    if (!config.isOnlineRoom) return;

    setWebRtcThrowListener((score, _darts, _isCheckout) => {
      console.log('[WebRTC P2P] Recibida tirada del rival:', score);
      // Disparar audio oficial de Russ Bray inmediatamente para que el contrincante escuche los tantos
      try {
        if (!isMuted) {
          if (score === 180) {
            SoundEngine.play180();
            if (voiceCallerEnabled) VoiceCaller.speakScore(180);
          } else if (score >= 100) {
            if (voiceCallerEnabled) VoiceCaller.speakScore(score);
          } else if (score > 0) {
            SoundEngine.playDartHit();
            if (voiceCallerEnabled) VoiceCaller.speakScore(score);
          }
        }
      } catch (e) {
        console.warn('[Audio WebRTC Sync Notice]:', e);
      }
      submitScore(score, true);
    });

    return () => {
      setWebRtcThrowListener(null);
    };
  }, [config.isOnlineRoom, currentTurn, scores, isMuted, voiceCallerEnabled]);

  // Polling continuo y Heartbeat bidireccional en sala online (Auto-Healing de WebRTC + Sincronización de Tiros)
  useEffect(() => {
    if (!config.isOnlineRoom || isMatchFinished || !config.onlineRoomCode) return;

    const cleanCode = normalizeRoomCode(config.onlineRoomCode);

    const interval = setInterval(async () => {
      try {
        const handler = getActiveWebRtcHandler();
        const myPeerId = handler?.getPeerId?.();

        const res = await fetch('/api/salas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'HEARTBEAT',
            code: cleanCode,
            playerIndex: localPlayerIdx,
            peerId: myPeerId
          })
        });
        const data = await res.json();

        if (data.success && data.room) {
          const room = data.room;

          // 1. Sincronización de tiros del rival
          if (room.lastThrow && room.lastThrow.timestamp > lastSyncedThrowTimeRef.current) {
            lastSyncedThrowTimeRef.current = room.lastThrow.timestamp;
            submitScore(room.lastThrow.score, true);
          }

          // 2. Auto-Healing de conexión de video y audio si el rival refrescó la pantalla (F5)
          const targetPeerId = localPlayerIdx === 0 ? room.guestPeerId : room.hostPeerId;
          if (targetPeerId) {
            if (handler) {
              if (!remoteStream || remoteStream.getTracks().length === 0) {
                handler.connectToPeer?.(targetPeerId);
                if (mobileStreamRef.current) {
                  handler.sendMediaStream(mobileStreamRef.current);
                }
              }
            } else {
              // Si no había handler activo aún, reconectar de inmediato
              if (localPlayerIdx === 0) {
                hostPeerRoom(cleanCode, config.player1, config, () => {}, () => {}, () => {})
                  .then((h) => {
                    setActiveWebRtcHandler(h);
                    if (mobileStreamRef.current) h.sendMediaStream(mobileStreamRef.current);
                    if (targetPeerId) h.connectToPeer?.(targetPeerId);
                  }).catch(() => {});
              } else {
                joinPeerRoom(cleanCode, config.player2, () => {}, () => {}, () => {})
                  .then((h) => {
                    setActiveWebRtcHandler(h);
                    if (mobileStreamRef.current) h.sendMediaStream(mobileStreamRef.current);
                    if (targetPeerId) h.connectToPeer?.(targetPeerId);
                  }).catch(() => {});
              }
            }
          }
        }
      } catch (err) {
        // Ignorar fallo de red puntual
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [config.isOnlineRoom, isMatchFinished, config.onlineRoomCode, localPlayerIdx, remoteStream]);

  // Puntajes matemáticamente imposibles de lograr con 3 dardos en el tablero oficial
  const IMPOSSIBLE_SCORES_3_DARTS = [163, 166, 169, 172, 173, 175, 176, 178, 179];
  // Números Bogey: imposibles de cerrar con 3 dardos en Double Out
  const BOGEY_CHECKOUTS = [159, 162, 163, 165, 166, 168, 169];

  // Procesar entrada de puntuación con validación estricta del reglamento oficial
  const submitScore = (score: number, fromRemoteSync: boolean = false) => {
    // 1. Rango físico de 3 dardos (el máximo posible es 180: T20 + T20 + T20)
    if (isNaN(score) || score < 0 || score > 180) {
      showFeedback('Puntuación inválida (máximo 180 en 3 dardos)', '#ef4444');
      setTypedInput('');
      return;
    }

    // 2. Puntajes matemáticamente imposibles en 3 dardos
    if (IMPOSSIBLE_SCORES_3_DARTS.includes(score)) {
      showFeedback(`¡Puntaje imposible en 3 dardos (${score})!`, '#ef4444');
      setTypedInput('');
      return;
    }

    const currentScore = scores[currentTurn];
    const newRemaining = currentScore - score;

    // 3. Reglas de Cierre (Checkout) en Double Out:
    // El cierre máximo posible en dardos es 170 (T20 + T20 + Bull). No existe checkout > 170.
    if (newRemaining === 0 && config.outMode === 'DOUBLE_OUT') {
      if (score > 170) {
        showFeedback('No es posible cerrar con más de 170 en Doble Out (Máx 170)', '#ef4444');
        setTypedInput('');
        return;
      }
      if (BOGEY_CHECKOUTS.includes(score)) {
        showFeedback(`El ${score} es un número Bogey (imposible de cerrar en Doble Out)`, '#ef4444');
        setTypedInput('');
        return;
      }
    }

    // Si es una partida online y el tiro es del usuario local, sincronizar con el servidor y WebRTC
    if (!fromRemoteSync && config.isOnlineRoom && config.onlineRoomCode) {
      lastSyncedThrowTimeRef.current = Date.now();
      const cleanCode = normalizeRoomCode(config.onlineRoomCode);

      // 1. Envío instantáneo por WebRTC P2P
      try {
        const webrtc = getActiveWebRtcHandler();
        if (webrtc) {
          webrtc.sendThrow(score, [], newRemaining === 0);
        }
      } catch (e) {}

      // 2. Envío a API REST como respaldo
      fetch('/api/salas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'THROW',
          code: cleanCode,
          playerIndex: localPlayerIdx,
          score,
          isCheckout: newRemaining === 0
        })
      }).catch((err) => console.warn('[Online Room] Error sincronizando tiro:', err));
    }

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
      (newRemaining === 0 && config.outMode === 'DOUBLE_OUT' && (score === 1 || score > 170 || BOGEY_CHECKOUTS.includes(score)));

    if (isBust) {
      if (soundFxEnabled) SoundEngine.playBust();
      if (voiceCallerEnabled) VoiceCaller.speakBust();
      const bustMsg = newRemaining === 1 
        ? '¡BUST! (Queda 1 punto, imposible doble)' 
        : newRemaining < 0 
          ? '¡BUST! (Puntos excedidos)' 
          : '¡BUST! (Cierre no válido)';
      showFeedback(bustMsg, '#ef4444');

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
    cleanupHardwareAndWebRtc();
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

  // Detección de Bot CPU rival (My Dart Training Style)
  const isBotRival = !!(config.isVsCpu || config.player2.isBot || config.player2.id?.startsWith('bot-'));
  const botTargetAvg = config.player2.botAvg || (
    config.cpuDifficulty === 'BEGINNER' ? 40 :
    config.cpuDifficulty === 'MEDIUM' ? 55 :
    config.cpuDifficulty === 'ADVANCED' ? 70 :
    config.cpuDifficulty === 'PRO' ? 85 : 50
  );
  const isBotTurn = isBotRival && currentTurn === 1 && !isMatchFinished;

  // Turno automático del Bot CPU (Inspirado en My Dart Training)
  useEffect(() => {
    if (!isBotTurn) return;

    const timer = setTimeout(() => {
      const botScore = calculateBotTurnScore(
        scores[1],
        botTargetAvg,
        config.outMode
      );
      submitScore(botScore);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isBotTurn, scores, currentTurn, botTargetAvg, config.outMode]);

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

  // Entrada por teclado numérico con prevención de puntajes > 180
  const handleKeypress = (val: string) => {
    if (typedInput.length >= 3) return;
    const nextVal = typedInput + val;
    const num = parseInt(nextVal, 10);
    // En modo de puntaje de visita directa (no remaining): máximo 180 en 3 dardos
    if (!isRemainingInputMode && num > 180) {
      showFeedback('El puntaje máximo en 3 dardos es 180', '#ef4444');
      return;
    }
    setTypedInput(nextVal);
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

  // Últimos tantos anotados por cada jugador para visualización en el display central
  const lastThrowP1 = turnHistory.find((t) => t.playerIndex === 0);
  const lastThrowP2 = turnHistory.find((t) => t.playerIndex === 1);
  const p1Short = p1Display.split(' ')[0] || 'P1';
  const p2Short = p2Display.split(' ')[0] || 'P2';

  // En PC / Desktop el diseño con Diana/Cámara a la izquierda se activa SOLO en salas Online o si el usuario enciende explícitamente la cámara
  const isSplitActive = isDesktopSplitEnabled && (config.isOnlineRoom || showMobileCamera || !!localStream);

  // Compartir stream activo con ventana pop-out desacoplada (2º monitor / TV)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__lpld_remote_stream = remoteStream;
      (window as any).__lpld_local_stream = localStream || mobileStreamRef.current;
    }
  }, [remoteStream, localStream]);

  return (
    <div className={`w-full mx-auto transition-all ${
      isSplitActive
        ? 'max-w-[1650px] grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
        : 'max-w-xl space-y-4'
    }`}>
      {/* Audio dedicado remoto para WebRTC (siempre montado para garantizar reproducción en Desktop y Móvil) */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline 
        muted={isRemoteAudioMuted}
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} 
      />

      {/* COLUMNA 1 (IZQUIERDA EN DESKTOP / PC): VISOR DE DIANA EN VIVO HD & CÁMARAS */}
      {isSplitActive && (
        <div className="hidden lg:flex flex-col space-y-3 lg:col-span-7 xl:col-span-7 sticky top-4 animate-in fade-in">
          <div className="w-full bg-black border-2 border-[#0284c7]/50 rounded-3xl p-4 shadow-2xl shadow-[#0284c7]/15 flex flex-col space-y-3">
            {/* Cabecera Deportiva de la Diana Activa */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#0284c7]/20 border border-[#0284c7] flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white truncate">
                      {cameraFocusMode === 'DUAL'
                        ? 'Doble Diana en Vivo (Ambas Cámaras)'
                        : shouldShowRivalCamera 
                          ? `Diana de ${rivalDisplay}` 
                          : `Tu Diana (${p1Display})`}
                    </h3>
                    <span className="bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-ping" />
                      En Vivo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {isRivalTurn ? (
                      <span className="text-[#00e676] font-bold flex items-center gap-1">
                        🎯 {rivalDisplay} tirando en su diana ({scores[rivalPlayerIdx]} pts)
                      </span>
                    ) : (
                      <span className="text-[#38bdf8] font-bold flex items-center gap-1">
                        🎯 Tu turno de tiro ({scores[localPlayerIdx]} pts)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Botones de Cabecera: 2ª Pantalla Pop-out + PiP + Ampliar Modal */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleOpenPopout}
                  className="px-2.5 py-1.5 rounded-xl bg-[#0284c7]/20 hover:bg-[#0284c7]/40 text-[#38bdf8] border border-[#0284c7] text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Abrir en ventana desacoplada para llevar a un 2º monitor o TV"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>2ª Pantalla Pop-out</span>
                </button>
                <button
                  type="button"
                  onClick={handleTogglePiP}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  title="Picture-in-Picture en Windows"
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowRivalModal(true)}
                  className="p-1.5 rounded-xl bg-[#00e676]/20 hover:bg-[#00e676]/30 text-[#00e676] border border-[#00e676]/40 transition-colors cursor-pointer"
                  title="Ampliar en Modal con toda la información"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Selector de Alternancia de Foco (Nakka Style con Ambas Dianas DUAL) */}
            <div className="flex items-center justify-between gap-1 p-1 bg-[#111622] rounded-xl border border-slate-800 text-[11px] font-bold">
              <span className="text-slate-400 pl-2 text-[10px] uppercase font-black">Cámara:</span>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCameraFocusMode('AUTO')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    cameraFocusMode === 'AUTO'
                      ? 'bg-[#00e676] text-black font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Alterna automáticamente mostrando la diana del que está tirando"
                >
                  ⚡ Auto (Por Turno)
                </button>
                <button
                  type="button"
                  onClick={() => setCameraFocusMode('DUAL')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    cameraFocusMode === 'DUAL'
                      ? 'bg-[#ffe600] text-black font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ver ambas dianas simultáneamente en pantalla dividida"
                >
                  👥 Ambas Dianas
                </button>
                <button
                  type="button"
                  onClick={() => setCameraFocusMode('RIVAL')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    cameraFocusMode === 'RIVAL'
                      ? 'bg-[#0284c7] text-white font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Diana Rival
                </button>
                <button
                  type="button"
                  onClick={() => setCameraFocusMode('LOCAL')}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    cameraFocusMode === 'LOCAL'
                      ? 'bg-amber-500 text-black font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mi Diana
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCamerasSwapped;
                    setIsCamerasSwapped(next);
                    showFeedback(next ? 'Cámaras invertidas (Izquierda / Derecha)' : 'Posición de cámaras normal', '#00e676');
                  }}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    isCamerasSwapped
                      ? 'bg-amber-500 text-black font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Invertir posición izquierda/derecha de las cámaras"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>{isCamerasSwapped ? 'Invertidas' : 'Invertir'}</span>
                </button>
              </div>
            </div>

            {/* Visor de Video HD: Modo DUAL (Ambas dianas) o Single con PiP */}
            {cameraFocusMode === 'DUAL' ? (
              <div className="grid grid-cols-2 gap-3 aspect-video rounded-2xl overflow-hidden bg-black border-2 border-slate-800 p-2 shadow-inner">
                {/* Diana Rival */}
                <div className={`relative rounded-xl overflow-hidden bg-black border-2 transition-all flex items-center justify-center ${
                  isCamerasSwapped ? 'order-2' : 'order-1'
                } ${
                  isRivalTurn
                    ? 'border-[#00e676] ring-2 ring-[#00e676]/40 shadow-lg shadow-[#00e676]/20'
                    : 'border-slate-800 opacity-90'
                }`}>
                  {remoteStream && !isRemoteVideoHidden ? (
                    <video
                      ref={(el) => {
                        if (el && el.srcObject !== remoteStream) {
                          el.srcObject = remoteStream;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : isRemoteVideoHidden ? (
                    <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5 bg-[#0a0d14] w-full h-full">
                      <VideoOff className="w-8 h-8 text-amber-500 mb-0.5" />
                      <span className="text-xs font-black text-slate-300">Video Rival Ocultado</span>
                      <button
                        type="button"
                        onClick={handleToggleRemoteVideo}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-[10px] font-bold border border-amber-500/40 cursor-pointer"
                      >
                        Mostrar Video
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5 bg-gradient-to-b from-slate-900 to-black w-full h-full">
                      <Target className="w-8 h-8 text-[#ef4444] animate-pulse mb-0.5" />
                      <span className="text-xs font-black text-white">Esperando a {rivalDisplay}...</span>
                      <button
                        type="button"
                        onClick={handleRetryWebRtc}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-[#0284c7] text-slate-200 text-[10px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Reconectar
                      </button>
                    </div>
                  )}
                  {/* Header Badge */}
                  <div className="absolute top-2 left-2 pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-ping" />
                      <span className="text-[11px] font-black text-white">{rivalDisplay}</span>
                      <span className="text-[11px] font-bold text-[#38bdf8] font-mono">{scores[rivalPlayerIdx]} pts</span>
                    </div>
                  </div>
                  {isRivalTurn && (
                    <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex justify-center">
                      <div className="bg-[#00e676] text-black px-2.5 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-lg animate-bounce">
                        <Target className="w-3 h-3" />
                        <span>TIRANDO</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tu Diana (Local) */}
                <div className={`relative rounded-xl overflow-hidden bg-black border-2 transition-all flex items-center justify-center ${
                  isCamerasSwapped ? 'order-1' : 'order-2'
                } ${
                  isMyTurn
                    ? 'border-[#00e676] ring-2 ring-[#00e676]/40 shadow-lg shadow-[#00e676]/20'
                    : 'border-slate-800 opacity-90'
                }`}>
                  {localStream || mobileStreamRef.current ? (
                    <video
                      ref={(el) => {
                        const stream = localStream || mobileStreamRef.current;
                        if (el && stream && el.srcObject !== stream) {
                          el.srcObject = stream;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5 bg-gradient-to-b from-slate-900 to-black w-full h-full">
                      <Camera className="w-8 h-8 text-slate-500 mb-0.5" />
                      <span className="text-xs font-black text-white">Tu Cámara está apagada</span>
                      <p className="text-[10px] text-slate-400">Encendé tu webcam física</p>
                      <button
                        type="button"
                        onClick={() => setShowMobileCamera(true)}
                        className="mt-1 px-3 py-1 rounded-lg bg-[#00e676] text-black font-black text-[10px] shadow cursor-pointer"
                      >
                        Encender Mi Cámara
                      </button>
                    </div>
                  )}
                  {/* Header Badge */}
                  <div className="absolute top-2 left-2 pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-ping" />
                      <span className="text-[11px] font-black text-white">{p1Display} (Tú)</span>
                      <span className="text-[11px] font-bold text-[#38bdf8] font-mono">{scores[localPlayerIdx]} pts</span>
                    </div>
                  </div>
                  {isMyTurn && (
                    <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex justify-center">
                      <div className="bg-[#00e676] text-black px-2.5 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-lg animate-bounce">
                        <Target className="w-3 h-3" />
                        <span>TU TURNO</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Visor de Video HD de la Diana Activa (Modos Auto, Rival o Mi Diana) */
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border-2 border-slate-800 flex items-center justify-center shadow-inner">
                {shouldShowRivalCamera ? (
                  isRemoteVideoHidden ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#090d14] w-full h-full">
                      <VideoOff className="w-10 h-10 text-amber-500 mb-1" />
                      <h4 className="text-sm font-black text-white">Video del Rival Ocultado</h4>
                      <p className="text-xs text-slate-400">Podés reactivarlo en cualquier momento con el botón inferior.</p>
                      <button
                        type="button"
                        onClick={handleToggleRemoteVideo}
                        className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold cursor-pointer"
                      >
                        Mostrar Video del Rival
                      </button>
                    </div>
                  ) : remoteStream ? (
                    <video
                      ref={(el) => {
                        splitScreenVideoRef.current = el;
                        if (el && remoteStream && el.srcObject !== remoteStream) {
                          el.srcObject = remoteStream;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-gradient-to-b from-slate-900 to-black w-full h-full">
                      <Target className="w-10 h-10 text-[#ef4444] animate-pulse mb-1" />
                      <h4 className="text-sm font-black text-white">
                        Esperando cámara de {rivalDisplay}...
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        En cuanto {rivalDisplay} active su cámara en su celular o PC, la verás aquí en vivo.
                      </p>
                      <button
                        type="button"
                        onClick={handleRetryWebRtc}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-[#0284c7] text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Reconectar WebRTC
                      </button>
                    </div>
                  )
                ) : (
                  localStream || mobileStreamRef.current ? (
                    <video
                      ref={(el) => {
                        const stream = localStream || mobileStreamRef.current;
                        if (el && stream && el.srcObject !== stream) {
                          el.srcObject = stream;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-gradient-to-b from-slate-900 to-black w-full h-full">
                      <Camera className="w-10 h-10 text-slate-500 mb-1" />
                      <h4 className="text-sm font-black text-white">Tu Cámara está apagada</h4>
                      <p className="text-[11px] text-slate-400">
                        Encendé tu webcam o apuntá tu celular a la diana física.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowMobileCamera(true)}
                        className="mt-2 px-4 py-1.5 rounded-xl bg-[#00e676] text-black font-black text-xs shadow-lg shadow-[#00e676]/20 cursor-pointer"
                      >
                        Encender Mi Cámara
                      </button>
                    </div>
                  )
                )}

                {/* Inset PiP de Tu Diana en la esquina (visible si la pantalla principal muestra al rival) */}
                {shouldShowRivalCamera && (
                  <div 
                    onClick={() => setCameraFocusMode('LOCAL')}
                    className="absolute top-3 right-3 w-44 sm:w-52 aspect-video rounded-xl overflow-hidden border-2 border-amber-500/70 shadow-2xl bg-black cursor-pointer group transition-transform hover:scale-105"
                    title="Click para enfocar tu diana en grande"
                  >
                    {localStream || mobileStreamRef.current ? (
                      <video
                        ref={(el) => {
                          const stream = localStream || mobileStreamRef.current;
                          if (el && stream && el.srcObject !== stream) {
                            el.srcObject = stream;
                            el.play().catch(() => {});
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#090d14]">
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-300">Tu Cámara OFF</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMobileCamera(true);
                          }}
                          className="mt-1 px-2 py-0.5 rounded bg-[#00e676] text-black font-black text-[9px] shadow"
                        >
                          Encender
                        </button>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[9px] font-bold text-center text-slate-200 group-hover:text-amber-400">
                      Tu Diana (Click ↗)
                    </div>
                  </div>
                )}

                {/* Inset PiP del Rival en la esquina (visible si la pantalla principal muestra tu diana) */}
                {!shouldShowRivalCamera && remoteStream && !isRemoteVideoHidden && (
                  <div 
                    onClick={() => setCameraFocusMode('RIVAL')}
                    className="absolute top-3 right-3 w-44 sm:w-52 aspect-video rounded-xl overflow-hidden border-2 border-[#0284c7]/70 shadow-2xl bg-black cursor-pointer group transition-transform hover:scale-105"
                    title="Click para enfocar la diana del rival en grande"
                  >
                    <video
                      ref={(el) => {
                        if (el && el.srcObject !== remoteStream) {
                          el.srcObject = remoteStream;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[9px] font-bold text-center text-slate-200 group-hover:text-[#38bdf8]">
                      Diana Rival (Click ↗)
                    </div>
                  </div>
                )}

                {/* Badge flotante de tiro */}
                <div className="absolute top-2.5 left-2.5 pointer-events-none">
                  <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00e676] animate-ping" />
                    <span className="text-xs font-black text-white">
                      {shouldShowRivalCamera ? rivalDisplay : p1Display}
                    </span>
                    <span className="text-xs font-bold text-[#38bdf8] font-mono">
                      {scores[shouldShowRivalCamera ? rivalPlayerIdx : localPlayerIdx]} pts
                    </span>
                  </div>
                </div>

                {isRivalTurn && shouldShowRivalCamera && (
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex justify-center">
                    <div className="bg-[#00e676] text-black px-3.5 py-1 rounded-full font-black text-xs flex items-center gap-1.5 shadow-xl animate-bounce">
                      <Target className="w-3.5 h-3.5" />
                      <span>TIRANDO EN SU DIANA</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ajustes y Controles Inferiores */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {availableCameras.length > 0 && (
                  <select
                    value={selectedCameraDeviceId}
                    onChange={(e) => handleSelectCameraDevice(e.target.value)}
                    className="bg-[#111622] hover:bg-[#1a2234] border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                    title="Seleccionar webcam o cámara USB"
                  >
                    <option value="">Cámara por Defecto</option>
                    {availableCameras.map((cam, idx) => (
                      <option key={cam.deviceId || idx} value={cam.deviceId}>
                        {cam.label || `Cámara ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={handleToggleCameraFacing}
                  className="px-2 py-1 rounded-lg bg-[#111622] hover:bg-[#1a2234] border border-amber-500/40 text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Alternar entre cámara trasera (diana) y delantera"
                >
                  <SwitchCamera className="w-3 h-3" />
                  <span>{cameraFacingMode === 'environment' ? 'Trasera' : 'Frontal'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleRemoteAudio}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    isRemoteAudioMuted
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                      : 'bg-[#111622] hover:bg-[#1a2234] border-slate-700 text-slate-200'
                  }`}
                  title={isRemoteAudioMuted ? 'Activar audio del rival' : 'Silenciar audio del rival'}
                >
                  {isRemoteAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00e676]" />}
                  <span>{isRemoteAudioMuted ? 'Rival Muteado' : 'Audio Rival'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleRemoteVideo}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    isRemoteVideoHidden
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-[#111622] hover:bg-[#1a2234] border-slate-700 text-slate-200'
                  }`}
                  title={isRemoteVideoHidden ? 'Mostrar video del rival' : 'Ocultar video del rival'}
                >
                  {isRemoteVideoHidden ? <VideoOff className="w-3.5 h-3.5 text-amber-400" /> : <Video className="w-3.5 h-3.5 text-[#38bdf8]" />}
                  <span>{isRemoteVideoHidden ? 'Video Oculto' : 'Video Rival'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileCamera(!showMobileCamera)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    showMobileCamera && (localStream || mobileStreamRef.current)
                      ? 'bg-[#00e676]/20 text-[#00e676] border-[#00e676]/50'
                      : 'bg-black text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title={showMobileCamera ? 'Apagar mi cámara' : 'Encender mi cámara'}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{showMobileCamera && (localStream || mobileStreamRef.current) ? 'Mi Cámara ON' : 'Encender Mi Cámara'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !isMicMuted;
                    setIsMicMuted(next);
                    showFeedback(next ? 'Micrófono silenciado' : 'Micrófono activo', next ? '#ef4444' : '#00e676');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    isMicMuted 
                      ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                      : isSpeaking 
                        ? 'bg-[#00e676]/30 text-[#00e676] border-[#00e676] ring-2 ring-[#00e676]/50 animate-pulse' 
                        : 'bg-[#111622] text-[#00e676] border-[#00e676]/40'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isMicMuted ? 'Muted' : isSpeaking ? 'Hablando' : 'Mic'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRetryWebRtc}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-[#0284c7] text-slate-200 hover:text-white border border-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reconectar llamada y stream WebRTC"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reconectar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDesktopSplitEnabled(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                  title="Ocultar panel lateral en PC"
                >
                  Ocultar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLUMNA 2 (DERECHA EN DESKTOP / COMPLETA EN MÓVIL): ANOTADOR OFICIAL */}
      <div className={`space-y-4 ${
        isSplitActive ? 'lg:col-span-5 xl:col-span-5 w-full' : 'w-full max-w-lg mx-auto'
      }`}>
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
                  {config.isOnlineRoom
                    ? `🌐 SALA ONLINE • ${config.onlineRoomCode}`
                    : config.tournamentTitle
                      ? `${config.tournamentTitle} • Diana Asignada`
                      : 'Partida individual'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">
                {config.startingScore}
              </h2>
              <p className="text-[10px] text-slate-400">
                {config.distanceType === 'SETS'
                  ? `Al mejor de ${config.bestOfSets} Sets (Legs: ${config.bestOfLegs})`
                  : `Al mejor de ${config.bestOfLegs} Legs`}
                {config.isOnlineRoom ? ` • ${isMyTurn ? '🎯 Tu Turno' : '⏳ Esperando Rival'}` : ''}
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

            {/* Botón Pop-out 2ª Pantalla / TV */}
            <button
              onClick={handleOpenPopout}
              title="Abrir Cámara y Marcador en 2ª Pantalla o TV (Pop-out)"
              className="p-1.5 rounded-xl bg-black text-[#38bdf8] hover:bg-[#151515] border border-[#38bdf8]/40 hover:border-[#38bdf8] transition-colors"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Botón Restaurar Diana Lateral en PC si fue ocultada */}
            {!isDesktopSplitEnabled && (isOnline || showMobileCamera) && (
              <button
                type="button"
                onClick={() => setIsDesktopSplitEnabled(true)}
                title="Mostrar Diana en Panel Lateral (Pantalla Dividida)"
                className="hidden lg:flex p-1.5 rounded-xl bg-black text-[#00e676] hover:bg-[#151515] border border-[#00e676]/40 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            )}

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
              {p1Display}
            </span>
          </div>
          {config.isDoubles && (
            <div className="text-[10px] text-[#00e676] font-semibold mb-1 truncate">
              {p1TeammateTurn === 0 ? p1Display : (config.player1.teammateNickname || config.player1.teammateName)}
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
              {p2Display}
            </span>
          </div>
          {config.isDoubles && (
            <div className="text-[10px] text-[#00e676] font-semibold mb-1 truncate">
              {p2TeammateTurn === 0 ? p2Display : (config.player2.teammateNickname || config.player2.teammateName)}
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

        {/* Display central con borde diana: muestra el puntaje tipeado o los últimos tantos de cada jugador */}
        <div
          onClick={handleConfirmTyped}
          className={`h-11 rounded-xl bg-black border-2 flex items-center justify-center font-black transition-all cursor-pointer overflow-hidden ${
            typedInput
              ? 'border-[#00e676] text-[#00e676] bg-[#00e676]/10 shadow-md shadow-[#00e676]/20 text-xl'
              : 'border-[#ef4444]/40 text-[#00e676]'
          }`}
          title={typedInput ? 'Confirmar puntaje ingresado' : 'Últimos tantos anotados por cada jugador'}
        >
          {typedInput ? (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xl font-black text-[#00e676] tracking-wider">{typedInput}</span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-[#00e676]/20 text-[#00e676] font-bold uppercase">OK</span>
            </div>
          ) : isRemainingInputMode ? (
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Queda: {typedInput || '...'}</span>
          ) : currentCheckout ? (
            <div className="flex flex-col items-center justify-center leading-tight py-0.5 px-1 w-full">
              <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider truncate max-w-[160px]">
                Cierre ({scores[currentTurn]}): {currentCheckout}
              </span>
              <div className="flex items-center justify-center gap-3 w-full font-black mt-0.5">
                <span className={`text-xs ${lastThrowP1?.isBust ? 'text-[#ef4444]' : (lastThrowP1?.score ?? 0) >= 100 ? 'text-[#00e676]' : 'text-white'}`}>
                  {lastThrowP1 ? (lastThrowP1.isBust ? 'B' : lastThrowP1.score) : '-'}
                </span>
                <span className="text-slate-600 font-normal text-[10px]">|</span>
                <span className={`text-xs ${lastThrowP2?.isBust ? 'text-[#ef4444]' : (lastThrowP2?.score ?? 0) >= 100 ? 'text-[#00e676]' : 'text-white'}`}>
                  {lastThrowP2 ? (lastThrowP2.isBust ? 'B' : lastThrowP2.score) : '-'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full px-1 py-0.5 leading-none">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                Últimos Tantos
              </span>
              <div className="flex items-center justify-center gap-4 w-full font-black">
                <span className={`text-base tracking-wide ${lastThrowP1?.isBust ? 'text-[#ef4444]' : (lastThrowP1?.score ?? 0) >= 100 ? 'text-[#00e676]' : 'text-white'}`}>
                  {lastThrowP1 ? (lastThrowP1.isBust ? 'BUST' : lastThrowP1.score) : '-'}
                </span>
                <span className="text-slate-600 font-light text-sm">|</span>
                <span className={`text-base tracking-wide ${lastThrowP2?.isBust ? 'text-[#ef4444]' : (lastThrowP2?.score ?? 0) >= 100 ? 'text-[#00e676]' : 'text-white'}`}>
                  {lastThrowP2 ? (lastThrowP2.isBust ? 'BUST' : lastThrowP2.score) : '-'}
                </span>
              </div>
            </div>
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

      {/* AVISO ELEGANTE CUANDO ES TURNO DEL RIVAL */}
      {isOnline && !isMyTurn ? (
        <div className="bg-[#0f1422] border-2 border-[#0284c7]/40 rounded-2xl p-4 text-center space-y-2 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-center gap-2 text-sm font-black text-[#38bdf8]">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
            <span>Turno de {currentTurn === 0 ? p1Display : p2Display} en su Diana</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Observa sus 3 lanzamientos en vivo. Cuando anote, el marcador y Russ Bray se actualizarán automáticamente.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">Sincronización P2P Online • {config.onlineRoomCode}</span>
          </div>
        </div>
      ) : isBotTurn ? (
        <div className="bg-[#0f1422] border-2 border-amber-500/40 rounded-2xl p-4 text-center space-y-2 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-center gap-2 text-sm font-black text-amber-400">
            <Bot className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Turno de {p2Display} • Tirando dardos...</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            El rival CPU está jugando sus 3 lanzamientos en su diana según su nivel de dificultad.
          </p>
          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="text-[11px] text-amber-400/90 font-mono font-bold">
              Nivel: {config.cpuDifficulty || 'MEDIUM'} • Objetivo AVG: {botTargetAvg}
            </span>
          </div>
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

      {/* PANEL DE DOBLE DIANA EN VIVO (SOLO EN MÓVILES: lg:hidden) */}
      <div className="lg:hidden">
        {(isOnline || showMobileCamera) && (
          <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-2.5 shadow-2xl">
            {/* Banner de Desbloqueo de Audio para Celulares */}
            {audioAutoplayBlocked && (
              <button
                type="button"
                onClick={handleUnlockRemoteAudio}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 animate-pulse transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 fill-black" />
                <span>🔊 Toca aquí para activar el audio del rival en este teléfono</span>
              </button>
            )}

            {/* Barra de estado y controles superiores de las dianas */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00e676] animate-ping" />
                <span className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#00e676]" />
                  <span>Doble Diana en Vivo</span>
                  {isOnline && <span className="text-[10px] text-slate-400 font-mono">({config.onlineRoomCode})</span>}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Selector de Dispositivo de Cámara (Notebook Webcam / USB / Celular) */}
                {availableCameras.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedCameraDeviceId}
                      onChange={(e) => handleSelectCameraDevice(e.target.value)}
                      className="bg-[#111622] hover:bg-[#1a2234] border border-slate-700 hover:border-[#00e676] text-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-[#00e676] max-w-[125px] sm:max-w-[170px] truncate"
                      title="Seleccionar qué cámara usar (Notebook o USB)"
                    >
                      <option value="">Cámara por Defecto</option>
                      {availableCameras.map((cam, idx) => (
                        <option key={cam.deviceId || idx} value={cam.deviceId}>
                          {cam.label || `Cámara ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Botón Alternar Cámara Trasera (Diana) / Delantera en Celulares */}
                <button
                  type="button"
                  onClick={handleToggleCameraFacing}
                  className="px-2 py-1 rounded-lg bg-[#111622] hover:bg-[#1a2234] border border-amber-500/40 text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Alternar entre cámara trasera (apuntando a la diana) y delantera"
                >
                  <SwitchCamera className="w-3 h-3" />
                  <span className="hidden sm:inline">{cameraFacingMode === 'environment' ? 'Trasera (Diana)' : 'Delantera'}</span>
                </button>

                {/* Botón Silenciar/Activar Micrófono Propio */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isMicMuted;
                    setIsMicMuted(next);
                    showFeedback(next ? 'Micrófono silenciado' : 'Micrófono activo para hablar con el rival', next ? '#ef4444' : '#00e676');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    isMicMuted 
                      ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                      : isSpeaking 
                        ? 'bg-[#00e676]/30 text-[#00e676] border-[#00e676] ring-2 ring-[#00e676]/50 animate-pulse' 
                        : 'bg-[#111622] text-[#00e676] border-[#00e676]/40'
                  }`}
                  title={isMicMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
                >
                  {isMicMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isMicMuted ? 'Mute' : isSpeaking ? 'Voz ON' : 'Mic'}</span>
                </button>

                {/* Botón Silenciar/Activar Audio del Rival */}
                <button
                  type="button"
                  onClick={handleToggleRemoteAudio}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    isRemoteAudioMuted
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-[#111622] text-[#00e676] border-slate-700'
                  }`}
                  title={isRemoteAudioMuted ? 'Activar audio del rival' : 'Silenciar audio del rival'}
                >
                  {isRemoteAudioMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-[#00e676]" />}
                  <span className="hidden sm:inline">{isRemoteAudioMuted ? 'Audio OFF' : 'Audio ON'}</span>
                </button>

                {/* Botón Ocultar/Ver Video del Rival */}
                <button
                  type="button"
                  onClick={handleToggleRemoteVideo}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    isRemoteVideoHidden
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-[#111622] text-[#38bdf8] border-slate-700'
                  }`}
                  title={isRemoteVideoHidden ? 'Mostrar video del rival' : 'Ocultar video del rival'}
                >
                  {isRemoteVideoHidden ? <VideoOff className="w-3 h-3 text-amber-400" /> : <Video className="w-3 h-3 text-[#38bdf8]" />}
                  <span className="hidden sm:inline">{isRemoteVideoHidden ? 'Video OFF' : 'Video ON'}</span>
                </button>

                {/* Botón Modal Emergente Diana del Contrincante (PC) */}
                <button
                  type="button"
                  onClick={handleOpenPopout}
                  className="px-2 py-1 rounded-lg bg-[#0284c7]/20 hover:bg-[#0284c7]/40 border border-[#0284c7] text-[#38bdf8] text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Abrir Diana del Contrincante en Modal Emergente (PC)"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Diana Rival</span>
                </button>

                {/* Botón Invertir Posición de Cámaras (Izquierda / Derecha) */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCamerasSwapped;
                    setIsCamerasSwapped(next);
                    showFeedback(next ? 'Cámaras invertidas (Izquierda / Derecha)' : 'Posición de cámaras normal', '#00e676');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    isCamerasSwapped
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-[#111622] text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title="Invertir posición de las cámaras (Diana 1 y Diana 2)"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>{isCamerasSwapped ? 'Invertidas' : 'Invertir'}</span>
                </button>

                {/* Toggle de Visualización de Cámaras */}
                <button
                  type="button"
                  onClick={() => setShowMobileCamera(!showMobileCamera)}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors ${
                    showMobileCamera 
                      ? 'bg-[#00e676] text-black border-[#00e676]' 
                      : 'bg-black text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {showMobileCamera ? 'Ocultar' : 'Ver Cámaras'}
                </button>
              </div>
            </div>

            {/* Grid Split-Screen con las DOS Dianas Lado a Lado (Estilo Nakka N01) */}
            {showMobileCamera && (
              <div className="grid grid-cols-2 gap-2">
                {/* DIANA 1 (Jugador 1) */}
                <div className={`relative aspect-square sm:aspect-video rounded-xl overflow-hidden bg-black border-2 transition-all ${
                  isCamerasSwapped ? 'order-2' : 'order-1'
                } ${
                  currentTurn === 0 
                    ? 'border-[#00e676] ring-2 ring-[#00e676]/50 shadow-lg shadow-[#00e676]/20' 
                    : 'border-slate-800 opacity-85'
                }`}>
                  {localPlayerIdx === 0 ? (
                    localStream || mobileStreamRef.current ? (
                      <video 
                        ref={(el) => {
                          mobileVideoRef.current = el;
                          const stream = localStream || mobileStreamRef.current;
                          if (el && stream && el.srcObject !== stream) {
                            el.srcObject = stream;
                            el.play().catch(() => {});
                          }
                        }} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-slate-900 to-black">
                        <Camera className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-300">Tu Diana</span>
                        <button
                          type="button"
                          onClick={() => setShowMobileCamera(true)}
                          className="mt-1 px-2 py-0.5 rounded bg-[#00e676] text-black text-[9px] font-black cursor-pointer"
                        >
                          Encender
                        </button>
                      </div>
                    )
                  ) : (
                    remoteStream && !isRemoteVideoHidden ? (
                      <video 
                        ref={(el) => {
                          remoteVideoRef.current = el;
                          if (el && remoteStream && el.srcObject !== remoteStream) {
                            el.srcObject = remoteStream;
                            el.play().catch(() => {});
                          }
                        }} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    ) : isRemoteVideoHidden ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#0a0d14]">
                        <VideoOff className="w-5 h-5 text-amber-500 mb-1" />
                        <span className="text-[9px] font-bold text-slate-300">Video Oculto</span>
                        <button
                          type="button"
                          onClick={handleToggleRemoteVideo}
                          className="mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[8px] font-bold cursor-pointer"
                        >
                          Mostrar
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-slate-900 to-black">
                        <Target className="w-6 h-6 text-[#ef4444] mb-1 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-300">{p1Display}</span>
                        <span className="text-[9px] text-slate-500">En espera de cámara...</span>
                        <button
                          type="button"
                          onClick={handleRetryWebRtc}
                          className="mt-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-[#0284c7] text-[8px] font-bold text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Reconectar
                        </button>
                      </div>
                    )
                  )}

                  {/* Overlays informativos sobre la Diana 1 */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-white truncate max-w-[110px] border border-white/10">
                      {p1Display} {localPlayerIdx === 0 ? '(Tú)' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      {localPlayerIdx !== 0 && (
                        <button
                          type="button"
                          onClick={handleOpenPopout}
                          className="pointer-events-auto bg-black/85 hover:bg-[#0284c7] text-[8px] font-black text-white px-1.5 py-0.5 rounded border border-white/20 flex items-center gap-0.5 shadow transition-colors"
                          title="Ampliar Diana en Modal"
                        >
                          <Maximize2 className="w-2.5 h-2.5" /> Ampliar
                        </button>
                      )}
                      {currentTurn === 0 && (
                        <span className="bg-[#00e676] text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shadow">
                          <Target className="w-2.5 h-2.5" /> Tirando
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* DIANA 2 (Jugador 2) */}
                <div className={`relative aspect-square sm:aspect-video rounded-xl overflow-hidden bg-black border-2 transition-all ${
                  isCamerasSwapped ? 'order-1' : 'order-2'
                } ${
                  currentTurn === 1 
                    ? 'border-[#00e676] ring-2 ring-[#00e676]/50 shadow-lg shadow-[#00e676]/20' 
                    : 'border-slate-800 opacity-85'
                }`}>
                  {localPlayerIdx === 1 ? (
                    localStream || mobileStreamRef.current ? (
                      <video 
                        ref={(el) => {
                          mobileVideoRef.current = el;
                          const stream = localStream || mobileStreamRef.current;
                          if (el && stream && el.srcObject !== stream) {
                            el.srcObject = stream;
                            el.play().catch(() => {});
                          }
                        }} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-slate-900 to-black">
                        <Camera className="w-6 h-6 text-slate-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-300">Tu Diana</span>
                        <button
                          type="button"
                          onClick={() => setShowMobileCamera(true)}
                          className="mt-1 px-2 py-0.5 rounded bg-[#00e676] text-black text-[9px] font-black cursor-pointer"
                        >
                          Encender
                        </button>
                      </div>
                    )
                  ) : (
                    remoteStream && !isRemoteVideoHidden ? (
                      <video 
                        ref={(el) => {
                          remoteVideoRef.current = el;
                          if (el && remoteStream && el.srcObject !== remoteStream) {
                            el.srcObject = remoteStream;
                            el.play().catch(() => {});
                          }
                        }} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    ) : isRemoteVideoHidden ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#0a0d14]">
                        <VideoOff className="w-5 h-5 text-amber-500 mb-1" />
                        <span className="text-[9px] font-bold text-slate-300">Video Oculto</span>
                        <button
                          type="button"
                          onClick={handleToggleRemoteVideo}
                          className="mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[8px] font-bold cursor-pointer"
                        >
                          Mostrar
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-slate-900 to-black">
                        <Target className="w-6 h-6 text-[#ef4444] mb-1 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-300">{p2Display}</span>
                        <span className="text-[9px] text-slate-500">En espera de cámara...</span>
                        <button
                          type="button"
                          onClick={handleRetryWebRtc}
                          className="mt-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-[#0284c7] text-[8px] font-bold text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Reconectar
                        </button>
                      </div>
                    )
                  )}

                  {/* Overlays informativos sobre la Diana 2 */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-white truncate max-w-[110px] border border-white/10">
                      {p2Display} {localPlayerIdx === 1 ? '(Tú)' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      {localPlayerIdx !== 1 && (
                        <button
                          type="button"
                          onClick={handleOpenPopout}
                          className="pointer-events-auto bg-black/85 hover:bg-[#0284c7] text-[8px] font-black text-white px-1.5 py-0.5 rounded border border-white/20 flex items-center gap-0.5 shadow transition-colors"
                          title="Ampliar Diana en Modal"
                        >
                          <Maximize2 className="w-2.5 h-2.5" /> Ampliar
                        </button>
                      )}
                      {currentTurn === 1 && (
                        <span className="bg-[#00e676] text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shadow">
                          <Target className="w-2.5 h-2.5" /> Tirando
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
      {/* FIN COLUMNA 2 */}
    </div>
    {/* FIN GRID PRINCIPAL */}

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

    {/* MODAL EXPANDIDO DE CÁMARA (PRESERVA EL 100% DE LA INFORMACIÓN DEL TABLERO) */}
    {showRivalModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="bg-[#0b0e14] border-2 border-[#0284c7]/50 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl shadow-[#0284c7]/20 flex flex-col my-auto max-h-[96vh]">
          {/* Cabecera del Modal con Datos del Encuentro */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-[#0f1422] to-[#141b2d] border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0284c7]/20 border border-[#0284c7] flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {config.tournamentTitle || 'Partida en Vivo'}
                  </h3>
                  <span className="bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-ping" />
                    En Vivo
                  </span>
                  {config.onlineRoomCode && (
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      ({config.onlineRoomCode})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {config.distanceType === 'SETS'
                    ? `Al mejor de ${config.bestOfSets || 3} Sets (${(config as any).legsPerSet || 3} legs/set)`
                    : `Al mejor de ${config.bestOfLegs || 3} Legs`}
                </div>
              </div>
            </div>

            {/* Acciones de Cabecera */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleTogglePiP}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                title="Desacoplar a Picture-in-Picture en Windows"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRetryWebRtc}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                title="Reconectar señal de cámara y audio WebRTC"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowRivalModal(false)}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TABLERO COMPLETO DE AMBOS JUGADORES (MANTIENE LA INFORMACIÓN EXACTA DE LA VENTANA PRINCIPAL) */}
          <div className="p-3 sm:p-4 bg-black/60 border-b border-slate-800 space-y-2 flex-shrink-0">
            {/* Tarjetas de Puntuación de Ambos Jugadores Lado a Lado */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Tarjeta P1 */}
              <div className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all ${
                currentTurn === 0
                  ? 'border-[#00e676] bg-[#00e676]/10 shadow-lg shadow-[#00e676]/20'
                  : 'border-slate-800 bg-[#07090e]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="truncate text-left">
                    <span className="text-xs sm:text-sm font-black text-white truncate block">
                      {p1Display} {localPlayerIdx === 0 ? '(Tú)' : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Avg. {getAvg(0)} • {dartsThrownLeg[0]} dardos
                    </span>
                  </div>
                  {currentTurn === 0 && (
                    <span className="bg-[#00e676] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow">
                      <Target className="w-3 h-3" /> Tirando
                    </span>
                  )}
                </div>
                <div className="text-3xl sm:text-5xl font-black text-white font-mono mt-1 text-center">
                  {scores[0]}
                </div>
              </div>

              {/* Tarjeta P2 */}
              <div className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all ${
                currentTurn === 1
                  ? 'border-[#00e676] bg-[#00e676]/10 shadow-lg shadow-[#00e676]/20'
                  : 'border-slate-800 bg-[#07090e]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="truncate text-left">
                    <span className="text-xs sm:text-sm font-black text-white truncate block">
                      {p2Display} {localPlayerIdx === 1 ? '(Tú)' : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Avg. {getAvg(1)} • {dartsThrownLeg[1]} dardos
                    </span>
                  </div>
                  {currentTurn === 1 && (
                    <span className="bg-[#00e676] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow">
                      <Target className="w-3 h-3" /> Tirando
                    </span>
                  )}
                </div>
                <div className="text-3xl sm:text-5xl font-black text-white font-mono mt-1 text-center">
                  {scores[1]}
                </div>
              </div>
            </div>

            {/* Barra de Sets / Legs (S/L) y Cierre Sugerido */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-white rounded-xl text-slate-900 font-black text-xs sm:text-sm shadow">
              <span>{config.distanceType === 'SETS' ? setsWon[0] : legsWon[0]}</span>
              <span className="text-slate-600 tracking-widest text-[11px]">S/L</span>
              <span>{config.distanceType === 'SETS' ? setsWon[1] : legsWon[1]}</span>
            </div>

            {currentCheckout && (
              <div className="text-center py-1 px-3 bg-[#00e676]/15 border border-[#00e676]/40 rounded-xl text-xs font-black text-[#00e676] flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cierre Sugerido ({scores[currentTurn]}): <strong>{currentCheckout}</strong></span>
              </div>
            )}
          </div>

          {/* Cuerpo del Modal: Video en Vivo de la Diana */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden flex-1">
            {remoteStream && !isRemoteVideoHidden ? (
              <video
                ref={(el) => {
                  modalRemoteVideoRef.current = el;
                  if (el && remoteStream && el.srcObject !== remoteStream) {
                    el.srcObject = remoteStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : isRemoteVideoHidden ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#090d14] w-full h-full">
                <VideoOff className="w-12 h-12 text-amber-500 mb-2" />
                <h4 className="text-base font-black text-white">Video del Rival Ocultado</h4>
                <p className="text-xs text-slate-400">Podés activarlo nuevamente con el botón inferior.</p>
                <button
                  type="button"
                  onClick={handleToggleRemoteVideo}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold cursor-pointer"
                >
                  Mostrar Video del Rival
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-[#0b0e14] to-black w-full h-full">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center animate-pulse">
                  <Target className="w-7 h-7 text-[#ef4444]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    Esperando señal de la cámara de {rivalDisplay}...
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    En cuanto {rivalDisplay} active su cámara, la verás aquí en vivo sin perder los marcadores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetryWebRtc}
                  className="px-4 py-2 rounded-xl bg-[#00e676] hover:brightness-110 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#00e676]/30 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconectar WebRTC</span>
                </button>
              </div>
            )}

            {/* Overlays flotantes dentro del video */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00e676] animate-ping" />
                <span className="text-xs font-black text-white">{rivalDisplay}</span>
                <span className="text-xs font-bold text-[#38bdf8] font-mono">{scores[rivalPlayerIdx]} pts</span>
              </div>
            </div>

            {isRivalTurn && (
              <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex justify-center">
                <div className="bg-[#00e676]/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full font-black text-xs flex items-center gap-2 shadow-xl animate-bounce">
                  <Target className="w-4 h-4" />
                  <span>TIRANDO EN SU DIANA</span>
                </div>
              </div>
            )}
          </div>

          {/* Tira de Últimas Visitas de la Partida */}
          {turnHistory.length > 0 && (
            <div className="px-3 py-2 bg-[#080b12] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] flex-shrink-0">
              <span className="text-slate-500 font-bold uppercase text-[10px] flex-shrink-0">Últimos Tiros:</span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {turnHistory.slice(0, 5).map((t, idx) => (
                  <span
                    key={t.id || idx}
                    className="px-2 py-0.5 rounded-lg bg-[#111622] border border-slate-800 text-slate-300 font-mono text-[10px] flex-shrink-0"
                  >
                    <strong className="text-white">{t.playerName.split(' ')[0]}:</strong>{' '}
                    <span className={t.score >= 100 ? 'text-[#00e676] font-bold' : t.isBust ? 'text-[#ef4444]' : 'text-slate-200'}>
                      {t.isBust ? 'BUST' : t.score}
                    </span>{' '}
                    <span className="text-slate-500">({t.remainingAfter})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pie del Modal con Audio, Video y Cierre */}
          <div className="p-3 bg-[#0a0d14] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[11px]">Sincronización P2P TURN: <strong className="text-white">TCP 443</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleRemoteAudio}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isRemoteAudioMuted
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                    : 'bg-[#111622] hover:bg-[#1a2234] border-slate-700 text-slate-200'
                }`}
                title={isRemoteAudioMuted ? 'Activar audio del rival' : 'Silenciar audio del rival'}
              >
                {isRemoteAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00e676]" />}
                <span>{isRemoteAudioMuted ? 'Rival Muteado' : 'Audio Rival'}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleRemoteVideo}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isRemoteVideoHidden
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-[#111622] hover:bg-[#1a2234] border-slate-700 text-slate-200'
                }`}
                title={isRemoteVideoHidden ? 'Mostrar video del rival' : 'Ocultar video del rival'}
              >
                {isRemoteVideoHidden ? <VideoOff className="w-3.5 h-3.5 text-amber-400" /> : <Video className="w-3.5 h-3.5 text-[#38bdf8]" />}
                <span>{isRemoteVideoHidden ? 'Video Oculto' : 'Video Rival'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRivalModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
