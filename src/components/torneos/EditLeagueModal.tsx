'use client';

import React, { useState, useEffect } from 'react';
import { League, LeagueScope } from '@/lib/types';
import { ARGENTINE_PROVINCES } from '@/lib/constants';
import { 
  X, 
  Trophy, 
  Shield, 
  MapPin, 
  Calendar, 
  Flame, 
  Save, 
  Building2,
  FileText
} from 'lucide-react';

interface EditLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League | null;
  onSaveLeague: (updatedLeague: League) => void;
}

export const EditLeagueModal: React.FC<EditLeagueModalProps> = ({
  isOpen,
  onClose,
  league,
  onSaveLeague
}) => {
  if (!isOpen || !league) return null;

  const [name, setName] = useState(league.name);
  const [season, setSeason] = useState(league.season);
  const [scope, setScope] = useState<LeagueScope>(league.scope);
  const [organizerClub, setOrganizerClub] = useState(league.organizerClub);
  const [city, setCity] = useState(league.city || '');
  const [province, setProvince] = useState(league.province || 'Buenos Aires');
  const [description, setDescription] = useState(league.description);
  const [doublePointsOnPresential, setDoublePointsOnPresential] = useState(
    league.doublePointsOnPresential ?? true
  );

  useEffect(() => {
    if (league) {
      setName(league.name);
      setSeason(league.season);
      setScope(league.scope);
      setOrganizerClub(league.organizerClub);
      setCity(league.city || '');
      setProvince(league.province || 'Buenos Aires');
      setDescription(league.description);
      setDoublePointsOnPresential(league.doublePointsOnPresential ?? true);
    }
  }, [league]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('El nombre de la liga es obligatorio.');
      return;
    }

    const updatedLeague: League = {
      ...league,
      name: name.trim(),
      season: season.trim() || '2026',
      scope,
      organizerClub: organizerClub.trim() || 'Dardos Argentina',
      city: city.trim(),
      province: province.trim(),
      description: description.trim(),
      isOfficialNational: scope === 'NATIONAL',
      doublePointsOnPresential
    };

    onSaveLeague(updatedLeague);
    onClose();
  };

  const isNational = scope === 'NATIONAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101d] border-2 border-amber-500/40 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#080c16]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Editar Configuración de la Liga</span>
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste de nombres, temporada, sede organizadora y reglas de puntuación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Nombre y Temporada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">Nombre Oficial de la Liga *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Liga Marplatense de Dardos 2026"
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Temporada</span>
              </label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="2026"
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Ámbito y Club Organizador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Ámbito Federativo</span>
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as LeagueScope)}
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="LOCAL">📍 Liga Local (Club / Ciudad)</option>
                <option value="NATIONAL">🇦🇷 Liga Nacional Oficial (Circuito Federal)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#00e676]" />
                <span>Club o Entidad Organizadora</span>
              </label>
              <input
                type="text"
                value={organizerClub}
                onChange={(e) => setOrganizerClub(e.target.value)}
                placeholder="Ej: Darderos Mar del Plata"
                className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Sede Geográfica */}
          <div className="bg-[#0f1422] p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <MapPin className="w-4 h-4 text-[#ef4444]" />
              <span>Sede Principal de la Liga</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Ciudad Sede</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mar del Plata"
                  className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Provincia</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#07090e] border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold"
                >
                  {ARGENTINE_PROVINCES.map((prov: string) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Descripción / Reglamento */}
          <div>
            <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Descripción y Pautas de la Liga</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla el formato, fechas, cantidad de torneos computables o condiciones de clasificación..."
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
            />
          </div>

          {/* Puntos dobles en presenciales */}
          <div className="bg-[#0f1422] p-3.5 rounded-2xl border border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={doublePointsOnPresential}
                onChange={(e) => setDoublePointsOnPresential(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Duplicar Puntos en Fechas Presenciales Oficiales (⚡ x2 Pts)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Los torneos presenciales asignados a esta liga sumarán el doble de puntos al ranking acumulado para incentivar la asistencia al club.
                </p>
              </div>
            </label>
          </div>

          {/* Footer de Acciones */}
          <div className="p-4 bg-[#080c16] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
