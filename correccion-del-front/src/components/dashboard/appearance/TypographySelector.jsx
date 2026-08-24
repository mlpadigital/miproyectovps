
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const fonts = [
  { value: 'Inter', label: 'Inter (Sans-serif)' },
  { value: 'Poppins', label: 'Poppins (Geometric)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'Roboto', label: 'Roboto (Neutral)' },
  { value: 'Open Sans', label: 'Open Sans (Clean)' },
  { value: 'Courier Prime', label: 'Courier Prime (Monospace)' },
];

const TypographySelector = ({ config, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Fuente de Títulos</Label>
        <Select 
          value={config.headingFont} 
          onValueChange={(val) => handleChange('headingFont', val)}
        >
          <SelectTrigger className="bg-white text-slate-900 border-slate-200">
            <SelectValue placeholder="Selecciona una fuente" />
          </SelectTrigger>
          <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-md">
            {fonts.map((f) => (
              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }} className="hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900 cursor-pointer text-slate-900">
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fuente de Cuerpo</Label>
        <Select 
          value={config.bodyFont} 
          onValueChange={(val) => handleChange('bodyFont', val)}
        >
          <SelectTrigger className="bg-white text-slate-900 border-slate-200">
            <SelectValue placeholder="Selecciona una fuente" />
          </SelectTrigger>
          <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-md">
            {fonts.map((f) => (
              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }} className="hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900 cursor-pointer text-slate-900">
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex justify-between">
           <Label>Escala de Texto</Label>
           <span className="text-xs text-slate-500 capitalize">{config.scale}</span>
        </div>
        <div className="flex gap-2">
           {['small', 'normal', 'large'].map((size) => (
             <button
                key={size}
                onClick={() => handleChange('scale', size)}
                className={`flex-1 py-2 text-xs border rounded-md transition-all ${config.scale === size ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
             >
                {size === 'small' ? 'Pequeña' : size === 'normal' ? 'Normal' : 'Grande'}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex justify-between">
           <Label>Espaciado de Letras</Label>
           <span className="text-xs text-slate-500">{config.letterSpacing}px</span>
        </div>
        <Slider
          defaultValue={[config.letterSpacing]}
          max={2}
          step={0.1}
          onValueChange={(val) => handleChange('letterSpacing', val[0])}
        />
      </div>

      <div className="mt-6 p-4 border rounded-lg bg-slate-50/50">
        <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Vista Previa</p>
        <h3 
          className="text-2xl font-bold mb-2 text-slate-900" 
          style={{ 
            fontFamily: config.headingFont,
            letterSpacing: `${config.letterSpacing}px`
          }}
        >
          Título de Ejemplo
        </h3>
        <p 
          className="text-slate-600 leading-relaxed" 
          style={{ 
            fontFamily: config.bodyFont,
            fontSize: config.scale === 'small' ? '0.875rem' : config.scale === 'large' ? '1.125rem' : '1rem'
          }}
        >
          Así es como se verán tus párrafos con la configuración tipográfica seleccionada. Ajusta las opciones para encontrar el estilo perfecto para tu marca.
        </p>
      </div>
    </div>
  );
};

export default TypographySelector;
