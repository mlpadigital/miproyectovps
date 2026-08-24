import React, { useState } from 'react';
import TemplateLayout from '../components/TemplateLayout';
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react';
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm';

const DarkTechHeader = ({ themeConfig, storeData, onOpenCart, currentUser, setCurrentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerBg = themeConfig?.headerColor || '#0f172a';
  const headerTextColor = themeConfig?.headerTextColor || '#f8fafc';
  const logoUrl = themeConfig?.logoUrl || storeData?.logo_url;
  
  const navLinks = [
    { id: 'index.html', defaultTitle: 'Inicio' },
    { id: 'shop.html', defaultTitle: 'Catálogo' }
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

  const storeName = themeConfig?.storeTitle || storeData?.name || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda' ? themeConfig.sections.logoTitle : '') || 'DarkTech';
  const logoSubtitle = (themeConfig?.storeSubtitle && themeConfig.storeSubtitle.toLowerCase() !== 'la mejor' ? themeConfig.storeSubtitle : '') 
    || (themeConfig?.sections?.logoSubtitle && themeConfig.sections.logoSubtitle.toLowerCase() !== 'la mejor' ? themeConfig.sections.logoSubtitle : '');
  
  const hasCustomTitleNextToLogo = themeConfig?.storeTitle || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda');

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 relative" style={{ backgroundColor: headerBg, color: headerTextColor }}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
        
        <div className="flex items-center gap-6">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-300 relative z-20">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex-1 flex justify-start items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="h-10 object-contain" />
            ) : (
              <h1 
                className={`font-black tracking-tight uppercase ${!themeConfig?.storeTitleColor ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500' : ''}`}
                style={{ 
                  fontSize: themeConfig?.storeTitleSize ? `${themeConfig.storeTitleSize}px` : '1.5rem',
                  color: themeConfig?.storeTitleColor || 'inherit'
                }}
              >
                {storeName}
              </h1>
            )}
            {(logoSubtitle || (logoUrl && hasCustomTitleNextToLogo)) && (
              <div className="flex flex-col justify-center text-left">
                {logoUrl && hasCustomTitleNextToLogo && (
                  <span className={`font-black tracking-tight uppercase ${!themeConfig?.storeTitleColor ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500' : ''}`} style={{ 
                    fontSize: themeConfig?.storeTitleSize ? `${themeConfig.storeTitleSize}px` : '1.25rem',
                    color: themeConfig?.storeTitleColor || 'inherit'
                  }}>
                    {hasCustomTitleNextToLogo}
                  </span>
                )}
                {logoSubtitle && (
                  <span className="text-slate-400 leading-tight" style={{ 
                    fontSize: themeConfig?.storeSubtitleSize ? `${themeConfig.storeSubtitleSize}px` : '0.875rem',
                    color: themeConfig?.storeSubtitleColor || 'inherit'
                  }}>
                    {logoSubtitle}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map(p => (
            <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => handleNavClick(e, p.id)} className="text-slate-300 font-medium hover:text-white transition">
              {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {setCurrentView && (
            <button 
              onClick={() => setCurrentView(currentUser ? 'portal' : 'login')} 
              className="p-2 text-slate-400 hover:text-white transition"
              title={currentUser ? "Mi Portal" : "Ingresar"}
            >
              <User className="w-5 h-5" />
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-white transition hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={onOpenCart} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Carrito</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 w-full shadow-lg transition-all duration-300 overflow-hidden z-0 ${isMobileMenuOpen ? 'max-h-96 border-b' : 'max-h-0'}`} style={{ backgroundColor: headerBg, color: headerTextColor, borderColor: 'rgba(255,255,255,0.05)' }}>
        <nav className="flex flex-col py-4 px-6 gap-2">
          {navLinks.map(p => (
            <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => handleNavClick(e, p.id)} className="text-slate-300 hover:text-white font-medium py-3 border-b border-slate-800/50 last:border-0">
              {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

const DarkTechFooter = ({ themeConfig, storeData }) => {
  const footerBg = themeConfig?.footerColor || '#020617';
  
  return (
    <footer style={{ backgroundColor: footerBg }} className="pt-20 pb-10 text-slate-400 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">{storeData?.name}</h3>
          <p className="leading-relaxed text-sm">
            Tu tienda de tecnología definitiva. Equipamiento de alto rendimiento para profesionales y gamers exigentes.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Enlaces</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#shop" className="hover:text-indigo-400 transition">Catálogo</a></li>
            <li><a href="#digital" className="hover:text-indigo-400 transition">Archivos Digitales</a></li>
            <li><a href="#contacto" className="hover:text-indigo-400 transition">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Contacto</h4>
          <ul className="space-y-3 text-sm">
            {storeData?.support_email && <li>{storeData.support_email}</li>}
            {storeData?.address && <li>{storeData.address}</li>}
            {!storeData?.support_email && !storeData?.address && <li>soporte@tienda.com</li>}
            <li>Garantía y Calidad</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Newsletter</h4>
          <p className="text-sm mb-4 text-slate-400">Recibí las últimas novedades de hardware y ofertas exclusivas.</p>
          <NewsletterSubscriptionForm 
            storeId={storeData?.id || themeConfig?.storeId}
            buttonStyle="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition"
            inputStyle="w-full px-3 py-2.5 rounded-lg border border-slate-700 text-xs text-white bg-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            className="flex flex-col gap-2"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>&copy; {new Date().getFullYear()} {storeData?.name}. Todos los derechos reservados.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition">Privacidad</a>
          <a href="#" className="hover:text-white transition">Términos</a>
        </div>
      </div>
    </footer>
  );
};

export default function DarkTechTemplate(props) {
  // Ensure the body has dark background for this template natively
  React.useEffect(() => {
    document.body.style.backgroundColor = props.themeConfig?.backgroundColor || '#0f172a';
    document.body.style.color = props.themeConfig?.primaryTextColor || '#f8fafc';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [props.themeConfig]);

  return (
    <TemplateLayout 
      {...props} 
      HeaderComponent={DarkTechHeader} 
      FooterComponent={DarkTechFooter} 
    />
  );
}
