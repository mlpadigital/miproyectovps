import React from 'react';
import { Search, Menu, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GeneralTemplate = ({ config }) => {
  const { colors, content } = config;

  return (
    <div className="min-h-screen bg-gray-50 font-sans" style={{ color: colors.text }}>
      {/* Top Bar */}
      <div className="text-white text-sm py-2 px-4 text-center font-medium" style={{ backgroundColor: colors.primary }}>
        Envío gratis en pedidos superiores a $50
      </div>

      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
             <Menu className="md:hidden w-6 h-6 text-slate-900" /> {/* Changed icon color here */}
             <h1 className="text-2xl font-bold text-gray-900">{content.storeName || "MarketPlace"}</h1>
          </div>
          
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Input placeholder="Buscar productos..." className="bg-gray-100 border-transparent focus:bg-white pl-10 text-slate-900" /> {/* Changed text color here */}
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end leading-tight hidden sm:block">
              <span className="text-xs text-gray-500">Bienvenido</span>
              <span className="text-sm font-bold text-slate-900">Mi Cuenta</span> {/* Changed text color here */}
            </div>
            <div className="relative">
               <ShoppingCart className="w-6 h-6 text-gray-700" />
               <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[500px]">
          {/* Main Banner */}
          <div className="md:col-span-2 relative rounded-xl overflow-hidden bg-gray-900 text-white flex items-center">
             <div className="absolute inset-0">
               {content.heroImage ? (
                 <img src={content.heroImage} alt="Hero" className="w-full h-full object-cover opacity-60" />
               ) : (
                 <div className="w-full h-full bg-gray-800" />
               )}
             </div>
             <div className="relative z-10 p-12">
                <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded mb-4">DESTACADO</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {content.heroTitle || "Todo lo que necesitas"}
                </h2>
                <p className="text-lg text-gray-200 mb-8 max-w-md">
                  {content.heroSubtitle || "Calidad premium a precios imbatibles."}
                </p>
                <Button size="lg" className="font-bold" style={{ backgroundColor: colors.primary }}>
                  Comprar Ahora
                </Button>
             </div>
          </div>
          
          {/* Side Banners */}
          <div className="hidden md:grid grid-rows-2 gap-8">
            <div className="bg-blue-50 rounded-xl p-6 flex flex-col justify-center items-start border border-blue-100">
               <h3 className="font-bold text-xl text-blue-900 mb-2">Electrónica</h3>
               <p className="text-blue-700 text-sm mb-4">Hasta 40% OFF</p>
               <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">Ver Ofertas</Button>
            </div>
            <div className="bg-orange-50 rounded-xl p-6 flex flex-col justify-center items-start border border-orange-100">
               <h3 className="font-bold text-xl text-orange-900 mb-2">Hogar & Deco</h3>
               <p className="text-orange-700 text-sm mb-4">Nueva Colección</p>
               <Button variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-100">Explorar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-800">Recomendados para ti</h3>
          <Button variant="link" className="text-slate-900">Ver Todo</Button> {/* Changed text color here */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {content.products.map((product, i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-square bg-gray-100 relative p-4 flex items-center justify-center">
                {product.image ? (
                   <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                ) : (
                   <div className="text-gray-300">Img</div>
                )}
                {i === 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">OFERTA</span>}
              </div>
              <div className="p-4">
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-lg" style={{ color: colors.primary }}>${product.price}</span>
                  {i === 0 && <span className="text-sm text-gray-400 line-through">$999</span>}
                </div>
                <Button className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs h-8" style={{ backgroundColor: colors.primary }}>
                  Añadir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralTemplate;