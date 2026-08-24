import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import {
    renderAnnouncementBar, renderProductList, renderProductGroup, renderFeaturedCategories,
    renderNewsletter, renderBlog, renderText, renderImageGrid, renderVideoTextButton,
    renderReviews, renderImageGallery, renderBgImageText, renderImageTextButton,
    renderLogosList, renderImageTimer, renderHtmlCode
} from '../../utils/homeInjector';
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm';

export default function DynamicSectionRenderer({ section, themeConfig, physicalProducts, storeData }) {
    if (!section || !section.visible) return null;

    const { id, type, settings } = section;
    const bgColor = settings?.backgroundColor || 'transparent';
    const textColor = settings?.textColor || 'var(--primary-text-color, #333)';

    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('all');

    const categories = React.useMemo(() => {
        const cats = new Set();
        (physicalProducts || []).forEach(p => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
    }, [physicalProducts]);

    // Native React Banner using Swiper
    if (type === 'banners') {
        const items = settings?.items || [];
        const bConfig = themeConfig?.bannerConfig || {};
        
        let heightClass = '';
        if (bConfig.height === 'small') heightClass = 'h-[300px] md:h-[400px]';
        else if (bConfig.height === 'large') heightClass = 'h-[600px] md:h-[800px]';
        else heightClass = 'h-[400px] md:h-[600px]'; // default

        return (
            <section className="w-full relative mlpa-section-banners">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={bConfig.autoplay !== false ? { delay: (bConfig.interval || 5) * 1000, disableOnInteraction: false } : false}
                    effect="fade"
                    className={`w-full ${heightClass}`}
                >
                    {items.map((item, idx) => (
                        <SwiperSlide key={idx} className="relative w-full h-full overflow-hidden">
                            <img 
                                src={item.image} 
                                alt={item.title || `Banner ${idx + 1}`} 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {item.title && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="text-center p-8">
                                        <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{item.title}</h2>
                                        {item.subtitle && <p className="text-xl md:text-2xl text-white mt-4 drop-shadow-md">{item.subtitle}</p>}
                                        {item.buttonText && item.buttonLink && (
                                            <a href={item.buttonLink} className="inline-block mt-8 px-8 py-3 bg-primary text-white font-bold rounded hover:bg-opacity-90 transition shadow-lg">
                                                {item.buttonText}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>
        );
    }

    // Native React Product List / Product Group / Selected Products
    if (type === 'product_list' || type === 'product_group' || type === 'selected_products') {
        const isSelectedProducts = type === 'selected_products';
        const isProductGroup = type === 'product_group';
        const prodTitle = settings?.title || (isSelectedProducts ? 'Productos seleccionados' : (isProductGroup ? 'Grupo de productos' : 'Nuestros Productos'));
        const displayLimit = isSelectedProducts ? 9999 : (settings?.limit ? parseInt(settings.limit) : 100);
        const categoryStyle = isSelectedProducts ? 'none' : (settings?.categoryStyle || 'horizontal');
        
        let filteredProds = physicalProducts || [];
        
        if (isSelectedProducts) {
            const selectedIds = (settings?.selectedProductIds || []).map(sid => String(sid));
            if (selectedIds.length > 0) {
                // Map to preserve chosen order and find by string ID
                filteredProds = selectedIds
                    .map(sid => (physicalProducts || []).find(p => String(p.id) === sid))
                    .filter(Boolean);
            } else {
                filteredProds = [];
            }
        } else {
            // If product_group has a specific category configured
            if (isProductGroup && settings?.selectedCategory && settings.selectedCategory !== 'all') {
                filteredProds = filteredProds.filter(p => p.category === settings.selectedCategory);
            }

            // Apply interactive category filter
            if (categoryStyle !== 'none' && selectedCategory !== 'all') {
                filteredProds = filteredProds.filter(p => p.category === selectedCategory);
            }
        }

        if (settings?.enableSearch && searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredProds = filteredProds.filter(p => 
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query))
            );
        }
        
        const displayProds = filteredProds.slice(0, displayLimit);
        const isEditor = typeof window !== 'undefined' && window.location.href.includes('preview=true');
        return (
            <section className="py-16" style={{ backgroundColor: bgColor }}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-6">
                        <h2 
                            className={`text-3xl font-bold inline-block min-w-[200px] ${isEditor ? 'border border-dashed border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 hover:bg-gray-50 cursor-text' : ''}`} 
                            style={{ color: textColor }}
                            contentEditable={isEditor}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => {
                                if (isEditor) {
                                    window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', sectionId: id, field: 'title', content: e.currentTarget.textContent }, '*');
                                }
                            }}
                            onClick={(e) => {
                                if (isEditor) {
                                    e.stopPropagation(); // Evitar que se abra el panel lateral
                                }
                            }}
                        >
                            {prodTitle}
                        </h2>
                    </div>
                    
                    {settings?.enableSearch && (
                        <div className="max-w-xl mx-auto mb-10 relative">
                            <input 
                                type="text"
                                placeholder="Buscar productos por nombre, descripción o categoría..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3 px-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm"
                                style={{ focusRingColor: textColor }}
                            />
                            <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            {searchQuery && (
                                <button 
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Category Filter Horizontal Buttons */}
                    {categoryStyle !== 'none' && categories.length > 0 && categoryStyle === 'horizontal' && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center no-scrollbar">
                            <button 
                                onClick={() => setSelectedCategory('all')}
                                className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${selectedCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Todas
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category Filter Dropdown */}
                    {categoryStyle !== 'none' && categories.length > 0 && categoryStyle === 'dropdown' && (
                        <div className="max-w-xs mx-auto mb-10 relative">
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white appearance-none cursor-pointer"
                                style={{ color: textColor }}
                            >
                                <option value="all">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <svg className="w-5 h-5 absolute right-4 top-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    )}

                    <div className={categoryStyle === 'sidebar' && categories.length > 0 ? "flex flex-col lg:flex-row gap-8" : ""}>
                        {categoryStyle === 'sidebar' && categories.length > 0 && (
                            <div className="w-full lg:w-1/4 flex-shrink-0">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                                    <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Categorías</h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <button 
                                                onClick={() => setSelectedCategory('all')}
                                                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedCategory === 'all' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                            >
                                                Todas
                                            </button>
                                        </li>
                                        {categories.map(cat => (
                                            <li key={cat}>
                                                <button 
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedCategory === cat ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                                >
                                                    {cat}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        <div className={categoryStyle === 'sidebar' && categories.length > 0 ? "w-full lg:w-3/4" : "w-full"}>

                    {displayProds.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayProds.map(prod => {
                                const coverImg = prod.image_url || (Array.isArray(prod.images) ? (typeof prod.images[0] === 'object' ? prod.images[0]?.url : prod.images[0]) : null) || (typeof prod.image === 'string' ? prod.image : null);
                                const isVideo = coverImg && (coverImg.toLowerCase().endsWith('.mp4') || coverImg.toLowerCase().endsWith('.webm'));
                                const hasDiscount = prod.sale_price > 0 && prod.price > 0 && prod.sale_price < prod.price;
                                const isConsultPrice = prod.price === 0 || prod.price === '0' || prod.price === null;
                                const isOutOfStock = prod.stock !== null && prod.stock !== undefined && prod.stock <= 0;

                                return (
                                <div 
                                    key={prod.id} 
                                    className="product-card bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group cursor-pointer"
                                    onClick={() => window.dispatchEvent(new CustomEvent('SELECT_PRODUCT', { detail: prod }))}
                                >
                                    <div className="product-card-image-wrapper aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center">
                                        {coverImg ? (
                                            isVideo ? (
                                                <video src={coverImg} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" autoPlay muted loop playsInline />
                                            ) : (
                                                <img src={coverImg} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                            )
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            </div>
                                        )}
                                        {isOutOfStock ? (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                                                Agotado
                                            </div>
                                        ) : prod.stock !== null && prod.stock !== undefined && (
                                            <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                                                {prod.stock} disp.
                                            </div>
                                        )}
                                        {hasDiscount && !isOutOfStock && (
                                            <div className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                                                OFERTA
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        {prod.category && (
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 line-clamp-1">{prod.category}</span>
                                        )}
                                        <h3 className="product-card-title font-bold text-gray-900 text-base mb-1 line-clamp-2 leading-snug">{prod.name}</h3>
                                        {prod.description && (
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{prod.description}</p>
                                        )}
                                        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {isConsultPrice ? (
                                                    <span className="font-bold text-base text-indigo-600">Consultar</span>
                                                ) : hasDiscount ? (
                                                    <>
                                                        <span className="text-xs text-slate-400 line-through">${Number(prod.price).toLocaleString()}</span>
                                                        <span className="font-black text-lg text-emerald-600">${Number(prod.sale_price).toLocaleString()}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-black text-lg text-gray-900">${Number(prod.price).toLocaleString()}</span>
                                                )}
                                            </div>
                                            <button 
                                                className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                                disabled={isOutOfStock}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isConsultPrice) {
                                                        window.dispatchEvent(new CustomEvent('SELECT_PRODUCT', { detail: prod }));
                                                    } else {
                                                        window.dispatchEvent(new CustomEvent('ADD_TO_CART', { detail: prod }));
                                                    }
                                                }}
                                                title={isConsultPrice ? "Consultar" : "Agregar al carrito"}
                                            >
                                                {isConsultPrice ? (
                                                    'Consultar'
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                                        <span>Agregar</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );})}
                        </div>
                    ) : (
                        <div className="text-center py-12 opacity-60" style={{ color: textColor }}>
                            {isSelectedProducts ? (
                                <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl max-w-md mx-auto bg-slate-50/50">
                                    <p className="font-semibold text-slate-700 mb-1">Sin productos seleccionados</p>
                                    <p className="text-xs text-slate-500">Selecciona los productos que deseas mostrar en esta sección desde el panel lateral del editor.</p>
                                </div>
                            ) : (
                                'No hay productos disponibles por el momento.'
                            )}
                        </div>
                    )}
                    
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Purchase info
    if (type === 'purchase_info') {
        const piConfig = themeConfig?.purchaseInfoConfig || {};
        const spacingClasses = { small: 'py-4', normal: 'py-8', large: 'py-16', xlarge: 'py-24' };
        const padding = spacingClasses[piConfig.spacing] || 'py-8';
        const isDefaultColor = piConfig.colorMode === 'default';

        return (
            <section className={`mlpa-section-purchase_info ${padding}`} style={{ backgroundColor: isDefaultColor ? '#f8f8f8' : bgColor }}>
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {settings?.items?.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center justify-center p-6 bg-white shadow-sm rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                {item.icon && <img src={item.icon} alt="" className="w-16 h-16 object-contain mb-4" />}
                                {item.title && <h3 className="text-xl font-bold mb-2" style={{ color: textColor }}>{item.title}</h3>}
                                {item.description && <p className="text-gray-600" style={{ color: textColor }}>{item.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Featured categories
    if (type === 'featured_categories') {
        const title = settings?.title ?? 'Categorías destacadas';
        const cats = settings?.categories || [
            { name: 'Categoría 1', image: '', link: '' },
            { name: 'Categoría 2', image: '', link: '' },
            { name: 'Categoría 3', image: '', link: '' }
        ];

        return (
            <section className="mlpa-section mlpa-section-featured_categories py-12 px-4 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="max-w-7xl mx-auto">
                    {title && (
                        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 tracking-tight">{title}</h2>
                    )}
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                        {cats.map((cat, idx) => (
                            <div 
                                key={idx} 
                                className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
                                onClick={() => {
                                    if (cat.link) {
                                        if (cat.link.startsWith('http')) {
                                            window.open(cat.link, '_blank');
                                        } else {
                                            window.location.href = cat.link;
                                        }
                                    } else {
                                        window.dispatchEvent(new CustomEvent('mlpa-navigate', { detail: { page: 'shop.html' } }));
                                    }
                                }}
                            >
                                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-indigo-500 transition-all">
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name || 'Categoría'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    ) : (
                                        <span className="text-xs font-semibold text-slate-400 text-center px-2">{cat.name || 'Categoría'}</span>
                                    )}
                                </div>
                                <span className="mt-3 text-sm md:text-base font-bold text-center group-hover:text-indigo-600 transition-colors">
                                    {cat.name || `Categoría ${idx + 1}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Image gallery
    if (type === 'image_gallery') {
        const title = settings?.title ?? 'Nuestra Galería';
        const items = settings?.items || [{}, {}, {}];

        return (
            <section className="mlpa-section mlpa-section-image_gallery py-12 px-4 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="max-w-7xl mx-auto">
                    {title && (
                        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 tracking-tight">{title}</h2>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm hover:shadow-lg transition-all group relative">
                                {item.image ? (
                                    <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm font-medium">Foto {idx + 1}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Image with text and button
    if (type === 'image_text_button') {
        const title = settings?.title || 'Calidad que nos distingue';
        const text = settings?.text || 'Acompañá la imagen con un texto descriptivo para que los clientes entiendan mejor tu propuesta de valor.';
        const btnText = settings?.buttonText || 'Ver más';
        const btnLink = settings?.buttonLink || '/productos';
        const image = settings?.items?.[0]?.image;

        return (
            <section className="mlpa-section mlpa-section-image_text_button py-16 px-6 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-lg flex items-center justify-center">
                        {image ? (
                            <img src={image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-400 font-medium">Sube una imagen desde el editor</span>
                        )}
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col items-start space-y-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">{title}</h2>
                        <p className="text-lg opacity-80 leading-relaxed">{text}</p>
                        {btnText && (
                            <a
                                href={btnLink}
                                className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 hover:scale-105 transition-all text-sm uppercase tracking-wide"
                            >
                                {btnText}
                            </a>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    // Logos list
    if (type === 'logos_list') {
        const title = settings?.title ?? 'Marcas que confían en nosotros';
        const items = settings?.items || [{}, {}, {}, {}];

        return (
            <section className="mlpa-section mlpa-section-logos_list py-12 px-4 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="max-w-7xl mx-auto">
                    {title && (
                        <h3 className="text-center opacity-60 text-xs md:text-sm uppercase tracking-widest font-bold mb-8">{title}</h3>
                    )}
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
                        {items.map((logo, idx) => (
                            <div key={idx} className="h-12 md:h-16 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all">
                                {logo.image ? (
                                    <img src={logo.image} alt="" className="max-h-full max-w-[140px] object-contain" />
                                ) : (
                                    <span className="text-xs font-bold text-slate-400 border border-dashed border-slate-300 px-4 py-2 rounded">LOGO {idx + 1}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Blog
    if (type === 'blog') {
        const title = settings?.title || 'Últimas Noticias';
        const items = settings?.items || [
            { title: 'Artículo de Blog 1', description: 'Breve descripción del artículo para atraer a los lectores...', image: '', link: '#' },
            { title: 'Artículo de Blog 2', description: 'Breve descripción del artículo para atraer a los lectores...', image: '', link: '#' }
        ];

        return (
            <section className="mlpa-section mlpa-section-blog py-16 px-6 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 tracking-tight">{title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((post, idx) => (
                            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                                <div className="aspect-[16/9] bg-slate-100 overflow-hidden flex items-center justify-center">
                                    {post.image ? (
                                        <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <span className="text-slate-300 text-sm font-semibold">Portada {idx + 1}</span>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="font-bold text-xl mb-3 line-clamp-2 text-slate-900 group-hover:text-indigo-600 transition-colors">{post.title || 'Título del artículo'}</h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{post.description || 'Descripción del artículo...'}</p>
                                    <a href={post.link || '#'} className="mt-auto font-bold text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                        Leer más →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Newsletter
    if (type === 'newsletter') {
        const title = settings?.title || 'Suscribite a nuestro newsletter';
        const description = settings?.description || 'Recibí las mejores ofertas y novedades en tu correo.';

        return (
            <section className="mlpa-section mlpa-section-newsletter py-16 px-6 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="max-w-3xl mx-auto text-center bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-slate-900">{title}</h2>
                    <p className="text-slate-600 text-base mb-8 max-w-lg mx-auto">{description}</p>
                    <div className="max-w-md mx-auto">
                        <NewsletterSubscriptionForm 
                            storeId={storeData?.id || themeConfig?.storeId} 
                            buttonStyle="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
                            inputStyle="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                        />
                    </div>
                </div>
            </section>
        );
    }

    // Reviews / Testimonios
    if (type === 'reviews') {
        const title = settings?.title || 'Lo que dicen nuestros clientes';
        const items = settings?.items || [
            { author: 'Cliente Feliz', text: 'Excelente servicio y calidad. Recomiendo totalmente a esta tienda para futuras compras.', stars: 5 }
        ];

        return (
            <section className="mlpa-section mlpa-section-reviews py-16 px-6 w-full" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 tracking-tight">{title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((rev, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col text-center">
                                <div className="text-amber-400 text-lg mb-4">
                                    {'★'.repeat(rev.stars || 5)}{'☆'.repeat(5 - (rev.stars || 5))}
                                </div>
                                <p className="text-slate-600 italic text-sm md:text-base mb-6 leading-relaxed flex-1">"{rev.text || '...'}"</p>
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">{rev.author || 'Cliente anónimo'}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // String-based legacy renderers
    let contentHtml = '';
    switch (type) {
        case 'announcement_bar': contentHtml = renderAnnouncementBar(settings, textColor); break;
        case 'text': contentHtml = renderText(settings, section.id); break;
        case 'image_grid': contentHtml = renderImageGrid(settings, section.id); break;
        case 'video_text_button': contentHtml = renderVideoTextButton(settings, section.id); break;
        case 'bg_image_text': contentHtml = renderBgImageText(settings, section.id); break;
        case 'image_timer': contentHtml = renderImageTimer(settings, section.id); break;
        case 'html_code': contentHtml = renderHtmlCode(settings, section.id); break;
        default: return null;
    }

    return (
        <section 
            className={`mlpa-section mlpa-section-${type}`} 
            style={{ 
                padding: type === 'announcement_bar' ? '10px 0' : '40px 0',
                backgroundColor: bgColor,
                color: textColor
            }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
    );
}
