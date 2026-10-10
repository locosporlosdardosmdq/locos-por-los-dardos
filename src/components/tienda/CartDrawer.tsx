'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CartItem } from '@/lib/types';
import { PROVINCIAS_ARGENTINA } from '@/lib/constants';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const [customerName, setCustomerName] = useState('Facundo López');
  const [customerEmail, setCustomerEmail] = useState('facundo.mdq@dardosargentina.com');
  const [customerPhone, setCustomerPhone] = useState('+54 9 223 555-8941');
  const [address, setAddress] = useState('Av. Colón 2450, Piso 4');
  const [city, setCity] = useState('Mar del Plata');
  const [province, setProvince] = useState('Buenos Aires');

  const [isLoading, setIsLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);

  if (!isOpen) return null;

  const subtotalArs = items.reduce((sum, item) => sum + item.product.priceArs * item.quantity, 0);
  const freeShippingThreshold = 100000;
  const shippingCostArs = subtotalArs >= freeShippingThreshold || subtotalArs === 0 ? 0 : 8500;
  const totalArs = subtotalArs + shippingCostArs;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            priceArs: i.product.priceArs,
            quantity: i.quantity
          })),
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address,
            city,
            province
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setOrderCompleted(data);
        onClearCart();
      } else {
        alert(data.error || 'Error al iniciar checkout');
      }
    } catch (err) {
      console.error(err);
      alert('Error conectando con la pasarela de pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14161f]/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-[#1c1f2b] border-l border-[#313647] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header del Carrito */}
        <div className="p-4 sm:p-5 border-b border-[#313647] flex items-center justify-between bg-[#14161f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#00b853]/20 text-[#00b853] rounded-2xl border border-[#00b853]/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Carrito de Compras</h3>
              <span className="text-xs text-[#b8ad98]">
                {items.length} {items.length === 1 ? 'artículo' : 'artículos'} seleccionados
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#b8ad98] hover:text-white rounded-xl hover:bg-[#242836]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal de Orden Generada */}
        {orderCompleted ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#00b853]/20 border-2 border-[#00b853] mx-auto flex items-center justify-center text-[#00b853]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-2xl font-black text-white">¡Preferencia Creada!</h4>
            <p className="text-xs text-[#b8ad98] max-w-xs mx-auto">
              Orden #{orderCompleted.orderId} lista para abonar con Mercado Pago en Pesos Argentinos (ARS).
            </p>

            <div className="bg-[#14161f] border border-[#313647] rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#b8ad98]">Total a Pagar:</span>
                <strong className="text-[#00b853] font-mono text-base">
                  ${totalArs.toLocaleString('es-AR')} ARS
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b8ad98]">Destino:</span>
                <span className="text-white">{city}, {province}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b8ad98]">Plataforma:</span>
                <span className="text-[#38bdf8] font-black">Mercado Pago Checkout Pro</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={orderCompleted.initPoint || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-[#1d68ed] hover:bg-[#1a5bcc] text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pagar con Mercado Pago
              </a>
              <button
                type="button"
                onClick={() => {
                  setOrderCompleted(null);
                  onClose();
                }}
                className="py-2.5 text-xs text-[#b8ad98] hover:text-white"
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        ) : (
          /* Contenido del Carrito */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-16 text-[#b8ad98] space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-sm">Tu carrito está vacío.</p>
                <p className="text-xs text-[#b8ad98]/70">
                  Explora nuestro catálogo de dardos de tungsteno, dianas Samurai y accesorios oficiales.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-[#14161f] border border-[#313647] rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#0d0e12] border border-[#313647] flex-shrink-0">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-[#b8ad98] block">
                          {item.product.brand}
                        </span>
                        <span className="font-mono font-black text-[#00b853] text-xs">
                          ${item.product.priceArs.toLocaleString('es-AR')} ARS
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-[#242836] p-1 rounded-xl border border-[#313647]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-[#b8ad98] hover:text-white rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1.5 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-[#b8ad98] hover:text-white rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-[#b8ad98] hover:text-[#e52521]"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Banner Envío Gratis en Verde Diana */}
                <div className="p-3 rounded-2xl bg-[#00b853]/15 border border-[#00b853]/30 text-xs text-[#00b853] flex items-center gap-2">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {subtotalArs >= freeShippingThreshold
                      ? '¡Felicidades! Tienes Envío Gratis a toda Argentina.'
                      : `Agrega $${(freeShippingThreshold - subtotalArs).toLocaleString('es-AR')} ARS más para Envío Gratis.`}
                  </span>
                </div>

                {/* Formulario de Envío en Gris Oscuro */}
                <div className="border-t border-[#313647] pt-4 space-y-3">
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">
                    Datos de Entrega en Argentina
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[#b8ad98] font-bold block mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#14161f] border border-[#313647] rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[#b8ad98] font-bold block mb-1">WhatsApp</label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#14161f] border border-[#313647] rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-[#b8ad98] font-bold block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-[#14161f] border border-[#313647] rounded-xl p-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[#b8ad98] font-bold block mb-1">Provincia</label>
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full bg-[#14161f] border border-[#313647] rounded-xl p-2 text-white"
                      >
                        {PROVINCIAS_ARGENTINA.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[#b8ad98] font-bold block mb-1">Ciudad</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#14161f] border border-[#313647] rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-[#b8ad98] font-bold block mb-1">Dirección / Calle y Número</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#14161f] border border-[#313647] rounded-xl p-2 text-white"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer con Resumen y Botón Mercado Pago */}
        {!orderCompleted && items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#313647] bg-[#14161f] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#b8ad98]">
                <span>Subtotal:</span>
                <span className="font-mono text-white">${subtotalArs.toLocaleString('es-AR')} ARS</span>
              </div>
              <div className="flex justify-between text-[#b8ad98]">
                <span>Envío a domicilio:</span>
                <span className="font-mono text-white">
                  {shippingCostArs === 0 ? '¡GRATIS!' : `$${shippingCostArs.toLocaleString('es-AR')} ARS`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-1 border-t border-[#313647]">
                <span>Total Final:</span>
                <span className="font-mono text-[#00b853]">${totalArs.toLocaleString('es-AR')} ARS</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#1d68ed] to-[#00b853] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isLoading ? 'Conectando con Mercado Pago...' : 'Pagar con Mercado Pago (ARS)'}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#b8ad98]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00b853]" />
              <span>Transacción cifrada y protegida por Mercado Pago Argentina</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
