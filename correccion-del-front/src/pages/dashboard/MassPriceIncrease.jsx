import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MassPriceIncrease = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [percentage, setPercentage] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'category', 'specific'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchStoreAndProducts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 1. Get User's Store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (storeError) throw storeError;
        if (!isMounted) return;
        setStore(storeData);

        if (storeData) {
          // 2. Get Products for that store
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, sale_price, category')
            .eq('store_id', storeData.id)
            .order('name');

          if (productsError) throw productsError;

          if (isMounted) {
            setProducts(productsData || []);
            const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCategories);
            if (uniqueCategories.length > 0) {
              setSelectedCategory(uniqueCategories[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar los productos."
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStoreAndProducts();

    return () => {
      isMounted = false;
    };
  }, [user, toast]);

  const handleProductSelection = (productId) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]); // Deselect all
    } else {
      setSelectedProductIds(products.map(p => p.id)); // Select all
    }
  };

  const executeMassIncrease = async (e) => {
    e.preventDefault();
    
    const percentageValue = parseFloat(percentage);
    if (isNaN(percentageValue) || percentageValue <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un porcentaje válido mayor a 0."
      });
      return;
    }

    if (!store) return;

    let targetProducts = [];

    if (filterType === 'all') {
      targetProducts = products;
    } else if (filterType === 'category') {
      targetProducts = products.filter(p => p.category === selectedCategory);
    } else if (filterType === 'specific') {
      targetProducts = products.filter(p => selectedProductIds.includes(p.id));
    }

    if (targetProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "Atención",
        description: "No hay productos seleccionados para actualizar."
      });
      return;
    }

    // Calcular los nuevos precios (Redondeado, según aprobación del usuario)
    const multiplier = 1 + (percentageValue / 100);
    const updates = targetProducts.map(p => {
      const currentPrice = Number(p.price || 0);
      const newPrice = Math.round(currentPrice * multiplier);
      
      let newSalePrice = p.sale_price;
      if (p.sale_price > 0) {
        newSalePrice = Math.round(Number(p.sale_price) * multiplier);
      }

      return {
        id: p.id,
        price: newPrice,
        sale_price: newSalePrice
      };
    });

    try {
      setIsUpdating(true);
      
      const updatePromises = updates.map(updateData => 
        supabase
          .from('products')
          .update({ 
            price: updateData.price, 
            sale_price: updateData.sale_price 
          })
          .eq('id', updateData.id)
          .eq('store_id', store.id)
      );

      await Promise.all(updatePromises);

      toast({
        title: "¡Éxito!",
        description: `Se aumentaron los precios de ${updates.length} productos correctamente.`
      });

      // Refrescar el estado local para reflejar los cambios
      setProducts(prevProducts => 
        prevProducts.map(p => {
          const update = updates.find(u => u.id === p.id);
          if (update) {
            return { ...p, price: update.price, sale_price: update.sale_price };
          }
          return p;
        })
      );
      
      // Limpiar input
      setPercentage('');

    } catch (error) {
      console.error('Error mass updating prices:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un error al actualizar los precios."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-4" />
        <p className="text-slate-500">Cargando catálogo...</p>
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
            Para gestionar productos, primero necesitas crear una tienda. Ve al panel de configuración para empezar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-violet-600" />
          Aumento Masivo
        </h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-2xl">
          En esta sección podés aumentar masivamente el precio de tus productos en función a un porcentaje dado de una manera simple y rápida. 
          Si el producto está en oferta, se aumenta el precio de ambos (con y sin oferta) teniendo en cuenta el porcentaje configurado.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-4">Configuración</h3>
        
        <form onSubmit={executeMassIncrease} className="space-y-6">
          
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="percentage" className="text-slate-700 font-medium">Porcentaje de aumento *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
              <Input
                id="percentage"
                type="number"
                min="0.1"
                step="0.1"
                required
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="pl-8 bg-background text-foreground border-slate-200 font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Filtrar productos para aumentar precio</Label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full max-w-md items-center justify-between rounded-md border border-slate-200 bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              <option value="all">Todos los productos</option>
              <option value="category">Filtrar por categoría</option>
              <option value="specific">Filtrar por productos específicos</option>
            </select>
          </div>

          {filterType === 'category' && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-md animate-in fade-in slide-in-from-top-2">
              <Label className="text-slate-700 font-medium">Seleccionar Categoría</Label>
              {categories.length > 0 ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-slate-500">No hay categorías disponibles.</p>
              )}
            </div>
          )}

          {filterType === 'specific' && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-slate-700 font-medium">Seleccionar Productos</Label>
                <button type="button" onClick={handleSelectAll} className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                  {selectedProductIds.length === products.length ? 'Desmarcar todos' : 'Marcar todos'}
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200 bg-white p-3 rounded-lg border border-slate-200">
                {products.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No hay productos en tu inventario.</p>
                ) : (
                  products.map(product => (
                    <label key={product.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => handleProductSelection(product.id)}
                        className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{product.category || 'Sin categoría'}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-sm font-semibold text-slate-700">${Number(product.price).toLocaleString()}</p>
                        {product.sale_price > 0 && <p className="text-[10px] text-green-600 font-bold">${Number(product.sale_price).toLocaleString()} (Oferta)</p>}
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-slate-500">
                {selectedProductIds.length} producto(s) seleccionado(s) de {products.length}.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Al confirmar, los precios se actualizarán inmediatamente.
            </p>
            <Button 
              type="submit" 
              disabled={isUpdating || products.length === 0}
              className="bg-violet-600 hover:bg-violet-700 text-white min-w-[200px]"
            >
              {isUpdating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
              ) : (
                'Aplicar Aumento'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MassPriceIncrease;
