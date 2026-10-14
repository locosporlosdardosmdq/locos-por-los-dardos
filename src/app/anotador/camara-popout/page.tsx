'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { matchBroadcast, BroadcastMatchPayload } from '@/lib/broadcast';
import { getCountryFlag } from '@/lib/constants';
import { 
  Camera, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Target, 
  Trophy, 
  Zap, 
  Volume2, 
  VolumeX,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Tv,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  Columns,
  Sparkles,
  ArrowRight
} from 'lucide-react';

function CamaraPopoutContent() {
  const searchParams = useSearchParams();
  const urlRoomCode = searchParams.get('room') || searchParams.get('sala') || '';

  const [matchData, setMatchData] = useState<BroadcastMatchPayload | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'TV_BANNER' | 'SPLIT'>('TV_BANNER');

  // Micrófono para hablar con el contrincante en vivo
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. Escuchar transmisiones en vivo del anotador vía BroadcastChannel y localStorage
  useEffect(() => {
    // Carga inicial desde localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lpld_live_match_channel_v1');
        if (stored) {
          setMatchData(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Error leyendo estado inicial de broadcast:', e);
      }
    }

    // Suscripción en caliente a eventos de matchBroadcast
    const unsubscribe = matchBroadcast.subscribe((data) => {
      setMatchData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Polling de respaldo a /api/salas si hay código de sala URL
  useEffect(() => {
    const code = urlRoomCode || matchData?.onlineRoomCode;
    if (!code) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/salas?codigo=${encodeURIComponent(code)}`);
        const json = await res.json();
        if (json.success && json.room) {
          const room = json.room;
          setMatchData((prev) => {
            if (!prev) {
              return {
                matchId: `sala-${room.code}`,
                gameType: 'X01',
                tournamentTitle: `Sala Online • ${room.code}`,
                distanceMode: room.config?.distanceType || 'LEGS',
                bestOfLegs: room.config?.bestOfLegs || 3,
                bestOfSets: room.config?.bestOfSets || 1,
                player1Name: room.player1.name,
                player1Score: 501,
                player1Avg: 0,
                player1Legs: 0,
                player1Sets: 0,
                player2Name: room.player2?.name || 'Rival Online',
                player2Score: 501,
                player2Avg: 0,
                player2Legs: 0,
                player2Sets: 0,
                currentTurnIndex: 0,
                lastScore: room.lastThrow?.score || 0,
                lastDarts: [],
                status: room.status === 'FINISHED' ? 'FINISHED' : 'IN_PROGRESS',
                onlineRoomCode: room.code,
                timestamp: Date.now()
              };
            }
            return {
              ...prev,
              onlineRoomCode: room.code,
              status: room.status === 'FINISHED' ? 'FINISHED' : prev.status,
              lastScore: room.lastThrow ? room.lastThrow.score : prev.lastScore
            };
          });
        }
      } catch (e) {}
    }, 2500);

    return () => clearInterval(interval);
  }, [urlRoomCode, matchData?.onlineRoomCode]);

  // 3. Enumerar cámaras disponibles
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }).catch(() => {});
    }
  }, [selectedDeviceId]);

  // 4. Iniciar cámara: Prioriza el stream ya activo de window.opener para evitar colisión de hardware
  const startCamera = async (deviceId?: string) => {
    setCameraError(null);

    // Si window.opener tiene stream activo compartido, usarlo directamente
    if (typeof window !== 'undefined' && window.opener) {
      try {
        const openerStream = (window.opener as any).__lpld_remote_stream || (window.opener as any).__lpld_local_stream;
        if (openerStream && openerStream.active && openerStream.getVideoTracks().length > 0) {
          console.log('[Popout Camera] Reutilizando stream de ventana principal.');
          streamRef.current = openerStream;
          setCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = openerStream;
            videoRef.current.play().catch(() => {});
          }
          return;
        }
      } catch (e) {
        console.warn('[Popout Opener Stream Notice]:', e);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        // Analizador de nivel de voz para feedback de habla
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
            console.warn('[Popout Audio Analyser Notice]:', e);
          }
        }
      } catch (err: any) {
        console.warn('No se pudo acceder a la webcam o micrófono:', err);
        setCameraError(err.message || 'Cámara no accesible o permisos denegados');
        setCameraActive(false);
      }
    } else {
      setCameraError('Webcam no soportada en este entorno');
    }
  };

  // Mute en caliente del micrófono
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
    }
  }, [isMicMuted]);

  useEffect(() => {
    startCamera(selectedDeviceId);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [selectedDeviceId]);

  // Toggle Pantalla Completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Datos consolidados con fallbacks limpios
  const p1Name = matchData?.player1Name || 'Jugador 1';
  const p1Score = matchData?.player1Score ?? 501;
  const p1Legs = matchData?.player1Legs ?? 0;
  const p1Sets = matchData?.player1Sets ?? 0;
  const p1Avg = matchData?.player1Avg ? Number(matchData.player1Avg).toFixed(2) : '0.00';
  const p1Flag = getCountryFlag(matchData?.player1CountryCode || matchData?.player1Nationality || 'AR');

  const p2Name = matchData?.player2Name || 'Jugador 2';
  const p2Score = matchData?.player2Score ?? 501;
  const p2Legs = matchData?.player2Legs ?? 0;
  const p2Sets = matchData?.player2Sets ?? 0;
  const p2Avg = matchData?.player2Avg ? Number(matchData.player2Avg).toFixed(2) : '0.00';
  const p2Flag = getCountryFlag(matchData?.player2CountryCode || matchData?.player2Nationality || 'AR');

  const currentTurn = matchData?.currentTurnIndex ?? 0;
  const isSetsMode = matchData?.distanceMode === 'SETS';
  const matchTitle = matchData?.tournamentTitle || (urlRoomCode ? `Sala Online • ${urlRoomCode}` : 'Partida en Vivo • Pista Oficial');
  const activeRoomCode = matchData?.onlineRoomCode || urlRoomCode;
  const turnHistory = matchData?.turnHistory || [];

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-white flex flex-col justify-between overflow-x-hidden select-none">
      {/* BARRA SUPERIOR DE CONTROL DE TRANSMISIÓN */}
      <header className="h-14 bg-black/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-[#ef4444]">
              2ª PANTALLA / TV
            </span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="text-xs font-bold text-slate-300 truncate max-w-[200px] sm:max-w-md">
            {matchTitle}
          </span>
          {activeRoomCode && (
            <span className="hidden md:inline-block bg-[#00e676]/15 border border-[#00e676]/40 text-[#00e676] text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex-shrink-0">
              {activeRoomCode}
            </span>
          )}
        </div>

        {/* Controles de Cámara, Micrófono y Pantalla */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {videoDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-[#111622] border border-slate-700 rounded-xl px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#00e676] max-w-[110px] sm:max-w-[160px] truncate"
            >
              {videoDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  {d.label || `Cámara ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsMirrored(!isMirrored)}
            title="Invertir espejo horizontal"
            className={`p-1.5 rounded-xl border transition-colors ${
              isMirrored ? 'bg-[#00e676]/20 border-[#00e676] text-[#00e676]' : 'bg-[#111622] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel((prev) => (prev >= 1.5 ? 1 : prev + 0.25))}
            title={`Zoom: ${zoomLevel}x`}
            className="p-1.5 rounded-xl bg-[#111622] border border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-black px-2"
          >
            {zoomLevel}x
          </button>

          {/* Toggle entre Formato Banner TV y Split Screen (Lado a Lado) */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'TV_BANNER' ? 'SPLIT' : 'TV_BANNER')}
            title={layoutMode === 'TV_BANNER' ? 'Cambiar a Pantalla Dividida (Split Screen)' : 'Cambiar a Banner TV Completo'}
            className={`p-1.5 px-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
              layoutMode === 'SPLIT' 
                ? 'bg-[#0284c7]/30 border-[#0284c7] text-[#38bdf8]' 
                : 'bg-[#111622] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span className="hidden md:inline">{layoutMode === 'SPLIT' ? 'Split View' : 'TV View'}</span>
          </button>

          {/* Botón de Micrófono para Hablar con el Rival */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            title={isMicMuted ? 'Activar Micrófono' : 'Silenciar Micrófono'}
            className={`p-1.5 px-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
              isMicMuted 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : isSpeaking 
                  ? 'bg-[#00e676]/30 border-[#00e676] text-[#00e676] ring-2 ring-[#00e676]/60 animate-pulse' 
                  : 'bg-[#111622] border-[#00e676]/40 text-[#00e676]'
            }`}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isMicMuted ? 'Muted' : isSpeaking ? 'Hablando' : 'Voz ON'}
            </span>
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
            className="p-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-black font-black border border-[#00e676] transition-transform active:scale-95"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ÁREA PRINCIPAL: MODO SPLIT (LADO A LADO) O MODO TV_BANNER */}
      <main className="flex-1 relative w-full flex flex-col lg:flex-row items-stretch justify-center overflow-hidden bg-black">
        {/* PANEL DE CÁMARA (LADO IZQUIERDO O CENTRO) */}
        <div className={`relative flex items-center justify-center overflow-hidden bg-black ${
          layoutMode === 'SPLIT' ? 'w-full lg:w-7/12 xl:w-8/12 min-h-[300px] border-b lg:border-b-0 lg:border-r border-slate-800' : 'w-full flex-1'
        }`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
            style={{ transform: `scale(${zoomLevel}) ${isMirrored ? 'scaleX(-1)' : ''}` }}
          />

          {/* Fallback si no hay cámara activa */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-900 to-black">
              <div className="relative w-36 h-36 rounded-full border-4 border-[#ef4444]/60 bg-black/90 flex items-center justify-center shadow-2xl shadow-[#ef4444]/20 mb-3">
                <Target className="w-16 h-16 text-[#ef4444] animate-pulse" />
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#00e676]/40 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <h3 className="text-lg font-black text-white mb-1">
                Diana en Espera de Señal
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-3">
                {cameraError ? `Aviso: ${cameraError}` : 'Conectá tu webcam o verificá que la ventana principal de la diana esté abierta.'}
              </p>
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="px-4 py-2 rounded-xl bg-[#00e676] text-black font-black text-xs flex items-center gap-2 hover:bg-[#00c864] transition-all cursor-pointer shadow-lg shadow-[#00e676]/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reconectar Señal de Diana</span>
              </button>
            </div>
          )}

          {/* INSIGNIA SUPERIOR FLOTANTE DE PARTIDO */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
            <span className="text-[10px] font-black uppercase text-white tracking-wider">
              {matchData?.status === 'FINISHED' ? '🏆 PARTIDA FINALIZADA' : '🎯 DIANA EN VIVO'}
            </span>
            {matchData?.distanceMode && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                {matchData.distanceMode === 'SETS'
                  ? `Al mejor de ${matchData.bestOfSets || 3} Sets`
                  : `Al mejor de ${matchData.bestOfLegs || 5} Legs`}
              </span>
            )}
          </div>

          {/* ÚLTIMA VISITA FLOTANTE (ESTILO PDC) */}
          {matchData?.lastScore !== undefined && matchData.lastScore > 0 && (
            <div className="absolute top-3 right-3 z-20 bg-black/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-[#00e676] shadow-2xl animate-in slide-in-from-top duration-300">
              <span className="text-[9px] uppercase font-black text-slate-400 block text-center">
                Última Visita
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#00e676] block text-center font-mono leading-tight">
                {matchData.lastScore}
              </span>
            </div>
          )}
        </div>

        {/* PANEL DERECHO EXCLUSIVO EN MODO SPLIT: TABLERO OFICIAL COMPLETO */}
        {layoutMode === 'SPLIT' && (
          <div className="w-full lg:w-5/12 xl:w-4/12 bg-[#090c14] p-4 flex flex-col justify-between overflow-y-auto space-y-4 flex-shrink-0">
            {/* Cabecera del Tablero */}
            <div className="border-b border-slate-800 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  MARCADOR OFICIAL
                </span>
                <span className="text-xs font-bold text-[#00e676]">
                  {matchData?.distanceMode === 'SETS' ? 'MODALIDAD SETS' : 'MODALIDAD LEGS'}
                </span>
              </div>
            </div>

            {/* Tarjetas de Ambos Jugadores */}
            <div className="space-y-3">
              {/* Jugador 1 */}
              <div className={`p-3.5 rounded-2xl border-2 transition-all ${
                currentTurn === 0 
                  ? 'border-[#00e676] bg-[#00e676]/10 shadow-lg shadow-[#00e676]/20' 
                  : 'border-slate-800 bg-[#0c101c]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-2xl">{p1Flag}</span>
                    <div className="truncate">
                      <h4 className="text-base font-black text-white truncate">{p1Name}</h4>
                      <p className="text-[11px] text-slate-400">Avg. <strong>{p1Avg}</strong></p>
                    </div>
                  </div>
                  {currentTurn === 0 && (
                    <span className="bg-[#00e676] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Target className="w-2.5 h-2.5" /> Tirando
                    </span>
                  )}
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono text-center my-1 tracking-tight">
                  {p1Score}
                </div>
              </div>

              {/* Jugador 2 */}
              <div className={`p-3.5 rounded-2xl border-2 transition-all ${
                currentTurn === 1 
                  ? 'border-[#00e676] bg-[#00e676]/10 shadow-lg shadow-[#00e676]/20' 
                  : 'border-slate-800 bg-[#0c101c]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-2xl">{p2Flag}</span>
                    <div className="truncate">
                      <h4 className="text-base font-black text-white truncate">{p2Name}</h4>
                      <p className="text-[11px] text-slate-400">Avg. <strong>{p2Avg}</strong></p>
                    </div>
                  </div>
                  {currentTurn === 1 && (
                    <span className="bg-[#00e676] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Target className="w-2.5 h-2.5" /> Tirando
                    </span>
                  )}
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono text-center my-1 tracking-tight">
                  {p2Score}
                </div>
              </div>
            </div>

            {/* Barra S/L (Sets / Legs) */}
            <div className="flex items-center justify-between px-5 py-2 bg-white rounded-xl text-slate-900 font-black text-sm shadow">
              <span>{isSetsMode ? p1Sets : p1Legs}</span>
              <span className="text-slate-600 tracking-widest text-xs">S/L</span>
              <span>{isSetsMode ? p2Sets : p2Legs}</span>
            </div>

            {/* Cierre Sugerido */}
            {matchData?.checkoutSuggestion && (
              <div className="p-2.5 bg-[#00e676]/15 border border-[#00e676]/40 rounded-xl text-xs font-black text-[#00e676] flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Cierre Sugerido: <strong>{matchData.checkoutSuggestion}</strong></span>
              </div>
            )}

            {/* Historial de Últimas Visitas */}
            {turnHistory.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Últimos Tiros
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {turnHistory.slice(0, 6).map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#111622] text-xs font-mono"
                    >
                      <span className="text-slate-300 font-bold truncate max-w-[120px]">{t.playerName}</span>
                      <div className="flex items-center gap-2">
                        <span className={t.score >= 100 ? 'text-[#00e676] font-bold' : t.isBust ? 'text-red-400' : 'text-white'}>
                          {t.isBust ? 'BUST' : t.score} pts
                        </span>
                        <span className="text-slate-500 text-[10px]">({t.remainingAfter})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* OVERLAY TELEVISIVO INFERIOR (PDC BROADCAST LOWER THIRD) EN MODO BANNER */}
      {layoutMode === 'TV_BANNER' && (
        <footer className="w-full bg-[#07090e]/95 backdrop-blur-xl border-t-2 border-slate-800 p-3 sm:p-4 z-30 flex-shrink-0">
          <div className="max-w-6xl mx-auto space-y-2.5">
            {/* Grid de Jugador 1 y Jugador 2 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {/* TARJETA JUGADOR 1 */}
              <div
                className={`relative rounded-2xl p-2.5 sm:p-4 border-2 transition-all ${
                  currentTurn === 0
                    ? 'bg-gradient-to-r from-[#00e676]/15 to-[#07090e] border-[#00e676] shadow-xl shadow-[#00e676]/20'
                    : 'bg-[#0f1422] border-slate-800 opacity-85'
                }`}
              >
                {currentTurn === 0 && (
                  <div className="absolute -top-3 left-4 bg-[#00e676] text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Target className="w-2.5 h-2.5" />
                    <span>TIRANDO AHORA</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 truncate">
                    <span className="text-2xl sm:text-3xl select-none">{p1Flag}</span>
                    <div className="truncate">
                      <h3 className="text-sm sm:text-lg font-black text-white truncate leading-tight">
                        {p1Name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>AVG: <strong className="text-white">{p1Avg}</strong></span>
                        {isSetsMode && (
                          <span>• Sets: <strong className="text-amber-400">{p1Sets}</strong></span>
                        )}
                        <span>• Legs: <strong className="text-[#00e676]">{p1Legs}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      {p1Score}
                    </span>
                  </div>
                </div>
              </div>

              {/* TARJETA JUGADOR 2 */}
              <div
                className={`relative rounded-2xl p-2.5 sm:p-4 border-2 transition-all ${
                  currentTurn === 1
                    ? 'bg-gradient-to-r from-[#00e676]/15 to-[#07090e] border-[#00e676] shadow-xl shadow-[#00e676]/20'
                    : 'bg-[#0f1422] border-slate-800 opacity-85'
                }`}
              >
                {currentTurn === 1 && (
                  <div className="absolute -top-3 left-4 bg-[#00e676] text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Target className="w-2.5 h-2.5" />
                    <span>TIRANDO AHORA</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 truncate">
                    <span className="text-2xl sm:text-3xl select-none">{p2Flag}</span>
                    <div className="truncate">
                      <h3 className="text-sm sm:text-lg font-black text-white truncate leading-tight">
                        {p2Name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>AVG: <strong className="text-white">{p2Avg}</strong></span>
                        {isSetsMode && (
                          <span>• Sets: <strong className="text-amber-400">{p2Sets}</strong></span>
                        )}
                        <span>• Legs: <strong className="text-[#00e676]">{p2Legs}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      {p2Score}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Sets / Legs (S/L) y Cierre Sugerido */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center justify-between px-4 py-1 bg-white rounded-lg text-slate-900 font-black text-xs sm:text-sm shadow flex-1 max-w-xs">
                <span>{isSetsMode ? p1Sets : p1Legs}</span>
                <span className="text-slate-600 tracking-widest text-[11px]">S/L</span>
                <span>{isSetsMode ? p2Sets : p2Legs}</span>
              </div>

              {matchData?.checkoutSuggestion && (
                <div className="text-xs text-amber-400 font-black flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  <span>CIERRE SUGERIDO: {matchData.checkoutSuggestion}</span>
                </div>
              )}
            </div>

            {/* Tira de Últimos Tiros */}
            {turnHistory.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-500 font-bold uppercase text-[10px] flex-shrink-0">Últimos Tiros:</span>
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {turnHistory.slice(0, 5).map((t, idx) => (
                    <span
                      key={idx}
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
          </div>
        </footer>
      )}
    </div>
  );
}

export default function CamaraPopoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center text-sm font-bold">
        <Target className="w-6 h-6 text-[#ef4444] animate-spin mr-2" />
        <span>Cargando 2ª Pantalla / TV...</span>
      </div>
    }>
      <CamaraPopoutContent />
    </Suspense>
  );
}
