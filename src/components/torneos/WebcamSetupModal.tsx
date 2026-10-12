'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  Smartphone, 
  Volume2, 
  ShieldAlert, 
  Check, 
  X, 
  Maximize2, 
  QrCode,
  Sparkles
} from 'lucide-react';

interface WebcamSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentTitle?: string;
}

export const WebcamSetupModal: React.FC<WebcamSetupModalProps> = ({
  isOpen,
  onClose,
  tournamentTitle = 'Configuración de Pista y Cámara'
}) => {
  const [useOtherDevice, setUseOtherDevice] = useState(false);
  const [autoZoomOpponent, setAutoZoomOpponent] = useState(true);
  const [showAudioLevel, setShowAudioLevel] = useState(true);
  const [blockSpectatorCam, setBlockSpectatorCam] = useState(false);
  const [useAudio, setUseAudio] = useState(true);

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [availableAudios, setAvailableAudios] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lpld_camera_device_id') || '';
    }
    return '';
  });
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');

  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Inicializar cámara si el navegador lo permite
  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      const videoConstraint = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : true;
      const audioConstraint = useAudio
        ? (selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true)
        : false;

      navigator.mediaDevices
        .getUserMedia({ video: videoConstraint, audio: audioConstraint })
        .then((s) => {
          stream = s;
          setCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }

          // Enumerar dispositivos reales con sus etiquetas
          if (navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
              setAvailableCameras(devices.filter((d) => d.kind === 'videoinput'));
              setAvailableAudios(devices.filter((d) => d.kind === 'audioinput'));
            }).catch(() => {});
          }
        })
        .catch(() => {
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, useAudio, selectedCameraId, selectedAudioId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#07090e] border border-[#ef4444]/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/95 space-y-4">
        {/* Cabecera idéntica a la captura */}
        <div className="bg-[#0f1422] border-b border-[#ef4444]/20 px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <h2 className="text-base font-black text-white tracking-wide">
            Configuración de la Webcam
          </h2>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-xs border border-[#00e676] transition-colors"
          >
            Hecho
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Mensaje de compatibilidad idéntico a la captura */}
          <div className="text-[11px] text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-2xl p-3 leading-relaxed font-semibold">
            El funcionamiento de la webcam está comprobado en Chrome, Edge, Firefox, Safari 11 o posterior en macOS, iOS 11 o posterior (Safari) y Android 5 o posterior. Para usar la cámara en un iPhone, abre la página en Safari.
          </div>

          {/* Opciones con checkboxes idénticas a la captura */}
          <div className="space-y-3 bg-[#111622] border border-slate-800 rounded-2xl p-4">
            {/* Usar webcam en otro dispositivo */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useOtherDevice}
                onChange={(e) => setUseOtherDevice(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-sm font-bold text-white">Usar la webcam en otro dispositivo (Celular como cámara de Diana)</span>
            </label>

            {useOtherDevice && (
              <div className="pl-7 pt-1 pb-2">
                <div className="p-3 bg-[#07090e] border border-[#00e676]/30 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Escanear código QR desde el celular</div>
                    <div className="text-[10px] text-slate-400">Apunta el teléfono hacia la diana para transmitir el video</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg text-black">
                    <QrCode className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}

            {/* Ampliar automáticamente el video del rival */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoZoomOpponent}
                onChange={(e) => setAutoZoomOpponent(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-sm font-bold text-white">Ampliar automáticamente el vídeo del rival</span>
            </label>

            {/* Mostrar el nivel de audio en el marco de la cámara */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showAudioLevel}
                onChange={(e) => setShowAudioLevel(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-sm font-bold text-white">Mostrar el nivel de audio en el marco de la cámara</span>
            </label>

            {/* No permitir conexión de cámara a los espectadores */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={blockSpectatorCam}
                onChange={(e) => setBlockSpectatorCam(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-sm font-bold text-white">No permitir la conexión de cámara de los espectadores</span>
            </label>

            {/* Usar audio */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useAudio}
                onChange={(e) => setUseAudio(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
              />
              <span className="text-sm font-bold text-white">Usar audio (Micrófono)</span>
            </label>
          </div>

          {/* Selectores de Dispositivos */}
          <div className="space-y-3 bg-[#111622] border border-slate-800 rounded-2xl p-4">
            <div>
              <label className="text-xs font-black text-slate-300 uppercase block mb-1.5">
                Seleccionar Audio / Micrófono
              </label>
              <select
                value={selectedAudioId}
                onChange={(e) => setSelectedAudioId(e.target.value)}
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              >
                <option value="">Predeterminado (Micrófono del sistema)</option>
                {availableAudios.map((audio, idx) => (
                  <option key={audio.deviceId || idx} value={audio.deviceId}>
                    {audio.label || `Micrófono ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-300 uppercase block mb-1.5">
                Seleccionar Cámara
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  const devId = e.target.value;
                  setSelectedCameraId(devId);
                  if (typeof window !== 'undefined') {
                    if (devId) {
                      localStorage.setItem('lpld_camera_device_id', devId);
                    } else {
                      localStorage.removeItem('lpld_camera_device_id');
                    }
                  }
                }}
                className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              >
                <option value="">Predeterminado (Cámara automática del sistema)</option>
                {availableCameras.map((cam, idx) => (
                  <option key={cam.deviceId || idx} value={cam.deviceId}>
                    {cam.label || `Cámara ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista Previa en Vivo de la Cámara */}
          <div className="bg-[#0f1422] border border-[#00e676]/30 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#00e676]" />
                <span>Vista Previa de la Diana</span>
              </span>
              <span className="text-[10px] text-[#00e676] bg-[#00e676]/10 px-2 py-0.5 rounded-md">
                {cameraActive ? 'SEÑAL ACTIVA' : 'MODO EMULADO'}
              </span>
            </div>

            <div className="relative aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                  <Camera className="w-8 h-8 text-slate-600" />
                  <span className="text-xs font-bold">Cámara lista para encender durante la partida</span>
                  <span className="text-[10px] text-slate-600">Resolución recomendada: 720p o 1080p apuntando al sisal</span>
                </div>
              )}

              {/* Vúmetro simulado */}
              {showAudioLevel && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  <Mic className="w-3.5 h-3.5 text-[#00e676]" />
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                    <div className="w-1/3 bg-[#00e676] rounded-full" />
                    <div className="w-1/4 bg-[#00e676] rounded-full" />
                    <div className="w-1/6 bg-amber-400 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
