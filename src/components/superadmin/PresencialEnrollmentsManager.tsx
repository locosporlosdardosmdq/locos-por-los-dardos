'use client';

import React, { useState, useMemo } from 'react';
import { GrandTournamentRegistration, Tournament } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { saveStoredGrandTournamentRegistrations } from '@/lib/storage';
import { 
  Users, 
  MapPin, 
  Calendar, 
  UtensilsCrossed, 
  Download, 
  Printer, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  AlertCircle,
  Dices,
  FileSpreadsheet,
  Trash2,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';

interface PresencialEnrollmentsManagerProps {
  registrations: GrandTournamentRegistration[];
  tournaments: Tournament[];
  onUpdateRegistrations?: (updated: GrandTournamentRegistration[]) => void;
}

export const PresencialEnrollmentsManager: React.FC<PresencialEnrollmentsManagerProps> = ({
  registrations: initialRegistrations,
  tournaments,
  onUpdateRegistrations
}) => {
  const [registrations, setRegistrations] = useState<GrandTournamentRegistration[]>(initialRegistrations);
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'BOTH_DAYS' | 'SATURDAY_ONLY' | 'SUNDAY_ONLY'>('ALL');
  const [dinnerFilter, setDinnerFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING'>('ALL');
  const [competitionFilter, setCompetitionFilter] = useState<'ALL' | 'SINGLES' | 'DOUBLES' | 'BOTH'>('ALL');

  // Mantener sincronizado si cambian las props iniciales
  React.useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  // Lista de Torneos Presenciales ordenados (Próxima fecha primero)
  const presencialTournaments = useMemo(() => {
    const presenciales = tournaments.filter(t => 
      t.type === 'PRESENCIAL' || 
      t.nationalStageType === 'PRESENCIAL_OFICIAL' ||
      t.title.toLowerCase().includes('open') ||
      t.title.toLowerCase().includes('mar del plata') ||
      t.title.toLowerCase().includes('pompeya')
    );

    // Si no hay ninguno creado explícitamente, creamos la referencia a la fecha oficial inmediata
    if (presenciales.length === 0) {
      return [
        {
          id: 'torneo-open-mdq-2026',
          title: 'Gran Open Mar del Plata 2026 • Pompeya Arena',
          startDate: '2026-10-25T10:00:00',
          status: 'REGISTRATION_OPEN' as const,
          city: 'Mar del Plata',
          venue: 'Sociedad de Fomento Nueva Pompeya'
        }
      ];
    }

    return presenciales;
  }, [tournaments]);

  // Identificar la Próxima Fecha Inmediata
  const nextPresencialTournament = presencialTournaments[0];

  // Filtrado de Registros
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // 1. Filtro por Torneo / Fecha
      if (selectedTournamentFilter !== 'ALL') {
        const matchesTourney = r.tournamentId === selectedTournamentFilter || 
          (!r.tournamentId && selectedTournamentFilter === 'torneo-open-mdq-2026');
        if (!matchesTourney) return false;
      }

      // 2. Buscador por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inName = r.fullName.toLowerCase().includes(q);
        const inNick = r.nickname.toLowerCase().includes(q);
        const inDni = r.dniOrPassport.toLowerCase().includes(q);
        const inCity = r.city.toLowerCase().includes(q);
        const inProv = r.province.toLowerCase().includes(q);
        const inCountry = r.nationality.toLowerCase().includes(q);
        const inClub = r.club.toLowerCase().includes(q);
        if (!inName && !inNick && !inDni && !inCity && !inProv && !inCountry && !inClub) {
          return false;
        }
      }

      // 3. Filtro por Jornadas
      if (attendanceFilter !== 'ALL' && r.attendanceDays !== attendanceFilter) {
        return false;
      }

      // 4. Filtro por Cena de Bienvenida Sábado
      if (dinnerFilter === 'YES' && (r.dinnerComensalesCount || 0) <= 0) return false;
      if (dinnerFilter === 'NO' && (r.dinnerComensalesCount || 0) > 0) return false;

      // 5. Filtro por Estado de Pago
      if (paymentFilter === 'CONFIRMED' && r.paymentStatus !== 'CONFIRMED') return false;
      if (paymentFilter === 'PENDING' && r.paymentStatus !== 'PENDING') return false;

      // 6. Filtro por Competencia Domingo
      if (competitionFilter === 'SINGLES' && (!r.competeSingles || r.competeDoubles)) return false;
      if (competitionFilter === 'DOUBLES' && (!r.competeDoubles || r.competeSingles)) return false;
      if (competitionFilter === 'BOTH' && (!r.competeSingles || !r.competeDoubles)) return false;

      return true;
    });
  }, [registrations, selectedTournamentFilter, searchTerm, attendanceFilter, dinnerFilter, paymentFilter, competitionFilter]);

  // Métricas Consolidadas para la fecha o filtro seleccionado
  const metrics = useMemo(() => {
    const list = filteredRegistrations;
    const totalCompetitors = list.length;
    const totalCompanions = list.reduce((acc, r) => acc + (Number(r.companionsCount) || 0), 0);
    const totalPeopleVenue = totalCompetitors + totalCompanions;
    const totalDinnerComensales = list.reduce((acc, r) => acc + (Number(r.dinnerComensalesCount) || 0), 0);

    const bothDays = list.filter(r => r.attendanceDays === 'BOTH_DAYS').length;
    const saturdayOnly = list.filter(r => r.attendanceDays === 'SATURDAY_ONLY').length;
    const sundayOnly = list.filter(r => r.attendanceDays === 'SUNDAY_ONLY').length;

    const singlesCount = list.filter(r => r.competeSingles).length;
    const doublesCount = list.filter(r => r.competeDoubles).length;
    const blindDrawCount = list.filter(r => r.competeDoubles && r.doublesPartnerMode === 'BLIND_DRAW').length;

    const confirmedPayments = list.filter(r => r.paymentStatus === 'CONFIRMED').length;

    // Países y Provincias distintas
    const countriesSet = new Set(list.map(r => r.countryCode || r.nationality));
    const provincesSet = new Set(list.map(r => r.province));
    const citiesSet = new Set(list.map(r => r.city));

    // Conteo de restricciones dietarias
    const specialDietsCount = list.filter(r => Boolean(r.dietaryRestrictions && r.dietaryRestrictions.trim().length > 0)).length;

    return {
      totalCompetitors,
      totalCompanions,
      totalPeopleVenue,
      totalDinnerComensales,
      bothDays,
      saturdayOnly,
      sundayOnly,
      singlesCount,
      doublesCount,
      blindDrawCount,
      confirmedPayments,
      countriesCount: countriesSet.size,
      provincesCount: provincesSet.size,
      citiesCount: citiesSet.size,
      specialDietsCount
    };
  }, [filteredRegistrations]);

  // Toggle de Estado de Pago con persistencia
  const handleTogglePaymentStatus = (regId: string) => {
    const updated = registrations.map(r => {
      if (r.id === regId) {
        const nextStatus: 'CONFIRMED' | 'PENDING' = r.paymentStatus === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED';
        return { ...r, paymentStatus: nextStatus };
      }
      return r;
    });

    setRegistrations(updated);
    saveStoredGrandTournamentRegistrations(updated);
    if (onUpdateRegistrations) onUpdateRegistrations(updated);
  };

  // Eliminación individual de un registro
  const handleDeleteRegistration = (regId: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la inscripción de ${name}?`)) return;
    const updated = registrations.filter(r => r.id !== regId);
    setRegistrations(updated);
    saveStoredGrandTournamentRegistrations(updated);
    if (onUpdateRegistrations) onUpdateRegistrations(updated);
  };

  // Exportar Planilla Oficial en CSV con codificación UTF-8 BOM para Excel
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No hay inscripciones para exportar.');
      return;
    }

    const headers = [
      'ID Registro',
      'Fecha Inscripción',
      'Nombre Completo',
      'Nickname',
      'DNI / Pasaporte',
      'País',
      'Provincia',
      'Ciudad',
      'Club',
      'Teléfono / WhatsApp',
      'Email',
      'Jornadas Asistencia',
      'Acompañantes Sede',
      'Cena Sábado (Comensales)',
      'Restricciones Dietarias',
      'Compite Individual 501',
      'Compite Parejas 501',
      'Modo Pareja',
      'Nombre Pareja',
      'Estado Pago',
      'Torneo Asociado'
    ];

    const rows = filteredRegistrations.map(r => [
      r.id,
      r.registeredAt ? new Date(r.registeredAt).toLocaleString('es-AR') : '',
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.nickname.replace(/"/g, '""')}"`,
      `"${r.dniOrPassport}"`,
      r.nationality,
      r.province,
      r.city,
      `"${r.club.replace(/"/g, '""')}"`,
      `"${r.phoneWhatsApp}"`,
      r.email,
      r.attendanceDays === 'BOTH_DAYS' ? 'Ambos Días' : r.attendanceDays === 'SATURDAY_ONLY' ? 'Solo Sábado' : 'Solo Domingo',
      r.companionsCount || 0,
      r.dinnerComensalesCount || 0,
      `"${(r.dietaryRestrictions || '').replace(/"/g, '""')}"`,
      r.competeSingles !== false ? 'SI' : 'NO',
      r.competeDoubles ? 'SI' : 'NO',
      r.doublesPartnerMode === 'BLIND_DRAW' ? 'Sorteo a Ciegas' : r.doublesPartnerMode === 'DEFINED_PARTNER' ? 'Dupla Definida' : 'N/A',
      `"${(r.doublesPartnerName || '').replace(/"/g, '""')}"`,
      r.paymentStatus === 'CONFIRMED' ? 'PAGADO' : 'PENDIENTE',
      r.tournamentId || 'torneo-open-mdq-2026'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeTourneyName = (selectedTournamentFilter === 'ALL' ? 'Todos_Los_Torneos' : 'Open_MDQ_Pompeya').toLowerCase();
    link.setAttribute('download', `Padron_Inscriptos_${safeTourneyName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir Lista Oficial de Acreditación para Mesa de Entrada
  const handlePrintDesk = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. SELECTOR Y ORDEN DE FECHAS PRESENCIALES */}
      <div className="bg-[#0f1422] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Gestor de Fechas Presenciales &amp; Mesa de Entrada
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Padrón de Inscriptos Oficiales &amp; Logística de Sede
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Control en tiempo real de los competidores acreditados, acompañantes, aforo y comensales para la cena de bienvenida en la Sociedad de Fomento Nueva Pompeya.
            </p>
          </div>

          {/* Selector de Fecha Presencial */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
              <span>Seleccionar Fecha:</span>
            </label>
            <select
              value={selectedTournamentFilter}
              onChange={(e) => setSelectedTournamentFilter(e.target.value)}
              className="bg-[#07090e] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-black text-emerald-300 focus:outline-none focus:border-emerald-400 shadow-inner"
            >
              <option value="ALL">🌐 Todas las Fechas Presenciales (Historial Global)</option>
              {presencialTournaments.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  {idx === 0 ? '🎯 [PRÓXIMA FECHA ACTIVA] ' : '📅 '} {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BANNER DE LA FECHA INMEDIATA PROXIMA */}
        {nextPresencialTournament && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0a121e] to-sky-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Próxima Fecha Oficial Presencial Confirmada
                </span>
                <h4 className="text-base sm:text-lg font-black text-white">
                  {nextPresencialTournament.title}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Sociedad de Fomento Nueva Pompeya (Mar del Plata)
                  </span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Sábado 25 (Amistosos / Cena) y Domingo 26 (Oficial Puntuable)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                title="Descargar archivo compatible con Excel de todas las inscripciones"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV / Excel</span>
              </button>
              <button
                type="button"
                onClick={handlePrintDesk}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141a29] hover:bg-slate-800 text-white border border-slate-700 font-black text-xs uppercase tracking-wider transition-all"
                title="Imprimir lista de acreditación para la mesa de entrada"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. TARJETAS DE KPIS CRÍTICOS PARA LA SOCIEDAD DE FOMENTO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Competidores */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Competidores
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-white block mt-1 font-mono">
            {metrics.totalCompetitors}
          </strong>
          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">darderos inscriptos</span>
        </div>

        {/* Acompañantes en Sede */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-sky-400" /> Acompañantes
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-[#38bdf8] block mt-1 font-mono">
            {metrics.totalCompanions}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">familia / amigos</span>
        </div>

        {/* Aforo Total */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-center gap-1">
            🏛️ Aforo en Sede
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-amber-400 block mt-1 font-mono">
            {metrics.totalPeopleVenue}
          </strong>
          <span className="text-[10px] text-amber-400/80 font-bold block mt-0.5">personas en Pompeya</span>
        </div>

        {/* Cena Asado del Sábado */}
        <div className="bg-[#0f1422] border-2 border-red-500/40 rounded-2xl p-4 text-center shadow-lg shadow-red-950/30">
          <span className="text-[10px] uppercase font-black text-red-400 flex items-center justify-center gap-1">
            <UtensilsCrossed className="w-3.5 h-3.5 text-red-500" /> Cena Sábado
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-red-400 block mt-1 font-mono">
            {metrics.totalDinnerComensales}
          </strong>
          <span className="text-[10px] text-gray-400 block mt-0.5">comensales confirmados</span>
        </div>

        {/* Procedencia Geográfica */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-purple-400" /> Nos Visitan De
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-purple-300 block mt-1 font-mono">
            {metrics.provincesCount} Prov
          </strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">en {metrics.countriesCount} países</span>
        </div>

        {/* Modalidades Domingo */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-center gap-1">
            <Dices className="w-3.5 h-3.5 text-amber-400" /> Duplas (Parejas)
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-amber-300 block mt-1 font-mono">
            {metrics.doublesCount}
          </strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ({metrics.blindDrawCount} por sorteo)
          </span>
        </div>
      </div>

      {/* 3. BARRA DE BUSQUEDA Y FILTROS AVANZADOS */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Input de Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por competidor, apodo, DNI, ciudad, provincia o club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#07090e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filtros Dropdown Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Jornadas */}
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
              className="bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas las Jornadas</option>
              <option value="BOTH_DAYS">Ambos Días (Fin de Semana)</option>
              <option value="SATURDAY_ONLY">Solo Sábado (Amistosos)</option>
              <option value="SUNDAY_ONLY">Solo Domingo (Oficial PDC)</option>
            </select>

            {/* Cena */}
            <select
              value={dinnerFilter}
              onChange={(e) => setDinnerFilter(e.target.value as any)}
              className="bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Cena Sábado: Todos</option>
              <option value="YES">🍖 Asisten a la Cena</option>
              <option value="NO">❌ No Asisten a la Cena</option>
            </select>

            {/* Pago */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Pago: Todos</option>
              <option value="CONFIRMED">🟢 Pagos Confirmados</option>
              <option value="PENDING">🟡 Pagos Pendientes</option>
            </select>

            {/* Modalidad Domingo */}
            <select
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value as any)}
              className="bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Modalidad: Todas</option>
              <option value="SINGLES">Solo Individual 501</option>
              <option value="DOUBLES">Solo Parejas 501</option>
              <option value="BOTH">Ambos (Individual + Parejas)</option>
            </select>

            {(searchTerm || attendanceFilter !== 'ALL' || dinnerFilter !== 'ALL' || paymentFilter !== 'ALL' || competitionFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setAttendanceFilter('ALL');
                  setDinnerFilter('ALL');
                  setPaymentFilter('ALL');
                  setCompetitionFilter('ALL');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-950/40 transition-colors"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. TABLA DETALLADA DE INSCRIPTOS */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Listado de Competidores Acreditados
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
              {filteredRegistrations.length} de {registrations.length}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            {metrics.specialDietsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                <AlertCircle className="w-3.5 h-3.5" />
                {metrics.specialDietsCount} con menú especial (celíaco/vegetariano)
              </span>
            )}
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">No se encontraron inscripciones con los filtros actuales.</p>
            <p className="text-xs max-w-md mx-auto">
              Los jugadores que completen el formulario in-app desde la portada aparecerán aquí de forma automática.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090e] text-slate-400 uppercase text-[10px] font-black border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3">Competidor &amp; Apodo</th>
                  <th className="px-4 py-3">DNI / Pasaporte</th>
                  <th className="px-4 py-3">Origen (De Dónde nos Visitan)</th>
                  <th className="px-4 py-3">Contacto Directo</th>
                  <th className="px-4 py-3 text-center">Jornadas</th>
                  <th className="px-4 py-3 text-center">Acompañantes</th>
                  <th className="px-4 py-3 text-center">Cena Sábado</th>
                  <th className="px-4 py-3">Domingo (Modalidad)</th>
                  <th className="px-4 py-3 text-center">Estado Pago</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                {filteredRegistrations.map((r, index) => {
                  const phoneClean = r.phoneWhatsApp.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Hola ${r.fullName}! Te escribo de la organización de Locos por los Dardos / Darderos MDQ por tu inscripción al Open de Mar del Plata.`)}`;

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* # Índice */}
                      <td className="px-4 py-3 text-center font-mono text-slate-500 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Competidor */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <strong className="text-white text-sm block tracking-tight font-black">
                              {r.fullName}
                            </strong>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-bold text-emerald-400">
                                &quot;{r.nickname}&quot;
                              </span>
                              {r.club && (
                                <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                                  {r.club}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DNI / Pasaporte */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-200">
                        {r.dniOrPassport}
                      </td>

                      {/* Procedencia Geográfica */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base select-none" title={r.nationality}>
                            {getCountryFlag(r.countryCode || r.nationality || 'AR')}
                          </span>
                          <div>
                            <span className="text-white font-bold block">{r.city}</span>
                            <span className="text-[10px] text-slate-400 block">{r.province}, {r.nationality}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contacto Directo */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {r.phoneWhatsApp && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#00e676] hover:underline font-bold text-[11px]"
                              title="Abrir chat de WhatsApp con el competidor"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{r.phoneWhatsApp}</span>
                            </a>
                          )}
                          {r.email && (
                            <a
                              href={`mailto:${r.email}`}
                              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 truncate max-w-[140px]"
                              title={r.email}
                            >
                              <Mail className="w-2.5 h-2.5" />
                              <span className="truncate">{r.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Jornadas */}
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          r.attendanceDays === 'BOTH_DAYS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : r.attendanceDays === 'SATURDAY_ONLY'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}>
                          {r.attendanceDays === 'BOTH_DAYS' ? 'Ambos Días' : r.attendanceDays === 'SATURDAY_ONLY' ? 'Solo Sábado' : 'Solo Domingo'}
                        </span>
                      </td>

                      {/* Acompañantes */}
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-200">
                        {r.companionsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-300 border border-sky-800/40">
                            +{r.companionsCount}
                          </span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>

                      {/* Cena Sábado */}
                      <td className="px-4 py-3 text-center">
                        {r.dinnerComensalesCount > 0 ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 font-mono font-black text-xs">
                              {r.dinnerComensalesCount} {r.dinnerComensalesCount === 1 ? 'cubierto' : 'cubiertos'}
                            </span>
                            {r.dietaryRestrictions && (
                              <span className="text-[9px] text-amber-300 font-bold mt-0.5 max-w-[120px] truncate" title={r.dietaryRestrictions}>
                                ⚠️ {r.dietaryRestrictions}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">No asiste</span>
                        )}
                      </td>

                      {/* Domingo (Modalidad) */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {r.competeSingles !== false && (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 mr-1">
                              🎯 501 Individual
                            </span>
                          )}
                          {r.competeDoubles && (
                            <div className="mt-0.5">
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                                👥 501 Parejas: {r.doublesPartnerMode === 'BLIND_DRAW' ? '🎲 Sorteo a Ciegas' : `Dupla con ${r.doublesPartnerName || 'definir'}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Estado Pago */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePaymentStatus(r.id)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                            r.paymentStatus === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 hover:bg-emerald-900'
                              : 'bg-amber-950/80 text-amber-300 border-amber-600 hover:bg-amber-900'
                          }`}
                          title="Click para alternar entre Pagado y Pendiente"
                        >
                          {r.paymentStatus === 'CONFIRMED' ? '🟢 Pagado' : '🟡 Pendiente'}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRegistration(r.id, r.fullName)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Eliminar inscripción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
