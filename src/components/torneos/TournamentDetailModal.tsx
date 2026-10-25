'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Tournament, 
  PlayerProfile 
} from '@/lib/types';
import { getCountryFlag, CATEGORY_DETAILS, calculateCategory } from '@/lib/constants';
import { 
  X, 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Target, 
  Shield, 
  Flame, 
  Sparkles, 
  Share2, 
  Check, 
  Eye, 
  MessageCircle, 
  Award,
  Layers,
  Clock,
  UserCheck
} from 'lucide-react';

interface TournamentDetailModalProps {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrollClick?: (tournament: Tournament) => void;
  onViewBracketClick?: (tournament: Tournament) => void;
  currentUser?: PlayerProfile | null;
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  isOpen,
  onClose,
  onEnrollClick,
  onViewBracketClick,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'MODALITY' | 'PLAYERS'>('MODALITY');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !tournament) return null;

  const enrolledPlayers = tournament.enrolledPlayers || [];
  const maxParticipants = tournament.maxParticipants || 32;
  const enrolledCount = tournament.registeredCount || enrolledPlayers.length;
  const isUserEnrolled = Boolean(currentUser && enrolledPlayers.some(p => p.id === currentUser.id));

  const formatLabels: Record<string, string> = {
    SINGLE_ELIMINATION: 'Eliminación Simple (Cuadro KO)',
    DOUBLE_ELIMINATION: 'Doble Eliminación (Ganadores y Perdedores)',
    ROUND_ROBIN: 'Fase de Grupos (Zonas) + Playoffs Eliminatorios',
    HYBRID: 'Híbrido (Grupos y Llaves)'
  };

  const competitionModeLabels: Record<string, { label: string; badge: string }> = {
    NATIONAL_LEAGUE: {
      label: 'Liga Nacional Oficial de Dardos Argentina',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
    },
    LOCAL_LEAGUE: {
      label: tournament.leagueName || 'Liga Marplatense • Darderos MDQ',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    STANDALONE_DAY: {
      label: 'Torneo Abierto & Especial de Un Día',
      badge: 'bg-slate-800 text-slate-300 border-slate-700'
    }
  };

  const isDoubles = tournament.isDoubles || 
    tournament.title.toLowerCase().includes('pareja') || 
    tournament.title.toLowerCase().includes('dupla');

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://locosporlosdardos.com.ar';
    const url = `${origin}/torneos?inscribir=${encodeURIComponent(tournament.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://locosporlosdardos.com.ar';
    const url = `${origin}/torneos?inscribir=${encodeURIComponent(tournament.id)}`;
    const msg = `🎯 *LOCOS POR LOS DARDOS • TORNEO OFICIAL*\n\n🏆 *${tournament.title}*\n📍 *Sede:* ${tournament.venueName || 'Sociedad de Fomento Nueva Pompeya'} (${tournament.city || 'Mar del Plata'})\n🎲 *Modalidad:* ${isDoubles ? 'Parejas (Duplas)' : 'Individual 501'}\n📊 *Cupo:* ${enrolledCount}/${maxParticipants} inscriptos\n\n👉 *Ficha completa e inscripción aquí:*\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101d] border-2 border-[#00e676]/40 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl shadow-[#00e676]/10 overflow-hidden">
        
        {/* CABECERA DEL MODAL */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-[#0d1527] via-[#09101d] to-[#0d1527]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black border-2 border-[#ef4444] p-1.5 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#ef4444]/20">
              <Image
                src={tournament.bannerImageUrl || '/logos/logo-mdq.png'}
                alt={tournament.title}
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  tournament.type === 'PRESENCIAL' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  {tournament.type === 'PRESENCIAL' ? '📍 Presencial (En Club)' : '🌐 Online (WebRTC)'}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  competitionModeLabels[tournament.competitionMode || 'STANDALONE_DAY']?.badge || 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {competitionModeLabels[tournament.competitionMode || 'STANDALONE_DAY']?.label}
                </span>

                {tournament.pointsMultiplier === 2 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black border border-amber-300 flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>⚡ x2 Puntos Oficiales</span>
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-xl font-black text-white leading-tight">
                {tournament.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR DE PESTAÑAS (MODALIDAD vs INSCRIPTOS) */}
        <div className="flex border-b border-slate-800 bg-[#080c16] px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('MODALITY')}
            className={`flex items-center gap-2 px-4 py-2.5 font-black text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'MODALITY'
                ? 'border-[#00e676] text-[#00e676]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Detalle de Modalidad &amp; Reglas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PLAYERS')}
            className={`flex items-center gap-2 px-4 py-2.5 font-black text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'PLAYERS'
                ? 'border-[#00e676] text-[#00e676]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Jugadores Inscriptos ({enrolledPlayers.length})</span>
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'MODALITY' ? (
            /* ========================================================================= */
            /* PESTAÑA A: DETALLE DE MODALIDAD, SEDE, REGLAS Y PREMIOS                  */
            /* ========================================================================= */
            <div className="space-y-5">
              {/* DESCRIPCIÓN OFICIAL */}
              {tournament.description && (
                <div className="p-3.5 rounded-2xl bg-[#111622] border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white block mb-1">Descripción Oficial del Certamen:</span>
                  {tournament.description}
                </div>
              )}

              {/* GRID DE PARÁMETROS TÉCNICOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* 1. FORMATO DE COMPETICIÓN */}
                <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <Trophy className="w-3.5 h-3.5 text-[#00e676]" />
                    <span>Formato de Competición</span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {formatLabels[tournament.format] || tournament.format}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tournament.format === 'DOUBLE_ELIMINATION' 
                      ? 'Winners, Losers & Gran Final' 
                      : tournament.format === 'ROUND_ROBIN'
                      ? `${tournament.groupsCount || 2} grupos clasificando a playoffs`
                      : 'Llave directa a eliminación'}
                  </div>
                </div>

                {/* 2. MODALIDAD DE JUEGO */}
                <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-[#ef4444]" />
                    <span>Modalidad de Competición</span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {isDoubles ? 'Parejas (2 vs 2)' : 'Individual (1 vs 1)'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    501 Double Out (Doble Cierre Oficial)
                  </div>
                </div>

                {/* 3. DISTANCIA EN LEGS */}
                <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Distancia de Partidas</span>
                  </div>
                  <div className="text-sm font-black text-white">
                    Base: Mejor de {tournament.bestOfLegs} legs
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tournament.roundLegsConfig?.quarterFinals 
                      ? `Cuartos: ${tournament.roundLegsConfig.quarterFinals} • Semis: ${tournament.roundLegsConfig.semiFinals || 4} • Final: ${tournament.roundLegsConfig.finals || 5}` 
                      : `Primero a ${Math.ceil(tournament.bestOfLegs / 2)} legs`}
                  </div>
                </div>

                {/* 4. SEDE Y UBICACIÓN */}
                <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Sede Oficial</span>
                  </div>
                  <div className="text-sm font-black text-white truncate" title={tournament.venueName}>
                    {tournament.venueName || 'Sociedad de Fomento Nueva Pompeya'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tournament.city || 'Mar del Plata'}, {tournament.province || 'Buenos Aires'}
                  </div>
                </div>

                {/* 5. FECHA Y CALENDARIO */}
                <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Fecha &amp; Horario</span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {tournament.startDate 
                      ? new Date(tournament.startDate).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) 
                      : 'Próximamente'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tournament.startDate ? new Date(tournament.startDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'Hora a confirmar'} hs
                  </div>
                </div>

                {/* 6. PREMIOS Y ARANCEL */}
                <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5 text-[#00e676]" />
                    <span>Premios &amp; Inscripción</span>
                  </div>
                  {tournament.isPaid && tournament.prizePoolArs && tournament.prizePoolArs > 0 ? (
                    <>
                      <div className="text-sm font-black text-[#00e676]">
                        ${tournament.prizePoolArs.toLocaleString('es-AR')} ARS
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Inscripción: ${tournament.entryFeeArs?.toLocaleString('es-AR') || 0} ARS (60-30-10)
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-black text-emerald-400">
                        🎉 Gratuito
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Trofeos, medallas y puntos federados
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* BARRA DE CUPOS DISPONIBLES */}
              <div className="p-4 rounded-2xl bg-[#07090e] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00e676]" />
                    <span className="font-black text-white">Cupo de Competidores Acreditados:</span>
                  </div>
                  <div className="font-mono font-bold text-white">
                    <span className="text-[#00e676]">{enrolledCount}</span> / {maxParticipants} participantes ({Math.round((enrolledCount / maxParticipants) * 100)}%)
                  </div>
                </div>
                <div className="w-full bg-[#111622] h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-[#00e676] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (enrolledCount / maxParticipants) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* PESTAÑA B: LISTADO COMPLETO DE JUGADORES INSCRIPTOS                      */
            /* ========================================================================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#00e676]" />
                    <span>Padrón de Competidores Acreditados ({enrolledPlayers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lista oficial de jugadores registrados para disputar las pistas del torneo
                  </p>
                </div>
              </div>

              {enrolledPlayers.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl bg-[#07090e] border border-dashed border-slate-800 space-y-3">
                  <Users className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="text-sm font-black text-slate-300">
                    Aún no hay competidores inscriptos en este torneo.
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Sé el primero en sumarte al padrón de competencia oficial completando la acreditación.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {enrolledPlayers.map((player, idx) => {
                    const avg = player.avg || 45.0;
                    const catKey = calculateCategory(avg);
                    const catInfo = CATEGORY_DETAILS[catKey];

                    return (
                      <div
                        key={player.id || idx}
                        className="p-3 rounded-2xl bg-[#07090e] border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Número de Siembra / Orden */}
                          <div className="w-6 text-center font-mono text-xs font-black text-slate-500 flex-shrink-0">
                            #{player.seed || idx + 1}
                          </div>

                          {/* Avatar / Silueta */}
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-black border border-slate-700">
                            <Image
                              src={player.avatarUrl || '/logos/logo-mdq.png'}
                              alt={player.name}
                              fill
                              className="object-contain"
                            />
                          </div>

                          {/* Nombre y Apodo */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-xs font-black text-white truncate">
                                {player.name}
                              </span>
                              <span className="text-sm select-none" title={player.nationality || 'Argentina'}>
                                {getCountryFlag(player.countryCode || player.nationality || 'AR')}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-[#00e676] truncate">
                              &ldquo;{player.nickname || player.name}&rdquo;
                            </div>
                            {isDoubles && (player as any).partnerName && (
                              <div className="text-[10px] text-amber-400 truncate">
                                Dupla con: {(player as any).partnerName}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AVG y Categoría */}
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono text-xs font-black text-white">
                            {avg.toFixed(1)} <span className="text-[10px] text-slate-500">AVG</span>
                          </div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${catInfo.badgeClass}`}>
                            {catInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PIE DEL MODAL CON ACCIONES */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#080c16] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Botón Copiar Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#00e676]" />}
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Link'}</span>
            </button>

            {/* Botón WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 transition-colors"
              title="Compartir por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Ver Llave / Cuadro */}
            {onViewBracketClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewBracketClick(tournament);
                }}
                className="px-4 py-2 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-white font-black text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4 text-[#00e676]" />
                <span>Ver Llave y Cruces</span>
              </button>
            )}

            {/* Inscribirme al Torneo (Si no está anotado y la inscripción está abierta) */}
            {onEnrollClick && tournament.status === 'REGISTRATION_OPEN' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEnrollClick(tournament);
                }}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all ${
                  isUserEnrolled
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 cursor-default'
                    : 'bg-[#00e676] hover:bg-[#00c853] text-black shadow-[#00e676]/20'
                }`}
              >
                {isUserEnrolled ? (
                  <>
                    <Check className="w-4 h-4 text-[#00e676]" />
                    <span>Ya Estás Inscripto</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>+ Inscribirme a este Torneo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
