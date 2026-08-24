import fs from 'fs';
const html = fs.readFileSync('public/templates/snowboarding/index.html', 'utf8');
const navMatch = html.match(/class="nav"[\s\S]*?<\/ul>/g);
console.log(navMatch[0].substring(0, 200));
