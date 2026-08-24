import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { ShoppingBag, Search, User, ArrowRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const StorePreview = ({ storeId }) => {
   const [config, setConfig] = useState(null);
   const [storeName, setStoreName] = useState('Tu Tienda');
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Configuración por defecto
   const defaultConfig = {
      layout: { borderRadius: 'medium', shadows: 'soft', mode: 'light', containerWidth: 'default' },
      typography: { bodyFont: 'Inter', headingFont: 'Inter', scale: 'medium' },
      colors: {
         background: '#ffffff',
         text: '#0f172a',
         primary: '#4f46e5',
         secondary: '#1e293b',
         accent: '#f59e0b'
      },
      sections: { header: true, hero: true, featured: true, footer: true }
   };

   useEffect(() => {
      if (!storeId) return;

      let isMounted = true;

      const fetchData = async () => {
         setLoading(true);
         setError(null);
         try {
            // 1. Obtener Configuración de la Tienda
            const { data: storeData, error: storeError } = await supabase
               .from('stores')
               .select('design_config, name')
               .eq('id', storeId)
               .maybeSingle();

            if (storeError) throw storeError;

            if (isMounted && storeData) {
               if (storeData.name) setStoreName(storeData.name);

               const savedConfig = storeData.design_config;
               const mergedConfig = savedConfig
                  ? {
                     ...defaultConfig,
                     ...savedConfig,
                     colors: { ...defaultConfig.colors, ...savedConfig.colors },
                     layout: { ...defaultConfig.layout, ...savedConfig.layout },
                     typography: { ...defaultConfig.typography, ...savedConfig.typography },
                     sections: { ...defaultConfig.sections, ...savedConfig.sections }
                  }
                  : defaultConfig;

               setConfig(mergedConfig);
            }

            // 2. Obtener Productos Activos
            const { data: productsData, error: productsError } = await supabase
               .from('products')
               .select('*')
               .eq('store_id', storeId)
               .eq('is_active', true)
               .limit(6);

            if (productsError) throw productsError;

            if (isMounted) {
               setProducts(productsData || []);
            }

         } catch (err) {
            console.error('Error cargando la vista previa:', err);
            if (isMounted) setError('No se pudo cargar la vista previa de la tienda.');
         } finally {
            if (isMounted) setLoading(false);
         }
      };

      fetchData();

      // 3. Suscripción en Tiempo Real
      const channel = supabase
         .channel(`store_preview_${storeId}`)
         .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'stores', filter: `id=eq.${storeId}` },
            (payload) => {
               if (!isMounted) return;

               if (payload.new) {
                  if (payload.new.name) setStoreName(payload.new.name);

                  if (payload.new.design_config) {
                     const newConfig = payload.new.design_config;
                     setConfig((prev) => ({
                        ...defaultConfig,
                        ...newConfig,
                        colors: { ...defaultConfig.colors, ...(newConfig.colors || {}) },
                        layout: { ...defaultConfig.layout, ...(newConfig.layout || {}) },
                        typography: { ...defaultConfig.typography, ...(newConfig.typography || {}) },
                        sections: { ...defaultConfig.sections, ...(newConfig.sections || {}) }
                     }));
                  }
               }
            }
         )
         .subscribe();

      return () => {
         isMounted = false;
         supabase.removeChannel(channel);
      };
   }, [storeId]);

   if (loading) {
      return (
         <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium">Cargando vista previa...</p>
         </div>
      );
   }

   if (error) {
      return (
         <div className="w-full h-96 flex flex-col items-center justify-center bg-red-50/50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-slate-700 text-sm font-medium">{error}</p>
         </div>
      );
   }

   if (!config) return null;

   // Clases y estilos derivados
   const isDark = config.layout.mode === 'dark';

   const getRadius = () => {
      switch (config.layout.borderRadius) {
         case 'none': return 'rounded-none';
         case 'soft': return 'rounded-sm';
         case 'medium': return 'rounded-lg';
         case 'rounded': return 'rounded-2xl';
         default: return 'rounded-lg';
      }
   };

   const getShadow = (base = '') => {
      if (config.layout.shadows === 'none') return '';
      const prefix = config.layout.shadows === 'soft'
         ? 'shadow-sm'
         : config.layout.shadows === 'medium'
            ? 'shadow-md'
            : 'shadow-xl';
      return `${base} ${prefix}`.trim();
   };

   const scale = config.typography.scale === 'small' ? 0.875 : config.typography.scale === 'large' ? 1.125 : 1;

   const fontStyles = {
      fontFamily: config.typography.bodyFont || 'sans-serif',
      '--heading-font': config.typography.headingFont || 'sans-serif',
   };

   return (
      <div className="w-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
         {/* BARRA SUPERIOR DE ESTADO */}
         <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
               <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
               <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            </span>
            <span className="flex items-center gap-1.5 font-medium">
               <RefreshCw className="w-3 h-3 animate-spin-slow" /> Actualización automática
            </span>
         </div>

         {/* CONTENEDOR PRINCIPAL DE LA TIENDA */}
         <div
            className="w-full relative overflow-hidden transition-colors duration-300 flex flex-col"
            style={{
               ...fontStyles,
               backgroundColor: isDark ? '#1a1a1a' : config.colors.background,
               color: isDark ? '#f5f5f5' : config.colors.text,
               minHeight: '500px'
            }}
         >
            {/* HEADER */}
            {config.sections.header && (
               <header
                  className="sticky top-0 z-20 border-b px-6 py-4 transition-colors"
                  style={{
                     backgroundColor: isDark ? '#1a1a1a' : config.colors.background,
                     borderColor: isDark ? '#333333' : '#eeeeee'
                  }}
               >
                  <div className="max-w-6xl mx-auto flex items-center justify-between">
                     <div
                        className="font-bold text-xl tracking-tight"
                        style={{ fontFamily: 'var(--heading-font)', color: config.colors.primary }}
                     >
                        {storeName}
                     </div>
                     <nav className={cn("hidden md:flex gap-6 text-sm font-medium", isDark ? 'text-gray-300' : 'text-gray-600')}>
                        <span className="cursor-pointer hover:opacity-80 transition-opacity">Inicio</span>
                        <span className="cursor-pointer hover:opacity-80 transition-opacity">Catálogo</span>
                        <span className="cursor-pointer hover:opacity-80 transition-opacity">Ofertas</span>
                     </nav>
                     <div className="flex items-center gap-4">
                        <Search className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100" />
                        <ShoppingBag className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100" />
                        <User className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100" />
                     </div>
                  </div>
               </header>
            )}

            {/* HERO SECTION */}
            {config.sections.hero && (
               <section
                  className="py-16 px-6 relative overflow-hidden"
                  style={{ backgroundColor: config.colors.secondaryBackground || (isDark ? '#222222' : '#f8fafc') }}
               >
                  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
                     <div className="flex-1 space-y-6">
                        <span
                           className={cn("inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider", getRadius())}
                           style={{ backgroundColor: `${config.colors.accent}20`, color: config.colors.accent }}
                        >
                           Nueva Temporada
                        </span>
                        <h1
                           className="font-extrabold leading-tight"
                           style={{ fontFamily: 'var(--heading-font)', color: config.colors.primary, fontSize: `${3 * scale}rem` }}
                        >
                           Calidad que inspira
                        </h1>
                        <p className="opacity-80 text-lg max-w-lg" style={{ fontSize: `${1.125 * scale}rem` }}>
                           Explora nuestra colección exclusiva diseñada pensando en ti.
                        </p>
                        <button
                           className={cn("px-8 py-3 font-semibold text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-2", getRadius(), getShadow('shadow-lg'))}
                           style={{ backgroundColor: config.colors.secondary }}
                        >
                           Ver Colección <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex-1 w-full flex justify-center">
                        <div
                           className={cn("aspect-[4/3] w-full max-w-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative", getRadius(), getShadow('shadow-xl'))}
                        >
                           <ShoppingBag className="w-20 h-20 text-slate-400 opacity-50" />
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 pointer-events-none" />
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* PRODUCTOS DESTACADOS */}
            {config.sections.featured && (
               <section className="py-16 px-6">
                  <div className="max-w-6xl mx-auto">
                     <div className="text-center mb-12">
                        <h2
                           className="font-bold mb-4"
                           style={{ fontFamily: 'var(--heading-font)', color: config.colors.primary, fontSize: `${2 * scale}rem` }}
                        >
                           Productos Destacados
                        </h2>
                        <div className="h-1 w-20 mx-auto rounded-full" style={{ backgroundColor: config.colors.accent }} />
                     </div>

                     {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                           {products.map((product) => (
                              <div
                                 key={product.id}
                                 className={cn("group transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 border overflow-hidden", getRadius(), getShadow(), isDark ? 'border-gray-700' : 'border-slate-100')}
                              >
                                 <div className="aspect-square bg-slate-100 dark:bg-gray-700 relative overflow-hidden flex items-center justify-center">
                                    {product.image_url ? (
                                       <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                       <ShoppingBag className="w-10 h-10 text-slate-300" />
                                    )}
                                    {product.stock <= 0 && (
                                       <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">Agotado</div>
                                    )}
                                 </div>
                                 <div className="p-5">
                                    <h3 className="font-bold text-lg mb-1 truncate" style={{ fontFamily: 'var(--heading-font)' }}>
                                       {product.name}
                                    </h3>
                                    <p className="text-sm opacity-60 mb-4 line-clamp-2 min-h-[2.5em]">
                                       {product.description || 'Sin descripción disponible.'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                       <span className="font-bold text-xl" style={{ color: config.colors.accent }}>
                                          ${product.price}
                                       </span>
                                       <button
                                          className={cn("p-2 text-white transition-opacity hover:opacity-90", getRadius())}
                                          style={{ backgroundColor: config.colors.primary }}
                                          aria-label="Añadir al carrito"
                                       >
                                          <ShoppingBag className="w-4 h-4" />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700">
                           <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                           <p className="text-slate-500 dark:text-slate-400 font-medium">No hay productos activos para mostrar en la vista previa</p>
                           <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Agrega productos en la sección de inventario.</p>
                        </div>
                     )}
                  </div>
               </section>
            )}

            {/* FOOTER */}
            {config.sections.footer && (
               <footer
                  className="mt-auto py-12 px-6 border-t"
                  style={{
                     backgroundColor: config.colors.primary,
                     color: '#ffffff',
                     borderColor: 'transparent'
                  }}
               >
                  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                     <div className="col-span-1 md:col-span-2">
                        <div className="font-bold text-2xl mb-4" style={{ fontFamily: 'var(--heading-font)' }}>
                           {storeName}
                        </div>
                        <p className="opacity-70 max-w-xs text-sm">
                           La mejor experiencia de compra online para nuestros clientes.
                        </p>
                     </div>
                     <div>
                        <h4 className="font-bold mb-4">Enlaces</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                           <li><span className="cursor-pointer hover:underline">Inicio</span></li>
                           <li><span className="cursor-pointer hover:underline">Catálogo</span></li>
                           <li><span className="cursor-pointer hover:underline">Contacto</span></li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-bold mb-4">Contacto</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                           <li>soporte@tutienda.com</li>
                           <li>+54 11 1234 5678</li>
                        </ul>
                     </div>
                  </div>
                  <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-50">
                     &copy; {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
                  </div>
               </footer>
            )}
         </div>
      </div>
   );
};

export default StorePreview;