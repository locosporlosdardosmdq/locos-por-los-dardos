'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  DEFAULT_ASSOCIATION_AUTHORITIES, 
  DEFAULT_ASSOCIATION_BANK_ACCOUNT,
  USER_ICEMAN,
  isUserSuperAdmin,
  getAuthorityHierarchyWeight,
  getAuthorityTierInfo,
  AuthorityTier
} from '@/lib/constants';
import { 
  getStoredAssociationAuthorities, 
  saveStoredAssociationAuthorities,
  fetchAssociationAuthoritiesFromCloud,
  getStoredAssociationBankAccount,
  saveStoredAssociationBankAccount,
  fetchAssociationBankAccountFromCloud,
  getCurrentPlayerProfile,
  fetchRegisteredPlayersFromCloud
} from '@/lib/storage';
import { 
  AssociationAuthority, 
  AssociationBankAccount, 
  AssociationScope, 
  PlayerProfile 
} from '@/lib/types';
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  Landmark, 
  Settings2, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  MessageCircle, 
  Phone, 
  Mail, 
  UserCheck, 
  X,
  CreditCard,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Network,
  LayoutGrid
} from 'lucide-react';

export default function AsociacionPage() {
  const [activeScope, setActiveScope] = useState<AssociationScope>('MDQ');
  const [viewMode, setViewMode] = useState<'ORGANIGRAMA' | 'GRID'>('ORGANIGRAMA');
  const [authorities, setAuthorities] = useState<AssociationAuthority[]>(() => {
    return getStoredAssociationAuthorities(DEFAULT_ASSOCIATION_AUTHORITIES);
  });
  const [bankAccount, setBankAccount] = useState<AssociationBankAccount>(() => {
    return getStoredAssociationBankAccount(DEFAULT_ASSOCIATION_BANK_ACCOUNT);
  });
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(() => {
    return getCurrentPlayerProfile(null);
  });
  const [registeredPlayers, setRegisteredPlayers] = useState<PlayerProfile[]>([]);

  // Seguridad Institucional: Sólo Mariano Deux (SuperAdmin) puede administrar la Asociación
  const isSuperAdmin = currentUser ? isUserSuperAdmin(currentUser) : false;

  // Modales de administración
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState<'AUTHORITIES' | 'BANK'>('AUTHORITIES');
  
  // Estado para crear/editar autoridad
  const [editingAuthority, setEditingAuthority] = useState<AssociationAuthority | null>(null);
  const [authScope, setAuthScope] = useState<AssociationScope>('MDQ');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('custom');
  const [authName, setAuthName] = useState('');
  const [authNickname, setAuthNickname] = useState('');
  const [authRole, setAuthRole] = useState('');
  const [authPhotoUrl, setAuthPhotoUrl] = useState('');
  const [authClub, setAuthClub] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authProvince, setAuthProvince] = useState('');
  const [authBio, setAuthBio] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');

  // Estado para editar cuenta bancaria
  const [bankForm, setBankForm] = useState<AssociationBankAccount>(bankAccount);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Escuchar actualizaciones de perfil y storage y sincronizar desde la nube
  useEffect(() => {
    fetchAssociationBankAccountFromCloud().then((cloudBank) => {
      if (cloudBank) {
        setBankAccount(cloudBank);
        setBankForm(cloudBank);
      }
    });

    fetchAssociationAuthoritiesFromCloud().then((cloudAuths) => {
      if (cloudAuths && Array.isArray(cloudAuths) && cloudAuths.length > 0) {
        setAuthorities(cloudAuths);
      }
    });

    const handleProfileUpdate = (e: any) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    const handleAuthUpdate = (e: any) => {
      if (e.detail) setAuthorities(e.detail);
    };
    const handleBankUpdate = (e: any) => {
      if (e.detail) {
        setBankAccount(e.detail);
        setBankForm(e.detail);
      }
    };

    window.addEventListener('lpld_profile_updated', handleProfileUpdate);
    window.addEventListener('lpld_association_updated', handleAuthUpdate);
    window.addEventListener('lpld_association_bank_updated', handleBankUpdate);

    return () => {
      window.removeEventListener('lpld_profile_updated', handleProfileUpdate);
      window.removeEventListener('lpld_association_updated', handleAuthUpdate);
      window.removeEventListener('lpld_association_bank_updated', handleBankUpdate);
    };
  }, []);

  useEffect(() => {
    fetchRegisteredPlayersFromCloud().then((cloud) => {
      if (cloud && cloud.length > 0) {
        setRegisteredPlayers(cloud);
      }
    });
  }, []);

  // Lista de jugadores elegibles para vincular foto oficial
  const availablePlayers = useMemo(() => {
    const list: any[] = [];
    if (currentUser) {
      list.push({
        id: currentUser.id,
        fullName: currentUser.fullName,
        nickname: currentUser.nickname,
        photoUrl: currentUser.photoUrl || currentUser.avatarUrl,
        club: currentUser.club || 'Darderos Mar del Plata',
        city: currentUser.city,
        province: currentUser.province,
        email: currentUser.email,
        phone: currentUser.phone
      });
    }
    registeredPlayers
      .filter((p) => (!currentUser || (p.id !== currentUser.id && (!currentUser.email || p.email?.toLowerCase() !== currentUser.email.toLowerCase()))))
      .forEach((p) => {
        list.push({
          id: p.id,
          fullName: p.fullName || p.nickname || 'Jugador',
          nickname: p.nickname,
          photoUrl: p.photoUrl || p.avatarUrl,
          club: p.club || (p.province === 'Buenos Aires' ? 'Darderos Mar del Plata' : `Club ${p.province}`),
          city: p.city || 'Mar del Plata',
          province: p.province || 'Buenos Aires',
          email: p.email || '',
          phone: p.phone || ''
        });
      });
    return list;
  }, [currentUser, registeredPlayers]);

  // Obtener autoridades filtradas por el ámbito seleccionado y ordenadas como organigrama
  const filteredAuthorities = useMemo(() => {
    return authorities
      .filter((a) => a.scope === activeScope)
      .sort((a, b) => {
        const weightA = getAuthorityHierarchyWeight(a.roleTitle);
        const weightB = getAuthorityHierarchyWeight(b.roleTitle);
        if (weightA !== weightB) {
          return weightA - weightB;
        }
        return (a.orderIndex || 0) - (b.orderIndex || 0);
      })
      .map((auth) => {
        // Si la autoridad está vinculada al usuario activo actual, sincronizar su foto en caliente
        if (currentUser && (auth.playerId === currentUser.id || auth.playerId === 'user-iceman-admin')) {
          return {
            ...auth,
            photoUrl: currentUser.photoUrl || currentUser.avatarUrl || auth.photoUrl,
            avatarUrl: currentUser.avatarUrl || auth.avatarUrl,
            name: currentUser.fullName || auth.name,
            nickname: currentUser.nickname || auth.nickname
          };
        }
        // Si está vinculada a un jugador registrado de la comunidad
        const matched = registeredPlayers.find((p) => p.id === auth.playerId);
        if (matched) {
          return {
            ...auth,
            photoUrl: matched.photoUrl || matched.avatarUrl || auth.photoUrl,
            avatarUrl: matched.avatarUrl || matched.photoUrl || auth.avatarUrl,
            name: matched.fullName || matched.nickname || auth.name,
            nickname: matched.nickname || auth.nickname
          };
        }
        return auth;
      });
  }, [authorities, activeScope, currentUser, registeredPlayers]);

  // Agrupamiento dinámico por niveles jerárquicos de organigrama
  const authoritiesByTier = useMemo(() => {
    const tiers: Record<number, typeof filteredAuthorities> = {
      1: [],
      2: [],
      3: [],
      4: []
    };
    filteredAuthorities.forEach((auth) => {
      const info = getAuthorityTierInfo(auth.roleTitle);
      tiers[info.tierNumber].push(auth);
    });
    return tiers;
  }, [filteredAuthorities]);

  // Reordenar autoridades (Subir / Bajar) con 1-click para administradores
  const handleMoveAuthority = (authId: string, direction: 'UP' | 'DOWN') => {
    const currentScopeList = [...filteredAuthorities];
    const currentIndex = currentScopeList.findIndex((a) => a.id === authId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentScopeList.length) return;

    // Intercambiar posiciones
    const temp = currentScopeList[currentIndex];
    currentScopeList[currentIndex] = currentScopeList[targetIndex];
    currentScopeList[targetIndex] = temp;

    // Asignar índices secuenciales normalizados
    const newOrderMap = new Map<string, number>();
    currentScopeList.forEach((a, idx) => {
      newOrderMap.set(a.id, idx + 1);
    });

    const updated = authorities.map((a) => {
      if (a.scope === activeScope && newOrderMap.has(a.id)) {
        return { ...a, orderIndex: newOrderMap.get(a.id)! };
      }
      return a;
    });

    setAuthorities(updated);
    saveStoredAssociationAuthorities(updated);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenAddAuthority = () => {
    setEditingAuthority(null);
    setAuthScope(activeScope);
    setSelectedPlayerId('custom');
    setAuthName('');
    setAuthNickname('');
    setAuthRole('');
    setAuthPhotoUrl('/logos/logo-mdq.png');
    setAuthClub(activeScope === 'MDQ' ? 'Darderos Mar del Plata' : 'Federación Argentina');
    setAuthCity('Mar del Plata');
    setAuthProvince('Buenos Aires');
    setAuthBio('');
    setAuthPhone('');
    setAuthEmail('');
    setAdminTab('AUTHORITIES');
    setShowAdminModal(true);
  };

  const handleEditAuthority = (auth: AssociationAuthority) => {
    setEditingAuthority(auth);
    setAuthScope(auth.scope);
    setSelectedPlayerId(auth.playerId || 'custom');
    setAuthName(auth.name);
    setAuthNickname(auth.nickname || '');
    setAuthRole(auth.roleTitle);
    setAuthPhotoUrl(auth.photoUrl);
    setAuthClub(auth.club || '');
    setAuthCity(auth.city || '');
    setAuthProvince(auth.province || '');
    setAuthBio(auth.bio || '');
    setAuthPhone(auth.phoneWhatsApp || '');
    setAuthEmail(auth.email || '');
    setAdminTab('AUTHORITIES');
    setShowAdminModal(true);
  };

  const handleDeleteAuthority = (id: string) => {
    if (confirm('¿Confirmás eliminar esta autoridad de la Comisión Directiva?')) {
      const updated = authorities.filter((a) => a.id !== id);
      setAuthorities(updated);
      saveStoredAssociationAuthorities(updated);
    }
  };

  const handlePlayerSelectChange = (playerId: string) => {
    setSelectedPlayerId(playerId);
    if (playerId === 'custom') {
      return;
    }
    const found = availablePlayers.find((p) => p.id === playerId);
    if (found) {
      setAuthName(found.fullName);
      setAuthNickname(found.nickname || '');
      setAuthPhotoUrl(found.photoUrl || '/logos/logo-mdq.png');
      setAuthClub(found.club || 'Darderos Mar del Plata');
      setAuthCity(found.city || 'Mar del Plata');
      setAuthProvince(found.province || 'Buenos Aires');
      setAuthEmail(found.email || '');
      setAuthPhone(found.phone || '');
    }
  };

  const handleSaveAuthority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authRole.trim()) {
      alert('Por favor completá el nombre y el cargo/puesto de la autoridad.');
      return;
    }

    if (editingAuthority) {
      const updated = authorities.map((a) => {
        if (a.id === editingAuthority.id) {
          return {
            ...a,
            scope: authScope,
            playerId: selectedPlayerId !== 'custom' ? selectedPlayerId : undefined,
            name: authName.trim(),
            nickname: authNickname.trim() || undefined,
            roleTitle: authRole.trim(),
            photoUrl: authPhotoUrl.trim() || '/logos/logo-mdq.png',
            club: authClub.trim() || undefined,
            city: authCity.trim() || undefined,
            province: authProvince.trim() || undefined,
            bio: authBio.trim() || undefined,
            phoneWhatsApp: authPhone.trim() || undefined,
            email: authEmail.trim() || undefined
          };
        }
        return a;
      });
      setAuthorities(updated);
      saveStoredAssociationAuthorities(updated);
    } else {
      const maxOrder = authorities.filter((a) => a.scope === authScope).length + 1;
      const newAuth: AssociationAuthority = {
        id: `auth-${Date.now()}`,
        scope: authScope,
        playerId: selectedPlayerId !== 'custom' ? selectedPlayerId : undefined,
        name: authName.trim(),
        nickname: authNickname.trim() || undefined,
        roleTitle: authRole.trim(),
        photoUrl: authPhotoUrl.trim() || '/logos/logo-mdq.png',
        club: authClub.trim() || undefined,
        city: authCity.trim() || undefined,
        province: authProvince.trim() || undefined,
        bio: authBio.trim() || undefined,
        orderIndex: maxOrder,
        phoneWhatsApp: authPhone.trim() || undefined,
        email: authEmail.trim() || undefined
      };
      const updated = [...authorities, newAuth];
      setAuthorities(updated);
      saveStoredAssociationAuthorities(updated);
    }

    setEditingAuthority(null);
    setShowAdminModal(false);
  };

  const handleSaveBankForm = (e: React.FormEvent) => {
    e.preventDefault();
    setBankAccount(bankForm);
    saveStoredAssociationBankAccount(bankForm);
    setSaveSuccessMsg('¡Datos bancarios oficiales guardados exitosamente!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const renderAuthorityCard = (auth: AssociationAuthority, indexInFiltered: number) => {
    const isPresident = auth.roleTitle.toLowerCase().includes('presidente') && !auth.roleTitle.toLowerCase().includes('vice');
    const isVice = auth.roleTitle.toLowerCase().includes('vice');
    const tierInfo = getAuthorityTierInfo(auth.roleTitle);
    
    // Bordes y estilos según jerarquía de organigrama
    const borderClass = isPresident 
      ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-2xl shadow-amber-500/10'
      : tierInfo.tierNumber === 2
      ? 'border-amber-500/40 hover:border-amber-400/70 shadow-xl'
      : tierInfo.tierNumber === 3
      ? 'border-sky-500/40 hover:border-sky-400/70 shadow-lg'
      : 'border-slate-800 hover:border-slate-700 shadow-md';

    const roleBadgeClass = isPresident
      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black'
      : tierInfo.tierNumber === 2
      ? 'bg-amber-500/20 text-amber-300 border-b border-amber-500/30 font-black'
      : tierInfo.tierNumber === 3
      ? 'bg-sky-500/15 text-sky-300 border-b border-sky-500/30 font-bold'
      : 'bg-[#111622] text-slate-300 border-b border-slate-800 font-bold';

    return (
      <div
        key={auth.id}
        className={`group relative bg-[#0f1422] rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col ${borderClass} w-full`}
      >
        {/* Badge de Nivel y Cargo */}
        <div className={`px-4 py-2.5 text-center text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${roleBadgeClass}`}>
          {isPresident && <span className="text-sm">👑</span>}
          {isVice && <span className="text-xs">🏛️</span>}
          <span>{auth.roleTitle}</span>
        </div>

        <div className="p-5 flex flex-col items-center text-center flex-1">
          {/* FOTO DE PERFIL DEL JUGADOR */}
          <div className="relative mb-3.5">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#07090e] border-2 shadow-xl ${
              isPresident 
                ? 'border-amber-400 ring-4 ring-amber-400/25' 
                : tierInfo.tierNumber === 2
                ? 'border-amber-500/60'
                : tierInfo.tierNumber === 3
                ? 'border-sky-500/60'
                : 'border-slate-700'
            }`}>
              <img
                src={auth.photoUrl || '/logos/logo-mdq.png'}
                alt={auth.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                onError={(e: any) => {
                  e.target.src = '/logos/logo-mdq.png';
                }}
              />
            </div>
            {isPresident && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center shadow-md">
                👑
              </div>
            )}
          </div>

          {/* Nombre y Apodo */}
          <h3 className="text-base font-black text-white tracking-tight">
            {auth.name}
          </h3>
          {auth.nickname && (
            <div className="text-xs font-bold text-[#00e676] mt-0.5">
              @{auth.nickname}
            </div>
          )}

          {/* Club y Ubicación */}
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 justify-center">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{auth.city || 'Mar del Plata'}, {auth.province || 'Buenos Aires'}</span>
          </div>

          {auth.club && (
            <div className="text-[11px] font-bold text-slate-300 mt-0.5">
              {auth.club}
            </div>
          )}

          {/* Breve Reseña / Función */}
          {auth.bio && (
            <p className="mt-3 text-[11px] text-slate-400 line-clamp-3 leading-relaxed border-t border-slate-800/80 pt-2.5 w-full">
              {auth.bio}
            </p>
          )}

          {/* Botones de contacto si aplica */}
          <div className="mt-auto pt-4 w-full flex items-center justify-center gap-2">
            {auth.phoneWhatsApp && (
              <a
                href={`https://wa.me/${auth.phoneWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 transition-colors"
                title="Contacto de WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            {auth.email && (
              <a
                href={`mailto:${auth.email}`}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                title="Email oficial"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            )}
          </div>

          {/* Acciones de administración exclusivas SuperAdmin */}
          {isSuperAdmin && (
            <div className="mt-3 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveAuthority(auth.id, 'UP')}
                  disabled={indexInFiltered === 0}
                  className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Subir en el organigrama"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveAuthority(auth.id, 'DOWN')}
                  disabled={indexInFiltered === filteredAuthorities.length - 1}
                  className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Bajar en el organigrama"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditAuthority(auth)}
                  className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAuthority(auth.id)}
                  className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none animate-in fade-in duration-200">
      {/* CABECERA INSTITUCIONAL */}
      <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#ef4444]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-20 h-20 rounded-2xl bg-[#07090e] border-2 border-emerald-500/30 p-2 flex items-center justify-center shadow-lg shrink-0">
              <Image
                src={activeScope === 'MDQ' ? '/logos/logo-mdq.png' : '/logos/dardos-argentina.png'}
                alt="Logo Institucional"
                width={68}
                height={68}
                className="object-contain max-h-16"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-1.5">
                <Landmark className="w-3 h-3" />
                <span>Órgano Institucional Oficial</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {activeScope === 'MDQ' 
                  ? 'Asociación de Dardos Mar del Plata' 
                  : 'Asociación & Federación Dardos Argentina'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {activeScope === 'MDQ'
                  ? 'Autoridad deportiva y sede anfitriona oficial del Circuito Federal de Dardos. Fiscalización de ligas locales y competencias presenciales.'
                  : 'Entidad rectora nacional de dardos de acero y electrónicos en la República Argentina. Clasificatoria directa a copas internacionales.'}
              </p>
            </div>
          </div>

          {/* ACCIONES EXCLUSIVAS SUPERADMIN (MARIANO DEUX) */}
          {isSuperAdmin && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Link
                href="/superadmin?tab=authorities"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00e676]/20 transition-all"
              >
                <Settings2 className="w-4 h-4" />
                <span>Panel SuperAdmin ↗</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAdminTab('AUTHORITIES');
                  setShowAdminModal(true);
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edición Rápida</span>
              </button>
            </div>
          )}
        </div>

        {/* SELECTOR DE ÁMBITO (MDQ vs ARGENTINA) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-[#07090e] p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveScope('MDQ')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeScope === 'MDQ'
                  ? 'bg-emerald-500 text-[#07090e] shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌊 Asociación Mar del Plata</span>
              <span className="text-[10px] opacity-80">({authorities.filter((a) => a.scope === 'MDQ').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveScope('ARGENTINA')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeScope === 'ARGENTINA'
                  ? 'bg-[#00e676] text-[#07090e] shadow-lg shadow-[#00e676]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇦🇷 Dardos Argentina (Nacional)</span>
              <span className="text-[10px] opacity-80">({authorities.filter((a) => a.scope === 'ARGENTINA').length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Comisión Directiva Período 2026-2028</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: ORGANIGRAMA Y AUTORIDADES OFICIALES */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Comisión Directiva y Autoridades Designadas</span>
            </h2>
            <p className="text-xs text-slate-400">
              Estructura jerárquica institucional y organigrama deportivo oficial.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Selector de Vista: Organigrama vs Grilla */}
            <div className="flex items-center bg-[#07090e] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('ORGANIGRAMA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  viewMode === 'ORGANIGRAMA'
                    ? 'bg-[#00e676] text-[#07090e] shadow-md shadow-[#00e676]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vista Organigrama Jerárquico"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Organigrama</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
                  viewMode === 'GRID'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Vista Grilla Estándar"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grilla</span>
              </button>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleOpenAddAuthority}
                className="px-3.5 py-1.5 rounded-xl bg-[#00e676]/15 hover:bg-[#00e676]/25 text-[#00e676] text-xs font-black border border-[#00e676]/30 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Sumar Autoridad</span>
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO: VISTA ORGANIGRAMA O VISTA GRILLA */}
        {viewMode === 'ORGANIGRAMA' ? (
          <div className="space-y-6 pt-1">
            {/* NIVEL 1: PRESIDENCIA */}
            {authoritiesByTier[1].length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-lg shadow-amber-500/10">
                    <span className="text-sm">👑</span>
                    <span>Nivel 1 • Presidencia Institucional</span>
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    {authoritiesByTier[1].map((auth) => {
                      const idx = filteredAuthorities.findIndex((a) => a.id === auth.id);
                      return renderAuthorityCard(auth, idx);
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CONECTOR JERÁRQUICO NIVEL 1 -> 2 */}
            {authoritiesByTier[1].length > 0 && authoritiesByTier[2].length > 0 && (
              <div className="flex flex-col items-center justify-center my-3 relative select-none">
                <div className="w-0.5 h-5 bg-gradient-to-b from-amber-400 to-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-400/20 flex items-center justify-center shadow-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/70" />
                </div>
                <div className="w-0.5 h-5 bg-gradient-to-b from-amber-500/60 to-emerald-500/60" />
              </div>
            )}

            {/* NIVEL 2: MESA DIRECTIVA EJECUTIVA */}
            {authoritiesByTier[2].length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-md">
                    <span className="text-sm">🏛️</span>
                    <span>Nivel 2 • Mesa Directiva Ejecutiva</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {authoritiesByTier[2].map((auth) => {
                    const idx = filteredAuthorities.findIndex((a) => a.id === auth.id);
                    return renderAuthorityCard(auth, idx);
                  })}
                </div>
              </div>
            )}

            {/* CONECTOR JERÁRQUICO NIVEL 2 -> 3 */}
            {authoritiesByTier[2].length > 0 && authoritiesByTier[3].length > 0 && (
              <div className="flex flex-col items-center justify-center my-3 relative select-none">
                <div className="w-0.5 h-5 bg-gradient-to-b from-emerald-500/60 to-[#00e676]" />
                <div className="w-3 h-3 rounded-full bg-[#00e676] ring-4 ring-[#00e676]/20 flex items-center justify-center shadow-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/70" />
                </div>
                <div className="w-0.5 h-5 bg-gradient-to-b from-[#00e676] to-sky-500/60" />
              </div>
            )}

            {/* NIVEL 3: SECRETARÍAS OPERATIVAS & ÁREAS TÉCNICAS */}
            {authoritiesByTier[3].length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 shadow-md">
                    <span className="text-sm">⚡</span>
                    <span>Nivel 3 • Secretarías & Direcciones Operativas</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {authoritiesByTier[3].map((auth) => {
                    const idx = filteredAuthorities.findIndex((a) => a.id === auth.id);
                    return renderAuthorityCard(auth, idx);
                  })}
                </div>
              </div>
            )}

            {/* CONECTOR JERÁRQUICO NIVEL 3 -> 4 */}
            {authoritiesByTier[3].length > 0 && authoritiesByTier[4].length > 0 && (
              <div className="flex flex-col items-center justify-center my-3 relative select-none">
                <div className="w-0.5 h-5 bg-gradient-to-b from-sky-500/60 to-slate-600" />
                <div className="w-3 h-3 rounded-full bg-sky-400 ring-4 ring-sky-400/20 flex items-center justify-center shadow-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/70" />
                </div>
                <div className="w-0.5 h-5 bg-gradient-to-b from-slate-600 to-slate-700" />
              </div>
            )}

            {/* NIVEL 4: VOCALES & LOGÍSTICA DE DIANAS */}
            {authoritiesByTier[4].length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 shadow-md">
                    <span className="text-sm">🎯</span>
                    <span>Nivel 4 • Cuerpo de Vocales & Logística de Pista</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                  {authoritiesByTier[4].map((auth) => {
                    const idx = filteredAuthorities.findIndex((a) => a.id === auth.id);
                    return renderAuthorityCard(auth, idx);
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAuthorities.map((auth, idx) => renderAuthorityCard(auth, idx))}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: DATOS BANCARIOS OFICIALES PARA INSCRIPCIONES */}
      <div className="bg-[#0f1422] border border-[#1e2638] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-1">
              <CreditCard className="w-3 h-3" />
              <span>Cuenta Bancaria Oficial de Cobros</span>
            </div>
            <h2 className="text-lg font-black text-white">
              Datos para Pago de Inscripciones a Torneos
            </h2>
            <p className="text-xs text-slate-400">
              Cuenta habilitada para recepción de transferencias bancarias oficiales de competiciones.
            </p>
          </div>

          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href="/superadmin?tab=payments"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                <span>Configurar en Vitrina 4 ↗</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAdminTab('BANK');
                  setShowAdminModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00e676] text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edición Rápida</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#07090e] p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Banco / Entidad</div>
            <div className="font-black text-white text-sm mt-0.5">{bankAccount.bankName}</div>
            <div className="text-[11px] text-slate-400 mt-1">{bankAccount.accountType}</div>
          </div>

          <div className="bg-[#07090e] p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Titular de la Cuenta</div>
            <div className="font-black text-white text-sm mt-0.5 truncate">{bankAccount.holderName}</div>
            <div className="text-[11px] text-slate-400 mt-1">CUIT: {bankAccount.cuitCuil}</div>
          </div>

          <div className="bg-[#07090e] p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Alias CBU / CVU</div>
              <div className="font-mono font-black text-[#00e676] text-sm mt-0.5">{bankAccount.alias}</div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(bankAccount.alias, 'page_alias')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              {copiedField === 'page_alias' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00e676]" />
                  <span className="text-[#00e676]">Listo</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#07090e] p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">CBU / CVU</div>
              <div className="font-mono font-bold text-slate-200 text-xs mt-0.5 truncate">{bankAccount.cbuCvu}</div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(bankAccount.cbuCvu, 'page_cbu')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
            >
              {copiedField === 'page_cbu' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00e676]" />
                  <span className="text-[#00e676]">Listo</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* INSTRUCCIÓN DE COMPROBANTE WHATSAPP */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-[#07090e] to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">
                Envío de Comprobante por WhatsApp al Administrador Designado
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Administrador: <strong className="text-white">{bankAccount.adminWhatsAppName}</strong> • {bankAccount.notes || 'Confirmación inmediata de cupo.'}
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${bankAccount.adminWhatsAppPhone}?text=${encodeURIComponent('Hola, me comunico para enviar el comprobante de inscripción a un torneo oficial de la Asociación de Dardos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-white text-transparent" />
            <span>Abrir Chat de WhatsApp</span>
          </a>
        </div>
      </div>

      {/* MODAL ADMINISTRATIVO (EXCLUSIVO ICEMAN) */}
      {isSuperAdmin && showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-5 flex justify-center items-start sm:items-center">
          <div className="w-full max-w-2xl bg-[#07090e] border-2 border-[#00e676] rounded-3xl p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y space-y-4">
            {/* Cabecera Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-[#00e676]" />
                <h3 className="text-base font-black text-white">
                  Panel de Administración • Asociación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Pestañas del Modal */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setAdminTab('AUTHORITIES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                  adminTab === 'AUTHORITIES'
                    ? 'bg-[#00e676] text-black'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {editingAuthority ? 'Editar Autoridad' : 'Configurar Autoridades'}
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('BANK')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                  adminTab === 'BANK'
                    ? 'bg-[#00e676] text-black'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Cuenta Bancaria Oficial
              </button>
            </div>

            {/* TAB 1: FORMULARIO DE AUTORIDADES */}
            {adminTab === 'AUTHORITIES' && (
              <form onSubmit={handleSaveAuthority} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      Ámbito de la Autoridad
                    </label>
                    <select
                      value={authScope}
                      onChange={(e) => setAuthScope(e.target.value as AssociationScope)}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    >
                      <option value="MDQ">Asociación de Dardos Mar del Plata (MDQ)</option>
                      <option value="ARGENTINA">Dardos Argentina (Nacional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      Vincular Jugador Registrado (Foto y Datos)
                    </label>
                    <select
                      value={selectedPlayerId}
                      onChange={(e) => handlePlayerSelectChange(e.target.value)}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    >
                      <option value="custom">-- Carga Manual Independiente --</option>
                      {availablePlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} (@{p.nickname}) • {p.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Ej: Mariano Deux"
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-[#00e676]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      Apodo Oficial (@nickname)
                    </label>
                    <input
                      type="text"
                      value={authNickname}
                      onChange={(e) => setAuthNickname(e.target.value)}
                      placeholder="Ej: ICEMAN"
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-[#00e676]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      Puesto / Cargo Oficial *
                    </label>
                    <input
                      type="text"
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value)}
                      placeholder="Ej: Presidente, Tesorero, Director de Torneos..."
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-[#00e676]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      Foto Oficial de la Autoridad
                    </label>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#07090e] border border-slate-700 flex-shrink-0">
                        <img
                          src={authPhotoUrl || '/logos/logo-mdq.png'}
                          alt="Previsualización"
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
                        className="flex-1 bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-[#00e676]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Club</label>
                    <input
                      type="text"
                      value={authClub}
                      onChange={(e) => setAuthClub(e.target.value)}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Ciudad</label>
                    <input
                      type="text"
                      value={authCity}
                      onChange={(e) => setAuthCity(e.target.value)}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Provincia</label>
                    <input
                      type="text"
                      value={authProvince}
                      onChange={(e) => setAuthProvince(e.target.value)}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    Descripción / Funciones de la Autoridad
                  </label>
                  <textarea
                    rows={2}
                    value={authBio}
                    onChange={(e) => setAuthBio(e.target.value)}
                    placeholder="Responsabilidades de la autoridad en la comisión..."
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl p-3 text-white text-xs font-bold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Teléfono WhatsApp</label>
                    <input
                      type="text"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="Ej: 5492235218765"
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Email Institucional</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="ejemplo@dardosargentina.com"
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    {editingAuthority ? 'Guardar Cambios' : 'Registrar Autoridad'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: FORMULARIO DE CUENTA BANCARIA */}
            {adminTab === 'BANK' && (
              <form onSubmit={handleSaveBankForm} className="space-y-4">
                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Banco / Entidad *</label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Tipo de Cuenta</label>
                    <input
                      type="text"
                      value={bankForm.accountType}
                      onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Titular de la Cuenta *</label>
                    <input
                      type="text"
                      value={bankForm.holderName}
                      onChange={(e) => setBankForm({ ...bankForm, holderName: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">CUIT / CUIL *</label>
                    <input
                      type="text"
                      value={bankForm.cuitCuil}
                      onChange={(e) => setBankForm({ ...bankForm, cuitCuil: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">Alias CBU / CVU *</label>
                    <input
                      type="text"
                      value={bankForm.alias}
                      onChange={(e) => setBankForm({ ...bankForm, alias: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-[#00e676] text-xs font-black font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">CBU / CVU Numérico (22 dígitos) *</label>
                    <input
                      type="text"
                      value={bankForm.cbuCvu}
                      onChange={(e) => setBankForm({ ...bankForm, cbuCvu: e.target.value })}
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      WhatsApp Administrador para Comprobantes *
                    </label>
                    <input
                      type="text"
                      value={bankForm.adminWhatsAppPhone}
                      onChange={(e) => setBankForm({ ...bankForm, adminWhatsAppPhone: e.target.value })}
                      placeholder="Ej: 5492235218765"
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 text-xs">
                      Nombre del Administrador Encargado *
                    </label>
                    <input
                      type="text"
                      value={bankForm.adminWhatsAppName}
                      onChange={(e) => setBankForm({ ...bankForm, adminWhatsAppName: e.target.value })}
                      placeholder="Ej: Mariano Deux (ICEMAN)"
                      className="w-full bg-[#111622] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 text-xs">
                    Instrucciones / Notas para el Jugador
                  </label>
                  <textarea
                    rows={2}
                    value={bankForm.notes || ''}
                    onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
                    className="w-full bg-[#111622] border border-slate-700 rounded-xl p-3 text-white text-xs font-bold resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-[#07090e] font-black text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    Guardar Datos Bancarios
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
