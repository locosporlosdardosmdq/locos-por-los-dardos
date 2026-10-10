'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { CartDrawer } from '@/components/tienda/CartDrawer';
import { useCart } from '@/app/providers';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, clearCart } = useCart();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('lpld_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('lpld_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans antialiased">
      {/* Menú lateral colapsable (Sidebar) */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Contenedor principal con margen izquierdo adaptativo en desktop */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        {/* Barra superior fija */}
        <AppTopBar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
        />

        {/* Contenido de página con fondo negro profundo */}
        <main className="flex-1 w-full bg-[#07090e]">
          {children}
        </main>
      </div>

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
