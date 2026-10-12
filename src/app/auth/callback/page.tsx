'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { saveCurrentPlayerProfile } from '@/lib/storage';
import { Target, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verificando tu enlace de acceso...');

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session && session.user?.email) {
          const email = session.user.email.toLowerCase().trim();
          setMessage(`¡Bienvenido! Recuperando tu ficha deportiva (${email})...`);

          // Sincronizar con el perfil deportivo en la base de datos
          try {
            const res = await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'LOGIN', identifier: email })
            });

            const data = await res.json();
            if (data.success && data.profile) {
              saveCurrentPlayerProfile(data.profile);
            }
          } catch (syncErr) {
            console.warn('[Auth Callback] Advertencia al sincronizar perfil:', syncErr);
          }

          if (isMounted) {
            setStatus('success');
            setMessage('¡Inicio de sesión confirmado con éxito!');
            setTimeout(() => {
              router.push('/perfil');
            }, 1200);
          }
        } else {
          // Escuchar evento onAuthStateChange por si la URL tiene hash tokens
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user?.email && isMounted) {
              setStatus('success');
              setMessage('¡Inicio de sesión confirmado con éxito!');
              setTimeout(() => {
                router.push('/perfil');
              }, 1200);
            }
          });

          // Timeout de cortesía si no se detecta sesión
          setTimeout(() => {
            if (isMounted && status === 'verifying') {
              setStatus('error');
              setMessage('No se pudo verificar el enlace. Es posible que haya expirado o ya haya sido utilizado.');
            }
          }, 6000);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[Auth Callback Error]:', err);
          setStatus('error');
          setMessage(err.message || 'Error al procesar el enlace de acceso.');
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [router, status]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f1422] border-2 border-[#1e2638] rounded-3xl p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#00e676]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-[#00e676] flex items-center justify-center shadow-lg">
            {status === 'verifying' && <Loader2 className="w-8 h-8 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-8 h-8 text-[#00e676]" />}
            {status === 'error' && <AlertCircle className="w-8 h-8 text-red-400" />}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">
            {status === 'verifying' && 'Confirmando Enlace Mágico'}
            {status === 'success' && '¡Acceso Confirmado!'}
            {status === 'error' && 'Enlace no Válido'}
          </h2>
          <p className="text-xs text-slate-300">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full py-2.5 rounded-xl bg-[#1e2638] hover:bg-[#253047] text-white text-xs font-bold transition-colors"
          >
            Volver al Inicio
          </button>
        )}
      </div>
    </div>
  );
}
