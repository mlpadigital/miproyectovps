import React from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StationeryTemplate = ({ config }) => {
  const { colors, content } = config;

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <header className="py-4 px-6 flex justify-center bg-white/50 backdrop-blur-sm sticky top-0 z-20 border-b-4 border-dashed" style={{ borderColor: colors.secondary }}>
        <div className="bg-white px-8 py-3 rounded-full shadow-lg border-2" style={{ borderColor: colors.primary }}>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: colors.primary }}>
            <Star className="fill-current w-6 h-6" /> {content.storeName || "KidsZone"}
          </h1>
        </div>
      </header>

      {/* Hero */}
      <div className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border-4 relative overflow-hidden" style={{ borderColor: colors.secondary }}>
           {/* Decorative circles */}
           <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: colors.primary }}></div>
           <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: colors.secondary }}></div>
           
           <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
             <div className="flex-1 text-center md:text-left">
               <span className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 text-white transform -rotate-2" style={{ backgroundColor: colors.secondary }}>
                 ¡Vuelta al Cole!
               </span>
               <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-slate-800">
                 {content.heroTitle || "Colores que Inspiran"}
               </h2>
               <p className="text-lg text-slate-600 mb-8 font-medium">
                 {content.heroSubtitle || "Cuadernos, lápices y mochilas para los pequeños genios."}
               </p>
               <Button 
                 size="lg"
                 className="rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:scale-110 transition-transform"
                 style={{ backgroundColor: colors.primary, color: 'white' }}
               >
                 Explorar Tienda
               </Button>
             </div>
             <div className="flex-1">
               <div className="rounded-[2rem] overflow-hidden border-4 rotate-2 shadow-lg" style={{ borderColor: colors.text }}>
                 {content.heroImage ? (
                    <img src={content.heroImage} alt="Kids Hero" className="w-full object-cover" />
                 ) : (
                    <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-900">Imagen</div> // Changed text color here
                 )}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-center text-3xl font-black mb-12 flex justify-center items-center gap-3" style={{ color: colors.text }}>
          <Heart className="text-red-400 fill-current w-8 h-8 animate-bounce" /> Favoritos
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {content.products.map((product, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-md border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2" style={{ borderColor: colors.secondary }}>
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-900">Producto</div> // Changed text color here
                )}
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-1">{product.name}</h4>
              <div className="flex justify-between items-center mt-3">
                <span className="font-black text-xl" style={{ color: colors.primary }}>${product.price}</span>
                <button className="p-2 rounded-full text-white shadow-md hover:scale-110 transition-transform" style={{ backgroundColor: colors.secondary }}>
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StationeryTemplate;