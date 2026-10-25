'use client';

import React, { useState, useMemo } from 'react';
import { GrandTournamentRegistration, Tournament, League, LandingShowcaseSettings } from '@/lib/types';
import { getCountryFlag } from '@/lib/constants';
import { saveStoredGrandTournamentRegistrations, saveGrandTournamentRegistrationToCloud } from '@/lib/storage';
import { GrandTournamentEnrollModal } from '@/components/comunidad/GrandTournamentEnrollModal';
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
  ChevronDown,
  Eye,
  Copy,
  Share2,
  Sparkles,
  MessageCircle,
  Pin,
  ExternalLink,
  X,
  ShieldCheck,
  Building,
  Flag,
  CreditCard
} from 'lucide-react';

const CANONICAL_LEAGUES: League[] = [
  {
    id: 'league-national-argentina',
    slug: 'liga-nacional-oficial-argentina',
    name: 'Liga Nacional Oficial de Dardos Argentina 2026',
    scope: 'NATIONAL',
    description: 'Circuito federal con fechas presenciales puntuables x2 y plazas internacionales PDC.',
    season: '2026',
    organizerClub: 'Locos por los Dardos Argentina',
    isOfficialNational: true,
    doublePointsOnPresential: true,
    activeTournamentsCount: 2,
    standings: [],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'league-mdq-2026',
    slug: 'liga-marplatense-dardos-2026',
    name: 'Liga Marplatense de Dardos 2026',
    scope: 'LOCAL',
    description: 'Circuito local oficial con sede en la Sociedad de Fomento Nueva Pompeya.',
    season: '2026',
    organizerClub: 'Darderos Mar del Plata',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    isOfficialNational: false,
    doublePointsOnPresential: true,
    activeTournamentsCount: 2,
    standings: [],
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

interface PresencialEnrollmentsManagerProps {
  registrations: GrandTournamentRegistration[];
  tournaments: Tournament[];
  leagues?: League[];
  heroSettings?: LandingShowcaseSettings['heroTournament'];
  onUpdateRegistrations?: (updated: GrandTournamentRegistration[]) => void;
  onUpdateHeroTournament?: (updatedHero: Partial<LandingShowcaseSettings['heroTournament']>) => void;
}

export const PresencialEnrollmentsManager: React.FC<PresencialEnrollmentsManagerProps> = ({
  registrations: initialRegistrations,
  tournaments,
  leagues = CANONICAL_LEAGUES,
  heroSettings,
  onUpdateRegistrations,
  onUpdateHeroTournament
}) => {
  const [registrations, setRegistrations] = useState<GrandTournamentRegistration[]>(initialRegistrations);
  
  // 1. FILTROS DEPENDIENTES DE COMPÉTICION
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'NATIONAL' | 'LOCAL' | 'STANDALONE'>('ALL');
  const [leagueFilter, setLeagueFilter] = useState<string>('ALL');
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string>('ALL');

  // 2. FILTROS DE PADRÓN Y BÚSQUEDA
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'BOTH_DAYS' | 'SATURDAY_ONLY' | 'SUNDAY_ONLY'>('ALL');
  const [dinnerFilter, setDinnerFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING'>('ALL');
  const [competitionFilter, setCompetitionFilter] = useState<'ALL' | 'SINGLES' | 'DOUBLES' | 'BOTH'>('ALL');

  // 3. ESTADOS DE MODALES
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedRegForDetail, setSelectedRegForDetail] = useState<GrandTournamentRegistration | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Mantener sincronizado si cambian las props iniciales
  React.useEffect(() => {
    setRegistrations(initialRegistrations);
  }, [initialRegistrations]);

  // Ligas filtradas por el Ámbito seleccionado (Nivel 2 de filtros dependientes)
  const availableLeagues = useMemo(() => {
    const list = leagues && leagues.length > 0 ? leagues : CANONICAL_LEAGUES;
    if (scopeFilter === 'ALL') return list;
    if (scopeFilter === 'NATIONAL') return list.filter(l => l.scope === 'NATIONAL' || l.isOfficialNational);
    if (scopeFilter === 'LOCAL') return list.filter(l => l.scope === 'LOCAL' && !l.isOfficialNational);
    if (scopeFilter === 'STANDALONE') return [];
    return list;
  }, [leagues, scopeFilter]);

  // Si cambia el ámbito, resetear liga si ya no aplica
  const handleScopeChange = (newScope: 'ALL' | 'NATIONAL' | 'LOCAL' | 'STANDALONE') => {
    setScopeFilter(newScope);
    setLeagueFilter('ALL');
    setSelectedTournamentFilter('ALL');
  };

  const handleLeagueChange = (newLeagueId: string) => {
    setLeagueFilter(newLeagueId);
    setSelectedTournamentFilter('ALL');
  };

  // Lista de Torneos Presenciales filtrados por Ámbito y Liga (Nivel 3 de filtros dependientes)
  const presencialTournaments = useMemo(() => {
    // Buscar todos los torneos que sean presenciales o tengan sede física
    const presenciales = tournaments.filter(t => 
      t.type === 'PRESENCIAL' || 
      t.nationalStageType === 'PRESENCIAL_OFICIAL' ||
      Boolean(t.venueName && t.venueName.trim().length > 0) ||
      t.title.toLowerCase().includes('open') ||
      t.title.toLowerCase().includes('abierto') ||
      t.title.toLowerCase().includes('mar del plata') ||
      t.title.toLowerCase().includes('pompeya') ||
      t.title.toLowerCase().includes('presencial')
    );

    const baseList = presenciales.length > 0 ? presenciales : [
      {
        id: 'torneo-open-mdq-2026',
        title: 'Gran Open Mar del Plata 2026 • Pompeya Arena',
        startDate: '2026-10-25T10:00:00',
        status: 'REGISTRATION_OPEN' as const,
        city: 'Mar del Plata',
        venueName: 'Sociedad de Fomento Nueva Pompeya',
        leagueId: 'league-mdq-2026',
        competitionMode: 'LOCAL_LEAGUE' as const
      } as Tournament
    ];

    // Ordenar cronológicamente (más próximos primero)
    const sorted = [...baseList].sort((a, b) => {
      const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return timeA - timeB;
    });

    // 1. Filtrar por Ámbito
    let filtered = sorted;
    if (scopeFilter === 'NATIONAL') {
      const natMatches = filtered.filter(t => 
        t.nationalStageType === 'PRESENCIAL_OFICIAL' ||
        t.competitionMode === 'NATIONAL_LEAGUE' ||
        t.leagueId === 'league-national-argentina' ||
        t.pointsMultiplier === 2 ||
        t.title.toLowerCase().includes('nacional') ||
        t.title.toLowerCase().includes('argentina') ||
        t.title.toLowerCase().includes('internacional') ||
        t.title.toLowerCase().includes('abierto') ||
        t.title.toLowerCase().includes('open')
      );
      // Si la búsqueda estricta no arroja resultados, conservar la lista ordenada para no dejar el selector en (0)
      filtered = natMatches.length > 0 ? natMatches : sorted;
    } else if (scopeFilter === 'LOCAL') {
      const locMatches = filtered.filter(t => 
        t.competitionMode === 'LOCAL_LEAGUE' ||
        t.leagueId === 'league-mdq-2026' ||
        t.title.toLowerCase().includes('mar del plata') ||
        t.title.toLowerCase().includes('mdq') ||
        t.title.toLowerCase().includes('pompeya') ||
        t.title.toLowerCase().includes('local')
      );
      filtered = locMatches.length > 0 ? locMatches : sorted;
    } else if (scopeFilter === 'STANDALONE') {
      const stdMatches = filtered.filter(t => 
        t.competitionMode === 'STANDALONE_DAY' ||
        (!t.leagueId && !t.title.toLowerCase().includes('liga'))
      );
      filtered = stdMatches.length > 0 ? stdMatches : sorted;
    }

    // 2. Filtrar por Liga específica
    if (leagueFilter !== 'ALL' && scopeFilter !== 'STANDALONE') {
      const byLeague = filtered.filter(t => t.leagueId === leagueFilter);
      if (byLeague.length > 0) {
        filtered = byLeague;
      }
    }

    return filtered;
  }, [tournaments, scopeFilter, leagueFilter]);

  // Identificar el torneo activo seleccionado para ver su ficha y formulario
  const activeSelectedTournament = useMemo(() => {
    if (selectedTournamentFilter === 'ALL') {
      return presencialTournaments[0];
    }
    return presencialTournaments.find(t => t.id === selectedTournamentFilter) || presencialTournaments[0];
  }, [presencialTournaments, selectedTournamentFilter]);

  // Configuración del Formulario In-App adaptada para el torneo seleccionado
  const activeTournamentFormSettings = useMemo(() => {
    const t = activeSelectedTournament;
    return {
      enabled: true,
      tagBadge: 'Formulario Oficial de Inscripción',
      subBadge: t?.competitionMode === 'NATIONAL_LEAGUE' ? 'Liga Nacional Oficial ⚡x2 Pts' : 'Fecha Presencial Oficial',
      title: t?.title || 'Gran Open Mar del Plata 2026 • Pompeya Arena',
      highlightCity: t?.city || 'Mar del Plata',
      year: '2026',
      description: t?.description || 'Formulario oficial de inscripción y reserva para la cena de bienvenida.',
      date: t?.startDate 
        ? new Date(t.startDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
        : 'Sábado 24 y Domingo 25 de Octubre 2026',
      venue: t?.venueName || 'Sociedad de Fomento Nueva Pompeya',
      prizePool: t?.prizePoolArs ? `$${t.prizePoolArs.toLocaleString('es-AR')}` : 'Trofeos Oficiales y Medallas',
      entryFee: t?.entryFeeArs ? `$${t.entryFeeArs.toLocaleString('es-AR')}` : 'Sin arancel',
      registeredCount: registrations.filter(r => selectedTournamentFilter === 'ALL' || r.tournamentId === t?.id).length,
      maxParticipants: t?.maxParticipants || heroSettings?.maxParticipants || 32,
      googleFormUrl: heroSettings?.googleFormUrl || '',
      autoSyncGoogleForm: false,
      ctaButtonText: heroSettings?.ctaButtonText || 'Inscripción Rápida',
      secondaryButtonText: heroSettings?.secondaryButtonText || 'Ver Cuadro y Reglamento',
      secondaryButtonUrl: heroSettings?.secondaryButtonUrl || '/torneos',
      lastSyncedAt: heroSettings?.lastSyncedAt || 'Ahora',
      tournamentId: t?.id || 'torneo-open-mdq-2026',
      registrationMode: 'IN_APP' as const,
      galleryImages: heroSettings?.galleryImages || []
    };
  }, [activeSelectedTournament, heroSettings, registrations, selectedTournamentFilter]);

  // Filtrado de Registros según la selección jerárquica
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // 1. Filtro por Torneo / Fecha específica
      if (selectedTournamentFilter !== 'ALL') {
        const matchesTourney = r.tournamentId === selectedTournamentFilter || 
          (!r.tournamentId && selectedTournamentFilter === 'torneo-open-mdq-2026');
        if (!matchesTourney) return false;
      } else if (scopeFilter !== 'ALL' || leagueFilter !== 'ALL') {
        // Si no seleccionó un torneo puntual pero sí una liga o ámbito, filtrar por los torneos que pertenecen
        const allowedTournamentIds = new Set(presencialTournaments.map(t => t.id));
        allowedTournamentIds.add('torneo-open-mdq-2026');
        if (r.tournamentId && !allowedTournamentIds.has(r.tournamentId)) {
          return false;
        }
      }

      // 2. Buscador por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inName = r.fullName.toLowerCase().includes(q);
        const inNick = r.nickname.toLowerCase().includes(q);
        const inDni = (r.dniOrPassport || '').toLowerCase().includes(q);
        const inCity = (r.city || '').toLowerCase().includes(q);
        const inProv = (r.province || '').toLowerCase().includes(q);
        const inCountry = (r.nationality || '').toLowerCase().includes(q);
        const inClub = (r.club || '').toLowerCase().includes(q);
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
  }, [registrations, selectedTournamentFilter, scopeFilter, leagueFilter, presencialTournaments, searchTerm, attendanceFilter, dinnerFilter, paymentFilter, competitionFilter]);

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

    const countriesSet = new Set(list.map(r => r.countryCode || r.nationality));
    const provincesSet = new Set(list.map(r => r.province));
    const citiesSet = new Set(list.map(r => r.city));

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

  // Toggle de Estado de Pago con persistencia local y cloud
  const handleTogglePaymentStatus = (regId: string) => {
    const updated = registrations.map(r => {
      if (r.id === regId) {
        const nextStatus: 'CONFIRMED' | 'PENDING' = r.paymentStatus === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED';
        const updatedReg = { ...r, paymentStatus: nextStatus };
        // Sync con la nube
        fetch('/api/inscripciones', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: regId, paymentStatus: nextStatus })
        }).catch(e => console.warn('Error patching payment status in cloud:', e));
        return updatedReg;
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

    fetch(`/api/inscripciones?id=${encodeURIComponent(regId)}`, {
      method: 'DELETE'
    }).catch(e => console.warn('Error deleting in cloud:', e));
  };

  // Copiar Enlace Directo de Inscripción para la Fecha Seleccionada
  const handleCopyEnrollLink = () => {
    const tourneyId = activeSelectedTournament?.id || 'torneo-open-mdq-2026';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://locosporlosdardos.com.ar';
    const url = `${origin}/?inscribir=${encodeURIComponent(tourneyId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Difundir por WhatsApp la Inscripción de esta Fecha
  const handleShareWhatsApp = () => {
    const tourney = activeSelectedTournament;
    if (!tourney) return;
    const tourneyId = tourney.id || 'torneo-open-mdq-2026';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://locosporlosdardos.com.ar';
    const url = `${origin}/?inscribir=${encodeURIComponent(tourneyId)}`;
    const fechaTexto = tourney.startDate 
      ? new Date(tourney.startDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) 
      : 'Octubre 2026';
    const sedeTexto = tourney.venueName || 'Sociedad de Fomento Nueva Pompeya';
    
    const msg = `🎯 *LOCOS POR LOS DARDOS • INSCRIPCIÓN OFICIAL*\n\n🏆 *Torneo:* ${tourney.title}\n📅 *Fecha:* ${fechaTexto}\n📍 *Sede:* ${sedeTexto} (Mar del Plata)\n🍖 *Cena del Sábado:* Asado de camaradería\n\n👉 *Completá el formulario de inscripción oficial aquí:*\n${url}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Fijar como Torneo Activo de Portada (Vitrina 1)
  const handlePinAsHeroTournament = () => {
    if (!activeSelectedTournament || !onUpdateHeroTournament) return;
    onUpdateHeroTournament({
      tournamentId: activeSelectedTournament.id,
      title: activeSelectedTournament.title,
      venue: activeSelectedTournament.venueName || activeSelectedTournament.city,
      date: activeSelectedTournament.startDate 
        ? new Date(activeSelectedTournament.startDate).toLocaleDateString('es-AR') 
        : undefined
    });
    alert(`¡"${activeSelectedTournament.title}" ha sido fijado como el torneo oficial activo en la Portada / Vitrina 1!`);
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
      `"${r.dniOrPassport || ''}"`,
      r.nationality,
      r.province,
      r.city,
      `"${r.club.replace(/"/g, '""')}"`,
      `"${r.phoneWhatsApp || ''}"`,
      r.email || '',
      r.attendanceDays === 'BOTH_DAYS' ? 'Ambos Días' : r.attendanceDays === 'SATURDAY_ONLY' ? 'Solo Sábado' : 'Solo Domingo',
      r.companionsCount || 0,
      r.dinnerComensalesCount || 0,
      `"${(r.dietaryRestrictions || '').replace(/"/g, '""')}"`,
      r.competeSingles !== false ? 'SI' : 'NO',
      r.competeDoubles ? 'SI' : 'NO',
      r.doublesPartnerMode === 'BLIND_DRAW' ? 'Sorteo a Ciegas' : r.doublesPartnerMode === 'DEFINED_PARTNER' ? 'Dupla Definida' : 'N/A',
      `"${(r.doublesPartnerName || '').replace(/"/g, '""')}"`,
      r.paymentStatus === 'CONFIRMED' ? 'PAGADO' : 'PENDIENTE',
      `"${r.tournamentTitle || r.tournamentId || 'Gran Open Mar del Plata'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeTourneyName = (selectedTournamentFilter === 'ALL' ? 'Padron_Presencial_Completo' : activeSelectedTournament?.title || 'Torneo').replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `${safeTourneyName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. SELECTOR Y FILTROS DEPENDIENTES DE COMPÉTICIÓN */}
      <div className="bg-[#0f1422] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                Filtros dependientes por Liga y Fecha del evento, control de comensales para el asado del sábado en Nueva Pompeya y visualización del formulario por fecha.
              </p>
            </div>

            {/* Acciones Rápidas Globales */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                title="Descargar archivo Excel / CSV de las inscripciones filtradas"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV / Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141a29] hover:bg-slate-800 text-white border border-slate-700 font-black text-xs uppercase tracking-wider transition-all"
                title="Imprimir lista de acreditación para la mesa de entrada"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* 3 FILTROS DEPENDIENTES INTERACTIVOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 bg-[#07090e]/70 p-3.5 rounded-2xl border border-slate-800">
            {/* Filtro 1: Ámbito / Tipo de Liga */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                1. Ámbito de la Competición:
              </label>
              <select
                value={scopeFilter}
                onChange={(e) => handleScopeChange(e.target.value as any)}
                className="w-full bg-[#111622] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none"
              >
                <option value="ALL">🌐 Todos los Circuitos &amp; Ámbitos</option>
                <option value="NATIONAL">🇦🇷 Liga Nacional Oficial (⚡x2 Pts)</option>
                <option value="LOCAL">📍 Ligas Locales (Mar del Plata / Regionales)</option>
                <option value="STANDALONE">🏆 Torneos Abiertos &amp; Especiales (Grand Opens)</option>
              </select>
            </div>

            {/* Filtro 2: Liga Específica (Dependiente de Filtro 1) */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                2. Liga / Torneo Madre:
              </label>
              <select
                value={leagueFilter}
                onChange={(e) => handleLeagueChange(e.target.value)}
                disabled={scopeFilter === 'STANDALONE'}
                className="w-full bg-[#111622] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none disabled:opacity-50"
              >
                <option value="ALL">🌐 Todas las Ligas de este ámbito</option>
                {availableLeagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.scope === 'NATIONAL' ? '🇦🇷 ' : '📍 '} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro 3: Fecha del Evento / Torneo Específico (Dependiente de Filtro 1 y 2) */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                3. Fecha del Evento Presencial:
              </label>
              <select
                value={selectedTournamentFilter}
                onChange={(e) => setSelectedTournamentFilter(e.target.value)}
                className="w-full bg-[#111622] border border-emerald-500/60 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs font-black text-emerald-300 focus:outline-none shadow-inner"
              >
                <option value="ALL">🌐 Todas las Fechas Presenciales ({presencialTournaments.length})</option>
                {presencialTournaments.map((t, idx) => {
                  const dateStr = t.startDate ? new Date(t.startDate).toLocaleDateString('es-AR') : 'Próximamente';
                  return (
                    <option key={t.id} value={t.id}>
                      {idx === 0 ? '🎯 [PRÓXIMA FECHA ACTIVA] ' : '📅 '} {t.title} ({dateStr})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* 2. CENTRO DE CONTROL DEL FORMULARIO DE LA FECHA SELECCIONADA */}
        {activeSelectedTournament && (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0a121e] to-sky-950/40 border border-emerald-500/40 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {selectedTournamentFilter === 'ALL' ? 'Próxima Fecha Oficial Presencial' : 'Fecha Presencial Seleccionada'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      ID: {activeSelectedTournament.id}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-white mt-1">
                    {activeSelectedTournament.title}
                  </h4>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {activeSelectedTournament.venueName || 'Sociedad de Fomento Nueva Pompeya'} ({activeSelectedTournament.city || 'Mar del Plata'})
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {activeSelectedTournament.startDate 
                        ? new Date(activeSelectedTournament.startDate).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) 
                        : 'Sábado y Domingo'}
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CreditCard className="w-3.5 h-3.5" />
                      {activeSelectedTournament.entryFeeArs ? `$${activeSelectedTournament.entryFeeArs.toLocaleString('es-AR')}` : 'Sin arancel'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN PARA EL FORMULARIO DE ESTA FECHA */}
              <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
                {/* 1. BOTÓN VER / ABRIR FORMULARIO DE ESTA FECHA */}
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 active:scale-95"
                  title="Abrir el formulario interactivo para previsualizarlo o inscribir manualmente a un jugador"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Formulario de Inscripción</span>
                </button>

                {/* 2. COPIAR ENLACE DIRECTO */}
                <button
                  type="button"
                  onClick={handleCopyEnrollLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141a29] hover:bg-slate-800 text-white border border-slate-700 font-black text-xs transition-all"
                  title="Copiar enlace directo de inscripción para compartir en redes o afiche"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Link'}</span>
                </button>

                {/* 3. DIFUNDIR POR WHATSAPP */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-black text-xs transition-all"
                  title="Compartir la invitación oficial por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Difundir WhatsApp</span>
                </button>

                {/* 4. FIJAR COMO TORNEO ACTIVO EN PORTADA */}
                {onUpdateHeroTournament && (
                  <button
                    type="button"
                    onClick={handlePinAsHeroTournament}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-950/50 hover:bg-sky-900/50 text-sky-300 border border-sky-500/40 font-black text-xs transition-all"
                    title="Hacer que este torneo sea el promocionado en el Head Banner de la página principal"
                  >
                    <Pin className="w-4 h-4" />
                    <span className="hidden sm:inline">Fijar en Portada</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. SEIS KPI CARDS EN TIEMPO REAL PARA GESTIÓN DE SEDE Y CENA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Competidores */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-black uppercase tracking-wider text-[10px]">Competidores</span>
            <Users className="w-4 h-4 text-[#00e676]" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{metrics.totalCompetitors}</div>
            <span className="text-[10px] text-emerald-400 font-bold">darderos inscriptos</span>
          </div>
        </div>

        {/* Card 2: Acompañantes */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-black uppercase tracking-wider text-[10px]">Acompañantes</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{metrics.totalCompanions}</div>
            <span className="text-[10px] text-sky-400 font-bold">familia / amigos</span>
          </div>
        </div>

        {/* Card 3: Aforo en Sede */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-black uppercase tracking-wider text-[10px]">Aforo en Sede</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-300 font-mono">{metrics.totalPeopleVenue}</div>
            <span className="text-[10px] text-slate-400">personas en Pompeya</span>
          </div>
        </div>

        {/* Card 4: Cena Sábado (Comensales) */}
        <div className="bg-[#0f1422] border border-red-500/40 rounded-2xl p-4 flex flex-col justify-between bg-gradient-to-br from-[#0f1422] to-red-950/20 shadow-lg shadow-red-950/10">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-black uppercase tracking-wider text-[10px] text-red-400 flex items-center gap-1">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Cena Sábado
            </span>
            {metrics.specialDietsCount > 0 && (
              <span className="text-[9px] font-black bg-amber-400 text-black px-1.5 py-0.2 rounded-full" title="Hay restricciones alimentarias registradas">
                {metrics.specialDietsCount} Dieta
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{metrics.totalDinnerComensales}</div>
            <span className="text-[10px] text-slate-300 font-bold">comensales confirmados</span>
          </div>
        </div>

        {/* Card 5: Procedencia Geográfica */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-black uppercase tracking-wider text-[10px]">Nos Visitan de</span>
            <MapPin className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{metrics.provincesCount} Prov</div>
            <span className="text-[10px] text-slate-400 font-medium">{metrics.citiesCount} ciudades • {metrics.countriesCount} país</span>
          </div>
        </div>

        {/* Card 6: Modalidad Domingo */}
        <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-black uppercase tracking-wider text-[10px]">Domingo (Parejas)</span>
            <Dices className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{metrics.doublesCount}</div>
            <span className="text-[10px] text-slate-400">{metrics.blindDrawCount} por sorteo</span>
          </div>
        </div>
      </div>

      {/* 4. BUSCADOR Y FILTROS SECUNDARIOS */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por competidor, apodo, DNI, ciudad, provincia o club..."
              className="w-full bg-[#07090e] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro Jornadas */}
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as any)}
            className="bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todas las Jornadas</option>
            <option value="BOTH_DAYS">Ambos Días (Sáb + Dom)</option>
            <option value="SATURDAY_ONLY">Solo Sábado (Amistosos)</option>
            <option value="SUNDAY_ONLY">Solo Domingo (Oficial)</option>
          </select>

          {/* Filtro Cena */}
          <select
            value={dinnerFilter}
            onChange={(e) => setDinnerFilter(e.target.value as any)}
            className="bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Cena Sábado: Todos</option>
            <option value="YES">Cena Sábado: Confirmados</option>
            <option value="NO">Cena Sábado: No Asisten</option>
          </select>

          {/* Filtro Pago */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Pagos: Todos</option>
            <option value="CONFIRMED">Pago: Confirmado</option>
            <option value="PENDING">Pago: Pendiente</option>
          </select>

          {/* Filtro Modalidad */}
          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value as any)}
            className="bg-[#07090e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Modalidad: Todas</option>
            <option value="SINGLES">Solo 501 Individual</option>
            <option value="DOUBLES">Solo 501 Parejas</option>
            <option value="BOTH">Ambos Torneos</option>
          </select>
        </div>
      </div>

      {/* 5. TABLA OFICIAL DE COMPETIDORES INSCRIPTOS */}
      <div className="bg-[#0f1422] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Listado de Competidores Acreditados
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs">
              {filteredRegistrations.length} de {registrations.length}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {selectedTournamentFilter === 'ALL' ? 'Padrón global de fechas' : activeSelectedTournament?.title}
          </span>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h5 className="text-sm font-bold text-slate-300">No se encontraron inscripciones con los filtros actuales</h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Intenta cambiar el ámbito, la liga o el filtro de fecha, o haz clic en "Ver Formulario de Inscripción" para completar una nueva.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07090e] text-slate-400 uppercase text-[10px] font-black border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Competidor &amp; Apodo</th>
                  <th className="px-4 py-3">DNI / Pasaporte</th>
                  <th className="px-4 py-3">Origen (De dónde nos visitan)</th>
                  <th className="px-4 py-3">Contacto Directo</th>
                  <th className="px-4 py-3">Jornadas</th>
                  <th className="px-4 py-3">Acompañantes</th>
                  <th className="px-4 py-3">Cena Sábado</th>
                  <th className="px-4 py-3">Domingo (Modalidad)</th>
                  <th className="px-4 py-3">Estado Pago</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRegistrations.map((reg, index) => {
                  const flag = getCountryFlag(reg.countryCode || 'AR');
                  const isConfirmed = reg.paymentStatus === 'CONFIRMED';
                  const waNumber = (reg.phoneWhatsApp || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500">{index + 1}</td>
                      
                      {/* Competidor */}
                      <td className="px-4 py-3">
                        <div className="font-black text-white text-sm">{reg.fullName}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#00e676] font-bold">
                          <span>"{reg.nickname}"</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 font-normal">{reg.club || 'Independiente'}</span>
                        </div>
                      </td>

                      {/* DNI */}
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {reg.dniOrPassport || 'En Acreditación'}
                      </td>

                      {/* Origen */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span className="text-base">{flag}</span>
                          <span>{reg.city || 'Mar del Plata'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {reg.province}, {reg.nationality}
                        </div>
                      </td>

                      {/* Contacto WhatsApp */}
                      <td className="px-4 py-3">
                        {waNumber ? (
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00e676] border border-emerald-500/30 text-[11px] font-bold transition-all"
                            title="Abrir chat directo en WhatsApp"
                          >
                            <Phone className="w-3 h-3" />
                            <span>+{waNumber}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Sin teléfono</span>
                        )}
                        {reg.email && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5">
                            {reg.email}
                          </div>
                        )}
                      </td>

                      {/* Jornadas */}
                      <td className="px-4 py-3">
                        {reg.attendanceDays === 'BOTH_DAYS' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Jornada Doble
                          </span>
                        )}
                        {reg.attendanceDays === 'SATURDAY_ONLY' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Solo Sábado
                          </span>
                        )}
                        {reg.attendanceDays === 'SUNDAY_ONLY' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            Solo Domingo
                          </span>
                        )}
                      </td>

                      {/* Acompañantes */}
                      <td className="px-4 py-3">
                        {Number(reg.companionsCount || 0) > 0 ? (
                          <span className="font-mono font-bold text-sky-400">
                            +{reg.companionsCount}
                          </span>
                        ) : (
                          <span className="text-slate-500">Solo</span>
                        )}
                      </td>

                      {/* Cena Sábado */}
                      <td className="px-4 py-3">
                        {Number(reg.dinnerComensalesCount || 0) > 0 ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-max">
                              <UtensilsCrossed className="w-2.5 h-2.5" />
                              {reg.dinnerComensalesCount} {reg.dinnerComensalesCount === 1 ? 'cubierto' : 'cubiertos'}
                            </span>
                            {reg.dietaryRestrictions && (
                              <div className="text-[10px] font-bold text-amber-400 truncate max-w-[120px]" title={reg.dietaryRestrictions}>
                                ⚠️ {reg.dietaryRestrictions}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No asiste</span>
                        )}
                      </td>

                      {/* Domingo (Modalidad) */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {reg.competeSingles && (
                            <span className="block text-[10px] font-bold text-slate-300">
                              🎯 501 Individual
                            </span>
                          )}
                          {reg.competeDoubles && (
                            <span className="block text-[10px] font-bold text-purple-300">
                              🎲 Parejas ({reg.doublesPartnerMode === 'BLIND_DRAW' ? 'Sorteo a Ciegas' : reg.doublesPartnerName || 'Armada'})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estado Pago */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePaymentStatus(reg.id)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm ${
                            isConfirmed
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                          }`}
                          title="Click para alternar entre Pagado y Pendiente"
                        >
                          {isConfirmed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>CONFIRMADO</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>PENDIENTE</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRegForDetail(reg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                            title="Ver ficha completa de inscripción"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRegistration(reg.id, reg.fullName)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                            title="Eliminar inscripción"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: PREVISUALIZACIÓN Y APERTURA DEL FORMULARIO DE ESTA FECHA */}
      {isEnrollModalOpen && (
        <GrandTournamentEnrollModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          heroSettings={activeTournamentFormSettings}
          onSuccess={() => {
            setIsEnrollModalOpen(false);
          }}
        />
      )}

      {/* MODAL 2: FICHA COMPLETA DEL JUGADOR INSCRIPTO */}
      {selectedRegForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border-2 border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xl">
                  {getCountryFlag(selectedRegForDetail.countryCode || 'AR')}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Ficha Oficial de Inscripción &amp; Acreditación
                  </span>
                  <h4 className="text-xl font-black text-white">{selectedRegForDetail.fullName}</h4>
                  <span className="text-xs text-[#00e676] font-bold">@{selectedRegForDetail.nickname}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegForDetail(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#07090e] p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">DNI / Pasaporte:</span>
                  <strong className="text-white font-mono">{selectedRegForDetail.dniOrPassport || 'En Acreditación'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Club:</span>
                  <strong className="text-white">{selectedRegForDetail.club || 'Independiente'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Ciudad / Provincia:</span>
                  <strong className="text-white">{selectedRegForDetail.city}, {selectedRegForDetail.province}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">País:</span>
                  <strong className="text-white">{selectedRegForDetail.nationality}</strong>
                </div>
              </div>

              {/* Logística de Sede */}
              <div className="bg-[#07090e] p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jornadas:</span>
                  <strong className="text-white">
                    {selectedRegForDetail.attendanceDays === 'BOTH_DAYS' ? 'Ambos Días' : selectedRegForDetail.attendanceDays === 'SATURDAY_ONLY' ? 'Solo Sábado' : 'Solo Domingo'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Acompañantes en Sede:</span>
                  <strong className="text-sky-400 font-mono">+{selectedRegForDetail.companionsCount || 0} personas</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cena del Sábado (Asado):</span>
                  <strong className="text-red-400 font-mono">
                    {selectedRegForDetail.dinnerComensalesCount || 0} comensales
                  </strong>
                </div>
                {selectedRegForDetail.dietaryRestrictions && (
                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-amber-400 font-bold block text-[10px] uppercase">Restricciones Dietarias / Celíacos:</span>
                    <p className="text-amber-200 mt-0.5">{selectedRegForDetail.dietaryRestrictions}</p>
                  </div>
                )}
              </div>

              {/* Modalidad Domingo */}
              <div className="bg-[#07090e] p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Modalidades del Domingo:</span>
                <div className="text-white">
                  {selectedRegForDetail.competeSingles && <div>• 501 Individual</div>}
                  {selectedRegForDetail.competeDoubles && (
                    <div>
                      • 501 Parejas ({selectedRegForDetail.doublesPartnerMode === 'BLIND_DRAW' ? 'Sorteo a Ciegas / Blind Draw' : `Compañero: ${selectedRegForDetail.doublesPartnerName || 'Armada'}`})
                    </div>
                  )}
                </div>
              </div>

              {/* Contacto y Estado de Pago */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {selectedRegForDetail.phoneWhatsApp && (
                    <a
                      href={`https://wa.me/${selectedRegForDetail.phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Directo</span>
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleTogglePaymentStatus(selectedRegForDetail.id);
                    setSelectedRegForDetail(prev => prev ? { ...prev, paymentStatus: prev.paymentStatus === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED' } : null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                    selectedRegForDetail.paymentStatus === 'CONFIRMED'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-amber-400 text-black'
                  }`}
                >
                  {selectedRegForDetail.paymentStatus === 'CONFIRMED' ? 'PAGO CONFIRMADO' : 'PAGO PENDIENTE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VISTA DE IMPRESIÓN PARA MESA DE ENTRADA */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white text-black p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b-2 border-black pb-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Mesa de Entrada &amp; Acreditación Oficial
                </h2>
                <p className="text-sm font-bold text-gray-700">
                  {activeSelectedTournament?.title || 'Gran Open Mar del Plata 2026'} • Sociedad de Fomento Nueva Pompeya
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fecha de Impresión: {new Date().toLocaleDateString('es-AR')} • Total Acreditados: {filteredRegistrations.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl hover:bg-emerald-700 shadow-md"
                >
                  Imprimir Ahora
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-black text-xs uppercase rounded-xl hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-[10px] font-black uppercase">
                  <th className="py-2">#</th>
                  <th className="py-2">Competidor</th>
                  <th className="py-2">DNI / Pasaporte</th>
                  <th className="py-2">Origen</th>
                  <th className="py-2">Jornadas</th>
                  <th className="py-2">Acompañantes</th>
                  <th className="py-2">Cena Sábado</th>
                  <th className="py-2">Domingo</th>
                  <th className="py-2">Pago</th>
                  <th className="py-2">Firma / Acreditación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredRegistrations.map((r, i) => (
                  <tr key={r.id} className="py-2">
                    <td className="py-2.5 font-bold">{i + 1}</td>
                    <td className="py-2.5 font-black">{r.fullName} <span className="text-gray-500">(@{r.nickname})</span></td>
                    <td className="py-2.5 font-mono">{r.dniOrPassport || 'En Mesa'}</td>
                    <td className="py-2.5">{r.city}, {r.province}</td>
                    <td className="py-2.5">{r.attendanceDays === 'BOTH_DAYS' ? 'Ambos Días' : r.attendanceDays === 'SATURDAY_ONLY' ? 'Sábado' : 'Domingo'}</td>
                    <td className="py-2.5 font-bold">+{r.companionsCount || 0}</td>
                    <td className="py-2.5 font-bold">{r.dinnerComensalesCount || 0} comensales {r.dietaryRestrictions ? `(${r.dietaryRestrictions})` : ''}</td>
                    <td className="py-2.5">{r.competeSingles && r.competeDoubles ? 'Ambos' : r.competeDoubles ? 'Parejas' : 'Individual'}</td>
                    <td className="py-2.5 font-bold">{r.paymentStatus === 'CONFIRMED' ? 'PAGADO' : 'PENDIENTE'}</td>
                    <td className="py-2.5 border-b border-gray-400 w-28"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
