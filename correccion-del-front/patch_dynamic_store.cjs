const fs = require('fs');
let content = fs.readFileSync('src/components/DynamicStore.jsx', 'utf8');

// 1. Add event listener for mlpa-navigate
// Find where useEffect for window resize or auth is and append our event listener
const navigateEffect = `
    useEffect(() => {
        const handleNavigation = (e) => {
            if (e.detail && e.detail.page) {
                let page = e.detail.page;
                // remove leading slash if any
                if (page.startsWith('/')) page = page.substring(1);
                setCurrentView(page);
                window.scrollTo(0, 0);
            }
        };
        window.addEventListener('mlpa-navigate', handleNavigation);
        return () => window.removeEventListener('mlpa-navigate', handleNavigation);
    }, []);
`;

content = content.replace(
    "useEffect(() => {",
    navigateEffect + "\n    useEffect(() => {"
);

// 2. Update ExternalTemplateRenderer call
// From: <ExternalTemplateRenderer themeId={storeData.theme_id} themeConfig={storeData.theme_config}>
// To: <ExternalTemplateRenderer themeId={storeData.theme_id} themeConfig={storeData.theme_config} templatePage={currentView.endsWith('.html') ? currentView : 'index.html'}>
content = content.replace(
    "<ExternalTemplateRenderer themeId={storeData.theme_id} themeConfig={storeData.theme_config}>",
    "<ExternalTemplateRenderer themeId={storeData.theme_id} themeConfig={storeData.theme_config} templatePage={currentView.endsWith('.html') ? currentView : 'index.html'}>"
);

fs.writeFileSync('src/components/DynamicStore.jsx', content, 'utf8');
console.log("Patched DynamicStore.jsx");
