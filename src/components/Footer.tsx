import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { Target, Trophy, ShoppingBag, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#10121a] border-t border-[#313647] text-[#b8ad98] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Columna Marca */}
        <div className="space-y-4 md:col-span-1">
          <BrandLogo size="md" />
          <p className="text-xs text-[#b8ad98] leading-relaxed">
            Plataforma oficial de la comunidad de dardos en Argentina. Anotador profesional PWA táctil, gestión integral de torneos presenciales y online, circuito nacional y tienda oficial.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#00b853] font-semibold bg-[#00b853]/10 border border-[#00b853]/30 px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>PWA Oficial • Mar del Plata, Argentina</span>
          </div>
        </div>

        {/* Módulos de Juego */}
        <div>
          <h4 className="text-sm font-bold text-[#efe7d8] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00b853]" />
            Competición y Juego
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/anotador" className="hover:text-[#00b853] transition-colors">
                Anotador Rápido (X01 / Cricket)
              </Link>
            </li>
            <li>
              <Link href="/anotador" className="hover:text-[#00b853] transition-colors">
                Entrenamientos (Bob&apos;s 27 / Round the Clock)
              </Link>
            </li>
            <li>
              <Link href="/torneos" className="hover:text-[#00b853] transition-colors">
                Torneos y Llaves Nakka n01
              </Link>
            </li>
            <li>
              <Link href="/ranking" className="hover:text-[#00b853] transition-colors">
                Ranking Nacional Argentino
              </Link>
            </li>
          </ul>
        </div>

        {/* Tienda & Equipamiento */}
        <div>
          <h4 className="text-sm font-bold text-[#efe7d8] uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#e52521]" />
            Tienda & Equipamiento
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/tienda" className="hover:text-[#00b853] transition-colors">
                Dardos 90% Tungsteno
              </Link>
            </li>
            <li>
              <Link href="/tienda" className="hover:text-[#00b853] transition-colors">
                Dianas Profesionales Sisal (Samurai / Blade 6)
              </Link>
            </li>
            <li>
              <Link href="/tienda" className="hover:text-[#00b853] transition-colors">
                Plumas & Cañas K-Flex
              </Link>
            </li>
            <li>
              <span className="text-slate-400">
                Pagos en ARS vía Mercado Pago
              </span>
            </li>
          </ul>
        </div>

        {/* Comunidad y Sedes */}
        <div>
          <h4 className="text-sm font-bold text-[#efe7d8] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#1d68ed]" />
            Comunidad MDQ & Nacional
          </h4>
          <p className="text-xs text-[#b8ad98] leading-relaxed mb-3">
            Impulsado por el club <strong className="text-[#00b853]">Darderos Mar del Plata</strong>, promoviendo el deporte del dardo en la Costa Atlántica y en todas las provincias del país.
          </p>
          <div className="text-[11px] text-[#b8ad98] flex items-center gap-1.5 pt-2 border-t border-[#313647]">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-[#e52521] fill-[#e52521] inline" />
            <span>para los darderos de Argentina</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#313647] flex flex-col sm:flex-row items-center justify-between text-xs text-[#b8ad98]/80">
        <p>© 2026 Locos por los Dardos Argentina & Darderos Mar del Plata. Todos los derechos reservados.</p>
        <p className="mt-2 sm:mt-0">Paleta Oficial Diana Samurai • Progressive Web App</p>
      </div>
    </footer>
  );
};
