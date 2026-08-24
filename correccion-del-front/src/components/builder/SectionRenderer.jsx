import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star, ArrowRight, CheckCircle2, Twitter, Facebook, Instagram } from 'lucide-react';

// Utility to safely render styled text
const StyledText = ({ text, styles = {}, className }) => {
  if (!text) return null;
  
  // Map internal style props to Tailwind or inline styles
  const styleProps = {
    color: styles.color,
    fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
    fontWeight: styles.bold ? 'bold' : 'normal',
    fontStyle: styles.italic ? 'italic' : 'normal',
    textAlign: styles.align || 'left',
  };

  return <div style={styleProps} className={cn("transition-all duration-200", className)}>{text}</div>;
};

const SectionRenderer = ({ section, isSelected, onClick }) => {
  const { type, content, style } = section;

  const containerStyles = {
    backgroundColor: style?.backgroundColor || '#ffffff',
    paddingTop: `${style?.paddingY || 60}px`,
    paddingBottom: `${style?.paddingY || 60}px`,
    fontFamily: style?.fontFamily || 'Inter, sans-serif',
  };

  const renderContent = () => {
    switch (type) {
      case 'hero':
        return (
          <div className={cn("container mx-auto px-4 flex flex-col gap-8", style?.align === 'center' ? 'items-center text-center' : 'items-start text-left')}>
            <div className="max-w-3xl space-y-6">
              <StyledText text={content.title} styles={content.titleStyle} className="text-4xl md:text-6xl leading-tight" />
              <StyledText text={content.subtitle} styles={content.subtitleStyle} className="text-xl opacity-90" />
              
              {content.showButton && (
                <Button 
                  size={content.buttonSize || 'lg'}
                  style={{ 
                    backgroundColor: content.buttonColor || '#000', 
                    color: content.buttonTextColor || '#fff' 
                  }}
                  className="mt-4"
                >
                  {content.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            {content.image && (
              <div className="w-full mt-8 rounded-xl overflow-hidden shadow-2xl">
                <img src={content.image} alt="Imagen de Fondo" className="w-full h-full object-cover max-h-[600px]" />
              </div>
            )}
          </div>
        );

      case 'products':
        return (
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <StyledText text={content.title} styles={content.titleStyle} className="text-3xl font-bold mb-4" />
              <StyledText text={content.description} styles={content.descStyle} className="text-gray-500" />
            </div>
            
            <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${style?.columns || 3}, minmax(0, 1fr))` }}>
              {[1, 2, 3, 4, 5, 6].slice(0, style?.itemCount || 3).map((i) => (
                <div key={i} className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                    <img 
                       src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=500&q=60`} 
                       alt="Producto" 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900">Producto Ejemplo {i}</h3>
                    <p className="text-slate-500 text-sm mt-1">$99.00</p>
                    <Button variant="outline" className="w-full mt-3">Ver Detalles</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
               <StyledText text={content.title} styles={content.titleStyle} className="text-3xl font-bold" />
             </div>
             <div className="grid md:grid-cols-3 gap-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-8 h-8 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">Característica {i}</h3>
                    <p className="text-slate-700 leading-relaxed">
                      Descripción breve de la característica increíble que ofrece tu tienda a los clientes.
                    </p>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'testimonials':
        return (
           <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-2 gap-8">
               {[1, 2].map(i => (
                 <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                   <div className="flex gap-1 text-amber-400 mb-4">
                     {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                   </div>
                   <p className="text-lg text-slate-700 italic mb-6">"Este es el mejor servicio que he probado. Totalmente recomendado para todos."</p>
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                     <div>
                       <p className="font-bold text-slate-900">Cliente Feliz</p>
                       <p className="text-sm text-slate-700">CEO, TechStart</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        );

      case 'cta':
        return (
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-12 md:p-20 text-white overflow-hidden relative">
              <div className="relative z-10">
                <StyledText text={content.title} styles={content.titleStyle} className="text-3xl md:text-5xl font-bold mb-6" />
                <StyledText text={content.subtitle} styles={content.subtitleStyle} className="text-lg text-slate-300 mb-8" />
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  {content.buttonText}
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200/10">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{content.storeName}</h3>
                <p className="text-sm text-slate-700 max-w-xs">{content.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Enlaces</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>Inicio</li>
                  <li>Productos</li>
                  <li>Sobre Nosotros</li>
                  <li>Contacto</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Social</h4>
                <div className="flex gap-4">
                  <Facebook className="w-5 h-5 cursor-pointer hover:text-blue-500 text-gray-700" />
                  <Twitter className="w-5 h-5 cursor-pointer hover:text-sky-500 text-gray-700" />
                  <Instagram className="w-5 h-5 cursor-pointer hover:text-pink-500 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="pt-8 text-center text-sm text-slate-700">
              &copy; {new Date().getFullYear()} {content.storeName}. Todos los derechos reservados.
            </div>
          </div>
        );

      default:
        return <div className="p-8 text-center text-gray-400 border-2 border-dashed">Sección Desconocida</div>;
    }
  };

  return (
    <motion.div
      layoutId={section.id}
      className={cn(
        "relative group cursor-pointer transition-all",
        isSelected ? "ring-2 ring-violet-500 ring-offset-2 z-10" : "hover:ring-1 hover:ring-slate-300"
      )}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={containerStyles}
    >
      {renderContent()}
    </motion.div>
  );
};

export default SectionRenderer;