'use client';

import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  X, 
  Sparkles, 
  Smartphone, 
  ShieldCheck,
  Target,
  QrCode
} from 'lucide-react';

interface InvitePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviterName?: string;
}

export const InvitePlayersModal: React.FC<InvitePlayersModalProps> = ({
  isOpen,
  onClose,
  inviterName
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://locosporlosdardos.com.ar');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      setBaseUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const registrationUrl = `${baseUrl}/perfil`;
  const signature = inviterName ? `Te invita: ${inviterName} 🎯` : 'Circuito Oficial Argentino 🎯';

  const defaultWhatsappMessage = 
`🎯 *¡Sumate al Circuito Oficial de Dardos!* 🇦🇷
*Locos por los Dardos & Darderos Mar del Plata*

Te invito a registrar tu ficha deportiva oficial, configurar tus dardos y participar en torneos en vivo, ligas, ranking nacional y salas online 1 vs 1 con doble cámara:

👉 *Creá tu ficha acá:*
${registrationUrl}

${signature}
¡Nos vemos en la diana! 🎯🔥`;

  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultWhatsappMessage)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(defaultWhatsappMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-lg bg-[#07090e] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/95 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="bg-[#0f1422] border-b border-emerald-500/20 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00e676]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>Invitar Jugadores por WhatsApp</span>
                <span className="text-[10px] bg-emerald-500/20 text-[#00e676] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  OFICIAL
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Compartí este enlace en grupos o mensajes directos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#14161f] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4">
          {/* Tarjeta de enlace directo */}
          <div className="bg-[#0f1422] border border-[#1e2638] rounded-2xl p-3.5 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Enlace Directo de Registro</span>
              <span className="text-[#00e676] text-[10px]">Acceso a Ficha Deportiva</span>
            </label>
            <div className="flex items-center gap-2 bg-[#14161f] border border-[#313647] rounded-xl px-3 py-2">
              <input
                type="text"
                readOnly
                value={registrationUrl}
                className="w-full bg-transparent text-xs text-emerald-400 font-mono font-bold focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1 transition-all shadow flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Vista previa del mensaje de WhatsApp */}
          <div className="bg-[#0f1422] border border-[#1e2638] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Mensaje Listo para WhatsApp
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedMessage ? (
                  <span className="text-[#00e676] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mensaje copiado
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copiar texto
                  </span>
                )}
              </button>
            </div>

            <div className="bg-[#14161f] border border-[#232a3b] rounded-xl p-3 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed select-all">
              {defaultWhatsappMessage}
            </div>
          </div>

          {/* Acciones principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Enviar por WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-3 px-4 rounded-xl bg-[#1e2638] hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
            >
              <Copy className="w-4 h-4 text-[#00e676]" />
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Solo el Link'}</span>
            </button>
          </div>

          {/* Nota informativa */}
          <p className="text-[11px] text-center text-slate-400 leading-normal">
            💡 Al abrir el link, el jugador ingresará directo a <strong className="text-white">Mi Perfil</strong> para registrar su apodo, foto, categoría de AVG y dardos. Al guardar, quedará federado en la base de datos nacional.
          </p>
        </div>
      </div>
    </div>
  );
};
