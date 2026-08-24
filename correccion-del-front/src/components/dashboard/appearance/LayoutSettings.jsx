
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Monitor, Square, Circle, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

const LayoutSettings = ({ config, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* Dark/Light Mode */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
        <div className="space-y-0.5">
          <Label className="text-base">Modo Oscuro</Label>
          <p className="text-sm text-slate-500">Activa el tema oscuro para tu tienda</p>
        </div>
        <div className="flex items-center gap-2">
           <Sun className="w-4 h-4 text-slate-400" />
           <Switch
             checked={config.mode === 'dark'}
             onCheckedChange={(checked) => handleChange('mode', checked ? 'dark' : 'light')}
           />
           <Moon className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Container Width */}
      <div className="space-y-3">
        <Label>Ancho del Contenedor</Label>
        <div className="grid grid-cols-3 gap-3">
           {['compact', 'normal', 'wide'].map((width) => (
             <div 
               key={width}
               onClick={() => handleChange('containerWidth', width)}
               className={cn(
                 "cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-slate-50 transition-all",
                 config.containerWidth === width ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100"
               )}
             >
                <div className="w-full h-8 bg-slate-100 rounded flex items-center justify-center px-1">
                   <div className={cn(
                     "h-full bg-slate-300 rounded-sm",
                     width === 'compact' ? 'w-1/2' : width === 'wide' ? 'w-full' : 'w-3/4'
                   )} />
                </div>
                <span className="text-xs font-medium capitalize">{width === 'normal' ? 'Normal' : width === 'compact' ? 'Compacto' : 'Ancho'}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-3">
        <Label>Estilo de Bordes</Label>
        <div className="grid grid-cols-4 gap-2">
           {[
             { val: 'none', label: 'Recto', icon: Square },
             { val: 'soft', label: 'Suave', icon: Square, rounded: 'rounded-sm' },
             { val: 'medium', label: 'Medio', icon: Square, rounded: 'rounded-md' },
             { val: 'rounded', label: 'Redondo', icon: Circle }
           ].map((style) => (
             <div 
               key={style.val}
               onClick={() => handleChange('borderRadius', style.val)}
               className={cn(
                 "cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center gap-2 hover:bg-slate-50 transition-all",
                 config.borderRadius === style.val ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100"
               )}
             >
                <div className={cn("w-6 h-6 border-2 border-slate-400", style.val === 'rounded' ? 'rounded-full' : style.rounded || '')}></div>
                <span className="text-[10px] font-medium">{style.label}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Shadows */}
      <div className="space-y-3">
        <Label>Intensidad de Sombras</Label>
        <div className="grid grid-cols-4 gap-2">
           {['none', 'soft', 'medium', 'strong'].map((shadow) => (
             <div 
               key={shadow}
               onClick={() => handleChange('shadows', shadow)}
               className={cn(
                 "cursor-pointer border-2 rounded-lg p-2 flex flex-col items-center gap-2 hover:bg-slate-50 transition-all",
                 config.shadows === shadow ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100"
               )}
             >
                <div className={cn(
                  "w-6 h-6 bg-white border border-slate-100 rounded-md", 
                  shadow === 'soft' ? 'shadow-sm' : shadow === 'medium' ? 'shadow-md' : shadow === 'strong' ? 'shadow-xl' : ''
                )} />
                <span className="text-[10px] font-medium capitalize">{shadow === 'none' ? 'Ninguna' : shadow === 'strong' ? 'Fuerte' : shadow === 'soft' ? 'Suave' : 'Media'}</span>
             </div>
           ))}
        </div>
      </div>
      {/* Catalog Mode */}
      <div className="space-y-3 pt-4 border-t">
        <Label className="text-base font-bold">Modo del Catálogo</Label>
        <p className="text-sm text-slate-500 mb-2">¿Cómo prefieres que se navegue la tienda?</p>
        <div className="grid grid-cols-2 gap-3">
           {[
             { val: 'one-page', label: 'Todo en una página (One-Page)', desc: 'Navegación con scroll' },
             { val: 'separate-page', label: 'Páginas Separadas', desc: 'El catálogo abre en otra vista' }
           ].map((mode) => (
             <div 
               key={mode.val}
               onClick={() => handleChange('catalogMode', mode.val)}
               className={cn(
                 "cursor-pointer border-2 rounded-lg p-3 flex flex-col items-start gap-1 hover:bg-slate-50 transition-all",
                 config.catalogMode === mode.val ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100"
               )}
             >
                <span className="font-bold text-sm">{mode.label}</span>
                <span className="text-xs text-slate-500">{mode.desc}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Category Layout */}
      <div className="space-y-3 pt-4 border-t">
        <Label className="text-base font-bold">Diseño de Categorías</Label>
        <p className="text-sm text-slate-500 mb-2">Elige cómo se muestran los filtros de productos</p>
        <div className="grid grid-cols-3 gap-3">
           {[
             { val: 'buttons', label: 'Botones Horizontales' },
             { val: 'dropdown', label: 'Buscador Desplegable' },
             { val: 'sidebar', label: 'Lista Lateral' }
           ].map((layout) => (
             <div 
               key={layout.val}
               onClick={() => handleChange('categoryLayout', layout.val)}
               className={cn(
                 "cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-1 hover:bg-slate-50 transition-all",
                 config.categoryLayout === layout.val ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100"
               )}
             >
                <span className="font-bold text-xs">{layout.label}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LayoutSettings;
