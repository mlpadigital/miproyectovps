const fs = require('fs');
let content = fs.readFileSync('src/pages/builder/ThemeEditor.jsx', 'utf8');

// 1. Add activePage state
content = content.replace(
  "const [device, setDevice] = useState('desktop'); // 'desktop' or 'mobile'",
  "const [device, setDevice] = useState('desktop'); // 'desktop' or 'mobile'\n  const [activePage, setActivePage] = useState('index.html');"
);

// 2. Add pageSections to default config
content = content.replace(
  "homeSections: [],",
  "pageSections: { 'index.html': [] },\n    homeSections: []," // Keep homeSections for safety
);

// 3. Update loading logic
content = content.replace(
  "if (storeData.theme_config) {\n                setThemeConfig(prev => ({\n                  ...prev,\n                  ...storeData.theme_config,",
  "if (storeData.theme_config) {\n                const loadedConfig = storeData.theme_config;\n                if (!loadedConfig.pageSections) {\n                  loadedConfig.pageSections = { 'index.html': loadedConfig.homeSections || [] };\n                }\n                setThemeConfig(prev => ({\n                  ...prev,\n                  ...loadedConfig,"
);

// 4. Update previewUrl
content = content.replace(
  "const previewUrl = store ? `/templates/${themeId}/index.html` : '';",
  "const previewUrl = store ? `/templates/${themeId}/${activePage}` : '';"
);

// 5. Update section manipulation logic (addSection, updateSectionSettings, etc.)
// We need to replace references to themeConfig.homeSections with themeConfig.pageSections[activePage]
// And updateConfig('homeSections', ...) with updateConfig('pageSections', { ...themeConfig.pageSections, [activePage]: ... })

content = content.replace(
  /const newSections = \(\(prev\.homeSections \|\| \[\]\)\.map/g,
  "const newSections = ((prev.pageSections && prev.pageSections[activePage]) || []).map"
);
content = content.replace(
  /return \{ \.\.\.prev, homeSections: newSections \};/g,
  "return { ...prev, pageSections: { ...(prev.pageSections || {}), [activePage]: newSections } };"
);

content = content.replace(
  /const newSections = \[\.\.\.\(themeConfig\.homeSections \|\| \[\]\)\];/g,
  "const newSections = [...((themeConfig.pageSections && themeConfig.pageSections[activePage]) || [])];"
);
content = content.replace(
  /updateConfig\('homeSections', newSections\);/g,
  "updateConfig('pageSections', { ...(themeConfig.pageSections || {}), [activePage]: newSections });"
);

// 6. Update rendering logic
content = content.replace(
  /themeConfig\.homeSections\?/g,
  "(themeConfig.pageSections?.[activePage] || [])?"
);
content = content.replace(
  /themeConfig\.homeSections\./g,
  "(themeConfig.pageSections?.[activePage] || [])."
);
content = content.replace(
  /themeConfig\.homeSections /g,
  "(themeConfig.pageSections?.[activePage] || []) "
);
content = content.replace(
  /themeConfig\.homeSections \|\|/g,
  "(themeConfig.pageSections?.[activePage] || []) ||"
);

// 7. Insert the page selector UI in the top bar
// Find where device selector is and insert it before it
content = content.replace(
  /(\<div className="flex items-center bg-slate-100 rounded-md p-1 border border-slate-200 mr-4"\>)/,
  `<select 
              value={activePage} 
              onChange={(e) => { setActivePage(e.target.value); setEditingSectionId(null); }}
              className="mr-4 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="index.html">Página de Inicio</option>
              <option value="shop.html">Tienda / Catálogo</option>
              <option value="single.html">Detalle de Producto</option>
              <option value="contact.html">Contacto</option>
            </select>\n            $1`
);

fs.writeFileSync('src/pages/builder/ThemeEditor.jsx', content, 'utf8');
console.log("Patched ThemeEditor.jsx");
