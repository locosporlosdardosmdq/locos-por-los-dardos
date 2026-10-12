'use client';

import React from 'react';
import Image from 'next/image';
import { TournamentPodium, PodiumPlace } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { Trophy, Award, Medal, Crown } from 'lucide-react';

interface TournamentPodiumViewProps {
  podium?: TournamentPodium;
  prizesBreakdown?: {
    first: number;
    second: number;
    third: number;
  };
  onSelectPlayer?: (playerIdOrName: string, playerName?: string) => void;
  className?: string;
}

export const TournamentPodiumView: React.FC<TournamentPodiumViewProps> = ({
  podium,
  prizesBreakdown,
  onSelectPlayer,
  className = ''
}) => {
  if (!podium || (!podium.first && !podium.second && !podium.third)) {
    return null;
  }

  const renderCard = (
    place: PodiumPlace | undefined,
    rank: 1 | 2 | 3,
    prizeAmount?: number
  ) => {
    const config = {
      1: {
        title: '1º Puesto • Campeón',
        tag: 'ORO',
        icon: Crown,
        borderColor: 'border-[#ffd700]',
        bgGlow: 'shadow-[#ffd700]/15',
        headerBg: 'bg-gradient-to-r from-[#ffd700]/25 via-[#ffec8b]/15 to-transparent',
        badgeBg: 'bg-[#ffd700] text-[#07090e]',
        avatarRing: 'ring-[#ffd700]',
        trophyColor: 'text-[#ffd700]'
      },
      2: {
        title: '2º Puesto • Subcampeón',
        tag: 'PLATA',
        icon: Medal,
        borderColor: 'border-slate-300',
        bgGlow: 'shadow-slate-300/10',
        headerBg: 'bg-gradient-to-r from-slate-300/20 via-slate-400/10 to-transparent',
        badgeBg: 'bg-slate-300 text-[#07090e]',
        avatarRing: 'ring-slate-300',
        trophyColor: 'text-slate-300'
      },
      3: {
        title: '3º Puesto • Podio',
        tag: 'BRONCE',
        icon: Award,
        borderColor: 'border-[#cd7f32]',
        bgGlow: 'shadow-[#cd7f32]/10',
        headerBg: 'bg-gradient-to-r from-[#cd7f32]/20 via-[#d2691e]/10 to-transparent',
        badgeBg: 'bg-[#cd7f32] text-white',
        avatarRing: 'ring-[#cd7f32]',
        trophyColor: 'text-[#cd7f32]'
      }
    }[rank];

    const Icon = config.icon;

    if (!place) {
      return (
        <div
          className={`flex-1 min-w-[240px] rounded-2xl border border-dashed border-slate-800 bg-[#07090e]/60 p-4 flex flex-col items-center justify-center text-center opacity-60 min-h-[190px]`}
        >
          <Icon className={`w-8 h-8 ${config.trophyColor} opacity-40 mb-2`} />
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {config.title}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">Por definir en el torneo</span>
        </div>
      );
    }

    return (
      <div
        onClick={() => {
          if (onSelectPlayer && place.id) {
            onSelectPlayer(place.id, place.name);
          }
        }}
        className={`flex-1 min-w-[260px] rounded-3xl border ${config.borderColor} bg-[#0c101c] p-4.5 shadow-xl ${config.bgGlow} transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden group`}
      >
        {/* Top Header */}
        <div className={`-mx-4.5 -mt-4.5 px-4.5 py-2.5 ${config.headerBg} border-b ${config.borderColor}/30 flex items-center justify-between mb-3.5`}>
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.trophyColor}`} />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {config.title}
            </span>
          </div>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${config.badgeBg}`}>
            {config.tag}
          </span>
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-black ring-2 ${config.avatarRing} relative`}>
              {place.avatarUrl ? (
                <Image
                  src={place.avatarUrl}
                  alt={place.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-black text-lg">
                  {place.name.slice(0, 1)}
                </div>
              )}
            </div>
            {rank === 1 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ffd700] text-[#07090e] p-1 rounded-full shadow-md">
                <Crown className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-black text-white truncate group-hover:text-[#00e676] transition-colors">
              {place.name}
            </h4>
            {place.scoreDisplay && (
              <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="text-slate-500">Marcador:</span>
                <span className="font-bold text-white bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                  {place.scoreDisplay}
                </span>
              </div>
            )}
            {prizeAmount !== undefined && prizeAmount > 0 && (
              <div className="text-[11px] font-mono font-bold text-[#00e676] mt-1 flex items-center gap-1">
                <span>Premio:</span>
                <span>${prizeAmount.toLocaleString('es-AR')} ARS</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-3.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Trophy className={`w-3 h-3 ${config.trophyColor}`} />
            <span>Medalla Oficial</span>
          </span>
          <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
            Ver ficha deportiva &rarr;
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full bg-[#07090e] border border-slate-800/90 rounded-3xl p-5 space-y-4 shadow-2xl ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ffd700]/15 text-[#ffd700] border border-[#ffd700]/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-wide">
              Podio Oficial de Premiación
            </h3>
            <p className="text-xs text-slate-400">
              Posiciones finales del certamen (1º Oro • 2º Plata • 3º Bronce)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/30">
          Challonge / N01 Standard
        </span>
      </div>

      {/* Podium Cards Grid (2º a la izquierda, 1º al centro más alto, 3º a la derecha) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* 2º Puesto (Plata) */}
        <div className="order-2 md:order-1">
          {renderCard(podium.second, 2, prizesBreakdown?.second)}
        </div>

        {/* 1º Puesto (Oro - Campeón) */}
        <div className="order-1 md:order-2 md:-translate-y-2">
          {renderCard(podium.first, 1, prizesBreakdown?.first)}
        </div>

        {/* 3º Puesto (Bronce) */}
        <div className="order-3 md:order-3">
          {renderCard(podium.third, 3, prizesBreakdown?.third)}
        </div>
      </div>
    </div>
  );
};
