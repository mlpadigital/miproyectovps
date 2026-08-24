import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClothingTemplate = ({ config }) => {
  const { colors, content } = config;
  
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Navbar */}
      <nav className="py-6 px-8 flex justify-between items-center border-b" style={{ borderColor: `${colors.text}20` }}>
        <h1 className="text-2xl font-bold tracking-tighter uppercase">{content.storeName || "MODA"}</h1>
        <div className="flex gap-4 text-sm font-medium uppercase tracking-wide">
          <span>Colección</span>
          <span>Nuevos</span>
          <span>Rebajas</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          {content.heroImage ? (
             <img src={content.heroImage} alt="Hero" className="w-full h-full object-cover opacity-90" />
          ) : (
             <div className="w-full h-full bg-gray-200 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="relative z-10 px-8 md:px-16 max-w-2xl text-white">
          <h2 className="text-6xl font-light leading-tight mb-6">
            {content.heroTitle || "Estilo Atemporal"}
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-md">
            {content.heroSubtitle || "Descubre nuestra nueva colección de verano. Telas ligeras, cortes modernos."}
          </p>
          <Button 
            className="rounded-none px-8 py-6 text-lg"
            style={{ backgroundColor: colors.primary, color: '#fff' }}
          >
            Ver Colección <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="py-20 px-8 md:px-16">
        <h3 className="text-3xl font-light mb-12 text-center uppercase tracking-widest">Tendencias</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.products.map((product, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-gray-100">
                 {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                 )}
                 <div className="absolute bottom-0 left-0 w-full p-4 bg-white/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
                   <span className="font-medium text-black">Añadir Rápido</span>
                   <ShoppingBag className="w-4 h-4 text-black" />
                 </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg text-slate-900">{product.name}</h4> {/* Changed text color here */}
                  <p className="text-sm opacity-60 text-slate-600">{product.category}</p> {/* Changed text color here */}
                </div>
                <span className="font-semibold text-slate-900" style={{ color: colors.primary }}>${product.price}</span> {/* Changed text color here */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClothingTemplate;