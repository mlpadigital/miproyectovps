export const manageDynamicHomeElements = (doc, themeConfig, activePage = 'index.html') => {
    const currentSections = themeConfig?.pageSections?.[activePage] || themeConfig?.homeSections || [];

    if (!doc || !themeConfig) return;
    const rootDoc = doc.ownerDocument || doc;

    // 1. Encontrar o crear el contenedor dinámico de la página de inicio
    let homeContainer = doc.querySelector('#mlpa-dynamic-home-content');
    
    // Si no existe el contenedor, lo creamos y ocultamos el contenido demo
    if (!homeContainer) {
        homeContainer = rootDoc.createElement('div');
        homeContainer.id = 'mlpa-dynamic-home-content';
        
        // Tratar de encontrar dónde insertarlo (después del header)
        const header = doc.querySelector('header, .header, .header-area');
        const footer = doc.querySelector('footer, .footer, .footer-area');
        
        if (header && header.parentNode) {
            header.parentNode.insertBefore(homeContainer, header.nextSibling);
        } else {
            const targetNode = doc.body || doc.documentElement || doc;
            targetNode.insertBefore(homeContainer, targetNode.firstChild);
        }

        // Ocultar elementos demo estáticos si el usuario ya tiene secciones personalizadas
        if (currentSections && currentSections.length > 0) {
            const templateRoot = doc.body || doc.firstElementChild || doc;
            const children = Array.from(templateRoot.children);
            children.forEach(child => {
                if (child !== header && child !== footer && child !== homeContainer && !child.tagName.match(/SCRIPT|STYLE|LINK/i) && child.id !== 'mlpa-whatsapp-button' && child.id !== 'mlpa-dynamic-footer-features') {
                    // Ocultamos las secciones originales que traía la plantilla (ej: banners hardcodeados)
                    child.style.display = 'none';
                }
            });
        }
    }

    // 2. Limpiar el contenedor dinámico
    homeContainer.innerHTML = '';

    // 3. Renderizar cada sección dinámica configurada por el usuario
    const sections = currentSections || [];
    
    sections.forEach((section) => {
        if (!section.visible) return;
        
        const sectionEl = rootDoc.createElement('section');
        sectionEl.className = `mlpa-section mlpa-section-${section.type}`;
        sectionEl.style.padding = '40px 0';
        
        // Aplicar colores individuales si están definidos, si no usar globales o defaults
        const bgColor = section.settings?.backgroundColor || 'transparent';
        const textColor = section.settings?.textColor || 'var(--primary-text-color, #333)';
        
        sectionEl.style.backgroundColor = bgColor;
        sectionEl.style.color = textColor;

        let contentHtml = '';

        switch (section.type) {
            case 'announcement_bar':
                contentHtml = renderAnnouncementBar(section.settings, textColor);
                sectionEl.style.padding = '10px 0'; // Menos padding para la barra
                break;
            case 'product_list':
                contentHtml = renderProductList(section.settings);
                break;
            case 'product_group':
                contentHtml = renderProductGroup(section.settings);
                break;
            case 'selected_products':
                contentHtml = renderSelectedProducts(section.settings);
                break;
            case 'featured_categories':
                contentHtml = renderFeaturedCategories(section.settings);
                break;
            case 'newsletter':
                contentHtml = renderNewsletter(section.settings);
                break;
            case 'blog':
                contentHtml = renderBlog(section.settings);
                break;
            case 'text':
                contentHtml = renderText(section.settings);
                break;
            case 'image_grid':
                contentHtml = renderImageGrid(section.settings);
                break;
            case 'video_text_button':
                contentHtml = renderVideoTextButton(section.settings);
                break;
            case 'reviews':
                contentHtml = renderReviews(section.settings);
                break;
            case 'image_gallery':
                contentHtml = renderImageGallery(section.settings);
                break;
            case 'bg_image_text':
                contentHtml = renderBgImageText(section.settings);
                break;
            case 'image_text_button':
                contentHtml = renderImageTextButton(section.settings);
                break;
            case 'logos_list':
                contentHtml = renderLogosList(section.settings);
                break;
            case 'image_timer':
                contentHtml = renderImageTimer(section.settings);
                break;
            case 'html_code':
                contentHtml = renderHtmlCode(section.settings);
                break;
            case 'banners':
                const bannerEl = renderBanners(doc, section, themeConfig);
                if (bannerEl) homeContainer.appendChild(bannerEl);
                break;
            case 'purchase_info':
                const piEl = renderPurchaseInfo(doc, section, themeConfig);
                if (piEl) homeContainer.appendChild(piEl);
                break;
            default:
                break;
        }

        if (contentHtml) {
            sectionEl.innerHTML = contentHtml;
            homeContainer.appendChild(sectionEl);
        }
    });
};

export const renderAnnouncementBar = (settings = {}, textColor) => {
    const text = settings.text || '¡Anuncio importante aquí!';
    const link = settings.link || '';
    
    const textHtml = `<span style="font-size: 14px; font-weight: 600; color: ${textColor};">${text}</span>`;
    
    return `
        <div style="text-align: center; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            ${link ? `<a href="${link}" style="text-decoration: none;">${textHtml}</a>` : textHtml}
        </div>
    `;
};

export const renderProductList = (settings = {}) => {
    const title = settings.title || 'Nuestros Productos';
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 24px; font-weight: bold;">${title}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                <!-- Productos Mockeados para la vista previa -->
                ${[1,2,3,4].map(i => `
                    <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: #fff; text-align: center;">
                        <div style="height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #aaa;">Imagen ${i}</div>
                        <div style="padding: 15px;">
                            <h3 style="font-size: 16px; margin: 0 0 10px 0;">Producto ${i}</h3>
                            <p style="color: #666; font-weight: bold; margin: 0;">$0.00</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderProductGroup = (settings = {}) => {
    const title = settings.title || 'Grupo de Productos';
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 24px; font-weight: bold;">${title}</h2>
            <div style="display: flex; gap: 20px; overflow-x: auto; padding-bottom: 10px;">
                <!-- Productos Mockeados -->
                ${[1,2,3].map(i => `
                    <div style="min-width: 250px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: #fff; text-align: center;">
                        <div style="height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #aaa;">Imagen ${i}</div>
                        <div style="padding: 15px;">
                            <h3 style="font-size: 16px; margin: 0 0 10px 0;">Destacado ${i}</h3>
                            <p style="color: #666; font-weight: bold; margin: 0;">$0.00</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderSelectedProducts = (settings = {}) => {
    const title = settings.title || 'Productos Seleccionados';
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 24px; font-weight: bold;">${title}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                ${(settings.selectedProductIds?.length ? settings.selectedProductIds : [1,2,3,4]).map((id, i) => `
                    <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: #fff; text-align: center;">
                        <div style="height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #aaa;">Producto ${i+1}</div>
                        <div style="padding: 15px;">
                            <h3 style="font-size: 16px; margin: 0 0 10px 0;">Producto Seleccionado ${i+1}</h3>
                            <p style="color: #666; font-weight: bold; margin: 0;">$0.00</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderFeaturedCategories = (settings = {}) => {
    const categories = settings.categories || [
        { name: 'Categoría 1', image: '' },
        { name: 'Categoría 2', image: '' }
    ];
    
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                ${categories.map(cat => `
                    <div style="text-align: center; cursor: pointer;">
                        <div style="width: 150px; height: 150px; border-radius: 50%; background: ${cat.image ? `url('${cat.image}') center/cover` : '#eee'}; margin: 0 auto 15px auto; display: flex; align-items: center; justify-content: center; border: 2px solid #ddd;">
                            ${!cat.image ? '<span style="color:#aaa; font-size: 12px;">Sin imagen</span>' : ''}
                        </div>
                        <h4 style="font-size: 16px; margin: 0;">${cat.name || 'Categoría'}</h4>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderNewsletter = (settings = {}) => {
    const title = settings.title || 'Suscribite a nuestro newsletter';
    const description = settings.description || 'Recibí las mejores ofertas y novedades en tu correo.';
    return `
        <div style="max-width: 800px; margin: 0 auto; padding: 40px 15px; text-align: center; background: #f8f9fa; border-radius: 8px;">
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">${title}</h2>
            <p style="color: #666; margin-bottom: 20px;">${description}</p>
            <div style="display: flex; gap: 10px; max-width: 500px; margin: 0 auto;">
                <input type="email" placeholder="Tu correo electrónico" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" disabled />
                <button style="padding: 10px 20px; background: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;" disabled>Suscribirme</button>
            </div>
        </div>
    `;
};

export const renderBlog = (settings = {}) => {
    const title = settings.title || 'Últimas Noticias';
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <h2 style="text-align: center; margin-bottom: 30px; font-size: 24px; font-weight: bold;">${title}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;">
                ${[1,2,3].map(i => `
                    <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: #fff;">
                        <div style="height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #aaa;">Imagen del Blog ${i}</div>
                        <div style="padding: 20px;">
                            <h3 style="font-size: 18px; margin: 0 0 10px 0;">Artículo de Blog ${i}</h3>
                            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Breve descripción del artículo para atraer a los lectores a hacer clic y leer más...</p>
                            <span style="color: #0066cc; font-weight: bold; font-size: 14px;">Leer más →</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderText = (settings = {}, sectionId) => {
    const content = settings.content || 'Este es un bloque de texto. Puedes usarlo para contar la historia de tu marca, políticas, o información relevante.';
    const isEditor = typeof window !== 'undefined' && window.location.href.includes('preview=true');
    const editableAttr = isEditor ? `contenteditable="true" onblur="window.parent.postMessage({ type: 'INLINE_TEXT_UPDATE', sectionId: '${sectionId}', content: this.innerHTML }, '*')"` : '';

    return `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px 15px; text-align: center;">
            <div ${editableAttr} style="font-size: 16px; line-height: 1.6; outline: none; padding: 10px; border-radius: 4px; ${isEditor ? 'border: 1px dashed #ccc;' : ''}">${content}</div>
        </div>
    `;
};

export const renderImageGrid = (settings = {}, sectionId) => {
    const items = settings.items || Array(4).fill({});
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                ${items.map((item, i) => {
                    const content = item.image 
                        ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;" />`
                        : `Imagen ${i + 1}`;
                    const block = `
                        <div style="height: 250px; background: #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #aaa; cursor: pointer; overflow: hidden;">
                            ${content}
                        </div>
                    `;
                    return item.link ? `<a href="${item.link}" style="text-decoration: none;">${block}</a>` : block;
                }).join('')}
            </div>
        </div>
    `;
};

export const renderVideoTextButton = (settings = {}, sectionId) => {
    const title = settings.title || 'Conocé más sobre nosotros';
    const text = settings.text || 'Mirá este video para descubrir cómo nuestros productos pueden ayudarte.';
    const btnText = settings.buttonText || 'Ver más';
    const btnLink = settings.buttonLink || '#';
    let videoEmbed = '▶ Video Reproductor';
    
    if (settings.videoUrl) {
        if (settings.videoUrl.includes('youtube.com') || settings.videoUrl.includes('youtu.be')) {
            const videoId = settings.videoUrl.split('v=')[1]?.split('&')[0] || settings.videoUrl.split('/').pop();
            videoEmbed = `<iframe credentialless="" width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else {
            videoEmbed = `<video src="${settings.videoUrl}" controls style="width:100%; height:100%; object-fit: cover;"></video>`;
        }
    }

    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px; display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
            <div style="flex: 1; min-width: 300px;">
                <div style="width: 100%; aspect-ratio: 16/9; background: #333; display: flex; align-items: center; justify-content: center; color: #fff; border-radius: 8px; overflow: hidden;">
                    ${videoEmbed}
                </div>
            </div>
            <div style="flex: 1; min-width: 300px;">
                <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 20px;">${title}</h2>
                <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">${text}</p>
                ${btnText ? `<a href="${btnLink}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 4px; font-weight: bold; text-decoration: none;">${btnText}</a>` : ''}
            </div>
        </div>
    `;
};

export const renderReviews = (settings = {}, sectionId) => {
    const title = settings.title || 'Lo que dicen nuestros clientes';
    const items = settings.items || [
        { author: 'Cliente 1', text: 'Excelente servicio y calidad. Recomiendo totalmente a esta tienda para futuras compras.', stars: 5 }
    ];
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <h2 style="text-align: center; margin-bottom: 40px; font-size: 24px; font-weight: bold;">${title}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                ${items.map(item => `
                    <div style="background: #fff; border: 1px solid #eaeaea; padding: 25px; border-radius: 8px; text-align: center;">
                        <div style="color: #f59e0b; font-size: 20px; margin-bottom: 15px;">${'★'.repeat(item.stars || 5)}${'☆'.repeat(5 - (item.stars || 5))}</div>
                        <p style="color: #555; font-style: italic; margin-bottom: 20px;">"${item.text || '...'}"</p>
                        <h4 style="margin: 0; font-weight: bold;">${item.author || 'Anónimo'}</h4>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderImageGallery = (settings = {}) => {
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                ${[1,2,3,4,5,6].map(i => `
                    <div style="aspect-ratio: 1; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #aaa;">
                        Foto ${i}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderBgImageText = (settings = {}, sectionId) => {
    const text = settings.text || 'Texto destacado con imagen de fondo';
    const description = settings.description || 'Una descripción breve y atractiva.';
    const btnText = settings.buttonText || '';
    const btnLink = settings.buttonLink || '#';
    const bgImage = settings.items?.[0]?.image || '';
    return `
        <div style="width: 100%; min-height: 400px; background: ${bgImage ? `url('${bgImage}') center/cover` : '#555'}; display: flex; align-items: center; justify-content: center; color: #fff; text-align: center; padding: 20px; position: relative;">
            <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5);"></div>
            <div style="max-width: 600px; position: relative; z-index: 1;">
                <h2 style="font-size: 36px; font-weight: bold; margin-bottom: 20px; color: #fff;">${text}</h2>
                <p style="font-size: 18px; margin-bottom: 30px; color: #fff;">${description}</p>
                ${btnText ? `<a href="${btnLink}" style="display: inline-block; padding: 12px 30px; background: #fff; color: #000; border: none; font-weight: bold; border-radius: 4px; text-decoration: none;">${btnText}</a>` : ''}
            </div>
        </div>
    `;
};

export const renderImageTextButton = (settings = {}) => {
    const title = settings.title || 'Título Principal';
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px; display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
            <div style="flex: 1; min-width: 300px; aspect-ratio: 4/3; background: #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #aaa;">
                Imagen
            </div>
            <div style="flex: 1; min-width: 300px;">
                <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 15px;">${title}</h2>
                <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Acompañá la imagen con un texto descriptivo para que los clientes entiendan mejor tu propuesta de valor.</p>
                <button style="padding: 12px 24px; border: 1px solid #333; background: transparent; color: #333; font-weight: bold; border-radius: 4px;">Saber más</button>
            </div>
        </div>
    `;
};

export const renderLogosList = (settings = {}) => {
    return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 15px;">
            <h3 style="text-align: center; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px;">Marcas que confían en nosotros</h3>
            <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 20px; opacity: 0.6;">
                ${[1,2,3,4,5].map(i => `
                    <div style="font-weight: bold; font-size: 20px; color: #999;">LOGO ${i}</div>
                `).join('')}
            </div>
        </div>
    `;
};

export const renderImageTimer = (settings = {}, sectionId) => {
    const title = settings.title || '¡Oferta por tiempo limitado!';
    const endDate = settings.endDate || '';
    const bgImage = settings.items?.[0]?.image || '';
    return `
        <div style="max-width: 1000px; margin: 0 auto; background: ${bgImage ? `url('${bgImage}') center/cover` : '#111'}; position: relative; color: #fff; padding: 60px 20px; border-radius: 8px; text-align: center; overflow: hidden;">
            <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.6);"></div>
            <div style="position: relative; z-index: 1;">
                <h2 style="font-size: 28px; margin-bottom: 30px; font-weight: bold; color: #fff;">${title}</h2>
                <div id="mlpa-countdown-${sectionId}" data-date="${endDate ? endDate + 'T23:59:59' : ''}" style="font-size: 32px; font-weight: bold; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px; display: inline-block;">
                    ${endDate ? 'Calculando...' : 'Configura una fecha límite'}
                </div>
            </div>
        </div>
    `;
};

export const renderHtmlCode = (settings = {}) => {
    const html = settings.html || '<div style="text-align: center; padding: 20px; background: #eee; border: 1px dashed #ccc;">Inserta tu código HTML personalizado aquí.</div>';
    return html;
};

export const renderBanners = (doc, section, themeConfig) => {
    const heroBanner = doc.querySelector('.slider-area') || doc.querySelector('.hero-area') || doc.querySelector('.hero') || doc.querySelector('#hero') || doc.querySelector('#fwslider');
    if (!heroBanner) return;
    
    heroBanner.style.display = '';
    heroBanner.classList.add('mlpa-injected-section');
    
    // Inject images from section settings
    if (section && section.settings && section.settings.items && section.settings.items.length > 0) {
        // Find candidate images (usually direct children of slides or just big images)
        const slideImages = Array.from(heroBanner.querySelectorAll('img')).filter(img => {
            const src = img.getAttribute('src') || '';
            const className = img.className || '';
            // Exclude small images, icons, logos
            return !src.includes('logo') && !src.includes('icon') && !className.includes('logo');
        });
        
        const slideDivs = Array.from(heroBanner.querySelectorAll('.single-hero-slide, .slide, .hero-bg, .slider_container > div'));

        // Force first slide to be visible in case the slider JS fails to initialize in SPA
        if (slideDivs && slideDivs.length > 0) {
            slideDivs[0].style.display = 'block';
            slideDivs[0].style.opacity = '1';
            slideDivs[0].style.zIndex = '1';
        }

        section.settings.items.forEach((item, index) => {
            if (!item || !item.image) return;
            
            if (slideImages[index]) {
                slideImages[index].src = item.image;
                if (slideImages[index].hasAttribute('data-src')) {
                    slideImages[index].setAttribute('data-src', item.image);
                }
            } else if (slideDivs[index]) {
                slideDivs[index].style.backgroundImage = `url("${item.image}")`;
            } else if (index === 0) {
                // Fallback for first item if no slides found
                heroBanner.style.backgroundImage = `url("${item.image}")`;
            }
        });
    }

    const bConfig = themeConfig.bannerConfig || {};
    if (bConfig.height === 'small') {
        heroBanner.style.setProperty('min-height', '300px', 'important');
        heroBanner.style.setProperty('height', '300px', 'important');
    } else if (bConfig.height === 'large') {
        heroBanner.style.setProperty('min-height', '800px', 'important');
        heroBanner.style.setProperty('height', '800px', 'important');
    } else {
        heroBanner.style.removeProperty('min-height');
        heroBanner.style.removeProperty('height');
    }

    if (doc.defaultView && doc.defaultView.$) {
        const $ = doc.defaultView.$;
        try {
            const sliders = $(heroBanner).find('.owl-carousel, .hero-slides, .slider');
            if (sliders.length > 0 && sliders.owlCarousel) {
                if (bConfig.autoplay === false) {
                    sliders.trigger('stop.owl.autoplay');
                } else {
                    sliders.trigger('play.owl.autoplay', [bConfig.interval ? bConfig.interval * 1000 : 5000]);
                }
            }
        } catch (e) { }
    }
    return heroBanner;
};

export const renderPurchaseInfo = (doc, section, themeConfig) => {
    const rootDoc = doc.ownerDocument || doc;
    const piConfig = themeConfig.purchaseInfoConfig || {};
    const spacingClasses = { small: 'py-4', normal: 'py-8', large: 'py-16', xlarge: 'py-24' };
    const padding = spacingClasses[piConfig.spacing] || 'py-8';
    const isDefaultColor = piConfig.colorMode === 'default';

    const wrapper = rootDoc.createElement('section');
    wrapper.className = `mlpa-injected-section mlpa-purchase-info ${padding}`;
    wrapper.style.backgroundColor = isDefaultColor ? 'var(--background-color)' : 'var(--primary-color)';
    wrapper.style.color = isDefaultColor ? 'var(--primary-text-color)' : '#ffffff';

    const container = rootDoc.createElement('div');
    container.style.maxWidth = '1200px';
    container.style.margin = '0 auto';
    container.style.padding = '0 15px';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    container.style.gap = '2rem';
    container.style.textAlign = 'center';

    const icons = {
        shipping: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10h1"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
        payment: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
        security: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
        home: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        discount: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
        store: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>',
        email: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
        phone: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        transfer: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2h-4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M8 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="m14 12-3-3"/><path d="m14 12-3 3"/></svg>',
        cash: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>'
    };

    ['element1', 'element2', 'element3'].forEach(elKey => {
        const el = piConfig[elKey];
        if (el && el.title) {
            const block = rootDoc.createElement('div');
            block.style.display = 'flex';
            block.style.flexDirection = 'column';
            block.style.alignItems = 'center';
            block.style.gap = '1rem';

            const iconWrapper = rootDoc.createElement('div');
            iconWrapper.style.color = isDefaultColor ? 'var(--primary-color)' : '#ffffff';
            iconWrapper.innerHTML = icons[el.icon] || icons['shipping'];

            const title = rootDoc.createElement('h3');
            title.innerText = el.title;
            title.style.margin = '0';
            title.style.fontSize = '1.25rem';
            title.style.fontWeight = 'bold';
            title.style.color = 'inherit';

            const text = rootDoc.createElement('p');
            text.innerText = el.text;
            text.style.margin = '0';
            text.style.color = isDefaultColor ? 'var(--secondary-text-color)' : 'rgba(255,255,255,0.8)';

            block.appendChild(iconWrapper);
            block.appendChild(title);
            if (el.text) block.appendChild(text);

            container.appendChild(block);
        }
    });

    if (container.hasChildNodes()) {
        wrapper.appendChild(container);
        return wrapper;
    }
    return null;
};
