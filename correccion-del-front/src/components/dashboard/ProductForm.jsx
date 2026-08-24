import React, { useState, useEffect } from 'react';
import { Loader2, X, Image as ImageIcon, Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ProductForm = ({ product, storeId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const initialState = {
    name: '',
    description: '',
    price: '',
    stock: '0',
    category: '',
    image_url: '',
    images: [],
    is_active: true,
    is_featured: false,
    product_type: 'fisico',
    sale_price: '',
    weight: '0',
    length: '0',
    width: '0',
    height: '0',
    variants: []
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    const getNormalizedImages = (imgs) => {
      if (!Array.isArray(imgs)) return [];
      return imgs.map(img => (typeof img === 'object' && img !== null) ? img.url : img).filter(Boolean);
    };

    if (product) {
      const normalizedImages = getNormalizedImages(product.images) || (product.image_url ? [product.image_url] : []);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price !== undefined && product.price !== null ? String(product.price) : '',
        stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '0',
        category: product.category || '',
        image_url: product.image_url || '',
        images: normalizedImages,
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        product_type: product.product_type || 'fisico',
        sale_price: product.sale_price !== undefined && product.sale_price !== null ? String(product.sale_price) : '',
        weight: product.weight !== undefined && product.weight !== null ? String(product.weight) : '0',
        length: product.length !== undefined && product.length !== null ? String(product.length) : '0',
        width: product.width !== undefined && product.width !== null ? String(product.width) : '0',
        height: product.height !== undefined && product.height !== null ? String(product.height) : '0',
        variants: product.variants || []
      });
    } else {
      setFormData(initialState);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { id: Math.random().toString(36).substr(2, 9), name: '', color_hex: '#000000', sku: '', stock: '0' }]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...(prev.variants || [])];
      if (newVariants[index]) {
        newVariants[index][field] = value;
      }
      return { ...prev, variants: newVariants };
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
  };

  const handleMediaUpload = async (e) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const newUrls = [];

      for (const file of files) {
        // Validación de tamaño (10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "Archivo muy grande",
            description: `El archivo ${file.name} supera los 10MB permitidos.`
          });
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${storeId}/${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            console.error('Error uploading:', uploadError);
            toast({ variant: "destructive", title: "Error", description: `No se pudo subir ${file.name}` });
            continue;
        }

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }

      if (newUrls.length > 0) {
        setFormData(prev => {
           const updatedImages = [...prev.images, ...newUrls];
           return {
               ...prev,
               images: updatedImages,
               image_url: updatedImages[0] // always keep first item as image_url for cover
           };
        });
        toast({ title: "Archivos subidos", description: "El contenido multimedia se cargó correctamente." });
      }

    } catch (error) {
      console.error('Error en proceso de subida:', error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveMedia = (index, e) => {
    if (e) e.stopPropagation();
    setFormData(prev => {
        const updatedImages = prev.images.filter((_, i) => i !== index);
        return {
            ...prev,
            images: updatedImages,
            image_url: updatedImages.length > 0 ? updatedImages[0] : ''
        };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId) {
      toast({ variant: "destructive", title: "Error", description: "No se encontró la tienda asociada." });
      return;
    }

    try {
      setLoading(true);

      // Conversión segura de tipos
      const parsedPrice = parseFloat(formData.price);
      const parsedSalePrice = parseFloat(formData.sale_price);
      
      if (!isNaN(parsedSalePrice) && !isNaN(parsedPrice) && parsedSalePrice >= parsedPrice) {
          toast({ variant: "destructive", title: "Error", description: "El precio de oferta debe ser menor al precio normal." });
          setLoading(false);
          return;
      }
      
      // Calculate total stock: if variants exist, sum their stocks, else use formData.stock
      let finalStock = 0;
      let finalVariants = [];
      
      if (formData.variants && formData.variants.length > 0) {
        finalVariants = formData.variants.map(v => ({
            ...v,
            stock: parseInt(v.stock, 10) || 0
        }));
        finalStock = finalVariants.reduce((sum, v) => sum + v.stock, 0);
      } else {
        finalStock = parseInt(formData.stock, 10) || 0;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        stock: finalStock,
        variants: finalVariants,
        category: formData.category.trim(),
        image_url: formData.image_url,
        images: formData.images,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        product_type: formData.product_type,
        sale_price: isNaN(parsedSalePrice) ? null : parsedSalePrice,
        weight: parseFloat(formData.weight) || 0,
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        store_id: storeId,
      };

      let error;
      if (product?.id) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Producto ${product?.id ? 'actualizado' : 'creado'} correctamente.`
      });
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el producto." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Upload de Galería Multimedia */}
        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">Galería Multimedia (Fotos y Videos)</Label>
          <div className="flex flex-wrap gap-4">
            
            {/* Thumbnails */}
            {formData.images.map((url, idx) => {
                const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');
                return (
                    <div key={idx} className="relative w-24 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group">
                        {isVideo ? (
                            <video src={url} className="w-full h-full object-cover" muted />
                        ) : (
                            <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                        )}
                        {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                <Video className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={(e) => handleRemoveMedia(idx, e)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Eliminar archivo"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-violet-600/90 text-white text-[10px] text-center py-0.5 font-bold">
                                PORTADA
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Add More Button */}
            <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-violet-500 hover:bg-slate-50 transition-colors cursor-pointer text-slate-400 hover:text-violet-500 overflow-hidden">
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold text-center px-1">Añadir<br/>Archivo</span>
                <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    multiple
                    onChange={handleMediaUpload}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                    </div>
                )}
            </div>

          </div>
          <p className="text-xs text-slate-500">Puedes subir imágenes o videos cortos (hasta 10MB c/u). El primer archivo será la portada.</p>
        </div>

        {/* Campos del Formulario */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label htmlFor="product_type" className="text-slate-700 font-medium">Tipo de Producto *</Label>
            <select
              id="product_type"
              name="product_type"
              value={formData.product_type}
              onChange={handleInputChange}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              <option value="fisico">Físico (Envío Tradicional)</option>
              <option value="digital_auto">Digital (Descarga Automática)</option>
              <option value="digital_manual">Digital (Envío Manual)</option>
              <option value="servicio">Servicio (Asesoría, Clases)</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Nombre del Producto *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ej. Camiseta Premium"
              required
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe tu producto..."
              rows={3}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label htmlFor="price" className="text-slate-700 font-medium">Precio *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="pl-7 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500">Dejar en 0 para mostrar "Consultar precio".</p>
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label htmlFor="sale_price" className="text-slate-700 font-medium">Precio de Oferta (Opcional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.sale_price}
                onChange={handleInputChange}
                className="pl-7 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                placeholder="0.00"
              />
            </div>
            <p className="text-[10px] text-slate-500">Debe ser menor al precio normal.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock" className="text-slate-700 font-medium">Stock General</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.variants.length > 0 ? formData.variants.reduce((acc, v) => acc + (parseInt(v.stock)||0), 0) : formData.stock}
              onChange={handleInputChange}
              disabled={formData.variants.length > 0}
              placeholder="0"
              className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 ${formData.variants.length > 0 ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
            />
            {formData.variants.length > 0 && <p className="text-[10px] text-slate-500">Stock autocalculado por la suma de sus variantes.</p>}
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label htmlFor="category" className="text-slate-700 font-medium">Categoría</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Ej. Ropa, Accesorios, Digital"
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-2">
            <Label className="text-slate-700 font-medium">Visibilidad en la tienda</Label>
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="is_active" 
                checked={formData.is_active} 
                onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
                className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer text-slate-700">
                {formData.is_active ? 'Publicado (Visible)' : 'Oculto'}
              </Label>
            </div>
          </div>

          {/* VARIANTES SECTION */}
          <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100">
             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div>
                     <h4 className="text-base font-bold text-slate-900">Opciones y Variantes (Color, Talle, etc.)</h4>
                     <p className="text-sm text-slate-600 mt-1">Agrega distintas opciones, cada una con su propio stock y código.</p>
                 </div>
                 <Button type="button" onClick={(e) => { e.preventDefault(); handleAddVariant(); }} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md h-10 px-4">
                     <Plus className="w-4 h-4 mr-2" /> Añadir Variante
                 </Button>
             </div>
             
             <div className="space-y-2">
                 {formData.variants.map((v, i) => (
                     <div key={v.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                         <div className="col-span-4">
                             <Label className="text-[10px] text-slate-500">Nombre (Ej: Rojo M)</Label>
                             <Input value={v.name} onChange={e => handleVariantChange(i, 'name', e.target.value)} className="h-8 text-xs bg-white text-slate-900 placeholder:text-slate-400" placeholder="Rojo M" required />
                         </div>
                         <div className="col-span-2">
                             <Label className="text-[10px] text-slate-500">Color (Opcional)</Label>
                             <div className="flex gap-1 h-8 items-center bg-white border border-slate-200 rounded-md px-1 overflow-hidden">
                                 <input type="color" value={v.color_hex || '#000000'} onChange={e => handleVariantChange(i, 'color_hex', e.target.value)} className="w-full h-8 p-0 border-0 cursor-pointer bg-transparent" />
                             </div>
                         </div>
                         <div className="col-span-3">
                             <Label className="text-[10px] text-slate-500">SKU</Label>
                             <Input value={v.sku || ''} onChange={e => handleVariantChange(i, 'sku', e.target.value)} className="h-8 text-xs bg-white text-slate-900 placeholder:text-slate-400" placeholder="CÓD-01" />
                         </div>
                         <div className="col-span-2">
                             <Label className="text-[10px] text-slate-500">Stock</Label>
                             <Input type="number" min="0" value={v.stock} onChange={e => handleVariantChange(i, 'stock', e.target.value)} className="h-8 text-xs bg-white text-slate-900 placeholder:text-slate-400" />
                         </div>
                         <div className="col-span-1 flex justify-center mt-4">
                             <button type="button" onClick={() => handleRemoveVariant(i)} className="text-red-500 hover:text-red-700 transition-colors p-1 bg-red-50 rounded">
                                 <X className="w-4 h-4" />
                             </button>
                         </div>
                     </div>
                 ))}
                 {formData.variants.length === 0 && (
                     <div className="text-center p-6 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                         No hay variantes. El producto utilizará un stock general único.
                     </div>
                 )}
             </div>
          </div>

          {formData.product_type === 'fisico' && (
            <div className="col-span-2 space-y-3 pt-4 border-t border-slate-100">
               <h4 className="text-sm font-semibold text-slate-800">Datos para Envíos (Dimensiones)</h4>
               <p className="text-xs text-slate-500">Requerido para cotizar el envío con Correo Argentino, Andreani, etc.</p>
               <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                     <Label htmlFor="weight" className="text-xs text-slate-700">Peso (kg)</Label>
                     <Input id="weight" name="weight" type="number" min="0" step="0.01" value={formData.weight} onChange={handleInputChange} placeholder="0.5" className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="length" className="text-xs text-slate-700">Largo (cm)</Label>
                     <Input id="length" name="length" type="number" min="0" step="0.1" value={formData.length} onChange={handleInputChange} placeholder="10" className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="width" className="text-xs text-slate-700">Ancho (cm)</Label>
                     <Input id="width" name="width" type="number" min="0" step="0.1" value={formData.width} onChange={handleInputChange} placeholder="10" className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="height" className="text-xs text-slate-700">Alto (cm)</Label>
                     <Input id="height" name="height" type="number" min="0" step="0.1" value={formData.height} onChange={handleInputChange} placeholder="10" className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" />
                  </div>
               </div>
            </div>
          )}

          <div className="col-span-2 flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="is_featured" 
              checked={formData.is_featured} 
              onChange={(e) => setFormData(prev => ({...prev, is_featured: e.target.checked}))}
              className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <div className="space-y-1">
               <Label htmlFor="is_featured" className="text-slate-700 font-medium cursor-pointer">Destacar en el Inicio</Label>
               <p className="text-xs text-slate-500">Este producto aparecerá en la sección de "Productos Destacados" en la pantalla principal.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || uploading}
          className="text-slate-700 border-slate-300 hover:bg-slate-50"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || uploading}
          className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;