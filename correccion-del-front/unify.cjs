const fs = require('fs');

const editorPath = 'src/pages/builder/ThemeEditor.jsx';
const injectorPath = 'src/utils/homeInjector.js';

let editorContent = fs.readFileSync(editorPath, 'utf8');
let injectorContent = fs.readFileSync(injectorPath, 'utf8');

// 1. In ThemeEditor, add import for manageDynamicHomeElements
if (!editorContent.includes('manageDynamicHomeElements')) {
    editorContent = editorContent.replace(
        "import { manageDynamicFooterElements } from '../../utils/footerInjector';",
        "import { manageDynamicFooterElements } from '../../utils/footerInjector';\nimport { manageDynamicHomeElements } from '../../utils/homeInjector';"
    );
}

// 2. In ThemeEditor, replace the block 423-566 with manageDynamicHomeElements call
const startStr = "// --- Home Page Sections Ordering & Injection ---";
const endStr = "}\n  };"; // End of applyStylesToIframe

const startIndex = editorContent.indexOf(startStr);
const endIndex = editorContent.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `// --- Home Page Sections Ordering & Injection ---
      manageDynamicHomeElements(doc, themeConfig, activePage);
    `;
    editorContent = editorContent.substring(0, startIndex) + replacement + editorContent.substring(endIndex);
}

fs.writeFileSync(editorPath, editorContent, 'utf8');
console.log("Patched ThemeEditor.jsx");

const bannersLogic = `
const renderBanners = (doc, section, themeConfig) => {
    const heroBanner = doc.querySelector('.slider-area') || doc.querySelector('.hero-area') || doc.querySelector('.hero') || doc.querySelector('#hero');
    if (!heroBanner) return;
    
    heroBanner.style.display = '';
    heroBanner.classList.add('mlpa-injected-section');
    
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
`;

const purchaseInfoLogic = `
const renderPurchaseInfo = (doc, section, themeConfig) => {
    const piConfig = themeConfig.purchaseInfoConfig || {};
    const spacingClasses = { small: 'py-4', normal: 'py-8', large: 'py-16', xlarge: 'py-24' };
    const padding = spacingClasses[piConfig.spacing] || 'py-8';
    const isDefaultColor = piConfig.colorMode === 'default';

    const wrapper = doc.createElement('section');
    wrapper.className = \`mlpa-injected-section mlpa-purchase-info \${padding}\`;
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
        cash: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>'
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
        return wrapper;
    }
    return null;
};
`;

const injectorSwitchOld = `
            case 'banners':
            case 'purchase_info':
            default:
                // Estas ya se renderizan de otra forma o todavía no están implementadas
                break;
`;

const injectorSwitchNew = `
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
`;

injectorContent = injectorContent.replace(injectorSwitchOld, injectorSwitchNew);
injectorContent = injectorContent + "\\n" + bannersLogic + "\\n" + purchaseInfoLogic;

fs.writeFileSync(injectorPath, injectorContent, 'utf8');
console.log("Patched homeInjector.js");

