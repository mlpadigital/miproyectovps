import React from 'react';
import TemplateLayout from '../components/TemplateLayout';
import { ShoppingBag, MapPin, Clock, Phone, Menu, User } from 'lucide-react';
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm';

const RestaurantHeader = ({ themeConfig, storeData, onOpenCart, currentUser, setCurrentView }) => {
  const headerBg = themeConfig?.headerColor || '#ffffff';
  const headerTextColor = themeConfig?.headerTextColor || '#333333';
  const logoUrl = themeConfig?.logoUrl || storeData?.logo_url;
  
  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-red-700 text-white text-xs font-medium py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Envío a domicilio y Take Away</span>
            <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Abierto hoy hasta las 23:30</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" /> <span>Llamanos: +54 11 1234-5678</span>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <header className="sticky top-0 z-50 shadow-sm border-b-4 border-red-600" style={{ backgroundColor: headerBg, color: headerTextColor }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button className="md:hidden p-2 text-slate-800">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex justify-center md:justify-start">
            {logoUrl ? (
              <img src={logoUrl} alt={storeData?.name} className="h-14 object-contain" />
            ) : (
              <h1 className="text-3xl font-black tracking-tighter text-red-700 uppercase">
                {storeData?.name || (themeConfig?.sections?.logoTitle && themeConfig.sections.logoTitle.toLowerCase() !== 'mi tienda' ? themeConfig.sections.logoTitle : '') || themeConfig?.storeTitle || 'Restaurante'}
              </h1>
            )}
          </div>
          
          <nav className="hidden md:flex gap-8 items-center font-bold text-slate-800">
            {[
              { id: 'index.html', defaultTitle: 'Inicio' },
              { id: 'shop.html', defaultTitle: 'Catálogo' }
            ].filter(p => !themeConfig?.hiddenDefaultPages?.includes(p.id)).map(p => (
              <a key={p.id} href={`#${p.id.split('.')[0]}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(p.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: p.id } })); } }} className={`hover:text-red-600 transition ${p.id === 'shop.html' ? 'text-red-600' : ''}`}>
                {themeConfig?.defaultPageTitles?.[p.id] || p.defaultTitle}
              </a>
            ))}
            {(themeConfig?.customPages || []).map(page => (
              <a key={page.id} href={`#${page.id}`} onClick={(e) => { e.preventDefault(); if (themeConfig?.isOnePage) { const el = document.getElementById(page.id.split('.')[0]); if (el) el.scrollIntoView({ behavior: 'smooth' }); } else { window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: page.id } })); } }} className="hover:text-red-600 transition">
                {page.title}
              </a>
            ))}
          </nav>
          
          <div className="flex justify-end gap-2 md:ml-8">
            {setCurrentView && (
              <button 
                onClick={() => setCurrentView(currentUser ? 'portal' : 'login')} 
                className="flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 w-12 h-12 rounded-full transition shadow-md"
                title={currentUser ? "Mi Portal" : "Ingresar"}
              >
                <User className="w-5 h-5" />
              </button>
            )}
            <button onClick={onOpenCart} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full font-bold transition shadow-lg hover:shadow-xl hover:-translate-y-1">
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Ver Pedido</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

const RestaurantFooter = ({ themeConfig, storeData }) => {
  const footerBg = themeConfig?.footerColor || '#1a1a1a';
  
  return (
    <footer style={{ backgroundColor: footerBg }} className="text-white pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
        <div>
          <h3 className="text-2xl font-black mb-6 text-red-500 uppercase">{storeData?.name}</h3>
          <p className="opacity-80 max-w-sm mx-auto md:mx-0 text-sm">
            Los mejores ingredientes, preparados con pasión. Calidad y sabor garantizados en cada plato.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-lg">Zonas y Enlaces</h4>
          <ul className="space-y-3 opacity-80 text-sm">
            <li><a href="#shop" className="hover:text-red-400 transition">Menú y Delivery</a></li>
            <li><a href="#digital" className="hover:text-red-400 transition">Recetas & Ebooks</a></li>
            <li><a href="#contacto" className="hover:text-red-400 transition">Contacto y Reservas</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-lg">Contacto</h4>
          <ul className="space-y-3 opacity-80 text-sm">
            {storeData?.support_email && <li>{storeData.support_email}</li>}
            {storeData?.address && <li>{storeData.address}</li>}
            {!storeData?.support_email && !storeData?.address && <li>reservas@restaurant.com</li>}
            <li>Abierto todos los días</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-lg">Newsletter</h4>
          <p className="opacity-80 text-sm mb-4">Recibí promociones exclusivas y descuentos en tu correo.</p>
          <NewsletterSubscriptionForm 
            storeId={storeData?.id || themeConfig?.storeId}
            buttonStyle="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition"
            inputStyle="w-full px-3 py-2.5 rounded-lg border border-white/20 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none"
            className="flex flex-col gap-2"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center opacity-50 text-sm">
        &copy; {new Date().getFullYear()} {storeData?.name}. Diseñado para disfrutar.
      </div>
    </footer>
  );
};

export default function RestaurantTemplate(props) {
  React.useEffect(() => {
    document.body.style.backgroundColor = props.themeConfig?.backgroundColor || '#fffcf5'; // slightly warm background
    return () => { document.body.style.backgroundColor = ''; }
  }, [props.themeConfig]);

  return (
    <TemplateLayout 
      {...props} 
      HeaderComponent={RestaurantHeader} 
      FooterComponent={RestaurantFooter} 
    />
  );
}
