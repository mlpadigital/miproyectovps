import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, TrendingUp, AlertCircle, Save, Globe } from 'lucide-react';

const SeoSettingsPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form State
  const [generalSeo, setGeneralSeo] = useState({ title: '', description: '' });
  const [categorySeo, setCategorySeo] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 1. Get Store Details
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name, seo_title, seo_description, seo_categories')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (storeError) throw storeError;
        if (!isMounted) return;
        
        setStore(storeData);
        if (storeData) {
          setGeneralSeo({
            title: storeData.seo_title || '',
            description: storeData.seo_description || ''
          });
          setCategorySeo(storeData.seo_categories || {});

          // 2. Fetch categories from products
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('category')
            .eq('store_id', storeData.id);

          if (!productsError && productsData) {
            const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCategories);
            if (uniqueCategories.length > 0) {
              setSelectedCategory(uniqueCategories[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching SEO data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSaveGeneral = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          seo_title: generalSeo.title,
          seo_description: generalSeo.description
        })
        .eq('id', store.id);

      if (error) throw error;

      toast({ title: "Guardado exitoso", description: "Metadatos generales guardados correctamente." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar la configuración general.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          seo_categories: categorySeo
        })
        .eq('id', store.id);

      if (error) throw error;

      toast({ title: "Guardado exitoso", description: "Metadatos de categoría guardados correctamente." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar la configuración de la categoría.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateCategorySeo = (field, value) => {
    setCategorySeo(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <p className="text-slate-500">Cargando configuración SEO...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 font-semibold">No tienes una tienda activa</AlertTitle>
          <AlertDescription className="text-amber-700">
            Para configurar el SEO, primero necesitas crear una tienda.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Globe className="w-8 h-8 text-violet-600" />
          SEO y Metadatos
        </h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-3xl">
          En esta sección puedes modificar la información sobre tu página web para que los buscadores (Google, Bing) y los indexadores de IA definan la temática y descripción de tu sitio de manera precisa.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Global de la Tienda</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
              <CardTitle className="text-lg">Metadatos Principales</CardTitle>
              <CardDescription>
                Esta información se mostrará cuando alguien busque tu tienda o comparta tu enlace principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Título de la Tienda</Label>
                  <span className={`text-xs ${generalSeo.title.length > 70 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                    {generalSeo.title.length}/70
                  </span>
                </div>
                <Input
                  value={generalSeo.title}
                  onChange={(e) => setGeneralSeo({ ...generalSeo, title: e.target.value })}
                  placeholder="Ej: turopaya | Tienda Online"
                  className="bg-white border-slate-200"
                />
                <p className="text-[11px] text-slate-500">Un buen título no debe exceder los 70 caracteres.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Descripción Breve</Label>
                  <span className={`text-xs ${generalSeo.description.length > 200 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                    {generalSeo.description.length}/200
                  </span>
                </div>
                <Textarea
                  value={generalSeo.description}
                  onChange={(e) => setGeneralSeo({ ...generalSeo, description: e.target.value })}
                  placeholder="Ej: Descubre la mejor colección de ropa y accesorios. Envíos a todo el país..."
                  className="bg-white border-slate-200 resize-none min-h-[100px]"
                />
                <p className="text-[11px] text-slate-500">Una buena descripción no debe exceder los 200 caracteres.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Global
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
              <CardTitle className="text-lg">SEO de Categorías</CardTitle>
              <CardDescription>
                Para optimizar el SEO de cada categoría, edita su título y descripción. Ayudará a posicionar mejor esas búsquedas específicas en internet.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {categories.length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aún no tienes categorías en tus productos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sidebar Categorías */}
                  <div className="md:col-span-1 border rounded-lg bg-slate-50 overflow-hidden">
                    <div className="p-3 bg-slate-100 font-semibold text-sm border-b text-slate-700">Tus Categorías</div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors border-b last:border-b-0 ${
                            selectedCategory === cat 
                              ? 'bg-violet-100 text-violet-900 font-semibold' 
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formulario de Categoría Seleccionada */}
                  <div className="md:col-span-2 space-y-6">
                    {selectedCategory ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Título para <span className="font-bold text-violet-700 uppercase">"{selectedCategory}"</span></Label>
                            <span className={`text-xs ${((categorySeo[selectedCategory]?.title || '').length) > 70 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                              {(categorySeo[selectedCategory]?.title || '').length}/70
                            </span>
                          </div>
                          <Input
                            value={categorySeo[selectedCategory]?.title || ''}
                            onChange={(e) => updateCategorySeo('title', e.target.value)}
                            placeholder={`Ej: ${selectedCategory.toUpperCase()} | Mi Tienda`}
                            className="bg-white border-slate-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Descripción de la Categoría</Label>
                            <span className={`text-xs ${((categorySeo[selectedCategory]?.description || '').length) > 200 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                              {(categorySeo[selectedCategory]?.description || '').length}/200
                            </span>
                          </div>
                          <Textarea
                            value={categorySeo[selectedCategory]?.description || ''}
                            onChange={(e) => updateCategorySeo('description', e.target.value)}
                            placeholder={`Breve descripción sobre los productos de la categoría ${selectedCategory}...`}
                            className="bg-white border-slate-200 resize-none min-h-[100px]"
                          />
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                          <Button onClick={handleSaveCategory} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Guardar Categoría
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg p-6">
                        Selecciona una categoría para editar su SEO
                      </div>
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeoSettingsPage;
