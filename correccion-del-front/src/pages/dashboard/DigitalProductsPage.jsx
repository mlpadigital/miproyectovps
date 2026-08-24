import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Download, Trash2, File, Loader2, Image as ImageIcon, Link } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DigitalProductsPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [store, setStore] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [enableDigitalProducts, setEnableDigitalProducts] = useState(false);
  const [themeConfig, setThemeConfig] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    file: null,
    thumbnail: null
  });

  useEffect(() => {
    if (user) {
      fetchStoreAndResources();
    }
  }, [user]);

  const fetchStoreAndResources = async () => {
    try {
      setLoading(true);
      // 1. Get store id and theme config
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, theme_config, subdomain')
        .eq('owner_id', user.id)
        .limit(1)
        .single();

      if (storeError) throw storeError;
      setStoreId(store.id);
      setStore(store);
      
      const config = store.theme_config || {};
      setThemeConfig(config);
      setEnableDigitalProducts(!!config.enableDigitalProducts);

      // 2. Get resources
      const { data: resData, error: resError } = await supabase
        .from('store_resources')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (resError) throw resError;
      setResources(resData || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los productos digitales.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDigitalProducts = async (checked) => {
    try {
      const newConfig = { ...themeConfig, enableDigitalProducts: checked };
      const { error } = await supabase
        .from('stores')
        .update({ theme_config: newConfig })
        .eq('id', storeId);

      if (error) throw error;
      setThemeConfig(newConfig);
      setEnableDigitalProducts(checked);
      toast({ title: 'Configuración guardada', description: `Sección de Archivos Digitales ${checked ? 'habilitada' : 'deshabilitada'} en tu tienda.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo guardar la configuración.', variant: 'destructive' });
    }
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.file || !storeId) {
      toast({ title: 'Faltan datos', description: 'El nombre y el archivo son obligatorios.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = '';
      let thumbnailUrl = '';
      let fileType = formData.file.type;
      let size = formData.file.size;

      // 1. Upload File to Supabase Storage (Bucket: store_resources)
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${storeId}/${Date.now()}_file.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('store_resources')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl: fUrl } } = supabase.storage.from('store_resources').getPublicUrl(fileName);
      fileUrl = fUrl;

      // 2. Upload Thumbnail if exists
      if (formData.thumbnail) {
        const thumbExt = formData.thumbnail.name.split('.').pop();
        const thumbName = `${storeId}/${Date.now()}_thumb.${thumbExt}`;
        const { error: thumbUploadError } = await supabase.storage
          .from('store_resources')
          .upload(thumbName, formData.thumbnail);

        if (thumbUploadError) throw thumbUploadError;
        
        const { data: { publicUrl: tUrl } } = supabase.storage.from('store_resources').getPublicUrl(thumbName);
        thumbnailUrl = tUrl;
      }

      // 3. Insert into database
      const { error: insertError } = await supabase
        .from('store_resources')
        .insert({
          store_id: storeId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          file_type: fileType,
          size: size
        });

      if (insertError) throw insertError;

      toast({ title: '¡Éxito!', description: 'Producto digital creado correctamente.' });
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', price: '', file: null, thumbnail: null });
      fetchStoreAndResources(); // refresh
    } catch (error) {
      console.error('Error uploading:', error);
      toast({ title: 'Error al subir', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, fileUrl, thumbnailUrl) => {
    if (!confirm('¿Seguro que deseas eliminar este producto digital? Ya no estará disponible para tus clientes.')) return;

    try {
      // Opcional: Borrar del bucket (requeriría parsear la URL para sacar el path)
      // Por simplicidad en este MVP, borramos el registro.
      const { error } = await supabase.from('store_resources').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Eliminado', description: 'El producto digital ha sido borrado.' });
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo eliminar el recurso.', variant: 'destructive' });
    }
  };

  const handleCopyDirectLink = (product) => {
    if (!store) return;
    
    let baseUrl = window.location.origin; // fallback
    if (store.custom_domain) {
      baseUrl = `https://${store.custom_domain}`;
    } else if (store.subdomain) {
      baseUrl = `https://${store.subdomain}.mlpadigital.com`;
    }
    
    const link = `${baseUrl}/?product=${product.id}&buy=true`;
    navigator.clipboard.writeText(link);
    toast({
      title: "¡Enlace copiado!",
      description: "El enlace de compra directa ha sido copiado al portapapeles."
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos Digitales</h1>
          <p className="text-slate-500">Sube ebooks, guías, archivos ZIP o cursos descargables para vender.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
            <Label htmlFor="enable-digital" className="cursor-pointer text-sm font-medium text-slate-700">Mostrar sección en tienda</Label>
            <Switch 
              id="enable-digital"
              checked={enableDigitalProducts}
              onCheckedChange={handleToggleDigitalProducts}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Archivo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Subir Producto Digital</DialogTitle>
              <DialogDescription>
                Los clientes que compren este producto recibirán acceso directo de descarga en su portal.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nombre del Producto *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Guía de Marketing 2024" />
              </div>
              
              <div className="space-y-2">
                <Label>Descripción Corta</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="¿Qué incluye este archivo?" rows={2} />
              </div>

              <div className="space-y-2">
                <Label>Precio ($)</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Ej: 1500 (Dejar en 0 si es gratis)" />
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><File className="w-4 h-4 text-slate-500"/> Archivo a vender *</Label>
                  <Input type="file" required onChange={e => handleFileChange(e, 'file')} />
                  <p className="text-xs text-slate-500">PDF, ZIP, DOCX, MP4...</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-slate-500"/> Imagen de Portada (Opcional)</Label>
                  <Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'thumbnail')} />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isUploading} className="w-full bg-indigo-600">
                  {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subiendo archivo...</> : 'Guardar y Publicar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {resources.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <File className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No tienes productos digitales</h3>
            <p className="text-slate-500 max-w-sm mb-4">Empieza a vender archivos descargables. Tus clientes tendrán un portal seguro para acceder a ellos.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Subir mi primer archivo</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <Card key={res.id} className="overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-video w-full bg-slate-100 relative border-b overflow-hidden flex items-center justify-center">
                {res.thumbnail_url ? (
                  <img src={res.thumbnail_url} alt={res.name} className="object-cover w-full h-full" />
                ) : (
                  <File className="w-12 h-12 text-slate-300" />
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                  ${res.price?.toLocaleString()}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">{res.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">{res.description}</p>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(res.file_url, '_blank')}>
                    <Download className="w-4 h-4 mr-2" /> Probar link
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleCopyDirectLink(res)} title="Copiar link de compra">
                    <Link className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(res.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DigitalProductsPage;
