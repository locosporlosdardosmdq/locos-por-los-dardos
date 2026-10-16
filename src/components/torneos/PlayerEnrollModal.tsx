'use client';

import React, { useState, useEffect } from 'react';
import { USER_ICEMAN, DEFAULT_ASSOCIATION_BANK_ACCOUNT } from '@/lib/constants';
import { getStoredAssociationBankAccount, getCurrentPlayerProfile, fetchRegisteredPlayersFromCloud } from '@/lib/storage';
import { Tournament, AssociationBankAccount, PlayerProfile } from '@/lib/types';
import { WebcamSetupModal } from './WebcamSetupModal';
import { 
  User, 
  Lock, 
  Video, 
  Calendar, 
  ShieldCheck, 
  Check, 
  X,
  Settings2,
  CreditCard,
  Copy,
  CheckCircle2,
  MessageCircle,
  AlertCircle
} from 'lucide-react';

interface PlayerEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament?: Tournament | null;
  onEnrollPlayer: (playerData: { name: string; pin: string; useWebcam: boolean }) => void;
}

export const PlayerEnrollModal: React.FC<PlayerEnrollModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onEnrollPlayer
}) => {
  const [currentUser] = useState<PlayerProfile>(() => getCurrentPlayerProfile(USER_ICEMAN));
  const [selectedPlayerName, setSelectedPlayerName] = useState(currentUser.fullName);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerProfile[]>([USER_ICEMAN]);
  const [pin, setPin] = useState('1234');
  const [useWebcam, setUseWebcam] = useState(true);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [bankAccount, setBankAccount] = useState<AssociationBankAccount>(() => {
    return getStoredAssociationBankAccount(DEFAULT_ASSOCIATION_BANK_ACCOUNT);
  });

  useEffect(() => {
    fetchRegisteredPlayersFromCloud().then((cloud) => {
      if (cloud && cloud.length > 0) {
        setAvailablePlayers(cloud);
      }
    });
  }, []);

  useEffect(() => {
    const handleBankUpdate = (e: any) => {
      if (e.detail) setBankAccount(e.detail);
    };
    window.addEventListener('lpld_association_bank_updated', handleBankUpdate);
    return () => window.removeEventListener('lpld_association_bank_updated', handleBankUpdate);
  }, []);

  if (!isOpen) return null;

  const isPaidTournament = tournament ? (tournament.isPaid !== false && (tournament.entryFeeArs || 0) > 0) : false;
  const entryFee = tournament?.entryFeeArs || 0;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerName.trim()) return;

    onEnrollPlayer({
      name: selectedPlayerName,
      pin,
      useWebcam
    });
    onClose();
  };

  const currentDateString = new Date().toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const whatsappMessage = encodeURIComponent(
    `Hola ${bankAccount.adminWhatsAppName}, adjunto el comprobante de pago de inscripción al torneo "${tournament?.title || 'Torneo Oficial'}".\n\n` +
    `• Jugador: ${selectedPlayerName}\n` +
    `• Monto: $${entryFee.toLocaleString('es-AR')} ARS\n\n` +
    `¡Por favor confirmar mi lugar en la llave!`
  );

  const whatsappUrl = `https://wa.me/${bankAccount.adminWhatsAppPhone}?text=${whatsappMessage}`;

  const isRegistrationClosed = tournament ? tournament.status !== 'REGISTRATION_OPEN' : false;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
        <div className="w-full max-w-lg bg-[#07090e] border border-[#ef4444]/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/95 my-auto max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y">
          {/* Cabecera */}
          <div className="bg-[#0f1422] border-b border-[#ef4444]/20 px-5 py-3.5 flex items-center justify-between sticky top-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
            >
              {isRegistrationClosed ? 'Cerrar' : 'Cancelar'}
            </button>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide text-center">
              {isRegistrationClosed ? 'Inscripción Cerrada' : 'Inscripción de Participante'}
            </h2>
            {!isRegistrationClosed ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3.5 py-1.5 rounded-xl bg-[#00e676] hover:bg-[#00c864] text-[#07090e] font-black text-xs border border-[#00e676] transition-colors"
              >
                Confirmar
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>

          {isRegistrationClosed ? (
            /* Bloqueo: Torneo en Sesión / Inscripción Cerrada */
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                  {tournament?.status === 'IN_PROGRESS' ? '🎯 Torneo en Sesión' : '⚪ Torneo Finalizado'}
                </span>
                <h3 className="text-lg font-black text-white">
                  Las inscripciones están cerradas
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Este torneo ya fue puesto en sesión y los partidos de la llave eliminatoria se encuentran sorteados y fijados. No se admiten nuevos participantes para no vulnerar el desarrollo de la llave.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00e676]/20 transition-all active:scale-95"
                >
                  Ver Llave y Partidos
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {/* Banner de Modalidad (Gratuito vs Arancelado) */}
              {isPaidTournament ? (
                <div className="bg-gradient-to-r from-amber-500/15 via-[#111622] to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                        Torneo con Inscripción
                      </span>
                    </div>
                    <span className="text-base font-black text-white bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
                      ${entryFee.toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Para confirmar tu lugar en la llave eliminatoria debés depositar el importe en la cuenta oficial y enviar el comprobante por WhatsApp al administrador designado.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-black text-emerald-400">Torneo Gratuito • Sin Arancel</div>
                  <div className="text-[11px] text-slate-400">Tu inscripción se acreditará de forma automática al confirmar.</div>
                </div>
              </div>
            )}

            {/* SECCIÓN DATOS BANCARIOS (SI ES DE PAGO) */}
            {isPaidTournament && (
              <div className="bg-[#111622] border border-slate-700 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00e676]" />
                    <span>Cuenta Oficial de la Asociación</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{bankAccount.bankName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Titular</div>
                    <div className="font-bold text-white truncate">{bankAccount.holderName}</div>
                  </div>
                  <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">CUIT / CUIL</div>
                    <div className="font-mono font-bold text-white">{bankAccount.cuitCuil}</div>
                  </div>
                </div>

                {/* ALIAS */}
                <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Alias CBU/CVU</div>
                    <div className="font-mono font-black text-[#00e676] text-xs sm:text-sm tracking-wide">
                      {bankAccount.alias}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankAccount.alias, 'alias')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedField === 'alias' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00e676]" />
                        <span className="text-[#00e676]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* CBU / CVU */}
                <div className="bg-[#07090e] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">CBU / CVU</div>
                    <div className="font-mono font-bold text-slate-200 text-xs truncate">
                      {bankAccount.cbuCvu}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankAccount.cbuCvu, 'cbu')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    {copiedField === 'cbu' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00e676]" />
                        <span className="text-[#00e676]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* BOTÓN WHATSAPP COMPROBANTE */}
                <div className="pt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all text-center"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-transparent" />
                    <span>Enviar Comprobante por WhatsApp al Administrador ({bankAccount.adminWhatsAppName})</span>
                  </a>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Al tocar el botón se abrirá WhatsApp con el mensaje y datos del torneo pre-completados.
                  </p>
                </div>
              </div>
            )}

            {/* Nombre del jugador / equipo */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase block">
                Nombre del jugador / equipo *
              </label>
              <select
                value={selectedPlayerName}
                onChange={(e) => setSelectedPlayerName(e.target.value)}
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              >
                <option value={currentUser.fullName}>
                  {currentUser.fullName} (@{currentUser.nickname}) [Tú]
                </option>
                {availablePlayers
                  .filter((p) => p.id !== currentUser.id && p.fullName !== currentUser.fullName)
                  .map((p) => (
                    <option key={p.id} value={p.fullName}>
                      {p.fullName} (@{p.nickname}) • AVG {p.estimatedAvg || p.stats?.overallAvg || 45}
                    </option>
                  ))}
                <option value="Invitado / Nuevo Jugador">+ Inscribir con nombre personalizado</option>
              </select>
            </div>

            {selectedPlayerName === 'Invitado / Nuevo Jugador' && (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Escribí el nombre del jugador o equipo"
                  onChange={(e) => setSelectedPlayerName(e.target.value)}
                  className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
                />
              </div>
            )}

            {/* Contraseña de participante */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 uppercase block">
                Contraseña de participante *
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Clave numérica (ej: 1234)"
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#00e676]"
              />
              <p className="text-[10px] text-slate-500">
                Evita que otro jugador anote por vos en las pistas abiertas
              </p>
            </div>

            {/* Opciones de webcam */}
            <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWebcam}
                  onChange={(e) => setUseWebcam(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-[#00e676] focus:ring-0 bg-[#07090e]"
                />
                <span className="text-xs font-bold text-white">Usar webcam (para juego online)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowWebcamModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#07090e] hover:bg-[#151a26] border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Video className="w-4 h-4 text-[#00e676]" />
                <span>Configuración de la webcam</span>
              </button>
            </div>

            {/* Fecha y hora */}
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Fecha y hora: <strong className="text-white">{currentDateString}</strong></span>
            </div>
          </form>
        )}
        </div>
      </div>

      <WebcamSetupModal
        isOpen={showWebcamModal}
        onClose={() => setShowWebcamModal(false)}
      />
    </>
  );
};
