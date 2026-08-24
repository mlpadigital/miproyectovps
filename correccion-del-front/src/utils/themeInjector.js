import { manageWhatsAppButton } from './whatsappInjector';

export const applyThemeConfigToDocument = (doc, themeConfig) => {
    if (!doc || !themeConfig) return;

    let styleTag = doc.getElementById('mlpa-theme-styles');
    if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.id = 'mlpa-theme-styles';
        doc.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
        :root {
            --primary-color: ${themeConfig.primaryColor || '#8cc63f'} !important;
            --header-color: ${themeConfig.headerColor || '#ffffff'} !important;
            --header-text-color: ${themeConfig.headerTextColor || '#000000'} !important;
            --button-color: ${themeConfig.buttonColor || '#8cc63f'} !important;
            --footer-color: ${themeConfig.footerColor || '#1e293b'} !important;
            --background-color: ${themeConfig.backgroundColor || '#ffffff'} !important;
            --primary-text-color: ${themeConfig.primaryTextColor || '#1e293b'} !important;
            --secondary-text-color: ${themeConfig.secondaryTextColor || '#64748b'} !important;
            /* Product Card Variables */
            --product-card-aspect-ratio: ${(themeConfig.productCard?.aspectRatio === 'adapt' || !themeConfig.productCard?.aspectRatio) ? 'auto' : themeConfig.productCard.aspectRatio.replace(':', '/')} !important;
            --product-card-image-fit: ${themeConfig.productCard?.imageFit || 'contain'} !important;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: '${themeConfig.fontFamily || 'Open Sans'}', sans-serif !important;
        }
        body, p, a, span, div, li {
            font-family: '${themeConfig.secondaryFontFamily || themeConfig.fontFamily || 'Open Sans'}', sans-serif !important;
        }
        button, .btn, .button {
            font-family: '${themeConfig.buttonFontFamily || themeConfig.fontFamily || 'Open Sans'}', sans-serif !important;
        }
        /* Reglas globales forzadas para aplicar colores en elementos genéricos */
        body { background-color: var(--background-color); }
        .storefront-container { background-color: var(--background-color) !important; }
        
        .storefront-container h1, .storefront-container h2, .storefront-container h3, .storefront-container h4, .storefront-container h5, .storefront-container h6 { color: var(--primary-text-color); }
        .storefront-container p, .storefront-container li { color: var(--secondary-text-color); }
        
        header, .header-area, .header { 
            background-color: var(--header-color) !important; 
            color: var(--header-text-color) !important;
        }
        header a, .header-area a, .header a, header span, .header-area span, .header span {
            color: var(--header-text-color);
        }
        
        footer, .footer-area, .footer { background-color: var(--footer-color) !important; }
        button, .btn, .button { background-color: var(--button-color) !important; border-color: var(--button-color) !important; }
        
        .text-primary { color: var(--primary-color) !important; }
        .bg-primary { background-color: var(--primary-color) !important; }
        .storefront-container a:hover { color: var(--primary-color); }

        /* Comportamiento del Encabezado */
        ${themeConfig.stickyHeader ? 'header, .header-area, .header { position: sticky !important; top: 0; z-index: 9999; }' : ''}
        ${themeConfig.absoluteHeader ? 'header, .header-area, .header { position: absolute !important; top: 0; left: 0; width: 100%; z-index: 9999; background-color: transparent !important; }' : ''}
        
        /* Ancho del Logo */
        header img, .logo img, .header-area img, .header img {
            max-width: ${themeConfig.logoMaxWidth || 140}px !important;
        }

        /* Custom CSS */
        ${themeConfig.customCss || ''}

        /* Footer Config */
        ${themeConfig.footer?.showStoreLogo === false ? 'footer img, footer .logo { display: none !important; }' : ''}
        ${themeConfig.footer?.showMainMenu === false ? 'footer nav, footer .useful-links, footer .footer-menu { display: none !important; }' : ''}
        ${themeConfig.footer?.showSocialMedia === false ? 'footer .footer-social-info, footer .social-links, footer .social-info { display: none !important; }' : ''}
        ${themeConfig.footer?.showContactInfo === false ? 'footer .single-contact, footer address, footer .contact-info, footer .contact-us { display: none !important; }' : ''}
        ${themeConfig.footer?.showNewsletter === false ? 'footer .newsletter-form, footer .newsletter-area, footer form { display: none !important; }' : ''}
        ${themeConfig.footer?.showPaymentMethods === false ? 'footer .payment-methods, footer .payment-icons { display: none !important; }' : ''}
        ${themeConfig.footer?.showShippingMethods === false ? 'footer .shipping-methods, footer .shipping-icons { display: none !important; }' : ''}
    `;

    if (themeConfig.footer?.footerImageUrl) {
        const footerImg = doc.querySelector('footer img') || doc.querySelector('.footer-area img') || doc.querySelector('.footer-widget img');
        if (footerImg && footerImg.src !== themeConfig.footer.footerImageUrl) {
            footerImg.src = themeConfig.footer.footerImageUrl;
            footerImg.style.maxHeight = '100px';
            footerImg.style.width = 'auto';
            footerImg.style.objectFit = 'contain';
        }
    }

    if (themeConfig.logoUrl) {
        const logoImg = doc.querySelector('header img') || doc.querySelector('.logo img') || doc.querySelector('.header-area img') || doc.querySelector('.header img');
        if (logoImg && logoImg.src !== themeConfig.logoUrl) {
            if (!logoImg.hasAttribute('data-orig-height')) {
                const rect = logoImg.getBoundingClientRect();
                if (rect.height > 0) {
                    logoImg.setAttribute('data-orig-height', rect.height);
                }
            }
            const origHeight = logoImg.getAttribute('data-orig-height');
            logoImg.src = themeConfig.logoUrl;
            if (origHeight) {
                logoImg.style.height = origHeight + 'px';
                logoImg.style.width = 'auto';
                logoImg.style.objectFit = 'contain';
            } else {
                logoImg.style.maxHeight = '80px';
                logoImg.style.width = 'auto';
                logoImg.style.objectFit = 'contain';
            }
        }
    }

    // --- Inyección de Título y Subtítulo de Tienda ---
    // Las plantillas React (Academy, DarkTech, Minimal, etc.) manejan su propio header en React.
    // Solo inyectamos nodos DOM para plantillas HTML estáticas externas para evitar duplicados.
    const isReactStorefront = doc.querySelector('.storefront-container') || doc.querySelector('#root') || doc.querySelector('[data-reactroot]');
    if (!isReactStorefront) {
        const logoImgForText = doc.querySelector('header img') || doc.querySelector('.logo img') || doc.querySelector('.header-area img') || doc.querySelector('.header img');
        if (logoImgForText && logoImgForText.parentNode) {
            const parent = logoImgForText.parentNode;
            
            if (themeConfig.storeTitle || themeConfig.storeSubtitle) {
                parent.style.display = 'flex';
                parent.style.alignItems = 'center';
                parent.style.gap = '10px';
                parent.style.textDecoration = 'none';

                let textContainer = parent.querySelector('.mlpa-store-title-container');
                if (!textContainer) {
                    textContainer = doc.createElement('div');
                    textContainer.className = 'mlpa-store-title-container';
                    textContainer.style.display = 'flex';
                    textContainer.style.flexDirection = 'column';
                    parent.appendChild(textContainer);
                }

                textContainer.innerHTML = ''; // Clear previous
                
                if (themeConfig.storeTitle) {
                    const titleEl = doc.createElement('span');
                    titleEl.className = 'mlpa-store-title';
                    titleEl.style.fontWeight = 'bold';
                    titleEl.style.fontSize = themeConfig.storeTitleSize ? `${themeConfig.storeTitleSize}px` : '1.2rem';
                    titleEl.style.color = themeConfig.storeTitleColor || 'var(--primary-text-color)';
                    titleEl.style.lineHeight = '1.2';
                    titleEl.innerText = themeConfig.storeTitle;
                    textContainer.appendChild(titleEl);
                }

                if (themeConfig.storeSubtitle) {
                    const subtitleEl = doc.createElement('span');
                    subtitleEl.className = 'mlpa-store-subtitle';
                    subtitleEl.style.fontSize = themeConfig.storeSubtitleSize ? `${themeConfig.storeSubtitleSize}px` : '0.85rem';
                    subtitleEl.style.color = themeConfig.storeSubtitleColor || 'var(--secondary-text-color)';
                    subtitleEl.innerText = themeConfig.storeSubtitle;
                    textContainer.appendChild(subtitleEl);
                }
            } else {
                const textContainer = parent.querySelector('.mlpa-store-title-container');
                if (textContainer) textContainer.remove();
            }
        }
    } else {
        const existingInjected = doc.querySelectorAll('.mlpa-store-title-container');
        existingInjected.forEach(el => el.remove());
    }

    // --- Inyección de Barras de Anuncio Avanzadas ---
    doc.querySelectorAll('.mlpa-announcement-bar-wrapper').forEach(bar => bar.remove());
    doc.querySelectorAll('#mlpa-countdown-script').forEach(script => script.remove());

    const createBarElement = (barConfig, barId) => {
        if (!barConfig.show || !barConfig.text) return null;

        const wrapper = doc.createElement('div');
        wrapper.className = 'mlpa-announcement-bar-wrapper';
        wrapper.style.width = '100%';
        wrapper.style.zIndex = '10000';

        if (barConfig.position === 'above' && (themeConfig.absoluteHeader || themeConfig.stickyHeader)) {
            wrapper.style.position = 'relative';
        }

        let bgColor = 'var(--primary-color)';
        if (barConfig.colorMode === 'secondary') bgColor = 'var(--secondary-text-color)';
        else if (barConfig.colorMode === 'background') bgColor = 'var(--background-color)';
        else if (barConfig.colorMode === 'button') bgColor = 'var(--button-color)';
        else if (barConfig.colorMode === 'custom') bgColor = barConfig.customColor;

        const isDarkBg = barConfig.colorMode !== 'background';
        const textColor = isDarkBg ? '#ffffff' : 'var(--primary-text-color)';

        const innerEl = barConfig.link ? doc.createElement('a') : doc.createElement('div');
        innerEl.className = 'mlpa-announcement-bar';
        if (barConfig.link) {
            innerEl.href = barConfig.link;
            innerEl.style.display = 'block';
            innerEl.style.textDecoration = 'none';
        }

        innerEl.style.backgroundColor = bgColor;
        innerEl.style.color = textColor;
        innerEl.style.textAlign = 'center';
        innerEl.style.padding = '8px 15px';
        innerEl.style.fontSize = '14px';
        innerEl.style.fontWeight = 'bold';
        innerEl.style.overflow = 'hidden';
        innerEl.style.whiteSpace = 'nowrap';

        let contentHtml = barConfig.text;

        if (barConfig.type === 'countdown' && barConfig.countdownDate) {
            contentHtml = `${barConfig.text} <span id="mlpa-countdown-${barId}" data-date="${barConfig.countdownDate}" style="margin-left:10px; font-variant-numeric: tabular-nums;">--:--:--</span>`;
        }

        if (barConfig.type === 'animated') {
            const marquee = doc.createElement('marquee');
            marquee.scrollAmount = 5;
            marquee.innerHTML = contentHtml;
            innerEl.appendChild(marquee);
        } else {
            innerEl.innerHTML = contentHtml;
        }

        wrapper.appendChild(innerEl);
        return wrapper;
    };

    const injectBar = (barWrapper, position) => {
        if (!barWrapper) return;
        if (position === 'above') {
            doc.body.insertBefore(barWrapper, doc.body.firstChild);
        } else {
            const header = doc.querySelector('header') || doc.querySelector('.header-area') || doc.querySelector('.header');
            if (header && header.parentNode) {
                header.parentNode.insertBefore(barWrapper, header.nextSibling);
            } else {
                doc.body.insertBefore(barWrapper, doc.body.firstChild);
            }
        }
    };

    const bar1 = createBarElement({
        show: themeConfig.showAnnouncementBar1,
        text: themeConfig.announcementText1,
        position: themeConfig.announcementPosition1 || 'above',
        type: themeConfig.announcementType1 || 'static',
        link: themeConfig.announcementLink1,
        colorMode: themeConfig.announcementColorMode1 || 'primary',
        customColor: themeConfig.announcementCustomColor1 || '#000000',
        countdownDate: themeConfig.announcementCountdownDate1
    }, 1);

    const bar2 = createBarElement({
        show: themeConfig.showAnnouncementBar2,
        text: themeConfig.announcementText2,
        position: themeConfig.announcementPosition2 || 'above',
        type: themeConfig.announcementType2 || 'static',
        link: themeConfig.announcementLink2,
        colorMode: themeConfig.announcementColorMode2 || 'button',
        customColor: themeConfig.announcementCustomColor2 || '#000000'
    }, 2);

    if (bar2 && (themeConfig.announcementPosition2 || 'above') === 'above') injectBar(bar2, 'above');
    if (bar1 && (themeConfig.announcementPosition1 || 'above') === 'above') injectBar(bar1, 'above');
    if (bar1 && themeConfig.announcementPosition1 === 'below') injectBar(bar1, 'below');
    if (bar2 && themeConfig.announcementPosition2 === 'below') injectBar(bar2, 'below');

    if (themeConfig.showAnnouncementBar1 && themeConfig.announcementType1 === 'countdown' && themeConfig.announcementCountdownDate1) {
        const script = doc.createElement('script');
        script.id = 'mlpa-countdown-script';
        script.innerHTML = `
            function updateCountdown() {
                const el = document.getElementById('mlpa-countdown-1');
                if (!el) return;
                const targetDate = new Date(el.getAttribute('data-date')).getTime();
                const now = new Date().getTime();
                const distance = targetDate - now;
                
                if (distance < 0) {
                    el.innerHTML = "¡Finalizado!";
                    return;
                }
                
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                el.innerHTML = (days > 0 ? days + "d " : "") + 
                                hours.toString().padStart(2, '0') + ":" + 
                                minutes.toString().padStart(2, '0') + ":" + 
                                seconds.toString().padStart(2, '0');
            }
            setInterval(updateCountdown, 1000);
            updateCountdown();
        `;
        doc.body.appendChild(script);
    }

    // --- Fix Header Overlap with Announcement Bars ---
    setTimeout(() => {
        const header = doc.querySelector('header') || doc.querySelector('.header-area') || doc.querySelector('.header');
        if (header && (themeConfig.absoluteHeader || themeConfig.stickyHeader)) {
            let topOffset = 0;
            const wrappers = doc.querySelectorAll('.mlpa-announcement-bar-wrapper');
            wrappers.forEach(wrapper => {
                if (wrapper.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    topOffset += wrapper.offsetHeight || 0;
                }
            });
            header.style.top = topOffset + 'px';
        }
    }, 100);

    // --- Inyectar Botón de WhatsApp ---
    manageWhatsAppButton(doc, themeConfig);
};
