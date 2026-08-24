const fs = require('fs');
const content = fs.readFileSync('src/pages/builder/ThemeEditor.jsx', 'utf8');
const match = content.match(/applyStylesToIframe = \(\) => \{([\s\S]*?)useEffect/);
if (match) console.log(match[1].substring(0, 500));
