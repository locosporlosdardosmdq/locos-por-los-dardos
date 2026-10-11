'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppBottomNav } from './AppBottomNav';
import { CartDrawer } from '@/components/tienda/CartDrawer';
import { OnboardingProfileModal } from '@/components/perfil/OnboardingProfileModal';
import { useCart } from '@/app/providers';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans antialiased">
      {/* Modal obligatorio de primer ingreso si el usuario no ha completado su perfil */}
      <OnboardingProfileModal />

      {/* Menú lateral con colapso/expansión gobernado 100% por Hover del Mouse en PC */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Contenedor principal: margen fijo en desktop (lg:pl-20) para evitar saltos de pantalla */}
      <div className="flex-1 flex flex-col lg:pl-20 transition-all duration-300 ease-in-out">
        {/* Contenido de página a pantalla completa (sin TopBar para maximizar espacio del juego) */}
        <main className="flex-1 w-full bg-[#07090e] pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Barra de Navegación Inferior Ergonómica para Celulares y Tablets */}
      <AppBottomNav onOpenMobileMenu={() => setMobileOpen(true)} />

      {/* Carrito de Compras lateral accesible en toda la app */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
};
