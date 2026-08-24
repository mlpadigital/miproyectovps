import React from 'react';
import { ShoppingBag, CheckCircle2, Star, MousePointerClick } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Layout, Type, Image as ImageIcon, Trash2, MoveUp, MoveDown, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS_CATALOG = [
  { type: 'hero', label: 'Banner Principal', icon: Layout },
  { type: 'products', label: 'Grilla de Productos', icon: ShoppingBag },
  { type: 'features', label: 'Características', icon: CheckCircle2 },
  { type: 'testimonials', label: 'Testimonios', icon: Star },
  { type: 'cta', label: 'Llamada a la Acción', icon: MousePointerClick },
  { type: 'footer', label: 'Pie de Página', icon: Layout },
];

const FONT_OPTIONS = [
  { label: 'Predeterminada (Inter)', value: 'Inter, sans-serif' },
  { label: 'Elegante (Playfair Display)', value: '"Playfair Display", serif' },
  { label: 'Robusto (Roboto Slab)', value: '"Roboto Slab", serif' },
  { label: 'Técnico (Fira Code)', value: '"Fira Code", monospace' },
  { label: 'Manuscrito (Dancing Script)', value: '"Dancing Script", cursive' },
];

const ColorPicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-2 border rounded-md bg-white">
    <Label className="text-xs font-medium text-slate-600">{label}</Label>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-slate-400 uppercase">{value}</span>
      <input 
        type="color" 
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer border-0 p-0 overflow-hidden"
      />
    </div>
  </div>
);

const TextStyleControl = ({ label, styles, onChange }) => (
  <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
    <Label className="text-xs font-semibold text-slate-700">{label}</Label>
    
    <div className="flex items-center gap-2">
      <ColorPicker label="Color" value={styles?.color} onChange={(c) => onChange({ ...styles, color: c })} />
    </div>

    <div className="flex gap-1">
       <Button 
         variant={styles?.bold ? "default" : "outline"} 
         size="icon" 
         className="h-8 w-8"
         onClick={() => onChange({ ...styles, bold: !styles?.bold })}
         title="Negrita"
       >
         <Bold className="h-3 w-3 text-gray-700" />
       </Button>
       <Button 
         variant={styles?.italic ? "default" : "outline"} 
         size="icon" 
         className="h-8 w-8"
         onClick={() => onChange({ ...styles, italic: !styles?.italic })}
         title="Cursiva"
       >
         <Italic className="h-3 w-3 text-gray-700" />
       </Button>
    </div>

    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Tamaño</span>
        <span>{styles?.fontSize || 16}px</span>
      </div>
      <Slider 
        value={[styles?.fontSize || 16]} 
        min={12} 
        max={72} 
        step={1} 
        onValueChange={([val]) => onChange({ ...styles, fontSize: val })}
      />
    </div>
  </div>
);

const EditorPanel = ({ 
  selectedSection, 
  onUpdateSection, 
  onAddSection, 
  onDeleteSection,
  onMoveSection 
}) => {

  if (!selectedSection) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-slate-800">Agregar Sección</h2>
        </div>
        <ScrollArea className="flex-1 p-4 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            {SECTIONS_CATALOG.map((item) => (
              <Button
                key={item.type}
                variant="outline"
                className="h-24 flex flex-col gap-2 hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700 transition-all"
                onClick={() => onAddSection(item.type)}
              >
                <item.icon className="w-6 h-6 text-gray-700" />
                <span className="text-xs text-slate-700">{item.label}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  const { content, style, type } = selectedSection;

  const updateContent = (key, value) => {
    onUpdateSection({ 
      ...selectedSection, 
      content: { ...content, [key]: value } 
    });
  };

  const updateStyle = (key, value) => {
    onUpdateSection({ 
      ...selectedSection, 
      style: { ...style, [key]: value } 
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex flex-col">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Editando</h2>
          <span className="font-bold text-lg capitalize text-slate-800">{type}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onMoveSection('up')} title="Mover Arriba">
            <MoveUp className="w-4 h-4 text-gray-700" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onMoveSection('down')} title="Mover Abajo">
            <MoveDown className="w-4 h-4 text-gray-700" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onDeleteSection} title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="content" className="data-[state=active]:text-slate-900 text-slate-700">Contenido</TabsTrigger>
            <TabsTrigger value="style" className="data-[state=active]:text-slate-900 text-slate-700">Estilo</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <TabsContent value="content" className="space-y-6 m-0">
              {/* Dynamic Content Fields based on Type */}
              {(type === 'hero' || type === 'cta' || type === 'features') && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Título</Label>
                    <Input className="text-slate-900" value={content.title || ''} onChange={(e) => updateContent('title', e.target.value)} />
                    <TextStyleControl 
                      label="Estilo de Título" 
                      styles={content.titleStyle} 
                      onChange={(s) => updateContent('titleStyle', s)} 
                    />
                  </div>

                  {(type === 'hero' || type === 'cta') && (
                    <div className="space-y-2">
                      <Label className="text-slate-700">Subtítulo</Label>
                      <Input className="text-slate-900" value={content.subtitle || ''} onChange={(e) => updateContent('subtitle', e.target.value)} />
                      <TextStyleControl 
                        label="Estilo de Subtítulo" 
                        styles={content.subtitleStyle} 
                        onChange={(s) => updateContent('subtitleStyle', s)} 
                      />
                    </div>
                  )}
                </>
              )}

              {type === 'products' && (
                 <div className="space-y-2">
                   <Label className="text-slate-700">Título de la Sección</Label>
                   <Input className="text-slate-900" value={content.title || ''} onChange={(e) => updateContent('title', e.target.value)} />
                   <Label className="text-slate-700">Descripción</Label>
                   <Input className="text-slate-900" value={content.description || ''} onChange={(e) => updateContent('description', e.target.value)} />
                 </div>
              )}

              {/* Button Configuration */}
              {(type === 'hero' || type === 'cta') && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700">Mostrar Botón</Label>
                    <Switch 
                      checked={content.showButton !== false} 
                      onCheckedChange={(c) => updateContent('showButton', c)} 
                    />
                  </div>
                  {content.showButton !== false && (
                    <div className="grid gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-700">Texto del Botón</Label>
                        <Input className="text-slate-900" value={content.buttonText || 'Click Aquí'} onChange={(e) => updateContent('buttonText', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <ColorPicker label="Fondo" value={content.buttonColor} onChange={(c) => updateContent('buttonColor', c)} />
                        <ColorPicker label="Texto" value={content.buttonTextColor} onChange={(c) => updateContent('buttonTextColor', c)} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Image Uploader (Simulated) */}
              {(type === 'hero') && (
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-slate-700">Imagen de Fondo</Label>
                  <div className="flex gap-2">
                    <Input 
                      className="text-slate-900 text-xs"
                      value={content.image || ''} 
                      onChange={(e) => updateContent('image', e.target.value)} 
                      placeholder="https://..." 
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Pega una URL directa o usa Unsplash.</p>
                  {content.image && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img src={content.image} className="w-full h-full object-cover" alt="Previsualización" />
                    </div>
                  )}
                </div>
              )}
              
               {type === 'footer' && (
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <Label className="text-slate-700">Nombre de la Tienda</Label>
                     <Input className="text-slate-900" value={content.storeName || ''} onChange={(e) => updateContent('storeName', e.target.value)} />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-slate-700">Descripción Corta</Label>
                     <Input className="text-slate-900" value={content.description || ''} onChange={(e) => updateContent('description', e.target.value)} />
                   </div>
                 </div>
               )}
            </TabsContent>

            <TabsContent value="style" className="space-y-6 m-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Tipografía</Label>
                  <Select 
                    value={style.fontFamily || FONT_OPTIONS[0].value} 
                    onValueChange={(v) => updateStyle('fontFamily', v)}
                  >
                    <SelectTrigger className="text-slate-900">
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value.split(',')[0].replace(/"/g, '') }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ColorPicker label="Color de Fondo" value={style.backgroundColor} onChange={(c) => updateStyle('backgroundColor', c)} />
                
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Espaciado Vertical (Padding)</Label>
                  <Slider 
                    value={[style.paddingY || 60]} 
                    min={0} 
                    max={160} 
                    step={4} 
                    onValueChange={([val]) => updateStyle('paddingY', val)} 
                  />
                  <div className="text-right text-[10px] text-slate-500">{style.paddingY || 60}px</div>
                </div>

                {type !== 'footer' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Alineación</Label>
                    <div className="flex bg-slate-100 p-1 rounded-md">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          onClick={() => updateStyle('align', align)}
                          className={cn(
                            "flex-1 py-1.5 rounded flex items-center justify-center text-slate-500 transition-all",
                            (style.align || 'left') === align ? "bg-white shadow text-slate-900" : "hover:text-slate-700"
                          )}
                          title={`Alinear ${align === 'left' ? 'a la izquierda' : align === 'center' ? 'al centro' : 'a la derecha'}`}
                        >
                          {align === 'left' && <AlignLeft className="w-4 h-4 text-gray-700" />}
                          {align === 'center' && <AlignCenter className="w-4 h-4 text-gray-700" />}
                          {align === 'right' && <AlignRight className="w-4 h-4 text-gray-700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {type === 'products' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Columnas</Label>
                    <Select value={String(style.columns || 3)} onValueChange={(v) => updateStyle('columns', parseInt(v))}>
                      <SelectTrigger className="text-slate-900">
                        <SelectValue placeholder="3" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Columnas</SelectItem>
                        <SelectItem value="3">3 Columnas</SelectItem>
                        <SelectItem value="4">4 Columnas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default EditorPanel;