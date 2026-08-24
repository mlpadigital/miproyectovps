import React, { useState } from 'react';
import TemplateLayout from '../components/TemplateLayout';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm';

const MinimalHeader = ({ themeConfig, storeData, onOpenCart, currentUser, setCurrentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerBg = themeConfig?.headerColor || '#ffffff';
  const headerTextColor = themeConfig?.headerTextColor || '#000000';
  const logoUrl = themeConfig?.logoUrl || storeData?.logo_url;
  
  const navLinks = [
    { id: 'index.html', defaultTitle: 'Inicio' },
    { id: 'shop.html', defaultTitle: 'Catálogo' },
    { id: 'contact.html', defaultTitle: 'Contacto' }
  ].filter(p => !themeConfig?.hiddenDefaultPages?.includes(p.id)).concat(
    (themeConfig?.customPages || []).map(page => ({ id: page.id, defaultTitle: page.title }))
  );

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (themeConfig?.isOnePage) {
      const el = document.getElementById(id.split('.')[0]);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: id } }));
    }
  };

  const storeName = themeConfig?.storeTitle || storeData?.name || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda' ? themeConfig.sections.logoTitle : '') || 'Minimal';
  const logoSubtitle = (themeConfig?.storeSubtitle && themeConfig.storeSubtitle.toLowerCase() !== 'la mejor' ? themeConfig.storeSubtitle : '') 
    || (themeConfig?.sections?.logoSubtitle && themeConfig.sections.logoSubtitle.toLowerCase() !== 'la mejor' ? themeConfig.sections.logoSubtitle : '');

  const hasCustomTitleNextToLogo = themeConfig?.storeTitle || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda');

  return (
    <header className="sticky top-0 z-50 shadow-sm transition-colors duration-300 relative" style={{ backgroundColor: headerBg, color: headerTextColor }}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 z-20 relative">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 flex justify-center md:justify-start items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-12 object-contain" />
          ) : (
            <h1 
              className="font-bold tracking-tight" 
              style={{ 
                fontSize: themeConfig?.storeTitleSize ? `${themeConfig.storeTitleSize}px` : '24px',
                color: themeConfig?.storeTitleColor || 'inherit'
              }}
            >
              {storeName}
            </h1>
          )}
          {(logoSubtitle || (logoUrl && hasCustomTitleNextToLogo)) && (
            <div className="flex flex-col justify-center text-left">
              {logoUrl && hasCustomTitleNextToLogo && (
                <span className="font-bold leading-tight" style={{ 
                  fontSize: themeConfig?.storeTitleSize ? `${themeConfig.storeTitleSize}px` : '18px',
                  color: themeConfig?.storeTitleColor || 'inherit'
                }}>
                  {hasCustomTitleNextToLogo}
                </span>
              )}
              {logoSubtitle && (
                <span className="opacity-80 leading-tight" style={{ 
                  fontSize: themeConfig?.storeSubtitleSize ? `${themeConfig.storeSubtitleSize}px` : '14px',
                  color: themeConfig?.storeSubtitleColor || 'inherit'
                }}>
                  {logoSubtitle}
                </span>
              )}
            </div>
          )}
        </div>
        
        <nav className="hidden md:flex gap-8 mx-8">
          {navLinks.map(p => (
            <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => handleNavClick(e, p.id)} className="text-sm uppercase tracking-widest font-medium hover:opacity-70 transition">
              {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
            </a>
          ))}
        </nav>
        
        <div className="flex justify-end gap-2">
          {setCurrentView && (
            <button 
              onClick={() => setCurrentView(currentUser ? 'portal' : 'login')} 
              className="p-2 relative hover:bg-black/5 rounded-full transition"
              title={currentUser ? "Mi Portal" : "Ingresar"}
            >
              <User className="w-6 h-6" />
            </button>
          )}
          <button onClick={onOpenCart} className="p-2 relative hover:bg-black/5 rounded-full transition">
            <ShoppingBag className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full shadow-lg transition-all duration-300 overflow-hidden z-0 ${isMobileMenuOpen ? 'max-h-96 border-b' : 'max-h-0'}`} style={{ backgroundColor: headerBg, color: headerTextColor, borderColor: 'rgba(0,0,0,0.1)' }}>
        <nav className="flex flex-col py-4 px-6 gap-4">
          {navLinks.map(p => (
            <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => handleNavClick(e, p.id)} className="text-base uppercase tracking-widest font-medium py-2 border-b border-black/5 last:border-0">
              {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

const MinimalFooter = ({ themeConfig, storeData }) => {
  const footerBg = themeConfig?.footerColor || '#111111';
  const textColor = '#ffffff';

  return (
    <footer style={{ backgroundColor: footerBg, color: textColor }} className="py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <h3 className="text-xl font-bold mb-4">{storeData?.name}</h3>
          <p className="opacity-70 max-w-sm mx-auto md:mx-0">Diseño minimalista para tiendas premium. Destaca tus productos con estilo.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-widest text-sm">Enlaces</h4>
          <ul className="space-y-2 opacity-70">
            <li><a href="#" className="hover:underline">Términos y Condiciones</a></li>
            <li><a href="#" className="hover:underline">Políticas de Privacidad</a></li>
            <li><a href="#" className="hover:underline">Envíos y Devoluciones</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-widest text-sm">Suscríbete</h4>
          <p className="opacity-70 text-sm mb-4">Recibe nuestras últimas novedades.</p>
          <NewsletterSubscriptionForm 
            storeId={storeData?.id || themeConfig?.storeId}
            buttonStyle="bg-white text-black px-6 font-bold uppercase text-xs tracking-wider rounded-none hover:bg-slate-200 transition"
            inputStyle="bg-white/10 px-4 py-2.5 flex-1 focus:outline-none focus:ring-1 focus:ring-white text-white text-sm border-0 rounded-none placeholder:text-white/40"
            className="flex flex-col sm:flex-row gap-2"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center opacity-50 text-sm">
        &copy; {new Date().getFullYear()} {storeData?.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default function MinimalTemplate(props) {
  return (
    <TemplateLayout 
      {...props} 
      HeaderComponent={MinimalHeader} 
      FooterComponent={MinimalFooter} 
    />
  );
}
