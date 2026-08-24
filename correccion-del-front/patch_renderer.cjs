const fs = require('fs');
let content = fs.readFileSync('src/components/ExternalTemplateRenderer.jsx', 'utf8');

content = content.replace(
  "const ExternalTemplateRenderer = ({ themeId, themeConfig, children }) => {",
  "const ExternalTemplateRenderer = ({ themeId, themeConfig, children, templatePage = 'index.html' }) => {"
);

content = content.replace(
  "const response = await fetch(`/templates/${themeId}/index.html`);",
  "const response = await fetch(`/templates/${themeId}/${templatePage}`);"
);

content = content.replace(
  "manageDynamicHomeElements(containerRef.current, themeConfig);",
  "manageDynamicHomeElements(containerRef.current, themeConfig, templatePage);"
);

// Intercept clicks on internal links to route via React instead of reloading the page
const navigationIntercept = `
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
`;

content = content.replace(
  "manageDynamicFooterElements(containerRef.current, themeConfig);",
  "manageDynamicFooterElements(containerRef.current, themeConfig);\n" + navigationIntercept
);

fs.writeFileSync('src/components/ExternalTemplateRenderer.jsx', content, 'utf8');
console.log("Patched ExternalTemplateRenderer.jsx");
