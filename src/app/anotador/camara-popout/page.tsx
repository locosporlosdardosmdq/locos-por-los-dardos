'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

export default function CamaraPopoutPage() {
  const [matchData, setMatchData] = useState<BroadcastMatchPayload | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'TV_BANNER' | 'SPLIT'>('TV_BANNER');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

    // Suscripción en caliente
    const unsubscribe = matchBroadcast.subscribe((data) => {
      setMatchData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Enumerar cámaras disponibles
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

  // 3. Iniciar o reiniciar la cámara
  const startCamera = async (deviceId?: string) => {
    setCameraError(null);
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
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('No se pudo acceder a la webcam:', err);
        setCameraError(err.message || 'Cámara no accesible o permisos denegados');
        setCameraActive(false);
      }
    } else {
      setCameraError('Webcam no soportada en este entorno');
    }
  };

  useEffect(() => {
    startCamera(selectedDeviceId);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [selectedDeviceId]);

  // 4. Toggle Pantalla Completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Datos de fallback si no hay partido activo en el anotador
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
  const matchTitle = matchData?.tournamentTitle || 'Partida en Vivo • Pista Oficial';

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* BARRA SUPERIOR DE CONTROL DE TRANSMISIÓN */}
      <header className="h-14 bg-black/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-[#ef4444]">
              2ª PANTALLA / TV OFICIAL
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-xs font-bold text-slate-300 truncate max-w-[280px] sm:max-w-md">
            {matchTitle}
          </span>
        </div>

        {/* Controles de Cámara y Pantalla */}
        <div className="flex items-center gap-2">
          {videoDevices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-[#111622] border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00e676]"
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
            className="p-1.5 rounded-xl bg-[#111622] border border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-black px-2.5"
          >
            {zoomLevel}x
          </button>

          <button
            onClick={() => setLayoutMode(layoutMode === 'TV_BANNER' ? 'SPLIT' : 'TV_BANNER')}
            title="Cambiar formato de visualización"
            className="p-1.5 rounded-xl bg-[#111622] border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Tv className="w-4 h-4" />
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

      {/* ÁREA CENTRAL: STREAM DE LA DIANA + OVERLAYS */}
      <main className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {/* VIDEO DE LA DIANA */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain transition-transform duration-200 ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
            style={{ transform: `scale(${zoomLevel}) ${isMirrored ? 'scaleX(-1)' : ''}` }}
          />

          {/* Fallback si no hay cámara activa */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-900 to-black">
              <div className="relative w-44 h-44 rounded-full border-4 border-[#ef4444]/60 bg-black/90 flex items-center justify-center shadow-2xl shadow-[#ef4444]/20 mb-4">
                <Target className="w-24 h-24 text-[#ef4444] animate-pulse" />
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#00e676]/40 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <h3 className="text-xl font-black text-white mb-1">
                Diana en Espera de Señal
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                {cameraError ? `Aviso: ${cameraError}` : 'Conectá tu webcam o cámara de celular apuntando a la diana.'}
              </p>
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="px-4 py-2 rounded-xl bg-[#00e676] text-black font-black text-xs flex items-center gap-2 hover:bg-[#00c864] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar Conexión de Cámara</span>
              </button>
            </div>
          )}

          {/* INSIGNIA SUPERIOR FLOTANTE DE PARTIDO */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
            <span className="text-[11px] font-black uppercase text-white tracking-wider">
              {matchData?.status === 'FINISHED' ? '🏆 PARTIDA FINALIZADA' : '🎯 DIANA EN VIVO'}
            </span>
            {matchData?.distanceMode && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                {matchData.distanceMode === 'SETS'
                  ? `Mejor de ${matchData.bestOfSets || 3} Sets`
                  : `Mejor de ${matchData.bestOfLegs || 5} Legs`}
              </span>
            )}
          </div>

          {/* ÚLTIMA VISITA FLOTANTE (ESTILO PDC) */}
          {matchData?.lastScore !== undefined && matchData.lastScore > 0 && (
            <div className="absolute top-4 right-4 z-20 bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-[#00e676] shadow-2xl animate-in slide-in-from-top duration-300">
              <span className="text-[10px] uppercase font-black text-slate-400 block text-center">
                Última Visita
              </span>
              <span className="text-3xl font-black text-[#00e676] block text-center font-mono leading-tight">
                {matchData.lastScore}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* OVERLAY TELEVISIVO INFERIOR (PDC BROADCAST LOWER THIRD) */}
      <footer className="w-full bg-[#07090e]/95 backdrop-blur-xl border-t-2 border-slate-800 p-3 sm:p-5 z-30 flex-shrink-0">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-3 sm:gap-6">
          {/* TARJETA JUGADOR 1 */}
          <div
            className={`relative rounded-2xl p-3 sm:p-4 border-2 transition-all ${
              currentTurn === 0
                ? 'bg-gradient-to-r from-[#00e676]/15 to-[#07090e] border-[#00e676] shadow-xl shadow-[#00e676]/20'
                : 'bg-[#0f1422] border-slate-800 opacity-85'
            }`}
          >
            {/* Indicador de turno de tiro */}
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

              {/* Puntaje Gigante Restante */}
              <div className="text-right flex-shrink-0 ml-2">
                <span className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
                  {p1Score}
                </span>
              </div>
            </div>
          </div>

          {/* TARJETA JUGADOR 2 */}
          <div
            className={`relative rounded-2xl p-3 sm:p-4 border-2 transition-all ${
              currentTurn === 1
                ? 'bg-gradient-to-r from-[#00e676]/15 to-[#07090e] border-[#00e676] shadow-xl shadow-[#00e676]/20'
                : 'bg-[#0f1422] border-slate-800 opacity-85'
            }`}
          >
            {/* Indicador de turno de tiro */}
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

              {/* Puntaje Gigante Restante */}
              <div className="text-right flex-shrink-0 ml-2">
                <span className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
                  {p2Score}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cierre sugerido si alguno está en rango */}
        {matchData?.checkoutSuggestion && (
          <div className="mt-2 text-center text-xs text-amber-400 font-black animate-pulse flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>CIERRE SUGERIDO: {matchData.checkoutSuggestion}</span>
          </div>
        )}
      </footer>
    </div>
  );
}
