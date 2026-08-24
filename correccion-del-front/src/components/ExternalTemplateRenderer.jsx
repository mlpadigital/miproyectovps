import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { applyThemeConfigToDocument } from '../utils/themeInjector';
import { manageDynamicFooterElements } from '../utils/footerInjector';
import { manageWhatsAppButton } from '../utils/whatsappInjector';
import { manageDynamicHomeElements } from '../utils/homeInjector';

const ExternalTemplateRenderer = ({ themeId, themeConfig, children, templatePage = 'index.html' }) => {
    const [htmlContent, setHtmlContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef(null);
    const [dynamicTarget, setDynamicTarget] = useState(null);

    useEffect(() => {
        async function fetchTemplate() {
            try {
                setIsLoading(true);
                // 1. Fetch the raw HTML template
                const response = await fetch(`/templates/${themeId}/${templatePage}`);
                if (!response.ok) throw new Error('Template not found');
                const rawHtml = await response.text();

                // 2. Parse the HTML to manipulate it
                const parser = new DOMParser();
                const doc = parser.parseFromString(rawHtml, 'text/html');

                // 3. Rewrite relative URLs (CSS, Images, Links) to absolute paths
                const basePath = `/templates/${themeId}/`;

                const rewriteUrl = (url) => {
                    if (!url) return url;
                    // Ignore absolute URLs and data URIs, but upgrade HTTP to HTTPS to avoid Mixed Content errors
                    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
                        return url.replace('http://', 'https://');
                    }
                    // Remove leading slash if present to avoid //templates
                    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
                    return `${basePath}${cleanUrl}`;
                };

                // Rewrite styles
                doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
                    el.href = rewriteUrl(el.getAttribute('href'));
                });

                // Rewrite images
                doc.querySelectorAll('img').forEach(el => {
                    el.src = rewriteUrl(el.getAttribute('src'));
                });

                // 4. Inject CSS variables based on themeConfig
                if (themeConfig) {
                    const styleTag = doc.createElement('style');
                    styleTag.innerHTML = `
                        :root {
                            ${themeConfig.primaryColor ? `--primary-color: ${themeConfig.primaryColor};` : ''}
                            ${themeConfig.headerColor ? `--header-color: ${themeConfig.headerColor};` : ''}
                            ${themeConfig.buttonColor ? `--button-color: ${themeConfig.buttonColor};` : ''}
                            ${themeConfig.footerColor ? `--footer-color: ${themeConfig.footerColor};` : ''}
                            ${themeConfig.backgroundColor ? `--background-color: ${themeConfig.backgroundColor};` : ''}
                            ${themeConfig.primaryTextColor ? `--primary-text-color: ${themeConfig.primaryTextColor};` : ''}
                            ${themeConfig.secondaryTextColor ? `--secondary-text-color: ${themeConfig.secondaryTextColor};` : ''}
                            ${themeConfig.fontFamily ? `--font-family: ${themeConfig.fontFamily};` : ''}
                            /* Product Card Variables */
                            ${themeConfig.productCard?.aspectRatio ? `--product-card-aspect-ratio: ${themeConfig.productCard.aspectRatio === 'adapt' ? 'auto' : themeConfig.productCard.aspectRatio.replace(':', '/')};` : '--product-card-aspect-ratio: auto;'}
                            ${themeConfig.productCard?.imageFit ? `--product-card-image-fit: ${themeConfig.productCard.imageFit};` : '--product-card-image-fit: contain;'}
                        }
                        /* Reglas globales forzadas para aplicar colores en elementos genéricos */
                        ${themeConfig.backgroundColor ? `body, html, .page-wrapper { background-color: var(--background-color) !important; }` : ''}
                        ${themeConfig.primaryTextColor ? `h1, h2, h3, h4, h5, h6 { color: var(--primary-text-color) !important; }` : ''}
                        ${themeConfig.secondaryTextColor ? `p, span, li { color: var(--secondary-text-color) !important; }` : ''}
                        ${themeConfig.headerColor ? `header, .header-area, .header { background-color: var(--header-color) !important; }` : ''}
                        ${themeConfig.footerColor ? `footer, .footer-area, .footer { background-color: var(--footer-color) !important; }` : ''}
                        ${themeConfig.buttonColor ? `button, .btn, .button { background-color: var(--button-color) !important; border-color: var(--button-color) !important; }` : ''}
                        
                        /* Reglas de fuentes */
                        h1, h2, h3, h4, h5, h6 { font-family: '${themeConfig.fontFamily || 'Open Sans'}', sans-serif !important; }
                        body, p, a, span, div, li { font-family: '${themeConfig.secondaryFontFamily || themeConfig.fontFamily || 'Open Sans'}', sans-serif !important; }
                        button, .btn, .button { font-family: '${themeConfig.buttonFontFamily || themeConfig.fontFamily || 'Open Sans'}', sans-serif !important; }
                        
                        /* Comportamiento del Encabezado */
                        ${themeConfig.stickyHeader ? 'header, .header-area, .header { position: sticky !important; top: 0; z-index: 9999; }' : ''}
                        ${themeConfig.absoluteHeader ? 'header, .header-area, .header { position: absolute !important; top: 0; left: 0; width: 100%; z-index: 9999; background-color: transparent !important; }' : ''}
                        
                        /* Ancho del Logo */
                        header img, .logo img, .header-area img, .header img {
                            max-width: ${themeConfig.logoMaxWidth || 140}px !important;
                        }
                    `;
                    doc.head.appendChild(styleTag);
                }

                // 4.5. Inject Favicon
                if (themeConfig?.faviconUrl) {
                    let favicon = doc.querySelector('link[rel="icon"]') || doc.querySelector('link[rel="shortcut icon"]');
                    if (!favicon) {
                        favicon = doc.createElement('link');
                        favicon.rel = 'icon';
                        doc.head.appendChild(favicon);
                    }
                    favicon.href = themeConfig.faviconUrl;
                }

                // 4.6. Inject Announcement Bars Avanzadas
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

                // --- Home Page Sections Ordering & Injection ---
                const heroBanner = doc.querySelector('.slider-area') || doc.querySelector('.hero-area') || doc.querySelector('.hero') || doc.querySelector('#hero');
                doc.querySelectorAll('.mlpa-injected-section').forEach(el => el.remove());

                if (themeConfig.homeSections && themeConfig.homeSections.length > 0) {
                    const header = doc.querySelector('header') || doc.querySelector('.header-area');
                    const insertPoint = header ? header.nextSibling : doc.body.firstChild;

                    const spacingClasses = {
                        small: 'py-4',
                        normal: 'py-8',
                        large: 'py-16',
                        xlarge: 'py-24'
                    };

                    themeConfig.homeSections.forEach(section => {
                        if (!section.visible) {
                            if (section.type === 'banners' && heroBanner) {
                                heroBanner.style.display = 'none';
                                heroBanner.style.setProperty('display', 'none', 'important');
                            }
                            return;
                        }

                        if (section.type === 'banners') {
                            if (heroBanner) {
                                heroBanner.style.display = '';
                                heroBanner.classList.add('mlpa-injected-section');
                                if (insertPoint && insertPoint.parentNode) {
                                    insertPoint.parentNode.insertBefore(heroBanner, insertPoint);
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

                                if (window.$) {
                                    setTimeout(() => {
                                        try {
                                            const sliders = window.$(heroBanner).find('.owl-carousel, .hero-slides, .slider');
                                            if (sliders.length > 0 && sliders.owlCarousel) {
                                                if (bConfig.autoplay === false) {
                                                    sliders.trigger('stop.owl.autoplay');
                                                } else {
                                                    sliders.trigger('play.owl.autoplay', [bConfig.interval ? bConfig.interval * 1000 : 5000]);
                                                }
                                            }
                                        } catch (e) { }
                                    }, 1000); // Give time for scripts to init
                                }
                            }
                        }

                        if (section.type === 'purchase_info') {
                            const piConfig = themeConfig.purchaseInfoConfig || {};
                            const padding = spacingClasses[piConfig.spacing] || 'py-8';
                            const isDefaultColor = piConfig.colorMode === 'default';

                            const wrapper = doc.createElement('section');
                            wrapper.className = `mlpa-injected-section mlpa-purchase-info ${padding}`;
                            wrapper.style.backgroundColor = isDefaultColor ? 'var(--background-color)' : 'var(--primary-color)';
                            wrapper.style.color = isDefaultColor ? 'var(--primary-text-color)' : '#ffffff';

                            const container = doc.createElement('div');
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
                                cash: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
                            };

                            ['element1', 'element2', 'element3'].forEach(elKey => {
                                const el = piConfig[elKey];
                                if (el && el.title) {
                                    const block = doc.createElement('div');
                                    block.style.display = 'flex';
                                    block.style.flexDirection = 'column';
                                    block.style.alignItems = 'center';
                                    block.style.gap = '1rem';

                                    const iconWrapper = doc.createElement('div');
                                    iconWrapper.style.color = isDefaultColor ? 'var(--primary-color)' : '#ffffff';
                                    iconWrapper.innerHTML = icons[el.icon] || icons['shipping'];

                                    const title = doc.createElement('h3');
                                    title.innerText = el.title;
                                    title.style.margin = '0';
                                    title.style.fontSize = '1.25rem';
                                    title.style.fontWeight = 'bold';
                                    title.style.color = 'inherit';

                                    const text = doc.createElement('p');
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
                                if (insertPoint && insertPoint.parentNode) {
                                    insertPoint.parentNode.insertBefore(wrapper, insertPoint);
                                }
                            }
                        }
                    });
                }


                // 5. Extract body content
                const bodyHtml = doc.body.innerHTML;
                setHtmlContent(bodyHtml);

                // 6. We also need to inject the CSS links into the ACTUAL document head
                // so the styles apply to the React rendered content.
                doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
                    if (!document.querySelector(`link[href="${el.href}"]`)) {
                        const newLink = document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = el.href;
                        document.head.appendChild(newLink);
                    }
                });

                // 7. Gestionar scripts (los scripts en innerHTML no se ejecutan automáticamente)
                // Los ejecutamos secuencialmente para asegurar que las dependencias (como jQuery) se carguen primero
                setTimeout(() => {
                    const scripts = Array.from(doc.querySelectorAll('script'));

                    const loadScriptSequential = (index) => {
                        if (index >= scripts.length) {
                            // Disparar evento load para inicializar sliders y scripts que esperan $(document).ready()
                            setTimeout(() => {
                                document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
                                window.dispatchEvent(new Event('load'));
                            }, 500);
                            return;
                        }

                        const el = scripts[index];
                        const newScript = document.createElement('script');

                        if (el.src) {
                            newScript.src = rewriteUrl(el.getAttribute('src'));
                            newScript.onload = () => loadScriptSequential(index + 1);
                            newScript.onerror = () => loadScriptSequential(index + 1);
                            document.body.appendChild(newScript);
                        } else {
                            newScript.innerHTML = el.innerHTML;
                            document.body.appendChild(newScript);
                            loadScriptSequential(index + 1);
                        }
                    };

                    loadScriptSequential(0);
                }, 100);

            } catch (error) {
                console.error("Error loading template:", error);
                setHtmlContent(`<div class="p-8 text-center text-red-500">Error loading template: ${themeId}</div>`);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTemplate();
    }, [themeId]);

    // Actualizar las variables CSS si cambia themeConfig (soporte para el personalizador en tiempo real)
    useEffect(() => {
        if (!themeConfig) return;
        const root = document.documentElement;
        if (themeConfig.primaryColor) root.style.setProperty('--primary-color', themeConfig.primaryColor);
        if (themeConfig.headerColor) root.style.setProperty('--header-color', themeConfig.headerColor);
        if (themeConfig.buttonColor) root.style.setProperty('--button-color', themeConfig.buttonColor);
        if (themeConfig.footerColor) root.style.setProperty('--footer-color', themeConfig.footerColor);
        if (themeConfig.backgroundColor) root.style.setProperty('--background-color', themeConfig.backgroundColor);
        if (themeConfig.primaryTextColor) root.style.setProperty('--primary-text-color', themeConfig.primaryTextColor);
        if (themeConfig.secondaryTextColor) root.style.setProperty('--secondary-text-color', themeConfig.secondaryTextColor);

        let customStyle = document.getElementById('mlpa-custom-css');
        let fullCustomCss = themeConfig.customCss || '';

        // Inject Footer CSS
        if (themeConfig.footer) {
            if (themeConfig.footer.showStoreLogo === false) fullCustomCss += '\nfooter img, footer .logo { display: none !important; }';
            if (themeConfig.footer.showMainMenu === false) fullCustomCss += '\nfooter nav, footer .useful-links, footer .footer-menu { display: none !important; }';
            if (themeConfig.footer.showSocialMedia === false) fullCustomCss += '\nfooter .footer-social-info, footer .social-links, footer .social-info { display: none !important; }';
            if (themeConfig.footer.showContactInfo === false) fullCustomCss += '\nfooter .single-contact, footer address, footer .contact-info, footer .contact-us { display: none !important; }';
            if (themeConfig.footer.showNewsletter === false) fullCustomCss += '\nfooter .newsletter-form, footer .newsletter-area, footer form { display: none !important; }';
            if (themeConfig.footer.showPaymentMethods === false) fullCustomCss += '\nfooter .payment-methods, footer .payment-icons { display: none !important; }';
            if (themeConfig.footer.showShippingMethods === false) fullCustomCss += '\nfooter .shipping-methods, footer .shipping-icons { display: none !important; }';
        }

        if (fullCustomCss) {
            if (!customStyle) {
                customStyle = document.createElement('style');
                customStyle.id = 'mlpa-custom-css';
                document.head.appendChild(customStyle);
            }
            customStyle.innerHTML = fullCustomCss;
        } else if (customStyle) {
            customStyle.remove();
        }
    }, [themeConfig]);

    // Localiza el destino del portal dinámico después de inyectar el HTML.
    useEffect(() => {
        if (!isLoading && containerRef.current) {
            const target = containerRef.current.querySelector('#mlpa-dynamic-products');
            if (target) {
                setDynamicTarget(target);
            }
        }
    }, [isLoading, htmlContent]);

    // Gestionar la inyección de estilos, scripts, y elementos dinámicos mediante themeInjector
    useEffect(() => {
        if (!isLoading && containerRef.current) {
            // Apply all theme configurations globally using the central injector
            applyThemeConfigToDocument(document, themeConfig);
            
            // Manage Dynamic elements for footer (Native specific features like social links)
            manageDynamicFooterElements(containerRef.current, themeConfig);

        // Intercept internal links for SPA navigation
        const links = containerRef.current.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            // If it's a relative HTML file link (e.g. shop.html, contact.html)
            if (href && !href.startsWith('http') && href.endsWith('.html') && !href.startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Dispatch custom event to let DynamicStore know about navigation
                    const navEvent = new CustomEvent('mlpa-navigate', { detail: { page: href } });
                    window.dispatchEvent(navEvent);
                });
            }
        });

        // Fallback robusto para menús móviles de distintas plantillas
        const menus = [
            { btn: '.toggleMenu', menu: '.nav', activeClass: 'active', toggleStyle: true }, // snowboarding
            { btn: '.classy-navbar-toggler', menu: '.classy-menu', btnToggleClass: 'active', menuToggleClass: 'menu-on' }, // academy
            { btn: '.navbar-toggler', menu: '.navbar-collapse', menuToggleClass: 'show' } // generic bootstrap
        ];

        menus.forEach(({ btn, menu, activeClass, btnToggleClass, menuToggleClass, toggleStyle }) => {
            const toggleMenuBtn = containerRef.current.querySelector(btn);
            const navMenu = containerRef.current.querySelector(menu);
            if (toggleMenuBtn && navMenu) {
                // Reemplazamos el nodo para limpiar cualquier listener conflictivo de jQuery u otros scripts
                const newToggleBtn = toggleMenuBtn.cloneNode(true);
                toggleMenuBtn.parentNode.replaceChild(newToggleBtn, toggleMenuBtn);
                
                newToggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (activeClass) newToggleBtn.classList.toggle(activeClass);
                    if (btnToggleClass) {
                        // En academy la clase se agrega a un span interno .navbarToggler
                        const icon = newToggleBtn.querySelector('.navbarToggler') || newToggleBtn;
                        icon.classList.toggle(btnToggleClass);
                    }
                    if (menuToggleClass) navMenu.classList.toggle(menuToggleClass);
                    
                    if (toggleStyle) {
                        const currentDisplay = window.getComputedStyle(navMenu).display;
                        if (currentDisplay === 'none') {
                            navMenu.style.setProperty('display', 'block', 'important');
                            navMenu.style.setProperty('opacity', '1', 'important');
                            navMenu.style.setProperty('visibility', 'visible', 'important');
                            navMenu.style.setProperty('height', 'auto', 'important');
                        } else {
                            navMenu.style.setProperty('display', 'none', 'important');
                        }
                    }
                });
            }
        });

            manageDynamicHomeElements(containerRef.current, themeConfig, templatePage);
        }
    }, [isLoading, htmlContent, themeConfig]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando diseño...</div>;
    }

    return (
        <div ref={containerRef} className="external-template-wrapper">
            {/* 1. Inyectar el HTML de la plantilla */}
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

            {/* 2. React Portal: Mover 'children' (Productos React) adentro del <div id="mlpa-dynamic-products"> */}
            {dynamicTarget && children && createPortal(
                children,
                dynamicTarget
            )}
        </div>
    );
};

export default ExternalTemplateRenderer;
