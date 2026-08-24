import React from 'react';
import TemplateLayout from '../components/TemplateLayout';
import { ShoppingBag, BookOpen, Menu } from 'lucide-react';
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm';

const AcademyHeader = ({ themeConfig, storeData, onOpenCart }) => {
  const headerBg = themeConfig?.headerColor || '#ffffff';
  const logoUrl = themeConfig?.logoUrl || storeData?.logo_url;
  const storeName = themeConfig?.storeTitle || storeData?.name || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda' ? themeConfig.sections.logoTitle : '') || 'Academy';
  const logoSubtitle = (themeConfig?.storeSubtitle && themeConfig.storeSubtitle.toLowerCase() !== 'la mejor' ? themeConfig.storeSubtitle : '') 
    || (themeConfig?.sections?.logoSubtitle && themeConfig.sections.logoSubtitle.toLowerCase() !== 'la mejor' ? themeConfig.sections.logoSubtitle : '');

  const hasCustomTitleNextToLogo = themeConfig?.storeTitle || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda');

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: headerBg }}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <button className="md:hidden p-2 text-slate-800">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex-1 flex justify-center md:justify-start items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-12 object-contain" />
          ) : (
            <h1 
              className="font-bold flex items-center gap-2"
              style={{
                color: themeConfig?.storeTitleColor || '#2441e7',
                fontSize: themeConfig?.storeTitleSize ? `${themeConfig.storeTitleSize}px` : '1.5rem'
              }}
            >
              <BookOpen className="w-8 h-8" />
              {storeName}
            </h1>
          )}
          {(logoSubtitle || (logoUrl && hasCustomTitleNextToLogo)) && (
            <div className="flex flex-col justify-center text-left">
              {logoUrl && hasCustomTitleNextToLogo && (
                <span 
                  className="font-bold leading-tight" 
                  style={{ 
                    fontSize: themeConfig?.storeTitleSize ? `${themeConfig.storeTitleSize}px` : '1.25rem',
                    color: themeConfig?.storeTitleColor || '#2441e7'
                  }}
                >
                  {hasCustomTitleNextToLogo}
                </span>
              )}
              {logoSubtitle && (
                <span 
                  className="leading-tight" 
                  style={{ 
                    fontSize: themeConfig?.storeSubtitleSize ? `${themeConfig.storeSubtitleSize}px` : '0.875rem',
                    color: themeConfig?.storeSubtitleColor || '#64748b'
                  }}
                >
                  {logoSubtitle}
                </span>
              )}
            </div>
          )}
        </div>
        
        <nav className="hidden md:flex gap-8 font-medium text-slate-700">
          {[
            { id: 'index.html', defaultTitle: 'Inicio' },
            { id: 'shop.html', defaultTitle: 'Cursos' },
            { id: 'contact.html', defaultTitle: 'Contacto' }
          ].filter(p => !themeConfig?.hiddenDefaultPages?.includes(p.id)).map(p => (
            <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(p.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: p.id } })); } }} className="hover:text-[#2441e7] transition">
              {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
            </a>
          ))}
          {(themeConfig?.customPages || []).map(page => (
            <a key={page.id} href={`#${page.id}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(page.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: page.id } })); } }} className="hover:text-[#2441e7] transition">
              {page.title}
            </a>
          ))}
        </nav>
        
        <div className="flex justify-end md:ml-8">
          <button onClick={onOpenCart} className="flex items-center gap-2 bg-[#2441e7] hover:bg-[#1b32b9] text-white px-5 py-2.5 rounded-full font-medium transition shadow">
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">Inscripciones</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const AcademyFooter = ({ themeConfig, storeData }) => {
  const footerBg = themeConfig?.footerColor || '#1e293b';
  
  return (
    <footer style={{ backgroundColor: footerBg }} className="text-white pt-20 pb-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-[#2441e7]" />
            {storeData?.name || 'Academy'}
          </h3>
          <p className="opacity-80 leading-relaxed text-sm">
            Formando a los profesionales del futuro. Cursos y recursos online de alta calidad impartidos por expertos.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6">Enlaces Rápidos</h4>
          <ul className="space-y-3 opacity-80 text-sm">
            <li><a href="#shop" className="hover:text-[#2441e7] transition">Cursos y Productos</a></li>
            <li><a href="#digital" className="hover:text-[#2441e7] transition">Archivos Digitales</a></li>
            <li><a href="#contacto" className="hover:text-[#2441e7] transition">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6">Contacto</h4>
          <ul className="space-y-3 opacity-80 text-sm">
            {storeData?.support_email && <li>{storeData.support_email}</li>}
            {storeData?.address && <li>{storeData.address}</li>}
            {!storeData?.support_email && !storeData?.address && <li>info@academy.com</li>}
            <li>Atención Lunes a Viernes</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6">Newsletter</h4>
          <p className="opacity-80 text-sm mb-4">Suscribite para recibir noticias y ofertas especiales en tu correo.</p>
          <NewsletterSubscriptionForm 
            storeId={storeData?.id || themeConfig?.storeId}
            buttonStyle="px-4 py-2.5 bg-[#2441e7] hover:bg-[#1b32b9] text-white font-bold rounded-xl text-xs transition"
            inputStyle="w-full px-3 py-2.5 rounded-xl border border-white/20 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none"
            className="flex flex-col gap-2"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-700 text-center opacity-60 text-sm">
        &copy; {new Date().getFullYear()} {storeData?.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default function AcademyTemplate(props) {
  React.useEffect(() => {
    document.body.style.backgroundColor = props.themeConfig?.backgroundColor || '#f8fafc';
    return () => { document.body.style.backgroundColor = ''; }
  }, [props.themeConfig]);

  return (
    <TemplateLayout 
      {...props} 
      HeaderComponent={AcademyHeader} 
      FooterComponent={AcademyFooter} 
    />
  );
}
