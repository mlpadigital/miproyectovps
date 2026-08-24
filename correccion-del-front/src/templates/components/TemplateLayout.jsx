import React from 'react';
import DynamicSectionRenderer from './DynamicSectionRenderer';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplateLayout({ 
  themeConfig, 
  storeData, 
  physicalProducts, 
  activePage, 
  onOpenCart,
  digitalProducts,
  enableDigitalProducts,
  currentUser,
  setCurrentView,
  simulatePurchase,
  HeaderComponent,
  FooterComponent
}) {
  const renderMainContent = () => {
    // 1. One-Page Mode
    if (themeConfig?.isOnePage) {
      const defaultPages = [
        { id: 'index.html' },
        { id: 'shop.html' },
        { id: 'contact.html' }
      ].filter(p => !themeConfig?.hiddenDefaultPages?.includes(p.id));
      
      const allPages = [...defaultPages, ...(themeConfig?.customPages || [])];
      
      let hasRenderedProductSection = false;
      const renderedPages = allPages.map(page => {
        let sections = themeConfig?.pageSections?.[page.id] || [];
        
        // If shop.html has no custom sections, provide a fallback product list so products are never hidden
        if (page.id === 'shop.html' && (!sections || sections.length === 0) && (physicalProducts && physicalProducts.length > 0)) {
          sections = [
            {
              id: 'fallback-catalog',
              type: 'product_list',
              title: themeConfig?.defaultPageTitles?.['shop.html'] || 'Catálogo de Productos',
              visible: true,
              settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
            }
          ];
        }

        if (sections.length > 0) hasAnySections = true;
        if (sections.length === 0) return null;

        const visibleSections = sections.filter(s => s.visible !== false);
        if (visibleSections.some(s => s.type === 'product_list' || s.type === 'product_group' || s.type === 'selected_products')) {
          hasRenderedProductSection = true;
        }
        
        return (
          <div key={page.id} id={page.id.split('.')[0]}>
            {sections.map((section, idx) => (
              <DynamicSectionRenderer 
                key={section.id || idx} 
                section={section} 
                themeConfig={themeConfig} 
                physicalProducts={physicalProducts}
                storeData={storeData}
              />
            ))}
          </div>
        );
      });

      if (hasAnySections) {
        return (
          <>
            {renderedPages}
            {!hasRenderedProductSection && physicalProducts && physicalProducts.length > 0 && (
              <div id="shop">
                <DynamicSectionRenderer 
                  section={{
                    id: 'fallback-auto-catalog-onepage',
                    type: 'product_list',
                    title: 'Nuestros Productos',
                    visible: true,
                    settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
                  }}
                  themeConfig={themeConfig}
                  physicalProducts={physicalProducts}
                  storeData={storeData}
                />
              </div>
            )}
          </>
        );
      }
    }

    // 2. Separate Pages Mode (or activePage specific)
    const normalizedActivePage = (activePage && activePage.endsWith('.html')) 
      ? activePage 
      : (activePage === 'catalog' ? 'shop.html' : `${activePage || 'index'}.html`);
    
    let pageSections = themeConfig?.pageSections?.[normalizedActivePage] || 
                       (normalizedActivePage === 'index.html' ? themeConfig?.homeSections : []) || [];
    
    // If on shop.html (or catalog) and has no sections, ALWAYS provide a fallback catalog product list
    if ((normalizedActivePage === 'shop.html' || activePage === 'catalog' || activePage === 'shop') && (!pageSections || pageSections.length === 0)) {
      pageSections = [
        {
          id: 'fallback-catalog',
          type: 'product_list',
          title: themeConfig?.defaultPageTitles?.['shop.html'] || 'Catálogo de Productos',
          visible: true,
          settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
        }
      ];
    }

    // If on index.html and pageSections is completely empty/missing, provide sensible defaults
    if (normalizedActivePage === 'index.html' && (!pageSections || pageSections.length === 0)) {
      pageSections = [
        {
          id: 'default-hero',
          type: 'banners',
          title: 'Banners',
          visible: true,
          settings: {
            items: [
              {
                title: storeData?.name || 'Bienvenido a nuestra tienda',
                subtitle: storeData?.description || 'Encontrá los mejores productos',
                image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'
              }
            ]
          }
        },
        {
          id: 'default-products',
          type: 'product_list',
          title: 'Nuestros Productos',
          visible: true,
          settings: { limit: 12, enableSearch: true, categoryStyle: 'horizontal' }
        }
      ];
    }

    const visibleSections = pageSections.filter(s => s.visible !== false);
    const hasProductSection = visibleSections.some(s => s.type === 'product_list' || s.type === 'product_group' || s.type === 'selected_products');

    return (
      <>
        {pageSections.map((section, idx) => (
          <DynamicSectionRenderer 
            key={section.id || idx} 
            section={section} 
            themeConfig={themeConfig} 
            physicalProducts={physicalProducts}
            storeData={storeData}
          />
        ))}
        {!hasProductSection && (normalizedActivePage === 'shop.html' || normalizedActivePage === 'index.html') && physicalProducts && physicalProducts.length > 0 && (
          <DynamicSectionRenderer 
            section={{
              id: 'fallback-auto-catalog-page',
              type: 'product_list',
              title: normalizedActivePage === 'shop.html' ? 'Catálogo de Productos' : 'Nuestros Productos',
              visible: true,
              settings: { limit: 100, enableSearch: true, categoryStyle: 'horizontal' }
            }}
            themeConfig={themeConfig}
            physicalProducts={physicalProducts}
            storeData={storeData}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {HeaderComponent && (
        <HeaderComponent 
          themeConfig={themeConfig} 
          storeData={storeData} 
          onOpenCart={onOpenCart} 
          currentUser={currentUser}
          setCurrentView={setCurrentView}
        />
      )}

      <main className="flex-grow">
        {renderMainContent()}
        
        {enableDigitalProducts && digitalProducts && digitalProducts.length > 0 && (
          <section id="digital" className="container mx-auto px-4 py-16">
            <div className="mb-8 text-center">
              <h3 className="text-3xl font-black mb-2" style={{ color: themeConfig?.storeTitleColor || 'inherit' }}>Archivos Digitales</h3>
              <p className="opacity-70">Ebooks, guías y recursos descargables al instante.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {digitalProducts.map(res => (
                    <div key={res.id} className="bg-white text-slate-900 rounded-2xl shadow-lg overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border">
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                            {res.thumbnail_url ? (
                                <img src={res.thumbnail_url} alt={res.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                    <FileText className="w-16 h-16 text-white/20" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg font-black text-lg shadow-sm" style={{ color: themeConfig?.buttonColor || '#000' }}>
                                {res.price > 0 ? `$${res.price.toLocaleString()}` : 'GRATIS'}
                            </div>
                        </div>
                        <div className="p-6">
                            <h4 className="font-bold text-xl mb-2 line-clamp-1">{res.name}</h4>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">{res.description}</p>
                            <Button 
                                className="w-full py-6 text-base font-bold shadow-sm hover:shadow-md transition-shadow"
                                style={{ backgroundColor: themeConfig?.buttonColor || '#000', color: '#fff' }}
                                onClick={() => simulatePurchase(res)}
                            >
                                <Download className="w-5 h-5 mr-2" /> Comprar y Descargar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}
      </main>

      {FooterComponent && (
        <FooterComponent 
          themeConfig={themeConfig} 
          storeData={storeData} 
        />
      )}
    </div>
  );
}
