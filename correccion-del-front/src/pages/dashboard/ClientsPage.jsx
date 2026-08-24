import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  UserCheck, 
  DollarSign, 
  Eye, 
  Filter,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { supabase, supabaseAdmin } from '@/lib/customSupabaseClient';
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

const STATUSES = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700 border-green-200' },
  customer: { label: 'Comprador', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  subscriber: { label: 'Suscriptor (Newsletter)', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  inactive: { label: 'Inactivo', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const ClientsPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [storeId, setStoreId] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedEmails, setCopiedEmails] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStoreAndClients();
    }
  }, [user]);

  const fetchStoreAndClients = async () => {
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

      const { data: clientsData, error: clientsError } = await supabase
        .from('store_customers')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        throw clientsError;
      } else {
        setClients(clientsData || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setErrorMsg('Hubo un error al cargar los clientes. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      const { error } = await supabase
        .from('store_customers')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (error) throw error;

      setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
      if (selectedClient?.id === clientId) {
        setSelectedClient(prev => ({ ...prev, status: newStatus }));
      }
      
      toast({ title: "Estado Actualizado", description: "El cliente ha cambiado de estado exitosamente." });
    } catch (error) {
      console.error('Error updating client status:', error);
      toast({ title: "Error", description: "No se pudo actualizar el estado del cliente.", variant: "destructive" });
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      // Use supabaseAdmin to bypass RLS restrictions on guest customer records (null user_id)
      const { error: adminError } = await supabaseAdmin
        .from('store_customers')
        .delete()
        .eq('id', clientToDelete.id);

      if (adminError) {
        const { error: clientError } = await supabase
          .from('store_customers')
          .delete()
          .eq('id', clientToDelete.id);

        if (clientError) throw clientError;
      }

      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      if (selectedClient?.id === clientToDelete.id) {
        setIsDetailOpen(false);
        setSelectedClient(null);
      }
      toast({ title: "Cliente eliminado", description: "El registro del cliente ha sido eliminado permanentemente de la base de datos." });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ title: "Error", description: "No se pudo eliminar el cliente: " + (error.message || error), variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  const copySubscriberEmails = () => {
    const subscriberEmails = clients
      .filter(c => c.email && (statusFilter === 'all' || c.status === statusFilter || (statusFilter === 'subscriber' && c.status === 'subscriber')))
      .map(c => c.email)
      .join(', ');

    if (!subscriberEmails) {
      toast({ title: "Sin emails", description: "No hay correos electrónicos para copiar con el filtro actual." });
      return;
    }

    navigator.clipboard.writeText(subscriberEmails);
    setCopiedEmails(true);
    toast({ title: "Emails copiados", description: "Los correos han sido copiados al portapapeles." });
    setTimeout(() => setCopiedEmails(false), 3000);
  };

  const openClientDetail = (client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    subscribers: clients.filter(c => c.status === 'subscriber').length,
    activeCustomers: clients.filter(c => c.status === 'active' || c.status === 'customer' || !c.status).length,
    revenue: clients.reduce((acc, curr) => acc + (Number(curr.total_spent) || 0), 0)
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(amount) || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Directorio de Clientes & Suscriptores</h1>
          <p className="text-slate-500">Visualiza clientes compradores y personas suscritas a tu Newsletter.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={copySubscriberEmails}
            className="flex items-center gap-2"
          >
            {copiedEmails ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>Copiar Emails</span>
          </Button>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrados</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500">clientes y suscriptores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
            <Mail className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.subscribers}</div>
            <p className="text-xs text-slate-500">suscritos desde el pie de página</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compradores</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeCustomers}</div>
            <p className="text-xs text-slate-500">con órdenes o compras</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Generado</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-slate-500">acumulado en ventas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>Listado</CardTitle>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setStatusFilter('all')}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition", statusFilter === 'all' ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900")}
                >
                  Todos ({stats.total})
                </button>
                <button 
                  onClick={() => setStatusFilter('subscriber')}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition", statusFilter === 'subscriber' ? "bg-white shadow-sm text-purple-700 font-bold" : "text-slate-600 hover:text-slate-900")}
                >
                  Newsletter ({stats.subscribers})
                </button>
                <button 
                  onClick={() => setStatusFilter('customer')}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition", statusFilter === 'customer' ? "bg-white shadow-sm text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900")}
                >
                  Compradores
                </button>
              </div>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por email, nombre..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
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
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No se encontraron clientes.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                  <tr>
                    <th className="h-12 px-4">Cliente</th>
                    <th className="h-12 px-4">Contacto</th>
                    <th className="h-12 px-4 text-center">Órdenes</th>
                    <th className="h-12 px-4 text-right">Total Gastado</th>
                    <th className="h-12 px-4">Estado</th>
                    <th className="h-12 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const status = STATUSES[client.status] || STATUSES.active;
                    return (
                      <tr key={client.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {getInitials(client.name || client.email)}
                            </div>
                            <div className="font-medium text-slate-900">{client.name || 'Sin Nombre'}</div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs truncate max-w-[150px]">{client.email || '-'}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">{client.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center font-medium">
                          {client.orders_count || 0}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-900">
                          {formatCurrency(client.total_spent)}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("font-medium", status.color)}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openClientDetail(client)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Perfil
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200"
                              onClick={() => setClientToDelete(client)}
                              title="Eliminar Cliente"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Borrar
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

      {/* Client Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex justify-between items-center">
              <span>Perfil de Cliente</span>
            </SheetTitle>
            <SheetDescription>
              Información detallada y métricas
            </SheetDescription>
          </SheetHeader>
          
          {selectedClient && (
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="h-14 w-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {getInitials(selectedClient.name || selectedClient.email)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedClient.name || 'Sin Nombre'}</h2>
                  <p className="text-xs text-slate-500 mt-1">Registrado el {formatDate(selectedClient.created_at)}</p>
                </div>
              </div>

              {/* Status Manager */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Estado de Cuenta</label>
                <Select 
                  value={selectedClient.status || 'active'} 
                  onValueChange={(val) => handleStatusChange(selectedClient.id, val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Contacto</label>
                
                <div className="bg-slate-50 rounded-lg p-3 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 text-xs">Correo Electrónico</div>
                      <div className="font-medium text-slate-900">{selectedClient.email || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 text-xs">Teléfono</div>
                      <div className="font-medium text-slate-900">{selectedClient.phone || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-slate-500 text-xs">Dirección</div>
                      <div className="font-medium text-slate-900">{selectedClient.address || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Actividad</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 p-4 rounded-lg text-center bg-white shadow-sm">
                    <ShoppingBag className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900">{selectedClient.orders_count || 0}</div>
                    <div className="text-xs text-slate-500">Órdenes</div>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-lg text-center bg-white shadow-sm">
                    <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(selectedClient.total_spent)}</div>
                    <div className="text-xs text-slate-500">Gastado</div>
                  </div>
                </div>
                
                {selectedClient.last_order_at && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <CalendarDays className="w-4 h-4" />
                    <span>Última compra: <strong>{formatDate(selectedClient.last_order_at)}</strong></span>
                  </div>
                )}
              </div>

              {/* Delete Button inside Detail Sheet */}
              <div className="mt-8 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => setClientToDelete(selectedClient)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar este Cliente
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente {clientToDelete?.name || clientToDelete?.email || ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro del cliente será eliminado de la base de datos de tu tienda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Cliente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientsPage;
