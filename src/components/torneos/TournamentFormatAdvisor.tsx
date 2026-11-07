'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Trophy, 
  Users, 
  Zap, 
  Repeat, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Target,
  ShieldAlert
} from 'lucide-react';

export interface FormatRecommendation {
  id: 'GROUPS' | 'DOUBLE_ELIM' | 'SINGLE_ELIM';
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN';
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  groupsCount?: number;
  qualifiersPerGroup?: number;
  totalMatches: number;
  minMatchesPerPlayer: number;
  byesInBracket: number;
  estimatedMinutes2Boards: number;
  perks: string[];
  isCurrentFormat: boolean;
}

export type TournamentFormatRecommendation = FormatRecommendation;

interface TournamentFormatAdvisorProps {
  enrolledCount: number;
  currentFormat: string;
  groupsCount?: number;
  qualifiersPerGroup?: number;
  currentGroupsCount?: number;
  currentQualifiersPerGroup?: number;
  onApplyFormat?: (rec: FormatRecommendation) => void;
  onApplyRecommendation?: (rec: FormatRecommendation) => void;
  isAdmin?: boolean;
}

export const TournamentFormatAdvisor: React.FC<TournamentFormatAdvisorProps> = ({
  enrolledCount,
  currentFormat,
  groupsCount,
  qualifiersPerGroup,
  currentGroupsCount,
  currentQualifiersPerGroup,
  onApplyFormat,
  onApplyRecommendation,
  isAdmin = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const applyHandler = onApplyFormat || onApplyRecommendation;

  const recommendations = useMemo<FormatRecommendation[]>(() => {
    const N = enrolledCount;
    if (N < 3) return [];

    const recs: FormatRecommendation[] = [];

    // --- RECOMENDACIÓN 1: IDEAL DEPORTIVA (CERO BYES) ---
    // Determinación de grupos ideales:
    let idealGroups = 2;
    let idealQualifiers = 2;

    if (N === 4) {
      idealGroups = 1;
      idealQualifiers = 4;
    } else if (N === 6) {
      idealGroups = 2; // 2 zonas de 3
      idealQualifiers = 2; // pasan 4 a Semifinales
    } else if (N === 8) {
      idealGroups = 2; // 2 zonas de 4
      idealQualifiers = 2; // pasan 4 a Semifinales
    } else if (N === 9) {
      idealGroups = 3; // 3 zonas de 3
      idealQualifiers = 2; // pasan 6 (2 byes) o 2 zonas de 5/4
    } else if (N === 10) {
      idealGroups = 2; // 2 zonas de 5
      idealQualifiers = 2; // pasan 4 a Semifinales (0 Byes)
    } else if (N === 12) {
      idealGroups = 4; // 4 zonas de 3
      idealQualifiers = 2; // pasan 8 a Cuartos de Final (0 Byes)
    } else if (N >= 14 && N <= 16) {
      idealGroups = 4; // 4 zonas de 4
      idealQualifiers = 2; // pasan 8 a Cuartos
    }

    // Partidos en fase de grupos: suma de n*(n-1)/2 por zona
    const basePerGroup = Math.floor(N / idealGroups);
    const extra = N % idealGroups;
    let groupMatchesCount = 0;
    for (let g = 0; g < idealGroups; g++) {
      const size = g < extra ? basePerGroup + 1 : basePerGroup;
      groupMatchesCount += (size * (size - 1)) / 2;
    }

    const totalPlayoffQualifiers = idealGroups * idealQualifiers;
    const playoffMatchesCount = totalPlayoffQualifiers > 1 ? totalPlayoffQualifiers - 1 : 0;
    const totalGroupsMatches = groupMatchesCount + playoffMatchesCount;

    const isGroupsCurrent = currentFormat === 'ROUND_ROBIN' && groupsCount === idealGroups;

    recs.push({
      id: 'GROUPS',
      format: 'ROUND_ROBIN',
      badge: '🥇 Opción Ideal Deportiva',
      badgeColor: 'bg-emerald-500/20 text-[#00e676] border-emerald-500/40',
      title: `Fase de Grupos (${idealGroups} Zonas) + Playoffs`,
      subtitle: `${idealGroups} zonas de ${basePerGroup}${extra > 0 ? `-${basePerGroup + 1}` : ''} jugadores • Clasifican los ${idealQualifiers} primeros`,
      groupsCount: idealGroups,
      qualifiersPerGroup: idealQualifiers,
      totalMatches: totalGroupsMatches,
      minMatchesPerPlayer: basePerGroup - 1,
      byesInBracket: 0,
      estimatedMinutes2Boards: Math.round((totalGroupsMatches * 15) / 2),
      perks: [
        'Cero Byes en la llave eliminatoria (Playoffs puros)',
        `Todos los jugadores juegan mínimo ${basePerGroup - 1} partidos garantizados`,
        'Incentiva la permanencia y consumo en el club'
      ],
      isCurrentFormat: isGroupsCurrent
    });

    // --- RECOMENDACIÓN 2: DOBLE ELIMINACIÓN NAKKA (DOBLE VIDA) ---
    const bracketSize = N <= 4 ? 4 : N <= 8 ? 8 : N <= 16 ? 16 : 32;
    const byesDE = bracketSize - N;
    // En doble eliminación para N jugadores, total matches aprox es 2*N - 2 (o bracketSize*2 - 2 con byes reducidos)
    const deMatchesCount = Math.max(N * 2 - 2, N + 3);
    const isDeCurrent = currentFormat === 'DOUBLE_ELIMINATION';

    recs.push({
      id: 'DOUBLE_ELIM',
      format: 'DOUBLE_ELIMINATION',
      badge: '🥈 Doble Vida (Estilo Nakka N01)',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      title: 'Doble Eliminación (Winners + Losers)',
      subtitle: `Cuadro de ${bracketSize} con repesca • Emparejamiento Compacto en R1 y R2`,
      totalMatches: deMatchesCount,
      minMatchesPerPlayer: 2,
      byesInBracket: byesDE,
      estimatedMinutes2Boards: Math.round((deMatchesCount * 14) / 2),
      perks: [
        'Segunda oportunidad garantizada (mínimo 2 derrotas para quedar fuera)',
        'Emparejamiento compacto: Byes juegan de inmediato en Ronda 2',
        'Estándar oficial competitivo de Nakka N01 y Challonge'
      ],
      isCurrentFormat: isDeCurrent
    });

    // --- RECOMENDACIÓN 3: ELIMINACIÓN SIMPLE DIRECTA (MÁXIMA VELOCIDAD) ---
    const seMatchesCount = N - 1;
    const isSeCurrent = currentFormat === 'SINGLE_ELIMINATION';

    recs.push({
      id: 'SINGLE_ELIM',
      format: 'SINGLE_ELIMINATION',
      badge: '🥉 Cierre Rápido / Knockout',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      title: 'Eliminación Simple Directa',
      subtitle: `${seMatchesCount} partidos en total • Mínima duración para torneos nocturnos`,
      totalMatches: seMatchesCount,
      minMatchesPerPlayer: 1,
      byesInBracket: byesDE,
      estimatedMinutes2Boards: Math.round((seMatchesCount * 14) / 2),
      perks: [
        `Finaliza en apenas ~${Math.round((seMatchesCount * 14) / 2)} minutos en 2 dianas`,
        'Llave compacta con máxima cantidad de cruces en paralelo',
        'Ideal si el torneo comenzó tarde o se dispone de poco tiempo'
      ],
      isCurrentFormat: isSeCurrent
    });

    return recs;
  }, [enrolledCount, currentFormat, groupsCount, qualifiersPerGroup]);

  if (enrolledCount < 3 || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#0a0f1d] border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 transition-all">
      {/* Cabecera del Asesor */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#00e676]/20 border border-[#00e676]/40 flex items-center justify-center text-[#00e676] shadow-md shadow-[#00e676]/10 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Asesor Inteligente de Formato de Torneo</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {enrolledCount} inscriptos actuales
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Lógica matemática competitiva inspirada en Challonge y Nakka N01 para optimizar tiempos y partidos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-xl bg-[#111622] hover:bg-[#1a2234] text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title={isExpanded ? 'Contraer recomendaciones' : 'Expandir recomendaciones'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Grilla de Recomendaciones */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all relative ${
                rec.isCurrentFormat
                  ? 'bg-[#0f172a] border-[#00e676] shadow-lg shadow-[#00e676]/10 ring-1 ring-[#00e676]/50'
                  : 'bg-[#111622]/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2.5">
                {/* Badges superiores */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${rec.badgeColor}`}>
                    {rec.badge}
                  </span>
                  {rec.isCurrentFormat && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#00e676] text-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Activo</span>
                    </span>
                  )}
                </div>

                {/* Título y subtítulo */}
                <div>
                  <h5 className="text-sm font-black text-white">{rec.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rec.subtitle}</p>
                </div>

                {/* Métricas clave */}
                <div className="grid grid-cols-2 gap-1.5 py-2 border-y border-slate-800/80 text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Trophy className="w-3.5 h-3.5 text-[#00e676] shrink-0" />
                    <span><strong>{rec.totalMatches}</strong> partidos tot.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Mín. <strong>{rec.minMatchesPerPlayer}</strong> pj/jugador</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>~{rec.estimatedMinutes2Boards} min (2 dianas)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Target className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{rec.byesInBracket === 0 ? '0 Byes (Puro)' : `${rec.byesInBracket} Byes compactos`}</span>
                  </div>
                </div>

                {/* Ventajas */}
                <ul className="space-y-1 text-[10px] text-slate-300">
                  {rec.perks.map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#00e676] font-bold">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de Aplicación (Solo Administradores) */}
              <div className="pt-3 mt-3 border-t border-slate-800/80">
                {isAdmin && applyHandler ? (
                  <button
                    type="button"
                    onClick={() => applyHandler(rec)}
                    disabled={rec.isCurrentFormat}
                    className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      rec.isCurrentFormat
                        ? 'bg-slate-800 text-slate-400 cursor-default opacity-80'
                        : rec.id === 'GROUPS'
                        ? 'bg-[#00e676] hover:bg-[#00c853] text-black shadow-[#00e676]/20'
                        : rec.id === 'DOUBLE_ELIM'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
                  >
                    <span>{rec.isCurrentFormat ? 'Formato Actual en Uso' : `✨ Aplicar ${rec.title}`}</span>
                    {!rec.isCurrentFormat && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <div className="text-center text-[10px] text-slate-500 italic">
                    Formato sugerido para organizadores
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
