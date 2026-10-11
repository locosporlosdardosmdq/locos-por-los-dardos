'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';
import { AppShell } from '@/components/layout/AppShell';

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

export function Providers({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Registro del Service Worker para PWA Offline (solo en producción para no romper dev)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Purgar cachés v1 obsoletos inmediatamente
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            if (name === 'locos-dardos-v1') {
              caches.delete(name);
            }
          });
        });
      }

      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registrado con éxito:', reg.scope);
            // Si hay actualización en segundo plano, forzar actualización
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    reg.update();
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[PWA] Fallo al registrar Service Worker:', err);
          });
      } else {
        // En entorno de desarrollo: desregistrar Service Worker y vaciar caches para garantizar hot-reload instantáneo
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
      }
    }
  }, []);

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
    </CartContext.Provider>
  );
}
