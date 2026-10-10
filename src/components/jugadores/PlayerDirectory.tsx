'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ARGENTINE_PROVINCES, PLAYER_CATEGORIES } from '@/lib/constants';
import { 
  Users, 
  Search, 
  MapPin, 
  Trophy, 
  Flame, 
  Target, 
  ShieldCheck, 
  ArrowUpRight,
  Filter,
  Medal,
  Activity
} from 'lucide-react';

interface PlayerCardData {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  province: string;
  city: string;
  club: string;
  avg: number;
  category: 'ELITE' | 'AVANZADA' | 'INTERMEDIA' | 'PRINCIPIANTE';
  matchesWon: number;
  matchesTotal: number;
  count180s: number;
  highestCheckout: number;
  isVerified: boolean;
}

const MOCK_PLAYERS: PlayerCardData[] = [
  {
    id: 'p-1',
    name: 'Facundo López',
    nickname: 'El Halcón MDQ',
    avatarUrl: '/logos/logo-mdq.png',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    club: 'Darderos Mar del Plata',
    avg: 74.8,
    category: 'ELITE',
    matchesWon: 42,
    matchesTotal: 48,
    count180s: 38,
    highestCheckout: 161,
    isVerified: true
  },
  {
    id: 'p-2',
    name: 'Martín Rossi',
    nickname: 'Sniper CABA',
    avatarUrl: '/logos/dardos-argentina.png',
    province: 'CABA',
    city: 'Buenos Aires',
    club: 'Dardos Capital',
    avg: 71.2,
    category: 'ELITE',
    matchesWon: 36,
    matchesTotal: 44,
    count180s: 29,
    highestCheckout: 156,
    isVerified: true
  },
  {
    id: 'p-3',
    name: 'Diego Gómez',
    nickname: 'Tungsteno Rosario',
    avatarUrl: '/logos/dardos-argentina.png',
    province: 'Santa Fe',
    city: 'Rosario',
    club: 'Rosario Darts Club',
    avg: 66.5,
    category: 'AVANZADA',
    matchesWon: 29,
    matchesTotal: 38,
    count180s: 21,
    highestCheckout: 140,
    isVerified: true
  },
  {
    id: 'p-4',
    name: 'Lucas Pereyra',
    nickname: 'Bullseye Córdoba',
    avatarUrl: '/logos/dardos-argentina.png',
    province: 'Córdoba',
    city: 'Córdoba Capital',
    club: 'Córdoba Dardos Asoc.',
    avg: 63.8,
    category: 'AVANZADA',
    matchesWon: 25,
    matchesTotal: 34,
    count180s: 18,
    highestCheckout: 130,
    isVerified: true
  },
  {
    id: 'p-5',
    name: 'Carlos Méndez',
    nickname: 'Charly 180 MDQ',
    avatarUrl: '/logos/logo-mdq.png',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    club: 'Darderos Mar del Plata',
    avg: 59.4,
    category: 'AVANZADA',
    matchesWon: 22,
    matchesTotal: 31,
    count180s: 16,
    highestCheckout: 121,
    isVerified: true
  },
  {
    id: 'p-6',
    name: 'Rodrigo Morales',
    nickname: 'El Rayo Cuyano',
    avatarUrl: '/logos/dardos-argentina.png',
    province: 'Mendoza',
    city: 'Godoy Cruz',
    club: 'Cuyo Darts',
    avg: 52.1,
    category: 'INTERMEDIA',
    matchesWon: 18,
    matchesTotal: 29,
    count180s: 11,
    highestCheckout: 116,
    isVerified: false
  },
  {
    id: 'p-7',
    name: 'Joaquín Benítez',
    nickname: 'Tiro Certero',
    avatarUrl: '/logos/dardos-argentina.png',
    province: 'Neuquén',
    city: 'Neuquén',
    club: 'Patagonia Dardos',
    avg: 48.7,
    category: 'INTERMEDIA',
    matchesWon: 14,
    matchesTotal: 26,
    count180s: 7,
    highestCheckout: 104,
    isVerified: false
  },
  {
    id: 'p-8',
    name: 'Esteban Navarro',
    nickname: 'Doble 20 Litoral',
    avatarUrl: '/logos/dardos-argentina.png',
    province: 'Entre Ríos',
    city: 'Paraná',
    club: 'Litoral Darts',
    avg: 43.5,
    category: 'INTERMEDIA',
    matchesWon: 11,
    matchesTotal: 22,
    count180s: 5,
    highestCheckout: 96,
    isVerified: false
  },
  {
    id: 'p-9',
    name: 'Mariano Silva',
    nickname: 'Flecha MDQ',
    avatarUrl: '/logos/logo-mdq.png',
    province: 'Buenos Aires',
    city: 'Mar del Plata',
    club: 'Darderos Mar del Plata',
    avg: 38.2,
    category: 'PRINCIPIANTE',
    matchesWon: 7,
    matchesTotal: 18,
    count180s: 2,
    highestCheckout: 80,
    isVerified: false
  }
];

export const PlayerDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('TODAS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  const filteredPlayers = useMemo(() => {
    return MOCK_PLAYERS.filter((player) => {
      const matchesSearch = 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.club.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProvince = selectedProvince === 'TODAS' || player.province === selectedProvince;
      const matchesCategory = selectedCategory === 'TODAS' || player.category === selectedCategory;

      return matchesSearch && matchesProvince && matchesCategory;
    });
  }, [searchTerm, selectedProvince, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Filtros y Buscador */}
      <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Barra de Búsqueda */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apodo o club..."
            className="w-full bg-[#07090e] border border-[#1e2638] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e676]"
          />
        </div>

        {/* Selectores Provincia & Categoría */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Selector de Provincia */}
          <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1e2638] rounded-2xl px-3 py-2 text-xs">
            <MapPin className="w-4 h-4 text-[#00e676]" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none"
            >
              <option value="TODAS">Toda la Argentina</option>
              {ARGENTINE_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Categoría */}
          <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1e2638] rounded-2xl px-3 py-2 text-xs">
            <Trophy className="w-4 h-4 text-[#0284c7]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none"
            >
              <option value="TODAS">Todas las Categorías</option>
              <option value="ELITE">Elite Pro (70+ AVG)</option>
              <option value="AVANZADA">Avanzada (55-69.9)</option>
              <option value="INTERMEDIA">Intermedia (40-54.9)</option>
              <option value="PRINCIPIANTE">Principiante (0-39.9)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Métricas Generales */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Mostrando <strong>{filteredPlayers.length}</strong> jugadores registrados</span>
        <span className="flex items-center gap-1 text-[#00e676]">
          <ShieldCheck className="w-4 h-4" />
          <span>Federación Oficial Locos por los Dardos & Darderos MDQ</span>
        </span>
      </div>

      {/* Grilla de Jugadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const winRate = Math.round((player.matchesWon / player.matchesTotal) * 100);
          const catConfig = PLAYER_CATEGORIES[player.category];

          return (
            <div
              key={player.id}
              className="bg-[#0f1422] border border-[#1e2638] hover:border-[#00e676]/60 rounded-3xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between group"
            >
              {/* Header de Tarjeta */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#07090e] border border-[#1e2638] flex items-center justify-center font-black text-sm text-[#00e676] overflow-hidden flex-shrink-0">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-white text-sm truncate">
                          {player.name}
                        </h3>
                        {player.isVerified && (
                          <span title="Jugador Verificado">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00e676] flex-shrink-0" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#00e676] font-bold block truncate">
                        &quot;{player.nickname}&quot;
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${catConfig.badgeClass}`}>
                    {catConfig.label}
                  </span>
                </div>

                {/* Ubicación y Club */}
                <div className="text-xs text-slate-400 space-y-1 mb-4 pb-3 border-b border-[#1e2638]">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{player.city}, {player.province}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Club: <strong className="text-slate-300">{player.club}</strong>
                  </p>
                </div>

                {/* Estadísticas Clave */}
                <div className="grid grid-cols-4 gap-2 text-center py-2 bg-[#07090e] rounded-2xl border border-[#1e2638] mb-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">AVG</span>
                    <strong className="text-sm font-black text-[#00e676] font-mono">
                      {player.avg.toFixed(1)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">180s</span>
                    <strong className="text-sm font-black text-[#ef4444] font-mono">
                      {player.count180s}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Max Out</span>
                    <strong className="text-sm font-black text-[#0284c7] font-mono">
                      {player.highestCheckout}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Win %</span>
                    <strong className="text-sm font-black text-amber-400 font-mono">
                      {winRate}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href="/anotador"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs text-center uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                >
                  Desafiar
                </Link>
                <Link
                  href="/perfil"
                  className="py-2 px-3 rounded-xl bg-[#131929] hover:bg-[#1c263d] text-slate-300 hover:text-white font-bold text-xs border border-[#1e2638] transition-all flex items-center gap-1"
                >
                  <span>Ficha</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
