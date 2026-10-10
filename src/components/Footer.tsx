import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { Target, Trophy, ShoppingBag, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070a12] border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Columna Marca */}
        <div className="space-y-4 md:col-span-1">
          <BrandLogo size="md" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Plataforma oficial de la comunidad de dardos en Argentina. Anotador profesional PWA táctil, gestión integral de torneos presenciales y online, circuito nacional y tienda oficial.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>PWA Oficial • Mar del Plata, Argentina</span>
          </div>
        </div>

        {/* Módulos */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Competición y Juego
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/anotador" className="hover:text-emerald-400 transition-colors">
                Anotador Rápido (X01 / Cricket)
              </Link>
            </li>
            <li>
              <Link href="/anotador?mode=cpu" className="hover:text-emerald-400 transition-colors">
                Práctica contra Bot / CPU
              </Link>
            </li>
            <li>
              <Link href="/torneos" className="hover:text-emerald-400 transition-colors">
                Torneos y Llaves Nakka n01
              </Link>
            </li>
            <li>
              <Link href="/ranking" className="hover:text-emerald-400 transition-colors">
                Ranking Nacional Argentino
              </Link>
            </li>
          </ul>
        </div>

        {/* Tienda & Comunidad */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Tienda & Sedes
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/tienda?cat=DARDOS" className="hover:text-emerald-400 transition-colors">
                Dardos 90% Tungsteno
              </Link>
            </li>
            <li>
              <Link href="/tienda?cat=DIANAS" className="hover:text-emerald-400 transition-colors">
                Dianas Profesionales Sisal
              </Link>
            </li>
            <li>
              <Link href="/tienda?cat=PLUMAS" className="hover:text-emerald-400 transition-colors">
                Plumas & Cañas K-Flex
              </Link>
            </li>
            <li>
              <span className="text-slate-500">
                Pagos en ARS vía Mercado Pago
              </span>
            </li>
          </ul>
        </div>

        {/* Sede Mar del Plata & Créditos */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            Comunidad MDQ & Nacional
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Impulsado por el club <strong className="text-emerald-300">Darderos Mar del Plata</strong>, promoviendo el deporte del dardo en la Costa Atlántica y en todas las provincias del país.
          </p>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>para los darderos de Argentina</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 Locos por los Dardos Argentina & Darderos Mar del Plata. Todos los derechos reservados.</p>
        <p className="mt-2 sm:mt-0">PWA Offline Capable • Progressive Web App</p>
      </div>
    </footer>
  );
};
