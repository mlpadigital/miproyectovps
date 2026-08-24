import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Percent, DollarSign, Trash2, Edit, ShoppingCart, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DiscountsPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState(null);
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_purchase_amount: '0',
    is_active: true
  });

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStoreAndDiscounts();
    }
  }, [user]);

  const fetchStoreAndDiscounts = async () => {
    try {
      setLoading(true);
      // 1. Get Store ID
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1).single();

      if (storeError) throw storeError;
      if (!storeData) {
        toast({ title: "Error", description: "No se encontró una tienda asociada.", variant: "destructive" });
        return;
      }

      setStoreId(storeData.id);

      // 2. Get Discounts
      const { data: discountsData, error: discountsError } = await supabase
        .from('discounts')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (discountsError) throw discountsError;
      setDiscounts(discountsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los descuentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      min_purchase_amount: '0',
      is_active: true
    });
    setIsEditing(false);
    setCurrentDiscount(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (discount) => {
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      min_purchase_amount: discount.min_purchase_amount || '0',
      is_active: discount.is_active
    });
    setCurrentDiscount(discount);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!storeId) return;
    
    if (!formData.code || !formData.value) {
      toast({ title: "Error", description: "Por favor completa todos los campos requeridos.", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        store_id: storeId,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        min_purchase_amount: parseFloat(formData.min_purchase_amount || 0),
        is_active: formData.is_active
      };

      let error;
      if (isEditing && currentDiscount) {
        const { error: updateError } = await supabase
          .from('discounts')
          .update(payload)
          .eq('id', currentDiscount.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('discounts')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: isEditing ? "Descuento actualizado" : "Descuento creado",
        description: `El cupón ${payload.code} ha sido guardado exitosamente.`
      });

      setIsDialogOpen(false);
      fetchStoreAndDiscounts();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el descuento.",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (discount) => {
    setDiscountToDelete(discount);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!discountToDelete) return;
    
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', discountToDelete.id);

      if (error) throw error;

      toast({ title: "Eliminado", description: "El descuento ha sido eliminado correctamente." });
      setDiscounts(prev => prev.filter(d => d.id !== discountToDelete.id));
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({ title: "Error", description: "No se pudo eliminar el descuento.", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setDiscountToDelete(null);
    }
  };

  const toggleActive = async (discount) => {
    try {
      const { error } = await supabase
        .from('discounts')
        .update({ is_active: !discount.is_active })
        .eq('id', discount.id);

      if (error) throw error;

      setDiscounts(prev => prev.map(d => 
        d.id === discount.id ? { ...d, is_active: !d.is_active } : d
      ));
      
      toast({
        title: !discount.is_active ? "Descuento Activado" : "Descuento Desactivado",
        description: `El estado del cupón ${discount.code} ha sido actualizado.`
      });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'min_purchase': return <ShoppingCart className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getLabelForType = (type) => {
    switch (type) {
      case 'percentage': return 'Porcentaje';
      case 'fixed': return 'Monto Fijo';
      case 'min_purchase': return 'Compra Mínima';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Descuentos y Promociones</h1>
          <p className="text-slate-500">Gestiona tus cupones y campañas promocionales.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Descuento
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl"></div>
           ))}
        </div>
      ) : discounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tienes descuentos activos</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Crea tu primer cupón para incentivar a tus clientes y aumentar tus ventas.
            </p>
            <Button onClick={openCreateDialog} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Descuento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <Card key={discount.id} className={`transition-all hover:shadow-md ${!discount.is_active ? 'opacity-70 bg-slate-50' : 'bg-white'}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-mono font-bold tracking-wider text-violet-700">
                    {discount.code}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {getIconForType(discount.type)}
                      {getLabelForType(discount.type)}
                    </span>
                    {!discount.is_active && (
                      <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Inactivo</span>
                    )}
                  </CardDescription>
                </div>
                <Switch 
                  checked={discount.is_active} 
                  onCheckedChange={() => toggleActive(discount)} 
                />
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-slate-900">
                    {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                    <span className="text-sm font-normal text-slate-500 ml-1">OFF</span>
                  </div>
                  {discount.type === 'min_purchase' && (
                    <p className="text-sm text-slate-500 mt-1">
                      En compras superiores a ${discount.min_purchase_amount}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => openEditDialog(discount)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDelete(discount)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{isEditing ? 'Editar Descuento' : 'Crear Nuevo Descuento'}</DialogTitle>
            <DialogDescription className="text-slate-600">
              Configura los detalles de tu promoción. El código debe ser único.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code" className="text-slate-800">Código del Cupón</Label>
              <Input
                id="code"
                name="code"
                placeholder="EJ: VERANO2024"
                value={formData.code}
                onChange={handleInputChange}
                className="uppercase font-mono text-slate-900"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-slate-800">Tipo de Descuento</Label>
              <Select value={formData.type} onValueChange={handleSelectChange}>
                <SelectTrigger className="text-slate-900 bg-white">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900">
                  <SelectItem value="percentage" className="hover:bg-slate-100 cursor-pointer">Porcentaje (%)</SelectItem>
                  <SelectItem value="fixed" className="hover:bg-slate-100 cursor-pointer">Monto Fijo ($)</SelectItem>
                  <SelectItem value="min_purchase" className="hover:bg-slate-100 cursor-pointer">Con Compra Mínima</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value" className="text-slate-800">Valor {formData.type === 'percentage' ? '(%)' : '($)'}</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  placeholder="0"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="text-slate-900"
                />
              </div>
              {formData.type === 'min_purchase' && (
                <div className="grid gap-2">
                  <Label htmlFor="min_purchase_amount" className="text-slate-800">Mínimo ($)</Label>
                  <Input
                    id="min_purchase_amount"
                    name="min_purchase_amount"
                    type="number"
                    placeholder="0"
                    value={formData.min_purchase_amount}
                    onChange={handleInputChange}
                    className="text-slate-900"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base text-slate-800">Estado Activo</Label>
                <p className="text-sm text-slate-500">
                  El cupón será utilizable inmediatamente.
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white">
              {isEditing ? 'Guardar Cambios' : 'Crear Descuento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El descuento <b>{discountToDelete?.code}</b> será eliminado permanentemente y ya no podrá ser utilizado por tus clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DiscountsPage;