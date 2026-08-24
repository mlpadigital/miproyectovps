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

// 3. In homeInjector.js, add the logic for banners and purchase_info
// We'll replace the switch cases
const switchReplacement = `
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
                renderBanners(doc, section, themeConfig, homeContainer);
                return; // Ya se renderizó, no agregar a sectionEl
            case 'purchase_info':
                renderPurchaseInfo(doc, section, themeConfig, homeContainer);
                return; // Ya se renderizó, no agregar a sectionEl
            default:
                break;
`;

injectorContent = injectorContent.replace(
    /case 'announcement_bar':[\s\S]*?break;/g, 
    "// TO BE REPLACED"
);

// We need a safer way to replace the switch body. Let's just do it with replace_file_content!
