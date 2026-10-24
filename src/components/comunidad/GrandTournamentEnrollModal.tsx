'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageCircle, 
  UtensilsCrossed, 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { COUNTRIES, PROVINCIAS_ARGENTINA, DEFAULT_ASSOCIATION_BANK_ACCOUNT } from '@/lib/constants';
import { AttendanceDays, GrandTournamentRegistration, LandingShowcaseSettings, Tournament } from '@/lib/types';
import { 
  addGrandTournamentRegistration, 
  getCurrentPlayerProfile, 
  getStoredTournaments, 
  saveStoredTournaments, 
  saveTournamentToCloud,
  getStoredLandingShowcases,
  saveStoredLandingShowcases
} from '@/lib/storage';

interface GrandTournamentEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroSettings: LandingShowcaseSettings['heroTournament'];
  onSuccess?: () => void;
}

export const GrandTournamentEnrollModal: React.FC<GrandTournamentEnrollModalProps> = ({
  isOpen,
  onClose,
  heroSettings,
  onSuccess
}) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dniOrPassport, setDniOrPassport] = useState('');
  const [countryCode, setCountryCode] = useState('AR');
  const [city, setCity] = useState('Mar del Plata');
  const [province, setProvince] = useState('Buenos Aires');
  const [club, setClub] = useState('Darderos Mar del Plata');
  const [email, setEmail] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');

  // Logística Fomento
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDays>('BOTH_DAYS');
  const [companionsCount, setCompanionsCount] = useState<number>(0);
  const [dinnerComensalesCount, setDinnerComensalesCount] = useState<number>(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [notes, setNotes] = useState('');

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRegistration, setCreatedRegistration] = useState<GrandTournamentRegistration | null>(null);

  // Precargar con el jugador logueado si existe
  useEffect(() => {
    if (isOpen) {
      setStep('FORM');
      const currentUser = getCurrentPlayerProfile();
      if (currentUser) {
        if (currentUser.fullName) setFullName(currentUser.fullName);
        if (currentUser.nickname) setNickname(currentUser.nickname);
        if (currentUser.email) setEmail(currentUser.email);
        if (currentUser.countryCode) setCountryCode(currentUser.countryCode);
        if (currentUser.city) setCity(currentUser.city);
        if (currentUser.province) setProvince(currentUser.province);
        if (currentUser.club) setClub(currentUser.club);
        if (currentUser.phoneWhatsApp) setPhoneWhatsApp(currentUser.phoneWhatsApp);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dniOrPassport.trim()) {
      alert('Por favor completa tu nombre y documento o pasaporte oficial.');
      return;
    }

    setIsSubmitting(true);

    try {
      const regId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newRegistration: GrandTournamentRegistration = {
        id: regId,
        tournamentId: heroSettings.tournamentId || 'torneo-open-mdq-2026',
        registeredAt: new Date().toISOString(),
        fullName: fullName.trim(),
        nickname: nickname.trim() || fullName.trim().split(' ')[0],
        dniOrPassport: dniOrPassport.trim().toUpperCase(),
        nationality: selectedCountry.name,
        countryCode: selectedCountry.code,
        city: city.trim() || 'Mar del Plata',
        province: province.trim() || 'Buenos Aires',
        club: club.trim() || 'Independiente',
        email: email.trim(),
        phoneWhatsApp: phoneWhatsApp.trim(),
        attendanceDays,
        companionsCount: Number(companionsCount) || 0,
        dinnerComensalesCount: Number(dinnerComensalesCount) || 1,
        dietaryRestrictions: dietaryRestrictions.trim() || undefined,
        notes: notes.trim() || undefined,
        paymentStatus: 'PENDING',
        paymentMethod: 'TRANSFERENCIA_BANCARIA'
      };

      // 1. Guardar en registro unificado del Gran Torneo
      const updatedRegistrations = addGrandTournamentRegistration(newRegistration);
      setCreatedRegistration(newRegistration);

      // 2. Sincronizar contador real en heroSettings
      const currentShowcases = getStoredLandingShowcases();
      const updatedShowcases: LandingShowcaseSettings = {
        ...currentShowcases,
        heroTournament: {
          ...currentShowcases.heroTournament,
          registeredCount: updatedRegistrations.length,
          lastSyncedAt: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
      saveStoredLandingShowcases(updatedShowcases);

      // 3. REGISTRAR SIMULTÁNEAMENTE EN EL TORNEO OFICIAL CREADO PARA ESA FECHA
      const tournaments = getStoredTournaments();
      let targetTournamentIndex = -1;

      // Prioridad 1: Coincidencia por ID explícito del torneo vinculado
      if (heroSettings.tournamentId) {
        targetTournamentIndex = tournaments.findIndex(t => t.id === heroSettings.tournamentId);
      }

      // Prioridad 2: Coincidencia por fecha de encuentro
      if (targetTournamentIndex < 0 && heroSettings.date) {
        const cleanHeroDate = heroSettings.date.toLowerCase();
        targetTournamentIndex = tournaments.findIndex(t => {
          if (!t.startDate) return false;
          const s = t.startDate.toLowerCase();
          return s.includes('21') || s.includes('22') || s.includes(cleanHeroDate);
        });
      }

      // Prioridad 3: Coincidencia por palabras clave del título del torneo
      if (targetTournamentIndex < 0) {
        targetTournamentIndex = tournaments.findIndex(t => 
          t.title.toLowerCase().includes('open') || 
          t.title.toLowerCase().includes('mar del plata') ||
          t.title.toLowerCase().includes('pompeya')
        );
      }

      const playerItem = {
        id: regId,
        name: newRegistration.fullName,
        nickname: newRegistration.nickname,
        avatarUrl: '/logos/logo-mdq.png',
        nationality: newRegistration.nationality,
        countryCode: newRegistration.countryCode,
        enrolledAt: newRegistration.registeredAt
      };

      if (targetTournamentIndex >= 0) {
        // Enrolar en el torneo existente
        const target = tournaments[targetTournamentIndex];
        const alreadyEnrolled = target.enrolledPlayers?.some((p: any) => 
          p.id === regId || 
          p.name.toLowerCase() === newRegistration.fullName.toLowerCase()
        );

        if (!alreadyEnrolled) {
          const updatedEnrolled = [
            ...(target.enrolledPlayers || []),
            playerItem
          ];

          const updatedTarget: Tournament = {
            ...target,
            registeredCount: Math.max((target.registeredCount || 0) + 1, updatedEnrolled.length),
            enrolledPlayers: updatedEnrolled
          };

          tournaments[targetTournamentIndex] = updatedTarget;
          saveStoredTournaments(tournaments);
          saveTournamentToCloud(updatedTarget).catch(err => console.warn('[Cloud Sync Error]', err));
        }
      } else {
        // Si aún no se creó el torneo para esa fecha, crearlo automáticamente con el primer inscripto
        const autoTourneyId = heroSettings.tournamentId || 'torneo-open-mdq-2026';
        const createdTournament: Tournament = {
          id: autoTourneyId,
          slug: autoTourneyId,
          title: heroSettings.title || 'Gran Open Mar del Plata 2026',
          description: 'Torneo Oficial presencial candidato a sede de clasificación internacional PDC.',
          type: 'PRESENCIAL',
          format: 'SINGLE_ELIMINATION',
          competitionMode: 'STANDALONE_DAY',
          startingScore: 501,
          outMode: 'DOUBLE_OUT',
          startDate: '2026-11-21T09:00:00Z',
          endDate: '2026-11-22T21:00:00Z',
          venueName: heroSettings.venue || 'Sociedad de Fomento Nueva Pompeya',
          city: heroSettings.highlightCity || 'Mar del Plata',
          province: 'Buenos Aires',
          status: 'REGISTRATION_OPEN',
          bannerImageUrl: '/logos/logo-mdq.png',
          bestOfLegs: 5,
          registeredCount: 1,
          maxParticipants: heroSettings.maxParticipants || 64,
          isPaid: true,
          entryFeeArs: 0,
          prizePoolArs: 0,
          organizer: 'Darderos Mar del Plata & Mariano Deux',
          enrolledPlayers: [playerItem],
          matches: []
        };
        tournaments.unshift(createdTournament);
        saveStoredTournaments(tournaments);
        saveTournamentToCloud(createdTournament).catch(err => console.warn('[Cloud Sync Error]', err));
      }

      // Notificar a toda la aplicación del nuevo inscripto para actualización en vivo de llaves y cuadros
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('lpld_tournaments_updated'));
      }

      setStep('SUCCESS');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error al registrar inscripción:', err);
      alert('Ocurrió un error al registrar la inscripción. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttendanceLabel = (days: AttendanceDays) => {
    switch (days) {
      case 'BOTH_DAYS':
        return 'Fin de semana completo (Sábado 21 & Domingo 22)';
      case 'SATURDAY_ONLY':
        return 'Solo Sábado 21 (No oficial & Cena Bienvenida)';
      case 'SUNDAY_ONLY':
        return 'Solo Domingo 22 (Fecha Oficial Liga Nacional)';
    }
  };

  const bank = DEFAULT_ASSOCIATION_BANK_ACCOUNT;
  const whatsappAdminNumber = bank.adminWhatsAppPhone || '5492235551234';

  const generateWhatsAppMessage = () => {
    if (!createdRegistration) return '';
    const text = `🎯 *INSCRIPCIÓN OFICIAL • GRAN OPEN MAR DEL PLATA 2026*
¡Hola Mariano! Acabo de registrarme a través de la App para el torneo en la Sociedad de Fomento Nueva Pompeya:

👤 *Jugador:* ${createdRegistration.fullName} (${createdRegistration.nickname})
🆔 *DNI / Pasaporte:* ${createdRegistration.dniOrPassport}
🌍 *Nacionalidad:* ${selectedCountry.flag} ${createdRegistration.nationality} - ${createdRegistration.city}, ${createdRegistration.province}
🎯 *Club:* ${createdRegistration.club}
📅 *Días de Asistencia:* ${getAttendanceLabel(createdRegistration.attendanceDays)}
👥 *Acompañantes en Sede:* ${createdRegistration.companionsCount} persona(s)
🍽️ *Comensales Cena Sábado:* ${createdRegistration.dinnerComensalesCount} comensal(es)
${createdRegistration.dietaryRestrictions ? `⚠️ *Menú/Dieta:* ${createdRegistration.dietaryRestrictions}\n` : ''}
Adjunto a continuación el comprobante de pago para la acreditación oficial. ¡Muchas gracias!`;
    return encodeURIComponent(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0b0e14] border-2 border-[#00b853]/60 rounded-3xl shadow-[0_0_50px_rgba(0,184,83,0.3)] my-auto overflow-hidden relative text-slate-200">
        
        {/* Cabecera Oficial */}
        <div className="bg-gradient-to-r from-[#141824] via-[#1c2236] to-[#141824] p-5 sm:p-6 border-b border-slate-800 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00b853]/15 border border-[#00b853]/40 flex items-center justify-center text-[#00b853] shadow-lg shadow-[#00b853]/20 flex-shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#e52521] text-white px-2 py-0.5 rounded-full">
                  Candidatura Sede PDC
                </span>
                <span className="text-[10px] font-bold text-[#00b853] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Formulario Oficial Integrado
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {heroSettings.title} {heroSettings.highlightCity} {heroSettings.year}
              </h2>
              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#00b853]" /> {heroSettings.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#e52521]" /> {heroSettings.venue}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        {step === 'FORM' ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Aviso informativo de Candidatura PDC y Fomento */}
            <div className="bg-[#141824] border border-[#00b853]/30 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-black text-[#00b853]">
                <Sparkles className="w-4 h-4" />
                <span>Inscripción Unificada: Registro al Torneo + Logística de Sede & PDC</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Completando este formulario quedas inscripto directamente en el torneo, organizamos la previsión de aforo y comensales para la cena del sábado con la <strong>Sociedad de Fomento Nueva Pompeya</strong>, y generamos tu ficha federada con estándares de homologación para la <strong>PDC</strong> (Professional Darts Corporation).
              </p>
            </div>

            {/* SECCIÓN 1: IDENTIFICACIÓN Y PDC DOSSIER */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                <Globe2 className="w-4 h-4 text-[#00b853]" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  1. Ficha del Competidor & Homologación Internacional (PDC)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre Completo (como en DNI/Pasaporte) *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Mariano Deux"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Apodo de Jugador / Nickname</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ej: ICEMAN"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">DNI / Pasaporte / Cédula Oficial *</label>
                  <input
                    type="text"
                    required
                    value={dniOrPassport}
                    onChange={(e) => setDniOrPassport(e.target.value)}
                    placeholder="Ej: 32456789 o Pasaporte"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nacionalidad / País de Origen</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ciudad de Origen</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Mar del Plata"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Provincia / Región</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  >
                    {PROVINCIAS_ARGENTINA.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="Internacional">Visitante Internacional / Exterior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Club o Asociación</label>
                  <input
                    type="text"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    placeholder="Ej: Darderos Mar del Plata"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono WhatsApp de Contacto</label>
                  <input
                    type="tel"
                    value={phoneWhatsApp}
                    onChange={(e) => setPhoneWhatsApp(e.target.value)}
                    placeholder="Ej: +54 9 223 555-1234"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00b853]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: LOGÍSTICA SOCIEDAD DE FOMENTO & CRONOGRAMA */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                <UtensilsCrossed className="w-4 h-4 text-[#e52521]" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  2. Logística Sociedad de Fomento Nueva Pompeya & Días de Asistencia
                </h3>
              </div>

              {/* Selector de Días de Asistencia */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 text-xs">
                  ¿Qué jornadas del evento estarás presente?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAttendanceDays('BOTH_DAYS')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      attendanceDays === 'BOTH_DAYS'
                        ? 'bg-[#00b853]/15 border-[#00b853] text-white ring-1 ring-[#00b853]/50'
                        : 'bg-[#141824] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-black text-xs text-white">
                        <span>Fin de Semana Completo</span>
                        <span className="text-[10px] bg-[#00b853] text-black px-1.5 py-0.5 rounded-full font-bold">Recomendado</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Sábado 21 (amistosos + cena) y Domingo 22 (Oficial Liga Nacional).
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceDays('SATURDAY_ONLY')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      attendanceDays === 'SATURDAY_ONLY'
                        ? 'bg-[#ffe600]/15 border-[#ffe600] text-white ring-1 ring-[#ffe600]/50'
                        : 'bg-[#141824] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-black text-xs text-white">Solo Sábado 21 Nov</div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Torneos amistosos de bienvenida y Cena de Camaradería.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceDays('SUNDAY_ONLY')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      attendanceDays === 'SUNDAY_ONLY'
                        ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-white ring-1 ring-[#38bdf8]/50'
                        : 'bg-[#141824] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-black text-xs text-white">Solo Domingo 22 Nov</div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Fecha Oficial puntuable para la Liga Nacional de Dardos.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conteo de Acompañantes y Comensales Cena */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-[#141824] border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <label className="block text-slate-200 font-bold">
                    👥 Acompañantes en Sede (No jugadores)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Familiares o amigos que asistirán para presenciar el torneo (para coordinar capacidad con Fomento Pompeya).
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={companionsCount}
                      onChange={(e) => setCompanionsCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 bg-[#0b0e14] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center font-bold focus:border-[#00b853]"
                    />
                    <span className="text-xs text-slate-400 font-medium">persona(s) de acompañamiento</span>
                  </div>
                </div>

                <div className="bg-[#141824] border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <label className="block text-slate-200 font-bold">
                    🍽️ Comensales Cena de Bienvenida (Sábado)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Cantidad total de cubiertos requeridos para el asado/cena del sábado (incluyéndote a ti y acompañantes).
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="number"
                      min={attendanceDays === 'SUNDAY_ONLY' ? 0 : 1}
                      max={15}
                      value={dinnerComensalesCount}
                      onChange={(e) => setDinnerComensalesCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 bg-[#0b0e14] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center font-bold focus:border-[#00b853]"
                    />
                    <span className="text-xs text-slate-400 font-medium">comensal(es) para el sábado</span>
                  </div>
                </div>
              </div>

              {/* Dietas y Notas */}
              <div className="text-xs">
                <label className="block text-slate-300 font-bold mb-1">
                  Restricciones Alimentarias / Menú Especial
                </label>
                <input
                  type="text"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="Ej: Celíaco / Vegetariano / Sin sal / Ninguna"
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#00b853]"
                />
              </div>
            </div>

            {/* SECCIÓN 3: DATOS BANCARIOS OFICIALES */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                <DollarSign className="w-4 h-4 text-[#00b853]" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  3. Arancel e Información de Pago (Transferencia Bancaria Oficial)
                </h3>
              </div>

              <div className="bg-[#141824] border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Banco Oficial:</span>
                    <strong className="text-white font-black">{bank.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Titular de la Cuenta:</span>
                    <strong className="text-white font-bold">{bank.holderName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">CUIT:</span>
                    <strong className="text-slate-300 font-mono">{bank.cuitCuil}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Alias */}
                  <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Alias de Transferencia:</span>
                      <strong className="text-[#00b853] font-mono text-sm tracking-wide">{bank.alias}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bank.alias, 'alias')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 transition-all"
                    >
                      {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'alias' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* CBU */}
                  <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">CBU / CVU:</span>
                      <strong className="text-slate-200 font-mono text-xs">{bank.cbuCvu}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bank.cbuCvu, 'cbu')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 transition-all"
                    >
                      {copiedField === 'cbu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'cbu' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  * Tras enviar el formulario se abrirá un enlace directo para remitir el comprobante de transferencia al organizador ({bank.adminWhatsAppName}).
                </p>
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN FINAL */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-4 bg-[#00b853] hover:bg-[#00c853] active:scale-[0.98] text-[#07090e] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#00b853]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-[#07090e]" />
                <span>{isSubmitting ? 'Registrando en Torneo y Sede...' : 'CONFIRMAR INSCRIPCIÓN Y REGISTRARME'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          /* PANTALLA DE CONFIRMACIÓN Y ÉXITO */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00b853]/20 border-2 border-[#00b853] text-[#00b853] mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(0,184,83,0.4)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white">
                ¡Inscripción Registrada con Éxito!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Tus datos federados fueron agregados al padrón de competidores del <strong>{heroSettings.title} {heroSettings.highlightCity}</strong> y comunicados a la logística de la Sociedad de Fomento Nueva Pompeya.
              </p>
            </div>

            {/* Resumen de acreditación */}
            {createdRegistration && (
              <div className="bg-[#141824] border border-slate-800 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Jugador:</span>
                  <strong className="text-white font-bold">{createdRegistration.fullName} ({createdRegistration.nickname})</strong>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Días de Asistencia:</span>
                  <strong className="text-[#00b853]">{getAttendanceLabel(createdRegistration.attendanceDays)}</strong>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Acompañantes en Sede:</span>
                  <strong className="text-white">{createdRegistration.companionsCount} persona(s)</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Comensales Cena Sábado:</span>
                  <strong className="text-[#ffe600]">{createdRegistration.dinnerComensalesCount} cubierto(s)</strong>
                </div>
              </div>
            )}

            {/* Badge de Confirmación en Torneo */}
            <div className="inline-flex items-center gap-2 bg-[#00e676]/10 border border-[#00e676]/40 px-3.5 py-1.5 rounded-full text-xs text-[#00e676] font-bold mx-auto">
              <Trophy className="w-3.5 h-3.5" />
              <span>Inscripto formalmente en la Llave y Cuadro Oficial de la App</span>
            </div>

            {/* Botón directo a WhatsApp con comprobante */}
            <div className="space-y-3 max-w-md mx-auto pt-1">
              <a
                href={`https://wa.me/${whatsappAdminNumber}?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-[#07090e] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#25D366]/30 flex items-center justify-center gap-2.5"
              >
                <MessageCircle className="w-5 h-5 fill-[#07090e]" />
                <span>ENVIAR COMPROBANTE POR WHATSAPP</span>
              </a>

              <div className="flex gap-2">
                <a
                  href="/torneos"
                  className="flex-1 py-3 bg-[#00e676]/15 hover:bg-[#00e676]/25 text-[#00e676] border border-[#00e676]/40 font-black text-xs uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Ver Cuadro en Torneos</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
