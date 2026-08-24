import React, { useState } from 'react';
import TemplateLayout from '../components/TemplateLayout';
import { ShoppingCart, Search, Menu, User, MapPin } from 'lucide-react';

const MarketplaceHeader = ({ themeConfig, storeData, onOpenCart, currentUser, setCurrentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerBg = themeConfig?.headerColor || '#ffe600'; // Estilo mercadolibre por defecto
  const headerTextColor = themeConfig?.headerTextColor || '#333333';
  const logoUrl = themeConfig?.logoUrl || storeData?.logo_url;
  
  return (
    <header className="sticky top-0 z-50 shadow-sm relative" style={{ backgroundColor: headerBg, color: headerTextColor }}>
      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full shadow-lg transition-all duration-300 overflow-hidden z-0 ${isMobileMenuOpen ? 'max-h-96 border-b' : 'max-h-0'}`} style={{ backgroundColor: headerBg, color: headerTextColor, borderColor: 'rgba(0,0,0,0.1)' }}>
        <nav className="flex flex-col p-4 gap-4">
          <a href="#" className="hover:underline">Vender</a>
          <a href="#" className="hover:underline">Ayuda</a>
          <a href="#" className="hover:underline">Mis Compras</a>
        </nav>
      </div>

      {/* Top Banner Info */}
      <div className="hidden md:flex justify-end items-center px-4 py-1 text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
        <nav className="flex gap-4">
          <a href="#" className="hover:underline">Vender</a>
          <a href="#" className="hover:underline">Ayuda</a>
          <a href="#" className="hover:underline">Mis Compras</a>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <button className="md:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 text-center md:text-left">
            {logoUrl ? (
              <img src={logoUrl} alt={storeData?.name} className="h-10 object-contain inline-block" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                {storeData?.name || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda' ? themeConfig.sections.logoTitle : '') || themeConfig?.storeTitle || 'Marketplace'}
              </h1>
            )}
          </div>
          
          <button onClick={onOpenCart} className="md:hidden p-2 relative">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:flex-1 max-w-2xl relative">
          <input 
            type="text" 
            placeholder="Buscar productos, marcas y más..." 
            className="w-full py-3 px-4 rounded-full border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-500">
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6" style={{ color: headerTextColor }}>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
            <MapPin className="w-5 h-5 opacity-60" />
            <div className="text-sm">
              <span className="block text-xs opacity-60">Enviar a</span>
              <span className="block font-medium">Capital Federal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {setCurrentView && (
              <button 
                onClick={() => setCurrentView(currentUser ? 'portal' : 'login')} 
                className="flex items-center gap-2 hover:opacity-80 text-sm font-medium"
                title={currentUser ? "Mi Portal" : "Ingresar"}
              >
                <User className="w-5 h-5" />
                <span>{currentUser ? "Mi Portal" : "Ingresar"}</span>
              </button>
            )}
            <button onClick={onOpenCart} className="p-2 relative hover:bg-black/5 rounded-full transition">
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories Nav */}
      <div className="hidden md:block border-t border-black/5">
        <div className="container mx-auto px-4 py-2 flex gap-6 text-sm font-medium opacity-80" style={{ color: headerTextColor }}>
          {[
            { id: 'index.html', defaultTitle: 'Inicio' },
            { id: 'shop.html', defaultTitle: 'Ofertas' }
          ].filter(p => !themeConfig?.hiddenDefaultPages?.includes(p.id)).map(p => (
            <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(p.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: p.id } })); } }} className="hover:opacity-100">
              {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
            </a>
          ))}
          {(themeConfig?.customPages || []).map(page => (
            <a key={page.id} href={`#${page.id}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(page.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: page.id } })); } }} className="hover:opacity-100">
              {page.title}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

const MarketplaceFooter = ({ themeConfig, storeData }) => {
  const footerBg = themeConfig?.footerColor || '#ffffff';
  
  return (
    <footer style={{ backgroundColor: footerBg }} className="pt-16 pb-8 border-t border-gray-200 text-slate-600 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Acerca de</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Quiénes somos</a></li>
              <li><a href="#" className="hover:text-blue-600">Sustentabilidad</a></li>
              <li><a href="#" className="hover:text-blue-600">Trabaja con nosotros</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Ayuda</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Comprar</a></li>
              <li><a href="#" className="hover:text-blue-600">Vender</a></li>
              <li><a href="#" className="hover:text-blue-600">Resolución de problemas</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Redes sociales</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-600">Facebook</a></li>
              <li><a href="#" className="hover:text-blue-600">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Mi cuenta</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Ingresar</a></li>
              <li><a href="#" className="hover:text-blue-600">Resumen</a></li>
              <li><a href="#" className="hover:text-blue-600">Favoritos</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-70">
          <div className="flex gap-4 mb-4 md:mb-0">
            <a href="#" className="hover:underline">Trabaja con nosotros</a>
            <a href="#" className="hover:underline">Términos y condiciones</a>
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Ayuda</a>
          </div>
          <p>&copy; {new Date().getFullYear()} {storeData?.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default function MarketplaceTemplate(props) {
  React.useEffect(() => {
    document.body.style.backgroundColor = props.themeConfig?.backgroundColor || '#ebebeb';
    return () => { document.body.style.backgroundColor = ''; }
  }, [props.themeConfig]);

  return (
    <TemplateLayout 
      {...props} 
      HeaderComponent={MarketplaceHeader} 
      FooterComponent={MarketplaceFooter} 
    />
  );
}
