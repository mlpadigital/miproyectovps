const fs = require('fs');
let content = fs.readFileSync('src/utils/homeInjector.js', 'utf8');

// Change signature
content = content.replace(
  "export const manageDynamicHomeElements = (doc, themeConfig) => {",
  "export const manageDynamicHomeElements = (doc, themeConfig, activePage = 'index.html') => {"
);

// We need to find `themeConfig.homeSections` and replace it with `(themeConfig.pageSections?.[activePage] || themeConfig.homeSections || [])`
// Let's create a variable at the top of the function
const sectionsVar = `\n    const currentSections = themeConfig.pageSections?.[activePage] || themeConfig.homeSections || [];\n`;

content = content.replace(
  "export const manageDynamicHomeElements = (doc, themeConfig, activePage = 'index.html') => {",
  "export const manageDynamicHomeElements = (doc, themeConfig, activePage = 'index.html') => {" + sectionsVar
);

// Replace usages
content = content.replace(/themeConfig\.homeSections/g, 'currentSections');

fs.writeFileSync('src/utils/homeInjector.js', content, 'utf8');
console.log("Patched homeInjector.js");
