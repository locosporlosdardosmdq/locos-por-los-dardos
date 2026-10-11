'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { League, LeagueScope } from '@/lib/types';
import { PROVINCIAS_ARGENTINA } from '@/lib/constants';
import { Trophy, X, Shield, MapPin, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLeague: (league: League) => void;
  canCreateNational?: boolean;
}

export const CreateLeagueModal: React.FC<CreateLeagueModalProps> = ({
  isOpen,
  onClose,
  onCreateLeague,
  canCreateNational = false
}) => {
  const [name, setName] = useState('');
  const [scope, setScope] = useState<LeagueScope>('LOCAL');
  const [organizerClub, setOrganizerClub] = useState('Darderos Mar del Plata');
  const [city, setCity] = useState('Mar del Plata');
  const [province, setProvince] = useState('Buenos Aires');
  const [season, setSeason] = useState('Temporada 2026');
  const [description, setDescription] = useState('');
  const [doublePointsOnPresential, setDoublePointsOnPresential] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLeague: League = {
      id: `league-${Date.now()}`,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: name.trim(),
      scope,
      description: description.trim() || `Liga de dardos para la ${season}.`,
      season: season.trim() || 'Temporada 2026',
      organizerClub: organizerClub.trim() || 'Club de Dardos',
      city: city.trim(),
      province: province.trim(),
      isOfficialNational: scope === 'NATIONAL',
      doublePointsOnPresential,
      activeTournamentsCount: 0,
      createdAt: new Date().toISOString(),
      standings: []
    };

    onCreateLeague(newLeague);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-[#07090e] border-2 border-[#ffe600] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ffe600]/15 text-[#ffe600]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Crear Nueva Liga Oficial</h3>
              <p className="text-[11px] text-slate-400">
                Define una liga para agrupar torneos y acumular puntajes en su tabla de posiciones.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Nombre de la Liga */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">Nombre de la Liga *</label>
            <input
              type="text"
              required
              placeholder="Ej: Liga Marplatense 2026 • Darderos MDQ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#ffe600]"
            />
          </div>

          {/* Ámbito de la Liga (Local vs Nacional) */}
          <div>
            <label className="text-slate-300 font-bold block mb-1.5">Ámbito de la Liga</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('LOCAL')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  scope === 'LOCAL'
                    ? 'bg-[#ffe600]/10 border-[#ffe600] text-white ring-1 ring-[#ffe600]/40'
                    : 'bg-[#111622] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-[#ffe600]">
                  <Shield className="w-4 h-4" />
                  <span>Liga Local / Regional</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Para clubes, ciudades o sedes locales (ej: Mar del Plata, Rosario, Córdoba).
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('NATIONAL')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  scope === 'NATIONAL'
                    ? 'bg-[#38bdf8]/10 border-[#38bdf8] text-white ring-1 ring-[#38bdf8]/40'
                    : 'bg-[#111622] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-[#38bdf8]">
                  <Award className="w-4 h-4" />
                  <span>Liga Nacional Oficial</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Clasificatoria para torneos internacionales con fechas online y presenciales x2.
                </span>
              </button>
            </div>

            {/* Emblema Oficial asignado según el Ámbito */}
            <div className="mt-2 p-2.5 rounded-xl bg-[#07090e] border border-slate-800 flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg bg-black border border-slate-700 p-0.5 flex-shrink-0">
                <Image
                  src={scope === 'NATIONAL' ? '/logos/dardos-argentina.png' : '/logos/logo-mdq.png'}
                  alt={scope === 'NATIONAL' ? 'Dardos Argentina' : 'Darderos Mar del Plata'}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="leading-tight">
                <span className="text-[11px] font-black text-white block">
                  {scope === 'NATIONAL' ? 'Federación Oficial: Dardos Argentina' : 'Club Anfitrión Oficial: Darderos Mar del Plata'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {scope === 'NATIONAL' ? 'Circuito Nacional Federado & Clasificatoria Internacional' : 'Sede Oficial del Circuito Regional MDQ'}
                </span>
              </div>
            </div>
          </div>

          {/* Sede / Club y Temporada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Club / Sede Organizadora *</label>
              <input
                type="text"
                required
                value={organizerClub}
                onChange={(e) => setOrganizerClub(e.target.value)}
                placeholder="Ej: Darderos Mar del Plata"
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ffe600]"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Temporada</label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="Ej: Temporada 2026"
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ffe600]"
              />
            </div>
          </div>

          {/* Ciudad y Provincia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Mar del Plata"
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ffe600]"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Provincia</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ffe600]"
              >
                {PROVINCIAS_ARGENTINA.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-slate-300 font-bold block mb-1">Descripción o Reglas</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de las fechas oficiales, puntuaciones y requisitos..."
              className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ffe600] resize-none"
            />
          </div>

          {/* Toggle de Puntos Dobles para Fechas Presenciales */}
          <div className="p-3 rounded-2xl bg-[#111622] border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Duplicar puntos en fechas presenciales (x2)</span>
              </span>
              <p className="text-[10px] text-slate-400">
                Los torneos oficiales presenciales otorgarán el doble de puntos en la tabla para premiar la asistencia al oche.
              </p>
            </div>
            <input
              type="checkbox"
              checked={doublePointsOnPresential}
              onChange={(e) => setDoublePointsOnPresential(e.target.checked)}
              className="w-5 h-5 accent-[#00e676] rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-[#07090e] font-black text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            CREAR Y PUBLICAR LIGA
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
