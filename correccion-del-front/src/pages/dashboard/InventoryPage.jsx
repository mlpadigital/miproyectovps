import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  AlertTriangle, 
  History, 
  TrendingDown, 
  TrendingUp, 
  Save,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const InventoryPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Stock State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockForm, setStockForm] = useState({
    newStock: 0,
    minStock: 0,
    variants: [],
    note: ''
  });

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStoreAndProducts();
    }
  }, [user]);

  const fetchStoreAndProducts = async () => {
    try {
      setLoading(true);
      // 1. Get Store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1).single();

      if (storeError) throw storeError;
      setStoreId(storeData.id);

      // 2. Get Products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('name', { ascending: true });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (product) => {
    setSelectedProduct(product);
    setStockForm({
      newStock: product.stock || 0,
      minStock: product.min_stock || 5,
      variants: product.variants ? JSON.parse(JSON.stringify(product.variants)) : [],
      note: ''
    });
    setIsEditOpen(true);
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !storeId) return;

    let newStockInt = parseInt(stockForm.newStock);
    let finalVariants = stockForm.variants;

    if (finalVariants && finalVariants.length > 0) {
      finalVariants = finalVariants.map(v => ({ ...v, stock: parseInt(v.stock, 10) || 0 }));
      newStockInt = finalVariants.reduce((sum, v) => sum + v.stock, 0);
    }

    const oldStockInt = selectedProduct.stock || 0;
    const minStockInt = parseInt(stockForm.minStock);

    if (isNaN(newStockInt) || isNaN(minStockInt)) {
      toast({ title: "Error", description: "Los valores deben ser numéricos.", variant: "destructive" });
      return;
    }

    try {
      // 1. Update Product
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: newStockInt,
          min_stock: minStockInt,
          variants: finalVariants
        })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // 2. Log Change if stock changed
      if (newStockInt !== oldStockInt) {
        const changeType = newStockInt > oldStockInt ? 'restock' : 'manual_adjustment';
        const { error: logError } = await supabase
          .from('inventory_logs')
          .insert([{
            store_id: storeId,
            product_id: selectedProduct.id,
            change_type: changeType,
            quantity_change: newStockInt - oldStockInt,
            previous_stock: oldStockInt,
            new_stock: newStockInt,
            note: stockForm.note || 'Actualización manual de inventario',
            created_by: user.id
          }]);
          
        if (logError) console.error("Failed to create log:", logError);
      }

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, stock: newStockInt, min_stock: minStockInt, variants: finalVariants }
          : p
      ));

      toast({ title: "Inventario Actualizado", description: `El stock de ${selectedProduct.name} ha sido actualizado.` });
      setIsEditOpen(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({ title: "Error", description: "No se pudo actualizar el stock.", variant: "destructive" });
    }
  };

  const fetchHistory = async (product) => {
    setSelectedProduct(product);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistoryLogs(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({ title: "Error", description: "No se pudo cargar el historial.", variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStockStatus = (stock, minStock) => {
    const safeMin = minStock || 5;
    if (stock === 0) return { label: 'Agotado', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    if (stock <= safeMin) return { label: 'Stock Bajo', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle };
    return { label: 'En Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: Package };
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalItems: products.reduce((acc, curr) => acc + (curr.stock || 0), 0),
    lowStock: products.filter(p => (p.stock || 0) <= (p.min_stock || 5)).length,
    totalProducts: products.length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario & Stock</h1>
          <p className="text-slate-500">Controla las existencias de tus productos y configura alertas.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-slate-500">referencias únicas activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Totales</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-slate-500">unidades físicas en almacén</p>
          </CardContent>
        </Card>
        <Card className={stats.lowStock > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.lowStock > 0 ? "text-amber-600" : "text-slate-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStock > 0 ? "text-amber-700" : ""}`}>{stats.lowStock}</div>
            <p className="text-xs text-slate-500">productos con stock bajo o nulo</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Productos</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar producto o categoría..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No se encontraron productos.
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                  <tr>
                    <th className="h-12 px-4">Producto</th>
                    <th className="h-12 px-4">Stock Actual</th>
                    <th className="h-12 px-4 hidden sm:table-cell">Mínimo</th>
                    <th className="h-12 px-4">Estado</th>
                    <th className="h-12 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product.stock || 0, product.min_stock);
                    const StatusIcon = status.icon;
                    const hasVariants = product.variants && product.variants.length > 0;
                    
                    return (
                      <React.Fragment key={product.id}>
                        <tr className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Package className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 flex items-center gap-2">
                                    {product.name}
                                    {hasVariants && <Badge variant="secondary" className="text-[10px]">Multi</Badge>}
                                </div>
                                <div className="text-xs text-slate-500">{product.category || 'Sin categoría'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-medium text-base">
                            {product.stock || 0}
                          </td>
                          <td className="p-4 hidden sm:table-cell text-slate-500">
                            {product.min_stock || 5}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={cn("flex w-fit items-center gap-1 pr-3", status.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => fetchHistory(product)}
                                title="Ver Historial"
                              >
                                <History className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditDialog(product)}
                              >
                                Ajustar
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {hasVariants && product.variants.map((v, i) => (
                          <tr key={`${product.id}-var-${i}`} className="border-b bg-slate-50/50">
                             <td className="py-2 px-4 pl-16">
                               <div className="flex items-center gap-2 text-sm text-slate-600">
                                 {v.color_hex && <div className="w-3 h-3 rounded-full border border-slate-300" style={{backgroundColor: v.color_hex}}></div>}
                                 <span>{v.name}</span>
                                 {v.sku && <span className="text-xs text-slate-400 font-mono ml-2">SKU: {v.sku}</span>}
                               </div>
                             </td>
                             <td className="py-2 px-4 font-mono text-sm text-slate-700">{v.stock || 0}</td>
                             <td className="py-2 px-4 hidden sm:table-cell"></td>
                             <td className="py-2 px-4"></td>
                             <td className="py-2 px-4"></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Ajustar Inventario</DialogTitle>
            <DialogDescription className="text-slate-400">
              Actualiza el stock disponible para <strong className="text-white">{selectedProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {stockForm.variants.length > 0 ? (
                <div className="col-span-2 space-y-3 max-h-60 overflow-y-auto pr-2">
                  <Label className="text-slate-300">Stock por Variante</Label>
                  {stockForm.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-800 p-2 rounded border border-slate-700">
                      {v.color_hex && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: v.color_hex }} />}
                      <span className="flex-1 text-sm text-slate-300 truncate">{v.name}</span>
                      <Input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => {
                          const newVariants = [...stockForm.variants];
                          newVariants[i].stock = e.target.value;
                          setStockForm(prev => ({ ...prev, variants: newVariants }));
                        }}
                        className="w-24 bg-slate-900 border-slate-600 text-white h-8 text-right"
                      />
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-500 mt-1">El stock general será la suma de todas las variantes.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="current-stock" className="text-slate-300">Stock Actual</Label>
                  <Input
                    id="current-stock"
                    type="number"
                    value={stockForm.newStock}
                    onChange={(e) => setStockForm(prev => ({ ...prev, newStock: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white focus:border-violet-500"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="min-stock" className="text-slate-300">Alerta Mínimo</Label>
                <Input
                  id="min-stock"
                  type="number"
                  value={stockForm.minStock}
                  onChange={(e) => setStockForm(prev => ({ ...prev, minStock: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white focus:border-violet-500"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note" className="text-slate-300">Nota / Razón del cambio</Label>
              <Input
                id="note"
                placeholder="Ej: Llegada de mercancía, Ajuste mensual..."
                value={stockForm.note}
                onChange={(e) => setStockForm(prev => ({ ...prev, note: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white focus:border-violet-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancelar</Button>
            <Button onClick={handleStockUpdate} className="bg-violet-600 hover:bg-violet-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Historial de Movimientos</SheetTitle>
            <SheetDescription>
              Registro de cambios de inventario para {selectedProduct?.name}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 h-full pb-10">
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-lg" />)}
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                No hay movimientos registrados.
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
                <div className="space-y-4">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        log.quantity_change > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {log.quantity_change > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-slate-900">
                            {log.quantity_change > 0 ? 'Entrada' : 'Salida'} de Stock
                          </p>
                          <span className="text-xs text-slate-500">
                            {new Date(log.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{log.note || 'Sin nota adjunta'}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Prev: <span className="font-mono">{log.previous_stock}</span></span>
                          <span>→</span>
                          <span>Nuevo: <span className="font-mono font-bold text-slate-700">{log.new_stock}</span></span>
                        </div>
                      </div>
                      <div className={cn(
                        "font-mono font-bold text-lg self-center",
                        log.quantity_change > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InventoryPage;