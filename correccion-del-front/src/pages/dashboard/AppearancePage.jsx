import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, RotateCcw, Download, Upload, Loader2, Palette, Layout, Type, Layers, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Sub-components
import PreviewPanel from '@/components/dashboard/appearance/PreviewPanel';
import ColorPicker from '@/components/dashboard/appearance/ColorPicker';
import SectionToggle from '@/components/dashboard/appearance/SectionToggle';
import TypographySelector from '@/components/dashboard/appearance/TypographySelector';
import LayoutSettings from '@/components/dashboard/appearance/LayoutSettings';

// Default Configuration con Widgets añadidos
const DEFAULT_CONFIG = {
   colors: {
      primary: '#4f46e5',
      secondary: '#10b981',
      background: '#ffffff',
      secondaryBackground: '#f8fafc',
      text: '#1f2937',
      accent: '#f59e0b'
   },
   typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      scale: 'normal',
      letterSpacing: 0
   },
   layout: {
      containerWidth: 'normal',
      borderRadius: 'medium',
      shadows: 'soft',
      mode: 'light',
      catalogMode: 'one-page',
      categoryLayout: 'buttons'
   },
   sections: {
      header: true,
      hero: true,
      heroTitle: 'Estilo que define tu esencia',
      heroSubtitle: 'Descubre nuestra última selección de productos diseñados para destacar tu personalidad única.',
      heroButtonText: 'Ver Productos',
      featured: true,
      featuredTitle: 'Productos Destacados',
      footer: true,
      footerText: 'Creamos productos de calidad para personas que valoran el diseño y la funcionalidad.'
   },
   widgets: {
      showCart: true,
      showWhatsapp: true,
      whatsappNumber: '',
      whatsappMessage: '¡Hola! Quisiera realizar una consulta.'
   }
};

const AppearancePage = () => {
   const { user } = useSupabaseAuth();
   const { toast } = useToast();
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [config, setConfig] = useState(DEFAULT_CONFIG);
   const [store, setStore] = useState(null);

   // Fetch initial config
   useEffect(() => {
      const fetchConfig = async () => {
         if (!user) return;
         try {
            const { data, error } = await supabase
               .from('stores')
               .select('id, design_config, logo_url, favicon_url, name, subdomain')
               .eq('owner_id', user.id)
               .limit(1).single();

            if (error) throw error;
            
            // Fetch real products for preview
            const { data: productsData } = await supabase
               .from('products')
               .select('id, name, description, price, image_url, images, is_featured')
               .eq('store_id', data.id)
               .limit(6);

            setStore({
                id: data.id,
                name: data.name,
                subdomain: data.subdomain,
                logo_url: data.logo_url,
                favicon_url: data.favicon_url,
                products: productsData || []
            });

            if (data?.design_config) {
               setConfig(prev => ({
                  ...prev,
                  ...data.design_config,
                  colors: { ...prev.colors, ...data.design_config.colors },
                  typography: { ...prev.typography, ...data.design_config.typography },
                  layout: { ...prev.layout, ...data.design_config.layout },
                  sections: { ...prev.sections, ...data.design_config.sections },
                  widgets: { ...prev.widgets, ...data.design_config.widgets }
               }));
            }
         } catch (err) {
            console.error('Error fetching design config:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchConfig();
   }, [user]);

   const handleSave = async () => {
      setSaving(true);
      try {
         const { error } = await supabase
            .from('stores')
            .update({ design_config: config })
            .eq('owner_id', user.id);

         if (error) throw error;

         toast({
            title: "Cambios guardados",
            description: "La apariencia de tu tienda ha sido actualizada.",
            className: "bg-green-50 border-green-200 text-green-900"
         });
      } catch (err) {
         console.error('Error saving config:', err);
         toast({
            title: "Error al guardar",
            description: "No se pudieron guardar los cambios. Intenta nuevamente.",
            variant: "destructive"
         });
      } finally {
         setSaving(false);
      }
   };

   const handleReset = () => {
      setConfig(DEFAULT_CONFIG);
      toast({
         title: "Configuración restablecida",
         description: "Se han cargado los valores por defecto. Recuerda guardar si deseas mantenerlos."
      });
   };

   const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "tienda-config.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
   };

   const handleImport = (event) => {
      const fileReader = new FileReader();
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
         try {
            const importedConfig = JSON.parse(e.target.result);
            setConfig(prev => ({
               ...prev,
               ...importedConfig,
               colors: { ...prev.colors, ...importedConfig.colors },
               typography: { ...prev.typography, ...importedConfig.typography },
               layout: { ...prev.layout, ...importedConfig.layout },
               sections: { ...prev.sections, ...importedConfig.sections },
               widgets: { ...prev.widgets, ...importedConfig.widgets }
            }));
            toast({
               title: "Importación exitosa",
               description: "La configuración ha sido cargada."
            });
         } catch (err) {
            toast({
               title: "Error de importación",
               description: "El archivo no es válido.",
               variant: "destructive"
            });
         }
      };
   };

   if (loading) {
      return (
         <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
         </div>
      );
   }

   return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] lg:h-screen lg:flex-row overflow-hidden bg-slate-50">

         {/* Editor Panel (Left) */}
         <div className="w-full lg:w-[450px] flex flex-col border-r border-slate-200 bg-white h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
               <h1 className="font-bold text-xl text-slate-900">Editor de Diseño</h1>
               <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleExport} title="Exportar">
                     <Download className="w-4 h-4" />
                  </Button>
                  <label>
                     <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer">
                        <Upload className="w-4 h-4" />
                     </div>
                     <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto">
               <Tabs defaultValue="colors" className="w-full">
                  <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-sm overflow-x-auto">
                     <TabsList className="grid w-full grid-cols-5 min-w-[500px]">
                        <TabsTrigger value="colors" className="text-xs"><Palette className="w-4 h-4 mr-1" /> Colores</TabsTrigger>
                        <TabsTrigger value="typography" className="text-xs"><Type className="w-4 h-4 mr-1" /> Texto</TabsTrigger>
                        <TabsTrigger value="layout" className="text-xs"><Layout className="w-4 h-4 mr-1" /> Estilo</TabsTrigger>
                        <TabsTrigger value="sections" className="text-xs"><Layers className="w-4 h-4 mr-1" /> Secciones</TabsTrigger>
                        <TabsTrigger value="widgets" className="text-xs"><MessageCircle className="w-4 h-4 mr-1" /> Redes</TabsTrigger>
                     </TabsList>
                  </div>

                  <div className="p-6 pb-24">
                     <TabsContent value="colors" className="mt-0 space-y-6">
                        <div className="space-y-1 mb-6">
                           <h2 className="text-lg font-semibold">Colores de Marca</h2>
                           <p className="text-sm text-slate-500">Define la paleta de colores principal de tu tienda.</p>
                        </div>

                        <Card>
                           <CardContent className="pt-6 space-y-4">
                              <ColorPicker
                                 label="Color Primario"
                                 value={config.colors.primary}
                                 onChange={(v) => setConfig(p => ({ ...p, colors: { ...p.colors, primary: v } }))}
                                 description="Botones principales, enlaces y encabezados destacados."
                              />
                              <ColorPicker
                                 label="Color Secundario"
                                 value={config.colors.secondary}
                                 onChange={(v) => setConfig(p => ({ ...p, colors: { ...p.colors, secondary: v } }))}
                                 description="Elementos de acción secundaria y acentos."
                              />
                              <ColorPicker
                                 label="Color de Acento"
                                 value={config.colors.accent}
                                 onChange={(v) => setConfig(p => ({ ...p, colors: { ...p.colors, accent: v } }))}
                                 description="Detalles pequeños, precios y ofertas."
                              />
                           </CardContent>
                        </Card>

                        <div className="space-y-1 mb-6 pt-4">
                           <h2 className="text-lg font-semibold">Colores de Fondo y Texto</h2>
                        </div>

                        <Card>
                           <CardContent className="pt-6 space-y-4">
                              <ColorPicker
                                 label="Fondo Principal"
                                 value={config.colors.background}
                                 onChange={(v) => setConfig(p => ({ ...p, colors: { ...p.colors, background: v } }))}
                              />
                              <ColorPicker
                                 label="Fondo Secundario"
                                 value={config.colors.secondaryBackground}
                                 onChange={(v) => setConfig(p => ({ ...p, colors: { ...p.colors, secondaryBackground: v } }))}
                              />
                              <ColorPicker
                                 label="Texto Principal"
                                 value={config.colors.text}
                                 onChange={(v) => setConfig(p => ({ ...p, colors: { ...p.colors, text: v } }))}
                              />
                           </CardContent>
                        </Card>
                     </TabsContent>

                     <TabsContent value="typography" className="mt-0 space-y-6">
                        <div className="space-y-1 mb-6">
                           <h2 className="text-lg font-semibold">Tipografía</h2>
                           <p className="text-sm text-slate-500">Elige las fuentes que mejor representen tu marca.</p>
                        </div>
                        <Card>
                           <CardContent className="pt-6">
                              <TypographySelector
                                 config={config.typography}
                                 onChange={(newTopo) => setConfig(p => ({ ...p, typography: newTopo }))}
                              />
                           </CardContent>
                        </Card>
                     </TabsContent>

                     <TabsContent value="layout" className="mt-0 space-y-6">
                        <div className="space-y-1 mb-6">
                           <h2 className="text-lg font-semibold">Diseño y Estructura</h2>
                           <p className="text-sm text-slate-500">Personaliza la forma y el espacio de tu tienda.</p>
                        </div>
                        <Card>
                           <CardContent className="pt-6">
                              <LayoutSettings
                                 config={config.layout}
                                 onChange={(newLayout) => setConfig(p => ({ ...p, layout: newLayout }))}
                              />
                           </CardContent>
                        </Card>
                     </TabsContent>

                     <TabsContent value="sections" className="mt-0 space-y-6">
                        <div className="space-y-1 mb-6">
                           <h2 className="text-lg font-semibold">Secciones Visibles</h2>
                           <p className="text-sm text-slate-500">Activa o desactiva secciones de tu página de inicio.</p>
                        </div>
                        <Card>
                           <CardContent className="pt-6 space-y-4">
                              <SectionToggle
                                 id="header"
                                 label="Encabezado"
                                 description="Muestra el logo y menú de navegación"
                                 checked={config.sections.header}
                                 onCheckedChange={(c) => setConfig(p => ({ ...p, sections: { ...p.sections, header: c } }))}
                              />
                              {config.sections.header && (
                                <div className="pl-4 space-y-3 border-l-2 border-slate-100 ml-4 mb-4">
                                   <div>
                                      <label className="text-xs font-medium text-slate-700">Título junto al Logo (Opcional)</label>
                                      <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-indigo-500" placeholder="Ej: Mi Tienda" value={config.sections.logoTitle || ''} onChange={(e) => setConfig(p => ({ ...p, sections: { ...p.sections, logoTitle: e.target.value } }))} />
                                   </div>
                                   <div>
                                      <label className="text-xs font-medium text-slate-700">Subtítulo junto al Logo (Opcional)</label>
                                      <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-indigo-500" placeholder="Ej: Las mejores ofertas" value={config.sections.logoSubtitle || ''} onChange={(e) => setConfig(p => ({ ...p, sections: { ...p.sections, logoSubtitle: e.target.value } }))} />
                                   </div>
                                </div>
                              )}
                              <SectionToggle
                                 id="hero"
                                 label="Sección Hero"
                                 description="Banner principal grande con llamada a la acción"
                                 checked={config.sections.hero}
                                 onCheckedChange={(c) => setConfig(p => ({ ...p, sections: { ...p.sections, hero: c } }))}
                              />
                              {config.sections.hero && (
                                <div className="pl-4 space-y-3 border-l-2 border-slate-100 ml-4 mb-4">
                                   <div>
                                      <label className="text-xs font-medium text-slate-700">Título Principal</label>
                                      <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-indigo-500" value={config.sections.heroTitle !== undefined ? config.sections.heroTitle : 'Estilo que define tu esencia'} onChange={(e) => setConfig(p => ({ ...p, sections: { ...p.sections, heroTitle: e.target.value } }))} />
                                   </div>
                                   <div>
                                      <label className="text-xs font-medium text-slate-700">Descripción</label>
                                      <textarea className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-indigo-500" rows={2} value={config.sections.heroSubtitle !== undefined ? config.sections.heroSubtitle : 'Descubre nuestra última selección de productos diseñados para destacar tu personalidad única.'} onChange={(e) => setConfig(p => ({ ...p, sections: { ...p.sections, heroSubtitle: e.target.value } }))} />
                                   </div>
                                   <div>
                                      <label className="text-xs font-medium text-slate-700">Texto del Botón</label>
                                      <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-indigo-500" value={config.sections.heroButtonText !== undefined ? config.sections.heroButtonText : 'Ver Productos'} onChange={(e) => setConfig(p => ({ ...p, sections: { ...p.sections, heroButtonText: e.target.value } }))} />
                                   </div>
                                </div>
                              )}
                              <SectionToggle
                                 id="featured"
                                 label="Productos Destacados"
                                 description="Grid con tus mejores productos"
                                 checked={config.sections.featured}
                                 onCheckedChange={(c) => setConfig(p => ({ ...p, sections: { ...p.sections, featured: c } }))}
                              />
                              {config.sections.featured && (
                                 <div className="pl-4 border-l-2 border-slate-100 ml-4 mb-4 mt-2">
                                    <label className="text-xs font-medium text-slate-700">Título de la sección</label>
                                    <input type="text" className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-indigo-500" value={config.sections.featuredTitle !== undefined ? config.sections.featuredTitle : 'Productos Destacados'} onChange={(e) => setConfig(p => ({ ...p, sections: { ...p.sections, featuredTitle: e.target.value } }))} />
                                 </div>
                              )}
                              <SectionToggle
                                 id="footer"
                                 label="Pie de Página"
                                 description="Información legal, enlaces y contacto"
                                 checked={config.sections.footer}
                                 onCheckedChange={(c) => setConfig(p => ({ ...p, sections: { ...p.sections, footer: c } }))}
                              />
                              {config.sections.footer && (
                                 <div className="pl-4 border-l-2 border-slate-100 ml-4 mb-4 mt-2">
                                    <label className="text-xs font-medium text-slate-700">Texto descriptivo del footer</label>
                                    <textarea className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-indigo-500" rows={2} value={config.sections.footerText !== undefined ? config.sections.footerText : 'Creamos productos de calidad para personas que valoran el diseño y la funcionalidad.'} onChange={(e) => setConfig(p => ({ ...p, sections: { ...p.sections, footerText: e.target.value } }))} />
                                 </div>
                              )}
                           </CardContent>
                        </Card>
                     </TabsContent>

                     <TabsContent value="widgets" className="mt-0 space-y-6">
                        <div className="space-y-1 mb-6">
                           <h2 className="text-lg font-semibold">Widgets y Redes (WhatsApp)</h2>
                           <p className="text-sm text-slate-500">Agrega un botón de contacto directo a tu tienda.</p>
                        </div>
                        <Card>
                           <CardContent className="pt-6 space-y-4">
                              <SectionToggle
                                 id="showCart"
                                 label="Carrito Flotante"
                                 description="Mostrar acceso rápido al carrito"
                                 checked={config.widgets.showCart}
                                 onCheckedChange={(c) => setConfig(p => ({ ...p, widgets: { ...p.widgets, showCart: c } }))}
                              />
                              <SectionToggle
                                 id="showWhatsapp"
                                 label="Botón de WhatsApp"
                                 description="Mostrar botón de chat flotante"
                                 checked={config.widgets.showWhatsapp}
                                 onCheckedChange={(c) => setConfig(p => ({ ...p, widgets: { ...p.widgets, showWhatsapp: c } }))}
                              />

                              {config.widgets.showWhatsapp && (
                                 <div className="pt-4 space-y-3 border-t border-slate-100">
                                    <div className="space-y-1">
                                       <label className="text-xs font-medium text-slate-700">Número de WhatsApp (con código de país, sin el +)</label>
                                       <input
                                          type="text"
                                          className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          placeholder="Ej: 5491112345678"
                                          value={config.widgets.whatsappNumber}
                                          onChange={(e) => setConfig(p => ({ ...p, widgets: { ...p.widgets, whatsappNumber: e.target.value } }))}
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-xs font-medium text-slate-700">Mensaje predeterminado de inicio</label>
                                       <textarea
                                          className="w-full p-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          rows={2}
                                          value={config.widgets.whatsappMessage}
                                          onChange={(e) => setConfig(p => ({ ...p, widgets: { ...p.widgets, whatsappMessage: e.target.value } }))}
                                       />
                                    </div>
                                 </div>
                              )}
                           </CardContent>
                        </Card>
                     </TabsContent>
                  </div>
               </Tabs>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Resetear
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                     <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Esta acción restaurará todos los ajustes de diseño a sus valores predeterminados. Los cambios no guardados se perderán.
                        </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset} className="bg-red-600">Resetear</AlertDialogAction>
                     </AlertDialogFooter>
                  </AlertDialogContent>
               </AlertDialog>

               <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'Guardando...' : 'Guardar'}
               </Button>
            </div>
         </div>

         {/* Preview Panel (Right) */}
         <div className="hidden lg:block lg:col-span-5 h-full overflow-hidden bg-white">
            <PreviewPanel config={config} store={store} />
         </div>
      </div>
   );
};

export default AppearancePage;