'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, ProductCategory } from '@/lib/types';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { 
  ShoppingBag, 
  Search, 
  Check, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  Filter 
} from 'lucide-react';

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
  initialCategory?: ProductCategory | 'ALL';
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onAddToCart,
  initialCategory = 'ALL'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories: { key: ProductCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Todo el Catálogo' },
    { key: 'DARDOS', label: 'Dardos de Tungsteno' },
    { key: 'DIANAS', label: 'Dianas Profesionales' },
    { key: 'PLUMAS', label: 'Plumas / K-Flex' },
    { key: 'CANAS', label: 'Cañas (Shafts)' },
    { key: 'CARTUCHERAS', label: 'Cartucheras & Estuches' },
    { key: 'ACCESORIOS', label: 'Accesorios & Puntas' },
  ];

  const brands = ['ALL', 'Winmau', 'Target Darts', 'Red Dragon', 'Harrows'];

  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    const matchCat = selectedCategory === 'ALL' || prod.category === selectedCategory;
    const matchBrand = selectedBrand === 'ALL' || prod.brand.toLowerCase().includes(selectedBrand.toLowerCase());
    const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchBrand && matchSearch;
  });

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  return (
    <div className="w-full space-y-6">
      {/* Filtros Superiores & Buscador */}
      <div className="bg-[#0c1222] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo, marca o material (ej: Luke Littler, Sisal, Carbono)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Selector de Marca */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas las Marcas</option>
              {brands.filter(b => b !== 'ALL').map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pestañas de Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.key
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const isJustAdded = addedId === product.id;

          return (
            <div
              key={product.id}
              className="group bg-[#0b101c] border border-slate-800/90 hover:border-emerald-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Imagen y Badges */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md">
                    {product.brand}
                  </span>
                  {product.material && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                      {product.material}
                    </span>
                  )}
                </div>

                {product.isFeatured && (
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
                    Destacado
                  </span>
                )}
              </div>

              {/* Información */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Precio Oficial
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono font-black text-lg text-emerald-400">
                        ${product.priceArs.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">ARS</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                      isJustAdded
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>¡Agregado!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Comprar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
