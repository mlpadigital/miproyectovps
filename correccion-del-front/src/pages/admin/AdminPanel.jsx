import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Shield, 
  Banknote, 
  Settings, 
  LogOut, 
  Search,
  Menu,
  X,
  Loader2,
  DollarSign,
  Calendar,
  Eye,
  Save,
  RefreshCw,
  LifeBuoy,
  Phone,
  Video,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// --- 1. Access Control (Full User Management) ---
const AccessControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userToDelete, setUserToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch stores to map them manually since FK might be missing
      const { data: storesData } = await supabase.from('stores').select('id, name, subdomain, created_at, owner_id');
      
      // Fetch plans
      const { data: plansData } = await supabase.from('membership_plans').select('id, name, price_usd');

      // Manual join
      const combinedUsers = (profilesData || []).map(profile => {
        const userStores = (storesData || []).filter(s => s.owner_id === profile.id);
        const userPlan = (plansData || []).find(p => p.id === profile.plan_id);
        
        return {
          ...profile,
          stores: userStores, // Array of stores
          membership_plans: userPlan || null
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: "Rol actualizado", description: `El usuario ahora es "${newRole}"` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el rol", variant: "destructive" });
    }
  };

  const toggleStatus = async (user, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      // 1. Direct Supabase update for immediate reliability
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', user.id);

      if (pErr) throw pErr;

      // 2. Also update subscription status if one exists
      await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('client_id', user.id);

      // 3. Optional notification to backend server
      fetch(`https://mlpadigital.com/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, planId: user.plan_id })
      }).catch(err => console.warn('Backend webhook notice skipped:', err.message));

      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast({ title: newStatus === 'suspended' ? "Usuario suspendido" : "Usuario y tienda activados" });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({ title: "Error", description: "No se pudo actualizar el estado: " + (error.message || error), variant: "destructive" });
    }
  };

  const forceActivateSubscription = async (user) => {
    try {
      // 1. Activate profile
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', user.id);

      if (pErr) throw pErr;

      // 2. Activate or create subscription
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('client_id', user.id)
        .limit(1);

      if (existingSub && existingSub.length > 0) {
        await supabase
          .from('subscriptions')
          .update({ status: 'active', plan_id: user.plan_id })
          .eq('client_id', user.id);
      } else if (user.plan_id) {
        await supabase
          .from('subscriptions')
          .insert({
            client_id: user.id,
            plan_id: user.plan_id,
            status: 'active',
            start_date: new Date().toISOString(),
            currency: 'USD'
          });
      }

      // 3. Optional backend notification
      fetch(`https://mlpadigital.com/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', planId: user.plan_id })
      }).catch(err => console.warn('Backend webhook notice skipped:', err.message));

      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
      toast({ title: "Suscripción Activada", description: "Se activó el usuario y su suscripción exitosamente." });
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast({ title: "Error", description: "No se pudo activar la suscripción: " + (error.message || error), variant: "destructive" });
    }
  };

  const deleteUser = async (userId) => {
    try {
      // Delete user's products and stores
      const { data: userStores } = await supabase.from('stores').select('id').eq('owner_id', userId);
      if (userStores && userStores.length > 0) {
        const storeIds = userStores.map(s => s.id);
        await supabase.from('products').delete().in('store_id', storeIds);
        await supabase.from('stores').delete().eq('owner_id', userId);
      }

      // Delete subscriptions
      await supabase.from('subscriptions').delete().eq('client_id', userId);

      // Delete profile
      const { error: profErr } = await supabase.from('profiles').delete().eq('id', userId);
      if (profErr) throw profErr;

      // Optional backend notice
      fetch(`https://mlpadigital.com/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.warn('Backend delete notice skipped:', err.message));
      
      setUsers(users.filter(u => u.id !== userId));
      setUserToDelete(null);
      toast({ title: "Usuario eliminado", description: "El usuario y su tienda fueron eliminados permanentemente." });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: "Error", description: "No se pudo eliminar el usuario: " + (error.message || error), variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(u => {
    const storeName = Array.isArray(u.stores) ? u.stores[0]?.name : u.stores?.name;
    const matchesSearch = 
      (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (storeName || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'admin' && u.role === 'admin') ||
      (filter === 'active' && u.status === 'active') ||
      (filter === 'suspended' && u.status === 'suspended');
    return matchesSearch && matchesFilter;
  });

  const statusBadge = (status) => {
    const map = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      suspended: 'bg-red-500/20 text-red-300 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return map[status] || 'bg-slate-700 text-slate-300';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Control de Acceso</h2>
          <p className="text-gray-400 mt-1">Gestión completa de usuarios, roles, planes y pagos.</p>
        </div>
        <Button variant="outline" onClick={fetchUsers} className="border-slate-700 text-white hover:bg-slate-800 shrink-0">
          <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: users.length, color: 'text-violet-400' },
          { label: 'Activos', value: users.filter(u => u.status === 'active').length, color: 'text-green-400' },
          { label: 'Suspendidos', value: users.filter(u => u.status === 'suspended').length, color: 'text-red-400' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-yellow-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o tienda..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400 min-w-[900px]">
            <thead className="bg-slate-900 text-gray-200 uppercase text-xs font-medium">
              <tr>
                <th className="px-4 py-4">Usuario</th>
                <th className="px-4 py-4">Plan / Suscripción</th>
                <th className="px-4 py-4">Tienda</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Último Pago</th>
                <th className="px-4 py-4">Registro</th>
                <th className="px-4 py-4">Rol</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No se encontraron usuarios.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-sm shrink-0">
                        {user.nombre ? user.nombre.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{user.nombre || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email || user.id}</p>
                        {user.phone && <p className="text-xs text-gray-600">{user.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {user.membership_plans ? (
                      <div>
                        <p className="font-medium text-violet-300">{user.membership_plans.name}</p>
                        <p className="text-xs text-gray-500">${user.membership_plans.price_usd}/mes USD</p>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">Sin plan</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {user.stores ? (
                      <div>
                        <div className="font-medium text-white">
                          {Array.isArray(user.stores) ? user.stores[0]?.name : user.stores?.name || 'Sin tienda'}
                        </div>
                        <div className="text-gray-400">
                          {Array.isArray(user.stores) ? user.stores[0]?.subdomain : user.stores?.subdomain ? `${(Array.isArray(user.stores) ? user.stores[0]?.subdomain : user.stores?.subdomain)}.masterstore.com` : '-'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">Sin tienda</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge(user.status)}`}>
                      {user.status || 'pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-white">{formatDate(user.last_payment_date)}</p>
                      {user.next_payment_date && (
                        <p className="text-xs text-gray-500">Próximo: {formatDate(user.next_payment_date)}</p>
                      )}
                      {user.payment_method && (
                        <p className="text-xs text-gray-600">{user.payment_method}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-white">{formatDate(user.created_at)}</p>
                    {user.country && <p className="text-xs text-gray-500">{user.country}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(user)}
                        className="text-gray-400 hover:text-white h-8 px-2"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => toggleStatus(user, user.status)}
                        className={`h-8 text-xs ${user.status !== 'active' ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'}`}
                      >
                        {user.status !== 'active' ? 'Activar' : 'Suspender'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => forceActivateSubscription(user)}
                        className="h-8 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                        title="Crear o forzar suscripción activa"
                      >
                        Forzar Suscripción
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => toggleRole(user.id, user.role)}
                        className={`h-8 text-xs ${user.role === 'admin' ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : 'bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30'}`}
                      >
                        {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                        className="h-8 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                        title="Eliminar usuario y tienda"
                      >
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

      {userToDelete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setUserToDelete(null)}>
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-red-500">¿Eliminar Usuario Definitivamente?</h3>
            <p className="text-gray-300">
              Estás a punto de eliminar a <strong>{userToDelete.nombre || userToDelete.email}</strong> y toda su tienda. Esta acción <strong className="text-red-400">NO SE PUEDE DESHACER</strong>.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setUserToDelete(null)} className="border-slate-700 text-white hover:bg-slate-800">
                Cancelar
              </Button>
              <Button onClick={() => deleteUser(userToDelete.id)} className="bg-red-600 hover:bg-red-700 text-white border-0">
                Sí, Eliminar Permanentemente
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Detalle de Usuario</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-2xl">
                {selectedUser.nombre ? selectedUser.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{selectedUser.nombre || 'Sin nombre'}</p>
                <p className="text-gray-400">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'ID', value: selectedUser.id?.slice(0, 8) + '...' },
                { label: 'Rol', value: selectedUser.role || 'user' },
                { label: 'Estado', value: selectedUser.status || 'pendiente' },
                { label: 'Plan', value: selectedUser.membership_plans?.name || 'Sin plan' },
                { label: 'Tienda', value: selectedUser.stores?.name || 'Sin tienda' },
                { label: 'Subdominio', value: selectedUser.stores?.subdomain ? `${selectedUser.stores.subdomain}.mlpadigital.com` : '—' },
                { label: 'Teléfono', value: selectedUser.phone || '—' },
                { label: 'País', value: selectedUser.country || '—' },
                { label: 'Dirección', value: selectedUser.address || '—' },
                { label: 'Último Pago', value: formatDate(selectedUser.last_payment_date) },
                { label: 'Próximo Pago', value: formatDate(selectedUser.next_payment_date) },
                { label: 'Método de Pago', value: selectedUser.payment_method || '—' },
                { label: 'Registro', value: formatDate(selectedUser.created_at) },
                { label: 'Precio/mes USD', value: selectedUser.membership_plans ? `$${selectedUser.membership_plans.price_usd}` : '—' },
              ].map(row => (
                <div key={row.label} className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{row.label}</p>
                  <p className="text-white font-medium mt-0.5 truncate">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                onClick={() => { toggleStatus(selectedUser, selectedUser.status); setSelectedUser(null); }}
              >
                {selectedUser.status !== 'active' ? 'Activar' : 'Suspender'}
              </Button>
              <Button
                className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                onClick={() => { forceActivateSubscription(selectedUser); setSelectedUser(null); }}
              >
                Forzar Suscripción
              </Button>
              <Button
                className="flex-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30"
                onClick={() => { toggleRole(selectedUser.id, selectedUser.role); setSelectedUser(null); }}
              >
                {selectedUser.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// --- 2. View Stores (Monitoring Only) ---
const ViewStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
      setStores(data || []);
      setLoading(false);
    };
    fetchStores();
  }, []);

  const filteredStores = stores.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.subdomain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Monitoreo de Tiendas</h2>
      
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o subdominio..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-slate-900 text-gray-200 uppercase text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">URL</th>
                <th className="px-6 py-4">ID Propietario</th>
                <th className="px-6 py-4">Fecha Creación</th>
                <th className="px-6 py-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                 <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : filteredStores.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center">No se encontraron tiendas.</td></tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-medium text-white">{store.name}</td>
                    <td className="px-6 py-4 text-blue-400">{store.subdomain}.mlpadigital.com</td>
                    <td className="px-6 py-4 font-mono text-xs">{store.owner_id}</td>
                    <td className="px-6 py-4">{new Date(store.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4 mr-2" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 3. Modify Store Prices (Pricing Plans) ---
const ModifyPrices = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await supabase.from('membership_plans').select('*').order('price_usd', { ascending: true });
      setPlans(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('membership_plans')
        .update({ 
          price_usd: editingPlan.price_usd,
          price_ars: editingPlan.price_ars,
          price_eur: editingPlan.price_eur
        })
        .eq('id', editingPlan.id);

      if (error) throw error;
      
      setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
      setEditingPlan(null);
      toast({ title: "Precios actualizados", description: "Los cambios se han guardado correctamente." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron actualizar los precios.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Gestión de Precios</h2>
      <p className="text-gray-400">Edita los precios de suscripción para las tiendas en la plataforma.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <Dialog open={editingPlan?.id === plan.id} onOpenChange={(open) => !open && setEditingPlan(null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan)} className="border-slate-600 hover:bg-slate-700">
                    Editar Precio
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Editar Precios - Plan {plan.name}</DialogTitle>
                  </DialogHeader>
                  {editingPlan && (
                    <form onSubmit={handleUpdatePrice} className="space-y-4 py-4">
                      <div>
                        <Label>Precio USD</Label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={editingPlan.price_usd}
                          onChange={e => setEditingPlan({...editingPlan, price_usd: e.target.value})}
                          className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <Label>Precio ARS</Label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={editingPlan.price_ars}
                          onChange={e => setEditingPlan({...editingPlan, price_ars: e.target.value})}
                          className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <Label>Precio EUR</Label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={editingPlan.price_eur}
                          onChange={e => setEditingPlan({...editingPlan, price_eur: e.target.value})}
                          className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                        Guardar Cambios
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                <span className="text-gray-400">USD</span>
                <span className="font-mono font-bold text-white">${plan.price_usd}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                <span className="text-gray-400">ARS</span>
                <span className="font-mono font-bold text-white">${plan.price_ars}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                <span className="text-gray-400">EUR</span>
                <span className="font-mono font-bold text-white">€{plan.price_eur}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 4. View Payments (Transaction History) ---
const ViewPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      // Fetching recent orders as a proxy for payment/transaction flow
      const { data } = await supabase
        .from('orders')
        .select(`
          id, 
          total, 
          created_at, 
          status,
          stores (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Historial de Pagos</h2>
      <p className="text-gray-400">Últimas transacciones procesadas en la plataforma.</p>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-slate-900 text-gray-200 uppercase text-xs font-medium">
              <tr>
                <th className="px-6 py-4">ID Transacción</th>
                <th className="px-6 py-4">Origen (Tienda)</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center">No hay transacciones registradas.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-white">{order.stores?.name || 'Desconocido'}</td>
                    <td className="px-6 py-4 font-bold text-green-400">${order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        order.status === 'paid' || order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 5. Settings (System Config) ---
const SettingsView = () => {
  const { user } = useSupabaseAuth();
  
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', number: '' });
  const [newVideo, setNewVideo] = useState({ title: '', url: '' });

  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', content: '' });

  useEffect(() => {
    fetchSupportSettings();
    fetchTestimonials();
  }, []);

  const fetchSupportSettings = async () => {
    try {
      const res = await fetch('https://mlpadigital.com/api/support-settings');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setContacts(data.whatsapp_contacts || []);
        setVideos(data.tutorial_videos || []);
        localStorage.setItem('mlpa_support_settings', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('mlpa_support_settings');
        if (cached) {
          const data = JSON.parse(cached);
          setContacts(data.whatsapp_contacts || []);
          setVideos(data.tutorial_videos || []);
        }
      }
    } catch (err) {
      console.warn('Error fetching support settings:', err);
      const cached = localStorage.getItem('mlpa_support_settings');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setContacts(data.whatsapp_contacts || []);
          setVideos(data.tutorial_videos || []);
        } catch (e) {}
      }
    }
  };

  const saveSupportSettings = async (newContacts, newVideos) => {
    setLoading(true);
    const payload = { whatsapp_contacts: newContacts, tutorial_videos: newVideos };
    localStorage.setItem('mlpa_support_settings', JSON.stringify(payload));
    try {
      const res = await fetch('https://mlpadigital.com/api/support-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Configuración guardada correctamente.' });
      } else {
        toast({ title: 'Guardado local', description: 'Guardado localmente en el panel.' });
      }
    } catch (err) {
      toast({ title: 'Guardado local', description: 'Guardado localmente en el panel.' });
    }
    setLoading(false);
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('https://mlpadigital.com/api/testimonials');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setTestimonials(data || []);
        localStorage.setItem('mlpa_testimonials', JSON.stringify(data || []));
      } else {
        const cached = localStorage.getItem('mlpa_testimonials');
        if (cached) {
          setTestimonials(JSON.parse(cached));
        }
      }
    } catch (err) {
      console.warn('Error fetching testimonials:', err);
      const cached = localStorage.getItem('mlpa_testimonials');
      if (cached) {
        try { setTestimonials(JSON.parse(cached)); } catch (e) {}
      }
    }
  };

  const saveTestimonials = async (updatedTestimonials) => {
    setLoading(true);
    localStorage.setItem('mlpa_testimonials', JSON.stringify(updatedTestimonials));
    try {
      const res = await fetch('https://mlpadigital.com/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonials: updatedTestimonials })
      });
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Testimonios guardados correctamente.' });
      } else {
        toast({ title: 'Guardado local', description: 'Testimonios guardados localmente.' });
      }
    } catch (err) {
      toast({ title: 'Guardado local', description: 'Testimonios guardados localmente.' });
    }
    setLoading(false);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.number) return;
    const updated = [...contacts, newContact];
    setContacts(updated);
    setNewContact({ name: '', number: '' });
    saveSupportSettings(updated, videos);
  };

  const handleRemoveContact = (idx) => {
    const updated = contacts.filter((_, i) => i !== idx);
    setContacts(updated);
    saveSupportSettings(updated, videos);
  };

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.url) return;
    const updated = [...videos, newVideo];
    setVideos(updated);
    setNewVideo({ title: '', url: '' });
    saveSupportSettings(contacts, updated);
  };

  const handleRemoveVideo = (idx) => {
    const updated = videos.filter((_, i) => i !== idx);
    setVideos(updated);
    saveSupportSettings(contacts, updated);
  };

  const handleAddTestimonial = () => {
    if (!newTestimonial.name || !newTestimonial.content) return;
    const updated = [...testimonials, newTestimonial];
    setTestimonials(updated);
    setNewTestimonial({ name: '', role: '', content: '' });
    saveTestimonials(updated);
  };

  const handleRemoveTestimonial = (idx) => {
    const updated = testimonials.filter((_, i) => i !== idx);
    setTestimonials(updated);
    saveTestimonials(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Configuración del Sistema</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admin Profile */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
             <Shield className="w-5 h-5 text-violet-500" /> Perfil de Administrador
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Email del Administrador</Label>
              <div className="mt-1 p-3 bg-slate-900 rounded-lg text-white font-mono text-sm">
                {user?.email}
              </div>
            </div>
            <div>
              <Label className="text-gray-400">ID de Sistema</Label>
              <div className="mt-1 p-3 bg-slate-900 rounded-lg text-white font-mono text-sm">
                {user?.id}
              </div>
            </div>
            <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white mt-2">
              Cambiar Contraseña
            </Button>
          </div>
        </div>

        {/* Platform Settings Placeholder */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
             <Settings className="w-5 h-5 text-violet-500" /> Parámetros Generales
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Nombre de la Plataforma</Label>
              <input type="text" disabled value="MlpaDigital Enterprise" className="w-full mt-1 bg-slate-900/50 border border-slate-700 text-gray-500 rounded-lg px-3 py-2 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-gray-400">Moneda Base</Label>
              <select className="w-full mt-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2">
                <option>USD - Dólar Estadounidense</option>
                <option>EUR - Euro</option>
                <option>ARS - Peso Argentino</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300">Modo Mantenimiento</span>
              <div className="w-11 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Settings */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-emerald-500" /> Configuración de Ayuda y Soporte
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Contacts */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-400" /> Números de WhatsApp
            </h4>
            <div className="space-y-4 mb-6">
              {contacts.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <div>
                    <p className="text-white font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-400 font-mono">{contact.number}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveContact(idx)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
              <Input 
                placeholder="Nombre (Ej: Soporte Técnico)" 
                value={newContact.name}
                onChange={e => setNewContact({...newContact, name: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Input 
                placeholder="Número (Ej: +5491123456789)" 
                value={newContact.number}
                onChange={e => setNewContact({...newContact, number: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Button onClick={handleAddContact} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Agregar Número
              </Button>
            </div>
          </div>

          {/* Tutorial Videos */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-400" /> Videos Tutoriales
            </h4>
            <div className="space-y-4 mb-6">
              {videos.map((video, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <div className="overflow-hidden">
                    <p className="text-white font-medium truncate">{video.title}</p>
                    <a href={video.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:underline truncate block">Ver Link</a>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveVideo(idx)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
              <Input 
                placeholder="Título del Video" 
                value={newVideo.title}
                onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Input 
                placeholder="URL (YouTube o Vimeo)" 
                value={newVideo.url}
                onChange={e => setNewVideo({...newVideo, url: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Button onClick={handleAddVideo} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Agregar Video
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Settings */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Menu className="w-6 h-6 text-orange-500" /> Gestión de Testimonios (Landing Page)
        </h3>
        
        <div className="space-y-4 mb-6">
          {testimonials.map((testim, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-900 p-4 rounded-lg border border-slate-700">
              <div className="overflow-hidden mr-4">
                <p className="text-white font-bold">{testim.name} <span className="text-sm font-normal text-slate-400">({testim.role})</span></p>
                <p className="text-sm text-slate-300 italic mt-1 line-clamp-2">"{testim.content}"</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveTestimonial(idx)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {testimonials.length === 0 && (
            <p className="text-slate-500 text-sm italic">No hay testimonios configurados. Se mostrarán los de prueba en la página.</p>
          )}
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3 max-w-xl">
          <Input 
            placeholder="Nombre del Cliente (Ej: María Gómez)" 
            value={newTestimonial.name}
            onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})}
            className="bg-slate-800 border-slate-600 text-white"
          />
          <Input 
            placeholder="Rol o Tienda (Ej: Dueña de Moda Express)" 
            value={newTestimonial.role}
            onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})}
            className="bg-slate-800 border-slate-600 text-white"
          />
          <textarea 
            placeholder="Comentario o Testimonio..." 
            value={newTestimonial.content}
            onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}
            className="w-full h-24 bg-slate-800 border-slate-600 text-white rounded-md p-3 text-sm focus:outline-none focus:border-slate-400"
          />
          <Button onClick={handleAddTestimonial} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            Agregar Testimonio
          </Button>
        </div>
      </div>
    </div>
  );
};


// --- Main Layout & Entry Component ---
const AdminPanel = () => {
  const { user, signOut } = useSupabaseAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/access', label: 'Control de Acceso', icon: <Shield className="w-5 h-5" /> },
    { path: '/admin/stores', label: 'Ver Tiendas', icon: <Store className="w-5 h-5" /> },
    { path: '/admin/prices', label: 'Modificar Precios', icon: <DollarSign className="w-5 h-5" /> },
    { path: '/admin/payments', label: 'Ver Pagos', icon: <Banknote className="w-5 h-5" /> },
    { path: '/admin/settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  // Simple Dashboard Overview for the index route
  const DashboardIndex = () => {
    const [counts, setCounts] = useState({ users: 0, stores: 0, orders: 0 });

    useEffect(() => {
      const getStats = async () => {
        const { count: usersC } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: storesC } = await supabase.from('stores').select('*', { count: 'exact', head: true });
        const { count: ordersC } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        setCounts({ users: usersC || 0, stores: storesC || 0, orders: ordersC || 0 });
      };
      getStats();
    }, []);

    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white">Panel de Control</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-6 rounded-xl">
            <h3 className="text-violet-300 font-medium mb-2">Usuarios Totales</h3>
            <p className="text-4xl font-bold text-white">{counts.users}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 p-6 rounded-xl">
            <h3 className="text-amber-300 font-medium mb-2">Tiendas Activas</h3>
            <p className="text-4xl font-bold text-white">{counts.stores}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30 p-6 rounded-xl">
            <h3 className="text-emerald-300 font-medium mb-2">Transacciones</h3>
            <p className="text-4xl font-bold text-white">{counts.orders}</p>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-gray-400">Seleccione una opción del menú lateral para comenzar a gestionar la plataforma.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          {isSidebarOpen ? (
            <span className="font-bold text-xl text-white tracking-tight">Mlpa<span className="text-amber-400">Control</span></span>
          ) : (
             <span className="font-bold text-xl text-amber-400 mx-auto">M</span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' 
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`${!isSidebarOpen ? 'mx-auto' : ''}`}>{item.icon}</div>
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white">
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-4">
             <div className="text-sm text-gray-400 mr-2">Hola, {user?.email}</div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-sm">
               {user?.email?.charAt(0).toUpperCase() || 'A'}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8 bg-slate-950">
          <Routes>
            <Route index element={<DashboardIndex />} />
            <Route path="access" element={<AccessControl />} />
            <Route path="stores" element={<ViewStores />} />
            <Route path="prices" element={<ModifyPrices />} />
            <Route path="payments" element={<ViewPayments />} />
            <Route path="settings" element={<SettingsView />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;