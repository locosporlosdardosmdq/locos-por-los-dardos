'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';
import { AppShell } from '@/components/layout/AppShell';
import { Smartphone, Download, X, Share, PlusSquare } from 'lucide-react';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Contexto Global de Instalación PWA (Android, iOS y Desktop)
interface InstallPwaContextType {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<void>;
}

const InstallPwaContext = createContext<InstallPwaContextType | undefined>(undefined);

export const useInstallPwa = () => {
  const context = useContext(InstallPwaContext);
  if (!context) {
    throw new Error('useInstallPwa must be used within Providers');
  }
  return context;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Detección de PWA, Service Worker y Evento de Instalación
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detectar si ya está instalada / modo standalone
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Capturar evento 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Registro del Service Worker
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .catch((err) => console.warn('[PWA] Fallo al registrar Service Worker:', err));
      } else {
        // En desarrollo desregistrar para evitar caching de hot-reload
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) reg.unregister();
        });
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <InstallPwaContext.Provider
      value={{
        canInstall: !!deferredPrompt || isIOS,
        isInstalled,
        isIOS,
        promptInstall
      }}
    >
      <CartContext.Provider
        value={{
          items,
          addToCart,
          updateQuantity,
          removeFromCart,
          clearCart,
          isCartOpen,
          openCart: () => setIsCartOpen(true),
          closeCart: () => setIsCartOpen(false),
          totalItems,
        }}
      >
        <AppShell>
          {children}
        </AppShell>

        {/* Modal de Instrucciones para iPhone (Safari) y Otros Navegadores */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-[#0f1422] border-2 border-[#1e2638] rounded-3xl p-6 space-y-4 shadow-2xl relative text-left">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#1a2333]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00e676]/20 border border-[#00e676]/40 text-[#00e676] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Instalar en tu Celular</h3>
                  <p className="text-[11px] text-slate-400">Locos por los Dardos App</p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-3 text-xs text-slate-300 bg-[#141824] p-4 rounded-2xl border border-[#232d40]">
                  <p className="font-bold text-white">En tu iPhone / iPad:</p>
                  <ol className="space-y-2 list-decimal list-inside text-slate-300">
                    <li className="flex items-center gap-2">
                      <span>1. Toca el botón <strong>Compartir</strong></span>
                      <Share className="w-4 h-4 text-sky-400 inline" />
                    </li>
                    <li className="flex items-center gap-2">
                      <span>2. Selecciona <strong>Agregar a pantalla de inicio</strong></span>
                      <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
                    </li>
                    <li>3. Toca <strong>Agregar</strong> arriba a la derecha.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-300 bg-[#141824] p-4 rounded-2xl border border-[#232d40]">
                  <p className="font-bold text-white">En Android (Chrome):</p>
                  <ol className="space-y-2 list-decimal list-inside text-slate-300">
                    <li>1. Abre el menú <strong>⋮</strong> (tres puntos arriba a la derecha).</li>
                    <li>2. Toca <strong>Instalar aplicación</strong> o <strong>Agregar a la pantalla principal</strong>.</li>
                    <li>3. Confirma la instalación.</li>
                  </ol>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#00e676] text-[#07090e] font-black text-xs hover:bg-[#00c853] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </CartContext.Provider>
    </InstallPwaContext.Provider>
  );
}
