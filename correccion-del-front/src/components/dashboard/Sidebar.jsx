import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  X,
  CreditCard,
  Tags,
  Boxes,
  BarChart3,
  Mail,
  Store,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Palette,
  Shield,
  Wand2,
  Sparkles,
  Bot,
  Scissors,
  DownloadCloud,
  Briefcase,
  Globe,
  MonitorSmartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Sidebar = ({ isOpen, setIsOpen, onClose, planName, store, userProfile, currentUser, onLogout }) => {
  const { pathname } = useLocation();
  const [openMenus, setOpenMenus] = useState({ 'Productos': false });

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isAdmin = userProfile?.role === 'admin' || currentUser?.email === 'martinm97971@gmail.com';

  const handleClose = () => {
    if (typeof setIsOpen === 'function') {
      setIsOpen(false);
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  const menuSections = [
    {
      title: "Gestión",
      items: [
        { title: "Resumen", href: "/dashboard", icon: LayoutDashboard, exact: true },
        { 
          title: "Productos", 
          icon: Package, 
          subItems: [
            { title: "Todos los productos", href: "/dashboard/products", exact: true },
            { title: "Aumento masivo", href: "/dashboard/products/mass-increase", exact: true }
          ]
        },
        { title: "Archivos Digitales", href: "/dashboard/digital-products", icon: DownloadCloud },
        { title: "Inventario", href: "/dashboard/inventory", icon: Boxes },
        { title: "Órdenes", href: "/dashboard/orders", icon: ShoppingBag },
        { title: "Registro de Clientes", href: "/dashboard/clients", icon: Users },
        { title: "Descuentos", href: "/dashboard/discounts", icon: Tags },
        { title: "Buscador de Insumo", href: "/dashboard/providers-search", icon: Briefcase },
      ]
    },
    {
      title: "🤖 Herramientas IA",
      items: [
        { title: "Generador de IA", href: "/dashboard/ai-generator", icon: Wand2 },
        { title: "Asistente de Copys", href: "/dashboard/ai-copywriter", icon: Sparkles },
        { title: "Quita Fondos", href: "/dashboard/ai-background-remover", icon: Scissors },
      ]
    },
    {
      title: "Marketing & Análisis",
      items: [
        { title: "SEO & Metadatos", href: "/dashboard/seo-settings", icon: Globe },
        { title: "Análisis", href: "/dashboard/analytics", icon: BarChart3 },
        { title: "Email Marketing", href: "/dashboard/notifications", icon: Mail },
      ]
    },
    {
      title: "Configuración",
      items: [
        { title: "Mi Tienda", href: "/dashboard/settings", icon: Store },
        { title: "Diseño de Tienda", href: "/dashboard/templates", icon: MonitorSmartphone },
        { title: "Suscripción", href: "/dashboard/billing", icon: CreditCard },
      ]
    },
    ...(isAdmin ? [{
      title: "⚡ Administración",
      items: [
        { title: "Panel General Admin", href: "/admin", icon: Shield, exact: true },
        { title: "Herramientas Admin IA", href: "/admin/ai-tools", icon: Bot },
      ]
    }] : [])
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed lg:static top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* 1. Store Header Section */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="text-xl font-bold text-slate-900">Menú</span>
            <button onClick={handleClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-white/40 blur-2xl transition-all duration-500 group-hover:bg-indigo-200/20" />

            <div className="flex items-start gap-3 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                {store?.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Store className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 truncate leading-tight">
                  {store?.name || "Mi Tienda"}
                </h2>
                {store?.subdomain && (
                  <a
                    href={`https://${store.subdomain}.mlpadigital.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 mt-0.5 truncate"
                  >
                    {store.subdomain}.mlpadigital.com
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {!store && <span className="text-xs text-slate-500">Configura tu tienda</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {menuSections.map((section, idx) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              {section.items.map((item) => {
                if (item.subItems) {
                  const isAnySubActive = item.subItems.some(sub => 
                    sub.exact ? pathname === sub.href || pathname === sub.href + '/' : pathname.startsWith(sub.href)
                  );
                  const isOpen = openMenus[item.title] || isAnySubActive;

                  return (
                    <div key={item.title} className="space-y-1">
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className={cn(
                          "w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isAnySubActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-200",
                            isAnySubActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                          )} />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
                      </button>
                      
                      {isOpen && (
                        <div className="pl-10 space-y-1 mt-1">
                          {item.subItems.map(subItem => {
                            const isSubActive = subItem.exact ? pathname === subItem.href || pathname === subItem.href + '/' : pathname.startsWith(subItem.href);
                            return (
                              <NavLink
                                key={subItem.href}
                                to={subItem.href}
                                onClick={handleClose}
                                className={cn(
                                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                  isSubActive
                                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                              >
                                {subItem.title}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = item.exact
                  ? pathname === item.href || pathname === item.href + '/'
                  : pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={handleClose}
                    className={({ isActive: linkActive }) => cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      (item.exact ? isActive : linkActive)
                        ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                    )}
                  >
                    {({ isActive: linkActive }) => {
                      const active = item.exact ? isActive : linkActive;
                      return (
                        <>
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                          )}
                          <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                            active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                          )} />
                          <span className="flex-1">{item.title}</span>
                        </>
                      );
                    }}
                  </NavLink>
                );
              })}
              {idx < menuSections.length - 1 && <Separator className="my-4 bg-slate-100" />}
            </div>
          ))}

          {/* Support Link */}
          <div className="mt-4">
            <NavLink
              to="/dashboard/support"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <HelpCircle className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span>Ayuda y Soporte</span>
            </NavLink>
          </div>
        </div>

        {/* 3. Footer / User Profile & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {userProfile?.nombre ? userProfile.nombre.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userProfile?.nombre || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.email}
              </p>
            </div>
            {planName && (
              <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wide truncate max-w-[60px]">
                {planName}
              </div>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-transparent transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro que deseas salir?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tendrás que volver a iniciar sesión para acceder a tu panel de control.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white border-none">
                  Cerrar Sesión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;