import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Eye, 
  Filter,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  AlertCircle,
  CreditCard,
  Trash2
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const STATUSES = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  processing: { label: 'En Proceso', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const OrdersPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [storeId, setStoreId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStoreAndOrders();
    }
  }, [user]);

  const fetchStoreAndOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1).single();

      if (storeError) {
        if (storeError.code === 'PGRST116') {
          setErrorMsg('No se encontró una tienda asociada a tu usuario.');
        } else {
          throw storeError;
        }
        setLoading(false);
        return;
      }
      
      setStoreId(storeData.id);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMsg('Hubo un error al cargar las órdenes. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      toast({ title: "Estado Actualizado", description: "La orden ha cambiado de estado exitosamente." });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({ title: "Error", description: "No se pudo actualizar el estado de la orden.", variant: "destructive" });
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.id);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      if (selectedOrder?.id === orderToDelete.id) {
        setIsDetailOpen(false);
        setSelectedOrder(null);
      }
      toast({ title: "Orden eliminada", description: "La orden ha sido eliminada permanentemente." });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({ title: "Error", description: "No se pudo eliminar la orden: " + (error.message || error), variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.id && o.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    revenue: orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0)
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(amount) || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };
  
  const formatId = (id) => {
    if (!id) return '-';
    if (id.includes('-')) {
      return `#${id.split('-')[0].toUpperCase()}`;
    }
    return `#${id}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Órdenes</h1>
          <p className="text-slate-500">Administra los pedidos de tus clientes y realiza el seguimiento de envíos.</p>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMsg}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500">pedidos recibidos históricamente</p>
          </CardContent>
        </Card>
        <Card className={stats.pending > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <Clock className={`h-4 w-4 ${stats.pending > 0 ? "text-amber-600" : "text-slate-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pending > 0 ? "text-amber-700" : ""}`}>{stats.pending}</div>
            <p className="text-xs text-slate-500">requieren tu atención</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-slate-500">facturación global</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Listado de Órdenes</CardTitle>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por ID, cliente, email..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  {Object.entries(STATUSES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No se encontraron órdenes</h3>
              <p className="text-slate-500 text-sm mt-1">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Aún no has recibido ninguna orden en tu tienda.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                  <tr>
                    <th className="h-12 px-4 whitespace-nowrap">ID Orden</th>
                    <th className="h-12 px-4">Cliente</th>
                    <th className="h-12 px-4">Fecha</th>
                    <th className="h-12 px-4">Estado</th>
                    <th className="h-12 px-4 text-right">Total</th>
                    <th className="h-12 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const status = STATUSES[order.status] || STATUSES.pending;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono font-medium text-slate-700" title={order.id}>
                          {formatId(order.id)}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{order.customer_name || 'Sin Nombre'}</div>
                          <div className="text-xs text-slate-500">{order.customer_email || 'Sin Email'}</div>
                        </td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("flex w-fit items-center gap-1 pr-3", status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-medium text-slate-900 whitespace-nowrap">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openOrderDetail(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detalles
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200"
                              onClick={() => setOrderToDelete(order)}
                              title="Eliminar Orden"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full overflow-hidden p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="flex justify-between items-center">
              <span>Orden {formatId(selectedOrder?.id)}</span>
            </SheetTitle>
            <SheetDescription>
              {selectedOrder && formatDate(selectedOrder.created_at)}
            </SheetDescription>
          </SheetHeader>
          
          {selectedOrder && (
            <ScrollArea className="flex-1 p-6">
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Estado de la Orden</h3>
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
                >
                  <SelectTrigger className={cn("w-full h-12 font-medium", STATUSES[selectedOrder.status]?.color || STATUSES.pending.color)}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([key, { label, icon: Icon }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Información del Cliente</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Nombre:</span>
                    <span className="font-medium text-slate-900">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-900">{selectedOrder.customer_email || '-'}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Teléfono:</span>
                    <span className="font-medium text-slate-900">{selectedOrder.customer_phone || '-'}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr]">
                    <span className="text-slate-500">Dirección:</span>
                    <span className="font-medium text-slate-900">{selectedOrder.shipping_address || 'No especificada'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Pago y Envío</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-[120px_1fr]">
                    <span className="text-slate-500">Método de Pago:</span>
                    <span className="font-medium text-slate-900 capitalize">{selectedOrder.payment_method || 'A convenir'}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr]">
                    <span className="text-slate-500">Estado de Pago:</span>
                    <Badge variant={selectedOrder.payment_status === 'paid' ? 'success' : 'secondary'} className="w-fit">
                      {selectedOrder.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Productos ({selectedOrder.items?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                      <div>
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          {item.quantity} x {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="font-medium text-slate-900">
                        {formatCurrency((item.quantity || 1) * (item.price || 0))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {Number(selectedOrder.shipping_cost) > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Envío</span>
                    <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                  </div>
                )}
                {Number(selectedOrder.tax) > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Impuestos</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}</span>
                    <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-slate-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => setOrderToDelete(selectedOrder)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar esta Orden
                </Button>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar orden {orderToDelete ? formatId(orderToDelete.id) : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La orden y su registro serán eliminados permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrder} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Orden'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;
