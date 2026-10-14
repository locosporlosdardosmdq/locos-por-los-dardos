'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Server, 
  Database, 
  HardDrive, 
  Wifi, 
  Users, 
  BarChart3, 
  PieChart, 
  Globe, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Layers, 
  Sliders, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ExternalLink, 
  Sparkles, 
  ArrowLeft,
  PauseCircle,
  UserX,
  Building2, 
  Landmark, 
  Award,
  CreditCard,
  MessageCircle,
  Clock,
  Activity,
  TrendingUp,
  FileSpreadsheet,
  Check,
  LayoutTemplate
} from 'lucide-react';
import { 
  ADMIN_EMAILS, 
  ADMIN_MASTER_PASSWORD, 
  validateAdminCredentials, 
  isUserAdmin,
  isUserSuperAdmin,
  canUserManageTournaments,
  MOCK_CURRENT_USER,
  COUNTRIES,
  PROVINCIAS_ARGENTINA,
  DEFAULT_ASSOCIATION_AUTHORITIES,
  DEFAULT_ASSOCIATION_BANK_ACCOUNT,
  calculateAgeFromBirthDate
} from '@/lib/constants';
import { 
  getCurrentPlayerProfile, 
  saveCurrentPlayerProfile,
  getStoredAssociationAuthorities, 
  saveStoredAssociationAuthorities,
  getStoredAssociationBankAccount, 
  saveStoredAssociationBankAccount,
  getStoredLandingShowcases, 
  saveStoredLandingShowcases,
  DEFAULT_LANDING_SHOWCASES,
  fetchRegisteredPlayersFromCloud
} from '@/lib/storage';
import { 
  AssociationAuthority, 
  AssociationBankAccount, 
  AssociationScope, 
  LandingShowcaseSettings, 
  PlayerProfile 
} from '@/lib/types';
import { 
  INFRASTRUCTURE_METRICS, 
  MODULE_TRAFFIC_RANKING, 
  COMMUNITY_DEMOGRAPHICS 
} from '@/lib/community-analytics';
import { CANONICAL_PLAYERS } from '@/lib/players-data';

export default function SuperadminPage() {
  // Estado de autenticación
  const [currentUser, setCurrentUser] = useState<PlayerProfile>(() => {
    return getCurrentPlayerProfile(MOCK_CURRENT_USER);
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isUserSuperAdmin(currentUser);
  });

  // Credenciales para login si no está autenticado
  const [loginEmail, setLoginEmail] = useState('marianodeux@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Pestañas principales del Super Admin
  type MainTab = 'INFRASTRUCTURE' | 'DEMOGRAPHICS' | 'SHOWCASES' | 'AUTHORITIES';
  const [activeTab, setActiveTab] = useState<MainTab>('INFRASTRUCTURE');

  // Subpestañas de Vitrinas (DBikes style)
  type ShowcaseSubTab = 'HERO_TOURNAMENT' | 'COMMUNITY' | 'CLUBS' | 'PAYMENTS';
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<ShowcaseSubTab>('HERO_TOURNAMENT');

  // Estado de vitrinas de la landing
  const [showcases, setShowcases] = useState<LandingShowcaseSettings>(() => {
    return getStoredLandingShowcases(DEFAULT_LANDING_SHOWCASES);
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Estado de sincronización de Google Forms
  const [isSyncingGoogleForm, setIsSyncingGoogleForm] = useState(false);
  const [googleSyncMsg, setGoogleSyncMsg] = useState<string | null>(null);

  // Estado de autoridades de la Asociación
  const [authoritiesScope, setAuthoritiesScope] = useState<AssociationScope>('MDQ');
  const [authorities, setAuthorities] = useState<AssociationAuthority[]>(() => {
    return getStoredAssociationAuthorities(DEFAULT_ASSOCIATION_AUTHORITIES);
  });
  const [bankAccount, setBankAccount] = useState<AssociationBankAccount>(() => {
    return getStoredAssociationBankAccount(DEFAULT_ASSOCIATION_BANK_ACCOUNT);
  });

  // Estado para crear/editar autoridad
  const [editingAuth, setEditingAuth] = useState<AssociationAuthority | null>(null);
  const [authSelectedPlayerId, setAuthSelectedPlayerId] = useState<string>('custom');
  const [authRoleTitle, setAuthRoleTitle] = useState('');
  const [authName, setAuthName] = useState('');
  const [authNickname, setAuthNickname] = useState('');
  const [authClub, setAuthClub] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authProvince, setAuthProvince] = useState('');
  const [authPhotoUrl, setAuthPhotoUrl] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');

  // Jugadores registrados en la nube (Supabase)
  const [cloudPlayers, setCloudPlayers] = useState<any[]>([]);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState<string | null>(null);

  const loadRegisteredPlayers = React.useCallback(async () => {
    try {
      const list = await fetchRegisteredPlayersFromCloud(true);
      if (list && list.length > 0) {
        setCloudPlayers(list);
      }
    } catch (err) {
      console.warn('[Superadmin] Error fetching cloud players:', err);
    }
  }, []);

  useEffect(() => {
    loadRegisteredPlayers();
  }, [loadRegisteredPlayers]);

  // Lista de jugadores disponibles para asignar a la comisión y padrón federal
  const availablePlayers = useMemo(() => {
    const map = new Map<string, any>();
    
    // Primero agregar ICEMAN
    map.set('user-iceman-admin', {
      id: 'user-iceman-admin',
      name: 'Mariano Deux (ICEMAN)',
      nickname: 'ICEMAN',
      city: 'Mar del Plata',
      province: 'Buenos Aires',
      nationality: 'Argentina',
      countryCode: 'AR',
      birthDate: '1982-05-15',
      age: 44,
      club: 'Darderos Mar del Plata',
      photoUrl: '/images/iceman-perfil.png',
      category: 'INTERMEDIA',
      status: 'ACTIVE',
      estimatedAvg: 48.0,
      email: 'marianodeux@gmail.com'
    });

    // Agregar jugadores registrados en Supabase
    cloudPlayers.forEach(p => {
      const isIceman = p.nickname?.toUpperCase() === 'ICEMAN' || p.email?.toLowerCase() === 'marianodeux@gmail.com';
      if (!isIceman) {
        const cleanPhoto = p.photoUrl && !p.photoUrl.includes('iceman') ? p.photoUrl : undefined;
        const cleanAvatar = p.avatarUrl && !p.avatarUrl.includes('iceman') ? p.avatarUrl : undefined;
        const playerAge = p.age || (p.birthDate ? calculateAgeFromBirthDate(p.birthDate) : undefined);
        map.set(p.id, {
          id: p.id,
          name: p.fullName || p.name || p.nickname || 'Jugador',
          nickname: p.nickname || '',
          city: p.city || 'Mar del Plata',
          province: p.province || 'Buenos Aires',
          nationality: p.nationality || 'Argentina',
          countryCode: p.countryCode || 'AR',
          birthDate: p.birthDate,
          age: playerAge,
          club: p.club || 'Darderos Mar del Plata',
          photoUrl: cleanPhoto || cleanAvatar || undefined,
          category: p.category || 'INTERMEDIA',
          status: p.status || 'ACTIVE',
          estimatedAvg: p.estimatedAvg || (p.stats?.overallAvg ? Number(p.stats.overallAvg) : 45.0),
          email: p.email
        });
      }
    });

    return Array.from(map.values());
  }, [cloudPlayers]);

  // Métricas demográficas 100% dinámicas calculadas desde los jugadores registrados reales
  const demographics = useMemo(() => {
    const list = availablePlayers;
    const total = list.length;

    // Edades registradas
    const validAges = list
      .map(p => Number(p.age))
      .filter(a => !isNaN(a) && a > 0);
    const avgAge = validAges.length > 0 
      ? (validAges.reduce((acc, val) => acc + val, 0) / validAges.length).toFixed(1)
      : null;

    // Provincias únicas
    const provincesMap = new Map<string, number>();
    list.forEach(p => {
      const prov = p.province || 'Buenos Aires';
      provincesMap.set(prov, (provincesMap.get(prov) || 0) + 1);
    });
    const provincesDistribution = Array.from(provincesMap.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Ciudades / Localidades únicas
    const localitiesMap = new Map<string, number>();
    list.forEach(p => {
      const city = p.city || 'Mar del Plata';
      localitiesMap.set(city, (localitiesMap.get(city) || 0) + 1);
    });
    const localitiesDistribution = Array.from(localitiesMap.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Países / Nacionalidades
    const countriesMap = new Map<string, number>();
    list.forEach(p => {
      const nat = p.nationality || 'Argentina';
      countriesMap.set(nat, (countriesMap.get(nat) || 0) + 1);
    });
    const countriesDistribution = Array.from(countriesMap.entries()).map(([name, count]) => {
      const flag = name.toLowerCase().includes('arg') ? '🇦🇷' : '🌐';
      return {
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        flag
      };
    }).sort((a, b) => b.count - a.count);

    // Rango de Edades
    const ageRanges = [
      { range: '18 a 25 años', min: 18, max: 25, color: '#38bdf8' },
      { range: '26 a 35 años (Núcleo Competitivo)', min: 26, max: 35, color: '#00e676' },
      { range: '36 a 45 años', min: 36, max: 45, color: '#ffe600' },
      { range: '46 a 65+ años (Veteranos)', min: 46, max: 120, color: '#ef4444' }
    ];
    const ageDistribution = ageRanges.map(r => {
      const count = validAges.filter(a => a >= r.min && a <= r.max).length;
      return {
        range: r.range,
        count,
        percentage: validAges.length > 0 ? Math.round((count / validAges.length) * 100) : 0,
        color: r.color
      };
    });

    // Categorías Oficiales
    const catCounts = {
      PRINCIPIANTE: list.filter(p => p.category === 'PRINCIPIANTE').length,
      INTERMEDIA: list.filter(p => p.category === 'INTERMEDIA').length,
      AVANZADA: list.filter(p => p.category === 'AVANZADA').length,
      ELITE: list.filter(p => p.category === 'ELITE').length,
    };

    // AVG Promedio General
    const avgs = list.map(p => Number(p.estimatedAvg || 45)).filter(a => !isNaN(a) && a > 0);
    const overallAvg = avgs.length > 0
      ? (avgs.reduce((acc, v) => acc + v, 0) / avgs.length).toFixed(1)
      : '45.0';

    return {
      totalRegisteredPlayers: total,
      averageAge: avgAge,
      hasAgeData: validAges.length > 0,
      totalProvincesRepresented: provincesMap.size,
      totalLocalitiesRepresented: localitiesMap.size,
      countriesDistribution,
      provincesDistribution,
      localitiesDistribution,
      ageDistribution,
      categoryCounts: catCounts,
      overallAvg
    };
  }, [availablePlayers]);

  // Modificar categoría de jugador directamente desde el Superadmin
  const handleUpdatePlayerCategoryFromAdmin = async (player: any, newCategory: string) => {
    try {
      setIsUpdatingCategory(player.id);
      const updated = {
        ...player,
        category: newCategory
      };
      const res = await fetch('/api/jugadores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: player.id, category: newCategory })
      });
      if (res.ok) {
        setSaveSuccessMsg(`¡Categoría de ${player.nickname || player.name} actualizada a ${newCategory} con éxito!`);
        await loadRegisteredPlayers();
      } else {
        alert('Error al actualizar la categoría en el servidor.');
      }
    } catch (err) {
      console.error('Error updating player category:', err);
      alert('Error de red al actualizar la categoría.');
    } finally {
      setIsUpdatingCategory(null);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  // Modificar estado de jugador (Activo, Suspendido, Dado de Baja) sin perder métricas
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const handleUpdatePlayerStatusFromAdmin = async (player: any, newStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') => {
    const isIceman = player.nickname?.toUpperCase() === 'ICEMAN' || player.email?.toLowerCase() === 'marianodeux@gmail.com';
    if (isIceman) {
      alert('El perfil de Super Administrador (ICEMAN) no puede ser suspendido ni dado de baja.');
      return;
    }

    const actionName = newStatus === 'ACTIVE' ? 'reactivar' : newStatus === 'SUSPENDED' ? 'suspender' : 'dar de baja';
    const confirmMsg = `¿Confirmas ${actionName} a "${player.nickname || player.name}"?\n\nSus partidas jugadas, promedios y estadísticas históricas se mantendrán 100% intactas en la base de datos.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsUpdatingStatus(player.id);
      const res = await fetch('/api/jugadores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: player.id, status: newStatus })
      });
      if (res.ok) {
        const label = newStatus === 'ACTIVE' ? 'reactivado' : newStatus === 'SUSPENDED' ? 'suspendido' : 'dado de baja';
        setSaveSuccessMsg(`¡Jugador ${player.nickname || player.name} ${label} con éxito! Historial preservado.`);
        await loadRegisteredPlayers();
      } else {
        alert('Error al actualizar el estado del jugador en el servidor.');
      }
    } catch (err) {
      console.error('Error updating player status:', err);
      alert('Error de red al actualizar el estado del jugador.');
    } finally {
      setIsUpdatingStatus(null);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  // Modificar rol de plataforma (PLAYER, ADMIN, SUPERADMIN)
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const handleUpdatePlayerRoleFromAdmin = async (player: any, newRole: string) => {
    const isIceman = player.id === 'user-iceman-admin' || player.nickname?.toUpperCase() === 'ICEMAN' || player.email?.toLowerCase() === 'marianodeux@gmail.com';
    if (isIceman && newRole !== 'SUPERADMIN') {
      alert('El perfil de Mariano Deux (ICEMAN) es el Superadministrador Root inmutable de la plataforma.');
      return;
    }

    try {
      setIsUpdatingRole(player.id);
      const res = await fetch('/api/jugadores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: player.id, role: newRole })
      });
      if (res.ok) {
        const roleLabel = newRole === 'SUPERADMIN' 
          ? 'Superadministrador Full' 
          : newRole === 'ADMIN' 
          ? 'Administrador de Torneos (Edición y Borrado de Llaves)' 
          : 'Jugador Estándar';
        setSaveSuccessMsg(`¡Rol actualizado para ${player.nickname || player.name}: ${roleLabel}!`);
        await loadRegisteredPlayers();
      } else {
        alert('Error al actualizar el rol en el servidor.');
      }
    } catch (err) {
      console.error('Error updating player role:', err);
      alert('Error de red al actualizar el rol.');
    } finally {
      setIsUpdatingRole(null);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  // Manejador de Login de Administrador
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (validateAdminCredentials(loginEmail, loginPassword)) {
      const updatedProfile = {
        ...currentUser,
        email: loginEmail.trim().toLowerCase(),
        role: 'SUPERADMIN' as const,
        nickname: 'ICEMAN'
      };
      setCurrentUser(updatedProfile);
      saveCurrentPlayerProfile(updatedProfile);
      setIsAuthenticated(true);
    } else {
      setLoginError('Credenciales incorrectas. Verifique el email de Superadmin o la clave maestra.');
    }
  };

  // Sincronizar Google Forms / Sheets para el Torneo
  const handleSyncGoogleForms = async () => {
    setIsSyncingGoogleForm(true);
    setGoogleSyncMsg(null);
    try {
      const url = showcases.heroTournament.googleFormUrl?.trim();
      if (!url) {
        setGoogleSyncMsg('Ingresa un enlace de Google Form o Google Sheets para sincronizar.');
        setIsSyncingGoogleForm(false);
        return;
      }

      const res = await fetch('/api/sync/google-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      if (data.success) {
        let updatedCount = showcases.heroTournament.registeredCount;
        if (typeof data.count === 'number') {
          updatedCount = data.count;
        }

        const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' hs';
        const updated = {
          ...showcases,
          heroTournament: {
            ...showcases.heroTournament,
            registeredCount: updatedCount,
            lastSyncedAt: now
          }
        };
        setShowcases(updated);
        saveStoredLandingShowcases(updated);
        setGoogleSyncMsg(data.message || `Sincronización procesada correctamente (${updatedCount} inscriptos).`);
      } else {
        setGoogleSyncMsg(data.error || 'No se pudo conectar con el enlace de Google.');
      }
    } catch (err: any) {
      console.error('Error syncing Google Form:', err);
      setGoogleSyncMsg('Error de conexión al sincronizar con Google.');
    } finally {
      setIsSyncingGoogleForm(false);
    }
  };

  // Guardar cambios en las vitrinas
  const handleSaveShowcases = () => {
    saveStoredLandingShowcases(showcases);
    setSaveSuccessMsg('Vitrinas de la Landing Page actualizadas correctamente.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Guardar cambios en datos bancarios
  const handleSaveBankAccount = () => {
    saveStoredAssociationBankAccount(bankAccount);
    setSaveSuccessMsg('Datos bancarios de cobro de inscripciones actualizados.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Cargar datos de jugador al cambiar en el selector de la comisión
  const handleSelectPlayerForAuth = (playerId: string) => {
    setAuthSelectedPlayerId(playerId);
    if (playerId === 'custom') {
      setAuthName('');
      setAuthNickname('');
      setAuthClub('');
      setAuthCity('');
      setAuthProvince('');
      setAuthPhotoUrl('');
      setAuthPhone('');
      setAuthEmail('');
    } else {
      const found = availablePlayers.find(p => p.id === playerId);
      if (found) {
        setAuthName(found.name.replace(/\(.*?\)/g, '').trim());
        setAuthNickname(found.nickname || '');
        setAuthClub(found.club || 'Darderos Mar del Plata');
        setAuthCity(found.city || 'Mar del Plata');
        setAuthProvince(found.province || 'Buenos Aires');
        setAuthPhotoUrl(found.photoUrl || '/logos/logo-mdq.png');
        if (found.id === 'user-iceman-admin' || found.email === 'marianodeux@gmail.com') {
          setAuthEmail('marianodeux@gmail.com');
          setAuthPhone('5492235218765');
        } else {
          setAuthEmail(found.email || '');
          setAuthPhone(found.phone || '');
        }
      }
    }
  };

  // Guardar autoridad y actualizar perfil deportivo del jugador
  const handleSaveAuthority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authRoleTitle.trim() || !authName.trim()) {
      alert('Debes indicar el cargo y el nombre de la autoridad.');
      return;
    }

    const scopeLabel = authoritiesScope === 'MDQ' ? 'Darderos MDQ' : 'Dardos Argentina';
    const majorRoleFormatted = `${authRoleTitle.toUpperCase()} • ${authoritiesScope === 'MDQ' ? 'ASOCIACIÓN DARDEROS MDQ' : 'DARDOS ARGENTINA'}`;

    let updatedAuthorities = [...authorities];
    if (editingAuth) {
      updatedAuthorities = updatedAuthorities.map(a => {
        if (a.id === editingAuth.id) {
          return {
            ...a,
            scope: authoritiesScope,
            playerId: authSelectedPlayerId !== 'custom' ? authSelectedPlayerId : undefined,
            name: authName.trim(),
            nickname: authNickname.trim(),
            roleTitle: authRoleTitle.trim(),
            photoUrl: authPhotoUrl.trim() || '/logos/logo-mdq.png',
            avatarUrl: authPhotoUrl.trim() || '/logos/logo-mdq.png',
            club: authClub.trim(),
            city: authCity.trim(),
            province: authProvince.trim() || 'Buenos Aires',
            phoneWhatsApp: authPhone.trim(),
            email: authEmail.trim()
          };
        }
        return a;
      });
    } else {
      const newAuth: AssociationAuthority = {
        id: `auth-${authoritiesScope.toLowerCase()}-${Date.now()}`,
        scope: authoritiesScope,
        playerId: authSelectedPlayerId !== 'custom' ? authSelectedPlayerId : undefined,
        name: authName.trim(),
        nickname: authNickname.trim(),
        roleTitle: authRoleTitle.trim(),
        photoUrl: authPhotoUrl.trim() || '/logos/logo-mdq.png',
        avatarUrl: authPhotoUrl.trim() || '/logos/logo-mdq.png',
        club: authClub.trim() || 'Darderos Mar del Plata',
        city: authCity.trim() || 'Mar del Plata',
        province: authProvince.trim() || 'Buenos Aires',
        orderIndex: updatedAuthorities.filter(a => a.scope === authoritiesScope).length + 1,
        phoneWhatsApp: authPhone.trim(),
        email: authEmail.trim()
      };
      updatedAuthorities.push(newAuth);
    }

    // Persistir autoridades
    saveStoredAssociationAuthorities(updatedAuthorities);
    setAuthorities(updatedAuthorities);

    // CRÍTICO: Impactar el cargo en el perfil del jugador
    if (authSelectedPlayerId === 'user-iceman-admin' || authEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      const updatedProfile: PlayerProfile = {
        ...currentUser,
        associationRole: `${authRoleTitle.trim()} • Asociación ${scopeLabel}`,
        majorTitle: majorRoleFormatted
      };
      setCurrentUser(updatedProfile);
      saveCurrentPlayerProfile(updatedProfile);
    }

    setEditingAuth(null);
    setAuthRoleTitle('');
    setAuthSelectedPlayerId('custom');
    setAuthName('');
    setAuthNickname('');
    setAuthClub('');
    setAuthCity('');
    setAuthProvince('');
    setAuthPhotoUrl('');
    setAuthPhone('');
    setAuthEmail('');

    setSaveSuccessMsg(`Autoridad guardada. El cargo directivo "${authRoleTitle}" ahora impacta en el perfil del jugador.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleDeleteAuthority = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta autoridad de la Comisión Directiva?')) {
      const filtered = authorities.filter(a => a.id !== id);
      saveStoredAssociationAuthorities(filtered);
      setAuthorities(filtered);
    }
  };

  const handleEditAuthorityClick = (auth: AssociationAuthority) => {
    setEditingAuth(auth);
    setAuthoritiesScope(auth.scope);
    setAuthSelectedPlayerId(auth.playerId || 'custom');
    setAuthRoleTitle(auth.roleTitle);
    setAuthName(auth.name);
    setAuthNickname(auth.nickname || '');
    setAuthClub(auth.club || '');
    setAuthCity(auth.city || '');
    setAuthProvince(auth.province || '');
    setAuthPhotoUrl(auth.photoUrl || '');
    setAuthPhone(auth.phoneWhatsApp || '');
    setAuthEmail(auth.email || '');
  };

  // =========================================================================
  // VISTA: PANTALLA DE ACCESO SEGURO SUPERADMIN (SI NO ESTÁ AUTENTICADO)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef4444]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center mx-auto text-[#ef4444] shadow-lg shadow-[#ef4444]/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Super Admin Backoffice</h1>
            <p className="text-xs text-slate-400">
              Acceso exclusivo para Mariano Deux (ICEMAN) • Control de Servidores, Vitrinas y Comisión
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Correo Electrónico Administrador</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Clave Maestra de Seguridad</label>
              <div className="relative">
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Introduce la clave maestra..."
                  required
                  className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none pr-10"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#ef4444]/25 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Ingresar al Panel de Superadmin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginPassword(ADMIN_MASTER_PASSWORD);
              }}
              className="w-full py-2 bg-[#141a29] hover:bg-[#1a2337] border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[11px] font-bold transition-all"
            >
              Completar clave de desarrollo
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA: PANEL PRINCIPAL SUPERADMIN
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20">
      {/* 1. TOP BAR OFICIAL SUPER ADMIN (DEUS GESTION STYLE) */}
      <header className="sticky top-0 z-30 bg-[#0a0e17]/95 backdrop-blur-md border-b border-[#1e2a40] px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/40 flex items-center justify-center text-[#ef4444] shadow-md shadow-[#ef4444]/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase tracking-tight">Super Admin</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30">
                  ROOT
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-[#00e676] border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse"></span>
                  Todos los Servicios Operacionales
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Locos por los Dardos • Control Central de Servidores, Vitrinas y Comisión Directiva
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-[#111622] border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#00e676]">
                <Image src="/images/iceman-perfil.png" alt="ICEMAN" fill className="object-cover" />
              </div>
              <span className="font-bold text-white hidden md:inline">Mariano Deux (ICEMAN)</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-[#141a29] hover:bg-[#1c2438] border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00e676]" />
              <span className="hidden sm:inline">Ver Web en Vivo</span>
            </Link>

            <button
              onClick={() => {
                if (confirm('¿Cerrar sesión del panel de Superadmin?')) {
                  setIsAuthenticated(false);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-bold transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* FEEDBACK DE GUARDADO FLOTANTE */}
      {saveSuccessMsg && (
        <div className="fixed top-16 right-4 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#00e676] flex-shrink-0" />
          <span className="font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. BARRA DE PESTAÑAS PRINCIPALES DEL SUPERADMIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-[#0f1422] border border-[#1e2a40] p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setActiveTab('INFRASTRUCTURE')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'INFRASTRUCTURE'
                ? 'bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/25'
                : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
            }`}
          >
            <Server className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">1. Cuotas & Servidores</span>
          </button>

          <button
            onClick={() => setActiveTab('DEMOGRAPHICS')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'DEMOGRAPHICS'
                ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/25'
                : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">2. Demografía & Edades</span>
          </button>

          <button
            onClick={() => setActiveTab('SHOWCASES')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'SHOWCASES'
                ? 'bg-[#ffe600] text-[#07090e] shadow-lg shadow-[#ffe600]/25'
                : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
            }`}
          >
            <LayoutTemplate className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">3. Vitrinas Landing</span>
          </button>

          <button
            onClick={() => setActiveTab('AUTHORITIES')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'AUTHORITIES'
                ? 'bg-[#38bdf8] text-[#07090e] shadow-lg shadow-[#38bdf8]/25'
                : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
            }`}
          >
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">4. Comisión Directiva</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL POR PESTAÑA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ================================================================= */}
        {/* PESTAÑA 1: INFRAESTRUCTURA & SERVIDORES (DEUS GESTION STYLE)     */}
        {/* ================================================================= */}
        {activeTab === 'INFRASTRUCTURE' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#ef4444] tracking-wider px-2 py-0.5 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30">
                  Infraestructura Cloud en Tiempo Real
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <Server className="w-6 h-6 text-[#ef4444]" />
                  <span>Cuotas, Servidores & Ranking de Consumo</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitoreo de almacenamiento en PostgreSQL Supabase, fotos en Storage, CDN Vercel Edge y túneles TURN WebRTC.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#00e676] text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sin Alertas de Quota</span>
                </span>
              </div>
            </div>

            {/* 4 CARDS PRINCIPALES DE CUOTAS (REPLICANDO SCREENSHOT 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INFRASTRUCTURE_METRICS.map((metric, idx) => (
                <div key={idx} className="bg-[#0f1422] border border-[#1e2a40] rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {metric.service}
                      </span>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        {metric.usedFormatted} <span className="text-xs font-normal text-slate-400">/ {metric.totalFormatted}</span>
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-500/20 text-[#00e676] border border-emerald-500/30">
                      {metric.percentageUsed}%
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-[#07090e] h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-[#00e676] to-[#38bdf8] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(metric.percentageUsed, 3)}%` }}
                    />
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                    <p>{metric.description}</p>
                    <p className="font-bold text-slate-300">{metric.extraInfo}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* RANKING DE CONSUMO Y TRÁFICO POR MÓDULO (REPLICANDO SCREENSHOT 3) */}
            <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2a40] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">Ranking de Consumo y Tráfico por Módulo</h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">4 Módulos Auditados</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2a40] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Módulo de la Plataforma</th>
                      <th className="py-2.5 px-3 text-center">Registros BD</th>
                      <th className="py-2.5 px-3 text-center">Storage</th>
                      <th className="py-2.5 px-3 text-center">Tráfico Estimado</th>
                      <th className="py-2.5 px-3 text-center">Impacto Global</th>
                      <th className="py-2.5 px-3 text-right">Nivel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2a40]/60">
                    {MODULE_TRAFFIC_RANKING.map((mod) => (
                      <tr key={mod.rank} className="hover:bg-[#141a29] transition-colors">
                        <td className="py-3 px-3 font-mono font-black text-[#00e676]">#{mod.rank}</td>
                        <td className="py-3 px-3 font-bold text-white">{mod.moduleName}</td>
                        <td className="py-3 px-3 text-center font-mono">{mod.recordsCount}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{mod.storageMb} MB</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{mod.estimatedMonthlyTraffic}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-mono font-black text-white">{mod.globalImpactPercent}%</span>
                            <div className="w-16 bg-[#07090e] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#ef4444] h-full rounded-full"
                                style={{ width: `${mod.globalImpactPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            mod.trafficLevel === 'Alto'
                              ? 'bg-red-500/20 text-[#ef4444]'
                              : mod.trafficLevel === 'Moderado'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-[#00e676]'
                          }`}>
                            {mod.trafficLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ESTRATEGIA DE ESCALABILIDAD & PLANES (REPLICANDO SCREENSHOT 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0f1422] border border-[#1e2a40] space-y-3">
                <h4 className="text-xs font-black uppercase text-[#00e676] flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Estado Actual: Capacidad Holgada</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El uso actual de base de datos (<strong>3.7%</strong>) y almacenamiento (<strong>4.3%</strong>) opera dentro del margen seguro del plan gratuito de Supabase y Vercel. No se requieren costos adicionales en la etapa actual del circuito.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f1422] border border-[#1e2a40] space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Criterios de Upgrade a Supabase & Vercel Pro</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Se recomienda activar Supabase Pro ($25 USD) al superar las 25 sedes activas o cuando la base supere los 350 MB para habilitar backups diarios automáticos de 7 días y ancho de banda dedicado para torneos masivos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 2: DEMOGRAFÍA & JUGADORES (PAÍS, PROVINCIAS, LOCALIDADES)*/}
        {/* ================================================================= */}
        {activeTab === 'DEMOGRAPHICS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#00e676] tracking-wider px-2 py-0.5 rounded-full bg-[#00e676]/15 border border-[#00e676]/30">
                  Comunidad Federada Nacional & Internacional
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#00e676]" />
                  <span>Jugadores por País, Provincias, Localidades y Edades</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estadísticas consolidadas del censo deportivo de Locos por los Dardos Argentina.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#0f1422] border border-[#1e2a40] text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">Edad Promedio Nacional</span>
                  <span className="text-sm font-black text-[#00e676] font-mono">
                    {demographics.hasAgeData ? `${demographics.averageAge} años` : 'Sin registrar'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 CARDS DE RESUMEN KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0f1422] border border-[#1e2a40] p-4 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">{demographics.totalRegisteredPlayers}</span>
                <span className="text-xs font-bold text-slate-400 block mt-1">Jugadores Registrados</span>
              </div>
              <div className="bg-[#0f1422] border border-[#1e2a40] p-4 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#00e676] font-mono">
                  {demographics.hasAgeData ? demographics.averageAge : '—'}
                </span>
                <span className="text-xs font-bold text-slate-400 block mt-1">Años (Edad Promedio)</span>
              </div>
              <div className="bg-[#0f1422] border border-[#1e2a40] p-4 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#38bdf8] font-mono">{demographics.totalProvincesRepresented}</span>
                <span className="text-xs font-bold text-slate-400 block mt-1">Provincias Activas</span>
              </div>
              <div className="bg-[#0f1422] border border-[#1e2a40] p-4 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{demographics.totalLocalitiesRepresented}</span>
                <span className="text-xs font-bold text-slate-400 block mt-1">Ciudades y Localidades</span>
              </div>
            </div>

            {/* GRILLA DE DISTRIBUCIONES: PAÍS, PROVINCIA, LOCALIDADES, EDADES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DISTRIBUCIÓN POR PAÍS */}
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e2a40] pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Distribución por País</h3>
                  </div>
                  <span className="text-xs text-slate-400">Total: {demographics.totalRegisteredPlayers}</span>
                </div>

                <div className="space-y-3">
                  {demographics.countriesDistribution.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-2 text-white">
                          <span className="text-base">{item.flag}</span>
                          <span>{item.name}</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          {item.count} {item.count === 1 ? 'jugador' : 'jugadores'} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#07090e] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#38bdf8] h-full rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DISTRIBUCIÓN DE EDADES & PIRÁMIDE ETARIA */}
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e2a40] pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Rango de Edades de Jugadores</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#00e676]">
                    {demographics.hasAgeData ? `Promedio: ${demographics.averageAge} años` : 'Sin datos cargados'}
                  </span>
                </div>

                {demographics.hasAgeData ? (
                  <div className="space-y-3">
                    {demographics.ageDistribution.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-white">{item.range}</span>
                          <span className="font-mono text-slate-300">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#07090e] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#07090e] border border-slate-800 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-300 block">Edad pendiente de completar en los perfiles</span>
                    <span className="text-[11px] text-slate-500 block">
                      Los {demographics.totalRegisteredPlayers} jugadores federados aún no han configurado su edad en la ficha deportiva.
                    </span>
                  </div>
                )}
              </div>

              {/* DISTRIBUCIÓN POR PROVINCIAS */}
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e2a40] pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Principales Provincias</h3>
                  </div>
                  <span className="text-xs text-slate-400">Circuito Federal</span>
                </div>

                <div className="space-y-3">
                  {demographics.provincesDistribution.map((prov, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white">{prov.name}</span>
                        <span className="font-mono text-slate-300">{prov.count} ({prov.percentage}%)</span>
                      </div>
                      <div className="w-full bg-[#07090e] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${prov.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESGLOSE POR LOCALIDADES */}
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e2a40] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#00e676]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Ciudades con Mayor Concurrencia</h3>
                  </div>
                  <span className="text-xs text-slate-400">Mar del Plata Sede Central</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {demographics.localitiesDistribution.map((loc, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#07090e] border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#00e676] font-bold">#{i + 1}</span>
                        <span className="font-bold text-white">{loc.name}</span>
                      </div>
                      <span className="font-mono text-slate-300">{loc.count} {loc.count === 1 ? 'jugador' : 'jugadores'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TABLA EN VIVO: PADRÓN DE JUGADORES REGISTRADOS & GESTIÓN DE CATEGORÍAS */}
            <div className="bg-[#0f1422] border-2 border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00e676] text-[11px] font-black uppercase tracking-wider mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Base de Datos Oficial en Vivo (Supabase)</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#00e676]" />
                    <span>Padrón de Jugadores & Asignación de Categorías</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cambia la categoría de cualquier jugador registrado con impacto inmediato en su perfil deportivo y torneos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadRegisteredPlayers}
                    className="px-3.5 py-2 rounded-xl bg-[#141a29] hover:bg-[#1c2438] border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00e676]" />
                    <span>Refrescar Lista</span>
                  </button>
                  <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00e676] text-xs font-mono font-bold">
                    {availablePlayers.length} Jugadores
                  </span>
                </div>
              </div>

              {/* TABLA DE JUGADORES */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e2a40] text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Jugador / Silueta</th>
                      <th className="py-3 px-3">Apodo</th>
                      <th className="py-3 px-3">Ubicación</th>
                      <th className="py-3 px-3">AVG 501</th>
                      <th className="py-3 px-3">Categoría Oficial</th>
                      <th className="py-3 px-3">Rol & Permisos</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2a40]/60">
                    {availablePlayers.map((player) => {
                      const currentCat = player.category || 'INTERMEDIA';
                      const currentStatus = player.status || 'ACTIVE';
                      const isIceman = player.id === 'user-iceman-admin' || player.nickname?.toUpperCase() === 'ICEMAN';
                      const isUpdatingThisPlayer = isUpdatingStatus === player.id || isUpdatingCategory === player.id || isUpdatingRole === player.id;

                      return (
                        <tr key={player.id} className="hover:bg-[#141a29]/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#00e676]/40 bg-[#07090e] p-0.5 flex-shrink-0">
                                <Image
                                  src={player.photoUrl || '/images/iceman-perfil.png'}
                                  alt={player.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{player.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  {player.email || 'Sin email público'}
                                  {player.age ? ` • 🎂 ${player.age} años` : ''}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-black text-[#00e676] font-mono">{player.nickname}</span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-slate-300">{player.city}</span>
                            <span className="text-[10px] text-slate-500 block">{player.club || 'Darderos Mar del Plata'}</span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-mono font-black text-white text-sm">
                              {Number(player.estimatedAvg || 45).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-bold">AVG</span>
                          </td>

                          <td className="py-3 px-3">
                            <select
                              value={currentCat}
                              onChange={(e) => handleUpdatePlayerCategoryFromAdmin(player, e.target.value)}
                              disabled={isUpdatingThisPlayer}
                              className="bg-[#07090e] border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#00e676] cursor-pointer"
                            >
                              <option value="PRINCIPIANTE">PRINCIPIANTE (&lt; 40 AVG)</option>
                              <option value="INTERMEDIA">INTERMEDIA (40 - 55 AVG)</option>
                              <option value="AVANZADA">AVANZADA (55 - 70 AVG)</option>
                              <option value="ELITE">ELITE PRO (70+ AVG)</option>
                            </select>
                          </td>

                          <td className="py-3 px-3">
                            {isIceman ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                <span>Superadmin (Root)</span>
                              </span>
                            ) : (
                              <select
                                value={player.role || 'PLAYER'}
                                onChange={(e) => handleUpdatePlayerRoleFromAdmin(player, e.target.value)}
                                disabled={isUpdatingThisPlayer}
                                className={`rounded-xl px-2 py-1.5 text-xs font-bold border focus:outline-none cursor-pointer ${
                                  player.role === 'SUPERADMIN'
                                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                                    : player.role === 'ADMIN'
                                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                                    : 'bg-[#07090e] border-slate-700 text-slate-300'
                                }`}
                              >
                                <option value="PLAYER">👤 Jugador (Estándar)</option>
                                <option value="ADMIN">🛡️ Admin Torneos (Edita/Borra Llaves)</option>
                                <option value="SUPERADMIN">👑 Superadmin (Root)</option>
                              </select>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {currentStatus === 'ACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-[#00e676] border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 text-[#00e676]" />
                                <span>Activo</span>
                              </span>
                            )}
                            {currentStatus === 'SUSPENDED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Suspendido</span>
                              </span>
                            )}
                            {currentStatus === 'INACTIVE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                                <UserX className="w-3 h-3 text-red-400" />
                                <span>Dado de Baja</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {isUpdatingThisPlayer ? (
                              <span className="text-[11px] text-[#00e676] font-bold animate-pulse">Guardando...</span>
                            ) : isIceman ? (
                              <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-mono">
                                Admin Inmutable
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {currentStatus === 'ACTIVE' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePlayerStatusFromAdmin(player, 'SUSPENDED')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                                      title="Suspender temporalmente al jugador (mantiene historial y estadísticas intactas)"
                                    >
                                      <PauseCircle className="w-3 h-3" />
                                      <span>Suspender</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePlayerStatusFromAdmin(player, 'INACTIVE')}
                                      className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                                      title="Dar de baja al jugador (mantiene historial y estadísticas intactas)"
                                    >
                                      <UserX className="w-3 h-3" />
                                      <span>Dar de Baja</span>
                                    </button>
                                  </>
                                )}

                                {currentStatus === 'SUSPENDED' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePlayerStatusFromAdmin(player, 'ACTIVE')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-[#00e676] border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                                      title="Reactivar y habilitar al jugador"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Reactivar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePlayerStatusFromAdmin(player, 'INACTIVE')}
                                      className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                                      title="Dar de baja del padrón"
                                    >
                                      <UserX className="w-3 h-3" />
                                      <span>Dar de Baja</span>
                                    </button>
                                  </>
                                )}

                                {currentStatus === 'INACTIVE' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePlayerStatusFromAdmin(player, 'ACTIVE')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-[#00e676] border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                                      title="Reactivar y dar de alta nuevamente al jugador"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Reactivar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePlayerStatusFromAdmin(player, 'SUSPENDED')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                                      title="Pasar a suspendido"
                                    >
                                      <PauseCircle className="w-3 h-3" />
                                      <span>Suspender</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 3: ADMINISTRACIÓN DE VITRINAS HOME (DBIKES STYLE)         */}
        {/* ================================================================= */}
        {activeTab === 'SHOWCASES' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#ffe600] tracking-wider px-2 py-0.5 rounded-full bg-[#ffe600]/15 border border-[#ffe600]/30">
                  Control Visual de Portada
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <LayoutTemplate className="w-6 h-6 text-[#ffe600]" />
                  <span>Administración de Vitrinas de la Landing Page</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configura los banners de torneos, formulario de Google, fotos de la comunidad y sedes afiliadas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveShowcases}
                  className="px-5 py-2.5 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#00e676]/25 transition-all"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Guardar Cambios en la Landing</span>
                </button>
              </div>
            </div>

            {/* AVISO TÉCNICO DE FORMATOS Y TAMAÑOS (REPLICANDO SCREENSHOT 4 DE DBIKES) */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 shadow-lg">
              <div className="flex items-center gap-2 font-black text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Recomendaciones Oficiales de Formato y Medidas de Imágenes:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-200/90 leading-relaxed">
                <li><strong>Campo 1 Desktop (Panorámico PC):</strong> 1600 x 650 px o 1920 x 800 px en formato WebP o JPG optimizado (peso menor a 350 KB).</li>
                <li><strong>Campo 2 Mobile (Celulares):</strong> 1080 x 1080 px o 1080 x 1350 px (relación cuadrada o vertical 4:5 para pantallas móviles).</li>
                <li><strong>Logos y Siluetas:</strong> Formato PNG sin fondo (transparente) recortado al contorno.</li>
              </ul>
            </div>

            {/* SUB-PESTAÑAS DE VITRINAS (HERO, COMUNIDAD, CLUBES, PAGOS) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#0f1422] border border-[#1e2a40] p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveShowcaseTab('HERO_TOURNAMENT')}
                className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
                  activeShowcaseTab === 'HERO_TOURNAMENT'
                    ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                Vitrina 1: Gran Torneo
              </button>

              <button
                onClick={() => setActiveShowcaseTab('COMMUNITY')}
                className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
                  activeShowcaseTab === 'COMMUNITY'
                    ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                Vitrina 2: Comunidad
              </button>

              <button
                onClick={() => setActiveShowcaseTab('CLUBS')}
                className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
                  activeShowcaseTab === 'CLUBS'
                    ? 'bg-[#ffe600] text-[#07090e] shadow-md shadow-[#ffe600]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                Vitrina 3: Sedes & Clubes
              </button>

              <button
                onClick={() => setActiveShowcaseTab('PAYMENTS')}
                className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
                  activeShowcaseTab === 'PAYMENTS'
                    ? 'bg-[#38bdf8] text-[#07090e] shadow-md shadow-[#38bdf8]/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#141a29]'
                }`}
              >
                Vitrina 4: Pagos & Bancos
              </button>
            </div>

            {/* --- VITRINA 1: PRÓXIMO GRAN TORNEO OFICIAL --- */}
            {activeShowcaseTab === 'HERO_TOURNAMENT' && (
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#ef4444]" />
                      <span>Vitrina 1 — Slider & Head Banner del Gran Torneo Oficial</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Parámetros de fecha, bolsa de premios y conexión automática con Formulario de Google.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#07090e] px-3.5 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={showcases.heroTournament.enabled}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, enabled: e.target.checked }
                      })}
                      className="rounded text-[#00e676] focus:ring-0"
                    />
                    <span className="text-xs font-bold text-white">Activar en Portada</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Título del Torneo</label>
                    <input
                      type="text"
                      value={showcases.heroTournament.title}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, title: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Ciudad Destacada</label>
                    <input
                      type="text"
                      value={showcases.heroTournament.highlightCity}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, highlightCity: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Fecha del Encuentro</label>
                    <input
                      type="text"
                      value={showcases.heroTournament.date}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, date: e.target.value }
                      })}
                      placeholder="ej: 14 y 15 Nov"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Sede Oficial</label>
                    <input
                      type="text"
                      value={showcases.heroTournament.venue}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, venue: e.target.value }
                      })}
                      placeholder="ej: MDQ Central"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Bolsa de Premios ($ ARS)</label>
                    <input
                      type="text"
                      value={showcases.heroTournament.prizePool}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, prizePool: e.target.value }
                      })}
                      placeholder="ej: $450.000 ARS"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Inscriptos Confirmados (Real)</label>
                    <input
                      type="number"
                      min={0}
                      value={showcases.heroTournament.registeredCount}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: {
                          ...showcases.heroTournament,
                          registeredCount: Math.max(0, parseInt(e.target.value, 10) || 0)
                        }
                      })}
                      placeholder="ej: 0"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Cupo Máximo</label>
                    <input
                      type="number"
                      value={showcases.heroTournament.maxParticipants}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, maxParticipants: Number(e.target.value) }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#ef4444] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Texto Botón Secundario</label>
                    <input
                      type="text"
                      value={showcases.heroTournament.secondaryButtonText || 'Ver Cuadro y Reglamento'}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, secondaryButtonText: e.target.value }
                      })}
                      placeholder="Ver Cuadro y Reglamento"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#00e676] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Enlace Botón Secundario (URL o Ruta)</label>
                    <input
                      type="text"
                      value={showcases.heroTournament.secondaryButtonUrl || '/torneos'}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, secondaryButtonUrl: e.target.value }
                      })}
                      placeholder="ej: /torneos o https://..."
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#00e676] focus:outline-none"
                    />
                  </div>
                </div>

                {/* INTEGRACIÓN AUTOMÁTICA CON GOOGLE FORMS */}
                <div className="p-5 rounded-2xl bg-[#07090e] border border-[#00e676]/30 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#00e676]" />
                      <h4 className="text-sm font-black text-white">Sincronización Automática con Formulario de Google</h4>
                    </div>
                    {showcases.heroTournament.lastSyncedAt && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Última sincronización: {showcases.heroTournament.lastSyncedAt}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Enlace del Google Form / Google Sheet de Respuestas</label>
                    <input
                      type="url"
                      value={showcases.heroTournament.googleFormUrl}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        heroTournament: { ...showcases.heroTournament, googleFormUrl: e.target.value }
                      })}
                      placeholder="https://docs.google.com/forms/d/e/.../viewform"
                      className="w-full px-3.5 py-2.5 bg-[#111622] border border-slate-700 rounded-xl text-white text-xs focus:border-[#00e676] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#111622] px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs">
                        <span className="text-slate-400 block text-[10px]">Inscriptos Detectados:</span>
                        <strong className="text-white font-mono text-sm">{showcases.heroTournament.registeredCount} / {showcases.heroTournament.maxParticipants}</strong>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncGoogleForms}
                        disabled={isSyncingGoogleForm}
                        className="px-4 py-2 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGoogleForm ? 'animate-spin' : ''}`} />
                        <span>{isSyncingGoogleForm ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
                      </button>
                    </div>

                    <a
                      href={showcases.heroTournament.googleFormUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00e676] hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Abrir Formulario de Google</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {googleSyncMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs">
                      {googleSyncMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- VITRINA 2: COMUNIDAD NACIONAL DE DARDOS --- */}
            {activeShowcaseTab === 'COMMUNITY' && (
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#00e676]" />
                      <span>Vitrina 2 — Comunidad Nacional de Dardos (Sección Central)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configura la imagen de fondo de Darderos MDQ, opacidad del overlay y pilares clave.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#07090e] px-3.5 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={showcases.communitySection.enabled}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        communitySection: { ...showcases.communitySection, enabled: e.target.checked }
                      })}
                      className="rounded text-[#00e676] focus:ring-0"
                    />
                    <span className="text-xs font-bold text-white">Activar en Portada</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Ruta / URL Imagen de Fondo</label>
                    <input
                      type="text"
                      value={showcases.communitySection.backgroundImageUrl}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        communitySection: { ...showcases.communitySection, backgroundImageUrl: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#00e676] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300">Opacidad del Overlay Oscuro</label>
                      <span className="text-xs font-mono font-bold text-[#00e676]">{showcases.communitySection.overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={showcases.communitySection.overlayOpacity}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        communitySection: { ...showcases.communitySection, overlayOpacity: Number(e.target.value) }
                      })}
                      className="w-full accent-[#00e676] cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">Menor opacidad = foto más nítida y brillante.</span>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Título Principal</label>
                    <input
                      type="text"
                      value={showcases.communitySection.title + ' ' + showcases.communitySection.highlightText}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        communitySection: { ...showcases.communitySection, title: e.target.value, highlightText: '' }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#00e676] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Descripción / Manifiesto de la Comunidad</label>
                    <textarea
                      rows={3}
                      value={showcases.communitySection.description}
                      onChange={(e) => setShowcases({
                        ...showcases,
                        communitySection: { ...showcases.communitySection, description: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-[#00e676] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Preview de la foto con overlay */}
                <div className="relative rounded-2xl overflow-hidden h-40 border border-slate-700 bg-black flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${showcases.communitySection.backgroundImageUrl}')` }}
                  />
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: showcases.communitySection.overlayOpacity / 100 }}
                  />
                  <div className="relative z-10 text-center p-4">
                    <span className="text-xs font-black uppercase text-[#00e676] tracking-wider block">Vista Previa de Opacidad</span>
                    <p className="text-white text-sm font-bold mt-1">Foto comunitaria con {showcases.communitySection.overlayOpacity}% de oscurecimiento.</p>
                  </div>
                </div>
              </div>
            )}

            {/* --- VITRINA 3: SEDES Y CLUBES AFILIADOS --- */}
            {activeShowcaseTab === 'CLUBS' && (
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-400" />
                      <span>Vitrina 3 — Sedes y Clubes Afiliados al Circuito</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gestiona las sedes oficiales donde se juegan torneos presenciales (Darderos MDQ, Palermo CABA, Interior).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newClub = {
                        id: `club-${Date.now()}`,
                        name: 'Nueva Sede Afiliada',
                        city: 'Ciudad',
                        province: 'Provincia',
                        address: 'Dirección de la sede',
                        boardsCount: 4,
                        logoUrl: '/logos/logo-mdq.png',
                        status: 'ACTIVO' as const,
                        description: 'Canchas profesionales de dardos sisal para entrenamiento y liga.'
                      };
                      setShowcases({
                        ...showcases,
                        affiliatedClubs: [...showcases.affiliatedClubs, newClub]
                      });
                    }}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-[#07090e] font-black rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Agregar Nueva Sede</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {showcases.affiliatedClubs.map((club, idx) => (
                    <div key={club.id} className="p-4 rounded-2xl bg-[#07090e] border border-slate-800 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          club.isCentral ? 'bg-[#00e676] text-[#07090e]' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {club.isCentral ? 'Sede Central' : 'Sede Regional'}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setShowcases({
                              ...showcases,
                              affiliatedClubs: showcases.affiliatedClubs.filter(c => c.id !== club.id)
                            });
                          }}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="Eliminar sede"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <input
                          type="text"
                          value={club.name}
                          onChange={(e) => {
                            const updated = [...showcases.affiliatedClubs];
                            updated[idx].name = e.target.value;
                            setShowcases({ ...showcases, affiliatedClubs: updated });
                          }}
                          className="w-full bg-[#111622] border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                        />
                        <input
                          type="text"
                          value={club.city}
                          onChange={(e) => {
                            const updated = [...showcases.affiliatedClubs];
                            updated[idx].city = e.target.value;
                            setShowcases({ ...showcases, affiliatedClubs: updated });
                          }}
                          placeholder="Ciudad y Provincia"
                          className="w-full bg-[#111622] border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Dianas:</span>
                        <input
                          type="number"
                          value={club.boardsCount}
                          onChange={(e) => {
                            const updated = [...showcases.affiliatedClubs];
                            updated[idx].boardsCount = Number(e.target.value);
                            setShowcases({ ...showcases, affiliatedClubs: updated });
                          }}
                          className="w-16 bg-[#111622] border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white text-center font-mono"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={club.description}
                        onChange={(e) => {
                          const updated = [...showcases.affiliatedClubs];
                          updated[idx].description = e.target.value;
                          setShowcases({ ...showcases, affiliatedClubs: updated });
                        }}
                        className="w-full bg-[#111622] border border-slate-700 rounded-lg p-2 text-[10px] text-slate-400 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- VITRINA 4: DATOS PARA PAGO DE INSCRIPCIONES A TORNEOS --- */}
            {activeShowcaseTab === 'PAYMENTS' && (
              <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-sky-400" />
                      <span>Vitrina 4 — Datos para Pago de Inscripciones a Torneos</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configura la cuenta bancaria oficial donde los competidores transfieren y el contacto de WhatsApp.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveBankAccount}
                    className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-[#07090e] font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                  >
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>Guardar Datos Bancarios</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Banco / Entidad Financiera</label>
                    <input
                      type="text"
                      value={bankAccount.bankName}
                      onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Tipo de Cuenta</label>
                    <input
                      type="text"
                      value={bankAccount.accountType}
                      onChange={(e) => setBankAccount({ ...bankAccount, accountType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Titular de la Cuenta</label>
                    <input
                      type="text"
                      value={bankAccount.holderName}
                      onChange={(e) => setBankAccount({ ...bankAccount, holderName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">CUIT / CUIL</label>
                    <input
                      type="text"
                      value={bankAccount.cuitCuil}
                      onChange={(e) => setBankAccount({ ...bankAccount, cuitCuil: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#00e676]">Alias CBU / CVU</label>
                    <input
                      type="text"
                      value={bankAccount.alias}
                      onChange={(e) => setBankAccount({ ...bankAccount, alias: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-[#00e676]/40 rounded-xl text-[#00e676] font-mono text-xs font-black focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sky-400">Número CBU / CVU (22 dígitos)</label>
                    <input
                      type="text"
                      value={bankAccount.cbuCvu}
                      onChange={(e) => setBankAccount({ ...bankAccount, cbuCvu: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-sky-400/40 rounded-xl text-sky-300 font-mono text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Teléfono WhatsApp de Validación</label>
                    <input
                      type="text"
                      value={bankAccount.adminWhatsAppPhone}
                      onChange={(e) => setBankAccount({ ...bankAccount, adminWhatsAppPhone: e.target.value })}
                      placeholder="ej: 5492235218765"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nombre del Administrador Receptor</label>
                    <input
                      type="text"
                      value={bankAccount.adminWhatsAppName}
                      onChange={(e) => setBankAccount({ ...bankAccount, adminWhatsAppName: e.target.value })}
                      placeholder="ej: Mariano Deux (ICEMAN)"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Instrucciones para los Jugadores</label>
                    <textarea
                      rows={2}
                      value={bankAccount.notes || ''}
                      onChange={(e) => setBankAccount({ ...bankAccount, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-sky-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 4: COMISIÓN DIRECTIVA & AUTORIDADES (VINCULACIÓN A PERFIL)*/}
        {/* ================================================================= */}
        {activeTab === 'AUTHORITIES' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2a40] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#38bdf8] tracking-wider px-2 py-0.5 rounded-full bg-[#38bdf8]/15 border border-[#38bdf8]/30">
                  Órgano Institucional & Designaciones
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#38bdf8]" />
                  <span>Comisión Directiva & Autoridades Oficiales</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Asigna cada puesto seleccionando a los jugadores de la app. El cargo directivo impactará automáticamente en su perfil y carta coleccionable.
                </p>
              </div>

              {/* Selector de Ámbito: Mar del Plata vs Nacional */}
              <div className="flex items-center gap-2 bg-[#0f1422] p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthoritiesScope('MDQ')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    authoritiesScope === 'MDQ'
                      ? 'bg-[#00e676] text-[#07090e]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Asociación MDQ
                </button>
                <button
                  type="button"
                  onClick={() => setAuthoritiesScope('ARGENTINA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    authoritiesScope === 'ARGENTINA'
                      ? 'bg-[#38bdf8] text-[#07090e]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dardos Argentina
                </button>
              </div>
            </div>

            {/* FORMULARIO PARA DESIGNAR / EDITAR AUTORIDAD */}
            <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#1e2a40] pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{editingAuth ? 'Editar Puesto en la Comisión' : 'Designar Nueva Autoridad Oficial'}</span>
                </h3>

                {editingAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAuth(null);
                      setAuthRoleTitle('');
                      setAuthName('');
                      setAuthNickname('');
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveAuthority} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* SELECTOR DESPLEGABLE DE JUGADORES REGISTRADOS (SOLICITUD EXPLÍCITA DEL USUARIO) */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-[#00e676] flex items-center gap-1.5">
                      <span>Vincular Jugador Registrado en la App</span>
                    </label>
                    <select
                      value={authSelectedPlayerId}
                      onChange={(e) => handleSelectPlayerForAuth(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-[#00e676]/40 rounded-xl text-white text-xs font-bold focus:border-[#00e676] focus:outline-none"
                    >
                      <option value="custom">-- Carga Manual / No Registrado --</option>
                      {availablePlayers.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.city || 'MDQ'})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 block">
                      Al seleccionar un jugador, su foto y datos se vinculan automáticamente.
                    </span>
                  </div>

                  {/* CARGO EN LA COMISIÓN DIRECTIVA */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-amber-400">Cargo Oficial en la Comisión</label>
                    <input
                      type="text"
                      value={authRoleTitle}
                      onChange={(e) => setAuthRoleTitle(e.target.value)}
                      placeholder="ej: Presidente, Tesorero, Secretario..."
                      required
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-amber-400/40 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* NOMBRE COMPLETO */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-slate-300">Nombre y Apellido</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* APODO */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Apodo Deportivo</label>
                    <input
                      type="text"
                      value={authNickname}
                      onChange={(e) => setAuthNickname(e.target.value)}
                      placeholder="ej: ICEMAN"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* CLUB */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Club Representado</label>
                    <input
                      type="text"
                      value={authClub}
                      onChange={(e) => setAuthClub(e.target.value)}
                      placeholder="ej: Darderos Mar del Plata"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* CIUDAD / LOCALIDAD */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Ciudad / Localidad</label>
                    <input
                      type="text"
                      value={authCity}
                      onChange={(e) => setAuthCity(e.target.value)}
                      placeholder="ej: Mar del Plata"
                      className="w-full px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* FOTO OFICIAL CON PREVIEW EN VIVO */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300">Foto Oficial / Avatar Vinculado</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#07090e] border border-slate-700 flex-shrink-0">
                        <img
                          src={authPhotoUrl || '/logos/logo-mdq.png'}
                          alt="Foto"
                          className="w-full h-full object-cover object-top"
                          onError={(e: any) => {
                            e.target.src = '/logos/logo-mdq.png';
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={authPhotoUrl}
                        onChange={(e) => setAuthPhotoUrl(e.target.value)}
                        placeholder="/logos/logo-mdq.png o foto vinculada"
                        className="flex-1 px-3.5 py-2.5 bg-[#07090e] border border-slate-700 rounded-xl text-white text-xs focus:border-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00e676]/25 transition-all"
                  >
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>{editingAuth ? 'Actualizar Cargo' : 'Guardar y Vincular al Perfil'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* GRILLA DE AUTORIDADES DESIGNADAS */}
            <div className="bg-[#0f1422] border border-[#1e2a40] rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2a40] pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Autoridades Actuales ({authoritiesScope === 'MDQ' ? 'Asociación Mar del Plata' : 'Dardos Argentina'})
                </h3>
                <span className="text-xs text-slate-400 font-bold">
                  {authorities.filter(a => a.scope === authoritiesScope).length} Autoridades
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {authorities
                  .filter(a => a.scope === authoritiesScope)
                  .map((auth) => {
                    const matchedPlayer = availablePlayers.find(p => p.id === auth.playerId);
                    const displayPhoto = matchedPlayer?.photoUrl || auth.photoUrl || '/logos/logo-mdq.png';
                    return (
                      <div
                        key={auth.id}
                        className="p-4 rounded-2xl bg-[#07090e] border border-slate-800 space-y-3 relative group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#00e676] bg-black flex-shrink-0">
                            <img
                              src={displayPhoto}
                              alt={auth.name}
                              className="w-full h-full object-cover object-top"
                              onError={(e: any) => {
                                e.target.src = '/logos/logo-mdq.png';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase text-[#00e676] px-2 py-0.5 rounded-md bg-[#00e676]/10 border border-[#00e676]/20 inline-block mb-1">
                              {auth.roleTitle}
                            </span>
                            <h4 className="text-xs font-black text-white truncate">{auth.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{auth.club} • {auth.city}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span>{auth.nickname ? `@${auth.nickname}` : 'Sin apodo'}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditAuthorityClick(auth)}
                              className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                              title="Editar autoridad"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAuthority(auth.id)}
                              className="text-slate-400 hover:text-red-400 transition-colors p-1"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
