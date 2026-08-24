import React from 'react';
import TemplateLayout from '../components/TemplateLayout';
import { ShoppingCart, Menu } from 'lucide-react';

const SnowboardingHeader = ({ themeConfig, storeData, onOpenCart }) => {
  const headerBg = themeConfig?.headerColor || '#333333';
  const logoUrl = themeConfig?.logoUrl || storeData?.logo_url;
  
  return (
    <header className="sticky top-0 z-50 text-white" style={{ backgroundColor: headerBg }}>
      <div className="container mx-auto px-4 h-24 flex items-center justify-between border-b-4 border-[#0099cc]">
        <button className="md:hidden p-2"><Menu className="w-6 h-6" /></button>
        
        <div className="flex-1 flex justify-center md:justify-start">
          {logoUrl ? (
            <img src={logoUrl} alt={storeData?.name} className="h-16 object-contain" />
          ) : (
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {storeData?.name || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda' ? themeConfig.sections.logoTitle : '') || themeConfig?.storeTitle || 'EXTREME'}
            </h1>
          )}
        </div>
        
        <nav className="hidden md:flex gap-8 font-bold uppercase italic tracking-wider">
          {[
            { id: 'index.html', defaultTitle: 'Home' },
            { id: 'shop.html', defaultTitle: 'Shop' }
          ].filter(p => !themeConfig?.hiddenDefaultPages?.includes(p.id)).map(p => (
            <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(p.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: p.id } })); } }} className="hover:text-[#0099cc] transition">
              {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
            </a>
          ))}
          {(themeConfig?.customPages || []).map(page => (
            <a key={page.id} href={`#${page.id}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(page.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: page.id } })); } }} className="hover:text-[#0099cc] transition">
              {page.title}
            </a>
          ))}
        </nav>
        
        <div className="flex justify-end ml-8">
          <button onClick={onOpenCart} className="bg-[#0099cc] hover:bg-[#007799] p-4 rounded text-white transition flex items-center gap-2 font-bold uppercase italic">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const SnowboardingFooter = ({ themeConfig, storeData }) => {
  const footerBg = themeConfig?.footerColor || '#222222';
  
  return (
    <footer style={{ backgroundColor: footerBg }} className="text-white pt-16 pb-8 border-t-8 border-[#0099cc]">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8">
          {storeData?.name || 'EXTREME SPORTS'}
        </h3>
        <p className="max-w-2xl mx-auto opacity-80 mb-8 italic">
          "Pushing the limits of what's possible on the mountain. Ride hard, fly high."
        </p>
        <div className="flex justify-center gap-6 mb-12">
          <a href="#" className="w-12 h-12 bg-[#333333] hover:bg-[#0099cc] rounded flex items-center justify-center transition">FB</a>
          <a href="#" className="w-12 h-12 bg-[#333333] hover:bg-[#0099cc] rounded flex items-center justify-center transition">IG</a>
          <a href="#" className="w-12 h-12 bg-[#333333] hover:bg-[#0099cc] rounded flex items-center justify-center transition">YT</a>
        </div>
        <div className="opacity-50 text-sm">
          &copy; {new Date().getFullYear()} {storeData?.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default function SnowboardingTemplate(props) {
  React.useEffect(() => {
    document.body.style.backgroundColor = props.themeConfig?.backgroundColor || '#ffffff';
    return () => { document.body.style.backgroundColor = ''; }
  }, [props.themeConfig]);

  return (
    <TemplateLayout 
      {...props} 
      HeaderComponent={SnowboardingHeader} 
      FooterComponent={SnowboardingFooter} 
    />
  );
}
