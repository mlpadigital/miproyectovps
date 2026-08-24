import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, User, Store, ExternalLink } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import AIAssistantWidget from '@/components/dashboard/AIAssistantWidget';

const SharedLayout = ({ title: defaultTitle = "Panel", planName: propPlanName, themeColor: propThemeColor }) => {
  const { signOut, user, profile } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [store, setStore] = useState(null);
  const [currentTitle, setCurrentTitle] = useState(defaultTitle);
  const [hasActiveSub, setHasActiveSub] = useState(true);
  const [isCheckingSub, setIsCheckingSub] = useState(true);

  // Derive defaults if not provided props
  const [planName, setPlanName] = useState(propPlanName || '');
  const [themeColor, setThemeColor] = useState(propThemeColor || 'violet');

  // Map routes to titles for header display
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') setCurrentTitle('Resumen');
    else if (path.includes('/products')) setCurrentTitle('Productos');
    else if (path.includes('/inventory')) setCurrentTitle('Inventario');
    else if (path.includes('/orders')) setCurrentTitle('Órdenes');
    else if (path.includes('/clients')) setCurrentTitle('Clientes');
    else if (path.includes('/discounts')) setCurrentTitle('Descuentos');
    else if (path.includes('/analytics')) setCurrentTitle('Análisis');
    else if (path.includes('/notifications')) setCurrentTitle('Notificaciones');
    else if (path.includes('/settings')) setCurrentTitle('Configuración');
    else if (path.includes('/billing')) setCurrentTitle('Suscripción');
    else if (path.includes('/appearance') || path.includes('/design')) setCurrentTitle('Apariencia');
    else if (path.includes('/ai-generator')) setCurrentTitle('Generador IA');
    else setCurrentTitle(defaultTitle);
  }, [location, defaultTitle]);

  useEffect(() => {
    if (!propPlanName && profile?.membership_plans?.name) {
      setPlanName(profile.membership_plans.name);
    }

    if (!propThemeColor && profile?.membership_plans?.name) {
      const name = profile.membership_plans.name.toLowerCase();
      if (name.includes('emprendedor') || name.includes('entrepreneur')) setThemeColor('amber');
      else if (name.includes('mayorista') || name.includes('wholesale')) setThemeColor('emerald');
      else setThemeColor('slate');
    }
  }, [profile, propPlanName, propThemeColor]);

  // Fetch store data
  useEffect(() => {
    const fetchStore = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle(); // maybeSingle evita el error PGRST116 si no hay resultados

        if (error) {
          console.error('Error fetching store:', error);
        }
        if (data) {
          setStore(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching store:', err);
      }
    };

    fetchStore();
  }, [user]);

  // Security Check: Enforce active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (!data) {
          setHasActiveSub(false);
        } else {
          setHasActiveSub(true);
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      } finally {
        setIsCheckingSub(false);
      }
    };
    checkSubscription();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isCheckingSub) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!hasActiveSub && !location.pathname.includes('/dashboard/billing')) {
    return <Navigate to="/dashboard/billing" replace />;
  }

  return (
    // Explicit text-slate-900 to override global body text-white
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Rendered exactly once as a fixed element */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        planName={planName || 'Básico'}
        themeColor={themeColor}
        store={store}
        userProfile={profile}
        currentUser={user}
        onLogout={handleLogout}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative transition-all duration-300">

        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 lg:hidden z-30 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-700" />
            </Button>
            <span className="font-bold text-lg text-slate-900 truncate max-w-[200px]">{store?.name || currentTitle}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-6">
            {store && store.subdomain && (
              <a
                href={`http://${store.subdomain}.localhost:3000`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-full border border-indigo-100 transition-colors group cursor-pointer"
              >
                <Store className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700">{store.subdomain}.mlpadigital.com</span>
                <ExternalLink className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
              </a>
            )}

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{profile?.nombre || user?.email?.split('@')[0] || 'Usuario'}</p>
                <p className="text-xs text-slate-500 leading-none mt-1.5">{profile?.role === 'admin' ? 'Administrador' : planName || 'Plan Básico'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center border border-slate-200 shadow-sm">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 scroll-smooth relative">
          <div className="max-w-7xl mx-auto pb-10">
            {/* Pasamos store, userProfile y user a todos los componentes hijos */}
            <Outlet context={{ store, userProfile: profile, user }} />
          </div>
        </main>
      </div>

      {/* 🤖 Asistente Virtual Flotante (Groq + Contexto de Tienda) */}
      <AIAssistantWidget
        storeContext={{
          storeName: store?.name || 'Mi Tienda MlpaDigital',
          planName: planName || 'Emprendedor',
          ownerName: profile?.nombre || 'Emprendedor'
        }}
      />

      <Toaster />
    </div>
  );
};

export default SharedLayout;