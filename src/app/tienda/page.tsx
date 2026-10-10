'use client';

import React from 'react';
import { useCart } from '../providers';
import { ProductCatalog } from '@/components/tienda/ProductCatalog';
import { ShoppingBag, ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function TiendaPage() {
  const { addToCart, openCart } = useCart();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Tienda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-board-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-board-green/20 text-board-green border border-board-green/30">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-board-sisal tracking-tight">
              Tienda Oficial de Dardos Argentina
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-board-sisal-muted mt-1">
            Equipamiento profesional de tungsteno, dianas oficiales de sisal y repuestos con envío a todo el país.
          </p>
        </div>

        {/* Badges de Confianza */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-board-blue/15 border border-board-blue/40 text-board-blue font-semibold">
            <CreditCard className="w-4 h-4" />
            <span>Mercado Pago ARS</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-board-green/15 border border-board-green/40 text-board-green font-semibold">
            <Truck className="w-4 h-4" />
            <span>Envíos a todo el país</span>
          </div>
        </div>
      </div>

      <ProductCatalog onAddToCart={(prod) => {
        addToCart(prod);
        openCart();
      }} />
    </div>
  );
}
