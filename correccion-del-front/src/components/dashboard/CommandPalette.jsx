
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, Settings, Package, 
  ShoppingBag, Users, BarChart3, Mail, Sparkles, 
  Tag, Palette, CreditCard, ArrowRight, BoxIcon, DownloadCloud,
  Megaphone, Store, Command, HelpCircle, TrendingUp, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const actions = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, category: 'Navegación', path: '/dashboard' },
    { id: 'products', title: 'Productos', icon: Package, category: 'Negocio', path: '/dashboard/products' },
    { id: 'digital-products', title: 'Archivos Digitales', icon: DownloadCloud, category: 'Negocio', path: '/dashboard/digital-products' },
    { id: 'orders', title: 'Órdenes', icon: ShoppingBag, category: 'Negocio', path: '/dashboard/orders' },
    { id: 'inventory', title: 'Inventario', icon: BoxIcon, category: 'Negocio', path: '/dashboard/inventory' },
    { id: 'analytics', title: 'Análisis', icon: BarChart3, category: 'Análisis', path: '/dashboard/analytics' },
    { id: 'marketing', title: 'Marketing AI', icon: Sparkles, category: 'Marketing', path: '/dashboard/marketing' },
    { id: 'discounts', title: 'Descuentos', icon: Tag, category: 'Marketing', path: '/dashboard/discounts' },
    { id: 'appearance', title: 'Apariencia', icon: Sparkles, category: 'Tienda', path: '/dashboard/appearance' },
    { id: 'seo', title: 'SEO Settings', icon: TrendingUp, category: 'Tienda', path: '/dashboard/seo-settings' },
    { id: 'billing', title: 'Suscripción', icon: CreditCard, category: 'Ajustes', path: '/dashboard/billing' },
    { id: 'settings', title: 'Configuración General', icon: Settings, category: 'Ajustes', path: '/dashboard/settings' },
  ];

  const filteredActions = actions.filter(action => 
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = useCallback((action) => {
    if (action.path) {
      navigate(action.path);
      setIsOpen(false);
    }
  }, [navigate]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto ring-1 ring-slate-900/5"
          >
            <div className="flex items-center px-4 py-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Busca páginas, acciones o contenido..."
                className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 text-lg placeholder:text-slate-400"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <Command className="w-3 h-3" /> K
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
              {filteredActions.length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(
                    filteredActions.reduce((acc, action) => {
                      if (!acc[action.category]) acc[action.category] = [];
                      acc[action.category].push(action);
                      return acc;
                    }, {})
                  ).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {items.map((action) => {
                        const globalIndex = filteredActions.indexOf(action);
                        const isSelected = selectedIndex === globalIndex;
                        return (
                          <div
                            key={action.id}
                            className={cn(
                              "mx-2 px-3 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-150",
                              isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-slate-50 text-slate-600"
                            )}
                            onClick={() => handleSelect(action)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                              isSelected ? "bg-white/20" : "bg-slate-100"
                            )}>
                              <action.icon className="w-5 h-5" />
                            </div>
                            <span className="flex-1 font-medium">{action.title}</span>
                            {isSelected && (
                              <span className="text-xs opacity-80 flex items-center gap-1">
                                Ir <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-8 py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No encontramos resultados para "{query}"</p>
                  <p className="text-slate-400 text-sm mt-1">Prueba buscando otra palabra clave</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <kbd className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-500 font-mono">
                  <ArrowUp className="w-2.5 h-2.5" />
                  <ArrowDown className="w-2.5 h-2.5" /> Navegar
                </kbd>
                <kbd className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-500 font-mono">
                  Enter Seleccionar
                </kbd>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Presiona ESC para cerrar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const ArrowUp = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const ArrowDown = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default CommandPalette;
