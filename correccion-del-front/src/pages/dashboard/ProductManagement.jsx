import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertCircle, Loader2, Link } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProductForm from '@/components/dashboard/ProductForm';

const ProductManagement = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [store, setStore] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStoreAndProducts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 1. Get User's Store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name, subdomain')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (storeError) throw storeError;

        if (!isMounted) return;
        setStore(storeData);

        if (storeData) {
          // 2. Get Products for that store
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('store_id', storeData.id)
            .order('created_at', { ascending: false });

          if (productsError) throw productsError;
          if (isMounted) setProducts(productsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los productos." });
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

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "El producto ha sido eliminado correctamente.",
      });

      setProducts(products.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive"
      });
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

  const reloadProducts = async () => {
    if (!store?.id) return;
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error reloaded products:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    reloadProducts();
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-violet-600" />
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Productos</h2>
          <p className="text-slate-500 mt-1">Gestiona el inventario de <span className="font-medium text-slate-700">{store.name}</span></p>
        </div>
        <Button onClick={handleAddProduct} className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="text-sm text-slate-500 ml-auto w-full sm:w-auto text-right">
          Total: <span className="font-bold text-slate-900">{products.length}</span> productos
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No hay productos encontrados</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            {searchQuery ? 'Intenta con otros términos de búsqueda.' : 'Comienza agregando tu primer producto para vender en tu tienda.'}
          </p>
          {!searchQuery && (
            <Button variant="link" onClick={handleAddProduct} className="mt-4 text-violet-600 font-medium">
              Agregar Producto
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-[100px]">Imagen</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {product.name}
                      {product.is_active === false && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200 font-normal">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{product.category || '-'}</td>
                    <td className="px-6 py-3 text-slate-500 capitalize text-xs">
                      {product.product_type?.replace('_', ' ') || 'físico'}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-700">
                      {product.price === 0 || product.price === '0' || product.price === null ? (
                        <span className="text-violet-600 font-medium text-xs bg-violet-50 px-2 py-1 rounded-md">Consultar precio</span>
                      ) : (
                        <div className="flex flex-col">
                          {product.sale_price > 0 && product.sale_price < product.price ? (
                            <>
                              <span className="text-xs text-slate-400 line-through">${Number(product.price).toLocaleString()}</span>
                              <span className="text-green-600 font-bold">${Number(product.sale_price).toLocaleString()}</span>
                            </>
                          ) : (
                            <span>${Number(product.price || 0).toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${product.stock > 10 ? 'bg-green-50 text-green-700 border-green-200' :
                          product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {product.stock ?? 0} un.
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleCopyDirectLink(product)} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50" title="Copiar link de compra">
                          <Link className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} className="text-slate-500 hover:text-violet-600 hover:bg-violet-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product.id)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Completa los detalles del producto. Los cambios se reflejarán inmediatamente en tu tienda.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            storeId={store?.id}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Esta acción no se puede deshacer. El producto se eliminará permanentemente de tu inventario y tienda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-slate-700 border-slate-300 hover:bg-slate-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white border-0">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;